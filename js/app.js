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
      const res = await fetch(CONFIG.GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (json.code === 'AUTH_EXPIRED') {
        showToast('Sesi anda telah tamat. Sila log masuk semula.', 'warning');
        logoutUser();
        return { success: false, message: 'Session expired' };
      }
      return json;
    } catch (err) {
      console.warn('API Error:', err);
      // Fallback offline / local demo data jika URL belum disambung
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
// ============================================
function navigateTo(viewId, param = null) {
  if (!AppState.currentUser && viewId !== 'login') {
    viewId = 'login';
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

  // Kemaskini Navigasi Bawah (Bottom Navigation Bar)
  updateBottomNav(viewId);

  // Render view spesifik
  switch (viewId) {
    case 'home':
      renderHomeScreen();
      break;
    case 'eventDetails':
      renderEventDetailsScreen(param);
      break;
    case 'rsvpForm':
      renderRsvpFormScreen(param);
      break;
    case 'floorPlan':
      renderFloorPlanScreen(param);
      break;
    case 'parking':
      renderParkingScreen(param);
      break;
    case 'archive':
      renderArchiveScreen();
      break;
    case 'notifications':
      renderNotificationsScreen();
      break;
    case 'profile':
      renderProfileScreen();
      break;
    case 'admin':
      renderAdminDashboard();
      break;
    case 'adminEvents':
      renderAdminEventsList();
      break;
    case 'adminAgencies':
      renderAdminAgenciesDirectory();
      break;
    case 'adminReports':
      renderAdminReports();
      break;
  }
}

function updateBottomNav(viewId) {
  const bottomNav = document.getElementById('bottomNavBar');
  if (!bottomNav) return;

  if (viewId === 'login' || !AppState.currentUser) {
    bottomNav.classList.add('hidden');
    return;
  }
  bottomNav.classList.remove('hidden');

  document.querySelectorAll('.bottom-nav-item').forEach(btn => {
    const target = btn.getAttribute('data-target');
    const icon = btn.querySelector('.nav-icon');
    const label = btn.querySelector('.nav-label');

    if (target === viewId) {
      btn.classList.add('text-amber-500');
      btn.classList.remove('text-slate-400');
      if (icon) icon.classList.add('font-bold');
      if (label) label.classList.add('font-bold');
    } else {
      btn.classList.remove('text-amber-500');
      btn.classList.add('text-slate-400');
      if (icon) icon.classList.remove('font-bold');
      if (label) label.classList.remove('font-bold');
    }
  });
}

// ============================================
// 4. AUTENTIKASI: LOG MASUK & KELUAR
// ============================================
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
// 5. RENDERING SKRIN 02: PAPAN PEMUKA AGENSI
// ============================================
function renderHomeScreen() {
  const user = AppState.currentUser;
  if (!user) return;

  // 1. Sapaan mengikut NAMA AGENSI (Bukan nama individu)
  const agencyNameEl = document.getElementById('homeAgencyName');
  if (agencyNameEl) {
    agencyNameEl.innerText = user.namaAgensi || 'UNIVERSITI BRUNEI DARUSSALAM';
  }

  // 2. Metrik Pantas daripada Cache
  const evList = AppState.events.length ? AppState.events : getFallbackEvents();
  const primaryEvent = evList[0];
  AppState.activeEvent = primaryEvent;

  // 3. Render Hero Event Card
  const heroCardContainer = document.getElementById('homeHeroCardArea');
  if (heroCardContainer && primaryEvent) {
    const isAttending = AppState.rsvps.some(r => r.Event_ID === primaryEvent.Event_ID && r.Status_RSVP === 'Hadir');

    heroCardContainer.innerHTML = `
      <div class="card-elevated p-4 flex flex-col gap-3 relative overflow-hidden">
        <div class="flex items-center justify-between">
          <span class="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <span class="material-symbols-outlined text-[14px]">star</span>
            ${I18N.t('badgeMandatory')}
          </span>
          <span class="bg-red-50 text-red-600 text-xs font-semibold px-2.5 py-1 rounded-full">
            ${primaryEvent.Tarikh_Mula}
          </span>
        </div>

        <div class="w-full h-36 bg-slate-100 rounded-xl overflow-hidden relative shadow-inner">
          <img src="${primaryEvent.Pelan_Sekolah_URL || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80'}" class="w-full h-full object-cover" alt="Venue Cover" />
          <div class="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-sm text-white text-[11px] font-medium px-2.5 py-1 rounded-lg flex items-center gap-1">
            <span class="material-symbols-outlined text-[14px]">apartment</span>
            ${primaryEvent.Tempat_Venue}
          </div>
        </div>

        <div class="flex flex-col">
          <span class="text-[11px] font-bold text-teal-700 uppercase tracking-wider">JABATAN SEKOLAH-SEKOLAH · UNIT CEU</span>
          <h3 class="text-base font-bold text-slate-900 leading-snug mt-0.5">${primaryEvent.Nama_Acara}</h3>
        </div>

        <div class="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-teal-600 text-[16px]">calendar_month</span>
            <span>${primaryEvent.Tarikh_Mula}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-teal-600 text-[16px]">schedule</span>
            <span>${primaryEvent.Masa}</span>
          </div>
        </div>

        <div class="flex items-center gap-2 pt-1">
          <button onclick="navigateTo('rsvpForm', '${primaryEvent.Event_ID}')" class="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-4 rounded-xl shadow-md shadow-amber-500/20 btn-pressable flex items-center justify-center gap-1.5 text-sm">
            <span class="material-symbols-outlined text-[18px]">how_to_reg</span>
            <span>${isAttending ? 'Kemaskini RSVP' : I18N.t('btnConfirmRSVP')}</span>
          </button>
          <button onclick="navigateTo('eventDetails', '${primaryEvent.Event_ID}')" class="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl btn-pressable flex items-center justify-center" title="Butiran Acara">
            <span class="material-symbols-outlined text-[20px]">info</span>
          </button>
        </div>
      </div>
    `;
  }
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

  if (titleEl) titleEl.innerText = ev.Nama_Acara;
  if (venueEl) venueEl.innerText = ev.Tempat_Venue;
  if (dateEl) dateEl.innerText = ev.Tarikh_Mula;
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

function renderRsvpFormScreen(eventId) {
  const ev = (AppState.events.find(e => e.Event_ID === eventId) || AppState.activeEvent) || getFallbackEvents()[0];
  const user = AppState.currentUser;

  const evNameEl = document.getElementById('rsvpFormEventName');
  const agencyBadge = document.getElementById('rsvpFormAgencyBadge');
  if (evNameEl) evNameEl.innerText = ev.Nama_Acara;
  if (agencyBadge && user) agencyBadge.innerText = user.namaAgensi || 'Universiti Brunei Darussalam';

  // Semak jika sudah ada RSVP sebelum ini
  const existing = AppState.rsvps.find(r => r.Event_ID === ev.Event_ID && r.Agensi_ID === (user ? user.id : ''));
  if (existing) {
    selectRsvpStatus(existing.Status_RSVP || 'Hadir');
    setStepperVal('countMeja', existing.Bil_Meja || 2);
    setStepperVal('countKerusi', existing.Bil_Kerusi || 4);
    setStepperVal('countPlug', existing.Bil_Plug || 1);
    setStepperVal('countWakil', existing.Jumlah_Wakil || 3);
    document.getElementById('inputNamaWakil').value = existing.Nama_Wakil_Hadir || '';
    document.getElementById('inputKeperluanLain').value = existing.Keperluan_Lain || '';
  } else {
    selectRsvpStatus('Hadir');
    setStepperVal('countMeja', 2);
    setStepperVal('countKerusi', 4);
    setStepperVal('countPlug', 1);
    setStepperVal('countWakil', 3);
  }
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

  const payload = {
    eventId: ev.Event_ID,
    statusRsvp: currentRsvpStatus,
    bilMeja: parseInt(document.getElementById('countMeja').innerText || '0', 10),
    bilKerusi: parseInt(document.getElementById('countKerusi').innerText || '0', 10),
    bilPlug: parseInt(document.getElementById('countPlug').innerText || '0', 10),
    jumlahWakil: parseInt(document.getElementById('countWakil').innerText || '0', 10),
    namaWakilHadir: document.getElementById('inputNamaWakil').value.trim(),
    keperluanLain: document.getElementById('inputKeperluanLain').value.trim(),
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
    const updatedRecord = Object.assign({}, payload, { Agensi_ID: user.id, Nama_Agensi: user.namaAgensi });
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
// 10. RENDERING SKRIN 09 - 12: PAPAN PEMUKA ADMIN
// ============================================
async function renderAdminDashboard() {
  const res = await apiCall('getAdminDashboard');
  if (!res.success) return;

  const d = res.data;
  AppState.dashboardData = d;

  const totalAgenciesEl = document.getElementById('adminStatTotalAgencies');
  const responseRateEl = document.getElementById('adminStatResponseRate');
  const tablesTotalEl = document.getElementById('adminStatTotalTables');
  const plugsTotalEl = document.getElementById('adminStatTotalPlugs');

  if (totalAgenciesEl) totalAgenciesEl.innerText = d.totalAgencies || 52;
  if (responseRateEl) responseRateEl.innerText = (d.kadarRsvpPercent || 84) + '%';
  if (tablesTotalEl) tablesTotalEl.innerText = (d.logisticsAggregate.meja || 88) + ' Unit';
  if (plugsTotalEl) plugsTotalEl.innerText = (d.logisticsAggregate.plug || 36) + ' Unit';

  // Render recent activity feed
  const feedContainer = document.getElementById('adminRecentFeedList');
  if (feedContainer && d.recentRsvps) {
    feedContainer.innerHTML = d.recentRsvps.map(r => `
      <div class="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
        <div class="flex flex-col min-w-0 pr-2">
          <span class="font-bold text-slate-800 truncate">${r.Nama_Agensi}</span>
          <span class="text-slate-500 text-[11px]">${r.Tarikh_Kemaskini || 'Baru sahaja'}</span>
        </div>
        <div class="flex items-center gap-1.5 flex-shrink-0">
          <span class="bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full text-[10px]">${r.Status_RSVP}</span>
          <span class="text-slate-600 font-semibold">${r.Bil_Meja} M / ${r.Bil_Kerusi} K</span>
        </div>
      </div>
    `).join('');
  }
}

async function renderAdminAgenciesDirectory() {
  const res = await apiCall('getAgenciesCredentials');
  const container = document.getElementById('adminAgenciesTableBody');
  if (!container) return;

  const list = res.success ? res.data : getPreseeded52Agencies();
  AppState.agenciesList = list;

  container.innerHTML = list.map((a, i) => `
    <tr class="border-b border-slate-100 hover:bg-slate-50/80 text-xs transition-colors">
      <td class="p-3 font-mono font-bold text-slate-600">${a.kod || ('AG-' + (i + 1))}</td>
      <td class="p-3 font-bold text-slate-900">${a.namaAgensi || a.nama}</td>
      <td class="p-3 font-mono text-teal-800 bg-teal-50/50 rounded">${a.username || a.user}</td>
      <td class="p-3 text-slate-500">${a.kategori}</td>
      <td class="p-3 text-right">
        <button onclick="handleAdminResetAgencyPassword('${a.kod || a.id}')" class="px-2.5 py-1 text-xs bg-slate-100 hover:bg-amber-100 hover:text-amber-800 text-slate-700 font-semibold rounded-lg transition-colors">
          Reset Sandi
        </button>
      </td>
    </tr>
  `).join('');
}

async function handleAdminResetAgencyPassword(agencyId) {
  if (!confirm('Adakah anda pasti ingin menetapkan semula kata laluan agensi ini?')) return;
  const res = await apiCall('resetAgencyPassword', { agencyId }, true);
  if (res.success) {
    alert('Kata laluan baharu: ' + res.temporaryPassword + '\nSila kongsikan kepada wakil agensi.');
    showToast('Kata laluan berjaya direset!', 'success');
  }
}

async function renderAdminReports() {
  const res = await apiCall('getLogisticsReport', { eventId: 'EVT-2026-01' });
  const container = document.getElementById('adminReportsTableBody');
  if (!container || !res.success) return;

  const data = res.data;
  container.innerHTML = data.rows.map((r, i) => `
    <tr class="border-b border-slate-100 text-xs hover:bg-slate-50">
      <td class="p-2.5 text-slate-500">${i + 1}</td>
      <td class="p-2.5 font-bold text-slate-900">${r.namaAgensi}</td>
      <td class="p-2.5">
        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${r.statusRsvp === 'Hadir' ? 'bg-teal-100 text-teal-800' : (r.statusRsvp === 'Tidak Hadir' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-600')}">
          ${r.statusRsvp}
        </span>
      </td>
      <td class="p-2.5 text-center font-bold">${r.bilMeja}</td>
      <td class="p-2.5 text-center font-bold">${r.bilKerusi}</td>
      <td class="p-2.5 text-center font-bold">${r.bilPlug}</td>
      <td class="p-2.5 text-center font-bold text-sky-700">${r.jumlahWakil}</td>
    </tr>
  `).join('');
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
    {
      Event_ID: 'EVT-2026-01',
      Kategori_Program: 'Program Hala Tuju',
      Nama_Acara: 'Pameran Pendidikan Hala Tuju 2026 (Zon Belait)',
      Tarikh_Mula: '2026-03-15',
      Masa: '08:00 - 16:30',
      Tempat_Venue: 'Dewan Serbaguna Pusat Tingkatan Enam Belait',
      Pautan_GPS_Maps: 'https://maps.google.com/?q=Pusat+Tingkatan+Enam+Belait',
      Pelan_Sekolah_URL: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80',
      Panduan_Parking: 'Sila masuk melalui Pintu Pagar B (Pagar Khas Agensi & VIP). Zon parking dikhaskan di Blok C, bersebelahan padang.',
      Catatan_Khas: 'Pakaian rasmi pejabat / kot. Meja pameran disediakan oleh sekolah.',
      Status_Acara: 'Aktif'
    },
    {
      Event_ID: 'EVT-2026-02',
      Kategori_Program: 'Taklimat Tahunan Agensi',
      Nama_Acara: 'Taklimat Tahunan Bersama 52 Agensi Jemputan',
      Tarikh_Mula: '2026-03-24',
      Masa: '08:30 - 11:30',
      Tempat_Venue: 'Auditorium Utama MOE, Blok A, Lapangan Terbang Lama',
      Pautan_GPS_Maps: 'https://maps.google.com/?q=Ministry+of+Education+Brunei',
      Panduan_Parking: 'Parking pelawat aras bawah dan bertingkat Blok A.',
      Catatan_Khas: 'Penyelarasan SOP kehadiran dan agihan kalendar acara.',
      Status_Acara: 'Aktif'
    },
    {
      Event_ID: 'EVT-2026-03',
      Kategori_Program: 'Program FutureLink',
      Nama_Acara: 'Program FutureLink Siri 1 (Zon Brunei Muara)',
      Tarikh_Mula: '2026-04-10',
      Masa: '08:00 - 15:30',
      Tempat_Venue: 'Dewan Auditorium Maktab Sains Paduka Seri Begawan Sultan',
      Pautan_GPS_Maps: 'https://maps.google.com/?q=Maktab+Sains+Brunei',
      Panduan_Parking: 'Pintu pagar utama Maktab Sains.',
      Catatan_Khas: 'Orientasi kerjaya STEM dan pendidikan vokasional.',
      Status_Acara: 'Aktif'
    }
  ];
}

function getPreseeded52Agencies() {
  return [
    { kod: 'AG-01', namaAgensi: 'Jabatan Pengurusan Biasiswa', user: 'agensi_biasiswa', kategori: 'Kementerian & Jabatan Kerajaan' },
    { kod: 'AG-02', namaAgensi: 'Majlis Kebangsaan Pengiktirafan Kelulusan', user: 'agensi_mkpk', kategori: 'Kementerian & Jabatan Kerajaan' },
    { kod: 'AG-03', namaAgensi: 'Jabatan Pengajian Tinggi', user: 'agensi_jpt', kategori: 'Kementerian & Jabatan Kerajaan' },
    { kod: 'AG-04', namaAgensi: 'Jabatan Pengurusan Pendidik', user: 'agensi_jpp', kategori: 'Kementerian & Jabatan Kerajaan' },
    { kod: 'AG-05', namaAgensi: 'Universiti Brunei Darussalam', user: 'agensi_ubd', kategori: 'Institusi Pengajian Tinggi (IPT)' },
    { kod: 'AG-06', namaAgensi: 'Universiti Teknologi Brunei', user: 'agensi_utb', kategori: 'Institusi Pengajian Tinggi (IPT)' },
    { kod: 'AG-07', namaAgensi: 'UNISSA', user: 'agensi_unissa', kategori: 'Institusi Pengajian Tinggi (IPT)' },
    { kod: 'AG-08', namaAgensi: 'Kolej Universiti Perguruan Ugama Seri Begawan', user: 'agensi_kupusb', kategori: 'Institusi Pengajian Tinggi (IPT)' },
    { kod: 'AG-09', namaAgensi: 'Politeknik Brunei', user: 'agensi_pb', kategori: 'Institusi Pengajian Tinggi (IPT)' },
    { kod: 'AG-10', namaAgensi: 'Institut Pendidikan Teknikal Brunei (IBTE)', user: 'agensi_ibte', kategori: 'Institusi Pendidikan Teknikal' },
    { kod: 'AG-19', namaAgensi: 'Tentera Darat Diraja Brunei', user: 'agensi_tddb', kategori: 'Keselamatan & Pertahanan' },
    { kod: 'AG-27', namaAgensi: 'Pasukan Polis Diraja Brunei', user: 'agensi_ppdb', kategori: 'Penguatkuasaan & Keselamatan' },
    { kod: 'AG-28', namaAgensi: 'Jabatan Bomba dan Penyelamat', user: 'agensi_jbp', kategori: 'Penyelamat & Keselamatan' },
    { kod: 'AG-34', namaAgensi: 'Royal Brunei Airlines', user: 'agensi_rb', kategori: 'Syarikat Penerbangan Nasional & GLC' },
    { kod: 'AG-40', namaAgensi: 'DST Sdn Bhd', user: 'agensi_dst', kategori: 'Telekomunikasi & GLC' },
    { kod: 'AG-44', namaAgensi: 'Baiduri Bank', user: 'agensi_baiduri', kategori: 'Perbankan & Kewangan' },
    { kod: 'AG-50', namaAgensi: 'Hengyi Industries Sdn Bhd', user: 'agensi_hengyi', kategori: 'Petrokimia & Industri Berat' }
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

  // Tangani hash navigation awal
  const hash = window.location.hash.replace('#', '') || (AppState.currentUser ? 'home' : 'login');
  navigateTo(hash);

  // Ambil data senyap jika ada sesi aktif
  if (AppState.currentUser) {
    fetchInitialDataSilently();
  }
});
