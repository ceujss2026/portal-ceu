/**
 * ============================================================================
 * MODUL MIGRASI & SINKRONISASI DATABASE (gas-migrasi-database)
 * Pindahan Data Antar-Spreadsheet Tanpa Menyentuh Spreadsheet Sumber
 * Idempoten, Dry-run (Pindai Dahulu), & Padanan Berdasarkan Nama Header
 * ============================================================================
 */

/**
 * Membuka spreadsheet sumber secara baca-sahaja
 */
function openSourceSs_(idOrUrl) {
  const m = String(idOrUrl).match(/\/d\/([A-Za-z0-9_-]{20,})/);
  const id = m ? m[1] : String(idOrUrl).trim();
  const currentId = prop_('SPREADSHEET_ID');

  if (id === currentId) {
    throw new Error('ID yang dimasukkan ialah spreadsheet semasa. Sila masukkan ID spreadsheet lama.');
  }

  try {
    return SpreadsheetApp.openById(id);
  } catch (e) {
    throw new Error('Spreadsheet sumber tidak dapat dibuka. Pastikan ID betul dan berada di akaun Google yang sama.');
  }
}

/**
 * Membaca data daripada spreadsheet sumber mengikut nama header
 */
function readSourceSheet_(ss, sheetName) {
  const sh = ss.getSheetByName(sheetName);
  if (!sh) return null;
  const vals = sh.getDataRange().getValues();
  if (vals.length <= 1) return [];

  const headers = vals[0].map(String);
  return vals.slice(1).filter(r => r.join('').trim() !== '').map(row => {
    const obj = {};
    headers.forEach((h, i) => { if (h) obj[h] = row[i]; });
    return obj;
  });
}

/**
 * Pengendali Migrasi Data (Boleh mod Dry-Run atau Tulis Sebenar)
 */
function handleRunDataMigration_(data) {
  const sourceId = data.sourceSpreadsheetId;
  const sheetType = data.sheetType || 'Events'; // Events | RSVP_Logistik | Agensi_Users
  const dryRun = data.dryRun !== false; // Default: mode dry-run selamat

  if (!sourceId) {
    return { success: false, message: 'Sila masukkan ID atau URL spreadsheet sumber.' };
  }

  const srcSs = openSourceSs_(sourceId);
  const srcRows = readSourceSheet_(srcSs, sheetType);

  if (!srcRows) {
    return { success: false, message: 'Sheet "' + sheetType + '" tidak ditemui dalam spreadsheet sumber.' };
  }

  // Pelan migrasi mengikut jenis sheet
  let keyField = 'Event_ID';
  let updatable = [];

  if (sheetType === 'Events') {
    keyField = 'Event_ID';
    updatable = ['Nama_Acara', 'Tarikh_Mula', 'Tarikh_Tamat', 'Masa', 'Tempat_Venue', 'Pautan_GPS_Maps', 'Panduan_Parking', 'Catatan_Khas'];
  } else if (sheetType === 'RSVP_Logistik') {
    keyField = 'RSVP_ID';
    updatable = ['Status_RSVP', 'Bil_Meja', 'Bil_Kerusi', 'Bil_Plug', 'Jumlah_Wakil', 'Nama_Wakil_Hadir', 'Keperluan_Lain'];
  } else if (sheetType === 'Agensi_Users') {
    keyField = 'Agensi_ID';
    updatable = ['Nama_Agensi', 'Kategori', 'Emel_Rasmi', 'No_Telefon_Agensi', 'Status_Akaun'];
  }

  const plan = {
    target: sheetType,
    rows: srcRows,
    key: o => String(o[keyField] || '').trim(),
    updatable: updatable
  };

  const hasil = executeUpsertPlan_(plan, dryRun);

  return {
    success: true,
    dryRun: dryRun,
    sheet: sheetType,
    totalSumber: srcRows.length,
    hasil: hasil,
    message: dryRun
      ? 'Pindai Dry-Run berjaya: ' + hasil.inserted + ' rekod baharu, ' + hasil.updated + ' dikemaskini, ' + hasil.skipped + ' dilangkau.'
      : 'Migrasi sebenar selesai: ' + hasil.inserted + ' rekod berjaya ditambah, ' + hasil.updated + ' dikemaskini.'
  };
}

/**
 * Enjin Upsert Idempoten Batch di Memori
 */
function executeUpsertPlan_(plan, dryRun) {
  const sh = getSheet_(plan.target);
  const vals = sh.getDataRange().getValues();
  const headers = vals[0].map(String);
  const index = {};

  for (let r = 1; r < vals.length; r++) {
    const o = {};
    headers.forEach((h, i) => o[h] = vals[r][i]);
    const k = plan.key(o);
    if (k) index[k] = r;
  }

  const res = { inserted: 0, updated: 0, skipped: 0 };
  const newRows = [];
  const seen = {};

  plan.rows.forEach(src => {
    const k = plan.key(src);
    if (!k || seen[k]) { res.skipped++; return; }
    seen[k] = true;

    if (index[k] !== undefined) {
      const row = vals[index[k]];
      let changed = false;
      (plan.updatable || []).forEach(f => {
        const i = headers.indexOf(f);
        if (i === -1 || src[f] === undefined || src[f] === '') return;
        const v = src[f];
        if (String(row[i]) !== String(v)) {
          row[i] = v;
          changed = true;
        }
      });
      changed ? res.updated++ : res.skipped++;
    } else {
      newRows.push(headers.map(f => (src[f] !== undefined ? src[f] : '')));
      res.inserted++;
    }
  });

  if (!dryRun && (res.updated || newRows.length)) {
    const all = vals.concat(newRows);
    sh.getRange(1, 1, all.length, headers.length).setValues(all);
    bumpVersion_('events');
    bumpVersion_('agencies');
  }

  return res;
}
