import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { callBrain, withBrainErrorHandling } from "../brain-client.js";

const MemoryTypeSchema = z.enum([
  "factual",
  "experiential",
  "procedural",
  "identity",
  "working",
  "reference",
  "note",
  "idea",
  "skill",
  "bug",
  "decision",
  "snippet",
  "lesson",
  "proposal",
]);

/** Register memory-related tools onto the McpServer instance */
export function registerMemoryTools(server: McpServer): void {
  // recall — semantic search
  server.registerTool(
    "recall",
    {
      description:
        "Semantic search across memories in WeenHive Brain. Always recall() before remember() to avoid duplicates. Query must be in English.",
      inputSchema: {
        query: z.string().min(1).describe("Search query in English"),
        limit: z
          .number()
          .int()
          .min(1)
          .max(50)
          .optional()
          .describe("Max results (default 5, max 50)"),
        type: MemoryTypeSchema.optional().describe("Filter by memory type"),
        scope: z
          .enum(["shared", "user", "agent"])
          .optional()
          .describe("Filter by scope"),
      },
    },
    async ({ query, limit, type, scope }) => {
      return withBrainErrorHandling(async () => {
        const args: Record<string, unknown> = { query };
        if (limit !== undefined) args.limit = limit;
        if (type !== undefined) args.type = type;
        if (scope !== undefined) args.scope = scope;

        const result = await callBrain("recall", args);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      });
    }
  );

  // remember — save a memory
  server.registerTool(
    "remember",
    {
      description:
        "Save a memory to WeenHive Brain. All content must be in English. Always recall() first to avoid duplicates.",
      inputSchema: {
        content: z.string().min(1).describe("Memory content to store"),
        title: z
          .string()
          .optional()
          .describe("Short searchable title (recommended)"),
        type: MemoryTypeSchema.optional().describe("Memory type (default: factual)"),
        tags: z
          .array(z.string().min(1))
          .optional()
          .describe("Tag list — use kebab-case, e.g. ['tech-scan', 'thai-market']"),
        scope: z
          .enum(["shared", "user", "agent"])
          .optional()
          .describe("Visibility scope (default: shared)"),
      },
    },
    async ({ content, title, type, tags, scope }) => {
      return withBrainErrorHandling(async () => {
        const args: Record<string, unknown> = { content };
        if (title !== undefined) args.title = title;
        if (type !== undefined) args.type = type;
        if (tags !== undefined) args.tags = tags;
        if (scope !== undefined) args.scope = scope;

        const result = await callBrain("remember", args);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      });
    }
  );
}
