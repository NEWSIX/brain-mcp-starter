=============================================================
  brain-mcp-starter
  Pulse Session 11 | Sandbox Build | 2026-03-24
=============================================================

WHAT IT DOES
------------
A starter template for connecting Claude Code (or any MCP client)
to the WeenHive Brain MCP server at weenhive.thisaan.cloud/mcp.

Clone this repo, add your API key, open in Claude Code — done.
Claude immediately gains access to recall(), remember(), list_tasks(),
create_task(), post_note(), and all other Brain tools.

WHY THIS MATTERS
----------------
brain-mcp-starter was the #1 recommendation for 8 consecutive Pulse
sessions. It unblocks:
  1. Developer onboarding — any dev can connect to WeenHive Brain in 2 min
  2. MCPize/Smithery listing — needs a public starter to show developers
  3. Monetization — paid MCP tier needs a demo template
  4. Agent portability — any agent project can drop-in this config

HOW TO RUN
----------
Prerequisites: Claude Code installed, WeenHive Brain API key

1. Copy the config template:
     cp .claude/settings.local.json.example .claude/settings.local.json

2. Add your API key to .claude/settings.local.json

3. (Optional) Verify connectivity:
     WEENHIVE_API_KEY=your_key ./verify-connection.sh

4. Open in Claude Code:
     claude .

5. Test it — ask Claude:
     "Use recall to search for anything about WeenHive"

TECHNICAL DETAILS
-----------------
MCP Endpoint:  https://weenhive.thisaan.cloud/mcp
Transport:     Streamable HTTP (MCP spec 2025-03-26)
Auth:          x-api-key header (NOT Bearer token)
Config type:   "http" in Claude Code settings.json

The Streamable HTTP transport replaced the legacy SSE transport
as of MCP spec 2025-03-26. Claude Code supports it natively via
"type": "http" in mcpServers config.

ARCHITECTURE
------------
This is a CLIENT template (not a server).
  .claude/settings.local.json.example  — MCP client config template
  .claude/settings.local.json          — Your local config (gitignored)
  CLAUDE.md                            — Instructions for Claude in this project
  verify-connection.sh                 — Bash script to test the connection
  examples/
    01-recall.md                       — How to use recall()
    02-remember.md                     — How to use remember()
    03-tasks.md                        — Task board tools
    04-notes.md                        — Note tools
    05-session-workflow.md             — Full session pattern

WHAT WAS LEARNED
----------------
1. The config is simpler than expected. Claude Code supports
   Streamable HTTP MCP natively via "type": "http". No proxy,
   no adapter, no SDK needed. Just a JSON config block.

2. The real friction is KEY MANAGEMENT, not the config.
   Developers need to know WHERE to get their key and HOW to
   keep it out of git. The .gitignore + .env.example pattern
   solves this cleanly.

3. A runnable verify script eliminates "is it my key or the server?"
   debugging. It tests connectivity and lists available tools,
   giving developers immediate confidence.

4. The README.txt + README.md dual approach: README.txt is the
   Pulse sandbox artifact; README.md is what developers see on GitHub.

5. The endpoint returned HTTP 401 for invalid key during testing,
   confirming the server is live and auth is working correctly.
   The verify script handles this gracefully.

WHAT WOULD MAKE THIS PRODUCTION-READY
--------------------------------------
[ ] setup.sh — interactive key input, auto-injects into global Claude config
[ ] Python example — mcp-client-python/ using httpx + JSON-RPC directly
[ ] n8n workflow example — HTTP Request node config for n8n Brain integration
[ ] Published GitHub template repo — "Use this template" button on GitHub
[ ] Smithery/MCPize listing — needs this starter as the demo artifact
[ ] Multi-user config — how to share a team project but use individual keys
[ ] Health check badge — README badge showing Brain uptime

FILES
-----
  README.txt                                This file
  README.md                                 Developer-facing README (GitHub)
  CLAUDE.md                                 Claude Code project instructions
  .gitignore                                Excludes settings.local.json + .env
  .env.example                              API key template for scripts
  verify-connection.sh                      Connection test script (runnable)
  .claude/settings.local.json.example      MCP client config template
  examples/01-recall.md                     recall() usage guide
  examples/02-remember.md                   remember() usage guide
  examples/03-tasks.md                      Task tools usage guide
  examples/04-notes.md                      Note tools usage guide
  examples/05-session-workflow.md           Full session pattern

=============================================================
