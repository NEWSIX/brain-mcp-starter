import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerMemoryTools } from "./tools/memory.js";
import { registerTaskTools } from "./tools/tasks.js";
import { registerNoteTools } from "./tools/notes.js";
import { registerEchoTool } from "./tools/echo.js";

/**
 * Creates and configures the WeenHive Brain MCP server.
 *
 * The server is transport-agnostic — call server.connect(transport) from the
 * entry point (index.ts) to attach it to either stdio or Streamable HTTP.
 */
export function createBrainServer(): McpServer {
  const server = new McpServer(
    {
      name: "brain-mcp-starter",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Register all tool groups
  registerEchoTool(server);      // connectivity test — no BRAIN_API_KEY required
  registerMemoryTools(server);   // recall, remember
  registerTaskTools(server);     // list_tasks, create_task, update_task
  registerNoteTools(server);     // list_notes, alert

  return server;
}
