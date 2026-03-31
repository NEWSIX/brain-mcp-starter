#!/usr/bin/env node
/**
 * brain-mcp-starter — Entry Point
 *
 * Transport selection:
 *   MCP_TRANSPORT=stdio  (default)  → reads from stdin, writes to stdout
 *   MCP_TRANSPORT=http              → starts Streamable HTTP server on MCP_PORT (default 3000)
 *
 * Environment variables:
 *   BRAIN_API_KEY       (required)  — WeenHive Brain API key
 *   BRAIN_API_URL       (optional)  — override Brain endpoint (default: https://weenhive.thisaan.cloud/mcp)
 *   MCP_TRANSPORT       (optional)  — "stdio" | "http" (default: "stdio")
 *   MCP_PORT            (optional)  — HTTP port when transport=http (default: 3000)
 *   MCP_HOST            (optional)  — HTTP bind host (default: 127.0.0.1)
 *   MCP_SERVER_API_KEY  (optional)  — API key clients must send in x-api-key header (http mode only)
 *
 * DNS Rebinding Protection:
 *   createMcpExpressApp({ host }) validates the Host header on all requests,
 *   rejecting requests whose Host does not match the bound address. This is
 *   automatically active when MCP_HOST is 127.0.0.1 (the default).
 *   Do NOT set MCP_HOST=0.0.0.0 in production without a reverse proxy.
 */

import { Request, Response, NextFunction } from "express";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { randomUUID } from "node:crypto";
import { createBrainServer } from "./server.js";

// ── Startup assertions ──────────────────────────────────────────────────────
if (!process.env.BRAIN_API_KEY) {
  process.stderr.write(
    "[brain-mcp-starter] FATAL: BRAIN_API_KEY is not set.\n" +
    "  Get your key from https://weenhive.thisaan.cloud/settings/api-keys\n" +
    "  Then run: BRAIN_API_KEY=your_key node dist/index.js\n"
  );
  process.exit(1);
}

const transport = (process.env.MCP_TRANSPORT ?? "stdio").toLowerCase();

// ── MCP Supported Protocol Versions ────────────────────────────────────────
const MCP_SUPPORTED_VERSIONS = new Set(["2025-03-26", "2024-11-05"]);

async function startStdio(): Promise<void> {
  const server = createBrainServer();
  const stdioTransport = new StdioServerTransport();

  process.stderr.write("[brain-mcp-starter] Starting in stdio mode...\n");
  await server.connect(stdioTransport);
  process.stderr.write("[brain-mcp-starter] Ready. Listening on stdin.\n");
}

