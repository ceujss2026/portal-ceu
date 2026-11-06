/**
 * ============================================================================
 * LOGIK UTAMA SISTEM PORTAL CEU (js/app.js)
 * Single Page Application (SPA) - Sangat Responsif, Pantas & Bebas Lag
 * Melaksanakan Pola: gas-pro-api + gas-scale-turbo + gas-doc-engine
 * ============================================================================
 */

// ============================================
// 1. STATE GLOBAL & CACHING SWR (Client-Side)
// ============================================
const AppState = {
  currentUser: JSON.parse(localStorage.getItem('ceu_user') || 'null'),
  token: localStorage.getItem('ceu_token') || '',
  currentView: 'home',
  events: JSON.parse(localStorage.getItem('ceu_cache_events') || '[]'),
  rsvps: JSON.parse(localStorage.getItem('ceu_cache_rsvps') || '[]'),
  activeEvent: null,
  dashboardData: null,
  agenciesList: []
};

// ============================================
// PEMBANTU FORMAT TARIKH DWIBAHASA (BM & EN)
// ============================================
function formatDisplayDate(dateStr, isEn) {
  if (!dateStr) return '';
  if (!isEn) return dateStr;
  return dateStr
    .replace(/\(Isnin\)/gi, '(Monday)')
    .replace(/\(Selasa\)/gi, '(Tuesday)')
    .replace(/\(Rabu\)/gi, '(Wednesday)')
    .replace(/\(Khamis\)/gi, '(Thursday)')
    .replace(/\(Jumaat\)/gi, '(Friday)')
    .replace(/\(Sabtu\)/gi, '(Saturday)')
    .replace(/\(Ahad\)/gi, '(Sunday)');
}

// ============================================
// PEMBANTU IDENTITI AGENSI & PENYELARASAN DATA RSVP
// ============================================
function isAgencyMatch(recordAgencyId, userOrKod) {
  if (!recordAgencyId || !userOrKod) return false;
  const rec = String(recordAgencyId).toLowerCase().trim();
  if (typeof userOrKod === 'string') {
    const s = userOrKod.toLowerCase().trim();
    if (rec === s) return true;
    const agencies = (AppState.agenciesList && AppState.agenciesList.length === 50) ? AppState.agenciesList : getPreseededAgencies();
    const ag = agencies.find(a => (a.kod && a.kod.toLowerCase() === s) || (a.user && a.user.toLowerCase() === s));
    if (ag) {
      return rec === (ag.kod || '').toLowerCase() || rec === (ag.user || '').toLowerCase();
    }
    return false;
  }
  const uId = String(userOrKod.id || '').toLowerCase().trim();
  const uKod = String(userOrKod.kod || '').toLowerCase().trim();
  const uUser = String(userOrKod.username || userOrKod.user || '').toLowerCase().trim();
  if (rec === uId || rec === uKod || rec === uUser) return true;
  const agencies = (AppState.agenciesList && AppState.agenciesList.length === 50) ? AppState.agenciesList : getPreseededAgencies();
  const ag = agencies.find(a => 
    (uId && a.kod.toLowerCase() === uId) || 
    (uKod && a.kod.toLowerCase() === uKod) || 
    (uUser && a.user.toLowerCase() === uUser)
  );
  if (ag) {
    return rec === ag.kod.toLowerCase() || rec === ag.user.toLowerCase();
  }
  return false;
}

function ensureInitialRsvpsSeeded() {
  const RSVP_SEED_VERSION = 'v5_clean_production_20261106';
  const existingVersion = localStorage.getItem('ceu_rsvps_version');

  // Jika pelayar masih mempunyai mock demo daripada sesi pengujian lama, bersihkan cache
  if (existingVersion !== RSVP_SEED_VERSION) {
    localStorage.removeItem('ceu_cache_rsvps');
    localStorage.setItem('ceu_rsvps_version', RSVP_SEED_VERSION);
    AppState.rsvps = [];
    return;
  }

  // Muat rekod sebenar yang telah dihantar oleh agensi (jika ada)
  const storedRsvps = localStorage.getItem('ceu_cache_rsvps');
  if (storedRsvps) {
    try {
      const parsed = JSON.parse(storedRsvps);
      if (Array.isArray(parsed)) {
        AppState.rsvps = parsed;
        return;
      }
    } catch (e) {
      console.warn('Failed parsing cached RSVPs...', e);
    }
  }

  AppState.rsvps = [];
}

// Deduplikasi panggilan API in-flight
const _inflight = {};
let _writeEpoch = 0;

// ============================================
// 2. ENJIN FETCH REST API (CORS-Safe + Turbo)
// ============================================
async function apiCall(action, data = {}, isWrite = false) {
  if (isWrite) {
    _writeEpoch++;
  } else {
    const cacheKey = _writeEpoch + '|' + action + '|' + JSON.stringify(data);
    if (_inflight[cacheKey]) return _inflight[cacheKey];
  }

  const p = (async () => {
    try {
      const payload = {
        action: action,
        data: data,
        token: AppState.token
      };

      // WAJIB: 'Content-Type': 'text/plain;charset=utf-8' mengikut gas-pro-api
      // Timeout dinamik: 15 saat untuk mutasi tulis (submitRSVP/updateEvent), 6 saat untuk bacaan
      const timeoutMs = isWrite ? 15000 : 6000;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const res = await fetch(CONFIG.GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const json = await res.json();
      if (json.code === 'AUTH_EXPIRED') {
        if (AppState.token && !AppState.token.startsWith('auth-')) {
          showToast('Sesi anda telah tamat. Sila log masuk semula.', 'warning');
          logoutUser();
          return { success: false, message: 'Session expired' };
        } else {
          // Token sesi tempatan/demo, kekalkan sesi aktif dan gunakan data tempatan
          return handleOfflineFallback(action, data);
        }
      }

      // Jika backend GAS gagal atau menyekat akaun sementara (rate-limit / lockout / belum diselaraskan)
      if (!json.success && action === 'login') {
        const offlineRes = handleOfflineFallback(action, data);
        if (offlineRes && offlineRes.success) {
          console.warn('Backend GAS out-of-sync or rate-limited. Falling back to official local credentials.');
          return offlineRes;
        }
      }

      if (!json.success && json.message && (json.message.includes('disekat sementara') || json.message.includes('cubaan gagal'))) {
        console.warn('Backend GAS rate-limited. Falling back to local offline authentication.');
        return handleOfflineFallback(action, data);
      }

      return json;
    } catch (err) {
      console.warn('API Error / Offline Fallback:', err.message || err);
      // Fallback offline / cache tempatan jika URL belum disambung atau perlahan
      return handleOfflineFallback(action, data);
    }
  })();

  if (!isWrite) {
    const cacheKey = _writeEpoch + '|' + action + '|' + JSON.stringify(data);
    _inflight[cacheKey] = p;
    p.then(() => delete _inflight[cacheKey], () => delete _inflight[cacheKey]);
  }

  return p;
}

// ============================================
// 3. PENGENDALI ROUTER SPA (0ms Instant Switch)
// Dua Mod Asing: Agensi (Info & RSVP) vs Pentadbir (Papan Pemuka & Urus Acara)
// ============================================
function navigateHomeRole() {
  if (AppState.currentUser && AppState.currentUser.role === 'ADMIN') {
    navigateTo('admin');
  } else {
    navigateTo('home');
  }
}

function navigateTo(viewId, param = null) {
  if (!AppState.currentUser && viewId !== 'login') {
    viewId = 'login';
  } else if (AppState.currentUser) {
    const isAdmin = AppState.currentUser.role === 'ADMIN';
    if (isAdmin) {
      // Mod Pentadbir: Papan Pemuka ('admin'), Urus Program ('adminEvents'), Notifikasi ('notifications'), Profil ('profile')
      if (viewId !== 'admin' && viewId !== 'adminEvents' && viewId !== 'notifications' && viewId !== 'profile') {
        viewId = 'admin';
      }
    } else {
      // Mod Agensi: Info Program ('home'), Borang RSVP ('rsvpForm'), Notifikasi ('notifications'), Profil ('profile')
      if (viewId !== 'home' && viewId !== 'rsvpForm' && viewId !== 'notifications' && viewId !== 'profile') {
        viewId = 'home';
      }
    }
  }

  AppState.currentView = viewId;
  window.location.hash = viewId;

  // Sembunyikan semua skrin serta-merta
  document.querySelectorAll('.view-screen').forEach(el => {
    el.classList.remove('active');
  });

  // Tunjukkan skrin sasaran
  const targetScreen = document.getElementById('screen_' + viewId);
  if (targetScreen) {
    targetScreen.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  // Kemaskini Navigasi (Desktop Top Bar & Mobile Bottom Bar)
  updateBottomNav(viewId);

  // Render view spesifik
  switch (viewId) {
    case 'home':
      renderHomeScreen();
      break;
    case 'rsvpForm':
      renderRsvpFormScreen(param);
      break;
    case 'admin':
      renderAdminDashboard();
      fetchInitialDataSilently();
      break;
    case 'adminEvents':
      renderAdminEventsList();
      break;
    case 'notifications':
      renderNotificationsScreen();
      break;
    case 'profile':
      renderProfileScreen();
      break;
  }
}

function updateBottomNav(viewId) {
  const bottomNav = document.getElementById('bottomNavBar');
  const desktopNav = document.getElementById('desktopNavBar');
  const appHeader = document.getElementById('appHeader');
  const viewport = document.getElementById('appViewport');

  if (viewId === 'login' || !AppState.currentUser) {
    if (bottomNav) bottomNav.style.display = 'none';
    if (desktopNav) desktopNav.style.display = 'none';
    if (appHeader) appHeader.style.display = 'none';
    if (viewport) viewport.classList.remove('admin-mode');
    return;
  }

  const isAdmin = AppState.currentUser.role === 'ADMIN';
  const isEn = typeof I18N !== 'undefined' && I18N.currentLang === 'EN';

  // Desktop Navbar elements
  const desktopNavLinks = document.getElementById('desktopNavLinks');
  const desktopNavModeBadge = document.getElementById('desktopNavModeBadge');
  const desktopAgencyName = document.getElementById('desktopNavAgencyName');
  const desktopUserRole = document.getElementById('desktopNavUserRole');

  if (desktopNavModeBadge) {
    desktopNavModeBadge.innerText = isAdmin 
      ? (isEn ? 'ADMIN MODE' : 'MOD PENTADBIR') 
      : (isEn ? 'AGENCY MODE' : 'MOD AGENSI');
    desktopNavModeBadge.className = isAdmin 
      ? 'text-[9px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full uppercase' 
      : 'text-[9px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full uppercase';
  }

  if (desktopAgencyName) {
    desktopAgencyName.innerText = AppState.currentUser.namaAgensi || (isAdmin ? (isEn ? 'Career Education Unit' : 'Unit Pendidikan Kerjaya') : 'Universiti Brunei Darussalam');
  }

  if (desktopUserRole) {
    desktopUserRole.innerText = isAdmin 
      ? (isEn ? 'CEU Administrator' : 'Pentadbir CEU') 
      : (isEn ? 'Invited Agency' : 'Agensi Jemputan');
  }

  // 1. Render Desktop Navigation Links (HANYA 2 ITEM SAHAJA)
  if (desktopNavLinks) {
    if (isAdmin) {
      desktopNavLinks.innerHTML = `
        <button onclick="navigateTo('admin')" class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${viewId === 'admin' ? 'bg-[#006194] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}">
          <span class="material-symbols-outlined text-[18px]">dashboard</span>
          <span>${isEn ? 'Dashboard' : 'Papan Pemuka'}</span>
        </button>
        <button onclick="navigateTo('adminEvents')" class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${viewId === 'adminEvents' ? 'bg-[#006194] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}">
          <span class="material-symbols-outlined text-[18px]">edit_calendar</span>
          <span>${isEn ? 'Manage Events &amp; Maps' : 'Urus Program &amp; Peta'}</span>
        </button>
      `;
    } else {
      desktopNavLinks.innerHTML = `
        <button onclick="navigateTo('home')" class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${viewId === 'home' ? 'bg-[#148e82] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}">
          <span class="material-symbols-outlined text-[18px]">info</span>
          <span>${isEn ? 'Program Info' : 'Info Program'}</span>
        </button>
        <button onclick="navigateTo('rsvpForm')" class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${viewId === 'rsvpForm' ? 'bg-[#f59e0b] text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}">
          <span class="material-symbols-outlined text-[18px]">how_to_reg</span>
          <span>${isEn ? 'RSVP Form' : 'Borang RSVP'}</span>
        </button>
      `;
    }
  }

  // 2. Render Mobile Bottom Navigation (HANYA 2 ITEM + LOG KELUAR)
  const mobileNavItems = document.getElementById('mobileNavItems');
  if (mobileNavItems) {
    if (isAdmin) {
      mobileNavItems.innerHTML = `
        <button onclick="navigateTo('admin')" class="flex flex-col items-center justify-center transition-all ${viewId === 'admin' ? 'text-[#006194] font-bold' : 'text-slate-400 font-medium'}">
          <div class="px-4 py-1 rounded-full flex items-center justify-center ${viewId === 'admin' ? 'bg-sky-100' : ''}">
            <span class="material-symbols-outlined text-[20px]">dashboard</span>
          </div>
          <span class="text-[10px] mt-0.5">${isEn ? 'Dashboard' : 'Papan Pemuka'}</span>
        </button>

        <button onclick="navigateTo('adminEvents')" class="flex flex-col items-center justify-center transition-all ${viewId === 'adminEvents' ? 'text-[#006194] font-bold' : 'text-slate-400 font-medium'}">
          <div class="px-4 py-1 rounded-full flex items-center justify-center ${viewId === 'adminEvents' ? 'bg-sky-100' : ''}">
            <span class="material-symbols-outlined text-[20px]">edit_calendar</span>
          </div>
          <span class="text-[10px] mt-0.5">${isEn ? 'Manage Events' : 'Urus Program'}</span>
        </button>

        <button onclick="logoutUser()" class="flex flex-col items-center justify-center text-rose-500 font-medium transition-all">
          <div class="px-4 py-1 rounded-full flex items-center justify-center">
            <span class="material-symbols-outlined text-[20px]">logout</span>
          </div>
          <span class="text-[10px] mt-0.5">${isEn ? 'Sign Out' : 'Keluar'}</span>
        </button>
      `;
    } else {
      mobileNavItems.innerHTML = `
        <button onclick="navigateTo('home')" class="flex flex-col items-center justify-center transition-all ${viewId === 'home' ? 'text-[#148e82] font-bold' : 'text-slate-400 font-medium'}">
          <div class="px-4 py-1 rounded-full flex items-center justify-center ${viewId === 'home' ? 'bg-teal-50' : ''}">
            <span class="material-symbols-outlined text-[20px]">info</span>
          </div>
          <span class="text-[10px] mt-0.5">${isEn ? 'Event Info' : 'Info Program'}</span>
        </button>

        <button onclick="navigateTo('rsvpForm')" class="flex flex-col items-center justify-center transition-all ${viewId === 'rsvpForm' ? 'text-[#d97706] font-bold' : 'text-slate-400 font-medium'}">
          <div class="px-4 py-1 rounded-full flex items-center justify-center ${viewId === 'rsvpForm' ? 'bg-amber-100' : ''}">
            <span class="material-symbols-outlined text-[20px]">how_to_reg</span>
          </div>
          <span class="text-[10px] mt-0.5">${isEn ? 'RSVP Form' : 'Borang RSVP'}</span>
        </button>

        <button onclick="logoutUser()" class="flex flex-col items-center justify-center text-rose-500 font-medium transition-all">
          <div class="px-4 py-1 rounded-full flex items-center justify-center">
            <span class="material-symbols-outlined text-[20px]">logout</span>
          </div>
          <span class="text-[10px] mt-0.5">${isEn ? 'Sign Out' : 'Keluar'}</span>
        </button>
      `;
    }
  }

  // Tunjukkan Nav yang sesuai mengikut lebar skrin
  const isDesktop = window.innerWidth >= 768;
  if (isDesktop) {
    if (desktopNav) desktopNav.style.display = 'block';
    if (bottomNav) bottomNav.style.display = 'none';
    if (appHeader) appHeader.style.display = 'none';
  } else {
    if (desktopNav) desktopNav.style.display = 'none';
    if (bottomNav) bottomNav.style.display = 'block';
    if (appHeader) appHeader.style.display = (viewId === 'home' || viewId === 'admin') ? 'none' : 'block';
  }

  // Mod Pentadbir Lebar Maksimum di Skrin Komputer
  if (viewport) {
    if (isAdmin) {
      viewport.classList.add('admin-mode');
    } else {
      viewport.classList.remove('admin-mode');
    }
  }
}

window.addEventListener('resize', () => {
  if (AppState.currentView) {
    updateBottomNav(AppState.currentView);
  }
});

// ============================================
// 4. AUTENTIKASI: LOG MASUK & KELUAR
// ============================================
function switchLoginMode(mode) {
  const tabAgency = document.getElementById('tabModeAgency');
  const tabAdmin = document.getElementById('tabModeAdmin');
  const usernameInput = document.getElementById('loginUsername');
  const passwordInput = document.getElementById('loginPassword');
  const labelUsername = document.getElementById('labelLoginUsername');
  const subtitle = document.getElementById('loginModeSubtitle');
  const btnSubmit = document.getElementById('btnLoginSubmit');
  const defaultHint = document.getElementById('loginDefaultHint');
  const isEn = typeof I18N !== 'undefined' && I18N.currentLang === 'EN';

  if (mode === 'ADMIN') {
    if (tabAdmin) {
      tabAdmin.className = 'flex-1 py-2 text-xs font-bold rounded-lg bg-[#006194] text-white shadow-sm flex items-center justify-center gap-1.5 transition-all';
      tabAdmin.innerHTML = `<span class="material-symbols-outlined text-[17px]">shield_person</span><span>${isEn ? 'CEU Admin Mode' : 'Mod Pentadbir CEU'}</span>`;
    }
    if (tabAgency) {
      tabAgency.className = 'flex-1 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1.5 transition-all';
      tabAgency.innerHTML = `<span class="material-symbols-outlined text-[17px]">domain</span><span>${isEn ? 'Invited Agency Mode' : 'Mod Agensi Jemputan'}</span>`;
    }
    
    if (usernameInput) {
      usernameInput.placeholder = isEn ? 'e.g., admin_ceu' : 'cth: admin_ceu';
    }
    if (passwordInput) {
      passwordInput.placeholder = isEn ? 'Enter administrator password...' : 'Masukkan kata laluan pentadbir...';
    }
    if (labelUsername) {
      labelUsername.innerHTML = `<span>${isEn ? 'CEU Admin ID' : 'ID Pentadbir CEU'}</span><span class="text-[11px] text-primary font-medium">${isEn ? 'Manage Events' : 'Urus Acara'}</span>`;
    }
    if (subtitle) {
      subtitle.innerText = isEn 
        ? 'Administrator log in to monitor dashboard and manage event calendar.'
        : 'Log masuk pentadbir untuk memantau papan pemuka dan mengurus takwim program.';
    }
    if (btnSubmit) {
      btnSubmit.className = 'w-full h-12 mt-1 rounded-xl bg-gradient-to-r from-[#006194] to-[#0284c7] text-white font-bold text-xs tracking-wider uppercase shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2';
      btnSubmit.innerHTML = `<span>${isEn ? 'ADMINISTRATOR LOG IN' : 'LOG MASUK PENTADBIR'}</span><span class="material-symbols-outlined text-[18px]">arrow_forward</span>`;
    }
    if (defaultHint) {
      defaultHint.innerText = isEn ? 'Career Education Unit · JSS · MOE' : 'Unit Pendidikan Kerjaya · JSS · MOE';
    }
  } else {
    if (tabAgency) {
      tabAgency.className = 'flex-1 py-2 text-xs font-bold rounded-lg bg-[#148e82] text-white shadow-sm flex items-center justify-center gap-1.5 transition-all';
      tabAgency.innerHTML = `<span class="material-symbols-outlined text-[17px]">domain</span><span>${isEn ? 'Invited Agency Mode' : 'Mod Agensi Jemputan'}</span>`;
    }
    if (tabAdmin) {
      tabAdmin.className = 'flex-1 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1.5 transition-all';
      tabAdmin.innerHTML = `<span class="material-symbols-outlined text-[17px]">shield_person</span><span>${isEn ? 'CEU Admin Mode' : 'Mod Pentadbir CEU'}</span>`;
    }
    
    if (usernameInput) {
      usernameInput.placeholder = isEn ? 'e.g., agensi_ubd' : 'cth: agensi_ubd';
    }
    if (passwordInput) {
      passwordInput.placeholder = isEn ? 'Enter official password...' : 'Masukkan kata laluan rasmi...';
    }
    if (labelUsername) {
      labelUsername.innerHTML = `<span>${isEn ? 'Agency Username' : 'Nama Pengguna Agensi'}</span><span class="text-[11px] text-primary font-medium">${isEn ? 'Institution ID' : 'ID Institusi'}</span>`;
    }
    if (subtitle) {
      subtitle.innerText = isEn 
        ? 'Agency log in to view event details, floor plan, parking & RSVP confirmation.'
        : 'Log masuk agensi untuk melihat maklumat program, pelan dewan, parking & pengesahan RSVP.';
    }
    if (btnSubmit) {
      btnSubmit.className = 'w-full h-12 mt-1 rounded-xl bg-gradient-to-r from-tertiary-container via-tertiary to-gold-hover text-on-primary font-bold text-xs tracking-wider uppercase shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2';
      btnSubmit.innerHTML = `<span>${isEn ? 'AGENCY LOG IN' : 'LOG MASUK AGENSI'}</span><span class="material-symbols-outlined text-[18px]">arrow_forward</span>`;
    }
    if (defaultHint) {
      defaultHint.innerText = isEn ? 'Official Portal UPK · JSS · MOE' : 'Portal Rasmi UPK · JSS · MOE';
    }
  }
}

async function handleLoginSubmit(event) {
  if (event && event.preventDefault) event.preventDefault();
  const usernameInput = document.getElementById('loginUsername');
  const passwordInput = document.getElementById('loginPassword');
  const loginBtn = document.getElementById('btnLoginSubmit');

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();
  const isEn = typeof I18N !== 'undefined' && I18N.currentLang === 'EN';

  if (!username || !password) {
    showToast(isEn ? 'Please enter username and password.' : 'Sila masukkan nama pengguna dan kata laluan.', 'error');
    return;
  }

  loginBtn.disabled = true;
  loginBtn.innerText = I18N.t('loggingIn');

  const res = await apiCall('login', { username, password }, true);

  loginBtn.disabled = false;
  loginBtn.innerText = I18N.t('loginBtn');

  if (res.success) {
    AppState.currentUser = res.user;
    AppState.token = res.token;
    localStorage.setItem('ceu_user', JSON.stringify(res.user));
    localStorage.setItem('ceu_token', res.token);

    showToast(isEn ? 'Login successful!' : (res.message || 'Log masuk berjaya!'), 'success');

    // Halakan mengikut peranan pengguna
    if (res.user.role === 'ADMIN') {
      navigateTo('admin');
    } else {
      navigateTo('home');
    }

    // Muat semula data di latar belakang
    fetchInitialDataSilently();
  } else {
    showToast(isEn ? 'Invalid username or password.' : (res.message || 'Nama pengguna atau kata laluan salah.'), 'error');
  }
}

function logoutUser() {
  const isEn = typeof I18N !== 'undefined' && I18N.currentLang === 'EN';
  AppState.currentUser = null;
  AppState.token = '';
  localStorage.removeItem('ceu_user');
  localStorage.removeItem('ceu_token');
  showToast(isEn ? 'You have logged out successfully.' : 'Anda telah berjaya log keluar.', 'info');
  navigateTo('login');
}

// ============================================
// 5. RENDERING SKRIN 02: INFO PROGRAM AGENSI & TAKWIM 32 SESI
// ============================================
let homeCategoryFilter = 'ALL';
let homeDistrictFilter = 'ALL';

let homeCalendarCurrentDate = null;

function sortEventsChronologically(list) {
  return (list || []).slice().sort((a, b) => (a.Tarikh_Mula || '').localeCompare(b.Tarikh_Mula || ''));
}

function syncCalendarToActiveEvent() {
  const activeEv = AppState.activeEvent || (AppState.events && AppState.events[0]) || getFallbackEvents()[0];
  if (activeEv && activeEv.Tarikh_Mula) {
    const p = activeEv.Tarikh_Mula.split('-');
    homeCalendarCurrentDate = new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
  } else {
    homeCalendarCurrentDate = new Date(2027, 0, 25);
  }
  renderHomeMiniCalendar();
}

function navigateHomeCalendarWeek(direction) {
  if (!homeCalendarCurrentDate) {
    syncCalendarToActiveEvent();
  }
  homeCalendarCurrentDate.setDate(homeCalendarCurrentDate.getDate() + (direction * 7));
  renderHomeMiniCalendar();
}

function renderHomeMiniCalendar() {
  const daysContainer = document.getElementById('homeMiniCalDaysContainer');
  const monthEl = document.getElementById('homeMiniCalMonth');
  const weekEl = document.getElementById('homeMiniCalWeek');
  if (!daysContainer) return;

  const isEn = typeof I18N !== 'undefined' && I18N.currentLang === 'EN';
  
  if (!homeCalendarCurrentDate) {
    const activeEv = AppState.activeEvent || (AppState.events && AppState.events[0]);
    if (activeEv && activeEv.Tarikh_Mula) {
      const p = activeEv.Tarikh_Mula.split('-');
      homeCalendarCurrentDate = new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
    } else {
      homeCalendarCurrentDate = new Date(2027, 0, 25);
    }
  }

  // Hari Ahad bagi minggu ini (Sunday)
  const curr = new Date(homeCalendarCurrentDate.getTime());
  const dayOfWeek = curr.getDay(); // 0 = Ahad
  const sunday = new Date(curr);
  sunday.setDate(curr.getDate() - dayOfWeek);
  sunday.setHours(0, 0, 0, 0);

  const saturday = new Date(sunday);
  saturday.setDate(sunday.getDate() + 6);

  // Tentukan nama bulan & tahun mengikut pertengahan minggu (Rabu)
  const midWeek = new Date(sunday);
  midWeek.setDate(sunday.getDate() + 3);
  const mIndex = midWeek.getMonth();
  const yearNum = midWeek.getFullYear();

  const monthNamesBm = ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];
  const monthNamesEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthName = isEn ? monthNamesEn[mIndex] : monthNamesBm[mIndex];

  if (monthEl) monthEl.innerText = `${monthName} ${yearNum}`;

  const pad = (n) => n < 10 ? '0' + n : '' + n;
  if (weekEl) {
    weekEl.innerText = `${pad(sunday.getDate())}/${pad(sunday.getMonth()+1)} - ${pad(saturday.getDate())}/${pad(saturday.getMonth()+1)}`;
  }

  const dayNamesBm = ['Aha', 'Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab'];
  const dayNamesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayNames = isEn ? dayNamesEn : dayNamesBm;

  const events = AppState.events || [];
  const activeTarikh = AppState.activeEvent ? AppState.activeEvent.Tarikh_Mula : '';

  let daysHtml = '';
  for (let i = 0; i < 7; i++) {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    const dateStr = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
    const dayName = dayNames[i];
    const dayNumber = pad(d.getDate());

    const matchingEv = events.find(e => e.Tarikh_Mula === dateStr);
    const isActive = activeTarikh === dateStr;

    if (isActive) {
      daysHtml += `
        <div onclick="${matchingEv ? `selectActiveEvent('${matchingEv.Event_ID}')` : ''}" class="flex flex-col items-center py-1.5 px-0.5 rounded-xl bg-[#f59e0b] text-slate-900 shadow-md ring-2 ring-amber-300 font-bold cursor-pointer transition-transform active:scale-95" title="${matchingEv ? (matchingEv.Sekolah || matchingEv.Nama_Acara) : ''}">
          <span class="text-[9px] font-bold text-slate-900">${dayName}</span>
          <span class="text-xs font-black text-slate-900">${dayNumber}</span>
          <span class="w-1.5 h-1.5 rounded-full bg-slate-900 mt-0.5"></span>
        </div>
      `;
    } else if (matchingEv) {
      daysHtml += `
        <div onclick="selectActiveEvent('${matchingEv.Event_ID}'); window.scrollTo({top: 0, behavior: 'smooth'});" class="flex flex-col items-center py-1.5 px-0.5 rounded-xl bg-white/20 hover:bg-white/35 text-white font-bold cursor-pointer border border-amber-300/40 transition-transform active:scale-95 shadow-xs" title="Sesi: ${matchingEv.Sekolah || matchingEv.Nama_Acara}">
          <span class="text-[9px] text-amber-200">${dayName}</span>
          <span class="text-xs font-extrabold text-white">${dayNumber}</span>
          <span class="w-1.5 h-1.5 rounded-full bg-amber-400 mt-0.5"></span>
        </div>
      `;
    } else {
      daysHtml += `
        <div class="flex flex-col items-center py-1.5 px-0.5 rounded-xl bg-white/10 text-white/70">
          <span class="text-[9px] text-white/70">${dayName}</span>
          <span class="text-xs font-semibold text-white/90">${dayNumber}</span>
          <span class="w-1 h-1 rounded-full bg-transparent mt-0.5"></span>
        </div>
      `;
    }
  }

  daysContainer.innerHTML = daysHtml;
}

function selectActiveEvent(eventId) {
  const ev = (AppState.events || []).find(e => e.Event_ID === eventId);
  if (ev) {
    AppState.activeEvent = ev;
    if (ev.Tarikh_Mula) {
      const p = ev.Tarikh_Mula.split('-');
      homeCalendarCurrentDate = new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
    }
    const dropdown = document.getElementById('homeSessionDropdown');
    if (dropdown) dropdown.value = eventId;
    const rsvpSelector = document.getElementById('rsvpSessionSelector');
    if (rsvpSelector) rsvpSelector.value = eventId;
    if (AppState.currentView === 'home') {
      renderHomeScreen(false);
    }
  }
}

function setHomeCategoryFilter(cat) {
  homeCategoryFilter = cat;
  const btnAll = document.getElementById('filterCat_ALL');
  const btnPht = document.getElementById('filterCat_PHT');
  const btnFl = document.getElementById('filterCat_FL');
  [btnAll, btnPht, btnFl].forEach(b => {
    if (b) b.className = 'px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 shrink-0 transition-all';
  });
  const activeBtn = cat === 'ALL' ? btnAll : (cat === 'Program Hala Tuju' ? btnPht : btnFl);
  if (activeBtn) {
    activeBtn.className = 'px-3 py-1 rounded-full text-xs font-bold bg-[#148e82] text-white shadow-sm shrink-0 transition-all';
  }
  renderHomeScheduleList();
}

function setHomeDistrictFilter(dist) {
  homeDistrictFilter = dist;
  const ids = ['filterDist_ALL', 'filterDist_BM', 'filterDist_Tutong', 'filterDist_Belait', 'filterDist_Temburong'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.className = 'px-2.5 py-1 rounded-lg text-[11px] font-medium text-slate-600 hover:bg-slate-100 shrink-0 transition-all';
  });
  let activeId = 'filterDist_ALL';
  if (dist === 'Brunei Muara') activeId = 'filterDist_BM';
  else if (dist === 'Tutong') activeId = 'filterDist_Tutong';
  else if (dist === 'Belait') activeId = 'filterDist_Belait';
  else if (dist === 'Temburong') activeId = 'filterDist_Temburong';

  const activeEl = document.getElementById(activeId);
  if (activeEl) {
    activeEl.className = 'px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-200 text-slate-800 shrink-0 transition-all';
  }
  renderHomeScheduleList();
}

