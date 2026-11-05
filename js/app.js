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
      // Ditambah timeout 6000ms untuk tindak balas pantas jika GAS sedang cold-start
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(CONFIG.GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const json = await res.json();
      if (json.code === 'AUTH_EXPIRED') {
        showToast('Sesi anda telah tamat. Sila log masuk semula.', 'warning');
        logoutUser();
        return { success: false, message: 'Session expired' };
      }
      return json;
    } catch (err) {
      console.warn('API Error / Offline Fallback:', err.message || err);
      // Fallback offline / local demo data jika URL belum disambung atau perlahan
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
      // Mod Pentadbir: HANYA Papan Pemuka ('admin') & Urus Program ('adminEvents')
      if (viewId !== 'admin' && viewId !== 'adminEvents') {
        viewId = 'admin';
      }
    } else {
      // Mod Agensi: HANYA Info Program ('home') & Borang RSVP ('rsvpForm')
      if (viewId !== 'home' && viewId !== 'rsvpForm') {
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
      break;
    case 'adminEvents':
      renderAdminEventsList();
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

  // Desktop Navbar elements
  const desktopNavLinks = document.getElementById('desktopNavLinks');
  const desktopNavModeBadge = document.getElementById('desktopNavModeBadge');
  const desktopAgencyName = document.getElementById('desktopNavAgencyName');
  const desktopUserRole = document.getElementById('desktopNavUserRole');

  if (desktopNavModeBadge) {
    desktopNavModeBadge.innerText = isAdmin ? 'MOD PENTADBIR' : 'MOD AGENSI';
    desktopNavModeBadge.className = isAdmin 
      ? 'text-[9px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full uppercase' 
      : 'text-[9px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full uppercase';
  }

  if (desktopAgencyName) {
    desktopAgencyName.innerText = AppState.currentUser.namaAgensi || (isAdmin ? 'Unit Pendidikan Kerjaya' : 'Universiti Brunei Darussalam');
  }

  if (desktopUserRole) {
    desktopUserRole.innerText = isAdmin ? 'Pentadbir CEU' : 'Agensi Jemputan';
  }

  // 1. Render Desktop Navigation Links (HANYA 2 ITEM SAHAJA)
  if (desktopNavLinks) {
    if (isAdmin) {
      desktopNavLinks.innerHTML = `
        <button onclick="navigateTo('admin')" class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${viewId === 'admin' ? 'bg-[#006194] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}">
          <span class="material-symbols-outlined text-[18px]">dashboard</span>
          <span>Papan Pemuka</span>
        </button>
        <button onclick="navigateTo('adminEvents')" class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${viewId === 'adminEvents' ? 'bg-[#006194] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}">
          <span class="material-symbols-outlined text-[18px]">edit_calendar</span>
          <span>Urus Program &amp; Peta</span>
        </button>
      `;
    } else {
      desktopNavLinks.innerHTML = `
        <button onclick="navigateTo('home')" class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${viewId === 'home' ? 'bg-[#148e82] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}">
          <span class="material-symbols-outlined text-[18px]">info</span>
          <span>Info Program</span>
        </button>
        <button onclick="navigateTo('rsvpForm')" class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${viewId === 'rsvpForm' ? 'bg-[#f59e0b] text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}">
          <span class="material-symbols-outlined text-[18px]">how_to_reg</span>
          <span>Borang RSVP</span>
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
          <span class="text-[10px] mt-0.5">Papan Pemuka</span>
        </button>

        <button onclick="navigateTo('adminEvents')" class="flex flex-col items-center justify-center transition-all ${viewId === 'adminEvents' ? 'text-[#006194] font-bold' : 'text-slate-400 font-medium'}">
          <div class="px-4 py-1 rounded-full flex items-center justify-center ${viewId === 'adminEvents' ? 'bg-sky-100' : ''}">
            <span class="material-symbols-outlined text-[20px]">edit_calendar</span>
          </div>
          <span class="text-[10px] mt-0.5">Urus Program</span>
        </button>

        <button onclick="logoutUser()" class="flex flex-col items-center justify-center text-rose-500 font-medium transition-all">
          <div class="px-4 py-1 rounded-full flex items-center justify-center">
            <span class="material-symbols-outlined text-[20px]">logout</span>
          </div>
          <span class="text-[10px] mt-0.5">Keluar</span>
        </button>
      `;
    } else {
      mobileNavItems.innerHTML = `
        <button onclick="navigateTo('home')" class="flex flex-col items-center justify-center transition-all ${viewId === 'home' ? 'text-[#148e82] font-bold' : 'text-slate-400 font-medium'}">
          <div class="px-4 py-1 rounded-full flex items-center justify-center ${viewId === 'home' ? 'bg-teal-50' : ''}">
            <span class="material-symbols-outlined text-[20px]">info</span>
          </div>
          <span class="text-[10px] mt-0.5">Info Program</span>
        </button>

        <button onclick="navigateTo('rsvpForm')" class="flex flex-col items-center justify-center transition-all ${viewId === 'rsvpForm' ? 'text-[#d97706] font-bold' : 'text-slate-400 font-medium'}">
          <div class="px-4 py-1 rounded-full flex items-center justify-center ${viewId === 'rsvpForm' ? 'bg-amber-100' : ''}">
            <span class="material-symbols-outlined text-[20px]">how_to_reg</span>
          </div>
          <span class="text-[10px] mt-0.5">Borang RSVP</span>
        </button>

        <button onclick="logoutUser()" class="flex flex-col items-center justify-center text-rose-500 font-medium transition-all">
          <div class="px-4 py-1 rounded-full flex items-center justify-center">
            <span class="material-symbols-outlined text-[20px]">logout</span>
          </div>
          <span class="text-[10px] mt-0.5">Keluar</span>
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

  if (mode === 'ADMIN') {
    if (tabAdmin) tabAdmin.className = 'flex-1 py-2 text-xs font-bold rounded-lg bg-[#006194] text-white shadow-sm flex items-center justify-center gap-1.5 transition-all';
    if (tabAgency) tabAgency.className = 'flex-1 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1.5 transition-all';
    
    if (usernameInput) usernameInput.value = 'admin_ceu';
    if (passwordInput) passwordInput.value = 'AdminCEU@2026';
    if (labelUsername) labelUsername.innerHTML = '<span>ID Pentadbir CEU</span><span class="text-[11px] text-primary font-medium">Urus Acara</span>';
    if (subtitle) subtitle.innerText = 'Log masuk pentadbir untuk memantau papan pemuka dan mengurus takwim program.';
    if (btnSubmit) {
      btnSubmit.className = 'w-full h-12 mt-1 rounded-xl bg-gradient-to-r from-[#006194] to-[#0284c7] text-white font-bold text-xs tracking-wider uppercase shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2';
      btnSubmit.innerHTML = '<span>LOG MASUK PENTADBIR</span><span class="material-symbols-outlined text-[18px]">arrow_forward</span>';
    }
    if (defaultHint) defaultHint.innerHTML = 'Default: <code class="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-mono text-[10px]">AdminCEU@2026</code>';
  } else {
    if (tabAgency) tabAgency.className = 'flex-1 py-2 text-xs font-bold rounded-lg bg-[#148e82] text-white shadow-sm flex items-center justify-center gap-1.5 transition-all';
    if (tabAdmin) tabAdmin.className = 'flex-1 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1.5 transition-all';
    
    if (usernameInput) usernameInput.value = 'agensi_ubd';
    if (passwordInput) passwordInput.value = 'Agensi@2026';
    if (labelUsername) labelUsername.innerHTML = '<span>Nama Pengguna Agensi</span><span class="text-[11px] text-primary font-medium">52 Agensi</span>';
    if (subtitle) subtitle.innerText = 'Log masuk agensi untuk melihat maklumat program, pelan dewan, parking &amp; pengesahan RSVP.';
    if (btnSubmit) {
      btnSubmit.className = 'w-full h-12 mt-1 rounded-xl bg-gradient-to-r from-tertiary-container via-tertiary to-gold-hover text-on-primary font-bold text-xs tracking-wider uppercase shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2';
      btnSubmit.innerHTML = '<span>LOG MASUK AGENSI</span><span class="material-symbols-outlined text-[18px]">arrow_forward</span>';
    }
    if (defaultHint) defaultHint.innerHTML = 'Default: <code class="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-mono text-[10px]">Agensi@2026</code>';
  }
}

function quickLoginDemo(userType) {
  if (userType === 'admin_ceu') {
    AppState.currentUser = {
      id: 'ADMIN-CEU',
      role: 'ADMIN',
      namaAgensi: 'Unit Pendidikan Kerjaya (Admin CEU)',
      username: 'admin_ceu'
    };
    AppState.token = 'demo-admin-token';
    localStorage.setItem('ceu_user', JSON.stringify(AppState.currentUser));
    localStorage.setItem('ceu_token', AppState.token);
    showToast('Log masuk pantas Pentadbir CEU berjaya!', 'success');
    navigateTo('admin');
  } else {
    AppState.currentUser = {
      id: 'AG-05',
      role: 'AGENCY',
      namaAgensi: 'Universiti Brunei Darussalam',
      username: 'agensi_ubd',
      kategori: 'Institusi Pengajian Tinggi (IPT)'
    };
    AppState.token = 'demo-agency-token';
    localStorage.setItem('ceu_user', JSON.stringify(AppState.currentUser));
    localStorage.setItem('ceu_token', AppState.token);
    showToast('Log masuk pantas Universiti Brunei Darussalam berjaya!', 'success');
    navigateTo('home');
  }
}

async function handleLoginSubmit(event) {
  event.preventDefault();
  const usernameInput = document.getElementById('loginUsername');
  const passwordInput = document.getElementById('loginPassword');
  const loginBtn = document.getElementById('btnLoginSubmit');

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!username || !password) {
    showToast('Sila masukkan nama pengguna dan kata laluan.', 'error');
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

    showToast(res.message || 'Log masuk berjaya!', 'success');

    // Halakan mengikut peranan pengguna
    if (res.user.role === 'ADMIN') {
      navigateTo('admin');
    } else {
      navigateTo('home');
    }

    // Muat semula data di latar belakang
    fetchInitialDataSilently();
  } else {
    showToast(res.message || 'Nama pengguna atau kata laluan salah.', 'error');
  }
}

function logoutUser() {
  AppState.currentUser = null;
  AppState.token = '';
  localStorage.removeItem('ceu_user');
  localStorage.removeItem('ceu_token');
  showToast('Anda telah berjaya log keluar.', 'info');
  navigateTo('login');
}

// ============================================
// 5. RENDERING SKRIN 02: INFO PROGRAM AGENSI & TAKWIM 32 SESI
// ============================================
let homeCategoryFilter = 'ALL';
let homeDistrictFilter = 'ALL';

function selectActiveEvent(eventId) {
  const ev = (AppState.events || []).find(e => e.Event_ID === eventId);
  if (ev) {
    AppState.activeEvent = ev;
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

  // 1. Sapaan mengikut NAMA AGENSI (Bukan nama individu)
  const agencyNameEl = document.getElementById('homeAgencyName');
  if (agencyNameEl) {
    agencyNameEl.innerText = user.namaAgensi || 'UNIVERSITI BRUNEI DARUSSALAM';
  }

  // 2. Metrik Pantas daripada Cache (Pastikan 32 Sesi)
  if (!AppState.events || AppState.events.length < 32) {
    AppState.events = getFallbackEvents();
    localStorage.setItem('ceu_cache_events', JSON.stringify(AppState.events));
  }

  if (!AppState.activeEvent) {
    AppState.activeEvent = AppState.events[0];
  }
  const primaryEvent = AppState.activeEvent;

  // 3. Dropdown Pemilih 32 Sesi
  const dropdown = document.getElementById('homeSessionDropdown');
  if (dropdown && populateDropdown) {
    dropdown.innerHTML = AppState.events.map(ev => {
      const isSelected = ev.Event_ID === primaryEvent.Event_ID ? 'selected' : '';
      const prefix = ev.Kategori_Program === 'Program FutureLink' ? '[FutureLink]' : '[Hala Tuju]';
      return `<option value="${ev.Event_ID}" ${isSelected}>${prefix} ${ev.Tarikh_Paparan || ev.Tarikh_Mula} - ${ev.Sekolah || ev.Nama_Acara} (${ev.Daerah})</option>`;
    }).join('');
  } else if (dropdown) {
    dropdown.value = primaryEvent.Event_ID;
  }

  // 4. Render Hero Event Card
  const heroCardContainer = document.getElementById('homeHeroCardArea');
  if (heroCardContainer && primaryEvent) {
    const isAttending = (AppState.rsvps || []).some(r => r.Event_ID === primaryEvent.Event_ID && r.Status_RSVP === 'Hadir');
    const isBelait = primaryEvent.Daerah === 'Belait';

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
              Daerah ${primaryEvent.Daerah}
            </span>
            ${isAttending ? '<span class="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>RSVP Disahkan</span>' : '<span class="bg-rose-50 text-rose-600 text-[10px] font-bold px-2.5 py-1 rounded-full">Perlu Pengesahan</span>'}
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
              <span class="text-[10px] text-teal-300 font-bold shrink-0">Pintu B VIP</span>
            </div>
          </div>
        </div>

        <!-- Maklumat Acara & Butang Aksi -->
        <div class="p-3.5 flex flex-col gap-2">
          <span class="text-[10px] font-bold text-[#148e82] uppercase tracking-wider">
            JABATAN SEKOLAH-SEKOLAH • UNIT PENDIDIKAN KERJAYA
          </span>
          <h2 class="text-sm md:text-base font-bold text-slate-900 leading-snug">
            ${primaryEvent.Sekolah || primaryEvent.Nama_Acara}
          </h2>
          <p class="text-[11px] text-slate-500 leading-relaxed">
            ${primaryEvent.Catatan_Khas || 'Penyelarasan garis panduan penilaian kerjaya dan persediaan meja pameran agensi.'}
          </p>

          <!-- Kotak Tarikh, Masa & Venue -->
          <div class="grid grid-cols-2 gap-2 pt-1 text-xs">
            <div class="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
              <span class="material-symbols-outlined text-[#148e82] text-[18px]">calendar_month</span>
              <div class="flex flex-col min-w-0">
                <span class="text-[9px] text-slate-400 font-medium">Tarikh</span>
                <span class="text-[11px] font-bold text-slate-800 truncate">${primaryEvent.Tarikh_Paparan || primaryEvent.Tarikh_Mula}</span>
              </div>
            </div>
            <div class="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
              <span class="material-symbols-outlined text-[#148e82] text-[18px]">schedule</span>
              <div class="flex flex-col min-w-0">
                <span class="text-[9px] text-slate-400 font-medium">Masa Sesi</span>
                <span class="text-[11px] font-bold ${isBelait ? 'text-amber-800' : 'text-slate-800'} truncate">${primaryEvent.Masa}</span>
              </div>
            </div>
          </div>

          <!-- Butang Pengesahan Kehadiran (RSVP) & Muat Turun Surat -->
          <div class="flex items-center gap-2 pt-2">
            <button onclick="navigateTo('rsvpForm', '${primaryEvent.Event_ID}')" class="flex-1 h-11 bg-gradient-to-r from-[#f59e0b] to-[#d97706] hover:from-[#d97706] hover:to-[#b45309] text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 transition-all">
              <span class="material-symbols-outlined text-[18px]">how_to_reg</span>
              <span>${isAttending ? 'Kemaskini RSVP Sesi Ini' : 'Sahkan Kehadiran (RSVP)'}</span>
            </button>
            <button onclick="openDocumentGeneratorModal()" class="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors shadow-sm shrink-0" title="Muat Turun Surat Rasmi Ber-QR">
              <span class="material-symbols-outlined text-[20px]">description</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // 5. Render Takwim Penuh 32 Sesi
  renderHomeScheduleList();
}

function renderHomeScheduleList() {
  const container = document.getElementById('homeScheduleListContainer');
  if (!container) return;

  const searchInput = document.getElementById('homeScheduleSearch');
  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

  let list = AppState.events.length ? AppState.events : getFallbackEvents();

  if (homeCategoryFilter && homeCategoryFilter !== 'ALL') {
    list = list.filter(e => e.Kategori_Program === homeCategoryFilter);
  }
  if (homeDistrictFilter && homeDistrictFilter !== 'ALL') {
    list = list.filter(e => e.Daerah === homeDistrictFilter);
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
        <p class="text-xs">Tiada sesi sekolah ditemui padanan tapisan ini.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map(ev => {
    const isCurrentActive = AppState.activeEvent && AppState.activeEvent.Event_ID === ev.Event_ID;
    const isAttending = (AppState.rsvps || []).some(r => r.Event_ID === ev.Event_ID && r.Status_RSVP === 'Hadir');
    const isBelait = ev.Daerah === 'Belait';

    return `
      <div class="bg-white p-3.5 rounded-2xl border ${isCurrentActive ? 'border-[#148e82] ring-2 ring-[#148e82]/20' : 'border-slate-200/80'} shadow-sm hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div class="flex items-start gap-3 flex-1 min-w-0">
          <div class="w-12 h-12 rounded-xl ${ev.Kategori_Program === 'Program FutureLink' ? 'bg-amber-50 text-amber-800' : 'bg-teal-50 text-[#148e82]'} flex flex-col items-center justify-center font-bold text-center shrink-0 border border-slate-100">
            <span class="text-[9px] uppercase tracking-tighter">${(ev.Tarikh_Mula || '').slice(5, 7) === '01' ? 'JAN' : (ev.Tarikh_Mula || '').slice(5, 7) === '02' ? 'FEB' : (ev.Tarikh_Mula || '').slice(5, 7) === '03' ? 'MAC' : (ev.Tarikh_Mula || '').slice(5, 7) === '04' ? 'APR' : (ev.Tarikh_Mula || '').slice(5, 7) === '05' ? 'MEI' : (ev.Tarikh_Mula || '').slice(5, 7) === '06' ? 'JUN' : 'JUL'}</span>
            <span class="text-base leading-none font-black">${(ev.Tarikh_Mula || '').slice(8, 10)}</span>
          </div>
          <div class="flex flex-col min-w-0">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${ev.Kategori_Program === 'Program FutureLink' ? 'bg-amber-100 text-amber-800' : 'bg-teal-100 text-teal-800'}">${ev.Kategori_Program}</span>
              <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">Daerah ${ev.Daerah}</span>
              ${isAttending ? '<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>RSVP Hadir</span>' : ''}
            </div>
            <h4 class="text-xs md:text-sm font-bold text-slate-900 mt-1 leading-snug truncate">${ev.Sekolah || ev.Nama_Acara}</h4>
            <div class="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5 flex-wrap">
              <span>📅 ${ev.Tarikh_Paparan || ev.Tarikh_Mula}</span>
              <span class="${isBelait ? 'font-bold text-amber-800' : ''}">🕒 ${ev.Masa}</span>
            </div>
            <span class="text-[11px] text-slate-600 truncate flex items-center gap-1 mt-0.5">
              <span class="material-symbols-outlined text-[13px] text-slate-400">location_on</span>
              ${ev.Tempat_Venue}
            </span>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
          <button onclick="selectActiveEvent('${ev.Event_ID}'); window.scrollTo({top: 0, behavior: 'smooth'});" class="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all flex items-center gap-1">
            <span class="material-symbols-outlined text-[15px]">visibility</span>
            <span>Pilih</span>
          </button>
          <button onclick="navigateTo('rsvpForm', '${ev.Event_ID}')" class="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-white font-bold text-xs shadow-sm hover:shadow transition-all flex items-center gap-1">
            <span class="material-symbols-outlined text-[15px]">how_to_reg</span>
            <span>RSVP Sesi Ini</span>
          </button>
        </div>
      </div>
    `;
  }).join('');
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

  if (titleEl) titleEl.innerText = ev.Sekolah || ev.Nama_Acara;
  if (venueEl) venueEl.innerText = ev.Tempat_Venue;
  if (dateEl) dateEl.innerText = ev.Tarikh_Paparan || ev.Tarikh_Mula;
  if (timeEl) timeEl.innerText = ev.Masa;
  if (notesEl) notesEl.innerText = ev.Catatan_Khas || 'Pakaian rasmi pejabat / kot. Meja pameran disediakan oleh sekolah.';

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

  const catEl = document.getElementById('rsvpSelectedEventCategory');
  const distEl = document.getElementById('rsvpSelectedEventDistrict');
  const nameEl = document.getElementById('rsvpFormEventName');
  const dateEl = document.getElementById('rsvpSelectedEventDate');
  const timeEl = document.getElementById('rsvpSelectedEventTime');
  const venueEl = document.getElementById('rsvpSelectedEventVenue');

  if (catEl) catEl.innerText = ev.Kategori_Program;
  if (distEl) distEl.innerText = 'Daerah ' + ev.Daerah;
  if (nameEl) nameEl.innerText = ev.Sekolah || ev.Nama_Acara;
  if (dateEl) dateEl.innerText = '📅 ' + (ev.Tarikh_Paparan || ev.Tarikh_Mula);
  if (timeEl) timeEl.innerText = '🕒 ' + ev.Masa;
  if (venueEl) venueEl.innerHTML = `<span class="material-symbols-outlined text-[13px] text-slate-400">location_on</span> ${ev.Tempat_Venue}`;

  // Semak jika sudah ada RSVP sebelum ini bagi agensi ini dan sesi ini
  const user = AppState.currentUser;
  const existing = (AppState.rsvps || []).find(r => r.Event_ID === ev.Event_ID && r.Agensi_ID === (user ? user.id : ''));
  const noPlatEl = document.getElementById('inputNoPlatKereta');

  if (existing) {
    selectRsvpStatus(existing.Status_RSVP || 'Hadir');
    setStepperVal('countMeja', existing.Bil_Meja !== undefined ? existing.Bil_Meja : 2);
    setStepperVal('countKerusi', existing.Bil_Kerusi !== undefined ? existing.Bil_Kerusi : 4);
    setStepperVal('countPlug', existing.Bil_Plug !== undefined ? existing.Bil_Plug : 1);
    setStepperVal('countWakil', existing.Jumlah_Wakil !== undefined ? existing.Jumlah_Wakil : 3);
    const namaWakilEl = document.getElementById('inputNamaWakil');
    if (namaWakilEl) namaWakilEl.value = existing.Nama_Wakil_Hadir || '';
    const keperluanEl = document.getElementById('inputKeperluanLain');
    if (keperluanEl) keperluanEl.value = existing.Keperluan_Lain || '';
    if (noPlatEl) noPlatEl.value = existing.No_Plat_Kereta || existing.noPlatKereta || 'BA 1234';
  } else {
    selectRsvpStatus('Hadir');
    setStepperVal('countMeja', 2);
    setStepperVal('countKerusi', 4);
    setStepperVal('countPlug', 1);
    setStepperVal('countWakil', 3);
    const namaWakilEl = document.getElementById('inputNamaWakil');
    if (namaWakilEl) namaWakilEl.value = '';
    const keperluanEl = document.getElementById('inputKeperluanLain');
    if (keperluanEl) keperluanEl.value = '';
    if (noPlatEl && !noPlatEl.value) noPlatEl.value = 'BA 1234';
  }
}

function renderRsvpFormScreen(eventId) {
  if (eventId) {
    const found = (AppState.events || []).find(e => e.Event_ID === eventId);
    if (found) AppState.activeEvent = found;
  }
  const ev = AppState.activeEvent || getFallbackEvents()[0];
  AppState.activeEvent = ev;

  const user = AppState.currentUser;
  const agencyBadge = document.getElementById('rsvpFormAgencyBadge');
  if (agencyBadge && user) agencyBadge.innerText = user.namaAgensi || 'Universiti Brunei Darussalam';

  // Isikan dropdown pemilih 32 sesi
  const rsvpSelector = document.getElementById('rsvpSessionSelector');
  if (rsvpSelector) {
    rsvpSelector.innerHTML = (AppState.events || []).map(e => {
      const isSelected = e.Event_ID === ev.Event_ID ? 'selected' : '';
      const prefix = e.Kategori_Program === 'Program FutureLink' ? '[FutureLink]' : '[Hala Tuju]';
      return `<option value="${e.Event_ID}" ${isSelected}>${prefix} ${e.Tarikh_Paparan || e.Tarikh_Mula} - ${e.Sekolah || e.Nama_Acara} (${e.Daerah})</option>`;
    }).join('');
    rsvpSelector.value = ev.Event_ID;
  }

  // Kemaskini kad butiran sesi
  switchRsvpSession(ev.Event_ID, false);
}

function selectRsvpStatus(status) {
  currentRsvpStatus = status;
  const optAttending = document.getElementById('optStatusAttending');
  const optNotAttending = document.getElementById('optStatusNotAttending');
  const optRep = document.getElementById('optStatusRep');
  const logisticsSection = document.getElementById('logisticsEquipmentSection');

  [optAttending, optNotAttending, optRep].forEach(el => {
    if (el) el.classList.remove('border-amber-500', 'bg-amber-50');
  });

  if (status === 'Hadir' && optAttending) {
    optAttending.classList.add('border-amber-500', 'bg-amber-50');
    if (logisticsSection) logisticsSection.classList.remove('opacity-40', 'pointer-events-none');
  } else if (status === 'Tidak Hadir' && optNotAttending) {
    optNotAttending.classList.add('border-amber-500', 'bg-amber-50');
    if (logisticsSection) logisticsSection.classList.add('opacity-40', 'pointer-events-none');
  } else if (optRep) {
    optRep.classList.add('border-amber-500', 'bg-amber-50');
    if (logisticsSection) logisticsSection.classList.remove('opacity-40', 'pointer-events-none');
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

async function handleRsvpFormSubmit() {
  const ev = AppState.activeEvent || getFallbackEvents()[0];
  const user = AppState.currentUser;
  if (!user) return;

  const btn = document.getElementById('btnSubmitRsvpAction');
  btn.disabled = true;
  btn.innerText = I18N.t('submitting');

  const noPlatVal = (document.getElementById('inputNoPlatKereta') ? document.getElementById('inputNoPlatKereta').value.trim() : '') || 'BA 1234';

  const payload = {
    eventId: ev.Event_ID,
    statusRsvp: currentRsvpStatus,
    bilMeja: parseInt(document.getElementById('countMeja').innerText || '0', 10),
    bilKerusi: parseInt(document.getElementById('countKerusi').innerText || '0', 10),
    bilPlug: parseInt(document.getElementById('countPlug').innerText || '0', 10),
    jumlahWakil: parseInt(document.getElementById('countWakil').innerText || '0', 10),
    namaWakilHadir: (document.getElementById('inputNamaWakil') ? document.getElementById('inputNamaWakil').value.trim() : ''),
    keperluanLain: (document.getElementById('inputKeperluanLain') ? document.getElementById('inputKeperluanLain').value.trim() : ''),
    noPlatKereta: noPlatVal,
    No_Plat_Kereta: noPlatVal,
    telefon: user.telefon || '',
    emel: user.emel || ''
  };

  const res = await apiCall('submitRSVP', payload, true);
  btn.disabled = false;
  btn.innerText = I18N.t('btnSubmitRsvp');

  if (res.success) {
    showToast(res.message || 'Pengesahan RSVP berjaya dihantar!', 'success');

    // Kemaskini cache tempatan
    const idx = AppState.rsvps.findIndex(r => r.Event_ID === ev.Event_ID && r.Agensi_ID === user.id);
    const updatedRecord = Object.assign({}, payload, { Agensi_ID: user.id, Nama_Agensi: user.namaAgensi, Status_RSVP: currentRsvpStatus });
    if (idx > -1) {
      AppState.rsvps[idx] = updatedRecord;
    } else {
      AppState.rsvps.push(updatedRecord);
    }
    localStorage.setItem('ceu_cache_rsvps', JSON.stringify(AppState.rsvps));

    navigateTo('home');
  } else {
    showToast(res.message || 'Ralat penghantaran RSVP.', 'error');
  }
}

// ============================================
// 8. RENDERING SKRIN 08: PANDUAN PARKING AGENSI
// ============================================
function renderParkingScreen(eventId) {
  const ev = (AppState.events.find(e => e.Event_ID === eventId) || AppState.activeEvent) || getFallbackEvents()[0];
  const user = AppState.currentUser;

  const passAgencyName = document.getElementById('parkingPassAgencyName');
  const parkingEventName = document.getElementById('parkingEventName');
  const parkingGuideText = document.getElementById('parkingGuideText');

  if (passAgencyName && user) {
    passAgencyName.innerText = user.namaAgensi || 'UNIVERSITI BRUNEI DARUSSALAM';
  }
  if (parkingEventName) {
    parkingEventName.innerText = ev.Nama_Acara;
  }
  if (parkingGuideText) {
    parkingGuideText.innerText = ev.Panduan_Parking || 'Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi & VIP). Zon parking dikhaskan di Blok C, bersebelahan padang sekolah.';
  }
}

// ============================================
// 9. RENDERING SKRIN 05: KALENDAR & ARKIB
// ============================================
function renderArchiveScreen() {
  const container = document.getElementById('archiveTimelineList');
  if (!container) return;

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
            <span class="text-[10px] text-teal-700 font-semibold">• ${ev.Status_Acara || 'Aktif'}</span>
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
let adminCurrentFilter = 'ALL';

async function renderAdminDashboard() {
  const agencies = (AppState.agenciesList && AppState.agenciesList.length === 52) 
    ? AppState.agenciesList 
    : getPreseeded52Agencies();
  AppState.agenciesList = agencies;

  // Kiraan metrik agregat
  const totalAgencies = agencies.length;
  const hadirAgencies = agencies.filter(a => a.statusRsvp === 'Hadir').length;
  const responseRate = Math.round((hadirAgencies / totalAgencies) * 100);
  const totalTables = agencies.reduce((acc, a) => acc + (a.statusRsvp === 'Hadir' ? (a.bilMeja || 1) : 0), 0);
  const totalPlugs = agencies.reduce((acc, a) => acc + (a.statusRsvp === 'Hadir' && a.bilPlug ? a.bilPlug : 0), 0);

  const totalAgenciesEl = document.getElementById('adminStatTotalAgencies');
  const responseRateEl = document.getElementById('adminStatResponseRate');
  const tablesTotalEl = document.getElementById('adminStatTotalTables');
  const plugsTotalEl = document.getElementById('adminStatTotalPlugs');

  if (totalAgenciesEl) totalAgenciesEl.innerText = totalAgencies;
  if (responseRateEl) responseRateEl.innerText = responseRate + '%';
  if (tablesTotalEl) tablesTotalEl.innerText = totalTables + ' Unit';
  if (plugsTotalEl) plugsTotalEl.innerText = totalPlugs + ' Unit';

  renderAdminAgenciesTable();
}

function renderAdminAgenciesTable() {
  const container = document.getElementById('adminAgenciesTableBody');
  if (!container) return;

  const searchInput = document.getElementById('adminAgencySearchInput');
  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

  let list = AppState.agenciesList || getPreseeded52Agencies();

  // 1. Penapis Status
  if (adminCurrentFilter === 'Hadir') {
    list = list.filter(a => a.statusRsvp === 'Hadir');
  } else if (adminCurrentFilter === 'Belum') {
    list = list.filter(a => a.statusRsvp !== 'Hadir');
  }

  // 2. Carian Teks
  if (query) {
    list = list.filter(a => 
      (a.namaAgensi || '').toLowerCase().includes(query) ||
      (a.kod || '').toLowerCase().includes(query) ||
      (a.user || '').toLowerCase().includes(query) ||
      (a.noPlatKereta || '').toLowerCase().includes(query)
    );
  }

  if (list.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="8" class="p-8 text-center text-slate-400">
          <span class="material-symbols-outlined text-[32px] block mb-1">search_off</span>
          Tiada agensi ditemui padanan tapisan ini.
        </td>
      </tr>
    `;
    return;
  }

  container.innerHTML = list.map((a, i) => {
    const isHadir = a.statusRsvp === 'Hadir';
    const isTidakHadir = a.statusRsvp === 'Tidak Hadir';
    
    let badgeClass = 'bg-amber-100 text-amber-800 border border-amber-200';
    let statusLabel = 'Belum Sah';

    if (isHadir) {
      badgeClass = 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      statusLabel = 'Hadir';
    } else if (isTidakHadir) {
      badgeClass = 'bg-rose-100 text-rose-800 border border-rose-200';
      statusLabel = 'Tidak Hadir';
    }

    return `
      <tr class="border-b border-slate-100 hover:bg-slate-50/90 text-xs transition-colors">
        <td class="p-3 font-semibold text-slate-400 text-[11px]">${i + 1}</td>
        <td class="p-3 font-mono font-bold text-slate-700">${a.kod}</td>
        <td class="p-3">
          <div class="flex flex-col">
            <span class="font-bold text-slate-900 leading-tight">${a.namaAgensi}</span>
            <span class="text-[10px] text-slate-400 font-mono mt-0.5">${a.user} • ${a.kategori || 'Agensi Rasmi'}</span>
          </div>
        </td>
        <td class="p-3">
          <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badgeClass}">
            <span class="w-1.5 h-1.5 rounded-full ${isHadir ? 'bg-emerald-600' : (isTidakHadir ? 'bg-rose-600' : 'bg-amber-600')}"></span>
            ${statusLabel}
          </span>
        </td>
        <td class="p-3 text-center font-semibold text-slate-700">
          ${isHadir ? (a.bilMeja + ' M / ' + a.bilKerusi + ' K') : '-'}
        </td>
        <td class="p-3 text-center">
          ${isHadir && a.bilPlug > 0 
            ? '<span class="inline-flex items-center gap-0.5 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]"><span class="material-symbols-outlined text-[13px]">bolt</span>' + a.bilPlug + ' Soket</span>'
            : '<span class="text-slate-300">-</span>'}
        </td>
        <td class="p-3">
          <span class="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/60">
            <span class="material-symbols-outlined text-[13px] text-amber-600">directions_car</span>
            ${a.noPlatKereta || 'VIP Pintu B'}
          </span>
        </td>
        <td class="p-3 text-right">
          <div class="flex items-center justify-end gap-1.5">
            <button onclick="openDocumentGeneratorModal('${a.kod}')" class="px-2.5 py-1 text-[11px] bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold rounded-lg transition-colors flex items-center gap-1" title="Surat Perakuan Rasmi">
              <span class="material-symbols-outlined text-[14px]">description</span>
              <span>Surat</span>
            </button>
            <button onclick="handleAdminResetAgencyPassword('${a.kod}')" class="px-2.5 py-1 text-[11px] bg-slate-100 hover:bg-amber-100 hover:text-amber-800 text-slate-600 font-semibold rounded-lg transition-colors" title="Reset Kata Laluan">
              <span>Reset</span>
            </button>
          </div>
        </td>
      </tr>
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

  [btnAll, btnHadir, btnBelum].forEach(btn => {
    if (btn) {
      btn.className = 'px-2.5 py-1 rounded-lg text-slate-600 hover:text-slate-900 transition-all';
    }
  });

  const activeBtn = status === 'ALL' ? btnAll : (status === 'Hadir' ? btnHadir : btnBelum);
  if (activeBtn) {
    activeBtn.className = 'px-2.5 py-1 rounded-lg bg-white text-slate-800 shadow-sm transition-all font-bold';
  }

  renderAdminAgenciesTable();
}

async function handleAdminResetAgencyPassword(agencyId) {
  if (!confirm('Adakah anda pasti ingin menetapkan semula kata laluan agensi ini?')) return;
  const tempPass = 'Ceu' + Math.floor(1000 + Math.random() * 9000) + '!';
  alert('Kata laluan sementara baharu bagi ' + agencyId + ':\n\n' + tempPass + '\n\nSila kongsikan kepada pegawai agensi.');
  showToast('Kata laluan berjaya direset!', 'success');
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
        <p class="text-xs">Tiada program ditemui padanan carian ini.</p>
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
            <span>📅 ${ev.Tarikh_Paparan || ev.Tarikh_Mula}</span>
            <span class="${isBelait ? 'font-bold text-amber-800' : ''}">🕒 ${ev.Masa}</span>
            <span class="text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">Daerah ${ev.Daerah}</span>
          </div>
          <span class="text-[11px] text-slate-600 truncate flex items-center gap-1 mt-0.5">
            <span class="material-symbols-outlined text-[13px] text-slate-400">location_on</span>
            ${ev.Tempat_Venue}
          </span>
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-slate-100">
          <span class="text-[10px] font-bold ${ev.Status_Acara === 'Aktif' ? 'text-emerald-600' : 'text-slate-400'}">● ${ev.Status_Acara || 'Aktif'}</span>
          <button onclick="populateAdminEventForm('${ev.Event_ID}')" class="px-3 py-1.5 bg-[#006194] hover:bg-[#004b73] text-white font-bold text-[11px] rounded-xl flex items-center gap-1 transition-all shadow-sm">
            <span class="material-symbols-outlined text-[14px]">edit</span>
            <span>Kemaskini &amp; Peta</span>
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

function populateAdminEventForm(eventId) {
  const ev = (AppState.events.find(e => e.Event_ID === eventId) || AppState.activeEvent) || getFallbackEvents()[0];
  if (!ev) return;
  AppState.activeAdminEditId = eventId;

  const idBadge = document.getElementById('adminEventIdBadge');
  const formTitle = document.getElementById('adminEventFormTitle');
  if (idBadge) idBadge.innerText = ev.Event_ID;
  if (formTitle) formTitle.innerText = 'Kemaskini: ' + (ev.Sekolah || ev.Nama_Acara);

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
  setVal('adminInputPelanSekolah', ev.Pelan_Sekolah_URL);
  setVal('adminInputPelanParking', ev.Pelan_Parking_URL || 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80');
  setVal('adminInputPanduanParking', ev.Panduan_Parking);
  setVal('adminInputCatatanKhas', ev.Catatan_Khas);
}

async function handleSaveAdminEvent(event) {
  if (event) event.preventDefault();

  const eventId = document.getElementById('adminInputEventId').value;
  const list = AppState.events.length ? AppState.events : getFallbackEvents();
  const idx = list.findIndex(e => e.Event_ID === eventId);

  const updated = {
    Event_ID: eventId,
    Nama_Acara: document.getElementById('adminInputNamaAcara').value.trim(),
    Kategori_Program: document.getElementById('adminInputKategori').value,
    Tarikh_Mula: document.getElementById('adminInputTarikhMula').value.trim(),
    Masa: document.getElementById('adminInputMasa').value.trim(),
    Tempat_Venue: document.getElementById('adminInputTempat').value.trim(),
    Pautan_GPS_Maps: document.getElementById('adminInputGps').value.trim(),
    Pelan_Sekolah_URL: document.getElementById('adminInputPelanSekolah').value.trim(),
    Pelan_Parking_URL: document.getElementById('adminInputPelanParking').value.trim(),
    Panduan_Parking: document.getElementById('adminInputPanduanParking').value.trim(),
    Catatan_Khas: document.getElementById('adminInputCatatanKhas').value.trim(),
    Status_Acara: 'Aktif'
  };

  if (idx > -1) {
    list[idx] = updated;
  } else {
    list.push(updated);
  }

  AppState.events = list;
  AppState.activeEvent = updated;
  localStorage.setItem('ceu_cache_events', JSON.stringify(list));

  showToast('Maklumat acara & peta sekolah berjaya disimpan!', 'success');
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

  const ev = AppState.activeEvent || getFallbackEvents()[0];

  if (type === 'floorPlan') {
    if (icon) icon.innerText = 'view_quilt';
    if (title) title.innerText = 'Pelan Dewan Sekolah (Susunan Meja Agensi)';
    area.innerHTML = `
      <div class="flex flex-col gap-3">
        <div class="p-3 bg-teal-50 rounded-xl border border-teal-100 text-xs text-teal-900 flex items-center gap-2">
          <span class="material-symbols-outlined text-teal-700">info</span>
          <span>Setiap agensi diperuntukkan 1 meja pameran &amp; 2 kerusi. Soket elektrik disediakan atas permohonan rasmi.</span>
        </div>
        <div class="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 p-2 text-center">
          <img src="${ev.Pelan_Sekolah_URL || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80'}" class="w-full max-h-64 object-cover rounded-lg shadow-sm mx-auto" alt="Pelan Dewan" />
          <p class="text-[10px] text-slate-500 mt-2 font-mono">Pelan Susun Atur Booth Meja 1 - 52 • ${ev.Tempat_Venue}</p>
        </div>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <span class="text-[10px] text-slate-400 block uppercase">Waktu Masuk Booth</span>
            <span class="font-bold text-slate-800">07:00 Pagi</span>
          </div>
          <div class="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <span class="text-[10px] text-slate-400 block uppercase">Pintu Masuk Agensi</span>
            <span class="font-bold text-slate-800">Pintu Sisi Kanan (Foyer)</span>
          </div>
        </div>
      </div>
    `;
  } else {
    if (icon) icon.innerText = 'directions_car';
    if (title) title.innerText = 'Peta & Lokasi Parking Agensi (Pintu Pagar B)';
    area.innerHTML = `
      <div class="flex flex-col gap-3">
        <div class="p-3 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-900 flex items-center gap-2">
          <span class="material-symbols-outlined text-amber-700">security</span>
          <span>Pas masuk VIP Pintu Pagar B adalah terhad kepada kenderaan rasmi agensi yang berdaftar.</span>
        </div>
        <div class="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 p-2 text-center">
          <img src="${ev.Pelan_Parking_URL || 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80'}" class="w-full max-h-64 object-cover rounded-lg shadow-sm mx-auto" alt="Peta Parking" />
          <p class="text-[10px] text-slate-500 mt-2 font-mono">${ev.Panduan_Parking || 'Sila masuk melalui Pintu Pagar B (Blok C VIP)'}</p>
        </div>
        <div class="flex flex-col gap-2">
          <a href="${ev.Pautan_GPS_Maps || 'https://maps.google.com/?q=Brunei'}" target="_blank" class="w-full py-2.5 bg-[#006194] hover:bg-[#004b73] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all">
            <span class="material-symbols-outlined text-[18px]">near_me</span>
            <span>Buka Navigasi Google Maps (Pintu Pagar B)</span>
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
async function openDocumentGeneratorModal(agencyId = null) {
  const user = AppState.currentUser;
  const targetAgencyId = agencyId || (user ? user.id : 'AG-05');
  const ev = AppState.activeEvent || getFallbackEvents()[0];

  showToast('Menjana Surat Perakuan Logistik rasmi...', 'info');

  const res = await apiCall('generateSuratJemputan', {
    eventId: ev.Event_ID,
    agencyId: targetAgencyId,
    jenisSurat: 'SURAT_PERAKUAN_LOGISTIK'
  }, true);

  if (res.success) {
    const d = res.dokumen.data;
    const modal = document.getElementById('docEngineModal');
    const previewArea = document.getElementById('docPreviewArea');

    if (previewArea) {
      previewArea.innerHTML = `
        <div class="border-2 border-slate-800 p-6 bg-white rounded-xl shadow-lg font-serif text-slate-900 space-y-4 text-xs leading-relaxed">
          <div class="text-center border-b-2 border-slate-800 pb-3">
            <h2 class="text-base font-bold uppercase tracking-wider">KEMENTERIAN PENDIDIKAN</h2>
            <h3 class="text-xs font-semibold uppercase">JABATAN SEKOLAH-SEKOLAH · UNIT PENDIDIKAN KERJAYA</h3>
            <p class="text-[10px] italic text-slate-600">Negara Brunei Darussalam</p>
          </div>

          <div class="flex justify-between text-[11px] font-sans">
            <div><strong>Ruj. Kami:</strong> ${d.NOMOR}</div>
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
              <span class="text-[9px] font-mono text-slate-500 mt-0.5">KOD: ${d.KODE_VERIFIKASI.slice(0, 8)}</span>
            </div>
          </div>
        </div>
      `;
    }

    if (modal) modal.classList.add('active');
  } else {
    showToast(res.message || 'Gagal menjana surat.', 'error');
  }
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
  apiCall('getInitialData').then(res => {
    if (res.success) {
      AppState.events = res.events || [];
      AppState.rsvps = res.rsvps || [];
      localStorage.setItem('ceu_cache_events', JSON.stringify(res.events));
      localStorage.setItem('ceu_cache_rsvps', JSON.stringify(res.rsvps));
      if (AppState.currentView === 'home') renderHomeScreen();
    }
  });
}

function getFallbackEvents() {
  return [
    // --- PROGRAM HALA TUJU (27 SESI) ---
    {
      Event_ID: 'EVT-PHT-01',
      Kategori_Program: 'Program Hala Tuju',
      Nama_Acara: 'Program Hala Tuju - SM Tanjong Maya',
      Sekolah: 'Sekolah Menengah Tanjong Maya',
      Daerah: 'Tutong',
      Tarikh_Mula: '2027-01-25',
      Tarikh_Paparan: '25/01/2027 (Isnin)',
      Hari: 'Isnin',
      Masa: '09:00 - 11:30',
      Tempat_Venue: 'Dewan Sekolah Menengah Tanjong Maya',
      Pautan_GPS_Maps: 'https://maps.google.com/?q=Sekolah+Menengah+Tanjong+Maya+Brunei',
      Pelan_Sekolah_URL: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80',
      Pelan_Parking_URL: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80',
      Panduan_Parking: 'Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi & VIP). Zon parking dikhaskan di Blok C.',
      Catatan_Khas: 'Pakaian rasmi pejabat / kot. Meja pameran disediakan oleh pihak sekolah di dewan.',
      Status_Acara: 'Aktif'
    },
    {
      Event_ID: 'EVT-PHT-02',
      Kategori_Program: 'Program Hala Tuju',
      Nama_Acara: 'Program Hala Tuju - SM Sayyidina ‘Othman',
      Sekolah: 'Sekolah Menengah Sayyidina ‘Othman',
      Daerah: 'Tutong',
      Tarikh_Mula: '2027-01-26',
      Tarikh_Paparan: '26/01/2027 (Selasa)',
      Hari: 'Selasa',
      Masa: '09:00 - 11:30',
      Tempat_Venue: 'Dewan Sekolah Menengah Sayyidina ‘Othman',
      Pautan_GPS_Maps: 'https://maps.google.com/?q=Sekolah+Menengah+Sayyidina+Othman+Brunei',
      Pelan_Sekolah_URL: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80',
      Pelan_Parking_URL: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80',
      Panduan_Parking: 'Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi & VIP).',
      Catatan_Khas: 'Pakaian rasmi pejabat / kot. Meja pameran disediakan di dewan.',
      Status_Acara: 'Aktif'
    },
    {
      Event_ID: 'EVT-PHT-03',
      Kategori_Program: 'Program Hala Tuju',
      Nama_Acara: 'Program Hala Tuju - SM Sayyidina Husain',
      Sekolah: 'Sekolah Menengah Sayyidina Husain',
      Daerah: 'Brunei Muara',
      Tarikh_Mula: '2027-01-28',
      Tarikh_Paparan: '28/01/2027 (Khamis)',
      Hari: 'Khamis',
      Masa: '09:00 - 11:30',
      Tempat_Venue: 'Dewan Sekolah Menengah Sayyidina Husain',
      Pautan_GPS_Maps: 'https://maps.google.com/?q=Sekolah+Menengah+Sayyidina+Husain+Brunei',
      Pelan_Sekolah_URL: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80',
      Pelan_Parking_URL: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80',
      Panduan_Parking: 'Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi & VIP).',
      Catatan_Khas: 'Pakaian rasmi pejabat / kot.',
      Status_Acara: 'Aktif'
    },
    {
      Event_ID: 'EVT-PHT-04',
      Kategori_Program: 'Program Hala Tuju',
      Nama_Acara: 'Program Hala Tuju - SM Katok',
      Sekolah: 'Sekolah Menengah Katok',
      Daerah: 'Brunei Muara',
      Tarikh_Mula: '2027-02-01',
      Tarikh_Paparan: '01/02/2027 (Isnin)',
      Hari: 'Isnin',
      Masa: '09:00 - 11:30',
      Tempat_Venue: 'Dewan Sekolah Menengah Katok',
      Pautan_GPS_Maps: 'https://maps.google.com/?q=Sekolah+Menengah+Katok+Brunei',
      Pelan_Sekolah_URL: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80',
      Pelan_Parking_URL: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80',
      Panduan_Parking: 'Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi & VIP).',
      Catatan_Khas: 'Pakaian rasmi pejabat / kot.',
      Status_Acara: 'Aktif'
    },
    {
      Event_ID: 'EVT-PHT-05',
      Kategori_Program: 'Program Hala Tuju',
      Nama_Acara: 'Program Hala Tuju - SM PAP Hajah Rashidah + Maktab Anthony Abell',
      Sekolah: 'Sekolah Menengah Pengiran Anak Puteri Hajah Rashidah + Maktab Anthony Abell',
      Daerah: 'Belait',
      Tarikh_Mula: '2027-02-02',
      Tarikh_Paparan: '02/02/2027 (Selasa)',
      Hari: 'Selasa',
      Masa: '09:00 - 12:00',
      Tempat_Venue: 'Dewan Sekolah Menengah Pengiran Anak Puteri Hajah Rashidah',
      Pautan_GPS_Maps: 'https://maps.google.com/?q=SMPAPH+Rashidah+Lumut+Brunei',
      Pelan_Sekolah_URL: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80',
      Pelan_Parking_URL: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80',
      Panduan_Parking: 'Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi & VIP Daerah Belait).',
      Catatan_Khas: 'Penyertaan gabungan bersama Maktab Anthony Abell. Masa sesi Daerah Belait: 09:00 - 12:00.',
      Status_Acara: 'Aktif'
    },
    {
      Event_ID: 'EVT-PHT-06',
      Kategori_Program: 'Program Hala Tuju',
      Nama_Acara: 'Program Hala Tuju - SM Sultan Sharif Ali',
      Sekolah: 'Sekolah Menengah Sultan Sharif Ali',
      Daerah: 'Brunei Muara',
      Tarikh_Mula: '2027-02-04',
      Tarikh_Paparan: '04/02/2027 (Khamis)',
      Hari: 'Khamis',
      Masa: '09:00 - 11:30',
      Tempat_Venue: 'Dewan Sekolah Menengah Sultan Sharif Ali',
      Pautan_GPS_Maps: 'https://maps.google.com/?q=Sekolah+Menengah+Sultan+Sharif+Ali+Brunei',
      Pelan_Sekolah_URL: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80',
      Pelan_Parking_URL: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80',
      Panduan_Parking: 'Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi & VIP).',
      Catatan_Khas: 'Pakaian rasmi pejabat / kot.',
      Status_Acara: 'Aktif'
    },
    {
      Event_ID: 'EVT-PHT-07',
      Kategori_Program: 'Program Hala Tuju',
      Nama_Acara: 'Program Hala Tuju - SM Pengiran Isteri Hajjah Mariam Serasa',
      Sekolah: 'Sekolah Menengah Pengiran Isteri Hajjah Mariam Serasa',
      Daerah: 'Brunei Muara',
      Tarikh_Mula: '2027-03-22',
      Tarikh_Paparan: '22/03/2027 (Isnin)',
      Hari: 'Isnin',
      Masa: '09:00 - 11:30',
      Tempat_Venue: 'Dewan Sekolah Menengah Pengiran Isteri Hajjah Mariam Serasa',
      Pautan_GPS_Maps: 'https://maps.google.com/?q=SMPIHM+Serasa+Muara+Brunei',
      Pelan_Sekolah_URL: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80',
      Pelan_Parking_URL: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80',
      Panduan_Parking: 'Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi & VIP).',
      Catatan_Khas: 'Pakaian rasmi pejabat / kot.',
      Status_Acara: 'Aktif'
    },
    {
      Event_ID: 'EVT-PHT-08',
      Kategori_Program: 'Program Hala Tuju',
      Nama_Acara: 'Program Hala Tuju - SM Masin',
      Sekolah: 'Sekolah Menengah Masin',
      Daerah: 'Brunei Muara',
      Tarikh_Mula: '2027-03-23',
      Tarikh_Paparan: '23/03/2027 (Selasa)',
      Hari: 'Selasa',
      Masa: '09:00 - 11:30',
      Tempat_Venue: 'Dewan Sekolah Menengah Masin',
      Pautan_GPS_Maps: 'https://maps.google.com/?q=Sekolah+Menengah+Masin+Brunei',
      Pelan_Sekolah_URL: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80',
      Pelan_Parking_URL: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80',
      Panduan_Parking: 'Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi & VIP).',
      Catatan_Khas: 'Pakaian rasmi pejabat / kot.',
      Status_Acara: 'Aktif'
    },
    {
      Event_ID: 'EVT-PHT-09',
      Kategori_Program: 'Program Hala Tuju',
      Nama_Acara: 'Program Hala Tuju - SM PJN PH Abu Bakar + SM Perdana Wazir',
      Sekolah: 'Sekolah Menengah Pengiran Jaya Negara Pengiran Haji Abu Bakar + Sekolah Menengah Perdana Wazir',
      Daerah: 'Belait',
      Tarikh_Mula: '2027-03-25',
      Tarikh_Paparan: '25/03/2027 (Khamis)',
      Hari: 'Khamis',
      Masa: '09:00 - 12:00',
      Tempat_Venue: 'Dewan Sekolah Menengah Pengiran Jaya Negara Pengiran Haji Abu Bakar',
      Pautan_GPS_Maps: 'https://maps.google.com/?q=SMPJN+PH+Abu+Bakar+Kuala+Belait',
      Pelan_Sekolah_URL: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80',
      Pelan_Parking_URL: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80',
      Panduan_Parking: 'Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi & VIP Daerah Belait).',
      Catatan_Khas: 'Penyertaan gabungan bersama SM Perdana Wazir. Masa sesi Daerah Belait: 09:00 - 12:00.',
      Status_Acara: 'Aktif'
    },
    {
      Event_ID: 'EVT-PHT-10',
      Kategori_Program: 'Program Hala Tuju',
      Nama_Acara: 'Program Hala Tuju - SM Rimba II',
      Sekolah: 'Sekolah Menengah Rimba II',
      Daerah: 'Brunei Muara',
      Tarikh_Mula: '2027-03-29',
      Tarikh_Paparan: '29/03/2027 (Isnin)',
      Hari: 'Isnin',
      Masa: '09:00 - 11:30',
      Tempat_Venue: 'Dewan Sekolah Menengah Rimba II',
      Pautan_GPS_Maps: 'https://maps.google.com/?q=Sekolah+Menengah+Rimba+II+Brunei',
      Pelan_Sekolah_URL: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80',
      Pelan_Parking_URL: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80',
      Panduan_Parking: 'Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi & VIP).',
      Catatan_Khas: 'Pakaian rasmi pejabat / kot.',
      Status_Acara: 'Aktif'
    },
    {
      Event_ID: 'EVT-PHT-11',
      Kategori_Program: 'Program Hala Tuju',
      Nama_Acara: 'Program Hala Tuju - Maktab SOASC',
      Sekolah: 'Maktab Sultan Omar Ali Saifuddien',
      Daerah: 'Brunei Muara',
      Tarikh_Mula: '2027-03-30',
      Tarikh_Paparan: '30/03/2027 (Selasa)',
      Hari: 'Selasa',
      Masa: '09:00 - 11:30',
      Tempat_Venue: 'Dewan Maktab Sultan Omar Ali Saifuddien',
      Pautan_GPS_Maps: 'https://maps.google.com/?q=Maktab+SOAS+Bandar+Seri+Begawan',
      Pelan_Sekolah_URL: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80',
      Pelan_Parking_URL: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80',
      Panduan_Parking: 'Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi & VIP).',
      Catatan_Khas: 'Pakaian rasmi pejabat / kot.',
      Status_Acara: 'Aktif'
    },
    {
      Event_ID: 'EVT-PHT-12',
      Kategori_Program: 'Program Hala Tuju',
      Nama_Acara: 'Program Hala Tuju - Sekolah Sukan',
      Sekolah: 'Sekolah Sukan',
      Daerah: 'Brunei Muara',
      Tarikh_Mula: '2027-04-05',
      Tarikh_Paparan: '05/04/2027 (Isnin)',
      Hari: 'Isnin',
      Masa: '09:00 - 11:30',
      Tempat_Venue: 'Atrium Sekolah Sukan',
      Pautan_GPS_Maps: 'https://maps.google.com/?q=Sekolah+Sukan+Brunei',
      Pelan_Sekolah_URL: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80',
      Pelan_Parking_URL: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80',
      Panduan_Parking: 'Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi & VIP ke Atrium Sekolah Sukan).',
      Catatan_Khas: 'Lokasi bertempat di Atrium Sekolah Sukan.',
      Status_Acara: 'Aktif'
    },
    {
      Event_ID: 'EVT-PHT-13',
      Kategori_Program: 'Program Hala Tuju',
      Nama_Acara: 'Program Hala Tuju - SM Berakas',
      Sekolah: 'Sekolah Menengah Berakas',
      Daerah: 'Brunei Muara',
      Tarikh_Mula: '2027-04-06',
      Tarikh_Paparan: '06/04/2027 (Selasa)',
      Hari: 'Selasa',
      Masa: '09:00 - 11:30',
      Tempat_Venue: 'Dewan Sekolah Menengah Berakas',
      Pautan_GPS_Maps: 'https://maps.google.com/?q=Sekolah+Menengah+Berakas+Brunei',
      Pelan_Sekolah_URL: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80',
      Pelan_Parking_URL: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80',
      Panduan_Parking: 'Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi & VIP).',
      Catatan_Khas: 'Pakaian rasmi pejabat / kot.',
      Status_Acara: 'Aktif'
    },
    {
      Event_ID: 'EVT-PHT-14',
      Kategori_Program: 'Program Hala Tuju',
      Nama_Acara: 'Program Hala Tuju - SM Sayyidina Hasan',
      Sekolah: 'Sekolah Menengah Sayyidina Hasan',
      Daerah: 'Brunei Muara',
      Tarikh_Mula: '2027-04-12',
      Tarikh_Paparan: '12/04/2027 (Isnin)',
      Hari: 'Isnin',
      Masa: '09:00 - 11:30',
      Tempat_Venue: 'Dewan Sekolah Menengah Sayyidina Hasan',
      Pautan_GPS_Maps: 'https://maps.google.com/?q=Sekolah+Menengah+Sayyidina+Hasan+Kilanas',
      Pelan_Sekolah_URL: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80',
      Pelan_Parking_URL: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80',
      Panduan_Parking: 'Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi & VIP).',
      Catatan_Khas: 'Pakaian rasmi pejabat / kot.',
      Status_Acara: 'Aktif'
    },
    {
      Event_ID: 'EVT-PHT-15',
      Kategori_Program: 'Program Hala Tuju',
      Nama_Acara: 'Program Hala Tuju - SM SMJA',
      Sekolah: 'Sekolah Menengah Sultan Muhammad Jamalul Alam',
      Daerah: 'Brunei Muara',
      Tarikh_Mula: '2027-04-13',
      Tarikh_Paparan: '13/04/2027 (Selasa)',
      Hari: 'Selasa',
      Masa: '09:00 - 11:30',
      Tempat_Venue: 'Dewan Sekolah Menengah Sultan Muhammad Jamalul Alam',
      Pautan_GPS_Maps: 'https://maps.google.com/?q=SMJA+School+Bandar+Seri+Begawan',
      Pelan_Sekolah_URL: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80',
      Pelan_Parking_URL: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80',
      Panduan_Parking: 'Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi & VIP).',
      Catatan_Khas: 'Pakaian rasmi pejabat / kot.',
      Status_Acara: 'Aktif'
    },
    {
      Event_ID: 'EVT-PHT-16',
      Kategori_Program: 'Program Hala Tuju',
      Nama_Acara: 'Program Hala Tuju - SM Muda Hashim, Tutong',
      Sekolah: 'Sekolah Menengah Muda Hashim, Tutong',
      Daerah: 'Tutong',
      Tarikh_Mula: '2027-04-15',
      Tarikh_Paparan: '15/04/2027 (Khamis)',
      Hari: 'Khamis',
      Masa: '09:00 - 11:30',
      Tempat_Venue: 'Dewan Sekolah Menengah Muda Hashim, Tutong',
      Pautan_GPS_Maps: 'https://maps.google.com/?q=Sekolah+Menengah+Muda+Hashim+Tutong',
      Pelan_Sekolah_URL: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80',
      Pelan_Parking_URL: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80',
      Panduan_Parking: 'Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi & VIP).',
      Catatan_Khas: 'Pakaian rasmi pejabat / kot.',
      Status_Acara: 'Aktif'
    },
    {
      Event_ID: 'EVT-PHT-17',
      Kategori_Program: 'Program Hala Tuju',
      Nama_Acara: 'Program Hala Tuju - SM Sayyidina Umar Al Khattab',
      Sekolah: 'Sekolah Menengah Sayyidina Umar Al Khattab',
      Daerah: 'Brunei Muara',
      Tarikh_Mula: '2027-04-19',
      Tarikh_Paparan: '19/04/2027 (Isnin)',
      Hari: 'Isnin',
      Masa: '09:00 - 11:30',
      Tempat_Venue: 'Dewan Sekolah Menengah Sayyidina Umar Al Khattab',
      Pautan_GPS_Maps: 'https://maps.google.com/?q=Sekolah+Menengah+Sayyidina+Umar+Al+Khattab',
      Pelan_Sekolah_URL: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80',
      Pelan_Parking_URL: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80',
      Panduan_Parking: 'Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi & VIP).',
      Catatan_Khas: 'Pakaian rasmi pejabat / kot.',
      Status_Acara: 'Aktif'
    },
    {
      Event_ID: 'EVT-PHT-18',
      Kategori_Program: 'Program Hala Tuju',
      Nama_Acara: 'Program Hala Tuju - SM Rimba',
      Sekolah: 'Sekolah Menengah Rimba',
      Daerah: 'Brunei Muara',
      Tarikh_Mula: '2027-04-20',
      Tarikh_Paparan: '20/04/2027 (Selasa)',
      Hari: 'Selasa',
      Masa: '09:00 - 11:30',
      Tempat_Venue: 'Dewan Sekolah Menengah Rimba',
      Pautan_GPS_Maps: 'https://maps.google.com/?q=Sekolah+Menengah+Rimba+I+Brunei',
      Pelan_Sekolah_URL: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80',
      Pelan_Parking_URL: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80',
      Panduan_Parking: 'Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi & VIP).',
      Catatan_Khas: 'Pakaian rasmi pejabat / kot.',
      Status_Acara: 'Aktif'
    },
    {
      Event_ID: 'EVT-PHT-19',
      Kategori_Program: 'Program Hala Tuju',
      Nama_Acara: 'Program Hala Tuju - SM Sayyidina Abu Bakar',
      Sekolah: 'Sekolah Menengah Sayyidina Abu Bakar',
      Daerah: 'Brunei Muara',
      Tarikh_Mula: '2027-05-04',
      Tarikh_Paparan: '04/05/2027 (Selasa)',
      Hari: 'Selasa',
      Masa: '09:00 - 11:30',
      Tempat_Venue: 'Dewan Sekolah Menengah Sayyidina Abu Bakar',
      Pautan_GPS_Maps: 'https://maps.google.com/?q=Sekolah+Menengah+Sayyidina+Abu+Bakar+Lambak+Kanan',
      Pelan_Sekolah_URL: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80',
      Pelan_Parking_URL: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80',
      Panduan_Parking: 'Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi & VIP).',
      Catatan_Khas: 'Pakaian rasmi pejabat / kot.',
      Status_Acara: 'Aktif'
    },
    {
      Event_ID: 'EVT-PHT-20',
      Kategori_Program: 'Program Hala Tuju',
      Nama_Acara: 'Program Hala Tuju - SM Awang Semaun',
      Sekolah: 'Sekolah Menengah Awang Semaun',
      Daerah: 'Brunei Muara',
      Tarikh_Mula: '2027-05-06',
      Tarikh_Paparan: '06/05/2027 (Khamis)',
      Hari: 'Khamis',
      Masa: '09:00 - 11:30',
      Tempat_Venue: 'Dewan Sekolah Menengah Awang Semaun',
      Pautan_GPS_Maps: 'https://maps.google.com/?q=Sekolah+Menengah+Awang+Semaun+Sungai+Kebun',
      Pelan_Sekolah_URL: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80',
      Pelan_Parking_URL: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80',
      Panduan_Parking: 'Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi & VIP).',
      Catatan_Khas: 'Pakaian rasmi pejabat / kot.',
      Status_Acara: 'Aktif'
    },
    {
      Event_ID: 'EVT-PHT-21',
      Kategori_Program: 'Program Hala Tuju',
      Nama_Acara: 'Program Hala Tuju - SM Sufri Bolkiah',
      Sekolah: 'Sekolah Menengah Sufri Bolkiah',
      Daerah: 'Tutong',
      Tarikh_Mula: '2027-06-03',
      Tarikh_Paparan: '03/06/2027 (Khamis)',
      Hari: 'Khamis',
      Masa: '09:00 - 11:30',
      Tempat_Venue: 'Dewan Sekolah Menengah Sufri Bolkiah',
      Pautan_GPS_Maps: 'https://maps.google.com/?q=Sekolah+Menengah+Sufri+Bolkiah+Tutong',
      Pelan_Sekolah_URL: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80',
      Pelan_Parking_URL: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80',
      Panduan_Parking: 'Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi & VIP).',
      Catatan_Khas: 'Pakaian rasmi pejabat / kot.',
      Status_Acara: 'Aktif'
    },
    {
      Event_ID: 'EVT-PHT-22',
      Kategori_Program: 'Program Hala Tuju',
      Nama_Acara: 'Program Hala Tuju - SM PAP Hajah Masna',
      Sekolah: 'Sekolah Menengah Pengiran Anak Puteri Hajah Masna',
      Daerah: 'Brunei Muara',
      Tarikh_Mula: '2027-06-10',
      Tarikh_Paparan: '10/06/2027 (Selasa)',
      Hari: 'Selasa',
      Masa: '09:00 - 11:30',
      Tempat_Venue: 'Dewan Sekolah Menengah Pengiran Anak Puteri Hajah Masna',
      Pautan_GPS_Maps: 'https://maps.google.com/?q=SMPAPH+Masna+Sungai+Akar+Brunei',
      Pelan_Sekolah_URL: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80',
      Pelan_Parking_URL: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80',
      Panduan_Parking: 'Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi & VIP).',
      Catatan_Khas: 'Pakaian rasmi pejabat / kot.',
      Status_Acara: 'Aktif'
    },
    {
      Event_ID: 'EVT-PHT-23',
      Kategori_Program: 'Program Hala Tuju',
      Nama_Acara: 'Program Hala Tuju - SM Lambak Kiri',
      Sekolah: 'Sekolah Menengah Lambak Kiri',
      Daerah: 'Brunei Muara',
      Tarikh_Mula: '2027-06-21',
      Tarikh_Paparan: '21/06/2027 (Isnin)',
      Hari: 'Isnin',
      Masa: '09:00 - 11:30',
      Tempat_Venue: 'Dewan Sekolah Menengah Lambak Kiri',
      Pautan_GPS_Maps: 'https://maps.google.com/?q=Sekolah+Menengah+Lambak+Kiri+Brunei',
      Pelan_Sekolah_URL: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80',
      Pelan_Parking_URL: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80',
      Panduan_Parking: 'Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi & VIP).',
      Catatan_Khas: 'Pakaian rasmi pejabat / kot.',
      Status_Acara: 'Aktif'
    },
    {
      Event_ID: 'EVT-PHT-24',
      Kategori_Program: 'Program Hala Tuju',
      Nama_Acara: 'Program Hala Tuju - SM RIPAS Tutong',
      Sekolah: 'Sekolah Menengah Raja Isteri Pengiran Anak Saleha, Tutong',
      Daerah: 'Tutong',
      Tarikh_Mula: '2027-06-24',
      Tarikh_Paparan: '24/06/2027 (Khamis)',
      Hari: 'Khamis',
      Masa: '09:00 - 11:30',
      Tempat_Venue: 'Dewan Sekolah Menengah Raja Isteri Pengiran Anak Saleha, Tutong',
      Pautan_GPS_Maps: 'https://maps.google.com/?q=SM+RIPAS+Tutong+Brunei',
      Pelan_Sekolah_URL: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80',
      Pelan_Parking_URL: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80',
      Panduan_Parking: 'Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi & VIP).',
      Catatan_Khas: 'Pakaian rasmi pejabat / kot.',
      Status_Acara: 'Aktif'
    },
    {
      Event_ID: 'EVT-PHT-25',
      Kategori_Program: 'Program Hala Tuju',
      Nama_Acara: 'Program Hala Tuju - SM PDHM Mentiri',
      Sekolah: 'Sekolah Menengah Pehin Datu Seri Maharaja Mentiri',
      Daerah: 'Brunei Muara',
      Tarikh_Mula: '2027-06-28',
      Tarikh_Paparan: '28/06/2027 (Isnin)',
      Hari: 'Isnin',
      Masa: '09:00 - 11:30',
      Tempat_Venue: 'Dewan Sekolah Menengah Pehin Datu Seri Maharaja Mentiri',
      Pautan_GPS_Maps: 'https://maps.google.com/?q=SM+Pehin+Datu+Seri+Maharaja+Mentiri',
      Pelan_Sekolah_URL: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80',
      Pelan_Parking_URL: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80',
      Panduan_Parking: 'Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi & VIP).',
      Catatan_Khas: 'Pakaian rasmi pejabat / kot.',
      Status_Acara: 'Aktif'
    },
    {
      Event_ID: 'EVT-PHT-26',
      Kategori_Program: 'Program Hala Tuju',
      Nama_Acara: 'Program Hala Tuju - STPRI',
      Sekolah: 'Sekolah Tinggi Perempuan Raja Isteri',
      Daerah: 'Brunei Muara',
      Tarikh_Mula: '2027-07-01',
      Tarikh_Paparan: '01/07/2027 (Khamis)',
      Hari: 'Khamis',
      Masa: '09:00 - 11:30',
      Tempat_Venue: 'Dewan Sekolah Tinggi Perempuan Raja Isteri',
      Pautan_GPS_Maps: 'https://maps.google.com/?q=STPRI+School+Bandar+Seri+Begawan',
      Pelan_Sekolah_URL: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80',
      Pelan_Parking_URL: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80',
      Panduan_Parking: 'Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi & VIP).',
      Catatan_Khas: 'Pakaian rasmi pejabat / kot.',
      Status_Acara: 'Aktif'
    },
    {
      Event_ID: 'EVT-PHT-27',
      Kategori_Program: 'Program Hala Tuju',
      Nama_Acara: 'Program Hala Tuju - SM Sultan Hassan, Temburong',
      Sekolah: 'Sekolah Menengah Sultan Hassan, Temburong',
      Daerah: 'Temburong',
      Tarikh_Mula: '2027-07-06',
      Tarikh_Paparan: '06/07/2027 (Selasa)',
      Hari: 'Selasa',
      Masa: '09:00 - 11:30',
      Tempat_Venue: 'Dewan Sekolah Menengah Sultan Hassan, Temburong',
      Pautan_GPS_Maps: 'https://maps.google.com/?q=Sekolah+Menengah+Sultan+Hassan+Bangar+Temburong',
      Pelan_Sekolah_URL: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80',
      Pelan_Parking_URL: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80',
      Panduan_Parking: 'Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi & VIP Daerah Temburong).',
      Catatan_Khas: 'Sesi khas Daerah Temburong. Pakaian rasmi pejabat / kot.',
      Status_Acara: 'Aktif'
    },

    // --- PROGRAM FUTURELINK (5 SESI) ---
    {
      Event_ID: 'EVT-FL-01',
      Kategori_Program: 'Program FutureLink',
      Nama_Acara: 'Program FutureLink - Maktab Sains PSBS',
      Sekolah: 'Maktab Sains Paduka Seri Begawan Sultan',
      Daerah: 'Brunei Muara',
      Tarikh_Mula: '2027-04-01',
      Tarikh_Paparan: '01/04/2027 (Khamis)',
      Hari: 'Khamis',
      Masa: '09:00 - 11:30',
      Tempat_Venue: 'Dewan Maktab Sains Paduka Seri Begawan Sultan',
      Pautan_GPS_Maps: 'https://maps.google.com/?q=Maktab+Sains+Paduka+Seri+Begawan+Sultan',
      Pelan_Sekolah_URL: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80',
      Pelan_Parking_URL: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80',
      Panduan_Parking: 'Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi & VIP).',
      Catatan_Khas: 'Program FutureLink - Orientasi dan pendedahan kerjaya peringkat pra-universiti.',
      Status_Acara: 'Aktif'
    },
    {
      Event_ID: 'EVT-FL-02',
      Kategori_Program: 'Program FutureLink',
      Nama_Acara: 'Program FutureLink - PTE Belait + SM Sayyidina Ali',
      Sekolah: 'Pusat Tingkatan Enam Belait + Sekolah Menengah Sayyidina Ali',
      Daerah: 'Belait',
      Tarikh_Mula: '2027-04-08',
      Tarikh_Paparan: '08/04/2027 (Khamis)',
      Hari: 'Khamis',
      Masa: '09:00 - 12:00',
      Tempat_Venue: 'Dewan Serbaguna Pusat Tingkatan Enam Belait',
      Pautan_GPS_Maps: 'https://maps.google.com/?q=Pusat+Tingkatan+Enam+Belait',
      Pelan_Sekolah_URL: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80',
      Pelan_Parking_URL: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80',
      Panduan_Parking: 'Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi & VIP Daerah Belait).',
      Catatan_Khas: 'Penyertaan gabungan bersama SM Sayyidina Ali. Masa sesi Daerah Belait: 09:00 - 12:00.',
      Status_Acara: 'Aktif'
    },
    {
      Event_ID: 'EVT-FL-03',
      Kategori_Program: 'Program FutureLink',
      Nama_Acara: 'Program FutureLink - PTE Tutong',
      Sekolah: 'Pusat Tingkatan Enam Tutong',
      Daerah: 'Tutong',
      Tarikh_Mula: '2027-04-22',
      Tarikh_Paparan: '22/04/2027 (Khamis)',
      Hari: 'Khamis',
      Masa: '09:00 - 11:30',
      Tempat_Venue: 'Foyer Pusat Tingkatan Enam Tutong',
      Pautan_GPS_Maps: 'https://maps.google.com/?q=Pusat+Tingkatan+Enam+Tutong',
      Pelan_Sekolah_URL: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80',
      Pelan_Parking_URL: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80',
      Panduan_Parking: 'Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi & VIP ke Foyer PTE Tutong).',
      Catatan_Khas: 'Lokasi bertempat di Foyer Pusat Tingkatan Enam Tutong.',
      Status_Acara: 'Aktif'
    },
    {
      Event_ID: 'EVT-FL-04',
      Kategori_Program: 'Program FutureLink',
      Nama_Acara: 'Program FutureLink - PTE Meragang',
      Sekolah: 'Pusat Tingkatan Enam Meragang',
      Daerah: 'Brunei Muara',
      Tarikh_Mula: '2027-06-22',
      Tarikh_Paparan: '22/06/2027 (Selasa)',
      Hari: 'Selasa',
      Masa: '09:00 - 11:30',
      Tempat_Venue: 'Dewan Pusat Tingkatan Enam Meragang',
      Pautan_GPS_Maps: 'https://maps.google.com/?q=Pusat+Tingkatan+Enam+Meragang+Brunei',
      Pelan_Sekolah_URL: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80',
      Pelan_Parking_URL: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80',
      Panduan_Parking: 'Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi & VIP).',
      Catatan_Khas: 'Program FutureLink - Sesi pra-universiti.',
      Status_Acara: 'Aktif'
    },
    {
      Event_ID: 'EVT-FL-05',
      Kategori_Program: 'Program FutureLink',
      Nama_Acara: 'Program FutureLink - Maktab Duli (Taklimat sahaja)',
      Sekolah: 'Maktab Duli Pengiran Muda Al-Muhtadee Billah',
      Daerah: 'Brunei Muara',
      Tarikh_Mula: '2027-06-29',
      Tarikh_Paparan: '29/06/2027 (Selasa)',
      Hari: 'Selasa',
      Masa: '09:00 - 11:30',
      Tempat_Venue: 'Dewan Auditorium Maktab Duli Pengiran Muda Al-Muhtadee Billah',
      Pautan_GPS_Maps: 'https://maps.google.com/?q=Maktab+Duli+Pengiran+Muda+Al-Muhtadee+Billah',
      Pelan_Sekolah_URL: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80',
      Pelan_Parking_URL: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80',
      Panduan_Parking: 'Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi & VIP).',
      Catatan_Khas: 'Taklimat sahaja',
      Status_Acara: 'Aktif'
    }
  ];
}

function getPreseeded52Agencies() {
  return [
    { kod: 'AG-01', namaAgensi: 'Jabatan Pengurusan Biasiswa', user: 'agensi_biasiswa', kategori: 'Kementerian & Jabatan Kerajaan', statusRsvp: 'Hadir', bilMeja: 2, bilKerusi: 4, bilPlug: 1, noPlatKereta: 'BA 1101', jumlahWakil: 3 },
    { kod: 'AG-02', namaAgensi: 'Majlis Kebangsaan Pengiktirafan Kelulusan', user: 'agensi_mkpk', kategori: 'Kementerian & Jabatan Kerajaan', statusRsvp: 'Hadir', bilMeja: 1, bilKerusi: 2, bilPlug: 0, noPlatKereta: 'BA 1102', jumlahWakil: 2 },
    { kod: 'AG-03', namaAgensi: 'Jabatan Pengajian Tinggi', user: 'agensi_jpt', kategori: 'Kementerian & Jabatan Kerajaan', statusRsvp: 'Hadir', bilMeja: 2, bilKerusi: 4, bilPlug: 1, noPlatKereta: 'BA 1103', jumlahWakil: 3 },
    { kod: 'AG-04', namaAgensi: 'Jabatan Pengurusan Pendidik', user: 'agensi_jpp', kategori: 'Kementerian & Jabatan Kerajaan', statusRsvp: 'Belum Sah', bilMeja: 1, bilKerusi: 2, bilPlug: 0, noPlatKereta: 'BA 1104', jumlahWakil: 2 },
    { kod: 'AG-05', namaAgensi: 'Universiti Brunei Darussalam', user: 'agensi_ubd', kategori: 'Institusi Pengajian Tinggi (IPT)', statusRsvp: 'Hadir', bilMeja: 2, bilKerusi: 4, bilPlug: 1, noPlatKereta: 'BA 1234', jumlahWakil: 4 },
    { kod: 'AG-06', namaAgensi: 'Universiti Teknologi Brunei', user: 'agensi_utb', kategori: 'Institusi Pengajian Tinggi (IPT)', statusRsvp: 'Hadir', bilMeja: 2, bilKerusi: 4, bilPlug: 1, noPlatKereta: 'BG 5566', jumlahWakil: 3 },
    { kod: 'AG-07', namaAgensi: 'Universiti Islam Sultan Sharif Ali', user: 'agensi_unissa', kategori: 'Institusi Pengajian Tinggi (IPT)', statusRsvp: 'Hadir', bilMeja: 2, bilKerusi: 3, bilPlug: 1, noPlatKereta: 'BA 7788', jumlahWakil: 3 },
    { kod: 'AG-08', namaAgensi: 'Kolej Universiti Perguruan Ugama Seri Begawan', user: 'agensi_kupusb', kategori: 'Institusi Pengajian Tinggi (IPT)', statusRsvp: 'Hadir', bilMeja: 1, bilKerusi: 2, bilPlug: 0, noPlatKereta: 'BB 9911', jumlahWakil: 2 },
    { kod: 'AG-09', namaAgensi: 'Politeknik Brunei', user: 'agensi_pb', kategori: 'Institusi Pengajian Tinggi (IPT)', statusRsvp: 'Hadir', bilMeja: 2, bilKerusi: 4, bilPlug: 1, noPlatKereta: 'KA 3322', jumlahWakil: 4 },
    { kod: 'AG-10', namaAgensi: 'Institut Pendidikan Teknikal Brunei (IBTE)', user: 'agensi_ibte', kategori: 'Institusi Pendidikan Teknikal', statusRsvp: 'Hadir', bilMeja: 2, bilKerusi: 4, bilPlug: 1, noPlatKereta: 'KB 4433', jumlahWakil: 4 },
    { kod: 'AG-11', namaAgensi: 'Laksamana College of Business', user: 'agensi_lcb', kategori: 'Institusi Swasta', statusRsvp: 'Hadir', bilMeja: 1, bilKerusi: 2, bilPlug: 1, noPlatKereta: 'BA 8080', jumlahWakil: 2 },
    { kod: 'AG-12', namaAgensi: 'Micronet International College', user: 'agensi_micronet', kategori: 'Institusi Swasta', statusRsvp: 'Hadir', bilMeja: 1, bilKerusi: 2, bilPlug: 1, noPlatKereta: 'BA 2020', jumlahWakil: 2 },
    { kod: 'AG-13', namaAgensi: 'Cosmopolitan College of Commerce & Technology', user: 'agensi_cosmo', kategori: 'Institusi Swasta', statusRsvp: 'Belum Sah', bilMeja: 1, bilKerusi: 2, bilPlug: 0, noPlatKereta: 'BA 3030', jumlahWakil: 2 },
    { kod: 'AG-14', namaAgensi: 'Kolej International Graduate Studies (KIGS)', user: 'agensi_kigs', kategori: 'Institusi Swasta', statusRsvp: 'Hadir', bilMeja: 1, bilKerusi: 2, bilPlug: 1, noPlatKereta: 'BA 4040', jumlahWakil: 2 },
    { kod: 'AG-15', namaAgensi: 'Pusat Pembangunan Belia (PPB)', user: 'agensi_ppb', kategori: 'Pusat Latihan Vokasional', statusRsvp: 'Hadir', bilMeja: 2, bilKerusi: 3, bilPlug: 1, noPlatKereta: 'BB 5050', jumlahWakil: 3 },
    { kod: 'AG-16', namaAgensi: 'Jabatan Pembangunan Masyarakat (JAPEM)', user: 'agensi_japem', kategori: 'Kementerian Kebudayaan, Belia dan Sukan', statusRsvp: 'Hadir', bilMeja: 1, bilKerusi: 2, bilPlug: 0, noPlatKereta: 'BA 6060', jumlahWakil: 2 },
    { kod: 'AG-17', namaAgensi: 'Jabatan Belia dan Sukan (JBS)', user: 'agensi_jbs', kategori: 'Kementerian Kebudayaan, Belia dan Sukan', statusRsvp: 'Hadir', bilMeja: 1, bilKerusi: 2, bilPlug: 0, noPlatKereta: 'BA 7070', jumlahWakil: 2 },
    { kod: 'AG-18', namaAgensi: 'Jabatan Perkhidmatan Awam (JPA)', user: 'agensi_jpa', kategori: 'Jabatan Perdana Menteri', statusRsvp: 'Hadir', bilMeja: 2, bilKerusi: 4, bilPlug: 1, noPlatKereta: 'BA 8081', jumlahWakil: 3 },
    { kod: 'AG-19', namaAgensi: 'Angkatan Bersenjata Diraja Brunei (ABDB)', user: 'agensi_abdb', kategori: 'Keselamatan & Pertahanan', statusRsvp: 'Hadir', bilMeja: 2, bilKerusi: 4, bilPlug: 1, noPlatKereta: 'MOD 01', jumlahWakil: 4 },
    { kod: 'AG-20', namaAgensi: 'Tentera Darat Diraja Brunei (TDDB)', user: 'agensi_tddb', kategori: 'Keselamatan & Pertahanan', statusRsvp: 'Hadir', bilMeja: 2, bilKerusi: 4, bilPlug: 1, noPlatKereta: 'MOD 02', jumlahWakil: 4 },
    { kod: 'AG-21', namaAgensi: 'Tentera Udara Diraja Brunei (TUDB)', user: 'agensi_tudb', kategori: 'Keselamatan & Pertahanan', statusRsvp: 'Hadir', bilMeja: 2, bilKerusi: 4, bilPlug: 1, noPlatKereta: 'MOD 03', jumlahWakil: 3 },
    { kod: 'AG-22', namaAgensi: 'Tentera Laut Diraja Brunei (TLDB)', user: 'agensi_tldb', kategori: 'Keselamatan & Pertahanan', statusRsvp: 'Hadir', bilMeja: 2, bilKerusi: 3, bilPlug: 1, noPlatKereta: 'MOD 04', jumlahWakil: 3 },
    { kod: 'AG-23', namaAgensi: 'Institut Latihan ABDB (IL ABDB)', user: 'agensi_ilabdb', kategori: 'Keselamatan & Pertahanan', statusRsvp: 'Hadir', bilMeja: 1, bilKerusi: 2, bilPlug: 0, noPlatKereta: 'MOD 05', jumlahWakil: 2 },
    { kod: 'AG-24', namaAgensi: 'Pasukan Polis Diraja Brunei (PPDB)', user: 'agensi_ppdb', kategori: 'Keselamatan & Penguatkuasaan', statusRsvp: 'Hadir', bilMeja: 2, bilKerusi: 4, bilPlug: 1, noPlatKereta: 'POLIS 12', jumlahWakil: 4 },
    { kod: 'AG-25', namaAgensi: 'Pusat Latihan Polis Diraja Brunei', user: 'agensi_plppdb', kategori: 'Keselamatan & Penguatkuasaan', statusRsvp: 'Hadir', bilMeja: 1, bilKerusi: 2, bilPlug: 0, noPlatKereta: 'POLIS 34', jumlahWakil: 2 },
    { kod: 'AG-26', namaAgensi: 'Jabatan Bomba dan Penyelamat (JBP)', user: 'agensi_jbp', kategori: 'Keselamatan & Penyelamat', statusRsvp: 'Hadir', bilMeja: 2, bilKerusi: 4, bilPlug: 1, noPlatKereta: 'BOMBA 08', jumlahWakil: 4 },
    { kod: 'AG-27', namaAgensi: 'Jabatan Penjara Brunei', user: 'agensi_penjara', kategori: 'Keselamatan & Hal Ehwal Dalam Negeri', statusRsvp: 'Belum Sah', bilMeja: 1, bilKerusi: 2, bilPlug: 0, noPlatKereta: 'BA 9091', jumlahWakil: 2 },
    { kod: 'AG-28', namaAgensi: 'Jabatan Imigresen dan Pendaftaran Kebangsaan', user: 'agensi_jipk', kategori: 'Keselamatan & Hal Ehwal Dalam Negeri', statusRsvp: 'Hadir', bilMeja: 2, bilKerusi: 3, bilPlug: 1, noPlatKereta: 'BA 9092', jumlahWakil: 3 },
    { kod: 'AG-29', namaAgensi: 'Jabatan Kastam dan Eksais Diraja (JKED)', user: 'agensi_jked', kategori: 'Kementerian Kewangan dan Ekonomi', statusRsvp: 'Hadir', bilMeja: 2, bilKerusi: 3, bilPlug: 1, noPlatKereta: 'BA 9093', jumlahWakil: 3 },
    { kod: 'AG-30', namaAgensi: 'Biro Mencegah Rasuah (BMR)', user: 'agensi_bmr', kategori: 'Penguatkuasaan & Integriti', statusRsvp: 'Hadir', bilMeja: 1, bilKerusi: 2, bilPlug: 0, noPlatKereta: 'BA 9094', jumlahWakil: 2 },
    { kod: 'AG-31', namaAgensi: 'Biro Kawalan Narkotik (BKN)', user: 'agensi_bkn', kategori: 'Penguatkuasaan & Keselamatan', statusRsvp: 'Hadir', bilMeja: 2, bilKerusi: 3, bilPlug: 1, noPlatKereta: 'BA 9095', jumlahWakil: 3 },
    { kod: 'AG-32', namaAgensi: 'Brunei Shell Petroleum Co Sdn Bhd (BSP)', user: 'agensi_bsp', kategori: 'Minyak & Gas (GLC)', statusRsvp: 'Hadir', bilMeja: 2, bilKerusi: 4, bilPlug: 1, noPlatKereta: 'BSP 01', jumlahWakil: 4 },
    { kod: 'AG-33', namaAgensi: 'Brunei LNG Sdn Bhd (BLNG)', user: 'agensi_blng', kategori: 'Minyak & Gas (GLC)', statusRsvp: 'Hadir', bilMeja: 2, bilKerusi: 4, bilPlug: 1, noPlatKereta: 'BLNG 02', jumlahWakil: 4 },
    { kod: 'AG-34', namaAgensi: 'Brunei Gas Carriers Sdn Bhd (BGC)', user: 'agensi_bgc', kategori: 'Maritim & Tenaga (GLC)', statusRsvp: 'Hadir', bilMeja: 1, bilKerusi: 2, bilPlug: 1, noPlatKereta: 'BGC 03', jumlahWakil: 2 },
    { kod: 'AG-35', namaAgensi: 'Brunei Fertilizer Industries (BFI)', user: 'agensi_bfi', kategori: 'Petrokimia (GLC)', statusRsvp: 'Hadir', bilMeja: 2, bilKerusi: 3, bilPlug: 1, noPlatKereta: 'BFI 04', jumlahWakil: 3 },
    { kod: 'AG-36', namaAgensi: 'Hengyi Industries Sdn Bhd', user: 'agensi_hengyi', kategori: 'Petrokimia & Industri Berat', statusRsvp: 'Hadir', bilMeja: 2, bilKerusi: 4, bilPlug: 1, noPlatKereta: 'PMB 88', jumlahWakil: 4 },
    { kod: 'AG-37', namaAgensi: 'Royal Brunei Airlines (RB)', user: 'agensi_rb', kategori: 'Syarikat Penerbangan & GLC', statusRsvp: 'Hadir', bilMeja: 2, bilKerusi: 4, bilPlug: 1, noPlatKereta: 'RBA 787', jumlahWakil: 4 },
    { kod: 'AG-38', namaAgensi: 'DST Sdn Bhd', user: 'agensi_dst', kategori: 'Telekomunikasi & GLC', statusRsvp: 'Hadir', bilMeja: 2, bilKerusi: 4, bilPlug: 1, noPlatKereta: 'DST 55', jumlahWakil: 3 },
    { kod: 'AG-39', namaAgensi: 'Progresif Sdn Bhd', user: 'agensi_progresif', kategori: 'Telekomunikasi & GLC', statusRsvp: 'Hadir', bilMeja: 2, bilKerusi: 3, bilPlug: 1, noPlatKereta: 'PRO 99', jumlahWakil: 3 },
    { kod: 'AG-40', namaAgensi: 'imagine Sdn Bhd', user: 'agensi_imagine', kategori: 'Telekomunikasi & GLC', statusRsvp: 'Belum Sah', bilMeja: 1, bilKerusi: 2, bilPlug: 0, noPlatKereta: 'IMG 10', jumlahWakil: 2 },
    { kod: 'AG-41', namaAgensi: 'Unified National Networks (UNN)', user: 'agensi_unn', kategori: 'Infrastruktur Telekomunikasi (GLC)', statusRsvp: 'Hadir', bilMeja: 2, bilKerusi: 3, bilPlug: 1, noPlatKereta: 'UNN 01', jumlahWakil: 3 },
    { kod: 'AG-42', namaAgensi: 'Bank Islam Brunei Darussalam (BIBD)', user: 'agensi_bibd', kategori: 'Perbankan & Kewangan', statusRsvp: 'Hadir', bilMeja: 2, bilKerusi: 4, bilPlug: 1, noPlatKereta: 'BIBD 08', jumlahWakil: 4 },
    { kod: 'AG-43', namaAgensi: 'Baiduri Bank Group', user: 'agensi_baiduri', kategori: 'Perbankan & Kewangan', statusRsvp: 'Hadir', bilMeja: 2, bilKerusi: 4, bilPlug: 1, noPlatKereta: 'BBG 77', jumlahWakil: 3 },
    { kod: 'AG-44', namaAgensi: 'Perbadanan Tabung Amanah Islam Brunei (TAIB)', user: 'agensi_taib', kategori: 'Institusi Kewangan Islam', statusRsvp: 'Hadir', bilMeja: 1, bilKerusi: 2, bilPlug: 0, noPlatKereta: 'TAIB 03', jumlahWakil: 2 },
    { kod: 'AG-45', namaAgensi: 'Brunei Darussalam Central Bank (BDCB)', user: 'agensi_bdcb', kategori: 'Kawal Selia Kewangan', statusRsvp: 'Hadir', bilMeja: 2, bilKerusi: 3, bilPlug: 1, noPlatKereta: 'BDCB 01', jumlahWakil: 3 },
    { kod: 'AG-46', namaAgensi: 'Brunei Investment Agency (BIA)', user: 'agensi_bia', kategori: 'Pelaburan Negara', statusRsvp: 'Hadir', bilMeja: 1, bilKerusi: 2, bilPlug: 0, noPlatKereta: 'BIA 99', jumlahWakil: 2 },
    { kod: 'AG-47', namaAgensi: 'Darussalam Enterprise (DARe)', user: 'agensi_dare', kategori: 'Pembangunan Keusahawanan (GLC)', statusRsvp: 'Hadir', bilMeja: 2, bilKerusi: 3, bilPlug: 1, noPlatKereta: 'DARE 01', jumlahWakil: 3 },
    { kod: 'AG-48', namaAgensi: 'Pihak Berkuasa Industri Info-Komunikasi (AITI)', user: 'agensi_aiti', kategori: 'Kawal Selia Digital', statusRsvp: 'Hadir', bilMeja: 2, bilKerusi: 3, bilPlug: 1, noPlatKereta: 'AITI 05', jumlahWakil: 3 },
    { kod: 'AG-49', namaAgensi: 'Cyber Security Brunei (CSB)', user: 'agensi_csb', kategori: 'Keselamatan Siber Kebangsaan', statusRsvp: 'Hadir', bilMeja: 2, bilKerusi: 3, bilPlug: 1, noPlatKereta: 'CSB 01', jumlahWakil: 3 },
    { kod: 'AG-50', namaAgensi: 'Pusat Sejarah Brunei', user: 'agensi_psb', kategori: 'Kebudayaan & Sejarah', statusRsvp: 'Hadir', bilMeja: 1, bilKerusi: 2, bilPlug: 0, noPlatKereta: 'BA 3388', jumlahWakil: 2 },
    { kod: 'AG-51', namaAgensi: 'Dewan Bahasa dan Pustaka Brunei', user: 'agensi_dbp', kategori: 'Bahasa & Sastera Kebangsaan', statusRsvp: 'Hadir', bilMeja: 1, bilKerusi: 2, bilPlug: 0, noPlatKereta: 'BA 4499', jumlahWakil: 2 },
    { kod: 'AG-52', namaAgensi: 'Radio Televisyen Brunei (RTB)', user: 'agensi_rtb', kategori: 'Penyiaran & Media Kebangsaan', statusRsvp: 'Hadir', bilMeja: 2, bilKerusi: 4, bilPlug: 1, noPlatKereta: 'RTB 01', jumlahWakil: 4 }
  ];
}

function handleOfflineFallback(action, data) {
  if (action === 'login') {
    const u = String(data.username || '').toLowerCase();
    if (u === 'admin_ceu') {
      return {
        success: true,
        message: 'Log masuk mod luar talian (Admin CEU)',
        token: 'offline-admin-token',
        user: { id: 'ADMIN-CEU', role: 'ADMIN', namaAgensi: 'Unit Pendidikan Kerjaya (Admin CEU)', username: 'admin_ceu' }
      };
    } else {
      return {
        success: true,
        message: 'Log masuk mod luar talian (Agensi Jemputan)',
        token: 'offline-agency-token',
        user: { id: 'AG-05', role: 'AGENCY', namaAgensi: 'Universiti Brunei Darussalam', username: u || 'agensi_ubd' }
      };
    }
  }

  if (action === 'getInitialData') {
    return { success: true, events: getFallbackEvents(), rsvps: [] };
  }

  if (action === 'submitRSVP') {
    return { success: true, message: 'RSVP berjaya direkodkan (Mod Demonstrasi / Luar Talian)!' };
  }

  return { success: true, message: 'Operasi mod simulasi berjaya.' };
}

// Inisialisasi Aplikasi Semasa Dimuatkan
window.addEventListener('DOMContentLoaded', () => {
  I18N.applyToDOM();

  // Pastikan data 32 sesi takwim rasmi terkini sentiasa aktif
  if (!AppState.events || AppState.events.length < 32) {
    AppState.events = getFallbackEvents();
    localStorage.setItem('ceu_cache_events', JSON.stringify(AppState.events));
  }
  if (!AppState.activeEvent && AppState.events.length > 0) {
    AppState.activeEvent = AppState.events[0];
  }

  // Tangani hash navigation awal
  const hash = window.location.hash.replace('#', '') || (AppState.currentUser ? (AppState.currentUser.role === 'ADMIN' ? 'admin' : 'home') : 'login');
  navigateTo(hash);

  // Ambil data senyap jika ada sesi aktif
  if (AppState.currentUser) {
    fetchInitialDataSilently();
  }
});
