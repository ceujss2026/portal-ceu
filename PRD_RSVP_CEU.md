# DOKUMEN KEPERLUAN PRODUK (PRD FINAL - KEMASKINI)
## **Sistem Pengurusan Acara & RSVP CEU (Program Hala Tuju & FutureLink)**
*Event Management & RSVP Mobile Application — Android Studio APK & Google Apps Script Backend*

---

### **1. Ringkasan Eksekutif**
Aplikasi **RSVP CEU** ialah sistem pengurusan acara dan pengesahan kehadiran (*RSVP*) mudah alih yang dibangunkan khusus untuk **Unit Pendidikan Kerjaya (UPK / CEU), Jabatan Sekolah-Sekolah**. Aplikasi ini direka bentuk berasaskan seni bina aplikasi web responsif (*Mobile-First Single Page Application*) yang dioptimumkan khas untuk dibungkus (*packaged*) menjadi **Mobile APK natif melalui Android Studio (WebView / TWA)**.

Sistem ini membolehkan **52 Agensi dan Institusi Jemputan Rasmi** mengesahkan kehadiran, membuat permohonan logistik sekolah (meja, kerusi, penyambung elektrik/plug, dan jumlah wakil), serta melihat takwim tahunan acara (*Program Hala Tuju, FutureLink, & Taklimat Tahunan Agensi*). Sistem berkomunikasi dan menyapa secara langsung **berdasarkan Nama Agensi** (bukan nama individu fokal person).

Di samping itu, sistem membolehkan pihak Admin CEU memuat naik **Peta/Pelan Lantai Sekolah (School/Hall Layout Map)** dan menyediakan **Seksyen Khas Panduan & Lokasi Tempat Letak Kereta (Agency Parking Location & Guide)** untuk kemudahan pihak agensi semasa menghadiri program di sekolah.

---

### **2. Tujuan Produk & Nilai Bisnis**
* **Pengurusan Berpusat untuk 52 Agensi Jemputan:** Menghapuskan borang manual dan mesej berselerak bagi 52 agensi rakan strategik kerajaan, swasta, dan institusi pengajian tinggi.
* **Orientasi Lokasi & Logistik Tepat:** Agensi dapat melihat dengan jelas susun atur meja/booth di dewan sekolah serta lokasi tempat letak kereta (*parking zone*) khusus yang ditetapkan sebelum tiba di sekolah.
* **Perancangan Logistik Sekolah Tepat Waktu:** Memberikan data awal inventori (meja, kerusi, plug) kepada pihak sekolah dan penganjur sebelum hari acara berlangsung bagi mengelakkan kekurangan kelengkapan.
* **Pengalaman Pengguna Mesra Mudah Alih (Native Look & Feel):** Aplikasi dipasang terus pada telefon pintar wakil agensi dengan navigasi pantas, sokongan mod dwibahasa (BM Brunei / EN), dan pemberitahuan automatik H-1.

---

### **3. Pengguna Sasaran & Matriks Hak Akses (RBAC)**

| Peranan (*Role*) | Sasaran Pengguna | Kaedah Log Masuk | Kebenaran & Hak Akses (*Permissions*) |
| :--- | :--- | :--- | :--- |
| **Super Admin / Pentadbir CEU** | Pegawai Unit Pendidikan Kerjaya (UPK) | Kredensial Khas Admin | • Akses penuh Papan Pemuka Pentadbir (*Dashboard*).<br>• Cipta dan kemaskini acara, termasuk **muat naik Pelan Sekolah & Peta Tempat Letak Kereta**.<br>• Jana dan agih akaun agensi (*Username & Password*) berasaskan Nama Agensi.<br>• Pantau agregat logistik & muat turun laporan (CSV/Excel/PDF). |
| **Pengguna Agensi Jemputan** | Wakil Rasmi Agensi Jemputan (52 Agensi) | Kredensial Tetap Agensi | • Akses Portal Agensi disapa mengikut **Nama Agensi**.<br>• Lihat Takwim & Butiran Acara, Pautan GPS, **Pelan Sekolah/Dewan, & Lokasi Parking**.<br>• Isi & kemaskini borang RSVP dan keperluan logistik.<br>• Beralih bahasa antaramuka (BM Brunei / EN). |

