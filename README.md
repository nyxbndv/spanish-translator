# Spanish Learning Translator — Self-Hosted

A Dockerized Spanish/English translator powered by the Claude API. Word-by-word
breakdown, grammar notes, verb tense, and sentence-structure lessons.

**Architecture:** Express backend holds the API key and proxies to Anthropic.
The React frontend only ever talks to `/api/translate`, so the key is **never
shipped to the browser** (unlike the original artifact).

```
browser ──> /api/translate ──> Express (holds key) ──> api.anthropic.com
```

## Environment variables

| Variable             | Required | Default                     | Notes                                  |
|----------------------|----------|-----------------------------|----------------------------------------|
| `ANTHROPIC_API_KEY`  | yes      | —                           | From console.anthropic.com             |
| `CLAUDE_MODEL`       | no       | `claude-sonnet-4-20250514`  | Any model your key can access          |
| `MAX_TOKENS`         | no       | `1000`                      | Max tokens per response                |
| `PORT`               | no       | `3000`                      | In-container port                      |

---

## Option A — Build directly on Unraid (Compose Manager plugin)

This is the simplest path since the image isn't on a registry.

1. Install **Compose Manager** from Community Applications if you don't have it.
2. Copy this whole folder to your server, e.g. `/mnt/user/appdata/spanish-translator/`.
3. In Compose Manager, add a new stack pointing at that folder (it reads
   `docker-compose.yml`).
4. Edit the stack's `.env` (or set the variable in compose) so
   `ANTHROPIC_API_KEY` is your real key.
5. **Compose Up.** It builds the image and starts the container.
6. Browse to `http://<tower-ip>:8500`.

From a shell instead:
```bash
cd /mnt/user/appdata/spanish-translator
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env
docker compose up -d --build
```

---

## Option B — Build the image, then use the Unraid template

If you'd rather manage it from the Docker tab like your other containers:

1. Build and tag the image (on the Unraid box or any machine, then push to a
   registry your server can reach — GHCR, Docker Hub, or a local registry):
   ```bash
   docker build -t spanish-translator:latest .
   ```
   If building elsewhere, push it and update the `<Repository>` field in
   `unraid-spanish-translator.xml` to match (e.g. `ghcr.io/youruser/spanish-translator:latest`).
2. Copy `unraid-spanish-translator.xml` to
   `/boot/config/plugins/dockerMan/templates-user/` on your server.
3. Docker tab → **Add Container** → select `spanish-translator` from the template
   dropdown.
4. Fill in `ANTHROPIC_API_KEY`, adjust the port if 8500 clashes, **Apply**.

---

## Local dev (optional)

Two terminals:
```bash
# terminal 1 — backend
ANTHROPIC_API_KEY=sk-ant-... node server.js

# terminal 2 — frontend with hot reload (proxies /api to :3000)
npm run dev
```

Or test the production build in one process:
```bash
npm run build
ANTHROPIC_API_KEY=sk-ant-... node server.js
# open http://localhost:3000
```

## Reverse proxy (NPM)

Point a proxy host at `<container-ip>:3000` (or `<tower-ip>:8500`). It's a plain
HTTP app with WebSocket-free traffic, so no special config needed. Add it to a
`grasso.tech` subdomain and you're done.

## Notes

- One API call per translate click. The direction toggle is manual, so there's
  no extra detection round-trip.
- `/api/health` returns `{ ok, model, keyConfigured }` for quick container
  health checks.
