# Example: Full Session Workflow

A complete example of how to use all Brain tools together in a productive Claude Code session.

This pattern is used by the Pulse CEO Assistant system every ~30 minutes.

---

## Session Start (30 seconds)

Run these three calls in parallel at the start of every session:

```
recall("relevant context for today's work")
recall("last session summary")
list_tasks()
```

This gives you:
1. Background knowledge relevant to what you're doing
2. What happened last time (continuity)
3. Any open tasks that need attention (these override self-directed work)

---

## During Work: The Core Loop

For any significant finding or decision:

```
1. recall("similar topic") — check if you already know this
2. [if not duplicate] remember(finding, type, tags) — save it
3. [if action needed] create_task(title, description, priority) — put it on the board
```

For any task you pick up:

```
1. update_task(id, "doing") — claim it so others know it's being worked on
2. [do the work]
3. complete_task(id, "result summary here")
```

---

## Session End (2 minutes)

```
Step 1: list_notes() — check for duplicate session report
Step 2: post_note("pulse", "Session N — YYYY-MM-DD HH:MM", full_report_markdown)
Step 3: remember(session_metadata, "working", ["session-log", "session-N", date])
```

---

## Full Example Session

**Scenario:** Researching MCP transport options for a new project.

### Start

```
recall("MCP transport options")
→ Returns: memory about Streamable HTTP vs SSE (saved last session)

recall("last session summary")  
→ Returns: session 10 log with key findings

list_tasks()
→ Returns: 1 open task: "Write MCP transport comparison doc" (high priority)
```

**Decision:** P1 task exists → work on it first.

### Claim the task

```
update_task("task-uuid-here", "doing")
```

### Do the work

Research, write the doc, build the comparison...

### Save findings

```
recall("MCP transport comparison") — check for duplicates
→ Returns: nothing specific enough

remember(
  "Streamable HTTP (MCP spec 2025-03-26): Single endpoint, POST for requests, GET for server-push SSE stream. Replaces legacy HTTP+SSE. Claude Code uses type=http in config. Auth via headers. Session IDs via Mcp-Session-Id header.",
  type: "skill",
  tags: ["mcp", "transport", "streamable-http", "reference", "2026-03-24"]
)
```

### Complete the task

```
complete_task(
  "task-uuid-here",
  "Wrote MCP transport comparison. Streamable HTTP is correct choice. Saved findings to Brain with tags [mcp, transport]."
)
```

### Post session note

```
list_notes() — confirm no duplicate

post_note(
  "general",
  "MCP Transport Research — 2026-03-24",
  "## Summary\nResearched Streamable HTTP vs SSE. Streamable HTTP is current spec (2025-03-26). SSE is deprecated. Claude Code native support via type=http config.\n\n## Key Finding\nUse POST /mcp endpoint. Server responds with JSON or SSE stream based on Accept header.\n\n## Action Taken\nUpdated brain-mcp-starter README with correct transport docs."
)
```

### Save session log

```
remember(
  "Session 2026-03-24: Researched MCP transport. Confirmed Streamable HTTP is current standard. Wrote comparison doc. Updated brain-mcp-starter README. Task completed.",
  type: "working",
  tags: ["session-log", "2026-03-24", "mcp"]
)
```

---

## Pattern Summary

```
START:  recall x2 + list_tasks()
WORK:   recall → remember → create_task (as needed)
TASKS:  update_task → [work] → complete_task
END:    list_notes → post_note → remember(session log)
```

This pattern ensures:
- No duplicate memories
- Continuous knowledge accumulation across sessions
- Task board stays accurate
- Next session has full context
