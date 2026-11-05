/**
 * ============================================================================
 * MODUL PENGENDALI OPERASI BISNES (Handlers.gs)
 * Aliran Logik Portal Agensi & Papan Pemuka Pentadbir CEU
 * ============================================================================
 */

/**
 * Mengambil data awal untuk Portal Agensi & Admin (Cached & Instant)
 */
function handleGetInitialData_(auth) {
  const events = getSheetData_('Events');
  const activeEvents = events.filter(e => String(e.Status_Acara).toLowerCase() !== 'arkib');

  const rsvps = getSheetData_('RSVP_Logistik');
  let userRsvps = [];

  if (auth.role === 'AGENCY') {
    userRsvps = rsvps.filter(r => r.Agensi_ID === auth.id);
  } else {
    userRsvps = rsvps;
  }

  // Ringkasan metrik agensi
  const totalProgramsMonth = activeEvents.length;
  const completedRsvp = userRsvps.filter(r => r.Status_RSVP === 'Hadir').length;
  const pendingRsvp = Math.max(0, activeEvents.length - userRsvps.length);

  return {
    success: true,
    user: auth,
    events: activeEvents,
    rsvps: userRsvps,
    metrics: {
      totalPrograms: totalProgramsMonth,
      completedRsvp: completedRsvp,
      pendingRsvp: pendingRsvp
    }
  };
}

/**
 * Mengambil butiran lengkap satu acara berserta peta & pelan
 */
function handleGetEventDetails_(eventId) {
  const events = getSheetData_('Events');
  const ev = events.find(e => e.Event_ID === eventId);
  if (!ev) return { success: false, message: 'Acara tidak ditemui.' };

  return { success: true, event: ev };
}

/**
 * Menghantar pengesahan kehadiran RSVP & pesanan logistik dewan sekolah
 */
function handleSubmitRSVP_(auth, data) {
  const eventId = data.eventId;
  const statusRsvp = data.statusRsvp || 'Hadir'; // Hadir | Tidak Hadir | Lantik Wakil
  const bilMeja = Number(data.bilMeja) || 0;
  const bilKerusi = Number(data.bilKerusi) || 0;
  const bilPlug = Number(data.bilPlug) || 0;
  const jumlahWakil = Number(data.jumlahWakil) || 0;
  const namaWakil = data.namaWakilHadir || '';
  const keperluanLain = data.keperluanLain || '';

  if (!eventId) {
    return { success: false, message: 'ID Acara diperlukan.' };
  }

  const events = getSheetData_('Events');
  let ev = events.find(e => e.Event_ID === eventId);
  if (!ev) {
    try {
      const shEvents = getSheet_('Events');
      const nowEv = Utilities.formatDate(new Date(), 'GMT+8', 'yyyy-MM-dd HH:mm:ss');
      shEvents.appendRow([
        eventId,
        data.kategoriProgram || 'Program Hala Tuju',
        data.namaAcara || ('Program Rasmi - ' + eventId),
        data.tarikhMula || '2027-01-25',
        data.tarikhMula || '2027-01-25',
        data.masa || '09:00 - 11:30',
        data.tempatVenue || 'Dewan Sekolah',
        '', '', '',
        'Sila masuk melalui Pintu Pagar B.',
        'Sesi Takwim Rasmi 2027',
        'Aktif',
        nowEv
      ]);
      bumpVersion_('events');
    } catch (e) {
      // Teruskan simpan RSVP
    }
  }

  const sh = getSheet_('RSVP_Logistik');
  const vals = sh.getDataRange().getValues();
  const headers = vals[0].map(String);
  const evIdx = headers.indexOf('Event_ID');
  const agIdx = headers.indexOf('Agensi_ID');

  let rowIndex = -1;
  for (let r = 1; r < vals.length; r++) {
    if (vals[r][evIdx] === eventId && vals[r][agIdx] === auth.id) {
      rowIndex = r + 1;
      break;
    }
  }

  const nowStr = Utilities.formatDate(new Date(), 'GMT+8', 'yyyy-MM-dd HH:mm:ss');
  let rsvpId;

  if (rowIndex > -1) {
    // Kemaskini rekod sedia ada
    rsvpId = vals[rowIndex - 1][headers.indexOf('RSVP_ID')];
    sh.getRange(rowIndex, headers.indexOf('Status_RSVP') + 1).setValue(statusRsvp);
    sh.getRange(rowIndex, headers.indexOf('Bil_Meja') + 1).setValue(bilMeja);
    sh.getRange(rowIndex, headers.indexOf('Bil_Kerusi') + 1).setValue(bilKerusi);
    sh.getRange(rowIndex, headers.indexOf('Bil_Plug') + 1).setValue(bilPlug);
    sh.getRange(rowIndex, headers.indexOf('Jumlah_Wakil') + 1).setValue(jumlahWakil);
    sh.getRange(rowIndex, headers.indexOf('Nama_Wakil_Hadir') + 1).setValue(namaWakil);
    sh.getRange(rowIndex, headers.indexOf('Keperluan_Lain') + 1).setValue(keperluanLain);
    sh.getRange(rowIndex, headers.indexOf('Tarikh_Kemaskini') + 1).setValue(nowStr);
  } else {
    // Tambah rekod baharu
    rsvpId = 'RSVP-' + new Date().getFullYear() + '-' + Utilities.getUuid().slice(0, 6).toUpperCase();
    sh.appendRow([
      rsvpId,
      eventId,
      auth.id,
      auth.namaAgensi,
      statusRsvp,
      bilMeja,
      bilKerusi,
      bilPlug,
      jumlahWakil,
      namaWakil,
      keperluanLain,
      nowStr,
      nowStr
    ]);
  }

  // Invalidate cache
  bumpVersion_('rsvp');
  bumpVersion_('reports');

  // Cetuskan notifikasi WhatsApp & Emel automatik (Non-blocking queue)
  antrikanNotifikasi_('RSVP_DISAHKAN', {
    Nama_Agensi: auth.namaAgensi,
    Agensi_ID: auth.id,
    No_Telefon_Agensi: data.telefon || '',
    Emel_Rasmi: data.emel || ''
  }, {
    namaAcara: ev.Nama_Acara,
    statusRsvp: statusRsvp,
    meja: bilMeja,
    kerusi: bilKerusi,
    plug: bilPlug,
    wakil: jumlahWakil,
    eventId: eventId
  });

  return {
    success: true,
    message: 'Pengesahan RSVP & permohonan logistik anda berjaya dihantar!',
    rsvpId: rsvpId
  };
}

