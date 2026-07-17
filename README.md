# Xendit Simulate Payment

Repo kecil untuk menghasilkan command `curl` yang digunakan untuk membuat Fixed Virtual Account (FVA) di Xendit.

## Fitur
- Form sederhana yang meminta `API Key`, `External ID`, dan `Amount`.
- Menghasilkan command `curl` siap-salin untuk dipakai di terminal.

## Cara menjalankan

### Opsi A — hanya generate & copy curl
1. Buka file `index.html` di browser dengan double-click, atau
2. Jalankan server sederhana dan buka di browser:

```bash
python -m http.server 8000
# lalu buka http://localhost:8000
```

### Opsi B — pakai tombol Execute (butuh proxy lokal)
Tombol `Execute` memanggil API Xendit langsung dari browser, yang akan diblokir oleh CORS jika tidak lewat proxy. Repo ini sudah menyediakan proxy Node kecil:

```bash
node server.js
# lalu buka http://localhost:8000
```

Dengan cara ini, tombol Execute akan hit `http://localhost:8000/api/fva`, yang diteruskan oleh `server.js` ke Xendit di sisi server (tanpa batasan CORS browser).

### Opsi C — deploy publik dengan tombol Execute aktif (Cloudflare Workers)
Supaya orang lain juga bisa buka link deployment dan langsung pakai tombol Execute (tanpa perlu jalanin apa-apa di komputer sendiri), repo ini sudah dilengkapi `wrangler.toml` + `worker.js` untuk deploy sebagai **Cloudflare Worker** dengan static assets.

`worker.js` menyajikan file statis (`index.html`, `styles.css`, `app.js`) sekaligus menangani route `POST /api/fva` sebagai proxy serverless ke Xendit, jadi request Execute tidak lagi kena CORS.

Cara deploy (dashboard Cloudflare, tanpa install apa pun):
1. Push repo ini ke GitHub.
2. Di dashboard Cloudflare → **Compute (Workers)** → **Create** → **Connect to Git** → pilih repo ini.
3. Cloudflare akan otomatis mendeteksi `wrangler.toml` dan men-deploy `worker.js` beserta assets-nya.
4. Buka URL `*.workers.dev` (atau custom domain) yang diberikan — tombol Execute akan langsung berfungsi untuk siapa saja yang membuka link tersebut.

Setiap `git push` ke branch yang di-connect akan otomatis re-deploy.

## Contoh penggunaan (hasil dari tombol Generate curl)

```bash
curl -X POST "https://api.xendit.co/v2/callback_virtual_accounts" -u "<API_KEY>:" -H "Content-Type: application/json" -d '{"external_id":"ext_123","bank_code":"BNI","expected_amount":150000}'
```

Ganti `<API_KEY>` dengan API Key Xendit Anda.

## Struktur
- `index.html` — UI dan form
- `styles.css` — styling
- `app.js` — generator curl dan copy-to-clipboard

## Catatan
Project ini hanya membantu membuat command curl; eksekusi tetap ke Xendit.
Untuk kenyamanan ada tombol `Execute` yang akan mencoba menjalankan request langsung dari browser.
Perhatian: banyak API tidak mengizinkan cross-origin requests dari browser (CORS), sehingga eksekusi dari UI mungkin gagal dengan error CORS — jika itu terjadi, gunakan command `curl` yang dihasilkan di terminal atau jalankan dari server Anda.
