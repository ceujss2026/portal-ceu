/**
 * ============================================================================
 * MODUL NOTIFIKASI WA (FONNTE), EMAIL, & CRM KONTAK (gas-notifikasi-wa-crm)
 * Antrean Non-Blocking, Blast Massal, Sinkronisasi CRM, & Normalisasi Nombor
 * Unit Pendidikan Kerjaya, Jabatan Sekolah-Sekolah
 * ============================================================================
 */

/**
 * Matriks & Templat Mesej Kejadian Sistem
 */
const NOTIF_EVENTS = {
  RSVP_DISAHKAN: {
    label: 'Pengesahan Kehadiran RSVP Diterima',
    wa: true, email: true,
    subjek: 'Pengesahan Kehadiran & Permohonan Logistik: {namaAcara}',
    pesan: 'Assalamu\'alaikum dan Salam Sejahtera,\n\nKepada pihak *{namaAgensi}*,\nPengesahan RSVP bagi *{namaAcara}* telah selamat diterima sistem.\n\n📌 *Ringkasan Permohonan Dewan:*\n• Status: *{statusRsvp}*\n• Meja: {meja} unit\n• Kerusi: {kerusi} unit\n• Plug Elektrik: {plug} unit\n• Jumlah Wakil: {wakil} orang\n\nSila layari portal untuk menyemak Pelan Susun Atur Dewan & Peta Tempat Letak Kereta Agensi:\n{pautan}\n\nSekian, terima kasih.\n— *Unit Pendidikan Kerjaya (UPK), Jabatan Sekolah-Sekolah*'
  },
  PERINGATAN_H1: {
    label: 'Peringatan Acara H-1',
    wa: true, email: true,
    subjek: 'Peringatan H-1: {namaAcara} Berlangsung Esok',
    pesan: 'Assalamu\'alaikum dan Salam Sejahtera,\n\nKepada pihak *{namaAgensi}*,\n\nPeringatan bahawa *{namaAcara}* akan berlangsung *ESOK*:\n📅 Tarikh: {tarikh}\n⏰ Masa: {masa}\n📍 Tempat: {tempat}\n\n🚗 *Panduan Parking Agensi:*\nSila masuk melalui Pintu Pagar B (Pagar Khas Agensi & VIP). Zon letak kereta adalah di Blok C.\n\nSemak semula pelan susun atur meja booth di Portal CEU:\n{pautan}\n\n— *Unit Pendidikan Kerjaya (UPK)*'
  },
  SURAT_TERBIT: {
    label: 'Surat Rasmi Diterbitkan',
    wa: true, email: true,
    subjek: 'Penerbitan Surat Rasmi: {jenisSurat}',
    pesan: 'Kepada pihak *{namaAgensi}*,\n\nSurat rasmi *{nomorSurat}* berkaitan {namaAcara} telah sedia untuk dimuat turun melalui Portal CEU.\n\nPautan: {pautan}\n— Unit Pendidikan Kerjaya (UPK)'
  }
};

/**
 * Normalisasi nombor telefon Brunei Darussalam (+673) & Antarabangsa
 */
function normalizePhone673_(phone) {
  let p = String(phone || '').replace(/[^0-9]/g, '');
  if (!p) return '';
  if (p.startsWith('00673')) p = p.slice(2);
  if (p.startsWith('673')) return p;
  if (p.startsWith('0')) p = p.slice(1);
  // Di Brunei, nombor bimbit lazimnya bermula dengan 7 atau 8 (cth: 8xxxxxx, 7xxxxxx) atau talian tetap 2 / 3
  return '673' + p;
}

/**
 * Memasukkan notifikasi ke dalam antrean (Non-Blocking, 0ms latency pada user)
 */
