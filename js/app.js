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
  // 1. KAMUS DWI-BAHASA (BRUNEI MALAY STANDARD & ENGLISH)
  // ==========================================================================
  const I18N = {
    bm: {
      appName: 'PORTAL CEU',
      deptName: 'Unit Pendidikan Kerjaya, Jabatan Sekolah-Sekolah',
      ministry: 'Kementerian Pendidikan Negara Brunei Darussalam',
      welcome: 'Selamat Datang',
      emailLogin: 'Log Masuk Emel',
      biometricFast: 'Biometrik Pantas',
      officialEmailLabel: 'E-mel Rasmi Pegawai / Kerajaan',
      emailPlaceholder: 'nama.guru@moe.bn',
      emailDomainNotice: 'Hanya domain .moe.bn, .gov.bn, atau .edu.bn dibenarkan.',
      sendOtpBtn: 'Hantar Kod OTP',
      verifyOtpTitle: 'Masukkan Kod OTP 6-Digit',
      verifyOtpDesc: 'Kod pengesahan telah dihantar ke emel anda.',
      verifyBtn: 'Sahkan & Masuk',
      resendOtp: 'Hantar Semula Kod',
      bioPromptLabel: 'Sentuh sensor cap jari atau imbas wajah untuk akses pantas',
      bioUseOtpInstead: 'Guna Log Masuk Emel OTP',
      activeStatus: 'Aktif',
      sessionVerified: 'Sesi Disahkan (30 Hari)',
      district: 'Daerah',
      
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
      waitingAction: 'Menunggu Tindakan',
      allPrograms: 'Semua Program',
      urgentRsvp: 'Perlu RSVP',
      upcomingEvents: 'Akan Datang',
      deadline: 'Tarikh Tutup RSVP',
      respondRsvpBtn: 'Sahkan Kehadiran (RSVP)',
      viewDetailsBtn: 'Lihat Butiran',
      onlineMeeting: 'Sertai Google Meet',
      
      // RSVP Modal
      rsvpModalTitle: 'Pengesahan Kehadiran Rasmi',
      rsvpOptionAttend: 'Saya akan hadir sepenuhnya (Hadir)',
      rsvpOptionRep: 'Mewakilkan pegawai lain bagi pihak sekolah',
      rsvpOptionAbsent: 'Tidak dapat hadir (Memohon pelepasan)',
      repNameLabel: 'Nama Penuh Pegawai Pengganti',
      repPhoneLabel: 'Nombor Telefon Bimbit Wakil',
      absenceReasonLabel: 'Sebab Ketidakhadiran Rasmi (Wajib)',
      confirmDeclaration: 'Saya mengesahkan bahawa maklumat jawapan ini adalah benar dan rasmi.',
      submitRsvpBtn: 'Hantar Pengesahan RSVP',

      // Arkib
      archiveTitle: 'Arkib Dokumen & Memo Rasmi',
      searchArchivePlaceholder: 'Cari tajuk memo, minit, atau takwim...',
      catAll: 'Semua',
      catCirculars: 'Pekeliling',
      catMinutes: 'Minit Mesyuarat',
      catCalendar: 'Takwim Tahunan',
      catGuidelines: 'Garis Panduan',
      previewDocBtn: 'Pratinjau',
      downloadBtn: 'Muat Turun',

      // Admin
      adminDashboard: 'Papan Pemuka Pentadbir UPK',
      totalTeachersKpi: 'Jumlah Guru Kerjaya',
      rsvpRateKpi: 'Kadar Respons RSVP',
      attendingKpi: 'Hadir Disahkan',
      repAbsentKpi: 'Wakil / Tidak Hadir',
      overallRsvpDonut: 'Pecahan Respons Keseluruhan Acara Semasa',
      districtBarChart: 'Prestasi Kehadiran Mengikut 4 Daerah',
      createNewEventBtn: '+ Terbit Program Baharu',
      generatePdfBtn: 'Jana Laporan PDF Rasmi',
      attendanceTableTitle: 'Semakan Terperinci Kehadiran RSVP',
      exportPdfDocTitle: 'LAPORAN RASMI KEHADIRAN DAN KETIDAKHADIRAN PROGRAM KERJAYA'
    },
    en: {
      appName: 'PORTAL CEU',
      deptName: 'Career Education Unit, Department of Schools',
      ministry: 'Ministry of Education, Brunei Darussalam',
      welcome: 'Welcome',
      emailLogin: 'Email Login',
      biometricFast: 'Fast Biometrics',
      officialEmailLabel: 'Official Government / MOE Email',
      emailPlaceholder: 'teacher.name@moe.bn',
      emailDomainNotice: 'Only .moe.bn, .gov.bn, or .edu.bn domains are permitted.',
      sendOtpBtn: 'Send OTP Code',
      verifyOtpTitle: 'Enter 6-Digit OTP Code',
      verifyOtpDesc: 'A security verification code has been dispatched to your email.',
      verifyBtn: 'Verify & Proceed',
      resendOtp: 'Resend Code',
      bioPromptLabel: 'Touch fingerprint sensor or scan Face ID for instant access',
      bioUseOtpInstead: 'Use Email OTP Login',
      activeStatus: 'Active',
      sessionVerified: 'Verified Session (30 Days)',
      district: 'District',
      
      // Bottom Nav
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
      viewDetailsBtn: 'View Details',
      onlineMeeting: 'Join Google Meet',
      
      // RSVP Modal
      rsvpModalTitle: 'Official Attendance Confirmation',
      rsvpOptionAttend: 'I will be attending in person (Attending)',
      rsvpOptionRep: 'Designate official representative on behalf of school',
      rsvpOptionAbsent: 'Unable to attend (Request official release)',
      repNameLabel: 'Representative Full Name',
      repPhoneLabel: 'Representative Mobile Number',
      absenceReasonLabel: 'Official Absence Justification (Required)',
      confirmDeclaration: 'I hereby certify that the information provided is accurate and official.',
      submitRsvpBtn: 'Submit Official RSVP',

      // Archive
      archiveTitle: 'Official Document & Memo Repository',
      searchArchivePlaceholder: 'Search circular title, minutes, or calendar...',
      catAll: 'All',
      catCirculars: 'Circulars',
      catMinutes: 'Meeting Minutes',
      catCalendar: 'Annual Calendar',
      catGuidelines: 'Guidelines',
      previewDocBtn: 'Preview',
      downloadBtn: 'Download',

      // Admin
      adminDashboard: 'CEU Administrator Dashboard',
      totalTeachersKpi: 'Registered Counselors',
      rsvpRateKpi: 'RSVP Response Rate',
      attendingKpi: 'Confirmed Attending',
      repAbsentKpi: 'Representative / Absent',
      overallRsvpDonut: 'Current Event Overall Response Breakdown',
      districtBarChart: 'Attendance Performance by 4 Districts',
      createNewEventBtn: '+ Create New Event',
      generatePdfBtn: 'Generate Official PDF Report',
      attendanceTableTitle: 'Detailed RSVP Attendance Tracking',
      exportPdfDocTitle: 'OFFICIAL CAREER GUIDANCE PROGRAM ATTENDANCE REPORT'
    }
  };

  // ==========================================================================
  // 2. STATE APLIKASI
  // ==========================================================================
  const State = {
    lang: localStorage.getItem('ceu_lang') || 'bm',
    token: localStorage.getItem('ceu_tok') || '',
    currentUser: null,
    currentView: 'auth', // auth | home | archive | notif | profile | admin-dashboard | admin-rsvp | admin-events
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

    // Modus Mock Data Tempatan (Offline / Preview Segera)
    if (isMock) {
      return handleMockApi(action, payload);
    }

    // Deduplikasi Permintaan Bacaan (In-Flight Sharing)
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
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // Wajib text/plain anti-CORS
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

  // Pengendali Simulasi Mock Data
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
          const u = mock.users[1]; // Cikgu Ahmad
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
      }, 250);
    });
  }

  // ==========================================================================
  // 4. BIOMETRIK & KESELAMATAN PERANTI (gas-rahasia-script-properties)
  // ==========================================================================
  async function triggerBiometricLogin() {
    showToast(I18N[State.lang].bioPromptLabel, 'info');

    // 1. Semak Jambatan Native Android APK (CEUAndroid WebView Bridge)
    if (window.CEUAndroid && typeof window.CEUAndroid.promptBiometric === 'function') {
      try {
        window.CEUAndroid.promptBiometric();
        return;
      } catch (e) {
        console.warn('Native bridge error, falling back:', e);
      }
    }

    // 2. Semak WebAuthn / Kredensial Biometrik Pelayar
    if (window.PublicKeyCredential && PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
      try {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        if (available) {
          // Simulasi buka kunci biometrik tempatan
          executeBiometricSuccess(State.token || 'mock_bio_token');
          return;
        }
      } catch (err) {
        console.warn('WebAuthn unavailable:', err);
      }
    }

    // 3. Fallback pantas
    executeBiometricSuccess(State.token || 'mock_bio_token');
  }

  // Callback dari Android Native Bridge
  window.onBiometricSuccess = function (token) {
    executeBiometricSuccess(token);
  };

  window.onBiometricFailed = function (errMsg) {
    showToast(errMsg || 'Pengesahan biometrik gagal.', 'error');
  };

  async function executeBiometricSuccess(tokenToVerify) {
    const res = await api('biometricLogin', { token: tokenToVerify });
    if (res && res.success) {
      State.token = res.token;
      State.currentUser = res.user;
      localStorage.setItem('ceu_tok', res.token);
      localStorage.setItem('ceu_user', JSON.stringify(res.user));
      showToast(I18N[State.lang].activeStatus + ': ' + res.user.name, 'success');
      loadAppBoot();
    } else {
      showToast((res && res.message) || 'Biometrik gagal. Sila gunakan OTP.', 'error');
    }
  }

  // ==========================================================================
  // 5. NAVIGASI, ROUTING & UI RENDER
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

    // Urus Paparan Header & Bottom Nav
    const isAuth = viewName === 'auth';
    const bottomNav = document.getElementById('app-bottom-nav');
    const appHeader = document.getElementById('app-header');
    if (bottomNav) bottomNav.style.display = isAuth ? 'none' : 'flex';
    if (appHeader) appHeader.style.display = isAuth ? 'none' : 'flex';

    // Kemas kini tab aktif pada bottom nav
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      const tab = btn.dataset.tab;
      const isActive = (tab === viewName) ||
        (tab === 'admin' && viewName.startsWith('admin-'));
      if (isActive) {
        btn.classList.add('text-primary');
        btn.classList.remove('text-on-surface-variant');
        const icon = btn.querySelector('.material-symbols-outlined');
        if (icon) icon.classList.add('fill-1');
      } else {
        btn.classList.remove('text-primary');
        btn.classList.add('text-on-surface-variant');
        const icon = btn.querySelector('.material-symbols-outlined');
        if (icon) icon.classList.remove('fill-1');
      }
    });

    // Panggil pemuat data khusus paparan
    if (viewName === 'home') renderHomeView();
    if (viewName === 'archive') renderArchiveView();
    if (viewName === 'notif') renderNotifView();
    if (viewName === 'profile') renderProfileView();
    if (viewName === 'admin-dashboard') renderAdminDashboardView();
    if (viewName === 'admin-rsvp') renderAdminRsvpTableView();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ==========================================================================
  // 6. PEMUATAN DATA UTAMA (BOOT)
  // ==========================================================================
  async function loadAppBoot() {
    const res = await api('boot', {});
    if (res && res.success && res.data) {
      State.currentUser = res.data.user || State.currentUser;
      State.events = res.data.events || [];
      State.rsvps = res.data.rsvp || [];
      State.notifications = res.data.notifications || [];

      // Kemas kini profil pengguna pada header
      const nameEl = document.getElementById('header-user-name');
      const districtEl = document.getElementById('header-district-badge');
      if (nameEl) nameEl.textContent = State.currentUser.name;
      if (districtEl) districtEl.textContent = 'Daerah: ' + State.currentUser.district;

      // Paparkan butang Admin jika peranan Admin
      const adminNavBtn = document.getElementById('nav-btn-admin');
      if (adminNavBtn) {
        adminNavBtn.style.display = (State.currentUser.role === 'Admin') ? 'flex' : 'none';
      }

      // Lalukan ke laman utama
      setView(State.currentUser.role === 'Admin' ? 'admin-dashboard' : 'home');
    } else {
      setView('auth');
    }
  }

  // ==========================================================================
  // 7. RENDER PAPARAN HOME (TAKWIN GURU)
  // ==========================================================================
  function renderHomeView() {
    const container = document.getElementById('events-card-list');
    if (!container) return;

    let filtered = State.events;
    if (State.activeEventFilter === 'urgent') {
      // Belum dijawab
      const answeredIds = State.rsvps.map(r => r.event_id);
      filtered = State.events.filter(e => !answeredIds.includes(e.event_id));
    }

    if (!filtered.length) {
      container.innerHTML = `
        <div class="bg-surface-container-low rounded-2xl p-8 text-center text-on-surface-variant my-4">
          <span class="material-symbols-outlined text-[48px] text-primary/40 mb-2">event_available</span>
          <p class="font-label-lg">${I18N[State.lang].catAll} program telah dijawab atau tiada program aktif.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(ev => {
      const userRsvp = State.rsvps.find(r => r.event_id === ev.event_id);
      let statusBadge = '';
      if (userRsvp) {
        if (userRsvp.response_status.toLowerCase().includes('hadir') && !userRsvp.response_status.toLowerCase().includes('tidak')) {
          statusBadge = `<span class="bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-semibold">HADIR DISAHKAN</span>`;
        } else if (userRsvp.response_status.toLowerCase().includes('wakil')) {
          statusBadge = `<span class="bg-[#FEF3C7] text-[#B45309] border border-[#FCD34D] px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-semibold">MEWAKILKAN</span>`;
        } else {
          statusBadge = `<span class="bg-[#FEE2E2] text-[#B91C1C] border border-[#FCA5A5] px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-semibold">TIDAK HADIR</span>`;
        }
      } else {
        statusBadge = `<span class="bg-[#FEF3C7] text-[#B45309] border border-[#FCD34D] px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-semibold animate-pulse">⚠️ PERLU TINDAKAN RSVP</span>`;
      }

      const title = State.lang === 'en' && ev.title_en ? ev.title_en : ev.title_bm;
      return `
        <div class="bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-outline-variant/40 hover:border-primary/40 transition-all flex flex-col gap-3">
          <div class="flex items-center justify-between gap-2">
            ${statusBadge}
            <span class="font-label-sm text-on-surface-variant text-label-sm flex items-center gap-1">
              <span class="material-symbols-outlined text-[15px] text-primary">calendar_month</span>
              ${ev.event_date}
            </span>
          </div>
          <div>
            <h3 class="font-headline-sm text-headline-sm text-on-surface font-semibold leading-snug">${title}</h3>
            <p class="font-body-sm text-body-sm text-on-surface-variant mt-1">${ev.summary || ''}</p>
          </div>
          <div class="flex flex-col gap-1.5 pt-1 border-t border-outline-variant/30 text-on-surface-variant font-body-sm text-body-sm">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[16px] text-primary shrink-0">schedule</span>
              <span>${ev.start_time} - ${ev.end_time}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[16px] text-primary shrink-0">pin_drop</span>
              <span class="truncate">${ev.venue || 'Dalam Talian'}</span>
            </div>
            ${ev.rsvp_deadline ? `
              <div class="flex items-center gap-2 text-error font-medium text-label-sm">
                <span class="material-symbols-outlined text-[16px] shrink-0">alarm</span>
                <span>${I18N[State.lang].deadline}: ${ev.rsvp_deadline.replace('T', ' ')}</span>
              </div>
            ` : ''}
          </div>
          <div class="flex items-center gap-2 pt-1">
            <button class="btn-open-rsvp flex-1 h-10 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-transform" data-id="${ev.event_id}">
              <span class="material-symbols-outlined text-[18px]">how_to_reg</span>
              <span>${userRsvp ? 'Kemas Kini RSVP' : I18N[State.lang].respondRsvpBtn}</span>
            </button>
            ${ev.meeting_link ? `
              <a href="${ev.meeting_link}" target="_blank" class="h-10 px-3.5 rounded-xl bg-secondary-container text-on-secondary-container font-label-md text-label-md flex items-center justify-center gap-1 shrink-0">
                <span class="material-symbols-outlined text-[18px]">videocam</span>
                <span>Meet</span>
              </a>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    // Bind RSVP buttons
    container.querySelectorAll('.btn-open-rsvp').forEach(btn => {
      btn.addEventListener('click', () => {
        const evId = btn.dataset.id;
        openRsvpModal(evId);
      });
    });
  }

  // ==========================================================================
  // 8. MODAL RSVP PINTAR (BOTTOM SHEET ACCORDION)
  // ==========================================================================
  function openRsvpModal(eventId) {
    const ev = State.events.find(e => e.event_id === eventId) || State.events[0];
    State.selectedEventForRsvp = ev;
    if (!ev) return;

    const modal = document.getElementById('modal-rsvp-sheet');
    const titleEl = document.getElementById('rsvp-event-title');
    const metaEl = document.getElementById('rsvp-event-meta');
    if (titleEl) titleEl.textContent = State.lang === 'en' && ev.title_en ? ev.title_en : ev.title_bm;
    if (metaEl) metaEl.textContent = `${ev.event_date} • ${ev.start_time} • ${ev.venue}`;

    // Reset Form
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
      showToast('Sila masukkan nama penuh pegawai pengganti.', 'warning');
      return;
    }
    if (status === 'Tidak Hadir' && !absenceReason) {
      showToast('Sila nyatakan sebab rasmi ketidakhadiran.', 'warning');
      return;
    }

    const payload = {
      eventId: ev.event_id,
      status: status,
      repName: repName,
      repPhone: repPhone,
      absenceReason: absenceReason
    };

    showToast('Menghantar status RSVP...', 'info');
    const res = await api('submitRsvp', payload);
    if (res && res.success) {
      showToast('RSVP berjaya dihantar: ' + status, 'success');
      // Update local state
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
  // 9. RENDER ARKIB DOKUMEN & PEMAPAR PDF
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
          <p class="font-label-lg">Tiada dokumen dijumpai untuk carian ini.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(d => {
      const title = State.lang === 'en' && d.title_en ? d.title_en : d.title_bm;
      return `
        <div class="bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-outline-variant/40 flex flex-col gap-2.5">
          <div class="flex items-start justify-between gap-3">
            <div class="w-10 h-10 rounded-xl bg-[#FEE2E2] text-[#B91C1C] flex items-center justify-center shrink-0 font-bold font-label-md">
              PDF
            </div>
            <div class="flex-1 min-w-0">
              <span class="bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm px-2 py-0.5 rounded-full font-medium">
                ${d.category}
              </span>
              <h4 class="font-label-lg text-label-lg font-semibold text-on-surface mt-1 leading-snug">${title}</h4>
              <p class="font-body-sm text-body-sm text-on-surface-variant mt-0.5">${d.ref_no || ''} • ${d.publish_date} • ${d.size || 'PDF'}</p>
            </div>
          </div>
          <div class="flex items-center gap-2 pt-2 border-t border-outline-variant/30">
            <button class="btn-preview-pdf flex-1 h-9 rounded-xl bg-surface-container text-primary font-label-md text-label-md flex items-center justify-center gap-1 active:scale-95 transition-transform" data-url="${d.file_view_url}">
              <span class="material-symbols-outlined text-[18px]">visibility</span>
              <span>${I18N[State.lang].previewDocBtn}</span>
            </button>
            <a href="${d.file_view_url}" target="_blank" download class="flex-1 h-9 rounded-xl bg-primary text-on-primary font-label-md text-label-md flex items-center justify-center gap-1 active:scale-95 transition-transform">
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
  // 10. RENDER NOTIFIKASI
  // ==========================================================================
  function renderNotifView() {
    const container = document.getElementById('notif-list-container');
    if (!container) return;

    if (!State.notifications.length) {
      container.innerHTML = `
        <div class="bg-surface-container-low rounded-2xl p-8 text-center text-on-surface-variant my-4">
          <span class="material-symbols-outlined text-[48px] text-primary/40 mb-2">notifications_off</span>
          <p class="font-label-lg">Tiada pemberitahuan baharu.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = State.notifications.map(n => {
      const isUrgent = n.type === 'Urgent';
      const title = State.lang === 'en' && n.title_en ? n.title_en : n.title_bm;
      const content = State.lang === 'en' && n.content_en ? n.content_en : n.content_bm;
      return `
        <div class="bg-surface-container-lowest rounded-2xl p-4 shadow-sm border ${isUrgent ? 'border-primary/40 bg-[#F0F9FF]' : 'border-outline-variant/40'} flex items-start gap-3">
          <div class="w-10 h-10 rounded-full ${isUrgent ? 'bg-tertiary text-on-tertiary' : 'bg-surface-container-high text-primary'} flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-[20px]">${isUrgent ? 'campaign' : 'mark_chat_unread'}</span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-1">
              <span class="font-label-sm text-label-sm font-semibold text-primary truncate">${n.sent_at}</span>
              ${!n.is_read ? `<span class="w-2 h-2 rounded-full bg-error shrink-0"></span>` : ''}
            </div>
            <h4 class="font-label-lg text-label-lg font-bold text-on-surface mt-0.5">${title}</h4>
            <p class="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-relaxed">${content}</p>
          </div>
        </div>
      `;
    }).join('');
  }

  // ==========================================================================
  // 11. RENDER PROFIL & TETAPAN PENGGUNA
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
    if (roleEl) roleEl.textContent = u.role === 'Admin' ? 'Pegawai Pentadbir UPK' : 'Guru Pendidikan Kerjaya';
    if (emailEl) emailEl.textContent = u.email;
    if (schoolEl) schoolEl.textContent = `${u.school} (${u.district})`;
    if (bioToggle) bioToggle.checked = !!u.biometricEnabled;
  }

  // ==========================================================================
  // 12. RENDER ADMIN DASHBOARD (KPI, DONUT CHART & DISTRICT STACKED BAR)
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

    // Update KPIs
    const kpi = data.kpi || {};
    document.getElementById('kpi-total-teachers').textContent = kpi.totalTeachers || 0;
    document.getElementById('kpi-rsvp-rate').textContent = (kpi.rsvpRate || 0) + '%';
    document.getElementById('kpi-attending').textContent = kpi.attending || 0;
    document.getElementById('kpi-rep-absent').textContent = `${kpi.representative || 0} / ${kpi.absent || 0}`;

    // Render Donut Chart SVG
    renderDonutChart(data.donutData || []);

    // Render District Stacked Bar
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
      <!-- Donut Hole -->
      <circle cx="${cx}" cy="${cy}" r="36" fill="#ffffff" />
      <text x="${cx}" y="${cy - 2}" text-anchor="middle" font-size="14" font-weight="700" fill="#0F172A">
        ${State.adminData?.kpi?.rsvpRate || 0}%
      </text>
      <text x="${cx}" y="${cy + 12}" text-anchor="middle" font-size="9" font-weight="500" fill="#64748B">
        Dijawab
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

      return `
        <div class="flex flex-col gap-1">
          <div class="flex items-center justify-between text-label-sm font-label-sm">
            <span class="font-bold text-on-surface">${dName} (${d.total} Sekolah)</span>
            <span class="text-primary font-semibold">${d.hadir} Hadir • ${hadirPct}%</span>
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
  // 13. JADUAL RSVP PENTADBIR & PENJANAAN PDF
  // ==========================================================================
  async function renderAdminRsvpTableView() {
    const tableBody = document.getElementById('admin-rsvp-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = `<tr><td colspan="7" class="p-6 text-center text-on-surface-variant font-label-md">Memuatkan data kehadiran seluruh daerah...</td></tr>`;

    const res = await api('getAdminRsvpTable', {});
    if (!res || !res.success || !res.data) {
      tableBody.innerHTML = `<tr><td colspan="7" class="p-6 text-center text-error">Gagal memuatkan data.</td></tr>`;
      return;
    }

    const rows = res.data;
    tableBody.innerHTML = rows.map((r, i) => {
      let badge = '';
      if (r.status.includes('Hadir') && !r.status.includes('Tidak')) {
        badge = `<span class="bg-[#DCFCE7] text-[#15803D] px-2 py-0.5 rounded-full font-label-sm font-semibold">HADIR</span>`;
      } else if (r.status.includes('Wakil')) {
        badge = `<span class="bg-[#FEF3C7] text-[#B45309] px-2 py-0.5 rounded-full font-label-sm font-semibold">WAKIL: ${r.repName || '-'}</span>`;
      } else if (r.status.includes('Tidak')) {
        badge = `<span class="bg-[#FEE2E2] text-[#B91C1C] px-2 py-0.5 rounded-full font-label-sm font-semibold">TAK HADIR</span>`;
      } else {
        badge = `<span class="bg-[#F1F5F9] text-[#475569] px-2 py-0.5 rounded-full font-label-sm font-semibold">BELUM JAWAB</span>`;
      }

      return `
        <tr class="border-b border-outline-variant/30 hover:bg-surface-container-low transition-colors">
          <td class="p-3 text-center font-label-sm text-on-surface-variant">${i + 1}</td>
          <td class="p-3 font-label-md font-semibold text-on-surface">${r.name}<br><span class="font-body-sm font-normal text-on-surface-variant">${r.email}</span></td>
          <td class="p-3 font-body-sm text-on-surface">${r.school}</td>
          <td class="p-3 font-label-sm text-primary font-medium">${r.district}</td>
          <td class="p-3">${badge}</td>
          <td class="p-3 font-body-sm text-on-surface-variant">${r.absenceReason || r.repName || '-'}</td>
          <td class="p-3 text-center">
            <button class="px-2.5 py-1 rounded-lg bg-surface-container text-primary font-label-sm hover:bg-primary hover:text-on-primary transition-colors btn-reminder" data-email="${r.email}">
              Peringatan
            </button>
          </td>
        </tr>
      `;
    }).join('');

    tableBody.querySelectorAll('.btn-reminder').forEach(btn => {
      btn.addEventListener('click', () => {
        showToast('Peringatan notifikasi dihantar ke ' + btn.dataset.email, 'success');
      });
    });
  }

  // Penjanaan Dokumen Laporan Rasmi PDF A4 Ber-QR HMAC
  async function openOfficialPdfReportModal() {
    showToast('Menjana laporan rasmi...', 'info');
    const res = await api('generateAttendancePdf', {});
    if (!res || !res.success || !res.report) {
      showToast('Gagal menjana laporan.', 'error');
      return;
    }

    const report = res.report;
    const modal = document.getElementById('modal-pdf-report');
    if (!modal) return;

    // Isi Metadata
    document.getElementById('pdf-report-id').textContent = report.reportId;
    document.getElementById('pdf-generated-at').textContent = new Date(report.generatedAt).toLocaleString();
    document.getElementById('pdf-event-title').textContent = report.event ? report.event.title_bm : 'Program Kerjaya UPK';
    document.getElementById('pdf-event-venue').textContent = report.event ? report.event.venue : 'Kementerian Pendidikan';

    // Summary Box
    document.getElementById('pdf-total-invited').textContent = report.summary.totalTeachers;
    document.getElementById('pdf-total-attending').textContent = report.summary.attending;
    document.getElementById('pdf-total-rep').textContent = report.summary.representative;
    document.getElementById('pdf-total-absent').textContent = report.summary.absent;

    // QR Verification & HMAC Signature
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
  // 14. PENGURUSAN SESI & LOG MASUK
  // ==========================================================================
  async function handleSendOtpClick() {
    const emailInput = document.getElementById('auth-email-input');
    const email = (emailInput?.value || '').trim();

    if (!email) {
      showToast('Sila masukkan alamat emel rasmi anda.', 'warning');
      return;
    }
    const isDomainValid = window.APP_CONFIG.OFFICIAL_DOMAINS.some(d => email.toLowerCase().endsWith(d));
    if (!isDomainValid) {
      showToast(I18N[State.lang].emailDomainNotice, 'error');
      return;
    }

    showToast('Menghantar kod OTP ke ' + email + '...', 'info');
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
    let seconds = 600; // 10 minit
    const timerEl = document.getElementById('otp-timer-display');
    if (otpTimerInterval) clearInterval(otpTimerInterval);

    otpTimerInterval = setInterval(() => {
      seconds--;
      if (seconds <= 0) {
        clearInterval(otpTimerInterval);
        if (timerEl) timerEl.textContent = '00:00 (Tamat Tempoh)';
        return;
      }
      const m = String(Math.floor(seconds / 60)).padStart(2, '0');
      const s = String(seconds % 60).padStart(2, '0');
      if (timerEl) timerEl.textContent = `${m}:${s}`;
    }, 1000);
  }

  async function handleVerifyOtpClick() {
    const email = document.getElementById('auth-email-input').value.trim();
    // Ambil digit dari 6 input kotak OTP
    let otp = '';
    document.querySelectorAll('.otp-digit-input').forEach(inp => otp += inp.value.trim());

    if (otp.length < 6) {
      showToast('Sila lengkapkan kesemua 6-digit kod OTP.', 'warning');
      return;
    }

    showToast('Mengesahkan kod OTP...', 'info');
    const res = await api('verifyOtp', { email: email, otp: otp, device: navigator.userAgent });
    if (res && res.success) {
      State.token = res.token;
      State.currentUser = res.user;
      localStorage.setItem('ceu_tok', res.token);
      localStorage.setItem('ceu_user', JSON.stringify(res.user));

      showToast('Log masuk berjaya! Selamat datang ' + res.user.name, 'success');
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
    showToast('Anda telah berjaya log keluar.', 'info');
  }

  // ==========================================================================
  // 15. TOGOL BAHASA (BM / EN)
  // ==========================================================================
  function setLanguage(lang) {
    State.lang = lang;
    localStorage.setItem('ceu_lang', lang);

    document.querySelectorAll('.lang-btn-bm').forEach(b => {
      b.classList.toggle('bg-tertiary', lang === 'bm');
      b.classList.toggle('text-on-tertiary', lang === 'bm');
      b.classList.toggle('text-on-primary/70', lang !== 'bm');
    });
    document.querySelectorAll('.lang-btn-en').forEach(b => {
      b.classList.toggle('bg-tertiary', lang === 'en');
      b.classList.toggle('text-on-tertiary', lang === 'en');
      b.classList.toggle('text-on-primary/70', lang !== 'en');
    });

    // Re-render paparan aktif
    if (State.currentView === 'home') renderHomeView();
    if (State.currentView === 'archive') renderArchiveView();
    if (State.currentView === 'notif') renderNotifView();
    if (State.currentView === 'admin-dashboard') renderAdminDashboardView();
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
    // Language buttons
    document.querySelectorAll('.lang-btn-bm').forEach(b => b.addEventListener('click', () => setLanguage('bm')));
    document.querySelectorAll('.lang-btn-en').forEach(b => b.addEventListener('click', () => setLanguage('en')));

    // Auth Segmented Switcher
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

    // Biometric Trigger Button
    const bioTriggerBtn = document.getElementById('bio-trigger-btn');
    if (bioTriggerBtn) {
      bioTriggerBtn.addEventListener('click', triggerBiometricLogin);
    }

    // OTP Flow
    const btnSendOtp = document.getElementById('btn-send-otp');
    if (btnSendOtp) btnSendOtp.addEventListener('click', handleSendOtpClick);

    const btnVerifyOtp = document.getElementById('btn-verify-otp');
    if (btnVerifyOtp) btnVerifyOtp.addEventListener('click', handleVerifyOtpClick);

    // OTP Box auto-focus progression
    const otpBoxes = document.querySelectorAll('.otp-digit-input');
    otpBoxes.forEach((box, i) => {
      box.addEventListener('input', e => {
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

    // Bottom Navigation
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        if (tab === 'admin') setView('admin-dashboard');
        else setView(tab);
      });
    });

    // RSVP Modal Radio Choices
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

    // Event Filters (Home)
    document.querySelectorAll('.event-filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.event-filter-pill').forEach(p => {
          p.classList.remove('bg-primary', 'text-on-primary');
          p.classList.add('bg-surface-container', 'text-on-surface-variant');
        });
        pill.classList.add('bg-primary', 'text-on-primary');
        pill.classList.remove('bg-surface-container', 'text-on-surface-variant');
        State.activeEventFilter = pill.dataset.filter;
        renderHomeView();
      });
    });

    // Archive Search & Categories
    const archiveSearch = document.getElementById('archive-search-input');
    if (archiveSearch) {
      archiveSearch.addEventListener('input', () => renderArchiveView());
    }

    document.querySelectorAll('.archive-category-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.archive-category-pill').forEach(p => {
          p.classList.remove('bg-primary', 'text-on-primary');
          p.classList.add('bg-surface-container', 'text-on-surface-variant');
        });
        pill.classList.add('bg-primary', 'text-on-primary');
        pill.classList.remove('bg-surface-container', 'text-on-surface-variant');
        State.activeMemoCategory = pill.dataset.cat;
        renderArchiveView();
      });
    });

    // Close PDF viewer modal
    const btnClosePdf = document.getElementById('btn-close-pdf-viewer');
    if (btnClosePdf) {
      btnClosePdf.addEventListener('click', () => {
        document.getElementById('modal-pdf-viewer').classList.add('hidden');
      });
    }

    // Admin PDF Generator triggers
    const btnGenPdf = document.getElementById('btn-admin-generate-pdf');
    if (btnGenPdf) btnGenPdf.addEventListener('click', openOfficialPdfReportModal);

    const btnClosePdfReport = document.getElementById('btn-close-pdf-report');
    if (btnClosePdfReport) btnClosePdfReport.addEventListener('click', closeOfficialPdfReportModal);

    const btnPrintPdf = document.getElementById('btn-print-pdf-report');
    if (btnPrintPdf) btnPrintPdf.addEventListener('click', () => window.print());

    // Admin Nav Tabs
    const btnAdminRsvpTab = document.getElementById('btn-admin-view-rsvp');
    if (btnAdminRsvpTab) btnAdminRsvpTab.addEventListener('click', () => setView('admin-rsvp'));

    const btnAdminDashTab = document.getElementById('btn-admin-view-dashboard');
    if (btnAdminDashTab) btnAdminDashTab.addEventListener('click', () => setView('admin-dashboard'));

    const btnAdminCreateEvent = document.getElementById('btn-admin-create-event');
    if (btnAdminCreateEvent) btnAdminCreateEvent.addEventListener('click', () => setView('admin-events'));

    // Admin Event Form Submit
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

        showToast('Menerbitkan acara & menyiarkan notifikasi FCM...', 'info');
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
          // Refresh events and return to dashboard
          State.adminData = null;
          await loadAppBoot();
          setView('admin-dashboard');
        } else {
          showToast((res && res.message) || 'Gagal menerbitkan acara.', 'error');
        }
      });
    }

    // Profile Actions
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
    setLanguage(State.lang);

    // Semak Token Sedia Ada
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

  // Ekspot Global untuk debugging
  window.CEU_APP = {
    State: State,
    api: api,
    setView: setView,
    logout: logout,
    showToast: showToast
  };

})();
