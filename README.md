# PORTAL CEU - Event Management & RSVP System (Program Hala Tuju & FutureLink)
## Unit Pendidikan Kerjaya (UPK), Jabatan Sekolah-Sekolah, Kementerian Pendidikan Brunei Darussalam

Aplikasi web **Full-Stack** (Arsitektur Decoupled: Frontend Statis di GitHub Pages + Backend REST API di Google Apps Script) yang dioptimumkan khusus untuk pengalaman mudah alih responsif pantas tanpa lag, dan sedia dibungkus (*packaged*) menjadi **Mobile APK natif melalui Android Studio**.

---

## 🏗️ Struktur Berkas Projek

```text
├── index.html                  # Antaramuka Pengguna Tunggal (SPA) merangkumi 12 modul lengkap
├── css/
│   └── style.css               # Stil tema rasmi UPK, safe-area, modal zum pelan & animasi
├── js/
│   ├── config.js               # Konfigurasi frontend (Hanya memuatkan GAS_URL - Zero Secrets)
│   ├── i18n.js                 # Enjin Dwibahasa (BM Brunei Standard & English) - Tukar Serta-Merta
│   └── app.js                  # Enjin SPA, Router 0ms, Caching SWR, API Client & Offline Fallback
├── backend/
│   ├── Kode.gs                 # Titik masuk doGet & doPost (Pure JSON ContentService REST API)
│   ├── Auth.gs                 # Token sesi HMAC-SHA256, hash kata laluan iteratif + salt
│   ├── Database.gs             # Operasi batch spreadsheet, CacheX ber-chunking, invalidasi terarah
│   ├── Setup.gs                # setupAppEnvironment() idempoten & pra-muat 52 agensi jemputan
│   ├── DocEngine.gs            # gas-doc-engine: Penjana surat rasmi & verifikasi integriti QR
│   ├── NotifikasiCRM.gs        # gas-notifikasi-wa-crm: Antrean notifikasi Fonnte WA, emel & CRM
│   ├── Migrasi.gs              # gas-migrasi-database: Migrasi spreadsheet selamat & dry-run
│   └── Handlers.gs             # Logik perniagaan terperinci bagi Portal Agensi & Admin CEU
└── PRD_RSVP_CEU.md             # Dokumen Keperluan Produk (PRD Final Lengkap)
```

---

## 🚀 Panduan Pantas Pasang & Deploy (2 Langkah Mudah)

### BAHAGIAN 1: Pemasangan Backend Google Apps Script (GAS)

1. **Buka Google Drive & Buat Projek Apps Script:**
   - Buka [script.google.com](https://script.google.com).
   - Klik **New project**, namakan projek sebagai `PORTAL_CEU_BACKEND`.

2. **Salin Kod Backend:**
   - Salin isi fail-fail dalam folder `backend/` ke editor Apps Script:
     - `Kode.gs`
     - `Auth.gs`
     - `Database.gs`
     - `Setup.gs`
     - `DocEngine.gs`
     - `NotifikasiCRM.gs`
     - `Migrasi.gs`
     - `Handlers.gs`

3. **Jalankan Setup Automatik (Sekali Sahaja):**
   - Pada dropdown fungsi editor, pilih fungsi `setupAppEnvironment`.
   - Klik **Run** (Jalankan) dan berikan kebenaran capaian (*Review Permissions*).
   - Skrip ini akan secara automatik:
     - Menjana folder Google Drive `📁 PORTAL CEU - Event Management & RSVP`.
     - Menjana spreadsheet `🗃️ Database — PORTAL CEU` dengan 52 agensi jemputan dipramuat.
     - Menyimpan `SESSION_SECRET` dan kata laluan awal Admin CEU (`admin_ceu` / `AdminCEU@2026`) secara selamat di **Script Properties**.

4. **Deploy sebagai Web App:**
   - Klik butang **Deploy** (Sebarkan) → **New deployment**.
   - Pilih jenis: **Web app**.
   - Konfigurasi:
     - **Execute as:** `Me (emel anda)`
     - **Who has access:** `Anyone` (Sesiapa sahaja)
   - Klik **Deploy**, salin **Web App URL** yang terhasil (berakhir dengan `/exec`).

5. **Masukkan URL ke Frontend:**
   - Buka fail `js/config.js` di komputer anda.
   - Gantikan nilai `GAS_URL` dengan Web App URL yang baru anda salin.

---

### BAHAGIAN 2: Deploy Frontend ke GitHub Pages (Sesuai Panduan /github-pages-deploy-guide)

1. **Buka Terminal / PowerShell di folder projek:**
   ```bash
   cd "C:\Users\ACER\Desktop\RSVP PHT and FL"
   ```

2. **Inisialisasi Git & Commit:**
   ```bash
   git init
   git add index.html css/ js/ README.md PRD_RSVP_CEU.md
   git commit -m "Initial release: Full-Stack RSVP CEU Portal"
   git branch -M main
   ```

3. **Sambungkan ke Repositori GitHub Anda:**
   ```bash
   git remote add origin https://github.com/USERNAME/rsvp-ceu-portal.git
   git push -u origin main
   ```

4. **Aktifkan GitHub Pages di Pelayar:**
   - Buka repositori anda di GitHub → Klik tab **Settings** → Menu **Pages**.
   - Di bawah **Build and deployment**:
     - Source: `Deploy from a branch`
     - Branch: `main` dan folder `/ (root)`
     - Klik **Save** dan tandakan **Enforce HTTPS**.
   - Laman anda sedia diakses di: `https://USERNAME.github.io/rsvp-ceu-portal/`

---

## 📱 Pembungkusan Menjadi Mobile APK (Android Studio)

Untuk menukar laman web ini menjadi aplikasi Android APK:
1. Buka **Android Studio** → Cipta projek baharu dengan templat **Empty Views Activity**.
2. Di dalam `activity_main.xml`, masukkan komponen `<WebView>`.
3. Di dalam `MainActivity.java`:
   - Aktifkan JavaScript: `webView.getSettings().setJavaScriptEnabled(true);`
   - Aktifkan LocalStorage: `webView.getSettings().setDomStorageEnabled(true);`
   - Halakan URL ke pautan GitHub Pages anda: `webView.loadUrl("https://USERNAME.github.io/rsvp-ceu-portal/");`
   - Sambungkan butang fizikal *Back* telefon:
     ```java
     @Override
     public void onBackPressed() {
         if (webView.canGoBack()) {
             webView.goBack();
         } else {
             super.onBackPressed();
         }
     }
     ```
4. Bina APK melalui menu **Build → Build Bundle(s) / APK(s) → Build APK(s)**.

---

## 🔐 Kredensial Akses Awal Sistem

- **Pentadbir CEU (Admin):**
  - Username: `admin_ceu`
  - Password Awal: `AdminCEU@2026`
- **Agensi Jemputan (Contoh):**
  - Username: `agensi_ubd` (Universiti Brunei Darussalam)
  - Username: `agensi_utb` (Universiti Teknologi Brunei)
  - Username: `agensi_tddb` (Tentera Darat Diraja Brunei)
  - Password Awal: `Agensi@2026` (Boleh ditukar dalam menu tetapan profil)