async function startHttp(): Promise<void> {
  const port = parseInt(process.env.MCP_PORT ?? "3000", 10);
  const host = process.env.MCP_HOST ?? "127.0.0.1";
  const serverApiKey = process.env.MCP_SERVER_API_KEY;

  // createMcpExpressApp validates the Host header to prevent DNS rebinding attacks.
  // Passing { host } ensures the SDK knows the expected bind address.
  const app = createMcpExpressApp({ host });

  // ── CORS ─────────────────────────────────────────────────────────────────
  // Allow MCP clients running in browsers or remote environments to access
  // the Mcp-Session-Id header in CORS responses.
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, x-api-key, Mcp-Session-Id, MCP-Protocol-Version"
    );
    res.setHeader(
      "Access-Control-Expose-Headers",
      "Mcp-Session-Id, MCP-Protocol-Version"
    );
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    if (_req.method === "OPTIONS") {
      res.status(204).end();
      return;
    }
    next();
  });

  // ── x-api-key auth middleware ─────────────────────────────────────────────
  // If MCP_SERVER_API_KEY is set, all /mcp requests must include a matching
  // x-api-key header. This prevents unauthenticated access to the MCP endpoint.
  if (serverApiKey) {
    app.use("/mcp", (req: Request, res: Response, next: NextFunction) => {
      const provided = req.headers["x-api-key"];
      if (!provided || provided !== serverApiKey) {
        res.status(401).json({ error: "Unauthorized — invalid or missing x-api-key" });
        return;
      }
      next();
    });
    process.stderr.write("[brain-mcp-starter] x-api-key auth enabled for /mcp\n");
  }

  // ── MCP-Protocol-Version validation ──────────────────────────────────────
  // Non-initialization POST requests (those with an existing session ID) must
  // include a valid MCP-Protocol-Version header per the MCP spec.
  app.use("/mcp", (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== "POST") {
      next();
      return;
    }
    const existingSessionId = req.headers["mcp-session-id"];
    if (!existingSessionId) {
      // Initialization request — version check not required yet
      next();
      return;
    }
    const protocolVersion = req.headers["mcp-protocol-version"] as string | undefined;
    if (!protocolVersion) {
      res.status(400).json({
        error: "MCP-Protocol-Version header required for non-initialization requests",
      });
      return;
    }
    if (!MCP_SUPPORTED_VERSIONS.has(protocolVersion)) {
      res.status(400).json({
        error: `Unsupported MCP protocol version: ${protocolVersion}. Supported: ${[...MCP_SUPPORTED_VERSIONS].join(", ")}`,
      });
      return;
    }
    next();
  });

  // ── OAuth 2.1 Discovery Stub ──────────────────────────────────────────────
  // RFC 9728 well-known endpoint for future OAuth 2.1 upgrade.
  // Returns metadata indicating this resource requires Bearer token auth.
  // Replace the stub values with real auth server URLs when implementing OAuth.
  app.get("/.well-known/oauth-protected-resource", (_req: Request, res: Response) => {
    res.json({
      resource: `http://${host}:${port}`,
      authorization_servers: [],
      bearer_methods_supported: ["header"],
      // Stub: set to real auth server URL when OAuth 2.1 is implemented
      // e.g. "authorization_servers": ["https://auth.weenhive.thisaan.cloud"]
    });
  });

  // ── Session map: sessionId → transport instance ───────────────────────────
  const sessions = new Map<string, StreamableHTTPServerTransport>();

  app.post("/mcp", async (req, res) => {
    // Reuse session if session-id header is present
    const existingSessionId = req.headers["mcp-session-id"] as string | undefined;

    if (existingSessionId && sessions.has(existingSessionId)) {
      const existingTransport = sessions.get(existingSessionId)!;
      await existingTransport.handleRequest(req, res, req.body);
      return;
    }

    // New session
    const httpTransport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (sessionId) => {
        sessions.set(sessionId, httpTransport);
        process.stderr.write(`[brain-mcp-starter] Session initialized: ${sessionId}\n`);
      },
    });

    // Clean up on close
    httpTransport.onclose = () => {
      const sessionId = httpTransport.sessionId;
      if (sessionId) {
        sessions.delete(sessionId);
        process.stderr.write(`[brain-mcp-starter] Session closed: ${sessionId}\n`);
      }
    };

    const server = createBrainServer();
    await server.connect(httpTransport);
    await httpTransport.handleRequest(req, res, req.body);
  });

  // SSE stream endpoint (GET /mcp)
  app.get("/mcp", async (req, res) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    if (!sessionId || !sessions.has(sessionId)) {
      res.status(400).json({ error: "Invalid or missing session ID" });
      return;
    }
    const existingTransport = sessions.get(sessionId)!;
    await existingTransport.handleRequest(req, res);
  });

  // DELETE /mcp — client-initiated session termination
  app.delete("/mcp", async (req, res) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    if (!sessionId || !sessions.has(sessionId)) {
      res.status(404).json({ error: "Session not found" });
      return;
    }
    const existingTransport = sessions.get(sessionId)!;
    await existingTransport.handleRequest(req, res);
    sessions.delete(sessionId);
  });

  app.listen(port, host, () => {
    process.stderr.write(
      `[brain-mcp-starter] HTTP transport listening on http://${host}:${port}/mcp\n`
    );
    if (serverApiKey) {
      process.stderr.write(
        `[brain-mcp-starter] Auth: x-api-key required (MCP_SERVER_API_KEY is set)\n`
      );
    }
    process.stderr.write(
      `[brain-mcp-starter] OAuth discovery: http://${host}:${port}/.well-known/oauth-protected-resource\n`
    );
  });
}

// ── Main ────────────────────────────────────────────────────────────────────
if (transport === "stdio") {
  startStdio().catch((err: unknown) => {
    process.stderr.write(`[brain-mcp-starter] Fatal error: ${String(err)}\n`);
    process.exit(1);
  });
} else if (transport === "http") {
  startHttp().catch((err: unknown) => {
    process.stderr.write(`[brain-mcp-starter] Fatal error: ${String(err)}\n`);
    process.exit(1);
  });
} else {
  process.stderr.write(
    `[brain-mcp-starter] Unknown MCP_TRANSPORT "${transport}". Use "stdio" or "http".\n`
  );
  process.exit(1);
}