---

### **4. Senarai Master 52 Agensi & Institusi Jemputan**

Sistem ini dipramuat (*pre-seeded*) dengan akaun bagi agensi-agensi jemputan rasmi berikut:

```text
1.  Jabatan Pengurusan Biasiswa
2.  Majlis Kebangsaan Pengiktirafan Kelulusan
3.  Jabatan Pengajian Tinggi
4.  Jabatan Pengurusan Pendidik
5.  Universiti Brunei Darussalam (UBD)
6.  Universiti Teknologi Brunei (UTB)
7.  Universiti Islam Sultan Sharif Ali (UNISSA)
8.  Kolej Universiti Perguruan Ugama Seri Begawan (KUPU SB)
9.  Politeknik Brunei
10. Institut Pendidikan Teknikal Brunei (IBTE)
11. Cosmopolitan College of Commerce and Technology
12. Kemuda Institute
13. Kolej IGS
14. Laksamana College of Business (LCB)
15. Micronet International College
16. HADTech College
17. JPMC College of Health Sciences
18. Pejabat Pengambilan Jabatan Arah Keanggotaan, ABDB
19. Tentera Darat Diraja Brunei (TDDB)
20. Tentera Udara Diraja Brunei (TUDB)
21. Tentera Laut Diraja Brunei (TLDB)
22. Pusat Optima Kecergasan Tentera
23. Polis Tentera
24. Jabatanarah Agama ABDB (JAMA'AT)
25. Bahagian Biasiswa, Kementerian Pertahanan
26. Jabatan Penjara
27. Pasukan Polis Diraja Brunei (PPDB)
28. Jabatan Bomba dan Penyelamat (JBP)
29. Kementerian Kesihatan
30. Jabatan Kajicuaca Brunei Darussalam
31. Jabatan Kemajuan Pelancongan
32. Jabatan Pertanian dan Agrimakanan, MEPR
33. Jabatan Imigresen dan Pendaftaran Kebangsaan, KHEDN
34. Royal Brunei Airlines (RB)
35. Pusat Pembangunan Belia (PPB)
36. Program Khidmat Bakti Negara (PKBN)
37. Aegis Secure Solutions Sdn Bhd
38. Brunei Institutes of Certified Public Accountants (BICPA)
39. Hibiscus EP (Brunei) B.V (HEB)
40. DST Sdn Bhd
41. NOVO Sdn Bhd
42. BFI Sdn Bhd
43. Imagine Sdn Bhd
44. Baiduri Bank
45. Muara Port Company
46. Findlay Sdn Bhd (Education Services Agency)
47. HRDS (Education Services Agency)
48. Serikandi Group Of Companies
49. Uniklearn
50. Hengyi Industries Sdn Bhd
51. Agensi Jemputan Tambahan 1 (Slot Simpanan CEU)
52. Agensi Jemputan Tambahan 2 (Slot Simpanan CEU)
```

---

### **5. Arsitektur Data & Integrasi Google Workspace**

#### **A. Skema Pangkalan Data (Google Sheets)**

1. **Sheet `Agensi_Users`**
   * `Agensi_ID` *(PK, cth: AG-01 hingga AG-52)*
   * `Nama_Agensi` *(Identiti utama sistem, cth: "Universiti Brunei Darussalam")*
   * `Username` *(cth: agensi_ubd)*
   * `Password_Hash` *(Tersulit / Sandi selamat)*
   * `No_Telefon_Agensi` *(No telefon rasmi pejabat/kaunter)*
   * `Emel_Rasmi` *(Emel rasmi agensi untuk notifikasi H-1)*
   * `Status_Akaun` *(Aktif / Digantung)*

