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
      roleGroup: 'Pegawai UPK',
      district: 'Brunei-Muara',
      school: 'Unit Pendidikan Kerjaya, Jabatan Sekolah-Sekolah',
      phone: '+673 2381234',
      biometricEnabled: true,
      status: 'Active'
    },
    // --- 22 SEKOLAH MENENGAH & MAKTAB DAERAH BRUNEI-MUARA ---
    {
      email: 'noraini.yusof@moe.bn',
      name: 'Cikgu Dayang Noraini binti Yusof',
      role: 'Guru',
      roleGroup: 'Guru Pendidikan Kerjaya',
      district: 'Brunei-Muara',
      school: 'Maktab Duli Pengiran Muda Al-Muhtadee Billah',
      phone: '+673 8981234',
      biometricEnabled: true,
      status: 'Active'
    },
    {
      email: 'sufian.salleh@moe.bn',
      name: 'Cikgu Hj Sufian bin Hj Salleh',
      role: 'Guru',
      roleGroup: 'Guru Pendidikan Kerjaya',
      district: 'Brunei-Muara',
      school: 'Maktab Sains Paduka Seri Begawan Sultan',
      phone: '+673 8721122',
      biometricEnabled: true,
      status: 'Active'
    },
    {
      email: 'amirul.damit@moe.bn',
      name: 'Cikgu Pg Mohd Amirul bin Pg Hj Damit',
      role: 'Guru',
      roleGroup: 'Guru Pendidikan Kerjaya',
      district: 'Brunei-Muara',
      school: 'Maktab Sultan Omar \'Ali Saifuddien (SOASC)',
      phone: '+673 8732233',
      biometricEnabled: true,
      status: 'Active'
    },
    {
      email: 'hjh.siti@moe.bn',
      name: 'Cikgu Hjh Siti Mariam binti Abdullah',
      role: 'Guru',
      roleGroup: 'Guru Pendidikan Kerjaya',
      district: 'Brunei-Muara',
      school: 'Sekolah Menengah Menglait',
      phone: '+673 8112233',
      biometricEnabled: true,
      status: 'Active'
    },
    {
      email: 'hilman.jumat@moe.bn',
      name: 'Cikgu Mohd Hilman bin Hj Jumat',
      role: 'Guru',
      roleGroup: 'Guru Pendidikan Kerjaya',
      district: 'Brunei-Muara',
      school: 'Sekolah Menengah Berakas',
      phone: '+673 8743344',
      biometricEnabled: false,
      status: 'Active'
    },
    {
      email: 'noorhafizah.omar@moe.bn',
      name: 'Cikgu Dk Noorhafizah binti Pg Omar',
      role: 'Guru',
      roleGroup: 'Guru Pendidikan Kerjaya',
      district: 'Brunei-Muara',
      school: 'Sekolah Menengah Rimba',
      phone: '+673 8754455',
      biometricEnabled: true,
      status: 'Active'
    },
    {
      email: 'salina.karim@moe.bn',
      name: 'Cikgu Dayang Salina binti Hj Karim',
      role: 'Guru',
      roleGroup: 'Guru Pendidikan Kerjaya',
      district: 'Brunei-Muara',
      school: 'Sekolah Menengah Rimba II',
      phone: '+673 8765566',
      biometricEnabled: true,
      status: 'Active'
    },
    {
      email: 'roslan.damit@moe.bn',
      name: 'Cikgu Hj Roslan bin Awg Damit',
      role: 'Guru',
      roleGroup: 'Guru Pendidikan Kerjaya',
      district: 'Brunei-Muara',
      school: 'Sekolah Menengah Sayyidina Husain',
      phone: '+673 8776677',
      biometricEnabled: false,
      status: 'Active'
    },
    {
      email: 'masni.ismail@moe.bn',
      name: 'Cikgu Dayangku Masni binti Pg Hj Ismail',
      role: 'Guru',
      roleGroup: 'Guru Pendidikan Kerjaya',
      district: 'Brunei-Muara',
      school: 'Sekolah Menengah Sayyidina Hasan',
      phone: '+673 8787788',
      biometricEnabled: true,
      status: 'Active'
    },
    {
      email: 'syazwan.ibrahim@moe.bn',
      name: 'Cikgu Awg Syazwan bin Hj Ibrahim',
      role: 'Guru',
      roleGroup: 'Guru Pendidikan Kerjaya',
      district: 'Brunei-Muara',
      school: 'Sekolah Menengah Sayyidina Abu Bakar',
      phone: '+673 8798899',
      biometricEnabled: true,
      status: 'Active'
    },
    {
      email: 'rusnah.osman@moe.bn',
      name: 'Cikgu Dayang Rusnah binti Hj Osman',
      role: 'Guru',
      roleGroup: 'Guru Pendidikan Kerjaya',
      district: 'Brunei-Muara',
      school: 'Sekolah Menengah Sayyidina \'Umar',
      phone: '+673 8811122',
      biometricEnabled: false,
      status: 'Active'
    },
    {
      email: 'hairul.metali@moe.bn',
      name: 'Cikgu Hj Hairul bin Hj Metali',
      role: 'Guru',
      roleGroup: 'Guru Pendidikan Kerjaya',
      district: 'Brunei-Muara',
      school: 'Sekolah Menengah Pehin Datu Seri Maharaja',
      phone: '+673 8822233',
      biometricEnabled: true,
      status: 'Active'
    },
    {
      email: 'nurul.kamis@moe.bn',
      name: 'Cikgu Nurul Hidayah binti Hj Kamis',
      role: 'Guru',
      roleGroup: 'Guru Pendidikan Kerjaya',
      district: 'Brunei-Muara',
      school: 'Sekolah Menengah Sultan Sharif Ali',
      phone: '+673 8833344',
      biometricEnabled: true,
      status: 'Active'
    },
    {
      email: 'sitisarah.bakar@moe.bn',
      name: 'Cikgu Dk Hjh Siti Sarah binti Pg Hj Bakar',
      role: 'Guru',
      roleGroup: 'Guru Pendidikan Kerjaya',
      district: 'Brunei-Muara',
      school: 'SM PAP Hajah Rashidah Sa\'adatul Bolkiah',
      phone: '+673 8844455',
      biometricEnabled: false,
      status: 'Active'
    },
    {
      email: 'khairul.hassan@moe.bn',
      name: 'Cikgu Awg Khairul Anuar bin Hj Hassan',
      role: 'Guru',
      roleGroup: 'Guru Pendidikan Kerjaya',
      district: 'Brunei-Muara',
      school: 'Sekolah Menengah Awang Semaun',
      phone: '+673 8855566',
      biometricEnabled: true,
      status: 'Active'
    },
    {
      email: 'rohani.mahmud@moe.bn',
      name: 'Cikgu Dayang Hjh Rohani binti Hj Mahmud',
      role: 'Guru',
      roleGroup: 'Guru Pendidikan Kerjaya',
      district: 'Brunei-Muara',
      school: 'Sekolah Tinggi Perempuan Raja Isteri (STPRI)',
      phone: '+673 8866677',
      biometricEnabled: true,
      status: 'Active'
    },
    {
      email: 'danial.latif@moe.bn',
      name: 'Cikgu Mohd Danial bin Hj Latif',
      role: 'Guru',
      roleGroup: 'Guru Pendidikan Kerjaya',
      district: 'Brunei-Muara',
      school: 'Sekolah Menengah Masin',
      phone: '+673 8877788',
      biometricEnabled: false,
      status: 'Active'
    },
    {
      email: 'zaleha.matali@moe.bn',
      name: 'Cikgu Dayang Siti Zaleha binti Hj Matali',
      role: 'Guru',
      roleGroup: 'Guru Pendidikan Kerjaya',
      district: 'Brunei-Muara',
      school: 'Sekolah Menengah Katok',
      phone: '+673 8888899',
      biometricEnabled: true,
      status: 'Active'
    },
    {
      email: 'faizal.yusof@moe.bn',
      name: 'Cikgu Hj Faizal bin Hj Yusof',
      role: 'Guru',
      roleGroup: 'Guru Pendidikan Kerjaya',
      district: 'Brunei-Muara',
      school: 'Sekolah Menengah Lambak Kiri',
      phone: '+673 8899900',
      biometricEnabled: true,
      status: 'Active'
    },
    {
      email: 'najib.tengah@moe.bn',
      name: 'Cikgu Ak Mohd Najib bin Pg Hj Tengah',
      role: 'Guru',
      roleGroup: 'Guru Pendidikan Kerjaya',
      district: 'Brunei-Muara',
      school: 'Sekolah Sukan Brunei Darussalam',
      phone: '+673 8911122',
      biometricEnabled: true,
      status: 'Active'
    },
    {
      email: 'noorbaizura.ali@moe.bn',
      name: 'Cikgu Hjh Noorbaizura binti Hj Ali',
      role: 'Guru',
      roleGroup: 'Guru Pendidikan Kerjaya',
      district: 'Brunei-Muara',
      school: 'Pusat Tingkatan Enam Sengkurong (PTES)',
      phone: '+673 8922233',
      biometricEnabled: true,
      status: 'Active'
    },
    {
      email: 'redzuan.hashim@moe.bn',
      name: 'Cikgu Awg Redzuan bin Hj Hashim',
      role: 'Guru',
      roleGroup: 'Guru Pendidikan Kerjaya',
      district: 'Brunei-Muara',
      school: 'Pusat Tingkatan Enam Meragang (PTEM)',
      phone: '+673 8933344',
      biometricEnabled: false,
      status: 'Active'
    },

    // --- 7 SEKOLAH MENENGAH DAERAH BELAIT ---
    {
      email: 'ahmad.bakar@moe.bn',
      name: 'Cikgu Ahmad bin Hj Bakar',
      role: 'Guru',
      roleGroup: 'Guru Pendidikan Kerjaya',
      district: 'Belait',
      school: 'Sekolah Menengah Sayyidina Ali',
      phone: '+673 8765432',
      biometricEnabled: true,
      status: 'Active'
    },
    {
      email: 'ramlee.ali@moe.bn',
      name: 'Cikgu Hj Ramlee bin Ali',
      role: 'Guru',
      roleGroup: 'Guru Pendidikan Kerjaya',
      district: 'Belait',
      school: 'Sekolah Menengah Perdana Wazir',
      phone: '+673 8334455',
      biometricEnabled: false,
      status: 'Active'
    },
    {
      email: 'norazimah.kassim@moe.bn',
      name: 'Cikgu Dayang Norazimah binti Hj Kassim',
      role: 'Guru',
      roleGroup: 'Guru Pendidikan Kerjaya',
      district: 'Belait',
      school: 'Sekolah Menengah Anthony Abell',
      phone: '+673 8311122',
      biometricEnabled: true,
      status: 'Active'
    },
    {
      email: 'pjnhab.belait@moe.bn',
      name: 'Cikgu Awang Mohd Hairi bin Hj Talip',
      role: 'Guru',
      roleGroup: 'Guru Pendidikan Kerjaya',
      district: 'Belait',
      school: 'Sekolah Menengah PAP Hjh Masna (Kluster Belait)',
      phone: '+673 8312345',
      biometricEnabled: false,
      status: 'Active'
    },
    {
      email: 'vincent.tan@moe.bn',
      name: 'Cikgu Vincent Tan',
      role: 'Guru',
      roleGroup: 'Guru Pendidikan Kerjaya',
      district: 'Belait',
      school: 'Sekolah Menengah Chung Ching Seria',
      phone: '+673 8322233',
      biometricEnabled: false,
      status: 'Active'
    },
    {
      email: 'lily.wong@moe.bn',
      name: 'Cikgu Lily Wong',
      role: 'Guru',
      roleGroup: 'Guru Pendidikan Kerjaya',
      district: 'Belait',
      school: 'Sekolah Menengah Chung Hwa Kuala Belait',
      phone: '+673 8333344',
      biometricEnabled: true,
      status: 'Active'
    },
    {
      email: 'maryann.gomez@moe.bn',
      name: 'Cikgu Mary Ann Gomez',
      role: 'Guru',
      roleGroup: 'Guru Pendidikan Kerjaya',
      district: 'Belait',
      school: 'Sekolah Menengah St. Angela Seria',
      phone: '+673 8344455',
      biometricEnabled: true,
      status: 'Active'
    },

    // --- 6 SEKOLAH MENENGAH DAERAH TUTONG ---
    {
      email: 'fatimah.hasan@moe.bn',
      name: 'Cikgu Fatimah binti Hasan',
      role: 'Guru',
      roleGroup: 'Guru Pendidikan Kerjaya',
      district: 'Tutong',
      school: 'Sekolah Menengah Muda Hashim',
      phone: '+673 8213456',
      biometricEnabled: false,
      status: 'Active'
    },
    {
      email: 'khalid.omar@moe.bn',
      name: 'Cikgu Khalid bin Omar',
      role: 'Guru',
      roleGroup: 'Guru Pendidikan Kerjaya',
      district: 'Tutong',
      school: 'Sekolah Menengah Tanjong Maya',
      phone: '+673 8556677',
      biometricEnabled: true,
      status: 'Active'
    },
    {
      email: 'maznah.omar@moe.bn',
      name: 'Cikgu Dayangku Maznah binti Pg Hj Omar',
      role: 'Guru',
      roleGroup: 'Guru Pendidikan Kerjaya',
      district: 'Tutong',
      school: 'Sekolah Menengah Sufri Bolkiah',
      phone: '+673 8222233',
      biometricEnabled: true,
      status: 'Active'
    },
    {
      email: 'syamsul.matusin@moe.bn',
      name: 'Cikgu Awg Syamsul bin Hj Matusin',
      role: 'Guru',
      roleGroup: 'Guru Pendidikan Kerjaya',
      district: 'Tutong',
      school: 'Sekolah Menengah Sayyidina Othman',
      phone: '+673 8233344',
      biometricEnabled: false,
      status: 'Active'
    },
    {
      email: 'norlaila.hamdan@moe.bn',
      name: 'Cikgu Dayang Norlaila binti Hj Hamdan',
      role: 'Guru',
      roleGroup: 'Guru Pendidikan Kerjaya',
      district: 'Tutong',
      school: 'Pusat Tingkatan Enam Tutong (PTET)',
      phone: '+673 8244455',
      biometricEnabled: true,
      status: 'Active'
    },
    {
      email: 'shahril.zaini@moe.bn',
      name: 'Cikgu Ustaz Hj Shahril bin Hj Zaini',
      role: 'Guru',
      roleGroup: 'Guru Pendidikan Kerjaya',
      district: 'Tutong',
      school: 'Sekolah Menengah Mahad Islam Brunei',
      phone: '+673 8255566',
      biometricEnabled: true,
      status: 'Active'
    },

    // --- 2 SEKOLAH MENENGAH DAERAH TEMBURONG ---
    {
      email: 'zaki.kassim@moe.bn',
      name: 'Cikgu Mohd Zaki bin Kassim',
      role: 'Guru',
      roleGroup: 'Guru Pendidikan Kerjaya',
      district: 'Temburong',
      school: 'Sekolah Menengah Sultan Hassan Bangar',
      phone: '+673 8654321',
      biometricEnabled: false,
      status: 'Active'
    },
    {
      email: 'christina.ting@moe.bn',
      name: 'Cikgu Christina Ting',
      role: 'Guru',
      roleGroup: 'Guru Pendidikan Kerjaya',
      district: 'Temburong',
      school: 'Sekolah Menengah Pai Yuek Bangar',
      phone: '+673 8611122',
      biometricEnabled: true,
      status: 'Active'
    },

    // --- KUMPULAN KEPIMPINAN & SUPERINTENDEN ---
    {
      email: 'pengetua.smsa@moe.bn',
      name: 'Cikgu Hj Awang bin Daud',
      role: 'Pengetua',
      roleGroup: 'Pengetua',
      district: 'Belait',
      school: 'Sekolah Menengah Sayyidina Ali',
      phone: '+673 8345678',
      biometricEnabled: false,
      status: 'Active'
    },
    {
      email: 'pengetua.md@moe.bn',
      name: 'Cikgu Dayang Hjh Zaiton binti Hj Ali',
      role: 'Pengetua',
      roleGroup: 'Pengetua',
      district: 'Brunei-Muara',
      school: 'Maktab Duli Pengiran Muda Al-Muhtadee Billah',
      phone: '+673 8712345',
      biometricEnabled: true,
      status: 'Active'
    },
    {
      email: 'tpengetua.smmh@moe.bn',
      name: 'Cikgu Dk Hjh Mariam binti Pg Othman',
      role: 'Timbalan Pengetua',
      roleGroup: 'Timbalan Pengetua',
      district: 'Tutong',
      school: 'Sekolah Menengah Muda Hashim',
      phone: '+673 8299881',
      biometricEnabled: false,
      status: 'Active'
    },
    {
      email: 'superintenden1.jss@moe.bn',
      name: 'Awang Hj Rosli bin Hj Ibrahim',
      role: 'Superintenden',
      roleGroup: 'Superintenden 1 hingga 3',
      district: 'Brunei-Muara',
      school: 'Kluster 1, Jabatan Sekolah-Sekolah',
      phone: '+673 2389901',
      biometricEnabled: true,
      status: 'Active'
    },
    {
      email: 'superintenden2.jss@moe.bn',
      name: 'Dayang Hjh Norlila binti Hj Mohd',
      role: 'Superintenden',
      roleGroup: 'Superintenden 1 hingga 3',
      district: 'Tutong',
      school: 'Kluster 2, Jabatan Sekolah-Sekolah',
      phone: '+673 2389902',
      biometricEnabled: false,
      status: 'Active'
    },
    {
      email: 'superintenden3.jss@moe.bn',
      name: 'Awang Mohd Suffian bin Hj Amit',
      role: 'Superintenden',
      roleGroup: 'Superintenden 1 hingga 3',
      district: 'Belait',
      school: 'Kluster 3, Jabatan Sekolah-Sekolah',
      phone: '+673 2389903',
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
      title_bm: 'Mesyuarat Penyelarasan Guru Pendidikan Kerjaya Bil. 1/2026',
      title_en: 'Career Education Teachers Coordination Meeting No. 1/2026',
      event_date: `${curMonthStr}-15`,
      start_time: '08:30 PAGI',
      end_time: '11:30 PAGI',
      venue: 'Dewan Utama Kementerian Pendidikan, Berakas',
      meeting_link: '',
      rsvp_deadline: `${curMonthStr}-12T23:59:00`,
      attachment_drive_url: 'https://moe.gov.bn/circulars/agenda_bil1_2026.pdf',
      status: 'Published',
      created_by: 'pegawai.upk@moe.bn',
      summary: 'Perbincangan hala tuju aktiviti pendidikan kerjaya, takwim pameran kerjaya kebangsaan, dan taklimat biasiswa kerajaan.'
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
      summary: 'Latihan teknikal penggunaan sistem psikometrik kerjaya dalam talian bagi semua Guru Pendidikan Kerjaya sekolah menengah.'
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

  // Senarai RSVP sebenar (dikira secara automatik untuk KPI, Donut & Analisis Daerah)
  const rsvps = [
    // EVT-2026-001: 27 Hadir, 4 Mewakilkan, 2 Tidak Hadir, 4 Belum Jawab (Total 37 Guru Seluruh Negara)
    // Brunei-Muara: 17 Hadir, 2 Wakil, 2 Tidak Hadir, 1 Belum Jawab (Total 22 Sekolah)
    { rsvp_id: 'RSVP-01', event_id: 'EVT-2026-001', user_email: 'noraini.yusof@moe.bn', response_status: 'Hadir', rep_name: '', rep_phone: '', absence_reason: '', submitted_at: `${curMonthStr}-10T08:30:00Z` },
    { rsvp_id: 'RSVP-02', event_id: 'EVT-2026-001', user_email: 'sufian.salleh@moe.bn', response_status: 'Hadir', rep_name: '', rep_phone: '', absence_reason: '', submitted_at: `${curMonthStr}-10T08:45:00Z` },
    { rsvp_id: 'RSVP-03', event_id: 'EVT-2026-001', user_email: 'amirul.damit@moe.bn', response_status: 'Hadir', rep_name: '', rep_phone: '', absence_reason: '', submitted_at: `${curMonthStr}-10T09:00:00Z` },
    { rsvp_id: 'RSVP-04', event_id: 'EVT-2026-001', user_email: 'hjh.siti@moe.bn', response_status: 'Hadir', rep_name: '', rep_phone: '', absence_reason: '', submitted_at: `${curMonthStr}-10T09:15:00Z` },
    { rsvp_id: 'RSVP-05', event_id: 'EVT-2026-001', user_email: 'hilman.jumat@moe.bn', response_status: 'Hadir', rep_name: '', rep_phone: '', absence_reason: '', submitted_at: `${curMonthStr}-10T09:30:00Z` },
    { rsvp_id: 'RSVP-06', event_id: 'EVT-2026-001', user_email: 'noorhafizah.omar@moe.bn', response_status: 'Hadir', rep_name: '', rep_phone: '', absence_reason: '', submitted_at: `${curMonthStr}-10T10:00:00Z` },
    { rsvp_id: 'RSVP-07', event_id: 'EVT-2026-001', user_email: 'salina.karim@moe.bn', response_status: 'Hadir', rep_name: '', rep_phone: '', absence_reason: '', submitted_at: `${curMonthStr}-10T10:15:00Z` },
    { rsvp_id: 'RSVP-08', event_id: 'EVT-2026-001', user_email: 'roslan.damit@moe.bn', response_status: 'Hadir', rep_name: '', rep_phone: '', absence_reason: '', submitted_at: `${curMonthStr}-10T10:30:00Z` },
    { rsvp_id: 'RSVP-09', event_id: 'EVT-2026-001', user_email: 'masni.ismail@moe.bn', response_status: 'Hadir', rep_name: '', rep_phone: '', absence_reason: '', submitted_at: `${curMonthStr}-10T11:00:00Z` },
    { rsvp_id: 'RSVP-10', event_id: 'EVT-2026-001', user_email: 'syazwan.ibrahim@moe.bn', response_status: 'Hadir', rep_name: '', rep_phone: '', absence_reason: '', submitted_at: `${curMonthStr}-10T11:15:00Z` },
    { rsvp_id: 'RSVP-11', event_id: 'EVT-2026-001', user_email: 'rusnah.osman@moe.bn', response_status: 'Hadir', rep_name: '', rep_phone: '', absence_reason: '', submitted_at: `${curMonthStr}-10T11:30:00Z` },
    { rsvp_id: 'RSVP-12', event_id: 'EVT-2026-001', user_email: 'hairul.metali@moe.bn', response_status: 'Hadir', rep_name: '', rep_phone: '', absence_reason: '', submitted_at: `${curMonthStr}-10T13:00:00Z` },
    { rsvp_id: 'RSVP-13', event_id: 'EVT-2026-001', user_email: 'nurul.kamis@moe.bn', response_status: 'Hadir', rep_name: '', rep_phone: '', absence_reason: '', submitted_at: `${curMonthStr}-10T13:30:00Z` },
    { rsvp_id: 'RSVP-14', event_id: 'EVT-2026-001', user_email: 'sitisarah.bakar@moe.bn', response_status: 'Hadir', rep_name: '', rep_phone: '', absence_reason: '', submitted_at: `${curMonthStr}-10T14:00:00Z` },
    { rsvp_id: 'RSVP-15', event_id: 'EVT-2026-001', user_email: 'khairul.hassan@moe.bn', response_status: 'Hadir', rep_name: '', rep_phone: '', absence_reason: '', submitted_at: `${curMonthStr}-10T14:15:00Z` },
    { rsvp_id: 'RSVP-16', event_id: 'EVT-2026-001', user_email: 'rohani.mahmud@moe.bn', response_status: 'Hadir', rep_name: '', rep_phone: '', absence_reason: '', submitted_at: `${curMonthStr}-10T14:30:00Z` },
    { rsvp_id: 'RSVP-17', event_id: 'EVT-2026-001', user_email: 'danial.latif@moe.bn', response_status: 'Hadir', rep_name: '', rep_phone: '', absence_reason: '', submitted_at: `${curMonthStr}-10T15:00:00Z` },
    { rsvp_id: 'RSVP-18', event_id: 'EVT-2026-001', user_email: 'zaleha.matali@moe.bn', response_status: 'Mewakilkan', rep_name: 'Cikgu Dayang Rohana binti Kassim', rep_phone: '+673 8812345', absence_reason: '', submitted_at: `${curMonthStr}-10T15:30:00Z` },
    { rsvp_id: 'RSVP-19', event_id: 'EVT-2026-001', user_email: 'faizal.yusof@moe.bn', response_status: 'Mewakilkan', rep_name: 'Cikgu Awg Bahar bin Salleh', rep_phone: '+673 8823456', absence_reason: '', submitted_at: `${curMonthStr}-10T15:45:00Z` },
    { rsvp_id: 'RSVP-20', event_id: 'EVT-2026-001', user_email: 'najib.tengah@moe.bn', response_status: 'Tidak Hadir', rep_name: '', rep_phone: '', absence_reason: 'Tugas Rasmi Kejohanan Sukan Sekolah Kebangsaan di Tutong', submitted_at: `${curMonthStr}-10T16:00:00Z` },
    { rsvp_id: 'RSVP-21', event_id: 'EVT-2026-001', user_email: 'noorbaizura.ali@moe.bn', response_status: 'Tidak Hadir', rep_name: '', rep_phone: '', absence_reason: 'Menghadiri Peperiksaan Akhir Cambridge A-Level Invigilation', submitted_at: `${curMonthStr}-10T16:15:00Z` },

    // Belait: 5 Hadir, 1 Wakil, 0 Tidak Hadir, 1 Belum Jawab (Total 7 Sekolah)
    { rsvp_id: 'RSVP-22', event_id: 'EVT-2026-001', user_email: 'ahmad.bakar@moe.bn', response_status: 'Hadir', rep_name: '', rep_phone: '', absence_reason: '', submitted_at: `${curMonthStr}-11T08:15:00Z` },
    { rsvp_id: 'RSVP-23', event_id: 'EVT-2026-001', user_email: 'ramlee.ali@moe.bn', response_status: 'Hadir', rep_name: '', rep_phone: '', absence_reason: '', submitted_at: `${curMonthStr}-11T08:30:00Z` },
    { rsvp_id: 'RSVP-24', event_id: 'EVT-2026-001', user_email: 'norazimah.kassim@moe.bn', response_status: 'Hadir', rep_name: '', rep_phone: '', absence_reason: '', submitted_at: `${curMonthStr}-11T08:45:00Z` },
    { rsvp_id: 'RSVP-25', event_id: 'EVT-2026-001', user_email: 'vincent.tan@moe.bn', response_status: 'Hadir', rep_name: '', rep_phone: '', absence_reason: '', submitted_at: `${curMonthStr}-11T09:00:00Z` },
    { rsvp_id: 'RSVP-26', event_id: 'EVT-2026-001', user_email: 'lily.wong@moe.bn', response_status: 'Hadir', rep_name: '', rep_phone: '', absence_reason: '', submitted_at: `${curMonthStr}-11T09:15:00Z` },
    { rsvp_id: 'RSVP-27', event_id: 'EVT-2026-001', user_email: 'maryann.gomez@moe.bn', response_status: 'Mewakilkan', rep_name: 'Cikgu Dayang Wong Siew Lan', rep_phone: '+673 8387654', absence_reason: '', submitted_at: `${curMonthStr}-11T09:30:00Z` },

    // Tutong: 4 Hadir, 1 Wakil, 0 Tidak Hadir, 1 Belum Jawab (Total 6 Sekolah)
    { rsvp_id: 'RSVP-28', event_id: 'EVT-2026-001', user_email: 'fatimah.hasan@moe.bn', response_status: 'Hadir', rep_name: '', rep_phone: '', absence_reason: '', submitted_at: `${curMonthStr}-11T10:00:00Z` },
    { rsvp_id: 'RSVP-29', event_id: 'EVT-2026-001', user_email: 'khalid.omar@moe.bn', response_status: 'Hadir', rep_name: '', rep_phone: '', absence_reason: '', submitted_at: `${curMonthStr}-11T10:15:00Z` },
    { rsvp_id: 'RSVP-30', event_id: 'EVT-2026-001', user_email: 'maznah.omar@moe.bn', response_status: 'Hadir', rep_name: '', rep_phone: '', absence_reason: '', submitted_at: `${curMonthStr}-11T10:30:00Z` },
    { rsvp_id: 'RSVP-31', event_id: 'EVT-2026-001', user_email: 'syamsul.matusin@moe.bn', response_status: 'Hadir', rep_name: '', rep_phone: '', absence_reason: '', submitted_at: `${curMonthStr}-11T10:45:00Z` },
    { rsvp_id: 'RSVP-32', event_id: 'EVT-2026-001', user_email: 'shahril.zaini@moe.bn', response_status: 'Mewakilkan', rep_name: 'Ustaz Hj Kamal bin Hj Ariffin', rep_phone: '+673 8276543', absence_reason: '', submitted_at: `${curMonthStr}-11T11:15:00Z` },

    // Temburong: 1 Hadir, 0 Wakil, 0 Tidak Hadir, 1 Belum Jawab (Total 2 Sekolah)
    { rsvp_id: 'RSVP-33', event_id: 'EVT-2026-001', user_email: 'zaki.kassim@moe.bn', response_status: 'Hadir', rep_name: '', rep_phone: '', absence_reason: '', submitted_at: `${curMonthStr}-11T13:00:00Z` },

    // EVT-2026-002: Contoh jawapan berbeza untuk bengkel dalam talian
    { rsvp_id: 'RSVP-34', event_id: 'EVT-2026-002', user_email: 'ahmad.bakar@moe.bn', response_status: 'Hadir', rep_name: '', rep_phone: '', absence_reason: '', submitted_at: `${curMonthStr}-12T09:00:00Z` },
    { rsvp_id: 'RSVP-35', event_id: 'EVT-2026-002', user_email: 'noraini.yusof@moe.bn', response_status: 'Hadir', rep_name: '', rep_phone: '', absence_reason: '', submitted_at: `${curMonthStr}-12T09:15:00Z` },
    { rsvp_id: 'RSVP-36', event_id: 'EVT-2026-002', user_email: 'fatimah.hasan@moe.bn', response_status: 'Mewakilkan', rep_name: 'Cikgu Dayangku Maznah', rep_phone: '+673 8222233', absence_reason: '', submitted_at: `${curMonthStr}-12T09:30:00Z` }
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
