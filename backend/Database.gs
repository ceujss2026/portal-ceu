/**
 * ============================================================================
 * MODUL PANGKALAN DATA & CACHEX (gas-scale-turbo + gas-pro-api)
 * Pembacaan Batch Berperforma Tinggi, Cache Ber-Chunking, & Invalidasi Terarah
 * ============================================================================
 */

/**
 * CacheX: Sistem Cache Google Apps Script dengan Pemecahan Chunk (Had 100 KB)
 */
const CacheX = {
  SZ: 50000, // Saiz selamat setiap partition (50 KB teks)

  c: function() {
    return CacheService.getScriptCache();
  },

  get: function(key) {
    try {
      const c = this.c();
      const head = c.get(key);
      if (head == null) return null;
      if (head.indexOf('__chunks:') !== 0) return JSON.parse(head);

      const n = +head.slice(9);
      const keys = [];
      for (let i = 0; i < n; i++) keys.push(key + '#' + i);
      const parts = c.getAll(keys);
      let s = '';
      for (let i = 0; i < n; i++) {
        if (parts[keys[i]] == null) return null;
        s += parts[keys[i]];
      }
      return JSON.parse(s);
    } catch (e) {
      return null;
    }
  },

  put: function(key, val, ttl) {
    try {
      ttl = ttl || 3600;
      const s = JSON.stringify(val);
      const c = this.c();
      if (s.length <= this.SZ) {
        c.put(key, s, ttl);
        return true;
      }
      const n = Math.ceil(s.length / this.SZ);
      if (n > 20) return false; // Elak data melebihi 1 MB di cache
      const m = {};
      for (let i = 0; i < n; i++) m[key + '#' + i] = s.substr(i * this.SZ, this.SZ);
      c.putAll(m, ttl);
      c.put(key, '__chunks:' + n, ttl);
      return true;
    } catch (e) {
      return false;
    }
  },

  remove: function(key) {
    try {
      const c = this.c();
      const head = c.get(key);
      if (head && head.indexOf('__chunks:') === 0) {
        const n = +head.slice(9);
        const keys = [key];
        for (let i = 0; i < n; i++) keys.push(key + '#' + i);
        c.removeAll(keys);
      } else {
        c.remove(key);
      }
    } catch (e) {}
  }
};

/**
 * Pengurusan Versi Cache Global & Mengikut Ruang Lingkup
 */
function getVersion_(scope) {
  return CacheService.getScriptCache().get('ver_' + scope) || prop_('VER_' + scope, '1');
}

function bumpVersion_(scope) {
  const v = String(Date.now());
  CacheService.getScriptCache().put('ver_' + scope, v, 21600);
  setProp_('VER_' + scope, v);
}

/**
 * Mengakses lembaran kerja Google Sheets berdasarkan ID dari Script Properties
 * Menyokong sandaran automatik ke getActiveSpreadsheet() jika skrip dipasang pada helaian
 */
function getSpreadsheet_() {
  let ssId = prop_('SPREADSHEET_ID');
  if (!ssId) {
    try {
      const active = SpreadsheetApp.getActiveSpreadsheet();
      if (active) {
        ssId = active.getId();
        setProp_('SPREADSHEET_ID', ssId);
        return active;
      }
    } catch (e) {}
    throw new Error('SPREADSHEET_ID belum disambungkan. Sila jalankan runInitialSetup() atau tetapkan SPREADSHEET_ID dalam Project Settings.');
  }
  return SpreadsheetApp.openById(ssId);
}

function getSheet_(name) {
  const ss = getSpreadsheet_();
  const sh = ss.getSheetByName(name);
  if (!sh) throw new Error('Sheet "' + name + '" tidak ditemui dalam Spreadsheet.');
  return sh;
}

/**
 * Pembacaan pantas satu lembaran menjadi tatasusunan objek JSON (Batch getValues)
 */
function getSheetData_(name) {
  const sh = getSheet_(name);
  const vals = sh.getDataRange().getValues();
  if (vals.length <= 1) return [];

  const headers = vals[0].map(String);
  const rows = [];

  for (let r = 1; r < vals.length; r++) {
    const row = vals[r];
    if (row.join('').trim() === '') continue; // Langkau baris kosong
    const obj = {};
    headers.forEach((h, i) => {
      if (h) {
        let v = row[i];
        if (v instanceof Date) {
          v = Utilities.formatDate(v, 'GMT+8', 'yyyy-MM-dd HH:mm:ss');
        }
        obj[h] = v;
      }
    });
    rows.push(obj);
  }

  return rows;
}

/**
 * Menulis penambahan baris secara pukal (1 panggilan setValues)
 */
function appendBatch_(name, objectsArray) {
  if (!objectsArray || !objectsArray.length) return;
  const sh = getSheet_(name);
  const vals = sh.getDataRange().getValues();
  const headers = vals[0].map(String);

  const newRows = objectsArray.map(obj => {
    return headers.map(h => (obj[h] !== undefined ? obj[h] : ''));
  });

  const startRow = sh.getLastRow() + 1;
  sh.getRange(startRow, 1, newRows.length, headers.length).setValues(newRows);
}

/**
 * Kemaskini data terpilih mengikut kekunci utama tanpa menimpa seluruh sheet
 */
function updateWhere_(sheetName, keyCol, patchesByKey) {
  const sh = getSheet_(sheetName);
  const vals = sh.getDataRange().getValues();
  const headers = vals[0].map(String);
  const keyIdx = headers.indexOf(keyCol);
  if (keyIdx === -1) throw new Error('Kolom kunci ' + keyCol + ' tiada dalam sheet ' + sheetName);

  let minRow = Infinity;
  let maxRow = -1;

  for (let r = 1; r < vals.length; r++) {
    const keyVal = String(vals[r][keyIdx]);
    const patch = patchesByKey[keyVal];
    if (patch) {
      Object.keys(patch).forEach(col => {
        const cIdx = headers.indexOf(col);
        if (cIdx > -1) {
          vals[r][cIdx] = patch[col];
        }
      });
      minRow = Math.min(minRow, r);
      maxRow = Math.max(maxRow, r);
    }
  }

  if (maxRow > -1) {
    const numRows = maxRow - minRow + 1;
    sh.getRange(minRow + 1, 1, numRows, headers.length).setValues(vals.slice(minRow, maxRow + 1));
  }
}

/**
 * Perekodan log aktiviti ringkas
 */
function queueLog_(kategori, aksi, butiran) {
  try {
    const sh = getSheet_('Aktiviti_Logs');
    sh.appendRow([
      Utilities.getUuid(),
      Utilities.formatDate(new Date(), 'GMT+8', 'yyyy-MM-dd HH:mm:ss'),
      kategori,
      aksi,
      butiran
    ]);
  } catch (e) {
    // Senyap bagi mengelakkan gangguan pada aliran utama
  }
}