function renderHomeScreen(populateDropdown = true) {
  const user = AppState.currentUser;
  if (!user) return;
  const isEn = typeof I18N !== 'undefined' && I18N.currentLang === 'EN';

  // 1. Sapaan mengikut NAMA AGENSI (Bukan nama individu)
  const agencyNameEl = document.getElementById('homeAgencyName');
  if (agencyNameEl) {
    agencyNameEl.innerText = user.namaAgensi || 'UNIVERSITI BRUNEI DARUSSALAM';
  }

  // 2. Metrik Pantas daripada Cache (Pastikan 31 Sesi Tersusun Kronologi & Bebas Maktab Duli)
  if (AppState.events && AppState.events.length > 0) {
    AppState.events = AppState.events.filter(e => e.Event_ID !== 'EVT-FL-05' && !e.Nama_Acara.includes('Maktab Duli'));
  }
  if (!AppState.events || AppState.events.length < 31) {
    AppState.events = getFallbackEvents();
  }
  AppState.events = sortEventsChronologically(AppState.events);
  localStorage.setItem('ceu_cache_events', JSON.stringify(AppState.events));

  if (!AppState.activeEvent || AppState.activeEvent.Event_ID === 'EVT-FL-05' || AppState.activeEvent.Nama_Acara.includes('Maktab Duli')) {
    AppState.activeEvent = AppState.events[0];
  }
  const primaryEvent = AppState.activeEvent;

  // Render Mini Kalendar Interaktif (Aktifkan dinamik mengikut sesi)
  renderHomeMiniCalendar();

  // Kemas kini Kad Metrik 1, 2, 3
  const mCount1 = document.getElementById('homeMetricCount1');
  const mLabel1 = document.getElementById('homeMetricLabel1');
  const totalSessions = AppState.events.length || 31;
  if (mCount1) mCount1.innerText = totalSessions;
  if (mLabel1) mLabel1.innerText = isEn ? 'Official Takwim Sessions' : 'Jumlah Sesi Takwim';

  const userHadirRsvps = (AppState.rsvps || []).filter(r => isAgencyMatch(r.Agensi_ID, user) && (r.Status_RSVP === 'Hadir' || r.Status_RSVP === 'Hadir (Disahkan)'));
  const userTidakHadirRsvps = (AppState.rsvps || []).filter(r => isAgencyMatch(r.Agensi_ID, user) && r.Status_RSVP === 'Tidak Hadir');
  const totalResponded = userHadirRsvps.length + userTidakHadirRsvps.length;
  const pendingCount = Math.max(0, totalSessions - totalResponded);

  const mCount2 = document.getElementById('homeMetricCount2');
  const mLabel2 = document.getElementById('homeMetricLabel2');
  if (mCount2) mCount2.innerText = (userHadirRsvps.length < 10 ? '0' : '') + userHadirRsvps.length;
  if (mLabel2) mLabel2.innerText = isEn ? 'Confirmed Attending' : 'Selesai Hadir';

  const mCount3 = document.getElementById('homeMetricCount3');
  const mLabel3 = document.getElementById('homeMetricLabel3');
  if (mCount3) mCount3.innerText = (pendingCount < 10 ? '0' : '') + pendingCount;
  if (mLabel3) mLabel3.innerText = isEn ? 'Pending RSVP Action' : 'Perlu Tindakan RSVP';

  // 3. Dropdown Pemilih 31 Sesi
  const dropdown = document.getElementById('homeSessionDropdown');
  if (dropdown && populateDropdown) {
    dropdown.innerHTML = AppState.events.map(ev => {
      const isSelected = ev.Event_ID === primaryEvent.Event_ID ? 'selected' : '';
      const prefix = ev.Kategori_Program === 'Program FutureLink' ? '[FutureLink]' : '[Hala Tuju]';
      const displayDate = formatDisplayDate(ev.Tarikh_Paparan || ev.Tarikh_Mula, isEn);
      const distStr = isEn ? `${ev.Daerah} District` : `Daerah ${ev.Daerah}`;
      return `<option value="${ev.Event_ID}" ${isSelected}>${prefix} ${displayDate} - ${ev.Sekolah || ev.Nama_Acara} (${distStr})</option>`;
    }).join('');
  } else if (dropdown) {
    dropdown.value = primaryEvent.Event_ID;
  }

  // 4. Render Hero Event Card
  const heroCardContainer = document.getElementById('homeHeroCardArea');
  if (heroCardContainer && primaryEvent) {
    const userRsvp = (AppState.rsvps || []).find(r => r.Event_ID === primaryEvent.Event_ID && isAgencyMatch(r.Agensi_ID, user));
    const isAttending = userRsvp && (userRsvp.Status_RSVP === 'Hadir' || userRsvp.Status_RSVP === 'Hadir (Disahkan)');
    const isNotAttending = userRsvp && userRsvp.Status_RSVP === 'Tidak Hadir';
    const isBelait = primaryEvent.Daerah === 'Belait';

    let statusBadge = '';
    if (isAttending) {
      statusBadge = isEn 
        ? '<span class="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>RSVP Confirmed</span>' 
        : '<span class="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>RSVP Disahkan</span>';
    } else if (isNotAttending) {
      statusBadge = isEn
        ? '<span class="bg-rose-100 text-rose-800 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-rose-600"></span>Not Attending</span>'
        : '<span class="bg-rose-100 text-rose-800 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-rose-600"></span>Tidak Hadir</span>';
    } else {
      statusBadge = isEn
        ? '<span class="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-amber-600"></span>Confirmation Required</span>'
        : '<span class="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-amber-600"></span>Perlu Pengesahan</span>';
    }

    heroCardContainer.innerHTML = `
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        <!-- Lencana Atas & Butang Simpan (Bookmark) -->
        <div class="p-3 pb-2 flex items-center justify-between gap-2">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="bg-[#fef3c7] text-[#92400e] text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <span class="material-symbols-outlined text-[13px]">verified</span>
              ${primaryEvent.Kategori_Program}
            </span>
            <span class="bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-full">
              ${isEn ? `${primaryEvent.Daerah} District` : `Daerah ${primaryEvent.Daerah}`}
            </span>
            ${statusBadge}
          </div>
          <span class="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded">${primaryEvent.Event_ID}</span>
        </div>

        <!-- Imej Dewan berserta Lencana Lokasi Khas -->
        <div class="relative w-full h-40 md:h-56 bg-slate-100 px-3">
          <div class="w-full h-full rounded-xl overflow-hidden relative shadow-inner">
            <img src="${primaryEvent.Pelan_Sekolah_URL || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80'}" class="w-full h-full object-cover" alt="Venue Cover" />
            <div class="absolute bottom-2 left-2 right-2 bg-slate-900/85 backdrop-blur-sm text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg flex items-center justify-between shadow-md">
              <div class="flex items-center gap-1.5 truncate">
                <span class="material-symbols-outlined text-[14px] text-amber-400">apartment</span>
                <span class="truncate">${primaryEvent.Tempat_Venue}</span>
              </div>
              <span class="text-[10px] text-teal-300 font-bold shrink-0">${isEn ? 'Agency Parking' : 'Parking Agensi'}</span>
            </div>
          </div>
        </div>

        <!-- Maklumat Acara & Butang Aksi -->
        <div class="p-3.5 flex flex-col gap-2">
          <span class="text-[10px] font-bold text-[#148e82] uppercase tracking-wider">
            ${isEn ? 'DEPARTMENT OF SCHOOLS • CAREER EDUCATION UNIT' : 'JABATAN SEKOLAH-SEKOLAH • UNIT PENDIDIKAN KERJAYA'}
          </span>
          <h2 class="text-sm md:text-base font-bold text-slate-900 leading-snug">
            ${primaryEvent.Sekolah || primaryEvent.Nama_Acara}
          </h2>
          <p class="text-[11px] text-slate-500 leading-relaxed">
            ${primaryEvent.Catatan_Khas || (isEn ? 'Coordination of career assessment guidelines and agency exhibition booth setup.' : 'Penyelarasan garis panduan penilaian kerjaya dan persediaan meja pameran agensi.')}
          </p>

          <!-- Kotak Tarikh, Masa & Venue -->
          <div class="grid grid-cols-2 gap-2 pt-1 text-xs">
            <div class="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
              <span class="material-symbols-outlined text-[#148e82] text-[18px]">calendar_month</span>
              <div class="flex flex-col min-w-0">
                <span class="text-[9px] text-slate-400 font-medium">${isEn ? 'Date' : 'Tarikh'}</span>
                <span class="text-[11px] font-bold text-slate-800 truncate">${formatDisplayDate(primaryEvent.Tarikh_Paparan || primaryEvent.Tarikh_Mula, isEn)}</span>
              </div>
            </div>
            <div class="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
              <span class="material-symbols-outlined text-[#148e82] text-[18px]">schedule</span>
              <div class="flex flex-col min-w-0">
                <span class="text-[9px] text-slate-400 font-medium">${isEn ? 'Session Time' : 'Masa Sesi'}</span>
                <span class="text-[11px] font-bold ${isBelait ? 'text-amber-800' : 'text-slate-800'} truncate">${primaryEvent.Masa}</span>
              </div>
            </div>
          </div>

          <!-- Butang Pengesahan Kehadiran (RSVP), Muat Turun Surat & WhatsApp -->
          <div class="flex items-center gap-2 pt-2 flex-wrap">
            <button onclick="navigateTo('rsvpForm', '${primaryEvent.Event_ID}')" class="flex-1 h-11 bg-gradient-to-r from-[#f59e0b] to-[#d97706] hover:from-[#d97706] hover:to-[#b45309] text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 transition-all">
              <span class="material-symbols-outlined text-[18px]">how_to_reg</span>
              <span>${(isAttending || isNotAttending) ? (isEn ? 'Update RSVP for this Session' : 'Kemaskini RSVP Sesi Ini') : (isEn ? 'Confirm Attendance (RSVP)' : 'Sahkan Kehadiran (RSVP)')}</span>
            </button>
            <button onclick="openDocumentGeneratorModal()" class="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors shadow-sm shrink-0" title="${isEn ? 'Download Official QR Letter' : 'Muat Turun Surat Rasmi Ber-QR'}">
              <span class="material-symbols-outlined text-[20px]">description</span>
            </button>
            ${(isAttending || isNotAttending) ? `
              <button onclick="shareRsvpWhatsApp('${primaryEvent.Event_ID}')" class="h-11 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all shrink-0" title="${isEn ? 'Send Notification to WhatsApp' : 'Hantar Notifikasi ke WhatsApp'}">
                <span class="material-symbols-outlined text-[18px]">chat</span>
                <span class="hidden sm:inline">WhatsApp</span>
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  // 5. Render Takwim Penuh 32 Sesi
  renderHomeScheduleList();
}

let homeCalendarView = 'ALL'; // 'ALL', 'MONTHLY', 'WEEKLY'
let homeCalendarMonth = 'ALL'; // 'ALL', '01', '02', '03', '04', '06', '07'

function setHomeCalendarView(viewMode) {
  homeCalendarView = viewMode;
  ['viewMode_ALL', 'viewMode_MONTHLY', 'viewMode_WEEKLY'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.className = 'px-2.5 py-1 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900 transition-all flex items-center gap-1';
    }
  });
  const activeEl = document.getElementById('viewMode_' + viewMode);
  if (activeEl) {
    activeEl.className = 'px-2.5 py-1 text-xs font-bold rounded-lg bg-white text-slate-900 shadow-sm transition-all flex items-center gap-1';
  }

  const monthPills = document.getElementById('homeCalendarMonthPills');
  if (monthPills) {
    monthPills.style.display = viewMode === 'WEEKLY' ? 'none' : 'flex';
  }

  renderHomeScheduleList();
}

function setHomeCalendarMonth(monthStr) {
  homeCalendarMonth = monthStr;
  const monthIds = ['pillMonth_ALL', 'pillMonth_01', 'pillMonth_02', 'pillMonth_03', 'pillMonth_04', 'pillMonth_05', 'pillMonth_06', 'pillMonth_07'];
  monthIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.className = 'px-2.5 py-0.5 rounded-lg font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 shrink-0';
  });
  const activeEl = document.getElementById('pillMonth_' + monthStr);
  if (activeEl) {
    activeEl.className = 'px-2.5 py-0.5 rounded-lg font-bold bg-[#148e82] text-white shrink-0';
  }

  // Jika memilih bulan khusus, selaraskan kalendar ke bulan tersebut
  if (monthStr !== 'ALL') {
    const firstInMonth = (AppState.events || []).find(e => (e.Tarikh_Mula || '').slice(5, 7) === monthStr);
    if (firstInMonth && firstInMonth.Tarikh_Mula) {
      const p = firstInMonth.Tarikh_Mula.split('-');
      homeCalendarCurrentDate = new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
    } else {
      homeCalendarCurrentDate = new Date(2027, parseInt(monthStr, 10) - 1, 1);
    }
    renderHomeMiniCalendar();
  }

  renderHomeScheduleList();
}

function renderEventCardHtml(ev) {
  const isEn = typeof I18N !== 'undefined' && I18N.currentLang === 'EN';
  const isCurrentActive = AppState.activeEvent && AppState.activeEvent.Event_ID === ev.Event_ID;
  const user = AppState.currentUser;
  const userRsvp = user ? (AppState.rsvps || []).find(r => r.Event_ID === ev.Event_ID && isAgencyMatch(r.Agensi_ID, user)) : null;
  const isAttending = userRsvp && (userRsvp.Status_RSVP === 'Hadir' || userRsvp.Status_RSVP === 'Hadir (Disahkan)');
  const isNotAttending = userRsvp && userRsvp.Status_RSVP === 'Tidak Hadir';
  const isBelait = ev.Daerah === 'Belait';
  const monthCode = (ev.Tarikh_Mula || '').slice(5, 7);
  const monthNames = isEn 
    ? { '01': 'JAN', '02': 'FEB', '03': 'MAR', '04': 'APR', '05': 'MAY', '06': 'JUN', '07': 'JUL' }
    : { '01': 'JAN', '02': 'FEB', '03': 'MAC', '04': 'APR', '05': 'MEI', '06': 'JUN', '07': 'JUL' };

  let statusBadgeHtml = '';
  if (isAttending) {
    statusBadgeHtml = `<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>${isEn ? 'Attending' : 'RSVP Hadir'}</span>`;
  } else if (isNotAttending) {
    statusBadgeHtml = `<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-rose-600"></span>${isEn ? 'Not Attending' : 'Tidak Hadir'}</span>`;
  } else {
    statusBadgeHtml = `<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60">${isEn ? 'Pending' : 'Belum Sah'}</span>`;
  }

  return `
    <div class="bg-white p-3.5 rounded-2xl border ${isCurrentActive ? 'border-[#148e82] ring-2 ring-[#148e82]/20' : 'border-slate-200/80'} shadow-sm hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div class="flex items-start gap-3 flex-1 min-w-0">
        <div class="w-12 h-12 rounded-xl ${ev.Kategori_Program === 'Program FutureLink' ? 'bg-amber-50 text-amber-800' : 'bg-teal-50 text-[#148e82]'} flex flex-col items-center justify-center font-bold text-center shrink-0 border border-slate-100">
          <span class="text-[9px] uppercase tracking-tighter">${monthNames[monthCode] || '2027'}</span>
          <span class="text-base leading-none font-black">${(ev.Tarikh_Mula || '').slice(8, 10)}</span>
        </div>
        <div class="flex flex-col min-w-0">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${ev.Kategori_Program === 'Program FutureLink' ? 'bg-amber-100 text-amber-800' : 'bg-teal-100 text-teal-800'}">${ev.Kategori_Program}</span>
            <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">${isEn ? `${ev.Daerah} District` : `Daerah ${ev.Daerah}`}</span>
            ${statusBadgeHtml}
          </div>
          <h4 class="text-xs md:text-sm font-bold text-slate-900 mt-1 leading-snug truncate">${ev.Sekolah || ev.Nama_Acara}</h4>
          <div class="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5 flex-wrap">
            <span>📅 ${formatDisplayDate(ev.Tarikh_Paparan || ev.Tarikh_Mula, isEn)}</span>
            <span class="${isBelait ? 'font-bold text-amber-800' : ''}">🕒 ${ev.Masa}</span>
          </div>
          <span class="text-[11px] text-slate-600 truncate flex items-center gap-1 mt-0.5">
            <span class="material-symbols-outlined text-[13px] text-slate-400">location_on</span>
            ${ev.Tempat_Venue}
          </span>
        </div>
      </div>

      <div class="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 flex-wrap">
        <button onclick="selectActiveEvent('${ev.Event_ID}'); window.scrollTo({top: 0, behavior: 'smooth'});" class="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all flex items-center gap-1">
          <span class="material-symbols-outlined text-[15px]">visibility</span>
          <span>${isEn ? 'Select' : 'Pilih'}</span>
        </button>
        <button onclick="navigateTo('rsvpForm', '${ev.Event_ID}')" class="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-white font-bold text-xs shadow-sm hover:shadow transition-all flex items-center gap-1">
          <span class="material-symbols-outlined text-[15px]">how_to_reg</span>
          <span>${isAttending ? (isEn ? 'Update' : 'Kemaskini') : (isEn ? 'RSVP Now' : 'RSVP Sesi Ini')}</span>
        </button>
        ${isAttending ? `
          <button onclick="shareRsvpWhatsApp('${ev.Event_ID}')" class="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center justify-center transition-all shadow-sm" title="Kongsi RSVP ke WhatsApp">
            <span class="material-symbols-outlined text-[16px]">chat</span>
          </button>
        ` : ''}
      </div>
    </div>
  `;
}

function renderHomeScheduleList() {
  const container = document.getElementById('homeScheduleListContainer');
  if (!container) return;
  const isEn = typeof I18N !== 'undefined' && I18N.currentLang === 'EN';

  const searchInput = document.getElementById('homeScheduleSearch');
  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

  let list = AppState.events.length ? AppState.events : getFallbackEvents();

  // Pastikan Maktab Duli / EVT-FL-05 tidak dipaparkan
  list = list.filter(e => e.Event_ID !== 'EVT-FL-05' && !(e.Nama_Acara || '').includes('Maktab Duli'));

  if (homeCategoryFilter && homeCategoryFilter !== 'ALL') {
    list = list.filter(e => e.Kategori_Program === homeCategoryFilter);
  }
  if (homeDistrictFilter && homeDistrictFilter !== 'ALL') {
    list = list.filter(e => e.Daerah === homeDistrictFilter);
  }
  if (homeCalendarMonth && homeCalendarMonth !== 'ALL') {
    list = list.filter(e => (e.Tarikh_Mula || '').slice(5, 7) === homeCalendarMonth);
  }
  if (query) {
    list = list.filter(e => 
      (e.Nama_Acara || '').toLowerCase().includes(query) ||
      (e.Sekolah || '').toLowerCase().includes(query) ||
      (e.Tempat_Venue || '').toLowerCase().includes(query) ||
      (e.Daerah || '').toLowerCase().includes(query) ||
      (e.Tarikh_Paparan || '').toLowerCase().includes(query)
    );
  }

  if (list.length === 0) {
    container.innerHTML = `
      <div class="bg-white p-6 rounded-2xl border border-slate-200/80 text-center text-slate-400">
        <span class="material-symbols-outlined text-[32px] block mb-1">event_busy</span>
        <p class="text-xs">${isEn ? 'No school sessions found matching this filter.' : 'Tiada sesi sekolah ditemui padanan tapisan ini.'}</p>
      </div>
    `;
    return;
  }

  // 1. PAPARAN BULANAN (MONTHLY VIEW)
  if (homeCalendarView === 'MONTHLY') {
    const monthMap = isEn ? [
      { code: '01', name: 'January 2027' },
      { code: '02', name: 'February 2027' },
      { code: '03', name: 'March 2027' },
      { code: '04', name: 'April 2027' },
      { code: '05', name: 'May 2027' },
      { code: '06', name: 'June 2027' },
      { code: '07', name: 'July 2027' }
    ] : [
      { code: '01', name: 'Januari 2027' },
      { code: '02', name: 'Februari 2027' },
      { code: '03', name: 'Mac 2027' },
      { code: '04', name: 'April 2027' },
      { code: '05', name: 'Mei 2027' },
      { code: '06', name: 'Jun 2027' },
      { code: '07', name: 'Julai 2027' }
    ];

    let html = '';
    monthMap.forEach(m => {
      const monthEvents = list.filter(e => (e.Tarikh_Mula || '').slice(5, 7) === m.code);
      if (monthEvents.length > 0) {
        html += `
          <div class="flex flex-col gap-2 pt-2">
            <div class="flex items-center justify-between bg-slate-100/90 px-3.5 py-2 rounded-xl border border-slate-200/60 shadow-xs">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-[18px] text-[#148e82]">calendar_month</span>
                <span class="text-xs font-bold text-slate-800 uppercase tracking-wide">${m.name}</span>
              </div>
              <span class="text-[10px] font-bold bg-white text-slate-700 px-2.5 py-0.5 rounded-full shadow-xs border border-slate-200/50">${monthEvents.length} ${isEn ? 'School Sessions' : 'Sesi Sekolah'}</span>
            </div>
            <div class="flex flex-col gap-2">
              ${monthEvents.map(renderEventCardHtml).join('')}
            </div>
          </div>
        `;
      }
    });
    container.innerHTML = html || `<div class="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-400"><p class="text-xs">${isEn ? 'No sessions for this month.' : 'Tiada sesi untuk bulan ini.'}</p></div>`;
    return;
  }

  // 2. PAPARAN MINGGUAN (WEEKLY VIEW)
  if (homeCalendarView === 'WEEKLY') {
    const getWeekKey = (dateStr) => {
      if (!dateStr) return isEn ? 'Other' : 'Lain-lain';
      const parts = dateStr.split('-');
      if (parts.length < 3) return isEn ? 'Other' : 'Lain-lain';
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);

      const dayOfWeek = d.getDay();
      const diff = d.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const mon = new Date(d.setDate(diff));
      const fri = new Date(mon);
      fri.setDate(mon.getDate() + 4);
      const formatD = (date) => ('0' + date.getDate()).slice(-2) + '/' + ('0' + (date.getMonth() + 1)).slice(-2);
      return formatD(mon) + ' - ' + formatD(fri) + '/' + mon.getFullYear();
    };

    const weekGroups = {};
    const weekDates = {};
    list.forEach(ev => {
      const key = getWeekKey(ev.Tarikh_Mula);
      if (!weekGroups[key]) {
        weekGroups[key] = [];
        weekDates[key] = ev.Tarikh_Mula;
      }
      weekGroups[key].push(ev);
    });

    const sortedWeekKeys = Object.keys(weekGroups).sort((a, b) => {
      return (weekDates[a] || '').localeCompare(weekDates[b] || '');
    });

    let html = '';
    let weekIndex = 1;
    sortedWeekKeys.forEach(wKey => {
      const wEvents = weekGroups[wKey];
      html += `
        <div class="flex flex-col gap-2 pt-2">
          <div class="flex items-center justify-between bg-teal-50/90 px-3.5 py-2 rounded-xl border border-teal-100 shadow-xs">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px] text-[#148e82]">date_range</span>
              <span class="text-xs font-bold text-teal-950 uppercase tracking-wide">${isEn ? `Week ${weekIndex}` : `Minggu ${weekIndex}`} (${wKey})</span>
            </div>
            <span class="text-[10px] font-bold bg-[#148e82] text-white px-2.5 py-0.5 rounded-full shadow-xs">${wEvents.length} ${isEn ? 'School Sessions' : 'Sesi Sekolah'}</span>
          </div>
          <div class="flex flex-col gap-2">
            ${wEvents.map(renderEventCardHtml).join('')}
          </div>
        </div>
      `;
      weekIndex++;
    });
    container.innerHTML = html || `<div class="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-400"><p class="text-xs">${isEn ? 'No sessions for this week.' : 'Tiada sesi untuk minggu ini.'}</p></div>`;
    return;
  }

  // 3. PAPARAN SENARAI SEMUA (ALL LIST VIEW)
  container.innerHTML = list.map(renderEventCardHtml).join('');
}

