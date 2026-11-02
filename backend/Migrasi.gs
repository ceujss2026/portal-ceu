/**
 * ============================================================================
 * MODUL MIGRASI & SINKRONISASI DATABASE (gas-migrasi-database)
 * Portal CEU UPK — Kementerian Pendidikan Brunei Darussalam
 * 
 * Prinsip:
 * 1. Spreadsheet lama TIDAK DISENTUH (Read-only via openById).
 * 2. Pencocokan berasaskan nama header (bukan indeks lajur).
 * 3. Operasi Idempoten (Upsert tanpa risiko duplikasi baris).
 * 4. Mod Dry-Run (Simulasi kiraan sebelum tulis nyata).
 * 5. Batch manipulation in-memory (getValues & setValues sekali gus).
 * ============================================================================
 */

function openSourceSs_(idOrUrl) {
  const m = String(idOrUrl || '').match(/\/d\/([A-Za-z0-9_-]{20,})/);
  const id = m ? m[1] : String(idOrUrl || '').trim();
  const currentId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (id === currentId) {
    throw new Error('Spreadsheet yang dimasukkan adalah pangkalan data baharu. Sila masukkan ID spreadsheet LAMA.');
  }
  try {
    return SpreadsheetApp.openById(id);
  } catch (e) {
    throw new Error('Spreadsheet sumber tidak dapat dibuka. Pastikan ID betul dan berada di akaun Google yang sama.');
  }
}

function readSourceSheet_(ss, name) {
  const sh = ss.getSheetByName(name);
  if (!sh) return [];
  const v = sh.getDataRange().getValues();
  if (v.length <= 1) return [];
  const h = v[0].map(String).map(s => s.trim().toLowerCase());
  return v.slice(1).filter(r => r.join('') !== '').map(r => {
    const o = {};
    h.forEach((k, i) => { if (k) o[k] = r[i]; });
    return o;
  });
}

/**
 * Pelaksana Upsert Batch Idempoten
 */
function upsertBatchPlan_(plan, dryRun) {
  const targetSs = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID'));
  const sh = targetSs.getSheetByName(plan.target);
  if (!sh) throw new Error('Sheet sasaran ' + plan.target + ' tidak dijumpai.');

  const values = sh.getDataRange().getValues();
  const h = values[0].map(String);
  const hLower = h.map(s => s.trim().toLowerCase());
  const index = {};

  for (let r = 1; r < values.length; r++) {
    const o = {};
    h.forEach((k, i) => o[k] = values[r][i]);
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
      const row = values[index[k]];
      let changed = false;
      (plan.updatable || []).forEach(f => {
        const i = hLower.indexOf(f.toLowerCase());
        if (i === -1 || src[f.toLowerCase()] === undefined || src[f.toLowerCase()] === '') return;
        const v = src[f.toLowerCase()];
        if (String(row[i]) !== String(v)) {
          row[i] = v;
          changed = true;
        }
      });
      changed ? res.updated++ : res.skipped++;
    } else {
      newRows.push(h.map(col => {
        const val = src[col.toLowerCase()];
        return val !== undefined ? val : '';
      }));
      res.inserted++;
    }
  });

  if (!dryRun && (res.updated > 0 || newRows.length > 0)) {
    const all = values.concat(newRows);
    sh.getRange(1, 1, all.length, h.length).setValues(all);
  }

  return res;
}

/**
 * Fungsi Pengurus: Jalankan Migrasi Data Penuh
 * Contoh Panggilan: migrasikanDataLama_('SPREADSHEET_ID_LAMA', true); // dryRun = true
 */
function migrasikanDataLama_(oldSpreadsheetId, dryRun) {
  dryRun = (dryRun === undefined) ? true : !!dryRun;
  Logger.log('🚀 Memulakan proses migrasi (Dry-run: ' + dryRun + ')...');

  const srcSs = openSourceSs_(oldSpreadsheetId);
  const summary = {};

  // 1. Migrasi Pengguna (Guru & Pentadbir)
  const oldUsers = readSourceSheet_(srcSs, 'Users') || readSourceSheet_(srcSs, 'tbl_users');
  if (oldUsers.length) {
    summary.users = upsertBatchPlan_({
      target: 'tbl_users',
      key: function(o) { return String(o.email || o.e_mel || '').toLowerCase().trim(); },
      updatable: ['full_name', 'district', 'school_name', 'phone_number', 'account_status'],
      rows: oldUsers
    }, dryRun);
  }

  // 2. Migrasi Rekod RSVP
  const oldRsvps = readSourceSheet_(srcSs, 'RSVP') || readSourceSheet_(srcSs, 'tbl_rsvp');
  if (oldRsvps.length) {
    summary.rsvp = upsertBatchPlan_({
      target: 'tbl_rsvp',
      key: function(o) {
        const ev = String(o.event_id || o.id_acara || '').trim();
        const em = String(o.user_email || o.email || '').toLowerCase().trim();
        return ev && em ? (ev + '|' + em) : '';
      },
      updatable: ['response_status', 'rep_name', 'rep_email', 'rep_phone', 'absence_reason'],
      rows: oldRsvps
    }, dryRun);
  }

  Logger.log('✅ Ringkasan Keputusan Migrasi: ' + JSON.stringify(summary));
  return summary;
}