/**
 * Mengambil senarai notifikasi untuk pengguna semasa
 */
function handleGetNotifications_(auth) {
  const notifs = getSheetData_('AntrianNotif');
  const userNotifs = notifs
    .filter(n => n.NamaPenerima === auth.namaAgensi || n.RefID === auth.id)
    .slice(-15)
    .reverse();

  return { success: true, data: userNotifs };
}

/**
 * Papan Pemuka Pentadbir CEU (Kiraan Agregat 52 Agensi)
 */
function handleGetAdminDashboard_() {
  const v = getVersion_('reports');
  const cacheKey = 'admin_dash_' + v;
  const cached = CacheX.get(cacheKey);
  if (cached) return { success: true, data: cached };

  const events = getSheetData_('Events');
  const activeEvents = events.filter(e => String(e.Status_Acara).toLowerCase() !== 'arkib');
  const agencies = getSheetData_('Agensi_Users');
  const rsvps = getSheetData_('RSVP_Logistik');

  // Pilih acara utama terkini
  const primaryEvent = activeEvents[0] || {};
  const currentRsvps = rsvps.filter(r => r.Event_ID === primaryEvent.Event_ID);

  let totalMeja = 0;
  let totalKerusi = 0;
  let totalPlug = 0;
  let totalWakil = 0;
  let hadirCount = 0;
  let tidakHadirCount = 0;
  let wakilCount = 0;

  currentRsvps.forEach(r => {
    if (r.Status_RSVP === 'Hadir') {
      hadirCount++;
      totalMeja += Number(r.Bil_Meja) || 0;
      totalKerusi += Number(r.Bil_Kerusi) || 0;
      totalPlug += Number(r.Bil_Plug) || 0;
      totalWakil += Number(r.Jumlah_Wakil) || 0;
    } else if (r.Status_RSVP === 'Tidak Hadir') {
      tidakHadirCount++;
    } else if (r.Status_RSVP === 'Lantik Wakil') {
      wakilCount++;
      totalMeja += Number(r.Bil_Meja) || 0;
      totalKerusi += Number(r.Bil_Kerusi) || 0;
      totalPlug += Number(r.Bil_Plug) || 0;
      totalWakil += Number(r.Jumlah_Wakil) || 0;
    }
  });

  const belumResponCount = Math.max(0, agencies.length - currentRsvps.length);
  const kadarRsvp = agencies.length > 0 ? Math.round((currentRsvps.length / agencies.length) * 100) : 0;

  const dashboardData = {
    primaryEvent: primaryEvent,
    totalAgencies: agencies.length,
    activeEventsCount: activeEvents.length,
    kadarRsvpPercent: kadarRsvp,
    rsvpStats: {
      hadir: hadirCount,
      tidakHadir: tidakHadirCount,
      lantikWakil: wakilCount,
      belumRespon: belumResponCount
    },
    logisticsAggregate: {
      meja: totalMeja,
      kerusi: totalKerusi,
      plug: totalPlug,
      wakil: totalWakil
    },
    recentRsvps: currentRsvps.slice(-8).reverse()
  };

  CacheX.put(cacheKey, dashboardData, 600);
  return { success: true, data: dashboardData };
}