// ============================================
// 6. RENDERING SKRIN 03: BUTIRAN ACARA & PELAN
// ============================================
function renderEventDetailsScreen(eventId) {
  const ev = (AppState.events.find(e => e.Event_ID === eventId) || AppState.activeEvent) || getFallbackEvents()[0];
  AppState.activeEvent = ev;

  const titleEl = document.getElementById('detailsEventTitle');
  const venueEl = document.getElementById('detailsEventVenue');
  const dateEl = document.getElementById('detailsEventDate');
  const timeEl = document.getElementById('detailsEventTime');
  const notesEl = document.getElementById('detailsEventNotes');
  const gpsBtn = document.getElementById('btnOpenGpsMaps');

  const isEn = typeof I18N !== 'undefined' && I18N.currentLang === 'EN';
  if (titleEl) titleEl.innerText = ev.Sekolah || ev.Nama_Acara;
  if (venueEl) venueEl.innerText = ev.Tempat_Venue;
  if (dateEl) dateEl.innerText = formatDisplayDate(ev.Tarikh_Paparan || ev.Tarikh_Mula, isEn);
  if (timeEl) timeEl.innerText = ev.Masa;
  if (notesEl) notesEl.innerText = ev.Catatan_Khas || (isEn ? 'Formal office attire / blazer. Exhibition table prepared by host school.' : 'Pakaian rasmi pejabat / kot. Meja pameran disediakan oleh sekolah.');

  if (gpsBtn) {
    gpsBtn.onclick = () => {
      window.open(ev.Pautan_GPS_Maps || 'https://maps.google.com/?q=Brunei+Ministry+of+Education', '_blank');
    };
  }
}

// ============================================
// 7. RENDERING SKRIN 04: BORANG RSVP & LOGISTIK
// ============================================
let currentRsvpStatus = 'Hadir';

function switchRsvpSession(eventId, updateDropdown = true) {
  const ev = (AppState.events || []).find(e => e.Event_ID === eventId) || AppState.activeEvent || getFallbackEvents()[0];
  AppState.activeEvent = ev;

  if (updateDropdown) {
    const rsvpSelector = document.getElementById('rsvpSessionSelector');
    if (rsvpSelector) rsvpSelector.value = ev.Event_ID;
  }

  const isEn = typeof I18N !== 'undefined' && I18N.currentLang === 'EN';
  const catEl = document.getElementById('rsvpSelectedEventCategory');
  const distEl = document.getElementById('rsvpSelectedEventDistrict');
  const nameEl = document.getElementById('rsvpFormEventName');
  const dateEl = document.getElementById('rsvpSelectedEventDate');
  const timeEl = document.getElementById('rsvpSelectedEventTime');
  const venueEl = document.getElementById('rsvpSelectedEventVenue');

  if (catEl) catEl.innerText = ev.Kategori_Program;
  if (distEl) distEl.innerText = isEn ? `${ev.Daerah} District` : 'Daerah ' + ev.Daerah;
  if (nameEl) nameEl.innerText = ev.Sekolah || ev.Nama_Acara;
  if (dateEl) dateEl.innerText = '📅 ' + formatDisplayDate(ev.Tarikh_Paparan || ev.Tarikh_Mula, isEn);
  if (timeEl) timeEl.innerText = '🕒 ' + ev.Masa;
  if (venueEl) venueEl.innerHTML = `<span class="material-symbols-outlined text-[13px] text-slate-400">location_on</span> ${ev.Tempat_Venue}`;

  // Semak jika sudah ada rekod RSVP sebelum ini bagi agensi ini dan sesi ini
  const user = AppState.currentUser;
  const existing = (AppState.rsvps || []).find(r => r.Event_ID === ev.Event_ID && isAgencyMatch(r.Agensi_ID, user));
  const editBanner = document.getElementById('rsvpEditModeBanner');
  const submitText = document.getElementById('btnSubmitRsvpText');

  if (existing) {
    if (editBanner) editBanner.classList.remove('hidden');
    if (submitText) submitText.innerText = isEn ? 'Update RSVP Confirmation' : 'Kemaskini Pengesahan RSVP';

    selectRsvpStatus(existing.Status_RSVP === 'Tidak Hadir' ? 'Tidak Hadir' : 'Hadir');
    setStepperVal('countMeja', existing.Bil_Meja !== undefined ? existing.Bil_Meja : (existing.bilMeja !== undefined ? existing.bilMeja : 1));
    setStepperVal('countKerusi', existing.Bil_Kerusi !== undefined ? existing.Bil_Kerusi : (existing.bilKerusi !== undefined ? existing.bilKerusi : 2));
    setStepperVal('countPlug', existing.Bil_Plug !== undefined ? existing.Bil_Plug : (existing.bilPlug !== undefined ? existing.bilPlug : 1));
    setStepperVal('countWakil', existing.Jumlah_Wakil !== undefined ? existing.Jumlah_Wakil : (existing.jumlahWakil !== undefined ? existing.jumlahWakil : 2));
    const namaWakilEl = document.getElementById('inputNamaWakil');
    if (namaWakilEl) namaWakilEl.value = existing.Nama_Wakil_Hadir || existing.namaWakilHadir || '';
    const keperluanEl = document.getElementById('inputKeperluanLain');
    if (keperluanEl) keperluanEl.value = existing.Keperluan_Lain || existing.keperluanLain || '';
  } else {
    if (editBanner) editBanner.classList.add('hidden');
    if (submitText) submitText.innerText = isEn ? 'Submit RSVP Confirmation' : 'Hantar Pengesahan (Submit RSVP)';

    selectRsvpStatus('Hadir');
    setStepperVal('countMeja', 1);
    setStepperVal('countKerusi', 2);
    setStepperVal('countPlug', 1);
    setStepperVal('countWakil', 2);
    const namaWakilEl = document.getElementById('inputNamaWakil');
    if (namaWakilEl) namaWakilEl.value = '';
    const keperluanEl = document.getElementById('inputKeperluanLain');
    if (keperluanEl) keperluanEl.value = '';
  }
}

function renderRsvpFormScreen(eventId) {
  if (eventId) {
    const found = (AppState.events || []).find(e => e.Event_ID === eventId);
    if (found) AppState.activeEvent = found;
  }
  const ev = AppState.activeEvent || getFallbackEvents()[0];
  AppState.activeEvent = ev;
  const isEn = typeof I18N !== 'undefined' && I18N.currentLang === 'EN';

  const user = AppState.currentUser;
  const agencyBadge = document.getElementById('rsvpFormAgencyBadge');
  if (agencyBadge && user) agencyBadge.innerText = user.namaAgensi || 'Universiti Brunei Darussalam';

  const onBehalfLabel = document.querySelector('#screen_rsvpForm .text-ocean-wash');
  if (onBehalfLabel) {
    onBehalfLabel.innerText = isEn ? 'Official Request on behalf of:' : 'Permohonan Rasmi bagi pihak:';
  }

  // Isikan dropdown pemilih 31 sesi
  const rsvpSelector = document.getElementById('rsvpSessionSelector');
  if (rsvpSelector) {
    rsvpSelector.innerHTML = (AppState.events || []).map(e => {
      const isSelected = e.Event_ID === ev.Event_ID ? 'selected' : '';
      const prefix = e.Kategori_Program === 'Program FutureLink' ? '[FutureLink]' : '[Hala Tuju]';
      const displayDate = formatDisplayDate(e.Tarikh_Paparan || e.Tarikh_Mula, isEn);
      const distStr = isEn ? `${e.Daerah} District` : `Daerah ${e.Daerah}`;
      return `<option value="${e.Event_ID}" ${isSelected}>${prefix} ${displayDate} - ${e.Sekolah || e.Nama_Acara} (${distStr})</option>`;
    }).join('');
    rsvpSelector.value = ev.Event_ID;
  }

  // Kemaskini kad butiran sesi
  switchRsvpSession(ev.Event_ID, false);
}

// 2 Pilihan Sahaja: Hadir & Tidak Hadir
function selectRsvpStatus(status) {
  currentRsvpStatus = (status === 'Tidak Hadir') ? 'Tidak Hadir' : 'Hadir';
  const optAttending = document.getElementById('optStatusAttending');
  const optNotAttending = document.getElementById('optStatusNotAttending');
  const logisticsSection = document.getElementById('logisticsEquipmentSection');
  const notAttendingNotice = document.getElementById('notAttendingNoticeBox');

  if (currentRsvpStatus === 'Hadir') {
    if (optAttending) {
      optAttending.className = 'border-2 rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all border-amber-500 bg-amber-50/70 shadow-sm';
      const icon = optAttending.querySelector('.material-symbols-outlined');
      if (icon) icon.className = 'material-symbols-outlined text-amber-600 text-[22px]';
    }
    if (optNotAttending) {
      optNotAttending.className = 'border-2 border-slate-200 rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all hover:border-slate-300 bg-white';
      const icon = optNotAttending.querySelector('.material-symbols-outlined');
      if (icon) icon.className = 'material-symbols-outlined text-slate-400 text-[22px]';
    }
    if (logisticsSection) logisticsSection.classList.remove('hidden');
    if (notAttendingNotice) notAttendingNotice.classList.add('hidden');
  } else {
    // Tidak Hadir
    if (optNotAttending) {
      optNotAttending.className = 'border-2 rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all border-amber-500 bg-amber-50/70 shadow-sm';
      const icon = optNotAttending.querySelector('.material-symbols-outlined');
      if (icon) icon.className = 'material-symbols-outlined text-amber-600 text-[22px]';
    }
    if (optAttending) {
      optAttending.className = 'border-2 border-slate-200 rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all hover:border-slate-300 bg-white';
      const icon = optAttending.querySelector('.material-symbols-outlined');
      if (icon) icon.className = 'material-symbols-outlined text-slate-400 text-[22px]';
    }
    if (logisticsSection) logisticsSection.classList.add('hidden');
    if (notAttendingNotice) notAttendingNotice.classList.remove('hidden');
  }
}

function adjustStepper(id, delta) {
  const el = document.getElementById(id);
  if (!el) return;
  let val = parseInt(el.innerText || '0', 10) + delta;
  if (val < 0) val = 0;
  if (val > 20) val = 20; // Had logik peralatan
  el.innerText = val;
}

function setStepperVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.innerText = val;
}

function openRsvpSuccessModal() {
  const modal = document.getElementById('rsvpSuccessWhatsAppModal');
  if (modal) modal.classList.add('active');
}

function closeRsvpSuccessModal() {
  const modal = document.getElementById('rsvpSuccessWhatsAppModal');
  if (modal) modal.classList.remove('active');
}

async function handleRsvpFormSubmit() {
  const ev = AppState.activeEvent || getFallbackEvents()[0];
  const user = AppState.currentUser;
  if (!user) return;
  const isEn = typeof I18N !== 'undefined' && I18N.currentLang === 'EN';

  const btn = document.getElementById('btnSubmitRsvpAction');
  const btnText = document.getElementById('btnSubmitRsvpText');
  if (btn) btn.disabled = true;
  if (btnText) btnText.innerText = isEn ? 'Saving RSVP...' : 'Menyimpan RSVP...';

  // Semak sama ada ini kemaskini atau serahan baharu
  if (!AppState.rsvps) AppState.rsvps = [];
  const existingIdx = AppState.rsvps.findIndex(r => r.Event_ID === ev.Event_ID && isAgencyMatch(r.Agensi_ID, user));
  const isEdit = existingIdx > -1;

  const isHadir = (currentRsvpStatus === 'Hadir');
  const agencyKod = user.id || user.kod || 'AG-23';
  const payload = {
    eventId: ev.Event_ID,
    agencyId: agencyKod,
    agensiId: agencyKod,
    namaAgensi: user.namaAgensi || '',
    username: user.username || '',
    kategoriProgram: ev.Kategori_Program,
    namaAcara: ev.Nama_Acara,
    tarikhMula: ev.Tarikh_Mula,
    masa: ev.Masa,
    tempatVenue: ev.Tempat_Venue,
    daerah: ev.Daerah,
    statusRsvp: currentRsvpStatus,
    bilMeja: isHadir ? parseInt(document.getElementById('countMeja')?.innerText || '1', 10) : 0,
    bilKerusi: isHadir ? parseInt(document.getElementById('countKerusi')?.innerText || '2', 10) : 0,
    bilPlug: isHadir ? parseInt(document.getElementById('countPlug')?.innerText || '1', 10) : 0,
    jumlahWakil: isHadir ? parseInt(document.getElementById('countWakil')?.innerText || '2', 10) : 0,
    namaWakilHadir: isHadir ? (document.getElementById('inputNamaWakil') ? document.getElementById('inputNamaWakil').value.trim() : '') : '',
    keperluanLain: (document.getElementById('inputKeperluanLain') ? document.getElementById('inputKeperluanLain').value.trim() : ''),
    telefon: user.telefon || '',
    emel: user.emel || ''
  };

  // Optimistic UI: Segera simpan rekod RSVP agensi
  const updatedRecord = Object.assign({}, payload, {
    Event_ID: ev.Event_ID,
    Agensi_ID: agencyKod,
    Nama_Agensi: user.namaAgensi,
    Status_RSVP: currentRsvpStatus,
    statusRsvp: currentRsvpStatus,
    Tarikh_Hantar: new Date().toISOString()
  });

  if (isEdit) {
    AppState.rsvps[existingIdx] = updatedRecord;
  } else {
    AppState.rsvps.push(updatedRecord);
  }
  localStorage.setItem('ceu_cache_rsvps', JSON.stringify(AppState.rsvps));
  try { renderHomeScreen(false); } catch(e) {}

  // Pulihkan butang hantar
  if (btn) btn.disabled = false;
  if (btnText) btnText.innerText = isEn ? 'Update RSVP Confirmation' : 'Kemaskini Pengesahan RSVP';

  // 1. PUSH NOTIFICATION UNTUK ADMIN
  if (!AppState.adminNotifications) {
    try {
      AppState.adminNotifications = JSON.parse(localStorage.getItem('ceu_admin_notifications') || '[]');
    } catch(e) {
      AppState.adminNotifications = [];
    }
  }

  const notifTitle = isEdit 
    ? (isEn ? `[RSVP UPDATE] ${user.namaAgensi}` : `[KEMASKINI RSVP] ${user.namaAgensi}`)
    : (isEn ? `[NEW RSVP] ${user.namaAgensi}` : `[RSVP BAHARU] ${user.namaAgensi}`);

  const notifDesc = isHadir
    ? (isEn 
        ? `Confirmed ATTENDING for ${ev.Nama_Acara}. Tables: ${payload.bilMeja}, Chairs: ${payload.bilKerusi}, Plugs: ${payload.bilPlug}, Duty: ${payload.namaWakilHadir || '-'}.`
        : `Mengesahkan HADIR bagi ${ev.Nama_Acara}. Kelengkapan: ${payload.bilMeja} Meja, ${payload.bilKerusi} Kerusi, ${payload.bilPlug} Plug. Pegawai: ${payload.namaWakilHadir || '-'}.`)
    : (isEn 
        ? `Confirmed NOT ATTENDING for ${ev.Nama_Acara} due to schedule constraints.`
        : `Mengesahkan TIDAK HADIR bagi ${ev.Nama_Acara} kerana kekangan jadual.`);

  const newAdminNotif = {
    id: 'notif-admin-' + Date.now(),
    title: notifTitle,
    desc: notifDesc,
    time: isEn ? 'Just now' : 'Baru sahaja',
    timestamp: new Date().toISOString(),
    type: isHadir ? 'success' : 'warning',
    agencyId: user.id,
    eventId: ev.Event_ID,
    read: false
  };

  AppState.adminNotifications.unshift(newAdminNotif);
  localStorage.setItem('ceu_admin_notifications', JSON.stringify(AppState.adminNotifications));

  // Tunjukkan lencana notifikasi
  const hBadge = document.getElementById('headerNotifBadge');
  const mBadge = document.getElementById('homeNotifBadge');
  const unreadCount = AppState.adminNotifications.filter(x => !x.read).length;
  if (hBadge) {
    hBadge.style.display = 'block';
    hBadge.innerText = String(Math.min(unreadCount, 9));
  }
  if (mBadge) {
    mBadge.style.display = 'block';
    mBadge.innerText = String(Math.min(unreadCount, 9));
  }

  // Push Notification Pelayar (Native Notification API)
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      try {
        new Notification(notifTitle, {
          body: notifDesc,
          icon: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=128&q=80'
        });
      } catch(e) {}
    } else if (Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }

  // 2. INTEGRASI WHATSAPP KEPADA +6738669690
  const waTarget = '6738669690';
  const displayDateStr = formatDisplayDate(ev.Tarikh_Paparan || ev.Tarikh_Mula, isEn);

  const waMessage = isEn ? `*OFFICIAL RSVP NOTIFICATION — CAREER EDUCATION UNIT (CEU / JSS)*
Ministry of Education, Brunei Darussalam

To: CEU Secretariat (+6738669690)
Agency: *${user.namaAgensi}* (Code: ${user.id})

📌 Event: *${ev.Nama_Acara}*
📅 Date: *${displayDateStr}*
⏰ Time: *${ev.Masa}*
📍 Venue: *${ev.Tempat_Venue} (${ev.Daerah} District)*

ATTENDANCE STATUS: *${isHadir ? 'ATTENDING (CONFIRMED)' : 'NOT ATTENDING (SCHEDULE CONSTRAINTS)'}*

${isHadir ? `Exhibition Hall Logistics Requirements:
• Tables: ${payload.bilMeja} Unit(s)
• Chairs: ${payload.bilKerusi} Unit(s)
• Power Socket: ${payload.bilPlug} Unit(s)
• Officers On Duty: ${payload.jumlahWakil} Pax (${payload.namaWakilHadir || '-'})
• Agency Parking: 1 Dedicated Bay Allocated
• Special Requests: ${payload.keperluanLain || 'None'}` : `Notes: Agency regrets to decline participation due to scheduling constraints.`}

Action: ${isEdit ? 'RSVP Updated' : 'RSVP Submitted'} at ${new Date().toLocaleString('en-GB')}
Official Portal: https://ceujss2026.github.io/rsvp-ceu-portal/` : `*NOTIFIKASI PENGESAHAN / KEMASKINI RSVP AGENSI*
Unit Pendidikan Kerjaya (UPK), Jabatan Sekolah-Sekolah
Kementerian Pendidikan Negara Brunei Darussalam

Kepada: Urus Setia UPK (+6738669690)
Nama Agensi: *${user.namaAgensi}* (Kod: ${user.id})

📌 Program: *${ev.Nama_Acara}*
📅 Tarikh: *${ev.Tarikh_Paparan || ev.Tarikh_Mula}*
⏰ Masa: *${ev.Masa}*
📍 Tempat: *${ev.Tempat_Venue} (${ev.Daerah})*

STATUS KEHADIRAN: *${isHadir ? 'HADIR (MENYERTAI BOOTH)' : 'TIDAK HADIR (KEKANGAN JADUAL)'}*

${isHadir ? `Perincian Kelengkapan Dewan:
• Meja Pameran: ${payload.bilMeja} Unit
• Kerusi Booth: ${payload.bilKerusi} Unit
• Plug Elektrik: ${payload.bilPlug} Unit
• Jumlah Pegawai: ${payload.jumlahWakil} Orang
• Pegawai Bertugas: ${payload.namaWakilHadir || '-'}
• Pas Parking Agensi: 1 Petak Khas Disediakan
• Keperluan Tambahan: ${payload.keperluanLain || 'Tiada'}` : `Catatan: Pihak agensi memohon maaf tidak dapat menyertai pameran ini kerana kekangan jadual.`}

Tindakan: ${isEdit ? 'Kemaskini RSVP' : 'Hantar RSVP'} pada ${new Date().toLocaleString('ms-MY')}
Pautan Portal: https://ceujss2026.github.io/rsvp-ceu-portal/`;

  const waUrl = `https://wa.me/${waTarget}?text=${encodeURIComponent(waMessage)}`;

  // Pasang pautan pada butang modal WhatsApp
  const waModalBtn = document.getElementById('btnSendWhatsAppModal');
  if (waModalBtn) waModalBtn.href = waUrl;

  const modalTitle = document.getElementById('rsvpSuccessModalTitle');
  if (modalTitle) {
    modalTitle.innerText = isEdit 
      ? (isEn ? 'RSVP Successfully Updated!' : 'RSVP Berjaya Dikemaskini!')
      : (isEn ? 'RSVP Successfully Recorded!' : 'RSVP Berjaya Direkodkan!');
  }

  // Buka Modal Pengesahan & Salinan WhatsApp
  openRsvpSuccessModal();

  // Buka tab WhatsApp terus ke +6738669690
  try {
    window.open(waUrl, '_blank');
  } catch(e) {
    console.warn('Popup blocked, fallback to modal button', e);
  }

  showToast(isEn ? 'RSVP saved! Opening WhatsApp notification for Secretariat (+6738669690)...' : 'RSVP disimpan! Membuka WhatsApp untuk makluman Urus Setia (+6738669690)...', 'success');

  // Hantar maklumat ke backend secara asynchronous & segerakkan data terkini
  apiCall('submitRSVP', payload, true)
    .then(res => {
      if (res && res.success) {
        fetchInitialDataSilently();
      }
    })
    .catch(err => {
      console.warn('Sync submitRSVP offline/error:', err);
    });
}

// ============================================
// 8. RENDERING SKRIN 08: PANDUAN PARKING AGENSI
// ============================================
function renderParkingScreen(eventId) {
  const ev = (eventId ? AppState.events.find(e => e.Event_ID === eventId) : AppState.activeEvent) || getFallbackEvents()[0];
  if (!ev) return;
  const user = AppState.currentUser;
  const isEn = typeof I18N !== 'undefined' && I18N.currentLang === 'EN';

  const passAgencyName = document.getElementById('parkingPassAgencyName');
  const parkingEventName = document.getElementById('parkingEventName');
  const dynamicArea = document.getElementById('parkingScreenDynamicArea');

  if (passAgencyName && user) {
    passAgencyName.innerText = user.namaAgensi || 'UNIVERSITI BRUNEI DARUSSALAM';
  }
  if (parkingEventName) {
    parkingEventName.innerText = ev.Nama_Acara;
  }

  const isMapMode = (ev.Jenis_Parking === 'map_info') && !!ev.Pelan_Parking_URL;

  if (dynamicArea) {
    if (isMapMode) {
      dynamicArea.innerHTML = `
        <div class="rounded-xl overflow-hidden border border-slate-200 bg-white p-2.5 shadow-sm">
          <img src="${ev.Pelan_Parking_URL}" class="w-full max-h-72 object-contain rounded-lg bg-slate-50" alt="Peta Parking ${ev.Sekolah || ev.Nama_Acara}" />
          <p class="text-[10px] text-slate-500 mt-2 font-mono text-center">${isEn ? 'School Parking Map • ' : 'Peta Lokasi Parking Sekolah • '}${ev.Tempat_Venue}</p>
        </div>
        <div class="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200/80 text-xs flex flex-col gap-1.5">
          <div class="flex items-center gap-1.5 font-bold text-amber-900">
            <span class="material-symbols-outlined text-[16px] text-amber-600">info</span>
            <span>${isEn ? 'School Parking Instructions & Guide' : 'Maklumat & Arahan Tempat Letak Kereta'}</span>
          </div>
          <p class="text-[11px] text-slate-700 leading-relaxed">${ev.Panduan_Parking || (isEn ? 'Please follow host school guidance for designated agency representative parking.' : 'Sila patuhi panduan pihak sekolah bagi tempat letak kereta rasmi wakil agensi.')}</p>
        </div>
        <a href="${ev.Pautan_GPS_Maps || 'https://maps.google.com/?q=' + encodeURIComponent(ev.Tempat_Venue + ' Brunei')}" target="_blank" class="w-full py-2.5 bg-[#006194] hover:bg-[#004b73] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all">
          <span class="material-symbols-outlined text-[18px]">near_me</span>
          <span>${isEn ? 'GPS Navigation to School Parking' : 'Pandu Arah GPS ke Tempat Letak Kereta Agensi'}</span>
        </a>
      `;
    } else {
      // Mod Maklumat Sahaja (Information Only)
      dynamicArea.innerHTML = `
        <div class="p-4 bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-xl border border-amber-200 text-xs flex flex-col gap-3 shadow-sm">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <span class="material-symbols-outlined text-[18px]">local_parking</span>
            </div>
            <div class="flex flex-col min-w-0">
              <span class="font-bold text-xs text-amber-950 uppercase">${isEn ? 'Information Only Mode' : 'Mod Maklumat Sahaja'}</span>
              <span class="text-[11px] text-amber-800">${isEn ? 'The host school provides written instructions for visiting agencies:' : 'Pihak sekolah menyediakan panduan bertulis bagi agensi jemputan:'}</span>
            </div>
          </div>
          <div class="p-3 bg-white/90 rounded-lg border border-amber-200/80 text-slate-800 font-medium leading-relaxed">
            ${ev.Panduan_Parking || (isEn ? 'Please follow host school guidance for designated agency representative parking in the school compound.' : 'Sila patuhi panduan pihak sekolah bagi tempat letak kereta rasmi wakil agensi di kawasan sekolah.')}
          </div>
          <div class="grid grid-cols-2 gap-2 text-[11px]">
            <div class="p-2.5 rounded-lg bg-white border border-amber-100 flex items-center gap-2">
              <span class="material-symbols-outlined text-amber-600 text-[16px]">check_circle</span>
              <span class="font-semibold text-slate-700">${isEn ? '1 Slot Allocated' : '1 Petak Disediakan'}</span>
            </div>
            <div class="p-2.5 rounded-lg bg-white border border-amber-100 flex items-center gap-2">
              <span class="material-symbols-outlined text-amber-600 text-[16px]">no_crash</span>
              <span class="font-semibold text-slate-700">${isEn ? 'No License Plate Req.' : 'Tanpa Daftar Plat'}</span>
            </div>
          </div>
        </div>
        <a href="${ev.Pautan_GPS_Maps || 'https://maps.google.com/?q=' + encodeURIComponent(ev.Tempat_Venue + ' Brunei')}" target="_blank" class="w-full py-2.5 bg-[#006194] hover:bg-[#004b73] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all">
          <span class="material-symbols-outlined text-[18px]">near_me</span>
          <span>${isEn ? 'GPS Navigation to School Parking' : 'Pandu Arah GPS ke Tempat Letak Kereta Agensi'}</span>
        </a>
      `;
    }
  }
}

// ============================================
// 9. RENDERING SKRIN 05: KALENDAR & ARKIB
// ============================================
function renderArchiveScreen() {
  const container = document.getElementById('archiveTimelineList');
  if (!container) return;
  const isEn = typeof I18N !== 'undefined' && I18N.currentLang === 'EN';

  const list = AppState.events.length ? AppState.events : getFallbackEvents();

  container.innerHTML = list.map(ev => {
    return `
      <div class="flex gap-3 card-elevated p-3.5 hover:border-amber-400 transition-all cursor-pointer" onclick="navigateTo('eventDetails', '${ev.Event_ID}')">
        <div class="flex flex-col items-center justify-center w-14 h-16 bg-ocean-wash/60 text-primary rounded-xl font-bold border border-sky-100 flex-shrink-0">
          <span class="text-xs uppercase text-sky-800">${(ev.Tarikh_Mula || '').slice(5, 7)}</span>
          <span class="text-xl leading-none text-sky-900">${(ev.Tarikh_Mula || '').slice(8, 10)}</span>
        </div>
        <div class="flex flex-col flex-1 min-w-0 justify-center">
          <div class="flex items-center gap-1.5">
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">${ev.Kategori_Program}</span>
            <span class="text-[10px] text-teal-700 font-semibold">• ${ev.Status_Acara === 'Aktif' ? (isEn ? 'Active' : 'Aktif') : (ev.Status_Acara || (isEn ? 'Active' : 'Aktif'))}</span>
          </div>
          <h4 class="text-sm font-bold text-slate-900 truncate mt-0.5">${ev.Nama_Acara}</h4>
          <span class="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
            <span class="material-symbols-outlined text-[13px]">location_on</span>
            ${ev.Tempat_Venue}
          </span>
        </div>
      </div>
    `;
  }).join('');
}

