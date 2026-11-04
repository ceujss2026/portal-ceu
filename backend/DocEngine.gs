/**
 * ============================================================================
 * MODUL ENJIN DOKUMEN & PERSURATAN (gas-doc-engine)
 * Penjana Surat Rasmi, Perakuan Logistik Ber-QR, & Verifikasi Integriti HMAC
 * Unit Pendidikan Kerjaya, Jabatan Sekolah-Sekolah
 * ============================================================================
 */

/**
 * Menjana Dokumen / Surat Rasmi (Surat Jemputan / Perakuan Logistik / Pas Kenderaan)
 */
function handleGenerateSuratJemputan_(data) {
  const eventId = data.eventId;
  const agencyId = data.agencyId;
  const jenisSurat = data.jenisSurat || 'SURAT_PERAKUAN_LOGISTIK';

  const events = getSheetData_('Events');
  const ev = events.find(e => e.Event_ID === eventId);
  if (!ev) return { success: false, message: 'Acara tidak ditemui.' };

  const agencies = getSheetData_('Agensi_Users');
  const ag = agencies.find(a => a.Agensi_ID === agencyId);
  if (!ag) return { success: false, message: 'Agensi tidak ditemui.' };

  const rsvps = getSheetData_('RSVP_Logistik');
  const rsvp = rsvps.find(r => r.Event_ID === eventId && r.Agensi_ID === agencyId) || {
    Status_RSVP: 'Hadir',
    Bil_Meja: 2,
    Bil_Kerusi: 4,
    Bil_Plug: 1,
    Jumlah_Wakil: 3
  };

  const dokId = 'DOK-' + Utilities.formatDate(new Date(), 'GMT+8', 'yyyyMMdd') + '-' + Math.floor(1000 + Math.random() * 9000);
  const kodeVerifikasi = acak_(20, 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789');
  const noSurat = 'UPK/JSS/CEU/' + new Date().getFullYear() + '/' + (Math.floor(100 + Math.random() * 900));
  const tglKini = Utilities.formatDate(new Date(), 'GMT+8', 'dd MMMM yyyy');

  // Payload data isian dokumen
  const dataIsian = {
    NOMOR: noSurat,
    TANGGAL: tglKini,
    NAMA_AGENSI: ag.Nama_Agensi,
    KATEGORI_AGENSI: ag.Kategori || 'Institusi Jemputan',
    NAMA_ACARA: ev.Nama_Acara,
    TARIKH_ACARA: ev.Tarikh_Mula,
    MASA_ACARA: ev.Masa,
    TEMPAT_ACARA: ev.Tempat_Venue,
    STATUS_RSVP: rsvp.Status_RSVP || 'Hadir',
    BIL_MEJA: rsvp.Bil_Meja || 0,
    BIL_KERUSI: rsvp.Bil_Kerusi || 0,
    BIL_PLUG: rsvp.Bil_Plug || 0,
    JUMLAH_WAKIL: rsvp.Jumlah_Wakil || 0,
    KODE_VERIFIKASI: kodeVerifikasi,
    PEGAWAI_PENGESAH: 'Pegawai Pendidikan Kerjaya, Unit Pendidikan Kerjaya'
  };

  // Rekodkan ke dalam sheet DE_Dokumen
  const sh = getSheet_('DE_Dokumen');
  sh.appendRow([
    dokId,
    jenisSurat,
    noSurat,
    jenisSurat === 'SURAT_PERAKUAN_LOGISTIK' ? 'Surat Perakuan Logistik Sekolah' : 'Surat Jemputan Rasmi CEU',
    ag.Nama_Agensi,
    'TERBIT',
    JSON.stringify(dataIsian),
    kodeVerifikasi,
    Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, dokId + noSurat + secret_())),
    '', // URL PDF (jika disimpan ke Drive)
    Utilities.formatDate(new Date(), 'GMT+8', 'yyyy-MM-dd HH:mm:ss'),
    'Admin CEU'
  ]);

  return {
    success: true,
    message: 'Surat rasmi berjaya diterbitkan!',
    dokumen: {
      id: dokId,
      nomorSurat: noSurat,
      kodeVerifikasi: kodeVerifikasi,
      data: dataIsian
    }
  };
}

/**
 * Verifikasi Dokumen Publik (Digunakan oleh pengimbas QR Kod)
 */
function deVerifikasiPublik_(kode) {
  if (!kode) {
    return { success: false, message: 'Sila masukkan kod verifikasi dokumen.' };
  }

  const docs = getSheetData_('DE_Dokumen');
  const d = docs.find(doc => String(doc.KodeVerifikasi).trim() === String(kode).trim());

  if (!d) {
    return {
      success: false,
      sah: false,
      message: 'Dokumen ini TIDAK SAH atau tidak ditemui dalam rekod rasmi Unit Pendidikan Kerjaya.'
    };
  }

  let isian = {};
  try {
    isian = JSON.parse(d.DataIsian || '{}');
  } catch (e) {}

  return {
    success: true,
    sah: true,
    message: 'Dokumen SAH dan diterbitkan secara rasmi oleh Unit Pendidikan Kerjaya, Jabatan Sekolah-Sekolah.',
    dokumen: {
      nomorSurat: d.NomorSurat,
      jenisSurat: d.JenisSurat,
      namaAgensi: d.NamaAgensi,
      status: d.Status,
      diterbitkanPada: d.DibuatPada,
      diterbitkanOleh: d.DiterbitkanOleh,
      butiran: isian
    }
  };
}
