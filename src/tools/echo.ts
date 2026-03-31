/**
 * echo tool — used for testing MCP connectivity without requiring BRAIN_API_KEY.
 * Run `BRAIN_API_KEY=test node dist/index.js` then call echo from any MCP client.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerEchoTool(server: McpServer): void {
  server.registerTool(
    "echo",
    {
      description:
        "Echo back the input message. Use this tool to verify MCP connectivity is working before calling Brain tools.",
      inputSchema: {
        message: z.string().describe("Message to echo back"),
        repeat: z
          .number()
          .int()
          .min(1)
          .max(10)
          .optional()
          .default(1)
          .describe("Number of times to repeat (1–10, default: 1)"),
        uppercase: z
          .boolean()
          .optional()
          .default(false)
          .describe("Convert message to uppercase before echoing"),
      },
    },
    async ({ message, repeat, uppercase }) => {
      const processed = uppercase ? message.toUpperCase() : message;
      const lines = Array.from({ length: repeat }, (_, i) => `[${i + 1}/${repeat}] ${processed}`);
      const output = lines.join("\n");

      return {
        content: [
          {
            type: "text" as const,
            text: output,
          },
        ],
      };
    }
  );
}
