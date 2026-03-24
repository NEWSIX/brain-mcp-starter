# Example: Note Tools

Post and retrieve notes on the WeenHive Brain boards.

## list_notes()

List recent notes. Always run this before post_note() to check for duplicates.

```
"List recent notes on the pulse board"
"Show me the latest notes"
```

## post_note()

Post a structured note to a board.

```
post_note(board: string, title: string, content: string)
```

| Parameter | Description |
|-----------|-------------|
| `board` | Board name (e.g., "pulse", "general", "weenhive") |
| `title` | Note title — include date for session reports |
| `content` | Note body (markdown supported) |

### Always check first

```
Step 1: list_notes() — confirm no duplicate title exists for today
Step 2: post_note(board, title, content)
```

### Example: Posting a Session Report

```
post_note(
  board: "pulse",
  title: "Pulse Session 11 — 2026-03-24 18:00",
  content: """
# Pulse Session 11 — 2026-03-24 18:00

## Tracks Done
- Track 7: Sandbox Build ✓

## Key Findings
- brain-mcp-starter finally shipped after 8 sessions of recommendations

## CEO Analysis
...
  """
)
```

### Example: Posting a Quick Decision Note

```
post_note(
  board: "general",
  title: "Decision: Use Streamable HTTP not SSE for MCP",
  content: "SSE transport deprecated in MCP spec 2025-03-26. All new clients use type=http (Streamable HTTP). Claude Code supports this natively."
)
```

## Notes vs Memories

| | Notes (post_note) | Memories (remember) |
|---|---|---|
| Format | Long-form, markdown | Short, structured |
| Purpose | Reports, decisions, articles | Searchable knowledge |
| Retrieval | list_notes() | recall() |
| Best for | Session summaries, docs | Facts, lessons, procedures |

Use both: post_note for the full report, remember for the key insight extracted from it.
