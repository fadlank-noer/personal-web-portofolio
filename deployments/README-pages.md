# Cloudflare Pages — Direct Upload (wrangler.json)

Static Astro site (`output: "static"`), no Git integration, no Functions.

## Files
| File | Role |
|---|---|
| `wrangler.json` (repo root) | Pages project config — `name` + `pages_build_output_dir`. Must stay at root (wrangler reads it from cwd). |
| `deployments/deploy-pages.sh` | One-shot deploy: auth check → build → upload. |

## Why wrangler.json sits at repo root
Wrangler discovers `wrangler.json` from the working directory only. Root placement
also matches `astro.config.mjs`/`package.json` as project descriptors and enables
editor schema validation (`$schema` points at `node_modules/wrangler/config-schema.json`).
If you move it elsewhere, `pages deploy` will fail with
`Pages does not support custom paths for the Wrangler configuration file` —
so keep `wrangler.json` at the repo root.

## First-time setup
```bash
npx wrangler login        # once; opens browser
bash deployments/deploy-pages.sh
```
First deploy auto-creates the Pages project named in `wrangler.json`
(`fadlan-portfolio`). Production branch defaults to `main` (settable only via
the API Update Project endpoint for Direct Upload — cosmetic, not blocking).

## Fast redeploy (build + upload)
```bash
npm run deploy:pages      # = npm run build && npx wrangler pages deploy
```

## Routing
No `_redirects` needed. Every route is a real pre-rendered `dist/**/index.html`;
unmatched paths fall back to `dist/404.html` automatically on Pages.

## Limits (checked against this repo)
- 20,000 files / deploy — we ship 49.
- 25 MiB / file — largest asset well under.
- Git integration can NEVER be added to a Direct Upload project later (one-way door).
