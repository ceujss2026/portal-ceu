/**
 * ============================================================================
 * DATA SIMULASI REALISTIK (MOCK DATA) — PORTAL CEU BRUNEI DARUSSALAM
 * Digunakan secara lancar apabila GAS_URL belum disambungkan
 * ============================================================================
 */

window.MOCK_DATA = (function () {
  const users = [
    {
      email: 'pegawai.upk@moe.bn',
      name: 'Hj Mohammad Faizal bin Hj Kamis',
      role: 'Admin',
      district: 'Brunei-Muara',
      school: 'Unit Pendidikan Kerjaya, Jabatan Sekolah-Sekolah',
      phone: '+673 2381234',
      biometricEnabled: true,
      status: 'Active'
    },
    {
      email: 'ahmad.bakar@moe.bn',
      name: 'Cikgu Ahmad bin Hj Bakar',
      role: 'Guru',
      district: 'Belait',
      school: 'Sekolah Menengah Sayyidina Ali',
      phone: '+673 8765432',
      biometricEnabled: true,
      status: 'Active'
    },
    {
      email: 'noraini.yusof@moe.bn',
      name: 'Cikgu Dayang Noraini binti Yusof',
      role: 'Guru',
      district: 'Brunei-Muara',
      school: 'Maktab Duli Pengiran Muda Al-Muhtadee Billah',
      phone: '+673 8981234',
      biometricEnabled: true,
      status: 'Active'
    },
    {
      email: 'fatimah.hasan@moe.bn',
      name: 'Cikgu Fatimah binti Hasan',
      role: 'Guru',
      district: 'Tutong',
      school: 'Sekolah Menengah Muda Hashim',
      phone: '+673 8213456',
      biometricEnabled: false,
      status: 'Active'
    },
    {
      email: 'zaki.kassim@moe.bn',
      name: 'Cikgu Mohd Zaki bin Kassim',
      role: 'Guru',
      district: 'Temburong',
      school: 'Sekolah Menengah Sultan Hassan',
      phone: '+673 8654321',
      biometricEnabled: false,
      status: 'Active'
    },
    {
      email: 'hjh.siti@moe.bn',
      name: 'Cikgu Hjh Siti Mariam binti Abdullah',
      role: 'Guru',
      district: 'Brunei-Muara',
      school: 'Sekolah Menengah Menglait',
      phone: '+673 8112233',
      biometricEnabled: true,
      status: 'Active'
    },
    {
      email: 'ramlee.ali@moe.bn',
      name: 'Cikgu Hj Ramlee bin Ali',
      role: 'Guru',
      district: 'Belait',
      school: 'Sekolah Menengah Perdana Wazir',
      phone: '+673 8334455',
      biometricEnabled: false,
      status: 'Active'
    },
    {
      email: 'khalid.omar@moe.bn',
      name: 'Cikgu Khalid bin Omar',
      role: 'Guru',
      district: 'Tutong',
      school: 'Sekolah Menengah Tanjong Maya',
      phone: '+673 8556677',
      biometricEnabled: true,
      status: 'Active'
    }
  ];

  const _now = new Date();
  const _curY = _now.getFullYear();
  const _curM = _now.getMonth() + 1;
  const _pad = n => String(n).padStart(2, '0');
  
  const curMonthStr = `${_curY}-${_pad(_curM)}`;
  
  let nextM = _curM + 1;
  let nextY = _curY;
  if (nextM > 12) {
    nextM = 1;
    nextY += 1;
  }
  const nextMonthStr = `${nextY}-${_pad(nextM)}`;

  const events = [
    {
      event_id: 'EVT-2026-001',
      title_bm: 'Mesyuarat Penyelarasan Kaunselor Kerjaya Bil. 1/2026',
      title_en: 'Career Guidance Counselors Coordination Meeting No. 1/2026',
      event_date: `${curMonthStr}-15`,
      start_time: '08:30 PAGI',
      end_time: '11:30 PAGI',
      venue: 'Dewan Utama Kementerian Pendidikan, Berakas',
      meeting_link: '',
      rsvp_deadline: `${curMonthStr}-12T23:59:00`,
      attachment_drive_url: 'https://moe.gov.bn/circulars/agenda_bil1_2026.pdf',
      status: 'Published',
      created_by: 'pegawai.upk@moe.bn',
      summary: 'Perbincangan hala tuju aktiviti bimbingan kerjaya, takwim pameran kerjaya kebangsaan, dan taklimat biasiswa kerajaan.'
    },
    {
      event_id: 'EVT-2026-002',
      title_bm: 'Bengkel Pentaksiran Profil Kerjaya Pelajar Tingkatan 5',
      title_en: 'Form 5 Students Career Profiling Assessment Workshop',
      event_date: `${curMonthStr}-22`,
      start_time: '09:00 PAGI',
      end_time: '12:00 TGH HARI',
      venue: 'Dalam Talian (Google Meet)',
      meeting_link: 'https://meet.google.com/upk-ceu-2026',
      rsvp_deadline: `${curMonthStr}-20T17:00:00`,
      attachment_drive_url: '',
      status: 'Published',
      created_by: 'pegawai.upk@moe.bn',
      summary: 'Latihan teknikal penggunaan sistem psikometrik kerjaya dalam talian bagi semua guru kaunselor sekolah menengah.'
    },
    {
      event_id: 'EVT-2026-003',
      title_bm: 'Pameran Pendidikan Tinggi & Kerjaya Kluster Belait 2026',
      title_en: 'Belait Cluster Higher Education & Career Fair 2026',
      event_date: `${nextMonthStr}-05`,
      start_time: '08:00 PAGI',
      end_time: '04:30 PETANG',
      venue: 'Pusat Insani, Seria, Belait',
      meeting_link: '',
      rsvp_deadline: `${nextMonthStr}-01T16:00:00`,
      attachment_drive_url: '',
      status: 'Published',
      created_by: 'pegawai.upk@moe.bn',
      summary: 'Penyelarasan gerai pameran institusi pendidikan tinggi (UBD, UTB, UNISSA, PB, IBTE) untuk pelajar Daerah Belait.'
    }
  ];

  if (curMonthStr !== '2026-03') {
    events.push({
      event_id: 'EVT-2026-004',
      title_bm: 'Seminar Hala Tuju Lepasan Menengah Q1 2026',
      title_en: 'Secondary School Leavers Pathways Seminar Q1 2026',
      event_date: '2026-03-15',
      start_time: '08:30 PAGI',
      end_time: '12:30 TGH HARI',
      venue: 'Dewan Bankuet JSS, Bandar Seri Begawan',
      meeting_link: '',
      rsvp_deadline: '2026-03-10T23:59:00',
      attachment_drive_url: '',
      status: 'Published',
      created_by: 'pegawai.upk@moe.bn',
      summary: 'Pendedahan laluan kerjaya pasca '
    });
  }

  const rsvps = [
    {
      rsvp_id: 'RSVP-EVT-001-ahmad_bakar',
      event_id: 'EVT-2026-001',
      user_email: 'ahmad.bakar@moe.bn',
      response_status: 'Hadir',
      rep_name: '',
      rep_phone: '',
      absence_reason: '',
      submitted_at: `${curMonthStr}-10T09:15:00Z`
    },
    {
      rsvp_id: 'RSVP-EVT-001-fatimah_hasan',
      event_id: 'EVT-2026-001',
      user_email: 'fatimah.hasan@moe.bn',
      response_status: 'Mewakilkan',
      rep_name: 'Cikgu Hjh Siti Mariam binti Abdullah',
      rep_phone: '+673 8112233',
      absence_reason: '',
      submitted_at: `${curMonthStr}-10T14:30:00Z`
    },
    {
      rsvp_id: 'RSVP-EVT-001-zaki_kassim',
      event_id: 'EVT-2026-001',
      user_email: 'zaki.kassim@moe.bn',
      response_status: 'Tidak Hadir',
      rep_name: '',
      rep_phone: '',
      absence_reason: 'Menghadiri Kursus Kepimpinan Sekolah anjuran BPPK',
      submitted_at: `${curMonthStr}-11T08:05:00Z`
    },
    {
      rsvp_id: 'RSVP-EVT-001-noraini_yusof',
      event_id: 'EVT-2026-001',
      user_email: 'noraini.yusof@moe.bn',
      response_status: 'Hadir',
      rep_name: '',
      rep_phone: '',
      absence_reason: '',
      submitted_at: `${curMonthStr}-11T10:45:00Z`
    }
  ];

  const memos = [
    {
      doc_id: 'MEMO-2026-01',
      title_bm: 'Pekeliling UPK Bil 02/2026: Garis Panduan Pameran Kerjaya Sekolah Menengah dan Maktab 2026',
      title_en: 'CEU Circular No. 02/2026: Guidelines for Secondary Schools & Colleges Career Exhibitions 2026',
      category: 'Pekeliling',
      ref_no: 'MOE/JSS/UPK/2026/04',
      publish_date: '2026-02-28',
      size: '1.2 MB',
      file_view_url: 'https://drive.google.com/viewerng/viewer?embedded=true&url=https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    },
    {
      doc_id: 'MEMO-2026-02',
      title_bm: 'Minit Mesyuarat Agung Tahunan Guru Bimbingan Kerjaya Sesi 2025',
      title_en: 'Minutes of the Annual General Meeting of Career Guidance Counselors 2025',
      category: 'Minit Mesyuarat',
      ref_no: 'MOE/JSS/UPK/MIN/2025/08',
      publish_date: '2026-01-15',
      size: '2.4 MB',
      file_view_url: 'https://drive.google.com/viewerng/viewer?embedded=true&url=https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    },
    {
      doc_id: 'MEMO-2026-03',
      title_bm: 'Takwim Aktiviti dan Program Bimbingan Kerjaya Kebangsaan Tahun 2026',
      title_en: 'National Career Guidance Activity & Event Calendar 2026',
      category: 'Takwim Tahunan',
      ref_no: 'MOE/JSS/UPK/CAL/2026/01',
      publish_date: '2026-01-05',
      size: '850 KB',
      file_view_url: 'https://drive.google.com/viewerng/viewer?embedded=true&url=https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    },
    {
      doc_id: 'MEMO-2026-04',
      title_bm: 'Borang Standard Permohonan Lawatan Sambil Belajar Industri Pelajar Tingkatan 4 & 5',
      title_en: 'Standard Application Form for Industrial Educational Visits for Form 4 & 5',
      category: 'Garis Panduan',
      ref_no: 'MOE/JSS/UPK/FORM/2026/02',
      publish_date: '2026-02-10',
      size: '640 KB',
      file_view_url: 'https://drive.google.com/viewerng/viewer?embedded=true&url=https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    }
  ];

  const notifications = [
    {
      notif_id: 'NOTIF-001',
      title_bm: 'Peringatan Mesra: Tarikh Akhir RSVP Mesyuarat Bil. 1/2026',
      title_en: 'Friendly Reminder: RSVP Deadline for Meeting No. 1/2026',
      content_bm: 'Sila lengkapkan pengesahan kehadiran anda sebelum tarikh tutup. Tindakan anda amat dihargai.',
      content_en: 'Please complete your attendance RSVP before the closing deadline. Your cooperation is greatly appreciated.',
      type: 'Urgent',
      sent_at: '2 jam yang lalu',
      is_read: false
    },
    {
      notif_id: 'NOTIF-002',
      title_bm: 'Dokumen Baharu Dimuat Naik: Takwim Program Kerjaya Suku Tahun Kedua',
      title_en: 'New Document Uploaded: Q2 Career Guidance Program Calendar',
      content_bm: 'Takwim program bagi bulan hadapan kini sedia dimuat turun di bahagian Arkib Dokumen.',
      content_en: 'The upcoming program calendar is now available for download in the Document Archive.',
      type: 'General',
      sent_at: 'Semalam',
      is_read: true
    },
    {
      notif_id: 'NOTIF-003',
      title_bm: 'Makluman: Pendaftaran Ujian Profil Minat Kerjaya Pelajar Dibuka',
      title_en: 'Notice: Registration for Students Career Interest Profiling Open',
      content_bm: 'Guru-guru boleh mula mendaftarkan kuota pelajar sekolah masing-masing melalui pautan portal.',
      content_en: 'Counselors may now register student quotas for their respective schools via the portal link.',
      type: 'General',
      sent_at: '3 hari yang lalu',
      is_read: true
    }
  ];

  return {
    users,
    events,
    rsvps,
    memos,
    notifications
  };
})();
