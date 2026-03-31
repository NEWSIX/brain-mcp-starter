import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { callBrain, withBrainErrorHandling } from "../brain-client.js";

export function registerNoteTools(server: McpServer): void {
  // list_notes
  server.registerTool(
    "list_notes",
    {
      description: "List recent notes from WeenHive Brain.",
      inputSchema: {
        limit: z
          .number()
          .int()
          .min(1)
          .max(100)
          .optional()
          .describe("Max notes to return (default: 20)"),
      },
    },
    async ({ limit }) => {
      return withBrainErrorHandling(async () => {
        const args: Record<string, unknown> = {};
        if (limit !== undefined) args.limit = limit;

        const result = await callBrain("list_notes", args);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      });
    }
  );

  // alert — send urgent LINE notification
  server.registerTool(
    "alert",
    {
      description:
        "Send an urgent alert via WeenHive Brain (triggers LINE notification). Use sparingly — for critical blockers only.",
      inputSchema: {
        message: z.string().min(1).max(500).describe("Alert message (max 500 chars)"),
        severity: z
          .enum(["info", "warning", "critical"])
          .optional()
          .describe("Alert severity level (default: info)"),
      },
    },
    async ({ message, severity }) => {
      return withBrainErrorHandling(async () => {
        const args: Record<string, unknown> = { message };
        if (severity !== undefined) args.severity = severity;

        const result = await callBrain("alert", args);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      });
    }
  );
}
