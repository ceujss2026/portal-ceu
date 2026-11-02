# 🎓 PORTAL CEU (CAREER EDUCATION UNIT)
### Unit Pendidikan Kerjaya, Jabatan Sekolah-Sekolah, Kementerian Pendidikan Brunei Darussalam

Aplikasi web responsif *Mobile-First* & APK Android berasaskan **Google Apps Script (GAS) REST API** dan frontend statik sedia deploy ke **GitHub Pages**.

---

## 📁 Struktur Projek

```text
c:\Users\ACER\Desktop\CEU SITE\
├── index.html                  # Antaramuka SPA Lengkap (10 Skrin UI/UX)
├── css/
│   └── style.css               # Gaya Tailwind & Spesifikasi Cetakan A4 PDF
├── js/
│   ├── config.js               # Konfigurasi URL Google Apps Script (GAS_URL)
│   ├── data-mock.js            # Data simulasi lengkap 4 daerah Brunei (Offline/Preview)
│   └── app.js                  # Enjin SPA, SWR Cache, Biometrik & Kamus Dwi-Bahasa
├── backend/
│   ├── Kode.gs                 # Google Apps Script Pure REST API (CacheX, HMAC, Auto-Setup)
│   └── Migrasi.gs              # Utiliti migrasi database & delta sync idempoten
├── docs/
│   └── DEPLOYMENT_GUIDE.md     # Panduan lengkap setup GAS & deploy ke GitHub Pages
└── prd_portal_ceu_upk.md       # Dokumen PRD Final Portal CEU
```

---

## ⚡ Panduan Ujian Tempatan (Instant Local Test)
1. Klik dua kali pada fail `index.html` untuk membukanya terus di mana-mana pelayar web (Chrome, Edge, Safari).
2. Sistem secara automatik menggunakan **Mod Simulasi Interaktif (Mock Data)** sekiranya `GAS_URL` belum disambungkan:
   - **Log Masuk OTP**: Masukkan sebarang emel rasmi seperti `ahmad.bakar@moe.bn` (kod OTP demo: `123456`).
   - **Biometrik Pantas**: Klik butang cap jari berdenyut untuk log masuk pantas.
   - **Togol Dwi-Bahasa**: Klik butang `BM | EN` pada bar pengepala untuk menukar bahasa.
   - **RSVP Pintar**: Buka sebarang kad acara dan pilih status kehadiran (*Hadir*, *Wakil*, atau *Tidak Hadir*).
   - **Panel Pentadbir**: Buka tab *Pentadbir* untuk melihat carta KPI, carta donat, dan eksport PDF rasmi ber-QR HMAC!

---

## 🚀 Panduan Deployment Pengeluaran
Sila rujuk dokumen penuh di:
👉 **[Panduan Deployment Portal CEU (docs/DEPLOYMENT_GUIDE.md)](docs/DEPLOYMENT_GUIDE.md)**
