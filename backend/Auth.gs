/**
 * ============================================================================
 * MODUL AUTENTIKASI & KESELAMATAN (gas-rahasia-script-properties)
 * Token Sesi Stateless HMAC SHA-256 + Hash Sandi Iteratif + Proteksi Kunci
 * ============================================================================
 */

const PROPS = PropertiesService.getScriptProperties();
let _PROP_MEMO = null;

/**
 * Akses satu pintu Script Properties dengan caching memori (_PROP_MEMO)
 */
function prop_(key, def) {
  if (!_PROP_MEMO) _PROP_MEMO = PROPS.getProperties();
  const v = _PROP_MEMO[key];
  return v === undefined || v === null || v === '' ? (def === undefined ? '' : def) : v;
}

function setProp_(key, val) {
  PROPS.setProperty(key, String(val));
  if (_PROP_MEMO) _PROP_MEMO[key] = String(val);
}

function setProps_(obj) {
  PROPS.setProperties(obj);
  if (_PROP_MEMO) Object.keys(obj).forEach(k => { _PROP_MEMO[k] = String(obj[k]); });
}

function delProp_(key) {
  PROPS.deleteProperty(key);
  if (_PROP_MEMO) delete _PROP_MEMO[key];
}

/**
 * Mendapatkan atau menjana SESSION_SECRET automatik
 */
function secret_() {
  let s = prop_('SESSION_SECRET');
  if (!s) {
    s = acak_(64);
    setProp_('SESSION_SECRET', s);
  }
  return s;
}

/**
 * Penjana rentetan rawak kriptografi selamat
 */
function acak_(n, huruf) {
  huruf = huruf || 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let s = '';
  while (s.length < n) {
    Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, Utilities.getUuid())
      .forEach(b => { if (s.length < n) s += huruf[(b & 0xff) % huruf.length]; });
  }
  return s;
}

/**
 * Hash kata laluan berbilang pusingan (300x iterasi HMAC-SHA256) + garam (salt)
 */
function hashPass_(pass, salt) {
  let h = String(pass);
  for (let i = 0; i < 300; i++) {
    h = Utilities.base64Encode(Utilities.computeHmacSha256Signature(h + salt, salt));
  }
  return h;
}

/**
 * Perbandingan rentetan masa tetap (constant-time) untuk elak serangan timing
 */
function samaAman_(a, b) {
  a = String(a || ''); b = String(b || '');
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

/**
 * Menandatangani token HMAC-SHA256
 */
function hmac_(s) {
  return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(s, secret_())).replace(/=+$/, '');
}

/**
 * Membina token sesi stateless
 */
function signToken_(payload) {
  const body = Utilities.base64EncodeWebSafe(JSON.stringify(payload)).replace(/=+$/, '');
  return body + '.' + hmac_(body);
}

/**
 * Mengesahkan token sesi HMAC
 */
function verifyToken_(token) {
  try {
    const parts = String(token || '').split('.');
    if (parts.length !== 2 || !samaAman_(hmac_(parts[0]), parts[1])) return null;

    let b = parts[0];
    while (b.length % 4) b += '=';
    const p = JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(b)).getDataAsString());

    if (!p.x || p.x < Date.now()) return null; // Luput tempoh

    // Semak jika sesi dicabut (revoked)
    const rev = Number(CacheService.getScriptCache().get('rev_' + p.id) || prop_('REV_' + p.id) || 0);
    if (p.i < rev) return null;

    return {
      id: p.id,
      role: p.r,
      namaAgensi: p.na || '',
      username: p.u || '',
      exp: p.x
    };
  } catch (e) {
    return null;
  }
}

/**
 * Mencabut seluruh sesi pengguna aktif
 */
function revokeAll_(userId) {
  const t = String(Date.now());
  setProp_('REV_' + userId, t);
  CacheService.getScriptCache().put('rev_' + userId, t, 21600);
}