// ============================================
// 10. RENDERING SKRIN MOD PENTADBIR: PAPAN PEMUKA & URUS PROGRAM
// ============================================
let adminSelectedSchoolId = 'EVT-PHT-01';
let adminDashboardViewMode = 'table';
let adminCurrentFilter = 'ALL';

function getAgencyRsvpForSchool(agencyKod, eventId) {
  // 1. Semak rekod tersimpan eksplisit dalam AppState.rsvps
  if (AppState.rsvps && Array.isArray(AppState.rsvps)) {
    const found = AppState.rsvps.find(r => r.Event_ID === eventId && isAgencyMatch(r.Agensi_ID, agencyKod));
    if (found) {
      return {
        ...found,
        bilMeja: found.bilMeja !== undefined ? Number(found.bilMeja) : (found.Bil_Meja !== undefined ? Number(found.Bil_Meja) : 1),
        bilKerusi: found.bilKerusi !== undefined ? Number(found.bilKerusi) : (found.Bil_Kerusi !== undefined ? Number(found.Bil_Kerusi) : 2),
        bilPlug: found.bilPlug !== undefined ? Number(found.bilPlug) : (found.Bil_Plug !== undefined ? Number(found.Bil_Plug) : 1),
        namaWakilHadir: found.namaWakilHadir || found.Nama_Wakil_Hadir || '-',
        jumlahWakil: found.jumlahWakil !== undefined ? Number(found.jumlahWakil) : (found.Jumlah_Wakil !== undefined ? Number(found.Jumlah_Wakil) : 2),
        statusRsvp: found.Status_RSVP || found.statusRsvp || 'Belum Sah',
        Status_RSVP: found.Status_RSVP || found.statusRsvp || 'Belum Sah'
      };
    }
  }

  // 2. Jika tiada rekod, bermakna agensi BELUM SAH (Pending) bagi sesi ini
  const agencies = (AppState.agenciesList && AppState.agenciesList.length === 50)
    ? AppState.agenciesList
    : getPreseededAgencies();
  const agency = agencies.find(a => isAgencyMatch(a.kod, agencyKod));

  return {
    Event_ID: eventId,
    Agensi_ID: agency ? agency.kod : agencyKod,
    Nama_Agensi: agency ? agency.namaAgensi : ('Agensi ' + agencyKod),
    user: agency ? agency.user : '',
    kategori: agency ? agency.kategori : '',
    Status_RSVP: 'Belum Sah',
    statusRsvp: 'Belum Sah',
    bilMeja: 0,
    bilKerusi: 0,
    bilPlug: 0,
    jumlahWakil: 0,
    namaWakilHadir: '-',
    noPlatKereta: '-'
  };
}

function populateAdminSchoolSelector() {
  const selector = document.getElementById('adminSchoolSelector');
  if (!selector) return;

  const isEn = typeof I18N !== 'undefined' && I18N.currentLang === 'EN';
  const events = sortEventsChronologically(AppState.events && AppState.events.length > 0 ? AppState.events : getFallbackEvents());

  if (!adminSelectedSchoolId || (adminSelectedSchoolId !== 'ALL' && !events.some(e => e.Event_ID === adminSelectedSchoolId))) {
    adminSelectedSchoolId = events[0] ? events[0].Event_ID : 'EVT-PHT-01';
  }

  let html = `<option value="ALL" ${adminSelectedSchoolId === 'ALL' ? 'selected' : ''}>🌟 ${isEn ? 'All 31 Schools (Overall Summary)' : 'Semua 31 Sekolah / Sesi (Ringkasan Keseluruhan)'}</option>`;

  events.forEach((ev, idx) => {
    const isSel = (adminSelectedSchoolId === ev.Event_ID);
    const dateStr = formatDisplayDate(ev.Tarikh_Paparan || ev.Tarikh_Mula, isEn);
    const catShort = (ev.Kategori_Program || '').includes('Hala Tuju') ? 'PHT' : 'FutureLink';
    html += `<option value="${ev.Event_ID}" ${isSel ? 'selected' : ''}>${idx + 1}. [${catShort}] ${dateStr} • ${ev.Sekolah || ev.Nama_Acara} (${ev.Daerah})</option>`;
  });

  selector.innerHTML = html;
}

function onAdminSchoolSelect(eventId) {
  adminSelectedSchoolId = eventId || 'ALL';
  renderAdminDashboard();
}

function setAdminDashboardView(mode) {
  adminDashboardViewMode = mode;
  const btnTable = document.getElementById('btnAdminViewTable');
  const btnGrid = document.getElementById('btnAdminViewGrid');
  const tableCont = document.getElementById('adminTableContainerView');
  const gridCont = document.getElementById('adminGridContainerView');

  if (mode === 'grid') {
    if (btnGrid) {
      btnGrid.className = 'px-3 py-2 text-xs font-bold rounded-lg bg-white text-[#006194] shadow-sm flex items-center gap-1.5 transition-all';
    }
    if (btnTable) {
      btnTable.className = 'px-3 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-all';
    }
    if (tableCont) tableCont.classList.add('hidden');
    if (gridCont) gridCont.classList.remove('hidden');
    renderAdminSchoolsGrid();
  } else {
    if (btnTable) {
      btnTable.className = 'px-3 py-2 text-xs font-bold rounded-lg bg-white text-[#006194] shadow-sm flex items-center gap-1.5 transition-all';
    }
    if (btnGrid) {
      btnGrid.className = 'px-3 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-all';
    }
    if (tableCont) tableCont.classList.remove('hidden');
    if (gridCont) gridCont.classList.add('hidden');
    renderAdminAgenciesTable();
  }
}