function antrikanNotifikasi_(eventCode, agensi, vars) {
  try {
    const tmpl = NOTIF_EVENTS[eventCode];
    if (!tmpl) return;

    const namaAgensi = agensi.Nama_Agensi || agensi.namaAgensi || 'Agensi Jemputan';
    const noWA = normalizePhone673_(agensi.No_Telefon_Agensi || agensi.telefon || '');
    const emel = String(agensi.Emel_Rasmi || agensi.emel || '').trim();
    const appUrl = prop_('APP_URL', 'https://portalevents.moe.gov.bn');

    const replaceVars = Object.assign({
      namaAgensi: namaAgensi,
      pautan: appUrl
    }, vars || {});

    let subjek = tmpl.subjek;
    let pesan = tmpl.pesan;
    Object.keys(replaceVars).forEach(k => {
      subjek = subjek.replace(new RegExp('\\{' + k + '\\}', 'g'), replaceVars[k]);
      pesan = pesan.replace(new RegExp('\\{' + k + '\\}', 'g'), replaceVars[k]);
    });

    const rows = [];
    const nowStr = Utilities.formatDate(new Date(), 'GMT+8', 'yyyy-MM-dd HH:mm:ss');

    // Antrikan WhatsApp jika aktif
    if (tmpl.wa && noWA && noWA.length >= 8) {
      rows.push({
        AntrianID: 'NOTIF-WA-' + Utilities.getUuid().slice(0, 8),
        Kanal: 'WA',
        Tujuan: noWA,
        NamaPenerima: namaAgensi,
        Subjek: subjek,
        Pesan: pesan,
        Event: eventCode,
        RefID: vars.eventId || '',
        BlastID: vars.blastId || '',
        Status: 'Antri',
        Percobaan: 0,
        Respon: '',
        DibuatPada: nowStr,
        DikirimPada: ''
      });
    }

    // Antrikan Emel jika aktif
    if (tmpl.email && emel && emel.includes('@')) {
      rows.push({
        AntrianID: 'NOTIF-EM-' + Utilities.getUuid().slice(0, 8),
        Kanal: 'EMAIL',
        Tujuan: emel,
        NamaPenerima: namaAgensi,
        Subjek: subjek,
        Pesan: pesan,
        Event: eventCode,
        RefID: vars.eventId || '',
        BlastID: vars.blastId || '',
        Status: 'Antri',
        Percobaan: 0,
        Respon: '',
        DibuatPada: nowStr,
        DikirimPada: ''
      });
    }

    if (rows.length) {
      appendBatch_('AntrianNotif', rows);
      setProp_('ANTRIAN_ADA', '1');
    }
  } catch (err) {
    queueLog_('NOTIFIKASI', 'ERROR_QUEUE', err.message);
  }
}

/**
 * Pemprosesan Antrean Notifikasi (Dijadualkan melalui pemicu masa / background worker)
 */