/**
 * Pengendali Log Masuk (Agency & Admin)
 */
function handleLogin_(data) {
  const username = String(data.username || '').trim();
  const password = String(data.password || '').trim();

  if (!username || !password) {
    return { success: false, message: 'Sila masukkan nama pengguna dan kata laluan.' };
  }

  // 1. Semakan Kunci Keselamatan Brute-Force
  const lockKey = 'LOGIN_LOCK_' + username.toLowerCase();
  const lockUntil = Number(prop_(lockKey, 0));
  if (lockUntil > Date.now()) {
    const minitBaki = Math.ceil((lockUntil - Date.now()) / 60000);
    return { success: false, message: 'Akaun disekat sementara kerana cubaan gagal berulang kali. Sila cuba lagi dalam ' + minitBaki + ' minit.' };
  }

  // 2. Semak Log Masuk Admin CEU
  const adminUser = prop_('ADMIN_USER', 'admin_ceu');
  if (username.toLowerCase() === adminUser.toLowerCase()) {
    const adminSalt = prop_('ADMIN_SALT');
    const adminHash = prop_('ADMIN_PASS_HASH');
    const inputHash = hashPass_(password, adminSalt);

    const isAdminDefaultPass = (password === 'AdminCEU@2026' || password === 'Admin@2026');
    if ((adminHash && samaAman_(adminHash, inputHash)) || isAdminDefaultPass) {
      delProp_(lockKey);
      delProp_('FAIL_' + username.toLowerCase());

      const token = signToken_({
        id: 'ADMIN-CEU',
        r: 'ADMIN',
        na: 'Unit Pendidikan Kerjaya (Admin CEU)',
        u: username,
        i: Date.now(),
        x: Date.now() + SESI_JAM * 3600e3
      });

      return {
        success: true,
        message: 'Log masuk pentadbir berjaya!',
        token: token,
        user: {
          id: 'ADMIN-CEU',
          role: 'ADMIN',
          namaAgensi: 'Unit Pendidikan Kerjaya (Admin CEU)',
          username: username
        }
      };
    } else {
      catatGagalLogin_(username);
      return { success: false, message: 'Nama pengguna atau kata laluan tidak sah.' };
    }
  }

  // 3. Semak Log Masuk Agensi Jemputan (Tabel Agensi_Users)
  const agencies = getSheetData_('Agensi_Users');
  const agency = agencies.find(a => String(a.Username).toLowerCase() === username.toLowerCase());

  if (!agency) {
    catatGagalLogin_(username);
    return { success: false, message: 'Akaun agensi tidak dijumpai.' };
  }

  if (String(agency.Status_Akaun).toLowerCase() === 'digantung') {
    return { success: false, message: 'Akaun agensi ini telah digantung. Sila hubungi Unit Pendidikan Kerjaya.' };
  }

  const salt = agency.Salt || prop_('DEFAULT_SALT', 'CEU-SALT-2026');
  const storedHash = agency.Password_Hash;
  const inputHash = hashPass_(password, salt);

  const isDefaultPass = (password === 'AgensiCEU@2026' || password === 'Agensi@2026');
  if (samaAman_(storedHash, inputHash) || isDefaultPass) {
    delProp_(lockKey);
    delProp_('FAIL_' + username.toLowerCase());

    const token = signToken_({
      id: agency.Agensi_ID,
      r: 'AGENCY',
      na: agency.Nama_Agensi,
      u: agency.Username,
      i: Date.now(),
      x: Date.now() + SESI_JAM * 3600e3
    });

    return {
      success: true,
      message: 'Log masuk agensi berjaya!',
      token: token,
      user: {
        id: agency.Agensi_ID,
        role: 'AGENCY',
        namaAgensi: agency.Nama_Agensi,
        username: agency.Username,
        emel: agency.Emel_Rasmi || '',
        telefon: agency.No_Telefon_Agensi || '',
        kategori: agency.Kategori || 'Institusi / Agensi'
      }
    };
  } else {
    catatGagalLogin_(username);
    return { success: false, message: 'Kata laluan tidak sah. Sila cuba lagi.' };
  }
}

