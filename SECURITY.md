# WeenHive MCP Security Posture

**Version:** 1.0
**Date:** 2026-03-29
**Product:** WeenHive Brain MCP Server
**Endpoint:** https://weenhive.thisaan.cloud/mcp
**Package:** brain-mcp-starter (npm)
**Contact:** security@weenhive.thisaan.cloud

---

## Overview

WeenHive Brain is a semantic memory and task management system accessible via the Model Context Protocol (MCP). This document describes the security architecture, data handling practices, compliance posture, and known limitations of the WeenHive Brain MCP server.

It is intended for enterprise evaluators, registry reviewers (Smithery, MCPize, Anthropic Connector Directory), and security-conscious developers before integrating WeenHive Brain into their workflows.

---

## 1. Authentication & Authorization

### Brain API Key (Server-to-Brain)

All WeenHive Brain MCP operations require a valid Brain API key (`BRAIN_API_KEY`).

- **Format:** `whk_` prefix, 64-character hex string
- **Issuance:** Generated per workspace at https://weenhive.thisaan.cloud/settings/api-keys
- **Transmission:** Sent as `x-api-key` HTTP header over TLS 1.2+ only — never in URL parameters or request body
- **Scope:** Each API key is bound to exactly one workspace. Cross-workspace data access is architecturally impossible with a single key.
- **Enforcement:** Brain API validates the key on every request. Invalid or expired keys → `401 Unauthorized`.
- **Startup Guard:** `brain-mcp-starter` exits with a fatal error at startup if `BRAIN_API_KEY` is not set, preventing silent unauthenticated operation.

### MCP Server API Key (Client-to-Server, HTTP mode)

Operators may set `MCP_SERVER_API_KEY` to require clients to authenticate before accessing the MCP endpoint.

- Clients must include `x-api-key: <value>` header on all `/mcp` requests
- Missing or incorrect key → `401 Unauthorized` before any tool execution
- Optional in stdio mode (process boundary provides isolation)

### Per-Workspace Isolation

- Each API key maps to exactly one workspace. No tool allows cross-workspace data access.
- No admin-scoped keys are exposed via the public API surface.

### OAuth 2.1 Roadmap

The HTTP server exposes `GET /.well-known/oauth-protected-resource` per RFC 9728. This is a non-functional stub. Full OAuth 2.1 support is planned for Q3 2026. Current auth is API key only.

---

## 2. Transport Security

### TLS Enforcement

- All Brain API calls are made over HTTPS (`https://weenhive.thisaan.cloud/mcp`)
- TLS 1.2 minimum; TLS 1.3 preferred where supported
- Plaintext HTTP connections to the Brain API are not accepted

### DNS Rebinding Protection (HTTP mode)

- Uses `createMcpExpressApp({ host })` from the official MCP SDK, which validates the `Host` header on every request
- Default bind address: `127.0.0.1` (loopback only)
- **Warning:** Do not set `MCP_HOST=0.0.0.0` without a reverse proxy that handles Host header validation

