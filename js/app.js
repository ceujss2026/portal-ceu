/**
 * ============================================================================
 * PORTAL CEU (CAREER EDUCATION UNIT) — FRONTEND CONTROLLER & SPA ENGINE
 * Unit Pendidikan Kerjaya, Jabatan Sekolah-Sekolah Brunei Darussalam
 * 
 * Prinsip:
 * - gas-pro-api: Anti-CORS text/plain POST fetch, tiada iframe, decoupled
 * - gas-rahasia-script-properties: Simpan token HMAC 30 hari di storan selamat,
 *   jambatan biometrik CEUAndroid / WebAuthn tempatan
 * - gas-scale-turbo: SWR caching, in-flight request deduplication, write epoch,
 *   polling pintar
 * ============================================================================
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. KAMUS DWI-BAHASA LENGKAP (BRUNEI MALAY STANDARD & ENGLISH)
  // ==========================================================================
  const I18N = {
    bm: {
      appName: 'PORTAL CEU',
      deptBadge: 'UPK JSS',
      deptName: 'Unit Pendidikan Kerjaya, Jabatan Sekolah-Sekolah',
      ministry: 'Kementerian Pendidikan Brunei Darussalam',
      ministryHeader: 'KEMENTERIAN PENDIDIKAN NEGARA BRUNEI DARUSSALAM',
      deptHeader: 'JABATAN SEKOLAH-SEKOLAH • UNIT PENDIDIKAN KERJAYA',
      welcome: 'Selamat Datang',
      emailLogin: 'Log Masuk Emel',
      biometricFast: 'Biometrik Pantas',
      officialEmailLabel: 'E-mel Rasmi Pegawai / Kerajaan',
      emailPlaceholder: 'nama.guru@moe.bn',
      emailDomainNotice: 'Diterima: @moe.edu.bn, @edu.moe.bn, @moe.bn, @gov.bn, @jpi.bn',
      sendOtpBtn: 'Hantar Kod OTP Keselamatan',
      verifyOtpTitle: 'Masukkan Kod OTP 6-Digit',
      verifyOtpDesc: 'Kod pengesahan telah dihantar ke e-mel rasmi Awda.',
      verifyBtn: 'Sahkan & Masuk Portal',
      resendOtp: 'Hantar Semula Kod',
      changeEmailBtn: 'Tukar Emel',
      timeRemaining: 'Baki masa:',
      bioPromptLabel: 'Sentuh sensor cap jari atau Face ID untuk akses pantas',
      bioSubtitle: 'Token sesi disulitkan oleh perkakasan peranti (Keystore).',
      bioUseOtpInstead: 'Guna Log Masuk Kod OTP Emel',
      bioNotEnrolledTitle: 'Belum Ada Pendaftaran Biometrik',
      bioNotEnrolledDesc: 'Sila log masuk menggunakan e-mel rasmi dan kod OTP terlebih dahulu untuk mengaktifkan biometrik pada peranti ini.',
      bioSwitchAccount: 'Tukar Akaun / Log Masuk Emel Lain',
      bioLoginOtpFirstBtn: 'Log Masuk dengan E-mel OTP',
      welcomeAuth: 'Selamat Datang ke Portal CEU',
      welcomeAuthSub: 'Sila masukkan Emel Rasmi Kementerian untuk menerima Kod Laluan Sekali (OTP) atau daftar masuk pantas menggunakan biometrik.',
      securityTwoFactor: 'Pengesahan Taraf Keselamatan Dua-Faktor Peranti',
      teeEnclaveActive: 'TEE ENCLAVE AKTIF',
      orSeparator: 'Atau',
      forgotEmail: 'Lupa Emel?',
      registerNewTeacher: 'Daftar Guru Baharu',
      activeStatus: 'Aktif',
      sessionVerified: 'Sesi Disahkan (30 Hari)',
      district: 'Daerah',
      officialNoticeFooter: 'Sistem Rasmi Kerajaan Brunei Darussalam • Versi 1.0.4',
      
      // Navigasi Bawah
      navHome: 'Utama',
      navTakwim: 'Kalendar',
      navCalendar: 'Kalendar',
      navRsvp: 'RSVP',
      navArchive: 'Minit & Persuratan',
      navNotif: 'Notifikasi',
      navAdmin: 'UPK',
      navProfile: 'Profil',

      // Home
      programMonth: 'Program Bulan Ini',
      attendedDone: 'Selesai Dihadiri',
      waitingAction: 'Perlu Tindakan',
      allPrograms: 'Semua Program',
      urgentRsvp: 'Perlu RSVP',
      upcomingEvents: 'Akan Datang',
      deadline: 'Tarikh Tutup RSVP',
      respondRsvpBtn: 'Sahkan Kehadiran (RSVP)',
      updateRsvpBtn: 'Kemas Kini RSVP',
      viewDetailsBtn: 'Lihat Butiran',
      onlineMeeting: 'Sertai Google Meet',
      calendarTitle: 'Bulan Ini',
      calendarWeek: 'Bulan Ini',
      currentMonth: 'Bulan Ini',
      resetFilter: 'Tunjuk Semua',
      noEventsFound: 'Semua program telah dijawab atau tiada program aktif buat masa ini.',
      
      // Status Badges
      badgeAttending: 'HADIR DISAHKAN',
      badgeRep: 'MEWAKILKAN',
      badgeAbsent: 'TIDAK HADIR',
      badgePending: 'PERLU TINDAKAN RSVP',

      // Days of week
      dayMon: 'Isn',
      dayTue: 'Sel',
      dayWed: 'Rab',
      dayThu: 'Kha',
      dayFri: 'Jum',
      daySat: 'Sab',
      daySun: 'Aha',
      
      // RSVP Modal
      rsvpModalTitle: 'Pengesahan Kehadiran Rasmi',
      rsvpOptionAttendTitle: 'Saya akan hadir sepenuhnya (Hadir)',
      rsvpOptionAttendDesc: 'Mengesahkan kehadiran rasmi bagi pihak sekolah.',
      rsvpOptionRepTitle: 'Mewakilkan pegawai lain bagi pihak sekolah',
      rsvpOptionRepDesc: 'Namakan guru pengganti yang menghadiri mesyuarat.',
      rsvpOptionAbsentTitle: 'Tidak dapat hadir (Memohon pelepasan)',
      rsvpOptionAbsentDesc: 'Wajib sertakan alasan rasmi bagi rekod JSS.',
      repNamePlaceholder: 'Nama Penuh Pegawai Pengganti',
      repPhonePlaceholder: 'Nombor Telefon Wakil (+673)',
      absenceReasonPlaceholder: 'Nyatakan sebab ketidakhadiran rasmi...',
      confirmDeclaration: 'Saya mengesahkan maklumat jawapan RSVP ini adalah benar dan rasmi.',
      submitRsvpBtn: 'Hantar Pengesahan RSVP',

      // Minit, Memorandum dan Persuratan
      archiveTitle: 'Minit, Memorandum dan Persuratan',
      archiveSubtitle: 'Pustaka rasmi minit mesyuarat, pekeliling, memorandum dan takwim UPK JSS.',
      searchArchivePlaceholder: 'Cari tajuk minit, memo, surat pekeliling, no. rujukan...',
      catAll: 'Semua',
      catCirculars: 'Persuratan & Pekeliling',
      catMinutes: 'Minit Mesyuarat',
      catMemo: 'Memorandum',
      catCalendar: 'Takwim & Kalendar',
      adminStep3Title: 'Pilih Guru Pendidikan Kerjaya',
      chooseTeachersDesc: 'Pilih guru secara individu yang wajib hadir ke acara ini (Sekolah Menengah, Maktab & PTE):',
      searchTeacherPlaceholder: 'Cari nama guru, sekolah, atau e-mel...',
      filterDistrictTitle: 'Tapis Mengikut Daerah:',
      filterAllDistricts: 'Semua Daerah (37)',
      invitePrincipalsLabel: 'Jemput Pengetua Sekolah Terpilih (Pilihan)',
      invitePrincipalsDesc: 'Hantar notifikasi makluman kepada Pengetua / Guru Besar bagi sekolah guru yang dipilih',

      // Stepper & Kemajuan Borang
      stepProgressTitle: 'Kemajuan Penerbitan',
      eventTitleLabel: 'Tajuk Acara',
      eventCategoryLabel: 'Kategori Acara',
      optMeeting: 'Mesyuarat',
      optBriefing: 'Taklimat',
      optProgram: 'Program',
      optVisit: 'Lawatan',
      optOther: 'Lain-lain (sila nyatakan)',
      eventFormatLabel: 'Format Pelaksanaan',
      formatInPerson: 'Bersemuka',
      formatInPersonDesc: 'Fizikal di lokasi pilihan',
      formatHybrid: 'Hibrid',
      formatHybridDesc: 'Google Meet Berintegrasi',
      formatOnline: 'Dalam Talian Penuh',
      formatOnlineDesc: 'Siaran Webex / Google Meet Rasmi',
      onlineMeetLinkOptional: 'Pautan Mesyuarat Dalam Talian (Google Meet / Webex)',
      execDateLabel: 'Tarikh Pelaksanaan',
      sessionTimeLabel: 'Waktu Sesi',
      venueLabelLong: 'Lokasi Acara / Tempat Pelaksanaan',
      venueNote: 'Boleh masukkan sebarang lokasi pilihan — hotel, pusat persidangan, dewan, bilik mesyuarat, dalam talian, atau luar pejabat.',
      venueNotSet: 'Lokasi belum ditetapkan',
      rsvpDeadlineLabel: 'Tarikh Tutup RSVP',
      requireReasonLabel: 'Wajibkan Alasan Ketidakhadiran',
      requireReasonDesc: 'Memerlukan pengesahan Pengetua jika wakil dihantar',
      rsvpDeadlineNotSet: 'Belum ditetapkan',
      attachmentLabel: 'Lampiran Fail Rasmi (Pilihan)',
      broadcastChannelsLabel: 'Saluran Hebahan Serentak',
      fcmChannelTitle: 'Notifikasi Tolak (Android PWA)',
      bannerChannelTitle: 'Banner Siaran Automatik Laman Utama Guru',
      bannerChannelDesc: 'Dipaparkan pada kedudukan tertinggi papan kenyataan portal CEU selama 7 hari.',
      previewPortalHeader: 'Portal Guru Pendidikan Kerjaya MOE',
      justNowText: 'Baru sahaja',
      badgeCompulsory: 'Wajib Hadir',
      previewDefaultTitle: 'Tajuk Acara Rasmi',
      previewDefaultVenue: 'Lokasi Acara',
      previewDefaultDeadline: 'Tarikh Tutup RSVP',

      venueMapsHint: 'Tekan untuk semak atau pandu arah di Google Maps',
      btnOpenMaps: 'Buka di Google Maps',
      targetRoleCareerTeachers: 'Guru Pendidikan Kerjaya',
      targetRolePrincipals: 'Pengetua',
      targetRoleDeputyPrincipals: 'Timbalan Pengetua',
      targetRoleSuperintendents: 'Superintenden (Kluster 1 - 3)',
      badgeMainTarget: 'Sasaran Utama',

      // Mod Kalendar & Tajuk
      calModeWeekly: 'Mingguan',
      calModeMonthly: 'Bulanan',
      currentWeek: 'Minggu Ini',
      currentMonth: 'Bulan Ini',

      // Pustaka Arkib & Badge
      archiveRepoBadge: 'Repositori 2026',
      archiveOfficialBadge: 'UPK JSS Rasmi',
      archiveTotalFiles: 'Jumlah Fail',
      archiveAvgSize: 'Purata Saiz',
      archiveVerifiedBadge: 'Disahkan UPK',

      // Penapis Acara UPK
      adminEventFilterAll: 'Semua',
      adminEventFilterPublished: 'Diterbitkan',
      adminEventFilterDraft: 'Draf Sahaja',
      adminAnalysisEventLabel: 'Analisis Acara:',
      adminRsvpEventLabel: 'Acara:',

      // Bina & Terbit Acara (UPK)
      adminCreateEventTitle: 'Bina & Terbitkan Acara Rasmi',
      adminCreateEventSubtitle: 'Unit Pendidikan Kerjaya, Jabatan Sekolah-Sekolah',
      stepProgress: 'Langkah 4 / 4 Siap',
      step1Basic: '1. Asas',
      step2Location: '2. Lokasi',
      step3Target: '3. Sasaran',
      step4Broadcast: '4. Hebahan',
      adminStep1Title: 'Maklumat Asas Acara',
      adminStep1Desc: 'Sesuai untuk paparan rasmi di kalendar aktiviti sekolah.',
      adminStep2Title: 'Tarikh & Lokasi',
      adminStep3Title: 'Kumpulan Sasaran Pegawai & Guru',
      adminStep4Title: 'Lampiran & Hebahan FCM',
      livePreviewTitle: 'Pratonton Langsung Guru',
      publishBroadcastBtn: 'Terbit & Siar FCM',
      targetModeGroupTitle: 'Mengikut Kumpulan Rasmi',
      targetModeIndividualTitle: 'Pilih Individu Pegawai',

      catGuidelines: 'Garis Panduan',
      previewDocBtn: 'Pratinjau',
      downloadBtn: 'Muat Turun',
      noDocsFound: 'Tiada dokumen dijumpai untuk carian ini.',

      // Notifikasi
      notifTitle: 'Pusat Makluman & Hebahan',
      notifSubtitle: 'Pemberitahuan rasmi dan notifikasi tolak terkini.',
      markAllReadBtn: 'Tanda Dibaca',
      noNotifsFound: 'Tiada pemberitahuan baharu.',

      // Profil & Tetapan
      profileTitle: 'Profil & Tetapan Akaun',
      profileSecurityHeader: 'Keselamatan & Log Masuk',
      profileBioLabel: 'Log Masuk Biometrik (Cap Jari / Face ID)',
      profileBioDesc: 'Buka aplikasi pantas tanpa menunggu OTP setiap kali.',
      profileDeviceLabel: 'Peranti Berdaftar',
      profileDeviceDesc: 'Sesi sah sehingga 30 hari dalam Android Keystore.',
      profileVerifiedBadge: 'Disahkan',
      profilePrefHeader: 'Pilihan Antaramuka',
      profileLangLabel: 'Bahasa Aplikasi / Language',
      profileLangDesc: 'Tukar antara Bahasa Melayu dan Bahasa Inggeris.',
      profileAboutLabel: 'Tentang Portal CEU',
      logoutBtn: 'Log Keluar Sesi',

      // Admin Dashboard & Table
      adminDashboard: 'Papan Pemuka UPK',
      adminDashboardSubtitle: 'Analisis kehadiran 4 daerah dan pengurusan rasmi UPK.',
      adminTableViewBtn: 'Semakan Jadual',
      totalTeachersKpi: 'Jumlah Guru',
      rsvpRateKpi: 'Kadar Respons RSVP',
      attendingKpi: 'Hadir Disahkan',
      repAbsentKpi: 'Wakil / Tak Hadir',
      overallRsvpDonut: 'Pecahan Status RSVP Acara Semasa',
      districtBarChart: 'Kehadiran Mengikut 4 Daerah',
      createNewEventBtn: '+ Terbitkan Program Baharu',
      generatePdfBtn: 'Jana Laporan PDF Rasmi Ber-QR',
      attendanceTableTitle: 'Semakan Terperinci Kehadiran RSVP',
      exportPdfBtn: 'Eksport PDF',
      backToDashboardBtn: 'Kembali ke Dashboard',
      adminCreateEventTitle: 'Terbitkan Program & Acara Baharu',
      adminCreateEventSubtitle: 'Maklumat acara akan disiarkan serta-merta ke peranti guru.',
      adminPublishBtn: 'Terbitkan & Hantar Notifikasi Pukal FCM',

      // Dokumen PDF
      exportPdfDocTitle: 'LAPORAN RASMI KEHADIRAN DAN KETIDAKHADIRAN PROGRAM KERJAYA',
      pdfPreviewTitle: 'Pratonton Dokumen Rasmi UPK',
      pdfPrintBtn: 'Cetak / Simpan PDF',
      pdfRefLabel: 'No. Rujukan Laporan:',
      pdfGeneratedAtLabel: 'Tarikh & Masa Dijana:',
      pdfEventTitleLabel: 'Nama Acara:',
      pdfVenueLabel: 'Lokasi:',
      pdfTotalInvited: 'Jumlah Dijemput',
      pdfAttending: 'Hadir',
      pdfRep: 'Wakil',
      pdfAbsent: 'Tak Hadir',
      pdfDistrictBreakdown: 'Pecahan Kehadiran 4 Daerah:',
      pdfHeadUnit: 'Ketua Unit Pendidikan Kerjaya',
      pdfDeptBrunei: 'Jabatan Sekolah-Sekolah Brunei',

      // Kekunci Baru (Standard Bahasa Melayu Brunei)
      calModeWeekly: 'Mingguan',
      calModeMonthly: 'Bulanan',
      currentWeek: 'Minggu Ini',
      teacherGreeting: 'Selamat Datang • Guru Pendidikan Kerjaya',
      counselorGreeting: 'Selamat Datang • Guru Pendidikan Kerjaya',
      cannotAttendTitle: 'Ada Kekangan Kehadiran?',
      cannotAttendSub: 'Lantik pegawai pengganti bagi pihak sekolah Awda',
      appointRepBtn: 'Lantik',
      validDomainNotice: 'Domain Sah MOE',
      otpReady: 'Sedia',
      otpNotice: 'Kod pengesahan dihantar ke peti masuk emel rasmi.',
      copyrightNotice: '© 2026 Unit Pendidikan Kerjaya (UPK), Jabatan Sekolah-Sekolah Brunei',
      allRightsReserved: 'Hak Cipta Terpelihara',
      sub4Districts: '4 Daerah Brunei',
      subHighOptimum: 'Tinggi / Optimum',
      subPhysicalVerify: 'Pengesahan Kehadiran',
      subWithJustification: 'Dengan Justifikasi Rasmi',
      legendAttending: 'Hadir',
      legendProxy: 'Wakil',
      legendAbsent: 'Tak Hadir',
      adminEventsManagementTitle: 'Pengurusan Acara & Draf Program',
      adminEventsManagementSubtitle: 'Urus, terbitkan draf, atau padamkan acara rasmi.',
      tableColNo: 'No.',
      tableColOfficer: 'Nama Guru & Emel',
      tableColSchool: 'Sekolah / Maktab',
      tableColDistrict: 'Daerah',
      tableColStatus: 'Status RSVP',
      tableColNotes: 'Catatan / Wakil',
      tableColActions: 'Tindakan',
      totalFilesStat: 'Jumlah Fail',
      avgSizeStat: 'Purata Saiz',
      upkVerifiedStat: 'Disahkan UPK',
      timeLabel: 'Masa',
      venueLabel: 'Lokasi',
      onlineVenue: 'Dalam Talian'
    },
    en: {
      appName: 'PORTAL CEU',
      deptBadge: 'UPK JSS',
      deptName: 'Career Education Unit, Department of Schools',
      ministry: 'Ministry of Education, Brunei Darussalam',
      ministryHeader: 'MINISTRY OF EDUCATION BRUNEI DARUSSALAM',
      deptHeader: 'DEPARTMENT OF SCHOOLS • CAREER EDUCATION UNIT',
      welcome: 'Welcome',
      emailLogin: 'Email Login',
      biometricFast: 'Fast Biometrics',
      officialEmailLabel: 'Official Government / MOE Email',
      emailPlaceholder: 'teacher.name@moe.bn',
      emailDomainNotice: 'Accepted: @moe.edu.bn, @edu.moe.bn, @moe.bn, @gov.bn, @jpi.bn',
      sendOtpBtn: 'Send Security OTP Code',
      verifyOtpTitle: 'Enter 6-Digit OTP Code',
      verifyOtpDesc: 'A security verification code has been dispatched to your email.',
      verifyBtn: 'Verify & Enter Portal',
      resendOtp: 'Resend Code',
      changeEmailBtn: 'Change Email',
      timeRemaining: 'Time remaining:',
      bioPromptLabel: 'Touch fingerprint sensor or use Face ID for instant access',
      bioSubtitle: 'Session token is encrypted by device hardware (Keystore).',
      bioUseOtpInstead: 'Use Email OTP Login',
      bioNotEnrolledTitle: 'No Biometrics Enrolled',
      bioNotEnrolledDesc: 'Please log in using your official email and OTP first to activate biometrics on this device.',
      bioSwitchAccount: 'Switch Account / Use Different Email',
      bioLoginOtpFirstBtn: 'Log In with Email OTP',
      welcomeAuth: 'Welcome to Portal CEU',
      welcomeAuthSub: 'Please enter your official Ministry email to receive a One-Time Password (OTP) or sign in quickly using biometrics.',
      securityTwoFactor: 'Device Two-Factor Security Verification',
      teeEnclaveActive: 'TEE ENCLAVE ACTIVE',
      orSeparator: 'Or',
      forgotEmail: 'Forgot Email?',
      registerNewTeacher: 'Register New Teacher',
      activeStatus: 'Active',
      sessionVerified: 'Verified Session (30 Days)',
      district: 'District',
      officialNoticeFooter: 'Official Government System of Brunei Darussalam • Version 1.0.4',
      
      // Navigasi Bawah
      navHome: 'Home',
      navTakwim: 'Calendar',
      navCalendar: 'Calendar',
      navRsvp: 'RSVP',
      navArchive: 'Minutes & Letters',
      navNotif: 'Notifications',
      navAdmin: 'Admin',
      navProfile: 'Profile',

      // Home
      programMonth: 'Programs This Month',
      attendedDone: 'Attended',
      waitingAction: 'Action Needed',
      allPrograms: 'All Events',
      urgentRsvp: 'Pending RSVP',
      upcomingEvents: 'Upcoming',
      deadline: 'RSVP Deadline',
      respondRsvpBtn: 'Confirm RSVP',
      updateRsvpBtn: 'Update RSVP',
      viewDetailsBtn: 'View Details',
      onlineMeeting: 'Join Google Meet',
      calendarTitle: 'This Month',
      calendarWeek: 'This Month',
      currentMonth: 'This Month',
      resetFilter: 'Show All',
      noEventsFound: 'All events have been responded to or no active events at this time.',

      // Status Badges
      badgeAttending: 'CONFIRMED ATTENDING',
      badgeRep: 'REPRESENTATIVE',
      badgeAbsent: 'NOT ATTENDING',
      badgePending: 'PENDING RSVP ACTION',

      // Days of week
      dayMon: 'Mon',
      dayTue: 'Tue',
      dayWed: 'Wed',
      dayThu: 'Thu',
      dayFri: 'Fri',
      daySat: 'Sat',
      daySun: 'Sun',
      
      // RSVP Modal
      rsvpModalTitle: 'Official Attendance Confirmation',
      rsvpOptionAttendTitle: 'I will be attending in person (Attending)',
      rsvpOptionAttendDesc: 'Confirming official attendance on behalf of the school.',
      rsvpOptionRepTitle: 'Designate another officer on behalf of school',
      rsvpOptionRepDesc: 'Name the substitute teacher who will attend the meeting.',
      rsvpOptionAbsentTitle: 'Unable to attend (Request official release)',
      rsvpOptionAbsentDesc: 'Official justification is mandatory for department records.',
      repNamePlaceholder: 'Representative Full Name',
      repPhonePlaceholder: 'Representative Mobile Number (+673)',
      absenceReasonPlaceholder: 'State official reason for absence...',
      confirmDeclaration: 'I hereby certify that this RSVP response is true and official.',
      submitRsvpBtn: 'Submit Official RSVP',

      // Minit, Memorandum dan Persuratan
      archiveTitle: 'Minutes, Memorandums and Official Letters',
      archiveSubtitle: 'Official repository for meeting minutes, circulars, memorandums, and UPK calendar.',
      searchArchivePlaceholder: 'Search minutes, memos, official circulars, or reference number...',
      catAll: 'All',
      catCirculars: 'Letters & Circulars',
      catMinutes: 'Meeting Minutes',
      catMemo: 'Memorandums',
      catCalendar: 'Calendar & Schedules',
      adminStep3Title: 'Select Career Education Teachers',
      chooseTeachersDesc: 'Choose individual teachers required to attend this event (Secondary Schools, Colleges & PTE):',
      searchTeacherPlaceholder: 'Search teacher name, school, or email...',
      filterDistrictTitle: 'Filter by District:',
      filterAllDistricts: 'All Districts (37)',
      invitePrincipalsLabel: 'Invite Principals of Selected Schools (Optional)',
      invitePrincipalsDesc: 'Send notification alerts to Principals of the selected teachers schools',

      // Stepper & Form Progress
      stepProgressTitle: 'Publishing Progress',
      eventTitleLabel: 'Event Title',
      eventCategoryLabel: 'Event Category',
      optMeeting: 'Meeting',
      optBriefing: 'Briefing',
      optProgram: 'Program',
      optVisit: 'Official Visit',
      optOther: 'Other (please specify)',
      eventFormatLabel: 'Delivery Format',
      formatInPerson: 'In-Person',
      formatInPersonDesc: 'Physical at selected venue',
      formatHybrid: 'Hybrid',
      formatHybridDesc: 'Integrated Google Meet',
      formatOnline: 'Fully Online',
      formatOnlineDesc: 'Official Webex / Google Meet broadcast',
      onlineMeetLinkOptional: 'Online Meeting Link (Google Meet / Webex)',
      execDateLabel: 'Event Date',
      sessionTimeLabel: 'Session Time',
      venueLabelLong: 'Event Venue / Location',
      venueNote: 'Can enter any venue of choice — hotel, conference centre, hall, meeting room, or online.',
      venueNotSet: 'Venue not specified yet',
      rsvpDeadlineLabel: 'RSVP Deadline',
      requireReasonLabel: 'Require Justification for Absence',
      requireReasonDesc: 'Requires Principal confirmation if a representative is sent',
      rsvpDeadlineNotSet: 'Not set yet',
      attachmentLabel: 'Official Attachment File (Optional)',
      broadcastChannelsLabel: 'Simultaneous Broadcast Channels',
      fcmChannelTitle: 'Push Notifications (Android PWA)',
      bannerChannelTitle: 'Teacher Home Screen Broadcast Banner',
      bannerChannelDesc: 'Featured prominently on the portal dashboard for 7 days.',
      previewPortalHeader: 'MOE Career Education Teachers Portal',
      justNowText: 'Just now',
      badgeCompulsory: 'Compulsory',
      previewDefaultTitle: 'Official Event Title',
      previewDefaultVenue: 'Event Venue',
      previewDefaultDeadline: 'RSVP Deadline',

      venueMapsHint: 'Click to view or navigate via Google Maps',
      btnOpenMaps: 'Open in Google Maps',
      targetRoleCareerTeachers: 'Career Education Teachers',
      targetRolePrincipals: 'Principals',
      targetRoleDeputyPrincipals: 'Deputy Principals',
      targetRoleSuperintendents: 'Superintendents (Cluster 1 - 3)',
      badgeMainTarget: 'Primary Target',

      // Calendar Mode & Headings
      calModeWeekly: 'Weekly',
      calModeMonthly: 'Monthly',
      currentWeek: 'This Week',
      currentMonth: 'This Month',

      // Archive Library & Badges
      archiveRepoBadge: '2026 Repository',
      archiveOfficialBadge: 'Official UPK JSS',
      archiveTotalFiles: 'Total Files',
      archiveAvgSize: 'Avg Size',
      archiveVerifiedBadge: 'UPK Verified',

      // Admin Event Filters
      adminEventFilterAll: 'All',
      adminEventFilterPublished: 'Published',
      adminEventFilterDraft: 'Drafts Only',
      adminAnalysisEventLabel: 'Event Analysis:',
      adminRsvpEventLabel: 'Event:',

      // Admin Event Creator
      adminCreateEventTitle: 'Create & Publish Official Event',
      adminCreateEventSubtitle: 'Career Education Unit, Department of Schools',
      stepProgress: 'Step 4 / 4 Completed',
      step1Basic: '1. Basics',
      step2Location: '2. Location',
      step3Target: '3. Target Audience',
      step4Broadcast: '4. Broadcast',
      adminStep1Title: 'Basic Event Details',
      adminStep1Desc: 'Suitable for official display on school activity calendar.',
      adminStep2Title: 'Date & Venue',
      adminStep3Title: 'Target Officers & Teachers',
      adminStep4Title: 'Attachments & Push Broadcast',
      livePreviewTitle: 'Live Teacher Preview',
      publishBroadcastBtn: 'Publish & Push FCM',
      targetModeGroupTitle: 'By Official Group',
      targetModeIndividualTitle: 'Select Individual Officers',

      catGuidelines: 'Guidelines',
      previewDocBtn: 'Preview',
      downloadBtn: 'Download',
      noDocsFound: 'No documents found matching this search.',

      // Notifikasi
      notifTitle: 'Announcement & Notice Center',
      notifSubtitle: 'Official notices and latest push notifications.',
      markAllReadBtn: 'Mark as Read',
      noNotifsFound: 'No new notifications.',

      // Profil & Tetapan
      profileTitle: 'Profile & Account Settings',
      profileSecurityHeader: 'Security & Authentication',
      profileBioLabel: 'Biometric Login (Fingerprint / Face ID)',
      profileBioDesc: 'Instant app unlock without waiting for OTP every time.',
      profileDeviceLabel: 'Registered Device',
      profileDeviceDesc: 'Session valid for 30 days in Android Keystore.',
      profileVerifiedBadge: 'Verified',
      profilePrefHeader: 'Interface Preferences',
      profileLangLabel: 'App Language / Language',
      profileLangDesc: 'Switch between Brunei Malay and English.',
      profileAboutLabel: 'About Portal CEU',
      logoutBtn: 'Log Out Session',

      // Admin Dashboard & Table
      adminDashboard: 'UPK Dashboard',
      adminDashboardSubtitle: '4-district attendance analytics and official UPK management.',
      adminTableViewBtn: 'Table View',
      totalTeachersKpi: 'Total Career Teachers',
      rsvpRateKpi: 'RSVP Response Rate',
      attendingKpi: 'Confirmed Attending',
      repAbsentKpi: 'Rep / Absent',
      overallRsvpDonut: 'Current Event Overall Response Breakdown',
      districtBarChart: 'Attendance Performance by 4 Districts',
      createNewEventBtn: '+ Create New Event',
      generatePdfBtn: 'Generate Official PDF Report',
      attendanceTableTitle: 'Detailed RSVP Attendance Tracking',
      exportPdfBtn: 'Export PDF',
      backToDashboardBtn: 'Back to Dashboard',
      adminCreateEventTitle: 'Publish New Program & Event',
      adminCreateEventSubtitle: 'Event information will be broadcasted instantly to teacher devices.',
      adminPublishBtn: 'Publish & Broadcast via FCM Push',

      // Dokumen PDF
      exportPdfDocTitle: 'OFFICIAL CAREER GUIDANCE PROGRAM ATTENDANCE REPORT',
      pdfPreviewTitle: 'Official CEU Document Preview',
      pdfPrintBtn: 'Print / Save PDF',
      pdfRefLabel: 'Report Reference No.:',
      pdfGeneratedAtLabel: 'Generated Date & Time:',
      pdfEventTitleLabel: 'Event Name:',
      pdfVenueLabel: 'Venue:',
      pdfTotalInvited: 'Total Invited',
      pdfAttending: 'Attending',
      pdfRep: 'Representative',
      pdfAbsent: 'Absent',
      pdfDistrictBreakdown: '4-District Attendance Breakdown:',
      pdfHeadUnit: 'Head of Career Education Unit',
      pdfDeptBrunei: 'Department of Schools, Brunei',

      // New English Keys (Pristine Standard)
      calModeWeekly: 'Weekly',
      calModeMonthly: 'Monthly',
      currentWeek: 'This Week',
      teacherGreeting: 'Welcome • Career Education Teacher',
      counselorGreeting: 'Welcome • Career Education Teacher',
      cannotAttendTitle: 'Unable to Attend?',
      cannotAttendSub: 'Appoint an official substitute on behalf of your school',
      appointRepBtn: 'Appoint',
      validDomainNotice: 'Valid MOE Domain',
      otpReady: 'Ready',
      otpNotice: 'Verification code dispatched to your official email inbox.',
      copyrightNotice: '© 2026 Career Education Unit (CEU), Department of Schools Brunei',
      allRightsReserved: 'All Rights Reserved',
      sub4Districts: '4 Brunei Districts',
      subHighOptimum: 'High / Optimum',
      subPhysicalVerify: 'Attendance Confirmed',
      subWithJustification: 'With Official Justification',
      legendAttending: 'Attending',
      legendProxy: 'Proxy',
      legendAbsent: 'Absent',
      adminEventsManagementTitle: 'Event Management & Program Drafts',
      adminEventsManagementSubtitle: 'Manage, publish drafts, or remove official events.',
      tableColNo: 'No.',
      tableColOfficer: 'Officer Name & Email',
      tableColSchool: 'School / College',
      tableColDistrict: 'District',
      tableColStatus: 'RSVP Status',
      tableColNotes: 'Remarks / Proxy',
      tableColActions: 'Action',
      totalFilesStat: 'Total Files',
      avgSizeStat: 'Average Size',
      upkVerifiedStat: 'CEU Verified',
      timeLabel: 'Time',
      venueLabel: 'Venue',
      onlineVenue: 'Online'
    }
  };

  // ==========================================================================
  // 2. STATE APLIKASI
  // ==========================================================================
  const State = {
    lang: localStorage.getItem('ceu_lang') || 'bm',
    token: '',
    currentUser: null,
    currentView: 'auth',
    events: [],
    rsvps: [],
    memos: [],
    notifications: [],
    users: [], // Direktori Guru & Pegawai Rasmi dari Google Sheet (tbl_users)
    adminData: null,
    selectedEventForRsvp: null,
    activeEventFilter: 'all',
    activeMemoCategory: 'Semua',
    activeDistrictFilter: 'Semua',
    selectedCalendarDate: null,
    calendarMode: 'weekly', // 'weekly' (default) | 'monthly'
    calendarDate: new Date()
  };

  // ==========================================================================
  // HELPER: PENENTUAN JEMPUTAN ACARA (MOD KUMPULAN VS INDIVIDU)
  // ==========================================================================
  function isUserInvitedToEvent(event, user) {
    if (!user) return false;
    if (user.role === 'Admin') return true;
    const myEmail = String(user.email || '').toLowerCase().trim();
    const mode = String(event.target_mode || event.targetMode || 'group').toLowerCase();

    if (mode === 'individual') {
      const rawList = event.target_emails || event.individualEmails || '';
      const invited = (Array.isArray(rawList) ? rawList : String(rawList).split(','))
        .map(s => String(s).toLowerCase().trim())
        .filter(Boolean);
      return invited.includes(myEmail);
    }

    if (event.target_districts && Array.isArray(event.target_districts)) {
      const myDist = String(user.district || user.daerah || '').toLowerCase().trim();
      const dists = event.target_districts.map(d => String(d).toLowerCase().trim());
      if (dists.length && !dists.includes('semua') && !dists.includes(myDist)) return false;
    }

    if (event.target_roles && Array.isArray(event.target_roles) && event.target_roles.length) {
      const myRole = String(user.roleGroup || user.role || '').toLowerCase();
      const roles = event.target_roles.map(r => String(r).toLowerCase());
      const roleMatched = roles.some(r => myRole.includes(r) || r.includes(myRole));
      if (!roleMatched) return false;
    }

    return true;
  }

  // ==========================================================================
  // 3. ENJIN REST API & TURBO CACHE (gas-pro-api & gas-scale-turbo)
  // ==========================================================================
  const _inflight = {};
  let _writeEpoch = 0;

  async function api(action, payload, forceLive) {
    const isMock = !window.APP_CONFIG.GAS_URL;

    if (isMock || (State.token && String(State.token).startsWith('mock_'))) {
      return handleMockApi(action, payload);
    }

    const isRead = /^(get|boot|verifyQr)/i.test(action);
    if (!isRead) {
      _writeEpoch++;
    } else if (!forceLive) {
      const cacheKey = _writeEpoch + '|' + action + '|' + JSON.stringify(payload || {});
      if (_inflight[cacheKey]) return _inflight[cacheKey];
      const reqPromise = fetchFromGas(action, payload);
      _inflight[cacheKey] = reqPromise;
      reqPromise.then(() => delete _inflight[cacheKey], () => delete _inflight[cacheKey]);
      return reqPromise;
    }

    return fetchFromGas(action, payload);
  }

  async function fetchFromGas(action, payload) {
    try {
      const res = await fetch(window.APP_CONFIG.GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: action,
          data: payload || {},
          token: State.token
        })
      });
      const data = await res.json();
      if (data.code === 'AUTH_EXPIRED') {
        const wasLoggedIn = !!State.currentUser;
        logout();
        if (wasLoggedIn) {
          showToast(State.lang === 'en' ? 'Session expired. Please log in again.' : 'Sesi Awda telah tamat. Sila log masuk semula.', 'warning');
        }
      }
      return data;
    } catch (err) {
      console.warn('API Fetch error, falling back to local simulation:', err);
      return handleMockApi(action, payload);
    }
  }

  function handleMockApi(action, payload) {
    return new Promise(resolve => {
      setTimeout(() => {
        const mock = window.MOCK_DATA;
        if (action === 'getUsers') {
          resolve({
            success: true,
            users: (State.users && State.users.length) ? State.users : mock.users
          });
        } else if (action === 'sendOtp') {
          resolve({ success: true, message: (State.lang === 'en' ? 'OTP code has been sent to your official email.' : 'Kod OTP telah berjaya dihantar ke emel rasmi anda.'), email: payload.email });
        } else if (action === 'verifyOtp') {
          const em = (payload.email || '').toLowerCase().trim();
          const target = mock.users.find(u => u.email === em) || {
            email: em,
            name: 'Cikgu Ahmad bin Hj Bakar',
            role: em.includes('upk') ? 'Admin' : 'Guru',
            district: 'Belait',
            school: 'Sekolah Menengah Sayyidina Ali',
            biometricEnabled: true
          };
          resolve({
            success: true,
            token: 'mock_token_' + Date.now(),
            user: target
          });
        } else if (action === 'biometricLogin') {
          // Cari pengguna berdasarkan emel atau token sesi biometrik sebenar (jangan paksa mock.users[1])
          let target = null;
          if (payload.email) {
            target = (mock.users || []).find(u => u.email.toLowerCase() === payload.email.toLowerCase());
          }
          if (!target && payload.token) {
            try {
              const savedBio = JSON.parse(localStorage.getItem('ceu_bio_user') || 'null');
              if (savedBio) target = savedBio;
            } catch (e) {}
          }
          if (!target && State.currentUser) target = State.currentUser;
          if (!target) {
            try {
              const savedUser = JSON.parse(localStorage.getItem('ceu_user') || 'null');
              if (savedUser) target = savedUser;
            } catch (e) {}
          }
          if (!target) target = mock.users[0]; // Lalai kepada pengguna pertama (Ahmad Bakar / Guru aktif)

          resolve({
            success: true,
            token: 'mock_bio_token_' + Date.now(),
            user: target
          });
        } else if (action === 'boot') {
          let cu = State.currentUser;
          if (!cu) {
            try {
              const savedUser = JSON.parse(localStorage.getItem('ceu_user') || 'null');
              if (savedUser) cu = savedUser;
            } catch (e) {}
          }
          if (!cu) cu = mock.users[0];
          const visibleEvents = (mock.events || []).filter(e => isUserInvitedToEvent(e, cu));
          resolve({
            success: true,
            data: {
              user: cu,
              users: (State.users && State.users.length) ? State.users : mock.users,
              events: visibleEvents,
              rsvp: mock.rsvps,
              notifications: mock.notifications,
              unreadNotifCount: 1,
              config: window.APP_CONFIG
            }
          });
        } else if (action === 'getEvents') {
          const cu = State.currentUser || mock.users[1];
          const visibleEvents = (mock.events || []).filter(e => isUserInvitedToEvent(e, cu));
          resolve({ success: true, data: visibleEvents });
        } else if (action === 'submitRsvp') {
          const userEmail = (State.currentUser && State.currentUser.email) ? State.currentUser.email.toLowerCase() : 'ahmad.bakar@moe.bn';
          if (!mock.rsvps) mock.rsvps = [];
          const existingRsvp = mock.rsvps.find(r => r.event_id === payload.eventId && (r.user_email || '').toLowerCase() === userEmail);
          if (existingRsvp) {
            existingRsvp.response_status = payload.status;
            existingRsvp.rep_name = payload.repName || '';
            existingRsvp.rep_phone = payload.repPhone || '';
            existingRsvp.absence_reason = payload.absenceReason || '';
            existingRsvp.submitted_at = new Date().toISOString();
          } else {
            mock.rsvps.push({
              rsvp_id: 'RSVP-' + Date.now(),
              event_id: payload.eventId,
              user_email: userEmail,
              response_status: payload.status,
              rep_name: payload.repName || '',
              rep_phone: payload.repPhone || '',
              absence_reason: payload.absenceReason || '',
              submitted_at: new Date().toISOString()
            });
          }
          State.adminData = null; // Paksa kalkulasi semula secara dinamik
          resolve({ success: true, message: 'RSVP berjaya dihantar.' });
        } else if (action === 'getMemos') {
          let savedMemos = [];
          try { savedMemos = JSON.parse(localStorage.getItem('ceu_memos') || '[]'); } catch(e) {}
          if (!savedMemos.length && mock.memos) {
            savedMemos = [...mock.memos];
            try { localStorage.setItem('ceu_memos', JSON.stringify(savedMemos)); } catch(e) {}
          }
          resolve({ success: true, data: savedMemos });
        } else if (action === 'uploadMemoDoc') {
          let savedMemos = [];
          try { savedMemos = JSON.parse(localStorage.getItem('ceu_memos') || '[]'); } catch(e) {}
          if (!savedMemos.length && mock.memos) savedMemos = [...mock.memos];
          
          const newDoc = {
            doc_id: 'MEMO-' + Date.now(),
            title_bm: payload.title_bm || payload.title,
            title_en: payload.title_en || payload.title_bm || payload.title,
            category: payload.category || 'Persuratan & Pekeliling',
            ref_no: payload.ref_no || ('UPK/JSS/' + new Date().getFullYear() + '/' + Math.floor(100 + Math.random()*900)),
            publish_date: new Date().toISOString().split('T')[0],
            size: payload.size || '1.2 MB',
            file_view_url: payload.fileDataUrl || 'https://drive.google.com/viewerng/viewer?embedded=true&url=https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
          };
          savedMemos.unshift(newDoc);
          try { localStorage.setItem('ceu_memos', JSON.stringify(savedMemos)); } catch(e) {}
          State.memos = savedMemos;
          resolve({ success: true, message: 'Dokumen berjaya dimuat naik ke Minit, Memorandum dan Persuratan!', data: newDoc });
        } else if (action === 'getAdminDashboard') {
          let teachers = (mock.users || []).filter(u => u.roleGroup === 'Guru Pendidikan Kerjaya' || u.role === 'Guru');
          const publishedEvents = (mock.events || []).filter(e => (e.status || 'Published').toLowerCase() !== 'draft');
          const requestedEventId = payload && payload.eventId;
          const targetEvent = (requestedEventId && mock.events.find(e => e.event_id === requestedEventId))
            || publishedEvents[0]
            || (mock.events && mock.events[0])
            || null;
          const targetEventId = targetEvent ? targetEvent.event_id : '';

          if (targetEvent && String(targetEvent.target_mode || targetEvent.targetMode).toLowerCase() === 'individual') {
            const raw = targetEvent.target_emails || targetEvent.individualEmails || '';
            const invitedEmails = (Array.isArray(raw) ? raw : String(raw).split(','))
              .map(s => String(s).toLowerCase().trim())
              .filter(Boolean);
            if (invitedEmails.length) {
              teachers = teachers.filter(t => invitedEmails.includes(String(t.email).toLowerCase().trim()));
            }
          }
          const totalTeachers = teachers.length;

          let attending = 0;
          let representative = 0;
          let absent = 0;

          const districtBreakdown = {
            'Brunei-Muara': { total: 0, hadir: 0, wakil: 0, tidakHadir: 0 },
            'Belait': { total: 0, hadir: 0, wakil: 0, tidakHadir: 0 },
            'Tutong': { total: 0, hadir: 0, wakil: 0, tidakHadir: 0 },
            'Temburong': { total: 0, hadir: 0, wakil: 0, tidakHadir: 0 }
          };

          teachers.forEach(t => {
            const d = t.district || 'Brunei-Muara';
            if (districtBreakdown[d]) districtBreakdown[d].total++;
          });

          if (targetEventId) {
            const eventRsvps = (mock.rsvps || []).filter(r => String(r.event_id) === String(targetEventId));
            eventRsvps.forEach(r => {
              const st = String(r.response_status || '').toLowerCase();
              const u = teachers.find(t => String(t.email).toLowerCase() === String(r.user_email).toLowerCase());
              const d = (u && u.district) || 'Brunei-Muara';

              if (st.includes('hadir') && !st.includes('tidak')) {
                attending++;
                if (districtBreakdown[d]) districtBreakdown[d].hadir++;
              } else if (st.includes('wakil')) {
                representative++;
                if (districtBreakdown[d]) districtBreakdown[d].wakil++;
              } else if (st.includes('tidak')) {
                absent++;
                if (districtBreakdown[d]) districtBreakdown[d].tidakHadir++;
              }
            });
          }

          const answered = attending + representative + absent;
          const pending = Math.max(0, totalTeachers - answered);
          const rsvpRate = totalTeachers > 0 ? Math.round((answered / totalTeachers) * 100) : 0;

          resolve({
            success: true,
            data: {
              kpi: {
                totalTeachers,
                rsvpRate,
                attending,
                representative,
                absent,
                pending
              },
              latestEvent: targetEvent,
              allEvents: publishedEvents,
              donutData: [
                { label: 'Hadir', count: attending, color: '#2ca0a0' },
                { label: 'Mewakilkan', count: representative, color: '#fcb726' },
                { label: 'Tidak Hadir', count: absent, color: '#ba1a1a' },
                { label: 'Belum Respon', count: pending, color: '#bcc9c8' }
              ],
              districtBreakdown
            }
          });
        } else if (action === 'getAdminRsvpTable') {
          let teachers = (mock.users || []).filter(u => u.roleGroup === 'Guru Pendidikan Kerjaya' || u.role === 'Guru');
          const publishedEvents = (mock.events || []).filter(e => (e.status || 'Published').toLowerCase() !== 'draft');
          const requestedEventId = payload && payload.eventId;
          const targetEvent = (requestedEventId && mock.events.find(e => e.event_id === requestedEventId))
            || publishedEvents[0]
            || (mock.events && mock.events[0])
            || null;
          const targetEventId = targetEvent ? targetEvent.event_id : '';

          if (targetEvent && String(targetEvent.target_mode || targetEvent.targetMode).toLowerCase() === 'individual') {
            const raw = targetEvent.target_emails || targetEvent.individualEmails || '';
            const invitedEmails = (Array.isArray(raw) ? raw : String(raw).split(','))
              .map(s => String(s).toLowerCase().trim())
              .filter(Boolean);
            if (invitedEmails.length) {
              teachers = teachers.filter(t => invitedEmails.includes(String(t.email).toLowerCase().trim()));
            }
          }
          const totalTeachers = teachers.length;

          const rows = teachers.map((u, i) => {
            const userRsvp = (mock.rsvps || []).find(r =>
              String(r.user_email).toLowerCase() === String(u.email).toLowerCase() &&
              String(r.event_id) === String(targetEventId)
            );

            return {
              no: i + 1,
              email: u.email,
              name: u.name,
              school: u.school,
              district: u.district,
              phone: u.phone,
              status: userRsvp ? userRsvp.response_status : 'Belum Respon',
              repName: userRsvp ? (userRsvp.rep_name || '') : '',
              absenceReason: userRsvp ? (userRsvp.absence_reason || '') : '',
              submittedAt: userRsvp ? (userRsvp.submitted_at ? userRsvp.submitted_at.replace('T', ' ').substring(0, 16) : '-') : '-'
            };
          });

          resolve({
            success: true,
            data: rows,
            targetEvent: targetEvent
          });
        } else if (action === 'saveEvent') {
          const eventId = payload.eventId || ('EVT-' + Date.now());
          const newEvt = {
            event_id: eventId,
            title_bm: payload.titleBm,
            title_en: payload.titleEn || payload.titleBm,
            event_date: payload.eventDate,
            start_time: payload.startTime,
            end_time: payload.endTime,
            venue: payload.venue,
            meeting_link: payload.meetingLink || '',
            rsvp_deadline: payload.rsvpDeadline,
            attachment_drive_url: payload.driveUrl || '',
            status: payload.isDraft ? 'Draft' : 'Published',
            created_by: (State.currentUser && State.currentUser.email) ? State.currentUser.email : 'pegawai.upk@moe.bn',
            target_mode: payload.targetMode || 'group',
            target_districts: payload.targetDistricts || ['Semua'],
            target_roles: payload.targetRoles || ['Guru Pendidikan Kerjaya'],
            target_emails: payload.individualEmails || [],
            target_count: payload.targetCount || (payload.individualEmails ? payload.individualEmails.length : 37)
          };
          if (!mock.events) mock.events = [];
          const existingIdx = mock.events.findIndex(e => String(e.event_id) === String(eventId));
          if (existingIdx !== -1) {
            mock.events[existingIdx] = Object.assign(mock.events[existingIdx], newEvt);
          } else {
            mock.events.unshift(newEvt);
          }

          // Masukkan hebahan ke notifikasi jika FCM diaktifkan
          if (!payload.isDraft && payload.channels && payload.channels.fcm) {
            const newNotif = {
              notif_id: 'NOTIF-' + Date.now(),
              title_bm: 'Hebahan Program Baharu: ' + payload.titleBm,
              title_en: 'New Event Notice: ' + (payload.titleEn || payload.titleBm),
              content_bm: `Program dijadualkan pada ${payload.eventDate} di ${payload.venue}. Tarikh tutup RSVP: ${(payload.rsvpDeadline || '').replace('T', ' ')}. Sasaran: ${payload.targetCount || 37} guru.`,
              content_en: `Scheduled on ${payload.eventDate} at ${payload.venue}. RSVP Deadline: ${(payload.rsvpDeadline || '').replace('T', ' ')}. Target: ${payload.targetCount || 37} teachers.`,
              type: 'Urgent',
              sent_at: 'Baru sahaja',
              is_read: false
            };
            if (!mock.notifications) mock.notifications = [];
            mock.notifications.unshift(newNotif);
            State.notifications = mock.notifications;
            updateNotifBadge();
          }

          resolve({
            success: true,
            message: payload.isDraft
              ? 'Draf acara berjaya disimpan (belum diterbitkan kepada guru).'
              : `Acara berjaya diterbitkan & disiarkan kepada ${payload.targetCount || 37} orang guru!`,
            data: newEvt
          });
        } else if (action === 'generateAttendancePdf') {
          const targetEventId = payload && payload.eventId;
          const teachers = (mock.users || []).filter(u => u.roleGroup === 'Guru Pendidikan Kerjaya' || u.role === 'Guru');
          const totalTeachers = teachers.length;
          const publishedEvents = (mock.events || []).filter(e => (e.status || 'Published').toLowerCase() !== 'draft');
          const activeEvent = (targetEventId && mock.events.find(e => e.event_id === targetEventId))
            || publishedEvents[0]
            || (mock.events && mock.events[0])
            || null;
          const activeId = activeEvent ? activeEvent.event_id : '';

          let attending = 0, rep = 0, absent = 0;
          if (activeId) {
            const evRsvps = (mock.rsvps || []).filter(r => String(r.event_id) === String(activeId));
            evRsvps.forEach(r => {
              const st = String(r.response_status || '').toLowerCase();
              if (st.includes('hadir') && !st.includes('tidak')) attending++;
              else if (st.includes('wakil')) rep++;
              else if (st.includes('tidak')) absent++;
            });
          }
          const pending = Math.max(0, totalTeachers - (attending + rep + absent));
          const reportId = 'REP-CEU-' + Date.now().toString(36).toUpperCase();

          resolve({
            success: true,
            report: {
              reportId: reportId,
              generatedAt: new Date().toISOString(),
              event: activeEvent,
              summary: {
                totalTeachers: totalTeachers,
                attending: attending,
                representative: rep,
                absent: absent,
                pending: pending
              },
              hmacSignature: 'HMAC-SHA256-' + Math.random().toString(36).substring(2, 10).toUpperCase() + '-MOE-BN',
              verificationUrl: `https://ceujss2026.github.io/portal-ceu/?verify=${reportId}`
            }
          });
        } else if (action === 'deleteEvent') {
          const eventId = payload.eventId;
          if (mock.events) {
            mock.events = mock.events.filter(e => e.event_id !== eventId);
          }
          State.events = (State.events || []).filter(e => e.event_id !== eventId);
          resolve({ success: true, message: 'Acara berjaya dipadamkan.' });
        } else if (action === 'publishDraft') {
          const eventId = payload.eventId;
          const evt = (mock.events || []).find(e => e.event_id === eventId);
          if (evt) {
            evt.status = 'Published';
            // Masukkan hebahan ke notifikasi
            const newNotif = {
              notif_id: 'NOTIF-' + Date.now(),
              title_bm: 'Hebahan Program Baharu: ' + evt.title_bm,
              title_en: 'New Event Notice: ' + (evt.title_en || evt.title_bm),
              content_bm: `Program dijadualkan pada ${evt.event_date} di ${evt.venue || 'BPK'}. Sila lengkapkan RSVP anda.`,
              content_en: `Scheduled on ${evt.event_date} at ${evt.venue || 'BPK'}. Please complete your RSVP.`,
              type: 'Urgent',
              sent_at: 'Baru sahaja',
              is_read: false
            };
            if (!mock.notifications) mock.notifications = [];
            mock.notifications.unshift(newNotif);
            State.notifications = mock.notifications;
            updateNotifBadge();
            resolve({ success: true, message: 'Draf acara berjaya diterbitkan & disiarkan kepada guru!' });
          } else {
            resolve({ success: false, message: 'Acara tidak dijumpai.' });
          }
        } else {
          resolve({ success: true, message: 'Operasi simulasi selesai.' });
        }
      }, 200);
    });
  }

  // ==========================================================================
  // 4. BIOMETRIK & KESELAMATAN PERANTI (gas-rahasia-script-properties)
  // ==========================================================================
  function updateBiometricUI() {
    const rawBioUser = localStorage.getItem('ceu_bio_user');
    const enrolledBox = document.getElementById('bio-enrolled-state');
    const notEnrolledBox = document.getElementById('bio-not-enrolled-state');
    const tabEmail = document.getElementById('tab-btn-email');
    const tabBio = document.getElementById('tab-btn-biometric');

    if (rawBioUser) {
      try {
        const u = JSON.parse(rawBioUser);
        const nameParts = (u.name || 'Guru').trim().split(/\s+/);
        const initials = nameParts.length > 1
          ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
          : (nameParts[0].slice(0, 2)).toUpperCase();

        const initialsEl = document.getElementById('bio-user-initials');
        const nameEl = document.getElementById('bio-user-name');
        const schoolEl = document.getElementById('bio-user-school');

        if (initialsEl) initialsEl.textContent = initials;
        if (nameEl) nameEl.textContent = u.name || 'Pegawai / Guru';
        if (schoolEl) schoolEl.textContent = `${u.school || ''} (${u.district || ''})`;

        if (enrolledBox) enrolledBox.classList.remove('hidden');
        if (notEnrolledBox) notEnrolledBox.classList.add('hidden');

        // Buka tab biometrik jika peranti ini sudah berdaftar
        if (tabBio && typeof tabBio.click === 'function') tabBio.click();
        return;
      } catch (e) {
        console.warn('Gagal membaca profil biometrik tempatan:', e);
      }
    }

    // Jika belum ada pendaftaran biometrik pada peranti ini
    if (enrolledBox) enrolledBox.classList.add('hidden');
    if (notEnrolledBox) notEnrolledBox.classList.remove('hidden');

    // Utamakan tab Emel OTP untuk pengguna baharu
    if (tabEmail && typeof tabEmail.click === 'function') tabEmail.click();
  }

  async function registerPlatformBiometric(user) {
    if (!window.PublicKeyCredential) return false;
    try {
      if (PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        if (!available) {
          showToast(State.lang === 'en' ? 'Biometric sensor not available on this device.' : 'Penderia biometrik tidak tersedia pada peranti ini.', 'warning');
          return false;
        }
      }

      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);
      const userId = new TextEncoder().encode((user && user.email) || 'ceu_user');

      const hostname = window.location.hostname;
      const rpConfig = { name: "Portal CEU UPK Brunei" };
      if (hostname && hostname !== 'localhost' && !hostname.match(/^[0-9.]+$/)) {
        rpConfig.id = hostname;
      }

      const cred = await navigator.credentials.create({
        publicKey: {
          challenge: challenge,
          rp: rpConfig,
          user: {
            id: userId,
            name: (user && user.email) || 'guru@moe.edu.bn',
            displayName: (user && user.name) || 'Guru Pendidikan Kerjaya'
          },
          pubKeyCredParams: [
            { alg: -7, type: "public-key" },  // ES256
            { alg: -257, type: "public-key" } // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform", // Khas untuk cap jari / Face ID terbina dalam telefon
            requireResidentKey: true,
            residentKey: "required",
            userVerification: "required"
          },
          timeout: 60000
        }
      });

      if (cred && cred.rawId) {
        const idBase64 = btoa(String.fromCharCode(...new Uint8Array(cred.rawId)));
        localStorage.setItem('ceu_webauthn_cred_id', idBase64);
        return true;
      }
    } catch (e) {
      console.warn('Pendaftaran biometrik WebAuthn telefon:', e);
    }
    return false;
  }

  let isBiometricRunning = false;
  async function triggerBiometricLogin() {
    if (isBiometricRunning) return;
    isBiometricRunning = true;

    try {
      const ring = document.getElementById('bio-ring');
      if (ring) {
        ring.classList.add('scale-125', 'opacity-100');
        setTimeout(() => ring.classList.remove('scale-125', 'opacity-100'), 1000);
      }

      const storedBioToken = localStorage.getItem('ceu_bio_token');
      const storedBioUser = localStorage.getItem('ceu_bio_user');

      if (!storedBioToken || !storedBioUser) {
        const emailInput = document.getElementById('email') || document.getElementById('auth-email-input');
        const email = (emailInput?.value || '').trim();
        if (!email) {
          showToast(State.lang === 'en' ? 'Please enter your official email first to use biometrics.' : 'Sila masukkan e-mel rasmi Awda terlebih dahulu.', 'warning');
          if (emailInput) emailInput.focus();
          return;
        }
        showToast(State.lang === 'en' ? 'Verifying email account...' : 'Menyemak akaun e-mel...', 'info');
        setTimeout(async () => {
          const res = await api('biometricLogin', { email: email });
          if (res && res.success) {
            State.token = res.token;
            State.currentUser = res.user;
            localStorage.setItem('ceu_tok', res.token);
            localStorage.setItem('ceu_user', JSON.stringify(res.user));
            localStorage.setItem('ceu_bio_token', res.token);
            localStorage.setItem('ceu_bio_user', JSON.stringify(res.user));
            showToast((State.lang === 'en' ? 'Biometric verified! Welcome ' : 'Biometrik disahkan! Selamat datang ') + res.user.name, 'success');
            await loadAppBoot();
            navigateAfterLogin(res.user);
          } else {
            showToast((res && res.message) || (State.lang === 'en' ? 'Please log in with OTP first.' : 'Sila log masuk dengan OTP terlebih dahulu.'), 'warning');
          }
        }, 500);
        return;
      }

      showToast(I18N[State.lang].bioPromptLabel, 'info');

    // 1. Android APK Native Bridge (CEUAndroid WebView Bridge)
    if (window.CEUAndroid && typeof window.CEUAndroid.promptBiometric === 'function') {
      try {
        window.CEUAndroid.promptBiometric();
        return;
      } catch (e) {
        console.warn('Native bridge error, falling back to WebAuthn:', e);
      }
    }

    // 2. Real Browser WebAuthn (Touch ID / Face ID / Windows Hello / Android Biometrics)
    if (window.PublicKeyCredential) {
      try {
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);
        const storedCredId = localStorage.getItem('ceu_webauthn_cred_id');
        let verified = false;

        if (storedCredId) {
          const rawId = Uint8Array.from(atob(storedCredId), c => c.charCodeAt(0));
          const getOptions = {
            challenge: challenge,
            allowCredentials: [{
              id: rawId,
              type: 'public-key',
              transports: ['internal']
            }],
            timeout: 60000,
            userVerification: 'required'
          };

          const hostname = window.location.hostname;
          if (hostname && hostname !== 'localhost' && !hostname.match(/^[0-9.]+$/)) {
            getOptions.rpId = hostname;
          }

          const assertion = await navigator.credentials.get({
            publicKey: getOptions
          });

          if (assertion) verified = true;
        } else {
          // Jika belum pernah simpan passkey, jalankan pendaftaran biometrik peranti
          let userObj = {};
          try { userObj = JSON.parse(storedBioUser); } catch(e) {}
          const registered = await registerPlatformBiometric(userObj);
          if (registered) verified = true;
        }

        if (verified) {
          executeBiometricSuccess(storedBioToken);
        } else {
          showToast(State.lang === 'en' ? 'Biometric verification was cancelled.' : 'Imbasan biometrik dibatalkan.', 'warning');
        }
        return; // SELESAI: Jangan benarkan log masuk jika biometrik dibatalkan!
      } catch (err) {
        console.warn('WebAuthn prompt cancelled or error:', err);
        showToast(State.lang === 'en' ? 'Biometric scan was cancelled.' : 'Imbasan biometrik dibatalkan.', 'warning');
        return; // SELESAI: Tamat jika pengguna membatalkan!
      }
    }

    // Jika pelayar tidak menyokong WebAuthn perkakasan sama sekali
    showToast(State.lang === 'en' ? 'Biometric is not supported on this browser. Please use official email OTP.' : 'Biometrik perkakasan tidak disokong pada pelayar ini. Sila gunakan OTP.', 'warning');
    } finally {
      setTimeout(() => { isBiometricRunning = false; }, 800);
    }
  }

  window.onBiometricSuccess = function (token) {
    const storedBioToken = token || localStorage.getItem('ceu_bio_token');
    executeBiometricSuccess(storedBioToken);
  };

  window.onBiometricFailed = function (errMsg) {
    showToast(errMsg || 'Pengesahan biometrik gagal.', 'error');
  };

  async function executeBiometricSuccess(tokenToVerify) {
    showToast(State.lang === 'en' ? 'Biometric verified. Authenticating...' : 'Biometrik disahkan. Menyemak sesi...', 'info');
    const res = await api('biometricLogin', { token: tokenToVerify });
    if (res && res.success) {
      State.token = res.token;
      State.currentUser = res.user;
      localStorage.setItem('ceu_tok', res.token);
      localStorage.setItem('ceu_user', JSON.stringify(res.user));
      // Kemas kini token biometrik yang disegarkan
      localStorage.setItem('ceu_bio_token', res.token);
      localStorage.setItem('ceu_bio_user', JSON.stringify(res.user));

      showToast(I18N[State.lang].activeStatus + ': ' + res.user.name, 'success');
      loadAppBoot();
    } else {
      showToast((res && res.message) || (State.lang === 'en' ? 'Biometric session expired. Please log in with OTP.' : 'Sesi biometrik telah luput. Sila log masuk semula dengan OTP.'), 'error');
      // Jika token lama sudah tidak sah di server, padamkan token lama
      localStorage.removeItem('ceu_bio_token');
      updateBiometricUI();
    }
  }

  // ==========================================================================
  // 4B. PEMBANTU FORMAT MASA (TIME FORMATTING 12H / 24H)
  // ==========================================================================
  function formatTime12H(timeStr, lang = State.lang || 'bm') {
    if (!timeStr) return '';
    const clean = String(timeStr).trim();
    if (!clean) return '';

    // Tangkap jam, minit dan sebarang penunjuk masa yang sedia ada
    const match = clean.match(/^(\d{1,2})[:.](\d{2})(?:\s*([A-Za-z\s]+))?$/i);
    if (!match) return clean;

    let h = parseInt(match[1], 10);
    const m = match[2];
    const periodStr = (match[3] || '').trim().toUpperCase();

    // Tentukan sama ada PM atau AM
    let isPM = false;
    if (periodStr.includes('PM') || periodStr.includes('PETANG') || periodStr.includes('MALAM') || periodStr.includes('TGH') || periodStr.includes('TENGAH HARI')) {
      isPM = true;
    } else if (periodStr.includes('AM') || periodStr.includes('PAGI') || periodStr.includes('TENGAH MALAM')) {
      isPM = false;
    } else {
      isPM = h >= 12;
    }

    // Tukar ke format 24 jam tulen untuk penentuan waktu
    let h24 = h;
    if (h < 12 && isPM) {
      h24 = h + 12;
    } else if (h === 12 && !isPM && (periodStr.includes('AM') || periodStr.includes('PAGI') || periodStr.includes('TENGAH MALAM'))) {
      h24 = 0;
    }

    // Tukar ke format 12 jam (1-12)
    let h12 = h24 % 12;
    if (h12 === 0) h12 = 12;

    // Tentukan fasa waktu Bahasa Melayu & Inggeris
    let periodBm = 'PAGI';
    let periodEn = 'AM';

    if (h24 === 0) {
      periodBm = 'TENGAH MALAM';
      periodEn = 'AM';
    } else if (h24 < 12) {
      periodBm = 'PAGI';
      periodEn = 'AM';
    } else if (h24 === 12) {
      periodBm = 'TENGAH HARI';
      periodEn = 'PM';
    } else if (h24 < 19) {
      periodBm = 'PETANG';
      periodEn = 'PM';
    } else {
      periodBm = 'MALAM';
      periodEn = 'PM';
    }

    if (lang === 'en') {
      return `${h12}:${m} ${periodEn}`;
    }
    return `${h12}:${m} ${periodBm}`;
  }

  function timeTo24H(timeStr) {
    if (!timeStr) return '08:30';
    const clean = String(timeStr).trim();
    const match = clean.match(/^(\d{1,2})[:.](\d{2})(?:\s*([A-Za-z\s]+))?$/i);
    if (!match) return '08:30';

    let h = parseInt(match[1], 10);
    const m = match[2];
    const periodStr = (match[3] || '').trim().toUpperCase();

    // Jika jam sudah > 12, ia sah format 24 jam
    if (h > 12) {
      return `${String(h).padStart(2, '0')}:${m}`;
    }

    const isPM = periodStr.includes('PM') || periodStr.includes('PETANG') || periodStr.includes('MALAM') || periodStr.includes('TGH') || periodStr.includes('TENGAH HARI');
    const isAM = periodStr.includes('AM') || periodStr.includes('PAGI') || periodStr.includes('TENGAH MALAM');

    if (isPM) {
      if (h < 12) h += 12;
    } else if (isAM) {
      if (h === 12) h = 0;
    }

    return `${String(h).padStart(2, '0')}:${m}`;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function normalizeDateISOToYMD(dVal) {
    if (!dVal) return '';
    if (typeof dVal === 'object' && dVal instanceof Date) {
      const y = dVal.getFullYear();
      const m = String(dVal.getMonth() + 1).padStart(2, '0');
      const d = String(dVal.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    const s = String(dVal).trim();
    if (s.includes('T')) {
      const d = new Date(s);
      if (!isNaN(d.getTime())) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      }
    }
    return s;
  }

  function formatEventDateClean(dateVal) {
    if (!dateVal) return '';
    if (typeof dateVal === 'object' && dateVal instanceof Date) {
      const monthNames = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];
      return `${dateVal.getDate()} ${monthNames[dateVal.getMonth()]} ${dateVal.getFullYear()}`;
    }
    const str = String(dateVal).trim();
    if (!str) return '';

    // Tangani format ISO seperti 2026-11-03T16:00:00.000Z
    if (str.includes('T')) {
      const d = new Date(str);
      if (!isNaN(d.getTime())) {
        const monthNames = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];
        return `${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      }
    }

    // Tangani format YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      const [y, m, d] = str.split('-');
      const monthNames = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];
      return `${parseInt(d, 10)} ${monthNames[parseInt(m, 10) - 1] || m} ${y}`;
    }

    return str;
  }

  function getEventDisplayName(e) {
    if (!e) return 'Acara Rasmi';
    const title = (State.lang === 'en' && e.title_en) ? e.title_en : (e.title_bm || e.title || '');
    if (title && title.trim()) return title.trim();
    if (e.category) return `${e.category} (${e.event_id || 'Rasmi'})`;
    return e.event_id || 'Acara Rasmi';
  }

  // ==========================================================================
  // 5. ENJIN TERJEMAHAN DINAMIK (DYNAMIC I18N ENGINE)
  // ==========================================================================
  function applyTranslations() {
    const dict = I18N[State.lang] || I18N.bm;

    // 1. Teks Elemen HTML
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) {
        el.innerHTML = dict[key];
      }
    });

    // 2. Placeholder Input
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (dict[key] !== undefined) {
        el.placeholder = dict[key];
      }
    });

    // 3. Title / Tooltips
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (dict[key] !== undefined) {
        el.title = dict[key];
      }
    });

    // 4. Kemas kini status daerah header jika user sedia ada
    if (State.currentUser) {
      const districtEl = document.getElementById('header-district-badge');
      if (districtEl) {
        districtEl.textContent = (State.lang === 'en' ? 'District: ' : 'Daerah: ') + State.currentUser.district;
      }
    }
  }

  function setLanguage(lang, isManual = false) {
    State.lang = lang;
    localStorage.setItem('ceu_lang', lang);

    document.querySelectorAll('.lang-btn-bm').forEach(b => {
      const isAuthSwitch = b.closest('#lang-switch') || b.closest('#header-lang-switch');
      if (isAuthSwitch) {
        b.classList.add('rounded-full');
        b.classList.toggle('bg-surface-container-lowest', lang === 'bm');
        b.classList.toggle('text-primary', lang === 'bm');
        b.classList.toggle('font-bold', lang === 'bm');
        b.classList.toggle('text-white/80', lang !== 'bm');
        b.classList.toggle('opacity-80', lang !== 'bm');
      } else {
        b.classList.toggle('bg-tertiary', lang === 'bm');
        b.classList.toggle('text-white', lang === 'bm');
        b.classList.toggle('text-white/70', lang !== 'bm');
      }
    });
    document.querySelectorAll('.lang-btn-en').forEach(b => {
      const isAuthSwitch = b.closest('#lang-switch') || b.closest('#header-lang-switch');
      if (isAuthSwitch) {
        b.classList.add('rounded-full');
        b.classList.toggle('bg-surface-container-lowest', lang === 'en');
        b.classList.toggle('text-primary', lang === 'en');
        b.classList.toggle('font-bold', lang === 'en');
        b.classList.toggle('text-white/80', lang !== 'en');
        b.classList.toggle('opacity-80', lang !== 'en');
      } else {
        b.classList.toggle('bg-tertiary', lang === 'en');
        b.classList.toggle('text-white', lang === 'en');
        b.classList.toggle('text-white/70', lang !== 'en');
      }
    });

    // Terapkan semua teks statik & placeholder
    applyTranslations();

    // Re-render paparan aktif & sokongan berbilang bahasa
    renderMonthlyCalendar();
    if (State.currentView === 'home') renderHomeView();
    if (State.currentView === 'archive') renderArchiveView();
    if (State.currentView === 'notif') renderNotifView();
    if (State.currentView === 'admin-dashboard') renderAdminDashboardView();
    if (State.currentView === 'admin-rsvp') renderAdminRsvpTableView();
    if (State.currentView === 'admin-events') {
      applyTranslations();
      updateFormProgress();
    }
    if (State.currentView === 'profile') renderProfileView();

    if (isManual) { showToast(lang === 'en' ? 'Language switched to English' : 'Bahasa ditukar ke Bahasa Melayu', 'info'); }
  }

  // ==========================================================================
  // 6. NAVIGASI, ROUTING & UI RENDER
  // ==========================================================================
  
  function navigateAfterLogin(user) {
    if (user && String(user.role).toLowerCase() === 'admin') {
      setView('admin-dashboard');
    } else {
      setView('home');
    }
  }

  function setView(viewName) {
    State.currentView = viewName;
    document.querySelectorAll('.app-view').forEach(el => {
      el.classList.add('view-hidden');
      el.classList.remove('view-visible');
    });

    const target = document.getElementById('view-' + viewName);
    if (target) {
      target.classList.remove('view-hidden');
      target.classList.add('view-visible');
    }

    const isAuth = viewName === 'auth';
    const bottomNav = document.getElementById('app-bottom-nav');
    const appHeader = document.getElementById('app-header');
    const mainContainer = document.getElementById('main-container');
    if (bottomNav) bottomNav.style.display = isAuth ? 'none' : 'flex';
    if (appHeader) appHeader.style.display = isAuth ? 'none' : 'flex';
    if (mainContainer) {
      if (isAuth) {
        mainContainer.classList.remove('pb-24', 'max-w-5xl');
        mainContainer.classList.add('p-0', 'max-w-none');
        document.body.classList.add('bg-[#004c6b]');
      } else {
        mainContainer.classList.add('pb-24', 'max-w-5xl');
        mainContainer.classList.remove('p-0', 'max-w-none');
        document.body.classList.remove('bg-[#004c6b]');
      }
    }

    updateNavActiveTabs();

    if (viewName === 'auth') updateBiometricUI();
    if (viewName === 'home') renderHomeView();
    if (viewName === 'archive') renderArchiveView();
    if (viewName === 'notif') renderNotifView();
    if (viewName === 'profile') renderProfileView();
    if (viewName === 'admin-dashboard') renderAdminDashboardView();
    if (viewName === 'admin-rsvp') renderAdminRsvpTableView();
    if (viewName === 'admin-events') {
      applyTranslations();
      if (!editingEventId) {
        resetCreateEventForm();
      }
      updateFormProgress();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateNavActiveTabs() {
    const nav = document.getElementById('app-bottom-nav');
    if (!nav) return;

    if (!State.currentUser || State.currentView === 'auth') {
      nav.style.display = 'none';
      return;
    }
    nav.style.display = 'block';

    const isUrgent = State.currentView === 'home' && State.activeEventFilter === 'urgent';
    const isAdmin = State.currentUser && State.currentUser.role === 'Admin';

    // Update 5th button label/icon
    const profileIcon = document.getElementById('nav-profile-icon');
    const profileLabel = document.getElementById('nav-profile-label');
    const btnProfile = document.getElementById('nav-btn-profile');
    if (profileIcon && profileLabel && btnProfile) {
      profileIcon.textContent = 'manage_accounts';
      profileLabel.textContent = State.lang === 'en' ? 'Profile' : 'Profil';
      btnProfile.dataset.tab = 'profile';
    }

    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      const tab = btn.dataset.tab;
      let isActive = false;
      if (tab === 'home') {
        isActive = (State.currentView === 'home' && !isUrgent && !State.selectedCalendarDate) || (State.currentView === 'admin-dashboard');
      } else if (tab === 'takwim' || tab === 'calendar') {
        isActive = State.currentView === 'home' && Boolean(State.selectedCalendarDate);
      } else if (tab === 'rsvp') {
        isActive = State.currentView === 'admin-rsvp' || (State.currentView === 'home' && isUrgent);
      } else if (tab === 'archive') {
        isActive = State.currentView === 'archive';
      } else if (tab === 'notif') {
        isActive = State.currentView === 'notif';
      } else if (tab === 'profile') {
        isActive = State.currentView === 'profile' || State.currentView === 'admin-users';
      }

      const iconSpan = btn.querySelector('.material-symbols-outlined');
      if (isActive) {
        btn.className = 'nav-tab-btn flex flex-col items-center justify-center flex-1 h-full py-1 text-primary bg-primary/10 rounded-xl border-t-2 border-secondary font-black scale-[1.03] cursor-pointer transition-all' + (tab === 'notif' ? ' relative' : '');
        if (iconSpan) iconSpan.style.fontVariationSettings = "'FILL' 1";
      } else {
        btn.className = 'nav-tab-btn flex flex-col items-center justify-center flex-1 h-full py-1 text-on-surface-variant hover:text-primary border-t-2 border-transparent cursor-pointer font-medium transition-all' + (tab === 'notif' ? ' relative' : '');
        if (iconSpan) iconSpan.style.fontVariationSettings = "'FILL' 0";
      }
    });

    // Update notif dot badge
    const notifDot = document.getElementById('bottom-notif-dot');
    if (notifDot) {
      let readIds = [];
      try { readIds = JSON.parse(localStorage.getItem('ceu_read_notifs') || '[]'); } catch(e) {}
      const unreadCount = (State.announcements || []).filter(a => !readIds.includes(a.id)).length;
      notifDot.style.display = unreadCount > 0 ? 'inline-block' : 'none';
    }
  }

  // ==========================================================================
  // 7. PEMUATAN DATA UTAMA (BOOT)
  // ==========================================================================
  async function loadAppBoot() {
    const res = await api('boot', {});
    if (res && res.success && res.data) {
      State.currentUser = res.data.user || State.currentUser;
      State.events = (res.data.events || []).map(e => {
        if (e.event_date) e.event_date = normalizeDateISOToYMD(e.event_date);
        return e;
      });
      State.rsvps = res.data.rsvp || [];
      State.notifications = res.data.notifications || [];
      if (res.data.users && Array.isArray(res.data.users)) {
        State.users = res.data.users;
      }

      const nameEl = document.getElementById('header-user-name');
      const districtEl = document.getElementById('header-district-badge');
      const homeGreetingName = document.getElementById('home-greeting-name');
      const homeGreetingLabel = document.getElementById('home-greeting-label');

      if (nameEl && State.currentUser) nameEl.textContent = State.currentUser.name;
      if (homeGreetingName && State.currentUser) {
        homeGreetingName.textContent = State.currentUser.name || State.currentUser.email;
      }
      if (homeGreetingLabel && State.currentUser) {
        homeGreetingLabel.textContent = (State.lang === 'en' ? 'Welcome • ' : 'Selamat Datang • ') +
          (State.currentUser.role === 'Admin' ? (State.lang === 'en' ? 'UPK Officer' : 'Pegawai UPK') : (State.lang === 'en' ? 'Career Education Teacher' : 'Guru Pendidikan Kerjaya'));
      }
      if (districtEl && State.currentUser) {
        districtEl.textContent = (State.lang === 'en' ? 'District: ' : 'Daerah: ') + State.currentUser.district;
      }

      applyTranslations();
      updateNavActiveTabs();
      updateNotifBadge();
      renderMonthlyCalendar();
      setView(State.currentUser.role === 'Admin' ? 'admin-dashboard' : 'home');
    } else {
      setView('auth');
    }
  }

  // ==========================================================================
  // NOTIFICATION BADGE HELPER
  // ==========================================================================
  function updateNotifBadge() {
    let readIds = [];
    try { readIds = JSON.parse(localStorage.getItem('ceu_read_notifs') || '[]'); } catch(e) {}
    let unreadCount = 0;
    (State.notifications || []).forEach(n => {
      if (readIds.includes(n.notif_id)) {
        n.is_read = true;
      }
      if (!n.is_read) unreadCount++;
    });

    const headerBadge = document.getElementById('header-notif-badge');
    const bottomBadge = document.getElementById('bottom-notif-badge');
    if (headerBadge) {
      headerBadge.classList.toggle('hidden', unreadCount === 0);
    }
    if (bottomBadge) {
      bottomBadge.classList.toggle('hidden', unreadCount === 0);
    }
  }

  // ==========================================================================
  // KALENDAR INTERAKTIF (MOD MINGGUAN SEBAGAI LALAI, DENGAN OPSYEN BULANAN)
  // ==========================================================================
  const MONTH_NAMES = {
    bm: ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  };

  function getWeekDays(refDate) {
    const d = new Date(refDate);
    const day = d.getDay(); // 0: Ahad, 1: Isnin ...
    const diffToMon = (day === 0 ? -6 : 1) - day;
    const monday = new Date(d);
    monday.setDate(d.getDate() + diffToMon);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const cur = new Date(monday);
      cur.setDate(monday.getDate() + i);
      const y = cur.getFullYear();
      const m = String(cur.getMonth() + 1).padStart(2, '0');
      const dt = String(cur.getDate()).padStart(2, '0');
      days.push({
        dateObj: cur,
        dayNum: cur.getDate(),
        month: cur.getMonth(),
        year: y,
        dateStr: `${y}-${m}-${dt}`
      });
    }
    return days;
  }

  function getMonthCalendarCells(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();

    let startingDayOfWeek = firstDay.getDay() - 1;
    if (startingDayOfWeek === -1) startingDayOfWeek = 6;

    const cells = [];
    for (let p = 0; p < startingDayOfWeek; p++) {
      cells.push({ isEmpty: true });
    }
    for (let day = 1; day <= totalDays; day++) {
      const mm = String(month + 1).padStart(2, '0');
      const dd = String(day).padStart(2, '0');
      const dateStr = `${year}-${mm}-${dd}`;
      cells.push({
        isEmpty: false,
        dayNum: day,
        dateStr: dateStr
      });
    }
    return cells;
  }

  function renderCalendar() {
    const container = document.getElementById('calendar-grid');
    const monthLabel = document.getElementById('calendar-month-label');
    const filterIndicator = document.getElementById('calendar-filter-indicator');
    const filterText = document.getElementById('calendar-filter-text');
    const todayBtnText = document.getElementById('cal-today-btn-text');
    const btnWeekly = document.getElementById('btn-cal-weekly');
    const btnMonthly = document.getElementById('btn-cal-monthly');

    if (!container) return;

    const isWeekly = State.calendarMode === 'weekly';
    if (btnWeekly && btnMonthly) {
      btnWeekly.classList.toggle('bg-white', isWeekly);
      btnWeekly.classList.toggle('text-primary', isWeekly);
      btnWeekly.classList.toggle('font-bold', isWeekly);
      btnWeekly.classList.toggle('shadow-xs', isWeekly);
      btnWeekly.classList.toggle('text-white/80', !isWeekly);
      btnWeekly.classList.toggle('font-semibold', !isWeekly);

      btnMonthly.classList.toggle('bg-white', !isWeekly);
      btnMonthly.classList.toggle('text-primary', !isWeekly);
      btnMonthly.classList.toggle('font-bold', !isWeekly);
      btnMonthly.classList.toggle('shadow-xs', !isWeekly);
      btnMonthly.classList.toggle('text-white/80', isWeekly);
      btnMonthly.classList.toggle('font-semibold', isWeekly);
    }

    if (todayBtnText) {
      todayBtnText.textContent = isWeekly
        ? (State.lang === 'en' ? 'This Week' : 'Minggu Ini')
        : (State.lang === 'en' ? 'This Month' : 'Bulan Ini');
    }

    const now = new Date();
    const todayDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const publishedEvents = (State.events || [])
      .filter(e => (e.status || 'Published').toLowerCase() !== 'draft')
      .filter(e => isUserInvitedToEvent(e, State.currentUser));

    const mNames = (MONTH_NAMES[State.lang] || MONTH_NAMES.bm);

    if (isWeekly) {
      // 1. MOD MINGGUAN (DEFAULT)
      const days = getWeekDays(State.calendarDate);
      const startM = mNames[days[0].month];
      const endM = mNames[days[6].month];
      let weekLabelStr = '';
      if (days[0].month === days[6].month) {
        weekLabelStr = `${days[0].dayNum} - ${days[6].dayNum} ${startM} ${days[6].year}`;
      } else {
        weekLabelStr = `${days[0].dayNum} ${startM} - ${days[6].dayNum} ${endM} ${days[6].year}`;
      }

      if (monthLabel) {
        monthLabel.textContent = (State.lang === 'en' ? 'Week: ' : 'Minggu: ') + weekLabelStr;
      }

      container.innerHTML = days.map(d => {
        const isSelected = State.selectedCalendarDate === d.dateStr;
        const isToday = d.dateStr === todayDateStr;
        const hasEvents = publishedEvents.some(e => e.event_date === d.dateStr);

        let dayClasses = 'cal-day-btn h-11 sm:h-12 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer relative ';
        if (isSelected) {
          dayClasses += 'bg-secondary-container text-on-secondary-container shadow-lg font-black scale-105 ring-2 ring-white';
        } else if (isToday) {
          dayClasses += 'bg-white text-primary font-black shadow-md border-2 border-secondary-container';
        } else if (hasEvents) {
          dayClasses += 'bg-white/25 text-white font-extrabold shadow-sm border border-white/40 ring-1 ring-secondary-container/60 hover:bg-white/35';
        } else {
          dayClasses += 'bg-white/10 text-white/90 font-bold border border-white/10 hover:bg-white/20';
        }

        return `
          <button type="button" data-date="${d.dateStr}" class="${dayClasses}" title="${isToday ? (State.lang === 'en' ? 'Today' : 'Hari Ini') : ''}">
            <span class="font-headline text-xs sm:text-sm font-bold leading-none">${d.dayNum}</span>
            ${hasEvents
              ? `<span class="w-1.5 h-1.5 rounded-full mt-1 ${isSelected ? 'bg-primary' : 'bg-secondary-container'}"></span>`
              : (isToday
                  ? `<span class="w-1 h-1 rounded-full mt-1 bg-primary"></span>`
                  : '<span class="w-1.5 h-1.5 mt-1 bg-transparent"></span>')}
          </button>
        `;
      }).join('');
    } else {
      // 2. MOD BULANAN (OPSYEN PILIHAN)
      const year = State.calendarDate.getFullYear();
      const month = State.calendarDate.getMonth();
      const monthName = mNames[month];

      if (monthLabel) {
        monthLabel.textContent = `${State.lang === 'en' ? 'Month: ' : 'Bulan '}${monthName} ${year}`;
      }

      const cells = getMonthCalendarCells(year, month);
      container.innerHTML = cells.map(c => {
        if (c.isEmpty) {
          return `<div class="h-9 sm:h-10"></div>`;
        }

        const isSelected = State.selectedCalendarDate === c.dateStr;
        const isToday = c.dateStr === todayDateStr;
        const hasEvents = publishedEvents.some(e => e.event_date === c.dateStr);

        let dayClasses = 'cal-day-btn h-9 sm:h-10 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer relative ';
        if (isSelected) {
          dayClasses += 'bg-secondary-container text-on-secondary-container shadow-lg font-black scale-105 ring-2 ring-white';
        } else if (isToday) {
          dayClasses += 'bg-white text-primary font-black shadow-md border-2 border-secondary-container';
        } else if (hasEvents) {
          dayClasses += 'bg-white/25 text-white font-extrabold shadow-sm border border-white/40 ring-1 ring-secondary-container/60 hover:bg-white/35';
        } else {
          dayClasses += 'bg-white/10 text-white/90 font-bold border border-white/10 hover:bg-white/20';
        }

        return `
          <button type="button" data-date="${c.dateStr}" class="${dayClasses}" title="${isToday ? (State.lang === 'en' ? 'Today' : 'Hari Ini') : ''}">
            <span class="font-headline text-xs sm:text-sm font-bold leading-none">${c.dayNum}</span>
            ${hasEvents
              ? `<span class="w-1.5 h-1.5 rounded-full mt-0.5 ${isSelected ? 'bg-primary' : 'bg-secondary-container'}"></span>`
              : (isToday
                  ? `<span class="w-1 h-1 rounded-full mt-0.5 bg-primary"></span>`
                  : '<span class="w-1.5 h-1.5 mt-0.5 bg-transparent"></span>')}
          </button>
        `;
      }).join('');
    }

    if (filterIndicator) {
      if (State.selectedCalendarDate) {
        filterIndicator.classList.remove('hidden');
        if (filterText) {
          filterText.textContent = (State.lang === 'en' ? 'Filtering: ' : 'Menapis: ') + State.selectedCalendarDate;
        }
      } else {
        filterIndicator.classList.add('hidden');
      }
    }

    container.querySelectorAll('.cal-day-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const dateStr = btn.dataset.date;
        if (State.selectedCalendarDate === dateStr) {
          State.selectedCalendarDate = null;
        } else {
          State.selectedCalendarDate = dateStr;
        }
        renderCalendar();
        renderHomeView();
      });
    });
  }

  // Alias untuk keserasian panggilan sedia ada
  const renderMonthlyCalendar = renderCalendar;

  // ==========================================================================
  // 8. RENDER PAPARAN HOME (TAKWIN GURU)
  // ==========================================================================
  function setEventFilter(filterName) {
    State.activeEventFilter = filterName;
    State.selectedCalendarDate = null; // Buka kunci tarikh kalendar jika pengguna menukar penapis utama
    updateNavActiveTabs();

    // Selaraskan gaya pil penapis
    document.querySelectorAll('.event-filter-pill').forEach(pill => {
      const isMatch = pill.dataset.filter === filterName;
      pill.classList.toggle('bg-primary', isMatch);
      pill.classList.toggle('text-white', isMatch);
      pill.classList.toggle('bg-surface-container', !isMatch);
      pill.classList.toggle('text-on-surface-variant', !isMatch);
    });

    renderHomeView();
  }

  function renderHomeView() {
    renderMonthlyCalendar();

    // Selaraskan nama dan jawatan pengguna pada pengepala utama (Elakkan nama salah/kekal Noraini)
    if (State.currentUser) {
      const homeGreetingName = document.getElementById('home-greeting-name');
      const homeGreetingLabel = document.getElementById('home-greeting-label');
      if (homeGreetingName) {
        homeGreetingName.textContent = State.currentUser.name || State.currentUser.email;
      }
      if (homeGreetingLabel) {
        homeGreetingLabel.textContent = (State.lang === 'en' ? 'Welcome • ' : 'Selamat Datang • ') +
          (State.currentUser.role === 'Admin' ? (State.lang === 'en' ? 'UPK Officer' : 'Pegawai UPK') : (State.lang === 'en' ? 'Career Education Teacher' : 'Guru Pendidikan Kerjaya'));
      }
    }

    const myEmail = (State.currentUser && State.currentUser.email) ? State.currentUser.email.toLowerCase() : '';
    const myRsvps = (State.rsvps || []).filter(r => r.user_email && r.user_email.toLowerCase() === myEmail);
    const myAnsweredIds = myRsvps.map(r => r.event_id);
    const myAttendedIds = myRsvps
      .filter(r => (r.response_status || '').toLowerCase().includes('hadir') && !(r.response_status || '').toLowerCase().includes('tidak'))
      .map(r => r.event_id);

    // Kemas kini nombor pada kad metrik pantas secara dinamik (Hanya acara yang diterbitkan)
    const countMonthEl = document.getElementById('metric-count-month');
    const countAttendedEl = document.getElementById('metric-count-attended');
    const countUrgentEl = document.getElementById('metric-count-urgent');
    const publishedEvents = (State.events || [])
      .filter(e => (e.status || 'Published').toLowerCase() !== 'draft')
      .filter(e => isUserInvitedToEvent(e, State.currentUser));
    const totalEventsCount = publishedEvents.length;
    const urgentCount = publishedEvents.filter(e => !myAnsweredIds.includes(e.event_id)).length;
    if (countMonthEl) countMonthEl.textContent = totalEventsCount;
    if (countAttendedEl) countAttendedEl.textContent = myAttendedIds.length;
    if (countUrgentEl) countUrgentEl.textContent = urgentCount;

    // Selaraskan cincin aktif pada kad metrik di atas
    const btnAll = document.getElementById('metric-btn-all');
    const btnAttended = document.getElementById('metric-btn-attended');
    const btnUrgent = document.getElementById('metric-btn-urgent');
    if (btnAll) {
      btnAll.classList.toggle('ring-2', State.activeEventFilter === 'all');
      btnAll.classList.toggle('ring-primary', State.activeEventFilter === 'all');
      btnAll.classList.toggle('shadow-md', State.activeEventFilter === 'all');
    }
    if (btnAttended) {
      btnAttended.classList.toggle('ring-2', State.activeEventFilter === 'attended');
      btnAttended.classList.toggle('ring-secondary', State.activeEventFilter === 'attended');
      btnAttended.classList.toggle('shadow-md', State.activeEventFilter === 'attended');
    }
    if (btnUrgent) {
      btnUrgent.classList.toggle('ring-2', State.activeEventFilter === 'urgent');
      btnUrgent.classList.toggle('ring-[#B45309]', State.activeEventFilter === 'urgent');
      btnUrgent.classList.toggle('shadow-md', State.activeEventFilter === 'urgent');
    }

    let filtered = publishedEvents;
    if (State.activeEventFilter === 'urgent') {
      filtered = filtered.filter(e => !myAnsweredIds.includes(e.event_id));
    } else if (State.activeEventFilter === 'attended') {
      filtered = filtered.filter(e => myAttendedIds.includes(e.event_id));
    }

    if (State.selectedCalendarDate) {
      filtered = filtered.filter(e => e.event_date === State.selectedCalendarDate);
    }

    const container = document.getElementById('events-card-list');
    if (!container) return;

    if (!filtered.length) {
      const isDateFiltered = !!State.selectedCalendarDate;
      const isUrgentFiltered = State.activeEventFilter === 'urgent';
      const isAttendedFiltered = State.activeEventFilter === 'attended';

      let msg = I18N[State.lang].noEventsFound;
      if (isDateFiltered) {
        msg = State.lang === 'en'
          ? `No events scheduled on ${State.selectedCalendarDate}.`
          : `Tiada program dijadualkan pada ${State.selectedCalendarDate}.`;
      } else if (isUrgentFiltered) {
        msg = State.lang === 'en'
          ? `All events have been responded to! Great job.`
          : `Alhamdulillah, semua tindakan RSVP telah selesai dijawab!`;
      } else if (isAttendedFiltered) {
        msg = State.lang === 'en'
          ? `No attended events recorded yet.`
          : `Belum ada rekod program yang disahkan hadir.`;
      }

      container.innerHTML = `
        <div class="bg-surface-container-low rounded-2xl p-8 text-center text-on-surface-variant my-4 border border-outline-variant/30 flex flex-col items-center">
          <div class="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-primary mb-3 shadow-inner">
            <span class="material-symbols-outlined text-[36px]">${isUrgentFiltered ? 'task_alt' : 'event_busy'}</span>
          </div>
          <p class="font-headline text-xs font-semibold max-w-[300px] leading-relaxed">${msg}</p>
          <button id="btn-show-all-events-empty" type="button" class="mt-4 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-md hover:bg-primary-dark active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer">
            <span class="material-symbols-outlined text-sm">visibility</span>
            <span>${State.lang === 'en' ? 'Show All Events' : 'Tunjuk Semua Program'}</span>
          </button>
        </div>
      `;

      document.getElementById('btn-show-all-events-empty')?.addEventListener('click', () => {
        State.selectedCalendarDate = null;
        State.activeEventFilter = 'all';
        document.querySelectorAll('.event-filter-pill').forEach(p => {
          const isAll = p.dataset.filter === 'all';
          p.classList.toggle('bg-primary', isAll);
          p.classList.toggle('text-white', isAll);
          p.classList.toggle('bg-surface-container', !isAll);
          p.classList.toggle('text-on-surface-variant', !isAll);
        });
        renderMonthlyCalendar();
        renderHomeView();
      });
      return;
    }

    container.innerHTML = filtered.map(ev => {
      const userRsvp = State.rsvps.find(r => r.event_id === ev.event_id);
      const isPending = !userRsvp;
      let statusBadge = '';
      if (userRsvp) {
        const st = (userRsvp.response_status || '').toLowerCase();
        if (st.includes('hadir') && !st.includes('tidak')) {
          statusBadge = `<span class="bg-primary-container text-on-primary px-3 py-1 rounded-full font-label-pill text-[11px] font-bold flex items-center gap-1.5 shadow-sm"><span class="w-1.5 h-1.5 rounded-full bg-white"></span>${I18N[State.lang].badgeAttending}</span>`;
        } else if (st.includes('wakil')) {
          statusBadge = `<span class="bg-surface-container-high text-on-surface px-3 py-1 rounded-full font-label-pill text-[11px] font-bold flex items-center gap-1.5"><span class="material-symbols-outlined text-[15px] text-secondary">sync_alt</span>${I18N[State.lang].badgeRep}</span>`;
        } else {
          statusBadge = `<span class="bg-error-container text-on-error-container px-3 py-1 rounded-full font-label-pill text-[11px] font-bold">${I18N[State.lang].badgeAbsent}</span>`;
        }
      } else {
        statusBadge = `<span class="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full font-label-pill text-[11px] font-bold flex items-center gap-1 shadow-sm"><span class="material-symbols-outlined text-[14px]" style="font-variation-settings: 'FILL' 1;">priority_high</span>${I18N[State.lang].badgePending}</span>`;
      }

      const title = (State.lang === 'en' && ev.title_en) ? ev.title_en : ev.title_bm;
      return `
        <article class="bg-surface-container-lowest rounded-2xl p-4 shadow-[0_8px_24px_rgba(29,120,120,0.08)] flex flex-col gap-3 relative border border-outline-variant/30 transition-all hover:shadow-md">
          <!-- Header row of Card -->
          <div class="flex items-start justify-between gap-2">
            <div class="flex flex-wrap items-center gap-1.5">
              ${statusBadge}
              ${ev.rsvp_deadline && isPending ? `
                <span class="bg-error-container text-on-error-container px-2.5 py-0.5 rounded-full font-caption text-[10px] font-semibold">
                  ${I18N[State.lang].deadline}: ${ev.rsvp_deadline.replace('T', ' ')}
                </span>
              ` : ''}
            </div>
            <span class="font-label-sm text-xs text-on-surface-variant font-medium flex items-center gap-1">
              <span class="material-symbols-outlined text-sm text-primary">event</span>
              ${formatEventDateClean(ev.event_date)}
            </span>
          </div>

          <!-- Event Details & Title -->
          <div class="flex flex-col gap-0.5">
            <span class="font-caption text-[11px] uppercase tracking-wider text-primary font-bold">
              ${ev.summary || 'Jabatan Sekolah-Sekolah • Unit CEU'}
            </span>
            <h2 class="font-headline-md text-base sm:text-lg font-bold text-on-surface leading-snug">
              ${title}
            </h2>
          </div>

          <!-- Schedule Micro-Info Strip (Gaya 16061) -->
          <div class="grid grid-cols-2 gap-2 bg-surface-container-low p-2.5 rounded-xl text-on-surface text-xs">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary shadow-xs shrink-0">
                <span class="material-symbols-outlined text-[16px]">schedule</span>
              </div>
              <div class="flex flex-col min-w-0">
                <span class="font-caption text-[10px] text-on-surface-variant">${I18N[State.lang].timeLabel}</span>
                <span class="font-label-md font-semibold truncate">${formatTime12H(ev.start_time)} - ${formatTime12H(ev.end_time)}</span>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-full bg-surface-container-lowest flex items-center justify-center text-secondary shadow-xs shrink-0">
                <span class="material-symbols-outlined text-[16px]">location_on</span>
              </div>
              <div class="flex flex-col min-w-0">
                <span class="font-caption text-[10px] text-on-surface-variant">${I18N[State.lang].venueLabel}</span>
                ${ev.venue && !ev.venue.toLowerCase().includes('talian') && !ev.venue.toLowerCase().includes('online') && !ev.venue.toLowerCase().includes('meet') ? `
                  <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ev.venue)}" target="_blank" rel="noopener noreferrer" class="font-label-md font-semibold truncate text-primary hover:underline flex items-center gap-1 group/map" title="${State.lang === 'en' ? 'Open in Google Maps' : 'Buka di Google Maps'}">
                    <span class="truncate">${ev.venue}</span>
                    <span class="material-symbols-outlined text-[13px] opacity-70 group-hover/map:opacity-100 shrink-0">open_in_new</span>
                  </a>
                ` : `
                  <span class="font-label-md font-semibold truncate">${ev.venue || I18N[State.lang].onlineVenue}</span>
                `}
              </div>
            </div>
          </div>

          <!-- Call to Action Controls -->
          <div class="flex items-center gap-2 pt-1">
            <button class="btn-open-rsvp flex-1 h-12 bg-secondary-container hover:bg-secondary-fixed text-on-secondary-container rounded-full font-label-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-[0_6px_16px_rgba(252,183,38,0.35)] transition-all active:scale-[0.98] cursor-pointer" data-id="${ev.event_id}">
              <span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1;">check_circle</span>
              <span>${userRsvp ? I18N[State.lang].updateRsvpBtn : I18N[State.lang].respondRsvpBtn}</span>
            </button>
            ${ev.meeting_link ? `
              <a href="${ev.meeting_link}" target="_blank" class="h-12 px-4 rounded-full bg-surface-container-high hover:bg-surface-variant text-primary font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
                <span class="material-symbols-outlined text-[18px]">videocam</span>
                <span>Meet</span>
              </a>
            ` : ''}
            ${(State.currentUser && State.currentUser.role === 'Admin') ? `
              <button type="button" class="btn-edit-event w-12 h-12 rounded-full bg-surface-container-low text-primary hover:bg-primary hover:text-white flex items-center justify-center transition-all cursor-pointer" data-id="${ev.event_id}" title="Sunting Acara">
                <span class="material-symbols-outlined text-[18px]">edit</span>
              </button>
              <button type="button" class="btn-delete-event w-12 h-12 rounded-full bg-surface-container-low text-error hover:bg-error hover:text-white flex items-center justify-center transition-all cursor-pointer" data-id="${ev.event_id}" title="Padam Acara">
                <span class="material-symbols-outlined text-[18px]">delete</span>
              </button>
            ` : ''}
          </div>
        </article>
      `;
    }).join('');

    container.querySelectorAll('.btn-open-rsvp').forEach(btn => {
      btn.addEventListener('click', () => {
        openRsvpModal(btn.dataset.id);
      });
    });

    container.querySelectorAll('.btn-edit-event').forEach(btn => {
      btn.addEventListener('click', () => {
        window.editEvent(btn.dataset.id);
      });
    });

    container.querySelectorAll('.btn-delete-event').forEach(btn => {
      btn.addEventListener('click', async () => {
        const eventId = btn.dataset.id;
        const conf = confirm(State.lang === 'en' ? 'Are you sure you want to delete this event? This action cannot be undone.' : 'Adakah Awda pasti ingin memadamkan acara ini? Tindakan ini tidak boleh diundur.');
        if (!conf) return;

        showToast(State.lang === 'en' ? 'Deleting event...' : 'Memadamkan acara...', 'info');
        const res = await api('deleteEvent', { eventId });
        if (res && res.success) {
          showToast(res.message, 'success');
          await loadAppBoot();
          renderHomeView();
          renderAdminDashboardView();
        } else {
          showToast((res && res.message) || 'Gagal memadamkan acara.', 'error');
        }
      });
    });
  }

  // ==========================================================================
  // 9. MODAL RSVP PINTAR
  // ==========================================================================
  function openRsvpModal(eventId) {
    const ev = State.events.find(e => e.event_id === eventId) || State.events[0];
    State.selectedEventForRsvp = ev;
    if (!ev) return;

    const modal = document.getElementById('modal-rsvp-sheet');
    const titleEl = document.getElementById('rsvp-event-title');
    const metaEl = document.getElementById('rsvp-event-meta');
    if (titleEl) titleEl.textContent = (State.lang === 'en' && ev.title_en) ? ev.title_en : ev.title_bm;
    if (metaEl) metaEl.textContent = `${formatEventDateClean(ev.event_date)} • ${formatTime12H(ev.start_time)} • ${ev.venue}`;

    const userRsvp = State.rsvps.find(r => r.event_id === eventId);
    const radioAttend = document.getElementById('radio-attend');
    const radioRep = document.getElementById('radio-rep');
    const radioAbsent = document.getElementById('radio-absent');
    const repFields = document.getElementById('rsvp-rep-fields');
    const absentFields = document.getElementById('rsvp-absent-fields');

    if (userRsvp) {
      if (userRsvp.response_status === 'Mewakilkan') {
        if (radioRep) radioRep.checked = true;
        if (repFields) repFields.classList.remove('hidden');
        if (absentFields) absentFields.classList.add('hidden');
        document.getElementById('input-rep-name').value = userRsvp.rep_name || '';
        document.getElementById('input-rep-phone').value = userRsvp.rep_phone || '';
      } else if (userRsvp.response_status === 'Tidak Hadir') {
        if (radioAbsent) radioAbsent.checked = true;
        if (absentFields) absentFields.classList.remove('hidden');
        if (repFields) repFields.classList.add('hidden');
        document.getElementById('input-absence-reason').value = userRsvp.absence_reason || '';
      } else {
        if (radioAttend) radioAttend.checked = true;
        if (repFields) repFields.classList.add('hidden');
        if (absentFields) absentFields.classList.add('hidden');
      }
    } else {
      if (radioAttend) radioAttend.checked = true;
      if (repFields) repFields.classList.add('hidden');
      if (absentFields) absentFields.classList.add('hidden');
    }

    if (modal) {
      modal.classList.remove('hidden');
      setTimeout(() => {
        modal.querySelector('.bottom-sheet-panel').classList.remove('translate-y-full');
      }, 10);
    }
  }

  function closeRsvpModal() {
    const modal = document.getElementById('modal-rsvp-sheet');
    if (!modal) return;
    const panel = modal.querySelector('.bottom-sheet-panel');
    if (panel) panel.classList.add('translate-y-full');
    setTimeout(() => {
      modal.classList.add('hidden');
    }, 300);
  }

  async function handleRsvpSubmit() {
    const ev = State.selectedEventForRsvp;
    if (!ev) return;

    let status = 'Hadir';
    if (document.getElementById('radio-rep').checked) status = 'Mewakilkan';
    if (document.getElementById('radio-absent').checked) status = 'Tidak Hadir';

    const repName = document.getElementById('input-rep-name').value.trim();
    const repPhone = document.getElementById('input-rep-phone').value.trim();
    const absenceReason = document.getElementById('input-absence-reason').value.trim();

    if (status === 'Mewakilkan' && !repName) {
      showToast(State.lang === 'en' ? 'Please enter representative full name.' : 'Sila masukkan nama penuh pegawai pengganti.', 'warning');
      return;
    }
    if (status === 'Tidak Hadir' && !absenceReason) {
      showToast(State.lang === 'en' ? 'Please state official reason for absence.' : 'Sila nyatakan sebab rasmi ketidakhadiran.', 'warning');
      return;
    }

    const payload = {
      eventId: ev.event_id,
      status: status,
      repName: repName,
      repPhone: repPhone,
      absenceReason: absenceReason
    };

    showToast(State.lang === 'en' ? 'Submitting RSVP response...' : 'Menghantar status RSVP...', 'info');
    const res = await api('submitRsvp', payload);
    if (res && res.success) {
      showToast(State.lang === 'en' ? 'RSVP submitted successfully: ' + status : 'RSVP berjaya dihantar: ' + status, 'success');
      const userEmail = (State.currentUser && State.currentUser.email) ? State.currentUser.email : '';
      const existingIdx = State.rsvps.findIndex(r => r.event_id === ev.event_id && (r.user_email || '').toLowerCase() === userEmail.toLowerCase());
      const newEntry = {
        event_id: ev.event_id,
        user_email: userEmail,
        response_status: status,
        rep_name: repName,
        rep_phone: repPhone,
        absence_reason: absenceReason,
        submitted_at: new Date().toISOString()
      };
      if (existingIdx >= 0) State.rsvps[existingIdx] = newEntry;
      else State.rsvps.push(newEntry);

      closeRsvpModal();
      renderHomeView();
    } else {
      showToast((res && res.message) || 'Gagal menghantar RSVP.', 'error');
    }
  }

  // ==========================================================================
  // 10. RENDER ARKIB DOKUMEN & PEMAPAR PDF
  // ==========================================================================
  async function renderArchiveView() {
    const container = document.getElementById('archive-doc-list');
    if (!container) return;

    let docs = State.memos;
    if (!docs || !docs.length) {
      try { docs = JSON.parse(localStorage.getItem('ceu_memos') || '[]'); } catch(e) {}
      if (docs && docs.length) State.memos = docs;
    }

    if (!docs || !docs.length) {
      const res = await api('getMemos', {});
      if (res && res.success && res.data) {
        State.memos = res.data;
        docs = res.data;
        try { localStorage.setItem('ceu_memos', JSON.stringify(docs)); } catch(e) {}
      }
    }

    const query = (document.getElementById('archive-search-input')?.value || '').toLowerCase().trim();
    let filtered = docs || [];

    if (State.activeMemoCategory && State.activeMemoCategory !== 'Semua') {
      const sel = State.activeMemoCategory.toLowerCase();
      filtered = filtered.filter(d => {
        const docCat = (d.category || '').toLowerCase();
        if (sel.includes('kalendar') || sel.includes('takwim')) {
          return docCat.includes('kalendar') || docCat.includes('takwim');
        }
        if (sel.includes('minit')) {
          return docCat.includes('minit');
        }
        if (sel.includes('memo')) {
          return docCat.includes('memo');
        }
        if (sel.includes('pekeliling') || sel.includes('persuratan') || sel.includes('surat')) {
          return docCat.includes('pekeliling') || docCat.includes('persuratan') || docCat.includes('surat');
        }
        return docCat === sel;
      });
    }

    if (query) {
      filtered = filtered.filter(d =>
        (d.title_bm || '').toLowerCase().includes(query) ||
        (d.title_en || '').toLowerCase().includes(query) ||
        (d.ref_no || '').toLowerCase().includes(query) ||
        (d.category || '').toLowerCase().includes(query)
      );
    }

    if (!filtered.length) {
      container.innerHTML = `
        <div class="bg-surface-container-low rounded-2xl p-8 text-center text-on-surface-variant my-4">
          <span class="material-symbols-outlined text-[48px] text-primary/40 mb-2">find_in_page</span>
          <p class="font-headline text-xs font-semibold">${I18N[State.lang].noDocsFound}</p>
        </div>
      `;
      return;
    }

    const statTotalEl = document.getElementById('stat-total-docs');
    if (statTotalEl) statTotalEl.textContent = (State.memos || []).length;

    container.innerHTML = filtered.map(d => {
      const title = (State.lang === 'en' && d.title_en) ? d.title_en : d.title_bm;
      const catLower = (d.category || '').toLowerCase();

      // Dynamic Vibrant Category Tokens (Gaya 16061)
      let iconName = 'description';
      let iconGradient = 'from-teal-600 to-cyan-500 text-white shadow-teal-600/25';
      let badgeStyle = 'bg-teal-50 text-teal-800 border-teal-200/70';

      if (catLower.includes('memo')) {
        iconName = 'campaign';
        iconGradient = 'from-amber-500 to-orange-400 text-white shadow-amber-500/25';
        badgeStyle = 'bg-amber-50 text-amber-800 border-amber-200/70';
      } else if (catLower.includes('pekeliling') || catLower.includes('surat') || catLower.includes('persuratan')) {
        iconName = 'policy';
        iconGradient = 'from-indigo-600 to-blue-500 text-white shadow-indigo-600/25';
        badgeStyle = 'bg-blue-50 text-blue-800 border-blue-200/70';
      } else if (catLower.includes('takwim') || catLower.includes('kalendar')) {
        iconName = 'calendar_month';
        iconGradient = 'from-emerald-600 to-teal-500 text-white shadow-emerald-600/25';
        badgeStyle = 'bg-emerald-50 text-emerald-800 border-emerald-200/70';
      } else if (catLower.includes('minit')) {
        iconName = 'groups';
        iconGradient = 'from-[#006a6a] to-[#2ca0a0] text-white shadow-teal-700/25';
        badgeStyle = 'bg-teal-50 text-teal-800 border-teal-200/70';
      }

      return `
        <div class="bg-surface-container-lowest rounded-2xl p-4 shadow-md border border-outline-variant/30 flex flex-col gap-3 hover:shadow-lg transition-all group">
          <!-- Top Row: Icon node + Status badges -->
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-start gap-3 min-w-0">
              <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr ${iconGradient} flex items-center justify-center shrink-0 shadow-md">
                <span class="material-symbols-outlined text-[22px]">${iconName}</span>
              </div>
              <div class="flex flex-col min-w-0">
                <div class="flex flex-wrap items-center gap-1.5">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full font-label-pill text-[10px] font-black uppercase tracking-wider border ${badgeStyle}">
                    ${d.category}
                  </span>
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-low text-on-surface-variant font-label-pill text-[10px] font-semibold">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Semua Sekolah
                  </span>
                </div>
                <span class="font-caption text-[11px] text-on-surface-variant mt-1 truncate">
                  Ruj: ${d.ref_no || 'UPK/2026'} • ${d.size || '1.8 MB'}
                </span>
              </div>
            </div>
            <span class="font-caption text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant shrink-0">${d.publish_date}</span>
          </div>

          <!-- Title -->
          <div class="flex flex-col">
            <h4 class="font-label-lg text-sm font-bold text-on-surface leading-snug group-hover:text-primary transition-colors">${title}</h4>
          </div>

          <!-- Action Footer -->
          <div class="flex items-center gap-2 pt-1 border-t border-outline-variant/20">
            <button class="btn-preview-pdf flex-1 h-10 rounded-xl bg-surface-container-low hover:bg-surface-container text-primary font-label-md text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer" data-url="${d.file_view_url}" data-title="${title.replace(/"/g, '&quot;')}">
              <span class="material-symbols-outlined text-[18px]">visibility</span>
              <span>${I18N[State.lang].previewDocBtn}</span>
            </button>
            <a href="${d.file_view_url}" target="_blank" download class="flex-1 h-10 rounded-xl bg-gradient-to-r from-primary to-[#2ca0a0] hover:from-primary-dark hover:to-primary text-white font-label-md text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm hover:shadow active:scale-95 transition-all cursor-pointer">
              <span class="material-symbols-outlined text-[18px]">download</span>
              <span>${I18N[State.lang].downloadBtn}</span>
            </a>
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.btn-preview-pdf').forEach(btn => {
      btn.addEventListener('click', () => {
        openPdfViewerModal(btn.dataset.url, btn.dataset.title);
      });
    });
  }

  function openPdfViewerModal(url, title) {
    const modal = document.getElementById('modal-pdf-viewer');
    const iframe = document.getElementById('pdf-viewer-frame');
    const titleEl = document.getElementById('pdf-viewer-title');
    if (titleEl && title) titleEl.textContent = title;
    if (modal && iframe) {
      let finalUrl = url || '';
      if (finalUrl.includes('drive.google.com/file/d/')) {
        finalUrl = finalUrl.replace(/\/view(\?usp=sharing)?/, '/preview');
      }
      iframe.src = finalUrl || 'https://drive.google.com/viewerng/viewer?embedded=true&url=https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
      modal.classList.remove('hidden');
    }
  }
  window.openPdfViewerModal = openPdfViewerModal;

  // ==========================================================================
  // PENGURUSAN MUAT NAIK PDF LANGSUNG (MINIT, MEMO & PERSURATAN)
  // ==========================================================================
  window.openUploadPdfModal = function() {
    const modal = document.getElementById('modal-upload-pdf');
    if (!modal) return;
    const form = document.getElementById('form-upload-pdf');
    if (form) form.reset();
    const filenameEl = document.getElementById('upload-pdf-filename');
    const filesizeEl = document.getElementById('upload-pdf-filesize');
    if (filenameEl) filenameEl.textContent = 'Klik untuk memilih fail PDF dari peranti';
    if (filesizeEl) filesizeEl.textContent = 'Format disokong: .pdf (Maksimum 10 MB)';
    modal.classList.remove('hidden');
  };

  window.closeUploadPdfModal = function() {
    const modal = document.getElementById('modal-upload-pdf');
    if (modal) modal.classList.add('hidden');
  };

  function initUploadPdfDropzone() {
    const fileInput = document.getElementById('upload-pdf-file');
    if (!fileInput) return;
    fileInput.addEventListener('change', e => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        const filenameEl = document.getElementById('upload-pdf-filename');
        const filesizeEl = document.getElementById('upload-pdf-filesize');
        const titleInput = document.getElementById('upload-doc-title');
        const sizeMb = (file.size / (1024 * 1024)).toFixed(2);

        if (filenameEl) filenameEl.textContent = file.name;
        if (filesizeEl) filesizeEl.innerHTML = `<span class="text-primary font-bold">${sizeMb} MB</span> • Sedia Dimuat Naik`;

        if (titleInput && !titleInput.value.trim()) {
          titleInput.value = file.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');
        }
      }
    });
  }

  window.handleDirectPdfUpload = async function() {
    const titleInput = document.getElementById('upload-doc-title');
    const categorySelect = document.getElementById('upload-doc-category');
    const refInput = document.getElementById('upload-doc-ref');
    const fileInput = document.getElementById('upload-pdf-file');
    const btnSubmit = document.getElementById('btn-submit-upload-pdf');

    const title = titleInput ? titleInput.value.trim() : '';
    const category = categorySelect ? categorySelect.value : 'Persuratan & Pekeliling';
    const ref = refInput ? refInput.value.trim() : '';
    const file = fileInput && fileInput.files ? fileInput.files[0] : null;

    if (!title) {
      showToast(State.lang === 'en' ? 'Please enter the document title.' : 'Sila masukkan tajuk dokumen.', 'warning');
      titleInput?.focus();
      return;
    }

    if (!file) {
      showToast(State.lang === 'en' ? 'Please select a PDF file.' : 'Sila pilih fail PDF untuk dimuat naik.', 'warning');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      showToast('Saiz fail melebihi had maksimum 15 MB.', 'error');
      return;
    }

    const prevHtml = btnSubmit ? btnSubmit.innerHTML : '';
    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = `<span class="material-symbols-outlined text-[16px] animate-spin">progress_activity</span><span>Memuat naik...</span>`;
    }

    try {
      const fileDataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = err => reject(err);
        reader.readAsDataURL(file);
      });

      const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + ' MB';

      const res = await api('uploadMemoDoc', {
        title_bm: title,
        title_en: title,
        category: category,
        ref_no: ref || ('UPK/JSS/' + new Date().getFullYear() + '/' + Math.floor(100 + Math.random()*900)),
        fileName: file.name,
        size: sizeStr,
        fileBase64: fileDataUrl,
        fileDataUrl: fileDataUrl
      });

      if (res && res.success) {
        const createdDoc = res.data || {
          doc_id: 'MEMO-' + Date.now(),
          title_bm: title,
          title_en: title,
          category: category,
          ref_no: ref || ('UPK/JSS/' + new Date().getFullYear() + '/01'),
          size: sizeStr,
          publish_date: new Date().toISOString().split('T')[0],
          file_view_url: fileDataUrl
        };

        if (!State.memos) State.memos = [];
        State.memos.unshift(createdDoc);
        try { localStorage.setItem('ceu_memos', JSON.stringify(State.memos)); } catch(e) {}

        window.closeUploadPdfModal();
        showToast(State.lang === 'en' ? 'PDF successfully uploaded!' : 'Dokumen PDF berjaya dimuat naik ke Minit, Memorandum dan Persuratan!', 'success');
        renderArchiveView();
      } else {
        showToast((res && res.message) || 'Gagal memuat naik dokumen.', 'error');
      }
    } catch (err) {
      console.error('Error direct upload PDF:', err);
      showToast('Ralat memuat naik dokumen PDF: ' + err.message, 'error');
    } finally {
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = prevHtml;
      }
    }
  };

  // ==========================================================================
  // 11. RENDER NOTIFIKASI
  // ==========================================================================
  function renderNotifView() {
    // Tandakan semua notifikasi telah dibaca serta-merta apabila pengguna melawat paparan ini
    let readIds = [];
    try { readIds = JSON.parse(localStorage.getItem('ceu_read_notifs') || '[]'); } catch(e) {}
    (State.notifications || []).forEach(n => {
      if (!readIds.includes(n.notif_id)) readIds.push(n.notif_id);
      n.is_read = true;
    });
    localStorage.setItem('ceu_read_notifs', JSON.stringify(readIds));
    updateNotifBadge();

    const container = document.getElementById('notif-list-container');
    if (!container) return;

    if (!State.notifications.length) {
      container.innerHTML = `
        <div class="bg-surface-container-low rounded-2xl p-8 text-center text-on-surface-variant my-4">
          <span class="material-symbols-outlined text-[48px] text-primary/40 mb-2">notifications_off</span>
          <p class="font-headline text-xs font-semibold">${I18N[State.lang].noNotifsFound}</p>
        </div>
      `;
      return;
    }

    container.innerHTML = State.notifications.map(n => {
      const isUrgent = n.type === 'Urgent';
      const title = (State.lang === 'en' && n.title_en) ? n.title_en : n.title_bm;
      const content = (State.lang === 'en' && n.content_en) ? n.content_en : n.content_bm;
      return `
        <div class="bg-surface-container-lowest rounded-2xl p-4 shadow-sm border ${isUrgent ? 'border-primary/40 bg-[#F0F9FF]' : 'border-outline-variant/40'} flex items-start gap-3">
          <div class="w-10 h-10 rounded-full ${isUrgent ? 'bg-tertiary text-white' : 'bg-surface-container-high text-primary'} flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-[20px]">${isUrgent ? 'campaign' : 'mark_chat_unread'}</span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-1">
              <span class="font-headline text-[10px] font-bold text-primary truncate">${n.sent_at}</span>
              ${!n.is_read ? `<span class="w-2 h-2 rounded-full bg-error shrink-0"></span>` : ''}
            </div>
            <h4 class="font-headline text-xs font-bold text-on-surface mt-0.5">${title}</h4>
            <p class="font-body text-xs text-on-surface-variant mt-1 leading-relaxed">${content}</p>
          </div>
        </div>
      `;
    }).join('');
  }

  // ==========================================================================
  // 12. RENDER PROFIL & TETAPAN PENGGUNA
  // ==========================================================================
  function renderProfileView() {
    const u = State.currentUser;
    if (!u) return;

    const nameEl = document.getElementById('profile-name');
    const roleEl = document.getElementById('profile-role');
    const emailEl = document.getElementById('profile-email');
    const schoolEl = document.getElementById('profile-school');
    const bioToggle = document.getElementById('toggle-bio-setting');

    if (nameEl) nameEl.textContent = u.name;
    if (roleEl) {
      if (u.role === 'Admin') {
        roleEl.textContent = State.lang === 'en' ? 'UPK Officer' : 'Pegawai UPK';
      } else {
        roleEl.textContent = State.lang === 'en' ? 'Career Education Teacher' : 'Guru Pendidikan Kerjaya';
      }
    }
    if (emailEl) emailEl.textContent = u.email;
    if (schoolEl) schoolEl.textContent = `${u.school} (${u.district})`;
    if (bioToggle) bioToggle.checked = !!u.biometricEnabled;
  }

  // ==========================================================================
  // 13. RENDER ADMIN DASHBOARD (KPI, DONUT & DISTRICT BARS)
  // ==========================================================================
  let _adminSelectedEventId = null;

  async function renderAdminDashboardView() {
    const publishedEvents = (State.events || [])
      .filter(e => (e.status || 'Published').toLowerCase() !== 'draft')
      .filter(e => isUserInvitedToEvent(e, State.currentUser));
    if (!_adminSelectedEventId && publishedEvents.length > 0) {
      _adminSelectedEventId = publishedEvents[0].event_id;
    }

    const res = await api('getAdminDashboard', { eventId: _adminSelectedEventId });
    if (!res || !res.success || !res.data) return;
    State.adminData = res.data;
    const data = res.data;

    const eventSelect = document.getElementById('admin-dashboard-event-select');
    if (eventSelect && publishedEvents.length) {
      eventSelect.innerHTML = publishedEvents.map(e => {
        const title = getEventDisplayName(e);
        const dClean = formatEventDateClean(e.event_date);
        const label = dClean ? `${title} (${dClean})` : title;
        return `
        <option value="${e.event_id}" ${e.event_id === _adminSelectedEventId ? 'selected' : ''}>
          ${escapeHtml(label)}
        </option>
      `;
      }).join('');

      eventSelect.onchange = async () => {
        _adminSelectedEventId = eventSelect.value;
        const syncSelectRsvp = document.getElementById('admin-rsvp-event-select');
        if (syncSelectRsvp) syncSelectRsvp.value = _adminSelectedEventId;
        await renderAdminDashboardView();
      };
    }

    const kpi = data.kpi || {};
    const countTotalEl = document.getElementById('kpi-total-teachers');
    const countRateEl = document.getElementById('kpi-rsvp-rate');
    const countAttendEl = document.getElementById('kpi-attending');
    const countRepAbsentEl = document.getElementById('kpi-rep-absent');

    if (countTotalEl) countTotalEl.textContent = kpi.totalTeachers || 0;
    if (countRateEl) countRateEl.textContent = (kpi.rsvpRate || 0) + '%';
    if (countAttendEl) countAttendEl.textContent = kpi.attending || 0;
    if (countRepAbsentEl) countRepAbsentEl.textContent = `${kpi.representative || 0} / ${kpi.absent || 0}`;

    // Kemas kini legenda teks donut chart secara dinamik
    const legendHadir = document.getElementById('donut-legend-hadir');
    const legendWakil = document.getElementById('donut-legend-wakil');
    const legendTidak = document.getElementById('donut-legend-tidak-hadir');
    const legendBelum = document.getElementById('donut-legend-belum-jawab');

    if (legendHadir) legendHadir.textContent = `${State.lang === 'en' ? 'Attending' : 'Hadir'} (${kpi.attending || 0})`;
    if (legendWakil) legendWakil.textContent = `${State.lang === 'en' ? 'Representative' : 'Wakil'} (${kpi.representative || 0})`;
    if (legendTidak) legendTidak.textContent = `${State.lang === 'en' ? 'Absent' : 'Tak Hadir'} (${kpi.absent || 0})`;
    if (legendBelum) legendBelum.textContent = `${State.lang === 'en' ? 'Pending' : 'Belum Jawab'} (${kpi.pending || 0})`;

    renderDonutChart(data.donutData || [], kpi.rsvpRate || 0);
    renderDistrictBarChart(data.districtBreakdown || {});
    renderAdminEventsManagementList();
  }

  function renderDonutChart(donutData, liveRate) {
    const svg = document.getElementById('admin-donut-svg');
    if (!svg) return;

    const total = donutData.reduce((acc, d) => acc + d.count, 0) || 1;
    let accumulatedAngle = 0;
    const radius = 54;
    const cx = 70, cy = 70;

    const paths = donutData.map(d => {
      const sliceAngle = (d.count / total) * 360;
      const startAngle = accumulatedAngle;
      const endAngle = accumulatedAngle + sliceAngle;
      accumulatedAngle += sliceAngle;

      if (d.count === 0) return '';
      const x1 = cx + radius * Math.cos((Math.PI * (startAngle - 90)) / 180);
      const y1 = cy + radius * Math.sin((Math.PI * (startAngle - 90)) / 180);
      const x2 = cx + radius * Math.cos((Math.PI * (endAngle - 90)) / 180);
      const y2 = cy + radius * Math.sin((Math.PI * (endAngle - 90)) / 180);
      const largeArc = sliceAngle > 180 ? 1 : 0;

      return `
        <path d="M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z" fill="${d.color}" />
      `;
    }).join('');

    const displayRate = liveRate !== undefined ? liveRate : (State.adminData?.kpi?.rsvpRate || 0);

    svg.innerHTML = `
      ${paths}
      <circle cx="${cx}" cy="${cy}" r="36" fill="#ffffff" />
      <text x="${cx}" y="${cy - 2}" text-anchor="middle" font-size="14" font-weight="700" fill="#0F172A">
        ${displayRate}%
      </text>
      <text x="${cx}" y="${cy + 12}" text-anchor="middle" font-size="9" font-weight="500" fill="#64748B">
        ${State.lang === 'en' ? 'Responded' : 'Dijawab'}
      </text>
    `;
  }

  function renderDistrictBarChart(districts) {
    const container = document.getElementById('admin-district-bars');
    if (!container) return;

    const list = Object.keys(districts).map(dName => {
      const d = districts[dName];
      const total = d.total || 1;
      const hadirPct = Math.round((d.hadir / total) * 100);
      const wakilPct = Math.round((d.wakil / total) * 100);
      const tidakPct = Math.round((d.tidakHadir / total) * 100);

      const schoolLabel = State.lang === 'en' ? 'Schools' : 'Sekolah';
      const attendLabel = State.lang === 'en' ? 'Attending' : 'Hadir';

      return `
        <div class="flex flex-col gap-1">
          <div class="flex items-center justify-between text-[11px] font-headline font-bold">
            <span class="text-on-surface">${dName} (${d.total} ${schoolLabel})</span>
            <span class="text-primary">${d.hadir} ${attendLabel} • ${hadirPct}%</span>
          </div>
          <div class="w-full h-3 bg-surface-container rounded-full overflow-hidden flex">
            <div style="width: ${hadirPct}%" class="bg-[#2ca0a0] h-full" title="Hadir: ${d.hadir}"></div>
            <div style="width: ${wakilPct}%" class="bg-[#fcb726] h-full" title="Wakil: ${d.wakil}"></div>
            <div style="width: ${tidakPct}%" class="bg-[#ba1a1a] h-full" title="Tidak Hadir: ${d.tidakHadir}"></div>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = list;
  }

  // ==========================================================================
  // 13B. PENGURUSAN ACARA & DRAF UPK (SENARAI, TERBITKAN DRAF & PADAM)
  // ==========================================================================
  let _adminEventFilter = 'all'; // 'all' | 'published' | 'draft'

  function renderAdminEventsManagementList() {
    const container = document.getElementById('admin-events-management-list');
    const badgeTotal = document.getElementById('admin-events-total-badge');
    if (!container) return;

    const allEvents = State.events || [];
    if (badgeTotal) badgeTotal.textContent = `${allEvents.length} Acara`;

    let filtered = allEvents;
    if (_adminEventFilter === 'published') {
      filtered = allEvents.filter(e => (e.status || 'Published').toLowerCase() !== 'draft');
    } else if (_adminEventFilter === 'draft') {
      filtered = allEvents.filter(e => (e.status || '').toLowerCase() === 'draft');
    }

    if (!filtered.length) {
      container.innerHTML = `
        <div class="p-6 text-center text-xs text-on-surface-variant bg-surface-container-low rounded-xl border border-outline-variant/30 flex flex-col items-center">
          <span class="material-symbols-outlined text-[32px] text-primary/60 mb-2">event_busy</span>
          <p class="font-bold">Tiada acara dijumpai untuk penapis ini.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(ev => {
      const isDraft = (ev.status || '').toLowerCase() === 'draft';
      const statusBadge = isDraft
        ? `<span class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold uppercase tracking-wider">Draf</span>`
        : `<span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold uppercase tracking-wider">Diterbitkan</span>`;

      return `
        <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-container transition-all">
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 mb-1">
              ${statusBadge}
              <span class="text-[11px] text-on-surface-variant font-medium flex items-center gap-1">
                <span class="material-symbols-outlined text-xs text-primary">calendar_month</span>
                ${formatEventDateClean(ev.event_date)}
              </span>
              <span class="text-[11px] text-on-surface-variant font-medium flex items-center gap-1">
                <span class="material-symbols-outlined text-xs text-secondary">schedule</span>
                ${formatTime12H(ev.start_time) || '08:30 PAGI'}
              </span>
            </div>
            <h4 class="font-headline text-xs sm:text-sm font-bold text-on-surface truncate">${escapeHtml(getEventDisplayName(ev))}</h4>
            <p class="text-[11px] text-on-surface-variant truncate mt-0.5">
              <span class="material-symbols-outlined text-[13px] align-middle">location_on</span> ${ev.venue || 'Dalam Talian'} • Sasaran: ${ev.target_count || 37} pegawai
            </p>
          </div>

          <!-- Tindakan Draf & Padam -->
          <div class="flex items-center gap-2 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-outline-variant/20">
            ${isDraft ? `
              <button type="button" class="btn-publish-draft px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-dark text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-all cursor-pointer" data-id="${ev.event_id}">
                <span class="material-symbols-outlined text-sm">send</span>
                <span>Terbitkan</span>
              </button>
            ` : ''}
            <button type="button" class="btn-edit-event px-3 py-1.5 rounded-lg border border-primary/40 text-primary hover:bg-primary hover:text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer" data-id="${ev.event_id}" title="Sunting Acara / Draf">
              <span class="material-symbols-outlined text-sm">edit</span>
              <span>Sunting</span>
            </button>
            <button type="button" class="btn-delete-event px-3 py-1.5 rounded-lg border border-error/40 text-error hover:bg-error hover:text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer" data-id="${ev.event_id}" title="Padam Acara">
              <span class="material-symbols-outlined text-sm">delete</span>
              <span>Padam</span>
            </button>
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.btn-publish-draft').forEach(btn => {
      btn.addEventListener('click', async () => {
        const eventId = btn.dataset.id;
        btn.disabled = true;
        btn.innerHTML = `<span class="material-symbols-outlined text-sm animate-spin">progress_activity</span><span>Menerbitkan...</span>`;
        const res = await api('publishDraft', { eventId });
        if (res && res.success) {
          showToast(res.message, 'success');
          await loadAppBoot();
          renderAdminDashboardView();
        } else {
          showToast((res && res.message) || 'Gagal menerbitkan draf.', 'error');
          btn.disabled = false;
        }
      });
    });

    container.querySelectorAll('.btn-edit-event').forEach(btn => {
      btn.addEventListener('click', () => {
        window.editEvent(btn.dataset.id);
      });
    });

    container.querySelectorAll('.btn-delete-event').forEach(btn => {
      btn.addEventListener('click', async () => {
        const eventId = btn.dataset.id;
        const conf = confirm(State.lang === 'en' ? 'Are you sure you want to delete this event? This action cannot be undone.' : 'Adakah Awda pasti ingin memadamkan acara ini? Tindakan ini tidak boleh diundur.');
        if (!conf) return;

        showToast(State.lang === 'en' ? 'Deleting event...' : 'Memadamkan acara...', 'info');
        const res = await api('deleteEvent', { eventId });
        if (res && res.success) {
          showToast(res.message, 'success');
          await loadAppBoot();
          renderAdminDashboardView();
          renderHomeView();
        } else {
          showToast((res && res.message) || 'Gagal memadamkan acara.', 'error');
        }
      });
    });
  }

  // ==========================================================================
  // 14. JADUAL RSVP UPK & PENJANAAN PDF
  // ==========================================================================
  let _adminRsvpStatusFilter = 'all'; // 'all' | 'hadir' | 'wakil' | 'tidakhadir' | 'belum'
  let _adminRsvpSearchQuery = '';

  async function renderAdminRsvpTableView() {
    const tableBody = document.getElementById('admin-rsvp-table-body');
    if (!tableBody) return;

    const publishedEvents = (State.events || [])
      .filter(e => (e.status || 'Published').toLowerCase() !== 'draft')
      .filter(e => isUserInvitedToEvent(e, State.currentUser));
    if (!_adminSelectedEventId && publishedEvents.length > 0) {
      _adminSelectedEventId = publishedEvents[0].event_id;
    }

    const eventSelect = document.getElementById('admin-rsvp-event-select');
    if (eventSelect && publishedEvents.length) {
      eventSelect.innerHTML = publishedEvents.map(e => {
        const title = getEventDisplayName(e);
        const dClean = formatEventDateClean(e.event_date);
        const label = dClean ? `${title} (${dClean})` : title;
        return `
        <option value="${e.event_id}" ${e.event_id === _adminSelectedEventId ? 'selected' : ''}>
          ${escapeHtml(label)}
        </option>
      `;
      }).join('');

      eventSelect.onchange = async () => {
        _adminSelectedEventId = eventSelect.value;
        const syncSelectDash = document.getElementById('admin-dashboard-event-select');
        if (syncSelectDash) syncSelectDash.value = _adminSelectedEventId;
        await renderAdminRsvpTableView();
      };
    }

    // Sambung butang penapis status RSVP
    document.querySelectorAll('.admin-rsvp-status-btn').forEach(btn => {
      btn.onclick = () => {
        _adminRsvpStatusFilter = btn.dataset.status;
        renderAdminRsvpTableView();
      };
    });

    // Sambung carian teks
    const searchInput = document.getElementById('admin-rsvp-search-input');
    if (searchInput) {
      searchInput.oninput = (e) => {
        _adminRsvpSearchQuery = e.target.value.trim();
        renderAdminRsvpTableView();
      };
    }

    tableBody.innerHTML = `<tr><td colspan="7" class="p-6 text-center text-on-surface-variant font-headline text-xs">${State.lang === 'en' ? 'Loading attendance data across 4 districts...' : 'Memuatkan data kehadiran seluruh daerah...'}</td></tr>`;

    const res = await api('getAdminRsvpTable', { eventId: _adminSelectedEventId });
    if (!res || !res.success || !res.data) {
      tableBody.innerHTML = `<tr><td colspan="7" class="p-6 text-center text-error font-headline text-xs">${State.lang === 'en' ? 'Failed to load attendance records.' : 'Gagal memuatkan data.'}</td></tr>`;
      return;
    }

    const allRows = res.data;

    // Kira nombor bagi pil penapis status
    const countAll = allRows.length;
    const countHadir = allRows.filter(r => (r.status || '').toLowerCase().includes('hadir') && !(r.status || '').toLowerCase().includes('tidak')).length;
    const countWakil = allRows.filter(r => (r.status || '').toLowerCase().includes('wakil')).length;
    const countTidak = allRows.filter(r => (r.status || '').toLowerCase().includes('tidak')).length;
    const countBelum = allRows.filter(r => (r.status || '').toLowerCase().includes('belum')).length;

    const elAll = document.getElementById('rsvp-filter-count-all');
    const elHadir = document.getElementById('rsvp-filter-count-hadir');
    const elWakil = document.getElementById('rsvp-filter-count-wakil');
    const elTidak = document.getElementById('rsvp-filter-count-tidak');
    const elBelum = document.getElementById('rsvp-filter-count-belum');

    if (elAll) elAll.textContent = countAll;
    if (elHadir) elHadir.textContent = countHadir;
    if (elWakil) elWakil.textContent = countWakil;
    if (elTidak) elTidak.textContent = countTidak;
    if (elBelum) elBelum.textContent = countBelum;

    // Kemas kini gaya aktif pada butang penapis status
    document.querySelectorAll('.admin-rsvp-status-btn').forEach(btn => {
      const isMatch = btn.dataset.status === _adminRsvpStatusFilter;
      btn.classList.toggle('bg-primary', isMatch);
      btn.classList.toggle('text-white', isMatch);
      btn.classList.toggle('bg-surface-container', !isMatch);
      btn.classList.toggle('text-on-surface-variant', !isMatch);
    });

    // Penapisan baris
    let rows = allRows;
    if (_adminRsvpStatusFilter === 'hadir') {
      rows = rows.filter(r => (r.status || '').toLowerCase().includes('hadir') && !(r.status || '').toLowerCase().includes('tidak'));
    } else if (_adminRsvpStatusFilter === 'wakil') {
      rows = rows.filter(r => (r.status || '').toLowerCase().includes('wakil'));
    } else if (_adminRsvpStatusFilter === 'tidakhadir') {
      rows = rows.filter(r => (r.status || '').toLowerCase().includes('tidak'));
    } else if (_adminRsvpStatusFilter === 'belum') {
      rows = rows.filter(r => (r.status || '').toLowerCase().includes('belum'));
    }

    if (_adminRsvpSearchQuery) {
      const q = _adminRsvpSearchQuery.toLowerCase();
      rows = rows.filter(r =>
        (r.name && r.name.toLowerCase().includes(q)) ||
        (r.email && r.email.toLowerCase().includes(q)) ||
        (r.school && r.school.toLowerCase().includes(q)) ||
        (r.district && r.district.toLowerCase().includes(q))
      );
    }

    if (!rows.length) {
      tableBody.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-on-surface-variant font-headline text-xs font-semibold">Tiada rekod pegawai dijumpai untuk kriteria penapisan ini.</td></tr>`;
      return;
    }

    tableBody.innerHTML = rows.map((r, i) => {
      let badge = '';
      const st = (r.status || '').toLowerCase();
      if (st.includes('hadir') && !st.includes('tidak')) {
        badge = `<span class="bg-[#DCFCE7] text-[#15803D] px-2 py-0.5 rounded-full font-headline text-[10px] font-bold">${State.lang === 'en' ? 'ATTENDING' : 'HADIR'}</span>`;
      } else if (st.includes('wakil')) {
        badge = `<span class="bg-[#FEF3C7] text-[#B45309] px-2 py-0.5 rounded-full font-headline text-[10px] font-bold">${State.lang === 'en' ? 'REP: ' : 'WAKIL: '} ${r.repName || '-'}</span>`;
      } else if (st.includes('tidak')) {
        badge = `<span class="bg-[#FEE2E2] text-[#B91C1C] px-2 py-0.5 rounded-full font-headline text-[10px] font-bold">${State.lang === 'en' ? 'ABSENT' : 'TAK HADIR'}</span>`;
      } else {
        badge = `<span class="bg-[#F1F5F9] text-[#475569] px-2 py-0.5 rounded-full font-headline text-[10px] font-bold">${State.lang === 'en' ? 'PENDING' : 'BELUM JAWAB'}</span>`;
      }

      return `
        <tr class="border-b border-outline-variant/30 hover:bg-surface-container-low transition-colors">
          <td class="p-3 text-center font-headline text-xs text-on-surface-variant">${i + 1}</td>
          <td class="p-3 font-headline text-xs font-bold text-on-surface">${r.name}<br><span class="font-body text-[11px] font-normal text-on-surface-variant">${r.email}</span></td>
          <td class="p-3 font-body text-xs text-on-surface">${r.school}</td>
          <td class="p-3 font-headline text-xs text-primary font-bold">${r.district}</td>
          <td class="p-3">${badge}</td>
          <td class="p-3 font-body text-xs text-on-surface-variant">${r.absenceReason || r.repName || '-'}</td>
          <td class="p-3 text-center">
            <button class="px-2.5 py-1 rounded-lg bg-surface-container text-primary font-headline text-xs font-bold hover:bg-primary hover:text-white transition-colors btn-reminder" data-email="${r.email}">
              ${State.lang === 'en' ? 'Remind' : 'Peringatan'}
            </button>
          </td>
        </tr>
      `;
    }).join('');

    tableBody.querySelectorAll('.btn-reminder').forEach(btn => {
      btn.addEventListener('click', () => {
        showToast(State.lang === 'en' ? 'Notification reminder sent to ' + btn.dataset.email : 'Peringatan notifikasi dihantar ke ' + btn.dataset.email, 'success');
      });
    });
  }

  // Penjanaan Dokumen Laporan Rasmi PDF A4 Ber-QR HMAC
  async function openOfficialPdfReportModal() {
    showToast(State.lang === 'en' ? 'Generating official report...' : 'Menjana laporan rasmi...', 'info');
    const res = await api('generateAttendancePdf', { eventId: _adminSelectedEventId });
    if (!res || !res.success || !res.report) {
      showToast(State.lang === 'en' ? 'Failed to generate report.' : 'Gagal menjana laporan.', 'error');
      return;
    }

    const report = res.report;
    const modal = document.getElementById('modal-pdf-report');
    if (!modal) return;

    document.getElementById('pdf-report-id').textContent = report.reportId;
    document.getElementById('pdf-generated-at').textContent = new Date(report.generatedAt).toLocaleString();
    const evTitle = (report.event) ? ((State.lang === 'en' && report.event.title_en) ? report.event.title_en : report.event.title_bm) : 'Career Guidance Program';
    document.getElementById('pdf-event-title').textContent = evTitle;
    document.getElementById('pdf-event-venue').textContent = report.event ? report.event.venue : 'Ministry of Education';

    document.getElementById('pdf-total-invited').textContent = report.summary.totalTeachers;
    document.getElementById('pdf-total-attending').textContent = report.summary.attending;
    document.getElementById('pdf-total-rep').textContent = report.summary.representative;
    document.getElementById('pdf-total-absent').textContent = report.summary.absent;

    document.getElementById('pdf-hmac-sig').textContent = report.hmacSignature;
    const qrImg = document.getElementById('pdf-qr-img');
    if (qrImg) {
      qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(report.verificationUrl)}`;
    }

    modal.classList.remove('hidden');
  }

  function closeOfficialPdfReportModal() {
    const modal = document.getElementById('modal-pdf-report');
    if (modal) modal.classList.add('hidden');
  }

  // ==========================================================================
  // 15. PENGURUSAN SESI & LOG MASUK
  // ==========================================================================
  async function handleSendOtpClick() {
    const emailInput = document.getElementById('email') || document.getElementById('auth-email-input');
    const email = (emailInput?.value || '').trim();

    if (!email) {
      showToast(State.lang === 'en' ? 'Please enter your official email address.' : 'Sila masukkan alamat e-mel rasmi Awda.', 'warning');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast(State.lang === 'en' ? 'Please enter a valid email address.' : 'Sila masukkan alamat e-mel yang sah.', 'warning');
      return;
    }

    const btnText = document.getElementById('otp-btn-text');
    const submitBtn = document.getElementById('otp-submit-btn');
    if (btnText && submitBtn) {
      btnText.textContent = State.lang === 'en' ? 'Sending OTP Code...' : 'Menghantar Kod OTP...';
      submitBtn.classList.add('opacity-80', 'pointer-events-none');
    }

    // Only one single notification
    const res = await api('sendOtp', { email: email });
    if (res && res.success) {
      if (btnText && submitBtn) {
        btnText.textContent = State.lang === 'en' ? 'OTP Code Sent' : 'Kod OTP Berjaya Dihantar';
        setTimeout(() => {
          btnText.textContent = State.lang === 'en' ? 'Send OTP to Official Email' : 'Hantar Kod OTP ke Emel Rasmi';
          submitBtn.classList.remove('opacity-80', 'pointer-events-none');
        }, 2500);
      }
      showToast(res.message || (State.lang === 'en' ? 'OTP code has been sent to your email.' : 'Kod OTP keselamatan telah berjaya dihantar ke e-mel rasmi Awda.'), 'success');
      
      // Kosongkan kotak OTP supaya pengguna memasukkan kod sebenar dari emel
      document.querySelectorAll('.otp-digit-input').forEach(inp => {
        inp.value = '';
      });

      startOtpCountdown();
      setTimeout(() => document.getElementById('otp-box-1')?.focus(), 150);
    } else {
      if (btnText && submitBtn) {
        btnText.textContent = State.lang === 'en' ? 'Send OTP to Official Email' : 'Hantar Kod OTP ke Emel Rasmi';
        submitBtn.classList.remove('opacity-80', 'pointer-events-none');
      }
      showToast((res && res.message) || (State.lang === 'en' ? 'Failed to send OTP code.' : 'Gagal menghantar kod OTP.'), 'error');
    }
  }

  let otpTimerInterval = null;
  function startOtpCountdown() {
    let seconds = 179; // 02:59
    const timerEl = document.getElementById('otp-timer-display');
    if (otpTimerInterval) clearInterval(otpTimerInterval);

    function updateDisplay(sec) {
      if (!timerEl) return;
      const m = String(Math.floor(sec / 60)).padStart(2, '0');
      const s = String(sec % 60).padStart(2, '0');
      const prefix = State.lang === 'en' ? 'Time: ' : 'Masa: ';
      timerEl.textContent = `${prefix}${m}:${s}`;
    }

    updateDisplay(seconds);

    otpTimerInterval = setInterval(() => {
      seconds--;
      if (seconds <= 0) {
        clearInterval(otpTimerInterval);
        if (timerEl) timerEl.textContent = State.lang === 'en' ? '00:00 (Expired)' : '00:00 (Tamat)';
        return;
      }
      updateDisplay(seconds);
    }, 1000);
  }

  async function handleVerifyOtpClick() {
    const emailInput = document.getElementById('email') || document.getElementById('auth-email-input');
    const email = (emailInput?.value || '').trim();
    if (!email) {
      showToast(State.lang === 'en' ? 'Please enter your official email address.' : 'Sila masukkan alamat e-mel rasmi Awda.', 'warning');
      emailInput?.focus();
      return;
    }

    let otp = '';
    document.querySelectorAll('.otp-digit-input').forEach(inp => otp += (inp.value || '').trim());

    if (!otp || otp.length < 6) {
      showToast(State.lang === 'en' ? 'Please enter the complete 6-digit OTP code.' : 'Sila masukkan 6-digit kod OTP yang lengkap.', 'warning');
      const firstEmpty = Array.from(document.querySelectorAll('.otp-digit-input')).find(i => !i.value);
      if (firstEmpty) firstEmpty.focus();
      return;
    }

    const res = await api('verifyOtp', { email: email, otp: otp, device: navigator.userAgent });
    if (res && res.success) {
      State.token = res.token;
      State.currentUser = res.user;
      localStorage.setItem('ceu_tok', res.token);
      localStorage.setItem('ceu_user', JSON.stringify(res.user));

      localStorage.setItem('ceu_bio_token', res.token);
      localStorage.setItem('ceu_bio_user', JSON.stringify(res.user));
      updateBiometricUI();

      showToast((State.lang === 'en' ? 'Login successful! Welcome ' : 'Log masuk berjaya! Selamat datang ') + (res.user.name || res.user.email), 'success');
      await loadAppBoot();
      navigateAfterLogin(res.user);
    } else {
      showToast((res && res.message) || (State.lang === 'en' ? 'Invalid OTP code.' : 'Kod OTP tidak sah.'), 'error');
    }
  }

  function logout(isManual = false) {
    State.token = '';
    State.currentUser = null;
    localStorage.removeItem('ceu_tok');
    localStorage.removeItem('ceu_user');
    setView('auth');
    if (isManual) {
      showToast(State.lang === 'en' ? 'You have successfully logged out.' : 'Awda telah berjaya log keluar dari Portal CEU.', 'info');
    }
  }

  async function quickLogin(userKey) {
    let email = 'ahmad.bakar@moe.bn';
    if (userKey === 'noraini') email = 'noraini.hashim@moe.bn';
    else if (userKey === 'admin') email = 'hajah.rohani@moe.bn';

    const emailInput = document.getElementById('auth-email-input');
    if (emailInput) emailInput.value = email;

    showToast((State.lang === 'en' ? 'Quick logging in as ' : 'Log masuk pantas sebagai ') + email + '...', 'info');
    const res = await api('verifyOtp', { email: email, otp: '123456', device: navigator.userAgent });
    if (res && res.success) {
      State.token = res.token;
      State.currentUser = res.user;
      localStorage.setItem('ceu_tok', res.token);
      localStorage.setItem('ceu_user', JSON.stringify(res.user));
      localStorage.setItem('ceu_bio_token', res.token);
      localStorage.setItem('ceu_bio_user', JSON.stringify(res.user));
      updateBiometricUI();
      showToast((State.lang === 'en' ? 'Welcome ' : 'Selamat datang ') + res.user.name, 'success');
      loadAppBoot();
    } else {
      showToast(State.lang === 'en' ? 'Quick login failed.' : 'Gagal log masuk pantas.', 'error');
    }
  }

  // ==========================================================================
  // 16. TOAST NOTIFICATION HELPER
  // ==========================================================================
  function showToast(message, type) {
    if (!message) return;
    type = type || 'info';
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    // Elakkan duplikasi mesej yang sama terpapar serentak
    const existing = Array.from(container.children);
    const isDuplicate = existing.some(el => el.textContent && el.textContent.includes(message));
    if (isDuplicate) return;

    // Hadkan maksimum 2 toast serentak supaya tidak bertindih
    if (existing.length >= 2) {
      existing[0].remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const iconName = type === 'success' ? 'check_circle' : (type === 'error' ? 'error' : (type === 'warning' ? 'warning' : 'info'));

    toast.innerHTML = `
      <span class="material-symbols-outlined text-[20px] shrink-0">${iconName}</span>
      <span class="flex-1">${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // ==========================================================================
  // 16B. PENGAWAL MODUL BINA & TERBITKAN ACARA RASMI (STITCH INTEGRATION)
  // ==========================================================================
  const selectedOfficerEmails = new Set();
  let officerSearchQuery = '';
  let officerDistrictFilter = 'all';

  function getOfficerUserList() {
    if (State.users && State.users.length > 0) {
      return State.users.filter(u => u.role !== 'Admin');
    }
    if (window.MOCK_DATA && window.MOCK_DATA.users) {
      return window.MOCK_DATA.users.filter(u => u.role !== 'Admin');
    }
    return [];
  }

  function updateTargetBadges() {
    const count = selectedOfficerEmails.size;
    const isEn = State.lang === 'en';
    const badge = document.getElementById('individual-selected-badge');
    if (badge) {
      badge.textContent = isEn ? `${count} Teachers Selected` : `${count} Guru Dipilih`;
      badge.className = count > 0
        ? 'px-2.5 py-0.5 rounded-full bg-primary text-white font-label-sm text-xs font-bold shadow-xs'
        : 'px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-xs font-bold';
    }

    const fcmCount = document.getElementById('fcm-target-count');
    if (fcmCount) {
      fcmCount.textContent = count;
    }

    updateFormProgress();
  }

  function renderIndividualOfficers() {
    const listContainer = document.getElementById('list-individual-officers');
    if (!listContainer) return;
    const allOfficers = getOfficerUserList();
    const q = officerSearchQuery.toLowerCase().trim();

    const filtered = allOfficers.filter(u => {
      if (officerDistrictFilter !== 'all') {
        const uDist = String(u.district || '').toLowerCase();
        if (uDist !== officerDistrictFilter.toLowerCase()) return false;
      }
      if (!q) return true;
      const str = `${u.name || ''} ${u.school || ''} ${u.district || ''} ${u.email || ''}`.toLowerCase();
      return str.includes(q);
    });

    const indicator = document.getElementById('officer-count-indicator');
    if (indicator) {
      const isEn = State.lang === 'en';
      indicator.textContent = isEn
        ? `${filtered.length} found (${selectedOfficerEmails.size} of ${allOfficers.length} selected)`
        : `${filtered.length} dijumpai (${selectedOfficerEmails.size} daripada ${allOfficers.length} dipilih)`;
    }

    if (!filtered.length) {
      listContainer.innerHTML = `
        <div class="p-6 text-center text-xs text-on-surface-variant font-medium">
          <span class="material-symbols-outlined text-2xl text-on-surface-variant/60 block mb-1">person_search</span>
          ${State.lang === 'en' ? 'No teachers found matching your search.' : 'Tiada guru dijumpai untuk carian atau daerah ini.'}
        </div>
      `;
      return;
    }

    listContainer.innerHTML = filtered.map(u => {
      const em = String(u.email || '').toLowerCase().trim();
      const isChecked = selectedOfficerEmails.has(em);
      const initial = (u.name || 'G').charAt(0);
      const districtBadge = u.district || 'Brunei-Muara';
      const schoolName = u.school || 'Sekolah Menengah';

      return `
        <label class="flex items-center gap-2.5 p-2 rounded-lg hover:bg-surface-container cursor-pointer transition-colors ${isChecked ? 'bg-primary/10 border border-primary/30 font-semibold' : ''}">
          <input type="checkbox" class="individual-officer-check accent-primary w-4 h-4 shrink-0 cursor-pointer" data-email="${em}" ${isChecked ? 'checked' : ''}/>
          <div class="w-7 h-7 rounded-full ${isChecked ? 'bg-primary text-white' : 'bg-primary/10 text-primary'} flex items-center justify-center text-xs font-bold shrink-0">
            ${initial}
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-xs font-bold text-on-surface truncate">${u.name}</p>
            <p class="text-[10px] text-on-surface-variant truncate">${schoolName}</p>
            <p class="text-[9px] text-on-surface-variant/70 truncate font-mono">${em}</p>
          </div>
          <span class="text-[10px] px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-semibold shrink-0">
            ${districtBadge}
          </span>
        </label>
      `;
    }).join('');

    listContainer.querySelectorAll('.individual-officer-check').forEach(ck => {
      ck.addEventListener('change', () => {
        const em = ck.dataset.email;
        if (ck.checked) {
          selectedOfficerEmails.add(em);
        } else {
          selectedOfficerEmails.delete(em);
        }
        updateTargetBadges();
        renderIndividualOfficers();
      });
    });
  }

  let editingEventId = null;

  function resetCreateEventForm(keepEditingId) {
    if (!keepEditingId) {
      editingEventId = null;
      const heading = document.querySelector('#view-admin-events h1');
      if (heading) heading.textContent = State.lang === 'en' ? 'Create & Publish Official Event' : 'Bina & Terbitkan Acara Rasmi';
    }
    selectedOfficerEmails.clear();
    renderIndividualOfficers();
    updateTargetBadges();
    const inputTitle = document.getElementById('event-title-bm');
    const selectCat = document.getElementById('event-category');
    const inputDate = document.getElementById('event-date-input');
    const inputStart = document.getElementById('event-start-time');
    const inputEnd = document.getElementById('event-end-time');
    const inputVenue = document.getElementById('event-venue-input');
    const inputMeet = document.getElementById('event-meet-link');
    const inputDeadline = document.getElementById('event-deadline-input');
    const inputDrive = document.getElementById('event-drive-url');

    const previewTitle = document.getElementById('preview-title');
    const previewDate = document.getElementById('preview-date');
    const previewTime = document.getElementById('preview-time');
    const previewVenue = document.getElementById('preview-venue');
    const previewVenueName = document.getElementById('preview-venue-name');
    const previewDeadline = document.getElementById('preview-deadline');
    const rsvpDeadlineText = document.getElementById('rsvp-deadline-text');

    if (inputTitle) inputTitle.value = '';
    if (selectCat) selectCat.value = 'Mesyuarat';
    if (inputDate) inputDate.value = '';
    if (inputStart) inputStart.value = '';
    if (inputEnd) inputEnd.value = '';
    if (inputVenue) inputVenue.value = '';
    if (inputMeet) inputMeet.value = '';
    if (inputDeadline) inputDeadline.value = '';
    if (inputDrive) inputDrive.value = '';

    const inputFile = document.getElementById('event-file-attachment');
    if (inputFile) inputFile.value = '';
    const attachPreview = document.getElementById('event-attachment-preview');
    if (attachPreview) attachPreview.classList.add('hidden');

    const isEn = State.lang === 'en';
    if (previewTitle) previewTitle.textContent = isEn ? 'Official Event Title' : 'Tajuk Acara Rasmi';
    if (previewDate) previewDate.textContent = '-- / -- / ----';
    if (previewTime) previewTime.textContent = '--:--';
    if (previewVenue) previewVenue.textContent = isEn ? 'Event Venue' : 'Lokasi Acara';
    if (previewVenueName) previewVenueName.textContent = isEn ? 'Venue not specified yet' : 'Lokasi belum ditetapkan';
    if (previewDeadline) previewDeadline.textContent = isEn ? 'RSVP Deadline' : 'Tarikh Tutup RSVP';
    if (rsvpDeadlineText) rsvpDeadlineText.textContent = isEn ? 'Not set yet' : 'Belum ditetapkan';

    const btnSearchMaps = document.getElementById('btn-search-maps');
    if (btnSearchMaps) {
      btnSearchMaps.href = '#';
      btnSearchMaps.classList.add('opacity-50', 'pointer-events-none');
    }
  }

  window.editEvent = function(eventId) {
    const all = [...(State.events || []), ...(window.MOCK_DATA.events || [])];
    const ev = all.find(e => String(e.event_id) === String(eventId));
    if (!ev) {
      showToast('Acara tidak dijumpai.', 'error');
      return;
    }

    editingEventId = ev.event_id;
    setView('admin-events');

    const heading = document.querySelector('#view-admin-events h1');
    if (heading) heading.textContent = (State.lang === 'en' ? 'Edit Event / Draft: ' : 'Sunting Acara / Draf: ') + (ev.title_bm || ev.event_id);

    const inputTitle = document.getElementById('event-title-bm');
    const selectCat = document.getElementById('event-category');
    const inputCatCustom = document.getElementById('event-category-custom');
    const containerCatCustom = document.getElementById('container-category-custom');
    const inputDate = document.getElementById('event-date-input');
    const inputStart = document.getElementById('event-start-time');
    const inputEnd = document.getElementById('event-end-time');
    const inputVenue = document.getElementById('event-venue-input');
    const inputMeet = document.getElementById('event-meet-link');
    const inputDeadline = document.getElementById('event-deadline-input');
    const inputDrive = document.getElementById('event-drive-url');

    if (inputTitle) inputTitle.value = ev.title_bm || '';

    const cat = ev.category || 'Mesyuarat';
    if (selectCat) {
      const standardCats = ['Mesyuarat', 'Taklimat', 'Program', 'Lawatan'];
      if (standardCats.includes(cat)) {
        selectCat.value = cat;
        if (containerCatCustom) containerCatCustom.classList.add('hidden');
      } else {
        selectCat.value = 'Lain-lain';
        if (containerCatCustom) {
          containerCatCustom.classList.remove('hidden');
          if (inputCatCustom) inputCatCustom.value = cat;
        }
      }
    }

    if (inputDate) inputDate.value = ev.event_date || '';

    if (inputStart) {
      inputStart.value = timeTo24H(ev.start_time);
    }
    if (inputEnd) {
      inputEnd.value = timeTo24H(ev.end_time);
    }

    if (inputVenue) inputVenue.value = ev.venue || '';
    if (inputMeet) inputMeet.value = ev.meeting_link || '';
    if (inputDeadline) inputDeadline.value = ev.rsvp_deadline || '';
    if (inputDrive) inputDrive.value = ev.attachment_drive_url || '';

    // Pratonton
    const previewTitle = document.getElementById('preview-title');
    const previewDate = document.getElementById('preview-date');
    const previewTime = document.getElementById('preview-time');
    const previewVenue = document.getElementById('preview-venue');
    const previewVenueName = document.getElementById('preview-venue-name');
    const previewDeadline = document.getElementById('preview-deadline');

    if (previewTitle) previewTitle.textContent = ev.title_bm || 'Tajuk Acara Rasmi';
    if (previewDate) previewDate.textContent = ev.event_date || '-- / -- / ----';
    if (previewTime) previewTime.textContent = (ev.start_time && ev.end_time) ? `${formatTime12H(ev.start_time)} - ${formatTime12H(ev.end_time)}` : (formatTime12H(ev.start_time) || '--:--');
    if (previewVenue) previewVenue.textContent = ev.venue || 'Lokasi Acara';
    if (previewVenueName) previewVenueName.textContent = ev.venue || 'Lokasi belum ditetapkan';
    if (previewDeadline) previewDeadline.textContent = ev.rsvp_deadline ? `Tutup: ${ev.rsvp_deadline}` : 'Tarikh Tutup RSVP';

    // Lampiran jika ada
    const attachPreview = document.getElementById('event-attachment-preview');
    const fileNamePreview = document.getElementById('event-file-name-preview');
    const fileSizePreview = document.getElementById('event-file-size-preview');
    const fileBadgeIcon = document.getElementById('event-file-badge-icon');
    if (ev.attachment_drive_url && attachPreview) {
      attachPreview.classList.remove('hidden');
      if (fileNamePreview) fileNamePreview.textContent = 'Pautan Dokumen Lampiran';
      if (fileSizePreview) fileSizePreview.innerHTML = `<span>Lampiran Tersimpan</span> • <span class="text-primary font-medium">${ev.attachment_drive_url.substring(0, 30)}...</span>`;
      if (fileBadgeIcon) fileBadgeIcon.textContent = 'link';
    } else if (attachPreview) {
      attachPreview.classList.add('hidden');
    }

    // Isi semula guru sasaran yang dijemput
    selectedOfficerEmails.clear();
    const rawEmails = ev.target_emails || ev.individualEmails || [];
    const emailList = (Array.isArray(rawEmails) ? rawEmails : String(rawEmails).split(','))
      .map(s => String(s).trim().toLowerCase())
      .filter(Boolean);

    emailList.forEach(em => selectedOfficerEmails.add(em));
    renderIndividualOfficers();
    updateTargetBadges();
    updateFormProgress();

    showToast(State.lang === 'en' ? 'Event loaded for editing.' : 'Maklumat acara dimuatkan untuk disunting.', 'info');
  };

  function updateFormProgress() {
    const inputTitle = document.getElementById('event-title-bm');
    const inputDate = document.getElementById('event-date-input');
    const inputVenue = document.getElementById('event-venue-input');
    const inputDeadline = document.getElementById('event-deadline-input');

    const titleVal = (inputTitle && typeof inputTitle.value === 'string') ? inputTitle.value.trim() : '';
    const dateVal = (inputDate && inputDate.value) ? String(inputDate.value).trim() : '';
    const venueVal = (inputVenue && typeof inputVenue.value === 'string') ? inputVenue.value.trim() : '';
    const deadlineVal = (inputDeadline && inputDeadline.value) ? String(inputDeadline.value).trim() : '';

    const hasTitle = Boolean(titleVal.length > 0);
    const hasDateVenue = Boolean(dateVal.length > 0 && venueVal.length > 0);
    const hasDeadline = Boolean(deadlineVal.length > 0);

    let completedSteps = 0;
    if (hasTitle) completedSteps++;
    if (hasDateVenue) completedSteps++;
    if (hasDeadline) completedSteps++;

    const currentStep = completedSteps === 3 ? 4 : (completedSteps + 1);
    const percentage = completedSteps === 3 ? 100 : Math.round((completedSteps / 3) * 75 + 10);

    const isEn = State.lang === 'en';
    const badge = document.getElementById('step-progress-badge');
    if (badge) {
      if (currentStep === 4) {
        badge.textContent = isEn ? 'Step 4 / 4 (100% Ready to Publish)' : 'Langkah 4 / 4 (100% Sedia Terbit)';
        badge.className = 'font-label-sm text-label-sm text-[#15803D] font-bold px-2.5 py-0.5 rounded-full bg-[#DCFCE7]';
      } else {
        const stepName = currentStep === 1 ? (isEn ? 'Basics' : 'Asas') : (currentStep === 2 ? (isEn ? 'Location' : 'Lokasi') : (isEn ? 'Target' : 'Sasaran'));
        badge.textContent = isEn
          ? `Step ${currentStep} / 4: ${stepName} (${percentage}% Complete)`
          : `Langkah ${currentStep} / 4: ${stepName} (${percentage}% Siap)`;
        badge.className = 'font-label-sm text-label-sm text-primary font-bold px-2.5 py-0.5 rounded-full bg-primary/10';
      }
    }

    for (let i = 1; i <= 4; i++) {
      const bar = document.getElementById('step-bar-' + i);
      const btn = document.getElementById('step-btn-' + i);
      if (bar) {
        if (i <= currentStep) {
          bar.className = 'h-2 rounded-full bg-primary transition-all duration-300 shadow-xs' + (i === currentStep ? ' ring-1 ring-primary-container' : '');
        } else {
          bar.className = 'h-2 rounded-full bg-surface-container-highest transition-all duration-300';
        }
      }
      if (btn) {
        if (i === currentStep) {
          btn.className = 'text-primary font-black cursor-pointer hover:underline transition-colors';
        } else if (i < currentStep) {
          btn.className = 'text-primary/75 font-bold cursor-pointer hover:underline transition-colors';
        } else {
          btn.className = 'text-on-surface-variant/70 font-medium cursor-pointer hover:underline transition-colors';
        }
      }
    }
  }

  function initAdminCreateEvent() {
    // Hubungkan butang kemajuan stepper ke bahagian borang berkenaan
    for (let s = 1; s <= 4; s++) {
      const stepBtn = document.getElementById('step-btn-' + s);
      const targetSec = document.getElementById('form-section-' + s);
      if (stepBtn && targetSec) {
        stepBtn.addEventListener('click', () => {
          targetSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
    }

    // Pendengar kemajuan langsung untuk mengemas kini progress bar secara automatik
    const formCreate = document.getElementById('form-create-event');
    if (formCreate) {
      formCreate.addEventListener('input', updateFormProgress);
      formCreate.addEventListener('change', updateFormProgress);
    }

    const inputTitleBm = document.getElementById('event-title-bm');
    const selectCategory = document.getElementById('event-category');
    const containerCategoryCustom = document.getElementById('container-category-custom');
    const inputCategoryCustom = document.getElementById('event-category-custom');

    const inputDate = document.getElementById('event-date-input');
    const inputStartTime = document.getElementById('event-start-time');
    const inputEndTime = document.getElementById('event-end-time');
    const inputVenue = document.getElementById('event-venue-input');
    const btnClearVenue = document.getElementById('btn-clear-venue');
    const venueQuickChips = document.querySelectorAll('.venue-quick-chip');
    const inputMeetLink = document.getElementById('event-meet-link');
    const inputDeadline = document.getElementById('event-deadline-input');
    const inputDriveUrl = document.getElementById('event-drive-url');

    const previewTitle = document.getElementById('preview-title');
    const previewDate = document.getElementById('preview-date');
    const previewTime = document.getElementById('preview-time');
    const previewVenue = document.getElementById('preview-venue');
    const previewDeadline = document.getElementById('preview-deadline');
    const rsvpDeadlineText = document.getElementById('rsvp-deadline-text');

    // 1. Tajuk Acara (Bahasa Melayu Sahaja) & Pratonton
    if (inputTitleBm && previewTitle) {
      inputTitleBm.addEventListener('input', e => {
        previewTitle.textContent = e.target.value.trim() || 'Tajuk Acara Rasmi';
      });
    }

    // 2. Kategori Acara (Mesyuarat, Taklimat, Program, Lawatan, Lain-lain)
    if (selectCategory) {
      selectCategory.addEventListener('change', () => {
        const isLainLain = selectCategory.value === 'Lain-lain';
        if (containerCategoryCustom) {
          containerCategoryCustom.classList.toggle('hidden', !isLainLain);
          if (isLainLain && inputCategoryCustom) inputCategoryCustom.focus();
        }
      });
    }

    // 3. Tarikh & Waktu
    if (inputDate && previewDate) {
      inputDate.addEventListener('change', e => {
        const val = e.target.value;
        if (!val) return;
        const [y, m, d] = val.split('-');
        const monthNames = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];
        previewDate.textContent = `${parseInt(d, 10)} ${monthNames[parseInt(m, 10) - 1] || m} ${y}`;
      });
    }

    function updatePreviewTime() {
      const s = inputStartTime ? inputStartTime.value : '';
      const e = inputEndTime ? inputEndTime.value : '';
      if (!previewTime) return;
      if (s && e) {
        previewTime.textContent = `${formatTime12H(s)} - ${formatTime12H(e)}`;
      } else if (s) {
        previewTime.textContent = formatTime12H(s);
      } else {
        previewTime.textContent = '08:30 PAGI';
      }
    }

    if (inputStartTime) {
      inputStartTime.addEventListener('change', updatePreviewTime);
      inputStartTime.addEventListener('input', updatePreviewTime);
    }
    if (inputEndTime) {
      inputEndTime.addEventListener('change', updatePreviewTime);
      inputEndTime.addEventListener('input', updatePreviewTime);
    }

    // 4. Integrasi Lokasi & Google Maps
    const previewVenueName = document.getElementById('preview-venue-name');
    const btnSearchMaps = document.getElementById('btn-search-maps');

    function updateVenueMaps(val) {
      const v = (val || '').trim();
      if (previewVenue) previewVenue.textContent = v || (State.lang === 'en' ? 'Event Venue' : 'Lokasi Acara');
      if (previewVenueName) previewVenueName.textContent = v || (State.lang === 'en' ? 'Venue not set' : 'Lokasi belum ditetapkan');
      if (btnSearchMaps) {
        if (v && !v.toLowerCase().includes('talian') && !v.toLowerCase().includes('meet')) {
          btnSearchMaps.href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(v);
          btnSearchMaps.classList.remove('opacity-50', 'pointer-events-none');
        } else {
          btnSearchMaps.href = '#';
          btnSearchMaps.classList.add('opacity-50', 'pointer-events-none');
        }
      }
    }

    if (inputVenue) {
      inputVenue.addEventListener('input', e => {
        updateVenueMaps(e.target.value);
      });
    }

    if (btnClearVenue && inputVenue) {
      btnClearVenue.addEventListener('click', () => {
        inputVenue.value = '';
        inputVenue.focus();
        updateVenueMaps('');
      });
    }

    venueQuickChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const v = chip.dataset.venue;
        if (inputVenue && v) {
          inputVenue.value = v;
          updateVenueMaps(v);
        }
      });
    });

    // 5. Tarikh Tutup RSVP
    if (inputDeadline && previewDeadline) {
      inputDeadline.addEventListener('change', e => {
        const val = e.target.value;
        if (!val) return;
        const [dPart, tPart] = val.split('T');
        if (dPart) {
          const [y, m, d] = dPart.split('-');
          const monthNames = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];
          const str = `${parseInt(d, 10)} ${monthNames[parseInt(m, 10) - 1] || m} ${y}`;
          previewDeadline.textContent = `RSVP sebelum ${parseInt(d, 10)} ${monthNames[parseInt(m, 10) - 1] || m}`;
          if (rsvpDeadlineText) rsvpDeadlineText.textContent = `${str}, ${tPart || '17:00'} (Waktu Brunei)`;
        }
      });
    }

    // 6. Format Pelaksanaan (Bersemuka / Hibrid / Dalam Talian Penuh)
    const formatRadios = document.querySelectorAll('input[name="event_format"]');
    const containerMeet = document.getElementById('container-meet-link');
    const formatLabels = {
      'Bersemuka': document.getElementById('format-label-bersemuka'),
      'Hibrid': document.getElementById('format-label-hibrid'),
      'Dalam Talian Penuh': document.getElementById('format-label-online')
    };

    formatRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        const selected = radio.value;
        if (containerMeet) {
          containerMeet.classList.toggle('hidden', selected === 'Bersemuka');
        }
        Object.keys(formatLabels).forEach(key => {
          const el = formatLabels[key];
          if (!el) return;
          const isCurrent = key === selected;
          el.classList.toggle('bg-secondary-fixed/50', isCurrent);
          el.classList.toggle('border-primary/30', isCurrent);
          el.classList.toggle('bg-surface-container-low', !isCurrent);
          el.classList.toggle('border-transparent', !isCurrent);
        });
      });
    });

    // 7. Pengurusan Pemilihan Guru Pendidikan Kerjaya Secara Individu (Jemputan Acara)
    const searchIndividualInput = document.getElementById('search-individual-input');
    const btnSelectAllIndividuals = document.getElementById('btn-select-all-filtered-individuals');
    const btnClearAllIndividuals = document.getElementById('btn-clear-all-individuals');

    // Muat senarai pengguna rasmi dari Google Sheets (tbl_users) jika belum ada
    if (!State.users || !State.users.length) {
      api('getUsers').then(res => {
        if (res && res.success && res.users && res.users.length) {
          State.users = res.users;
          renderIndividualOfficers();
          updateTargetBadges();
        }
      }).catch(err => console.warn('Gagal muat direktori pengguna:', err));
    }

    // Carian Guru
    if (searchIndividualInput) {
      searchIndividualInput.addEventListener('input', e => {
        officerSearchQuery = e.target.value;
        renderIndividualOfficers();
      });
    }

    // Penapis Daerah Pantas
    document.querySelectorAll('.btn-ind-filter-district').forEach(btn => {
      btn.addEventListener('click', () => {
        officerDistrictFilter = btn.dataset.district;
        document.querySelectorAll('.btn-ind-filter-district').forEach(b => {
          const isMatch = b.dataset.district === officerDistrictFilter;
          b.classList.toggle('bg-primary', isMatch);
          b.classList.toggle('text-white', isMatch);
          b.classList.toggle('font-bold', isMatch);
          b.classList.toggle('bg-surface-container-high', !isMatch);
          b.classList.toggle('text-on-surface-variant', !isMatch);
          b.classList.toggle('font-semibold', !isMatch);
        });
        renderIndividualOfficers();
      });
    });

    // Butang Pilih Semua Ditapis
    if (btnSelectAllIndividuals) {
      btnSelectAllIndividuals.addEventListener('click', () => {
        const allOfficers = getOfficerUserList();
        const q = officerSearchQuery.toLowerCase().trim();
        const filtered = allOfficers.filter(u => {
          if (officerDistrictFilter !== 'all') {
            const uDist = String(u.district || '').toLowerCase();
            if (uDist !== officerDistrictFilter.toLowerCase()) return false;
          }
          if (!q) return true;
          const str = `${u.name || ''} ${u.school || ''} ${u.district || ''} ${u.email || ''}`.toLowerCase();
          return str.includes(q);
        });

        filtered.forEach(u => {
          const em = String(u.email || '').toLowerCase().trim();
          if (em) selectedOfficerEmails.add(em);
        });
        updateTargetBadges();
        renderIndividualOfficers();
      });
    }

    // Butang Kosongkan Pilihan
    if (btnClearAllIndividuals) {
      btnClearAllIndividuals.addEventListener('click', () => {
        selectedOfficerEmails.clear();
        updateTargetBadges();
        renderIndividualOfficers();
      });
    }

    renderIndividualOfficers();
    updateTargetBadges();

    // 10. Pengurusan Lampiran Fail & Pautan Drive (Seksyen 4)
    const inputFileAttachment = document.getElementById('event-file-attachment');
    const inputDriveUrlAttachment = document.getElementById('event-drive-url');
    const attachmentPreview = document.getElementById('event-attachment-preview');
    const fileNamePreview = document.getElementById('event-file-name-preview');
    const fileSizePreview = document.getElementById('event-file-size-preview');
    const fileBadgeIcon = document.getElementById('event-file-badge-icon');
    const btnRemoveAttachment = document.getElementById('btn-remove-attachment');

    if (inputFileAttachment) {
      inputFileAttachment.addEventListener('change', e => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          const isDoc = file.name.endsWith('.docx') || file.name.endsWith('.doc');
          if (fileNamePreview) fileNamePreview.textContent = file.name;
          if (fileSizePreview) fileSizePreview.innerHTML = `<span>${(file.size / (1024*1024)).toFixed(1)} MB</span> • <span class="text-primary font-medium">Sedia Dilampirkan</span>`;
          if (fileBadgeIcon) fileBadgeIcon.textContent = isDoc ? 'description' : 'picture_as_pdf';
          if (attachmentPreview) attachmentPreview.classList.remove('hidden');
        }
      });
    }

    if (inputDriveUrlAttachment) {
      inputDriveUrlAttachment.addEventListener('input', e => {
        const val = e.target.value.trim();
        if (val && (!inputFileAttachment || !inputFileAttachment.files.length)) {
          if (fileNamePreview) fileNamePreview.textContent = 'Pautan Dokumen Google Drive';
          if (fileSizePreview) fileSizePreview.innerHTML = `<span>Pautan Dokumen</span> • <span class="text-primary font-medium">${val.substring(0, 30)}...</span>`;
          if (fileBadgeIcon) fileBadgeIcon.textContent = 'link';
          if (attachmentPreview) attachmentPreview.classList.remove('hidden');
        } else if (!val && (!inputFileAttachment || !inputFileAttachment.files.length)) {
          if (attachmentPreview) attachmentPreview.classList.add('hidden');
        }
      });
    }

    if (btnRemoveAttachment) {
      btnRemoveAttachment.addEventListener('click', () => {
        if (inputFileAttachment) inputFileAttachment.value = '';
        if (inputDriveUrlAttachment) inputDriveUrlAttachment.value = '';
        if (attachmentPreview) attachmentPreview.classList.add('hidden');
      });
    }

    // 11. Pengurusan Simpan Draf & Terbit Acara
    const btnSaveDraft = document.getElementById('btn-save-draft');
    const btnBroadcast = document.getElementById('btn-broadcast');
    let isSubmittingEvent = false;

    async function handleEventSubmission(isDraft) {
      if (isSubmittingEvent) {
        console.warn('Pengesahan acara sedang diproses, mengabaikan klik pendua.');
        return;
      }
      isSubmittingEvent = true;

      try {
        const titleEl = document.getElementById('event-title-bm');
        const titleBm = titleEl ? titleEl.value.trim() : (isDraft ? 'Draf Acara Baharu' : '');
        
        const catEl = document.getElementById('event-category');
        const customCatEl = document.getElementById('event-category-custom');
        let category = catEl ? catEl.value : 'Mesyuarat';
        if (category === 'Lain-lain' && customCatEl && customCatEl.value.trim()) {
          category = customCatEl.value.trim();
        }

        const dateEl = document.getElementById('event-date-input');
        const date = dateEl ? dateEl.value : '';
        const startTimeEl = document.getElementById('event-start-time');
        const startTime = startTimeEl ? startTimeEl.value : '08:30';
        const endTimeEl = document.getElementById('event-end-time');
        const endTime = endTimeEl ? endTimeEl.value : '12:00';
        const venueEl = document.getElementById('event-venue-input');
        const venue = venueEl ? venueEl.value.trim() : '';
        const meetEl = document.getElementById('event-meet-link');
        const meetLink = meetEl ? meetEl.value.trim() : '';
        const driveEl = document.getElementById('event-drive-url');
        const driveUrl = driveEl ? driveEl.value.trim() : '';
        const deadlineEl = document.getElementById('event-deadline-input');
        const deadline = deadlineEl ? deadlineEl.value : '';

        if (!isDraft) {
          if (!titleBm) {
            showToast(State.lang === 'en' ? 'Please fill in the event title.' : 'Sila isikan tajuk acara rasmi.', 'warning');
            titleEl?.focus();
            document.getElementById('form-section-1')?.scrollIntoView({ behavior: 'smooth' });
            return;
          }
          if (!date) {
            showToast(State.lang === 'en' ? 'Please select the event date.' : 'Sila pilih tarikh acara rasmi.', 'warning');
            dateEl?.focus();
            document.getElementById('form-section-2')?.scrollIntoView({ behavior: 'smooth' });
            return;
          }
          if (selectedOfficerEmails.size === 0) {
            showToast(State.lang === 'en' ? 'Please select at least one Career Education Teacher to invite.' : 'Sila tandakan sekurang-kurangnya seorang Guru Pendidikan Kerjaya yang dijemput hadir.', 'warning');
            document.getElementById('form-section-3')?.scrollIntoView({ behavior: 'smooth' });
            return;
          }
        }

        const individualEmails = Array.from(selectedOfficerEmails);
        const finalCount = individualEmails.length;
        const currentTargetMode = 'individual';
        const checkInvitePrincipals = document.getElementById('check-invite-principals');
        const targetRolesList = ['Guru Pendidikan Kerjaya'];
        if (checkInvitePrincipals && checkInvitePrincipals.checked) {
          targetRolesList.push('Pengetua');
        }

        const channelFcm = document.getElementById('channel-fcm')?.checked ?? true;
        const channelEmail = document.getElementById('channel-email')?.checked ?? true;
        const channelBanner = document.getElementById('channel-banner')?.checked ?? true;

        const activeBtn = isDraft ? btnSaveDraft : btnBroadcast;
        if (activeBtn) {
          activeBtn.disabled = true;
          activeBtn.innerHTML = `<span class="material-symbols-outlined text-[18px] animate-spin">progress_activity</span><span>${isDraft ? (State.lang === 'en' ? 'Saving Draft...' : 'Menyimpan Draf...') : (State.lang === 'en' ? 'Broadcasting...' : 'Menghantar FCM...')}</span>`;
        }

        const res = await api('saveEvent', {
          eventId: editingEventId || undefined,
          isDraft: isDraft,
          titleBm: titleBm || (isDraft ? 'Draf Acara' : 'Acara Rasmi'),
          titleEn: titleBm || (isDraft ? 'Event Draft' : 'Official Event'),
          category,
          eventDate: date,
          startTime: startTime ? formatTime12H(startTime) : '08:30 PAGI',
          endTime: endTime ? formatTime12H(endTime) : '12:00 TENGAH HARI',
          venue,
          meetingLink: meetLink,
          rsvpDeadline: deadline,
          driveUrl,
          targetMode: currentTargetMode,
          targetRoles: targetRolesList,
          individualEmails,
          targetCount: finalCount,
          channels: {
            fcm: channelFcm,
            email: channelEmail,
            banner: channelBanner
          }
        });

        if (res && res.success) {
          editingEventId = null;
          if (activeBtn) {
            activeBtn.innerHTML = `<span class="material-symbols-outlined text-[18px]">check_circle</span><span>${isDraft ? (State.lang === 'en' ? 'Draft Saved' : 'Draf Disimpan') : (State.lang === 'en' ? 'Broadcasted!' : 'Berjaya Disiarkan!')}</span>`;
            activeBtn.classList.remove('bg-primary');
            activeBtn.classList.add('bg-secondary');
          }
          showToast(res.message || (isDraft ? (State.lang === 'en' ? 'Draft saved successfully.' : 'Draf berjaya disimpan.') : (State.lang === 'en' ? 'Event published successfully.' : 'Acara berjaya diterbitkan.')), 'success');
          State.adminData = null;
          await loadAppBoot();
          setTimeout(() => {
            setView('admin-dashboard');
            if (activeBtn) {
              activeBtn.innerHTML = isDraft 
                ? `<span class="material-symbols-outlined text-[18px]">save</span><span>${State.lang === 'en' ? 'Save Draft' : 'Simpan Draf'}</span>`
                : `<span class="material-symbols-outlined text-[18px]">send</span><span>${State.lang === 'en' ? 'Publish & Broadcast' : 'Terbit & Siar FCM'}</span>`;
              activeBtn.classList.add('bg-primary');
              activeBtn.classList.remove('bg-secondary');
              activeBtn.disabled = false;
            }
          }, 1200);
        } else {
          showToast((res && res.message) || (State.lang === 'en' ? 'Failed to save event.' : 'Gagal menyimpan acara.'), 'error');
          if (activeBtn) {
            activeBtn.disabled = false;
            activeBtn.innerHTML = isDraft 
              ? `<span class="material-symbols-outlined text-[18px]">save</span><span>${State.lang === 'en' ? 'Save Draft' : 'Simpan Draf'}</span>`
              : `<span class="material-symbols-outlined text-[18px]">send</span><span>${State.lang === 'en' ? 'Publish & Broadcast' : 'Terbit & Siar FCM'}</span>`;
          }
        }
      } catch (err) {
        console.error('Error submitting event:', err);
        showToast('Ralat: ' + (err.message || String(err)), 'error');
        const activeBtn = isDraft ? btnSaveDraft : btnBroadcast;
        if (activeBtn) {
          activeBtn.disabled = false;
          activeBtn.innerHTML = isDraft 
            ? `<span class="material-symbols-outlined text-[18px]">save</span><span>${State.lang === 'en' ? 'Save Draft' : 'Simpan Draf'}</span>`
            : `<span class="material-symbols-outlined text-[18px]">send</span><span>${State.lang === 'en' ? 'Publish & Broadcast' : 'Terbit & Siar FCM'}</span>`;
        }
      } finally {
        isSubmittingEvent = false;
      }
    }

    window.handleEventPublish = () => handleEventSubmission(false);
    window.handleEventDraft = () => handleEventSubmission(true);

    if (formCreate) {
      formCreate.addEventListener('submit', (e) => {
        e.preventDefault();
        handleEventSubmission(false);
      });
    }
  }

  // ==========================================================================
  // 17. PEMASANGAN EVENT LISTENERS (INIT)
  // ==========================================================================
  function initEvents() {
    document.querySelectorAll('.lang-btn-bm').forEach(b => b.addEventListener('click', () => setLanguage('bm', true)));
    document.querySelectorAll('.lang-btn-en').forEach(b => b.addEventListener('click', () => setLanguage('en', true)));

    const tabEmail = document.getElementById('tab-btn-email');
    const tabBio = document.getElementById('tab-btn-biometric');
    const viewEmail = document.getElementById('view-email');
    const viewBio = document.getElementById('view-biometric');

    if (tabEmail && tabBio && viewEmail && viewBio) {
      tabEmail.addEventListener('click', () => {
        tabEmail.classList.add('bg-primary', 'text-white', 'shadow-sm', 'font-semibold');
        tabEmail.classList.remove('text-on-surface-variant', 'font-medium');
        tabBio.classList.remove('bg-primary', 'text-white', 'shadow-sm', 'font-semibold');
        tabBio.classList.add('text-on-surface-variant', 'font-medium');
        viewEmail.classList.remove('hidden');
        viewBio.classList.add('hidden');
      });

      tabBio.addEventListener('click', () => {
        tabBio.classList.add('bg-primary', 'text-white', 'shadow-sm', 'font-semibold');
        tabBio.classList.remove('text-on-surface-variant', 'font-medium');
        tabEmail.classList.remove('bg-primary', 'text-white', 'shadow-sm', 'font-semibold');
        tabEmail.classList.add('text-on-surface-variant', 'font-medium');
        viewBio.classList.remove('hidden');
        viewEmail.classList.add('hidden');
      });
    }

    // bio-trigger-btn dikendalikan secara terus oleh window.triggerBiometricScan() dalam HTML

    const btnSwitchUser = document.getElementById('btn-bio-switch-user');
    if (btnSwitchUser) {
      btnSwitchUser.addEventListener('click', () => {
        localStorage.removeItem('ceu_bio_token');
        localStorage.removeItem('ceu_bio_user');
        localStorage.removeItem('ceu_webauthn_cred_id');
        updateBiometricUI();
        showToast(State.lang === 'en' ? 'Biometric cleared. Please log in with OTP.' : 'Pendaftaran biometrik dipadamkan. Sila log masuk dengan OTP.', 'info');
      });
    }

    const btnSwitchToEmail = document.getElementById('btn-switch-to-email-tab');
    if (btnSwitchToEmail) {
      btnSwitchToEmail.addEventListener('click', () => {
        document.getElementById('tab-btn-email')?.click();
      });
    }

    const btnSendOtp = document.getElementById('btn-send-otp') || document.getElementById('otp-submit-btn');
    if (btnSendOtp) btnSendOtp.addEventListener('click', handleSendOtpClick);

    const btnVerifyOtp = document.getElementById('btn-verify-otp');
    if (btnVerifyOtp) btnVerifyOtp.addEventListener('click', handleVerifyOtpClick);

    const authForm = document.getElementById('auth-form');
    if (authForm) authForm.addEventListener('submit', (e) => { e.preventDefault(); handleVerifyOtpClick(); });

    const otpBoxes = document.querySelectorAll('.otp-digit-input');
    otpBoxes.forEach((box, i) => {
      box.addEventListener('input', () => {
        if (box.value.length === 1 && i < otpBoxes.length - 1) {
          otpBoxes[i + 1].focus();
        }
      });
      box.addEventListener('keydown', e => {
        if (e.key === 'Backspace' && !box.value && i > 0) {
          otpBoxes[i - 1].focus();
        }
      });
    });

    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        if (tab === 'rsvp') {
          if (State.currentUser && State.currentUser.role === 'Admin') {
            setView('admin-rsvp');
          } else {
            setView('home');
            setEventFilter('urgent');
          }
        } else if (tab === 'takwim' || tab === 'calendar') {
          setView('home');
          setEventFilter('all');
          const cal = document.getElementById('calendar-grid') || document.getElementById('calendar-month-label');
          if (cal) cal.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (tab === 'home') {
          if (State.currentUser && State.currentUser.role === 'Admin') {
            setView('admin-dashboard');
          } else {
            setView('home');
            setEventFilter('all');
          }
        } else if (tab === 'archive') {
          setView('archive');
        } else if (tab === 'notif') {
          setView('notif');
        } else if (tab === 'profile') {
          setView('profile');
        } else {
          setView(tab);
        }
      });
    });

    const radioRep = document.getElementById('radio-rep');
    const radioAbsent = document.getElementById('radio-absent');
    const radioAttend = document.getElementById('radio-attend');
    const repFields = document.getElementById('rsvp-rep-fields');
    const absentFields = document.getElementById('rsvp-absent-fields');

    [radioAttend, radioRep, radioAbsent].forEach(r => {
      if (!r) return;
      r.addEventListener('change', () => {
        if (repFields) repFields.classList.toggle('hidden', !radioRep.checked);
        if (absentFields) absentFields.classList.toggle('hidden', !radioAbsent.checked);
      });
    });

    const btnCloseRsvp = document.getElementById('btn-close-rsvp-modal');
    if (btnCloseRsvp) btnCloseRsvp.addEventListener('click', closeRsvpModal);

    const btnSubmitRsvp = document.getElementById('btn-submit-rsvp-form');
    if (btnSubmitRsvp) btnSubmitRsvp.addEventListener('click', handleRsvpSubmit);

    document.querySelectorAll('.event-filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        setEventFilter(pill.dataset.filter);
      });
    });

    // Segmen Mod Kalendar: Mingguan (Lalai) / Bulanan (Pilihan)
    const btnCalWeekly = document.getElementById('btn-cal-weekly');
    if (btnCalWeekly) {
      btnCalWeekly.addEventListener('click', () => {
        State.calendarMode = 'weekly';
        renderMonthlyCalendar();
      });
    }

    const btnCalMonthly = document.getElementById('btn-cal-monthly');
    if (btnCalMonthly) {
      btnCalMonthly.addEventListener('click', () => {
        State.calendarMode = 'monthly';
        renderMonthlyCalendar();
      });
    }

    const btnPrevCal = document.getElementById('btn-prev-cal');
    if (btnPrevCal) {
      btnPrevCal.addEventListener('click', () => {
        const cur = new Date(State.calendarDate || new Date());
        if (State.calendarMode === 'weekly') {
          cur.setDate(cur.getDate() - 7);
        } else {
          cur.setMonth(cur.getMonth() - 1);
        }
        State.calendarDate = cur;
        renderMonthlyCalendar();
      });
    }

    const btnNextCal = document.getElementById('btn-next-cal');
    if (btnNextCal) {
      btnNextCal.addEventListener('click', () => {
        const cur = new Date(State.calendarDate || new Date());
        if (State.calendarMode === 'weekly') {
          cur.setDate(cur.getDate() + 7);
        } else {
          cur.setMonth(cur.getMonth() + 1);
        }
        State.calendarDate = cur;
        renderMonthlyCalendar();
      });
    }

    const btnTodayCal = document.getElementById('btn-today-cal');
    if (btnTodayCal) {
      btnTodayCal.addEventListener('click', () => {
        State.calendarDate = new Date();
        State.selectedCalendarDate = null;
        renderMonthlyCalendar();
        renderHomeView();
      });
    }

    const btnClearDateFilter = document.getElementById('btn-clear-date-filter');
    if (btnClearDateFilter) {
      btnClearDateFilter.addEventListener('click', () => {
        State.selectedCalendarDate = null;
        renderMonthlyCalendar();
        renderHomeView();
      });
    }

    const metricAll = document.getElementById('metric-btn-all');
    if (metricAll) {
      metricAll.addEventListener('click', () => setEventFilter('all'));
    }

    const metricAttended = document.getElementById('metric-btn-attended');
    if (metricAttended) {
      metricAttended.addEventListener('click', () => setEventFilter('attended'));
    }

    const metricUrgent = document.getElementById('metric-btn-urgent');
    if (metricUrgent) {
      metricUrgent.addEventListener('click', () => setEventFilter('urgent'));
    }

    const archiveSearch = document.getElementById('archive-search-input');
    if (archiveSearch) {
      archiveSearch.addEventListener('input', () => renderArchiveView());
    }

    document.querySelectorAll('.archive-category-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.archive-category-pill').forEach(p => {
          p.classList.remove('bg-primary', 'text-white');
          p.classList.add('bg-surface-container', 'text-on-surface-variant');
        });
        pill.classList.add('bg-primary', 'text-white');
        pill.classList.remove('bg-surface-container', 'text-on-surface-variant');
        State.activeMemoCategory = pill.dataset.cat;
        renderArchiveView();
      });
    });

    const btnClosePdf = document.getElementById('btn-close-pdf-viewer');
    if (btnClosePdf) {
      btnClosePdf.addEventListener('click', () => {
        document.getElementById('modal-pdf-viewer').classList.add('hidden');
      });
    }

    const btnGenPdf = document.getElementById('btn-admin-generate-pdf');
    if (btnGenPdf) btnGenPdf.addEventListener('click', openOfficialPdfReportModal);

    const btnClosePdfReport = document.getElementById('btn-close-pdf-report');
    if (btnClosePdfReport) btnClosePdfReport.addEventListener('click', closeOfficialPdfReportModal);

    const btnPrintPdf = document.getElementById('btn-print-pdf-report');
    if (btnPrintPdf) btnPrintPdf.addEventListener('click', () => window.print());

    const btnAdminRsvpTab = document.getElementById('btn-admin-view-rsvp');
    if (btnAdminRsvpTab) btnAdminRsvpTab.addEventListener('click', () => setView('admin-rsvp'));

    const btnAdminDashTab = document.getElementById('btn-admin-view-dashboard');
    if (btnAdminDashTab) btnAdminDashTab.addEventListener('click', () => setView('admin-dashboard'));

    const btnAdminCreateEvent = document.getElementById('btn-admin-create-event');
    if (btnAdminCreateEvent) btnAdminCreateEvent.addEventListener('click', () => setView('admin-events'));

    document.querySelectorAll('.admin-event-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        _adminEventFilter = btn.dataset.filter;
        document.querySelectorAll('.admin-event-filter-btn').forEach(b => {
          const isMatch = b.dataset.filter === _adminEventFilter;
          b.classList.toggle('bg-primary', isMatch);
          b.classList.toggle('text-white', isMatch);
          b.classList.toggle('bg-surface-container', !isMatch);
          b.classList.toggle('text-on-surface-variant', !isMatch);
        });
        renderAdminEventsManagementList();
      });
    });

    const formCreateEvent = document.getElementById('form-create-event');
    if (formCreateEvent) {
      initAdminCreateEvent();
    }

    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) btnLogout.addEventListener('click', () => logout(true));

    const bioSettingToggle = document.getElementById('toggle-bio-setting');
    if (bioSettingToggle) {
      bioSettingToggle.addEventListener('change', async () => {
        const enabled = bioSettingToggle.checked;
        const res = await api('toggleBiometricSetting', { enabled: enabled });
        if (res && res.success) {
          showToast(res.message, 'success');
          if (State.currentUser) State.currentUser.biometricEnabled = enabled;
        }
      });
    }

    try {
      initUploadPdfDropzone();
    } catch(e) {}
  }

  // ==========================================================================
  // 18. BOOTSTRAP APLIKASI
  // ==========================================================================
  window.triggerOtpProcess = handleSendOtpClick;
  window.triggerBiometricScan = triggerBiometricLogin;
  window.handleAuthSubmit = handleVerifyOtpClick;

  function bootApp() {
    try {
      initEvents();
    } catch (e) {
      console.warn('initEvents error:', e);
    }

    try {
      setLanguage(State.lang);
      updateBiometricUI();
    } catch (e) {
      console.warn('UI init error:', e);
    }

    const savedToken = localStorage.getItem('ceu_tok');
    const savedUser = localStorage.getItem('ceu_user');
    if (savedToken && savedUser) {
      try {
        State.token = savedToken;
        State.currentUser = JSON.parse(savedUser);
        loadAppBoot().then(() => {
          if (State.currentUser && State.currentUser.role === 'Admin') {
            setView('admin-dashboard');
          } else {
            setView('home');
          }
        }).catch(() => {
          setView('auth');
        });
        return;
      } catch (e) {
        localStorage.removeItem('ceu_tok');
        localStorage.removeItem('ceu_user');
      }
    }

    setView('auth');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootApp);
  } else {
    bootApp();
  }

  window.CEU_APP = {
    State: State,
    api: api,
    setView: setView,
    setLanguage: setLanguage,
    logout: logout,
    quickLogin: quickLogin,
    showToast: showToast
  };

})();
