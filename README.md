# Xendit Simulate Payment

Tool kecil untuk mensimulasikan pembayaran ke Fixed Virtual Account (FVA) Xendit yang sudah ada, di test mode.

## Fitur
- Form sederhana: `API Key`, `External ID` (FVA yang sudah dibuat), dan `Amount`.
- Tombol `Execute` langsung memanggil Xendit dan menampilkan response-nya di halaman.

## Endpoint yang dipakai
```
POST https://api.xendit.co/callback_virtual_accounts/external_id={external_id}/simulate_payment
Authorization: Basic base64(API_KEY:)
Content-Type: application/json

{ "amount": 150000 }
```

Ini endpoint **simulate payment** untuk FVA yang sudah ada — beda dengan endpoint create FVA (`POST /v2/callback_virtual_accounts`). External ID di sini adalah ID akun virtual yang mau disimulasikan pembayarannya, bukan ID baru.

## Cara menjalankan

Karena tombol Execute memanggil API Xendit dari browser, request akan diblokir CORS kalau tidak lewat proxy. Repo ini sudah menyediakan dua cara proxy:

### Opsi A — lokal (Node)
```bash
node server.js
# lalu buka http://localhost:8000
```
`server.js` menyajikan file statis sekaligus meneruskan `POST /api/simulate-payment` ke Xendit di sisi server.

### Opsi B — deploy publik (Cloudflare Workers)
Repo ini sudah dilengkapi `wrangler.toml` + `worker.js` untuk deploy sebagai Cloudflare Worker dengan static assets, supaya siapa pun bisa buka link deployment dan langsung pakai tombol Execute tanpa menjalankan apa pun di komputer sendiri.

1. Push repo ini ke GitHub.
2. Di dashboard Cloudflare → **Compute (Workers)** → **Create** → **Connect to Git** → pilih repo ini.
3. Cloudflare otomatis mendeteksi `wrangler.toml` dan men-deploy `worker.js` beserta assets-nya.
4. Buka URL `*.workers.dev` (atau custom domain) — tombol Execute langsung berfungsi.

Setiap `git push` ke branch yang di-connect akan otomatis re-deploy.

## Struktur
- `index.html` — UI (form input + panel response)
- `styles.css` — styling
- `app.js` — logic form submit, fetch, dan render response
- `server.js` — proxy lokal (Node)
- `worker.js` / `wrangler.toml` — proxy serverless (Cloudflare Workers)

## Catatan
Ini test mode simulation — gunakan API Key `xnd_development_...`, bukan API Key production.
