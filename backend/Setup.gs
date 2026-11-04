/**
 * ============================================================================
 * MODUL SETUP PERSEKITARAN & PRA-MUAT 52 AGENSI (Setup.gs)
 * Menjana Folder Google Drive, Spreadsheet Lengkap, & Skema Idempoten
 * ============================================================================
 */

/**
 * 52 Institusi & Agensi Jemputan Rasmi Brunei Darussalam
 */
const MASTER_52_AGENSI = [
  { no: 1,  kod: 'AG-01', nama: 'Jabatan Pengurusan Biasiswa', user: 'agensi_biasiswa', kategori: 'Kementerian & Jabatan Kerajaan', emel: 'biasiswa@moe.gov.bn', tel: '+673 2381224' },
  { no: 2,  kod: 'AG-02', nama: 'Majlis Kebangsaan Pengiktirafan Kelulusan', user: 'agensi_mkpk', kategori: 'Kementerian & Jabatan Kerajaan', emel: 'mkpk@moe.gov.bn', tel: '+673 2381235' },
  { no: 3,  kod: 'AG-03', nama: 'Jabatan Pengajian Tinggi', user: 'agensi_jpt', kategori: 'Kementerian & Jabatan Kerajaan', emel: 'jpt@moe.gov.bn', tel: '+673 2381288' },
  { no: 4,  kod: 'AG-04', nama: 'Jabatan Pengurusan Pendidik', user: 'agensi_jpp', kategori: 'Kementerian & Jabatan Kerajaan', emel: 'jpp@moe.gov.bn', tel: '+673 2381266' },
  { no: 5,  kod: 'AG-05', nama: 'Universiti Brunei Darussalam', user: 'agensi_ubd', kategori: 'Institusi Pengajian Tinggi (IPT)', emel: 'fokal@ubd.edu.bn', tel: '+673 2463001' },
  { no: 6,  kod: 'AG-06', nama: 'Universiti Teknologi Brunei', user: 'agensi_utb', kategori: 'Institusi Pengajian Tinggi (IPT)', emel: 'fokal@utb.edu.bn', tel: '+673 2461020' },
  { no: 7,  kod: 'AG-07', nama: 'UNISSA', user: 'agensi_unissa', kategori: 'Institusi Pengajian Tinggi (IPT)', emel: 'fokal@unissa.edu.bn', tel: '+673 2462000' },
  { no: 8,  kod: 'AG-08', nama: 'Kolej Universiti Perguruan Ugama Seri Begawan', user: 'agensi_kupusb', kategori: 'Institusi Pengajian Tinggi (IPT)', emel: 'fokal@kupu-sb.edu.bn', tel: '+673 2236277' },
  { no: 9,  kod: 'AG-09', nama: 'Politeknik Brunei', user: 'agensi_pb', kategori: 'Institusi Pengajian Tinggi (IPT)', emel: 'fokal@pb.edu.bn', tel: '+673 2234466' },
  { no: 10, kod: 'AG-10', nama: 'Institut Pendidikan Teknikal Brunei (IBTE)', user: 'agensi_ibte', kategori: 'Institusi Pendidikan Teknikal', emel: 'fokal@ibte.edu.bn', tel: '+673 2422555' },
  { no: 11, kod: 'AG-11', nama: 'Cosmopolitan College of Commerce and Technology', user: 'agensi_cosmopolitan', kategori: 'Kolej Swasta', emel: 'info@cosmopolitan.edu.bn', tel: '+673 2445888' },
  { no: 12, kod: 'AG-12', nama: 'Kemuda Institute', user: 'agensi_kemuda', kategori: 'Kolej Swasta', emel: 'enquiry@kemudainstitute.com', tel: '+673 2448883' },
  { no: 13, kod: 'AG-13', nama: 'Kolej IGS', user: 'agensi_kolejigs', kategori: 'Kolej Swasta', emel: 'info@kolejigs.edu.bn', tel: '+673 2235661' },
  { no: 14, kod: 'AG-14', nama: 'Laksamana College of Business', user: 'agensi_lcb', kategori: 'Kolej Swasta', emel: 'enquiries@lcb.edu.bn', tel: '+673 2238888' },
  { no: 15, kod: 'AG-15', nama: 'Micronet International College', user: 'agensi_micronet', kategori: 'Kolej Swasta', emel: 'mic@micronet.com.bn', tel: '+673 2451133' },
  { no: 16, kod: 'AG-16', nama: 'HADTech College', user: 'agensi_hadtech', kategori: 'Kolej Swasta', emel: 'admin@hadtech.edu.bn', tel: '+673 2341234' },
  { no: 17, kod: 'AG-17', nama: 'JPMC College of Health Sciences', user: 'agensi_jpmcchs', kategori: 'Kolej Kesihatan & Perubatan', emel: 'admissions@jpmcchs.edu.bn', tel: '+673 2611433' },
  { no: 18, kod: 'AG-18', nama: 'Pejabat Pengambilan Jabatan Arah Keanggotaan, ABDB', user: 'agensi_jak_abdb', kategori: 'Keselamatan & Pertahanan', emel: 'recruitment@mindef.gov.bn', tel: '+673 2386000' },
  { no: 19, kod: 'AG-19', nama: 'Tentera Darat Diraja Brunei', user: 'agensi_tddb', kategori: 'Keselamatan & Pertahanan', emel: 'tddb@mindef.gov.bn', tel: '+673 2386111' },
  { no: 20, kod: 'AG-20', nama: 'Tentera Udara Diraja Brunei', user: 'agensi_tudb', kategori: 'Keselamatan & Pertahanan', emel: 'tudb@mindef.gov.bn', tel: '+673 2386222' },
  { no: 21, kod: 'AG-21', nama: 'Tentera Laut Diraja Brunei', user: 'agensi_tldb', kategori: 'Keselamatan & Pertahanan', emel: 'tldb@mindef.gov.bn', tel: '+673 2772555' },
  { no: 22, kod: 'AG-22', nama: 'Pusat Optima Kecergasan Tentera', user: 'agensi_pokt', kategori: 'Keselamatan & Pertahanan', emel: 'pokt@mindef.gov.bn', tel: '+673 2386333' },
  { no: 23, kod: 'AG-23', nama: 'Polis Tentera', user: 'agensi_polistentera', kategori: 'Keselamatan & Pertahanan', emel: 'pt@mindef.gov.bn', tel: '+673 2386444' },
  { no: 24, kod: 'AG-24', nama: 'Jabatanarah Agama ABDB', user: 'agensi_jamat', kategori: 'Keselamatan & Pertahanan', emel: 'jamat@mindef.gov.bn', tel: '+673 2386555' },
  { no: 25, kod: 'AG-25', nama: 'Bahagian Biasiswa, Kementerian Pertahanan', user: 'agensi_biasiswa_mindef', kategori: 'Keselamatan & Pertahanan', emel: 'scholarship@mindef.gov.bn', tel: '+673 2386666' },
  { no: 26, kod: 'AG-26', nama: 'Jabatan Penjara', user: 'agensi_penjara', kategori: 'Penguatkuasaan & Keselamatan', emel: 'penjara@khedn.gov.bn', tel: '+673 2661234' },
  { no: 27, kod: 'AG-27', nama: 'Pasukan Polis Diraja Brunei', user: 'agensi_ppdb', kategori: 'Penguatkuasaan & Keselamatan', emel: 'pro@police.gov.bn', tel: '+673 2223951' },
  { no: 28, kod: 'AG-28', nama: 'Jabatan Bomba dan Penyelamat', user: 'agensi_jbp', kategori: 'Penyelamat & Keselamatan', emel: 'jbp@khedn.gov.bn', tel: '+673 2380444' },
  { no: 29, kod: 'AG-29', nama: 'Kementerian Kesihatan', user: 'agensi_moh', kategori: 'Kementerian & Kesihatan', emel: 'corp_comms@moh.gov.bn', tel: '+673 2381640' },
  { no: 30, kod: 'AG-30', nama: 'Jabatan Kajicuaca Brunei Darussalam', user: 'agensi_kajicuaca', kategori: 'Kementerian & Jabatan Kerajaan', emel: 'met@transport.gov.bn', tel: '+673 2383888' },
  { no: 31, kod: 'AG-31', nama: 'Jabatan Kemajuan Pelancongan', user: 'agensi_pelancongan', kategori: 'Kementerian & Jabatan Kerajaan', emel: 'tourism@mepr.gov.bn', tel: '+673 2382822' },
  { no: 32, kod: 'AG-32', nama: 'Jabatan Pertanian dan Agrimakanan, MEPR', user: 'agensi_pertanian', kategori: 'Kementerian & Jabatan Kerajaan', emel: 'agriculture@mepr.gov.bn', tel: '+673 2388000' },
  { no: 33, kod: 'AG-33', nama: 'Jabatan Imigresen dan Pendaftaran Kebangsaan, KHEDN', user: 'agensi_imigresen', kategori: 'Kementerian & Jabatan Kerajaan', emel: 'info@immigration.gov.bn', tel: '+673 2383106' },
  { no: 34, kod: 'AG-34', nama: 'Royal Brunei Airlines', user: 'agensi_rb', kategori: 'Syarikat Penerbangan Nasional & GLC', emel: 'corporate@flyroyalbrunei.com', tel: '+673 2212222' },
  { no: 35, kod: 'AG-35', nama: 'Pusat Pembangunan Belia', user: 'agensi_ppb', kategori: 'Latihan & Belia', emel: 'ppb@kkbs.gov.bn', tel: '+673 2393681' },
  { no: 36, kod: 'AG-36', nama: 'Program Khidmat Bakti Negara (PKBN)', user: 'agensi_pkbn', kategori: 'Latihan & Belia', emel: 'pkbn@kkbs.gov.bn', tel: '+673 2340033' },
  { no: 37, kod: 'AG-37', nama: 'Aegis Secure Solutions Sdn Bhd', user: 'agensi_aegis', kategori: 'Syarikat Swasta & Keselamatan', emel: 'enquiries@aegis.com.bn', tel: '+673 2420000' },
  { no: 38, kod: 'AG-38', nama: 'Brunei Institutes of Certified Public Accountants (BICPA)', user: 'agensi_bicpa', kategori: 'Badan Profesional', emel: 'bicpabrunei@gmail.com', tel: '+673 2235333' },
  { no: 39, kod: 'AG-39', nama: 'Hibiscus EP (Brunei) B.V (HEB)', user: 'agensi_hibiscus', kategori: 'Industri Minyak & Gas', emel: 'info@hibiscuspetroleum.com', tel: '+673 2239000' },
  { no: 40, kod: 'AG-40', nama: 'DST Sdn Bhd', user: 'agensi_dst', kategori: 'Telekomunikasi & GLC', emel: 'care@dst.com.bn', tel: '+673 151' },
  { no: 41, kod: 'AG-41', nama: 'NOVO Sdn Bhd', user: 'agensi_novo', kategori: 'Syarikat Swasta', emel: 'contact@novo.com.bn', tel: '+673 2452222' },
  { no: 42, kod: 'AG-42', nama: 'BFI Sdn Bhd', user: 'agensi_bfi', kategori: 'Industri & Kimia', emel: 'info@bfi.com.bn', tel: '+673 2773333' },
  { no: 43, kod: 'AG-43', nama: 'Imagine Sdn Bhd', user: 'agensi_imagine', kategori: 'Telekomunikasi & GLC', emel: 'talktous@imagine.com.bn', tel: '+673 111' },
  { no: 44, kod: 'AG-44', nama: 'Baiduri Bank', user: 'agensi_baiduri', kategori: 'Perbankan & Kewangan', emel: 'enquiry@baiduri.com', tel: '+673 2449666' },
  { no: 45, kod: 'AG-45', nama: 'Muara Port Company', user: 'agensi_muaraport', kategori: 'Logistik & Pelabuhan', emel: 'info@muaraport.com', tel: '+673 2770222' },
  { no: 46, kod: 'AG-46', nama: 'Findlay Sdn Bhd (Education Services Agency)', user: 'agensi_findlay', kategori: 'Agensi Perkhidmatan Pendidikan', emel: 'enquiries@findlay.com.bn', tel: '+673 2428658' },
  { no: 47, kod: 'AG-47', nama: 'HRDS (Education Services Agency)', user: 'agensi_hrds', kategori: 'Agensi Perkhidmatan Pendidikan', emel: 'admin@hrds.com.bn', tel: '+673 2232888' },
  { no: 48, kod: 'AG-48', nama: 'Serikandi Group Of Companies', user: 'agensi_serikandi', kategori: 'Syarikat Korporat & Katering', emel: 'info@serikandi.com', tel: '+673 3334333' },
  { no: 49, kod: 'AG-49', nama: 'Uniklearn', user: 'agensi_uniklearn', kategori: 'Latihan Khas & Kebajikan', emel: 'contact@uniklearn.com', tel: '+673 2345566' },
  { no: 50, kod: 'AG-50', nama: 'Hengyi Industries Sdn Bhd', user: 'agensi_hengyi', kategori: 'Petrokimia & Industri Berat', emel: 'hr@hengyi-industries.com', tel: '+673 2778888' },
  { no: 51, kod: 'AG-51', nama: 'Agensi Jemputan Tambahan 1 (Slot Simpanan)', user: 'agensi_extra1', kategori: 'Slot Simpanan CEU', emel: 'ceu@moe.gov.bn', tel: '+673 2381224' },
  { no: 52, kod: 'AG-52', nama: 'Agensi Jemputan Tambahan 2 (Slot Simpanan)', user: 'agensi_extra2', kategori: 'Slot Simpanan CEU', emel: 'ceu@moe.gov.bn', tel: '+673 2381224' }
];

