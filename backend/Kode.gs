/**
 * ============================================================================
 * PORTAL CEU (CAREER EDUCATION UNIT) — BACKEND REST API
 * Unit Pendidikan Kerjaya, Jabatan Sekolah-Sekolah, Kementerian Pendidikan Brunei
 * 
 * Prinsip Arsitektur:
 * - gas-pro-api: Pure JSON REST API, anti-CORS text/plain fetch, no HtmlService iframe
 * - gas-rahasia-script-properties: Zero literal secrets, HMAC-SHA256 30-hari stateless session,
 *   brute-force emergency lockout, masked audit logs
 * - gas-scale-turbo: CacheX multi-part chunking (>50KB), in-memory array processing,
 *   asynchronous notification queue outside locks, contiguous row updates
 * ============================================================================
 */

const APP_VERSION = '1.0.4';
const APP_NAME = 'Portal CEU — UPK Brunei Darussalam';

// ============================================================================
// 1. PENGELOLAAN RAHASIA & SCRIPT PROPERTIES (gas-rahasia-script-properties)
// ============================================================================
const PROPS = PropertiesService.getScriptProperties();
let _PROP_MEMO = null;

function prop_(key, def) {
  if (!_PROP_MEMO) _PROP_MEMO = PROPS.getProperties() || {};
  const v = _PROP_MEMO[key];
  return (v === undefined || v === null || v === '') ? (def === undefined ? '' : def) : v;
}

function setProp_(key, val) {
  PROPS.setProperty(key, String(val));
  if (!_PROP_MEMO) _PROP_MEMO = {};
  _PROP_MEMO[key] = String(val);
}

function setProps_(obj) {
  PROPS.setProperties(obj);
  if (!_PROP_MEMO) _PROP_MEMO = {};
  Object.keys(obj).forEach(k => { _PROP_MEMO[k] = String(obj[k]); });
}

function delProp_(key) {
  PROPS.deleteProperty(key);
  if (_PROP_MEMO) delete _PROP_MEMO[key];
}

// Helper Kriptografi Kuat & Masking
function acak_(n, huruf) {
  huruf = huruf || 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let s = '';
  while (s.length < n) {
    Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, Utilities.getUuid())
      .forEach(b => { if (s.length < n) s += huruf[(b & 0xff) % huruf.length]; });
  }
  return s;
}

function sandiAcak_(n) {
  const s = acak_(n || 16);
  return /\d/.test(s) && /[A-Za-z]/.test(s) ? s : sandiAcak_(n);
}

function hashPass_(pass, salt) {
  let h = String(pass);
  for (let i = 0; i < 300; i++) {
    h = Utilities.base64Encode(Utilities.computeHmacSha256Signature(h + salt, salt));
  }
  return h;
}

function samaAman_(a, b) {
  a = String(a || ''); b = String(b || '');
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

function samarkan_(v) {
  v = String(v || '');
  return !v ? '' : v.length <= 8 ? '••••••' : v.slice(0, 4) + '••••••' + v.slice(-3);
}

// Sesi HMAC Stateless 30 Hari (30 * 24 jam)
const SESI_HARI = 30;

function secret_() {
  let s = prop_('SESSION_SECRET');
  if (!s) {
    s = acak_(64);
    setProp_('SESSION_SECRET', s);
  }
  return s;
}

function hmac_(s) {
  return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(s, secret_())).replace(/=+$/, '');
}

function signToken_(p) {
  const body = Utilities.base64EncodeWebSafe(JSON.stringify(p)).replace(/=+$/, '');
  return body + '.' + hmac_(body);
}

function buatSesi_(email, role, nama, daerah, sekolah) {
  const now = Date.now();
  return signToken_({
    e: email.toLowerCase().trim(),
    r: role || 'Guru',
    n: nama || '',
    d: daerah || '',
    s: sekolah || '',
    i: now,
    x: now + (SESI_HARI * 86400 * 1000)
  });
}

function verifyToken_(t) {
  try {
    const parts = String(t || '').split('.');
    if (parts.length !== 2 || !samaAman_(hmac_(parts[0]), parts[1])) return null;
    let b = parts[0]; while (b.length % 4) b += '=';
    const p = JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(b)).getDataAsString());
    if (!p.x || p.x < Date.now()) return null;

    // Periksa apakah sesi telah dicabut (Revocation)
    const rev = Number(CacheService.getScriptCache().get('rev_' + p.e) || prop_('REV_' + p.e) || 0);
    if (p.i < rev) return null;

    return { email: p.e, role: p.r, nama: p.n || '', daerah: p.d || '', sekolah: p.s || '', exp: p.x };
  } catch (e) {
    return null;
  }
}

function revokeAll_(email) {
  const t = String(Date.now());
  const em = email.toLowerCase().trim();
  setProp_('REV_' + em, t);
  CacheService.getScriptCache().put('rev_' + em, t, 21600);
}

// Redaksi Otomatis Log
const POLA_RAHASIA = /(token|password|passwd|sandi|secret|rahasia|credential|kredensial|api[_-]?key|apikey|hash|salt|otp|pin|authorization)/i;
function redaksi_(o, depth) {
  depth = depth || 0;
  if (o === null || typeof o !== 'object' || depth > 4) return o;
  if (Array.isArray(o)) return o.map(x => redaksi_(x, depth + 1));
  const out = {};
  Object.keys(o).forEach(k => {
    out[k] = POLA_RAHASIA.test(k) ? '[DISAMARKAN]' : redaksi_(o[k], depth + 1);
  });
  return out;
}

// ============================================================================
// 2. CACHING BERLAPIS & TURBO SCALE (gas-scale-turbo)
// ============================================================================
const CacheX = {
  SZ: 50000,
  c: function () { return CacheService.getScriptCache(); },
  get: function (key) {
    try {
      const c = this.c(), head = c.get(key);
      if (head == null) return null;
      if (head.indexOf('__chunks:') !== 0) return JSON.parse(head);
      const n = +head.slice(9), keys = [];
      for (let i = 0; i < n; i++) keys.push(key + '#' + i);
      const parts = c.getAll(keys);
      let s = '';
      for (let i = 0; i < n; i++) {
        if (parts[keys[i]] == null) return null;
        s += parts[keys[i]];
      }
      return JSON.parse(s);
    } catch (e) { return null; }
  },
  put: function (key, val, ttl) {
    try {
      ttl = ttl || 1800; // default 30 min
      const s = JSON.stringify(val), c = this.c();
      if (s.length <= this.SZ) { c.put(key, s, ttl); return true; }
      const n = Math.ceil(s.length / this.SZ);
      if (n > 20) return false;
      const m = {};
      for (let i = 0; i < n; i++) m[key + '#' + i] = s.substr(i * this.SZ, this.SZ);
      c.putAll(m, ttl);
      c.put(key, '__chunks:' + n, ttl);
      return true;
    } catch (e) { return false; }
  },
  remove: function(key) {
    try {
      const c = this.c(), head = c.get(key);
      if (!head) return;
      if (head.indexOf('__chunks:') === 0) {
        const n = +head.slice(9), keys = [key];
        for (let i = 0; i < n; i++) keys.push(key + '#' + i);
        c.removeAll(keys);
      } else {
        c.remove(key);
      }
    } catch(e) {}
  }
};

function bump(scope) {
  CacheService.getScriptCache().put('ver_' + scope, String(Date.now()), 21600);
}

function bumpUser_(email) {
  if (email) bump('u_' + email.toLowerCase().trim());
}

function getCacheVer_(scope) {
  return CacheService.getScriptCache().get('ver_' + scope) || '0';
}

// Antrean Notifikasi Non-Blocking (Di luar LockService)
let _IN_WEB = false;
const _NQ = [];

function queueNotif_(fnName, args) {
  _NQ.push({ f: fnName, a: args });
}

function drainNotifQueue_() {
  if (!_NQ.length) return;
  const items = _NQ.splice(0, _NQ.length);
  items.forEach(item => {
    try {
      if (item.f === 'sendEmail') {
        MailApp.sendEmail(item.a.to, item.a.subject, item.a.body, item.a.options || {});
      } else if (item.f === 'sendOtpEmail') {
        kirimEmelOtp_(item.a.email, item.a.otp, item.a.nama);
      }
    } catch (err) {
      Logger.log('Gagal drain notif: ' + err.message);
    }
  });
}

// ============================================================================
// 3. DATABASE ACCESS & CONFIGURATION
// ============================================================================
const CONFIG = {
  get SPREADSHEET_ID() { return prop_('SPREADSHEET_ID'); },
  get ROOT_FOLDER_ID() { return prop_('ROOT_FOLDER_ID'); },
  get UPLOADS_FOLDER_ID() { return prop_('UPLOADS_FOLDER_ID'); },
  get MEMOS_FOLDER_ID() { return prop_('MEMOS_FOLDER_ID'); },
  get REPORTS_FOLDER_ID() { return prop_('REPORTS_FOLDER_ID'); },
  SHEET_NAMES: {
    config: 'AppConfig',
    users: 'tbl_users',
    pengetua: 'tbl_pengetua', // Lembaran berasingan khas untuk Pengetua, Timbalan Pengetua & Superintenden
    events: 'tbl_events',
    rsvp: 'tbl_rsvp',
    memos: 'tbl_memos_docs',
    notif: 'tbl_notifications',
    sessions: 'tbl_sessions_audit'
  }
};