function selectSchoolAndShowTable(eventId) {
  const sel = document.getElementById('adminSchoolSelector');
  if (sel) sel.value = eventId;
  onAdminSchoolSelect(eventId);
  setAdminDashboardView('table');
  const table = document.getElementById('adminTableContainerView');
  if (table) table.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function renderAdminDashboard() {
  const isEn = typeof I18N !== 'undefined' && I18N.currentLang === 'EN';
  const agencies = (AppState.agenciesList && AppState.agenciesList.length === 50) 
    ? AppState.agenciesList 
    : getPreseededAgencies();
  AppState.agenciesList = agencies;

  const events = sortEventsChronologically(AppState.events && AppState.events.length > 0 ? AppState.events : getFallbackEvents());
  populateAdminSchoolSelector();

  // Acara terpilih
  const isAll = (adminSelectedSchoolId === 'ALL');
  const currentEvent = events.find(e => e.Event_ID === adminSelectedSchoolId) || events[0];

  // Kemaskini Kapsul Info Sekolah Terpilih
  const catBadge = document.getElementById('adminSchoolCategoryBadge');
  const distBadge = document.getElementById('adminSchoolDistrictBadge');
  const titleEl = document.getElementById('adminSchoolCapsuleTitle');
  const dateEl = document.getElementById('adminSchoolCapsuleDate');
  const timeEl = document.getElementById('adminSchoolCapsuleTime');
  const venueEl = document.getElementById('adminSchoolCapsuleVenue');

  if (isAll) {
    if (catBadge) catBadge.innerText = isEn ? 'All Programs' : 'Semua Program';
    if (distBadge) distBadge.innerText = isEn ? '4 Districts (Nationwide)' : '4 Daerah (Seluruh Negara)';
    if (titleEl) titleEl.innerText = isEn ? 'Comprehensive Summary of 31 School Sessions' : 'Ringkasan Menyeluruh 31 Sesi Sekolah & Institusi';
    if (dateEl) dateEl.innerText = '📅 Jan – Mei 2027';
    if (timeEl) timeEl.innerText = '🕒 Pagi & Petang';
    if (venueEl) venueEl.innerHTML = `<span class="material-symbols-outlined text-[13px] text-slate-400">location_on</span>31 Dewan Sekolah & Institusi`;
  } else if (currentEvent) {
    if (catBadge) catBadge.innerText = currentEvent.Kategori_Program || 'Program Hala Tuju';
    if (distBadge) distBadge.innerText = (isEn ? `${currentEvent.Daerah} District` : `Daerah ${currentEvent.Daerah}`);
    if (titleEl) titleEl.innerText = currentEvent.Sekolah || currentEvent.Nama_Acara;
    if (dateEl) dateEl.innerText = '📅 ' + formatDisplayDate(currentEvent.Tarikh_Paparan || currentEvent.Tarikh_Mula, isEn);
    if (timeEl) timeEl.innerText = '🕒 ' + currentEvent.Masa;
    if (venueEl) venueEl.innerHTML = `<span class="material-symbols-outlined text-[13px] text-slate-400">location_on</span>${currentEvent.Tempat_Venue}`;
  }

  // Kiraan metrik mengikut sekolah terpilih
  const totalAgencies = agencies.length;
  const totalAgenciesEl = document.getElementById('adminStatTotalAgencies');
  const responseRateEl = document.getElementById('adminStatResponseRate');
  const tablesTotalEl = document.getElementById('adminStatTotalTables');
  const plugsTotalEl = document.getElementById('adminStatTotalPlugs');

  const statSub1 = document.getElementById('adminStatSub1');
  const statSub2 = document.getElementById('adminStatSub2');
  const statSub3 = document.getElementById('adminStatSub3');
  const statSub4 = document.getElementById('adminStatSub4');

  if (isAll) {
    let overallHadir = 0;
    let overallTidakHadir = 0;
    let overallPending = 0;
    let overallTables = 0;
    let overallChairs = 0;
    let overallPlugs = 0;
    let overallParking = 0;

    events.forEach(ev => {
      agencies.forEach(a => {
        const r = getAgencyRsvpForSchool(a.kod, ev.Event_ID);
        const isHadir = (r.Status_RSVP === 'Hadir' || r.Status_RSVP === 'Hadir (Disahkan)');
        const isTidak = (r.Status_RSVP === 'Tidak Hadir');

        if (isHadir) {
          overallHadir++;
          overallTables += (r.bilMeja !== undefined ? Number(r.bilMeja) : 1);
          overallChairs += (r.bilKerusi !== undefined ? Number(r.bilKerusi) : 2);
          overallPlugs += (r.bilPlug !== undefined ? Number(r.bilPlug) : 1);
          overallParking++;
        } else if (isTidak) {
          overallTidakHadir++;
        } else {
          overallPending++;
        }
      });
    });

    const avgHadir = Math.round(overallHadir / events.length);
    const avgPct = Math.round((avgHadir / totalAgencies) * 100);

    if (totalAgenciesEl) totalAgenciesEl.innerText = totalAgencies;
    if (statSub1) statSub1.innerText = isEn ? '31 Takwim Sessions (Nationwide)' : '31 Sesi Takwim (Seluruh Negara)';

    if (responseRateEl) responseRateEl.innerText = `${overallHadir} Hadir (${avgPct}%)`;
    if (statSub2) statSub2.innerText = isEn 
      ? `Avg ${avgHadir}/50 agencies per session • ${overallTidakHadir} Not Attending` 
      : `Purata ${avgHadir}/50 agensi per sesi • ${overallTidakHadir} Tidak Hadir`;

    if (tablesTotalEl) tablesTotalEl.innerText = `${overallTables} M • ${overallChairs} K`;
    if (statSub3) statSub3.innerText = isEn 
      ? `${overallTables} Tables & ${overallChairs} Chairs (31 Sessions)` 
      : `${overallTables} Meja & ${overallChairs} Kerusi (31 Sesi)`;

    if (plugsTotalEl) plugsTotalEl.innerText = `${overallPlugs} Plug • ${overallParking} Parking`;
    if (statSub4) statSub4.innerText = isEn 
      ? `${overallPlugs} Power Sockets & ${overallParking} Parking Bays (31 Sessions)` 
      : `${overallPlugs} Soket Plug & ${overallParking} Petak Parking (31 Sesi)`;

  } else {
    let hadirAgencies = 0;
    let tidakHadirAgencies = 0;
    let pendingAgencies = 0;
    let totalTables = 0;
    let totalChairs = 0;
    let totalPlugs = 0;
    let totalParking = 0;

    agencies.forEach(a => {
      const r = getAgencyRsvpForSchool(a.kod, currentEvent.Event_ID);
      const isHadir = (r.Status_RSVP === 'Hadir' || r.Status_RSVP === 'Hadir (Disahkan)');
      const isTidak = (r.Status_RSVP === 'Tidak Hadir');

      if (isHadir) {
        hadirAgencies++;
        totalTables += (r.bilMeja !== undefined ? Number(r.bilMeja) : 1);
        totalChairs += (r.bilKerusi !== undefined ? Number(r.bilKerusi) : 2);
        totalPlugs += (r.bilPlug !== undefined ? Number(r.bilPlug) : 1);
        totalParking++;
      } else if (isTidak) {
        tidakHadirAgencies++;
      } else {
        pendingAgencies++;
      }
    });

    const attendingPct = Math.round((hadirAgencies / totalAgencies) * 100);

    if (totalAgenciesEl) totalAgenciesEl.innerText = totalAgencies;
    if (statSub1) statSub1.innerText = currentEvent.Sekolah || currentEvent.Nama_Acara;

    if (responseRateEl) responseRateEl.innerText = `${hadirAgencies} / 50 (${attendingPct}%)`;
    if (statSub2) statSub2.innerText = isEn
      ? `${hadirAgencies} Attending • ${tidakHadirAgencies} Not Attending • ${pendingAgencies} Pending`
      : `${hadirAgencies} Hadir • ${tidakHadirAgencies} Tidak Hadir • ${pendingAgencies} Belum Sah`;

    if (tablesTotalEl) tablesTotalEl.innerText = `${totalTables} M • ${totalChairs} K`;
    if (statSub3) statSub3.innerText = isEn
      ? `${totalTables} Booth Tables & ${totalChairs} Chairs Requested`
      : `${totalTables} Meja & ${totalChairs} Kerusi Diperlukan`;

    if (plugsTotalEl) plugsTotalEl.innerText = `${totalPlugs} Plug • ${totalParking} Parking`;
    if (statSub4) statSub4.innerText = isEn
      ? `${totalPlugs} Sockets & ${totalParking} Parking Bays`
      : `${totalPlugs} Soket Plug & ${totalParking} Petak Parking`;
  }

  // Tajuk jadual mengikut sekolah terpilih
  const aTTitle = document.getElementById('adminTableTitle');
  if (aTTitle) {
    const schoolName = isAll ? (isEn ? 'All 31 Schools (Overall Summary)' : 'Semua 31 Sekolah (Ringkasan Keseluruhan)') : (currentEvent.Sekolah || currentEvent.Nama_Acara);
    aTTitle.innerHTML = `<span class="w-2.5 h-2.5 rounded-full bg-[#148e82]"></span>${isEn ? 'RSVP Confirmation of 50 Agencies — ' : 'Status Pengesahan RSVP 50 Agensi — '}<span class="text-[#006194]">${schoolName}</span>`;
  }

  // Paparkan mod paparan yang aktif
  if (adminDashboardViewMode === 'grid') {
    renderAdminSchoolsGrid();
  } else {
    renderAdminAgenciesTable();
  }
}

function renderAdminAgenciesTable() {
  const container = document.getElementById('adminAgenciesTableBody');
  if (!container) return;
  const isEn = typeof I18N !== 'undefined' && I18N.currentLang === 'EN';

  const events = sortEventsChronologically(AppState.events && AppState.events.length > 0 ? AppState.events : getFallbackEvents());
  const currentEvent = events.find(e => e.Event_ID === adminSelectedSchoolId) || events[0];

  const searchInput = document.getElementById('adminAgencySearchInput');
  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

  let list = AppState.agenciesList && AppState.agenciesList.length === 50 ? AppState.agenciesList : getPreseededAgencies();

  // Sediakan rekod RSVP bagi sekolah terpilih untuk setiap agensi
  const mappedList = list.map(a => {
    const r = getAgencyRsvpForSchool(a.kod, currentEvent.Event_ID);
    return {
      kod: a.kod,
      namaAgensi: a.namaAgensi,
      user: a.user,
      kategori: a.kategori,
      statusRsvp: r.Status_RSVP,
      bilMeja: r.bilMeja !== undefined ? r.bilMeja : 1,
      bilKerusi: r.bilKerusi !== undefined ? r.bilKerusi : 2,
      bilPlug: r.bilPlug !== undefined ? r.bilPlug : 1,
      namaWakilHadir: r.namaWakilHadir || '-',
      jumlahWakil: r.jumlahWakil || 2
    };
  });

  // 1. Penapis Status
  let filtered = mappedList;
  if (adminCurrentFilter === 'Hadir') {
    filtered = filtered.filter(a => a.statusRsvp === 'Hadir' || a.statusRsvp === 'Hadir (Disahkan)');
  } else if (adminCurrentFilter === 'Belum') {
    filtered = filtered.filter(a => a.statusRsvp !== 'Hadir' && a.statusRsvp !== 'Hadir (Disahkan)' && a.statusRsvp !== 'Tidak Hadir');
  } else if (adminCurrentFilter === 'Tidak') {
    filtered = filtered.filter(a => a.statusRsvp === 'Tidak Hadir');
  }

  // 2. Carian Teks
  if (query) {
    filtered = filtered.filter(a => 
      (a.namaAgensi || '').toLowerCase().includes(query) ||
      (a.kod || '').toLowerCase().includes(query) ||
      (a.user || '').toLowerCase().includes(query) ||
      (a.namaWakilHadir || '').toLowerCase().includes(query)
    );
  }

  // Kemaskini jumlah pada butang penapis
  const hadirCount = mappedList.filter(a => a.statusRsvp === 'Hadir' || a.statusRsvp === 'Hadir (Disahkan)').length;
  const belumCount = mappedList.filter(a => a.statusRsvp !== 'Hadir' && a.statusRsvp !== 'Hadir (Disahkan)' && a.statusRsvp !== 'Tidak Hadir').length;
  const tidakCount = mappedList.filter(a => a.statusRsvp === 'Tidak Hadir').length;

  const btnAll = document.getElementById('filterBtn_ALL');
  const btnHadir = document.getElementById('filterBtn_Hadir');
  const btnBelum = document.getElementById('filterBtn_Belum');
  const btnTidak = document.getElementById('filterBtn_Tidak');

  if (btnAll) btnAll.innerText = `${isEn ? 'All' : 'Semua'} (50)`;
  if (btnHadir) btnHadir.innerText = `${isEn ? 'Attending' : 'Hadir'} (${hadirCount})`;
  if (btnBelum) btnBelum.innerText = `${isEn ? 'Pending' : 'Belum Sah'} (${belumCount})`;
  if (btnTidak) btnTidak.innerText = `${isEn ? 'Not Attending' : 'Tidak Hadir'} (${tidakCount})`;

  if (filtered.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="9" class="p-8 text-center text-slate-400">
          <span class="material-symbols-outlined text-[32px] block mb-1">search_off</span>
          ${isEn ? 'No agencies found matching this filter.' : 'Tiada agensi ditemui padanan tapisan ini.'}
        </td>
      </tr>
    `;
    return;
  }

  container.innerHTML = filtered.map((a, i) => {
    const isHadir = a.statusRsvp === 'Hadir' || a.statusRsvp === 'Hadir (Disahkan)';
    const isTidakHadir = a.statusRsvp === 'Tidak Hadir';
    
    let badgeClass = 'bg-amber-100 text-amber-800 border border-amber-200';
    let statusLabel = isEn ? 'Pending' : 'Belum Sah';

    if (isHadir) {
      badgeClass = 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      statusLabel = isEn ? 'Attending' : 'Hadir';
    } else if (isTidakHadir) {
      badgeClass = 'bg-rose-100 text-rose-800 border border-rose-200';
      statusLabel = isEn ? 'Not Attending' : 'Tidak Hadir';
    }

    return `
      <tr class="border-b border-slate-100 hover:bg-slate-50/90 text-xs transition-colors">
        <td class="p-3 font-semibold text-slate-400 text-[11px]">${i + 1}</td>
        <td class="p-3 font-mono font-bold text-slate-700">${a.kod}</td>
        <td class="p-3">
          <div class="flex flex-col">
            <span class="font-bold text-slate-900 leading-tight">${a.namaAgensi}</span>
            <span class="text-[10px] text-slate-400 font-mono mt-0.5">${a.user} • ${a.kategori || (isEn ? 'Official Agency' : 'Agensi Rasmi')}</span>
          </div>
        </td>
        <td class="p-3">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${badgeClass} shadow-xs">
            <span class="w-1.5 h-1.5 rounded-full ${isHadir ? 'bg-emerald-600' : (isTidakHadir ? 'bg-rose-600' : 'bg-amber-600')}"></span>
            <span>${statusLabel}</span>
          </span>
        </td>
        <td class="p-3 text-center font-semibold text-slate-700">
          ${isHadir ? (a.bilMeja + (isEn ? ' T / ' : ' M / ') + a.bilKerusi + (isEn ? ' C' : ' K')) : '-'}
        </td>
        <td class="p-3 text-center">
          ${isHadir && a.bilPlug > 0 
            ? '<span class="inline-flex items-center gap-0.5 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]"><span class="material-symbols-outlined text-[13px]">bolt</span>' + a.bilPlug + (isEn ? ' Sockets' : ' Soket') + '</span>'
            : '<span class="text-slate-300">-</span>'}
        </td>
        <td class="p-3">
          <span class="text-[11px] text-slate-700 max-w-xs truncate block" title="${a.namaWakilHadir}">
            ${isHadir ? (a.namaWakilHadir !== '-' ? a.namaWakilHadir : (isEn ? 'Delegates assigned' : 'Wakil ditugaskan')) : '-'}
          </span>
        </td>
        <td class="p-3">
          ${isHadir ? `
            <span class="inline-flex items-center gap-1 font-semibold text-[11px] text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/60">
              <span class="material-symbols-outlined text-[13px] text-amber-600">local_parking</span>
              <span>${isEn ? '1 Slot Allocated' : '1 Petak Disediakan'}</span>
            </span>
          ` : '<span class="text-slate-300">-</span>'}
        </td>
        <td class="p-3 text-right">
          <div class="flex items-center justify-end gap-1.5">
            <button onclick="adminSendAgencyWhatsApp('${a.kod}', '${currentEvent.Event_ID}')" class="px-2 py-1 text-[11px] bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg transition-colors flex items-center gap-1" title="${isEn ? 'Send WhatsApp Reminder for this school' : 'Hantar Peringatan WhatsApp untuk sekolah ini'}">
              <span class="material-symbols-outlined text-[14px]">chat</span>
              <span>WA</span>
            </button>
            <button onclick="openDocumentGeneratorModal('${a.kod}', '${currentEvent.Event_ID}')" class="px-2.5 py-1 text-[11px] bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold rounded-lg transition-colors flex items-center gap-1" title="${isEn ? 'Official Logistics Letter for this school' : 'Surat Perakuan Rasmi untuk sekolah ini'}">
              <span class="material-symbols-outlined text-[14px]">description</span>
              <span>${isEn ? 'Letter' : 'Surat'}</span>
            </button>
            <button onclick="handleAdminResetAgencyPassword('${a.kod}')" class="px-2 py-1 text-[11px] bg-slate-100 hover:bg-amber-100 hover:text-amber-800 text-slate-600 font-semibold rounded-lg transition-colors" title="${isEn ? 'Reset Password' : 'Reset Kata Laluan'}">
              <span>Reset</span>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function renderAdminSchoolsGrid() {
  const container = document.getElementById('adminSchoolsGridContainer');
  if (!container) return;
  const isEn = typeof I18N !== 'undefined' && I18N.currentLang === 'EN';
  const events = sortEventsChronologically(AppState.events && AppState.events.length > 0 ? AppState.events : getFallbackEvents());
  const agencies = AppState.agenciesList && AppState.agenciesList.length === 50 ? AppState.agenciesList : getPreseededAgencies();

  container.innerHTML = events.map((ev, i) => {
    // Kiraan bagi acara ini
    let hadirCount = 0;
    let totalMeja = 0;
    let totalKerusi = 0;
    let totalPlug = 0;

    agencies.forEach(a => {
      const r = getAgencyRsvpForSchool(a.kod, ev.Event_ID);
      if (r.Status_RSVP === 'Hadir' || r.Status_RSVP === 'Hadir (Disahkan)') {
        hadirCount++;
        totalMeja += (r.bilMeja !== undefined ? r.bilMeja : 1);
        totalKerusi += (r.bilKerusi !== undefined ? r.bilKerusi : 2);
        totalPlug += (r.bilPlug !== undefined ? r.bilPlug : 0);
      }
    });

    const percent = Math.round((hadirCount / agencies.length) * 100);
    const isPht = (ev.Kategori_Program || '').includes('Hala Tuju');
    const catBadgeClass = isPht ? 'bg-teal-50 text-teal-800 border-teal-200' : 'bg-amber-50 text-amber-800 border-amber-200';
    const isSelected = (adminSelectedSchoolId === ev.Event_ID);

    return `
      <div class="p-4 rounded-xl border ${isSelected ? 'border-[#006194] bg-sky-50/40 ring-2 ring-[#006194]/20' : 'border-slate-200/80 bg-white'} shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-3">
        <div>
          <div class="flex items-center justify-between gap-1.5 mb-1.5">
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full border ${catBadgeClass}">${ev.Kategori_Program || 'Program Hala Tuju'}</span>
            <span class="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">${ev.Daerah}</span>
          </div>
          <h4 class="text-xs font-bold text-slate-900 leading-snug">${ev.Sekolah || ev.Nama_Acara}</h4>
          <p class="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span class="material-symbols-outlined text-[13px] text-slate-400">calendar_today</span>
            ${formatDisplayDate(ev.Tarikh_Paparan || ev.Tarikh_Mula, isEn)}
          </p>
        </div>

        <div class="flex flex-col gap-1.5 pt-2 border-t border-slate-100">
          <div class="flex items-center justify-between text-[11px]">
            <span class="text-slate-500 font-medium">${isEn ? 'Attendance Confirmed' : 'Pengesahan Hadir'}</span>
            <span class="font-extrabold text-[#006194]">${hadirCount} / 50 (${percent}%)</span>
          </div>
          <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div class="bg-gradient-to-r from-[#148e82] to-[#006194] h-2 rounded-full transition-all" style="width: ${percent}%"></div>
          </div>
          <div class="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
            <span>🪑 ${totalMeja} ${isEn ? 'Tables' : 'Meja'} / ${totalKerusi} ${isEn ? 'Chairs' : 'Kerusi'}</span>
            <span>⚡ ${totalPlug} Plug</span>
          </div>
        </div>

        <button type="button" onclick="selectSchoolAndShowTable('${ev.Event_ID}')" class="w-full py-2 bg-slate-50 hover:bg-[#006194] text-slate-700 hover:text-white font-bold text-xs rounded-lg border border-slate-200/80 hover:border-[#006194] transition-all flex items-center justify-center gap-1.5 shadow-sm">
          <span>${isEn ? 'View Agency RSVP Table →' : 'Lihat Jadual Agensi Sekolah Ini →'}</span>
        </button>
      </div>
    `;
  }).join('');
}

function filterAdminAgenciesTable() {
  renderAdminAgenciesTable();
}

function setAdminTableFilter(status) {
  adminCurrentFilter = status;
  const btnAll = document.getElementById('filterBtn_ALL');
  const btnHadir = document.getElementById('filterBtn_Hadir');
  const btnBelum = document.getElementById('filterBtn_Belum');
  const btnTidak = document.getElementById('filterBtn_Tidak');

  [btnAll, btnHadir, btnBelum, btnTidak].forEach(btn => {
    if (btn) {
      btn.className = 'px-2.5 py-1 rounded-lg text-slate-600 hover:text-slate-900 transition-all';
    }
  });

  const activeBtn = status === 'ALL' ? btnAll : (status === 'Hadir' ? btnHadir : (status === 'Tidak' ? btnTidak : btnBelum));
  if (activeBtn) {
    activeBtn.className = 'px-2.5 py-1 rounded-lg bg-white text-slate-800 shadow-sm transition-all font-bold';
  }

  renderAdminAgenciesTable();
}

function adminQuickToggleRsvp(agencyKod, eventId) {
  // Papan Pentadbir adalah mod pemantauan 100% automatik tanpa input manual
  console.info('Mod Pentadbir: Pengesahan status RSVP dikemas kini secara automatik daripada serahan rasmi agensi.');
}

function printSchoolRsvpReport() {
  const isEn = typeof I18N !== 'undefined' && I18N.currentLang === 'EN';
  const ev = (AppState.events || getFallbackEvents()).find(e => e.Event_ID === adminSelectedSchoolId) || (AppState.events || getFallbackEvents())[0];
  const oldTitle = document.title;
  const schoolName = (adminSelectedSchoolId === 'ALL')
    ? (isEn ? 'All_31_Schools_Overall_Summary' : 'Semua_31_Sekolah_Ringkasan_Keseluruhan')
    : (ev.Sekolah || ev.Nama_Acara).replace(/[^a-zA-Z0-9]/g, '_');
  document.title = (isEn ? 'RSVP_Logistics_Report_' : 'Laporan_RSVP_Logistik_') + schoolName;
  window.print();
  document.title = oldTitle;
}

async function handleAdminResetAgencyPassword(agencyId) {
  const isEn = typeof I18N !== 'undefined' && I18N.currentLang === 'EN';
  const confirmMsg = isEn 
    ? 'Are you sure you want to reset the password for this agency?' 
    : 'Adakah anda pasti ingin menetapkan semula kata laluan agensi ini?';
  if (!confirm(confirmMsg)) return;

  const tempPass = 'Ceu' + Math.floor(1000 + Math.random() * 9000) + '!';
  const alertMsg = isEn
    ? `New temporary password for ${agencyId}:\n\n${tempPass}\n\nPlease share this with the agency officer.`
    : `Kata laluan sementara baharu bagi ${agencyId}:\n\n${tempPass}\n\nSila kongsikan kepada pegawai agensi.`;
  alert(alertMsg);
  showToast(isEn ? 'Password reset successfully!' : 'Kata laluan berjaya direset!', 'success');
}

// ============================================
// URUS PROGRAM & PETA SEKOLAH (MOD PENTADBIR)
// ============================================
let adminEventsFilterCat = 'ALL';
let adminEventsFilterDist = 'ALL';

function setAdminEventsCategoryFilter(cat) {
  adminEventsFilterCat = cat;
  const btnAll = document.getElementById('adminFilterCat_ALL');
  const btnPht = document.getElementById('adminFilterCat_PHT');
  const btnFl = document.getElementById('adminFilterCat_FL');
  [btnAll, btnPht, btnFl].forEach(b => {
    if (b) b.className = 'px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 shrink-0 transition-all';
  });
  const activeBtn = cat === 'ALL' ? btnAll : (cat === 'Program Hala Tuju' ? btnPht : btnFl);
  if (activeBtn) {
    activeBtn.className = 'px-3 py-1 rounded-full text-xs font-bold bg-[#006194] text-white shadow-sm shrink-0 transition-all';
  }
  renderAdminEventsList();
}

function setAdminEventsDistrictFilter(dist) {
  adminEventsFilterDist = dist;
  const ids = ['adminFilterDist_ALL', 'adminFilterDist_BM', 'adminFilterDist_Tutong', 'adminFilterDist_Belait', 'adminFilterDist_Temburong'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.className = 'px-2.5 py-1 rounded-lg text-[11px] font-medium text-slate-600 hover:bg-slate-100 shrink-0 transition-all';
  });
  let activeId = 'adminFilterDist_ALL';
  if (dist === 'Brunei Muara') activeId = 'adminFilterDist_BM';
  else if (dist === 'Tutong') activeId = 'adminFilterDist_Tutong';
  else if (dist === 'Belait') activeId = 'adminFilterDist_Belait';
  else if (dist === 'Temburong') activeId = 'adminFilterDist_Temburong';

  const activeEl = document.getElementById(activeId);
  if (activeEl) {
    activeEl.className = 'px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-200 text-slate-800 shrink-0 transition-all';
  }
  renderAdminEventsList();
}

function renderAdminEventsList() {
  const container = document.getElementById('adminEventsListContainer');
  if (!container) return;
  const isEn = typeof I18N !== 'undefined' && I18N.currentLang === 'EN';

  const searchInput = document.getElementById('adminEventsSearchInput');
  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

  let list = AppState.events.length ? AppState.events : getFallbackEvents();

  if (adminEventsFilterCat && adminEventsFilterCat !== 'ALL') {
    list = list.filter(e => e.Kategori_Program === adminEventsFilterCat);
  }
  if (adminEventsFilterDist && adminEventsFilterDist !== 'ALL') {
    list = list.filter(e => e.Daerah === adminEventsFilterDist);
  }
  if (query) {
    list = list.filter(e => 
      (e.Nama_Acara || '').toLowerCase().includes(query) ||
      (e.Sekolah || '').toLowerCase().includes(query) ||
      (e.Tempat_Venue || '').toLowerCase().includes(query) ||
      (e.Daerah || '').toLowerCase().includes(query) ||
      (e.Tarikh_Paparan || '').toLowerCase().includes(query)
    );
  }

  if (list.length === 0) {
    container.innerHTML = `
      <div class="col-span-full bg-white p-6 rounded-2xl border border-slate-200/80 text-center text-slate-400">
        <span class="material-symbols-outlined text-[32px] block mb-1">search_off</span>
        <p class="text-xs">${isEn ? 'No programs found matching this search.' : 'Tiada program ditemui padanan carian ini.'}</p>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map(ev => {
    const isBelait = ev.Daerah === 'Belait';
    return `
      <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between gap-3 hover:border-slate-300 transition-all">
        <div class="flex flex-col gap-1">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${ev.Kategori_Program === 'Program FutureLink' ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-teal-50 text-teal-800 border border-teal-100'}">${ev.Kategori_Program}</span>
            <span class="font-mono text-[10px] font-bold text-slate-400">${ev.Event_ID}</span>
          </div>
          <h4 class="text-xs font-bold text-slate-900 mt-1 leading-snug">${ev.Sekolah || ev.Nama_Acara}</h4>
          <div class="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5 flex-wrap">
            <span>📅 ${formatDisplayDate(ev.Tarikh_Paparan || ev.Tarikh_Mula, isEn)}</span>
            <span class="${isBelait ? 'font-bold text-amber-800' : ''}">🕒 ${ev.Masa}</span>
            <span class="text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">${isEn ? `${ev.Daerah} District` : `Daerah ${ev.Daerah}`}</span>
          </div>
          <span class="text-[11px] text-slate-600 truncate flex items-center gap-1 mt-0.5">
            <span class="material-symbols-outlined text-[13px] text-slate-400">location_on</span>
            ${ev.Tempat_Venue}
          </span>
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-slate-100">
          <span class="text-[10px] font-bold ${ev.Status_Acara === 'Aktif' ? 'text-emerald-600' : 'text-slate-400'}">● ${ev.Status_Acara === 'Aktif' ? (isEn ? 'Active' : 'Aktif') : (ev.Status_Acara || (isEn ? 'Active' : 'Aktif'))}</span>
          <button onclick="populateAdminEventForm('${ev.Event_ID}')" class="px-3 py-1.5 bg-[#006194] hover:bg-[#004b73] text-white font-bold text-[11px] rounded-xl flex items-center gap-1 transition-all shadow-sm">
            <span class="material-symbols-outlined text-[14px]">edit</span>
            <span>${isEn ? 'Edit &amp; Maps' : 'Kemaskini &amp; Peta'}</span>
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Pre-fill borang dengan acara pertama jika belum ada
  if (list.length > 0 && !AppState.activeAdminEditId) {
    populateAdminEventForm(list[0].Event_ID);
  }
}

// ============================================
// PENGENDALI MUAT NAIK PETA & IMEJ ADMIN
// ============================================
function processUploadedImage(file, callback) {
  if (!file) return;
  const isEn = typeof I18N !== 'undefined' && I18N.currentLang === 'EN';
  if (!file.type.match('image.*')) {
    showToast(isEn ? 'Please select a valid image file (PNG, JPG, WEBP).' : 'Sila pilih fail imej yang sah (PNG, JPG, WEBP).', 'error');
    return;
  }
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      const maxDim = 1200;
      let width = img.width;
      let height = img.height;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
      callback(dataUrl);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function handleAdminFileUpload(event, type) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const isEn = typeof I18N !== 'undefined' && I18N.currentLang === 'EN';
  processUploadedImage(file, (dataUrl) => {
    if (type === 'floorPlan') {
      const input = document.getElementById('adminInputPelanSekolah');
      if (input) input.value = dataUrl;
      const previewCont = document.getElementById('previewContainerHallMap');
      const previewImg = document.getElementById('adminPreviewHallMap');
      if (previewCont && previewImg) {
        previewImg.src = dataUrl;
        previewCont.classList.remove('hidden');
      }
      showToast(isEn ? 'Hall floor plan image loaded!' : 'Pelan dewan berjaya dimuat naik!', 'success');
    } else if (type === 'parking') {
      const input = document.getElementById('adminInputPelanParking');
      if (input) input.value = dataUrl;
      const previewCont = document.getElementById('previewContainerParkingMap');
      const previewImg = document.getElementById('adminPreviewParkingMap');
      if (previewCont && previewImg) {
        previewImg.src = dataUrl;
        previewCont.classList.remove('hidden');
      }
      showToast(isEn ? 'Parking map image loaded!' : 'Peta parking berjaya dimuat naik!', 'success');
    }
  });
}

function clearAdminMap(type) {
  const isEn = typeof I18N !== 'undefined' && I18N.currentLang === 'EN';
  if (type === 'floorPlan') {
    const input = document.getElementById('adminInputPelanSekolah');
    const fileIn = document.getElementById('adminUploadPelanSekolah');
    const previewCont = document.getElementById('previewContainerHallMap');
    const previewImg = document.getElementById('adminPreviewHallMap');
    if (input) input.value = '';
    if (fileIn) fileIn.value = '';
    if (previewCont) previewCont.classList.add('hidden');
    if (previewImg) previewImg.src = '';
    showToast(isEn ? 'Hall map removed.' : 'Pelan dewan dipadam.', 'info');
  } else if (type === 'parking') {
    const input = document.getElementById('adminInputPelanParking');
    const fileIn = document.getElementById('adminUploadPelanParking');
    const previewCont = document.getElementById('previewContainerParkingMap');
    const previewImg = document.getElementById('adminPreviewParkingMap');
    if (input) input.value = '';
    if (fileIn) fileIn.value = '';
    if (previewCont) previewCont.classList.add('hidden');
    if (previewImg) previewImg.src = '';
    showToast(isEn ? 'Parking map removed.' : 'Peta parking dipadam.', 'info');
  }
}

function handleAdminUrlInput(type) {
  if (type === 'floorPlan') {
    const url = (document.getElementById('adminInputPelanSekolah')?.value || '').trim();
    const previewCont = document.getElementById('previewContainerHallMap');
    const previewImg = document.getElementById('adminPreviewHallMap');
    if (url && previewCont && previewImg) {
      previewImg.src = url;
      previewCont.classList.remove('hidden');
    } else if (previewCont) {
      previewCont.classList.add('hidden');
    }
  } else if (type === 'parking') {
    const url = (document.getElementById('adminInputPelanParking')?.value || '').trim();
    const previewCont = document.getElementById('previewContainerParkingMap');
    const previewImg = document.getElementById('adminPreviewParkingMap');
    if (url && previewCont && previewImg) {
      previewImg.src = url;
      previewCont.classList.remove('hidden');
    } else if (previewCont) {
      previewCont.classList.add('hidden');
    }
  }
}

let adminSelectedParkingMode = 'info_only';

function setAdminParkingMode(mode) {
  adminSelectedParkingMode = mode;
  const btnInfo = document.getElementById('btnParkingModeInfo');
  const btnMap = document.getElementById('btnParkingModeMap');
  const uploadArea = document.getElementById('adminParkingMapUploadArea');

  if (mode === 'map_info') {
    if (btnMap) {
      btnMap.className = 'py-1 px-2 rounded-md font-bold text-[11px] transition-all bg-amber-500 text-white shadow-sm flex items-center justify-center gap-1';
    }
    if (btnInfo) {
      btnInfo.className = 'py-1 px-2 rounded-md font-semibold text-[11px] text-slate-600 hover:text-slate-900 transition-all flex items-center justify-center gap-1';
    }
    if (uploadArea) {
      uploadArea.classList.remove('hidden');
      uploadArea.classList.add('flex');
    }
  } else {
    // info_only
    if (btnInfo) {
      btnInfo.className = 'py-1 px-2 rounded-md font-bold text-[11px] transition-all bg-amber-500 text-white shadow-sm flex items-center justify-center gap-1';
    }
    if (btnMap) {
      btnMap.className = 'py-1 px-2 rounded-md font-semibold text-[11px] text-slate-600 hover:text-slate-900 transition-all flex items-center justify-center gap-1';
    }
    if (uploadArea) {
      uploadArea.classList.add('hidden');
      uploadArea.classList.remove('flex');
    }
  }
}

function populateAdminEventForm(eventId) {
  const ev = (AppState.events.find(e => e.Event_ID === eventId) || AppState.activeEvent) || getFallbackEvents()[0];
  if (!ev) return;
  const isEn = typeof I18N !== 'undefined' && I18N.currentLang === 'EN';
  AppState.activeAdminEditId = eventId;

  const idBadge = document.getElementById('adminEventIdBadge');
  const formTitle = document.getElementById('adminEventFormTitle');
  if (idBadge) idBadge.innerText = ev.Event_ID;
  if (formTitle) formTitle.innerText = (isEn ? 'Update: ' : 'Kemaskini: ') + (ev.Sekolah || ev.Nama_Acara);

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val || '';
  };

  setVal('adminInputEventId', ev.Event_ID);
  setVal('adminInputNamaAcara', ev.Nama_Acara);
  setVal('adminInputKategori', ev.Kategori_Program || 'Program Hala Tuju');
  setVal('adminInputTarikhMula', ev.Tarikh_Mula);
  setVal('adminInputMasa', ev.Masa);
  setVal('adminInputTempat', ev.Tempat_Venue);
  setVal('adminInputGps', ev.Pautan_GPS_Maps);
  setVal('adminInputPelanSekolah', ev.Pelan_Sekolah_URL || '');
  setVal('adminInputPelanParking', ev.Pelan_Parking_URL || '');
  setVal('adminInputPanduanParking', ev.Panduan_Parking || '');
  setVal('adminInputCatatanKhas', ev.Catatan_Khas || '');

  // Pratinjau Pelan Dewan Sekolah
  const previewHallCont = document.getElementById('previewContainerHallMap');
  const previewHallImg = document.getElementById('adminPreviewHallMap');
  if (ev.Pelan_Sekolah_URL && previewHallCont && previewHallImg) {
    previewHallImg.src = ev.Pelan_Sekolah_URL;
    previewHallCont.classList.remove('hidden');
  } else if (previewHallCont) {
    previewHallCont.classList.add('hidden');
  }

  // Mod & Pratinjau Parking Sekolah
  const mode = ev.Jenis_Parking || (ev.Pelan_Parking_URL ? 'map_info' : 'info_only');
  setAdminParkingMode(mode);

  const previewParkCont = document.getElementById('previewContainerParkingMap');
  const previewParkImg = document.getElementById('adminPreviewParkingMap');
  if (ev.Pelan_Parking_URL && previewParkCont && previewParkImg) {
    previewParkImg.src = ev.Pelan_Parking_URL;
    previewParkCont.classList.remove('hidden');
  } else if (previewParkCont) {
    previewParkCont.classList.add('hidden');
  }
}

async function handleSaveAdminEvent(event) {
  if (event) event.preventDefault();
  const isEn = typeof I18N !== 'undefined' && I18N.currentLang === 'EN';

  const eventId = document.getElementById('adminInputEventId').value;
  const list = AppState.events.length ? AppState.events : getFallbackEvents();
  const idx = list.findIndex(e => e.Event_ID === eventId);
  const prev = idx > -1 ? list[idx] : {};

  const parkingMode = adminSelectedParkingMode || 'info_only';
  const parkingUrl = parkingMode === 'map_info' ? (document.getElementById('adminInputPelanParking')?.value || '').trim() : '';

  const updated = Object.assign({}, prev, {
    Event_ID: eventId,
    Nama_Acara: document.getElementById('adminInputNamaAcara').value.trim(),
    Kategori_Program: document.getElementById('adminInputKategori').value,
    Tarikh_Mula: document.getElementById('adminInputTarikhMula').value.trim(),
    Masa: document.getElementById('adminInputMasa').value.trim(),
    Tempat_Venue: document.getElementById('adminInputTempat').value.trim(),
    Pautan_GPS_Maps: document.getElementById('adminInputGps').value.trim(),
    Pelan_Sekolah_URL: (document.getElementById('adminInputPelanSekolah')?.value || '').trim(),
    Pelan_Parking_URL: parkingUrl,
    Jenis_Parking: parkingMode,
    Panduan_Parking: (document.getElementById('adminInputPanduanParking')?.value || '').trim(),
    Catatan_Khas: (document.getElementById('adminInputCatatanKhas')?.value || '').trim(),
    Status_Acara: 'Aktif'
  });

  if (idx > -1) {
    list[idx] = updated;
  } else {
    list.push(updated);
  }

  AppState.events = list;
  AppState.activeEvent = updated;
  localStorage.setItem('ceu_cache_events', JSON.stringify(list));

  showToast(isEn ? 'Event details & school maps saved successfully!' : 'Maklumat acara & peta sekolah berjaya disimpan!', 'success');
  renderAdminEventsList();
  if (AppState.currentView === 'home') renderHomeScreen();

  // Hantar kemaskini ke Apps Script backend
  apiCall('saveEvent', updated, true).catch(() => {});
}

// ============================================
// MODAL PAPARAN PETA SEKOLAH & PARKING AGENSI
// ============================================
function openMapModal(type) {
  const modal = document.getElementById('mapViewerModal');
  const icon = document.getElementById('mapModalIcon');
  const title = document.getElementById('mapModalTitle');
  const area = document.getElementById('mapModalContentArea');
  if (!modal || !area) return;

  const isEn = typeof I18N !== 'undefined' && I18N.currentLang === 'EN';
  const ev = AppState.activeEvent || getFallbackEvents()[0];

  if (type === 'floorPlan') {
    if (icon) icon.innerText = 'view_quilt';
    if (title) title.innerText = isEn ? 'School Hall Floor Plan (Booth Layout)' : 'Pelan Dewan Sekolah (Susunan Meja Agensi)';
    const hasMapImage = !!ev.Pelan_Sekolah_URL;
    area.innerHTML = `
      <div class="flex flex-col gap-3">
        <div class="p-3 bg-teal-50 rounded-xl border border-teal-100 text-xs text-teal-900 flex items-center gap-2">
          <span class="material-symbols-outlined text-teal-700">info</span>
          <span>${isEn ? 'Each agency is allocated 1 exhibition table & 2 chairs. Power sockets are available upon request.' : 'Setiap agensi diperuntukkan 1 meja pameran &amp; 2 kerusi. Soket elektrik disediakan atas permohonan rasmi.'}</span>
        </div>
        ${hasMapImage ? `
          <div class="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 p-2 text-center">
            <img src="${ev.Pelan_Sekolah_URL}" class="w-full max-h-72 object-contain rounded-lg shadow-sm mx-auto" alt="Pelan Dewan ${ev.Sekolah || ev.Nama_Acara}" />
            <p class="text-[10px] text-slate-500 mt-2 font-mono">${isEn ? 'Agency Exhibition Booth Layout • ' : 'Pelan Susun Atur Meja Pameran Agensi • '}${ev.Tempat_Venue}</p>
          </div>
        ` : `
          <div class="p-6 rounded-xl border-2 border-dashed border-teal-200 bg-teal-50/40 text-center flex flex-col items-center gap-2">
            <span class="material-symbols-outlined text-teal-600 text-[36px]">table_restaurant</span>
            <h4 class="font-bold text-xs text-slate-800">${ev.Tempat_Venue}</h4>
            <p class="text-[11px] text-slate-600 max-w-sm">${isEn ? 'Floor plan image has not been uploaded yet for this school. Booth tables are allocated upon arrival at the foyer/hall.' : 'Gambar pelan dewan belum dimuat naik untuk sekolah ini. Meja pameran akan dilabelkan di pintu masuk foyer/dewan semasa pendaftaran tiba.'}</p>
          </div>
        `}
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <span class="text-[10px] text-slate-400 block uppercase">${isEn ? 'Booth Setup Time' : 'Waktu Susun Meja'}</span>
            <span class="font-bold text-slate-800">${isEn ? '07:00 AM' : '07:00 Pagi'}</span>
          </div>
          <div class="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <span class="text-[10px] text-slate-400 block uppercase">${isEn ? 'Agency Entry Gate' : 'Pintu Masuk Agensi'}</span>
            <span class="font-bold text-slate-800">${isEn ? 'Main Hall Entrance' : 'Pintu Utama Dewan'}</span>
          </div>
        </div>
      </div>
    `;
  } else {
    // parking
    if (icon) icon.innerText = 'directions_car';
    if (title) title.innerText = isEn ? 'Agency Parking Guide & Location' : 'Panduan & Lokasi Parking Agensi';
    const isMapMode = (ev.Jenis_Parking === 'map_info') && !!ev.Pelan_Parking_URL;

    area.innerHTML = `
      <div class="flex flex-col gap-3">
        <div class="p-3 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-900 flex items-center gap-2">
          <span class="material-symbols-outlined text-amber-700">verified</span>
          <span>${isEn ? 'Official agency parking pass is valid for registered participating representatives.' : 'Pas masuk parking rasmi agensi sah untuk wakil pegawai pempamer berdaftar.'}</span>
        </div>
        ${isMapMode ? `
          <div class="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 p-2 text-center">
            <img src="${ev.Pelan_Parking_URL}" class="w-full max-h-72 object-contain rounded-lg shadow-sm mx-auto" alt="Peta Parking" />
            <p class="text-[10px] text-slate-500 mt-2 font-mono">${ev.Panduan_Parking || (isEn ? 'Official Agency Parking Area' : 'Kawasan Tempat Letak Kereta Agensi')}</p>
          </div>
        ` : `
          <div class="p-4 rounded-xl border border-amber-200 bg-amber-50/50 flex flex-col gap-2">
            <div class="flex items-center gap-2 font-bold text-xs text-amber-900">
              <span class="material-symbols-outlined text-[18px] text-amber-600">info</span>
              <span>${isEn ? 'School Parking Guidance (Information Only)' : 'Panduan Parking Sekolah (Maklumat Sahaja)'}</span>
            </div>
            <p class="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-amber-100">
              ${ev.Panduan_Parking || (isEn ? 'Please follow host school guidance for designated agency representative parking upon entering the compound.' : 'Sila patuhi panduan pihak sekolah bagi tempat letak kereta rasmi wakil agensi semasa memasuki kawasan sekolah.')}
            </p>
            <div class="flex items-center justify-between text-[11px] text-slate-600 px-1">
              <span>● ${isEn ? '1 Dedicated Bay Allocated' : '1 Petak Khas Agensi Disediakan'}</span>
              <span>● ${isEn ? 'No Plate Registration Required' : 'Tanpa Pendaftaran Plat'}</span>
            </div>
          </div>
        `}
        <div class="flex flex-col gap-2">
          <a href="${ev.Pautan_GPS_Maps || 'https://maps.google.com/?q=' + encodeURIComponent(ev.Tempat_Venue + ' Brunei')}" target="_blank" class="w-full py-2.5 bg-[#006194] hover:bg-[#004b73] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all">
            <span class="material-symbols-outlined text-[18px]">near_me</span>
            <span>${isEn ? 'Open Google Maps Navigation' : 'Buka Navigasi Google Maps'}</span>
          </a>
        </div>
      </div>
    `;
  }

  modal.classList.add('active');
}

function closeMapModal() {
  const modal = document.getElementById('mapViewerModal');
  if (modal) modal.classList.remove('active');
}

// ============================================
// 11. ENJIN DOKUMEN & PERSURATAN (gas-doc-engine)
// ============================================
function openDocumentGeneratorModal(agencyId = null, eventId = null) {
  const user = AppState.currentUser;
  const targetAgencyId = agencyId || (user ? user.id : 'AG-05');
  const targetEventId = eventId || (typeof adminSelectedSchoolId !== 'undefined' && adminSelectedSchoolId !== 'ALL' ? adminSelectedSchoolId : null);
  const ev = (targetEventId ? (AppState.events || getFallbackEvents()).find(e => e.Event_ID === targetEventId) : null) || AppState.activeEvent || getFallbackEvents()[0];
  const isEn = typeof I18N !== 'undefined' && I18N.currentLang === 'EN';

  showToast(isEn ? 'Generating official Logistics Confirmation Letter...' : 'Menjana Surat Perakuan Logistik rasmi...', 'info');

  // Jana data perakuan rasmi serta-merta di sisi klien (0ms Instant UX)
  const agensi = (AppState.agencies || []).find(a => a.kod === targetAgencyId) || {
    nama: user ? user.namaAgensi : 'UNIVERSITI BRUNEI DARUSSALAM',
    kategori: isEn ? 'Higher Education Institution (HEI)' : 'Institusi Pengajian Tinggi (IPT)'
  };
  const rsvp = (AppState.rsvps || []).find(r => r.Event_ID === ev.Event_ID && (r.Agensi_ID === targetAgencyId || r.Agensi_ID === (user && user.id))) || {};
  const refNo = 'CEU/JSS/' + (ev.Event_ID || 'EVT') + '/' + targetAgencyId + '/' + new Date().getFullYear();
  const todayStr = isEn 
    ? new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' });
  const hmacCode = 'CEU-' + Math.random().toString(36).substring(2, 10).toUpperCase();

  const statusDisplay = isEn 
    ? (rsvp.Status_RSVP === 'Hadir' || rsvp.Status_RSVP === 'Hadir (Disahkan)' ? 'Attending (Confirmed)' : (rsvp.Status_RSVP === 'Tidak Hadir' ? 'Declined / Not Attending' : 'Pending / Not Confirmed'))
    : (rsvp.Status_RSVP || 'Hadir (Disahkan)');

  const d = {
    NOMOR: refNo,
    TANGGAL: todayStr,
    NAMA_AGENSI: agensi.nama || (user && user.namaAgensi) || (isEn ? 'Invited Agency' : 'Agensi Jemputan'),
    KATEGORI_AGENSI: agensi.kategori || (user && user.kategori) || (isEn ? 'Official Invited Agency / Institution' : 'Agensi / Institusi Jemputan'),
    NAMA_ACARA: ev.Nama_Acara,
    TARIKH_ACARA: formatDisplayDate(ev.Tarikh_Paparan || ev.Tarikh_Mula, isEn),
    TEMPAT_ACARA: (ev.Tempat_Venue || (isEn ? 'School Hall' : 'Dewan Sekolah')) + ' (' + (isEn ? `${ev.Daerah} District` : ev.Daerah || '') + ')',
    STATUS_RSVP: statusDisplay,
    BIL_MEJA: rsvp.Bil_Meja || rsvp.bilMeja || 1,
    BIL_KERUSI: rsvp.Bil_Kerusi || rsvp.bilKerusi || 2,
    BIL_PLUG: rsvp.Bil_Plug || rsvp.bilPlug || 1,
    JUMLAH_WAKIL: rsvp.Jumlah_Wakil || rsvp.jumlahWakil || 2,
    PEGAWAI_PENGESAH: isEn ? 'Career Development Officer, CEU / JSS' : 'Pegawai Perkembangan Kerjaya CEU / JSS',
    KODE_VERIFIKASI: hmacCode
  };

  const modal = document.getElementById('docEngineModal');
  const previewArea = document.getElementById('docPreviewArea');

  if (previewArea && d) {
    previewArea.innerHTML = isEn ? `
      <div class="border-2 border-slate-800 p-6 bg-white rounded-xl shadow-lg font-serif text-slate-900 space-y-4 text-xs leading-relaxed">
        <div class="text-center border-b-2 border-slate-800 pb-3">
          <h2 class="text-base font-bold uppercase tracking-wider">MINISTRY OF EDUCATION</h2>
          <h3 class="text-xs font-semibold uppercase">DEPARTMENT OF SCHOOLS · CAREER EDUCATION UNIT</h3>
          <p class="text-[10px] italic text-slate-600">Negara Brunei Darussalam</p>
        </div>

        <div class="flex justify-between text-[11px] font-sans">
          <div><strong>Our Ref:</strong> <span id="docRefNoPlaceholder">${d.NOMOR}</span></div>
          <div><strong>Date:</strong> ${d.TANGGAL}</div>
        </div>

        <div class="pt-1 font-sans">
          <div>To:</div>
          <div class="font-bold text-sm text-slate-900 uppercase">${d.NAMA_AGENSI}</div>
          <div class="text-slate-600">${d.KATEGORI_AGENSI}</div>
        </div>

        <div class="font-bold underline text-xs font-sans uppercase pt-2">
          CONFIRMATION OF RSVP ACCEPTANCE & SCHOOL LOGISTICS PROVISION: ${d.NAMA_ACARA}
        </div>

        <p class="font-sans">
          We are pleased to inform that the organizer, Career Education Unit, has received official confirmation of attendance from your esteemed agency for the aforementioned program scheduled on <strong>${d.TARIKH_ACARA}</strong> at <strong>${d.TEMPAT_ACARA}</strong>.
        </p>

        <div class="bg-slate-50 p-3 rounded-lg border border-slate-200 font-sans">
          <div class="font-bold text-slate-800 mb-1">Details of Amenities Prepared at Hall:</div>
          <ul class="list-disc list-inside space-y-0.5 text-slate-700">
            <li>Attendance Status: <strong>${d.STATUS_RSVP}</strong></li>
            <li>Exhibition Tables: <strong>${d.BIL_MEJA} Unit(s)</strong></li>
            <li>Booth Chairs: <strong>${d.BIL_KERUSI} Unit(s)</strong></li>
            <li>Power Extension: <strong>${d.BIL_PLUG} Unit(s)</strong></li>
            <li>Expected Representatives: <strong>${d.JUMLAH_WAKIL} Pax</strong></li>
          </ul>
        </div>

        <div class="flex justify-between items-end pt-4 font-sans">
          <div>
            <p class="text-[10px] text-slate-500">Digitally signed:</p>
            <p class="font-bold mt-1">${d.PEGAWAI_PENGESAH}</p>
          </div>
          <div class="flex flex-col items-center">
            <div class="w-16 h-16 bg-slate-100 border border-dashed border-slate-400 flex items-center justify-center p-1 rounded">
              <span class="material-symbols-outlined text-[36px] text-slate-700">qr_code_2</span>
            </div>
            <span class="text-[9px] font-mono text-slate-500 mt-0.5">CODE: ${String(d.KODE_VERIFIKASI).slice(0, 8)}</span>
          </div>
        </div>
      </div>
    ` : `
      <div class="border-2 border-slate-800 p-6 bg-white rounded-xl shadow-lg font-serif text-slate-900 space-y-4 text-xs leading-relaxed">
        <div class="text-center border-b-2 border-slate-800 pb-3">
          <h2 class="text-base font-bold uppercase tracking-wider">KEMENTERIAN PENDIDIKAN</h2>
          <h3 class="text-xs font-semibold uppercase">JABATAN SEKOLAH-SEKOLAH · UNIT PENDIDIKAN KERJAYA</h3>
          <p class="text-[10px] italic text-slate-600">Negara Brunei Darussalam</p>
        </div>

        <div class="flex justify-between text-[11px] font-sans">
          <div><strong>Ruj. Kami:</strong> <span id="docRefNoPlaceholder">${d.NOMOR}</span></div>
          <div><strong>Tarikh:</strong> ${d.TANGGAL}</div>
        </div>

        <div class="pt-1 font-sans">
          <div>Kepada:</div>
          <div class="font-bold text-sm text-slate-900 uppercase">${d.NAMA_AGENSI}</div>
          <div class="text-slate-600">${d.KATEGORI_AGENSI}</div>
        </div>

        <div class="font-bold underline text-xs font-sans uppercase pt-2">
          PERAKUAN PENERIMAAN RSVP & PENYEDIAAN KELENGKAPAN LOGISTIK SEKOLAH: ${d.NAMA_ACARA}
        </div>

        <p class="font-sans">
          Dengan hormatnya sukacita dimaklumkan bahawa pihak penganjur Unit Pendidikan Kerjaya telah menerima pengesahan kehadiran rasmi daripada pihak tuan/puan bagi program tersebut di atas bertarikh <strong>${d.TARIKH_ACARA}</strong> di <strong>${d.TEMPAT_ACARA}</strong>.
        </p>

        <div class="bg-slate-50 p-3 rounded-lg border border-slate-200 font-sans">
          <div class="font-bold text-slate-800 mb-1">Perincian Kelengkapan Disediakan Dewan:</div>
          <ul class="list-disc list-inside space-y-0.5 text-slate-700">
            <li>Status Kehadiran: <strong>${d.STATUS_RSVP}</strong></li>
            <li>Meja Pameran: <strong>${d.BIL_MEJA} Unit</strong></li>
            <li>Kerusi Booth: <strong>${d.BIL_KERUSI} Unit</strong></li>
            <li>Penyambung Elektrik (Extension): <strong>${d.BIL_PLUG} Unit</strong></li>
            <li>Pegawai Bertugas Dijangka: <strong>${d.JUMLAH_WAKIL} Orang</strong></li>
          </ul>
        </div>

        <div class="flex justify-between items-end pt-4 font-sans">
          <div>
            <p class="text-[10px] text-slate-500">Ditandatangani secara digital:</p>
            <p class="font-bold mt-1">${d.PEGAWAI_PENGESAH}</p>
          </div>
          <div class="flex flex-col items-center">
            <div class="w-16 h-16 bg-slate-100 border border-dashed border-slate-400 flex items-center justify-center p-1 rounded">
              <span class="material-symbols-outlined text-[36px] text-slate-700">qr_code_2</span>
            </div>
            <span class="text-[9px] font-mono text-slate-500 mt-0.5">KOD: ${String(d.KODE_VERIFIKASI).slice(0, 8)}</span>
          </div>
        </div>
      </div>
    `;
  }

  if (modal) modal.classList.add('active');

  // Segerakkan ke Google Apps Script di latar belakang secara selamat
  apiCall('generateSuratJemputan', {
    eventId: ev.Event_ID,
    agencyId: targetAgencyId,
    jenisSurat: 'SURAT_PERAKUAN_LOGISTIK'
  }, true).then(res => {
    if (res && res.success && res.dokumen && res.dokumen.data) {
      const serverRef = document.getElementById('docRefNoPlaceholder');
      if (serverRef && res.dokumen.data.NOMOR) {
        serverRef.innerText = res.dokumen.data.NOMOR;
      }
    }
  }).catch(() => {});
}

function closeDocModal() {
  const modal = document.getElementById('docEngineModal');
  if (modal) modal.classList.remove('active');
}

// ============================================
// 12. UTILITI: TOAST & FALLBACK DATA
// ============================================
function showToast(msg, type = 'info') {
  const toast = document.getElementById('appToast');
  if (!toast) return;
  toast.innerText = msg;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

function fetchInitialDataSilently() {
  // 1. Tarik RSVP awam daripada Google Sheets secara automatik (bebas masalah token tamat)
  if (CONFIG && CONFIG.GAS_URL) {
    fetch(CONFIG.GAS_URL + '?action=getRsvps')
      .then(r => r.json())
      .then(res => {
        if (res && res.success && Array.isArray(res.rsvps)) {
          const normalized = res.rsvps.map(sr => ({
            ...sr,
            bilMeja: sr.bilMeja !== undefined ? Number(sr.bilMeja) : (sr.Bil_Meja !== undefined ? Number(sr.Bil_Meja) : 1),
            bilKerusi: sr.bilKerusi !== undefined ? Number(sr.bilKerusi) : (sr.Bil_Kerusi !== undefined ? Number(sr.Bil_Kerusi) : 2),
            bilPlug: sr.bilPlug !== undefined ? Number(sr.bilPlug) : (sr.Bil_Plug !== undefined ? Number(sr.Bil_Plug) : 1),
            namaWakilHadir: sr.namaWakilHadir || sr.Nama_Wakil_Hadir || '-',
            jumlahWakil: sr.jumlahWakil !== undefined ? Number(sr.jumlahWakil) : (sr.Jumlah_Wakil !== undefined ? Number(sr.Jumlah_Wakil) : 2),
            statusRsvp: sr.Status_RSVP || sr.statusRsvp || 'Belum Sah',
            Status_RSVP: sr.Status_RSVP || sr.statusRsvp || 'Belum Sah'
          }));
          AppState.rsvps = normalized;
          localStorage.setItem('ceu_cache_rsvps', JSON.stringify(AppState.rsvps));
          if (AppState.currentView === 'home') renderHomeScreen(false);
          if (AppState.currentView === 'admin') renderAdminDashboard();
        }
      })
      .catch(() => {});
  }

  // 2. Tarik data sesi acara & notifikasi pentadbir
  apiCall('getInitialData').then(res => {
    if (res && res.success) {
      if (res.events && res.events.length >= 31) {
        AppState.events = res.events.filter(e => e.Event_ID !== 'EVT-FL-05' && !(e.Nama_Acara || '').includes('Maktab Duli'));
        localStorage.setItem('ceu_cache_events', JSON.stringify(AppState.events));
      } else {
        if (!AppState.events || AppState.events.length < 31) {
          AppState.events = getFallbackEvents();
          localStorage.setItem('ceu_cache_events', JSON.stringify(AppState.events));
        }
      }
      if (res.rsvps && Array.isArray(res.rsvps) && (!AppState.rsvps || AppState.rsvps.length === 0)) {
        const normalized = res.rsvps.map(sr => ({
          ...sr,
          bilMeja: sr.bilMeja !== undefined ? Number(sr.bilMeja) : (sr.Bil_Meja !== undefined ? Number(sr.Bil_Meja) : 1),
          bilKerusi: sr.bilKerusi !== undefined ? Number(sr.bilKerusi) : (sr.Bil_Kerusi !== undefined ? Number(sr.Bil_Kerusi) : 2),
          bilPlug: sr.bilPlug !== undefined ? Number(sr.bilPlug) : (sr.Bil_Plug !== undefined ? Number(sr.Bil_Plug) : 1),
          namaWakilHadir: sr.namaWakilHadir || sr.Nama_Wakil_Hadir || '-',
          jumlahWakil: sr.jumlahWakil !== undefined ? Number(sr.jumlahWakil) : (sr.Jumlah_Wakil !== undefined ? Number(sr.Jumlah_Wakil) : 2),
          statusRsvp: sr.Status_RSVP || sr.statusRsvp || 'Belum Sah',
          Status_RSVP: sr.Status_RSVP || sr.statusRsvp || 'Belum Sah'
        }));
        AppState.rsvps = normalized;
        localStorage.setItem('ceu_cache_rsvps', JSON.stringify(AppState.rsvps));
      }
      if (AppState.currentView === 'home') renderHomeScreen(false);
      if (AppState.currentView === 'adminEvents') renderAdminEventsList();
      if (AppState.currentView === 'admin') renderAdminDashboard();
    }
  }).catch(() => {});
}

// Auto-Sync Latar Belakang: Segerakkan RSVP secara automatik tanpa perlu refresh manual
setInterval(() => {
  if (typeof AppState !== 'undefined' && (AppState.currentView === 'admin' || AppState.currentView === 'home')) {
    fetchInitialDataSilently();
  }
}, 15000);

if (typeof window !== 'undefined') {
  window.addEventListener('focus', () => {
    fetchInitialDataSilently();
  });
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) fetchInitialDataSilently();
    });
  }
}