/**
 * Cipta / Kemaskini Acara oleh Pentadbir CEU
 */
function handleSaveEvent_(data) {
  const sh = getSheet_('Events');
  const existingEvents = getSheetData_('Events');
  const eventId = data.eventId || ('EVT-' + new Date().getFullYear() + '-' + Utilities.getUuid().slice(0, 5).toUpperCase());
  const exists = existingEvents.some(e => e.Event_ID === eventId);
  const nowStr = Utilities.formatDate(new Date(), 'GMT+8', 'yyyy-MM-dd HH:mm:ss');

  if (!exists) {
    sh.appendRow([
      eventId,
      data.kategoriProgram || 'Program Hala Tuju',
      data.namaAcara || '',
      data.tarikhMula || '',
      data.tarikhTamat || data.tarikhMula || '',
      data.masa || '',
      data.tempatVenue || '',
      data.pautanGPS || '',
      data.pelanSekolahUrl || '',
      data.pelanParkingUrl || '',
      data.panduanParking || '',
      data.catatanKhas || '',
      data.statusAcara || 'Aktif',
      nowStr
    ]);
  } else {
    updateWhere_('Events', 'Event_ID', {
      [eventId]: {
        Kategori_Program: data.kategoriProgram,
        Nama_Acara: data.namaAcara,
        Tarikh_Mula: data.tarikhMula,
        Tarikh_Tamat: data.tarikhTamat,
        Masa: data.masa,
        Tempat_Venue: data.tempatVenue,
        Pautan_GPS_Maps: data.pautanGPS,
        Pelan_Sekolah_URL: data.pelanSekolahUrl,
        Pelan_Parking_URL: data.pelanParkingUrl,
        Panduan_Parking: data.panduanParking,
        Catatan_Khas: data.catatanKhas,
        Status_Acara: data.statusAcara
      }
    });
  }

  bumpVersion_('events');
  return { success: true, message: 'Acara berjaya ' + (isNew ? 'dicipta' : 'dikemaskini') + '!', eventId: eventId };
}

/**
 * Memadam / Mengarkib Acara
 */
function handleDeleteEvent_(eventId) {
  updateWhere_('Events', 'Event_ID', {
    [eventId]: { Status_Acara: 'Arkib' }
  });
  bumpVersion_('events');
  return { success: true, message: 'Acara telah diarkibkan.' };
}

/**
 * Mengambil senarai 52 Kredensial Agensi untuk Pentadbir CEU
 */
function handleGetAgenciesCredentials_() {
  const agencies = getSheetData_('Agensi_Users');
  const safeList = agencies.map(a => ({
    no: a.Agensi_ID,
    kod: a.Agensi_ID,
    namaAgensi: a.Nama_Agensi,
    username: a.Username,
    kategori: a.Kategori,
    emel: a.Emel_Rasmi,
    telefon: a.No_Telefon_Agensi,
    status: a.Status_Akaun,
    didaftar: a.Tarikh_Didaftar
  }));

  return { success: true, data: safeList };
}

/**
 * Reset kata laluan agensi oleh Pentadbir CEU
 */