/**
 * FUNGSI SETUP UTAMA (Jalankan sekali daripada Apps Script Editor)
 * Sifat: Idempoten (Aman dijalankan berulang tanpa merosakkan data sedia ada)
 */
function setupAppEnvironment() {
  const APP_NAME = 'PORTAL CEU - Event Management & RSVP';
  Logger.log('🚀 Memulakan persediaan persekitaran ' + APP_NAME + '...');

  // 1. Dapatkan atau Cipta Struktur Folder Google Drive
  let rootFolder;
  const existingRootId = prop_('ROOT_FOLDER_ID');
  if (existingRootId) {
    try { rootFolder = DriveApp.getFolderById(existingRootId); } catch(e) {}
  }
  if (!rootFolder) {
    rootFolder = DriveApp.createFolder('📁 ' + APP_NAME);
    setProp_('ROOT_FOLDER_ID', rootFolder.getId());
  }

  const subfolders = [
    { key: 'FOLDER_PELAN_SEKOLAH', name: '📂 Pelan_Dewan_Sekolah' },
    { key: 'FOLDER_PETA_PARKING',  name: '📂 Peta_Parking_Agensi' },
    { key: 'FOLDER_DOKUMEN_PDF',   name: '📂 Dokumen_Surat_PDF' },
    { key: 'FOLDER_LAPORAN_ARKIB', name: '📂 Laporan_Arkib_PDF' }
  ];

  subfolders.forEach(sf => {
    let folder;
    const fid = prop_(sf.key);
    if (fid) {
      try { folder = DriveApp.getFolderById(fid); } catch(e) {}
    }
    if (!folder) {
      folder = rootFolder.createFolder(sf.name);
      setProp_(sf.key, folder.getId());
    }
  });

  // 2. Dapatkan atau Cipta Google Spreadsheet Database
  let ss;
  const existingSsId = prop_('SPREADSHEET_ID');
  if (existingSsId) {
    try { ss = SpreadsheetApp.openById(existingSsId); } catch(e) {}
  }
  if (!ss) {
    ss = SpreadsheetApp.create('🗃️ Database — ' + APP_NAME);
    DriveApp.getFileById(ss.getId()).moveTo(rootFolder);
    setProp_('SPREADSHEET_ID', ss.getId());
  }

  // 3. Bangkitkan Rahsia Sistem Utama
  secret_(); // Generate SESSION_SECRET

  if (!prop_('ADMIN_SALT')) {
    const adminSalt = Utilities.getUuid();
    const adminPassAwal = 'AdminCEU@2026';
    setProps_({
      ADMIN_USER: 'admin_ceu',
      ADMIN_SALT: adminSalt,
      ADMIN_PASS_HASH: hashPass_(adminPassAwal, adminSalt),
      DEFAULT_SALT: 'CEU-SALT-2026'
    });
    Logger.log('🔐 KREDENSIAL PENTADBIR CEU AWAL:');
    Logger.log('   Username: admin_ceu');
    Logger.log('   Password: ' + adminPassAwal);
  }

  // 4. Inisialisasi Sheet-Sheet Lengkap
  setupSheets_(ss);

  Logger.log('✅ Setup berjaya diselesaikan!');
  Logger.log('   Spreadsheet URL: ' + ss.getUrl());
  Logger.log('   Root Folder ID : ' + rootFolder.getId());
}

