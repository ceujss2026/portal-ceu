# PANDUAN DEPLOYMENT PORTAL CEU (BRUNEI DARUSSALAM)
### Unit Pendidikan Kerjaya, Jabatan Sekolah-Sekolah

Dokumen ini merangkumi panduan langkah-demi-langkah bagi pemasangan backend Google Apps Script (GAS) dan penerbitan frontend statik ke **GitHub Pages**.

---

## 🧭 BAHAGIAN 1: PERSATUAN BACKEND GOOGLE APPS SCRIPT (GAS)

### Langkah 1 — Buka Google Apps Script
1. Buka pelayar web dan layari [https://script.google.com](https://script.google.com).
2. Klik butang **New project** (Projek Baharu).
3. Namakan projek anda di sudut kiri atas: `Portal CEU Backend API`.

### Langkah 2 — Salin Kod Backend
1. Padam semua kod sedia ada dalam fail `Code.gs`.
2. Buka fail lokal [backend/Kode.gs](file:///c:/Users/ACER/Desktop/CEU%20SITE/backend/Kode.gs), salin keseluruhannya dan tampal ke dalam fail `Code.gs` di editor Apps Script.
3. Klik ikon **+** di sebelah kanan *Files* → pilih **Script** → namakan `Migrasi.gs`.
4. Buka fail lokal [backend/Migrasi.gs](file:///c:/Users/ACER/Desktop/CEU%20SITE/backend/Migrasi.gs), salin dan tampal ke dalamnya.
5. Klik ikon **Save** (Disket) atau tekan `Ctrl + S`.

### Langkah 3 — Jalankan Fungsi Auto-Setup (Sekali Sahaja)
1. Pada menu fungsi (dropdown di sebelah butang *Run*), pilih fungsi:
   👉 `setupAppEnvironment`
2. Klik butang **Run** (Jalankan).
3. Google akan meminta pengesahan kebenaran (*Review Permissions*):
   - Klik **Review Permissions** → Pilih akaun Google anda.
   - Klik **Advanced** → Klik **Go to Portal CEU Backend API (unsafe)**.
   - Klik **Allow**.
4. Semak *Execution Log*:
   - Sistem akan mencipta folder induk di Google Drive (`📁 PORTAL_CEU_UPK_SYSTEM`), sub-folder, dan fail pangkalan data Google Sheets (`🗃️ Database — Portal CEU UPK Brunei`).
   - Kunci sesi HMAC-SHA256 (`SESSION_SECRET`) dan kata laluan kecemasan (`EMERGENCY_PASS_HASH`) dijana secara automatik dan disimpan rapi dalam **Script Properties**.

### Langkah 4 — Terbitkan Sebagai Web App (REST API)
1. Di penjuru kanan atas editor GAS, klik butang biru **Deploy** → **New deployment**.
2. Klik ikon gear di sebelah kiri *Select type* → pilih **Web app**.
3. Tetapkan konfigurasi berikut (SANGAT PENTING):
   - **Description**: `Versi 1.0.4 Produksi Portal CEU`
   - **Execute as**: `Me (emel anda)`
   - **Who has access**: `Anyone` *(Wajib Anyone agar apl mudah alih & web boleh menghantar data)*.
4. Klik **Deploy**.
5. Salin URL Web App yang tertera (berakhir dengan `/exec`):
   `https://script.google.com/macros/s/AKfycbx.../exec`

### Langkah 5 — Kemas Kini Fail Konfigurasi Frontend
1. Buka fail [js/config.js](file:///c:/Users/ACER/Desktop/CEU%20SITE/js/config.js) di komputer anda.
2. Tampal URL Web App anda ke dalam pemboleh ubah `GAS_URL`:
   ```javascript
   window.APP_CONFIG = {
     GAS_URL: 'https://script.google.com/macros/s/AKfycbx.../exec',
     ...
   };
   ```
3. Simpan fail (`Ctrl + S`).

---

## 🚀 BAHAGIAN 2: DEPLOY FRONTEND KE GITHUB PAGES

Sesuai panduan `github-pages-deploy-guide`, proses ini dijalankan terus melalui terminal Git untuk memastikan struktur folder `css/` dan `js/` kekal utuh.

### Langkah 1 — Sahkan Git Terpasang
Buka PowerShell atau Command Prompt, lalu taip:
```bash
git --version
```

### Langkah 2 — Buat Repositori Baharu di GitHub
1. Buka [https://github.com/new](https://github.com/new).
2. Tetapkan:
   - **Repository name**: `portal-ceu` (atau nama pilihan anda)
   - **Public**: Wajib pilih *Public* untuk GitHub Pages percuma.
   - **JANGAN** centang *Add a README file*, *.gitignore*, atau *license*.
3. Klik **Create repository**.

### Langkah 3 — Tolak Fail ke GitHub Melalui Terminal
Di dalam folder projek `c:\Users\ACER\Desktop\CEU SITE`, jalankan arahan berikut satu persatu:

```bash
cd "c:\Users\ACER\Desktop\CEU SITE"

# Inisialisasi Git
git init

# Tambah semua fail
git add .

# Buat commit pertama
git commit -m "Initial commit Portal CEU UPK Brunei"

# Namakan branch sebagai main
git branch -M main

# Sambungkan ke repositori GitHub anda (Gantikan USERNAME dengan username GitHub anda)
git remote add origin https://github.com/USERNAME/portal-ceu.git

# Hantar ke GitHub
git push -u origin main
```

> **Nota Autentikasi GitHub:**
> Jika terminal meminta password, gunakan **Personal Access Token (PAT)** anda (yang bermula dengan `ghp_...`), bukan password akaun biasa.
> Token boleh dijana di: `GitHub → Settings → Developer Settings → Personal access tokens → Tokens (classic) → Centang 'repo'`.

### Langkah 4 — Aktifkan GitHub Pages
1. Di halaman repositori GitHub anda, klik tab **Settings**.
2. Pada menu sebelah kiri, klik **Pages**.
3. Di bahagian **Build and deployment**:
   - **Source**: `Deploy from a branch`
   - **Branch**: Pilih `main` dan folder `/ (root)`
   - Klik **Save**.
4. Tandakan kotak **Enforce HTTPS**.
5. Tunggu 1–2 minit, laman anda akan bersiaran secara langsung di:
   `https://USERNAME.github.io/portal-ceu/`

---

## 📱 BAHAGIAN 3: INTEGRASI ANDROID APK & BIOMETRIK

Aplikasi ini siap sedia untuk dibungkus (*wrapped*) ke dalam format fail APK Android menggunakan teknologi WebView moden seperti Capacitor, Cordova, atau Android Studio WebView Native:

1. **Jambatan Biometrik Native (`window.CEUAndroid`):**
   - Apabila dijalankan dalam APK, aplikasi akan mengesan `window.CEUAndroid.promptBiometric()`.
   - Token sesi HMAC 30 hari disimpan secara selamat dalam **Android Keystore** (TEE/Secure Element) dan tidak terdedah kepada pelayar awam.
2. **Fallback Web:**
   - Sekiranya dibuka di pelayar biasa (Chrome / Safari), aplikasi menyokong piawaian **WebAuthn** tempatan dengan fallback ke log masuk Kod OTP Emel rasmi kementerian.
