# Xendit Simulate Payment

Repo demo untuk mensimulasikan alur payment seperti Xendit, dengan fokus utama pada Fixed Virtual Account (FVA).

## Fitur
- Create payment mock
- Simulasi Fixed Virtual Account (FVA)
- Ubah status payment: pending, paid, expired, failed
- Preview payload webhook
- Data tersimpan di browser via localStorage
- Simpan external ID, API key, dan default nominal secara lokal
- Siap dipublish ke GitHub Pages

## Cara menjalankan
1. Buka file `index.html` di browser, atau
2. Deploy folder ini ke GitHub Pages

## Struktur
- `index.html` — halaman utama
- `styles.css` — styling UI
- `app.js` — logika simulasi payment

## Catatan
Project ini adalah simulasi frontend, bukan integrasi resmi ke Xendit.
External ID dan API key disimpan hanya di localStorage browser masing-masing user.
