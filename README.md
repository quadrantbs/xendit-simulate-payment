# Xendit API Tester

A small client for making arbitrary requests against the Xendit API (test mode), right from the browser.

## Features
- Set it all yourself: `Method`, `URL`, `Headers`, `Auth` (Basic/Bearer/None), and `Body` (JSON).
- The `Send` button calls Xendit directly and shows the status + response on the page.
- A default example is pre-filled for the **simulate payment** FVA endpoint:
  ```
  POST https://api.xendit.co/callback_virtual_accounts/external_id={external_id}/simulate_payment
  Authorization: Basic base64(API_KEY:)
  Content-Type: application/json

  { "amount": 150000 }
  ```
  Just swap the Method/URL/Headers/Body to try any other Xendit endpoint.

## Proxy security
Since requests are sent from the browser, they have to go through a proxy (local Node / Cloudflare Worker) to avoid CORS. This proxy **only forwards requests to `api.xendit.co`** — requests to any other domain are automatically rejected (400), so it can't be abused as an open proxy.

## Running it

### Option A — locally (Node)
```bash
node server.js
# then open http://localhost:8000
```
`server.js` serves the static files and also forwards `POST /api/proxy` to Xendit on the server side.

### Option B — public deployment (Cloudflare Workers)
This repo already includes `wrangler.toml` + `worker.js` to deploy as a Cloudflare Worker with static assets, so anyone can open the deployment link and use the Send button right away without running anything locally.

1. Push this repo to GitHub.
2. In the Cloudflare dashboard → **Compute (Workers)** → **Create** → **Connect to Git** → select this repo.
3. Cloudflare automatically detects `wrangler.toml` and deploys `worker.js` along with its assets.
4. Open the `*.workers.dev` URL (or a custom domain) — the Send button works right away.

Every `git push` to the connected branch triggers an automatic re-deploy.

## Structure
- `index.html` — request builder UI (method/url/headers/auth/body) + response panel
- `styles.css` — styling
- `app.js` — logic for building the request, calling the proxy, rendering the response
- `server.js` — local proxy (Node), whitelists the `api.xendit.co` host
- `worker.js` / `wrangler.toml` — serverless proxy (Cloudflare Workers), same host whitelist

## Note
This is for test mode — use an `xnd_development_...` API key, not a production API key.