function getFallbackEvents() {
  const events = [
    // --- 31 SESI TAKWIM TERSUSUN KRONOLOGI MENGIKUT TARIKH ---
    {
          "Event_ID": "EVT-PHT-01",
          "Kategori_Program": "Program Hala Tuju",
          "Nama_Acara": "Program Hala Tuju - SM Tanjong Maya",
          "Sekolah": "Sekolah Menengah Tanjong Maya",
          "Daerah": "Tutong",
          "Tarikh_Mula": "2027-01-25",
          "Tarikh_Paparan": "25/01/2027 (Isnin)",
          "Hari": "Isnin",
          "Masa": "09:00 - 11:30",
          "Tempat_Venue": "Dewan Sekolah Menengah Tanjong Maya",
          "Pautan_GPS_Maps": "https://maps.google.com/?q=Sekolah+Menengah+Tanjong+Maya+Brunei",
          "Pelan_Sekolah_URL": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80",
          "Pelan_Parking_URL": "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80",
          "Panduan_Parking": "Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi). Zon parking dikhaskan di Blok C.",
          "Catatan_Khas": "Pakaian rasmi pejabat / kot. Meja pameran disediakan oleh pihak sekolah di dewan.",
          "Status_Acara": "Aktif"
    },
    {
          "Event_ID": "EVT-PHT-02",
          "Kategori_Program": "Program Hala Tuju",
          "Nama_Acara": "Program Hala Tuju - SM Sayyidina ‘Othman",
          "Sekolah": "Sekolah Menengah Sayyidina ‘Othman",
          "Daerah": "Tutong",
          "Tarikh_Mula": "2027-01-26",
          "Tarikh_Paparan": "26/01/2027 (Selasa)",
          "Hari": "Selasa",
          "Masa": "09:00 - 11:30",
          "Tempat_Venue": "Dewan Sekolah Menengah Sayyidina ‘Othman",
          "Pautan_GPS_Maps": "https://maps.google.com/?q=Sekolah+Menengah+Sayyidina+Othman+Brunei",
          "Pelan_Sekolah_URL": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80",
          "Pelan_Parking_URL": "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80",
          "Panduan_Parking": "Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi).",
          "Catatan_Khas": "Pakaian rasmi pejabat / kot. Meja pameran disediakan di dewan.",
          "Status_Acara": "Aktif"
    },
    {
          "Event_ID": "EVT-PHT-03",
          "Kategori_Program": "Program Hala Tuju",
          "Nama_Acara": "Program Hala Tuju - SM Sayyidina Husain",
          "Sekolah": "Sekolah Menengah Sayyidina Husain",
          "Daerah": "Brunei Muara",
          "Tarikh_Mula": "2027-01-28",
          "Tarikh_Paparan": "28/01/2027 (Khamis)",
          "Hari": "Khamis",
          "Masa": "09:00 - 11:30",
          "Tempat_Venue": "Dewan Sekolah Menengah Sayyidina Husain",
          "Pautan_GPS_Maps": "https://maps.google.com/?q=Sekolah+Menengah+Sayyidina+Husain+Brunei",
          "Pelan_Sekolah_URL": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80",
          "Pelan_Parking_URL": "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80",
          "Panduan_Parking": "Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi).",
          "Catatan_Khas": "Pakaian rasmi pejabat / kot.",
          "Status_Acara": "Aktif"
    },
    {
          "Event_ID": "EVT-PHT-04",
          "Kategori_Program": "Program Hala Tuju",
          "Nama_Acara": "Program Hala Tuju - SM Katok",
          "Sekolah": "Sekolah Menengah Katok",
          "Daerah": "Brunei Muara",
          "Tarikh_Mula": "2027-02-01",
          "Tarikh_Paparan": "01/02/2027 (Isnin)",
          "Hari": "Isnin",
          "Masa": "09:00 - 11:30",
          "Tempat_Venue": "Dewan Sekolah Menengah Katok",
          "Pautan_GPS_Maps": "https://maps.google.com/?q=Sekolah+Menengah+Katok+Brunei",
          "Pelan_Sekolah_URL": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80",
          "Pelan_Parking_URL": "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80",
          "Panduan_Parking": "Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi).",
          "Catatan_Khas": "Pakaian rasmi pejabat / kot.",
          "Status_Acara": "Aktif"
    },
    {
          "Event_ID": "EVT-PHT-05",
          "Kategori_Program": "Program Hala Tuju",
          "Nama_Acara": "Program Hala Tuju - SM PAP Hajah Rashidah + Maktab Anthony Abell",
          "Sekolah": "Sekolah Menengah Pengiran Anak Puteri Hajah Rashidah + Maktab Anthony Abell",
          "Daerah": "Belait",
          "Tarikh_Mula": "2027-02-02",
          "Tarikh_Paparan": "02/02/2027 (Selasa)",
          "Hari": "Selasa",
          "Masa": "09:00 - 12:00",
          "Tempat_Venue": "Dewan Sekolah Menengah Pengiran Anak Puteri Hajah Rashidah",
          "Pautan_GPS_Maps": "https://maps.google.com/?q=SMPAPH+Rashidah+Lumut+Brunei",
          "Pelan_Sekolah_URL": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80",
          "Pelan_Parking_URL": "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80",
          "Panduan_Parking": "Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi Daerah Belait).",
          "Catatan_Khas": "Penyertaan gabungan bersama Maktab Anthony Abell. Masa sesi Daerah Belait: 09:00 - 12:00.",
          "Status_Acara": "Aktif"
    },
    {
          "Event_ID": "EVT-PHT-06",
          "Kategori_Program": "Program Hala Tuju",
          "Nama_Acara": "Program Hala Tuju - SM Sultan Sharif Ali",
          "Sekolah": "Sekolah Menengah Sultan Sharif Ali",
          "Daerah": "Brunei Muara",
          "Tarikh_Mula": "2027-02-04",
          "Tarikh_Paparan": "04/02/2027 (Khamis)",
          "Hari": "Khamis",
          "Masa": "09:00 - 11:30",
          "Tempat_Venue": "Dewan Sekolah Menengah Sultan Sharif Ali",
          "Pautan_GPS_Maps": "https://maps.google.com/?q=Sekolah+Menengah+Sultan+Sharif+Ali+Brunei",
          "Pelan_Sekolah_URL": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80",
          "Pelan_Parking_URL": "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80",
          "Panduan_Parking": "Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi).",
          "Catatan_Khas": "Pakaian rasmi pejabat / kot.",
          "Status_Acara": "Aktif"
    },
    {
          "Event_ID": "EVT-PHT-07",
          "Kategori_Program": "Program Hala Tuju",
          "Nama_Acara": "Program Hala Tuju - SM Pengiran Isteri Hajjah Mariam Serasa",
          "Sekolah": "Sekolah Menengah Pengiran Isteri Hajjah Mariam Serasa",
          "Daerah": "Brunei Muara",
          "Tarikh_Mula": "2027-03-22",
          "Tarikh_Paparan": "22/03/2027 (Isnin)",
          "Hari": "Isnin",
          "Masa": "09:00 - 11:30",
          "Tempat_Venue": "Dewan Sekolah Menengah Pengiran Isteri Hajjah Mariam Serasa",
          "Pautan_GPS_Maps": "https://maps.google.com/?q=SMPIHM+Serasa+Muara+Brunei",
          "Pelan_Sekolah_URL": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80",
          "Pelan_Parking_URL": "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80",
          "Panduan_Parking": "Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi).",
          "Catatan_Khas": "Pakaian rasmi pejabat / kot.",
          "Status_Acara": "Aktif"
    },
    {
          "Event_ID": "EVT-PHT-08",
          "Kategori_Program": "Program Hala Tuju",
          "Nama_Acara": "Program Hala Tuju - SM Masin",
          "Sekolah": "Sekolah Menengah Masin",
          "Daerah": "Brunei Muara",
          "Tarikh_Mula": "2027-03-23",
          "Tarikh_Paparan": "23/03/2027 (Selasa)",
          "Hari": "Selasa",
          "Masa": "09:00 - 11:30",
          "Tempat_Venue": "Dewan Sekolah Menengah Masin",
          "Pautan_GPS_Maps": "https://maps.google.com/?q=Sekolah+Menengah+Masin+Brunei",
          "Pelan_Sekolah_URL": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80",
          "Pelan_Parking_URL": "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80",
          "Panduan_Parking": "Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi).",
          "Catatan_Khas": "Pakaian rasmi pejabat / kot.",
          "Status_Acara": "Aktif"
    },
    {
          "Event_ID": "EVT-PHT-09",
          "Kategori_Program": "Program Hala Tuju",
          "Nama_Acara": "Program Hala Tuju - SM PJN PH Abu Bakar + SM Perdana Wazir",
          "Sekolah": "Sekolah Menengah Pengiran Jaya Negara Pengiran Haji Abu Bakar + Sekolah Menengah Perdana Wazir",
          "Daerah": "Belait",
          "Tarikh_Mula": "2027-03-25",
          "Tarikh_Paparan": "25/03/2027 (Khamis)",
          "Hari": "Khamis",
          "Masa": "09:00 - 12:00",
          "Tempat_Venue": "Dewan Sekolah Menengah Pengiran Jaya Negara Pengiran Haji Abu Bakar",
          "Pautan_GPS_Maps": "https://maps.google.com/?q=SMPJN+PH+Abu+Bakar+Kuala+Belait",
          "Pelan_Sekolah_URL": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80",
          "Pelan_Parking_URL": "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80",
          "Panduan_Parking": "Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi Daerah Belait).",
          "Catatan_Khas": "Penyertaan gabungan bersama SM Perdana Wazir. Masa sesi Daerah Belait: 09:00 - 12:00.",
          "Status_Acara": "Aktif"
    },
    {
          "Event_ID": "EVT-PHT-10",
          "Kategori_Program": "Program Hala Tuju",
          "Nama_Acara": "Program Hala Tuju - SM Rimba II",
          "Sekolah": "Sekolah Menengah Rimba II",
          "Daerah": "Brunei Muara",
          "Tarikh_Mula": "2027-03-29",
          "Tarikh_Paparan": "29/03/2027 (Isnin)",
          "Hari": "Isnin",
          "Masa": "09:00 - 11:30",
          "Tempat_Venue": "Dewan Sekolah Menengah Rimba II",
          "Pautan_GPS_Maps": "https://maps.google.com/?q=Sekolah+Menengah+Rimba+II+Brunei",
          "Pelan_Sekolah_URL": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80",
          "Pelan_Parking_URL": "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80",
          "Panduan_Parking": "Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi).",
          "Catatan_Khas": "Pakaian rasmi pejabat / kot.",
          "Status_Acara": "Aktif"
    },
    {
          "Event_ID": "EVT-PHT-11",
          "Kategori_Program": "Program Hala Tuju",
          "Nama_Acara": "Program Hala Tuju - Maktab SOASC",
          "Sekolah": "Maktab Sultan Omar Ali Saifuddien",
          "Daerah": "Brunei Muara",
          "Tarikh_Mula": "2027-03-30",
          "Tarikh_Paparan": "30/03/2027 (Selasa)",
          "Hari": "Selasa",
          "Masa": "09:00 - 11:30",
          "Tempat_Venue": "Dewan Maktab Sultan Omar Ali Saifuddien",
          "Pautan_GPS_Maps": "https://maps.google.com/?q=Maktab+SOAS+Bandar+Seri+Begawan",
          "Pelan_Sekolah_URL": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80",
          "Pelan_Parking_URL": "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80",
          "Panduan_Parking": "Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi).",
          "Catatan_Khas": "Pakaian rasmi pejabat / kot.",
          "Status_Acara": "Aktif"
    },
    {
          "Event_ID": "EVT-FL-01",
          "Kategori_Program": "Program FutureLink",
          "Nama_Acara": "Program FutureLink - Maktab Sains PSBS",
          "Sekolah": "Maktab Sains Paduka Seri Begawan Sultan",
          "Daerah": "Brunei Muara",
          "Tarikh_Mula": "2027-04-01",
          "Tarikh_Paparan": "01/04/2027 (Khamis)",
          "Hari": "Khamis",
          "Masa": "09:00 - 11:30",
          "Tempat_Venue": "Dewan Maktab Sains Paduka Seri Begawan Sultan",
          "Pautan_GPS_Maps": "https://maps.google.com/?q=Maktab+Sains+Paduka+Seri+Begawan+Sultan",
          "Pelan_Sekolah_URL": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80",
          "Pelan_Parking_URL": "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80",
          "Panduan_Parking": "Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi).",
          "Catatan_Khas": "Program FutureLink - Orientasi dan pendedahan kerjaya peringkat pra-universiti.",
          "Status_Acara": "Aktif"
    },
    {
          "Event_ID": "EVT-PHT-12",
          "Kategori_Program": "Program Hala Tuju",
          "Nama_Acara": "Program Hala Tuju - Sekolah Sukan",
          "Sekolah": "Sekolah Sukan",
          "Daerah": "Brunei Muara",
          "Tarikh_Mula": "2027-04-05",
          "Tarikh_Paparan": "05/04/2027 (Isnin)",
          "Hari": "Isnin",
          "Masa": "09:00 - 11:30",
          "Tempat_Venue": "Atrium Sekolah Sukan",
          "Pautan_GPS_Maps": "https://maps.google.com/?q=Sekolah+Sukan+Brunei",
          "Pelan_Sekolah_URL": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80",
          "Pelan_Parking_URL": "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80",
          "Panduan_Parking": "Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi ke Atrium Sekolah Sukan).",
          "Catatan_Khas": "Lokasi bertempat di Atrium Sekolah Sukan.",
          "Status_Acara": "Aktif"
    },
    {
          "Event_ID": "EVT-PHT-13",
          "Kategori_Program": "Program Hala Tuju",
          "Nama_Acara": "Program Hala Tuju - SM Berakas",
          "Sekolah": "Sekolah Menengah Berakas",
          "Daerah": "Brunei Muara",
          "Tarikh_Mula": "2027-04-06",
          "Tarikh_Paparan": "06/04/2027 (Selasa)",
          "Hari": "Selasa",
          "Masa": "09:00 - 11:30",
          "Tempat_Venue": "Dewan Sekolah Menengah Berakas",
          "Pautan_GPS_Maps": "https://maps.google.com/?q=Sekolah+Menengah+Berakas+Brunei",
          "Pelan_Sekolah_URL": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80",
          "Pelan_Parking_URL": "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80",
          "Panduan_Parking": "Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi).",
          "Catatan_Khas": "Pakaian rasmi pejabat / kot.",
          "Status_Acara": "Aktif"
    },
    {
          "Event_ID": "EVT-FL-02",
          "Kategori_Program": "Program FutureLink",
          "Nama_Acara": "Program FutureLink - PTE Belait + SM Sayyidina Ali",
          "Sekolah": "Pusat Tingkatan Enam Belait + Sekolah Menengah Sayyidina Ali",
          "Daerah": "Belait",
          "Tarikh_Mula": "2027-04-08",
          "Tarikh_Paparan": "08/04/2027 (Khamis)",
          "Hari": "Khamis",
          "Masa": "09:00 - 12:00",
          "Tempat_Venue": "Dewan Serbaguna Pusat Tingkatan Enam Belait",
          "Pautan_GPS_Maps": "https://maps.google.com/?q=Pusat+Tingkatan+Enam+Belait",
          "Pelan_Sekolah_URL": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80",
          "Pelan_Parking_URL": "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80",
          "Panduan_Parking": "Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi Daerah Belait).",
          "Catatan_Khas": "Penyertaan gabungan bersama SM Sayyidina Ali. Masa sesi Daerah Belait: 09:00 - 12:00.",
          "Status_Acara": "Aktif"
    },
    {
          "Event_ID": "EVT-PHT-14",
          "Kategori_Program": "Program Hala Tuju",
          "Nama_Acara": "Program Hala Tuju - SM Sayyidina Hasan",
          "Sekolah": "Sekolah Menengah Sayyidina Hasan",
          "Daerah": "Brunei Muara",
          "Tarikh_Mula": "2027-04-12",
          "Tarikh_Paparan": "12/04/2027 (Isnin)",
          "Hari": "Isnin",
          "Masa": "09:00 - 11:30",
          "Tempat_Venue": "Dewan Sekolah Menengah Sayyidina Hasan",
          "Pautan_GPS_Maps": "https://maps.google.com/?q=Sekolah+Menengah+Sayyidina+Hasan+Kilanas",
          "Pelan_Sekolah_URL": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80",
          "Pelan_Parking_URL": "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80",
          "Panduan_Parking": "Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi).",
          "Catatan_Khas": "Pakaian rasmi pejabat / kot.",
          "Status_Acara": "Aktif"
    },
    {
          "Event_ID": "EVT-PHT-15",
          "Kategori_Program": "Program Hala Tuju",
          "Nama_Acara": "Program Hala Tuju - SM SMJA",
          "Sekolah": "Sekolah Menengah Sultan Muhammad Jamalul Alam",
          "Daerah": "Brunei Muara",
          "Tarikh_Mula": "2027-04-13",
          "Tarikh_Paparan": "13/04/2027 (Selasa)",
          "Hari": "Selasa",
          "Masa": "09:00 - 11:30",
          "Tempat_Venue": "Dewan Sekolah Menengah Sultan Muhammad Jamalul Alam",
          "Pautan_GPS_Maps": "https://maps.google.com/?q=SMJA+School+Bandar+Seri+Begawan",
          "Pelan_Sekolah_URL": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80",
          "Pelan_Parking_URL": "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80",
          "Panduan_Parking": "Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi).",
          "Catatan_Khas": "Pakaian rasmi pejabat / kot.",
          "Status_Acara": "Aktif"
    },
    {
          "Event_ID": "EVT-PHT-16",
          "Kategori_Program": "Program Hala Tuju",
          "Nama_Acara": "Program Hala Tuju - SM Muda Hashim, Tutong",
          "Sekolah": "Sekolah Menengah Muda Hashim, Tutong",
          "Daerah": "Tutong",
          "Tarikh_Mula": "2027-04-15",
          "Tarikh_Paparan": "15/04/2027 (Khamis)",
          "Hari": "Khamis",
          "Masa": "09:00 - 11:30",
          "Tempat_Venue": "Dewan Sekolah Menengah Muda Hashim, Tutong",
          "Pautan_GPS_Maps": "https://maps.google.com/?q=Sekolah+Menengah+Muda+Hashim+Tutong",
          "Pelan_Sekolah_URL": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80",
          "Pelan_Parking_URL": "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80",
          "Panduan_Parking": "Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi).",
          "Catatan_Khas": "Pakaian rasmi pejabat / kot.",
          "Status_Acara": "Aktif"
    },
    {
          "Event_ID": "EVT-PHT-17",
          "Kategori_Program": "Program Hala Tuju",
          "Nama_Acara": "Program Hala Tuju - SM Sayyidina Umar Al Khattab",
          "Sekolah": "Sekolah Menengah Sayyidina Umar Al Khattab",
          "Daerah": "Brunei Muara",
          "Tarikh_Mula": "2027-04-19",
          "Tarikh_Paparan": "19/04/2027 (Isnin)",
          "Hari": "Isnin",
          "Masa": "09:00 - 11:30",
          "Tempat_Venue": "Dewan Sekolah Menengah Sayyidina Umar Al Khattab",
          "Pautan_GPS_Maps": "https://maps.google.com/?q=Sekolah+Menengah+Sayyidina+Umar+Al+Khattab",
          "Pelan_Sekolah_URL": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80",
          "Pelan_Parking_URL": "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80",
          "Panduan_Parking": "Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi).",
          "Catatan_Khas": "Pakaian rasmi pejabat / kot.",
          "Status_Acara": "Aktif"
    },
    {
          "Event_ID": "EVT-PHT-18",
          "Kategori_Program": "Program Hala Tuju",
          "Nama_Acara": "Program Hala Tuju - SM Rimba",
          "Sekolah": "Sekolah Menengah Rimba",
          "Daerah": "Brunei Muara",
          "Tarikh_Mula": "2027-04-20",
          "Tarikh_Paparan": "20/04/2027 (Selasa)",
          "Hari": "Selasa",
          "Masa": "09:00 - 11:30",
          "Tempat_Venue": "Dewan Sekolah Menengah Rimba",
          "Pautan_GPS_Maps": "https://maps.google.com/?q=Sekolah+Menengah+Rimba+I+Brunei",
          "Pelan_Sekolah_URL": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80",
          "Pelan_Parking_URL": "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80",
          "Panduan_Parking": "Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi).",
          "Catatan_Khas": "Pakaian rasmi pejabat / kot.",
          "Status_Acara": "Aktif"
    },
    {
          "Event_ID": "EVT-FL-03",
          "Kategori_Program": "Program FutureLink",
          "Nama_Acara": "Program FutureLink - PTE Tutong",
          "Sekolah": "Pusat Tingkatan Enam Tutong",
          "Daerah": "Tutong",
          "Tarikh_Mula": "2027-04-22",
          "Tarikh_Paparan": "22/04/2027 (Khamis)",
          "Hari": "Khamis",
          "Masa": "09:00 - 11:30",
          "Tempat_Venue": "Foyer Pusat Tingkatan Enam Tutong",
          "Pautan_GPS_Maps": "https://maps.google.com/?q=Pusat+Tingkatan+Enam+Tutong",
          "Pelan_Sekolah_URL": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80",
          "Pelan_Parking_URL": "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80",
          "Panduan_Parking": "Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi ke Foyer PTE Tutong).",
          "Catatan_Khas": "Lokasi bertempat di Foyer Pusat Tingkatan Enam Tutong.",
          "Status_Acara": "Aktif"
    },
    {
          "Event_ID": "EVT-PHT-19",
          "Kategori_Program": "Program Hala Tuju",
          "Nama_Acara": "Program Hala Tuju - SM Sayyidina Abu Bakar",
          "Sekolah": "Sekolah Menengah Sayyidina Abu Bakar",
          "Daerah": "Brunei Muara",
          "Tarikh_Mula": "2027-05-04",
          "Tarikh_Paparan": "04/05/2027 (Selasa)",
          "Hari": "Selasa",
          "Masa": "09:00 - 11:30",
          "Tempat_Venue": "Dewan Sekolah Menengah Sayyidina Abu Bakar",
          "Pautan_GPS_Maps": "https://maps.google.com/?q=Sekolah+Menengah+Sayyidina+Abu+Bakar+Lambak+Kanan",
          "Pelan_Sekolah_URL": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80",
          "Pelan_Parking_URL": "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80",
          "Panduan_Parking": "Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi).",
          "Catatan_Khas": "Pakaian rasmi pejabat / kot.",
          "Status_Acara": "Aktif"
    },
    {
          "Event_ID": "EVT-PHT-20",
          "Kategori_Program": "Program Hala Tuju",
          "Nama_Acara": "Program Hala Tuju - SM Awang Semaun",
          "Sekolah": "Sekolah Menengah Awang Semaun",
          "Daerah": "Brunei Muara",
          "Tarikh_Mula": "2027-05-06",
          "Tarikh_Paparan": "06/05/2027 (Khamis)",
          "Hari": "Khamis",
          "Masa": "09:00 - 11:30",
          "Tempat_Venue": "Dewan Sekolah Menengah Awang Semaun",
          "Pautan_GPS_Maps": "https://maps.google.com/?q=Sekolah+Menengah+Awang+Semaun+Sungai+Kebun",
          "Pelan_Sekolah_URL": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80",
          "Pelan_Parking_URL": "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80",
          "Panduan_Parking": "Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi).",
          "Catatan_Khas": "Pakaian rasmi pejabat / kot.",
          "Status_Acara": "Aktif"
    },
    {
          "Event_ID": "EVT-PHT-21",
          "Kategori_Program": "Program Hala Tuju",
          "Nama_Acara": "Program Hala Tuju - SM Sufri Bolkiah",
          "Sekolah": "Sekolah Menengah Sufri Bolkiah",
          "Daerah": "Tutong",
          "Tarikh_Mula": "2027-06-03",
          "Tarikh_Paparan": "03/06/2027 (Khamis)",
          "Hari": "Khamis",
          "Masa": "09:00 - 11:30",
          "Tempat_Venue": "Dewan Sekolah Menengah Sufri Bolkiah",
          "Pautan_GPS_Maps": "https://maps.google.com/?q=Sekolah+Menengah+Sufri+Bolkiah+Tutong",
          "Pelan_Sekolah_URL": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80",
          "Pelan_Parking_URL": "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80",
          "Panduan_Parking": "Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi).",
          "Catatan_Khas": "Pakaian rasmi pejabat / kot.",
          "Status_Acara": "Aktif"
    },
    {
          "Event_ID": "EVT-PHT-22",
          "Kategori_Program": "Program Hala Tuju",
          "Nama_Acara": "Program Hala Tuju - SM PAP Hajah Masna",
          "Sekolah": "Sekolah Menengah Pengiran Anak Puteri Hajah Masna",
          "Daerah": "Brunei Muara",
          "Tarikh_Mula": "2027-06-10",
          "Tarikh_Paparan": "10/06/2027 (Selasa)",
          "Hari": "Selasa",
          "Masa": "09:00 - 11:30",
          "Tempat_Venue": "Dewan Sekolah Menengah Pengiran Anak Puteri Hajah Masna",
          "Pautan_GPS_Maps": "https://maps.google.com/?q=SMPAPH+Masna+Sungai+Akar+Brunei",
          "Pelan_Sekolah_URL": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80",
          "Pelan_Parking_URL": "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80",
          "Panduan_Parking": "Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi).",
          "Catatan_Khas": "Pakaian rasmi pejabat / kot.",
          "Status_Acara": "Aktif"
    },
    {
          "Event_ID": "EVT-PHT-23",
          "Kategori_Program": "Program Hala Tuju",
          "Nama_Acara": "Program Hala Tuju - SM Lambak Kiri",
          "Sekolah": "Sekolah Menengah Lambak Kiri",
          "Daerah": "Brunei Muara",
          "Tarikh_Mula": "2027-06-21",
          "Tarikh_Paparan": "21/06/2027 (Isnin)",
          "Hari": "Isnin",
          "Masa": "09:00 - 11:30",
          "Tempat_Venue": "Dewan Sekolah Menengah Lambak Kiri",
          "Pautan_GPS_Maps": "https://maps.google.com/?q=Sekolah+Menengah+Lambak+Kiri+Brunei",
          "Pelan_Sekolah_URL": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80",
          "Pelan_Parking_URL": "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80",
          "Panduan_Parking": "Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi).",
          "Catatan_Khas": "Pakaian rasmi pejabat / kot.",
          "Status_Acara": "Aktif"
    },
    {
          "Event_ID": "EVT-FL-04",
          "Kategori_Program": "Program FutureLink",
          "Nama_Acara": "Program FutureLink - PTE Meragang",
          "Sekolah": "Pusat Tingkatan Enam Meragang",
          "Daerah": "Brunei Muara",
          "Tarikh_Mula": "2027-06-22",
          "Tarikh_Paparan": "22/06/2027 (Selasa)",
          "Hari": "Selasa",
          "Masa": "09:00 - 11:30",
          "Tempat_Venue": "Dewan Pusat Tingkatan Enam Meragang",
          "Pautan_GPS_Maps": "https://maps.google.com/?q=Pusat+Tingkatan+Enam+Meragang+Brunei",
          "Pelan_Sekolah_URL": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80",
          "Pelan_Parking_URL": "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80",
          "Panduan_Parking": "Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi).",
          "Catatan_Khas": "Program FutureLink - Sesi pra-universiti.",
          "Status_Acara": "Aktif"
    },
    {
          "Event_ID": "EVT-PHT-24",
          "Kategori_Program": "Program Hala Tuju",
          "Nama_Acara": "Program Hala Tuju - SM RIPAS Tutong",
          "Sekolah": "Sekolah Menengah Raja Isteri Pengiran Anak Saleha, Tutong",
          "Daerah": "Tutong",
          "Tarikh_Mula": "2027-06-24",
          "Tarikh_Paparan": "24/06/2027 (Khamis)",
          "Hari": "Khamis",
          "Masa": "09:00 - 11:30",
          "Tempat_Venue": "Dewan Sekolah Menengah Raja Isteri Pengiran Anak Saleha, Tutong",
          "Pautan_GPS_Maps": "https://maps.google.com/?q=SM+RIPAS+Tutong+Brunei",
          "Pelan_Sekolah_URL": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80",
          "Pelan_Parking_URL": "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80",
          "Panduan_Parking": "Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi).",
          "Catatan_Khas": "Pakaian rasmi pejabat / kot.",
          "Status_Acara": "Aktif"
    },
    {
          "Event_ID": "EVT-PHT-25",
          "Kategori_Program": "Program Hala Tuju",
          "Nama_Acara": "Program Hala Tuju - SM PDHM Mentiri",
          "Sekolah": "Sekolah Menengah Pehin Datu Seri Maharaja Mentiri",
          "Daerah": "Brunei Muara",
          "Tarikh_Mula": "2027-06-28",
          "Tarikh_Paparan": "28/06/2027 (Isnin)",
          "Hari": "Isnin",
          "Masa": "09:00 - 11:30",
          "Tempat_Venue": "Dewan Sekolah Menengah Pehin Datu Seri Maharaja Mentiri",
          "Pautan_GPS_Maps": "https://maps.google.com/?q=SM+Pehin+Datu+Seri+Maharaja+Mentiri",
          "Pelan_Sekolah_URL": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80",
          "Pelan_Parking_URL": "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80",
          "Panduan_Parking": "Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi).",
          "Catatan_Khas": "Pakaian rasmi pejabat / kot.",
          "Status_Acara": "Aktif"
    },
    {
          "Event_ID": "EVT-PHT-26",
          "Kategori_Program": "Program Hala Tuju",
          "Nama_Acara": "Program Hala Tuju - STPRI",
          "Sekolah": "Sekolah Tinggi Perempuan Raja Isteri",
          "Daerah": "Brunei Muara",
          "Tarikh_Mula": "2027-07-01",
          "Tarikh_Paparan": "01/07/2027 (Khamis)",
          "Hari": "Khamis",
          "Masa": "09:00 - 11:30",
          "Tempat_Venue": "Dewan Sekolah Tinggi Perempuan Raja Isteri",
          "Pautan_GPS_Maps": "https://maps.google.com/?q=STPRI+School+Bandar+Seri+Begawan",
          "Pelan_Sekolah_URL": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80",
          "Pelan_Parking_URL": "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80",
          "Panduan_Parking": "Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi).",
          "Catatan_Khas": "Pakaian rasmi pejabat / kot.",
          "Status_Acara": "Aktif"
    },
    {
          "Event_ID": "EVT-PHT-27",
          "Kategori_Program": "Program Hala Tuju",
          "Nama_Acara": "Program Hala Tuju - SM Sultan Hassan, Temburong",
          "Sekolah": "Sekolah Menengah Sultan Hassan, Temburong",
          "Daerah": "Temburong",
          "Tarikh_Mula": "2027-07-06",
          "Tarikh_Paparan": "06/07/2027 (Selasa)",
          "Hari": "Selasa",
          "Masa": "09:00 - 11:30",
          "Tempat_Venue": "Dewan Sekolah Menengah Sultan Hassan, Temburong",
          "Pautan_GPS_Maps": "https://maps.google.com/?q=Sekolah+Menengah+Sultan+Hassan+Bangar+Temburong",
          "Pelan_Sekolah_URL": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80",
          "Pelan_Parking_URL": "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80",
          "Panduan_Parking": "Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi Daerah Temburong).",
          "Catatan_Khas": "Sesi khas Daerah Temburong. Pakaian rasmi pejabat / kot.",
          "Status_Acara": "Aktif"
    }
  ];
  return events.sort((a, b) => (a.Tarikh_Mula || '').localeCompare(b.Tarikh_Mula || ''));
}

