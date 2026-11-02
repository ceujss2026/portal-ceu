/**
 * ============================================================================
 * KONFIGURASI APLIKASI FRONTEND (gas-pro-api & gas-rahasia-script-properties)
 * ============================================================================
 * 
 * ATURAN KEAMANAN:
 * - Fail ini HANYA memuatkan URL Web App Google Apps Script (GAS_URL).
 * - DILARANG meletakkan token rahasia, kunci kriptografi, atau kata laluan di sini.
 * - Jika GAS_URL masih kosong ('') atau semasa pembangunan tempatan, aplikasi
 *   akan mengaktifkan mod simulasi interaktif (Mock Data) secara automatik
 *   supaya semua fungsi dapat diuji dengan sempurna.
 */

window.APP_CONFIG = {
  GAS_URL: 'https://script.google.com/macros/s/AKfycbzyLxsNz2zFd2fwVrKUuJ8U7hm8ML-KggfoSFA08CR1oYua4hzSylv7yREQ4WRB4FtPDA/exec',

  APP_NAME: 'Portal CEU',
  FULL_NAME: 'Unit Pendidikan Kerjaya, Jabatan Sekolah-Sekolah',
  MINISTRY: 'Kementerian Pendidikan Brunei Darussalam',
  VERSION: '1.0.4',
  BUILD: 'Brunei MOE Production Build',

  // Tempoh Sah Sesi Tempatan (Hari)
  SESSION_DAYS: 30,

  // Domain Emel Rasmi Dibenarkan
  OFFICIAL_DOMAINS: ['.moe.bn', '.gov.bn', '.edu.bn'],

  // Daerah Brunei
  DISTRICTS: ['Brunei-Muara', 'Tutong', 'Belait', 'Temburong']
};
