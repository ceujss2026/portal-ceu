/**
 * ============================================================================
 * MODUL DWIBAHASA (js/i18n.js)
 * Sokongan Penuh Bahasa Melayu Brunei Standard (BM) & English (EN)
 * Penukaran Serta-Merta di Sisi Klien Tanpa Muat Semula Halaman (Zero Reload)
 * ============================================================================
 */

const I18N = {
  currentLang: localStorage.getItem('ceu_lang') || 'BM',

  translations: {
    BM: {
      appName: 'RSVP CEU',
      appSubtext: 'UPK · JSS · MOE',
      ministryEmblem: 'KEMENTERIAN PENDIDIKAN',
      ministryTitle: 'Kementerian Pendidikan, Negara Brunei Darussalam · v2.1.0',
      systemTitle: 'Unit Pendidikan Kerjaya • Jabatan Sekolah-Sekolah',
      systemCountry: 'Negara Brunei Darussalam',
      systemSubtitle: 'Sistem Pengurusan Acara Hala Tuju & FutureLink 2026',
      
      // Login
      loginAgencyAccess: 'AKSES AGENSI JEMPUTAN RASMI',
      loginAdminAccess: 'AKSES PENTADBIR CEU',
      tabModeAgency: 'Agensi',
      tabModeAdmin: 'Admin',
      loginTitle: 'Selamat Datang',
      loginSubtitleAgency: 'Log masuk agensi untuk melihat maklumat program, pelan dewan, parking & pengesahan RSVP.',
      loginSubtitleAdmin: 'Log masuk pentadbir untuk memantau papan pemuka dan mengurus takwim program.',
      labelAgencyUsername: 'Nama Pengguna Agensi',
      sublabelAgencyUsername: 'ID Institusi',
      placeholderAgencyUsername: 'cth: agensi_ubd',
      labelAdminUsername: 'ID Pentadbir CEU',
      sublabelAdminUsername: 'Urus Acara',
      placeholderAdminUsername: 'cth: admin_ceu',
      labelPassword: 'Kata Laluan Rasmi',
      sublabelPassword: 'Kredensial',
      placeholderPassword: 'Masukkan kata laluan rasmi...',
      hintOfficial: 'Portal Rasmi UPK · JSS · MOE',
      hintAdmin: 'Unit Pendidikan Kerjaya · JSS · MOE',
      helpCredentials: 'Bantuan Kredensial?',
      btnLoginAgency: 'LOG MASUK AGENSI',
      btnLoginAdmin: 'LOG MASUK PENTADBIR',
      loggingIn: 'Mengesahkan Kredensial...',

      // Desktop Left Features
      featureRsvp: 'Pengesahan Delegasi & Kehadiran (RSVP)',
      featureTables: 'Tempahan Meja Dewan & Soket Elektrik',
      featureParking: 'Tempat Letak Kereta Khusus Pintu Pagar B',
      featureLetters: 'Surat Jemputan Rasmi Ber-QR Keselamatan',

      // Navbar
      navProgramInfo: 'Info Program',
      navRsvpForm: 'Borang RSVP',
      navAdminDashboard: 'Papan Pemuka',
      navAdminEvents: 'Urus Program & Peta',
      navSignOut: 'Keluar',
      navRoleAgency: 'Agensi Jemputan',
      navRoleAdmin: 'Pentadbir CEU',
      modeBadgeAgency: 'AGENSI',
      modeBadgeAdmin: 'ADMIN',

      // Home Screen - Hero & Metrics
      welcomeAgencyHeader: 'SELAMAT DATANG • AGENSI JEMPUTAN',
      welcomeBrunei: 'Negara Brunei Darussalam',
      welcomeDesc: 'Sesi Penyelarasan Takwim & Logistik Program Hala Tuju & FutureLink.',
      metricMonth: 'Jumlah Sesi Takwim',
      metricAttended: 'Selesai Hadir',
      metricPendingRsvp: 'Perlu Tindakan RSVP',
      
      // Shortcuts & Selector
      selectSessionLabel: 'Pilih Sesi Sekolah / Program (31 Sesi)',
      tagOfficial2027: 'Takwim Rasmi 2027',
      shortcutFloorPlan: 'Pelan Dewan',
      shortcutFloorPlanSub: 'Susun atur meja pameran & dewan',
      shortcutParking: 'Peta Parking',
      shortcutParkingSub: 'Pintu Pagar B (Khusus Agensi)',
      
      // Filters
      filterAll: 'Semua',
      filterAllCount: 'Semua (31)',
      filterPhtCount: 'Hala Tuju (27)',
      filterFlCount: 'FutureLink (4)',
      filterDistAll: 'Semua Daerah',
      filterDistBM: 'Brunei Muara (21)',
      filterDistTutong: 'Tutong (6)',
      filterDistBelait: 'Belait (3)',
      filterDistTemburong: 'Temburong (1)',

      // Hero Card
      heroMinistryUnit: 'JABATAN SEKOLAH-SEKOLAH • UNIT PENDIDIKAN KERJAYA',
      heroGateB: 'Parking Agensi',
      heroDate: 'Tarikh',
      heroTime: 'Masa Sesi',
      heroBtnUpdate: 'Kemaskini RSVP Sesi Ini',
      heroBtnConfirm: 'Sahkan Kehadiran (RSVP)',
      rsvpConfirmed: 'RSVP Disahkan',
      rsvpNeeded: 'Perlu Pengesahan',

      // Takwim Schedule
      scheduleHeader: 'Jadual Takwim 31 Sesi Sekolah (2027)',
      viewAll: 'Semua',
      viewMonthly: 'Bulanan',
      viewWeekly: 'Mingguan',
      allMonths: 'Semua Bulan',
      searchPlaceholder: 'Cari sekolah, venue, tarikh...',
      btnSelect: 'Pilih',
      btnUpdate: 'Kemaskini',
      btnRsvpSession: 'RSVP Sesi Ini',
      districtPrefix: 'Daerah ',
      schoolSessionsSuffix: 'Sesi Sekolah',

      // Right Sidebar Cards
      cardActionRequired: 'Tindakan Diperlukan',
      cardActionTitle: 'Pengesahan RSVP Sesi Takwim',
      cardActionDesc: 'Sila sahkan kehadiran & butiran delegasi agensi bagi penyediaan pelekat meja pameran & pas parking agensi.',
      cardActionBtn: 'Isi Borang RSVP Sesi Terpilih',
      cardAmenitiesHeader: 'Kemudahan Disediakan',
      amenityTable: '1 Meja Pameran standard (beralas)',
      amenityChairs: '2 Kerusi pegawai pempamer agensi',
      amenityPlug: '1 Soket plug elektrik (atas permintaan)',
      amenityParking: '1 Petak letak kereta khas agensi',
      amenityFloorPlanLink: 'Pelan Meja Booth →',
      amenityParkingLink: 'Panduan Parking Agensi →',
      cardHelpTitle: 'Ada Kekangan Kehadiran?',
      cardHelpSub: 'Hubungi Urus Setia UPK',
      cardHelpPhone: 'Talian CEU:',
      cardHelpEmail: 'Emel Rasmi:',
      cardHelpBtn: 'Kemaskini Status RSVP',

      // RSVP Form Screen
      rsvpFormTitle: 'Pengesahan RSVP & Permohonan Logistik',
      rsvpOfficialOnBehalf: 'Permohonan Rasmi bagi pihak:',
      rsvpSessionSelectLabel: 'Pilih Sesi Sekolah / Program *',
      rsvp31SessionsBadge: '31 Sesi Takwim',
      rsvpStatusHeader: 'Status Kehadiran Agensi *',
      rsvpAttending: 'Hadir (Attending)',
      rsvpAttendingSub: 'Menyertai Pameran Booth',
      rsvpNotAttending: 'Tidak Hadir (Not Attending)',
      rsvpNotAttendingSub: 'Kekangan jadual',
      rsvpEditBannerTitle: 'Kemaskini RSVP',
      rsvpEditBannerDesc: 'Anda sedang mengemaskini maklumat RSVP yang telah direkodkan sebelumnya. Sebarang perubahan boleh dihantar semula.',
      notAttendingNoticeTitle: 'Pengesahan Tidak Hadir',
      rsvpNotAttendingNoticeText: 'Agensi anda mengesahkan tidak dapat menyertai sesi pameran ini kerana kekangan jadual. Tiada kelengkapan dewan (meja/kerusi/plug) diperuntukkan.',
      rsvpLogisticsTitle: 'Keperluan Logistik Dewan Sekolah',
      rsvpLogisticsSub: 'Pihak penganjur akan menyediakan kelengkapan berikut di dewan:',
      labelTables: 'Bilangan Meja',
      labelChairs: 'Bilangan Kerusi',
      labelPlugs: 'Penyambung Elektrik (Plug)',
      labelStaffCount: 'Jumlah Wakil Hadir',
      labelStaffNames: 'Nama Pegawai Bertugas (Pilihan)',
      placeholderStaffNames: 'cth: 1. Awang Mohd Azmi, 2. Dayang Hjh Siti...',
      labelVipParkingInfo: 'Pas Letak Kereta Agensi',
      badgeVipCar: '1 Petak Disediakan',
      hintVipParkingInfo: '1 petak letak kereta khas disediakan di kawasan sekolah bagi agensi anda tanpa perlu mendaftar nombor plat.',
      labelAdditionalNotes: 'Keperluan Logistik Tambahan (Pilihan)',
      placeholderAdditionalNotes: 'cth: Perlukan ruang tambahan untuk bunting berdiri...',
      declarationText: 'Pihak agensi mengesahkan maklumat permohonan logistik ini adalah muktamad.',
      btnCancel: 'Batal',
      btnSubmitRsvp: 'Hantar Pengesahan (Submit RSVP)',
      btnSubmitRsvpTextNew: 'Hantar Pengesahan (Submit RSVP)',
      btnSubmitRsvpTextEdit: 'Kemaskini Pengesahan RSVP',
      rsvpSuccessModalTitle: 'RSVP Berjaya Direkodkan!',
      rsvpSuccessModalTitleEdit: 'RSVP Berjaya Dikemaskini!',
      rsvpSuccessModalSub: 'Data kehadiran telah disimpan dalam sistem.',
      btnSendWhatsAppModalText: 'Hantar Notifikasi ke WhatsApp (+6738669690)',

      // Admin Dashboard
      adminTitle: 'Papan Pemuka Pentadbir CEU',
      adminDesc: 'Pemantauan masa nyata pengesahan RSVP, keperluan meja dewan & logistik 50 agensi jemputan.',
      adminPrintPdf: 'Cetak Laporan PDF',
      adminManageEvents: 'Urus Program & Peta',
      adminAgenciesTotal: '50 Agensi Jemputan',
      adminAgenciesNationwide: 'Seluruh Negara Brunei',
      adminResponseRate: 'Kadar Maklum Balas',
      adminStatusConfirmed: 'Status Kehadiran Disahkan',
      adminTablesAndChairs: 'Meja & Kerusi Sekolah',
      adminHallNeeds: 'Keperluan Dewan Pameran',
      adminPlugsAndParking: 'Soket Plug & Parking Agensi',
      adminGateBVip: 'Parking Khas Agensi',
      adminTableTitle: 'Status Pengesahan RSVP 50 Agensi Jemputan',
      adminTableDesc: 'Semak status delegasi, keperluan logistik, dan pas parking agensi.',
      adminSearchPlaceholder: 'Cari agensi...',
      adminFilterAll: 'Semua (50)',
      adminFilterAttending: 'Hadir',
      adminFilterPending: 'Belum Sah',
      colNo: 'NO',
      colCode: 'KOD',
      colAgency: 'NAMA AGENSI JEMPUTAN',
      colStatus: 'STATUS RSVP',
      colTables: 'MEJA / KERUSI',
      colPlug: 'PLUG',
      colParking: 'PARKING AGENSI',
      colAction: 'AKSI',

      // Parking & Floor Plan
      parkingTitle: 'Panduan & Lokasi Parking Agensi',
      parkingGateGuide: 'Laluan Masuk: Sila patuhi panduan pihak sekolah bagi tempat letak kereta rasmi wakil agensi.',
      parkingPassHeader: 'PAS PARKING RASMI AGENSI',
      floorPlanTitle: 'Pelan Susun Atur Dewan & Meja Pameran',
      floorPlanZoom: 'Besarkan Pelan Dewan (Fullscreen / Pinch-to-Zoom)',
      gpsNavigation: 'Pandu Arah GPS ke Tempat Letak Kereta Agensi',

      // Admin Events & Maps Manager
      adminEventsHeaderBadge: 'PENTADBIR UNIT PENDIDIKAN KERJAYA',
      adminEventsRoleBadge: 'ADMIN',
      adminEventsTitle: 'Pengurusan Program & Peta Sekolah',
      adminEventsDesc: 'Urus maklumat acara, kemaskini dewan venue, muat naik pelan dewan dan tetapan parking sekolah.',
      adminEventsBtnBack: 'Kembali ke Papan Pemuka',
      adminEventsSectionTitle: 'Program Aktif & Takwim Semasa (31 Sesi)',
      adminEventsSearchPlaceholder: 'Cari sekolah atau dewan...',
      adminEventFormTitle: 'Kemaskini Butiran Acara & Logistik',
      labelAdminInputNamaAcara: 'Nama Acara / Program *',
      labelAdminInputKategori: 'Kategori Program',
      labelAdminInputTarikhMula: 'Tarikh Acara *',
      placeholderAdminInputTarikhMula: 'cth: 15 Mac 2026',
      labelAdminInputMasa: 'Masa Program *',
      placeholderAdminInputMasa: 'cth: 08:00 - 16:30',
      labelAdminInputTempat: 'Tempat / Venue Sekolah *',
      placeholderAdminInputTempat: 'cth: Dewan Serbaguna Pusat Tingkatan Enam Belait',
      labelAdminInputGps: 'Pautan GPS Google Maps (Venue Dewan)',
      adminEventsMapSectionTitle: 'Tetapan Pelan Dewan Sekolah & Parking Agensi',
      labelAdminInputPelanSekolah: 'Pelan Dewan Sekolah (Susunan Meja)',
      badgeAdminInputPelanSekolah: 'Muat Naik / Pautan URL',
      descAdminInputPelanSekolah: 'Muat naik gambar pelan dewan atau susun atur meja pameran khusus untuk sekolah ini.',
      labelAdminInputPelanParking: 'Tempat Letak Kereta Agensi',
      badgeAdminInputPelanParking: 'Maklumat / Peta',
      placeholderAdminInputPanduanParking: 'Panduan: Sila masuk melalui pintu utama atau zon khas agensi...',
      btnUploadHallMapText: 'Pilih Fail Imej Peta Dewan',
      labelParkingModeInfoText: 'Maklumat Sahaja',
      labelParkingModeMapText: 'Peta & Maklumat',
      btnUploadParkingMapText: 'Pilih Fail Imej Peta Parking',
      labelAdminPanduanParking: 'Arahan / Panduan Parking Sekolah:',
      parkingInfoCardTitle: 'Maklumat & Arahan Tempat Letak Kereta',
      parkingInfoNoticeText: 'Pihak sekolah menyediakan maklumat bertulis bagi kemudahan tempat letak kereta wakil agensi seperti di bawah.',
      parkingPassStatusText: 'Status: Sah Berdaftar · 1 Petak Disediakan',
      labelAdminInputCatatanKhas: 'Catatan Khas / Etika Pakaian Agensi',
      placeholderAdminInputCatatanKhas: 'cth: Pakaian rasmi pejabat / kot. Meja boleh diatur seawal 06:45 pagi.',
      btnSaveAdminEventText: 'Simpan Perubahan Acara & Peta',

      // Modals & Extras
      mapModalCloseBtn: 'Tutup',
      docModalTitle: 'Pratinjau Surat Rasmi Ber-QR',
      docModalCloseBtn: 'Tutup',
      docModalPrintBtnText: 'Cetak PDF',
      eventDetailsHeaderTitle: 'Butiran Acara & Panduan Penganjur',
      btnOpenGpsMapsText: 'Buka Peta GPS Dewan di Google Maps',
      labelEventDetailsNotes: 'Catatan Khas untuk Agensi:',
      btnEventDetailsFloorText: 'Pelan Dewan',
      btnEventDetailsParkingText: 'Peta Parking',
      btnEventDetailsRsvpText: 'Isi / Kemaskini Borang RSVP & Logistik →',
      parkingScreenTitle: 'Panduan & Lokasi Parking Agensi',
      parkingZoneBadge: 'ZON LETAK KERETA AGENSI JEMPUTAN',
      gateABadge: 'PINTU PAGAR A (Bas)',
      gateBBadge: 'PINTU PAGAR B (Khas Agensi)',
      parkingBlockCBadge: 'Zon Parking Agensi (Blok C)',
      parkingReservedSub: 'Petak Rezab Bersebelahan Padang',
      parkingPassStatusText: 'Status: Sah Berdaftar · Petak Rezab',
      btnGpsParkingNavText: 'Pandu Arah GPS ke Tempat Letak Kereta Agensi',
      floorPlanScreenTitle: 'Pelan Susun Atur Dewan & Meja Pameran',
      floorPlanVenueLabel: 'Dewan Sekolah / Tempat Acara',
      floorPlanBoothAvailableLabel: 'Petak Booth Disediakan',
      floorPlanMainStage: 'Pentas Utama & Perasmian Ekspo',
      floorPlanStudentEntrance: 'Pintu Masuk Utama Dewan (Pelajar)',
      btnFloorPlanZoomText: 'Besarkan Pelan Dewan (Fullscreen / Pinch-to-Zoom)',
      archiveScreenTitle: 'Takwim Tahunan Program',
      notifScreenTitle: 'Notifikasi & Peringatan Acara',
      btnMarkAllNotifsRead: 'Tanda Semua Dibaca',
      btnClearAllNotifs: 'Kosongkan Semua',
      profileScreenTitle: 'Profil Agensi & Tetapan',
      profileRegisteredAccountLabel: 'Akaun Agensi Berdaftar',
      profileAgencyStatusText: 'Status: Agensi Jemputan Rasmi CEU JSS',
      syncCalendarThisSession: 'Sesi Ini'
    },

    EN: {
      appName: 'RSVP CEU',
      appSubtext: 'UPK · JSS · MOE',
      ministryEmblem: 'MINISTRY OF EDUCATION',
      ministryTitle: 'Ministry of Education, Brunei Darussalam · v2.1.0',
      systemTitle: 'Career Education Unit • Department of Schools',
      systemCountry: 'Brunei Darussalam',
      systemSubtitle: 'Hala Tuju & FutureLink 2026 Event Management System',

      // Login
      loginAgencyAccess: 'OFFICIAL INVITED AGENCY ACCESS',
      loginAdminAccess: 'CEU ADMINISTRATOR ACCESS',
      tabModeAgency: 'Agency',
      tabModeAdmin: 'Admin',
      loginTitle: 'Welcome Back',
      loginSubtitleAgency: 'Agency log in to view event details, floor plan, parking & RSVP confirmation.',
      loginSubtitleAdmin: 'Administrator log in to monitor dashboard and manage event calendar.',
      labelAgencyUsername: 'Agency Username',
      sublabelAgencyUsername: 'Institution ID',
      placeholderAgencyUsername: 'e.g., agensi_ubd',
      labelAdminUsername: 'CEU Admin ID',
      sublabelAdminUsername: 'Manage Events',
      placeholderAdminUsername: 'e.g., admin_ceu',
      labelPassword: 'Official Password',
      sublabelPassword: 'Credentials',
      placeholderPassword: 'Enter official password...',
      hintOfficial: 'Official Portal UPK · JSS · MOE',
      hintAdmin: 'Career Education Unit · JSS · MOE',
      helpCredentials: 'Need Credential Help?',
      btnLoginAgency: 'AGENCY LOG IN',
      btnLoginAdmin: 'ADMINISTRATOR LOG IN',
      loggingIn: 'Verifying Credentials...',

      // Desktop Left Features
      featureRsvp: 'Delegation & Attendance Confirmation (RSVP)',
      featureTables: 'Hall Exhibition Tables & Power Sockets',
      featureParking: 'Designated Gate B Parking Lots',
      featureLetters: 'Official Invitation Letters with QR Security',

      // Navbar
      navProgramInfo: 'Program Info',
      navRsvpForm: 'RSVP Form',
      navAdminDashboard: 'Dashboard',
      navAdminEvents: 'Manage Events & Maps',
      navSignOut: 'Sign Out',
      navRoleAgency: 'Invited Agency',
      navRoleAdmin: 'CEU Administrator',
      modeBadgeAgency: 'AGENCY',
      modeBadgeAdmin: 'ADMIN',

      // Home Screen - Hero & Metrics
      welcomeAgencyHeader: 'WELCOME • INVITED AGENCY',
      welcomeBrunei: 'Brunei Darussalam',
      welcomeDesc: 'Calendar & Logistics Coordination Session for Program Hala Tuju & FutureLink.',
      metricMonth: 'Official Takwim Sessions',
      metricAttended: 'Attended',
      metricPendingRsvp: 'Action Required (RSVP)',

      // Shortcuts & Selector
      selectSessionLabel: 'Select School Session / Program (31 Sessions)',
      tagOfficial2027: 'Official 2027 Calendar',
      shortcutFloorPlan: 'Hall Floor Plan',
      shortcutFloorPlanSub: 'Exhibition & booth layout',
      shortcutParking: 'Parking Map',
      shortcutParkingSub: 'Gate B (Agency Designated)',

      // Filters
      filterAll: 'All',
      filterAllCount: 'All (31)',
      filterPhtCount: 'Hala Tuju (27)',
      filterFlCount: 'FutureLink (4)',
      filterDistAll: 'All Districts',
      filterDistBM: 'Brunei Muara (21)',
      filterDistTutong: 'Tutong (6)',
      filterDistBelait: 'Belait (3)',
      filterDistTemburong: 'Temburong (1)',

      // Hero Card
      heroMinistryUnit: 'DEPARTMENT OF SCHOOLS • CAREER EDUCATION UNIT',
      heroGateB: 'Agency Parking',
      heroDate: 'Date',
      heroTime: 'Session Time',
      heroBtnUpdate: 'Update RSVP for this Session',
      heroBtnConfirm: 'Confirm Attendance (RSVP)',
      rsvpConfirmed: 'RSVP Confirmed',
      rsvpNeeded: 'Confirmation Required',

      // Takwim Schedule
      scheduleHeader: '31 School Sessions Schedule (2027)',
      viewAll: 'All',
      viewMonthly: 'Monthly',
      viewWeekly: 'Weekly',
      allMonths: 'All Months',
      searchPlaceholder: 'Search school, venue, date...',
      btnSelect: 'Select',
      btnUpdate: 'Update',
      btnRsvpSession: 'RSVP Now',
      districtPrefix: '',
      schoolSessionsSuffix: 'School Sessions',

      // Right Sidebar Cards
      cardActionRequired: 'Action Required',
      cardActionTitle: 'Calendar Session RSVP Confirmation',
      cardActionDesc: 'Please confirm agency attendance & delegation details for exhibition booth labelling & agency parking passes.',
      cardActionBtn: 'Fill RSVP Form for Selected Session',
      cardAmenitiesHeader: 'Provided Amenities',
      amenityTable: '1 Standard Exhibition Table (covered)',
      amenityChairs: '2 Agency exhibitor chairs',
      amenityPlug: '1 Electrical extension plug (upon request)',
      amenityParking: '1 Dedicated agency parking slot',
      amenityFloorPlanLink: 'Booth Layout Plan →',
      amenityParkingLink: 'Agency Parking Guide →',
      cardHelpTitle: 'Attendance Constraints?',
      cardHelpSub: 'Contact CEU Secretariat',
      cardHelpPhone: 'CEU Hotline:',
      cardHelpEmail: 'Official Email:',
      cardHelpBtn: 'Update RSVP Status',

      // RSVP Form Screen
      rsvpFormTitle: 'RSVP Confirmation & Logistics Request',
      rsvpOfficialOnBehalf: 'Official Request on behalf of:',
      rsvpSessionSelectLabel: 'Select School / Program Session *',
      rsvp31SessionsBadge: '31 Calendar Sessions',
      rsvpStatusHeader: 'Agency Attendance Status *',
      rsvpAttending: 'Attending',
      rsvpAttendingSub: 'Participating in Exhibition Booth',
      rsvpNotAttending: 'Not Attending',
      rsvpNotAttendingSub: 'Schedule constraints',
      rsvpEditBannerTitle: 'Edit RSVP',
      rsvpEditBannerDesc: 'You are editing your RSVP confirmation for this session. Any changes will be recorded.',
      notAttendingNoticeTitle: 'Not Attending Confirmation',
      rsvpNotAttendingNoticeText: 'Your agency has confirmed not attending this exhibition session due to schedule constraints. No hall logistics (tables/chairs/plugs) will be allocated.',
      rsvpLogisticsTitle: 'School Hall Logistics Requirements',
      rsvpLogisticsSub: 'The host school will prepare the following items at your booth:',
      labelTables: 'Number of Tables',
      labelChairs: 'Number of Chairs',
      labelPlugs: 'Electrical Extension Plugs',
      labelStaffCount: 'Number of Attending Staff',
      labelStaffNames: 'Officers On Duty Names (Optional)',
      placeholderStaffNames: 'e.g., 1. Awang Mohd Azmi, 2. Dayang Hjh Siti...',
      labelVipParkingInfo: 'Agency Parking Pass',
      badgeVipCar: '1 Slot Allocated',
      hintVipParkingInfo: '1 reserved parking slot is provided in the school compound for your agency without requiring vehicle license plate registration.',
      labelAdditionalNotes: 'Special Logistics Requests / Notes (Optional)',
      placeholderAdditionalNotes: 'e.g., Require extra space for roll-up banners...',
      declarationText: 'The agency confirms that this logistics request is final and accurate.',
      btnCancel: 'Cancel',
      btnSubmitRsvp: 'Submit RSVP Confirmation',
      btnSubmitRsvpTextNew: 'Submit RSVP Confirmation',
      btnSubmitRsvpTextEdit: 'Update RSVP Confirmation',
      rsvpSuccessModalTitle: 'RSVP Successfully Recorded!',
      rsvpSuccessModalTitleEdit: 'RSVP Successfully Updated!',
      rsvpSuccessModalSub: 'Attendance details have been saved to the system.',
      btnSendWhatsAppModalText: 'Send Notification to WhatsApp (+6738669690)',

      // Admin Dashboard
      adminTitle: 'CEU Administrator Dashboard',
      adminDesc: 'Real-time monitoring of RSVP confirmations, hall tables & logistics for 50 invited agencies.',
      adminPrintPdf: 'Print PDF Report',
      adminManageEvents: 'Manage Events & Maps',
      adminAgenciesTotal: '50 Invited Agencies',
      adminAgenciesNationwide: 'Nationwide Brunei',
      adminResponseRate: 'Response Rate',
      adminStatusConfirmed: 'Confirmed Attendance Status',
      adminTablesAndChairs: 'School Tables & Chairs',
      adminHallNeeds: 'Exhibition Hall Requirements',
      adminPlugsAndParking: 'Power Plugs & Agency Parking',
      adminGateBVip: 'Agency Parking',
      adminTableTitle: 'RSVP Confirmation Status of 50 Invited Agencies',
      adminTableDesc: 'Review delegation status, logistics requests, and agency parking passes.',
      adminSearchPlaceholder: 'Search agency...',
      adminFilterAll: 'All (50)',
      adminFilterAttending: 'Attending',
      adminFilterPending: 'Pending',
      colNo: 'NO',
      colCode: 'CODE',
      colAgency: 'INVITED AGENCY NAME',
      colStatus: 'RSVP STATUS',
      colTables: 'TABLES / CHAIRS',
      colPlug: 'PLUG',
      colParking: 'AGENCY PARKING',
      colAction: 'ACTION',

      // Parking & Floor Plan
      parkingTitle: 'Agency Parking Guide & Location',
      parkingGateGuide: 'Access Route: Please follow host school guidance for designated agency representative parking.',
      parkingPassHeader: 'OFFICIAL AGENCY PARKING PASS',
      floorPlanTitle: 'Hall Floor Plan & Exhibition Booth Layout',
      floorPlanZoom: 'Expand Floor Plan (Fullscreen / Pinch-to-Zoom)',
      gpsNavigation: 'GPS Navigation to Agency Parking Lot',

      // Admin Events & Maps Manager
      adminEventsHeaderBadge: 'CAREER EDUCATION UNIT ADMINISTRATOR',
      adminEventsRoleBadge: 'ADMIN',
      adminEventsTitle: 'Program Management & School Maps',
      adminEventsDesc: 'Manage event details, update venues, upload hall floor plans, and configure school parking settings.',
      adminEventsBtnBack: 'Back to Dashboard',
      adminEventsSectionTitle: 'Active Programs & Current Calendar (31 Sessions)',
      adminEventsSearchPlaceholder: 'Search school or hall...',
      adminEventFormTitle: 'Update Event & Logistics Details',
      labelAdminInputNamaAcara: 'Event / Program Name *',
      labelAdminInputKategori: 'Program Category',
      labelAdminInputTarikhMula: 'Event Date *',
      placeholderAdminInputTarikhMula: 'e.g., 25 Jan 2027',
      labelAdminInputMasa: 'Program Time *',
      placeholderAdminInputMasa: 'e.g., 08:00 - 16:30',
      labelAdminInputTempat: 'School Venue / Hall *',
      placeholderAdminInputTempat: 'e.g., Multipurpose Hall, PTE Belait',
      labelAdminInputGps: 'Google Maps GPS Link (Hall Venue)',
      adminEventsMapSectionTitle: 'School Hall Floor Plan & Agency Parking Settings',
      labelAdminInputPelanSekolah: 'School Hall Floor Plan (Booth Layout)',
      badgeAdminInputPelanSekolah: 'Upload / Image URL',
      descAdminInputPelanSekolah: 'Upload hall floor plan or booth layout image specifically for this school.',
      labelAdminInputPelanParking: 'Agency Parking Location',
      badgeAdminInputPelanParking: 'Information / Map',
      placeholderAdminInputPanduanParking: 'Guide: Please enter via the main entrance or designated area for invited agencies...',
      btnUploadHallMapText: 'Select Hall Map Image File',
      labelParkingModeInfoText: 'Information Only',
      labelParkingModeMapText: 'Map & Information',
      btnUploadParkingMapText: 'Select Parking Map File',
      labelAdminPanduanParking: 'School Parking Instructions / Guide:',
      parkingInfoCardTitle: 'Parking Instructions & Guidance',
      parkingInfoNoticeText: 'The host school provides written parking guidance for invited agency representatives as detailed below.',
      parkingPassStatusText: 'Status: Valid Registered · 1 Slot Allocated',
      labelAdminInputCatatanKhas: 'Special Notes / Agency Dress Code',
      placeholderAdminInputCatatanKhas: 'e.g., Formal office attire / blazer. Booth setup starts at 06:45 AM.',
      btnSaveAdminEventText: 'Save Event & Map Changes',

      // Modals & Extras
      mapModalCloseBtn: 'Close',
      docModalTitle: 'Official QR Letter Preview',
      docModalCloseBtn: 'Close',
      docModalPrintBtnText: 'Print PDF',
      eventDetailsHeaderTitle: 'Event Details & Organizer Guide',
      btnOpenGpsMapsText: 'Open Hall GPS Navigation in Google Maps',
      labelEventDetailsNotes: 'Special Notes for Agencies:',
      btnEventDetailsFloorText: 'Floor Plan',
      btnEventDetailsParkingText: 'Parking Map',
      btnEventDetailsRsvpText: 'Fill / Update RSVP & Logistics Form →',
      parkingScreenTitle: 'Agency Parking Guide & Location',
      parkingZoneBadge: 'INVITED AGENCY PARKING ZONE',
      gateABadge: 'GATE A (Buses)',
      gateBBadge: 'GATE B (Agencies Only)',
      parkingBlockCBadge: 'Agency Parking Zone (Block C)',
      parkingReservedSub: 'Reserved Slots Beside School Field',
      parkingPassStatusText: 'Status: Valid Registered · Reserved Slot',
      btnGpsParkingNavText: 'GPS Navigation to Agency Parking Lot',
      floorPlanScreenTitle: 'Hall Floor Plan & Exhibition Booth Layout',
      floorPlanVenueLabel: 'School Hall / Event Venue',
      floorPlanBoothAvailableLabel: 'Exhibition Booths Provided',
      floorPlanMainStage: 'Main Stage & Opening Ceremony',
      floorPlanStudentEntrance: 'Main Hall Entrance (Students)',
      btnFloorPlanZoomText: 'Fullscreen / Zoom Floor Plan',
      archiveScreenTitle: 'Annual Program Calendar',
      notifScreenTitle: 'Notifications & Event Alerts',
      btnMarkAllNotifsRead: 'Mark All as Read',
      btnClearAllNotifs: 'Clear All',
      profileScreenTitle: 'Agency Profile & Settings',
      profileRegisteredAccountLabel: 'Registered Agency Account',
      profileAgencyStatusText: 'Status: Official Invited Agency CEU JSS',
      syncCalendarThisSession: 'This Session'
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
    
    // Kemaskini atribut lang HTML
    document.documentElement.lang = (lang === 'EN' ? 'en' : 'ms');

    // Terapkan ke semua elemen statik DOM
    this.applyToDOM();

    // Kemaskini navigasi (desktop & mobile)
    if (typeof updateBottomNav === 'function' && typeof AppState !== 'undefined') {
      updateBottomNav(AppState.currentView || (AppState.currentUser ? (AppState.currentUser.role === 'ADMIN' ? 'admin' : 'home') : 'login'));
    }

    // Jika di skrin log masuk, kemaskini mod log masuk aktif
    if (typeof AppState === 'undefined' || !AppState.currentUser) {
      const isAgencyTab = document.getElementById('tabModeAgency') && document.getElementById('tabModeAgency').classList.contains('bg-[#148e82]');
      if (typeof switchLoginMode === 'function') {
        switchLoginMode(isAgencyTab ? 'AGENCY' : 'ADMIN');
      }
      return;
    }

    // Jika pengguna sudah log masuk, render semula skrin aktif secara reaktif
    if (AppState.currentUser) {
      if (AppState.currentView === 'home' && typeof renderHomeScreen === 'function') {
        renderHomeScreen(false);
      } else if (AppState.currentView === 'admin' && typeof renderAdminDashboard === 'function') {
        renderAdminDashboard();
      } else if (AppState.currentView === 'adminEvents' && typeof renderAdminEventsList === 'function') {
        renderAdminEventsList();
      } else if (AppState.currentView === 'rsvpForm' && typeof renderRsvpFormScreen === 'function') {
        renderRsvpFormScreen(AppState.activeEvent ? AppState.activeEvent.Event_ID : null);
      } else if (AppState.currentView === 'eventDetails' && typeof renderEventDetailsScreen === 'function') {
        renderEventDetailsScreen(AppState.activeEvent ? AppState.activeEvent.Event_ID : null);
      } else if (AppState.currentView === 'notifications' && typeof renderNotificationsScreen === 'function') {
        renderNotificationsScreen();
      } else if (AppState.currentView === 'profile' && typeof renderProfileScreen === 'function') {
        renderProfileScreen();
      } else if (AppState.currentView === 'parking' && typeof renderParkingScreen === 'function') {
        renderParkingScreen(AppState.activeEvent ? AppState.activeEvent.Event_ID : null);
      } else if (AppState.currentView === 'archive' && typeof renderArchiveScreen === 'function') {
        renderArchiveScreen();
      }
    }
  },

  applyToDOM: function() {
    const isEn = this.currentLang === 'EN';

    // 1. Kemaskini atribut lang HTML
    document.documentElement.lang = isEn ? 'en' : 'ms';

    // 2. Kemaskini semua Butang Togol Bahasa (.btn-lang-toggle)
    document.querySelectorAll('.btn-lang-toggle').forEach(btn => {
      const targetLang = btn.getAttribute('data-lang');
      if (targetLang === this.currentLang) {
        btn.classList.add('bg-[#f59e0b]', 'text-slate-900', 'font-bold', 'shadow-sm');
        btn.classList.remove('text-slate-600', 'text-white/80', 'text-on-primary/80', 'font-medium', 'bg-tertiary', 'bg-tertiary-fixed', 'text-on-tertiary-fixed');
      } else {
        btn.classList.remove('bg-[#f59e0b]', 'text-slate-900', 'font-bold', 'shadow-sm', 'bg-tertiary', 'bg-tertiary-fixed', 'text-on-tertiary-fixed');
        btn.classList.add('font-medium');
        if (btn.closest('#desktopNavBar') || btn.closest('#screen_login .md\\:flex')) {
          btn.classList.add('text-slate-600');
          btn.classList.remove('text-white/80');
        } else {
          btn.classList.add('text-white/80');
          btn.classList.remove('text-slate-600');
        }
      }
    });

    // 3. Elemen dengan atribut [data-i18n]
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const text = this.t(key);
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        if (el.hasAttribute('placeholder')) el.setAttribute('placeholder', text);
      } else {
        el.innerText = text;
      }
    });

    // 4. Penterjemahan Elemen Statik Khusus Mengikut ID DOM

    // --- Skrin Log Masuk ---
    const accessBadge = document.getElementById('loginAgencyAccessBadge');
    if (accessBadge) {
      const isAgencyTab = document.getElementById('tabModeAgency') && document.getElementById('tabModeAgency').classList.contains('bg-[#148e82]');
      if (isAgencyTab) {
        accessBadge.innerText = isEn ? 'OFFICIAL INVITED AGENCY ACCESS' : 'AKSES AGENSI JEMPUTAN RASMI';
      } else {
        accessBadge.innerText = isEn ? 'CEU ADMINISTRATOR ACCESS' : 'AKSES PENTADBIR CEU';
      }
    }

    const emblemMinistry = document.getElementById('loginEmblemMinistry');
    if (emblemMinistry) emblemMinistry.innerText = isEn ? 'MINISTRY OF EDUCATION' : 'KEMENTERIAN PENDIDIKAN';

    const loginSub = document.getElementById('loginSystemSubtitle');
    if (loginSub) {
      loginSub.innerHTML = isEn 
        ? 'Career Education Unit • Department of Schools<br/><span class="opacity-80">Brunei Darussalam</span>'
        : 'Unit Pendidikan Kerjaya • Jabatan Sekolah-Sekolah<br/><span class="opacity-80">Negara Brunei Darussalam</span>';
    }

    const f1 = document.getElementById('featureItem1');
    if (f1) f1.innerText = isEn ? 'Delegation & Attendance Confirmation (RSVP)' : 'Pengesahan Delegasi & Kehadiran (RSVP)';
    const f2 = document.getElementById('featureItem2');
    if (f2) f2.innerText = isEn ? 'Hall Exhibition Tables & Power Sockets' : 'Tempahan Meja Dewan & Soket Elektrik';
    const f3 = document.getElementById('featureItem3');
    if (f3) f3.innerText = isEn ? 'Designated Gate B Parking Lots' : 'Tempat Letak Kereta Khusus Pintu Pagar B';
    const f4 = document.getElementById('featureItem4');
    if (f4) f4.innerText = isEn ? 'Official Invitation Letters with QR Security' : 'Surat Jemputan Rasmi Ber-QR Keselamatan';

    const loginLeftFoot = document.getElementById('loginLeftFooter');
    if (loginLeftFoot) {
      loginLeftFoot.innerText = isEn ? 'Hala Tuju & FutureLink 2026 Event Management System' : 'Sistem Pengurusan Acara Hala Tuju & FutureLink 2026';
    }

    const loginWelcome = document.getElementById('loginWelcomeHeading');
    if (loginWelcome) {
      loginWelcome.innerHTML = isEn 
        ? 'Welcome Back <span class="text-xs text-on-surface-variant font-normal">/ Selamat Datang</span>'
        : 'Selamat Datang <span class="text-xs text-on-surface-variant font-normal">/ Welcome</span>';
    }

    const lPassText = document.getElementById('labelLoginPasswordText');
    if (lPassText) lPassText.innerText = isEn ? 'Official Password' : 'Kata Laluan Rasmi';
    const lPassSub = document.getElementById('labelLoginPasswordSubtext');
    if (lPassSub) lPassSub.innerText = isEn ? 'Credentials' : 'Kredensial';

    const lHelpCred = document.getElementById('loginHelpCredentials');
    if (lHelpCred) lHelpCred.innerText = isEn ? 'Need Credential Help?' : 'Bantuan Kredensial?';

    const lMinFoot = document.getElementById('loginMinistryFooter');
    if (lMinFoot) {
      lMinFoot.innerText = isEn ? 'Ministry of Education, Brunei Darussalam · v2.1.0' : 'Kementerian Pendidikan, Negara Brunei Darussalam · v2.1.0';
    }

    const tabAgency = document.getElementById('tabModeAgency');
    if (tabAgency) {
      const span = tabAgency.querySelector('span:last-child') || tabAgency;
      span.innerText = isEn ? 'Agency' : 'Agensi';
    }
    const tabAdmin = document.getElementById('tabModeAdmin');
    if (tabAdmin) {
      const span = tabAdmin.querySelector('span:last-child') || tabAdmin;
      span.innerText = 'Admin';
    }

    const helpLink = document.querySelector('#formLogin a[onclick*="alert"]');
    if (helpLink) helpLink.innerText = isEn ? 'Need Credential Help?' : 'Bantuan Kredensial?';

    // --- Home Screen: Header, Mini Kalendar & Metrik ---
    const mobileUnit = document.getElementById('homeMobileEmblemUnit');
    if (mobileUnit) mobileUnit.innerText = isEn ? 'MOE • CAREER UNIT' : 'KPM • UNIT KERJAYA';

    const btnSyncCal = document.getElementById('btnSyncCalToActive');
    if (btnSyncCal) btnSyncCal.innerText = isEn ? 'This Session' : 'Sesi Ini';

    const hWelcome = document.getElementById('homeWelcomeBadge');
    if (hWelcome) hWelcome.innerText = isEn ? 'WELCOME • INVITED AGENCY' : 'SELAMAT DATANG • AGENSI JEMPUTAN';

    const hCountry = document.getElementById('homeCountryBadge');
    if (hCountry) hCountry.innerText = isEn ? 'Brunei Darussalam' : 'Negara Brunei Darussalam';

    const hDesc = document.getElementById('homeWelcomeDesc');
    if (hDesc) hDesc.innerText = isEn ? 'Calendar & Logistics Coordination Session for Program Hala Tuju & FutureLink.' : 'Sesi Penyelarasan Takwim & Logistik Program Hala Tuju & FutureLink.';

    const mLabel1 = document.getElementById('homeMetricLabel1');
    if (mLabel1) mLabel1.innerText = isEn ? 'Official Takwim Sessions' : 'Jumlah Sesi Takwim';

    if (typeof renderHomeMiniCalendar === 'function') {
      renderHomeMiniCalendar();
    }

    const mLabel2 = document.getElementById('homeMetricLabel2');
    if (mLabel2) mLabel2.innerText = isEn ? 'Attended' : 'Selesai Hadir';

    const mLabel3 = document.getElementById('homeMetricLabel3');
    if (mLabel3) mLabel3.innerText = isEn ? 'Action Required (RSVP)' : 'Perlu Tindakan RSVP';

    const sSelectText = document.getElementById('homeSessionSelectorText');
    if (sSelectText) sSelectText.innerText = isEn ? 'Select School Session / Program (31 Sessions)' : 'Pilih Sesi Sekolah / Program (31 Sesi)';

    const sTakwimBadge = document.getElementById('homeOfficialTakwimBadge');
    if (sTakwimBadge) sTakwimBadge.innerText = isEn ? 'Official 2027 Calendar' : 'Takwim Rasmi 2027';

    // --- Home Screen: Penapis Kategori & Daerah ---
    const fCatAll = document.getElementById('filterCat_ALL');
    if (fCatAll) fCatAll.innerText = isEn ? 'All (31)' : 'Semua (31)';
    const fCatPht = document.getElementById('filterCat_PHT');
    if (fCatPht) fCatPht.innerText = isEn ? 'Hala Tuju (27)' : 'Hala Tuju (27)';
    const fCatFl = document.getElementById('filterCat_FL');
    if (fCatFl) fCatFl.innerText = isEn ? 'FutureLink (4)' : 'FutureLink (4)';

    const fDistAll = document.getElementById('filterDist_ALL');
    if (fDistAll) fDistAll.innerText = isEn ? 'All Districts' : 'Semua Daerah';

    // --- Home Screen: 2 Kad Pintasan ---
    const shortcutButtons = document.querySelectorAll('#screen_home .grid.grid-cols-2 button');
    if (shortcutButtons.length >= 2) {
      const btnFloor = shortcutButtons[0];
      const titleF = btnFloor.querySelector('.font-bold');
      const subF = btnFloor.querySelector('.text-slate-500');
      if (titleF) titleF.innerText = isEn ? 'Hall Floor Plan' : 'Pelan Dewan';
      if (subF) subF.innerText = isEn ? 'Exhibition & booth layout' : 'Susun atur meja pameran & dewan';

      const btnPark = shortcutButtons[1];
      const titleP = btnPark.querySelector('.font-bold');
      const subP = btnPark.querySelector('.text-slate-500');
      if (titleP) titleP.innerText = isEn ? 'Parking Map' : 'Peta Parking';
      if (subP) subP.innerText = isEn ? 'Gate B (Agency Designated)' : 'Pintu Pagar B (Khusus Agensi)';
    }

    // --- Home Screen: Takwim Schedule Header & Views ---
    const sHeader = document.getElementById('homeScheduleHeaderTitle');
    if (sHeader) sHeader.innerText = isEn ? '31 School Sessions Schedule (2027)' : 'Jadual Takwim 31 Sesi Sekolah (2027)';

    const vAll = document.getElementById('viewMode_ALL');
    if (vAll) {
      const sp = vAll.querySelector('span:last-child');
      if (sp) sp.innerText = isEn ? 'All' : 'Semua';
    }
    const vMonthly = document.getElementById('viewMode_MONTHLY');
    if (vMonthly) {
      const sp = vMonthly.querySelector('span:last-child');
      if (sp) sp.innerText = isEn ? 'Monthly' : 'Bulanan';
    }
    const vWeekly = document.getElementById('viewMode_WEEKLY');
    if (vWeekly) {
      const sp = vWeekly.querySelector('span:last-child');
      if (sp) sp.innerText = isEn ? 'Weekly' : 'Mingguan';
    }

    const pillMonthAll = document.getElementById('pillMonth_ALL');
    if (pillMonthAll) pillMonthAll.innerText = isEn ? 'All Months (31)' : 'Semua Bulan (31)';
    const pillMonth03 = document.getElementById('pillMonth_03');
    if (pillMonth03) pillMonth03.innerText = isEn ? 'Mar (5)' : 'Mac (5)';
    const pillMonth05 = document.getElementById('pillMonth_05');
    if (pillMonth05) pillMonth05.innerText = isEn ? 'May (2)' : 'Mei (2)';

    const homeSearch = document.getElementById('homeScheduleSearch');
    if (homeSearch) homeSearch.placeholder = isEn ? 'Search school, venue, date...' : 'Cari sekolah, venue, tarikh...';

    // --- Home Screen: 3 Kad Sidebar Kanan ---
    const sCard1Header = document.getElementById('sidebarCard1Header');
    if (sCard1Header) sCard1Header.innerText = isEn ? 'Action Required' : 'Tindakan Diperlukan';
    const sCard1Title = document.getElementById('sidebarCard1Title');
    if (sCard1Title) sCard1Title.innerText = isEn ? 'Calendar Session RSVP Confirmation' : 'Pengesahan RSVP Sesi Takwim';
    const sCard1Desc = document.getElementById('sidebarCard1Desc');
    if (sCard1Desc) sCard1Desc.innerText = isEn ? 'Please confirm agency attendance & delegation details for exhibition booth labelling & agency parking passes.' : 'Sila sahkan kehadiran & butiran delegasi agensi bagi penyediaan pelekat meja pameran & pas parking agensi.';
    const sCard1Btn = document.getElementById('sidebarCard1BtnText');
    if (sCard1Btn) sCard1Btn.innerText = isEn ? 'Fill RSVP Form for Selected Session' : 'Isi Borang RSVP Sesi Terpilih';

    const sCard2Header = document.getElementById('sidebarCard2Header');
    if (sCard2Header) sCard2Header.innerText = isEn ? 'Provided Amenities' : 'Kemudahan Disediakan';
    const aLi1 = document.getElementById('amenityLi1');
    if (aLi1) aLi1.innerText = isEn ? '1 Standard Exhibition Table (covered)' : '1 Meja Pameran standard (beralas)';
    const aLi2 = document.getElementById('amenityLi2');
    if (aLi2) aLi2.innerText = isEn ? '2 Agency exhibitor chairs' : '2 Kerusi pegawai pempamer agensi';
    const aLi3 = document.getElementById('amenityLi3');
    if (aLi3) aLi3.innerText = isEn ? '1 Electrical extension plug (upon request)' : '1 Soket plug elektrik (atas permintaan)';
    const aLi4 = document.getElementById('amenityLi4');
    if (aLi4) aLi4.innerText = isEn ? '1 Dedicated agency parking slot' : '1 Petak letak kereta khas agensi';
    const aFloorBtn = document.getElementById('amenityFloorBtnText');
    if (aFloorBtn) aFloorBtn.innerText = isEn ? 'Booth Layout Plan →' : 'Pelan Meja Booth →';
    const aParkingBtn = document.getElementById('amenityParkingBtnText');
    if (aParkingBtn) aParkingBtn.innerText = isEn ? 'Agency Parking Guide →' : 'Panduan Parking Agensi →';

    const sCard3Title = document.getElementById('sidebarCard3Title');
    if (sCard3Title) sCard3Title.innerText = isEn ? 'Attendance Constraints?' : 'Ada Kekangan Kehadiran?';
    const sCard3Sub = document.getElementById('sidebarCard3Sub');
    if (sCard3Sub) sCard3Sub.innerText = isEn ? 'Contact CEU Secretariat' : 'Hubungi Urus Setia UPK';
    const sCard3Phone = document.getElementById('sidebarCard3PhoneLabel');
    if (sCard3Phone) sCard3Phone.innerText = isEn ? 'CEU Hotline:' : 'Talian CEU:';
    const sCard3Email = document.getElementById('sidebarCard3EmailLabel');
    if (sCard3Email) sCard3Email.innerText = isEn ? 'Official Email:' : 'Emel Rasmi:';
    const sCard3Btn = document.getElementById('sidebarCard3BtnText');
    if (sCard3Btn) sCard3Btn.innerText = isEn ? 'Update RSVP Status' : 'Kemaskini Status RSVP';

    // --- Skrin Borang RSVP ---
    const rHeaderTitle = document.getElementById('rsvpFormHeaderTitle');
    if (rHeaderTitle) rHeaderTitle.innerText = isEn ? 'RSVP Confirmation & Logistics Request' : 'Pengesahan RSVP & Permohonan Logistik';

    const rEditTitle = document.getElementById('rsvpEditBannerTitle');
    if (rEditTitle) rEditTitle.innerText = isEn ? 'Edit RSVP' : 'Kemaskini RSVP';
    const rEditDesc = document.getElementById('rsvpEditBannerDesc');
    if (rEditDesc) rEditDesc.innerText = isEn ? 'You are editing your RSVP confirmation for this session. Any changes will be recorded.' : 'Anda sedang mengemaskini maklumat RSVP yang telah direkodkan sebelumnya. Sebarang perubahan boleh dihantar semula.';

    const rSessTitle = document.getElementById('rsvpSessionSelectTitle');
    if (rSessTitle) rSessTitle.innerText = isEn ? 'Select School / Program Session *' : 'Pilih Sesi Sekolah / Program *';
    const rSessBadge = document.getElementById('rsvpSessionBadge');
    if (rSessBadge) rSessBadge.innerText = isEn ? '31 Calendar Sessions' : '31 Sesi Takwim';
    const rStatHead = document.getElementById('rsvpStatusHeading');
    if (rStatHead) rStatHead.innerText = isEn ? 'Agency Attendance Status *' : 'Status Kehadiran Agensi *';

    const optAttending = document.getElementById('optStatusAttending');
    if (optAttending) {
      const title = optAttending.querySelector('.font-bold');
      const sub = optAttending.querySelector('.text-slate-500') || optAttending.querySelector('.text-on-surface-variant');
      if (title) title.innerText = isEn ? 'Attending' : 'Hadir (Attending)';
      if (sub) sub.innerText = isEn ? 'Participating in Exhibition Booth' : 'Menyertai Pameran Booth';
    }
    const optNotAttending = document.getElementById('optStatusNotAttending');
    if (optNotAttending) {
      const title = optNotAttending.querySelector('.font-bold');
      const sub = optNotAttending.querySelector('.text-slate-500') || optNotAttending.querySelector('.text-on-surface-variant');
      if (title) title.innerText = isEn ? 'Not Attending' : 'Tidak Hadir (Not Attending)';
      if (sub) sub.innerText = isEn ? 'Schedule constraints' : 'Kekangan jadual';
    }

    const notAttTitle = document.getElementById('notAttendingNoticeTitle');
    if (notAttTitle) notAttTitle.innerText = isEn ? 'Not Attending Confirmation' : 'Pengesahan Tidak Hadir';
    const notAttText = document.getElementById('rsvpNotAttendingNoticeText');
    if (notAttText) notAttText.innerText = isEn ? 'Your agency has confirmed not attending this exhibition session due to schedule constraints. No hall logistics (tables/chairs/plugs) will be allocated.' : 'Agensi anda mengesahkan tidak dapat menyertai sesi pameran ini kerana kekangan jadual. Tiada kelengkapan dewan (meja/kerusi/plug) diperuntukkan.';

    const rLogisticsHead = document.getElementById('rsvpLogisticsHeader');
    if (rLogisticsHead) rLogisticsHead.innerText = isEn ? 'School Hall Logistics Requirements' : 'Keperluan Logistik Dewan Sekolah';
    const rLogisticsSub = document.getElementById('rsvpLogisticsSubtext');
    if (rLogisticsSub) rLogisticsSub.innerText = isEn ? 'The host school will prepare the following items at your booth:' : 'Pihak penganjur akan menyediakan kelengkapan berikut di dewan:';

    const lMeja = document.getElementById('labelStepperMeja');
    if (lMeja) lMeja.innerText = isEn ? 'Number of Tables' : 'Bilangan Meja';
    const lKerusi = document.getElementById('labelStepperKerusi');
    if (lKerusi) lKerusi.innerText = isEn ? 'Number of Chairs' : 'Bilangan Kerusi';
    const lPlug = document.getElementById('labelStepperPlug');
    if (lPlug) lPlug.innerText = isEn ? 'Electrical Extension Plug' : 'Penyambung Elektrik (Plug)';
    const lWakil = document.getElementById('labelStepperWakil');
    if (lWakil) lWakil.innerText = isEn ? 'Number of Attending Staff' : 'Jumlah Wakil Hadir';

    const lNamaWakil = document.getElementById('labelInputNamaWakil');
    if (lNamaWakil) lNamaWakil.innerText = isEn ? 'Officers On Duty Names (Optional)' : 'Nama Pegawai Bertugas (Pilihan)';
    const inNamaWakil = document.getElementById('inputNamaWakil');
    if (inNamaWakil) inNamaWakil.placeholder = isEn ? 'e.g., 1. Awang Mohd Azmi, 2. Dayang Hjh Siti...' : 'cth: 1. Awang Mohd Azmi, 2. Dayang Hjh Siti...';

    const lVipPark = document.getElementById('labelVipParkingInfo');
    if (lVipPark) lVipPark.innerText = isEn ? 'Agency Parking Pass' : 'Pas Letak Kereta Agensi';
    const bVipCar = document.getElementById('badgeVipCar');
    if (bVipCar) bVipCar.innerText = isEn ? '1 Slot Allocated' : '1 Petak Disediakan';
    const hVipPark = document.getElementById('hintVipParkingInfo');
    if (hVipPark) hVipPark.innerText = isEn ? '1 reserved parking slot is provided in the school compound for your agency without requiring vehicle license plate registration.' : '1 petak letak kereta khas disediakan di kawasan sekolah bagi agensi anda tanpa perlu mendaftar nombor plat.';

    const lKepLain = document.getElementById('labelInputKeperluanLain');
    if (lKepLain) lKepLain.innerText = isEn ? 'Special Logistics Requests / Notes (Optional)' : 'Keperluan Logistik Tambahan (Pilihan)';
    const inKepLain = document.getElementById('inputKeperluanLain');
    if (inKepLain) inKepLain.placeholder = isEn ? 'e.g., Require extra space for roll-up banners...' : 'cth: Perlukan ruang tambahan untuk bunting berdiri...';

    const checkDeclLabel = document.getElementById('labelDeclaration') || document.querySelector('label[for="checkDeclaration"]');
    if (checkDeclLabel) {
      checkDeclLabel.innerText = isEn 
        ? 'The agency confirms that this logistics request is final and accurate.'
        : 'Pihak agensi mengesahkan maklumat permohonan logistik ini adalah muktamad.';
    }

    const btnCancelR = document.getElementById('btnCancelRsvpText') || document.getElementById('btnCancelRsvp');
    if (btnCancelR) btnCancelR.innerText = isEn ? 'Cancel' : 'Batal';

    const btnSubmitRsvp = document.getElementById('btnSubmitRsvpText') || document.getElementById('btnSubmitRsvpAction');
    if (btnSubmitRsvp) {
      const isEdit = (typeof AppState !== 'undefined' && AppState.rsvps && AppState.activeEvent && AppState.currentUser)
        ? AppState.rsvps.some(r => r.Event_ID === AppState.activeEvent.Event_ID && r.Agensi_ID === AppState.currentUser.id)
        : false;
      btnSubmitRsvp.innerText = isEdit
        ? (isEn ? 'Update RSVP Confirmation' : 'Kemaskini Pengesahan RSVP')
        : (isEn ? 'Submit RSVP Confirmation' : 'Hantar Pengesahan (Submit RSVP)');
    }

    // Modal WhatsApp Success
    const waModalBtn = document.getElementById('btnSendWhatsAppModalText');
    if (waModalBtn) waModalBtn.innerText = isEn ? 'Send Notification to WhatsApp (+6738669690)' : 'Hantar Notifikasi ke WhatsApp (+6738669690)';
    const waDocBtn = document.getElementById('btnRsvpSuccessViewLetter');
    if (waDocBtn) waDocBtn.innerText = isEn ? 'Official Letter' : 'Surat Rasmi';
    const waDoneBtn = document.getElementById('btnRsvpSuccessDone');
    if (waDoneBtn) waDoneBtn.innerText = isEn ? 'Done (Calendar)' : 'Selesai (Takwim)';

    const lParkPass = document.getElementById('labelParkingPassHeader');
    if (lParkPass) lParkPass.innerText = isEn ? 'OFFICIAL AGENCY PARKING PASS' : 'PAS PARKING RASMI AGENSI';

    // --- Skrin Butiran Acara (screen_eventDetails) ---
    const edTitle = document.getElementById('eventDetailsHeaderTitle');
    if (edTitle) edTitle.innerText = isEn ? 'Event Details & Organizer Guide' : 'Butiran Acara & Panduan Penganjur';
    const edBadge = document.getElementById('eventDetailsBadge');
    if (edBadge) edBadge.innerText = isEn ? 'Official 2027 Calendar Session' : 'Program Hala Tuju 2026';
    const edGpsBtnText = document.getElementById('btnOpenGpsMapsText');
    if (edGpsBtnText) edGpsBtnText.innerText = isEn ? 'Open Hall GPS Navigation in Google Maps' : 'Buka Peta GPS Dewan di Google Maps';
    const edNotesLabel = document.getElementById('labelEventDetailsNotes');
    if (edNotesLabel) edNotesLabel.innerText = isEn ? 'Special Notes for Agencies:' : 'Catatan Khas untuk Agensi:';
    const edFloorBtnText = document.getElementById('btnEventDetailsFloorText');
    if (edFloorBtnText) edFloorBtnText.innerText = isEn ? 'Floor Plan' : 'Pelan Dewan';
    const edParkingBtnText = document.getElementById('btnEventDetailsParkingText');
    if (edParkingBtnText) edParkingBtnText.innerText = isEn ? 'Parking Map' : 'Peta Parking';
    const edRsvpBtnText = document.getElementById('btnEventDetailsRsvpText');
    if (edRsvpBtnText) edRsvpBtnText.innerText = isEn ? 'Fill / Update RSVP & Logistics Form →' : 'Isi / Kemaskini Borang RSVP & Logistik →';

    // --- Skrin Panduan Parking (screen_parking) ---
    const parkTitle = document.getElementById('parkingScreenTitle');
    if (parkTitle) parkTitle.innerText = isEn ? 'Agency Parking Guide & Location' : 'Panduan & Lokasi Parking Agensi';
    const parkZoneBadge = document.getElementById('parkingZoneBadge');
    if (parkZoneBadge) parkZoneBadge.innerText = isEn ? 'INVITED AGENCY PARKING ZONE' : 'ZON LETAK KERETA AGENSI JEMPUTAN';
    const gABadge = document.getElementById('gateABadge');
    if (gABadge) gABadge.innerText = isEn ? 'GATE A (Buses)' : 'PINTU PAGAR A (Bas)';
    const gBBadge = document.getElementById('gateBBadge');
    if (gBBadge) gBBadge.innerText = isEn ? 'GATE B (Agencies Only)' : 'PINTU PAGAR B (Khas Agensi)';
    const pBlockC = document.getElementById('parkingBlockCBadge');
    if (pBlockC) pBlockC.innerText = isEn ? 'Agency Parking Zone (Block C)' : 'Zon Parking Agensi (Blok C)';
    const pReserved = document.getElementById('parkingReservedSub');
    if (pReserved) pReserved.innerText = isEn ? 'Reserved Slots Beside School Field' : 'Petak Rezab Bersebelahan Padang';
    const pGuide = document.getElementById('parkingGuideText');
    if (pGuide) pGuide.innerText = isEn ? 'Access Route: Please follow host school guidance for designated agency representative parking.' : 'Laluan Masuk: Sila patuhi panduan pihak sekolah bagi tempat letak kereta rasmi wakil agensi.';
    const pPassStatus = document.getElementById('parkingPassStatusText');
    if (pPassStatus) pPassStatus.innerText = isEn ? 'Status: Valid Registered · 1 Slot Allocated' : 'Status: Sah Berdaftar · 1 Petak Disediakan';
    const btnGpsNav = document.getElementById('btnGpsParkingNavText');
    if (btnGpsNav) btnGpsNav.innerText = isEn ? 'GPS Navigation to Agency Parking Lot' : 'Pandu Arah GPS ke Tempat Letak Kereta Agensi';

    // --- Skrin Pelan Dewan (screen_floorPlan) ---
    const fPlanTitle = document.getElementById('floorPlanScreenTitle');
    if (fPlanTitle) fPlanTitle.innerText = isEn ? 'Hall Floor Plan & Exhibition Booth Layout' : 'Pelan Susun Atur Dewan & Meja Pameran';
    const fVenueLabel = document.getElementById('floorPlanVenueLabel');
    if (fVenueLabel) fVenueLabel.innerText = isEn ? 'School Hall / Event Venue' : 'Dewan Sekolah / Tempat Acara';
    const fBoothAvail = document.getElementById('floorPlanBoothAvailableLabel');
    if (fBoothAvail) fBoothAvail.innerText = isEn ? 'Exhibition Booths Provided' : 'Petak Booth Disediakan';
    const fStage = document.getElementById('floorPlanMainStage');
    if (fStage) fStage.innerText = isEn ? 'Main Stage & Opening Ceremony' : 'Pentas Utama & Perasmian Ekspo';
    const fEntrance = document.getElementById('floorPlanStudentEntrance');
    if (fEntrance) fEntrance.innerText = isEn ? 'Main Hall Entrance (Students)' : 'Pintu Masuk Utama Dewan (Pelajar)';
    const fZoomBtn = document.getElementById('btnFloorPlanZoomText');
    if (fZoomBtn) fZoomBtn.innerText = isEn ? 'Fullscreen / Zoom Floor Plan' : 'Besarkan Pelan Dewan (Fullscreen / Pinch-to-Zoom)';

    // --- Skrin Takwim & Arkib (screen_archive) ---
    const archTitle = document.getElementById('archiveScreenTitle');
    if (archTitle) archTitle.innerText = isEn ? 'Annual Program Calendar' : 'Takwim Tahunan Program';
    const archFAll = document.getElementById('archiveFilterAll');
    if (archFAll) archFAll.innerText = isEn ? 'All' : 'Semua';
    const archFPht = document.getElementById('archiveFilterPht');
    if (archFPht) archFPht.innerText = isEn ? 'Hala Tuju' : 'Hala Tuju';
    const archFFl = document.getElementById('archiveFilterFl');
    if (archFFl) archFFl.innerText = isEn ? 'FutureLink' : 'FutureLink';
    const archFBrief = document.getElementById('archiveFilterBriefing');
    if (archFBrief) archFBrief.innerText = isEn ? 'Briefing' : 'Taklimat';

    // --- Skrin Notifikasi (screen_notifications) ---
    const notifTitle = document.getElementById('notifScreenTitle');
    if (notifTitle) notifTitle.innerText = isEn ? 'Notifications & Event Alerts' : 'Notifikasi & Peringatan Acara';
    const btnMarkAll = document.getElementById('btnMarkAllNotifsRead');
    if (btnMarkAll) btnMarkAll.innerText = isEn ? 'Mark All as Read' : 'Tanda Semua Dibaca';
    const btnClearAll = document.getElementById('btnClearAllNotifs');
    if (btnClearAll) btnClearAll.innerText = isEn ? 'Clear All' : 'Kosongkan Semua';

    // --- Skrin Profil (screen_profile) ---
    const profTitle = document.getElementById('profileScreenTitle');
    if (profTitle) profTitle.innerText = isEn ? 'Agency Profile & Settings' : 'Profil Agensi & Tetapan';
    const profAccLabel = document.getElementById('profileRegisteredAccountLabel');
    if (profAccLabel) profAccLabel.innerText = isEn ? 'Registered Agency Account' : 'Akaun Agensi Berdaftar';
    const profStatus = document.getElementById('profileAgencyStatusText');
    if (profStatus) profStatus.innerText = isEn ? 'Status: Official Invited Agency CEU JSS' : 'Status: Agensi Jemputan Rasmi CEU JSS';

    // --- Skrin Urus Program Pentadbir (screen_adminEvents) ---
    const aeBadge = document.getElementById('adminEventsHeaderBadge');
    if (aeBadge) aeBadge.innerText = isEn ? 'CAREER EDUCATION UNIT ADMINISTRATOR' : 'PENTADBIR UNIT PENDIDIKAN KERJAYA';
    const aeRole = document.getElementById('adminEventsRoleBadge');
    if (aeRole) aeRole.innerText = 'ADMIN';
    const aeTitle = document.getElementById('adminEventsHeaderTitle');
    if (aeTitle) aeTitle.innerText = isEn ? 'Program Management & School Maps' : 'Pengurusan Program & Peta Sekolah';
    const aeDesc = document.getElementById('adminEventsHeaderDesc');
    if (aeDesc) aeDesc.innerText = isEn ? 'Manage event details, update venues, hall floor plans, and Gate B parking locations.' : 'Urus maklumat acara, kemaskini dewan venue, pautan pelan dewan dan lokasi parking pintu pagar B.';
    const aeBackBtn = document.getElementById('adminEventsBtnBackText');
    if (aeBackBtn) aeBackBtn.innerText = isEn ? 'Back to Dashboard' : 'Kembali ke Papan Pemuka';
    const aeSecTitle = document.getElementById('adminEventsSectionTitle');
    if (aeSecTitle) aeSecTitle.innerText = isEn ? 'Active Programs & Current Calendar (31 Sessions)' : 'Program Aktif & Takwim Semasa (31 Sesi)';
    const aeSearch = document.getElementById('adminEventsSearchInput');
    if (aeSearch) aeSearch.placeholder = isEn ? 'Search school or hall...' : 'Cari sekolah atau dewan...';

    const aeCatAll = document.getElementById('adminFilterCat_ALL');
    if (aeCatAll) aeCatAll.innerText = isEn ? 'All (31)' : 'Semua (31)';
    const aeDistAll = document.getElementById('adminFilterDist_ALL');
    if (aeDistAll) aeDistAll.innerText = isEn ? 'All Districts' : 'Semua Daerah';

    const aeFormTitle = document.getElementById('adminEventFormTitle');
    if (aeFormTitle && (typeof AppState === 'undefined' || !AppState.activeAdminEditId)) {
      aeFormTitle.innerText = isEn ? 'Update Event & Logistics Details' : 'Kemaskini Butiran Acara & Logistik';
    }
    const lAeNama = document.getElementById('labelAdminInputNamaAcara');
    if (lAeNama) lAeNama.innerText = isEn ? 'Event / Program Name *' : 'Nama Acara / Program *';
    const lAeCat = document.getElementById('labelAdminInputKategori');
    if (lAeCat) lAeCat.innerText = isEn ? 'Program Category' : 'Kategori Program';
    const lAeDate = document.getElementById('labelAdminInputTarikhMula');
    if (lAeDate) lAeDate.innerText = isEn ? 'Event Date *' : 'Tarikh Acara *';
    const inAeDate = document.getElementById('adminInputTarikhMula');
    if (inAeDate) inAeDate.placeholder = isEn ? 'e.g., 25 Jan 2027' : 'cth: 15 Mac 2026';
    const lAeTime = document.getElementById('labelAdminInputMasa');
    if (lAeTime) lAeTime.innerText = isEn ? 'Program Time *' : 'Masa Program *';
    const inAeTime = document.getElementById('adminInputMasa');
    if (inAeTime) inAeTime.placeholder = isEn ? 'e.g., 08:00 - 16:30' : 'cth: 08:00 - 16:30';
    const lAeVenue = document.getElementById('labelAdminInputTempat');
    if (lAeVenue) lAeVenue.innerText = isEn ? 'School Venue / Hall *' : 'Tempat / Venue Sekolah *';
    const inAeVenue = document.getElementById('adminInputTempat');
    if (inAeVenue) inAeVenue.placeholder = isEn ? 'e.g., Multipurpose Hall, PTE Belait' : 'cth: Dewan Serbaguna Pusat Tingkatan Enam Belait';
    const lAeGps = document.getElementById('labelAdminInputGps');
    if (lAeGps) lAeGps.innerText = isEn ? 'Google Maps GPS Link (Hall Venue)' : 'Pautan GPS Google Maps (Venue Dewan)';

    const aeMapSec = document.getElementById('adminEventsMapSectionTitle');
    if (aeMapSec) aeMapSec.innerText = isEn ? 'School Hall Floor Plan & Agency Parking Settings' : 'Tetapan Pelan Dewan Sekolah & Parking Agensi';
    const lAePlan = document.getElementById('labelAdminInputPelanSekolah');
    if (lAePlan) lAePlan.innerText = isEn ? 'School Hall Floor Plan (Booth Layout)' : 'Pelan Dewan Sekolah (Susunan Meja)';
    const bAePlan = document.getElementById('badgeAdminInputPelanSekolah');
    if (bAePlan) bAePlan.innerText = isEn ? 'Upload / Image URL' : 'Muat Naik / Pautan URL';
    const btnUpHall = document.getElementById('btnUploadHallMapText');
    if (btnUpHall) btnUpHall.innerText = isEn ? 'Select Hall Map Image File' : 'Pilih Fail Imej Peta Dewan';
    const inAePlanUrl = document.getElementById('adminInputPelanSekolah');
    if (inAePlanUrl) inAePlanUrl.placeholder = isEn ? 'https://.../hall-floorplan.png' : 'https://.../pelan-dewan.png';
    const dAePlan = document.getElementById('descAdminInputPelanSekolah');
    if (dAePlan) dAePlan.innerText = isEn ? 'Upload hall floor plan or booth layout image specifically for this school.' : 'Muat naik gambar pelan dewan atau susun atur meja pameran khusus untuk sekolah ini.';

    const lAePark = document.getElementById('labelAdminInputPelanParking');
    if (lAePark) lAePark.innerText = isEn ? 'Agency Parking Location' : 'Tempat Letak Kereta Agensi';
    const bAePark = document.getElementById('badgeAdminInputPelanParking');
    if (bAePark) bAePark.innerText = isEn ? 'Information / Map' : 'Maklumat / Peta';
    const lModeInfo = document.getElementById('labelParkingModeInfoText');
    if (lModeInfo) lModeInfo.innerText = isEn ? 'Information Only' : 'Maklumat Sahaja';
    const lModeMap = document.getElementById('labelParkingModeMapText');
    if (lModeMap) lModeMap.innerText = isEn ? 'Map & Information' : 'Peta & Maklumat';
    const lAdminPanduan = document.getElementById('labelAdminPanduanParking');
    if (lAdminPanduan) lAdminPanduan.innerText = isEn ? 'School Parking Instructions / Guide:' : 'Arahan / Panduan Parking Sekolah:';
    const inAeParkUrl = document.getElementById('adminInputPelanParking');
    if (inAeParkUrl) inAeParkUrl.placeholder = isEn ? 'https://.../parking-map.png' : 'https://.../peta-parking.png';
    const inAeGuide = document.getElementById('adminInputPanduanParking');
    if (inAeGuide) inAeGuide.placeholder = isEn ? 'Guide: Please enter via the main entrance or designated area for invited agencies...' : 'Panduan: Sila masuk melalui pintu utama atau zon khas agensi...';
    const btnUpPark = document.getElementById('btnUploadParkingMapText');
    if (btnUpPark) btnUpPark.innerText = isEn ? 'Select Parking Map File' : 'Pilih Fail Imej Peta Parking';

    const lAeNotes = document.getElementById('labelAdminInputCatatanKhas');
    if (lAeNotes) lAeNotes.innerText = isEn ? 'Special Notes / Agency Dress Code' : 'Catatan Khas / Etika Pakaian Agensi';
    const inAeNotes = document.getElementById('adminInputCatatanKhas');
    if (inAeNotes) inAeNotes.placeholder = isEn ? 'e.g., Formal office attire / blazer. Booth setup starts at 06:45 AM.' : 'cth: Pakaian rasmi pejabat / kot. Meja boleh diatur seawal 06:45 pagi.';

    const btnSaveAe = document.getElementById('btnSaveAdminEventText');
    if (btnSaveAe) btnSaveAe.innerText = isEn ? 'Save Event & Map Changes' : 'Simpan Perubahan Acara & Peta';

    // Tooltips & Navigation Buttons
    const btnLogoutD = document.getElementById('btnLogoutDesktop');
    if (btnLogoutD) btnLogoutD.title = isEn ? 'Sign Out' : 'Log Keluar';
    const hNotifBtn = document.getElementById('headerNotifBtn');
    if (hNotifBtn) hNotifBtn.title = isEn ? 'System Notifications' : 'Notifikasi Sistem';
    const hmNotifBtn = document.getElementById('homeNotifBtn');
    if (hmNotifBtn) hmNotifBtn.title = isEn ? 'System Notifications' : 'Notifikasi Sistem';
    const bCalPrev = document.getElementById('btnCalPrevWeek');
    if (bCalPrev) bCalPrev.title = isEn ? 'Previous Week' : 'Minggu Sebelumnya';
    const bCalNext = document.getElementById('btnCalNextWeek');
    if (bCalNext) bCalNext.title = isEn ? 'Next Week' : 'Minggu Seterusnya';
    const bSyncCal = document.getElementById('btnSyncCalToActive');
    if (bSyncCal) {
      bSyncCal.innerText = isEn ? 'This Session' : 'Sesi Ini';
      bSyncCal.title = isEn ? 'View Selected Session Week' : 'Papar Minggu Sesi Terpilih';
    }

    // --- Modals ---
    const mmClose = document.getElementById('mapModalCloseBtn');
    if (mmClose) mmClose.innerText = isEn ? 'Close' : 'Tutup';
    const dmTitle = document.getElementById('docModalTitle');
    if (dmTitle) dmTitle.innerText = isEn ? 'Official QR Letter Preview' : 'Pratinjau Surat Rasmi Ber-QR';
    const dmClose = document.getElementById('docModalCloseBtn');
    if (dmClose) dmClose.innerText = isEn ? 'Close' : 'Tutup';
    const dmPrint = document.getElementById('docModalPrintBtnText');
    if (dmPrint) dmPrint.innerText = isEn ? 'Print PDF' : 'Cetak PDF';

    // --- Skrin Papan Pemuka Pentadbir ---
    const aHeadUnit = document.getElementById('adminHeaderUnitBadge');
    if (aHeadUnit) aHeadUnit.innerText = isEn ? 'CAREER EDUCATION UNIT • JSS' : 'UNIT PENDIDIKAN KERJAYA • JSS';
    const aHeadMode = document.getElementById('adminHeaderModeBadge');
    if (aHeadMode) aHeadMode.innerText = 'ADMIN';
    const aDashTitle = document.getElementById('adminDashboardHeaderTitle');
    if (aDashTitle) aDashTitle.innerText = isEn ? 'CEU Administrator Dashboard' : 'Papan Pemuka Pentadbir CEU';
    const aDashDesc = document.getElementById('adminDashboardHeaderDesc');
    if (aDashDesc) aDashDesc.innerText = isEn ? 'Real-time monitoring of RSVP confirmations, hall tables & logistics for 50 invited agencies.' : 'Pemantauan masa nyata pengesahan RSVP, keperluan meja dewan & logistik 50 agensi jemputan.';
    const aBtnPrint = document.getElementById('adminBtnPrintPdf');
    if (aBtnPrint) aBtnPrint.innerText = isEn ? 'Print PDF Report' : 'Cetak Laporan PDF';
    const aBtnManage = document.getElementById('adminBtnManageEvents');
    if (aBtnManage) aBtnManage.innerText = isEn ? 'Manage Events & Maps' : 'Urus Program & Peta';

    // Pemilih Sekolah & Tab Paparan Pentadbir
    const aSchFiltLabel = document.getElementById('adminSchoolFilterLabel');
    if (aSchFiltLabel) {
      aSchFiltLabel.innerHTML = `<span class="material-symbols-outlined text-[#148e82] text-[18px]">school</span><span>${isEn ? 'Select School / Program Session (RSVP View)' : 'Pilih Sekolah / Sesi Program (Paparan RSVP)'}</span>`;
    }
    const aSchBadge = document.getElementById('adminSchoolBadgeCount');
    if (aSchBadge) aSchBadge.innerText = isEn ? '31 Calendar Sessions' : '31 Sesi Takwim';
    const aTabTable = document.getElementById('labelAdminTabTable');
    if (aTabTable) aTabTable.innerText = isEn ? 'Agency Table' : 'Jadual Agensi';
    const aTabGrid = document.getElementById('labelAdminTabGrid');
    if (aTabGrid) aTabGrid.innerText = isEn ? '31 Schools Overview' : 'Ringkasan 31 Sekolah';
    const aCapsuleHall = document.getElementById('adminSchoolCapsuleHallBtn');
    if (aCapsuleHall) aCapsuleHall.innerText = isEn ? 'Hall Plan' : 'Pelan Dewan';
    const aCapsulePark = document.getElementById('adminSchoolCapsuleParkingBtn');
    if (aCapsulePark) aCapsulePark.innerText = isEn ? 'Parking Map' : 'Peta Parking';
    const aCapsulePrint = document.getElementById('adminSchoolCapsulePrintBtn');
    if (aCapsulePrint) aCapsulePrint.innerText = isEn ? 'Print Sheet' : 'Cetak Lembaran';

    const aStatL1 = document.getElementById('adminStatLabel1');
    if (aStatL1) aStatL1.innerText = isEn ? '50 Invited Agencies' : '50 Agensi Jemputan';
    const aStatS1 = document.getElementById('adminStatSub1');
    if (aStatS1) aStatS1.innerText = isEn ? 'Nationwide Brunei' : 'Seluruh Negara Brunei';

    const aStatL2 = document.getElementById('adminStatLabel2');
    if (aStatL2) aStatL2.innerText = isEn ? 'Response Rate' : 'Kadar Maklum Balas';
    const aStatS2 = document.getElementById('adminStatSub2');
    if (aStatS2) aStatS2.innerText = isEn ? 'Confirmed Attendance Status' : 'Status Kehadiran Disahkan';

    const aStatL3 = document.getElementById('adminStatLabel3');
    if (aStatL3) aStatL3.innerText = isEn ? 'School Tables & Chairs' : 'Meja & Kerusi Sekolah';
    const aStatS3 = document.getElementById('adminStatSub3');
    if (aStatS3) aStatS3.innerText = isEn ? 'Exhibition Hall Requirements' : 'Keperluan Dewan Pameran';

    const aStatL4 = document.getElementById('adminStatLabel4');
    if (aStatL4) aStatL4.innerText = isEn ? 'Power Plugs & Agency Parking' : 'Soket Plug & Parking Agensi';
    const aStatS4 = document.getElementById('adminStatSub4');
    if (aStatS4) aStatS4.innerText = isEn ? 'Agency Parking Area' : 'Kawasan Parking Agensi';

    const aTTitle = document.getElementById('adminTableTitle');
    if (aTTitle) aTTitle.innerHTML = `<span class="w-2.5 h-2.5 rounded-full bg-[#148e82]"></span>${isEn ? 'RSVP Confirmation Status of 50 Invited Agencies' : 'Status Pengesahan RSVP 50 Agensi Jemputan'}`;

    const aTDesc = document.getElementById('adminTableDesc');
    if (aTDesc) aTDesc.innerText = isEn ? 'Review delegation status, logistics requests, and agency parking passes.' : 'Semak status delegasi, keperluan logistik, dan pas parking agensi.';

    const aHeadRow = document.getElementById('adminTableHeaderRow');
    if (aHeadRow) {
      aHeadRow.innerHTML = `
        <th class="p-3">NO</th>
        <th class="p-3">${isEn ? 'CODE' : 'KOD'}</th>
        <th class="p-3">${isEn ? 'INVITED AGENCY NAME' : 'NAMA AGENSI JEMPUTAN'}</th>
        <th class="p-3">${isEn ? 'RSVP STATUS' : 'STATUS RSVP'}</th>
        <th class="p-3 text-center">${isEn ? 'TABLES / CHAIRS' : 'MEJA / KERUSI'}</th>
        <th class="p-3 text-center">${isEn ? 'PLUG' : 'PLUG'}</th>
        <th class="p-3">${isEn ? 'DUTY OFFICER' : 'PEGAWAI BERTUGAS'}</th>
        <th class="p-3">${isEn ? 'AGENCY PARKING' : 'PARKING AGENSI'}</th>
        <th class="p-3 text-right">${isEn ? 'ACTION' : 'AKSI'}</th>
      `;
    }

    const adminSearch = document.getElementById('adminAgencySearchInput');
    if (adminSearch) adminSearch.placeholder = isEn ? 'Search agency...' : 'Cari agensi...';
    const filterAllBtn = document.getElementById('filterBtn_ALL');
    if (filterAllBtn) filterAllBtn.innerText = isEn ? 'All (50)' : 'Semua (50)';
    const filterHadirBtn = document.getElementById('filterBtn_Hadir');
    if (filterHadirBtn) filterHadirBtn.innerText = isEn ? 'Attending' : 'Hadir';
    const filterBelumBtn = document.getElementById('filterBtn_Belum');
    if (filterBelumBtn) filterBelumBtn.innerText = isEn ? 'Pending' : 'Belum Sah';
    const filterTidakBtn = document.getElementById('filterBtn_Tidak');
    if (filterTidakBtn) filterTidakBtn.innerText = isEn ? 'Not Attending' : 'Tidak Hadir';

    const aGridTitle = document.getElementById('adminGridHeaderTitle');
    if (aGridTitle) aGridTitle.innerHTML = `<span class="w-2.5 h-2.5 rounded-full bg-[#006194]"></span>${isEn ? 'RSVP Confirmation Summary Across 31 School Sessions' : 'Ringkasan Pengesahan RSVP Mengikut 31 Sekolah / Sesi Program'}`;
    const aGridDesc = document.getElementById('adminGridHeaderDesc');
    if (aGridDesc) aGridDesc.innerText = isEn ? 'Comprehensive monitoring of agency participation status across each school in all four districts.' : 'Pemantauan menyeluruh status penyertaan agensi bagi setiap sekolah di keempat-empat daerah.';

    // --- Skrin Profil ---
    const pOptTitle = document.getElementById('profileSysOptionsTitle');
    if (pOptTitle) pOptTitle.innerText = isEn ? 'System Preferences' : 'Pilihan Sistem';
    const pLangChoice = document.getElementById('profileLangChoiceLabel');
    if (pLangChoice) pLangChoice.innerText = isEn ? 'Language Selection' : 'Pilihan Bahasa';
    const pDocLetter = document.getElementById('profileDocLetterLabel');
    if (pDocLetter) pDocLetter.innerText = isEn ? 'Logistics Confirmation Letter' : 'Surat Perakuan Logistik';
    const pBtnPdf = document.getElementById('profileBtnPdf');
    if (pBtnPdf) pBtnPdf.innerText = isEn ? 'Generate PDF Letter' : 'Jana Surat PDF';
    const pBtnLogout = document.getElementById('profileBtnLogout');
    if (pBtnLogout) {
      pBtnLogout.innerHTML = `<span class="material-symbols-outlined text-[18px]">logout</span><span>${isEn ? 'Sign Out of System' : 'Log Keluar daripada Sistem'}</span>`;
    }
  }
};
