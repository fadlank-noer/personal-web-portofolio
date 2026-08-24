#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Cloudflare Pages Direct Upload deploy (wrangler.json-driven)
# Project: personal-web-portofolio (Astro 7 static)
#
# Config source of truth: ../wrangler.json at repo root
#   - name: fadlan-portfolio          (Pages project name)
#   - pages_build_output_dir: dist    (build output; lets us omit the dir arg)
#
# Usage: bash deployments/deploy-pages.sh  (run from anywhere)
# First run needs auth:  npx wrangler login   (or set CLOUDFLARE_API_TOKEN)
# ---------------------------------------------------------------------------
set -euo pipefail

# Always run from repo root (script lives in deployments/)
cd "$(dirname "$0")/.."

# --- 1. Auth pre-check (wrangler whoami exits 0 even when logged out!) -----
if ! npx wrangler whoami 2>&1 | grep -qi "account ID\|@"; then
  echo "ERROR: wrangler is not authenticated." >&2
  echo "  Run: npx wrangler login   (opens browser)" >&2
  echo "  Or:  export CLOUDFLARE_API_TOKEN=<token>   (CI mode)" >&2
  exit 1
fi

# --- 2. Build ---------------------------------------------------------------
echo "==> Building Astro site..."
npm run build

# Sanity: config must be present and dist populated
test -f wrangler.json || { echo "ERROR: wrangler.json missing at repo root" >&2; exit 1; }
test -f dist/index.html || { echo "ERROR: dist/index.html missing after build" >&2; exit 1; }

# --- 3. Deploy (project name + output dir come from wrangler.json) ---------
echo "==> Deploying to Cloudflare Pages..."
# 'pages deploy' with no dir arg reads pages_build_output_dir from wrangler.json.
# First deploy auto-creates the project if it doesn't exist (wrangler >= 3.45).
npx wrangler pages deploy

echo "==> Done. Deployment URL is printed above."