function handleResetAgencyPassword_(agencyId) {
  const defaultSalt = prop_('DEFAULT_SALT', 'CEU-SALT-2026');
  const kataLaluanBaru = 'Agensi@' + Math.floor(1000 + Math.random() * 9000);
  const newHash = hashPass_(kataLaluanBaru, defaultSalt);

  updateWhere_('Agensi_Users', 'Agensi_ID', {
    [agencyId]: {
      Password_Hash: newHash,
      Salt: defaultSalt
    }
  });

  // Cabut sesi aktif sedia ada
  revokeAll_(agencyId);
  bumpVersion_('agencies');

  return {
    success: true,
    message: 'Kata laluan berjaya direset!',
    temporaryPassword: kataLaluanBaru
  };
}

/**
 * Mengambil Laporan Induk Logistik Sekolah untuk Eksport
 */
function handleGetLogisticsReport_(eventId) {
  const events = getSheetData_('Events');
  const ev = events.find(e => e.Event_ID === eventId) || events[0] || {};
  const agencies = getSheetData_('Agensi_Users');
  const rsvps = getSheetData_('RSVP_Logistik');

  const reportRows = agencies.map(ag => {
    const r = rsvps.find(item => item.Event_ID === ev.Event_ID && item.Agensi_ID === ag.Agensi_ID);
    return {
      kod: ag.Agensi_ID,
      namaAgensi: ag.Nama_Agensi,
      kategori: ag.Kategori,
      statusRsvp: r ? r.Status_RSVP : 'Belum Respon',
      bilMeja: r ? Number(r.Bil_Meja) || 0 : 0,
      bilKerusi: r ? Number(r.Bil_Kerusi) || 0 : 0,
      bilPlug: r ? Number(r.Bil_Plug) || 0 : 0,
      jumlahWakil: r ? Number(r.Jumlah_Wakil) || 0 : 0,
      namaWakil: r ? r.Nama_Wakil_Hadir || '' : '',
      keperluanLain: r ? r.Keperluan_Lain || '' : '',
      tarikhHantar: r ? r.Tarikh_Hantar || '' : ''
    };
  });

  let totalMeja = 0, totalKerusi = 0, totalPlug = 0, totalWakil = 0;
  reportRows.forEach(r => {
    if (r.statusRsvp === 'Hadir' || r.statusRsvp === 'Lantik Wakil') {
      totalMeja += r.bilMeja;
      totalKerusi += r.bilKerusi;
      totalPlug += r.bilPlug;
      totalWakil += r.jumlahWakil;
    }
  });

  return {
    success: true,
    event: ev,
    summary: {
      totalAgencies: agencies.length,
      responded: reportRows.filter(r => r.statusRsvp !== 'Belum Respon').length,
      attending: reportRows.filter(r => r.statusRsvp === 'Hadir').length,
      notAttending: reportRows.filter(r => r.statusRsvp === 'Tidak Hadir').length,
      represented: reportRows.filter(r => r.statusRsvp === 'Lantik Wakil').length,
      totalMeja: totalMeja,
      totalKerusi: totalKerusi,
      totalPlug: totalPlug,
      totalWakil: totalWakil
    },
    rows: reportRows
  };
}

/**
 * Muat naik gambar Pelan Sekolah / Peta Parking ke Google Drive
 */
function handleUploadEventMedia_(data) {
  const base64Data = data.base64;
  const fileName = data.fileName || 'pelan_sekolah.png';
  const folderKey = data.type === 'PARKING' ? 'FOLDER_PETA_PARKING' : 'FOLDER_PELAN_SEKOLAH';
  const folderId = prop_(folderKey);

  if (!folderId) {
    return { success: false, message: 'Folder Google Drive belum dikonfigurasi.' };
  }

  const folder = DriveApp.getFolderById(folderId);
  const contentType = data.mimeType || 'image/png';
  const bytes = Utilities.base64Decode(base64Data);
  const blob = Utilities.newBlob(bytes, contentType, fileName);
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  const fileUrl = 'https://drive.google.com/uc?export=view&id=' + file.getId();

  return {
    success: true,
    fileId: file.getId(),
    url: fileUrl,
    message: 'Fail media berjaya dimuat naik ke Google Drive!'
  };
}