function prosesAntrianNotifikasi() {
  if (prop_('ANTRIAN_ADA') !== '1') return;

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(8000)) return;

  try {
    const sh = getSheet_('AntrianNotif');
    const vals = sh.getDataRange().getValues();
    if (vals.length <= 1) {
      setProp_('ANTRIAN_ADA', '0');
      return;
    }

    const h = vals[0].map(String);
    const statusIdx = h.indexOf('Status');
    const kanalIdx = h.indexOf('Kanal');
    const tujuanIdx = h.indexOf('Tujuan');
    const subjekIdx = h.indexOf('Subjek');
    const pesanIdx = h.indexOf('Pesan');
    const dikirimIdx = h.indexOf('DikirimPada');
    const responIdx = h.indexOf('Respon');

    const fonnteToken = prop_('FONNTE_TOKEN');
    let adaBaki = false;
    const nowStr = Utilities.formatDate(new Date(), 'GMT+8', 'yyyy-MM-dd HH:mm:ss');

    // Proses sehingga 15 notifikasi setiap pusingan
    let count = 0;
    for (let r = 1; r < vals.length && count < 15; r++) {
      if (vals[r][statusIdx] === 'Antri') {
        count++;
        const kanal = vals[r][kanalIdx];
        const tujuan = vals[r][tujuanIdx];
        const subjek = vals[r][subjekIdx];
        const pesan = vals[r][pesanIdx];

        if (kanal === 'EMAIL') {
          try {
            MailApp.sendEmail({
              to: tujuan,
              subject: subjek,
              body: pesan
            });
            vals[r][statusIdx] = 'Terkirim';
            vals[r][dikirimIdx] = nowStr;
            vals[r][responIdx] = 'OK';
          } catch (e) {
            vals[r][statusIdx] = 'Gagal';
            vals[r][responIdx] = e.message;
          }
        } else if (kanal === 'WA') {
          if (fonnteToken) {
            try {
              const res = UrlFetchApp.fetch('https://api.fonnte.com/send', {
                method: 'post',
                headers: { Authorization: fonnteToken },
                payload: { target: tujuan, message: pesan },
                muteHttpExceptions: true
              });
              vals[r][statusIdx] = 'Terkirim';
              vals[r][dikirimIdx] = nowStr;
              vals[r][responIdx] = res.getContentText().slice(0, 100);
            } catch (e) {
              vals[r][statusIdx] = 'Gagal';
              vals[r][responIdx] = e.message;
            }
          } else {
            // Fonnte token belum dimasukkan, tandakan antri
            vals[r][responIdx] = 'Fonnte Token belum ditetapkan di Script Properties';
          }
        }
      }
    }

    // Semak jika masih ada antrean
    for (let r = 1; r < vals.length; r++) {
      if (vals[r][statusIdx] === 'Antri') {
        adaBaki = true;
        break;
      }
    }
    setProp_('ANTRIAN_ADA', adaBaki ? '1' : '0');

    // Tulis semula lembaran secara kontigu
    sh.getRange(1, 1, vals.length, h.length).setValues(vals);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Pengendali Blast WA dari Dashboard Admin
 */
function handleSendBroadcastWA_(data) {
  const targetAgencies = data.agencyIds || [];
  const message = data.message || '';
  const eventId = data.eventId || '';

  if (!message) return { success: false, message: 'Mesej broadcast tidak boleh kosong.' };

  const agencies = getSheetData_('Agensi_Users');
  const selected = agencies.filter(a => targetAgencies.length === 0 || targetAgencies.includes(a.Agensi_ID));

  selected.forEach(ag => {
    antrikanNotifikasi_('PERINGATAN_H1', ag, {
      namaAcara: data.namaAcara || 'Program CEU',
      tarikh: data.tarikh || '',
      masa: data.masa || '',
      tempat: data.tempat || '',
      eventId: eventId
    });
  });

  return {
    success: true,
    message: 'Broadcast berjaya dijadualkan untuk ' + selected.length + ' agensi jemputan.'
  };
}

/**
 * Sinkronisasi Agensi ke CRM Kontak (gas-notifikasi-wa-crm)
 */
function handleSyncCRM_() {
  const agencies = getSheetData_('Agensi_Users');
  const crmRows = getSheetData_('CRM_Kontak');
  const existingMap = {};
  crmRows.forEach(c => { existingMap[c.RefID] = true; });

  const toAppend = [];
  const nowStr = Utilities.formatDate(new Date(), 'GMT+8', 'yyyy-MM-dd HH:mm:ss');

  agencies.forEach(ag => {
    if (!existingMap[ag.Agensi_ID]) {
      toAppend.push({
        KontakID: 'KTK-' + ag.Agensi_ID,
        Nama: ag.Nama_Agensi,
        Email: ag.Emel_Rasmi || '',
        NoWA: normalizePhone673_(ag.No_Telefon_Agensi),
        Segmen: ag.Kategori || 'Institusi',
        Sumber: 'Agensi_Users',
        RefID: ag.Agensi_ID,
        Tag: 'Agensi Jemputan Rasmi',
        StatusWA: 'Belum Dicek',
        CekWAAt: '',
        EmailValid: ag.Emel_Rasmi ? 'YA' : 'TIDAK',
        OptOut: 'TIDAK',
        Catatan: 'Pra-muat 52 Agensi CEU',
        JumlahPesan: 0,
        TerakhirDihubungi: '',
        Info: JSON.stringify({ kod: ag.Agensi_ID, username: ag.Username }),
        DibuatPada: nowStr,
        DiperbaruiPada: nowStr
      });
    }
  });

  if (toAppend.length) {
    appendBatch_('CRM_Kontak', toAppend);
  }

  return {
    success: true,
    message: 'CRM Kontak berjaya disinkronkan (' + toAppend.length + ' agensi baharu ditambah).'
  };
}

/**
 * Mengambil senarai CRM Kontak
 */
function handleGetCRMContacts_() {
  const contacts = getSheetData_('CRM_Kontak');
  return { success: true, data: contacts };
}
