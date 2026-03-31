import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { callBrain, withBrainErrorHandling } from "../brain-client.js";

const TaskStatusSchema = z.enum(["todo", "doing", "review", "done", "blocked"]);
const TaskPrioritySchema = z.enum(["low", "medium", "high", "critical"]);

export function registerTaskTools(server: McpServer): void {
  // list_tasks
  server.registerTool(
    "list_tasks",
    {
      description:
        "List tasks from the WeenHive Board. Filter by status, project, or assignee.",
      inputSchema: {
        status: TaskStatusSchema.optional().describe("Filter by task status"),
        projectId: z
          .string()
          .uuid()
          .optional()
          .describe("Filter by project UUID (WeenHive: a2cd6370-537a-4179-9ccb-beba85a1d18b)"),
        assignee: z
          .string()
          .optional()
          .describe("Filter by assignee agent name"),
        limit: z
          .number()
          .int()
          .min(1)
          .max(200)
          .optional()
          .describe("Max tasks to return (default: 200)"),
      },
    },
    async ({ status, projectId, assignee, limit }) => {
      return withBrainErrorHandling(async () => {
        const args: Record<string, unknown> = {};
        if (status !== undefined) args.status = status;
        if (projectId !== undefined) args.projectId = projectId;
        if (assignee !== undefined) args.assignee = assignee;
        if (limit !== undefined) args.limit = limit;

        const result = await callBrain("list_tasks", args);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      });
    }
  );

  // create_task
  server.registerTool(
    "create_task",
    {
      description:
        "Create a new task on the WeenHive Board. Title/description should be in Thai for human-readable board.",
      inputSchema: {
        title: z.string().min(1).describe("Task title (Thai recommended)"),
        description: z.string().optional().describe("Detailed task description"),
        priority: TaskPrioritySchema.describe(
          "Priority: low=1, medium=2, high=3, critical=4"
        ),
        projectId: z
          .string()
          .uuid()
          .describe(
            "Project UUID (required). WeenHive: a2cd6370-537a-4179-9ccb-beba85a1d18b"
          ),
        tags: z
          .array(z.string().min(1))
          .optional()
          .describe("Task tags (e.g. ['pulse', 'brain-mcp-starter'])"),
      },
    },
    async ({ title, description, priority, projectId, tags }) => {
      return withBrainErrorHandling(async () => {
        const args: Record<string, unknown> = { title, priority, projectId };
        if (description !== undefined) args.description = description;
        if (tags !== undefined) args.tags = tags;

        const result = await callBrain("create_task", args);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      });
    }
  );

  // update_task — NOTE: complete_task() is broken, use update_task(id, status="done")
  server.registerTool(
    "update_task",
    {
      description:
        "Update a task on the WeenHive Board. Use status='done' to complete tasks — complete_task() is broken.",
      inputSchema: {
        id: z.string().uuid().describe("Task UUID"),
        status: TaskStatusSchema.optional().describe("New status"),
        result: z
          .string()
          .optional()
          .describe("Result description — required when status='done'"),
        reason: z
          .string()
          .optional()
          .describe("Blocker reason — required when status='blocked'"),
        description: z.string().optional().describe("Updated task description"),
        tags: z
          .array(z.string().min(1))
          .optional()
          .describe("Replace tag list"),
      },
    },
    async ({ id, status, result, reason, description, tags }) => {
      return withBrainErrorHandling(async () => {
        const args: Record<string, unknown> = { id };
        if (status !== undefined) args.status = status;
        if (result !== undefined) args.result = result;
        if (reason !== undefined) args.reason = reason;
        if (description !== undefined) args.description = description;
        if (tags !== undefined) args.tags = tags;

        const res = await callBrain("update_task", args);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(res, null, 2) }],
        };
      });
    }
  );
}