/**
 * Penyediaan lembaran kerja berserta skema data
 */
function setupSheets_(ss) {
  const defaultSalt = prop_('DEFAULT_SALT', 'CEU-SALT-2026');
  const passAwalAgensi = 'Agensi@2026'; // Kata laluan awal seragam untuk penetapan pertama
  const hashAwalAgensi = hashPass_(passAwalAgensi, defaultSalt);

  // A. Sheet Agensi_Users (52 Agensi Pra-muat)
  let shAgensi = ss.getSheetByName('Agensi_Users');
  if (!shAgensi) {
    shAgensi = ss.insertSheet('Agensi_Users');
    shAgensi.appendRow(['Agensi_ID', 'Nama_Agensi', 'Username', 'Password_Hash', 'Salt', 'Kategori', 'Emel_Rasmi', 'No_Telefon_Agensi', 'Status_Akaun', 'Tarikh_Didaftar']);

    const rows = MASTER_52_AGENSI.map(a => [
      a.kod,
      a.nama,
      a.user,
      hashAwalAgensi,
      defaultSalt,
      a.kategori,
      a.emel,
      a.tel,
      'Aktif',
      Utilities.formatDate(new Date(), 'GMT+8', 'yyyy-MM-dd HH:mm:ss')
    ]);
    shAgensi.getRange(2, 1, rows.length, 10).setValues(rows);
    Logger.log('   ✓ 52 Agensi berjaya dipramuat ke dalam Agensi_Users.');
  }

  // B. Sheet Events (Takwim Acara Tahunan)
  let shEvents = ss.getSheetByName('Events');
  if (!shEvents) {
    shEvents = ss.insertSheet('Events');
    shEvents.appendRow([
      'Event_ID', 'Kategori_Program', 'Nama_Acara', 'Tarikh_Mula', 'Tarikh_Tamat',
      'Masa', 'Tempat_Venue', 'Pautan_GPS_Maps', 'Pelan_Sekolah_URL', 'Pelan_Parking_URL',
      'Panduan_Parking', 'Catatan_Khas', 'Status_Acara', 'Dibuat_Pada'
    ]);

    // Masukkan 3 Acara Contoh Realistik Brunei
    shEvents.appendRow([
      'EVT-2026-01',
      'Program Hala Tuju',
      'Pameran Pendidikan Hala Tuju 2026 (Zon Belait)',
      '2026-03-15',
      '2026-03-15',
      '08:00 - 16:30',
      'Dewan Serbaguna Pusat Tingkatan Enam Belait',
      'https://maps.google.com/?q=Pusat+Tingkatan+Enam+Belait',
      '',
      '',
      'Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi & VIP). Zon parking dikhaskan di Blok C, bersebelahan padang.',
      'Pakaian rasmi pejabat / kot. Meja pameran boleh diatur seawal jam 06:45 pagi. Sarapan & makan tengah hari disediakan.',
      'Aktif',
      Utilities.formatDate(new Date(), 'GMT+8', 'yyyy-MM-dd HH:mm:ss')
    ]);

    shEvents.appendRow([
      'EVT-2026-02',
      'Taklimat Tahunan Agensi',
      'Taklimat Tahunan Bersama 52 Agensi Jemputan',
      '2026-03-24',
      '2026-03-24',
      '08:30 - 11:30',
      'Auditorium Utama MOE, Blok A, Lapangan Terbang Lama',
      'https://maps.google.com/?q=Ministry+of+Education+Brunei',
      '',
      '',
      'Kawasan parking bertingkat Blok A dikhaskan untuk jemputan rasmi.',
      'Membincangkan penyelarasan kalendar pameran kerjaya dan prosedur standard penyediaan logistik sekolah.',
      'Aktif',
      Utilities.formatDate(new Date(), 'GMT+8', 'yyyy-MM-dd HH:mm:ss')
    ]);

    shEvents.appendRow([
      'EVT-2026-03',
      'Program FutureLink',
      'Program FutureLink Siri 1 (Zon Brunei Muara)',
      '2026-04-10',
      '2026-04-10',
      '08:00 - 15:30',
      'Dewan Auditorium Maktab Sains Paduka Seri Begawan Sultan',
      'https://maps.google.com/?q=Maktab+Sains+Paduka+Seri+Begawan+Sultan',
      '',
      '',
      'Sila gunakan Pintu Pagar Utama dan ikuti papan tanda ke Dewan Auditorium.',
      'Program orientasi kerjaya bidang STEM dan industri berkemahiran tinggi.',
      'Aktif',
      Utilities.formatDate(new Date(), 'GMT+8', 'yyyy-MM-dd HH:mm:ss')
    ]);
  }

  // C. Sheet RSVP_Logistik
  let shRSVP = ss.getSheetByName('RSVP_Logistik');
  if (!shRSVP) {
    shRSVP = ss.insertSheet('RSVP_Logistik');
    shRSVP.appendRow([
      'RSVP_ID', 'Event_ID', 'Agensi_ID', 'Nama_Agensi', 'Status_RSVP',
      'Bil_Meja', 'Bil_Kerusi', 'Bil_Plug', 'Jumlah_Wakil', 'Nama_Wakil_Hadir',
      'Keperluan_Lain', 'Tarikh_Hantar', 'Tarikh_Kemaskini'
    ]);
  }

  // D. Sheet AntrianNotif (gas-notifikasi-wa-crm)
  let shNotif = ss.getSheetByName('AntrianNotif');
  if (!shNotif) {
    shNotif = ss.insertSheet('AntrianNotif');
    shNotif.appendRow(['AntrianID', 'Kanal', 'Tujuan', 'NamaPenerima', 'Subjek', 'Pesan', 'Event', 'RefID', 'BlastID', 'Status', 'Percobaan', 'Respon', 'DibuatPada', 'DikirimPada']);
  }

  // E. Sheet CRM_Kontak (gas-notifikasi-wa-crm)
  let shCRM = ss.getSheetByName('CRM_Kontak');
  if (!shCRM) {
    shCRM = ss.insertSheet('CRM_Kontak');
    shCRM.appendRow(['KontakID', 'Nama', 'Email', 'NoWA', 'Segmen', 'Sumber', 'RefID', 'Tag', 'StatusWA', 'CekWAAt', 'EmailValid', 'OptOut', 'Catatan', 'JumlahPesan', 'TerakhirDihubungi', 'Info', 'DibuatPada', 'DiperbaruiPada']);
  }

  // F. Sheet CRM_Interaksi (gas-notifikasi-wa-crm)
  let shCRMInt = ss.getSheetByName('CRM_Interaksi');
  if (!shCRMInt) {
    shCRMInt = ss.insertSheet('CRM_Interaksi');
    shCRMInt.appendRow(['InteraksiID', 'KontakID', 'Kanal', 'Arah', 'Ringkasan', 'RefID', 'Oleh', 'Tanggal']);
  }

  // G. Sheet DE_Dokumen (gas-doc-engine)
  let shDoc = ss.getSheetByName('DE_Dokumen');
  if (!shDoc) {
    shDoc = ss.insertSheet('DE_Dokumen');
    shDoc.appendRow(['DokumenID', 'TemplateID', 'NomorSurat', 'JenisSurat', 'NamaAgensi', 'Status', 'DataIsian', 'KodeVerifikasi', 'HashPdf', 'UrlBerkas', 'DibuatPada', 'DiterbitkanOleh']);
  }

  // H. Sheet Aktiviti_Logs (Audit & Telemetri)
  let shLogs = ss.getSheetByName('Aktiviti_Logs');
  if (!shLogs) {
    shLogs = ss.insertSheet('Aktiviti_Logs');
    shLogs.appendRow(['Log_ID', 'Timestamp', 'Kategori', 'Aksi', 'Butiran']);
  }

  // Buang Sheet1 lalai jika wujud
  const defSheet = ss.getSheetByName('Sheet1');
  if (defSheet && ss.getSheets().length > 1) {
    ss.deleteSheet(defSheet);
  }
}
