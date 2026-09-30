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

## 3. Podman on WSL2 — networking fix (verified 2026-09-29)

`podman compose` works directly:

```bash
podman compose -f deployments/docker-compose.yml up --build -d
# open http://localhost:3000
podman compose -f deployments/docker-compose.yml down
```

(The `Dockerfile.multi` build args carry the Substack prebuild config, since
`.dockerignore` excludes `.env`.)

Background: netavark (podman's network backend) applies an nftables ruleset
(`table inet netavark` containing a `fib daddr type local` rule) that the
WSL2 kernel cannot run — Microsoft builds it without `CONFIG_NFT_FIB_IPV6`,
so `nft_fib_inet` cannot exist and every bridge network (i.e. every compose
project network) failed to start with:

```
netavark (exit code 1): nftables error: "nft" did not return successfully
```

Fix applied on this machine — `/home/user/.config/containers/containers.conf`
inside the `podman-machine-default` WSL distro:

```ini
[network]
firewall_driver = "none"
```

netavark skips nftables entirely; bridge networking, container DNS, port
publishing and outbound traffic still work (pasta handles NAT in userspace).
Recreate this file if the machine is ever recreated (`podman machine rm` /
`podman machine init`). Windows access to `localhost:3000` rides on plain WSL
localhost forwarding — no relay script needed.
