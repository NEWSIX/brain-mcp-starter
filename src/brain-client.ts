/**
 * Shared Brain API client for all tool modules.
 *
 * Centralises the fetch logic, error handling, and response parsing so each
 * tool file imports callBrain() instead of duplicating the fetch boilerplate.
 */
import { z } from "zod";

const BRAIN_API_URL =
  process.env.BRAIN_API_URL ?? "https://weenhive.thisaan.cloud/mcp";
const BRAIN_API_KEY = process.env.BRAIN_API_KEY ?? "";

// ── Response schemas ──────────────────────────────────────────────────────

const BrainRpcResponseSchema = z.object({
  jsonrpc: z.literal("2.0"),
  id: z.union([z.string(), z.number(), z.null()]),
  result: z.unknown().optional(),
  error: z
    .object({
      code: z.number(),
      message: z.string(),
      data: z.unknown().optional(),
    })
    .optional(),
});

export type BrainRpcResponse = z.infer<typeof BrainRpcResponseSchema>;

// ── Structured error class ────────────────────────────────────────────────

export class BrainApiError extends Error {
  constructor(
    message: string,
    public readonly code?: number,
    public readonly data?: unknown
  ) {
    super(message);
    this.name = "BrainApiError";
  }
}

// ── Core helper ───────────────────────────────────────────────────────────

/**
 * Call a tool on the WeenHive Brain MCP endpoint.
 *
 * @param toolName  - Brain tool name (e.g. "recall", "remember")
 * @param args      - Tool arguments object
 * @returns The `result` field from the JSON-RPC response
 * @throws BrainApiError on HTTP error or RPC error
 */
export async function callBrain(
  toolName: string,
  args: Record<string, unknown>
): Promise<unknown> {
  if (!BRAIN_API_KEY) {
    throw new BrainApiError(
      "BRAIN_API_KEY is not set. Get your key from https://weenhive.thisaan.cloud/settings/api-keys"
    );
  }

  let response: Response;
  try {
    response = await fetch(BRAIN_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": BRAIN_API_KEY,
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: Date.now(),
        method: "tools/call",
        params: { name: toolName, arguments: args },
      }),
    });
  } catch (fetchErr) {
    throw new BrainApiError(
      `Network error calling Brain: ${String(fetchErr)}`
    );
  }

  if (!response.ok) {
    throw new BrainApiError(
      `Brain HTTP error: ${response.status} ${response.statusText}`
    );
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    throw new BrainApiError("Brain returned non-JSON response");
  }

  const parsed = BrainRpcResponseSchema.safeParse(json);
  if (!parsed.success) {
    throw new BrainApiError(
      `Unexpected Brain response shape: ${parsed.error.message}`
    );
  }

  if (parsed.data.error) {
    throw new BrainApiError(
      `Brain RPC error: ${parsed.data.error.message}`,
      parsed.data.error.code,
      parsed.data.error.data
    );
  }

  return parsed.data.result;
}

/**
 * Wrap a tool handler to produce a standardised MCP error response on
 * BrainApiError, rather than letting the SDK produce a generic crash.
 */
export function withBrainErrorHandling(
  handler: () => Promise<{ content: Array<{ type: "text"; text: string }> }>
): Promise<{ content: Array<{ type: "text"; text: string }>; isError?: true }> {
  return handler().catch((err: unknown) => {
    const message =
      err instanceof BrainApiError
        ? `Brain error: ${err.message}`
        : `Unexpected error: ${String(err)}`;

    return {
      content: [{ type: "text" as const, text: message }],
      isError: true as const,
    };
  });
}