2. **Sheet `Events`**
   * `Event_ID` *(PK, cth: EVT-2026-01)*
   * `Kategori_Program` *(Hala Tuju / FutureLink / Taklimat Tahunan)*
   * `Nama_Acara` *(cth: Pameran Pendidikan Hala Tuju Zon Belait)*
   * `Tarikh_Mula` & `Tarikh_Tamat` *(YYYY-MM-DD)*
   * `Masa` *(cth: 08:00 - 16:30)*
   * `Tempat_Venue` *(cth: Dewan Serbaguna Pusat Tingkatan Enam)*
   * `Pautan_GPS_Maps` *(Pautan terus ke Google Maps)*
   * `Pelan_Sekolah_URL` *(Pautan imej/fail pelan lantai dewan & sekolah)*
   * `Pelan_Parking_URL` *(Pautan imej/peta lokasi tempat letak kereta agensi)*
   * `Panduan_Parking` *(Teks arahan tempat letak kereta: cth. "Blok C, bersebelahan padang")*
   * `Catatan_Khas` *(Nota pakaian rasmi, waktu persediaan booth)*
   * `Status_Acara` *(Aktif / Selesai / Draf)*

3. **Sheet `RSVP_Logistik`**
   * `RSVP_ID` *(PK, cth: RSVP-2026-001)*
   * `Event_ID` *(FK ke sheet Events)*
   * `Agensi_ID` *(FK ke sheet Agensi_Users)*
   * `Nama_Agensi` *(Nama agensi pemohon)*
   * `Status_RSVP` *(Hadir / Tidak Hadir / Lantik Wakil)*
   * `Bil_Meja` *(Integer)*
   * `Bil_Kerusi` *(Integer)*
   * `Bil_Plug` *(Penyambung elektrik / extension)*
   * `Jumlah_Wakil` *(Bilangan staf agensi yang hadir)*
   * `Keperluan_Lain` *(Teks terbuka: cth. ruang poster tambahan)*
   * `Tarikh_Hantar` & `Tarikh_Kemaskini` *(Timestamp ISO)*

4. **Sheet `Notifikasi_Logs`**
   * `Log_ID`, `Event_ID`, `Agensi_ID`, `Nama_Agensi`, `Jenis_Notis`, `Status_Hantar`, `Timestamp`.

#### **B. Integrasi Workspace & Folder Google Drive**
* **Folder Drive `Pelan_Acara_Sekolah`:** Tempat penyimpanan imej/fail pelan lantai dewan sekolah dan peta zon letak kereta yang dimuat naik oleh Admin.
* **Folder Drive `Laporan_Arkib_PDF`:** Tempat simpanan arkib laporan kehadiran berformat PDF.
* **MailApp / GmailApp:** Trigger harian jam 08:00 pagi menyemak acara `H-1` dan menghantar peringatan automatik ke emel rasmi agensi.

---

### **6. Persyaratan Fungsional & Ciri-Ciri Utama**

#### **A. Komunikasi Berasaskan Nama Agensi (Agency-Centric Greeting)**
* Semua sapaan antaramuka, pemberitahuan, dan e-mel rasmi dialamatkan terus kepada **Nama Agensi** (contoh: *"Selamat Datang, Universiti Brunei Darussalam"* atau *"Universiti Teknologi Brunei telah mengesahkan kehadiran"*), tanpa merujuk kepada nama individu fokal person.

#### **B. Modul Muat Naik & Paparan Pelan Sekolah (School Floor Plan & Layout)**
* **Admin Side:** Admin CEU boleh memuat naik gambar pelan sekolah/dewan (JPG, PNG, PDF) semasa mencipta atau mengemaskini acara.
* **Agency Side:** Wakil agensi boleh membuka dan membesarkan (*pinch-to-zoom*) gambar pelan susun atur dewan sekolah untuk mengenal pasti kedudukan meja/booth pameran mereka.

#### **C. Seksyen Khas Lokasi & Panduan Tempat Letak Kereta (Agency Parking Section)**
* Seksyen khusus di dalam Butiran Acara bertajuk **"Panduan & Lokasi Tempat Letak Kereta Agensi"**.
* Memaparkan:
  1. Imej peta kawasan letak kereta yang dikhaskan untuk agensi jemputan.
  2. Arahan khusus laluan masuk pagar sekolah dan pintu masuk ke dewan.
  3. Pautan navigasi GPS ke kawasan tempat letak kereta berkenaan.

#### **D. Modul Borang RSVP & Permohonan Logistik**
* Borang ringkas dengan *stepper counters* `+` / `-`:
  * Bilangan Meja Diperlukan
  * Bilangan Kerusi Diperlukan
  * Bilangan Penyambung Elektrik (*Extension Plug*)
  * Jumlah Wakil Agensi Hadir
  * Keperluan Logistik Khas

