# brain-mcp-starter — Claude Code Project

## What This Is
A starter template for connecting to the WeenHive Brain MCP server.

## MCP Tools Available
When connected to WeenHive Brain, you have access to:

### Memory Tools
- `recall(query)` — Semantic search. Always recall() before remember() to avoid duplicates.
- `remember(content, type, tags, scope)` — Save memory. Use English. Types: factual, experiential, procedural, identity, working, reference, skill, lesson, decision.

### Task Tools
- `list_tasks()` — View all open tasks on the board
- `create_task(title, description, priority)` — Create a task (priority: low/medium/high/critical)
- `update_task(id, status)` — Update status (todo/doing/blocked/review)
- `complete_task(id, result)` — Mark task done with result summary

### Note Tools
- `post_note(board, title, content)` — Post a note (check list_notes() first for duplicates)
- `list_notes()` — List recent notes

### Utility Tools
- `alert(message)` — Send urgent alert (LINE notification)
- `report()` — Generate daily summary

## Rules for This Project
1. Always recall() before remember() — check for duplicates first
2. All Brain content in English
3. Do not commit `.claude/settings.local.json` — it contains your API key
4. See examples/ directory for usage patterns
