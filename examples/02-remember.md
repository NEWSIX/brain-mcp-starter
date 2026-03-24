# Example: remember()

Save knowledge, findings, decisions, and lessons to the Brain.

## Rule: Always recall() first

Before calling remember(), always recall() with a similar query to check if the information already exists. Duplicates degrade the Brain's quality.

## Parameters

```
remember(content: string, type?: string, tags?: string[], scope?: string)
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `content` | string | required | The memory content (English only) |
| `type` | string | "factual" | Memory type (see types below) |
| `tags` | string[] | [] | Tags for filtering and organization |
| `scope` | string | "shared" | `shared` (all users), `user` (you only), `agent` (agent only) |

## Memory Types

| Type | Use For |
|------|---------|
| `factual` | Facts, decisions, references, discovered truths |
| `experiential` | Lessons learned, what worked/didn't work, episodes |
| `procedural` | Step-by-step workflows, SOPs, how-to guides |
| `identity` | Who someone is, preferences, roles |
| `working` | Current context, session state (short-lived) |
| `reference` | Documentation snippets, external specs |
| `skill` | Technical knowledge, code patterns, architecture |
| `lesson` | Key takeaways (consolidated from experiential) |
| `decision` | Choices made and why |

## Example Prompts

```
"Remember that the WeenHive MCP endpoint uses x-api-key header auth, not Bearer tokens"

"Remember this as a lesson: always check for duplicate memories before calling remember()"

"Remember: [full session summary here]. Tags: pulse, session-log, session-11, 2026-03-24"
```

## Example Tool Call

```json
{
  "content": "WeenHive MCP uses Streamable HTTP transport (not SSE). Config: type=http, url=https://weenhive.thisaan.cloud/mcp, auth=x-api-key header.",
  "type": "procedural",
  "tags": ["mcp", "config", "transport", "weenhive"],
  "scope": "shared"
}
```

## Scope Guide

- `shared` — All users and agents can see this. Use for team knowledge.
- `user` — Only you can see this. Use for personal context.
- `agent` — Only the specific agent can see this. Use for agent-specific state.

## Content Quality Rules

1. English only (translate Thai before saving)
2. Be specific — vague memories are useless
3. Include source/date for factual claims: "Source: MCP spec 2025-06-18"
4. Label uncertain information: "⚠️ Unverified: ..."
5. One concept per memory — don't bundle unrelated facts
