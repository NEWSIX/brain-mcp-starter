#!/usr/bin/env bash
# verify-connection.sh — Test WeenHive Brain MCP connectivity
#
# Usage:
#   WEENHIVE_API_KEY=wh_your_key_here ./verify-connection.sh
#
# Or set the key in .env:
#   echo "WEENHIVE_API_KEY=wh_your_key_here" > .env
#   source .env && ./verify-connection.sh

set -euo pipefail

MCP_URL="https://weenhive.thisaan.cloud/mcp"

# ── Load .env if it exists ────────────────────────────────────────────────────
if [ -f ".env" ]; then
  # shellcheck disable=SC1091
  source .env
fi

# ── Check for API key ─────────────────────────────────────────────────────────
if [ -z "${WEENHIVE_API_KEY:-}" ]; then
  echo ""
  echo "ERROR: WEENHIVE_API_KEY is not set."
  echo ""
  echo "Set it one of these ways:"
  echo "  1. Export: export WEENHIVE_API_KEY=wh_your_key_here"
  echo "  2. Inline: WEENHIVE_API_KEY=wh_your_key_here ./verify-connection.sh"
  echo "  3. .env file: echo 'WEENHIVE_API_KEY=wh_your_key_here' > .env"
  echo ""
  exit 1
fi

echo ""
echo "WeenHive Brain MCP — Connection Verification"
echo "============================================="
echo "Endpoint: $MCP_URL"
echo ""

# ── Test 1: Basic connectivity ────────────────────────────────────────────────
echo "Test 1: Basic connectivity..."

HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  --max-time 10 \
  -X POST "$MCP_URL" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "x-api-key: $WEENHIVE_API_KEY" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"brain-mcp-starter-verify","version":"1.0.0"}}}')

if [ "$HTTP_STATUS" = "200" ]; then
  echo "  PASS — HTTP $HTTP_STATUS (server reachable and accepting requests)"
elif [ "$HTTP_STATUS" = "401" ]; then
  echo "  FAIL — HTTP 401 Unauthorized (check your WEENHIVE_API_KEY)"
  exit 1
elif [ "$HTTP_STATUS" = "000" ]; then
  echo "  FAIL — No response (server unreachable or DNS error)"
  echo "  Try: curl -v $MCP_URL"
  exit 1
else
  echo "  WARN — HTTP $HTTP_STATUS (unexpected status)"
fi

# ── Test 2: MCP initialize and get session ID ─────────────────────────────────
echo ""
echo "Test 2: MCP initialize (get session ID)..."

INIT_RESPONSE=$(curl -s \
  --max-time 10 \
  -X POST "$MCP_URL" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "x-api-key: $WEENHIVE_API_KEY" \
  -D /tmp/mcp-headers.txt \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"brain-mcp-starter-verify","version":"1.0.0"}}}')

SESSION_ID=$(grep -i "Mcp-Session-Id" /tmp/mcp-headers.txt 2>/dev/null | awk '{print $2}' | tr -d '\r' || echo "")
SERVER_NAME=$(echo "$INIT_RESPONSE" | grep -o '"name":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "unknown")

if echo "$INIT_RESPONSE" | grep -q '"result"'; then
  echo "  PASS — MCP initialize successful"
  [ -n "$SERVER_NAME" ] && echo "  Server: $SERVER_NAME"
  [ -n "$SESSION_ID" ] && echo "  Session ID: $SESSION_ID"
else
  echo "  FAIL — MCP initialize did not return a result"
  echo "  Response: $INIT_RESPONSE"
  exit 1
fi

# ── Test 3: List tools ────────────────────────────────────────────────────────
echo ""
echo "Test 3: Fetch available tools..."

TOOLS_HEADERS=""
[ -n "$SESSION_ID" ] && TOOLS_HEADERS="-H \"Mcp-Session-Id: $SESSION_ID\" -H \"MCP-Protocol-Version: 2025-03-26\""

TOOLS_RESPONSE=$(curl -s \
  --max-time 10 \
  -X POST "$MCP_URL" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "x-api-key: $WEENHIVE_API_KEY" \
  ${SESSION_ID:+-H "Mcp-Session-Id: $SESSION_ID"} \
  ${SESSION_ID:+-H "MCP-Protocol-Version: 2025-03-26"} \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}')

TOOL_COUNT=$(echo "$TOOLS_RESPONSE" | grep -o '"name"' | wc -l | tr -d ' ')

if echo "$TOOLS_RESPONSE" | grep -q '"tools"'; then
  echo "  PASS — $TOOL_COUNT tools available"
  echo ""
  echo "  Available tools:"
  echo "$TOOLS_RESPONSE" | grep -o '"name":"[^"]*"' | cut -d'"' -f4 | while read -r tool; do
    echo "    - $tool"
  done
else
  echo "  FAIL — Could not fetch tools list"
  echo "  Response: $TOOLS_RESPONSE"
fi

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo "============================================="
echo "Connection verified. WeenHive Brain MCP is ready."
echo ""
echo "Next step: Open this project in Claude Code:"
echo "  claude ."
echo ""
echo "Then ask Claude to recall something:"
echo "  'Use recall to search for anything about WeenHive'"
echo ""