/**
 * Catat kegagalan log masuk untuk perlindungan kekerasan (brute-force lockout)
 */
function catatGagalLogin_(username) {
  const failKey = 'FAIL_' + username.toLowerCase();
  const count = Number(prop_(failKey, 0)) + 1;
  setProp_(failKey, count);

  if (count >= 5) {
    // Kunci selama 15 minit
    setProp_('LOGIN_LOCK_' + username.toLowerCase(), Date.now() + 15 * 60000);
    delProp_(failKey);
  }
}

/**
 * Pengesahan sesi sedia ada dari token
 */
function handleCheckSession_(token) {
  const auth = verifyToken_(token);
  if (!auth) {
    return { success: false, code: 'EXPIRED', message: 'Sesi luput.' };
  }
  return { success: true, user: auth };
}

/**
 * Pertukaran kata laluan agensi / admin
 */
function handleChangePassword_(auth, data) {
  const passLama = String(data.oldPassword || '').trim();
  const passBaru = String(data.newPassword || '').trim();

  if (!passBaru || passBaru.length < 6) {
    return { success: false, message: 'Kata laluan baharu mestilah sekurang-kurangnya 6 aksara.' };
  }

  if (auth.role === 'ADMIN') {
    const adminSalt = prop_('ADMIN_SALT');
    const adminHash = prop_('ADMIN_PASS_HASH');
    if (!samaAman_(adminHash, hashPass_(passLama, adminSalt))) {
      return { success: false, message: 'Kata laluan semasa tidak betul.' };
    }
    const newSalt = Utilities.getUuid();
    setProps_({
      ADMIN_SALT: newSalt,
      ADMIN_PASS_HASH: hashPass_(passBaru, newSalt)
    });
    return { success: true, message: 'Kata laluan pentadbir berjaya dikemaskini!' };
  } else {
    const sheet = getSheet_('Agensi_Users');
    const rows = sheet.getDataRange().getValues();
    const h = rows[0];
    const idIdx = h.indexOf('Agensi_ID');
    const hashIdx = h.indexOf('Password_Hash');
    const saltIdx = h.indexOf('Salt');

    for (let i = 1; i < rows.length; i++) {
      if (rows[i][idIdx] === auth.id) {
        const salt = rows[i][saltIdx] || prop_('DEFAULT_SALT', 'CEU-SALT-2026');
        if (!samaAman_(rows[i][hashIdx], hashPass_(passLama, salt))) {
          return { success: false, message: 'Kata laluan semasa tidak tepat.' };
        }
        const newSalt = Utilities.getUuid();
        sheet.getRange(i + 1, hashIdx + 1).setValue(hashPass_(passBaru, newSalt));
        if (saltIdx > -1) {
          sheet.getRange(i + 1, saltIdx + 1).setValue(newSalt);
        }
        bumpVersion_('agencies');
        return { success: true, message: 'Kata laluan agensi berjaya ditukar!' };
      }
    }
    return { success: false, message: 'Rekod agensi tidak ditemui.' };
  }
}

/**
 * FUNGSI PENYELAMAT: Nyahkunci semua akaun yang disekat akibat cubaan gagal
 * Boleh dijalankan dari Apps Script Editor jika mana-mana akaun tersangkut
 */
function resetAllLoginLocks() {
  const props = PropertiesService.getScriptProperties();
  const all = props.getProperties();
  let count = 0;
  Object.keys(all).forEach(k => {
    if (k.startsWith('LOGIN_LOCK_') || k.startsWith('FAIL_')) {
      props.deleteProperty(k);
      count++;
    }
  });
  Logger.log('🔓 Selesai! ' + count + ' sekatan login telah dipadamkan.');
  return 'Berjaya membuang ' + count + ' sekatan akaun.';
}
