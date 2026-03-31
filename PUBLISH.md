# brain-mcp-starter — Publish Checklist

Prepared by Pulse Worker A, Session 176, 2026-03-29.
Everything is ready. Khun New just needs to run these commands.

---

## Step 1: Create npm account (if you don't have one)

1. Go to https://www.npmjs.com/signup
2. Create account with username (e.g. `newsix` or `weenhive`)
3. Verify email

---

## Step 2: Login to npm

```bash
cd ~/Scripts/sandbox/brain-mcp-starter
npm login
# Enter: username, password, email, OTP (check your email)
```

---

## Step 3: Publish

```bash
npm publish --access public
```

Expected output:
```
npm notice Publishing to https://registry.npmjs.org/
+ brain-mcp-starter@1.0.0
```

---

## Step 4: Verify

```bash
# Wait 1-2 minutes, then:
npm view brain-mcp-starter
npx brain-mcp-starter --help  # Should show FATAL: BRAIN_API_KEY not set
```

---

## Step 5: Submit to Smithery

1. Push this repo to GitHub: https://github.com/NEWSIX/brain-mcp-starter
   ```bash
   # If repo doesn't exist yet, create it on github.com first, then:
   git init
   git add package.json README.md src/ dist/ smithery.yaml LICENSE .env.example .npmignore
   git commit -m "feat: brain-mcp-starter v1.0.0 — production MCP server template"
   git remote add origin https://github.com/NEWSIX/brain-mcp-starter.git
   git push -u origin main
   ```
2. Go to https://smithery.ai
3. Sign in with GitHub
4. Click "Publish" → paste GitHub repo URL: `https://github.com/NEWSIX/brain-mcp-starter`
5. Smithery auto-reads `smithery.yaml` (already created)

---

## Step 6: Submit to mcp.so

1. Go to https://mcp.so
2. Click "Submit" in navbar (or go to their GitHub issues)
3. Create issue with:
   - Name: `brain-mcp-starter`
   - npm: `https://www.npmjs.com/package/brain-mcp-starter`
   - GitHub: `https://github.com/NEWSIX/brain-mcp-starter`
   - Description: Production-grade MCP server starter kit with dual stdio/HTTP transport

---

## Step 7: Submit to Official MCP Registry (bonus)

1. Go to https://registry.modelcontextprotocol.io
2. Submit via GitHub PR to https://github.com/modelcontextprotocol/registry
3. Requires: GitHub repo + npm package (steps 3-5 must be done first)

---

## Package Contents (already prepared)

| File | Status |
|------|--------|
| `dist/index.js` | Built, shebang added, executable |
| `package.json` | Updated with types, repository, homepage, bin, engines |
| `LICENSE` | MIT, 2026 WeenHive |
| `smithery.yaml` | Smithery registry config |
| `.npmignore` | Excludes src/, node_modules, .env |
| `README.md` | Full API reference (rewritten S174) |
| `.env.example` | Template for users |

**npm pack dry-run: 18 files, 12.6 kB packed** — clean, ready.

---

*Pulse Worker A — Session 176 — 2026-03-29*