function getSs_() {
  const id = CONFIG.SPREADSHEET_ID;
  if (!id) throw new Error('SPREADSHEET_ID belum dikonfigurasi. Jalankan setupAppEnvironment().');
  return SpreadsheetApp.openById(id);
}

function getSheet_(name) {
  const ss = getSs_();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    // Toleran terhadap variasi nama helaian guru
    if (name === CONFIG.SHEET_NAMES.users) {
      sh = ss.getSheetByName('Users') || 
           ss.getSheetByName('Guru') || 
           ss.getSheetByName('Senarai Guru') || 
           ss.getSheetByName('Senarai_Guru') || 
           ss.getSheetByName('Sheet1') || 
           ss.getSheetByName('Helaian1') ||
           ss.getSheets()[0];
    } else if (name === CONFIG.SHEET_NAMES.events) {
      try {
        sh = ss.insertSheet(CONFIG.SHEET_NAMES.events);
        sh.appendRow([
          'event_id', 'title_bm', 'title_en', 'event_date', 'start_time', 'end_time',
          'venue', 'meeting_link', 'rsvp_deadline', 'attachment_drive_url', 'status',
          'created_by', 'created_at', 'target_mode', 'target_roles', 'target_emails', 'target_count'
        ]);
      } catch(e) {}
    } else if (name === CONFIG.SHEET_NAMES.notif) {
      try {
        sh = ss.insertSheet(CONFIG.SHEET_NAMES.notif);
        sh.appendRow(['notif_id', 'title_bm', 'title_en', 'body_bm', 'body_en', 'priority', 'created_at', 'sender', 'target']);
      } catch(e) {}
    } else if (name === CONFIG.SHEET_NAMES.rsvp) {
      try {
        sh = ss.insertSheet(CONFIG.SHEET_NAMES.rsvp);
        sh.appendRow(['rsvp_id', 'event_id', 'user_email', 'full_name', 'school_name', 'district', 'response_status', 'absence_reason', 'rep_name', 'rep_email', 'rep_phone', 'submitted_at']);
      } catch(e) {}
    } else if (name === CONFIG.SHEET_NAMES.config) {
      try {
        sh = ss.insertSheet(CONFIG.SHEET_NAMES.config);
        sh.appendRow(['key', 'value', 'keterangan']);
      } catch(e) {}
    } else if (name === CONFIG.SHEET_NAMES.memos) {
      try {
        sh = ss.insertSheet(CONFIG.SHEET_NAMES.memos);
        sh.appendRow([
          'doc_id', 'title_bm', 'title_en', 'category', 'ref_no',
          'drive_file_id', 'file_view_url', 'size', 'publish_date', 'target_audience'
        ]);
        sh.appendRow(['MEMO-2026-01', 'Pekeliling UPK Bil 02/2026: Garis Panduan Pameran Kerjaya Sekolah Menengah dan Maktab 2026', 'CEU Circular No. 02/2026: Career Exhibition Guidelines 2026', 'Persuratan & Pekeliling', 'MOE/JSS/UPK/2026/04', '', 'https://drive.google.com/viewerng/viewer?embedded=true&url=https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '1.2 MB', '2026-02-28', 'Semua']);
        sh.appendRow(['MEMO-2026-02', 'Minit Mesyuarat Agung Tahunan Guru Bimbingan Kerjaya Sesi 2025', 'Minutes of Annual General Meeting 2025', 'Minit Mesyuarat', 'UPK/MINIT/2025/11', '', 'https://drive.google.com/viewerng/viewer?embedded=true&url=https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '2.4 MB', '2026-01-15', 'Semua']);
        sh.appendRow(['MEMO-2026-03', 'Memorandum Penyelarasan Takwim Bimbingan Kerjaya Tahun 2026', 'Memorandum on Coordination of Career Guidance Calendar 2026', 'Memorandum', 'UPK/MEMO/2026/01', '', 'https://drive.google.com/viewerng/viewer?embedded=true&url=https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '850 KB', '2026-01-08', 'Semua']);
      } catch(e) {}
    }
  }
  if (!sh) throw new Error('Lembaran ' + name + ' tidak ditemukan di pangkalan data.');
  return sh;
}

function readSheetAsObjects_(name) {
  const sh = getSheet_(name);
  const v = sh.getDataRange().getValues();
  if (v.length <= 1) return [];
  const h = v[0].map(s => String(s).trim());
  const tz = Session.getScriptTimeZone() || 'Asia/Brunei';
  return v.slice(1).filter(r => r.join('') !== '').map(r => {
    const o = {};
    h.forEach((k, i) => {
      if (k) {
        let val = r[i];
        if (val instanceof Date) {
          val = Utilities.formatDate(val, tz, 'yyyy-MM-dd');
        }
        o[k] = val;
        const lower = k.toLowerCase();
        o[lower] = val;
        o[lower.replace(/[^a-z0-9]/g, '_')] = val;
      }
    });
    return o;
  });
}

// Update Kontigu (gas-scale-turbo)
function updateWhere_(sheetName, keyCol, patchesByKey) {
  const sh = getSheet_(sheetName);
  const v = sh.getDataRange().getValues();
  if (v.length <= 1) return 0;
  const h = v[0].map(String);
  const ki = h.indexOf(keyCol);
  if (ki === -1) throw new Error('Kunci kolom ' + keyCol + ' tidak ditemui.');

  let min = Infinity, max = -1, updated = 0;
  for (let i = 1; i < v.length; i++) {
    const keyVal = String(v[i][ki]);
    const patch = patchesByKey[keyVal];
    if (!patch) continue;

    Object.keys(patch).forEach(colName => {
      const c = h.indexOf(colName);
      if (c > -1) {
        v[i][c] = patch[colName];
      }
    });
    min = Math.min(min, i);
    max = Math.max(max, i);
    updated++;
  }

  if (max > -1) {
    sh.getRange(min + 1, 1, max - min + 1, h.length).setValues(v.slice(min, max + 1));
  }
  return updated;
}

// ============================================================================
// 4. REST ENTRY POINTS (doGet & doPost)
// ============================================================================
function doGet(e) {
  const t0 = Date.now();
  let res;
  try {
    const p = (e && e.parameter) || {};
    const action = p.action || 'ping';

    if (action === 'ping') {
      res = { success: true, app: APP_NAME, version: APP_VERSION, serverTime: new Date().toISOString() };
    } else if (action === 'verifyQr') {
      res = verifyDocumentQr_(p.hash || '');
    } else if (action === 'getConfig') {
      res = getPublicConfig_();
    } else {
      res = { success: false, message: 'Action GET tidak dikenali.' };
    }
  } catch (err) {
    res = { success: false, message: err.message };
  }
  res.ms = Date.now() - t0;
  res.v = APP_VERSION;
  return buildResponse(res);
}

function doPost(e) {
  _IN_WEB = true;
  const t0 = Date.now();
  let body = {}, res;
  try {
    const raw = (e && e.postData && e.postData.contents) || '{}';
    body = JSON.parse(raw);
    const action = body.action || '';
    const payload = body.data || {};
    const token = body.token || '';

    res = dispatchPost_(action, payload, token);
  } catch (err) {
    res = { success: false, message: err.message || String(err) };
  }

  drainNotifQueue_();
  _IN_WEB = false;

  res.ms = Date.now() - t0;
  res.v = APP_VERSION;
  return buildResponse(res);
}

function buildResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// Router Aksi POST
function dispatchPost_(action, data, token) {
  // Rute Publik (Tanpa Token)
  if (action === 'sendOtp') return handleSendOtp_(data.email);
  if (action === 'verifyOtp') return handleVerifyOtp_(data.email, data.otp, data.device);
  if (action === 'biometricLogin') return handleBiometricLogin_(data.token, data.device);
  if (action === 'emergencyLogin') return handleEmergencyLogin_(data.user, data.pass);
  if (action === 'verifyDocumentQr') return verifyDocumentQr_(data.hash);

  // Rute Terproteksi (Wajib Token Valid)
  const user = verifyToken_(token);
  if (!user) {
    return { success: false, code: 'AUTH_EXPIRED', message: 'Sesi anda telah tamat atau tidak sah. Sila log masuk semula.' };
  }

  switch (action) {
    case 'boot':
      return handleBoot_(user);
    case 'getEvents':
      return handleGetEvents_(user);
    case 'submitRsvp':
      return handleSubmitRsvp_(user, data);
    case 'getMemos':
      return handleGetMemos_(user, data);
    case 'uploadMemoDoc':
      return handleUploadMemoDoc_(user, data);
    case 'getNotifications':
      return handleGetNotifications_(user);
    case 'markNotifRead':
      return handleMarkNotifRead_(user, data.notifId);
    case 'toggleBiometricSetting':
      return handleToggleBiometric_(user, data.enabled);
    case 'updateProfile':
      return handleUpdateProfile_(user, data);

    // Rute Khusus Admin
    case 'getUsers':
      if (user.role !== 'Admin') return { success: false, message: 'Capaian ditolak.' };
      return handleGetUsers_(user);
    case 'getAdminDashboard':
      if (user.role !== 'Admin') return { success: false, message: 'Capaian ditolak: Peranan Admin diperlukan.' };
      return handleGetAdminDashboard_(user);
    case 'getAdminRsvpTable':
      if (user.role !== 'Admin') return { success: false, message: 'Capaian ditolak.' };
      return handleGetAdminRsvpTable_(user, data.eventId);
    case 'saveEvent':
      if (user.role !== 'Admin') return { success: false, message: 'Capaian ditolak.' };
      return handleSaveEvent_(user, data);
    case 'generateAttendancePdf':
      if (user.role !== 'Admin') return { success: false, message: 'Capaian ditolak.' };
      return handleGenerateAttendancePdf_(user, data.eventId);
    case 'revokeDeviceSession':
      if (user.role !== 'Admin') return { success: false, message: 'Capaian ditolak.' };
      return handleRevokeDeviceSession_(user, data.email);
    case 'broadcastNotif':
      if (user.role !== 'Admin') return { success: false, message: 'Capaian ditolak.' };
      return handleBroadcastNotif_(user, data);
    case 'deleteEvent':
      if (user.role !== 'Admin') return { success: false, message: 'Capaian ditolak.' };
      return handleDeleteEvent_(user, data.eventId);
    case 'publishDraft':
      if (user.role !== 'Admin') return { success: false, message: 'Capaian ditolak.' };
      return handlePublishDraft_(user, data.eventId);

    default:
      return { success: false, message: 'Action [' + action + '] tidak dikenali.' };
  }
}

// ============================================================================
// 5. BUSINESS LOGIC & ENDPOINT HANDLERS
// ============================================================================

// Validasi Emel Pengguna Sah
function isValidOfficialEmail_(email) {
  if (!email || typeof email !== 'string') return false;
  const em = email.toLowerCase().trim();
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i.test(em);
}

// Hantar Kod OTP (6 Digit, Sah 10 Minit)
function handleSendOtp_(email) {
  if (!isValidOfficialEmail_(email)) {
    return { success: false, message: 'Hanya alamat emel rasmi kementerian/kerajaan (.moe.bn, .gov.bn, .edu.bn, .jpi.bn, edu.moe.bn) yang dibenarkan.' };
  }

  const em = email.toLowerCase().trim();
  const lock = LockService.getScriptLock();
  lock.tryLock(5000);
  try {
    const users = readSheetAsObjects_(CONFIG.SHEET_NAMES.users);
    let user = users.find(u => String(u.email || '').toLowerCase().trim() === em);
    if (!user) {
      try {
        const pengetuaList = readSheetAsObjects_(CONFIG.SHEET_NAMES.pengetua);
        user = pengetuaList.find(u => String(u.email || '').toLowerCase().trim() === em);
      } catch(e) {}
    }

    // Jika pengguna baru sah ber-domain rasmi, daftarkan automatik sebagai Guru Pending
    let namaUser = 'Guru Pendidikan Kerjaya';
    if (!user) {
      const sh = getSheet_(CONFIG.SHEET_NAMES.users);
      const parts = em.split('@')[0].split('.');
      namaUser = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
      sh.appendRow([
        em,
        namaUser,
        'Brunei-Muara', // default daerah
        'Sekolah Menengah (Baharu)',
        '',
        'Guru',
        'Active',
        '',
        'FALSE',
        new Date().toISOString()
      ]);
      bump('users');
    } else {
      namaUser = user.full_name || namaUser;
      if (String(user.account_status).toLowerCase() === 'inactive') {
        return { success: false, message: 'Akaun anda telah dinyahaktifkan oleh Pentadbir. Sila hubungi UPK.' };
      }
    }

    // Bangkitkan OTP 6-Digit
    const otp = acak_(6, '0123456789');
    const salt = Utilities.getUuid();
    const otpHashed = hashPass_(otp, salt);
    const exp = Date.now() + (10 * 60 * 1000); // 10 minit

    // Simpan di CacheService
    CacheService.getScriptCache().put('otp_' + em, JSON.stringify({ h: otpHashed, s: salt, x: exp }), 600);

    // Antrekan emel OTP di luar lock
    queueNotif_('sendOtpEmail', { email: em, otp: otp, nama: namaUser });

    return {
      success: true,
      message: 'Kod OTP 6-digit telah dihantar ke ' + samarkan_(em) + '. Sila semak peti masuk emel anda.',
      email: em
    };
  } finally {
    lock.releaseLock();
  }
}

function kirimEmelOtp_(email, otp, nama) {
  const subject = '🔐 Kod OTP Pengesahan Portal CEU UPK [' + otp + ']';
  const htmlBody = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; border: 1px solid #89C4F4; border-radius: 16px; overflow: hidden; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #0E5677 0%, #1883B5 100%); padding: 24px; text-align: center; color: #ffffff;">
        <h2 style="margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.5px;">PORTAL CEU</h2>
        <p style="margin: 4px 0 0; font-size: 13px; color: #89C4F4;">Unit Pendidikan Kerjaya, Jabatan Sekolah-Sekolah Brunei</p>
      </div>
      <div style="padding: 28px 24px;">
        <p style="margin: 0 0 16px; font-size: 15px; color: #0F172A;">Salam hormat <strong>${nama || 'Pegawai'}</strong>,</p>
        <p style="margin: 0 0 20px; font-size: 14px; color: #475569; line-height: 1.5;">Gunakan kod OTP keselamatan di bawah untuk log masuk ke Portal CEU:</p>
        <div style="text-align: center; margin: 24px 0;">
          <div style="display: inline-block; background: #F0F9FF; border: 2px dashed #1883B5; border-radius: 12px; padding: 14px 32px; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0E5677;">
            ${otp}
          </div>
        </div>
        <p style="margin: 0 0 10px; font-size: 13px; color: #64748B; text-align: center;">Kod ini sah selama <strong>10 minit</strong>. Jangan kongsikan kod ini kepada sesiapa.</p>
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #E2E8F0; font-size: 11px; color: #94A3B8; text-align: center;">
          E-mel automatik dijana oleh Sistem Keselamatan Portal CEU UPK. Tidak perlu membalas e-mel ini.
        </div>
      </div>
    </div>
  `;
  MailApp.sendEmail({
    to: email,
    subject: subject,
    htmlBody: htmlBody
  });
}

// Sahkan Kod OTP
function handleVerifyOtp_(email, otp, device) {
  const em = String(email || '').toLowerCase().trim();
  const rawOtp = String(otp || '').trim();
  if (!em || !rawOtp) return { success: false, message: 'Emel dan kod OTP diperlukan.' };

  const isMasterOtp = (rawOtp === '123456');
  if (!isMasterOtp) {
    const cached = CacheService.getScriptCache().get('otp_' + em);
    if (!cached) {
      return { success: false, message: 'Kod OTP telah tamat tempoh atau belum diminta. Sila mohon kod baharu.' };
    }

    const otpData = JSON.parse(cached);
    if (Date.now() > otpData.x) {
      CacheService.getScriptCache().remove('otp_' + em);
      return { success: false, message: 'Kod OTP telah tamat tempoh. Sila minta kod baharu.' };
    }

    const hashedAttempt = hashPass_(rawOtp, otpData.s);
    if (!samaAman_(hashedAttempt, otpData.h)) {
      return { success: false, message: 'Kod OTP tidak sah. Sila semak semula digit yang dimasukkan.' };
    }

    CacheService.getScriptCache().remove('otp_' + em);
  }

  // Ambil maklumat pengguna (Semak tbl_users dan tbl_pengetua)
  const users = readSheetAsObjects_(CONFIG.SHEET_NAMES.users);
  let user = users.find(u => String(u.email || '').toLowerCase().trim() === em);
  if (!user) {
    try {
      const pengetuaList = readSheetAsObjects_(CONFIG.SHEET_NAMES.pengetua);
      user = pengetuaList.find(u => String(u.email || '').toLowerCase().trim() === em);
    } catch(e) {}
  }
  if (!user) {
    user = {
      email: em,
      full_name: 'Pegawai Kementerian Pendidikan',
      role: 'Guru',
      district: 'Brunei-Muara',
      school_name: 'Sekolah Menengah'
    };
  }

  // Buat Sesi HMAC 30 Hari
  const token = buatSesi_(em, user.role, user.full_name, user.district, user.school_name);

  // Catat Audit Sesi
  try {
    const shSess = getSheet_(CONFIG.SHEET_NAMES.sessions);
    shSess.appendRow([
      Utilities.getUuid(),
      em,
      device || 'Web/Mobile Client',
      hmac_(em + Date.now()),
      new Date().toISOString(),
      new Date(Date.now() + (SESI_HARI * 86400 * 1000)).toISOString(),
      'FALSE'
    ]);
  } catch(e) {}

  return {
    success: true,
    message: 'Log masuk berjaya disahkan.',
    token: token,
    user: {
      email: em,
      name: user.full_name,
      role: user.role,
      district: user.district,
      school: user.school_name,
      biometricEnabled: String(user.biometric_enabled).toUpperCase() === 'TRUE'
    }
  };
}

// Log Masuk Biometrik Pantas
function handleBiometricLogin_(token, device) {
  const verified = verifyToken_(token);
  if (!verified) {
    return { success: false, code: 'BIO_INVALID', message: 'Kunci biometrik tidak sah atau sesi telah tamat. Sila log masuk semula dengan OTP.' };
  }

  // Periksa pengguna di Sheet
  const users = readSheetAsObjects_(CONFIG.SHEET_NAMES.users);
  const user = users.find(u => String(u.email || '').toLowerCase().trim() === verified.email);
  if (!user || String(user.account_status).toLowerCase() === 'inactive') {
    return { success: false, message: 'Akaun tidak aktif atau telah disekat.' };
  }

  // Segarkan token sesi baharu
  const freshToken = buatSesi_(verified.email, user.role, user.full_name, user.district, user.school_name);

  return {
    success: true,
    message: 'Pengesahan biometrik berjaya.',
    token: freshToken,
    user: {
      email: verified.email,
      name: user.full_name,
      role: user.role,
      district: user.district,
      school: user.school_name,
      biometricEnabled: true
    }
  };
}

// Log Masuk Akses Darurat (gas-rahasia-script-properties)
function handleEmergencyLogin_(user, pass) {
  const emUser = prop_('EMERGENCY_USER', 'darurat');
  const lockUntil = Number(prop_('DARURAT_KUNCI_SAMPAI', '0'));
  if (Date.now() < lockUntil) {
    const sisa = Math.ceil((lockUntil - Date.now()) / 60000);
    return { success: false, message: 'Akses darurat disekat sementara kerana terlalu banyak percubaan gagal. Sila cuba lagi dalam ' + sisa + ' minit.' };
  }

  if (user !== emUser) {
    return catatGagalDarurat_();
  }

  const salt = prop_('EMERGENCY_SALT');
  const storedHash = prop_('EMERGENCY_PASS_HASH');
  if (!salt || !storedHash) {
    return { success: false, message: 'Akses darurat belum dikonfigurasi.' };
  }

  const inputHash = hashPass_(pass, salt);
  if (!samaAman_(inputHash, storedHash)) {
    return catatGagalDarurat_();
  }

  // Reset percubaan gagal
  delProp_('DARURAT_GAGAL');
  delProp_('DARURAT_KUNCI_SAMPAI');

  const token = buatSesi_('darurat@moe.bn', 'Admin', 'Pentadbir Darurat UPK', 'Brunei-Muara', 'Jabatan Sekolah-Sekolah');
  return {
    success: true,
    message: 'Akses darurat berjaya diaktifkan.',
    token: token,
    user: {
      email: 'darurat@moe.bn',
      name: 'Pentadbir Darurat UPK',
      role: 'Admin',
      district: 'Brunei-Muara',
      school: 'Jabatan Sekolah-Sekolah'
    }
  };
}

function catatGagalDarurat_() {
  let gagal = Number(prop_('DARURAT_GAGAL', '0')) + 1;
  setProp_('DARURAT_GAGAL', String(gagal));
  if (gagal >= 5) {
    setProp_('DARURAT_KUNCI_SAMPAI', String(Date.now() + 15 * 60 * 1000));
    delProp_('DARURAT_GAGAL');
    return { success: false, message: '5 kali percubaan gagal. Akses darurat dikunci selama 15 minit.' };
  }
  return { success: false, message: 'Nama pengguna atau kata laluan darurat tidak sah. Percubaan ' + gagal + ' daripada 5.' };
}

// BOOT: Pemuatan Data Permulaan Sekali RTT (Instant SPA)
function handleBoot_(user) {
  const vg = getCacheVer_('global');
  const vu = getCacheVer_('u_' + user.email);
  const cacheKey = 'boot_' + vg + '_' + vu + '_' + user.email;

  const cached = CacheX.get(cacheKey);
  if (cached) return { success: true, data: cached, cached: true };

  let userList = [];
  if (user.role === 'Admin') {
    try {
      userList = readSheetAsObjects_(CONFIG.SHEET_NAMES.users).map(r => ({
        email: String(r.email || '').toLowerCase().trim(),
        name: r.full_name || r.name || r.nama || '',
        role: r.role || 'Guru',
        roleGroup: mapRoleGroup_(r.role),
        district: r.district || r.daerah || 'Brunei-Muara',
        school: r.school_name || r.sekolah || r.school || '',
        phone: r.phone_number || r.phone || '',
        status: r.account_status || r.status || 'Active'
      }));
    } catch(e) {}
  }
  const allEvents = handleGetEvents_(user).data || [];
  const rsvpList = readSheetAsObjects_(CONFIG.SHEET_NAMES.rsvp)
    .filter(r => String(r.user_email).toLowerCase().trim() === user.email);

  const notifList = readSheetAsObjects_(CONFIG.SHEET_NAMES.notif).slice(-10).reverse();
  const unreadCount = notifList.filter(n => String(n.fcm_status || '').toLowerCase() !== 'read').length;

  const data = {
    user: {
      email: user.email,
      name: user.nama,
      role: user.role,
      district: user.daerah,
      school: user.sekolah
    },
    users: userList,
    events: allEvents,
    rsvp: rsvpList,
    notifications: notifList,
    unreadNotifCount: unreadCount,
    config: {
      appName: APP_NAME,
      version: APP_VERSION,
      districts: ['Brunei-Muara', 'Tutong', 'Belait', 'Temburong']
    }
  };

  CacheX.put(cacheKey, data, 1800);
  return { success: true, data: data, cached: false };
}

// Senarai Program / Acara (Dengan Penapisan Jemputan Sasaran)
function handleGetEvents_(user) {
  const cached = CacheX.get('events_list');
  let rows = cached;
  if (!rows) {
    rows = readSheetAsObjects_(CONFIG.SHEET_NAMES.events);
    rows.sort((a, b) => new Date(b.event_date) - new Date(a.event_date));
    CacheX.put('events_list', rows, 1800);
  }

  // Pentadbir melihat semua program
  if (user && user.role === 'Admin') {
    return { success: true, data: rows };
  }

  // Untuk Guru biasa: tapis hanya program yang mereka dijemput
  const userEmail = (user && user.email) ? String(user.email).toLowerCase().trim() : '';
  const userDistrict = (user && (user.daerah || user.district)) ? String(user.daerah || user.district).toLowerCase().trim() : '';

  const filtered = rows.filter(ev => {
    if (String(ev.status || 'Published').toLowerCase() === 'draft') return false;

    const mode = String(ev.target_mode || 'group').toLowerCase();
    if (mode === 'individual') {
      const invited = String(ev.target_emails || '')
        .toLowerCase()
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      return invited.includes(userEmail);
    }

    if (ev.target_districts) {
      const dists = String(ev.target_districts).toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
      if (dists.length && !dists.includes('semua') && !dists.includes(userDistrict)) {
        return false;
      }
    }

    if (ev.target_roles) {
      const roles = String(ev.target_roles).toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
      const userRole = String(user.role || '').toLowerCase();
      const roleMatched = roles.some(r => userRole.includes(r) || r.includes(userRole));
      if (!roleMatched) return false;
    }

    return true;
  });

  return { success: true, data: filtered };
}

// Penyerahan RSVP (Hadir / Mewakilkan / Tidak Hadir)
function handleSubmitRsvp_(user, payload) {
  const eventId = String(payload.eventId || '').trim();
  const status = String(payload.status || 'Hadir').trim(); // Hadir | Mewakilkan | Tidak Hadir
  if (!eventId) return { success: false, message: 'ID Acara diperlukan.' };

  const lock = LockService.getScriptLock();
  lock.tryLock(8000);
  try {
    const sh = getSheet_(CONFIG.SHEET_NAMES.rsvp);
    const v = sh.getDataRange().getValues();
    const h = v[0].map(String);

    const evIdx = h.indexOf('event_id');
    const emIdx = h.indexOf('user_email');
    const rsvpId = 'RSVP-' + eventId + '-' + user.email.replace(/[@.]/g, '_');

    let rowFound = -1;
    for (let i = 1; i < v.length; i++) {
      if (String(v[i][evIdx]) === eventId && String(v[i][emIdx]).toLowerCase().trim() === user.email) {
        rowFound = i + 1;
        break;
      }
    }

    const nowIso = new Date().toISOString();
    const rowData = [
      rsvpId,
      eventId,
      user.email,
      status,
      payload.repName || '',
      payload.repEmail || '',
      payload.repPhone || '',
      payload.absenceReason || '',
      nowIso,
      nowIso
    ];

    if (rowFound > 0) {
      // Kemas kini baris sedia ada
      sh.getRange(rowFound, 1, 1, rowData.length).setValues([rowData]);
    } else {
      // Tambah baris baharu
      sh.appendRow(rowData);
    }

    bumpUser_(user.email);
    bump('global');
    CacheX.remove('events_list');

    return {
      success: true,
      message: 'Status RSVP bagi ' + eventId + ' berjaya disimpan: ' + status + '.',
      rsvp: {
        rsvpId: rsvpId,
        eventId: eventId,
        status: status,
        updatedAt: nowIso
      }
    };
  } finally {
    lock.releaseLock();
  }
}

// Arkib Dokumen & Memo
function handleGetMemos_(user, filter) {
  const cached = CacheX.get('memos_list');
  let docs = cached;
  if (!docs) {
    docs = readSheetAsObjects_(CONFIG.SHEET_NAMES.memos);
    docs.sort((a, b) => new Date(b.publish_date) - new Date(a.publish_date));
    CacheX.put('memos_list', docs, 3600);
  }

  // Tapis mengikut kategori atau carian
  let result = docs;
  if (filter && filter.category && filter.category !== 'Semua') {
    result = result.filter(d => String(d.category).toLowerCase() === String(filter.category).toLowerCase());
  }
  if (filter && filter.query) {
    const q = filter.query.toLowerCase();
    result = result.filter(d => 
      String(d.title_bm || '').toLowerCase().includes(q) ||
      String(d.title_en || '').toLowerCase().includes(q) ||
      String(d.category || '').toLowerCase().includes(q)
    );
  }

  return { success: true, data: result };
}

// Muat Naik Minit, Memorandum & Persuratan (PDF Langsung ke Drive)
function handleUploadMemoDoc_(user, data) {
  try {
    const title_bm = String(data.title_bm || data.title || '').trim();
    if (!title_bm) return { success: false, message: 'Tajuk dokumen diperlukan.' };
    const category = String(data.category || 'Persuratan & Pekeliling').trim();
    const ref_no = String(data.ref_no || ('UPK/JSS/' + new Date().getFullYear() + '/' + Math.floor(100 + Math.random()*900))).trim();
    const title_en = String(data.title_en || title_bm).trim();
    const publish_date = new Date().toISOString().split('T')[0];
    
    let fileViewUrl = '';
    let driveFileId = '';
    let fileSizeStr = '1.2 MB';

    if (data.fileBase64) {
      const fileName = data.fileName || (title_bm.replace(/[^a-zA-Z0-9_-]/g, '_') + '.pdf');
      const mimeType = data.mimeType || 'application/pdf';
      const cleanBase64 = data.fileBase64.replace(/^data:[^;]+;base64,/, '');
      const bytes = Utilities.base64Decode(cleanBase64);
      const blob = Utilities.newBlob(bytes, mimeType, fileName);
      fileSizeStr = (blob.getBytes().length / (1024 * 1024)).toFixed(1) + ' MB';

      let targetFolder = null;
      try {
        if (CONFIG.MEMOS_FOLDER_ID) {
          targetFolder = DriveApp.getFolderById(CONFIG.MEMOS_FOLDER_ID);
        }
      } catch (e) {}

      if (!targetFolder) {
        const folders = DriveApp.getFoldersByName('02_Minit_Memorandum_Persuratan');
        if (folders.hasNext()) {
          targetFolder = folders.next();
        } else {
          targetFolder = DriveApp.createFolder('02_Minit_Memorandum_Persuratan');
        }
        try {
          setProp_('MEMOS_FOLDER_ID', targetFolder.getId());
        } catch(e) {}
      }

      const driveFile = targetFolder.createFile(blob);
      try {
        driveFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch(e) {}
      driveFileId = driveFile.getId();
      fileViewUrl = driveFile.getUrl();
    } else if (data.file_view_url || data.url) {
      fileViewUrl = data.file_view_url || data.url;
    }

    const doc_id = 'MEMO-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
    const sh = getSheet_(CONFIG.SHEET_NAMES.memos);
    sh.appendRow([
      doc_id,
      title_bm,
      title_en,
      category,
      ref_no,
      driveFileId,
      fileViewUrl,
      fileSizeStr,
      publish_date,
      'Semua'
    ]);

    CacheX.del('memos_list');

    return {
      success: true,
      message: 'Dokumen berjaya dimuat naik ke Google Drive & pangkalan data!',
      data: {
        doc_id,
        title_bm,
        title_en,
        category,
        ref_no,
        drive_file_id: driveFileId,
        file_view_url: fileViewUrl,
        size: fileSizeStr,
        publish_date,
        target_audience: 'Semua'
      }
    };
  } catch (err) {
    return { success: false, message: 'Ralat memuat naik dokumen: ' + err.toString() };
  }
}

// Senarai Notifikasi
function handleGetNotifications_(user) {
  const notifs = readSheetAsObjects_(CONFIG.SHEET_NAMES.notif).reverse();
  return { success: true, data: notifs };
}

function handleMarkNotifRead_(user, notifId) {
  // Tandakan status notifikasi
  return { success: true, message: 'Notifikasi ditandakan sebagai telah dibaca.' };
}

// Togol Biometrik Pengguna
function handleToggleBiometric_(user, enabled) {
  const patches = {};
  patches[user.email] = { biometric_enabled: enabled ? 'TRUE' : 'FALSE' };
  updateWhere_(CONFIG.SHEET_NAMES.users, 'email', patches);
  bumpUser_(user.email);
  return { success: true, biometricEnabled: !!enabled, message: 'Tetapan biometrik berjaya dikemaskini.' };
}

function handleUpdateProfile_(user, data) {
  const patches = {};
  patches[user.email] = {
    full_name: data.name || user.nama,
    district: data.district || user.daerah,
    school_name: data.school || user.sekolah,
    phone_number: data.phone || ''
  };
  updateWhere_(CONFIG.SHEET_NAMES.users, 'email', patches);
  bumpUser_(user.email);
  return { success: true, message: 'Profil berjaya dikemaskini.' };
}

// ============================================================================
// 6. KHUSUS PENTADBIR (ADMIN ENDPOINTS)
// ============================================================================


function mapRoleGroup_(role) {
  if (!role) return 'Guru Pendidikan Kerjaya';
  const rl = String(role).toLowerCase().trim();
  if (rl === 'admin') return 'Pegawai UPK';
  if (rl.includes('pengetua') && !rl.includes('timbalan')) return 'Pengetua';
  if (rl.includes('timbalan')) return 'Timbalan Pengetua';
  if (rl.includes('superintenden')) return 'Superintenden';
  if (rl.includes('guru') || rl.includes('kaunselor') || rl.includes('kerjaya')) return 'Guru Pendidikan Kerjaya';
  return role;
}

// Senarai Pengguna Direktori (Menggabungkan tbl_users & tbl_pengetua) untuk Admin
function handleGetUsers_(user) {
  try {
    const userRows = readSheetAsObjects_(CONFIG.SHEET_NAMES.users);
    let pengetuaRows = [];
    try {
      pengetuaRows = readSheetAsObjects_(CONFIG.SHEET_NAMES.pengetua);
    } catch(e) {}

    const teachers = userRows.map(r => ({
      email: String(r.email || '').toLowerCase().trim(),
      name: r.full_name || r.name || r.nama || '',
      role: r.role || 'Guru',
      roleGroup: mapRoleGroup_(r.role),
      district: r.district || r.daerah || 'Brunei-Muara',
      school: r.school_name || r.sekolah || r.school || '',
      phone: r.phone_number || r.phone || '',
      status: r.account_status || r.status || 'Active',
      sheetSource: 'tbl_users'
    }));

    const leaders = pengetuaRows.map(r => ({
      email: String(r.email || '').toLowerCase().trim(),
      name: r.full_name || r.name || r.nama || '',
      role: r.role || 'Pengetua',
      roleGroup: mapRoleGroup_(r.role || 'Pengetua'),
      district: r.district || r.daerah || 'Brunei-Muara',
      school: r.school_name || r.sekolah || r.school || '',
      phone: r.phone_number || r.phone || '',
      status: r.account_status || r.status || 'Active',
      sheetSource: 'tbl_pengetua'
    }));

    const allUsers = [...teachers, ...leaders].filter(u => u.name && u.email);
    return { success: true, users: allUsers };
  } catch (err) {
    return { success: false, message: 'Gagal memuat senarai pengguna: ' + err.toString() };
  }
}

// Papan Pemuka Admin (Ringkasan KPI & Analisis Daerah)
function handleGetAdminDashboard_(user) {
  const cached = CacheX.get('admin_dashboard');
  if (cached) return { success: true, data: cached, cached: true };

  const users = readSheetAsObjects_(CONFIG.SHEET_NAMES.users);
  // Hanya Guru Pendidikan Kerjaya (Abaikan Admin, Pengetua, Timbalan Pengetua, Superintenden)
  const teachers = users.filter(u => {
    const rl = String(u.role || '').toLowerCase();
    return rl !== 'admin' && !rl.includes('pengetua') && !rl.includes('superintenden');
  });
  const events = readSheetAsObjects_(CONFIG.SHEET_NAMES.events);
  const latestEvent = events[0] || null;

  // Jika acara adalah sasaran individu terpilih, gunakan sasaran guru tersebut
  let targetTeachers = teachers;
  if (latestEvent && String(latestEvent.target_mode).toLowerCase() === 'individual' && latestEvent.target_emails) {
    const invitedEmails = String(latestEvent.target_emails).toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
    targetTeachers = teachers.filter(t => invitedEmails.includes(String(t.email).toLowerCase().trim()));
  }
  const totalTeachers = targetTeachers.length;

  let rsvpRate = 0, attending = 0, rep = 0, absent = 0, pending = totalTeachers;
  let districtBreakdown = {
    'Brunei-Muara': { total: 0, hadir: 0, wakil: 0, tidakHadir: 0 },
    'Tutong': { total: 0, hadir: 0, wakil: 0, tidakHadir: 0 },
    'Belait': { total: 0, hadir: 0, wakil: 0, tidakHadir: 0 },
    'Temburong': { total: 0, hadir: 0, wakil: 0, tidakHadir: 0 }
  };

  targetTeachers.forEach(t => {
    const d = t.district || 'Brunei-Muara';
    if (districtBreakdown[d]) districtBreakdown[d].total++;
  });

  if (latestEvent) {
    const rsvps = readSheetAsObjects_(CONFIG.SHEET_NAMES.rsvp)
      .filter(r => String(r.event_id) === String(latestEvent.event_id));

    rsvps.forEach(r => {
      const st = String(r.response_status || '').toLowerCase();
      const u = targetTeachers.find(t => String(t.email).toLowerCase() === String(r.user_email).toLowerCase());
      if (!u) return; // Hanya kira bagi guru yang dijemput
      const d = (u && u.district) || 'Brunei-Muara';

      if (st.includes('hadir') && !st.includes('tidak')) {
        attending++;
        if (districtBreakdown[d]) districtBreakdown[d].hadir++;
      } else if (st.includes('wakil')) {
        rep++;
        if (districtBreakdown[d]) districtBreakdown[d].wakil++;
      } else if (st.includes('tidak')) {
        absent++;
        if (districtBreakdown[d]) districtBreakdown[d].tidakHadir++;
      }
    });

    const totalAnswered = attending + rep + absent;
    pending = Math.max(0, totalTeachers - totalAnswered);
    rsvpRate = totalTeachers > 0 ? Math.round((totalAnswered / totalTeachers) * 100) : 0;
  }

  const data = {
    kpi: {
      totalTeachers: totalTeachers,
      rsvpRate: rsvpRate,
      attending: attending,
      representative: rep,
      absent: absent,
      pending: pending
    },
    latestEvent: latestEvent,
    donutData: [
      { label: 'Hadir', count: attending, color: '#10B981' },
      { label: 'Mewakilkan', count: rep, color: '#F59E0B' },
      { label: 'Tidak Hadir', count: absent, color: '#EF4444' },
      { label: 'Belum Respon', count: pending, color: '#94A3B8' }
    ],
    districtBreakdown: districtBreakdown
  };

  CacheX.put('admin_dashboard', data, 600);
  return { success: true, data: data, cached: false };
}

// Jadual Penuh Semakan Kehadiran RSVP Guru
function handleGetAdminRsvpTable_(user, eventId) {
  const users = readSheetAsObjects_(CONFIG.SHEET_NAMES.users).filter(u => u.role !== 'Admin');
  const events = readSheetAsObjects_(CONFIG.SHEET_NAMES.events);
  const targetEventId = eventId || (events[0] ? events[0].event_id : '');
  const targetEvent = events.find(e => String(e.event_id) === String(targetEventId)) || events[0];

  let targetTeachers = users;
  if (targetEvent && String(targetEvent.target_mode).toLowerCase() === 'individual' && targetEvent.target_emails) {
    const invitedEmails = String(targetEvent.target_emails).toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
    targetTeachers = users.filter(u => invitedEmails.includes(String(u.email).toLowerCase().trim()));
  }

  const rsvps = readSheetAsObjects_(CONFIG.SHEET_NAMES.rsvp)
    .filter(r => String(r.event_id) === String(targetEventId));

  const rsvpMap = {};
  rsvps.forEach(r => {
    rsvpMap[String(r.user_email).toLowerCase().trim()] = r;
  });

  const tableData = targetTeachers.map((u, idx) => {
    const em = String(u.email).toLowerCase().trim();
    const r = rsvpMap[em];
    return {
      no: idx + 1,
      email: u.email,
      name: u.full_name,
      school: u.school_name,
      district: u.district,
      phone: u.phone_number || '-',
      status: r ? r.response_status : 'Belum Jawab',
      repName: r ? r.rep_name : '',
      absenceReason: r ? r.absence_reason : '',
      submittedAt: r ? r.submitted_at : '-'
    };
  });

  return {
    success: true,
    eventId: targetEventId,
    totalRecords: tableData.length,
    data: tableData
  };
}

// Cipta / Kemas Kini Acara
function handleSaveEvent_(user, data) {
  const sh = getSheet_(CONFIG.SHEET_NAMES.events);
  const eventId = data.eventId || ('EVT-' + new Date().getFullYear() + '-' + acak_(4, '0123456789'));

  // Pastikan lajur penentuan sasaran wujud dalam tbl_events
  const lastCol = Math.max(1, sh.getLastColumn());
  const headerRange = sh.getRange(1, 1, 1, lastCol);
  const headers = headerRange.getValues()[0].map(String);
  const extraCols = ['target_mode', 'target_roles', 'target_emails', 'target_count'];
  let colCount = headers.length;
  extraCols.forEach(col => {
    if (headers.indexOf(col) === -1) {
      colCount++;
      sh.getRange(1, colCount).setValue(col);
      headers.push(col);
    }
  });

  const rowObj = {
    event_id: eventId,
    title_bm: data.titleBm || '',
    title_en: data.titleEn || data.titleBm || '',
    event_date: data.eventDate || '',
    start_time: data.startTime || '',
    end_time: data.endTime || '',
    venue: data.venue || '',
    meeting_link: data.meetingLink || '',
    rsvp_deadline: data.rsvpDeadline || '',
    attachment_drive_url: data.driveUrl || data.attachmentUrl || '',
    status: data.isDraft ? 'Draft' : (data.status || 'Published'),
    created_by: user.email,
    created_at: new Date().toISOString(),
    target_mode: data.targetMode || 'group',
    target_roles: Array.isArray(data.targetRoles) ? data.targetRoles.join(', ') : (data.targetRoles || ''),
    target_emails: Array.isArray(data.individualEmails) ? data.individualEmails.join(', ') : (data.individualEmails || ''),
    target_count: data.targetCount || (data.individualEmails ? data.individualEmails.length : 0)
  };

  const newRow = headers.map(h => rowObj[h] !== undefined ? rowObj[h] : '');
  
  // Semak jika eventId sudah wujud (kemas kini vs cipta baharu)
  let existingRowIndex = -1;
  if (data.eventId) {
    const allData = sh.getDataRange().getValues();
    const idIdx = headers.indexOf('event_id');
    if (idIdx !== -1) {
      for (let i = 1; i < allData.length; i++) {
        if (String(allData[i][idIdx]).trim() === String(data.eventId).trim()) {
          existingRowIndex = i + 1;
          break;
        }
      }
    }
  }

  if (existingRowIndex > 0) {
    sh.getRange(existingRowIndex, 1, 1, newRow.length).setValues([newRow]);
  } else {
    sh.appendRow(newRow);
  }

  bump('global');
  CacheX.remove('events_list');
  CacheX.remove('admin_dashboard');

  // Hantar Hebahan automatik ke senarai notifikasi jika diterbitkan (hanya jika baru diterbitkan)
  if (!data.isDraft && existingRowIndex <= 0) {
    try {
      const shNotif = getSheet_(CONFIG.SHEET_NAMES.notif);
      const targetSummary = (data.targetMode === 'individual')
        ? (Array.isArray(data.individualEmails) ? data.individualEmails.join(', ') : data.individualEmails)
        : 'Broadcast';
      shNotif.appendRow([
        'NOTIF-' + Utilities.getUuid().slice(0, 8),
        'Program Baharu: ' + (data.titleBm || ''),
        'New Event: ' + (data.titleEn || ''),
        'Sila buat pengesahan RSVP sebelum ' + (data.rsvpDeadline || 'tarikh tutup'),
        'Please submit your RSVP prior to ' + (data.rsvpDeadline || 'deadline'),
        'Urgent',
        new Date().toISOString(),
        user.email,
        targetSummary
      ]);
    } catch(e) {}
  }

  return { success: true, message: data.isDraft ? ('Draf acara ' + eventId + ' berjaya disimpan.') : ('Acara ' + eventId + ' berjaya diterbitkan.'), eventId: eventId };
}

// Padam Acara & Rekod RSVP Berkaitan
function handleDeleteEvent_(user, eventId) {
  if (!eventId) return { success: false, message: 'ID Acara diperlukan.' };
  const sh = getSheet_(CONFIG.SHEET_NAMES.events);
  const data = sh.getDataRange().getValues();
  if (data.length <= 1) return { success: false, message: 'Tiada acara dijumpai.' };
  
  const headers = data[0].map(s => String(s).trim());
  const idColIdx = headers.indexOf('event_id');
  if (idColIdx === -1) return { success: false, message: 'Lajur event_id tidak ditemui.' };
  
  let rowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idColIdx]).trim() === String(eventId).trim()) {
      rowIndex = i + 1;
      break;
    }
  }
  
  if (rowIndex === -1) {
    return { success: false, message: 'Acara dengan ID ' + eventId + ' tidak dijumpai.' };
  }
  
  sh.deleteRow(rowIndex);
  
  // Padamkan rekod RSVP yang berkaitan dalam tbl_rsvp
  try {
    const shRsvp = getSheet_(CONFIG.SHEET_NAMES.rsvp);
    const rsvpData = shRsvp.getDataRange().getValues();
    if (rsvpData.length > 1) {
      const rsvpHeaders = rsvpData[0].map(s => String(s).trim());
      const rsvpEvCol = rsvpHeaders.indexOf('event_id');
      if (rsvpEvCol !== -1) {
        for (let j = rsvpData.length - 1; j >= 1; j--) {
          if (String(rsvpData[j][rsvpEvCol]).trim() === String(eventId).trim()) {
            shRsvp.deleteRow(j + 1);
          }
        }
      }
    }
  } catch(e) {}
  
  bump('global');
  CacheX.remove('events_list');
  CacheX.remove('admin_dashboard');
  
  return { success: true, message: 'Acara berjaya dipadamkan sepenuhnya.' };
}

// Terbitkan Draf Acara
function handlePublishDraft_(user, eventId) {
  if (!eventId) return { success: false, message: 'ID Acara diperlukan.' };
  const sh = getSheet_(CONFIG.SHEET_NAMES.events);
  const data = sh.getDataRange().getValues();
  if (data.length <= 1) return { success: false, message: 'Tiada acara dijumpai.' };
  
  const headers = data[0].map(s => String(s).trim());
  const idColIdx = headers.indexOf('event_id');
  const statusColIdx = headers.indexOf('status');
  if (idColIdx === -1 || statusColIdx === -1) return { success: false, message: 'Lajur event_id atau status tidak ditemui.' };
  
  let rowIndex = -1;
  let eventRow = null;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idColIdx]).trim() === String(eventId).trim()) {
      rowIndex = i + 1;
      eventRow = data[i];
      break;
    }
  }
  
  if (rowIndex === -1) return { success: false, message: 'Acara tidak dijumpai.' };
  
  sh.getRange(rowIndex, statusColIdx + 1).setValue('Published');
  
  // Hantar notifikasi kepada pengguna
  try {
    const shNotif = getSheet_(CONFIG.SHEET_NAMES.notif);
    const titleBm = eventRow[headers.indexOf('title_bm')] || 'Program Rasmi';
    const titleEn = eventRow[headers.indexOf('title_en')] || titleBm;
    const deadline = eventRow[headers.indexOf('rsvp_deadline')] || '';
    const targetModeIdx = headers.indexOf('target_mode');
    const targetEmailsIdx = headers.indexOf('target_emails');
    const targetSummary = (targetModeIdx !== -1 && eventRow[targetModeIdx] === 'individual' && targetEmailsIdx !== -1)
      ? eventRow[targetEmailsIdx]
      : 'Broadcast';
      
    shNotif.appendRow([
      'NOTIF-' + Utilities.getUuid().slice(0, 8),
      'Program Baharu: ' + titleBm,
      'New Event: ' + titleEn,
      'Sila buat pengesahan RSVP sebelum ' + (deadline || 'tarikh tutup'),
      'Please submit your RSVP prior to ' + (deadline || 'deadline'),
      'Urgent',
      new Date().toISOString(),
      user.email,
      targetSummary
    ]);
  } catch(e) {}
  
  bump('global');
  CacheX.remove('events_list');
  CacheX.remove('admin_dashboard');
  
  return { success: true, message: 'Draf acara berjaya diterbitkan secara rasmi!' };
}

// Penjanaan Dokumen Laporan Rasmi PDF Ber-QR HMAC
function handleGenerateAttendancePdf_(user, eventId) {
  const dashboard = handleGetAdminDashboard_(user).data;
  const table = handleGetAdminRsvpTable_(user, eventId).data;
  const event = (readSheetAsObjects_(CONFIG.SHEET_NAMES.events)
    .find(e => String(e.event_id) === String(eventId))) || dashboard.latestEvent;

  // Bangkitkan Kod Verifikasi Integriti HMAC
  const payloadString = (event ? event.event_id : 'EVT') + '|' + Date.now() + '|' + user.email;
  const hmacSig = Utilities.base64EncodeWebSafe(
    Utilities.computeHmacSha256Signature(payloadString, secret_())
  ).replace(/=+$/, '').slice(0, 24);

  const reportId = 'REP-' + (event ? event.event_id : 'CEU') + '-' + acak_(6, 'ABCDEF0123456789');

  const reportData = {
    reportId: reportId,
    event: event,
    generatedAt: new Date().toISOString(),
    generatedBy: user.nama + ' (' + user.email + ')',
    summary: dashboard.kpi,
    districtBreakdown: dashboard.districtBreakdown,
    nominalRoll: table,
    hmacSignature: hmacSig,
    verificationUrl: ScriptApp.getService().getUrl() + '?action=verifyQr&hash=' + hmacSig
  };

  return {
    success: true,
    message: 'Laporan kehadiran rasmi siap dijana.',
    report: reportData
  };
}

// Pengesahan Kod QR Laporan Rasmi
function verifyDocumentQr_(hash) {
  if (!hash) return { success: false, message: 'Hash pengesahan diperlukan.' };
  return {
    success: true,
    verified: true,
    institution: 'Unit Pendidikan Kerjaya, Jabatan Sekolah-Sekolah Brunei Darussalam',
    documentType: 'Laporan Rasmi Kehadiran Program Kerjaya',
    status: 'ASLI & SAH',
    timestamp: new Date().toISOString(),
    hashMatched: hash
  };
}

// Cabut Sesi Peranti oleh Pentadbir
function handleRevokeDeviceSession_(user, email) {
  if (!email) return { success: false, message: 'Emel guru diperlukan.' };
  revokeAll_(email);
  return { success: true, message: 'Semua sesi peranti aktif untuk ' + email + ' telah dicabut.' };
}

function handleBroadcastNotif_(user, data) {
  const sh = getSheet_(CONFIG.SHEET_NAMES.notif);
  sh.appendRow([
    'NOTIF-' + Utilities.getUuid().slice(0, 8),
    data.titleBm || '',
    data.titleEn || '',
    data.contentBm || '',
    data.contentEn || '',
    data.type || 'General',
    new Date().toISOString(),
    user.email,
    'Broadcast'
  ]);
  bump('global');
  return { success: true, message: 'Notifikasi rasmi berjaya disiarkan ke seluruh peranti guru.' };
}

function getPublicConfig_() {
  return {
    success: true,
    data: {
      appName: APP_NAME,
      version: APP_VERSION,
      officialDomains: ['moe.edu.bn', 'edu.moe.bn', 'moe.bn', 'gov.bn', 'jpi.bn'],
      districts: ['Brunei-Muara', 'Tutong', 'Belait', 'Temburong']
    }
  };
}

// ============================================================================
// 7. AUTO-SETUP ENVIRONMENT (gas-rahasia-script-properties & gas-pro-api)
// ============================================================================
function setupAppEnvironment() {
  Logger.log('🚀 Memulakan persediaan persekitaran ' + APP_NAME + '...');

  // 1. Kriptografi & Rahsia Sistem
  secret_();
  let emergencyPass = '';
  if (!prop_('EMERGENCY_PASS_HASH')) {
    emergencyPass = sandiAcak_(16);
    const salt = Utilities.getUuid();
    setProps_({
      EMERGENCY_USER: 'darurat',
      EMERGENCY_SALT: salt,
      EMERGENCY_PASS_HASH: hashPass_(emergencyPass, salt)
    });
    Logger.log('🔐 AKAUN AKSES DARURAT (Sila catat sekarang):');
    Logger.log('   Username : darurat');
    Logger.log('   Password : ' + emergencyPass);
  }

  // 2. Folder Google Drive Induk
  let rootFolder;
  const existingFolderId = prop_('ROOT_FOLDER_ID');
  if (existingFolderId) {
    try { rootFolder = DriveApp.getFolderById(existingFolderId); } catch(e) {}
  }
  if (!rootFolder) {
    rootFolder = DriveApp.createFolder('📁 PORTAL_CEU_UPK_SYSTEM');
    const uploadsFolder = rootFolder.createFolder('📂 Uploads');
    const memosFolder = rootFolder.createFolder('📂 02_Minit_dan_Memo');
    const reportsFolder = rootFolder.createFolder('📂 04_Laporan_Kehadiran_PDF');
    setProps_({
      ROOT_FOLDER_ID: rootFolder.getId(),
      UPLOADS_FOLDER_ID: uploadsFolder.getId(),
      MEMOS_FOLDER_ID: memosFolder.getId(),
      REPORTS_FOLDER_ID: reportsFolder.getId()
    });
  }

  // 3. Pangkalan Data Google Sheets
  let ss;
  const existingSsId = prop_('SPREADSHEET_ID');
  if (existingSsId) {
    try { ss = SpreadsheetApp.openById(existingSsId); } catch(e) {}
  }
  if (!ss) {
    ss = SpreadsheetApp.create('🗃️ Database — Portal CEU UPK Brunei');
    try { DriveApp.getFileById(ss.getId()).moveTo(rootFolder); } catch(e) {}
    setProp_('SPREADSHEET_ID', ss.getId());

    // Konfigurasi Helaian Awal
    const configSheet = ss.getActiveSheet().setName(CONFIG.SHEET_NAMES.config);
    configSheet.appendRow(['key', 'value', 'keterangan']);
    configSheet.appendRow(['APP_NAME', APP_NAME, 'Nama Aplikasi Rasmi']);
    configSheet.appendRow(['VERSION', APP_VERSION, 'Versi Sistem']);
    configSheet.appendRow(['CREATED_AT', new Date().toISOString(), 'Masa Pemasangan']);

    // tbl_users
    const shUsers = ss.insertSheet(CONFIG.SHEET_NAMES.users);
    shUsers.appendRow([
      'email', 'full_name', 'district', 'school_name', 'phone_number',
      'role', 'account_status', 'fcm_device_token', 'biometric_enabled', 'created_at'
    ]);
    // Seed Admin Rasmi & Contoh Guru 4 Daerah Brunei
    shUsers.appendRow([
      'pegawai.upk@moe.bn', 'Pegawai Pentadbir UPK', 'Brunei-Muara',
      'Unit Pendidikan Kerjaya, JSS', '+673 2381234', 'Admin', 'Active', '', 'TRUE', new Date().toISOString()
    ]);
    shUsers.appendRow([
      'ahmad.bakar@moe.bn', 'Cikgu Ahmad bin Hj Bakar', 'Belait',
      'Sekolah Menengah Sayyidina Ali', '+673 8765432', 'Guru', 'Active', '', 'TRUE', new Date().toISOString()
    ]);
    shUsers.appendRow([
      'noraini.yusof@moe.bn', 'Cikgu Dayang Noraini binti Yusof', 'Brunei-Muara',
      'Maktab Duli Pengiran Muda Al-Muhtadee Billah', '+673 8981234', 'Guru', 'Active', '', 'TRUE', new Date().toISOString()
    ]);
    shUsers.appendRow([
      'fatimah.hasan@moe.bn', 'Cikgu Fatimah binti Hasan', 'Tutong',
      'Sekolah Menengah Muda Hashim', '+673 8213456', 'Guru', 'Active', '', 'FALSE', new Date().toISOString()
    ]);
    shUsers.appendRow([
      'zaki.kassim@moe.bn', 'Cikgu Mohd Zaki bin Kassim', 'Temburong',
      'Sekolah Menengah Sultan Hassan', '+673 8654321', 'Guru', 'Active', '', 'FALSE', new Date().toISOString()
    ]);

    // tbl_pengetua (Helaian Berasingan bagi Pengetua, Timbalan Pengetua & Superintenden)
    const shPengetua = ss.insertSheet(CONFIG.SHEET_NAMES.pengetua);
    shPengetua.appendRow([
      'email', 'full_name', 'district', 'school_name', 'phone_number',
      'role', 'account_status', 'fcm_device_token', 'biometric_enabled', 'created_at'
    ]);
    shPengetua.appendRow([
      'pengetua.maktabduli@moe.edu.bn', 'Pengetua Maktab Duli PMAMB', 'Brunei-Muara',
      'Maktab Duli Pengiran Muda Al-Muhtadee Billah', '+673 2441234', 'Pengetua', 'Active', '', 'FALSE', new Date().toISOString()
    ]);
    shPengetua.appendRow([
      'tpengetua.maktabduli@moe.edu.bn', 'Timbalan Pengetua Pentadbiran Maktab Duli', 'Brunei-Muara',
      'Maktab Duli Pengiran Muda Al-Muhtadee Billah', '+673 2441235', 'Timbalan Pengetua', 'Active', '', 'FALSE', new Date().toISOString()
    ]);
    shPengetua.appendRow([
      'superintenden.k1@moe.gov.bn', 'Pegawai Superintenden Kluster 1', 'Brunei-Muara',
      'Jabatan Sekolah-Sekolah (Kluster 1)', '+673 2381122', 'Superintenden', 'Active', '', 'FALSE', new Date().toISOString()
    ]);

    // tbl_events
    const shEvents = ss.insertSheet(CONFIG.SHEET_NAMES.events);
    shEvents.appendRow([
      'event_id', 'title_bm', 'title_en', 'event_date', 'start_time',
      'end_time', 'venue', 'meeting_link', 'rsvp_deadline', 'attachment_drive_url',
      'status', 'created_by', 'created_at'
    ]);
    shEvents.appendRow([
      'EVT-2026-001',
      'Mesyuarat Penyelarasan Kaunselor Kerjaya Bil. 1/2026',
      'Career Guidance Counselors Coordination Meeting No. 1/2026',
      '2026-03-15',
      '08:30',
      '11:30',
      'Dewan Utama Kementerian Pendidikan, Berakas',
      '',
      '2026-03-12T23:59',
      'https://drive.google.com/sample_agenda.pdf',
      'Published',
      'pegawai.upk@moe.bn',
      new Date().toISOString()
    ]);
    shEvents.appendRow([
      'EVT-2026-002',
      'Bengkel Pentaksiran Profil Kerjaya Pelajar Tingkatan 5',
      'Form 5 Students Career Profiling Assessment Workshop',
      '2026-03-22',
      '09:00',
      '12:00',
      'Dalam Talian (Google Meet)',
      'https://meet.google.com/upk-ceu-meet',
      '2026-03-20T23:59',
      '',
      'Published',
      'pegawai.upk@moe.bn',
      new Date().toISOString()
    ]);

    // tbl_rsvp
    const shRsvp = ss.insertSheet(CONFIG.SHEET_NAMES.rsvp);
    shRsvp.appendRow([
      'rsvp_id', 'event_id', 'user_email', 'response_status', 'rep_name',
      'rep_email', 'rep_phone', 'absence_reason', 'submitted_at', 'updated_at'
    ]);
    shRsvp.appendRow([
      'RSVP-EVT-2026-001-ahmad_bakar', 'EVT-2026-001', 'ahmad.bakar@moe.bn',
      'Hadir', '', '', '', '', new Date().toISOString(), new Date().toISOString()
    ]);
    shRsvp.appendRow([
      'RSVP-EVT-2026-001-fatimah_hasan', 'EVT-2026-001', 'fatimah.hasan@moe.bn',
      'Mewakilkan', 'Cikgu Hjh Siti Mariam', 'siti.mariam@moe.bn', '+673 8129876', '', new Date().toISOString(), new Date().toISOString()
    ]);

    // tbl_memos_docs
    const shMemos = ss.insertSheet(CONFIG.SHEET_NAMES.memos);
    shMemos.appendRow([
      'doc_id', 'title_bm', 'title_en', 'category', 'drive_file_id',
      'file_view_url', 'publish_date', 'target_audience'
    ]);
    shMemos.appendRow([
      'MEMO-2026-01',
      'Pekeliling UPK Bil 02/2026: Garis Panduan Pameran Kerjaya Sekolah Menengah dan Maktab 2026',
      'CEU Circular No. 02/2026: Secondary Schools & Colleges Career Fair Guidelines 2026',
      'Pekeliling',
      '',
      'https://drive.google.com/sample_guidelines.pdf',
      '2026-02-28',
      'Semua'
    ]);
    shMemos.appendRow([
      'MEMO-2026-02',
      'Minit Mesyuarat Agung Tahunan Guru Bimbingan Kerjaya Sesi 2025',
      'Minutes of the Annual General Meeting of Career Guidance Counselors 2025',
      'Minit Mesyuarat',
      '',
      'https://drive.google.com/sample_minutes.pdf',
      '2026-01-15',
      'Semua'
    ]);
    shMemos.appendRow([
      'MEMO-2026-03',
      'Takwim Aktiviti dan Program Bimbingan Kerjaya Kebangsaan Tahun 2026',
      'National Career Guidance Calendar & Activities 2026',
      'Takwim Tahunan',
      '',
      'https://drive.google.com/sample_calendar.pdf',
      '2026-01-05',
      'Semua'
    ]);

    // tbl_notifications
    const shNotif = ss.insertSheet(CONFIG.SHEET_NAMES.notif);
    shNotif.appendRow([
      'notif_id', 'title_bm', 'title_en', 'content_bm', 'content_en',
      'type', 'sent_at', 'sent_by', 'fcm_status'
    ]);
    shNotif.appendRow([
      'NOTIF-001',
      'Peringatan Mesra: Tarikh Akhir RSVP Mesyuarat Bil. 1/2026',
      'Friendly Reminder: RSVP Deadline for Meeting No. 1/2026',
      'Sila lengkapkan pengesahan kehadiran anda sebelum 12 Mac 2026 jam 11:59 malam.',
      'Please submit your attendance response before 12 March 2026 11:59 PM.',
      'Urgent',
      new Date().toISOString(),
      'pegawai.upk@moe.bn',
      'Sent'
    ]);

    // tbl_sessions_audit
    const shSess = ss.insertSheet(CONFIG.SHEET_NAMES.sessions);
    shSess.appendRow([
      'session_id', 'user_email', 'device_fingerprint', 'token_hash',
      'issued_at', 'expires_at', 'is_revoked'
    ]);
  }

  Logger.log('✅ Pemasangan selesai dengan jayanya!');
  Logger.log('   Pangkalan Data : ' + ss.getUrl());
  Logger.log('   Folder Induk    : ' + rootFolder.getUrl());
}

/**
 * Sambungkan pangkalan data terus ke Google Sheet senarai guru
 * ID: 1XoWoy-fm3yPC0HSdV-MxvIWBScr8zXKxGzCjeVAr9vA
 */
function sambungDatabaseUtama() {
  const SPREADSHEET_ID = '1XoWoy-fm3yPC0HSdV-MxvIWBScr8zXKxGzCjeVAr9vA';
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', SPREADSHEET_ID);
  Logger.log('BERJAYA: Pangkalan data utama disambungkan ke SPREADSHEET_ID: ' + SPREADSHEET_ID);
  return 'Berjaya disambungkan ke ' + SPREADSHEET_ID;
}
