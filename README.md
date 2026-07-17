# Xendit Simulate Payment

Repo kecil untuk menghasilkan command `curl` yang digunakan untuk membuat Fixed Virtual Account (FVA) di Xendit.

## Fitur
- Form sederhana yang meminta `API Key`, `External ID`, dan `Amount`.
- Menghasilkan command `curl` siap-salin untuk dipakai di terminal.

## Cara menjalankan
1. Buka file `index.html` di browser dengan double-click, atau
2. Jalankan server sederhana dan buka di browser:

```bash
python -m http.server 8000
# lalu buka http://localhost:8000
```

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
