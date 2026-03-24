# brain-mcp-starter

A minimal starter template for connecting Claude Code (or any MCP client) to the WeenHive Brain MCP server.

Clone this repo, add your API key, and Claude Code will have access to all Brain tools immediately.

---

## What This Gives You

Once configured, Claude Code gains these tools in every session:

| Tool | What It Does |
|------|-------------|
| `recall(query)` | Semantic search across all memories |
| `remember(content)` | Save a memory with type and tags |
| `list_tasks()` | View the task board |
| `create_task()` | Create a new task |
| `update_task()` | Change task status |
| `complete_task()` | Mark a task done |
| `post_note()` | Post a note to a board |
| `list_notes()` | List recent notes |
| `alert()` | Send an urgent alert |
| `report()` | Generate a daily summary |

---

## Prerequisites

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) installed
- A WeenHive Brain API key (get one from your WeenHive account settings)

---

## Setup (2 minutes)

### Step 1: Copy the MCP config

Copy `.claude/settings.local.json.example` to `.claude/settings.local.json`:

```bash
cp .claude/settings.local.json.example .claude/settings.local.json
```

### Step 2: Add your API key

Edit `.claude/settings.local.json` and replace `YOUR_WEENHIVE_API_KEY_HERE` with your real key:

```json
{
  "mcpServers": {
    "weenhive": {
      "type": "http",
      "url": "https://weenhive.thisaan.cloud/mcp",
      "headers": {
        "x-api-key": "wh_your_actual_key_here"
      }
    }
  }
}
```

### Step 3: Open the project in Claude Code

```bash
claude .
```

Claude Code will detect `.claude/settings.local.json` and connect to the Brain automatically. You will see `weenhive` appear in the MCP tools list.

### Step 4: Verify the connection

In Claude Code, ask:

> "Use the recall tool to search for anything about WeenHive"

If the Brain is connected, you'll get results back.

---

## Alternative: Global Setup (all projects)

To have Brain tools available in every project on your machine, add the config to your global Claude Code settings instead:

**macOS / Linux:**
```bash
mkdir -p ~/.claude
cat >> ~/.claude/settings.json << 'EOF'
{
  "mcpServers": {
    "weenhive": {
      "type": "http",
      "url": "https://weenhive.thisaan.cloud/mcp",
      "headers": {
        "x-api-key": "YOUR_WEENHIVE_API_KEY_HERE"
      }
    }
  }
}
EOF
```

> Note: If `~/.claude/settings.json` already exists, merge the `mcpServers` block manually — do not overwrite the file.

---

## Project Structure

```
brain-mcp-starter/
├── README.md                          — This file
├── CLAUDE.md                          — Instructions for Claude in this project
├── .claude/
│   ├── settings.local.json.example   — MCP config template (copy and fill in key)
│   └── settings.local.json           — Your real config (gitignored)
└── examples/
    ├── 01-recall.md                   — How to use recall()
    ├── 02-remember.md                 — How to use remember()
    ├── 03-tasks.md                    — How to use task tools
    ├── 04-notes.md                    — How to use post_note() and list_notes()
    └── 05-session-workflow.md         — Full session workflow example
```

---

## Security Notes

- `.claude/settings.local.json` is gitignored — your API key stays local
- Never commit your API key to git
- The example file uses a placeholder — safe to commit
- API keys can be rotated in your WeenHive account settings

---

## Troubleshooting

**"MCP server not found" or tools not appearing:**
- Confirm `settings.local.json` exists in `.claude/` (not just the example file)
- Confirm the API key is correct (no extra spaces, correct prefix)
- Restart Claude Code after changing config

**"401 Unauthorized" errors:**
- Your API key is wrong or expired
- Get a new key from WeenHive account settings

**"Connection refused" or network errors:**
- Check that `weenhive.thisaan.cloud` is reachable: `curl https://weenhive.thisaan.cloud/health`
- If unreachable, the service may be temporarily down — wait and retry

**Tools appear but return empty results:**
- The Brain may be empty for your account — start by using `remember()` to add some memories
- Try `recall("test")` after adding at least one memory

---

## MCP Protocol Notes

The WeenHive Brain uses **Streamable HTTP transport** (MCP spec 2025-03-26+).

- Endpoint: `POST https://weenhive.thisaan.cloud/mcp`
- Auth: `x-api-key` header (not Bearer token)
- Session management: server returns `Mcp-Session-Id` on init; client includes it on subsequent requests
- Claude Code handles all of this automatically when you use `"type": "http"` in config

The legacy SSE transport (`/mcp/sse`) is deprecated as of MCP spec 2025-03-26. Use Streamable HTTP.

---

## Related Resources

- [MCP Specification](https://modelcontextprotocol.io/specification)
- [Claude Code MCP Docs](https://docs.anthropic.com/en/docs/claude-code/mcp)
- [WeenHive](https://weenhive.thisaan.cloud)
