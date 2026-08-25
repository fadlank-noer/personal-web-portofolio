# Deployment

This project ships two deploy paths. Both build the same static `dist/` output
(`npm run build`).

## 1. Local Docker preview (nginx SPA)

Used to catch build / route / asset bugs locally **before** deploying to Cloudflare.

```bash
docker compose -f deployments/docker-compose.yml up --build -d
# open http://localhost:3000
docker compose -f deployments/docker-compose.yml down
```

Files: `Dockerfile`, `Dockerfile.multi`, `nginx.conf`, `docker-compose.yml`.

## 2. Cloudflare Pages — Direct Upload (wrangler)

`wrangler.json` MUST stay at the **project root** — Wrangler rejects custom
config paths for Pages (`Pages does not support custom paths for the Wrangler
configuration file`). It is the only deploy file that cannot live in
`deployments/`.

First-time auth (interactive):

```bash
npx wrangler login
```

Or set a token for non-interactive / CI deploys (`cp .env.example .env`, fill in):

```bash
export CLOUDFLARE_API_TOKEN=...
npm run deploy:pages      # = npm run build && npx wrangler pages deploy dist
```

`wrangler.json` content (verified against Cloudflare docs + `astro-deploy` skill):

```json
{
  "name": "fadlan-portfolio",
  "compatibility_date": "2026-08-24",
  "pages_build_output_dir": "dist"
}
```

Notes:
- Static Astro (`output: "static"`) — no `@astrojs/cloudflare` adapter needed.
- Pages serves `index.html` for every route automatically (SPA fallback built-in),
  so no `_redirects` file is required.
- This is **Direct Upload**, not Git integration — you cannot switch to Git
  deploys later without creating a new project.
- Wrangler upload limits: 20,000 files / 25 MiB per file (this site is ~49 files).