### CORS Policy (HTTP mode)

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: Content-Type, x-api-key, Mcp-Session-Id, MCP-Protocol-Version
Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS
```

`Allow-Origin: *` is intentional for developer tooling compatibility. In enterprise deployments, restrict allowed origins at your reverse proxy.

### MCP Protocol Version Validation

Non-initialization requests must include a valid `MCP-Protocol-Version` header. Supported: `2025-03-26`, `2024-11-05`. Unknown versions → `400 Bad Request`. Prevents protocol downgrade attacks.

---

## 3. Data Handling & PDPA Compliance

### Data Stored (all encrypted at rest)

| Data Type | Description | Storage |
|-----------|-------------|---------|
| Memories | User-saved text (recall/remember) | Encrypted at rest |
| Tasks | Board tasks with title, description, status | Encrypted at rest |
| Notes | User notes | Encrypted at rest |
| API Keys | Brain API keys | bcrypt hash only — plaintext never stored |
| Session IDs | Ephemeral MCP session identifiers | In-memory only, not persisted |

### Thailand Data Residency

- All WeenHive Brain data is stored on Thailand-hosted servers (weenhive.thisaan.cloud)
- No data is transferred to third-party cloud storage, analytics platforms, or CDN edge nodes
- Satisfies PDPA Section 29 requirements for cross-border transfer restrictions for Thai personal data

### PDPA Compliance (Thailand PDPA B.E. 2562)

- **Data Controller:** WeenHive (newsix@weenhive.thisaan.cloud)
- **Lawful Basis:** Contract (service provision to registered users)
- **Data Minimization:** The MCP server only transmits data explicitly provided by the user via tool calls. No telemetry. No background data collection.
- **Right to Erasure:** Users may delete all data via the Brain dashboard or API. Account deletion triggers full purge.

### No Cross-Tenant Data Access

- Brain API enforces workspace-level row isolation at the database layer
- All queries are scoped by workspace UUID derived from the authenticated API key
- No global search endpoints span workspaces

### No AI Training Use

WeenHive does not use customer memories, tasks, or notes to train or fine-tune any AI model. All data is treated as confidential customer data.

---

## 4. Rate Limiting & Abuse Prevention

### Brain API Rate Limits

| Tier | Limit |
|------|-------|
| Default (free) | 60 requests/minute per API key |
| Pro | 300 requests/minute per API key |
| Enterprise | Custom — contact newsix@weenhive.thisaan.cloud |

Exceeded limit → `429 Too Many Requests` with `Retry-After` header.

### Input Validation (Zod schemas)

All MCP tool inputs are validated before being forwarded to the Brain API:

- String fields: maximum length constraints
- Enum fields (status, priority, scope, type): reject unknown values
- Numeric fields (limit, repeat): bounded to safe ranges
- Malformed JSON → `400 Bad Request` before any tool execution

### No Server-Side Code Execution

`brain-mcp-starter` does not execute any code provided by users or AI models. All tools are deterministic API proxies — no `eval`, no shell execution, no file system access. The only outbound network call is HTTPS to the configured `BRAIN_API_URL`.

---

## 5. Memory Lifecycle & Retention

### Decay

Memories have a confidence score (0.0–1.0) that decays based on access frequency. Inactive memories (not accessed in 30+ days) decay toward 0.3. Low-confidence memories (< 0.2) are eligible for automatic archival.

### Tombstoning (Soft Delete)

Deleted memories are tombstoned before permanent removal. Tombstoned memories are not returned in recall() or list_memories() results. Tombstones are purged after 30 days, allowing recovery of accidental deletions within that window.

### Supersede

`supersede_memory()` replaces an existing memory, marking the old version as archived. Preserves an audit trail without hard deletion.

### User-Initiated Deletion

Individual memories may be deleted at any time via the Brain dashboard or direct API call (UUID required). Account deletion triggers an irreversible purge of all memories, tasks, notes, and API keys within 7 days.

---

## 6. Audit Logging

### Server-Side Logs (Brain API)

- Authentication events (successful/failed API key validation)
- Tool invocations (tool name, timestamp, workspace ID — **not** content)
- Rate limit events (429 responses with key prefix)
- Error events (5xx with stack trace in dev; sanitized in production)

Logs do **not** contain memory content or task descriptions.

### Session Logs (brain-mcp-starter)

Written to stderr only — not persisted, not transmitted:

- Session initialization and termination (UUID only)
- Transport startup confirmation
- Fatal errors with stack traces

### No Third-Party Analytics

No user activity is sent to Mixpanel, Amplitude, Google Analytics, or any analytics platform. The only outbound call from `brain-mcp-starter` is to the configured `BRAIN_API_URL`.

---

## 7. Permissions & Network Access Scope

### What brain-mcp-starter CAN do

| Permission | Scope |
|------------|-------|
| Read memories | Authenticated workspace only |
| Write memories | Authenticated workspace only |
| Read/create/update tasks | Authenticated workspace only |
| Send LINE alert | Via Brain API only, if key has alert permission |
| Network access | HTTPS to BRAIN_API_URL only |

### What brain-mcp-starter CANNOT do

- Access the local file system
- Execute shell commands
- Access environment variables beyond `BRAIN_API_KEY`, `BRAIN_API_URL`, `MCP_*`
- Call any external URL other than the configured Brain API endpoint
- Read memories from other workspaces
- Modify Brain API keys or user account settings

---

## 8. Known Limitations

| Item | Status | Notes |
|------|--------|-------|
| OAuth 2.1 | Stub only | RFC 9728 discovery exists; OAuth not implemented |
| CORS origin allowlist | Open (`*`) | Restrict at reverse proxy for enterprise use |
| alert() in some deployments | Broken | BRAIN_API_KEY missing in gateway container (known issue) |
| X-RateLimit-Remaining header | Not implemented | Retry-After returned on 429; remaining count not exposed |
| MFA for API key issuance | Not available | Account login required but no second factor enforced |
| Automated secrets scanning | Manual | No CI/CD pipeline scanning yet |
| External penetration test | Not yet done | Planned Q4 2026 |

---

## 9. Security Roadmap

| Item | Target | Priority |
|------|--------|----------|
| OAuth 2.1 full implementation | Q3 2026 | High |
| CORS origin allowlist configuration | Q2 2026 | Medium |
| X-RateLimit-Remaining headers | Q2 2026 | Low |
| MFA for API key issuance | Q3 2026 | Medium |
| Automated secrets scanning in CI | Q2 2026 | Medium |
| SOC 2 Type I self-assessment | Q4 2026 | High |
| External penetration test | Q4 2026 | High |

---

## 10. Responsible Disclosure

**To report a security vulnerability:**

1. **Email:** security@weenhive.thisaan.cloud
2. **Subject:** `[SECURITY] Brief description`
3. **Include:** Reproduction steps, affected component, potential impact

**Response SLA:**
- Acknowledgement: within 48 hours
- Triage and severity assessment: within 7 days
- Fix timeline communicated: within 14 days for High/Critical

WeenHive does not pursue legal action against good-faith security researchers who follow this disclosure process.

---

## 11. Third-Party Dependencies

| Package | Version | Purpose | Security Notes |
|---------|---------|---------|----------------|
| @modelcontextprotocol/sdk | ^1.28.0 | MCP protocol | Official Anthropic SDK |
| express | ^5.2.1 | HTTP server | Express 5 improved security defaults |
| zod | ^4.3.6 | Input validation | Schema-first; no eval |
| node.js | >=18.0.0 | Runtime | LTS only; native crypto.randomUUID |

`npm audit` is run before each release. No known critical CVEs in current dependency tree as of 2026-03-29.

---

## Integrator Security Checklist

Before deploying `brain-mcp-starter` in production or enterprise:

- [ ] Set `BRAIN_API_KEY` via environment variable — never hardcode in config files
- [ ] Use `.env` with `.gitignore` exclusion — never commit API keys to version control
- [ ] HTTP mode: set `MCP_SERVER_API_KEY` to require client authentication
- [ ] HTTP mode: bind to `127.0.0.1` (default) or deploy behind a TLS-terminating reverse proxy
- [ ] Rotate `BRAIN_API_KEY` quarterly or after any suspected compromise
- [ ] Use `scope="user"` for sensitive memories; `scope="shared"` for team-shared context only
- [ ] Monitor stderr logs for authentication failures and rate limit events

---

*For the latest version of this document, see [SECURITY.md](https://github.com/NEWSIX/brain-mcp-starter/blob/main/SECURITY.md) in the brain-mcp-starter repository.*
