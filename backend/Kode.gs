/**
 * ============================================================================
 * PORTAL CEU - SISTEM PENGURUSAN ACARA & RSVP (PHT & FUTURELINK)
 * Backend REST API Google Apps Script (GAS-PRO-API + GAS-SCALE-TURBO)
 * Unit Pendidikan Kerjaya (UPK), Jabatan Sekolah-Sekolah, Kementerian Pendidikan
 * ============================================================================
 */

const APP_VERSION = '2.1.0';
const SESI_JAM = 24;

/**
 * ENTRY POINT GET (Data Publik / Cacheable Read)
 */
function doGet(e) {
  const t0 = Date.now();
  let res;
  try {
    const params = (e && e.parameter) || {};
    const action = params.action || 'ping';

    switch (action) {
      case 'ping':
        res = { success: true, message: 'PORTAL CEU REST API is running', version: APP_VERSION, time: new Date().toISOString() };
        break;
      case 'getAppConfig':
        res = getPublicAppConfig_();
        break;
      case 'getEvents':
        res = getPublicEvents_(params);
        break;
      case 'getAgencies':
        res = getPublicAgenciesList_();
        break;
      case 'getRsvps':
        res = getPublicRsvpsList_();
        break;
      case 'verifikasiDokumen':
        res = deVerifikasiPublik_(params.kode);
        break;
      default:
        res = { success: false, message: 'Action GET tidak dikenali: ' + action };
    }
  } catch (err) {
    res = { success: false, message: err.message || String(err) };
  }

  res.ms = Date.now() - t0;
  res.v = APP_VERSION;
  return buildJsonResponse_(res);
}

/**
 * ENTRY POINT POST (Autentikasi, Mutasi Data, Dokumen, Notifikasi)
 * WAJIB: Klien mengirimkan header 'Content-Type': 'text/plain;charset=utf-8'
 */
function doPost(e) {
  const t0 = Date.now();
  let res;
  let body = {};

  try {
    const raw = (e && e.postData && e.postData.contents) || '{}';
    body = JSON.parse(raw);
    const action = body.action || '';
    const payload = body.data || {};
    const token = body.token || '';

    // Route dispatching
    res = dispatchPostAction_(action, payload, token);
  } catch (err) {
    res = { success: false, message: 'Ralat Pelayan: ' + (err.message || String(err)) };
  }

  res.ms = Date.now() - t0;
  res.v = APP_VERSION;

  // Telemetri log jika lambat
  if (res.ms > 4000) {
    queueLog_('SYSTEM', 'SLOW_REQUEST', (body.action || '') + ' mengambil masa ' + res.ms + ' ms');
  }

  return buildJsonResponse_(res);
}

/**
 * Dispatcher POST berpusat dengan pengesahan token RBAC
 */
function dispatchPostAction_(action, data, token) {
  // Aksi Tanpa Autentikasi
  if (action === 'login') {
    return handleLogin_(data);
  }
  if (action === 'checkSession') {
    return handleCheckSession_(token);
  }

  // Pengesahan Token Sesi HMAC (dengan kelonggaran bagi serahan RSVP agar tidak hilang)
  let auth = verifyToken_(token);
  if (!auth) {
    if (action === 'submitRSVP' && (data.agencyId || data.agensiId || data.namaAgensi)) {
      auth = {
        id: data.agencyId || data.agensiId || 'AG-UNKNOWN',
        namaAgensi: data.namaAgensi || ('Agensi ' + (data.agencyId || data.agensiId)),
        role: 'AGENCY'
      };
    } else if (action === 'getInitialData') {
      auth = { id: 'ANONYMOUS', role: 'VIEWER' };
    } else {
      return { success: false, code: 'AUTH_EXPIRED', message: 'Sesi anda telah tamat. Sila log masuk semula.' };
    }
  }

  // Aksi Portal Agensi & Admin (Boleh diakses kedua-duanya)
  switch (action) {
    case 'getInitialData':
      return handleGetInitialData_(auth);
    case 'submitRSVP':
      return handleSubmitRSVP_(auth, data);
    case 'getEventDetails':
      return handleGetEventDetails_(data.eventId);
    case 'getNotifications':
      return handleGetNotifications_(auth);
    case 'changePassword':
      return handleChangePassword_(auth, data);
    case 'generateSuratJemputan':
      return handleGenerateSuratJemputan_(data);
  }

  // Aksi Eksklusif Super Admin CEU
  if (auth.role !== 'ADMIN') {
    return { success: false, message: 'Akses dinafikan. Anda memerlukan kebenaran Pentadbir CEU.' };
  }

  switch (action) {
    case 'getAdminDashboard':
      return handleGetAdminDashboard_();
    case 'saveEvent':
      return handleSaveEvent_(data);
    case 'deleteEvent':
      return handleDeleteEvent_(data.eventId);
    case 'getAgenciesCredentials':
      return handleGetAgenciesCredentials_();
    case 'resetAgencyPassword':
      return handleResetAgencyPassword_(data.agencyId);
    case 'getLogisticsReport':
      return handleGetLogisticsReport_(data.eventId);
    case 'uploadEventMedia':
      return handleUploadEventMedia_(data);
    case 'generateSuratJemputan':
      return handleGenerateSuratJemputan_(data);
    case 'sendBroadcastWA':
      return handleSendBroadcastWA_(data);
    case 'getCRMContacts':
      return handleGetCRMContacts_();
    case 'syncCRM':
      return handleSyncCRM_();
    case 'runDataMigration':
      return handleRunDataMigration_(data);
    default:
      return { success: false, message: 'Action POST tidak dikenali: ' + action };
  }
}

/**
 * Membina output respons JSON ContentService murni bebas CORS
 */
function buildJsonResponse_(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Mengambil konfigurasi awam aplikasi
 */
function getPublicAppConfig_() {
  const cached = CacheX.get('app_public_config');
  if (cached) return { success: true, data: cached };

  const config = {
    appName: prop_('APP_NAME', 'PORTAL CEU'),
    department: 'Unit Pendidikan Kerjaya, Jabatan Sekolah-Sekolah',
    ministry: 'Kementerian Pendidikan, Negara Brunei Darussalam',
    version: APP_VERSION,
    totalAgencies: 50,
    defaultLanguage: 'BM'
  };

  CacheX.put('app_public_config', config, 3600);
  return { success: true, data: config };
}

/**
 * Mengambil senarai nama 50 agensi untuk dropdown/paparan umum
 */
function getPublicAgenciesList_() {
  const cached = CacheX.get('public_agencies_list');
  if (cached) return { success: true, data: cached };

  const rows = getSheetData_('Agensi_Users');
  const list = rows.map(r => ({
    id: r.Agensi_ID,
    nama: r.Nama_Agensi,
    kategori: r.Kategori || 'Institusi / Agensi'
  }));

  CacheX.put('public_agencies_list', list, 3600);
  return { success: true, data: list };
}

/**
 * Mengambil senarai acara aktif
 */
function getPublicEvents_(params) {
  const v = getVersion_('events');
  const cacheKey = 'events_public_' + v;
  const cached = CacheX.get(cacheKey);
  if (cached) return { success: true, data: cached };

  const events = getSheetData_('Events');
  const activeEvents = events
    .filter(e => String(e.Status_Acara).toLowerCase() !== 'arkib')
    .sort((a, b) => new Date(a.Tarikh_Mula) - new Date(b.Tarikh_Mula));

  CacheX.put(cacheKey, activeEvents, 1800);
  return { success: true, data: activeEvents };
}