function getPreseededAgencies() {
  return [
    { kod: 'AG-01', namaAgensi: 'Pasukan Polis Diraja Brunei', user: 'agensi_ppdb', kategori: 'Keselamatan & Penguatkuasaan', statusRsvp: 'Hadir', bilMeja: 2, bilKerusi: 4, bilPlug: 1, noPlatKereta: 'POLIS 12', jumlahWakil: 4, namaWakilHadir: 'DSP Hj Rosli / Insp Nurul' },
    { kod: 'AG-02', namaAgensi: 'Jabatan Bomba dan Penyelamat', user: 'agensi_jbp', kategori: 'Keselamatan & Penyelamat', statusRsvp: 'Hadir', bilMeja: 2, bilKerusi: 4, bilPlug: 1, noPlatKereta: 'BOMBA 08', jumlahWakil: 4, namaWakilHadir: 'Awg Azmi & Anggota Bomba' },
    { kod: 'AG-03', namaAgensi: 'Pejabat Pengambilan Angkatan Bersenjata Diraja Brunei', user: 'agensi_abdb', kategori: 'Keselamatan & Pertahanan', statusRsvp: 'Hadir', bilMeja: 2, bilKerusi: 4, bilPlug: 1, noPlatKereta: 'MOD 01', jumlahWakil: 4, namaWakilHadir: 'Mejar (U) Faisal / PW2' },
    { kod: 'AG-04', namaAgensi: 'Tentera Darat Diraja Brunei (TDDB)', user: 'agensi_tddb', kategori: 'Keselamatan & Pertahanan', statusRsvp: 'Hadir', bilMeja: 2, bilKerusi: 4, bilPlug: 1, noPlatKereta: 'MOD 02', jumlahWakil: 4, namaWakilHadir: 'Kapt Mohd Syazwan' },
    { kod: 'AG-05', namaAgensi: 'Tentera Laut Diraja Brunei (TLDB)', user: 'agensi_tldb', kategori: 'Keselamatan & Pertahanan', statusRsvp: 'Hadir', bilMeja: 2, bilKerusi: 3, bilPlug: 1, noPlatKereta: 'MOD 04', jumlahWakil: 3, namaWakilHadir: 'Lt Kdr Ahmad' },
    { kod: 'AG-06', namaAgensi: 'Tentera Udara Diraja Brunei (TUDB)', user: 'agensi_tudb', kategori: 'Keselamatan & Pertahanan', statusRsvp: 'Hadir', bilMeja: 2, bilKerusi: 4, bilPlug: 1, noPlatKereta: 'MOD 03', jumlahWakil: 3, namaWakilHadir: 'Kapt (U) Hazim' },
    { kod: 'AG-07', namaAgensi: "Jabatanarah Agama Angkatan Bersenjata Diraja Brunei (JAMA'AT)", user: 'agensi_jamat', kategori: 'Keselamatan & Pertahanan', statusRsvp: 'Hadir', bilMeja: 1, bilKerusi: 2, bilPlug: 0, noPlatKereta: 'MOD 07', jumlahWakil: 2, namaWakilHadir: 'Ustaz Hj Hanafi' },
    { kod: 'AG-08', namaAgensi: 'Pusat Optima Kecergasan Tentera', user: 'agensi_pokt', kategori: 'Keselamatan & Pertahanan', statusRsvp: 'Hadir', bilMeja: 1, bilKerusi: 2, bilPlug: 1, noPlatKereta: 'MOD 08', jumlahWakil: 2, namaWakilHadir: 'Instruktur Jasmani' },
    { kod: 'AG-09', namaAgensi: 'Polis Tentera Angkatan Bersenjata Diraja Brunei', user: 'agensi_polistentera', kategori: 'Keselamatan & Pertahanan', statusRsvp: 'Hadir', bilMeja: 1, bilKerusi: 2, bilPlug: 0, noPlatKereta: 'PT 09', jumlahWakil: 2, namaWakilHadir: 'Staf Sarjan PT' },
    { kod: 'AG-10', namaAgensi: 'Jabatan Pengurusan Biasiswa', user: 'agensi_biasiswa', kategori: 'Kementerian & Jabatan Kerajaan', statusRsvp: 'Hadir', bilMeja: 2, bilKerusi: 4, bilPlug: 1, noPlatKereta: 'BA 1101', jumlahWakil: 3, namaWakilHadir: 'Dk Siti Rahmah' },
    { kod: 'AG-11', namaAgensi: 'Majlis Kebangsaan Pengiktirafan Kelulusan (MKPK)', user: 'agensi_mkpk', kategori: 'Kementerian & Jabatan Kerajaan', statusRsvp: 'Hadir', bilMeja: 1, bilKerusi: 2, bilPlug: 0, noPlatKereta: 'BA 1102', jumlahWakil: 2, namaWakilHadir: 'Pegawai MKPK' },
    { kod: 'AG-12', namaAgensi: 'Jabatan Pengajian Tinggi', user: 'agensi_jpt', kategori: 'Kementerian & Jabatan Kerajaan', statusRsvp: 'Hadir', bilMeja: 2, bilKerusi: 4, bilPlug: 1, noPlatKereta: 'BA 1103', jumlahWakil: 3, namaWakilHadir: 'Pegawai JPT' },
    { kod: 'AG-13', namaAgensi: 'Jabatan Pengurusan Pendidik', user: 'agensi_jpp', kategori: 'Kementerian & Jabatan Kerajaan', statusRsvp: 'Belum Sah', bilMeja: 1, bilKerusi: 2, bilPlug: 0, noPlatKereta: 'BA 1104', jumlahWakil: 2, namaWakilHadir: '-' },
    { kod: 'AG-14', namaAgensi: 'Bahagian Biasiswa, Kementerian Pertahanan', user: 'agensi_biasiswa_mindef', kategori: 'Keselamatan & Pertahanan', statusRsvp: 'Hadir', bilMeja: 1, bilKerusi: 2, bilPlug: 1, noPlatKereta: 'MOD 14', jumlahWakil: 2, namaWakilHadir: 'Pegawai Biasiswa Mindef' },
    { kod: 'AG-15', namaAgensi: 'Jabatan Penjara', user: 'agensi_penjara', kategori: 'Penguatkuasaan & Keselamatan', statusRsvp: 'Belum Sah', bilMeja: 1, bilKerusi: 2, bilPlug: 0, noPlatKereta: 'BA 9091', jumlahWakil: 2, namaWakilHadir: '-' },
    { kod: 'AG-16', namaAgensi: 'Kementerian Kesihatan', user: 'agensi_moh', kategori: 'Kementerian & Kesihatan', statusRsvp: 'Hadir', bilMeja: 2, bilKerusi: 4, bilPlug: 1, noPlatKereta: 'MOH 01', jumlahWakil: 3, namaWakilHadir: 'Pegawai Perhubungan Awam MOH' },
    { kod: 'AG-17', namaAgensi: 'Jabatan Kemajuan Pelancongan', user: 'agensi_pelancongan', kategori: 'Kementerian & Jabatan Kerajaan', statusRsvp: 'Hadir', bilMeja: 1, bilKerusi: 2, bilPlug: 0, noPlatKereta: 'BA 7711', jumlahWakil: 2, namaWakilHadir: 'Pegawai Pelancongan' },
    { kod: 'AG-18', namaAgensi: 'Jabatan Pertanian dan Agrimakanan, Kementerian Ekonomi, Perdagangan & Industry', user: 'agensi_pertanian', kategori: 'Kementerian & Jabatan Kerajaan', statusRsvp: 'Hadir', bilMeja: 1, bilKerusi: 2, bilPlug: 1, noPlatKereta: 'BA 8822', jumlahWakil: 2, namaWakilHadir: 'Pegawai Pertanian' },
    { kod: 'AG-19', namaAgensi: 'Jabatan Imigresen dan Pendaftaran Kebangsaan, Kementerian Hal Ehwal Dalam Negeri', user: 'agensi_imigresen', kategori: 'Kementerian & Jabatan Kerajaan', statusRsvp: 'Hadir', bilMeja: 2, bilKerusi: 3, bilPlug: 1, noPlatKereta: 'BA 9092', jumlahWakil: 3, namaWakilHadir: 'Pegawai Imigresen' },
    { kod: 'AG-20', namaAgensi: 'Jabatan Kajicuaca (Meteorological Department)', user: 'agensi_kajicuaca', kategori: 'Kementerian & Jabatan Kerajaan', statusRsvp: 'Hadir', bilMeja: 1, bilKerusi: 2, bilPlug: 1, noPlatKereta: 'BA 9933', jumlahWakil: 2, namaWakilHadir: 'Pegawai Meteorologi' },
    { kod: 'AG-21', namaAgensi: 'Pusat Pembangunan Belia', user: 'agensi_ppb', kategori: 'Latihan & Belia', statusRsvp: 'Hadir', bilMeja: 2, bilKerusi: 3, bilPlug: 1, noPlatKereta: 'BB 5050', jumlahWakil: 3, namaWakilHadir: 'Instruktur Vokasional PPB' },
    { kod: 'AG-22', namaAgensi: 'Program Khidmat Bakti Negara (PKBN)', user: 'agensi_pkbn', kategori: 'Latihan & Belia', statusRsvp: 'Hadir', bilMeja: 2, bilKerusi: 3, bilPlug: 0, noPlatKereta: 'PKBN 01', jumlahWakil: 3, namaWakilHadir: 'Jurulatih PKBN' },
    { kod: 'AG-23', namaAgensi: 'Universiti Brunei Darussalam (UBD)', user: 'agensi_ubd', kategori: 'Institusi Pengajian Tinggi (IPT)', statusRsvp: 'Hadir', bilMeja: 2, bilKerusi: 4, bilPlug: 1, noPlatKereta: 'BA 1234', jumlahWakil: 4, namaWakilHadir: 'Dr. Hjh Noor Maya & Delegasi' },
    { kod: 'AG-24', namaAgensi: 'Universiti Teknologi Brunei (UTB)', user: 'agensi_utb', kategori: 'Institusi Pengajian Tinggi (IPT)', statusRsvp: 'Hadir', bilMeja: 2, bilKerusi: 4, bilPlug: 1, noPlatKereta: 'BG 5566', jumlahWakil: 3, namaWakilHadir: 'Pegawai Kemasukan UTB' },
    { kod: 'AG-25', namaAgensi: 'UNISSA', user: 'agensi_unissa', kategori: 'Institusi Pengajian Tinggi (IPT)', statusRsvp: 'Hadir', bilMeja: 2, bilKerusi: 3, bilPlug: 1, noPlatKereta: 'BA 7788', jumlahWakil: 3, namaWakilHadir: 'Pegawai Hal Ehwal Akademik' },
    { kod: 'AG-26', namaAgensi: 'Kolej Universiti Perguruan Ugama Seri Begawan (KUPU SB)', user: 'agensi_kupusb', kategori: 'Institusi Pengajian Tinggi (IPT)', statusRsvp: 'Hadir', bilMeja: 1, bilKerusi: 2, bilPlug: 0, noPlatKereta: 'BB 9911', jumlahWakil: 2, namaWakilHadir: 'Ustaz Pengambilan Pelajar' },
    { kod: 'AG-27', namaAgensi: 'Politeknik Brunei', user: 'agensi_pb', kategori: 'Institusi Pengajian Tinggi (IPT)', statusRsvp: 'Hadir', bilMeja: 2, bilKerusi: 4, bilPlug: 1, noPlatKereta: 'KA 3322', jumlahWakil: 4, namaWakilHadir: 'Pegawai Perhubungan Awam PB' },
    { kod: 'AG-28', namaAgensi: 'Institut Pendidikan Teknikal Brunei (IBTE)', user: 'agensi_ibte', kategori: 'Institusi Pendidikan Teknikal', statusRsvp: 'Hadir', bilMeja: 2, bilKerusi: 4, bilPlug: 1, noPlatKereta: 'KB 4433', jumlahWakil: 4, namaWakilHadir: 'Kaunselor & Pegawai IBTE' },
    { kod: 'AG-29', namaAgensi: 'JPMC College of Health Sciences', user: 'agensi_jpmcchs', kategori: 'Kolej Kesihatan & Perubatan', statusRsvp: 'Hadir', bilMeja: 2, bilKerusi: 3, bilPlug: 1, noPlatKereta: 'BA 6611', jumlahWakil: 3, namaWakilHadir: 'Pegawai Kemasukan JPMC CHS' },
    { kod: 'AG-30', namaAgensi: 'Cosmopolitan College / Cosmopolitan College of Commerce and Technology', user: 'agensi_cosmo', kategori: 'Kolej Swasta', statusRsvp: 'Belum Sah', bilMeja: 1, bilKerusi: 2, bilPlug: 0, noPlatKereta: 'BA 3030', jumlahWakil: 2, namaWakilHadir: '-' },
    { kod: 'AG-31', namaAgensi: 'Kemuda Institute', user: 'agensi_kemuda', kategori: 'Kolej Swasta', statusRsvp: 'Hadir', bilMeja: 1, bilKerusi: 2, bilPlug: 1, noPlatKereta: 'BA 5544', jumlahWakil: 2, namaWakilHadir: 'Pegawai Pemasaran Kemuda' },
    { kod: 'AG-32', namaAgensi: 'Kolej International Graduate Studies (Kolej IGS)', user: 'agensi_kigs', kategori: 'Kolej Swasta', statusRsvp: 'Hadir', bilMeja: 1, bilKerusi: 2, bilPlug: 1, noPlatKereta: 'BA 4040', jumlahWakil: 2, namaWakilHadir: 'Pegawai Hal Ehwal Pelajar' },
    { kod: 'AG-33', namaAgensi: 'Laksamana College of Business', user: 'agensi_lcb', kategori: 'Kolej Swasta', statusRsvp: 'Hadir', bilMeja: 1, bilKerusi: 2, bilPlug: 1, noPlatKereta: 'BA 8080', jumlahWakil: 2, namaWakilHadir: 'Pegawai Kaunseling LCB' },
    { kod: 'AG-34', namaAgensi: 'Micronet International College', user: 'agensi_micronet', kategori: 'Kolej Swasta', statusRsvp: 'Hadir', bilMeja: 1, bilKerusi: 2, bilPlug: 1, noPlatKereta: 'BA 2020', jumlahWakil: 2, namaWakilHadir: 'Pegawai Pemasaran Micronet' },
    { kod: 'AG-35', namaAgensi: 'HADtech College', user: 'agensi_hadtech', kategori: 'Kolej Swasta', statusRsvp: 'Hadir', bilMeja: 1, bilKerusi: 2, bilPlug: 1, noPlatKereta: 'BA 3434', jumlahWakil: 2, namaWakilHadir: 'Pegawai Kemasukan HADtech' },
    { kod: 'AG-36', namaAgensi: 'Findlay (B) Sdn Bhd', user: 'agensi_findlay', kategori: 'Agensi Perkhidmatan Pendidikan', statusRsvp: 'Hadir', bilMeja: 1, bilKerusi: 2, bilPlug: 1, noPlatKereta: 'BA 4545', jumlahWakil: 2, namaWakilHadir: 'Konsultan Pendidikan Findlay' },
    { kod: 'AG-37', namaAgensi: 'BICPA / Brunei Institutes of Certified Public Accountants', user: 'agensi_bicpa', kategori: 'Badan Profesional', statusRsvp: 'Hadir', bilMeja: 1, bilKerusi: 2, bilPlug: 0, noPlatKereta: 'BA 5656', jumlahWakil: 2, namaWakilHadir: 'Wakil Majlis BICPA' },
    { kod: 'AG-38', namaAgensi: 'AEGIS Secure Solutions', user: 'agensi_aegis', kategori: 'Syarikat Swasta & Keselamatan', statusRsvp: 'Hadir', bilMeja: 2, bilKerusi: 3, bilPlug: 1, noPlatKereta: 'AEGIS 01', jumlahWakil: 3, namaWakilHadir: 'Pegawai Sumber Manusia AEGIS' },
    { kod: 'AG-39', namaAgensi: 'Hibiscus EP (Brunei) B.V. (HEB)', user: 'agensi_hibiscus', kategori: 'Industri Minyak & Gas', statusRsvp: 'Hadir', bilMeja: 2, bilKerusi: 4, bilPlug: 1, noPlatKereta: 'HEB 01', jumlahWakil: 3, namaWakilHadir: 'Pegawai Komunikasi Korporat' },
    { kod: 'AG-40', namaAgensi: 'Royal Brunei Airlines', user: 'agensi_rb', kategori: 'Syarikat Penerbangan Nasional & GLC', statusRsvp: 'Hadir', bilMeja: 2, bilKerusi: 4, bilPlug: 1, noPlatKereta: 'RBA 787', jumlahWakil: 4, namaWakilHadir: 'Pegawai Pengambilan Bakat RB' },
    { kod: 'AG-41', namaAgensi: 'DST Sdn Bhd', user: 'agensi_dst', kategori: 'Telekomunikasi & GLC', statusRsvp: 'Hadir', bilMeja: 2, bilKerusi: 4, bilPlug: 1, noPlatKereta: 'DST 55', jumlahWakil: 3, namaWakilHadir: 'Pegawai Penjenamaan Korporat' },
    { kod: 'AG-42', namaAgensi: 'NOVO Sdn Bhd', user: 'agensi_novo', kategori: 'Syarikat Swasta', statusRsvp: 'Hadir', bilMeja: 1, bilKerusi: 2, bilPlug: 1, noPlatKereta: 'NOVO 01', jumlahWakil: 2, namaWakilHadir: 'Wakil Syarikat NOVO' },
    { kod: 'AG-43', namaAgensi: 'BFI Sdn Bhd', user: 'agensi_bfi', kategori: 'Industri & Kimia', statusRsvp: 'Hadir', bilMeja: 2, bilKerusi: 3, bilPlug: 1, noPlatKereta: 'BFI 04', jumlahWakil: 3, namaWakilHadir: 'Pegawai Sumber Manusia BFI' },
    { kod: 'AG-44', namaAgensi: 'Imagine Sdn Bhd', user: 'agensi_imagine', kategori: 'Telekomunikasi & GLC', statusRsvp: 'Belum Sah', bilMeja: 1, bilKerusi: 2, bilPlug: 0, noPlatKereta: 'IMG 10', jumlahWakil: 2, namaWakilHadir: '-' },
    { kod: 'AG-45', namaAgensi: 'Baiduri Bank', user: 'agensi_baiduri', kategori: 'Perbankan & Kewangan', statusRsvp: 'Hadir', bilMeja: 2, bilKerusi: 4, bilPlug: 1, noPlatKereta: 'BBG 77', jumlahWakil: 3, namaWakilHadir: 'Pegawai Pengambilan Bakat' },
    { kod: 'AG-46', namaAgensi: 'Muara Port Company', user: 'agensi_muaraport', kategori: 'Logistik & Pelabuhan', statusRsvp: 'Hadir', bilMeja: 2, bilKerusi: 3, bilPlug: 1, noPlatKereta: 'MPC 01', jumlahWakil: 3, namaWakilHadir: 'Pegawai Komunikasi Luar' },
    { kod: 'AG-47', namaAgensi: 'HRDS (Education Services Agency)', user: 'agensi_hrds', kategori: 'Agensi Perkhidmatan Pendidikan', statusRsvp: 'Hadir', bilMeja: 1, bilKerusi: 2, bilPlug: 1, noPlatKereta: 'HRDS 01', jumlahWakil: 2, namaWakilHadir: 'Konsultan Pendidikan HRDS' },
    { kod: 'AG-48', namaAgensi: 'Serikandi Group Of Companies', user: 'agensi_serikandi', kategori: 'Syarikat Korporat & Katering', statusRsvp: 'Hadir', bilMeja: 2, bilKerusi: 4, bilPlug: 1, noPlatKereta: 'SRK 01', jumlahWakil: 3, namaWakilHadir: 'Pegawai Sumber Manusia' },
    { kod: 'AG-49', namaAgensi: 'Uniklearn', user: 'agensi_uniklearn', kategori: 'Latihan Khas & Kebajikan', statusRsvp: 'Hadir', bilMeja: 1, bilKerusi: 2, bilPlug: 0, noPlatKereta: 'UNIK 01', jumlahWakil: 2, namaWakilHadir: 'Penyelaras Latihan Uniklearn' },
    { kod: 'AG-50', namaAgensi: 'Hengyi Industries Sdn Bhd', user: 'agensi_hengyi', kategori: 'Petrokimia & Industri Berat', statusRsvp: 'Hadir', bilMeja: 2, bilKerusi: 4, bilPlug: 1, noPlatKereta: 'PMB 88', jumlahWakil: 4, namaWakilHadir: 'Pegawai Hubungan Komuniti' }
  ];
}

