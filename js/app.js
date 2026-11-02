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
      emailDomainNotice: 'Hanya domain <strong>.moe.bn</strong>, <strong>.gov.bn</strong>, atau <strong>.edu.bn</strong> dibenarkan.',
      sendOtpBtn: 'Hantar Kod OTP Keselamatan',
      verifyOtpTitle: 'Masukkan Kod OTP 6-Digit',
      verifyOtpDesc: 'Kod pengesahan telah dihantar ke emel anda.',
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
      activeStatus: 'Aktif',
      sessionVerified: 'Sesi Disahkan (30 Hari)',
      district: 'Daerah',
      officialNoticeFooter: 'Sistem Rasmi Kerajaan Brunei Darussalam • Versi 1.0.4',
      
      // Navigasi Bawah
      navHome: 'Utama',
      navRsvp: 'RSVP',
      navArchive: 'Arkib',
      navNotif: 'Hebahan',
      navAdmin: 'Pentadbir',
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
      badgePending: '⚠️ PERLU TINDAKAN RSVP',

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

      // Arkib
      archiveTitle: 'Arkib Dokumen & Memo Rasmi',
      archiveSubtitle: 'Pustaka pekeliling, minit mesyuarat, dan takwim tahunan UPK.',
      searchArchivePlaceholder: 'Cari tajuk memo, minit, atau nombor rujukan...',
      catAll: 'Semua',
      catCirculars: 'Pekeliling',
      catMinutes: 'Minit Mesyuarat',
      catCalendar: 'Takwim Tahunan',
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
      adminDashboard: 'Papan Pemuka Pentadbir UPK',
      adminDashboardSubtitle: 'Analisis kehadiran 4 daerah dan pengurusan rasmi.',
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
      pdfDeptBrunei: 'Jabatan Sekolah-Sekolah Brunei'
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
      emailDomainNotice: 'Only <strong>.moe.bn</strong>, <strong>.gov.bn</strong>, or <strong>.edu.bn</strong> domains are permitted.',
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
      activeStatus: 'Active',
      sessionVerified: 'Verified Session (30 Days)',
      district: 'District',
      officialNoticeFooter: 'Official Government System of Brunei Darussalam • Version 1.0.4',
      
      // Navigasi Bawah
      navHome: 'Home',
      navRsvp: 'RSVP',
      navArchive: 'Archive',
      navNotif: 'Notices',
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
      badgePending: '⚠️ PENDING RSVP ACTION',

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

      // Arkib
      archiveTitle: 'Official Document & Memo Repository',
      archiveSubtitle: 'Library of official circulars, minutes, and CEU annual calendar.',
      searchArchivePlaceholder: 'Search circular title, minutes, or reference number...',
      catAll: 'All',
      catCirculars: 'Circulars',
      catMinutes: 'Meeting Minutes',
      catCalendar: 'Annual Calendar',
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
      adminDashboard: 'CEU Administrator Dashboard',
      adminDashboardSubtitle: '4-district attendance analytics and official administration.',
      adminTableViewBtn: 'Table View',
      totalTeachersKpi: 'Total Counselors',
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
      pdfDeptBrunei: 'Department of Schools, Brunei'
    }
  };

  // ==========================================================================
  // 2. STATE APLIKASI
  // ==========================================================================
  const State = {
    lang: localStorage.getItem('ceu_lang') || 'bm',
    token: localStorage.getItem('ceu_tok') || '',
    currentUser: null,
    currentView: 'auth',
    events: [],
    rsvps: [],
    memos: [],
    notifications: [],
    adminData: null,
    selectedEventForRsvp: null,
    activeEventFilter: 'all',
    activeMemoCategory: 'Semua',
    activeDistrictFilter: 'Semua',
    selectedCalendarDate: null,
    calendarYear: new Date().getFullYear(),
    calendarMonth: new Date().getMonth()
  };

  // ==========================================================================
  // 3. ENJIN REST API & TURBO CACHE (gas-pro-api & gas-scale-turbo)
  // ==========================================================================
  const _inflight = {};
  let _writeEpoch = 0;

  async function api(action, payload, forceLive) {
    const isMock = !window.APP_CONFIG.GAS_URL;

    if (isMock) {
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
        logout();
        showToast(I18N[State.lang].verifyOtpDesc, 'warning');
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
        if (action === 'sendOtp') {
          resolve({ success: true, message: 'Kod OTP dihantar (Mod Demo: 123456)', email: payload.email });
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
          const u = mock.users[1];
          resolve({
            success: true,
            token: 'mock_bio_token_' + Date.now(),
            user: u
          });
        } else if (action === 'boot') {
          resolve({
            success: true,
            data: {
              user: State.currentUser || mock.users[1],
              events: mock.events,
              rsvp: mock.rsvps,
              notifications: mock.notifications,
              unreadNotifCount: 1,
              config: window.APP_CONFIG
            }
          });
        } else if (action === 'getEvents') {
          resolve({ success: true, data: mock.events });
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
          resolve({ success: true, data: mock.memos });
        } else if (action === 'getAdminDashboard') {
          // Kiraan 100% DINAMIK dari data sebenar mock.users & mock.rsvps
          const teachers = (mock.users || []).filter(u => u.role !== 'Admin');
          const totalTeachers = teachers.length;
          const publishedEvents = (mock.events || []).filter(e => (e.status || 'Published').toLowerCase() !== 'draft');
          const requestedEventId = payload && payload.eventId;
          const targetEvent = (requestedEventId && mock.events.find(e => e.event_id === requestedEventId))
            || publishedEvents[0]
            || (mock.events && mock.events[0])
            || null;
          const targetEventId = targetEvent ? targetEvent.event_id : '';

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
                { label: 'Hadir', count: attending, color: '#10B981' },
                { label: 'Mewakilkan', count: representative, color: '#F59E0B' },
                { label: 'Tidak Hadir', count: absent, color: '#EF4444' },
                { label: 'Belum Respon', count: pending, color: '#94A3B8' }
              ],
              districtBreakdown
            }
          });
        } else if (action === 'getAdminRsvpTable') {
          // Senarai baris RSVP dinamik mengikut jawapan sebenar guru bagi acara yang dipilih
          const teachers = (mock.users || []).filter(u => u.role !== 'Admin');
          const publishedEvents = (mock.events || []).filter(e => (e.status || 'Published').toLowerCase() !== 'draft');
          const requestedEventId = payload && payload.eventId;
          const targetEvent = (requestedEventId && mock.events.find(e => e.event_id === requestedEventId))
            || publishedEvents[0]
            || (mock.events && mock.events[0])
            || null;
          const targetEventId = targetEvent ? targetEvent.event_id : '';

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
          const newEvt = {
            event_id: 'EVT-' + Date.now(),
            title_bm: payload.titleBm,
            title_en: payload.titleEn || payload.titleBm,
            event_date: payload.eventDate,
            start_time: payload.startTime,
            end_time: payload.endTime,
            venue: payload.venue,
            meeting_link: payload.meetingLink || '',
            rsvp_deadline: payload.rsvpDeadline,
            status: payload.isDraft ? 'Draft' : 'Published',
            created_by: (State.currentUser && State.currentUser.email) ? State.currentUser.email : 'pegawai.upk@moe.bn',
            target_districts: payload.targetDistricts || ['Semua'],
            target_roles: payload.targetRoles || ['Guru Pendidikan Kerjaya'],
            target_count: payload.targetCount || 42
          };
          if (!mock.events) mock.events = [];
          mock.events.unshift(newEvt);

          // Masukkan hebahan ke notifikasi jika FCM diaktifkan
          if (!payload.isDraft && payload.channels && payload.channels.fcm) {
            const newNotif = {
              notif_id: 'NOTIF-' + Date.now(),
              title_bm: 'Hebahan Program Baharu: ' + payload.titleBm,
              title_en: 'New Event Notice: ' + (payload.titleEn || payload.titleBm),
              content_bm: `Program dijadualkan pada ${payload.eventDate} di ${payload.venue}. Tarikh tutup RSVP: ${(payload.rsvpDeadline || '').replace('T', ' ')}. Sasaran: ${payload.targetCount || 42} guru.`,
              content_en: `Scheduled on ${payload.eventDate} at ${payload.venue}. RSVP Deadline: ${(payload.rsvpDeadline || '').replace('T', ' ')}. Target: ${payload.targetCount || 42} teachers.`,
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
              : `Acara berjaya diterbitkan & disiarkan kepada ${payload.targetCount || 42} orang guru!`,
            data: newEvt
          });
        } else if (action === 'generateAttendancePdf') {
          const targetEventId = payload && payload.eventId;
          const teachers = (mock.users || []).filter(u => u.role !== 'Admin');
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
        if (tabBio) tabBio.click();
        return;
      } catch (e) {
        console.warn('Gagal membaca profil biometrik tempatan:', e);
      }
    }

    // Jika belum ada pendaftaran biometrik pada peranti ini
    if (enrolledBox) enrolledBox.classList.add('hidden');
    if (notEnrolledBox) notEnrolledBox.classList.remove('hidden');

    // Utamakan tab Emel OTP untuk pengguna baharu
    if (tabEmail) tabEmail.click();
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

  async function triggerBiometricLogin() {
    const storedBioToken = localStorage.getItem('ceu_bio_token');
    const storedBioUser = localStorage.getItem('ceu_bio_user');

    if (!storedBioToken || !storedBioUser) {
      showToast(State.lang === 'en' ? 'Please log in with official email OTP first.' : 'Sila log masuk menggunakan emel rasmi dan kod OTP terlebih dahulu.', 'warning');
      document.getElementById('tab-btn-email')?.click();
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

  function setLanguage(lang) {
    State.lang = lang;
    localStorage.setItem('ceu_lang', lang);

    document.querySelectorAll('.lang-btn-bm').forEach(b => {
      b.classList.toggle('bg-tertiary', lang === 'bm');
      b.classList.toggle('text-white', lang === 'bm');
      b.classList.toggle('text-white/70', lang !== 'bm');
    });
    document.querySelectorAll('.lang-btn-en').forEach(b => {
      b.classList.toggle('bg-tertiary', lang === 'en');
      b.classList.toggle('text-white', lang === 'en');
      b.classList.toggle('text-white/70', lang !== 'en');
    });

    // Terapkan semua teks statik & placeholder
    applyTranslations();

    // Re-render paparan aktif
    if (State.currentView === 'home') renderHomeView();
    if (State.currentView === 'archive') renderArchiveView();
    if (State.currentView === 'notif') renderNotifView();
    if (State.currentView === 'admin-dashboard') renderAdminDashboardView();
    if (State.currentView === 'profile') renderProfileView();

    showToast(lang === 'en' ? 'Language switched to English' : 'Bahasa ditukar ke Bahasa Melayu', 'info');
  }

  // ==========================================================================
  // 6. NAVIGASI, ROUTING & UI RENDER
  // ==========================================================================
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
    if (bottomNav) bottomNav.style.display = isAuth ? 'none' : 'flex';
    if (appHeader) appHeader.style.display = isAuth ? 'none' : 'flex';

    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      const tab = btn.dataset.tab;
      const isActive = (tab === viewName) ||
        (tab === 'admin' && viewName.startsWith('admin-'));
      if (isActive) {
        btn.classList.add('text-primary', 'border-t-2', 'border-tertiary');
        btn.classList.remove('text-on-surface-variant');
      } else {
        btn.classList.remove('text-primary', 'border-t-2', 'border-tertiary');
        btn.classList.add('text-on-surface-variant');
      }
    });

    if (viewName === 'auth') updateBiometricUI();
    if (viewName === 'home') renderHomeView();
    if (viewName === 'archive') renderArchiveView();
    if (viewName === 'notif') renderNotifView();
    if (viewName === 'profile') renderProfileView();
    if (viewName === 'admin-dashboard') renderAdminDashboardView();
    if (viewName === 'admin-rsvp') renderAdminRsvpTableView();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ==========================================================================
  // 7. PEMUATAN DATA UTAMA (BOOT)
  // ==========================================================================
  async function loadAppBoot() {
    const res = await api('boot', {});
    if (res && res.success && res.data) {
      State.currentUser = res.data.user || State.currentUser;
      State.events = res.data.events || [];
      State.rsvps = res.data.rsvp || [];
      State.notifications = res.data.notifications || [];

      const nameEl = document.getElementById('header-user-name');
      const districtEl = document.getElementById('header-district-badge');
      if (nameEl) nameEl.textContent = State.currentUser.name;
      if (districtEl) {
        districtEl.textContent = (State.lang === 'en' ? 'District: ' : 'Daerah: ') + State.currentUser.district;
      }

      const adminNavBtn = document.getElementById('nav-btn-admin');
      if (adminNavBtn) {
        adminNavBtn.style.display = (State.currentUser.role === 'Admin') ? 'flex' : 'none';
      }

      applyTranslations();
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
  // INTERACTIVE MONTHLY CALENDAR ENGINE
  // ==========================================================================
  const MONTH_NAMES = {
    bm: ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  };

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

  function renderMonthlyCalendar() {
    const container = document.getElementById('calendar-grid');
    const monthLabel = document.getElementById('calendar-month-label');
    const filterIndicator = document.getElementById('calendar-filter-indicator');
    const filterText = document.getElementById('calendar-filter-text');

    if (!container) return;

    const now = new Date();
    const year = State.calendarYear !== undefined ? State.calendarYear : now.getFullYear();
    const month = (State.calendarMonth !== undefined) ? State.calendarMonth : now.getMonth();
    const monthName = (MONTH_NAMES[State.lang] || MONTH_NAMES.bm)[month];

    if (monthLabel) {
      monthLabel.textContent = `${State.lang === 'en' ? 'Month: ' : 'Bulan '}${monthName} ${year}`;
    }

    const todayDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const publishedEvents = (State.events || []).filter(e => (e.status || 'Published').toLowerCase() !== 'draft');

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
        dayClasses += 'bg-primary text-white shadow-md font-bold scale-105 ring-2 ring-primary/40';
      } else if (isToday) {
        dayClasses += 'bg-primary/10 text-primary font-bold border-2 border-primary/50 hover:bg-primary/20';
      } else if (hasEvents) {
        dayClasses += 'bg-surface-container-lowest text-on-surface font-semibold shadow-sm hover:border-primary/40 hover:bg-surface-container';
      } else {
        dayClasses += 'text-on-surface hover:bg-surface-container-low';
      }

      return `
        <button type="button" data-date="${c.dateStr}" class="${dayClasses}" title="${isToday ? (State.lang === 'en' ? 'Today' : 'Hari Ini') : ''}">
          <span class="font-headline text-xs sm:text-sm leading-none">${c.dayNum}</span>
          ${hasEvents
            ? `<span class="w-1.5 h-1.5 rounded-full mt-1 ${isSelected ? 'bg-white' : 'bg-tertiary'}"></span>`
            : (isToday
                ? `<span class="w-1 h-1 rounded-full mt-1 bg-primary"></span>`
                : '<span class="w-1.5 h-1.5 mt-1 bg-transparent"></span>')}
        </button>
      `;
    }).join('');

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
        renderMonthlyCalendar();
        renderHomeView();
      });
    });
  }

  // ==========================================================================
  // 8. RENDER PAPARAN HOME (TAKWIN GURU)
  // ==========================================================================
  function setEventFilter(filterName) {
    State.activeEventFilter = filterName;
    State.selectedCalendarDate = null; // Buka kunci tarikh kalendar jika pengguna menukar penapis utama

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
    const publishedEvents = (State.events || []).filter(e => (e.status || 'Published').toLowerCase() !== 'draft');
    const totalEventsCount = publishedEvents.length;
    const urgentCount = Math.max(0, totalEventsCount - myAnsweredIds.length);
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
          statusBadge = `<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-label-md font-bold"><span class="material-symbols-outlined text-base">verified</span>${I18N[State.lang].badgeAttending}</span>`;
        } else if (st.includes('wakil')) {
          statusBadge = `<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-md text-label-md font-medium"><span class="material-symbols-outlined text-base text-tertiary">swap_horiz</span>${I18N[State.lang].badgeRep}</span>`;
        } else {
          statusBadge = `<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-error-container text-on-error-container font-label-md text-label-md font-bold">${I18N[State.lang].badgeAbsent}</span>`;
        }
      } else {
        statusBadge = `<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-md text-label-md font-bold shadow-sm"><span class="material-symbols-outlined text-base">priority_high</span>${I18N[State.lang].badgePending}</span>`;
      }

      const title = (State.lang === 'en' && ev.title_en) ? ev.title_en : ev.title_bm;
      return `
        <div class="bg-surface-container-lowest rounded-xl shadow-md p-space-md relative overflow-hidden transition-all border border-outline-variant/30 flex flex-col gap-space-sm mb-space-sm">
          <div class="absolute top-0 left-0 right-0 h-1 ${isPending ? 'bg-tertiary' : 'bg-secondary'}"></div>
          <div class="flex items-start justify-between gap-space-xs pt-1">
            ${statusBadge}
            <span class="font-label-sm text-label-sm text-on-surface-variant font-medium flex items-center gap-1">
              <span class="material-symbols-outlined text-sm text-primary">event</span>
              ${ev.event_date}
            </span>
          </div>
          <div>
            <h2 class="font-headline-sm text-headline-sm font-bold text-on-surface leading-snug">${title}</h2>
            <span class="font-label-sm text-label-sm text-secondary font-medium mt-0.5 block">${ev.summary || 'Jabatan Sekolah-Sekolah • UPK/2026'}</span>
          </div>
          <div class="bg-surface-container-low rounded-lg p-space-xs flex flex-col gap-1.5 text-on-surface">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-base shrink-0">schedule</span>
              <span class="font-body-sm text-body-sm font-semibold">${ev.start_time} - ${ev.end_time}</span>
            </div>
            <div class="flex items-center gap-2 text-on-surface-variant">
              <span class="material-symbols-outlined text-secondary text-base shrink-0">location_on</span>
              <span class="font-body-sm text-body-sm truncate">${ev.venue || 'Dalam Talian'}</span>
            </div>
          </div>
          ${ev.rsvp_deadline && isPending ? `
            <div class="bg-error-container text-on-error-container p-space-xs rounded-lg flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-error text-lg shrink-0">hourglass_top</span>
                <div class="flex flex-col">
                  <span class="font-label-sm text-label-sm font-bold">${I18N[State.lang].deadline}: ${ev.rsvp_deadline.replace('T', ' ')}</span>
                  <span class="font-body-sm text-body-sm opacity-90">${State.lang === 'en' ? 'Action required immediately' : 'Tindakan segera diperlukan'}</span>
                </div>
              </div>
              <span class="material-symbols-outlined text-error text-lg">alarm</span>
            </div>
          ` : ''}
          <div class="flex flex-col sm:flex-row gap-2 pt-1">
            <button class="btn-open-rsvp w-full flex-1 bg-primary text-on-primary py-2.5 px-4 rounded-lg font-label-lg text-label-lg font-semibold flex items-center justify-center gap-2 shadow-sm hover:opacity-95 active:scale-[0.98] transition-transform min-h-[44px]" data-id="${ev.event_id}">
              <span class="material-symbols-outlined text-lg">check_circle</span>
              <span>${userRsvp ? I18N[State.lang].updateRsvpBtn : I18N[State.lang].respondRsvpBtn}</span>
            </button>
            ${ev.meeting_link ? `
              <a href="${ev.meeting_link}" target="_blank" class="w-full sm:w-auto bg-surface-container-low text-primary py-2.5 px-4 rounded-lg font-label-lg text-label-lg font-semibold flex items-center justify-center gap-1.5 hover:bg-surface-container transition-colors min-h-[44px]">
                <span class="material-symbols-outlined text-lg">videocam</span>
                <span>Meet</span>
              </a>
            ` : ''}
            ${(State.currentUser && State.currentUser.role === 'Admin') ? `
              <button type="button" class="btn-delete-event w-full sm:w-auto bg-surface-container-low text-error border border-error/30 py-2.5 px-3.5 rounded-lg font-label-md text-xs font-bold flex items-center justify-center gap-1 hover:bg-error hover:text-white transition-all min-h-[44px] cursor-pointer" data-id="${ev.event_id}" title="Padam Acara">
                <span class="material-symbols-outlined text-base">delete</span>
                <span>Padam</span>
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.btn-open-rsvp').forEach(btn => {
      btn.addEventListener('click', () => {
        openRsvpModal(btn.dataset.id);
      });
    });

    container.querySelectorAll('.btn-delete-event').forEach(btn => {
      btn.addEventListener('click', async () => {
        const eventId = btn.dataset.id;
        const conf = confirm(State.lang === 'en' ? 'Are you sure you want to delete this event? This action cannot be undone.' : 'Adakah anda pasti ingin memadamkan acara ini? Tindakan ini tidak boleh diundur.');
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
    if (metaEl) metaEl.textContent = `${ev.event_date} • ${ev.start_time} • ${ev.venue}`;

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
    if (!docs.length) {
      const res = await api('getMemos', {});
      if (res && res.success && res.data) {
        State.memos = res.data;
        docs = res.data;
      }
    }

    const query = (document.getElementById('archive-search-input')?.value || '').toLowerCase();
    let filtered = docs;
    if (State.activeMemoCategory !== 'Semua') {
      filtered = filtered.filter(d => (d.category || '').toLowerCase() === State.activeMemoCategory.toLowerCase());
    }
    if (query) {
      filtered = filtered.filter(d =>
        (d.title_bm || '').toLowerCase().includes(query) ||
        (d.title_en || '').toLowerCase().includes(query) ||
        (d.ref_no || '').toLowerCase().includes(query)
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

    container.innerHTML = filtered.map(d => {
      const title = (State.lang === 'en' && d.title_en) ? d.title_en : d.title_bm;
      return `
        <div class="bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-outline-variant/40 flex flex-col gap-2.5">
          <div class="flex items-start justify-between gap-3">
            <div class="w-10 h-10 rounded-xl bg-[#FEE2E2] text-[#B91C1C] flex items-center justify-center shrink-0 font-bold font-headline text-xs">
              PDF
            </div>
            <div class="flex-1 min-w-0">
              <span class="bg-surface-container-high text-on-surface-variant font-headline text-[10px] px-2 py-0.5 rounded-full font-bold">
                ${d.category}
              </span>
              <h4 class="font-headline text-xs font-bold text-on-surface mt-1 leading-snug">${title}</h4>
              <p class="font-body text-[11px] text-on-surface-variant mt-0.5">${d.ref_no || ''} • ${d.publish_date} • ${d.size || 'PDF'}</p>
            </div>
          </div>
          <div class="flex items-center gap-2 pt-2 border-t border-outline-variant/30">
            <button class="btn-preview-pdf flex-1 h-9 rounded-xl bg-surface-container text-primary font-headline text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition-transform" data-url="${d.file_view_url}">
              <span class="material-symbols-outlined text-[18px]">visibility</span>
              <span>${I18N[State.lang].previewDocBtn}</span>
            </button>
            <a href="${d.file_view_url}" target="_blank" download class="flex-1 h-9 rounded-xl bg-primary text-white font-headline text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition-transform">
              <span class="material-symbols-outlined text-[18px]">download</span>
              <span>${I18N[State.lang].downloadBtn}</span>
            </a>
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.btn-preview-pdf').forEach(btn => {
      btn.addEventListener('click', () => {
        openPdfViewerModal(btn.dataset.url);
      });
    });
  }

  function openPdfViewerModal(url) {
    const modal = document.getElementById('modal-pdf-viewer');
    const iframe = document.getElementById('pdf-viewer-frame');
    if (modal && iframe) {
      iframe.src = url || 'https://drive.google.com/viewerng/viewer?embedded=true&url=https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
      modal.classList.remove('hidden');
    }
  }

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
        roleEl.textContent = State.lang === 'en' ? 'CEU Administrative Officer' : 'Pegawai Pentadbir UPK';
      } else {
        roleEl.textContent = State.lang === 'en' ? 'Career Guidance Counselor' : 'Guru Pendidikan Kerjaya';
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
    const publishedEvents = (State.events || []).filter(e => (e.status || 'Published').toLowerCase() !== 'draft');
    if (!_adminSelectedEventId && publishedEvents.length > 0) {
      _adminSelectedEventId = publishedEvents[0].event_id;
    }

    const res = await api('getAdminDashboard', { eventId: _adminSelectedEventId });
    if (!res || !res.success || !res.data) return;
    State.adminData = res.data;
    const data = res.data;

    const eventSelect = document.getElementById('admin-dashboard-event-select');
    if (eventSelect && publishedEvents.length) {
      eventSelect.innerHTML = publishedEvents.map(e => `
        <option value="${e.event_id}" ${e.event_id === _adminSelectedEventId ? 'selected' : ''}>
          ${e.event_date} — ${e.title_bm}
        </option>
      `).join('');

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
            <div style="width: ${hadirPct}%" class="bg-[#10B981] h-full" title="Hadir: ${d.hadir}"></div>
            <div style="width: ${wakilPct}%" class="bg-[#F59E0B] h-full" title="Wakil: ${d.wakil}"></div>
            <div style="width: ${tidakPct}%" class="bg-[#EF4444] h-full" title="Tidak Hadir: ${d.tidakHadir}"></div>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = list;
  }

  // ==========================================================================
  // 13B. PENGURUSAN ACARA & DRAF PENTADBIR (SENARAI, TERBITKAN DRAF & PADAM)
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
                ${ev.event_date}
              </span>
              <span class="text-[11px] text-on-surface-variant font-medium flex items-center gap-1">
                <span class="material-symbols-outlined text-xs text-secondary">schedule</span>
                ${ev.start_time || '08:30'}
              </span>
            </div>
            <h4 class="font-headline text-xs sm:text-sm font-bold text-on-surface truncate">${ev.title_bm}</h4>
            <p class="text-[11px] text-on-surface-variant truncate mt-0.5">
              📍 ${ev.venue || 'Dalam Talian'} • Sasaran: ${ev.target_count || 42} pegawai
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
            <button type="button" class="btn-delete-event px-3 py-1.5 rounded-lg border border-error/40 text-error hover:bg-error hover:text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer" data-id="${ev.event_id}">
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

    container.querySelectorAll('.btn-delete-event').forEach(btn => {
      btn.addEventListener('click', async () => {
        const eventId = btn.dataset.id;
        const conf = confirm(State.lang === 'en' ? 'Are you sure you want to delete this event? This action cannot be undone.' : 'Adakah anda pasti ingin memadamkan acara ini? Tindakan ini tidak boleh diundur.');
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
  // 14. JADUAL RSVP PENTADBIR & PENJANAAN PDF
  // ==========================================================================
  let _adminRsvpStatusFilter = 'all'; // 'all' | 'hadir' | 'wakil' | 'tidakhadir' | 'belum'
  let _adminRsvpSearchQuery = '';

  async function renderAdminRsvpTableView() {
    const tableBody = document.getElementById('admin-rsvp-table-body');
    if (!tableBody) return;

    const publishedEvents = (State.events || []).filter(e => (e.status || 'Published').toLowerCase() !== 'draft');
    if (!_adminSelectedEventId && publishedEvents.length > 0) {
      _adminSelectedEventId = publishedEvents[0].event_id;
    }

    const eventSelect = document.getElementById('admin-rsvp-event-select');
    if (eventSelect && publishedEvents.length) {
      eventSelect.innerHTML = publishedEvents.map(e => `
        <option value="${e.event_id}" ${e.event_id === _adminSelectedEventId ? 'selected' : ''}>
          ${e.event_date} — ${e.title_bm}
        </option>
      `).join('');

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
    const emailInput = document.getElementById('auth-email-input');
    const email = (emailInput?.value || '').trim();

    if (!email) {
      showToast(State.lang === 'en' ? 'Please enter your official email address.' : 'Sila masukkan alamat emel rasmi anda.', 'warning');
      return;
    }
    const isDomainValid = window.APP_CONFIG.OFFICIAL_DOMAINS.some(d => email.toLowerCase().endsWith(d));
    if (!isDomainValid) {
      showToast(I18N[State.lang].emailDomainNotice, 'error');
      return;
    }

    showToast((State.lang === 'en' ? 'Sending OTP to ' : 'Menghantar kod OTP ke ') + email + '...', 'info');
    const res = await api('sendOtp', { email: email });
    if (res && res.success) {
      showToast(res.message, 'success');
      document.getElementById('step-email-input').classList.add('hidden');
      document.getElementById('step-otp-input').classList.remove('hidden');
      document.getElementById('otp-sent-email-label').textContent = email;
      startOtpCountdown();
    } else {
      showToast((res && res.message) || 'Gagal menghantar kod OTP.', 'error');
    }
  }

  let otpTimerInterval = null;
  function startOtpCountdown() {
    let seconds = 600;
    const timerEl = document.getElementById('otp-timer-display');
    if (otpTimerInterval) clearInterval(otpTimerInterval);

    otpTimerInterval = setInterval(() => {
      seconds--;
      if (seconds <= 0) {
        clearInterval(otpTimerInterval);
        if (timerEl) timerEl.textContent = '00:00 (Expired)';
        return;
      }
      const m = String(Math.floor(seconds / 60)).padStart(2, '0');
      const s = String(seconds % 60).padStart(2, '0');
      if (timerEl) timerEl.textContent = `${m}:${s}`;
    }, 1000);
  }

  async function handleVerifyOtpClick() {
    const email = document.getElementById('auth-email-input').value.trim();
    let otp = '';
    document.querySelectorAll('.otp-digit-input').forEach(inp => otp += inp.value.trim());

    if (otp.length < 6) {
      showToast(State.lang === 'en' ? 'Please complete all 6 OTP digits.' : 'Sila lengkapkan kesemua 6-digit kod OTP.', 'warning');
      return;
    }

    showToast(State.lang === 'en' ? 'Verifying OTP code...' : 'Mengesahkan kod OTP...', 'info');
    const res = await api('verifyOtp', { email: email, otp: otp, device: navigator.userAgent });
    if (res && res.success) {
      State.token = res.token;
      State.currentUser = res.user;
      localStorage.setItem('ceu_tok', res.token);
      localStorage.setItem('ceu_user', JSON.stringify(res.user));

      // Simpan kelayakan untuk log masuk pantas biometrik pada pelancaran berikutnya
      localStorage.setItem('ceu_bio_token', res.token);
      localStorage.setItem('ceu_bio_user', JSON.stringify(res.user));
      updateBiometricUI();

      showToast((State.lang === 'en' ? 'Login successful! Welcome ' : 'Log masuk berjaya! Selamat datang ') + res.user.name, 'success');
      loadAppBoot();
    } else {
      showToast((res && res.message) || 'Kod OTP tidak sah.', 'error');
    }
  }

  function logout() {
    State.token = '';
    State.currentUser = null;
    localStorage.removeItem('ceu_tok');
    localStorage.removeItem('ceu_user');
    setView('auth');
    showToast(State.lang === 'en' ? 'You have successfully logged out.' : 'Anda telah berjaya log keluar.', 'info');
  }

  // ==========================================================================
  // 16. TOAST NOTIFICATION HELPER
  // ==========================================================================
  function showToast(message, type) {
    type = type || 'info';
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
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
    }, 3800);
  }

  // ==========================================================================
  // 16B. PENGAWAL MODUL BINA & TERBITKAN ACARA RASMI (STITCH INTEGRATION)
  // ==========================================================================
  function initAdminCreateEvent() {
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

    if (inputStartTime && previewTime) {
      inputStartTime.addEventListener('change', e => {
        previewTime.textContent = e.target.value ? (e.target.value + ' PAGI') : '08:30 PAGI';
      });
    }

    // 4. Lokasi Boleh Dicari & Cip Pantas
    if (inputVenue && previewVenue) {
      inputVenue.addEventListener('input', e => {
        previewVenue.textContent = e.target.value.trim() || 'Lokasi Acara';
      });
    }

    if (btnClearVenue && inputVenue) {
      btnClearVenue.addEventListener('click', () => {
        inputVenue.value = '';
        inputVenue.focus();
        if (previewVenue) previewVenue.textContent = 'Lokasi Acara';
      });
    }

    venueQuickChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const v = chip.dataset.venue;
        if (inputVenue && v) {
          inputVenue.value = v;
          if (previewVenue) previewVenue.textContent = v;
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

    // 7. Mod Sasaran: Kumpulan/Daerah ATAU Individu Pegawai
    let currentTargetMode = 'group'; // 'group' | 'individual'
    const btnModeGroup = document.getElementById('btn-target-mode-group');
    const btnModeIndividual = document.getElementById('btn-target-mode-individual');
    const containerTargetGroup = document.getElementById('container-target-group');
    const containerTargetIndividual = document.getElementById('container-target-individual');

    function setTargetMode(mode) {
      currentTargetMode = mode;
      const isGrp = mode === 'group';

      if (btnModeGroup) {
        btnModeGroup.classList.toggle('bg-primary', isGrp);
        btnModeGroup.classList.toggle('text-white', isGrp);
        btnModeGroup.classList.toggle('text-on-surface-variant', !isGrp);
      }
      if (btnModeIndividual) {
        btnModeIndividual.classList.toggle('bg-primary', !isGrp);
        btnModeIndividual.classList.toggle('text-white', !isGrp);
        btnModeIndividual.classList.toggle('text-on-surface-variant', isGrp);
      }

      if (containerTargetGroup) containerTargetGroup.classList.toggle('hidden', !isGrp);
      if (containerTargetIndividual) containerTargetIndividual.classList.toggle('hidden', isGrp);

      calculateTargetRecipients();
    }

    if (btnModeGroup) btnModeGroup.addEventListener('click', () => setTargetMode('group'));
    if (btnModeIndividual) btnModeIndividual.addEventListener('click', () => setTargetMode('individual'));

    // 8. Sasaran Mengikut Daerah (Mod Kumpulan)
    const checkAllDistricts = document.getElementById('check-all-districts');
    const btnToggleAll = document.getElementById('btn-toggle-all-districts');
    const districtChecks = document.querySelectorAll('.district-check');
    const targetSchoolBadge = document.getElementById('target-school-count-badge');
    const fcmTargetCount = document.getElementById('fcm-target-count');

    // 4 Kumpulan Penerima Sahaja
    const roleCounselors = document.getElementById('role-counselors'); // Guru Pendidikan Kerjaya
    const rolePrincipals = document.getElementById('role-principals'); // Pengetua
    const roleDeputyPrincipals = document.getElementById('role-deputy-principals'); // Timbalan Pengetua
    const roleSuperintendents = document.getElementById('role-superintendents'); // Superintenden 1 hingga 3
    const roleChecks = document.querySelectorAll('.role-recipient-check');

    // 9. Senarai Individu Pegawai (Mod Individu)
    const listIndividualOfficers = document.getElementById('list-individual-officers');
    const searchIndividualInput = document.getElementById('search-individual-input');
    const individualSelectedBadge = document.getElementById('individual-selected-badge');
    const btnSelectAllIndividuals = document.getElementById('btn-select-all-filtered-individuals');
    const btnClearAllIndividuals = document.getElementById('btn-clear-all-individuals');

    function renderIndividualOfficers(filterText = '') {
      if (!listIndividualOfficers) return;
      const allUsers = (window.MOCK_DATA && window.MOCK_DATA.users) || [];
      const query = filterText.toLowerCase().trim();

      const filtered = allUsers.filter(u => {
        if (!query) return true;
        const str = `${u.name || ''} ${u.school || ''} ${u.district || ''} ${u.roleGroup || u.role || ''}`.toLowerCase();
        return str.includes(query);
      });

      if (!filtered.length) {
        listIndividualOfficers.innerHTML = `
          <div class="p-4 text-center text-xs text-on-surface-variant font-medium">
            Tiada pegawai dijumpai untuk carian "${filterText}".
          </div>
        `;
        return;
      }

      listIndividualOfficers.innerHTML = filtered.map((u, idx) => {
        const id = 'ind-user-' + idx;
        const initial = (u.name || 'G').charAt(0);
        const groupLabel = u.roleGroup || (u.role === 'Admin' ? 'Pegawai UPK' : 'Guru Pendidikan Kerjaya');
        
        return `
          <label class="flex items-center gap-2.5 p-2 rounded-lg hover:bg-surface-container cursor-pointer transition-colors">
            <input type="checkbox" class="individual-officer-check accent-primary w-4 h-4 shrink-0" data-email="${u.email}" data-name="${u.name}" data-district="${u.district || 'Brunei-Muara'}" data-role="${groupLabel}"/>
            <div class="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
              ${initial}
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-xs font-bold text-on-surface truncate">${u.name}</p>
              <p class="text-[10px] text-on-surface-variant truncate">${groupLabel} • ${u.school || u.district}</p>
            </div>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-semibold shrink-0">
              ${u.district || 'Daerah'}
            </span>
          </label>
        `;
      }).join('');

      listIndividualOfficers.querySelectorAll('.individual-officer-check').forEach(ck => {
        ck.addEventListener('change', calculateTargetRecipients);
      });
    }

    renderIndividualOfficers();

    if (searchIndividualInput) {
      searchIndividualInput.addEventListener('input', e => {
        renderIndividualOfficers(e.target.value);
      });
    }

    if (btnSelectAllIndividuals) {
      btnSelectAllIndividuals.addEventListener('click', () => {
        if (!listIndividualOfficers) return;
        listIndividualOfficers.querySelectorAll('.individual-officer-check').forEach(ck => {
          ck.checked = true;
        });
        calculateTargetRecipients();
      });
    }

    if (btnClearAllIndividuals) {
      btnClearAllIndividuals.addEventListener('click', () => {
        if (!listIndividualOfficers) return;
        listIndividualOfficers.querySelectorAll('.individual-officer-check').forEach(ck => {
          ck.checked = false;
        });
        calculateTargetRecipients();
      });
    }

    // 10. Kiraan Jumlah Sasaran (Mengikut Mod)
    function calculateTargetRecipients() {
      let finalCount = 0;
      let targetSummary = '';

      if (currentTargetMode === 'group') {
        let totalSchools = 0;
        let checkedDistricts = [];
        districtChecks.forEach(ch => {
          if (ch.checked) {
            totalSchools += parseInt(ch.dataset.count, 10) || 0;
            checkedDistricts.push(ch.dataset.district);
          }
        });

        // Kiraan peranan terpilih
        let roleCount = 0;
        if (roleCounselors && roleCounselors.checked) roleCount += totalSchools;
        if (rolePrincipals && rolePrincipals.checked) roleCount += totalSchools;
        if (roleDeputyPrincipals && roleDeputyPrincipals.checked) roleCount += totalSchools;
        if (roleSuperintendents && roleSuperintendents.checked) roleCount += 3; // Superintenden 1 hingga 3

        finalCount = roleCount || totalSchools;
        targetSummary = `${totalSchools} Sekolah (${finalCount} Pegawai)`;

        if (checkAllDistricts) {
          checkAllDistricts.checked = (checkedDistricts.length === districtChecks.length);
        }
        if (btnToggleAll) {
          btnToggleAll.textContent = (checkedDistricts.length === 0) ? 'Pilih Semua' : 'Nyahpilih Semua';
        }
      } else {
        // Mod Individu
        const checkedInds = document.querySelectorAll('.individual-officer-check:checked');
        finalCount = checkedInds.length;
        targetSummary = `${finalCount} Pegawai Dipilih`;

        if (individualSelectedBadge) {
          individualSelectedBadge.textContent = `${finalCount} Dipilih`;
        }
      }

      if (targetSchoolBadge) targetSchoolBadge.textContent = targetSummary;
      if (fcmTargetCount) fcmTargetCount.textContent = finalCount;

      return { finalCount, currentTargetMode };
    }

    if (checkAllDistricts) {
      checkAllDistricts.addEventListener('change', () => {
        const isChecked = checkAllDistricts.checked;
        districtChecks.forEach(ch => { ch.checked = isChecked; });
        calculateTargetRecipients();
      });
    }

    if (btnToggleAll) {
      btnToggleAll.addEventListener('click', () => {
        const anyChecked = Array.from(districtChecks).some(c => c.checked);
        const newState = !anyChecked;
        districtChecks.forEach(ch => { ch.checked = newState; });
        if (checkAllDistricts) checkAllDistricts.checked = newState;
        calculateTargetRecipients();
      });
    }

    districtChecks.forEach(ch => ch.addEventListener('change', calculateTargetRecipients));
    roleChecks.forEach(ch => ch.addEventListener('change', calculateTargetRecipients));

    // 11. Simpan Draf Acara
    const btnSaveDraft = document.getElementById('btn-save-draft');
    if (btnSaveDraft) {
      btnSaveDraft.addEventListener('click', async () => {
        const titleBm = inputTitleBm ? inputTitleBm.value.trim() : 'Draf Acara Baharu';
        let category = selectCategory ? selectCategory.value : 'Mesyuarat';
        if (category === 'Lain-lain' && inputCategoryCustom && inputCategoryCustom.value.trim()) {
          category = inputCategoryCustom.value.trim();
        }

        const date = inputDate ? inputDate.value : '';
        const startTime = inputStartTime ? inputStartTime.value : '08:30';
        const endTime = inputEndTime ? inputEndTime.value : '12:00';
        const venue = inputVenue ? inputVenue.value.trim() : '';
        const deadline = inputDeadline ? inputDeadline.value : '';
        const { finalCount } = calculateTargetRecipients();

        showToast(State.lang === 'en' ? 'Saving event draft...' : 'Menyimpan draf acara...', 'info');
        const res = await api('saveEvent', {
          isDraft: true,
          titleBm,
          titleEn: titleBm,
          category,
          eventDate: date,
          startTime,
          endTime,
          venue,
          rsvpDeadline: deadline,
          targetCount: finalCount
        });

        if (res && res.success) {
          showToast(res.message, 'success');
          await loadAppBoot();
          setView('admin-dashboard');
        }
      });
    }

    // 12. Terbit & Siar FCM Form Submit
    const formCreateEvent = document.getElementById('form-create-event');
    const btnBroadcast = document.getElementById('btn-broadcast');

    if (formCreateEvent) {
      formCreateEvent.addEventListener('submit', async e => {
        e.preventDefault();
        const titleBm = inputTitleBm ? inputTitleBm.value.trim() : '';
        
        let category = selectCategory ? selectCategory.value : 'Mesyuarat';
        if (category === 'Lain-lain' && inputCategoryCustom && inputCategoryCustom.value.trim()) {
          category = inputCategoryCustom.value.trim();
        }

        const date = inputDate ? inputDate.value : '';
        const startTime = inputStartTime ? inputStartTime.value : '';
        const endTime = inputEndTime ? inputEndTime.value : '';
        const venue = inputVenue ? inputVenue.value.trim() : '';
        const meetLink = inputMeetLink ? inputMeetLink.value.trim() : '';
        const deadline = inputDeadline ? inputDeadline.value : '';
        const driveUrl = inputDriveUrl ? inputDriveUrl.value.trim() : '';

        const channelFcm = document.getElementById('channel-fcm') ? document.getElementById('channel-fcm').checked : true;
        const channelEmail = document.getElementById('channel-email') ? document.getElementById('channel-email').checked : true;
        const channelBanner = document.getElementById('channel-banner') ? document.getElementById('channel-banner').checked : true;

        const { finalCount, currentTargetMode } = calculateTargetRecipients();

        // Kumpulkan senarai sasaran rasmi
        let targetRolesList = [];
        let individualEmails = [];

        if (currentTargetMode === 'group') {
          if (roleCounselors && roleCounselors.checked) targetRolesList.push('Guru Pendidikan Kerjaya');
          if (rolePrincipals && rolePrincipals.checked) targetRolesList.push('Pengetua');
          if (roleDeputyPrincipals && roleDeputyPrincipals.checked) targetRolesList.push('Timbalan Pengetua');
          if (roleSuperintendents && roleSuperintendents.checked) targetRolesList.push('Superintenden 1 hingga 3');
        } else {
          document.querySelectorAll('.individual-officer-check:checked').forEach(ck => {
            individualEmails.push(ck.dataset.email);
          });
        }

        if (!titleBm || !date) {
          showToast('Sila isikan maklumat tajuk dan tarikh acara.', 'error');
          return;
        }

        if (btnBroadcast) {
          btnBroadcast.disabled = true;
          btnBroadcast.innerHTML = `<span class="material-symbols-outlined text-[18px] animate-spin">progress_activity</span><span>Menghantar FCM...</span>`;
        }

        const res = await api('saveEvent', {
          isDraft: false,
          titleBm,
          titleEn: titleBm,
          category,
          eventDate: date,
          startTime: startTime + ' PAGI',
          endTime: endTime + ' TGH HARI',
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
          if (btnBroadcast) {
            btnBroadcast.innerHTML = `<span class="material-symbols-outlined text-[18px]">check_circle</span><span>Berjaya Disiarkan!</span>`;
            btnBroadcast.classList.remove('bg-primary');
            btnBroadcast.classList.add('bg-secondary');
          }
          showToast(res.message, 'success');
          State.adminData = null;
          await loadAppBoot();
          setTimeout(() => {
            setView('admin-dashboard');
            if (btnBroadcast) {
              btnBroadcast.innerHTML = `<span class="material-symbols-outlined text-[18px]">send</span><span>Terbit &amp; Siar FCM</span>`;
              btnBroadcast.classList.add('bg-primary');
              btnBroadcast.classList.remove('bg-secondary');
              btnBroadcast.disabled = false;
            }
          }, 1200);
        } else {
          showToast((res && res.message) || 'Gagal menerbitkan acara.', 'error');
          if (btnBroadcast) {
            btnBroadcast.disabled = false;
            btnBroadcast.innerHTML = `<span class="material-symbols-outlined text-[18px]">send</span><span>Terbit &amp; Siar FCM</span>`;
          }
        }
      });
    }
  }

  // ==========================================================================
  // 17. PEMASANGAN EVENT LISTENERS (INIT)
  // ==========================================================================
  function initEvents() {
    document.querySelectorAll('.lang-btn-bm').forEach(b => b.addEventListener('click', () => setLanguage('bm')));
    document.querySelectorAll('.lang-btn-en').forEach(b => b.addEventListener('click', () => setLanguage('en')));

    const tabEmail = document.getElementById('tab-btn-email');
    const tabBio = document.getElementById('tab-btn-biometric');
    const viewEmail = document.getElementById('view-email');
    const viewBio = document.getElementById('view-biometric');

    if (tabEmail && tabBio && viewEmail && viewBio) {
      tabEmail.addEventListener('click', () => {
        tabEmail.classList.add('bg-surface-container-lowest', 'text-primary', 'shadow-sm');
        tabEmail.classList.remove('text-on-surface-variant');
        tabBio.classList.remove('bg-surface-container-lowest', 'text-primary', 'shadow-sm');
        tabBio.classList.add('text-on-surface-variant');
        viewEmail.classList.remove('hidden');
        viewBio.classList.add('hidden');
      });

      tabBio.addEventListener('click', () => {
        tabBio.classList.add('bg-surface-container-lowest', 'text-primary', 'shadow-sm');
        tabBio.classList.remove('text-on-surface-variant');
        tabEmail.classList.remove('bg-surface-container-lowest', 'text-primary', 'shadow-sm');
        tabEmail.classList.add('text-on-surface-variant');
        viewBio.classList.remove('hidden');
        viewEmail.classList.add('hidden');
      });
    }

    const bioTriggerBtn = document.getElementById('bio-trigger-btn');
    if (bioTriggerBtn) {
      bioTriggerBtn.addEventListener('click', triggerBiometricLogin);
    }

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

    const btnSendOtp = document.getElementById('btn-send-otp');
    if (btnSendOtp) btnSendOtp.addEventListener('click', handleSendOtpClick);

    const btnVerifyOtp = document.getElementById('btn-verify-otp');
    if (btnVerifyOtp) btnVerifyOtp.addEventListener('click', handleVerifyOtpClick);

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
        if (tab === 'admin') setView('admin-dashboard');
        else setView(tab);
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

    const btnPrevCal = document.getElementById('btn-prev-cal');
    if (btnPrevCal) {
      btnPrevCal.addEventListener('click', () => {
        State.calendarMonth--;
        if (State.calendarMonth < 0) {
          State.calendarMonth = 11;
          State.calendarYear--;
        }
        renderMonthlyCalendar();
      });
    }

    const btnNextCal = document.getElementById('btn-next-cal');
    if (btnNextCal) {
      btnNextCal.addEventListener('click', () => {
        State.calendarMonth++;
        if (State.calendarMonth > 11) {
          State.calendarMonth = 0;
          State.calendarYear++;
        }
        renderMonthlyCalendar();
      });
    }

    const btnTodayCal = document.getElementById('btn-today-cal');
    if (btnTodayCal) {
      btnTodayCal.addEventListener('click', () => {
        const today = new Date();
        State.calendarYear = today.getFullYear();
        State.calendarMonth = today.getMonth();
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
    if (btnLogout) btnLogout.addEventListener('click', logout);

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
  }

  // ==========================================================================
  // 18. BOOTSTRAP APLIKASI
  // ==========================================================================
  window.addEventListener('DOMContentLoaded', () => {
    initEvents();
    // Terapkan bahasa yang disimpan (atau default bm)
    setLanguage(State.lang);
    updateBiometricUI();

    if (State.token) {
      const savedUser = localStorage.getItem('ceu_user');
      if (savedUser) {
        try { State.currentUser = JSON.parse(savedUser); } catch(e) {}
      }
      loadAppBoot();
    } else {
      setView('auth');
    }
  });

  window.CEU_APP = {
    State: State,
    api: api,
    setView: setView,
    setLanguage: setLanguage,
    logout: logout,
    showToast: showToast
  };

})();
