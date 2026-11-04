/**
 * ============================================================================
 * MODUL DWIBAHASA (js/i18n.js)
 * Sokongan Bahasa Melayu Brunei Standard (BM) & English (EN)
 * Penukaran Serta-Merta di Sisi Klien Tanpa Muat Semula Halaman (Zero Reload)
 * ============================================================================
 */

const I18N = {
  currentLang: localStorage.getItem('ceu_lang') || 'BM',

  translations: {
    BM: {
      appName: 'PORTAL CEU',
      appSubtext: 'UPK · JSS · MOE',
      loginTitle: 'Selamat Datang',
      loginSubtitle: 'Sila log masuk menggunakan akaun agensi anda',
      usernameLabel: 'Nama Pengguna Agensi',
      usernamePlaceholder: 'cth: agensi_ubd atau admin_ceu',
      passwordLabel: 'Kata Laluan',
      passwordPlaceholder: '••••••••',
      forgotPasswordLink: 'Perlu Bantuan Kredensial? Hubungi Unit CEU',
      loginBtn: 'LOG MASUK SISTEM',
      loggingIn: 'Mengesahkan Kredensial...',
      footerMinistry: 'Kementerian Pendidikan, Negara Brunei Darussalam · v2.1.0',
      welcomeAgency: 'Selamat Datang · Agensi Jemputan Rasmi',
      belaitZone: 'Zon Belait',
      metricProgramMonth: 'Program Mac',
      metricCompleted: 'Selesai Hadir',
      metricPendingRsvp: 'Perlu RSVP',
      btnShortcutFloorPlan: 'Pelan Dewan & Meja',
      subShortcutFloorPlan: 'Lihat susun atur booth',
      btnShortcutParking: 'Lokasi Parking Agensi',
      subShortcutParking: 'Pintu Pagar B & Laluan Masuk',
      badgeMandatory: 'MANDATORI HADIR',
      badgeDeadline: 'Tamat: 12 Mac 2026',
      btnConfirmRSVP: 'Sahkan Kehadiran (RSVP)',
      btnDownloadPass: 'Muat Turun Pas',
      upcomingEvents: 'Program Akan Datang',
      viewAll: 'Lihat Semua >',
      navHome: 'Utama',
      navRsvp: 'RSVP',
      navArchive: 'Arkib',
      navNotif: 'Notifikasi',
      navProfile: 'Profil',
      navAdmin: 'Pentadbir',
      rsvpFormTitle: 'Pengesahan RSVP & Permohonan Logistik',
      rsvpStatusLabel: 'Status Kehadiran Agensi *',
      statusAttending: 'Hadir (Attending)',
      statusNotAttending: 'Tidak Hadir (Not Attending)',
      statusRepresentative: 'Lantik Wakil Rasmi (Appoint Representative)',
      logisticsHeader: 'Keperluan Logistik Dewan Sekolah',
      logisticsSubtext: 'Pihak penganjur akan menyediakan kelengkapan berikut di dewan:',
      labelTables: 'Bilangan Meja (Tables)',
      labelChairs: 'Bilangan Kerusi (Chairs)',
      labelPlugs: 'Penyambung Elektrik (Extension Plugs)',
      labelStaffCount: 'Jumlah Wakil Agensi Yang Hadir (Staff)',
      labelStaffNames: 'Nama Pegawai Bertugas',
      labelCustomRequests: 'Keperluan Logistik Khas / Catatan Tambahan',
      checkboxDeclaration: 'Pihak agensi mengesahkan maklumat permohonan logistik ini adalah muktamad.',
      btnCancel: 'Batal',
      btnSubmitRsvp: 'Hantar Pengesahan (Submit RSVP)',
      submitting: 'Menghantar...',
      parkingTitle: 'Panduan & Lokasi Parking Agensi',
      parkingGateGuide: 'Laluan Masuk: Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi & VIP).',
      parkingTimeGuide: 'Waktu Pelepasan: Kawasan letak kereta dibuka mulai 06:45 pagi bagi urusan persediaan booth.',
      parkingPassHeader: 'PAS MASUK KENDERAAN AGENSI JEMPUTAN',
      btnGpsNavigation: 'Pandu Arah GPS ke Tempat Letak Kereta Agensi',
      floorPlanTitle: 'Pelan Susun Atur Dewan & Meja Pameran',
      btnZoomFloorPlan: 'Besarkan Pelan Dewan (Fullscreen / Pinch-to-Zoom)',
      btnGpsVenue: 'Buka Peta GPS Dewan di Google Maps',
      archiveTitle: 'Takwim Tahunan Program',
      tabAll: 'Semua',
      tabHalaTuju: 'Hala Tuju',
      tabFutureLink: 'FutureLink',
      tabBriefing: 'Taklimat Agensi',
      notifTitle: 'Notifikasi & Peringatan Acara',
      profileTitle: 'Profil Agensi & Tetapan',
      btnLogout: 'Log Keluar daripada Sistem',
      adminTitle: 'Papan Pemuka Pentadbir CEU',
      adminAgenciesCount: '52 Agensi Jemputan',
      adminKadarRsvp: 'Kadar Maklum Balas',
      adminTablesTotal: 'Jumlah Meja Sekolah',
      adminPlugsTotal: 'Jumlah Extension Plug',
      adminExportCsv: 'Eksport CSV',
      adminExportExcel: 'Eksport Excel (.xlsx)',
      adminPrintPdf: 'Cetak Laporan PDF Ber-QR',
      adminSuratJemputan: 'Surat Menyurat Rasmi',
      adminBroadcastWa: 'Broadcast WhatsApp'
    },
    EN: {
      appName: 'PORTAL CEU',
      appSubtext: 'UPK · JSS · MOE',
      loginTitle: 'Welcome Back',
      loginSubtitle: 'Please log in using your agency credentials',
      usernameLabel: 'Agency Username',
      usernamePlaceholder: 'e.g., agensi_ubd or admin_ceu',
      passwordLabel: 'Password',
      passwordPlaceholder: '••••••••',
      forgotPasswordLink: 'Need Credential Assistance? Contact CEU Unit',
      loginBtn: 'SYSTEM LOG IN',
      loggingIn: 'Verifying Credentials...',
      footerMinistry: 'Ministry of Education, Brunei Darussalam · v2.1.0',
      welcomeAgency: 'Welcome · Official Invited Agency',
      belaitZone: 'Belait District',
      metricProgramMonth: 'March Events',
      metricCompleted: 'Attended',
      metricPendingRsvp: 'Pending RSVP',
      btnShortcutFloorPlan: 'Hall & Booth Plan',
      subShortcutFloorPlan: 'View booth setup layout',
      btnShortcutParking: 'Agency Parking Location',
      subShortcutParking: 'Gate B & Access Route',
      badgeMandatory: 'MANDATORY ATTENDANCE',
      badgeDeadline: 'Deadline: 12 March 2026',
      btnConfirmRSVP: 'Confirm Attendance (RSVP)',
      btnDownloadPass: 'Download Pass',
      upcomingEvents: 'Upcoming Events',
      viewAll: 'View All >',
      navHome: 'Home',
      navRsvp: 'RSVP',
      navArchive: 'Archive',
      navNotif: 'Alerts',
      navProfile: 'Profile',
      navAdmin: 'Admin',
      rsvpFormTitle: 'RSVP Confirmation & Logistics Request',
      rsvpStatusLabel: 'Agency Attendance Status *',
      statusAttending: 'Attending',
      statusNotAttending: 'Not Attending',
      statusRepresentative: 'Appoint Representative',
      logisticsHeader: 'School Hall Equipment Requirements',
      logisticsSubtext: 'The host school will prepare the following items at your booth:',
      labelTables: 'Number of Tables',
      labelChairs: 'Number of Chairs',
      labelPlugs: 'Electrical Extension Plugs',
      labelStaffCount: 'Number of Agency Representatives Attending',
      labelStaffNames: 'Names of Officers On Duty',
      labelCustomRequests: 'Special Logistics Requests / Notes',
      checkboxDeclaration: 'The agency confirms that this logistics request is final and accurate.',
      btnCancel: 'Cancel',
      btnSubmitRsvp: 'Submit RSVP Confirmation',
      submitting: 'Submitting...',
      parkingTitle: 'Agency Parking Guide & Location',
      parkingGateGuide: 'Access Route: Please enter via Gate B (Designated Agency & VIP Gate).',
      parkingTimeGuide: 'Access Time: Parking opens at 06:45 AM for booth setup and unloading.',
      parkingPassHeader: 'OFFICIAL AGENCY VEHICLE ENTRY PASS',
      btnGpsNavigation: 'GPS Navigation to Agency Parking Lot',
      floorPlanTitle: 'Hall Floor Plan & Exhibition Booth Layout',
      btnZoomFloorPlan: 'Expand Floor Plan (Fullscreen / Pinch-to-Zoom)',
      btnGpsVenue: 'Open Hall GPS Location in Google Maps',
      archiveTitle: 'Annual Event Calendar',
      tabAll: 'All',
      tabHalaTuju: 'Hala Tuju',
      tabFutureLink: 'FutureLink',
      tabBriefing: 'Agency Briefing',
      notifTitle: 'Notifications & Event Alerts',
      profileTitle: 'Agency Profile & Settings',
      btnLogout: 'Sign Out of System',
      adminTitle: 'CEU Administrator Dashboard',
      adminAgenciesCount: '52 Invited Agencies',
      adminKadarRsvp: 'Response Rate',
      adminTablesTotal: 'Total School Tables',
      adminPlugsTotal: 'Total Extension Plugs',
      adminExportCsv: 'Export CSV',
      adminExportExcel: 'Export Excel (.xlsx)',
      adminPrintPdf: 'Print QR Official PDF',
      adminSuratJemputan: 'Official Letters & Certs',
      adminBroadcastWa: 'WhatsApp Broadcast'
    }
  },

  t: function(key) {
    const lang = this.currentLang;
    if (this.translations[lang] && this.translations[lang][key] !== undefined) {
      return this.translations[lang][key];
    }
    return (this.translations.BM && this.translations.BM[key]) || key;
  },

  setLang: function(lang) {
    if (lang !== 'BM' && lang !== 'EN') return;
    this.currentLang = lang;
    localStorage.setItem('ceu_lang', lang);
    this.applyToDOM();
  },

  applyToDOM: function() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      const text = this.t(key);
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        if (el.hasAttribute('placeholder')) el.setAttribute('placeholder', text);
      } else {
        el.innerText = text;
      }
    });

    // Kemaskini toggle button aktif
    document.querySelectorAll('.btn-lang-toggle').forEach(btn => {
      const targetLang = btn.getAttribute('data-lang');
      if (targetLang === this.currentLang) {
        btn.classList.add('bg-tertiary-fixed', 'text-on-tertiary-fixed', 'font-bold');
        btn.classList.remove('text-on-primary/80', 'font-medium');
      } else {
        btn.classList.remove('bg-tertiary-fixed', 'text-on-tertiary-fixed', 'font-bold');
        btn.classList.add('text-on-primary/80', 'font-medium');
      }
    });
  }
};