const getPreseeded52Agencies = getPreseededAgencies;

// ============================================
// 13. MODUL NOTIFIKASI DALAMAN & INTEGRASI WHATSAPP
// ============================================
function shareRsvpWhatsApp(eventId) {
  const isEn = typeof I18N !== 'undefined' && I18N.currentLang === 'EN';
  const ev = (AppState.events || []).find(e => e.Event_ID === eventId) || AppState.activeEvent || getFallbackEvents()[0];
  const user = AppState.currentUser;
  const rsvp = (AppState.rsvps || []).find(r => r.Event_ID === ev.Event_ID && (r.Agensi_ID === (user && user.id) || r.Agensi_ID === 'AG-05')) || {};

  const displayStatus = isEn
    ? (rsvp.Status_RSVP === 'Hadir' || rsvp.Status_RSVP === 'Hadir (Disahkan)' ? 'ATTENDING (CONFIRMED)' : (rsvp.Status_RSVP === 'Tidak Hadir' ? 'NOT ATTENDING' : 'PENDING CONFIRMATION'))
    : (rsvp.Status_RSVP || 'HADIR (DISAHKAN)');

  const message = isEn ? `*OFFICIAL RSVP ATTENDANCE & HALL LOGISTICS CONFIRMATION*
Career Education Unit (CEU), Department of Schools
Ministry of Education, Brunei Darussalam

To: Program Coordinator & School Organizing Committee
Agency Name: *${user ? user.namaAgensi : 'Invited Agency'}*
Program: *${ev.Nama_Acara}*
Date: *${formatDisplayDate(ev.Tarikh_Paparan || ev.Tarikh_Mula, isEn)}*
Time: *${ev.Masa}*
Venue: *${ev.Tempat_Venue} (${ev.Daerah} District)*

Attendance Status: *${displayStatus}*
Exhibition Hall Amenities Summary:
• Exhibition Table: ${rsvp.bilMeja || 1} Unit(s)
• Booth Chairs: ${rsvp.bilKerusi || 2} Unit(s)
• Power Socket: ${rsvp.bilPlug || 1} Unit(s)
• Total Officers: ${rsvp.jumlahWakil || 2} Pax
• Duty Officer: ${rsvp.namaWakilHadir || '-'}
• Parking Pass: 1 Dedicated Agency Bay
• Official Portal: https://ceujss2026.github.io/rsvp-ceu-portal/` : `*PENGESAHAN KEHADIRAN RSVP & LOGISTIK DEWAN RASMI*
Unit Pendidikan Kerjaya (UPK), Jabatan Sekolah-Sekolah
Kementerian Pendidikan Negara Brunei Darussalam

Kepada: Penyelaras Program & Penganjur Sekolah
Nama Agensi: *${user ? user.namaAgensi : 'Agensi Jemputan'}*
Program: *${ev.Nama_Acara}*
Tarikh: *${ev.Tarikh_Paparan || ev.Tarikh_Mula}*
Masa: *${ev.Masa}*
Tempat: *${ev.Tempat_Venue} (${ev.Daerah})*

Status Kehadiran: *${rsvp.Status_RSVP || 'HADIR (DISAHKAN)'}*
Perincian Kelengkapan Dewan:
• Meja Pameran: ${rsvp.bilMeja || 1} Unit
• Kerusi Booth: ${rsvp.bilKerusi || 2} Unit
• Plug Elektrik: ${rsvp.bilPlug || 1} Unit
• Jumlah Pegawai: ${rsvp.jumlahWakil || 2} Orang
• Pegawai Bertugas: ${rsvp.namaWakilHadir || '-'}
• Pas Letak Kereta: 1 Petak Khas Agensi

Pautan Portal Rasmi: https://ceujss2026.github.io/rsvp-ceu-portal/`;

  const waUrl = 'https://wa.me/6738669690?text=' + encodeURIComponent(message);
  window.open(waUrl, '_blank');
  showToast(isEn ? 'Opening WhatsApp (+6738669690) to share RSVP confirmation...' : 'Membuka WhatsApp (+6738669690) untuk menghantar perakuan RSVP...', 'success');
}

function adminSendAgencyWhatsApp(agencyCode, eventId = null) {
  const isEn = typeof I18N !== 'undefined' && I18N.currentLang === 'EN';
  const agency = (AppState.agenciesList || getPreseededAgencies()).find(a => a.kod === agencyCode) || (AppState.agencies || []).find(a => a.kod === agencyCode);
  if (!agency) return;

  const targetEventId = eventId || (typeof adminSelectedSchoolId !== 'undefined' && adminSelectedSchoolId !== 'ALL' ? adminSelectedSchoolId : null);
  const ev = (targetEventId ? (AppState.events || getFallbackEvents()).find(e => e.Event_ID === targetEventId) : null) || AppState.activeEvent || getFallbackEvents()[0];
  const rsvp = (typeof getAgencyRsvpForSchool === 'function')
    ? getAgencyRsvpForSchool(agency.kod, ev.Event_ID)
    : ((AppState.rsvps || []).find(r => r.Agensi_ID === agency.kod && r.Event_ID === ev.Event_ID) || {});
  const status = isEn 
    ? (rsvp.Status_RSVP === 'Hadir' || rsvp.Status_RSVP === 'Hadir (Disahkan)' ? 'Attending' : (rsvp.Status_RSVP === 'Tidak Hadir' ? 'Not Attending' : 'Pending')) 
    : (rsvp.Status_RSVP || 'Belum Sah');

  const message = isEn ? `*OFFICIAL REMINDER — CAREER EDUCATION UNIT (CEU / JSS)*
Ministry of Education, Brunei Darussalam

Assalamu'alaikum Warahmatullahi Wabarakatuh,
To: Liaison Officer of *${agency.namaAgensi || agency.nama}*

We would like to gently remind your agency regarding RSVP confirmation & logistics coordination for:
📌 *${ev.Nama_Acara}*
📅 Date: *${formatDisplayDate(ev.Tarikh_Paparan || ev.Tarikh_Mula, isEn)}*
⏰ Time: *${ev.Masa}*
📍 Venue: *${ev.Tempat_Venue}*
Current Agency Status: *${status}*

Please visit the official portal to confirm exhibition tables & agency parking access:
https://ceujss2026.github.io/rsvp-ceu-portal/

Thank you.
— Career Education Unit (CEU), Department of Schools` : `*PERINGATAN RASMI UNIT PENDIDIKAN KERJAYA (CEU / JSS)*
Kementerian Pendidikan Negara Brunei Darussalam

Assalamu'alaikum Warahmatullahi Wabarakatuh,
Kepada: Pegawai Perhubungan *${agency.namaAgensi || agency.nama}*

Sukacita dimaklumkan mengenai pengesahan kehadiran (RSVP) & penyelarasan logistik bagi:
📌 *${ev.Nama_Acara}*
📅 Tarikh: *${ev.Tarikh_Paparan || ev.Tarikh_Mula}*
⏰ Masa: *${ev.Masa}*
📍 Venue: *${ev.Tempat_Venue}*
Status Semasa Agensi: *${status}*

Sila layari portal rasmi untuk mengesahkan permohonan meja pameran & pas parking agensi:
https://ceujss2026.github.io/rsvp-ceu-portal/

Sekian, terima kasih.
— Unit Pendidikan Kerjaya (UPK), Jabatan Sekolah-Sekolah`;

  const waUrl = 'https://api.whatsapp.com/send?text=' + encodeURIComponent(message);
  window.open(waUrl, '_blank');
  showToast(isEn ? ('Opening WhatsApp reminder for ' + (agency.namaAgensi || agency.nama)) : ('Membuka WhatsApp peringatan untuk ' + (agency.namaAgensi || agency.nama)), 'info');
}

function getInAppNotifications() {
  const isEn = typeof I18N !== 'undefined' && I18N.currentLang === 'EN';
  const user = AppState.currentUser;
  const ev = AppState.activeEvent || getFallbackEvents()[0];
  const rsvps = AppState.rsvps || [];
  const userRsvp = user ? rsvps.find(r => r.Event_ID === ev.Event_ID && r.Agensi_ID === user.id) : null;

  let notifs = [];

  // Jika admin, paparkan senarai notifikasi push serahan / kemaskini RSVP agensi
  const isAdmin = user && (user.role || '').toUpperCase() === 'ADMIN';
  if (isAdmin) {
    if (!AppState.adminNotifications) {
      try {
        AppState.adminNotifications = JSON.parse(localStorage.getItem('ceu_admin_notifications') || '[]');
      } catch(e) {
        AppState.adminNotifications = [];
      }
    }
    const adminNotifs = (AppState.adminNotifications || []).map(an => ({
      id: an.id,
      title: an.title,
      time: an.time || (isEn ? 'Recent' : 'Terkini'),
      desc: an.desc,
      type: an.type || 'info',
      actions: [
        { label: isEn ? 'View Agency RSVP →' : 'Lihat Rekod Agensi →', onclick: "navigateTo('admin')" },
        { label: isEn ? 'WhatsApp Secretariat (+6738669690) 📲' : 'WhatsApp Urus Setia (+6738669690) 📲', onclick: "window.open('https://wa.me/6738669690', '_blank')" }
      ]
    }));
    notifs = notifs.concat(adminNotifs);
  }

  // Notifikasi standard acara & surat jemputan
  notifs.push(
    {
      id: 'notif-1',
      title: isEn ? ('Event Reminder (T-1 Day): ' + (ev.Sekolah || ev.Nama_Acara)) : ('Peringatan Acara H-1: ' + (ev.Sekolah || ev.Nama_Acara)),
      time: isEn ? '2 hours ago' : '2 jam lepas',
      desc: isEn 
        ? ('The ' + ev.Nama_Acara + ' event will take place on ' + formatDisplayDate(ev.Tarikh_Paparan || ev.Tarikh_Mula, isEn) + ' at ' + ev.Masa + '. Agency parking pass is now active.')
        : ('Program ' + ev.Nama_Acara + ' akan berlangsung pada ' + (ev.Tarikh_Paparan || ev.Tarikh_Mula) + ' jam ' + ev.Masa + '. Pas parking agensi telah aktif.'),
      type: 'warning',
      actions: [
        { label: isEn ? 'Floor Plan →' : 'Pelan Dewan →', onclick: "openMapModal('floorPlan')" },
        { label: isEn ? 'Parking Map →' : 'Peta Parking →', onclick: "openMapModal('parking')" }
      ]
    },
    {
      id: 'notif-2',
      title: isEn ? 'Official Confirmation Letter Issued' : 'Surat Perakuan Rasmi Diterbitkan',
      time: isEn ? '1 day ago' : '1 hari lepas',
      desc: isEn 
        ? 'Official logistics & booth confirmation letter with QR code and HMAC code is ready for download.'
        : 'Surat perakuan logistik dan kelengkapan meja booth rasmi ber-QR dan kod HMAC telah sedia dimuat turun.',
      type: 'info',
      actions: [
        { label: isEn ? 'View QR Letter →' : 'Papar Surat Ber-QR →', onclick: "openDocumentGeneratorModal()" }
      ]
    }
  );

  if (userRsvp && !isAdmin) {
    notifs.unshift({
      id: 'notif-rsvp',
      title: isEn 
        ? ('RSVP Attendance Confirmed: ' + (userRsvp.Status_RSVP === 'Hadir' ? 'Attending' : (userRsvp.Status_RSVP || 'Attending')))
        : ('Pengesahan Kehadiran RSVP Diterima: ' + (userRsvp.Status_RSVP || 'Hadir')),
      time: isEn ? 'Just now' : 'Baru sahaja',
      desc: isEn
        ? ('Request for ' + (userRsvp.bilMeja || 1) + ' exhibition table(s) and ' + (userRsvp.bilKerusi || 2) + ' chair(s) for ' + (user ? user.namaAgensi : 'Agency') + ' has been confirmed by the system.')
        : ('Permohonan ' + (userRsvp.bilMeja || 1) + ' meja pameran dan ' + (userRsvp.bilKerusi || 2) + ' kerusi untuk ' + (user ? user.namaAgensi : 'Agensi') + ' telah disahkan sistem.'),
      type: 'success',
      actions: [
        { label: isEn ? 'Share to WhatsApp (+6738669690) 📲' : 'Hantar ke WhatsApp (+6738669690) 📲', onclick: `shareRsvpWhatsApp('${ev.Event_ID}')` },
        { label: isEn ? 'View QR Letter →' : 'Papar Surat Ber-QR →', onclick: "openDocumentGeneratorModal()" }
      ]
    });
  }

  return notifs;
}

function renderNotificationsScreen() {
  const container = document.getElementById('notificationsListContainer');
  if (!container) return;

  const notifs = getInAppNotifications();
  container.innerHTML = notifs.map(n => {
    const borderCol = n.type === 'success' ? 'border-emerald-500' : (n.type === 'warning' ? 'border-amber-500' : 'border-[#006194]');
    const iconName = n.type === 'success' ? 'check_circle' : (n.type === 'warning' ? 'alarm' : 'mark_email_read');
    const iconBg = n.type === 'success' ? 'bg-emerald-50 text-emerald-600' : (n.type === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-sky-50 text-[#006194]');

    return `
      <div class="bg-white rounded-xl shadow-sm p-4 flex items-start gap-3 border-l-4 ${borderCol} border border-slate-100">
        <div class="w-8 h-8 rounded-full ${iconBg} flex items-center justify-center shrink-0 mt-0.5">
          <span class="material-symbols-outlined text-[18px]">${iconName}</span>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-bold text-slate-900">${n.title}</h4>
            <span class="text-[10px] text-slate-400 shrink-0 ml-2">${n.time}</span>
          </div>
          <p class="text-xs text-slate-600 mt-1 leading-relaxed">${n.desc}</p>
          <div class="flex items-center gap-3 mt-2 flex-wrap">
            ${n.actions.map(act => `
              <button onclick="${act.onclick}" class="text-[11px] font-bold text-[#148e82] hover:text-[#0f6b62] hover:underline flex items-center gap-1">
                <span>${act.label}</span>
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function markAllNotificationsRead() {
  const isEn = typeof I18N !== 'undefined' && I18N.currentLang === 'EN';
  const hBadge = document.getElementById('headerNotifBadge');
  const mBadge = document.getElementById('homeNotifBadge');
  if (hBadge) hBadge.style.display = 'none';
  if (mBadge) mBadge.style.display = 'none';
  if (AppState.adminNotifications) {
    AppState.adminNotifications.forEach(n => n.read = true);
    localStorage.setItem('ceu_admin_notifications', JSON.stringify(AppState.adminNotifications));
  }
  showToast(isEn ? 'All notifications marked as read.' : 'Semua notifikasi ditandakan telah dibaca.', 'success');
}

function renderProfileScreen() {
  const user = AppState.currentUser;
  const title = document.getElementById('profileAgencyTitle');
  if (title && user) {
    title.innerText = user.namaAgensi || 'UNIVERSITI BRUNEI DARUSSALAM';
  }
}

function handleOfflineFallback(action, data) {
  if (action === 'login') {
    const u = String(data.username || '').toLowerCase();
    if (u === 'admin_ceu') {
      return {
        success: true,
        message: 'Log masuk berjaya.',
        token: 'auth-admin-session',
        user: { id: 'ADMIN-CEU', role: 'ADMIN', namaAgensi: 'Unit Pendidikan Kerjaya (Admin CEU)', username: 'admin_ceu' }
      };
    } else {
      const agencies = getPreseededAgencies();
      const matched = agencies.find(a => (a.user && a.user.toLowerCase() === u) || (a.kod && a.kod.toLowerCase() === u) || (a.namaAgensi && a.namaAgensi.toLowerCase().includes(u)));
      const ag = matched || agencies[22]; // defaults to UBD (AG-23)
      return {
        success: true,
        message: 'Log masuk berjaya.',
        token: 'auth-agency-session',
        user: { id: ag.kod, role: 'AGENCY', namaAgensi: ag.namaAgensi, username: ag.user || u }
      };
    }
  }

  if (action === 'getInitialData') {
    return { success: true, events: getFallbackEvents(), rsvps: [] };
  }

  if (action === 'submitRSVP') {
    return { success: true, message: 'Pengesahan RSVP berjaya direkodkan!' };
  }

  return { success: true, message: 'Operasi berjaya.' };
}

// Inisialisasi Aplikasi Semasa Dimuatkan
window.addEventListener('DOMContentLoaded', () => {
  I18N.applyToDOM();

  // Pastikan data 31 sesi takwim rasmi terkini sentiasa aktif & Maktab Duli ditapis
  if (AppState.events && AppState.events.length > 0) {
    AppState.events = AppState.events.filter(e => e.Event_ID !== 'EVT-FL-05' && !(e.Nama_Acara || '').includes('Maktab Duli'));
  }
  if (!AppState.events || AppState.events.length < 31) {
    AppState.events = getFallbackEvents();
  }
  AppState.events = sortEventsChronologically(AppState.events);
  localStorage.setItem('ceu_cache_events', JSON.stringify(AppState.events));
  if (!AppState.activeEvent || AppState.activeEvent.Event_ID === 'EVT-FL-05' || (AppState.activeEvent.Nama_Acara || '').includes('Maktab Duli')) {
    AppState.activeEvent = AppState.events[0];
  }

  // Pastikan data RSVP bersepadu disemai dengan teratur
  ensureInitialRsvpsSeeded();

  // Tangani hash navigation awal
  const hash = window.location.hash.replace('#', '') || (AppState.currentUser ? (AppState.currentUser.role === 'ADMIN' ? 'admin' : 'home') : 'login');
  navigateTo(hash);

  // Ambil data senyap jika ada sesi aktif
  if (AppState.currentUser) {
    fetchInitialDataSilently();
  }
});
