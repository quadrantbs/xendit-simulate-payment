# Xendit API Tester

Mini Postman-like client untuk bikin request bebas ke API Xendit (test mode), langsung dari browser.

## Fitur
- Atur sendiri: `Method`, `URL`, `Headers`, `Auth` (Basic/Bearer/None), dan `Body` (JSON).
- Tombol `Send` langsung memanggil Xendit dan menampilkan status + response-nya di halaman.
- Contoh default sudah diisi untuk endpoint **simulate payment** FVA:
  ```
  POST https://api.xendit.co/callback_virtual_accounts/external_id={external_id}/simulate_payment
  Authorization: Basic base64(API_KEY:)
  Content-Type: application/json

  { "amount": 150000 }
  ```
  Tinggal ganti Method/URL/Headers/Body sesuai endpoint Xendit lain yang mau dicoba.

## Keamanan proxy
Karena request dikirim dari browser, harus lewat proxy (Node lokal / Cloudflare Worker) supaya tidak kena CORS. Proxy ini **hanya meneruskan request ke `api.xendit.co`** — request ke domain lain otomatis ditolak (400), supaya tidak jadi open-proxy sembarangan.

## Cara menjalankan

### Opsi A — lokal (Node)
```bash
node server.js
# lalu buka http://localhost:8000
```
`server.js` menyajikan file statis sekaligus meneruskan `POST /api/proxy` ke Xendit di sisi server.

### Opsi B — deploy publik (Cloudflare Workers)
Repo ini sudah dilengkapi `wrangler.toml` + `worker.js` untuk deploy sebagai Cloudflare Worker dengan static assets, supaya siapa pun bisa buka link deployment dan langsung pakai tombol Send tanpa menjalankan apa pun di komputer sendiri.

1. Push repo ini ke GitHub.
2. Di dashboard Cloudflare → **Compute (Workers)** → **Create** → **Connect to Git** → pilih repo ini.
3. Cloudflare otomatis mendeteksi `wrangler.toml` dan men-deploy `worker.js` beserta assets-nya.
4. Buka URL `*.workers.dev` (atau custom domain) — tombol Send langsung berfungsi.

Setiap `git push` ke branch yang di-connect akan otomatis re-deploy.

## Struktur
- `index.html` — UI request builder (method/url/headers/auth/body) + panel response
- `styles.css` — styling
- `app.js` — logic build request, fetch ke proxy, render response
- `server.js` — proxy lokal (Node), whitelist host `api.xendit.co`
- `worker.js` / `wrangler.toml` — proxy serverless (Cloudflare Workers), whitelist host sama

## Catatan
Ini untuk test mode — gunakan API Key `xnd_development_...`, bukan API Key production.