#### **E. Papan Pemuka Pentadbir & Eksport Laporan**
* Agregat automatik keperluan dewan sekolah (Jumlah keseluruhan Meja, Kerusi, dan Plug yang diminta oleh semua agensi).
* Butang muat turun pantas: **Eksport CSV**, **Eksport Excel (.xlsx)**, dan **Cetak PDF Laporan Rasmi**.

---

### **7. Spesifikasi Khusus APK Android Studio**

* **Viewport:** `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">`
* **Safe-Area Insets:** Sokongan penuh takuk skrin (*notch*) dan bar navigasi bawah telefon pintar.
* **Pelan Imej Interaktif:** Paparan imej pelan sekolah dan peta letak kereta menyokong paparan penuh (*fullscreen modal*) dengan kawalan zum mesra sentuhan (*touch zoom*).
* **Hardware Back Button:** Butang *Back* telefon menutup modal/pelan tanpa mengeluarkan pengguna daripada aplikasi.
* **External GPS Intent:** Pautan GPS membuka aplikasi Google Maps secara natif.

---

### **8. Spesifikasi Visual & UI/UX (Mengikut Logo UPK & Portal CEU)**

* **Primary Deep Teal:** `#167F77` (Pengepala gradien atas `#1D9A8F` hingga `#0C5C55`).
* **Secondary Ocean Blue:** `#1B82A8` (Warna bulatan rasmi logo UPK).
* **Accent Gold / Amber:** `#F59E0B` (Butang tindakan utama "Sahkan Kehadiran (RSVP)", serlah tarikh kalendar).
* **Coral Red:** `#EF4444` (Lencana tarikh tamat tempoh dan butang log keluar).
* **Surface Card:** `#FFFFFF` bersih dengan sudut melengkung `radius: 16px - 20px`.
* **Bottom Navigation Bar (5 Tab):**
  1. `Utama` (Sapaan Nama Agensi, takwim tarikh, status RSVP)
  2. `RSVP` (Borang pengesahan logistik)
  3. `Arkib` (Takwim tahunan Program Hala Tuju, FutureLink, Taklimat Agensi)
  4. `Notifikasi` (Pemberitahuan H-1 dan kemaskini dewan)
  5. `Profil` (Maklumat akaun agensi, suis bahasa BM/EN, log keluar)

---

### **9. Pelan Pelaksanaan & Pengujian**

1. **Fasa 1: Backend GAS & Pra-muat 52 Agensi**
   * Sediakan spreadsheet dengan 52 nama agensi yang telah disenaraikan.
   * Pasang folder Google Drive untuk storan fail pelan sekolah dan peta tempat letak kereta.
2. **Fasa 2: Pembangunan Frontend Mobile-First**
   * Bina antaramuka mesra mudah alih dengan paparan pelan sekolah dan seksyen parking agensi.
   * Lengkapkan suis dwibahasa (BM/EN) dan borang permohonan logistik.
3. **Fasa 3: Papan Pemuka Admin & Pengesahan Integrasi**
   * Uji muat naik fail pelan dewan/parking oleh Admin CEU.
   * Uji kiraan agregat logistik sekolah dan fungsi eksport CSV/Excel/PDF.
4. **Fasa 4: Pembungkusan Android Studio APK**
   * Uji pada peranti Android fizikal untuk memastikan kelancaran WebView, navigasi kembali, dan paparan zum pelan peta.

---

🎨 **Tahapan Khusus: Penentuan Visual UI/UX**
1. **Unggah Referensi:** Telah diselaraskan mengikut logo rasmi UPK dan tangkapan skrin aplikasi Portal CEU.
2. **Jika Ingin Menjana Prototaip Visual Tambahan di Google Stitch:**
   - Salin seluruh teks dokumen PRD Final yang dikemaskini ini.
   - Buka **Google Stitch**, lalu tempelkan teks PRD ini ke dalamnya.
   - Unduh hasil pratinjau (*high-fidelity prototype*) yang dihasilkan untuk dijadikan rujukan visual akhir.
