# Example: Task Tools

Manage tasks on the WeenHive Brain task board.

## list_tasks()

View all open tasks.

```
"List all tasks on the board"
"What tasks are currently in progress?"
```

Returns tasks with: id, title, description, status, priority, assignee, created_at.

## create_task()

Create a new task for follow-up work.

```
create_task(title: string, description?: string, priority?: string)
```

Priority values: `low`, `medium`, `high`, `critical`

Example prompts:
```
"Create a task: Build MCP client example in Python. Priority: medium."

"Create a high-priority task: Fix auth bug in WeenHive Gateway — users getting 401 on valid keys"
```

## update_task()

Change a task's status when you start working on it.

```
update_task(id: string, status: string)
```

Status values: `todo`, `doing`, `blocked`, `review`

Workflow:
```
1. list_tasks() — find the task ID
2. update_task(id, "doing") — claim it
3. [do the work]
4. complete_task(id, result) — finish it
```

## complete_task()

Mark a task done with a result summary.

```
complete_task(id: string, result: string)
```

Example:
```
"Complete task [uuid] with result: Built Python MCP client example. Saved to examples/python-client.py. Tested against weenhive.thisaan.cloud/mcp — all tools working."
```

## Task Board Workflow Example

```
Step 1: Check for open tasks
  → list_tasks()

Step 2: Claim the top task  
  → update_task("abc-123", "doing")

Step 3: Execute the task
  [do the work]

Step 4: Complete it
  → complete_task("abc-123", "Done. Here's what I did: ...")

Step 5: Create follow-up if needed
  → create_task("Follow-up: ...")
```
