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
      calendarTitle: 'Takwim Mac 2026',
      calendarWeek: 'Minggu Ke-2',
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
      calendarTitle: 'March 2026 Calendar',
      calendarWeek: 'Week 2',
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
    activeDistrictFilter: 'Semua'
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
          resolve({ success: true, message: 'RSVP berjaya dihantar.' });
        } else if (action === 'getMemos') {
          resolve({ success: true, data: mock.memos });
        } else if (action === 'getAdminDashboard') {
          resolve({
            success: true,
            data: {
              kpi: {
                totalTeachers: 42,
                rsvpRate: 88,
                attending: 30,
                representative: 4,
                absent: 3,
                pending: 5
              },
              latestEvent: mock.events[0],
              donutData: [
                { label: 'Hadir', count: 30, color: '#10B981' },
                { label: 'Mewakilkan', count: 4, color: '#F59E0B' },
                { label: 'Tidak Hadir', count: 3, color: '#EF4444' },
                { label: 'Belum Respon', count: 5, color: '#94A3B8' }
              ],
              districtBreakdown: {
                'Brunei-Muara': { total: 18, hadir: 15, wakil: 2, tidakHadir: 1 },
                'Tutong': { total: 7, hadir: 6, wakil: 1, tidakHadir: 0 },
                'Belait': { total: 8, hadir: 6, wakil: 1, tidakHadir: 1 },
                'Temburong': { total: 4, hadir: 3, wakil: 0, tidakHadir: 1 }
              }
            }
          });
        } else if (action === 'getAdminRsvpTable') {
          const rows = mock.users.map((u, i) => ({
            no: i + 1,
            email: u.email,
            name: u.name,
            school: u.school,
            district: u.district,
            phone: u.phone,
            status: i === 0 ? 'Hadir' : (i === 1 ? 'Mewakilkan' : (i === 2 ? 'Tidak Hadir' : 'Hadir')),
            repName: i === 1 ? 'Cikgu Noraini' : '',
            absenceReason: i === 2 ? 'Tugas Rasmi Sukan' : '',
            submittedAt: '2026-03-11 09:30'
          }));
          resolve({ success: true, data: rows });
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
      setView(State.currentUser.role === 'Admin' ? 'admin-dashboard' : 'home');
    } else {
      setView('auth');
    }
  }

  // ==========================================================================
  // 8. RENDER PAPARAN HOME (TAKWIN GURU)
  // ==========================================================================
  function renderHomeView() {
    const container = document.getElementById('events-card-list');
    if (!container) return;

    let filtered = State.events;
    if (State.activeEventFilter === 'urgent') {
      const answeredIds = State.rsvps.map(r => r.event_id);
      filtered = State.events.filter(e => !answeredIds.includes(e.event_id));
    }

    if (!filtered.length) {
      container.innerHTML = `
        <div class="bg-surface-container-low rounded-2xl p-8 text-center text-on-surface-variant my-4">
          <span class="material-symbols-outlined text-[48px] text-primary/40 mb-2">event_available</span>
          <p class="font-headline text-xs font-semibold">${I18N[State.lang].noEventsFound}</p>
        </div>
      `;
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
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.btn-open-rsvp').forEach(btn => {
      btn.addEventListener('click', () => {
        openRsvpModal(btn.dataset.id);
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
      const existingIdx = State.rsvps.findIndex(r => r.event_id === ev.event_id);
      const newEntry = {
        event_id: ev.event_id,
        response_status: status,
        rep_name: repName,
        rep_phone: repPhone,
        absence_reason: absenceReason
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
  async function renderAdminDashboardView() {
    let data = State.adminData;
    if (!data) {
      const res = await api('getAdminDashboard', {});
      if (res && res.success && res.data) {
        State.adminData = res.data;
        data = res.data;
      }
    }
    if (!data) return;

    const kpi = data.kpi || {};
    document.getElementById('kpi-total-teachers').textContent = kpi.totalTeachers || 0;
    document.getElementById('kpi-rsvp-rate').textContent = (kpi.rsvpRate || 0) + '%';
    document.getElementById('kpi-attending').textContent = kpi.attending || 0;
    document.getElementById('kpi-rep-absent').textContent = `${kpi.representative || 0} / ${kpi.absent || 0}`;

    renderDonutChart(data.donutData || []);
    renderDistrictBarChart(data.districtBreakdown || {});
  }

  function renderDonutChart(donutData) {
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

    svg.innerHTML = `
      ${paths}
      <circle cx="${cx}" cy="${cy}" r="36" fill="#ffffff" />
      <text x="${cx}" y="${cy - 2}" text-anchor="middle" font-size="14" font-weight="700" fill="#0F172A">
        ${State.adminData?.kpi?.rsvpRate || 0}%
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
  // 14. JADUAL RSVP PENTADBIR & PENJANAAN PDF
  // ==========================================================================
  async function renderAdminRsvpTableView() {
    const tableBody = document.getElementById('admin-rsvp-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = `<tr><td colspan="7" class="p-6 text-center text-on-surface-variant font-headline text-xs">${State.lang === 'en' ? 'Loading attendance data across 4 districts...' : 'Memuatkan data kehadiran seluruh daerah...'}</td></tr>`;

    const res = await api('getAdminRsvpTable', {});
    if (!res || !res.success || !res.data) {
      tableBody.innerHTML = `<tr><td colspan="7" class="p-6 text-center text-error font-headline text-xs">${State.lang === 'en' ? 'Failed to load attendance records.' : 'Gagal memuatkan data.'}</td></tr>`;
      return;
    }

    const rows = res.data;
    tableBody.innerHTML = rows.map((r, i) => {
      let badge = '';
      if (r.status.includes('Hadir') && !r.status.includes('Tidak')) {
        badge = `<span class="bg-[#DCFCE7] text-[#15803D] px-2 py-0.5 rounded-full font-headline text-[10px] font-bold">${State.lang === 'en' ? 'ATTENDING' : 'HADIR'}</span>`;
      } else if (r.status.includes('Wakil')) {
        badge = `<span class="bg-[#FEF3C7] text-[#B45309] px-2 py-0.5 rounded-full font-headline text-[10px] font-bold">${State.lang === 'en' ? 'REP: ' : 'WAKIL: '} ${r.repName || '-'}</span>`;
      } else if (r.status.includes('Tidak')) {
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
    const res = await api('generateAttendancePdf', {});
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
        document.querySelectorAll('.event-filter-pill').forEach(p => {
          p.classList.remove('bg-primary', 'text-white');
          p.classList.add('bg-surface-container', 'text-on-surface-variant');
        });
        pill.classList.add('bg-primary', 'text-white');
        pill.classList.remove('bg-surface-container', 'text-on-surface-variant');
        State.activeEventFilter = pill.dataset.filter;
        renderHomeView();
      });
    });

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

    const formCreateEvent = document.getElementById('form-create-event');
    if (formCreateEvent) {
      formCreateEvent.addEventListener('submit', async e => {
        e.preventDefault();
        const titleBm = document.getElementById('event-title-bm').value.trim();
        const titleEn = document.getElementById('event-title-en').value.trim();
        const date = document.getElementById('event-date-input').value;
        const startTime = document.getElementById('event-start-time').value;
        const endTime = document.getElementById('event-end-time').value;
        const venue = document.getElementById('event-venue-input').value.trim();
        const meetLink = document.getElementById('event-meet-link').value.trim();
        const deadline = document.getElementById('event-deadline-input').value;

        showToast(State.lang === 'en' ? 'Publishing event & broadcasting push notification...' : 'Menerbitkan acara & menyiarkan notifikasi FCM...', 'info');
        const res = await api('saveEvent', {
          titleBm: titleBm,
          titleEn: titleEn,
          eventDate: date,
          startTime: startTime,
          endTime: endTime,
          venue: venue,
          meetingLink: meetLink,
          rsvpDeadline: deadline
        });

        if (res && res.success) {
          showToast(res.message, 'success');
          State.adminData = null;
          await loadAppBoot();
          setView('admin-dashboard');
        } else {
          showToast((res && res.message) || 'Gagal menerbitkan acara.', 'error');
        }
      });
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
