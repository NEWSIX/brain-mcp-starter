# Example: recall()

Search the Brain for existing knowledge before doing research or before saving anything new.

## Basic Usage

In Claude Code, ask:

> "Use recall to search for anything about [topic]"

Or instruct Claude directly in your CLAUDE.md:

> "Before answering, recall() relevant context from WeenHive Brain."

## Parameters

```
recall(query: string, limit?: number, scope?: string, type?: string)
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `query` | string | required | Natural language search query (English) |
| `limit` | number | 5 | Max results to return (max 50) |
| `scope` | string | all | Filter: `shared`, `user`, or `agent` |
| `type` | string | all | Filter by memory type (see remember() types) |

## Example Prompts

```
"Recall what you know about WeenHive architecture"
"Search the brain for recent lessons about MCP transport"
"Recall any factual memories tagged with 'mcp'"
```

## What Good recall() Output Looks Like

```json
{
  "data": [
    {
      "id": "uuid-here",
      "content": "The MCP endpoint is https://weenhive.thisaan.cloud/mcp ...",
      "type": "procedural",
      "scope": "shared",
      "confidence": 0.9,
      "tags": ["mcp", "config"],
      "created_at": "2026-03-18T05:55:33Z"
    }
  ],
  "method": "semantic"
}
```

## Pro Tips

- Use broad queries first, narrow if too many results
- Results are ranked by semantic similarity — exact keyword matches not required
- `confidence` field: 0.9+ = well-established, 0.5 = single-source, <0.3 = uncertain
- Always recall() before remember() to avoid storing duplicates
