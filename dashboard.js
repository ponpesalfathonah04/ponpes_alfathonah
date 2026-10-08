// ===== SUPABASE INIT =====
const SUPABASE_URL = 'https://rnjqwgwazqlmhmxedhef.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuanF3Z3dhenFsbWhteGVkaGVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5MDQ5MzUsImV4cCI6MjEwMTQ4MDkzNX0.Lg-9PAdE4JbmnbIJUrwkPSaeTwATZpcoQrFWzgkfhME';
let _sb = null;
function getSupabase() {
  if (!_sb && window.supabase && window.supabase.createClient) {
    _sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _sb;
}

// ===== STATE =====
let allSantri = [];
let allLaporan = [];
let allPengurus = [];
let allInventaris = [];
let allBayar = [];
let currentPemasukan = [];
let currentPengeluaran = [];
let currentPerbaikan = [];
let allMasterTahun = [];
let allMasterKelas = [];
let allMasterMapel = [];
let allHafalan = [];
let allSurat = [];
let allJadwal = [];
let allBerita = [];
let chartSantriInst = null;
let chartInventarisInst = null;
let _dashClockInterval = null;

// ===== CUSTOM CONFIRM / ALERT DIALOG =====
let _ccResolve = null;

function showCustomConfirm(title, message, { confirmText = 'Konfirmasi', cancelText = 'Batal', type = 'danger', icon = '' } = {}) {
  return new Promise((resolve) => {
    _ccResolve = resolve;
    const overlay = document.getElementById('customConfirmOverlay');
    const iconMap = {
      danger: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>',
      warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
      info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
      success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
      logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>'
    };
    document.getElementById('ccIcon').innerHTML = icon || iconMap[type] || iconMap['warning'];
    document.getElementById('ccIcon').className = 'custom-confirm-icon ' + type;
    document.getElementById('ccTitle').textContent = title;
    document.getElementById('ccMessage').textContent = message;
    const btnConfirm = document.getElementById('ccBtnConfirm');
    btnConfirm.textContent = confirmText;
    btnConfirm.className = 'cc-btn cc-btn-' + type;
    document.getElementById('ccBtnCancel').textContent = cancelText;
    document.getElementById('ccBtnCancel').style.display = '';
    overlay.classList.add('active');
  });
}

function showCustomAlert(title, message, { type = 'info', icon = '', btnText = 'Mengerti' } = {}) {
  return new Promise((resolve) => {
    _ccResolve = resolve;
    const overlay = document.getElementById('customConfirmOverlay');
    const iconMap = {
      danger: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
      warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
      info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
      success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
    };
    document.getElementById('ccIcon').innerHTML = icon || iconMap[type] || iconMap['info'];
    document.getElementById('ccIcon').className = 'custom-confirm-icon ' + type;
    document.getElementById('ccTitle').textContent = title;
    document.getElementById('ccMessage').textContent = message;
    const btnConfirm = document.getElementById('ccBtnConfirm');
    btnConfirm.textContent = btnText;
    btnConfirm.className = 'cc-btn cc-btn-' + type;
    document.getElementById('ccBtnCancel').style.display = 'none';
    overlay.classList.add('active');
  });
}

function resolveCustomConfirm(value) {
  document.getElementById('customConfirmOverlay').classList.remove('active');
  if (_ccResolve) { _ccResolve(value); _ccResolve = null; }
}

// ===== AUTO GENERATE NIS =====
async function generateNIS() {
  const sb = getSupabase();
  if (!sb) return 'AF0001';
  try {
    const { data } = await sb.from('data_induk_santri').select('nis').order('nis', { ascending: false });
    let maxNum = 0;
    if (data && data.length > 0) {
      data.forEach(row => {
        if (row.nis && /^AF\d+$/i.test(row.nis)) {
          const num = parseInt(row.nis.replace(/^AF/i, ''), 10);
          if (num > maxNum) maxNum = num;
        }
      });
    }
    return 'AF' + String(maxNum + 1).padStart(4, '0');
  } catch (e) {
    console.error('generateNIS error:', e);
    return 'AF0001';
  }
}

// ===== NAVIGATION / ROUTING =====
function showSection(sectionId) {
  // Pembatasan hak akses role bendahara: hanya diizinkan melihat Menu Utama (dashboard) dan menu Keuangan
  const userRole = (currentUserRole || '').toLowerCase().trim();
  if (userRole === 'bendahara') {
    const allowedBendaharaSections = [
      'dashboard',
      'spp',
      'uang-jajan',
      'bayar-lainnya',
      'belanja',
      'riwayat-keuangan',
      'laporan'
    ];
    if (!allowedBendaharaSections.includes(sectionId)) {
      console.warn(`Akses ditolak: role bendahara tidak memiliki izin membuka seksi '${sectionId}'.`);
      showSection('dashboard');
      return;
    }
  }

  // Cleanup any leftover print containers from body
  ['printAreaCategoryLaporan', 'printAreaBayarLaporan', 'universalPrintContainer'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.remove();
  });

  // Hide all sections
  document.querySelectorAll('.content').forEach(el => el.style.display = 'none');
  // Show target section
  const target = document.getElementById('view-' + sectionId);
  if (target) target.style.display = 'block';
  
  // Update menu active state
  document.querySelectorAll('.sidebar-menu .menu-item').forEach(el => el.classList.remove('active'));
  const menuBtn = document.getElementById('menu-' + sectionId);
  if (menuBtn) menuBtn.classList.add('active');

  // Load appropriate data
  if (sectionId === 'dashboard') {
    loadDashboard();
  } else if (sectionId === 'laporan') {
    loadLaporan();
  } else if (sectionId === 'pengurus') {
    loadPengurus();
  } else if (sectionId === 'inventaris') {
    loadInventaris();
  } else if (sectionId === 'santri') {
    loadSantri();
  } else if (sectionId === 'spp' || sectionId === 'uang-jajan' || sectionId === 'bayar-lainnya' || sectionId === 'bayar') {
    if (allSantri.length === 0) loadSantri(); // pre-load santri for dropdown
    if (sectionId === 'spp' && typeof loadTransaksiBelanja === 'function') loadTransaksiBelanja();
    loadTagihan();
  } else if (sectionId === 'master') {
    loadMasterAkademik();
  } else if (sectionId === 'hafalan') {
    if (allSantri.length === 0) loadSantri(); // pre-load santri for dropdown
    loadHafalan();
  } else if (sectionId === 'surat') {
    loadSurat();
  } else if (sectionId === 'jadwal') {
    loadJadwal();
  } else if (sectionId === 'hero') {
    if(typeof loadHeroBanners === 'function') loadHeroBanners();
  } else if (sectionId === 'berita') {
    loadBerita();
  } else if (sectionId === 'psb') {
    loadPsb();
  } else if (sectionId === 'akun') {
    loadAkun();
  } else if (sectionId === 'cms-profil' || sectionId === 'cms-visi' || sectionId === 'cms-pengaturan') {
    if(typeof loadWebSettings === 'function') loadWebSettings();
  } else if (sectionId === 'cms-sarana') {
    if(typeof loadCmsTable === 'function') loadCmsTable('web_sarana', renderSaranaTable);
  } else if (sectionId === 'cms-ekstra') {
    if(typeof loadCmsTable === 'function') loadCmsTable('web_kegiatan_tambahan', renderEkstraTable);
  } else if (sectionId === 'cms-galeri') {
    if(typeof loadCmsTable === 'function') loadCmsTable('web_galeri', renderGaleriTable);
  } else if (sectionId === 'cms-testimoni') {
    if(typeof loadCmsTable === 'function') loadCmsTable('web_testimoni', renderTestimoniTable);
  } else if (sectionId === 'cms-faq') {
    if(typeof loadCmsTable === 'function') loadCmsTable('web_faq', renderFaqTable);
  } else if (sectionId === 'belanja') {
    if(typeof loadKategoriBelanja === 'function') loadKategoriBelanja();
    if(typeof loadTransaksiBelanja === 'function') loadTransaksiBelanja();
  } else if (sectionId === 'riwayat-keuangan' || sectionId === 'riwayat-pemasukan') {
    if(typeof loadRiwayatKeuangan === 'function') loadRiwayatKeuangan();
    else if(typeof loadRiwayatPemasukan === 'function') loadRiwayatPemasukan();
  }

  // Close sidebar on mobile
  if (window.innerWidth <= 1024) {
    document.getElementById('sidebar').classList.remove('mobile-open');
    const overlay = document.getElementById('sidebarOverlay');
    if (overlay) overlay.classList.remove('active');
  }
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  checkMobileView();
  
  // Set mobile header date
  const dateEl = document.getElementById('mobileHeaderDate');
  if (dateEl) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateEl.textContent = new Date().toLocaleDateString('id-ID', options);
  }
  
  setTimeout(initDashboard, 300);
});



async function initDashboard() {
  const sb = getSupabase();
  if (!sb) { setTimeout(initDashboard, 500); return; }
  await checkAuth();
  applyRolePermissions(currentUserRole);
  showSection('dashboard'); // Loads dashboard by default
}

// ===== AUTH CHECK =====
let currentUserRole = ''; // Global role so we can control UI elements
let currentUserName = ''; // Global name

async function checkAuth() {
  const sb = getSupabase();
  try {
    const { data: { session } } = await sb.auth.getSession();
    if (!session) { window.location.replace('login.html'); return; }
    
    // Check user status in pengelolaan_akun
    const { data: profile, error } = await sb.from('pengelolaan_akun').select('role, status, nama, email').eq('id', session.user.id).single();
    if (error && error.code !== 'PGRST116') throw error; // Ignore if no rows just yet (might be fresh trigger run)
    
    if (profile) {
      if (profile.status === 'Nonaktif') {
        await showCustomAlert('Akun Dinonaktifkan', 'Akun Anda saat ini dinonaktifkan. Silakan hubungi Administrator.', { type: 'danger' });
        await sb.auth.signOut();
        window.location.replace('login.html');
        return;
      }
      if (profile.status === 'Menunggu') {
        await showCustomAlert('Menunggu Persetujuan', 'Pendaftaran akun Anda sedang menunggu persetujuan Administrator.', { type: 'warning' });
        await sb.auth.signOut();
        window.location.replace('login.html');
        return;
      }
      currentUserRole = profile.role || 'pengajar'; // Save role globally
      currentUserName = profile.nama || profile.email || 'User';
      
      // Update sidebar user profile
      updateUserDisplay(currentUserName, currentUserRole);

      // Terapkan pembatasan hak akses menu berdasarkan role (termasuk role bendahara)
      applyRolePermissions(currentUserRole);
    }
  } catch (err) {
    console.error('Session error:', err);
    window.location.replace('index.html');
  }
}

// ===== ROLE PERMISSIONS CONTROLLER =====
function applyRolePermissions(role) {
  const r = (role || '').toLowerCase().trim();
  
  // Set class pada document.body
  document.body.classList.remove('role-admin', 'role-bendahara', 'role-pengawas', 'role-pengajar');
  if (r) {
    document.body.classList.add('role-' + r);
  }

  // Khusus role bendahara: HANYA dapat melihat Menu Utama (Dashboard) dan menu pada kategori Keuangan
  if (r === 'bendahara') {
    document.querySelectorAll('.sidebar-menu .menu-group').forEach(grp => {
      const groupName = grp.getAttribute('data-group');
      if (groupName === 'utama' || groupName === 'keuangan') {
        grp.style.display = '';
      } else {
        grp.style.display = 'none';
      }
    });
  } else {
    // Role lainnya (admin, pengawas, pengajar): tampilkan grup menu
    document.querySelectorAll('.sidebar-menu .menu-group').forEach(grp => {
      grp.style.display = '';
    });
  }
}

function updateUserDisplay(name, role) {
  const avatarEl = document.getElementById('sidebarUserAvatar');
  const nameEl = document.getElementById('sidebarUserName');
  const roleEl = document.getElementById('sidebarUserRole');
  
  if (nameEl) nameEl.textContent = name;
  if (roleEl) roleEl.textContent = role;
  
  const sb = getSupabase();
  if (sb && avatarEl) {
    sb.auth.getUser().then(({data: {user}}) => {
      if (user && user.email) {
        sb.from('data_pengurus').select('foto_url').eq('email', user.email).single()
          .then(({data}) => {
            if (data && data.foto_url) {
              avatarEl.innerHTML = `<img src="${data.foto_url}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
            } else {
              avatarEl.textContent = name.charAt(0).toUpperCase();
            }
          }).catch(() => {
            avatarEl.textContent = name.charAt(0).toUpperCase();
          });
      } else {
        avatarEl.textContent = name.charAt(0).toUpperCase();
      }
    });
  } else if (avatarEl) {
    avatarEl.textContent = name.charAt(0).toUpperCase();
  }
}

// ===== DASHBOARD UTAMA & STATISTIK (NON-KEUANGAN) =====
function updateDashboardLiveClock() {
  const dateEl = document.getElementById('dashLiveDate');
  const timeEl = document.getElementById('dashLiveTime');
  if (!dateEl || !timeEl) return;

  function tick() {
    const now = new Date();
    dateEl.textContent = now.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    timeEl.textContent = now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }) + ' WIB';
  }

  tick();
  if (!_dashClockInterval) {
    _dashClockInterval = setInterval(tick, 1000);
  }
}

function renderDashboardJadwal(list, count) {
  const container = document.getElementById('dashJadwalList');
  const badgeCount = document.getElementById('badgeCountJadwal');
  if (badgeCount) {
    const total = typeof count === 'number' ? count : (list ? list.length : 0);
    badgeCount.textContent = `${total} Agenda`;
  }
  if (!container) return;

  if (!list || list.length === 0) {
    container.innerHTML = `
      <div style="padding: 36px 20px; text-align: center; color: var(--gray-400); font-size: 0.85rem;">
        Belum ada agenda kegiatan terdekat
      </div>
    `;
    return;
  }

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  container.innerHTML = list.map(j => {
    let day = '1';
    let month = 'Jan';
    if (j.tanggal_mulai) {
      const d = new Date(j.tanggal_mulai);
      if (!isNaN(d.getTime())) {
        day = d.getDate();
        month = monthNames[d.getMonth()];
      }
    }
    const statusBg = j.status === 'Sedang Berjalan' ? '#D1FAE5' : (j.status === 'Akan Datang' ? '#DBEAFE' : '#F3F4F6');
    const statusColor = j.status === 'Sedang Berjalan' ? '#065F46' : (j.status === 'Akan Datang' ? '#1E40AF' : '#4B5563');

    return `
      <div class="dash-feed-item" style="cursor: default; user-select: none;">
        <div class="dash-feed-date">
          <div class="day">${day}</div>
          <div class="month">${month}</div>
        </div>
        <div class="dash-feed-info">
          <strong>${j.nama_kegiatan || 'Kegiatan Pesantren'}</strong>
          <span>${j.lokasi || j.kategori || 'Pondok Pesantren Al-Fathonah'}</span>
        </div>
        <span style="font-size: 0.72rem; font-weight: 600; padding: 4px 10px; border-radius: 6px; background: ${statusBg}; color: ${statusColor}; flex-shrink: 0;">
          ${j.status || 'Terjadwal'}
        </span>
      </div>
    `;
  }).join('');
}

function renderDashboardPsb(list, count) {
  const container = document.getElementById('dashPsbList');
  const badgeCount = document.getElementById('badgeCountPsb');
  if (badgeCount) {
    const total = typeof count === 'number' ? count : (list ? list.length : 0);
    badgeCount.textContent = `${total} Pendaftar`;
  }
  if (!container) return;

  if (!list || list.length === 0) {
    container.innerHTML = `
      <div style="padding: 36px 20px; text-align: center; color: var(--gray-400); font-size: 0.85rem;">
        Belum ada pendaftaran santri baru
      </div>
    `;
    return;
  }

  const statusColors = {
    'Baru': { bg: '#EFF6FF', text: '#1D4ED8' },
    'Diterima': { bg: '#ECFDF5', text: '#047857' },
    'Ditolak': { bg: '#FEF2F2', text: '#B91C1C' }
  };

  container.innerHTML = list.map(p => {
    const st = statusColors[p.status] || { bg: '#F3F4F6', text: '#4B5563' };
    const dateFormatted = p.created_at ? new Date(p.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-';

    return `
      <div class="dash-feed-item" style="cursor: default; user-select: none;">
        <div style="width: 38px; height: 38px; border-radius: 10px; background: #EFF6FF; color: #2563EB; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; flex-shrink: 0;">
          ${(p.nama_lengkap || 'S').charAt(0).toUpperCase()}
        </div>
        <div class="dash-feed-info">
          <strong>${p.nama_lengkap || '-'}</strong>
          <span>${p.nama_sekolah || p.tempat_tgl_lahir || 'Calon Santri'} &bull; ${dateFormatted}</span>
        </div>
        <span style="font-size: 0.72rem; font-weight: 600; padding: 4px 10px; border-radius: 6px; background: ${st.bg}; color: ${st.text}; flex-shrink: 0;">
          ${p.status || 'Baru'}
        </span>
      </div>
    `;
  }).join('');
}

async function loadDashboard() {
  const sb = getSupabase();
  if (!sb) return;

  updateDashboardLiveClock();

  try {
    // 1. DATA INDUK SANTRI & DISTRIBUSI GENDER
    const { data: santriList } = await sb.from('data_induk_santri').select('id, jenis_kelamin, status_mondok');
    const totalSantri = santriList ? santriList.length : 0;
    const santriAktif = santriList ? santriList.filter(s => s.status_mondok !== 'Tidak Aktif').length : 0;

    const elSantriAktif = document.getElementById('statSantriAktif');
    if (elSantriAktif) elSantriAktif.textContent = santriAktif;

    const elSantriTotal = document.getElementById('statSantriTotal');
    if (elSantriTotal) elSantriTotal.textContent = `Total ${totalSantri} Santri Terdaftar`;

    // Distribusi Gender Santri
    let putra = 0, putri = 0;
    if (santriList) {
      santriList.forEach(s => {
        if (s.jenis_kelamin === 'Laki-laki') putra++;
        else putri++;
      });
    }

    const badgeTotalGender = document.getElementById('badgeTotalGender');
    if (badgeTotalGender) badgeTotalGender.textContent = `${totalSantri} Santri`;

    const chipGenderPutra = document.getElementById('chipGenderPutra');
    if (chipGenderPutra) {
      const pctPutra = totalSantri > 0 ? Math.round((putra / totalSantri) * 100) : 0;
      chipGenderPutra.textContent = `${putra} Santri (${pctPutra}%)`;
    }

    const chipGenderPutri = document.getElementById('chipGenderPutri');
    if (chipGenderPutri) {
      const pctPutri = totalSantri > 0 ? Math.round((putri / totalSantri) * 100) : 0;
      chipGenderPutri.textContent = `${putri} Santri (${pctPutri}%)`;
    }

    const ctxS = document.getElementById('chartSantriGender');
    if (ctxS) {
      if (chartSantriInst) chartSantriInst.destroy();
      chartSantriInst = new Chart(ctxS.getContext('2d'), {
        type: 'doughnut',
        data: {
          labels: ['Santri Putra', 'Santri Putri'],
          datasets: [{
            data: [putra, putri],
            backgroundColor: ['#10B981', '#38BDF8'],
            hoverBackgroundColor: ['#059669', '#0284C7'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 12,
                font: { family: 'Poppins', size: 12 }
              }
            }
          },
          cutout: '70%'
        }
      });
    }

    // 2. JUMLAH PENGURUS
    const { data: pengurusList } = await sb.from('data_pengurus').select('id, status_aktif');
    const totalPengurus = pengurusList ? pengurusList.length : 0;
    const pengurusAktif = pengurusList ? pengurusList.filter(p => p.status_aktif === 'Aktif').length : 0;

    const elPengurus = document.getElementById('statPengurus');
    if (elPengurus) elPengurus.textContent = pengurusAktif;

    const elPengurusSub = document.getElementById('statPengurusSub');
    if (elPengurusSub) elPengurusSub.textContent = `${totalPengurus} Pengurus Terdaftar`;

    // 6 & 7. JUMLAH & KONDISI SARANA & INVENTARIS
    const { data: invData } = await sb.from('barang_inventaris').select('id, kondisi');
    const totalInv = invData ? invData.length : 0;

    const elInvTotal = document.getElementById('statInventarisTotal');
    if (elInvTotal) elInvTotal.textContent = totalInv;

    const elInvSub = document.getElementById('statInventarisSub');
    if (elInvSub) elInvSub.textContent = `Total Sarana Terdata`;

    let baik = 0, rr = 0, rb = 0;
    if (invData) {
      invData.forEach(d => {
        const k = (d.kondisi || '').toLowerCase();
        if (k.includes('berat')) rb++;
        else if (k.includes('ringan')) rr++;
        else baik++;
      });
    }

    const badgeTotalKondisi = document.getElementById('badgeTotalKondisi');
    if (badgeTotalKondisi) badgeTotalKondisi.textContent = `${totalInv} Barang`;

    const chipInvBaik = document.getElementById('chipInvBaik');
    if (chipInvBaik) chipInvBaik.textContent = `${baik}`;

    const chipInvRR = document.getElementById('chipInvRR');
    if (chipInvRR) chipInvRR.textContent = `${rr}`;

    const chipInvRB = document.getElementById('chipInvRB');
    if (chipInvRB) chipInvRB.textContent = `${rb}`;

    const ctxI = document.getElementById('chartInventaris');
    if (ctxI) {
      if (chartInventarisInst) chartInventarisInst.destroy();
      chartInventarisInst = new Chart(ctxI.getContext('2d'), {
        type: 'bar',
        data: {
          labels: ['Baik', 'Rusak Ringan', 'Rusak Berat'],
          datasets: [{
            label: 'Jumlah Barang',
            data: [baik, rr, rb],
            backgroundColor: ['#10B981', '#FBBF24', '#F87171'],
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { precision: 0 },
              grid: { color: 'rgba(0,0,0,0.04)' }
            },
            x: {
              grid: { display: false }
            }
          }
        }
      });
    }

    // 5. PENDAFTAR SANTRI BARU (TOP 4 & TOTAL)
    const { data: psbLatest, count: countPsb } = await sb.from('pendaftaran_santri')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(4);
    renderDashboardPsb(psbLatest || [], countPsb || (psbLatest ? psbLatest.length : 0));

    // 3. AGENDA KEGIATAN TERDEKAT (TOP 4 & TOTAL)
    const { data: jadwalData, count: countJadwal } = await sb.from('jadwal_kegiatan')
      .select('*', { count: 'exact' })
      .order('tanggal_mulai', { ascending: false })
      .limit(4);
    renderDashboardJadwal(jadwalData || [], countJadwal || (jadwalData ? jadwalData.length : 0));

  } catch (e) {
    console.error('Error load dashboard specs:', e);
  }
}

// ===== LOAD DATA =====
async function loadSantri() {
  const sb = getSupabase();
  if (!sb) return;
  
  if (allMasterKelas.length === 0) {
    await fetchMasterKelas(); // Global function to fetch class
  }
  
  const { data, error } = await sb.from('data_induk_santri').select('*, master_kelas(nama_kelas)').order('created_at', { ascending: false });
  
  if (error) {
    console.error('Load error:', error);
    showToast('Gagal memuat data: ' + error.message, 'error');
    return;
  }
  
  allSantri = data || [];
  populateFilterKelas();
  renderTable(allSantri);
}

function getKelasName(s) {
  if (s.is_lulus) return 'Lulus';
  return s.master_kelas ? s.master_kelas.nama_kelas : '-';
}

// ===== RENDER TABLE =====
function renderTable(data) {
  const tbody = document.getElementById('santriTableBody');
  const fullTbody = document.getElementById('santriTableFullBody');
  const countEl = document.getElementById('dataCount');
  countEl.textContent = `${data.length} data`;
  document.getElementById('countSelectedSantri').textContent = '0';
  document.getElementById('checkAllSantri').checked = false;
  document.getElementById('btnNaikKelasBulk').disabled = true;

  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:40px;color:#9CA3AF;">Belum ada data santri. Klik "Tambah" untuk menambahkan.</td></tr>';
    fullTbody.innerHTML = '<tr><td colspan="20" style="text-align:center;">Tidak ada data</td></tr>';
    return;
  }

  // Populate Main UI Table
  tbody.innerHTML = data.map((s, i) => `
    <tr>
      <td style="text-align: center;"><input type="checkbox" class="cb-santri" value="${s.id}" onclick="updateBulkNaikKelas()"></td>
      <td>${i + 1}</td>
      <td><span class="badge-nis">${s.nis || '-'}</span></td>
      <td><strong>${s.nama || '-'}</strong></td>
      <td>${getKelasName(s)}</td>
      <td style="font-weight: 500; color: ${s.status_mondok === 'Tidak Aktif' ? '#EF4444' : '#10B981'}">${s.status_mondok || 'Aktif'}</td>
      <td>${s.jenis_kelamin === 'Laki-laki' ? 'L' : 'P'}</td>
      <td>${s.sekolah || '-'}</td>
      <td>${s.tanggal_masuk ? formatDate(s.tanggal_masuk) : '-'}</td>
      <td>
        <div class="action-btns">
          <button class="btn-action btn-detail" onclick="viewDetail('${s.id}')" title="Lihat Detail">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          <button class="btn-action btn-edit" onclick="editSantri('${s.id}')" title="Edit">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-action btn-delete" onclick="deleteSantri('${s.id}', '${(s.nama||'').replace(/'/g,"\\'")}')" title="Hapus">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  // Populate Hidden Full Table for Print and Excel
  fullTbody.innerHTML = data.map((s, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${s.nis || '-'}</td>
      <td>${s.nama || '-'}</td>
      <td>${s.nik || '-'}</td>
      <td>${getKelasName(s)}</td>
      <td>${s.status_mondok || 'Aktif'}</td>
      <td>${s.jenis_kelamin === 'Laki-laki' ? 'L' : 'P'}</td>
      <td>${s.tempat_lahir || '-'}</td>
      <td>${s.tanggal_lahir ? formatDate(s.tanggal_lahir) : '-'}</td>
      <td>${s.usia || '-'}</td>
      <td>${s.anak_ke || '-'}</td>
      <td>${s.sekolah || '-'}</td>
      <td>${s.tanggal_masuk ? formatDate(s.tanggal_masuk) : '-'}</td>
      <td>${s.nomor_hp || '-'}</td>
      <td>${s.alamat || '-'}</td>
      <td>${s.jml_fc_ijazah || 0} lbr</td>
      <td>${s.jml_fc_kk || 0} lbr</td>
      <td>${s.jml_fc_ktp_ayah || 0} lbr</td>
      <td>${s.jml_fc_ktp_ibu || 0} lbr</td>
      <td>${s.jml_foto_2x3 || 0} lbr</td>
      <td>${s.jml_foto_3x4 || 0} lbr</td>
      <td>${s.jml_foto_4x6 || 0} lbr</td>
    </tr>
  `).join('');
}

function populateFilterKelas() {
  const sel = document.getElementById('filterKelasSantri');
  const selTarget = document.getElementById('naik_kelas_id');
  sel.innerHTML = '<option value="">Semua Kelas</option>';
  selTarget.innerHTML = '<option value="">Pilih Tujuan Kelas Baru</option>';
  allMasterKelas.forEach(k => {
    sel.innerHTML += `<option value="${k.id}">${k.nama_kelas}</option>`;
    selTarget.innerHTML += `<option value="${k.id}">${k.nama_kelas}</option>`;
  });
  selTarget.innerHTML += `<option value="LULUS" style="font-weight:bold;color:#10B981;">Luluskan (Tamat)</option>`;
}

// ===== FILTER / SEARCH =====
function filterSantri() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  const kId = document.getElementById('filterKelasSantri').value;
  const filtered = allSantri.filter(s => {
    const matchQ = (s.nama || '').toLowerCase().includes(q) || (s.nis || '').toLowerCase().includes(q);
    const matchK = kId === '' || s.kelas_id === kId;
    return matchQ && matchK;
  });
  renderTable(filtered);
}

// ===== BULK NAIK KELAS =====
function toggleAllSantri(el) {
  const cbs = document.querySelectorAll('.cb-santri');
  cbs.forEach(cb => cb.checked = el.checked);
  updateBulkNaikKelas();
}
function updateBulkNaikKelas() {
  const cbs = document.querySelectorAll('.cb-santri:checked');
  document.getElementById('countSelectedSantri').textContent = cbs.length;
  document.getElementById('btnNaikKelasBulk').disabled = cbs.length === 0;
}
function openNaikKelasModal() {
  const count = document.querySelectorAll('.cb-santri:checked').length;
  if (count === 0) return;
  document.getElementById('naikKelasCountText').textContent = count;
  document.getElementById('naik_kelas_id').value = '';
  document.getElementById('naikKelasModalOverlay').classList.add('active');
}
function closeNaikKelasModal() {
  document.getElementById('naikKelasModalOverlay').classList.remove('active');
}
async function prosesNaikKelas() {
  const targetKId = document.getElementById('naik_kelas_id').value;
  if (!targetKId) return showToast('Pilih kelas tujuan dahulu!', 'error');

  const cbs = document.querySelectorAll('.cb-santri:checked');
  const ids = Array.from(cbs).map(cb => cb.value);

  const sb = getSupabase();
  let successCount = 0;
  showToast('Memproses kenaikan kelas, mohon tunggu...', 'info');
  document.getElementById('btnSimpanNaikKelas').disabled = true;

  try {
    for (let id of ids) {
      if (targetKId === 'LULUS') {
        await sb.from('data_induk_santri').update({ kelas_id: null, is_lulus: true }).eq('id', id);
      } else {
        await sb.from('data_induk_santri').update({ kelas_id: targetKId, is_lulus: false }).eq('id', id);
      }
      successCount++;
    }
    showToast(`Berhasil menaikkan/meluluskan ${successCount} santri!`, 'success');
    closeNaikKelasModal();
    loadSantri(); // Refresh table
  } catch (err) {
    showToast('Terjadi kesalahan: ' + err.message, 'error');
  }
  document.getElementById('btnSimpanNaikKelas').disabled = false;
}

// ===== FORM MODAL =====
function openFormModal(editData = null) {
  document.getElementById('formModalOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
  document.getElementById('santriForm').reset();
  document.getElementById('santriId').value = '';
  
  // Populate Kelas Dropdown
  const kelasSel = document.getElementById('kelas_id');
  kelasSel.innerHTML = '<option value="">Pilih Kelas Asal / Saat Ini</option>';
  allMasterKelas.forEach(k => {
    kelasSel.innerHTML += `<option value="${k.id}">${k.nama_kelas}</option>`;
  });
  kelasSel.innerHTML += '<option value="LULUS" style="font-weight:bold;">Lulus</option>';

  // Clear file statuses
  document.querySelectorAll('.file-status').forEach(el => el.textContent = '');

  if (editData) {
    document.getElementById('formModalTitle').textContent = 'Edit Data Santri';
    document.getElementById('santriId').value = editData.id;
    // Fill fields
    const fields = ['nis','nama','nik','kelas_id','status_mondok','jenis_kelamin','anak_ke','tempat_lahir','tanggal_lahir','usia','sekolah','tanggal_masuk','nomor_hp','alamat',
    'jml_fc_ijazah','jml_fc_kk','jml_fc_ktp_ayah','jml_fc_ktp_ibu','jml_foto_2x3','jml_foto_3x4','jml_foto_4x6'];
    fields.forEach(f => {
      const el = document.getElementById(f);
      if (el && editData[f] !== null && editData[f] !== undefined) el.value = editData[f];
    });
    // Show existing file statuses
    const fileFields = ['fc_ijazah','fc_kk','fc_ktp_ayah','fc_ktp_ibu','foto_2x3','foto_3x4','foto_4x6'];
    fileFields.forEach(f => {
      const statusEl = document.getElementById('status_' + f);
      if (statusEl && editData[f]) {
        statusEl.innerHTML = `<a href="${editData[f]}" target="_blank" style="color:#10B981; font-size:0.8rem;">✅ File tersimpan</a>`;
      }
    });
    if (editData.is_lulus) {
      document.getElementById('kelas_id').value = 'LULUS';
    }
  } else {
    document.getElementById('formModalTitle').textContent = 'Tambah Data Santri';
    // Auto-generate NIS for new entry
    generateNIS().then(nis => { document.getElementById('nis').value = nis; });
  }
}

function closeFormModal() {
  document.getElementById('formModalOverlay').classList.remove('active');
  document.body.style.overflow = '';
}

// ===== HITUNG USIA OTOMATIS =====
function hitungUsia() {
  const tgl = document.getElementById('tanggal_lahir').value;
  if (!tgl) return;
  const birth = new Date(tgl);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  document.getElementById('usia').value = age;
}

// ===== UPLOAD FILE =====
async function uploadFile(fileInput, folder) {
  const sb = getSupabase();
  if (!sb || !fileInput.files || !fileInput.files[0]) return null;
  
  const file = fileInput.files[0];
  const ext = file.name.split('.').pop();
  const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substr(2,6)}.${ext}`;

  const { data, error } = await sb.storage.from('berkas-santri').upload(fileName, file);
  
  if (error) {
    console.error('Upload error:', error);
    showToast('Gagal upload file: ' + error.message, 'error');
    return null;
  }
  
  const { data: urlData } = sb.storage.from('berkas-santri').getPublicUrl(fileName);
  return urlData.publicUrl;
}

// ===== SAVE (CREATE / UPDATE) =====
async function saveSantri(e) {
  e.preventDefault();
  const sb = getSupabase();
  if (!sb) { showToast('Sistem belum siap', 'error'); return; }
  
  const btnSave = document.getElementById('btnSave');
  btnSave.disabled = true;
  btnSave.innerHTML = '⏳ Menyimpan...';

  const id = document.getElementById('santriId').value;

  let kId = document.getElementById('kelas_id').value || null;
  let isLulus = false;
  if (kId === 'LULUS') {
      kId = null;
      isLulus = true;
  }

  // Build data object
  const record = {
    nis: document.getElementById('nis').value.trim(),
    nama: document.getElementById('nama').value.trim(),
    nik: document.getElementById('nik').value.trim(),
    kelas_id: kId,
    is_lulus: isLulus,
    status_mondok: document.getElementById('status_mondok').value,
    jenis_kelamin: document.getElementById('jenis_kelamin').value,
    anak_ke: document.getElementById('anak_ke').value ? parseInt(document.getElementById('anak_ke').value) : null,
    tempat_lahir: document.getElementById('tempat_lahir').value.trim(),
    tanggal_lahir: document.getElementById('tanggal_lahir').value || null,
    usia: document.getElementById('usia').value ? parseInt(document.getElementById('usia').value) : null,
    sekolah: document.getElementById('sekolah').value.trim(),
    tanggal_masuk: document.getElementById('tanggal_masuk').value || null,
    nomor_hp: document.getElementById('nomor_hp').value.trim(),
    alamat: document.getElementById('alamat').value.trim(),
    jml_fc_ijazah: document.getElementById('jml_fc_ijazah').value ? parseInt(document.getElementById('jml_fc_ijazah').value) : 0,
    jml_fc_kk: document.getElementById('jml_fc_kk').value ? parseInt(document.getElementById('jml_fc_kk').value) : 0,
    jml_fc_ktp_ayah: document.getElementById('jml_fc_ktp_ayah').value ? parseInt(document.getElementById('jml_fc_ktp_ayah').value) : 0,
    jml_fc_ktp_ibu: document.getElementById('jml_fc_ktp_ibu').value ? parseInt(document.getElementById('jml_fc_ktp_ibu').value) : 0,
    jml_foto_2x3: document.getElementById('jml_foto_2x3').value ? parseInt(document.getElementById('jml_foto_2x3').value) : 0,
    jml_foto_3x4: document.getElementById('jml_foto_3x4').value ? parseInt(document.getElementById('jml_foto_3x4').value) : 0,
    jml_foto_4x6: document.getElementById('jml_foto_4x6').value ? parseInt(document.getElementById('jml_foto_4x6').value) : 0,
  };

  // Upload files
  const fileFields = ['fc_ijazah','fc_kk','fc_ktp_ayah','fc_ktp_ibu','foto_2x3','foto_3x4','foto_4x6'];
  for (const f of fileFields) {
    const input = document.getElementById(f);
    if (input && input.files && input.files[0]) {
      const url = await uploadFile(input, f);
      if (url) record[f] = url;
    }
  }

  let error;
  if (id) {
    // UPDATE
    ({ error } = await sb.from('data_induk_santri').update(record).eq('id', id));
  } else {
    // INSERT
    ({ error } = await sb.from('data_induk_santri').insert([record]));
  }

  btnSave.disabled = false;
  btnSave.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Simpan Data`;

  if (error) {
    showToast('Gagal menyimpan: ' + error.message, 'error');
    return;
  }

  showToast(id ? 'Data berhasil diperbarui!' : 'Data berhasil ditambahkan!', 'success');
  closeFormModal();
  await loadSantri();
}

// ===== EDIT =====
function editSantri(id) {
  const data = allSantri.find(s => s.id === id);
  if (data) openFormModal(data);
}

// ===== DELETE =====
async function deleteSantri(id, nama) {
  const ok = await showCustomConfirm('Hapus Data Santri', `Apakah Anda yakin ingin menghapus data santri "${nama}"? Tindakan ini tidak dapat dibatalkan.`, { confirmText: 'Ya, Hapus', type: 'danger' });
  if (!ok) return;
  
  const sb = getSupabase();
  if (!sb) return;
  
  const { error } = await sb.from('data_induk_santri').delete().eq('id', id);
  
  if (error) {
    showToast('Gagal menghapus: ' + error.message, 'error');
    return;
  }

  showToast('Data berhasil dihapus!', 'success');
  await loadSantri();
}

// ===== VIEW DETAIL =====
function viewDetail(id) {
  const s = allSantri.find(x => x.id === id);
  if (!s) return;
  
  document.getElementById('detailModalOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';

  const fileLink = (url, label, jml) => {
    let text = jml ? `${jml} lembar` : '0 lembar';
    if (url) text = `<a href="${url}" target="_blank" class="file-link">📎 Cek File</a> (${text})`;
    return text;
  };

  document.getElementById('detailContent').innerHTML = `
    <div class="detail-grid">
      <div class="detail-section">
        <h4>📋 Data Pribadi</h4>
        <div class="detail-row"><span>NIS</span><strong>${s.nis || '-'}</strong></div>
        <div class="detail-row"><span>Nama</span><strong>${s.nama || '-'}</strong></div>
        <div class="detail-row"><span>NIK</span><strong>${s.nik || '-'}</strong></div>
        <div class="detail-row"><span>Jenis Kelamin</span><strong>${s.jenis_kelamin || '-'}</strong></div>
        <div class="detail-row"><span>Anak Ke</span><strong>${s.anak_ke || '-'}</strong></div>
        <div class="detail-row"><span>Tempat, Tgl Lahir</span><strong>${s.tempat_lahir || '-'}, ${s.tanggal_lahir ? formatDate(s.tanggal_lahir) : '-'}</strong></div>
        <div class="detail-row"><span>Usia</span><strong>${s.usia || '-'} tahun</strong></div>
        <div class="detail-row"><span>Sekolah Asal</span><strong>${s.sekolah || '-'}</strong></div>
        <div class="detail-row"><span>Tanggal Masuk</span><strong>${s.tanggal_masuk ? formatDate(s.tanggal_masuk) : '-'}</strong></div>
        <div class="detail-row"><span>No HP/WA</span><strong>${s.nomor_hp || '-'}</strong></div>
        <div class="detail-row"><span>Alamat</span><strong>${s.alamat || '-'}</strong></div>
      </div>
      <div class="detail-section">
        <h4>📂 Berkas-Berkas</h4>
        <div class="detail-row"><span>FC Ijazah</span><strong>${fileLink(s.fc_ijazah, 'FC Ijazah', s.jml_fc_ijazah)}</strong></div>
        <div class="detail-row"><span>FC Kartu Keluarga</span><strong>${fileLink(s.fc_kk, 'FC Kartu Keluarga', s.jml_fc_kk)}</strong></div>
        <div class="detail-row"><span>FC KTP Ayah</span><strong>${fileLink(s.fc_ktp_ayah, 'FC KTP Ayah', s.jml_fc_ktp_ayah)}</strong></div>
        <div class="detail-row"><span>FC KTP Ibu</span><strong>${fileLink(s.fc_ktp_ibu, 'FC KTP Ibu', s.jml_fc_ktp_ibu)}</strong></div>
        <div class="detail-row"><span>Foto 2x3</span><strong>${fileLink(s.foto_2x3, 'Foto 2x3', s.jml_foto_2x3)}</strong></div>
        <div class="detail-row"><span>Foto 3x4</span><strong>${fileLink(s.foto_3x4, 'Foto 3x4', s.jml_foto_3x4)}</strong></div>
        <div class="detail-row"><span>Foto 4x6</span><strong>${fileLink(s.foto_4x6, 'Foto 4x6', s.jml_foto_4x6)}</strong></div>
      </div>
    </div>
  `;
}

function closeDetailModal() {
  document.getElementById('detailModalOverlay').classList.remove('active');
  document.body.style.overflow = '';
}

// ===== UTILITIES =====
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;

  const iconMap = {
    success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><path d="M20 6L9 17l-5-5"></path></svg>',
    error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
    warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
  };

  const iconSvg = iconMap[type] || iconMap.info;
  toast.innerHTML = `<span class="toast-icon">${iconSvg}</span><span class="toast-text">${message}</span>`;
  toast.className = `toast ${type} show`;
  
  if (window._toastTimeout) clearTimeout(window._toastTimeout);
  window._toastTimeout = setTimeout(() => {
    toast.className = `toast ${type}`;
  }, 3200);
}

// Override default window.alert agar selalu memakai notifikasi toast yang indah
window.alert = function(message) {
  showToast(message, 'warning');
};

// ===== SIDEBAR =====
const sidebar = document.getElementById('sidebar');
const mainContent = document.querySelector('.main-content');

function toggleSidebar() {
  if (window.innerWidth <= 1024) {
    sidebar.classList.toggle('mobile-open');
    // Toggle overlay
    let overlay = document.getElementById('sidebarOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.classList.add('sidebar-overlay');
      overlay.id = 'sidebarOverlay';
      overlay.addEventListener('click', () => {
        sidebar.classList.remove('mobile-open');
        overlay.classList.remove('active');
      });
      document.body.appendChild(overlay);
    }
    if (sidebar.classList.contains('mobile-open')) {
      overlay.classList.add('active');
    } else {
      overlay.classList.remove('active');
    }
  } else {
    sidebar.classList.toggle('closed');
    mainContent.classList.toggle('expanded');
  }
}

window.addEventListener('resize', checkMobileView);
function checkMobileView() {
  if (window.innerWidth <= 1024) {
    sidebar.classList.remove('closed');
    mainContent.classList.remove('expanded');
  } else {
    sidebar.classList.remove('mobile-open');
    const overlay = document.getElementById('sidebarOverlay');
    if (overlay) overlay.classList.remove('active');
  }
}

// ====================================================
// ============= UNIVERSAL PRINT SYSTEM ===============
// ====================================================
function setPrintPageSize(orientation = 'portrait') {
  let styleEl = document.getElementById('dynamicPrintPageStyle');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'dynamicPrintPageStyle';
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = `@page { size: ${orientation}; margin: 10mm; }`;
}
window.setPrintPageSize = setPrintPageSize;

function doPrint(htmlContent, orientation = 'portrait') {
  if (typeof setPrintPageSize === 'function') {
    setPrintPageSize(orientation);
  }

  let container = document.getElementById('universalPrintContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'universalPrintContainer';
    container.className = 'print-area';
    document.body.appendChild(container);
  }

  // Hilangkan active-print dari print area manapun yang mungkin aktif
  document.querySelectorAll('.active-print').forEach(el => el.classList.remove('active-print'));

  container.innerHTML = htmlContent;
  container.classList.add('active-print');

  setTimeout(() => {
    window.print();
    setTimeout(() => {
      container.classList.remove('active-print');
      container.innerHTML = '';
    }, 600);
  }, 250);
}
window.doPrint = doPrint;

window.addEventListener('afterprint', () => {
  document.querySelectorAll('.active-print').forEach(el => el.classList.remove('active-print'));
  const container = document.getElementById('universalPrintContainer');
  if (container) {
    container.classList.remove('active-print');
    container.innerHTML = '';
  }
});

function printSantri() {
  setPrintPageSize('landscape');
  document.getElementById('printArea').classList.add('active-print');
  document.getElementById('printAreaLaporan').classList.remove('active-print');
  setTimeout(() => { window.print(); document.getElementById('printArea').classList.remove('active-print'); }, 300);
}

// ====================================================
// ============= LAPORAN OPERASIONAL LOGIC =============
// ====================================================

// Format Rupiah
function formatRupiah(angka) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
}

// Parse Rupiah dari input
function parseRupiah(str) {
  return parseInt(String(str).replace(/[^0-9]/g, '')) || 0;
}

// Load Laporan
async function loadLaporan() {
  const sb = getSupabase();
  if(!sb) return;
  
  const { data, error } = await sb.from('laporan_operasional')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    showToast('Gagal memuat data laporan', 'error');
    console.error(error);
    return;
  }
  
  allLaporan = data || [];
  renderLaporanTable(allLaporan);
}

function renderLaporanTable(data) {
  const tbody = document.getElementById('laporanTableBody');
  document.getElementById('countLaporan').textContent = `${data.length} laporan`;
  
  if(data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:#9CA3AF;">Belum ada laporan operasional. Klik "Buat Laporan Baru" untuk menambahkan.</td></tr>';
    return;
  }
  
  tbody.innerHTML = data.map((d, i) => {
    return `
      <tr>
        <td>${i+1}</td>
        <td><strong>${d.periode_bulan}</strong></td>
        <td>${formatDate(d.tanggal_laporan)}</td>
        <td>${d.nama_pengawas}</td>
        <td>${d.nama_bendahara}</td>
        <td>
          <div class="action-btns">
            <button class="btn-action btn-detail" onclick="viewLaporan('${d.id}')" title="Lihat/Print"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>
            <button class="btn-action btn-edit" onclick="editLaporan('${d.id}')" title="Edit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
            <button class="btn-action btn-delete" onclick="deleteLaporan('${d.id}', '${d.periode_bulan}')" title="Hapus"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
          </div>
        </td>
      </tr>
    `
  }).join('');
}

// Search
document.getElementById('searchLaporan')?.addEventListener('input', (e) => {
  const t = e.target.value.toLowerCase();
  renderLaporanTable(allLaporan.filter(l => l.periode_bulan.toLowerCase().includes(t)));
});

// Modal Input Laporan
function openLaporanModal() {
  document.getElementById('laporanModalOverlay').classList.add('active');
  document.getElementById('laporanForm').reset();
  document.getElementById('laporanId').value = '';
  document.getElementById('laporanModalTitle').textContent = 'Buat Laporan Operasional';
  
  document.getElementById('tanggal_laporan').value = new Date().toISOString().split('T')[0];
  document.getElementById('nama_pengawas').value = "MAYASAROH, S.Pd., M.Pd.";
  document.getElementById('nama_bendahara').value = "ELIANA";
  
  currentPemasukan = [{sumber:'', jumlah:0}];
  currentPengeluaran = [{jenis:'', jumlah:0}];
  renderDynamicRows();
}

function closeLaporanModal() {
  document.getElementById('laporanModalOverlay').classList.remove('active');
}

function renderDynamicRows() {
  const pCon = document.getElementById('pemasukanContainer');
  const eCon = document.getElementById('pengeluaranContainer');
  
  pCon.innerHTML = currentPemasukan.map((p, i) => `
    <div style="display:flex; gap:8px; align-items:center; margin-bottom:6px;">
      <input type="text" placeholder="Sumber Dana" value="${p.sumber}" onchange="updatePemasukan(${i}, 'sumber', this.value)" style="flex:2; padding:8px 10px; border:1px solid var(--gray-300); border-radius:8px; font-size:0.85rem;">
      <input type="number" placeholder="Rp" value="${p.jumlah}" onchange="updatePemasukan(${i}, 'jumlah', this.value)" style="flex:1; padding:8px 10px; border:1px solid var(--gray-300); border-radius:8px; font-size:0.85rem;">
      <button type="button" class="btn-action btn-delete" onclick="removePemasukan(${i})" title="Hapus Baris" style="width:34px; height:34px; border-radius:8px; flex-shrink:0;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
      </button>
    </div>
  `).join('');
  
  eCon.innerHTML = currentPengeluaran.map((p, i) => `
    <div style="display:flex; gap:8px; align-items:center; margin-bottom:6px;">
      <input type="text" placeholder="Jenis / Keterangan" value="${p.jenis}" onchange="updatePengeluaran(${i}, 'jenis', this.value)" style="flex:2; padding:8px 10px; border:1px solid var(--gray-300); border-radius:8px; font-size:0.85rem;">
      <input type="number" placeholder="Rp" value="${p.jumlah}" onchange="updatePengeluaran(${i}, 'jumlah', this.value)" style="flex:1; padding:8px 10px; border:1px solid var(--gray-300); border-radius:8px; font-size:0.85rem;">
      <button type="button" class="btn-action btn-delete" onclick="removePengeluaran(${i})" title="Hapus Baris" style="width:34px; height:34px; border-radius:8px; flex-shrink:0;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
      </button>
    </div>
  `).join('');
}

function addPemasukanRow() { currentPemasukan.push({sumber:'', jumlah:0}); renderDynamicRows(); }
function removePemasukan(idx) { currentPemasukan.splice(idx,1); renderDynamicRows(); }
function updatePemasukan(idx, fld, val) { 
  currentPemasukan[idx][fld] = fld === 'jumlah' ? Number(val) : val; 
}

function addPengeluaranRow() { currentPengeluaran.push({jenis:'', jumlah:0}); renderDynamicRows(); }
function removePengeluaran(idx) { currentPengeluaran.splice(idx,1); renderDynamicRows(); }
function updatePengeluaran(idx, fld, val) { 
  currentPengeluaran[idx][fld] = fld === 'jumlah' ? Number(val) : val; 
}

// Simpan Laporan
document.getElementById('laporanForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const sb = getSupabase();
  if(!sb) return;

  const btn = document.getElementById('btnSimpanLaporan');
  const oldText = btn.textContent;
  btn.textContent = 'Menyimpan...'; btn.disabled = true;

  try {
    const id = document.getElementById('laporanId').value;
    const data = {
      periode_bulan: document.getElementById('periode_bulan').value.trim(),
      tanggal_laporan: document.getElementById('tanggal_laporan').value,
      nama_pengawas: document.getElementById('nama_pengawas').value.trim(),
      nama_bendahara: document.getElementById('nama_bendahara').value.trim(),
      pemasukan: currentPemasukan.filter(p => String(p.sumber).trim() !== '' || Number(p.jumlah) > 0),
      pengeluaran: currentPengeluaran.filter(p => String(p.jenis).trim() !== '' || Number(p.jumlah) > 0)
    };

    if (id) {
       await sb.from('laporan_operasional').update(data).eq('id', id);
       showToast('Laporan berhasil diperbarui');
    } else {
       await sb.from('laporan_operasional').insert(data);
       showToast('Laporan berhasil ditambahkan');
    }
    closeLaporanModal();
    loadLaporan();
  } catch (err) {
    console.error(err);
    showToast('Gagal menyimpan laporan', 'error');
  } finally {
    btn.textContent = oldText; btn.disabled = false;
  }
});

// Edit & Delete
function editLaporan(id) {
  const d = allLaporan.find(x => x.id === id);
  if(!d) return;
  openLaporanModal();
  document.getElementById('laporanId').value = d.id;
  document.getElementById('periode_bulan').value = d.periode_bulan;
  document.getElementById('tanggal_laporan').value = d.tanggal_laporan;
  document.getElementById('nama_pengawas').value = d.nama_pengawas;
  document.getElementById('nama_bendahara').value = d.nama_bendahara;
  
  currentPemasukan = d.pemasukan && d.pemasukan.length ? JSON.parse(JSON.stringify(d.pemasukan)) : [{sumber:'', jumlah:0}];
  currentPengeluaran = d.pengeluaran && d.pengeluaran.length ? JSON.parse(JSON.stringify(d.pengeluaran)) : [{jenis:'', jumlah:0}];
  renderDynamicRows();
  document.getElementById('laporanModalTitle').textContent = 'Edit Laporan Operasional';
}

async function deleteLaporan(id, bulan) {
  const ok = await showCustomConfirm('Hapus Laporan', `Yakin ingin menghapus laporan bulan ${bulan}? Data tidak dapat dikembalikan.`, { confirmText: 'Ya, Hapus', type: 'danger' });
  if (!ok) return;
  const sb = getSupabase();
  if(!sb) return;
  
  const {error} = await sb.from('laporan_operasional').delete().eq('id', id);
  if(error) { showToast('Gagal menghapus', 'error'); }
  else { showToast('Berhasil dihapus'); loadLaporan(); }
}

// ----------------------------------------------------
// LOGIK LAPORAN VIEW & PRINT / EXCEL
// ----------------------------------------------------
let activePreviewLaporan = null;

function viewLaporan(id) {
  const d = allLaporan.find(x => x.id === id);
  if(!d) return;
  activePreviewLaporan = d;
  
  document.getElementById('laporanViewModalOverlay').classList.add('active');
  
  // Render structure into ViewContent (copying the raw HTML from printAreaLaporan)
  const content = document.getElementById('laporanViewContent');
  content.innerHTML = document.getElementById('printAreaLaporan').innerHTML;
  
  // Populate the exact structure recursively
  populateLaporanTableHTML(d, content);
  populateLaporanTableHTML(d, document.getElementById('printAreaLaporan')); // Prepare real print
}

function closeLaporanViewModal() {
  document.getElementById('laporanViewModalOverlay').classList.remove('active');
  activePreviewLaporan = null;
}

function populateLaporanTableHTML(d, container) {
  container.querySelector('#printLaporanTitle').innerHTML = `LAPORAN REALISASI ANGGARAN OPERASIONAL BULAN ${d.periode_bulan.toUpperCase()}<br>PONDOK PESANTREN AL FATHONAH KUDUKERAS`;
  
  const pem = d.pemasukan || [];
  const peng = d.pengeluaran || [];
  const maxRows = Math.max(pem.length, peng.length, 1);
  
  let tbodyHtml = '';
  let totPem = 0;
  let totPeng = 0;
  
  // Calculate TotPem first for starting the running balance
  pem.forEach(p => totPem += parseRupiah(p.jumlah));
  let runningBalance = totPem;

  for(let i=0; i<maxRows; i++) {
    const pRow = i < pem.length ? pem[i] : null;
    const eRow = i < peng.length ? peng[i] : null;
    
    let pSumber = pRow ? pRow.sumber : '';
    let pJml = pRow && pRow.jumlah > 0 ? formatRupiah(pRow.jumlah) : '';
    
    let eJenis = eRow ? eRow.jenis : '';
    let eJml = eRow && eRow.jumlah > 0 ? formatRupiah(eRow.jumlah) : '';
    
    if (eRow && eRow.jumlah > 0) {
      totPeng += parseRupiah(eRow.jumlah);
      runningBalance -= parseRupiah(eRow.jumlah);
    }
    
    // Peraturan visual: Saldo akhir hanya muncul di baris yang memiliki pengeluaran
    let saldoAkhirHtml = (eRow && eRow.jumlah > 0) ? formatRupiah(runningBalance) : '';
    
    tbodyHtml += `
      <tr>
        <td style="text-align:center;">${i+1}</td>
        <td>${pSumber ? pSumber.toUpperCase() : ''}</td>
        <td style="text-align:right;">${pJml}</td>
        <td>${eJenis}</td>
        <td style="text-align:right;">${eJml}</td>
        <td></td>
        <td style="text-align:right;">${saldoAkhirHtml}</td>
      </tr>
    `;
  }
  
  container.querySelector('#laporanTableFullBody').innerHTML = tbodyHtml;
  
  container.querySelector('#printLaporanTotalPemasukan').textContent = formatRupiah(totPem);
  container.querySelector('#printLaporanTotalPengeluaran').textContent = formatRupiah(totPeng);
  container.querySelector('#printLaporanSaldoAkhir').textContent = formatRupiah(runningBalance);
  
  container.querySelector('#printSigPengawas').textContent = d.nama_pengawas.toUpperCase();
  container.querySelector('#printSigBendahara').textContent = d.nama_bendahara.toUpperCase();
  
  const dDate = new Date(d.tanggal_laporan);
  const dateStr = dDate.getDate() + ' ' + dDate.toLocaleString('id-ID', {month:'long'}) + ' ' + dDate.getFullYear();
  container.querySelector('#printSigDate').textContent = dateStr;
}

function printLaporan() {
  setPrintPageSize('landscape');
  document.getElementById('printAreaLaporan').classList.add('active-print');
  document.getElementById('printArea').classList.remove('active-print');
  setTimeout(() => { window.print(); document.getElementById('printAreaLaporan').classList.remove('active-print'); }, 300);
}

function exportLaporanExcel() {
  if(!activePreviewLaporan) return;
  const d = activePreviewLaporan;
  try {
    const pem = d.pemasukan || [];
    const peng = d.pengeluaran || [];
    const maxRows = Math.max(pem.length, peng.length, 1);
    
    let ws_data = [
      ["PONDOK PESANTREN AL-FATHONAH KUDUKERAS"],
      ["Jl. H. Mastra No. 04, RT. 03 RW.03, Desa Kudukeras, Kec. Babakan, Kab. Cirebon, Jawa Barat 45191"],
      ["Telp/WA: 085323056221-089604194056 | Email: ponpesalfathonah7@gmail.com"],
      [""],
      [`LAPORAN REALISASI ANGGARAN OPERASIONAL BULAN ${d.periode_bulan.toUpperCase()}`],
      ["PONDOK PESANTREN AL FATHONAH KUDUKERAS"],
      [""],
      ["NO.", "PEMASUKAN", "", "PENGELUARAN", "", "KETERANGAN", "SALDO AKHIR (Rp)"],
      ["", "SUMBER", "SALDO AWAL (Rp)", "JENIS", "JUMLAH (Rp)", "", ""]
    ];
    
    let totPem = 0;
    let totPeng = 0;
    pem.forEach(p => totPem += parseRupiah(p.jumlah));
    let runningBalance = totPem;
    
    for(let i=0; i<maxRows; i++) {
        const pRow = i < pem.length ? pem[i] : null;
        const eRow = i < peng.length ? peng[i] : null;
        if(eRow && eRow.jumlah > 0) {
            totPeng += parseRupiah(eRow.jumlah);
            runningBalance -= parseRupiah(eRow.jumlah);
        }
        
        ws_data.push([
           i+1,
           pRow ? pRow.sumber.toUpperCase() : "",
           pRow && pRow.jumlah > 0 ? parseRupiah(pRow.jumlah) : "",
           eRow ? eRow.jenis : "",
           eRow && eRow.jumlah > 0 ? parseRupiah(eRow.jumlah) : "",
           "",
           (eRow && eRow.jumlah > 0) ? runningBalance : ""
        ]);
    }
    
    // Total Row
    ws_data.push(["TOTAL", "", totPem, "", totPeng, "", runningBalance]);
    ws_data.push([""]); ws_data.push([""]);
    
    const dDate = new Date(d.tanggal_laporan);
    const dateStr = dDate.getDate() + ' ' + dDate.toLocaleString('id-ID', {month:'long'}) + ' ' + dDate.getFullYear();
    
    // Signatures
    ws_data.push(["Mengetahui,", "", "", "", "", `Cirebon, ${dateStr}`]);
    ws_data.push(["Pengawas Yayasan Al-Fathonah", "", "", "", "", "Bendahara"]);
    ws_data.push(["", "", "", "", "", ""]);
    ws_data.push(["", "", "", "", "", ""]);
    ws_data.push([d.nama_pengawas.toUpperCase(), "", "", "", "", d.nama_bendahara.toUpperCase()]);
    
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    
    // Merge Cells (r: row, c: col)
    ws['!merges'] = [
        { s:{r:0,c:0}, e:{r:0,c:6} }, // Kop 1
        { s:{r:1,c:0}, e:{r:1,c:6} }, // Kop 2
        { s:{r:2,c:0}, e:{r:2,c:6} }, // Kop 3
        { s:{r:4,c:0}, e:{r:4,c:6} }, // Title 1
        { s:{r:5,c:0}, e:{r:5,c:6} }, // Title 2
        
        // Table Head
        { s:{r:7,c:0}, e:{r:8,c:0} }, // NO
        { s:{r:7,c:1}, e:{r:7,c:2} }, // Pemasukan Header
        { s:{r:7,c:3}, e:{r:7,c:4} }, // Pengeluaran Header
        { s:{r:7,c:5}, e:{r:8,c:5} }, // Keterangan
        { s:{r:7,c:6}, e:{r:8,c:6} }, // Saldo
        
        // Total row idx = 9 + maxRows
        { s:{r:9+maxRows,c:0}, e:{r:9+maxRows,c:1} },
        { s:{r:9+maxRows,c:3}, e:{r:9+maxRows,c:3} },
        
        // Signatures 
        { s:{r:12+maxRows,c:0}, e:{r:12+maxRows,c:2} },
        { s:{r:12+maxRows,c:5}, e:{r:12+maxRows,c:6} },
        { s:{r:13+maxRows,c:0}, e:{r:13+maxRows,c:2} },
        { s:{r:13+maxRows,c:5}, e:{r:13+maxRows,c:6} },
        { s:{r:16+maxRows,c:0}, e:{r:16+maxRows,c:2} },
        { s:{r:16+maxRows,c:5}, e:{r:16+maxRows,c:6} }
    ];
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Realisasi");
    XLSX.writeFile(wb, `Laporan_Realisasi_${d.periode_bulan.replace(' ','_')}.xlsx`);

  } catch (err) {
    console.error(err);
    showToast('Gagal export Excel', 'error');
  }
}

// ====================================================
// ============= PEMBAYARAN BULANAN ===================
// ====================================================

let allTagihan = [];
let currentTagihanId = null;
let currentTagihanData = null;
let allSantriTagihan = []; // Data agregasi santri untuk tagihan yang dipilih
let allTransaksiSantri = []; // Data transaksi santri terpilih untuk riwayat

async function loadTagihan() {
  const sb = getSupabase();
  if(!sb) return;
  const { data, error } = await sb.from('tagihan_bulanan')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    showToast('Gagal memuat data tagihan', 'error');
    console.error(error);
    return;
  }
  allTagihan = data || [];
  if (typeof filterSpp === 'function') filterSpp();
  if (typeof filterUangJajan === 'function') filterUangJajan();
  if (typeof filterBayarLainnya === 'function') filterBayarLainnya();
  if (document.getElementById('tagihanTableBody') && typeof filterTagihan === 'function') filterTagihan();
}

// ===== FORMAT RUPIAH / RIBUAN INPUT OTOMATIS =====
function formatRibuanInput(el) {
  if (!el) return;
  let val = el.value.replace(/[^0-9]/g, '');
  const num = parseInt(val, 10) || 0;
  el.value = num > 0 ? num.toLocaleString('id-ID') : '';
}
window.formatRibuanInput = formatRibuanInput;

function parseRibuanValue(val) {
  if (!val) return 0;
  return parseInt(String(val).replace(/[^0-9]/g, ''), 10) || 0;
}
window.parseRibuanValue = parseRibuanValue;

function terbilang(angka) {
  const bil = Number(angka);
  if (isNaN(bil) || bil === 0) return 'Nol';
  const angkaArr = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
  let temp = "";
  if (bil < 12) {
    temp = " " + angkaArr[bil];
  } else if (bil < 20) {
    temp = terbilang(bil - 10) + " Belas";
  } else if (bil < 100) {
    temp = terbilang(Math.floor(bil / 10)) + " Puluh" + terbilang(bil % 10);
  } else if (bil < 200) {
    temp = " Seratus" + terbilang(bil - 100);
  } else if (bil < 1000) {
    temp = terbilang(Math.floor(bil / 100)) + " Ratus" + terbilang(bil % 100);
  } else if (bil < 2000) {
    temp = " Seribu" + terbilang(bil - 1000);
  } else if (bil < 1000000) {
    temp = terbilang(Math.floor(bil / 1000)) + " Ribu" + terbilang(bil % 1000);
  } else if (bil < 1000000000) {
    temp = terbilang(Math.floor(bil / 1000000)) + " Juta" + terbilang(bil % 1000000);
  } else if (bil < 1000000000000) {
    temp = terbilang(Math.floor(bil / 1000000000)) + " Miliar" + terbilang(bil % 1000000000);
  }
  return temp.trim();
}

function printBayarLaporan() {
  if (!allTagihan || allTagihan.length === 0) {
    showToast('Tidak ada data tagihan untuk dicetak', 'error');
    return;
  }

  const now = new Date();
  const dateStr = now.getDate() + ' ' + now.toLocaleString('id-ID', { month: 'long' }) + ' ' + now.getFullYear();

  let rowsHtml = '';
  let totalNominal = 0;
  allTagihan.forEach((d, idx) => {
    const isJajan = d.kategori === 'Uang Jajan';
    const isWajib = !isJajan && (d.is_wajib !== false);
    const nom = isWajib ? Number(d.nominal_wajib || 0) : 0;
    totalNominal += nom;
    const nominalCol = isJajan ? '-' : (isWajib ? formatRupiah(nom) : 'Seikhlasnya');
    rowsHtml += `
      <tr>
        <td style="text-align:center;">${idx + 1}</td>
        <td><strong>${(d.kategori === 'Lainnya' && d.keterangan) ? `${d.keterangan} (${isWajib ? 'Wajib' : 'Seikhlasnya'})` : d.kategori}</strong></td>
        <td style="text-align:center;">${d.bulan}</td>
        <td style="text-align:center;">${d.tahun}</td>
        <td style="text-align:right;">${nominalCol}</td>
      </tr>
    `;
  });

  const reportHtml = `
    <div style="font-family: 'Times New Roman', Times, serif; padding: 20px; color: #111827; background: white;">
      <!-- KOP SURAT RESMI -->
      <div style="display: flex; align-items: center; justify-content: center; gap: 20px; border-bottom: 3px double #111827; padding-bottom: 12px; margin-bottom: 16px;">
        <img src="img/logo.png" alt="Logo" style="width: 85px; height: auto;" onerror="this.style.display='none'">
        <div style="text-align: center;">
          <h3 style="margin: 0; font-size: 1.1rem; letter-spacing: 1px; color: #047857;">PONDOK PESANTREN</h3>
          <h1 style="margin: 2px 0; font-size: 1.6rem; font-weight: 800; color: #047857;">AL-FATHONAH KUDUKERAS</h1>
          <p style="margin: 0; font-size: 0.85rem; color: #374151;">Jl. H. Mastra No. 04, RT. 03 RW.03, Desa Kudukeras, Kec. Babakan, Kab. Cirebon 45191</p>
          <p style="margin: 2px 0 0 0; font-size: 0.8rem; color: #4B5563;">Telp/WA: 085323056221 | Email: ponpesalfathonah7@gmail.com</p>
        </div>
      </div>

      <!-- JUDUL LAPORAN -->
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="font-size: 1.25rem; font-weight: bold; text-decoration: underline; text-transform: uppercase; margin: 0 0 4px 0;">
          REKAP DAFTAR PERIODE TAGIHAN & IURAN SANTRI
        </h2>
        <p style="margin: 0; font-size: 0.95rem; font-weight: 600; color: #4B5563;">
          Total: ${allTagihan.length} Periode
        </p>
      </div>

      <!-- TABEL -->
      <table class="report-table" style="width:100%; border-collapse:collapse; margin-bottom: 30px;">
        <thead>
          <tr>
            <th style="width:35px; text-align:center;">NO</th>
            <th>KATEGORI</th>
            <th style="text-align:center;">BULAN</th>
            <th style="text-align:center;">TAHUN</th>
            <th style="text-align:right;">NOMINAL WAJIB</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <!-- TANDA TANGAN -->
      <div style="display: flex; justify-content: space-between; align-items: flex-end; font-size: 0.9rem; margin-top: 30px; page-break-inside: avoid;">
        <div style="text-align: center; min-width: 200px;">
          <p style="margin-bottom: 60px;">Mengetahui,<br><strong>Pengawas Yayasan Al-Fathonah</strong></p>
          <p style="margin: 0;"><span style="display:inline-block; width:180px; border-bottom:1.5px solid #111827;"></span></p>
        </div>
        <div style="text-align: center; min-width: 200px;">
          <p style="margin-bottom: 60px;">Cirebon, ${dateStr}<br><strong>Bendahara</strong></p>
          <p style="margin: 0;"><span style="display:inline-block; width:180px; border-bottom:1.5px solid #111827;"></span></p>
        </div>
      </div>
    </div>
  `;

  doPrint(reportHtml, 'portrait');
}

// ==========================================
// ===== SEPARATED FINANCIAL VIEWS ==========
// ==========================================

async function filterSpp() {
  const sppList = (allTagihan || []).filter(d => d.kategori === 'SPP' || d.kategori === 'Yayasan');
  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  
  const elBulan = document.getElementById('filterBulanSpp');
  const elTahun = document.getElementById('filterTahunSpp');
  
  // Set default ke bulan dan tahun berjalan jika belum diinisialisasi
  if (elBulan && !elBulan.dataset.init) {
    elBulan.value = monthNames[new Date().getMonth()];
    elBulan.dataset.init = 'true';
  }
  if (elTahun && !elTahun.dataset.init) {
    elTahun.value = String(new Date().getFullYear());
    elTahun.dataset.init = 'true';
  }

  const filterBulan = elBulan ? elBulan.value : '';
  const filterTahun = elTahun ? elTahun.value : '';
  const searchEl = document.getElementById('searchSpp');
  const q = searchEl ? searchEl.value.toLowerCase().trim() : '';

  let filtered = sppList.filter(d => {
    const term = `${d.kategori} ${d.keterangan || ''} ${d.bulan} ${d.tahun} ${d.nominal_wajib || ''}`.toLowerCase();
    const matchQ = term.includes(q);
    const matchBulan = filterBulan === '' || d.bulan === filterBulan;
    const matchTahun = filterTahun === '' || String(d.tahun) === String(filterTahun);
    return matchQ && matchBulan && matchTahun;
  });

  const sb = getSupabase();

  // Pastikan data induk santri selalu termuat agar fleksibel saat santri bertambah / berkurang
  if (sb && (!allSantri || allSantri.length === 0)) {
    try {
      const { data: sData } = await sb.from('data_induk_santri').select('id, nama, status_mondok, is_lulus');
      if (sData) allSantri = sData;
    } catch (errSantri) {
      console.warn('Gagal memuat santri untuk statistik tunggakan:', errSantri);
    }
  }

  const ids = filtered.map(x => x.id);
  let paymentsMap = {};
  let tagihanSantriPay = {}; // { tagihan_id: { santri_id: totalBayar } }
  let totalUangMasuk = 0;

  if (sb && ids.length > 0) {
    const { data: payData } = await sb.from('pembayaran_bulanan')
      .select('tagihan_id, santri_id, nominal, jenis_transaksi')
      .in('tagihan_id', ids);
    if (payData) {
      payData.forEach(p => {
        if (p.jenis_transaksi === 'Pemasukan') {
          const nom = Number(p.nominal || 0);
          paymentsMap[p.tagihan_id] = (paymentsMap[p.tagihan_id] || 0) + nom;
          if (p.santri_id) {
            if (!tagihanSantriPay[p.tagihan_id]) tagihanSantriPay[p.tagihan_id] = {};
            tagihanSantriPay[p.tagihan_id][p.santri_id] = (tagihanSantriPay[p.tagihan_id][p.santri_id] || 0) + nom;
          }
        }
      });
    }
  }

  // Hitung total uang masuk (SPP santri masuk + Uang Yayasan)
  filtered.forEach(d => {
    if (d.kategori === 'Yayasan') {
      const masukYayasan = paymentsMap[d.id] ? paymentsMap[d.id] : Number(d.nominal_wajib || 0);
      totalUangMasuk += masukYayasan;
    } else if (d.kategori === 'SPP') {
      totalUangMasuk += (paymentsMap[d.id] || 0);
    }
  });

  // Hitung total santri dan estimasi target / tunggakan SPP secara otomatis dan fleksibel
  const totalSantriCount = (typeof allSantri !== 'undefined' && allSantri && allSantri.length > 0) ? allSantri.length : 0;
  let totalTunggakan = 0;
  let totalSantriBelumLunas = 0;
  let sppCount = 0;

  filtered.forEach(d => {
    if (d.kategori === 'SPP') {
      sppCount++;
      const nominalWajib = Number(d.nominal_wajib || 0);
      const targetTagihan = nominalWajib * totalSantriCount;
      const santriMap = tagihanSantriPay[d.id] || {};
      let unpaidInTagihan = 0;
      let tunggakanTagihan = 0;

      if (totalSantriCount > 0) {
        (allSantri || []).forEach(s => {
          const paid = santriMap[s.id] || 0;
          if (paid < nominalWajib) {
            tunggakanTagihan += (nominalWajib - paid);
            unpaidInTagihan++;
          }
        });
      } else {
        // Fallback jika santri belum terdaftar
        const terkumpul = paymentsMap[d.id] || 0;
        tunggakanTagihan = Math.max(0, targetTagihan - terkumpul);
      }

      totalTunggakan += tunggakanTagihan;
      totalSantriBelumLunas += unpaidInTagihan;
    }
  });

  // Hitung Total Pengeluaran (Belanja/Operasional) sesuai filter bulan dan tahun
  let monthNum = '';
  if (filterBulan) {
    const mIdx = monthNames.indexOf(filterBulan);
    if (mIdx !== -1) monthNum = String(mIdx + 1).padStart(2, '0');
  }

  let totalPengeluaran = 0;
  if (sb) {
    let queryBelanja = sb.from('transaksi_belanja').select('total_harga, tanggal');
    if (filterTahun && monthNum) {
      queryBelanja = queryBelanja.gte('tanggal', `${filterTahun}-${monthNum}-01`).lte('tanggal', `${filterTahun}-${monthNum}-31`);
    } else if (filterTahun) {
      queryBelanja = queryBelanja.gte('tanggal', `${filterTahun}-01-01`).lte('tanggal', `${filterTahun}-12-31`);
    } else if (monthNum) {
      const y = new Date().getFullYear();
      queryBelanja = queryBelanja.gte('tanggal', `${y}-${monthNum}-01`).lte('tanggal', `${y}-${monthNum}-31`);
    }
    const { data: bData } = await queryBelanja;
    if (bData) {
      bData.forEach(b => {
        totalPengeluaran += Number(b.total_harga || 0);
      });
    }
  }

  const sisaSaldo = totalUangMasuk - totalPengeluaran;

  const elPem = document.getElementById('statSppTotalPemasukan');
  const elPeng = document.getElementById('statSppTotalPengeluaran');
  const elTunggakan = document.getElementById('statSppTotalTunggakan');
  const elKetTunggakan = document.getElementById('statSppKetTunggakan');
  const elSaldo = document.getElementById('statSppSisaSaldo');

  if (elPem) elPem.textContent = formatRupiah(totalUangMasuk);
  if (elPeng) elPeng.textContent = formatRupiah(totalPengeluaran);
  if (elTunggakan) elTunggakan.textContent = formatRupiah(totalTunggakan);
  if (elKetTunggakan) {
    if (sppCount === 0) {
      elKetTunggakan.textContent = 'Tidak ada tagihan SPP';
      elKetTunggakan.style.color = '#94A3B8';
    } else if (totalSantriCount === 0) {
      elKetTunggakan.textContent = 'Data santri belum ada';
      elKetTunggakan.style.color = '#94A3B8';
    } else if (totalTunggakan === 0) {
      elKetTunggakan.textContent = `Lunas seluruh santri (${totalSantriCount} santri)`;
      elKetTunggakan.style.color = '#047857';
    } else {
      if (sppCount === 1) {
        elKetTunggakan.textContent = `${totalSantriBelumLunas} dari ${totalSantriCount} santri belum lunas`;
      } else {
        elKetTunggakan.textContent = `${totalSantriBelumLunas} santri nunggak (${sppCount} periode)`;
      }
      elKetTunggakan.style.color = '#B45309';
    }
  }
  if (elSaldo) {
    elSaldo.textContent = formatRupiah(sisaSaldo);
    elSaldo.style.color = sisaSaldo < 0 ? '#B91C1C' : '#4338CA';
  }

  const tbody = document.getElementById('sppTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (filtered.length === 0) {
    const infoPeriode = filterBulan ? `pada bulan ${filterBulan} ${filterTahun}` : '';
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:40px; color:#9CA3AF;">Belum ada data SPP / Uang Yayasan ${infoPeriode}. Silakan klik "+ Tambah Tagihan / Uang Masuk" atau ganti filter bulan.</td></tr>`;
    return;
  }

  filtered.forEach((d, idx) => {
    const isYayasan = d.kategori === 'Yayasan';
    const tr = document.createElement('tr');
    
    let katBadge = '';
    let targetDisplay = '';
    let terkumpulDisplay = '';
    let aksiBtn = '';

    if (isYayasan) {
      katBadge = `<span style="background: #FEF3C7; color: #92400E; font-weight: 700; padding: 4px 10px; border-radius: 8px; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 4px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v4M12 14v4M16 14v4"/></svg>
        Dana Yayasan
      </span>`;
      const masukYayasan = paymentsMap[d.id] ? paymentsMap[d.id] : Number(d.nominal_wajib || 0);
      targetDisplay = formatRupiah(d.nominal_wajib);
      terkumpulDisplay = `<span style="color:#047857; font-weight:700;">+ ${formatRupiah(masukYayasan)}</span>`;
      aksiBtn = `
        <div style="display:flex; gap:6px; align-items:center;">
          <button class="btn-action btn-edit" onclick="editTagihan('${d.id}')" title="Edit Uang Masuk Yayasan">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button class="btn-action btn-delete" onclick="deleteTagihan('${d.id}')" title="Hapus">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      `;
    } else {
      katBadge = `<span style="background: #DBEAFE; color: #1D4ED8; font-weight: 700; padding: 4px 10px; border-radius: 8px; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 4px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="2" y="4" width="20" height="16" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
        SPP Santri
      </span>`;
      const terkumpul = paymentsMap[d.id] || 0;
      targetDisplay = `<span style="color:#1E3A8A; font-weight:600;">${formatRupiah(d.nominal_wajib)}</span> <span style="font-size:0.75rem; color:#6B7280;">/ Santri</span>`;
      terkumpulDisplay = `<span style="color:#047857; font-weight:700;">+ ${formatRupiah(terkumpul)}</span>`;
      aksiBtn = `
        <div style="display:flex; gap:6px; align-items:center;">
          <button class="btn-action btn-detail" onclick="loadDetailTagihan('${d.id}')" title="Buka Data Santri">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </button>
          <button class="btn-action btn-edit" onclick="editTagihan('${d.id}')" title="Edit Tagihan">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button class="btn-action btn-delete" onclick="deleteTagihan('${d.id}')" title="Hapus Tagihan">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      `;
    }

    tr.innerHTML = `
      <td style="text-align:center;">${idx + 1}</td>
      <td>${katBadge}</td>
      <td style="font-weight:600;">${d.bulan}</td>
      <td style="font-weight:600;">${d.tahun}</td>
      <td>${targetDisplay}</td>
      <td>${terkumpulDisplay}</td>
      <td>${aksiBtn}</td>
    `;
    tbody.appendChild(tr);
  });
}

async function filterUangJajan() {
  const jajanList = (allTagihan || []).filter(d => d.kategori === 'Uang Jajan');
  const searchEl = document.getElementById('searchJajan');
  const q = searchEl ? searchEl.value.toLowerCase().trim() : '';

  let filtered = jajanList.filter(d => {
    const term = `${d.bulan} ${d.tahun}`.toLowerCase();
    return term.includes(q);
  });

  const tbody = document.getElementById('jajanTableBody');
  const elPeriode = document.getElementById('statJajanTotalPeriode');
  const elPem = document.getElementById('statJajanTotalPemasukan');
  const elPeng = document.getElementById('statJajanTotalPengeluaran');
  const elSaldo = document.getElementById('statJajanSisaSaldo');

  if (elPeriode) elPeriode.textContent = `${filtered.length} Periode`;

  if (filtered.length === 0) {
    if (elPem) elPem.textContent = 'Rp 0';
    if (elPeng) elPeng.textContent = 'Rp 0';
    if (elSaldo) elSaldo.textContent = 'Rp 0';
    if (tbody) tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:40px; color:#9CA3AF;">Belum ada periode Uang Jajan. Klik "+ Buka Periode Jajan" untuk membuat baru.</td></tr>';
    return;
  }

  const sb = getSupabase();
  const ids = filtered.map(x => x.id);
  let jajanMap = {};
  let totalMasuk = 0;
  let totalKeluar = 0;

  if (sb && ids.length > 0) {
    const { data } = await sb.from('pembayaran_bulanan')
      .select('tagihan_id, nominal, jenis_transaksi')
      .in('tagihan_id', ids);
    if (data) {
      data.forEach(p => {
        if (!jajanMap[p.tagihan_id]) jajanMap[p.tagihan_id] = { masuk: 0, keluar: 0 };
        const nom = Number(p.nominal || 0);
        if (p.jenis_transaksi === 'Pemasukan') {
          jajanMap[p.tagihan_id].masuk += nom;
          totalMasuk += nom;
        } else if (p.jenis_transaksi === 'Pengeluaran') {
          jajanMap[p.tagihan_id].keluar += nom;
          totalKeluar += nom;
        }
      });
    }
  }

  if (elPem) elPem.textContent = formatRupiah(totalMasuk);
  if (elPeng) elPeng.textContent = formatRupiah(totalKeluar);
  if (elSaldo) elSaldo.textContent = formatRupiah(totalMasuk - totalKeluar);

  if (!tbody) return;
  tbody.innerHTML = '';
  filtered.forEach((d, idx) => {
    const stat = jajanMap[d.id] || { masuk: 0, keluar: 0 };
    const saldo = stat.masuk - stat.keluar;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="text-align:center;">${idx + 1}</td>
      <td style="font-weight:600;">${d.bulan}</td>
      <td style="font-weight:600;">${d.tahun}</td>
      <td style="color:#047857; font-weight:700;">+ ${formatRupiah(stat.masuk)}</td>
      <td style="color:#B91C1C; font-weight:700;">- ${formatRupiah(stat.keluar)}</td>
      <td style="color:#4338CA; font-weight:800;">${formatRupiah(saldo)}</td>
      <td>
        <div style="display:flex; gap:6px; align-items:center;">
          <button class="btn-action btn-detail" onclick="loadDetailTagihan('${d.id}')" title="Kelola Santri & Saldo Jajan">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </button>
          <button class="btn-action btn-edit" onclick="editTagihan('${d.id}')" title="Edit Tagihan">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button class="btn-action btn-delete" onclick="deleteTagihan('${d.id}')" title="Hapus Tagihan">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function updateFilterNamaTagihanLainnyaOptions() {
  const selectEl = document.getElementById('filterNamaTagihanLainnya');
  if (!selectEl) return;
  const currentVal = selectEl.value;
  const lainnyaList = (allTagihan || []).filter(d => d.kategori === 'Lainnya');

  const uniqueNames = [];
  lainnyaList.forEach(d => {
    const name = (d.keterangan || '').trim();
    if (name && !uniqueNames.includes(name)) {
      uniqueNames.push(name);
    }
  });
  uniqueNames.sort((a, b) => a.localeCompare(b, 'id'));

  const existingValues = Array.from(selectEl.options).slice(1).map(o => o.value);
  if (JSON.stringify(existingValues) === JSON.stringify(uniqueNames)) {
    return;
  }

  selectEl.innerHTML = '<option value="">Semua Tagihan</option>';
  uniqueNames.forEach(name => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    if (name === currentVal) opt.selected = true;
    selectEl.appendChild(opt);
  });
}

async function filterBayarLainnya() {
  updateFilterNamaTagihanLainnyaOptions();

  const lainnyaList = (allTagihan || []).filter(d => d.kategori === 'Lainnya');
  const bulanEl = document.getElementById('filterBulanLainnya');
  const tahunEl = document.getElementById('filterTahunLainnya');
  const namaEl = document.getElementById('filterNamaTagihanLainnya');

  const filterBulan = bulanEl ? bulanEl.value.trim() : '';
  const filterTahun = tahunEl ? tahunEl.value.trim() : '';
  const filterNama = namaEl ? namaEl.value.trim() : '';

  let filtered = lainnyaList.filter(d => {
    const matchBulan = !filterBulan || d.bulan === filterBulan;
    const matchTahun = !filterTahun || String(d.tahun) === filterTahun;
    const matchNama = !filterNama || (d.keterangan || '').trim() === filterNama;
    return matchBulan && matchTahun && matchNama;
  });

  const tbody = document.getElementById('lainnyaTableBody');
  const elPeriode = document.getElementById('statLainnyaTotalPeriode');
  const elPem = document.getElementById('statLainnyaTotalPemasukan');
  const elSaldo = document.getElementById('statLainnyaSisaSaldo');

  if (elPeriode) elPeriode.textContent = `${filtered.length} Kegiatan`;

  if (filtered.length === 0) {
    if (elPem) elPem.textContent = 'Rp 0';
    if (elSaldo) elSaldo.textContent = 'Rp 0';
    if (tbody) tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:40px; color:#9CA3AF;">Belum ada tagihan lainnya yang sesuai filter. Klik "+ Tambah Tagihan Lainnya" untuk membuat baru.</td></tr>';
    return;
  }

  const sb = getSupabase();
  const ids = filtered.map(x => x.id);
  let lainnyaMap = {};
  let totalMasuk = 0;
  let totalKeluar = 0;

  if (sb && ids.length > 0) {
    const { data } = await sb.from('pembayaran_bulanan')
      .select('tagihan_id, nominal, jenis_transaksi')
      .in('tagihan_id', ids);
    if (data) {
      data.forEach(p => {
        if (!lainnyaMap[p.tagihan_id]) lainnyaMap[p.tagihan_id] = { masuk: 0, keluar: 0 };
        const nom = Number(p.nominal || 0);
        if (p.jenis_transaksi === 'Pemasukan') {
          lainnyaMap[p.tagihan_id].masuk += nom;
          totalMasuk += nom;
        } else if (p.jenis_transaksi === 'Pengeluaran') {
          lainnyaMap[p.tagihan_id].keluar += nom;
          totalKeluar += nom;
        }
      });
    }
  }

  if (elPem) elPem.textContent = formatRupiah(totalMasuk);
  if (elSaldo) elSaldo.textContent = formatRupiah(totalMasuk - totalKeluar);

  if (!tbody) return;
  tbody.innerHTML = '';
  filtered.forEach((d, idx) => {
    const stat = lainnyaMap[d.id] || { masuk: 0, keluar: 0 };
    const isWajib = d.is_wajib !== false;
    const badgeWajib = isWajib 
      ? `<span style="display:inline-block; font-size:0.75rem; background:#FEF3C7; color:#92400E; font-weight:600; padding:2px 8px; border-radius:6px;">Wajib</span>`
      : `<span style="display:inline-block; font-size:0.75rem; background:#D1FAE5; color:#065F46; font-weight:600; padding:2px 8px; border-radius:6px;">Sukarela / Infaq</span>`;
    
    const nominalTarget = isWajib ? formatRupiah(d.nominal_wajib) : '<span style="color:#059669; font-weight:600;">Seikhlasnya</span>';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="text-align:center;">${idx + 1}</td>
      <td style="font-weight:700; color:#1E3A8A; font-size:0.95rem;">${d.keterangan || 'Pembayaran Lainnya'}</td>
      <td>${badgeWajib}</td>
      <td>${d.bulan} ${d.tahun}</td>
      <td style="font-weight:600;">${nominalTarget}</td>
      <td style="color:#047857; font-weight:700;">${formatRupiah(stat.masuk)}</td>
      <td>
        <div style="display:flex; gap:6px; align-items:center;">
          <button class="btn-action btn-detail" onclick="loadDetailTagihan('${d.id}')" title="Buka Data Santri & Tagihan">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </button>
          <button class="btn-action btn-edit" onclick="editTagihan('${d.id}')" title="Edit Tagihan">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button class="btn-action btn-delete" onclick="deleteTagihan('${d.id}')" title="Hapus Tagihan">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function printCategoryLaporan(category) {
  let list = [];
  if (category === 'SPP') {
    const fBulan = document.getElementById('filterBulanSpp') ? document.getElementById('filterBulanSpp').value : '';
    const fTahun = document.getElementById('filterTahunSpp') ? document.getElementById('filterTahunSpp').value : '';
    list = (allTagihan || []).filter(d => {
      const matchKat = (d.kategori === 'SPP' || d.kategori === 'Yayasan');
      const matchBulan = fBulan === '' || d.bulan === fBulan;
      const matchTahun = fTahun === '' || String(d.tahun) === String(fTahun);
      return matchKat && matchBulan && matchTahun;
    });
  } else if (category === 'Lainnya') {
    const fBulan = document.getElementById('filterBulanLainnya') ? document.getElementById('filterBulanLainnya').value : '';
    const fTahun = document.getElementById('filterTahunLainnya') ? document.getElementById('filterTahunLainnya').value : '';
    const fNama = document.getElementById('filterNamaTagihanLainnya') ? document.getElementById('filterNamaTagihanLainnya').value : '';
    list = (allTagihan || []).filter(d => {
      const matchKat = d.kategori === 'Lainnya';
      const matchBulan = fBulan === '' || d.bulan === fBulan;
      const matchTahun = fTahun === '' || String(d.tahun) === String(fTahun);
      const matchNama = fNama === '' || (d.keterangan || '').trim() === fNama;
      return matchKat && matchBulan && matchTahun && matchNama;
    });
  } else {
    list = (allTagihan || []).filter(d => d.kategori === category);
  }

  if (list.length === 0) {
    showToast(`Tidak ada data ${category} untuk dicetak pada filter yang dipilih`, 'error');
    return;
  }

  const now = new Date();
  const dateStr = now.getDate() + ' ' + now.toLocaleString('id-ID', { month: 'long' }) + ' ' + now.getFullYear();

  let rowsHtml = '';
  list.forEach((d, idx) => {
    const isJajan = d.kategori === 'Uang Jajan';
    const isWajib = !isJajan && (d.is_wajib !== false);
    const nomStr = isJajan ? 'Saldo Jajan' : (isWajib ? formatRupiah(d.nominal_wajib) : 'Sukarela / Seikhlasnya');
    const namaJudul = (d.kategori === 'Lainnya' && d.keterangan) ? d.keterangan : d.kategori;

    rowsHtml += `
      <tr>
        <td style="text-align:center;">${idx + 1}</td>
        <td><strong>${namaJudul}</strong></td>
        <td style="text-align:center;">${d.bulan}</td>
        <td style="text-align:center;">${d.tahun}</td>
        <td style="text-align:right;">${nomStr}</td>
      </tr>
    `;
  });

  const reportHtml = `
    <div style="font-family: 'Times New Roman', Times, serif; padding: 20px; color: #111827; background: white;">
      <div style="display: flex; align-items: center; justify-content: center; gap: 20px; border-bottom: 3px double #111827; padding-bottom: 12px; margin-bottom: 16px;">
        <img src="img/logo.png" alt="Logo" style="width: 85px; height: auto;" onerror="this.style.display='none'">
        <div style="text-align: center;">
          <h3 style="margin: 0; font-size: 1.1rem; letter-spacing: 1px; color: #047857;">PONDOK PESANTREN</h3>
          <h1 style="margin: 2px 0; font-size: 1.6rem; font-weight: 800; color: #047857;">AL-FATHONAH KUDUKERAS</h1>
          <p style="margin: 0; font-size: 0.85rem; color: #374151;">Jl. H. Mastra No. 04, RT. 03 RW.03, Desa Kudukeras, Kec. Babakan, Kab. Cirebon 45191</p>
          <p style="margin: 2px 0 0 0; font-size: 0.8rem; color: #4B5563;">Telp/WA: 085323056221 | Email: ponpesalfathonah7@gmail.com</p>
        </div>
      </div>

      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="font-size: 1.25rem; font-weight: bold; text-decoration: underline; text-transform: uppercase; margin: 0 0 4px 0;">
          REKAP DAFTAR PERIODE ${category.toUpperCase()} SANTRI
        </h2>
        <p style="margin: 0; font-size: 0.95rem; font-weight: 600; color: #4B5563;">
          Total: ${list.length} Periode / Kegiatan
        </p>
      </div>

      <table class="report-table" style="width:100%; border-collapse:collapse; margin-bottom: 30px;">
        <thead>
          <tr>
            <th style="width:35px; text-align:center;">NO</th>
            <th>NAMA / KETERANGAN</th>
            <th style="text-align:center;">BULAN</th>
            <th style="text-align:center;">TAHUN</th>
            <th style="text-align:right;">KETETAPAN / NOMINAL</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <div style="display: flex; justify-content: space-between; align-items: flex-end; font-size: 0.9rem; margin-top: 30px; page-break-inside: avoid;">
        <div style="text-align: center; min-width: 200px;">
          <p style="margin-bottom: 60px;">Mengetahui,<br><strong>Pengawas Yayasan Al-Fathonah</strong></p>
          <p style="margin: 0;"><span style="display:inline-block; width:180px; border-bottom:1.5px solid #111827;"></span></p>
        </div>
        <div style="text-align: center; min-width: 200px;">
          <p style="margin-bottom: 60px;">Cirebon, ${dateStr}<br><strong>Bendahara</strong></p>
          <p style="margin: 0;"><span style="display:inline-block; width:180px; border-bottom:1.5px solid #111827;"></span></p>
        </div>
      </div>
    </div>
  `;

  doPrint(reportHtml, 'portrait');
}

function filterTagihan() {
  const searchEl = document.getElementById('searchTagihan');
  const catEl = document.getElementById('filterKategoriTagihan');
  const q = searchEl ? searchEl.value.toLowerCase() : '';
  const cat = catEl ? catEl.value : '';
  
  let filtered = allTagihan.filter(d => {
    const term = `${d.kategori} ${d.keterangan || ''} ${d.bulan} ${d.tahun}`.toLowerCase();
    const matchQ = term.includes(q);
    const matchCat = cat === '' || d.kategori === cat;
    return matchQ && matchCat;
  });

  // Hitung ringkasan statistik all tagihan
  let totalPeriode = filtered.length;
  const elPeriode = document.getElementById('statBayarTotalPeriode');
  const elPem = document.getElementById('statBayarTotalPemasukan');
  const elPeng = document.getElementById('statBayarTotalPengeluaran');
  const elSaldo = document.getElementById('statBayarSisaSaldo');

  if (elPeriode) elPeriode.textContent = `${totalPeriode} Periode`;

  if (filtered.length === 0) {
    if (elPem) elPem.textContent = 'Rp 0';
    if (elPeng) elPeng.textContent = 'Rp 0';
    if (elSaldo) elSaldo.textContent = 'Rp 0';
  } else {
    const activeIds = filtered.map(t => t.id);
    const sb = getSupabase();
    if (sb) {
      sb.from('pembayaran_bulanan')
        .select('nominal, jenis_transaksi')
        .in('tagihan_id', activeIds)
        .then(({ data, error }) => {
          let totalPemasukanAll = 0;
          let totalPengeluaranAll = 0;
          if (!error && data) {
            data.forEach(t => {
              if (t.jenis_transaksi === 'Pemasukan') totalPemasukanAll += Number(t.nominal || 0);
              else if (t.jenis_transaksi === 'Pengeluaran') totalPengeluaranAll += Number(t.nominal || 0);
            });
          }
          if (elPem) elPem.textContent = formatRupiah(totalPemasukanAll);
          if (elPeng) elPeng.textContent = formatRupiah(totalPengeluaranAll);
          if (elSaldo) elSaldo.textContent = formatRupiah(totalPemasukanAll - totalPengeluaranAll);
        });
    }
  }

  const tbody = document.getElementById('tagihanTableBody');
  tbody.innerHTML = '';
  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:40px; color:#9CA3AF;">Tidak ada data periode/tagihan</td></tr>';
    return;
  }

  filtered.forEach((d, i) => {
    const tr = document.createElement('tr');
    const isJajan = d.kategori === 'Uang Jajan';
    const isWajib = !isJajan && (d.is_wajib !== false);
    
    let katDisplay = `<strong>${d.kategori}</strong>`;
    if (d.kategori === 'Lainnya') {
      const nama = d.keterangan || 'Lainnya';
      const badgeWajib = isWajib 
        ? `<span style="display:inline-block; font-size:0.72rem; background:#FEF3C7; color:#92400E; font-weight:600; padding:1px 6px; border-radius:4px; margin-top:2px;">Wajib</span>`
        : `<span style="display:inline-block; font-size:0.72rem; background:#D1FAE5; color:#065F46; font-weight:600; padding:1px 6px; border-radius:4px; margin-top:2px;">Sukarela / Seikhlasnya</span>`;
      katDisplay = `<div><strong style="color: #1E3A8A; font-size: 0.95rem;">${nama}</strong><br>${badgeWajib}</div>`;
    }
    
    let nominalDisplay = '-';
    if (isJajan) {
      nominalDisplay = `<span style="color:#6B7280;">Saldo Jajan</span>`;
    } else if (isWajib) {
      nominalDisplay = formatRupiah(d.nominal_wajib);
    } else {
      nominalDisplay = `<span style="color:#059669; font-weight:600;">Seikhlasnya</span>`;
    }

    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${katDisplay}</td>
      <td>${d.bulan}</td>
      <td>${d.tahun}</td>
      <td>${nominalDisplay}</td>
      <td>
        <div style="display:flex; gap:6px; align-items:center;">
          <button class="btn-action btn-detail" onclick="loadDetailTagihan('${d.id}')" title="Kelola Data Santri">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </button>
          <button class="btn-action btn-edit" onclick="editTagihan('${d.id}')" title="Edit Tagihan">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button class="btn-action btn-delete" onclick="deleteTagihan('${d.id}')" title="Hapus Tagihan">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function openTagihanModal(context) {
  const overlay = document.getElementById('tagihanModalOverlay');
  if (!overlay) return;
  overlay.classList.add('active');
  document.getElementById('tagihanForm').reset();
  document.getElementById('tagihanId').value = '';

  const elKat = document.getElementById('tagihan_kategori');
  const groupKet = document.getElementById('group_tagihan_keterangan');
  const inputKet = document.getElementById('tagihan_keterangan');
  const groupIsWajib = document.getElementById('group_tagihan_is_wajib');
  const cbWajib = document.getElementById('tagihan_is_wajib');
  const modalTitle = document.getElementById('tagihanModalTitle');

  if (context === 'SPP' || context === 'Yayasan') {
    // Menu SPP: pilihan hanya SPP Santri dan Uang Masuk Yayasan
    elKat.innerHTML = `
      <option value="SPP">SPP Santri</option>
      <option value="Yayasan">Uang Masuk Yayasan</option>
    `;
    elKat.value = context;
    modalTitle.textContent = context === 'Yayasan' ? 'Pencatatan Uang Masuk Yayasan' : 'Tambah Periode SPP Santri';
  } else if (context === 'Uang Jajan') {
    elKat.innerHTML = `<option value="Uang Jajan">Uang Jajan Santri</option>`;
    elKat.value = 'Uang Jajan';
    modalTitle.textContent = 'Buka Periode Uang Jajan';
  } else if (context === 'Lainnya') {
    elKat.innerHTML = `<option value="Lainnya">Pembayaran Lainnya</option>`;
    elKat.value = 'Lainnya';
    modalTitle.textContent = 'Tambah Tagihan Lainnya';
  } else {
    elKat.innerHTML = `
      <option value="SPP">SPP Santri</option>
      <option value="Yayasan">Uang Masuk Yayasan</option>
      <option value="Uang Jajan">Uang Jajan Santri</option>
      <option value="Lainnya">Pembayaran Lainnya</option>
    `;
    if (context) elKat.value = context;
    modalTitle.textContent = 'Tambah Tagihan / Periode';
  }

  document.getElementById('tagihan_tahun').value = new Date().getFullYear();
  if (cbWajib) cbWajib.checked = true;
  if (inputKet) inputKet.value = '';

  toggleTagihanNominal();
}

function closeTagihanModal() {
  document.getElementById('tagihanModalOverlay').classList.remove('active');
}

function toggleTagihanNominal() {
  const cat = document.getElementById('tagihan_kategori').value;
  const groupNominal = document.getElementById('group_tagihan_nominal');
  const inputNominal = document.getElementById('tagihan_nominal_wajib');
  const lblNominal = document.getElementById('lbl_tagihan_nominal');
  const groupKet = document.getElementById('group_tagihan_keterangan');
  const inputKet = document.getElementById('tagihan_keterangan');
  const groupIsWajib = document.getElementById('group_tagihan_is_wajib');
  const cbIsWajib = document.getElementById('tagihan_is_wajib');

  if (cat === 'SPP') {
    // SPP: Selalu Wajib, tanpa checkbox
    if (groupIsWajib) groupIsWajib.style.display = 'none';
    if (groupKet) groupKet.style.display = 'none';
    if (groupNominal) groupNominal.style.display = 'block';
    if (lblNominal) lblNominal.innerHTML = 'Nominal SPP per Santri (Rp) <span class="req">*</span>';
    if (inputNominal) {
      inputNominal.setAttribute('required', 'true');
      inputNominal.placeholder = 'Contoh: 150000';
    }
  } else if (cat === 'Yayasan') {
    // Yayasan: Cukup periode dan form nominal uang masuk saja
    if (groupIsWajib) groupIsWajib.style.display = 'none';
    if (groupKet) groupKet.style.display = 'none';
    if (groupNominal) groupNominal.style.display = 'block';
    if (lblNominal) lblNominal.innerHTML = 'Nominal Uang Masuk Yayasan (Rp) <span class="req">*</span>';
    if (inputNominal) {
      inputNominal.setAttribute('required', 'true');
      inputNominal.placeholder = 'Contoh: 5000000';
    }
  } else if (cat === 'Uang Jajan') {
    if (groupIsWajib) groupIsWajib.style.display = 'none';
    if (groupKet) groupKet.style.display = 'none';
    if (groupNominal) groupNominal.style.display = 'none';
    if (inputNominal) inputNominal.removeAttribute('required');
  } else if (cat === 'Lainnya') {
    if (groupKet) groupKet.style.display = 'block';
    if (groupIsWajib) groupIsWajib.style.display = 'block';
    const isWajib = cbIsWajib ? cbIsWajib.checked : true;
    if (isWajib) {
      if (groupNominal) groupNominal.style.display = 'block';
      if (lblNominal) lblNominal.innerHTML = 'Nominal Target per Santri (Rp) <span class="req">*</span>';
      if (inputNominal) inputNominal.setAttribute('required', 'true');
    } else {
      if (groupNominal) groupNominal.style.display = 'none';
      if (inputNominal) inputNominal.removeAttribute('required');
    }
  }
}

document.getElementById('tagihanForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const sb = getSupabase();
  if(!sb) return;

  const btn = document.getElementById('btnSimpanTagihan');
  const oldText = btn.textContent;
  btn.textContent = 'Menyimpan...'; btn.disabled = true;

  try {
    const id = document.getElementById('tagihanId').value;
    const cat = document.getElementById('tagihan_kategori').value;
    const ketVal = document.getElementById('tagihan_keterangan') ? document.getElementById('tagihan_keterangan').value.trim() : '';
    const cbWajib = document.getElementById('tagihan_is_wajib');
    
    let isWajib = true;
    let nominalVal = parseRibuanValue(document.getElementById('tagihan_nominal_wajib').value);

    if (cat === 'Uang Jajan') {
      isWajib = false;
      nominalVal = 0;
    } else if (cat === 'Yayasan') {
      isWajib = false;
      nominalVal = parseRibuanValue(document.getElementById('tagihan_nominal_wajib').value);
    } else if (cat === 'SPP') {
      isWajib = true;
      nominalVal = parseRibuanValue(document.getElementById('tagihan_nominal_wajib').value);
    } else if (cat === 'Lainnya') {
      isWajib = cbWajib ? cbWajib.checked : true;
      nominalVal = isWajib ? parseRibuanValue(document.getElementById('tagihan_nominal_wajib').value) : 0;
    }

    const payload = {
      kategori: cat,
      keterangan: cat === 'Yayasan' ? 'Dana Masuk Yayasan' : (cat === 'Lainnya' ? (ketVal || 'Lainnya') : (ketVal || null)),
      is_wajib: isWajib,
      bulan: document.getElementById('tagihan_bulan').value,
      tahun: document.getElementById('tagihan_tahun').value,
      nominal_wajib: nominalVal
    };

    if (id) {
      let { error } = await sb.from('tagihan_bulanan').update(payload).eq('id', id);
      if (error && error.message && (error.message.includes('keterangan') || error.message.includes('is_wajib'))) {
        delete payload.is_wajib;
        delete payload.keterangan;
        const res = await sb.from('tagihan_bulanan').update(payload).eq('id', id);
        error = res.error;
      }
      if(error) throw error;

      // Jika kategori Yayasan, sinkronkan juga catatan di pembayaran_bulanan
      if (cat === 'Yayasan') {
        const { data: existingPay } = await sb.from('pembayaran_bulanan').select('id').eq('tagihan_id', id).maybeSingle();
        if (existingPay) {
          await sb.from('pembayaran_bulanan').update({
            nominal: nominalVal,
            bulan: payload.bulan,
            tahun: payload.tahun,
            keterangan: 'Dana Masuk Yayasan (' + payload.bulan + ' ' + payload.tahun + ')'
          }).eq('id', existingPay.id);
        } else {
          await sb.from('pembayaran_bulanan').insert({
            tagihan_id: id,
            santri_id: null,
            nominal: nominalVal,
            jenis_transaksi: 'Pemasukan',
            metode: 'Transfer',
            keterangan: 'Dana Masuk Yayasan (' + payload.bulan + ' ' + payload.tahun + ')',
            tgl_bayar: new Date().toISOString().split('T')[0],
            bulan: payload.bulan,
            tahun: payload.tahun
          });
        }
      }

      showToast('Data berhasil diperbarui');
    } else {
      let { data: newTagihan, error } = await sb.from('tagihan_bulanan').insert(payload).select().single();
      if (error && error.message && (error.message.includes('keterangan') || error.message.includes('is_wajib'))) {
        delete payload.is_wajib;
        delete payload.keterangan;
        const res = await sb.from('tagihan_bulanan').insert(payload).select().single();
        error = res.error;
        newTagihan = res.data;
      }
      if(error) throw error;

      // Jika kategori Yayasan, otomatis catat transaksi uang masuk di pembayaran_bulanan
      if (cat === 'Yayasan' && newTagihan && newTagihan.id) {
        await sb.from('pembayaran_bulanan').insert({
          tagihan_id: newTagihan.id,
          santri_id: null,
          nominal: nominalVal,
          jenis_transaksi: 'Pemasukan',
          metode: 'Transfer',
          keterangan: 'Dana Masuk Yayasan (' + payload.bulan + ' ' + payload.tahun + ')',
          tgl_bayar: new Date().toISOString().split('T')[0],
          bulan: payload.bulan,
          tahun: payload.tahun
        });
      }

      showToast(cat === 'Yayasan' ? 'Uang masuk yayasan berhasil dicatat' : 'Tagihan berhasil dibuat');
    }

    closeTagihanModal();
    loadTagihan();
    if (typeof loadRiwayatKeuangan === 'function') loadRiwayatKeuangan();
  } catch (err) {
    console.error(err);
    showToast('Terjadi kesalahan: ' + err.message, 'error');
  } finally {
    btn.textContent = oldText; btn.disabled = false;
  }
});

function editTagihan(id) {
  const d = allTagihan.find(x => x.id === id);
  if(!d) return;
  const isSppContext = (d.kategori === 'SPP' || d.kategori === 'Yayasan');
  openTagihanModal(isSppContext ? 'SPP' : d.kategori);
  document.getElementById('tagihanId').value = d.id;
  document.getElementById('tagihan_kategori').value = d.kategori;
  const elKet = document.getElementById('tagihan_keterangan');
  if (elKet) elKet.value = d.keterangan || '';
  const cbWajib = document.getElementById('tagihan_is_wajib');
  if (cbWajib) cbWajib.checked = d.is_wajib !== false;
  document.getElementById('tagihan_bulan').value = d.bulan;
  document.getElementById('tagihan_tahun').value = d.tahun;
  document.getElementById('tagihan_nominal_wajib').value = d.nominal_wajib ? Number(d.nominal_wajib).toLocaleString('id-ID') : '';
  document.getElementById('tagihanModalTitle').textContent = 'Edit ' + (d.kategori === 'Yayasan' ? 'Uang Masuk Yayasan' : 'Tagihan / Periode');
  toggleTagihanNominal();
}

async function deleteTagihan(id) {
  const ok = await showCustomConfirm('Hapus Tagihan', 'Yakin menghapus? Semua transaksi santri pada tagihan ini juga akan ikut terhapus.', { confirmText: 'Ya, Hapus', type: 'danger' });
  if(!ok) return;
  const sb = getSupabase();
  if(!sb) return;
  
  // Hapus semua transaksi pembayaran_bulanan yang terkait dengan tagihan ini terlebih dahulu
  await sb.from('pembayaran_bulanan').delete().eq('tagihan_id', id);

  const {error} = await sb.from('tagihan_bulanan').delete().eq('id', id);
  if(error) {
    showToast('Gagal menghapus: ' + error.message, 'error');
  } else {
    showToast('Tagihan dan riwayat transaksi terkait berhasil dihapus');
    loadTagihan();
    if (typeof loadRiwayatKeuangan === 'function') loadRiwayatKeuangan();
  }
}

// ==========================================
// ===== DETAIL TAGIHAN & TRANSAKSI =====
// ==========================================

async function loadDetailTagihan(tagihanId) {
  currentTagihanId = tagihanId;
  currentTagihanData = allTagihan.find(x => x.id === tagihanId);
  if (!currentTagihanData) return;

  ['view-spp', 'view-uang-jajan', 'view-bayar-lainnya', 'view-bayar'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  document.getElementById('view-bayar-detail').style.display = 'block';
  const namaJudul = (currentTagihanData.kategori === 'Lainnya' && currentTagihanData.keterangan)
    ? `${currentTagihanData.keterangan} (${currentTagihanData.bulan} ${currentTagihanData.tahun})`
    : `${currentTagihanData.kategori} ${currentTagihanData.bulan} ${currentTagihanData.tahun}`;
  document.getElementById('titleDetailTagihan').textContent = `Detail: ${namaJudul}`;
  const badgeCat = document.getElementById('badgeCategoryText');
  if (badgeCat) badgeCat.textContent = currentTagihanData.kategori;

  const sb = getSupabase();
  if(!sb) return;

  // Render header dynamically with Checkbox Column
  const isJajan = currentTagihanData.kategori === 'Uang Jajan';
  const isWajib = !isJajan && (currentTagihanData.is_wajib !== false);
  const btnJajanHarian = document.getElementById('btnJajanHarian');
  if (btnJajanHarian) {
    btnJajanHarian.style.display = isJajan ? 'inline-flex' : 'none';
  }
  const headerTr = document.getElementById('santriTagihanTableHeader');
  if (isJajan) {
    headerTr.innerHTML = `
      <th style="width: 40px; text-align: center;"><input type="checkbox" id="checkAllSantriTagihan" onclick="toggleAllSantriTagihan(this)"></th>
      <th>Nama Santri</th>
      <th>L/P</th>
      <th>Kelas</th>
      <th>Pemasukan</th>
      <th>Pengeluaran</th>
      <th>Saldo</th>
      <th style="min-width: 220px;">Aksi</th>
    `;
  } else if (!isWajib) {
    headerTr.innerHTML = `
      <th style="width: 40px; text-align: center;"><input type="checkbox" id="checkAllSantriTagihan" onclick="toggleAllSantriTagihan(this)"></th>
      <th>Nama Santri</th>
      <th>L/P</th>
      <th>Kelas</th>
      <th>Nominal Infaq</th>
      <th>Tgl Bayar</th>
      <th>Status</th>
      <th style="min-width: 220px;">Aksi</th>
    `;
  } else {
    headerTr.innerHTML = `
      <th style="width: 40px; text-align: center;"><input type="checkbox" id="checkAllSantriTagihan" onclick="toggleAllSantriTagihan(this)"></th>
      <th>Nama Santri</th>
      <th>L/P</th>
      <th>Kelas</th>
      <th>Dibayar</th>
      <th>Tgl Bayar</th>
      <th>Kurang</th>
      <th style="min-width: 220px;">Aksi</th>
    `;
  }

  document.getElementById('santriTagihanTableBody').innerHTML = '<tr><td colspan="8" style="text-align:center; padding:40px;">Memuat data santri...</td></tr>';

  // Ambil transaksi untuk tagihan ini
  const { data: transData, error: transError } = await sb.from('pembayaran_bulanan').select('*').eq('tagihan_id', tagihanId);
  if (transError) { console.error(transError); return; }

  // Populate filter kelas if empty
  const filterK = document.getElementById('filterKelasTagihan');
  if(filterK.options.length <= 1) {
    allMasterKelas.forEach(k => {
      const opt = document.createElement('option');
      opt.value = k.nama_kelas;
      opt.textContent = k.nama_kelas;
      filterK.appendChild(opt);
    });
  }

  // Aggregate per santri
  allSantriTagihan = allSantri.map(s => {
    const sTrans = transData.filter(t => t.santri_id === s.id);
    let totalPemasukan = 0;
    let totalPengeluaran = 0;
    let tglTerakhir = '-';
    
    sTrans.forEach(t => {
      if (t.jenis_transaksi === 'Pemasukan') totalPemasukan += Number(t.nominal);
      else if (t.jenis_transaksi === 'Pengeluaran') totalPengeluaran += Number(t.nominal);
    });
    
    if (sTrans.length > 0) {
      const sorted = [...sTrans].sort((a,b) => new Date(b.tgl_bayar) - new Date(a.tgl_bayar));
      tglTerakhir = sorted[0].tgl_bayar;
    }

    return {
      ...s,
      totalPemasukan,
      totalPengeluaran,
      saldo: totalPemasukan - totalPengeluaran,
      tglTerakhir
    };
  });

  filterSantriTagihan();
}

function backToTagihan() {
  const detailEl = document.getElementById('view-bayar-detail');
  if (detailEl) detailEl.style.display = 'none';
  const kat = currentTagihanData ? currentTagihanData.kategori : 'SPP';
  if (kat === 'SPP') {
    showSection('spp');
  } else if (kat === 'Uang Jajan') {
    showSection('uang-jajan');
  } else if (kat === 'Lainnya') {
    showSection('bayar-lainnya');
  } else {
    showSection('spp');
  }
  loadTagihan();
}

function filterSantriTagihan() {
  const q = document.getElementById('searchSantriTagihan').value.toLowerCase();
  const kelas = document.getElementById('filterKelasTagihan').value;
  
  let filtered = allSantriTagihan.filter(s => {
    const matchQ = (s.nama||'').toLowerCase().includes(q) || (s.nis||'').toLowerCase().includes(q);
    const matchKelas = kelas === '' || s.kelas === kelas;
    return matchQ && matchKelas;
  });

  // Hitung ringkasan statistik detail tagihan
  const totalSantriCount = filtered.length;
  let detailTotalPemasukan = 0;
  let detailTotalPengeluaran = 0;
  let detailTotalKekurangan = 0;

  const isJajan = currentTagihanData ? currentTagihanData.kategori === 'Uang Jajan' : false;
  const isWajib = currentTagihanData ? (!isJajan && currentTagihanData.is_wajib !== false) : true;
  const nomWajib = currentTagihanData ? Number(currentTagihanData.nominal_wajib || 0) : 0;

  filtered.forEach(s => {
    detailTotalPemasukan += s.totalPemasukan;
    detailTotalPengeluaran += s.totalPengeluaran;
    if (!isJajan && isWajib) {
      const kurang = nomWajib - s.totalPemasukan;
      if (kurang > 0) detailTotalKekurangan += kurang;
    }
  });

  const elDSantri = document.getElementById('statDetailTotalSantri');
  const elDPem = document.getElementById('statDetailTotalPemasukan');
  const elDKurang = document.getElementById('statDetailTotalKekurangan');
  const elDSaldo = document.getElementById('statDetailSisaSaldo');
  const elLblKurang = document.getElementById('lblDetailKekurangan');

  if (elDSantri) elDSantri.textContent = `${totalSantriCount} Santri`;
  if (elDPem) elDPem.textContent = formatRupiah(detailTotalPemasukan);

  if (isJajan) {
    if (elLblKurang) elLblKurang.textContent = 'Total Penarikan Jajan';
    if (elDKurang) elDKurang.textContent = formatRupiah(detailTotalPengeluaran);
    if (elDSaldo) elDSaldo.textContent = formatRupiah(detailTotalPemasukan - detailTotalPengeluaran);
  } else if (!isWajib) {
    const santriIkut = filtered.filter(s => s.totalPemasukan > 0).length;
    if (elLblKurang) elLblKurang.textContent = 'Santri Berpartisipasi';
    if (elDKurang) elDKurang.textContent = `${santriIkut} Santri`;
    if (elDSaldo) elDSaldo.textContent = formatRupiah(detailTotalPemasukan);
  } else {
    if (elLblKurang) elLblKurang.textContent = 'Total Tunggakan';
    if (elDKurang) elDKurang.textContent = formatRupiah(detailTotalKekurangan);
    if (elDSaldo) elDSaldo.textContent = formatRupiah(detailTotalPemasukan);
  }

  const tbody = document.getElementById('santriTagihanTableBody');
  tbody.innerHTML = '';
  
  if(filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:40px;">Tidak ada santri</td></tr>';
    updateSelectedSantriTagihanCount();
    return;
  }

  filtered.forEach(s => {
    const tr = document.createElement('tr');
    
    if (isJajan) {
      const saldoStyle = s.saldo < 0 ? 'color: red; font-weight:bold;' : 'color: green; font-weight:bold;';
      tr.innerHTML = `
        <td style="text-align:center;"><input type="checkbox" class="cb-santri-tagihan" value="${s.id}" onchange="updateSelectedSantriTagihanCount()"></td>
        <td><strong>${s.nama}</strong><br><small style="color:#6B7280">${s.nis||'-'}</small></td>
        <td>${s.jenis_kelamin === 'Laki-laki' ? 'L' : 'P'}</td>
        <td>${s.kelas || '-'}</td>
        <td style="color:#059669; font-weight:600;">${formatRupiah(s.totalPemasukan)}</td>
        <td style="color:#DC2626; font-weight:600;">${formatRupiah(s.totalPengeluaran)}</td>
        <td style="${saldoStyle}">${formatRupiah(s.saldo)}</td>
        <td>
          <div style="display:flex; gap:6px; align-items:center;">
            <button class="btn-action" style="width:32px; height:32px; background:#D1FAE5; color:#065F46; border:1px solid #34D399; border-radius:6px; display:inline-flex; align-items:center; justify-content:center; cursor:pointer;" onclick="openTransaksiModal('${s.id}', '${s.nama.replace(/'/g,"\\'")}', 'Pemasukan')" title="Catat Deposit Uang Jajan">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
            <button class="btn-action" style="width:32px; height:32px; background:#FEE2E2; color:#991B1B; border:1px solid #F87171; border-radius:6px; display:inline-flex; align-items:center; justify-content:center; cursor:pointer;" onclick="openTransaksiModal('${s.id}', '${s.nama.replace(/'/g,"\\'")}', 'Pengeluaran')" title="Catat Penarikan Uang Jajan">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
            <button class="btn-action btn-detail" style="width:32px; height:32px; background:#F3F4F6; color:#374151; border:1px solid #D1D5DB; border-radius:6px; display:inline-flex; align-items:center; justify-content:center; cursor:pointer;" onclick="openRiwayatModal('${s.id}', '${s.nama.replace(/'/g,"\\'")}')" title="Lihat Riwayat Transaksi Jajan">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </button>
            <button class="btn-action" style="width:32px; height:32px; background:#E0E7FF; color:#3730A3; border:1px solid #A5B4FC; border-radius:6px; display:inline-flex; align-items:center; justify-content:center; cursor:pointer;" onclick="printKwitansiSelected('${s.id}')" title="Cetak Kwitansi Uang Jajan Santri Ini">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            </button>
          </div>
        </td>
      `;
    } else if (!isWajib) {
      const statusPartisipasi = s.totalPemasukan > 0 
        ? '<span style="color: #065F46; font-weight: 700; background: #D1FAE5; padding: 3px 8px; border-radius: 6px; font-size: 0.8rem;">Sudah Infaq</span>' 
        : '<span style="color: #6B7280; font-size: 0.8rem;">Belum</span>';
      
      tr.innerHTML = `
        <td style="text-align:center;"><input type="checkbox" class="cb-santri-tagihan" value="${s.id}" onchange="updateSelectedSantriTagihanCount()"></td>
        <td><strong>${s.nama}</strong><br><small style="color:#6B7280">${s.nis||'-'}</small></td>
        <td>${s.jenis_kelamin === 'Laki-laki' ? 'L' : 'P'}</td>
        <td>${s.kelas || '-'}</td>
        <td style="color:#059669; font-weight:600;">${s.totalPemasukan > 0 ? formatRupiah(s.totalPemasukan) : '-'}</td>
        <td>${s.tglTerakhir}</td>
        <td>${statusPartisipasi}</td>
        <td>
          <div style="display:flex; gap:6px; align-items:center;">
            <button class="btn-action" style="width:32px; height:32px; background:#DBEAFE; color:#1E3A8A; border:1px solid #93C5FD; border-radius:6px; display:inline-flex; align-items:center; justify-content:center; cursor:pointer;" onclick="openTransaksiModal('${s.id}', '${s.nama.replace(/'/g,"\\'")}', 'Pemasukan')" title="Catat Infaq / Sedekah">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
            </button>
            <button class="btn-action btn-detail" style="width:32px; height:32px; background:#F3F4F6; color:#374151; border:1px solid #D1D5DB; border-radius:6px; display:inline-flex; align-items:center; justify-content:center; cursor:pointer;" onclick="openRiwayatModal('${s.id}', '${s.nama.replace(/'/g,"\\'")}')" title="Lihat Riwayat Infaq">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </button>
            <button class="btn-action" style="width:32px; height:32px; background:#EDE9FE; color:#5B21B6; border:1px solid #C4B5FD; border-radius:6px; display:inline-flex; align-items:center; justify-content:center; cursor:pointer;" onclick="printKwitansiSelected('${s.id}')" title="Cetak Kwitansi Santri Ini">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            </button>
          </div>
        </td>
      `;
    } else {
      const kurang = nomWajib - s.totalPemasukan;
      const kurangText = kurang > 0 ? formatRupiah(kurang) : 'Lunas';
      const kurangStyle = kurang > 0 ? 'color: #DC2626; font-weight:bold;' : 'color: #059669; font-weight:bold;';
      
      tr.innerHTML = `
        <td style="text-align:center;"><input type="checkbox" class="cb-santri-tagihan" value="${s.id}" onchange="updateSelectedSantriTagihanCount()"></td>
        <td><strong>${s.nama}</strong><br><small style="color:#6B7280">${s.nis||'-'}</small></td>
        <td>${s.jenis_kelamin === 'Laki-laki' ? 'L' : 'P'}</td>
        <td>${s.kelas || '-'}</td>
        <td style="color:#059669; font-weight:600;">${formatRupiah(s.totalPemasukan)}</td>
        <td>${s.tglTerakhir}</td>
        <td style="${kurangStyle}">${kurangText}</td>
        <td>
          <div style="display:flex; gap:6px; align-items:center;">
            <button class="btn-action" style="width:32px; height:32px; background:#DBEAFE; color:#1E3A8A; border:1px solid #93C5FD; border-radius:6px; display:inline-flex; align-items:center; justify-content:center; cursor:pointer;" onclick="openTransaksiModal('${s.id}', '${s.nama.replace(/'/g,"\\'")}', 'Pemasukan')" title="Catat Pembayaran Tagihan">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
            </button>
            <button class="btn-action btn-detail" style="width:32px; height:32px; background:#F3F4F6; color:#374151; border:1px solid #D1D5DB; border-radius:6px; display:inline-flex; align-items:center; justify-content:center; cursor:pointer;" onclick="openRiwayatModal('${s.id}', '${s.nama.replace(/'/g,"\\'")}')" title="Lihat Riwayat Pembayaran">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </button>
            <button class="btn-action" style="width:32px; height:32px; background:#EDE9FE; color:#5B21B6; border:1px solid #C4B5FD; border-radius:6px; display:inline-flex; align-items:center; justify-content:center; cursor:pointer;" onclick="printKwitansiSelected('${s.id}')" title="Cetak Kwitansi Santri Ini">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            </button>
          </div>
        </td>
      `;
    }
    tbody.appendChild(tr);
  });

  const masterCb = document.getElementById('checkAllSantriTagihan');
  if (masterCb) masterCb.checked = false;
  updateSelectedSantriTagihanCount();
}

function toggleAllSantriTagihan(masterCb) {
  const cbs = document.querySelectorAll('.cb-santri-tagihan');
  cbs.forEach(cb => cb.checked = masterCb.checked);
  updateSelectedSantriTagihanCount();
}

function updateSelectedSantriTagihanCount() {
  const checked = document.querySelectorAll('.cb-santri-tagihan:checked');
  const countSpan = document.getElementById('countSelectedKwitansi');
  if (countSpan) {
    countSpan.textContent = checked.length;
  }
}

async function printKwitansiSelected(singleSantriId = null) {
  let targetSantriIds = [];
  
  if (singleSantriId) {
    targetSantriIds = [singleSantriId];
  } else {
    const checked = document.querySelectorAll('.cb-santri-tagihan:checked');
    if (checked.length > 0) {
      targetSantriIds = Array.from(checked).map(cb => cb.value);
    } else {
      const ok = await showCustomConfirm(
        'Cetak Kwitansi', 
        'Tidak ada santri yang dicentang. Apakah Anda ingin mencetak kwitansi untuk SEMUA santri pada tagihan ini?', 
        { confirmText: 'Ya, Cetak Semua', cancelText: 'Batal', type: 'info' }
      );
      if (!ok) return;
      targetSantriIds = allSantriTagihan.map(s => s.id);
    }
  }

  if (targetSantriIds.length === 0) {
    showToast('Tidak ada data santri untuk dicetak', 'error');
    return;
  }

  const isJajan = currentTagihanData ? currentTagihanData.kategori === 'Uang Jajan' : false;
  const nomWajib = currentTagihanData ? Number(currentTagihanData.nominal_wajib || 0) : 0;
  const now = new Date();
  const dateFormatted = now.getDate() + ' ' + now.toLocaleString('id-ID', { month: 'long' }) + ' ' + now.getFullYear();

  let kwitansiHtml = '<div class="print-kwitansi-page">';

  targetSantriIds.forEach((sid, idx) => {
    const sData = allSantriTagihan.find(x => x.id === sid);
    if (!sData) return;

    const noKwitansi = `KWT/${currentTagihanData ? currentTagihanData.tahun : now.getFullYear()}/${String(now.getMonth()+1).padStart(2,'0')}/${sData.nis ? sData.nis : String(idx+1).padStart(3,'0')}`;

    let nominalBesar = 0;
    let rincianText = '';
    let statusText = '';

    if (isJajan) {
      nominalBesar = sData.totalPemasukan;
      rincianText = `Deposit Uang Jajan - ${currentTagihanData.bulan} ${currentTagihanData.tahun}`;
      statusText = `Sisa Saldo: ${formatRupiah(sData.saldo)}`;
    } else if (currentTagihanData && currentTagihanData.is_wajib === false) {
      nominalBesar = sData.totalPemasukan;
      const namaTagihan = (currentTagihanData && currentTagihanData.kategori === 'Lainnya' && currentTagihanData.keterangan) 
        ? currentTagihanData.keterangan 
        : (currentTagihanData ? currentTagihanData.kategori : 'Infaq');
      rincianText = `Pembayaran ${namaTagihan} - ${currentTagihanData ? currentTagihanData.bulan : ''} ${currentTagihanData ? currentTagihanData.tahun : ''}`;
      statusText = 'Infaq Sukarela / Seikhlasnya';
    } else {
      nominalBesar = sData.totalPemasukan;
      const namaTagihan = (currentTagihanData && currentTagihanData.kategori === 'Lainnya' && currentTagihanData.keterangan) 
        ? currentTagihanData.keterangan 
        : (currentTagihanData ? currentTagihanData.kategori : 'SPP');
      rincianText = `Pembayaran ${namaTagihan} - ${currentTagihanData ? currentTagihanData.bulan : ''} ${currentTagihanData ? currentTagihanData.tahun : ''}`;
      const kurang = nomWajib - sData.totalPemasukan;
      statusText = kurang <= 0 ? 'LUNAS' : `Tunggakan: ${formatRupiah(kurang)}`;
    }

    const terbilangStr = terbilang(nominalBesar) + ' Rupiah';

    kwitansiHtml += `
      <div class="kwitansi-item" style="margin-bottom: 20px;">
        <div class="kwitansi-header">
          <div class="kwitansi-header-left">
            <img src="img/logo.png" alt="Logo" onerror="this.style.display='none'">
            <div class="kwitansi-header-text">
              <h2>PONDOK PESANTREN</h2>
              <h1>AL-FATHONAH KUDUKERAS</h1>
              <p>Jl. H. Mastra No. 04 Desa Kudukeras, Babakan, Cirebon</p>
            </div>
          </div>
          <div class="kwitansi-title-center">
            <h3 class="kwitansi-title">KWITANSI PEMBAYARAN</h3>
          </div>
          <div class="kwitansi-no-right">
            <span class="kwitansi-no">No: ${noKwitansi}</span>
          </div>
        </div>

        <div class="kwitansi-body">
          <span>Telah Diterima Dari</span>
          <span>:</span>
          <span><strong>${sData.nama}</strong> (NIS: ${sData.nis || '-'}, Kelas: ${sData.kelas || '-'})</span>

          <span>Uang Sejumlah</span>
          <span>:</span>
          <span><strong class="terbilang-box">${terbilangStr}</strong></span>

          <span>Untuk Pembayaran</span>
          <span>:</span>
          <span>${rincianText} <em>(${statusText})</em></span>

          <span>Tanggal Transaksi</span>
          <span>:</span>
          <span>Cirebon, ${sData.tglTerakhir !== '-' ? sData.tglTerakhir : dateFormatted}</span>
        </div>

        <div class="kwitansi-footer">
          <div class="kwitansi-nominal">
            ${formatRupiah(nominalBesar)}
          </div>
          <div class="kwitansi-sign">
            <p>Cirebon, ${dateFormatted}</p>
            <p><strong>Bendahara</strong></p>
            <div style="margin-top: 35px;"><span style="display:inline-block; width:140px; border-bottom:1.5px solid #111827;"></span></div>
          </div>
        </div>
      </div>
    `;
  });

  kwitansiHtml += '</div>';

  doPrint(kwitansiHtml, 'portrait');
}

function printDetailTagihan() {
  if (!currentTagihanData) {
    showToast('Data tagihan tidak ditemukan', 'error');
    return;
  }

  const isJajan = currentTagihanData.kategori === 'Uang Jajan';
  const isWajib = !isJajan && (currentTagihanData.is_wajib !== false);
  const nomWajib = Number(currentTagihanData.nominal_wajib || 0);
  const now = new Date();
  const dateStr = now.getDate() + ' ' + now.toLocaleString('id-ID', { month: 'long' }) + ' ' + now.getFullYear();

  let totalPemasukan = 0;
  let totalPengeluaran = 0;
  let totalTunggakan = 0;

  allSantriTagihan.forEach(s => {
    totalPemasukan += s.totalPemasukan;
    totalPengeluaran += s.totalPengeluaran;
    if (!isJajan && isWajib) {
      const kurang = nomWajib - s.totalPemasukan;
      if (kurang > 0) totalTunggakan += kurang;
    }
  });

  let rowsHtml = '';
  allSantriTagihan.forEach((s, idx) => {
    if (isJajan) {
      const statusSaldo = s.saldo < 0 ? `Minus ${formatRupiah(Math.abs(s.saldo))}` : `Saldo: ${formatRupiah(s.saldo)}`;
      rowsHtml += `
        <tr>
          <td style="text-align:center;">${idx + 1}</td>
          <td style="text-align:center;">${s.nis || '-'}</td>
          <td><strong>${s.nama}</strong></td>
          <td style="text-align:center;">${s.jenis_kelamin === 'Laki-laki' ? 'L' : 'P'}</td>
          <td style="text-align:center;">${s.kelas || '-'}</td>
          <td style="text-align:right; color:#059669;">${formatRupiah(s.totalPemasukan)}</td>
          <td style="text-align:right; color:#DC2626;">${formatRupiah(s.totalPengeluaran)}</td>
          <td style="text-align:right; font-weight:bold;">${formatRupiah(s.saldo)}</td>
        </tr>
      `;
    } else if (!isWajib) {
      const stText = s.totalPemasukan > 0 ? 'Sudah Infaq' : 'Belum Infaq';
      const stColor = s.totalPemasukan > 0 ? '#059669' : '#6B7280';
      rowsHtml += `
        <tr>
          <td style="text-align:center;">${idx + 1}</td>
          <td style="text-align:center;">${s.nis || '-'}</td>
          <td><strong>${s.nama}</strong></td>
          <td style="text-align:center;">${s.jenis_kelamin === 'Laki-laki' ? 'L' : 'P'}</td>
          <td style="text-align:center;">${s.kelas || '-'}</td>
          <td style="text-align:right; color:#059669; font-weight:600;">${s.totalPemasukan > 0 ? formatRupiah(s.totalPemasukan) : '-'}</td>
          <td style="text-align:center;">${s.tglTerakhir}</td>
          <td style="text-align:center; font-weight:bold; color:${stColor};">${stText}</td>
        </tr>
      `;
    } else {
      const kurang = nomWajib - s.totalPemasukan;
      const stText = kurang <= 0 ? 'LUNAS' : formatRupiah(kurang);
      const stColor = kurang <= 0 ? '#059669' : '#DC2626';
      rowsHtml += `
        <tr>
          <td style="text-align:center;">${idx + 1}</td>
          <td style="text-align:center;">${s.nis || '-'}</td>
          <td><strong>${s.nama}</strong></td>
          <td style="text-align:center;">${s.jenis_kelamin === 'Laki-laki' ? 'L' : 'P'}</td>
          <td style="text-align:center;">${s.kelas || '-'}</td>
          <td style="text-align:right; color:#059669;">${formatRupiah(s.totalPemasukan)}</td>
          <td style="text-align:center;">${s.tglTerakhir}</td>
          <td style="text-align:right; font-weight:bold; color:${stColor};">${stText}</td>
        </tr>
      `;
    }
  });

  const headerTableHtml = isJajan ? `
    <thead>
      <tr>
        <th style="width:35px; text-align:center;">NO</th>
        <th style="width:85px; text-align:center;">NIS</th>
        <th>NAMA SANTRI</th>
        <th style="width:40px; text-align:center;">L/P</th>
        <th style="width:75px; text-align:center;">KELAS</th>
        <th style="text-align:right;">TOTAL DEPOSIT</th>
        <th style="text-align:right;">TOTAL PENARIKAN</th>
        <th style="text-align:right;">SISA SALDO</th>
      </tr>
    </thead>
  ` : (!isWajib ? `
    <thead>
      <tr>
        <th style="width:35px; text-align:center;">NO</th>
        <th style="width:85px; text-align:center;">NIS</th>
        <th>NAMA SANTRI</th>
        <th style="width:40px; text-align:center;">L/P</th>
        <th style="width:75px; text-align:center;">KELAS</th>
        <th style="text-align:right;">NOMINAL INFAQ</th>
        <th style="text-align:center;">TGL TRANSAKSI</th>
        <th style="text-align:center;">STATUS PARTISIPASI</th>
      </tr>
    </thead>
  ` : `
    <thead>
      <tr>
        <th style="width:35px; text-align:center;">NO</th>
        <th style="width:85px; text-align:center;">NIS</th>
        <th>NAMA SANTRI</th>
        <th style="width:40px; text-align:center;">L/P</th>
        <th style="width:75px; text-align:center;">KELAS</th>
        <th style="text-align:right;">TELAH DIBAYAR</th>
        <th style="text-align:center;">TGL TERAKHIR</th>
        <th style="text-align:right;">KEKURANGAN / STATUS</th>
      </tr>
    </thead>
  `);

  const reportHtml = `
    <div style="font-family: 'Times New Roman', Times, serif; padding: 20px; color: #111827; background: white;">
      <!-- KOP SURAT RESMI -->
      <div style="display: flex; align-items: center; justify-content: center; gap: 20px; border-bottom: 3px double #111827; padding-bottom: 12px; margin-bottom: 16px;">
        <img src="img/logo.png" alt="Logo" style="width: 85px; height: auto;" onerror="this.style.display='none'">
        <div style="text-align: center;">
          <h3 style="margin: 0; font-size: 1.1rem; letter-spacing: 1px; color: #047857;">PONDOK PESANTREN</h3>
          <h1 style="margin: 2px 0; font-size: 1.6rem; font-weight: 800; color: #047857;">AL-FATHONAH KUDUKERAS</h1>
          <p style="margin: 0; font-size: 0.85rem; color: #374151;">Jl. H. Mastra No. 04, RT. 03 RW.03, Desa Kudukeras, Kec. Babakan, Kab. Cirebon 45191</p>
          <p style="margin: 2px 0 0 0; font-size: 0.8rem; color: #4B5563;">Telp/WA: 085323056221 | Email: ponpesalfathonah7@gmail.com</p>
        </div>
      </div>

      <!-- JUDUL LAPORAN -->
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="font-size: 1.25rem; font-weight: bold; text-decoration: underline; text-transform: uppercase; margin: 0 0 4px 0;">
          LAPORAN REKAP PEMBAYARAN ${(currentTagihanData.kategori === 'Lainnya' && currentTagihanData.keterangan ? currentTagihanData.keterangan : currentTagihanData.kategori).toUpperCase()}
        </h2>
        <p style="margin: 0; font-size: 0.95rem; font-weight: 600; color: #4B5563;">
          PERIODE: ${currentTagihanData.bulan.toUpperCase()} ${currentTagihanData.tahun} ${!isJajan ? (isWajib ? `(Nominal Wajib: ${formatRupiah(nomWajib)})` : `(Sifat: Sukarela / Seikhlasnya)`) : ''}
        </p>
      </div>

      <!-- SUMMARY BOX -->
      <div style="display: flex; justify-content: space-around; background: #F9FAFB; border: 1px solid #D1D5DB; padding: 10px 16px; border-radius: 6px; margin-bottom: 20px; font-size: 0.88rem;">
        <div><strong>Total Santri:</strong> ${allSantriTagihan.length} Orang</div>
        <div><strong>Total Terkumpul:</strong> <span style="color:#059669; font-weight:bold;">${formatRupiah(totalPemasukan)}</span></div>
        ${isJajan 
          ? `<div><strong>Total Penarikan:</strong> <span style="color:#DC2626; font-weight:bold;">${formatRupiah(totalPengeluaran)}</span></div><div><strong>Sisa Kas Jajan:</strong> <span style="color:#2563EB; font-weight:bold;">${formatRupiah(totalPemasukan - totalPengeluaran)}</span></div>`
          : (!isWajib
            ? `<div><strong>Santri Berpartisipasi:</strong> <span style="color:#2563EB; font-weight:bold;">${allSantriTagihan.filter(x => x.totalPemasukan > 0).length} Orang</span></div>`
            : `<div><strong>Total Tunggakan:</strong> <span style="color:#DC2626; font-weight:bold;">${formatRupiah(totalTunggakan)}</span></div>`
          )
        }
      </div>

      <!-- TABEL DATA SANTRI -->
      <table class="report-table" style="width:100%; border-collapse:collapse; margin-bottom: 30px;">
        ${headerTableHtml}
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <!-- TANDA TANGAN -->
      <div style="display: flex; justify-content: space-between; align-items: flex-end; font-size: 0.9rem; margin-top: 30px; page-break-inside: avoid;">
        <div style="text-align: center; min-width: 200px;">
          <p style="margin-bottom: 60px;">Mengetahui,<br><strong>Pengawas Yayasan Al-Fathonah</strong></p>
          <p style="margin: 0;"><span style="display:inline-block; width:180px; border-bottom:1.5px solid #111827;"></span></p>
        </div>
        <div style="text-align: center; min-width: 200px;">
          <p style="margin-bottom: 60px;">Cirebon, ${dateStr}<br><strong>Bendahara</strong></p>
          <p style="margin: 0;"><span style="display:inline-block; width:180px; border-bottom:1.5px solid #111827;"></span></p>
        </div>
      </div>
    </div>
  `;

  doPrint(reportHtml, isJajan ? 'landscape' : 'portrait');
}

// ==========================================
// ===== TRANSAKSI (BAYAR / JAJAN) ======
// ==========================================

function openTransaksiModal(santriId, santriNama, jenis) {
  document.getElementById('transaksiModalOverlay').classList.add('active');
  document.getElementById('transaksiForm').reset();
  
  document.getElementById('transaksiId').value = '';
  document.getElementById('transaksiSantriId').value = santriId;
  document.getElementById('transaksiJenis').value = jenis;
  document.getElementById('transaksi_nama_santri').value = santriNama;
  document.getElementById('transaksi_tgl').value = new Date().toISOString().split('T')[0];

  const isJajan = currentTagihanData ? currentTagihanData.kategori === 'Uang Jajan' : false;
  const quickRow = document.getElementById('transaksiJajanQuickRow');
  const cbTambahan = document.getElementById('transaksiIsTambahanJajan');
  if (quickRow) quickRow.style.display = (isJajan && jenis === 'Pengeluaran') ? 'block' : 'none';
  if (cbTambahan) cbTambahan.checked = false;
  
  if (isJajan) {
    document.getElementById('transaksiModalTitle').textContent = jenis === 'Pemasukan' ? 'Catat Deposit Jajan' : 'Catat Penarikan Uang Jajan';
    document.getElementById('group_transaksi_keterangan').style.display = 'block';
    document.getElementById('transaksi_nominal').value = '';
  } else {
    const namaTagihan = (currentTagihanData && currentTagihanData.kategori === 'Lainnya' && currentTagihanData.keterangan)
      ? currentTagihanData.keterangan
      : (currentTagihanData ? currentTagihanData.kategori : '');
    document.getElementById('transaksiModalTitle').textContent = 'Catat Pembayaran ' + namaTagihan;
    const defaultNom = (currentTagihanData && currentTagihanData.nominal_wajib) ? Number(currentTagihanData.nominal_wajib).toLocaleString('id-ID') : '';
    document.getElementById('transaksi_nominal').value = defaultNom;
    document.getElementById('group_transaksi_keterangan').style.display = 'block';
  }
}

function setTransaksiNominalQuick(nom) {
  const el = document.getElementById('transaksi_nominal');
  if (el) el.value = Number(nom).toLocaleString('id-ID');
}

function toggleTambahanJajanCheckbox(cb) {
  const ketEl = document.getElementById('transaksi_keterangan');
  if (!ketEl) return;
  if (cb.checked) {
    if (!ketEl.value || ketEl.value.trim() === '') {
      ketEl.value = 'Tambahan uang jajan';
    }
  } else {
    if (ketEl.value === 'Tambahan uang jajan') {
      ketEl.value = '';
    }
  }
}

function closeTransaksiModal() {
  document.getElementById('transaksiModalOverlay').classList.remove('active');
}

document.getElementById('transaksiForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const sb = getSupabase();
  if(!sb) return;

  const btn = document.getElementById('btnSimpanTransaksi');
  const oldText = btn.textContent;
  btn.textContent = 'Menyimpan...'; btn.disabled = true;

  try {
    const id = document.getElementById('transaksiId').value;
    const santriId = document.getElementById('transaksiSantriId').value;
    const nominalNum = parseRibuanValue(document.getElementById('transaksi_nominal').value);

    if (isNaN(nominalNum) || nominalNum <= 0) {
      showToast('Masukkan nominal pembayaran yang valid (> 0)', 'warning');
      btn.textContent = oldText; btn.disabled = false;
      return;
    }

    const payload = {
      tagihan_id: currentTagihanId,
      santri_id: santriId,
      jenis_transaksi: document.getElementById('transaksiJenis').value || 'Pemasukan',
      nominal: nominalNum,
      tgl_bayar: document.getElementById('transaksi_tgl').value || new Date().toISOString().split('T')[0],
      metode: document.getElementById('transaksi_metode').value || 'Tunai',
      keterangan: document.getElementById('transaksi_keterangan').value || '',
      bulan: currentTagihanData ? currentTagihanData.bulan : '',
      tahun: currentTagihanData ? currentTagihanData.tahun : ''
    };

    const { data, error } = id
      ? await sb.from('pembayaran_bulanan').update(payload).eq('id', id)
      : await sb.from('pembayaran_bulanan').insert([payload]);

    if (error) {
      console.error('Database Error:', error);
      throw error;
    }

    showToast(id ? 'Transaksi diperbarui' : 'Transaksi berhasil dicatat');
    closeTransaksiModal();

    if (document.getElementById('riwayatModalOverlay').classList.contains('active')) {
      loadRiwayat(santriId);
    }
    loadDetailTagihan(currentTagihanId);
  } catch (err) {
    console.error(err);
    showToast('Gagal menyimpan transaksi: ' + (err.message || 'Error database'), 'error');
  } finally {
    btn.textContent = oldText; btn.disabled = false;
  }
});

// ==========================================
// ===== RIWAYAT TRANSAKSI ======
// ==========================================

function openRiwayatModal(santriId, santriNama) {
  document.getElementById('riwayatModalOverlay').classList.add('active');
  document.getElementById('riwayatModalTitle').textContent = `Riwayat: ${santriNama}`;
  loadRiwayat(santriId);
}

function closeRiwayatModal() {
  document.getElementById('riwayatModalOverlay').classList.remove('active');
}

async function loadRiwayat(santriId) {
  const tbody = document.getElementById('riwayatTableBody');
  tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Memuat riwayat...</td></tr>';
  
  const sb = getSupabase();
  const { data, error } = await sb.from('pembayaran_bulanan')
    .select('*')
    .eq('tagihan_id', currentTagihanId)
    .eq('santri_id', santriId)
    .order('created_at', { ascending: false });

  if(error) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:red;">Gagal memuat</td></tr>';
    return;
  }
  
  allTransaksiSantri = data || [];
  tbody.innerHTML = '';
  
  if(allTransaksiSantri.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#6B7280;">Belum ada transaksi</td></tr>';
    return;
  }

  allTransaksiSantri.forEach(t => {
    const tr = document.createElement('tr');
    const color = t.jenis_transaksi === 'Pemasukan' ? 'color:#059669;' : 'color:#DC2626;';
    tr.innerHTML = `
      <td>${t.tgl_bayar}</td>
      <td style="${color} font-weight:500;">${t.jenis_transaksi}</td>
      <td style="font-weight:bold;">${formatRupiah(t.nominal)}</td>
      <td>${t.metode}</td>
      <td>${t.keterangan || '-'}</td>
      <td>
        <div style="display:flex; gap:4px;">
          <button class="btn-action btn-edit" style="padding:4px;" onclick="editTransaksi('${t.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
          <button class="btn-action btn-delete" style="padding:4px;" onclick="deleteTransaksi('${t.id}', '${t.santri_id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function editTransaksi(id) {
  const t = allTransaksiSantri.find(x => x.id === id);
  if(!t) return;
  
  // Ambil nama dari allSantriTagihan
  const sData = allSantriTagihan.find(x => x.id === t.santri_id);
  const sNama = sData ? sData.nama : 'Santri';

  document.getElementById('transaksiModalOverlay').classList.add('active');
  
  document.getElementById('transaksiId').value = t.id;
  document.getElementById('transaksiSantriId').value = t.santri_id;
  document.getElementById('transaksiJenis').value = t.jenis_transaksi;
  document.getElementById('transaksi_nama_santri').value = sNama;
  document.getElementById('transaksi_tgl').value = t.tgl_bayar;
  document.getElementById('transaksi_nominal').value = t.nominal ? Number(t.nominal).toLocaleString('id-ID') : '';
  document.getElementById('transaksi_metode').value = t.metode || 'Tunai';
  document.getElementById('transaksi_keterangan').value = t.keterangan || '';
  
  document.getElementById('transaksiModalTitle').textContent = 'Edit Transaksi';
}

async function deleteTransaksi(id, santriId) {
  const ok = await showCustomConfirm('Hapus Transaksi', 'Yakin ingin menghapus transaksi ini?', { confirmText: 'Ya, Hapus', type: 'danger' });
  if(!ok) return;
  const sb = getSupabase();
  const {error} = await sb.from('pembayaran_bulanan').delete().eq('id', id);
  if(error) {
    showToast('Gagal menghapus', 'error');
  } else {
    showToast('Transaksi dihapus');
    loadRiwayat(santriId);
    loadDetailTagihan(currentTagihanId);
  }
}

// printDetailTagihan() sudah didefinisikan di atas (line ~1767) — jangan duplikat

// ====================================================
// ===== SISTEM DISTRIBUSI JAJAN HARIAN SANTRI ========
// ====================================================

let currentJHList = [];

function getDefaultUangJajanMap() {
  try {
    return JSON.parse(localStorage.getItem('ponpes_santri_default_jajan') || '{}');
  } catch (e) {
    return {};
  }
}

function saveDefaultUangJajanMap(map) {
  localStorage.setItem('ponpes_santri_default_jajan', JSON.stringify(map));
}

async function openJajanHarianFromMain() {
  const jajanList = (allTagihan || []).filter(d => d.kategori === 'Uang Jajan');
  if (jajanList.length === 0) {
    showToast('Belum ada periode Uang Jajan. Silakan klik "+ Buka Periode Jajan" terlebih dahulu.', 'warning');
    return;
  }
  const targetTagihan = jajanList[0];
  await loadDetailTagihan(targetTagihan.id);
  openJajanHarianModal();
}

function openJajanHarianModal() {
  if (!currentTagihanData || currentTagihanData.kategori !== 'Uang Jajan') {
    showToast('Buka periode Uang Jajan terlebih dahulu untuk memproses jajan harian.', 'warning');
    return;
  }

  const overlay = document.getElementById('jajanHarianModalOverlay');
  if (!overlay) return;
  overlay.classList.add('active');

  const lbl = document.getElementById('jhPeriodeLabel');
  if (lbl) lbl.textContent = `Periode: Uang Jajan ${currentTagihanData.bulan} ${currentTagihanData.tahun}`;

  const tglInput = document.getElementById('jhTanggal');
  if (tglInput && !tglInput.value) {
    tglInput.value = new Date().toISOString().split('T')[0];
  }

  populateJHKelasOptions();
  populateJHNominalOptions();
  switchJHTab('distribusi');
}

function closeJajanHarianModal() {
  const overlay = document.getElementById('jajanHarianModalOverlay');
  if (overlay) overlay.classList.remove('active');
}

function switchJHTab(tab) {
  const tabDistribusi = document.getElementById('jhTabDistribusi');
  const tabDefault = document.getElementById('jhTabDefault');
  const btnDistribusi = document.getElementById('tabBtnDistribusiJajan');
  const btnDefault = document.getElementById('tabBtnDefaultJajan');

  if (tab === 'distribusi') {
    if (tabDistribusi) tabDistribusi.style.display = 'block';
    if (tabDefault) tabDefault.style.display = 'none';
    if (btnDistribusi) {
      btnDistribusi.style.background = '#4F46E5';
      btnDistribusi.style.color = 'white';
      btnDistribusi.style.border = 'none';
    }
    if (btnDefault) {
      btnDefault.style.background = 'white';
      btnDefault.style.color = 'var(--gray-700)';
      btnDefault.style.border = '1px solid var(--gray-300)';
    }
    populateJHNominalOptions();
    renderJHDistribusiTable();
  } else {
    if (tabDistribusi) tabDistribusi.style.display = 'none';
    if (tabDefault) tabDefault.style.display = 'block';
    if (btnDefault) {
      btnDefault.style.background = '#4F46E5';
      btnDefault.style.color = 'white';
      btnDefault.style.border = 'none';
    }
    if (btnDistribusi) {
      btnDistribusi.style.background = 'white';
      btnDistribusi.style.color = 'var(--gray-700)';
      btnDistribusi.style.border = '1px solid var(--gray-300)';
    }
    renderJHDefaultTable();
  }
}

function populateJHKelasOptions() {
  const sel1 = document.getElementById('jhFilterKelas');
  const sel2 = document.getElementById('jhDefaultFilterKelas');
  
  [sel1, sel2].forEach(sel => {
    if (!sel) return;
    const currentVal = sel.value;
    sel.innerHTML = '<option value="">Semua Kelas</option>';
    allMasterKelas.forEach(k => {
      const opt = document.createElement('option');
      opt.value = k.nama_kelas;
      opt.textContent = k.nama_kelas;
      sel.appendChild(opt);
    });
    sel.value = currentVal;
  });
}

function populateJHNominalOptions() {
  const sel = document.getElementById('jhFilterNominal');
  if (!sel) return;
  const defMap = getDefaultUangJajanMap();
  
  let counts = {};
  allSantri.forEach(s => {
    const nom = defMap[s.id] || 0;
    counts[nom] = (counts[nom] || 0) + 1;
  });

  const curVal = sel.value;
  sel.innerHTML = '<option value="">Semua Nominal</option>';
  
  Object.keys(counts).map(Number).sort((a,b) => a - b).forEach(nom => {
    const opt = document.createElement('option');
    opt.value = nom;
    if (nom === 0) {
      opt.textContent = `Belum Diatur / Rp 0 (${counts[nom]} Santri)`;
    } else {
      opt.textContent = `${formatRupiah(nom)} (${counts[nom]} Santri)`;
    }
    sel.appendChild(opt);
  });
  sel.value = curVal;
}

function renderJHDistribusiTable() {
  const tbody = document.getElementById('jhDistribusiTableBody');
  if (!tbody) return;

  const q = (document.getElementById('jhSearch')?.value || '').toLowerCase().trim();
  const kelas = document.getElementById('jhFilterKelas')?.value || '';
  const filterNominal = document.getElementById('jhFilterNominal')?.value;

  const defMap = getDefaultUangJajanMap();
  const santriSource = (allSantriTagihan && allSantriTagihan.length > 0) ? allSantriTagihan : allSantri.map(s => ({ ...s, saldo: 0 }));

  let filtered = santriSource.filter(s => {
    const matchQ = (s.nama || '').toLowerCase().includes(q) || (s.nis || '').toLowerCase().includes(q);
    const matchKelas = !kelas || s.kelas === kelas;
    const sDefNom = defMap[s.id] || 0;
    const matchNom = filterNominal === '' || filterNominal === undefined || String(sDefNom) === String(filterNominal);
    return matchQ && matchKelas && matchNom;
  });

  currentJHList = filtered;

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:30px; color:#9CA3AF;">Tidak ada santri yang sesuai filter</td></tr>';
    updateJHSummary();
    return;
  }

  tbody.innerHTML = '';
  filtered.forEach(s => {
    const defaultNom = defMap[s.id] || 0;
    const saldo = Number(s.saldo || 0);
    const isChecked = defaultNom > 0;

    const tr = document.createElement('tr');
    tr.id = `jh-row-${s.id}`;
    
    let saldoBadge = '';
    if (saldo <= 0) {
      saldoBadge = `<span style="display:inline-block; font-size:0.75rem; color:#DC2626; font-weight:700; background:#FEE2E2; padding:2px 6px; border-radius:4px;">Saldo Kosong (${formatRupiah(saldo)})</span>`;
    } else {
      saldoBadge = `<span style="font-weight:700; color:#059669;">${formatRupiah(saldo)}</span>`;
    }

    tr.innerHTML = `
      <td style="text-align:center;">
        <input type="checkbox" class="cb-jh-santri" value="${s.id}" data-saldo="${saldo}" ${isChecked ? 'checked' : ''} onchange="updateJHDistribusiRow('${s.id}')">
      </td>
      <td>
        <strong>${s.nama}</strong><br>
        <small style="color:#6B7280;">${s.nis || '-'}</small>
      </td>
      <td><span style="font-size:0.8rem; background:#F3F4F6; padding:2px 8px; border-radius:4px;">${s.kelas || '-'}</span></td>
      <td>${saldoBadge}</td>
      <td>
        <input type="text" class="jh-input-pokok" id="jh-pokok-${s.id}" value="${defaultNom ? Number(defaultNom).toLocaleString('id-ID') : '0'}" oninput="formatRibuanInput(this); updateJHDistribusiRow('${s.id}')" style="width:100%; padding:6px 8px; font-size:0.85rem; border:1px solid var(--gray-300); border-radius:6px; font-weight:600; text-align:right;">
      </td>
      <td>
        <div style="display:flex; align-items:center; gap:4px;">
          <input type="text" class="jh-input-tambahan" id="jh-tambahan-${s.id}" value="0" placeholder="0" oninput="formatRibuanInput(this); updateJHDistribusiRow('${s.id}')" style="width:75px; padding:6px 8px; font-size:0.85rem; border:1px solid #93C5FD; background:#EFF6FF; border-radius:6px; text-align:right; font-weight:600; color:#1D4ED8;">
          <button type="button" onclick="quickAddTambahan('${s.id}', 5000)" style="padding:4px 6px; font-size:0.7rem; border:1px solid #BFDBFE; background:#DBEAFE; color:#1E40AF; border-radius:4px; cursor:pointer;" title="+Rp 5.000">+5k</button>
        </div>
      </td>
      <td>
        <div style="text-align:right;">
          <strong id="jh-total-${s.id}" style="color:#4F46E5; font-size:0.9rem;">${formatRupiah(defaultNom)}</strong>
          <div id="jh-warn-${s.id}" style="font-size:0.7rem; color:#DC2626; display:${(saldo < defaultNom && defaultNom > 0) ? 'block' : 'none'};">⚠️ Saldo Kurang</div>
        </div>
      </td>
      <td>
        <input type="text" id="jh-ket-${s.id}" placeholder="Opsional (misal: Beli buku/obat)" style="width:100%; padding:5px 8px; font-size:0.8rem; border:1px solid var(--gray-200); border-radius:6px;">
      </td>
    `;
    tbody.appendChild(tr);
  });

  updateJHSummary();
}

function quickAddTambahan(santriId, amount) {
  const tambahanEl = document.getElementById(`jh-tambahan-${santriId}`);
  if (!tambahanEl) return;
  const current = parseRibuanValue(tambahanEl.value) || 0;
  tambahanEl.value = (current + amount).toLocaleString('id-ID');
  const cb = document.querySelector(`.cb-jh-santri[value="${santriId}"]`);
  if (cb && !cb.checked) cb.checked = true;
  updateJHDistribusiRow(santriId);
}

function updateJHDistribusiRow(santriId) {
  const pokokEl = document.getElementById(`jh-pokok-${santriId}`);
  const tambahanEl = document.getElementById(`jh-tambahan-${santriId}`);
  const totalEl = document.getElementById(`jh-total-${santriId}`);
  const warnEl = document.getElementById(`jh-warn-${santriId}`);
  const cb = document.querySelector(`.cb-jh-santri[value="${santriId}"]`);

  const pokok = parseRibuanValue(pokokEl ? pokokEl.value : '0') || 0;
  const tambahan = parseRibuanValue(tambahanEl ? tambahanEl.value : '0') || 0;
  const total = pokok + tambahan;

  if (totalEl) totalEl.textContent = formatRupiah(total);

  const saldo = Number(cb ? cb.dataset.saldo || 0 : 0);
  if (warnEl) {
    if (cb && cb.checked && total > saldo) {
      warnEl.style.display = 'block';
      warnEl.textContent = `⚠️ Saldo Kurang (${formatRupiah(saldo - total)})`;
    } else {
      warnEl.style.display = 'none';
    }
  }

  updateJHSummary();
}

function toggleJHSelectAll(checked) {
  const cbs = document.querySelectorAll('.cb-jh-santri');
  cbs.forEach(cb => {
    cb.checked = checked;
    updateJHDistribusiRow(cb.value);
  });
  const master = document.getElementById('jhMasterCheck');
  if (master) master.checked = checked;
  updateJHSummary();
}

function updateJHSummary() {
  const checked = document.querySelectorAll('.cb-jh-santri:checked');
  let totalNom = 0;
  let count = checked.length;

  checked.forEach(cb => {
    const sId = cb.value;
    const pokokEl = document.getElementById(`jh-pokok-${sId}`);
    const tambahanEl = document.getElementById(`jh-tambahan-${sId}`);
    const pokok = parseRibuanValue(pokokEl ? pokokEl.value : '0') || 0;
    const tambahan = parseRibuanValue(tambahanEl ? tambahanEl.value : '0') || 0;
    totalNom += (pokok + tambahan);
  });

  const countEl = document.getElementById('jhCountSelected');
  const nomEl = document.getElementById('jhTotalNominal');
  if (countEl) countEl.textContent = `${count} Santri`;
  if (nomEl) nomEl.textContent = formatRupiah(totalNom);
}

async function prosesJajanHarianMassal() {
  const sb = getSupabase();
  if (!sb) return;

  const tgl = document.getElementById('jhTanggal')?.value || new Date().toISOString().split('T')[0];
  const checked = document.querySelectorAll('.cb-jh-santri:checked');

  if (checked.length === 0) {
    showToast('Pilih setidaknya 1 santri untuk mencatat jajan harian.', 'warning');
    return;
  }

  let payloads = [];
  let insufficientCount = 0;
  let totalNominalSemua = 0;

  checked.forEach(cb => {
    const sId = cb.value;
    const pokok = parseRibuanValue(document.getElementById(`jh-pokok-${sId}`)?.value || '0') || 0;
    const tambahan = parseRibuanValue(document.getElementById(`jh-tambahan-${sId}`)?.value || '0') || 0;
    const total = pokok + tambahan;
    const saldo = Number(cb.dataset.saldo || 0);
    const ketCustom = (document.getElementById(`jh-ket-${sId}`)?.value || '').trim();

    if (total > 0) {
      if (total > saldo) insufficientCount++;
      totalNominalSemua += total;

      let ket = `Jajan Harian (${formatRupiah(pokok)})`;
      if (tambahan > 0) {
        ket = `Jajan Harian ${formatRupiah(pokok)} + Tambahan ${formatRupiah(tambahan)}`;
      }
      if (ketCustom) {
        ket += ` - ${ketCustom}`;
      }

      payloads.push({
        tagihan_id: currentTagihanId,
        santri_id: sId,
        jenis_transaksi: 'Pengeluaran',
        nominal: total,
        tgl_bayar: tgl,
        metode: 'Tunai',
        keterangan: ket,
        bulan: currentTagihanData ? currentTagihanData.bulan : '',
        tahun: currentTagihanData ? currentTagihanData.tahun : ''
      });
    }
  });

  if (payloads.length === 0) {
    showToast('Total nominal jajan untuk santri yang dipilih bernilai Rp 0.', 'warning');
    return;
  }

  let confirmMsg = `Proses pencatatan uang jajan untuk ${payloads.length} santri sebesar total ${formatRupiah(totalNominalSemua)} pada tanggal ${tgl}?`;
  if (insufficientCount > 0) {
    confirmMsg = `⚠️ Perhatian: Ada ${insufficientCount} santri yang saldonya kurang/minus dari jajan yang ditarik.\n\nApakah tetap ingin melanjutkan pencatatan uang jajan untuk ${payloads.length} santri ini?`;
  }

  const ok = await showCustomConfirm(
    'Konfirmasi Penarikan Jajan',
    confirmMsg,
    {
      confirmText: 'Ya, Proses Sekarang',
      cancelText: 'Batal',
      type: insufficientCount > 0 ? 'warning' : 'info'
    }
  );
  if (!ok) return;

  const btn = document.getElementById('btnProsesJajanHarian');
  const oldText = btn.innerHTML;
  btn.innerHTML = '<span>Menyimpan transaksi...</span>';
  btn.disabled = true;

  try {
    const { data, error } = await sb.from('pembayaran_bulanan').insert(payloads);
    if (error) throw error;

    showToast(`Alhamdulillah! Berhasil mencatat uang jajan untuk ${payloads.length} santri (Total: ${formatRupiah(totalNominalSemua)}).`, 'success');
    closeJajanHarianModal();

    await loadDetailTagihan(currentTagihanId);
  } catch (err) {
    console.error('Error proses jajan harian:', err);
    showToast('Gagal memproses jajan harian: ' + (err.message || 'Error database'), 'error');
  } finally {
    btn.innerHTML = oldText;
    btn.disabled = false;
  }
}

function renderJHDefaultTable() {
  const tbody = document.getElementById('jhDefaultTableBody');
  if (!tbody) return;

  const q = (document.getElementById('jhDefaultSearch')?.value || '').toLowerCase().trim();
  const kelas = document.getElementById('jhDefaultFilterKelas')?.value || '';
  const defMap = getDefaultUangJajanMap();

  let filtered = allSantri.filter(s => {
    const matchQ = (s.nama || '').toLowerCase().includes(q) || (s.nis || '').toLowerCase().includes(q);
    const matchKelas = !kelas || s.kelas === kelas;
    return matchQ && matchKelas;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px; color:#9CA3AF;">Tidak ada santri yang cocok</td></tr>';
    updateJHBatchCount();
    return;
  }

  tbody.innerHTML = '';
  filtered.forEach(s => {
    const defNom = defMap[s.id] || 0;
    const tr = document.createElement('tr');
    tr.id = `jh-def-row-${s.id}`;

    let kelompokBadge = '';
    if (defNom === 10000) {
      kelompokBadge = '<span style="background:#D1FAE5; color:#065F46; padding:2px 8px; border-radius:6px; font-size:0.75rem; font-weight:700;">Paket 10k</span>';
    } else if (defNom === 15000) {
      kelompokBadge = '<span style="background:#DBEAFE; color:#1E40AF; padding:2px 8px; border-radius:6px; font-size:0.75rem; font-weight:700;">Paket 15k</span>';
    } else if (defNom === 20000) {
      kelompokBadge = '<span style="background:#EDE9FE; color:#5B21B6; padding:2px 8px; border-radius:6px; font-size:0.75rem; font-weight:700;">Paket 20k</span>';
    } else if (defNom > 0) {
      kelompokBadge = `<span style="background:#FEF3C7; color:#92400E; padding:2px 8px; border-radius:6px; font-size:0.75rem; font-weight:700;">${formatRupiah(defNom)}</span>`;
    } else {
      kelompokBadge = '<span style="color:#9CA3AF; font-size:0.75rem;">Belum Diatur</span>';
    }

    tr.innerHTML = `
      <td style="text-align:center;">
        <input type="checkbox" class="cb-jh-default" value="${s.id}" onchange="updateJHBatchCount()">
      </td>
      <td><strong>${s.nama}</strong></td>
      <td><small style="color:#6B7280;">${s.nis || '-'}</small></td>
      <td><span style="font-size:0.8rem; background:#F3F4F6; padding:2px 8px; border-radius:4px;">${s.kelas || '-'}</span></td>
      <td>
        <input type="text" class="jh-def-nominal-input" id="jh-def-input-${s.id}" value="${defNom ? Number(defNom).toLocaleString('id-ID') : '0'}" oninput="formatRibuanInput(this)" style="width:100%; padding:6px 10px; font-size:0.85rem; border:1px solid var(--gray-300); border-radius:6px; font-weight:600; text-align:right;">
      </td>
      <td>${kelompokBadge}</td>
    `;
    tbody.appendChild(tr);
  });

  updateJHBatchCount();
}

function toggleJHDefaultSelectAll(checked) {
  const cbs = document.querySelectorAll('.cb-jh-default');
  cbs.forEach(cb => cb.checked = checked);
  const master = document.getElementById('jhDefaultMasterCheck');
  if (master) master.checked = checked;
  updateJHBatchCount();
}

function updateJHBatchCount() {
  const checked = document.querySelectorAll('.cb-jh-default:checked');
  const countEl = document.getElementById('jhBatchCount');
  if (countEl) countEl.textContent = checked.length;
}

function setPresetNominal(nom) {
  const checked = document.querySelectorAll('.cb-jh-default:checked');
  if (checked.length === 0) {
    showToast('Centang beberapa santri di tabel terlebih dahulu untuk menerapkan nominal.', 'warning');
    return;
  }
  checked.forEach(cb => {
    const input = document.getElementById(`jh-def-input-${cb.value}`);
    if (input) input.value = Number(nom).toLocaleString('id-ID');
  });
  showToast(`Nominal ${formatRupiah(nom)} diterapkan ke ${checked.length} santri yang dicentang.`);
}

function applyBatchNominal() {
  const inputBatch = document.getElementById('jhBatchNominalInput');
  const nom = parseRibuanValue(inputBatch?.value || '0') || 0;
  if (nom <= 0) {
    showToast('Masukkan nominal jajan yang valid (> 0).', 'warning');
    return;
  }
  const checked = document.querySelectorAll('.cb-jh-default:checked');
  if (checked.length === 0) {
    showToast('Centang santri di tabel terlebih dahulu.', 'warning');
    return;
  }
  checked.forEach(cb => {
    const input = document.getElementById(`jh-def-input-${cb.value}`);
    if (input) input.value = Number(nom).toLocaleString('id-ID');
  });
  showToast(`Nominal ${formatRupiah(nom)} diterapkan ke ${checked.length} santri.`);
}

function saveDefaultUangJajanSettings() {
  const defMap = getDefaultUangJajanMap();
  const allDefInputs = document.querySelectorAll('.jh-def-nominal-input');

  allDefInputs.forEach(inp => {
    const sId = inp.id.replace('jh-def-input-', '');
    const nom = parseRibuanValue(inp.value) || 0;
    if (nom > 0) {
      defMap[sId] = nom;
    } else {
      delete defMap[sId];
    }
  });

  saveDefaultUangJajanMap(defMap);
  showToast('Pengaturan default uang jajan santri berhasil disimpan!', 'success');

  renderJHDefaultTable();
  populateJHNominalOptions();
}


// ====================================================
// ============= DATA PENGURUS & STAFF =================
// ====================================================

async function loadPengurus() {
  const sb = getSupabase();
  if(!sb) return;
  const { data, error } = await sb.from('data_pengurus')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    showToast('Gagal memuat data pengurus', 'error');
    console.error(error);
    return;
  }
  allPengurus = data || [];
  renderPengurusTable(allPengurus);
}

function renderPengurusTable(data) {
  const tbody = document.getElementById('pengurusTableBody');
  const fullTbody = document.getElementById('pengurusTableFullBody');
  document.getElementById('countPengurus').textContent = `${data.length} data`;

  if(data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:#9CA3AF;">Belum ada data pengurus. Klik "Tambah Pengurus" untuk memulai.</td></tr>';
    if(fullTbody) fullTbody.innerHTML = '';
    return;
  }

  // Main visible table
  tbody.innerHTML = data.map((s, i) => {
    const statusBadge = s.status_aktif === 'Aktif'
      ? '<span style="background:#D1FAE5;color:#065F46;padding:3px 10px;border-radius:6px;font-size:0.78rem;font-weight:600;">Aktif</span>'
      : '<span style="background:#FEE2E2;color:#991B1B;padding:3px 10px;border-radius:6px;font-size:0.78rem;font-weight:600;">Non-Aktif</span>';
    return `
      <tr>
        <td>${i+1}</td>
        <td><strong>${s.nama || '-'}</strong></td>
        <td>${s.nik || '-'}</td>
        <td>${s.jabatan || '-'}</td>
        <td>${statusBadge}</td>
        <td>
          <div class="action-btns">
            <button class="btn-action btn-detail" onclick="viewPengurusDetail('${s.id}')" title="Lihat Detail"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>
            <button class="btn-action btn-edit" onclick="editPengurus('${s.id}')" title="Edit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
            <button class="btn-action btn-delete" onclick="deletePengurus('${s.id}', '${(s.nama||'').replace(/'/g,"\\\'")}')" title="Hapus"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Hidden full print table
  if(fullTbody) {
    fullTbody.innerHTML = data.map((s, i) => {
      const ttl = s.tempat_lahir && s.tanggal_lahir
        ? `${s.tempat_lahir}, ${formatDate(s.tanggal_lahir)}`
        : (s.tempat_lahir || (s.tanggal_lahir ? formatDate(s.tanggal_lahir) : '-'));
      return `
        <tr>
          <td style="text-align:center;">${i+1}</td>
          <td>${s.nama || '-'}</td>
          <td>${s.nik || '-'}</td>
          <td style="text-align:center;">${s.jenis_kelamin === 'Laki-laki' ? 'L' : 'P'}</td>
          <td>${ttl}</td>
          <td>${s.jabatan || '-'}</td>
          <td>${s.tupoksi || '-'}</td>
          <td style="text-align:center;">${s.status_aktif || '-'}</td>
          <td>${s.alamat || '-'}</td>
        </tr>
      `;
    }).join('');
  }
}

function filterPengurus() {
  const q = document.getElementById('searchPengurus').value.toLowerCase();
  renderPengurusTable(allPengurus.filter(s =>
    (s.nama || '').toLowerCase().includes(q) ||
    (s.jabatan || '').toLowerCase().includes(q) ||
    (s.nik || '').toLowerCase().includes(q)
  ));
}

// Modal Pengurus
function openPengurusModal() {
  document.getElementById('pengurusModalOverlay').classList.add('active');
  document.getElementById('pengurusForm').reset();
  document.getElementById('pengurusId').value = '';
  document.getElementById('pengurusModalTitle').textContent = 'Tambah Data Pengurus & Staff';
}

function closePengurusModal() {
  document.getElementById('pengurusModalOverlay').classList.remove('active');
}

// Submit Pengurus
document.getElementById('pengurusForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const sb = getSupabase();
  if(!sb) return;

  const btn = document.getElementById('btnSimpanPengurusData');
  const oldText = btn.textContent;
  btn.textContent = 'Menyimpan...'; btn.disabled = true;

  try {
    const id = document.getElementById('pengurusId').value;
    const payload = {
      nama: document.getElementById('pengurus_nama').value.trim(),
      nik: document.getElementById('pengurus_nik').value.trim(),
      jenis_kelamin: document.getElementById('pengurus_jenis_kelamin').value,
      tempat_lahir: document.getElementById('pengurus_tempat_lahir').value.trim(),
      tanggal_lahir: document.getElementById('pengurus_tanggal_lahir').value,
      jabatan: document.getElementById('pengurus_jabatan').value.trim(),
      tupoksi: document.getElementById('pengurus_tupoksi').value.trim(),
      alamat: document.getElementById('pengurus_alamat').value.trim(),
      status_aktif: document.getElementById('pengurus_status').value,
      email: document.getElementById('pengurus_email').value.trim()
    };

    if (id) {
      payload.updated_at = new Date().toISOString();
      const { error } = await sb.from('data_pengurus').update(payload).eq('id', id);
      if (error) throw error;
      showToast('Data pengurus berhasil diperbarui');
    } else {
      const { error } = await sb.from('data_pengurus').insert(payload);
      if (error) throw error;
      showToast('Data pengurus berhasil ditambahkan');
    }
    closePengurusModal();
    loadPengurus();
  } catch (err) {
    console.error(err);
    showToast('Gagal menyimpan data pengurus', 'error');
  } finally {
    btn.textContent = oldText; btn.disabled = false;
  }
});

function editPengurus(id) {
  const d = allPengurus.find(x => x.id === id);
  if(!d) return;
  openPengurusModal();
  document.getElementById('pengurusId').value = d.id;
  document.getElementById('pengurus_nama').value = d.nama || '';
  document.getElementById('pengurus_nik').value = d.nik || '';
  document.getElementById('pengurus_jenis_kelamin').value = d.jenis_kelamin || '';
  document.getElementById('pengurus_tempat_lahir').value = d.tempat_lahir || '';
  document.getElementById('pengurus_tanggal_lahir').value = d.tanggal_lahir || '';
  document.getElementById('pengurus_jabatan').value = d.jabatan || '';
  document.getElementById('pengurus_tupoksi').value = d.tupoksi || '';
  document.getElementById('pengurus_alamat').value = d.alamat || '';
  document.getElementById('pengurus_email').value = d.email || '';
  document.getElementById('pengurus_status').value = d.status_aktif || 'Aktif';
  document.getElementById('pengurusModalTitle').textContent = 'Edit Data Pengurus & Staff';
}

async function deletePengurus(id, nama) {
  const ok = await showCustomConfirm('Hapus Data Pengurus', `Yakin ingin menghapus data pengurus "${nama}"?`, { confirmText: 'Ya, Hapus', type: 'danger' });
  if (!ok) return;
  const sb = getSupabase();
  if(!sb) return;
  const { error } = await sb.from('data_pengurus').delete().eq('id', id);
  if(error) { showToast('Gagal menghapus', 'error'); }
  else { showToast('Data pengurus berhasil dihapus'); loadPengurus(); }
}

function viewPengurusDetail(id) {
  const d = allPengurus.find(x => x.id === id);
  if(!d) return;
  const ttl = d.tempat_lahir && d.tanggal_lahir
    ? `${d.tempat_lahir}, ${formatDate(d.tanggal_lahir)}`
    : (d.tempat_lahir || (d.tanggal_lahir ? formatDate(d.tanggal_lahir) : '-'));

  // Reuse santri detail modal with pengurus data
  const detailHTML = `
    <div class="detail-grid">
      <div class="detail-section">
        <h4>Informasi Pribadi</h4>
        <div class="detail-row"><span>Nama Lengkap</span><strong>${d.nama || '-'}</strong></div>
        <div class="detail-row"><span>NIK</span><strong>${d.nik || '-'}</strong></div>
        <div class="detail-row"><span>Jenis Kelamin</span><strong>${d.jenis_kelamin || '-'}</strong></div>
        <div class="detail-row"><span>Tempat, Tgl Lahir</span><strong>${ttl}</strong></div>
      </div>
      <div class="detail-section">
        <h4>Informasi Pekerjaan</h4>
        <div class="detail-row"><span>Jabatan</span><strong>${d.jabatan || '-'}</strong></div>
        <div class="detail-row"><span>Tupoksi</span><strong>${d.tupoksi || '-'}</strong></div>
        <div class="detail-row"><span>Status</span><strong>${d.status_aktif || '-'}</strong></div>
        <div class="detail-row"><span>Alamat</span><strong>${d.alamat || '-'}</strong></div>
      </div>
    </div>
  `;
  document.getElementById('detailContent').innerHTML = detailHTML;
  document.getElementById('detailModalOverlay').classList.add('active');
}

// Print Pengurus
function printPengurus() {
  document.getElementById('printAreaPengurus').classList.add('active-print');
  document.getElementById('printArea').classList.remove('active-print');
  document.getElementById('printAreaLaporan').classList.remove('active-print');
  setTimeout(() => { window.print(); document.getElementById('printAreaPengurus').classList.remove('active-print'); }, 300);
}

// Export Excel Pengurus
function exportPengurusExcel() {
  try {
    if (allPengurus.length === 0) {
      showToast('Tidak ada data untuk diekspor', 'error');
      return;
    }
    const ws_data = [
      ["PONDOK PESANTREN AL-FATHONAH KUDUKERAS"],
      ["Jl. H. Mastra No. 04, RT. 03 RW.03, Desa Kudukeras, Kec. Babakan, Kab. Cirebon, Jawa Barat 45191"],
      ["Telp/WA: 085323056221-089604194056 | Email: ponpesalfathonah7@gmail.com"],
      [""],
      ["DATA INDUK PENGURUS & STAFF"],
      [""],
      ["NO", "NAMA LENGKAP", "NIK", "L/P", "TEMPAT, TGL LAHIR", "JABATAN", "TUPOKSI", "STATUS", "ALAMAT"]
    ];

    allPengurus.forEach((s, i) => {
      const ttl = s.tempat_lahir && s.tanggal_lahir
        ? `${s.tempat_lahir}, ${formatDate(s.tanggal_lahir)}`
        : (s.tempat_lahir || (s.tanggal_lahir ? formatDate(s.tanggal_lahir) : '-'));
      ws_data.push([
        i+1,
        s.nama || '-',
        s.nik || '-',
        s.jenis_kelamin === 'Laki-laki' ? 'L' : 'P',
        ttl,
        s.jabatan || '-',
        s.tupoksi || '-',
        s.status_aktif || '-',
        s.alamat || '-'
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    ws['!merges'] = [
      { s:{r:0,c:0}, e:{r:0,c:8} },
      { s:{r:1,c:0}, e:{r:1,c:8} },
      { s:{r:2,c:0}, e:{r:2,c:8} },
      { s:{r:4,c:0}, e:{r:4,c:8} }
    ];
    ws['!cols'] = [
      {wch:5}, {wch:25}, {wch:20}, {wch:5}, {wch:25}, {wch:20}, {wch:30}, {wch:12}, {wch:35}
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pengurus');
    XLSX.writeFile(wb, 'Data_Pengurus_Staff.xlsx');
  } catch(err) {
    console.error(err);
    showToast('Gagal export Excel', 'error');
  }
}

// ===== EXPORT EXCEL (SANTRI) =====
function exportExcel() {
  try {
    if (allSantri.length === 0) {
      showToast('Tidak ada data untuk diekspor', 'error');
      return;
    }

    // Bangun header / Kop Surat untuk Excel
    const ws_data = [
      ["PONDOK PESANTREN AL-FATHONAH KUDUKERAS"],
      ["Jl. H. Mastra No. 04, RT. 03 RW.03, Desa Kudukeras, Kec. Babakan, Kab. Cirebon, Jawa Barat 45191"],
      ["Telp/WA: 085323056221-089604194056 | Email: ponpesalfathonah7@gmail.com"],
      [""], // Baris kosong pengganti spasi
      ["DATA LENGKAP INDUK SANTRI"],
      [""],
      [
        "No", "NIS", "Nama Lengkap", "NIK", "Kelas", "St. Mondok", "L/P", "Tempat Lahir", "Tgl Lahir", "Usia", "Anak Ke", "Sekolah Asal", "Tgl Masuk", 
        "Nama Ayah", "NIK Ayah", "Nama Ibu", "NIK Ibu", "FC Ijazah", "FC KK", "FC KTP Ayah", "FC KTP Ibu", "F. 2x3", "F. 3x4", "F. 4x6"
      ]
    ];

    // Isi Data
    allSantri.forEach((s, i) => {
      ws_data.push([
        i + 1,
        s.nis || '-',
        s.nama || '-',
        s.nik || '-',
        getKelasName(s),
        s.status_mondok || 'Aktif',
        s.jenis_kelamin === 'Laki-laki' ? 'L' : 'P',
        s.tempat_lahir || '-',
        s.tanggal_lahir ? formatDate(s.tanggal_lahir) : '-',
        s.usia || '-',
        s.anak_ke || '-',
        s.sekolah || '-',
        s.tanggal_masuk ? formatDate(s.tanggal_masuk) : '-',
        s.nama_ayah || '-',
        s.nik_ayah || '-',
        s.nama_ibu || '-',
        s.nik_ibu || '-',
        (s.jml_fc_ijazah || 0) + ' lbr',
        (s.jml_fc_kk || 0) + ' lbr',
        (s.jml_fc_ktp_ayah || 0) + ' lbr',
        (s.jml_fc_ktp_ibu || 0) + ' lbr',
        (s.jml_foto_2x3 || 0) + ' lbr',
        (s.jml_foto_3x4 || 0) + ' lbr',
        (s.jml_foto_4x6 || 0) + ' lbr'
      ]);
    });

    // Generate sheet from array
    const ws = XLSX.utils.aoa_to_sheet(ws_data);

    // Merge Cells untuk Kop Surat (agar ke tengah)
    if (!ws['!merges']) ws['!merges'] = [];
    ws['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 21 } });
    ws['!merges'].push({ s: { r: 1, c: 0 }, e: { r: 1, c: 21 } });
    ws['!merges'].push({ s: { r: 2, c: 0 }, e: { r: 2, c: 21 } });
    ws['!merges'].push({ s: { r: 4, c: 0 }, e: { r: 4, c: 21 } });

    // Build dan Download file
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Santri");
    XLSX.writeFile(wb, "Data_Induk_Santri_AlFathonah.xlsx");
    
    showToast('File Excel berhasil diunduh!', 'success');
  } catch (err) {
    console.error(err);
    showToast('Gagal mengekspor Excel', 'error');
  }
}

// ====================================================
// ============= BARANG INVENTARIS =====================
// ====================================================

async function loadInventaris() {
  const sb = getSupabase();
  if(!sb) return;
  const { data, error } = await sb.from('barang_inventaris')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    showToast('Gagal memuat data inventaris', 'error');
    console.error(error);
    return;
  }
  allInventaris = data || [];
  renderInventarisTable(allInventaris);
}

function renderInventarisTable(data) {
  const tbody = document.getElementById('inventarisTableBody');
  const fullTbody = document.getElementById('inventarisTableFullBody');
  document.getElementById('countInventaris').textContent = `${data.length} data`;

  if(data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:40px;color:#9CA3AF;">Belum ada data inventaris. Klik "Tambah Barang" untuk memulai.</td></tr>';
    if(fullTbody) fullTbody.innerHTML = '';
    return;
  }

  tbody.innerHTML = data.map((s, i) => {
    const kondisiBadge = s.kondisi === 'Baik'
      ? '<span style="background:#D1FAE5;color:#065F46;padding:3px 8px;border-radius:6px;font-size:0.75rem;font-weight:600;">Baik</span>'
      : s.kondisi === 'Rusak Ringan'
        ? '<span style="background:#FEF3C7;color:#92400E;padding:3px 8px;border-radius:6px;font-size:0.75rem;font-weight:600;">Rusak Ringan</span>'
        : '<span style="background:#FEE2E2;color:#991B1B;padding:3px 8px;border-radius:6px;font-size:0.75rem;font-weight:600;">Rusak Berat</span>';
    const perbaikanCount = (s.catatan_perbaikan && s.catatan_perbaikan.length) || 0;
    const perbaikanBadge = perbaikanCount > 0
      ? `<span style="background:#DBEAFE;color:#1E40AF;padding:3px 8px;border-radius:6px;font-size:0.75rem;font-weight:600;">${perbaikanCount} catatan</span>`
      : '<span style="color:#9CA3AF;font-size:0.78rem;">-</span>';
    return `
      <tr>
        <td>${i+1}</td>
        <td><span class="badge-nis">${s.kode_barang || '-'}</span></td>
        <td><strong>${s.nama_barang || '-'}</strong></td>
        <td>${s.kategori || '-'}</td>
        <td style="text-align:center;">${s.jumlah || 1}</td>
        <td>${kondisiBadge}</td>
        <td>${perbaikanBadge}</td>
        <td>
          <div class="action-btns">
            <button class="btn-action btn-detail" onclick="viewInventarisDetail('${s.id}')" title="Lihat Detail"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>
            <button class="btn-action btn-edit" onclick="editInventaris('${s.id}')" title="Edit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
            <button class="btn-action btn-delete" onclick="deleteInventaris('${s.id}', '${(s.nama_barang||'').replace(/'/g,"\\\'")}')" title="Hapus"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Print table
  if(fullTbody) {
    fullTbody.innerHTML = data.map((s, i) => {
      const perbaikanText = (s.catatan_perbaikan && s.catatan_perbaikan.length)
        ? s.catatan_perbaikan.map(p => `${p.tanggal ? formatDate(p.tanggal) : '-'}: ${p.keterangan || '-'} (${formatRupiah(p.biaya || 0)})`).join('; ')
        : '-';
      return `
        <tr>
          <td style="text-align:center;">${i+1}</td>
          <td>${s.kode_barang || '-'}</td>
          <td>${s.nama_barang || '-'}</td>
          <td>${s.kategori || '-'}</td>
          <td style="text-align:center;">${s.jumlah || 1}</td>
          <td style="text-align:center;">${s.kondisi || '-'}</td>
          <td>${s.lokasi || '-'}</td>
          <td>${s.tanggal_perolehan ? formatDate(s.tanggal_perolehan) : '-'}</td>
          <td style="font-size:10px;">${perbaikanText}</td>
        </tr>
      `;
    }).join('');
  }
}

function filterInventaris() {
  const q = document.getElementById('searchInventaris').value.toLowerCase();
  renderInventarisTable(allInventaris.filter(s =>
    (s.nama_barang || '').toLowerCase().includes(q) ||
    (s.kode_barang || '').toLowerCase().includes(q) ||
    (s.kategori || '').toLowerCase().includes(q)
  ));
}

// Modal Inventaris
function openInventarisModal() {
  document.getElementById('inventarisModalOverlay').classList.add('active');
  document.getElementById('inventarisForm').reset();
  document.getElementById('inventarisId').value = '';
  document.getElementById('inventarisModalTitle').textContent = 'Tambah Barang Inventaris';
  document.getElementById('inv_jumlah').value = 1;
  currentPerbaikan = [];
  renderPerbaikanRows();
}

function closeInventarisModal() {
  document.getElementById('inventarisModalOverlay').classList.remove('active');
}

// Dynamic Perbaikan Rows
function renderPerbaikanRows() {
  const con = document.getElementById('perbaikanContainer');
  if(currentPerbaikan.length === 0) {
    con.innerHTML = '<p style="color:#9CA3AF;font-size:0.8rem;text-align:center;padding:10px;">Belum ada catatan perbaikan.</p>';
    return;
  }
  con.innerHTML = currentPerbaikan.map((p, i) => `
    <div style="display:flex; gap:8px; align-items:center; background:#FFFBEB; padding:10px; border-radius:8px; border:1px solid #FDE68A;">
      <input type="date" value="${p.tanggal || ''}" onchange="updatePerbaikan(${i}, 'tanggal', this.value)" style="flex:1; padding:7px; border:1px solid #ccc; border-radius:4px; font-size:0.8rem;">
      <input type="text" placeholder="Keterangan perbaikan" value="${p.keterangan || ''}" onchange="updatePerbaikan(${i}, 'keterangan', this.value)" style="flex:2; padding:7px; border:1px solid #ccc; border-radius:4px; font-size:0.8rem;">
      <input type="number" placeholder="Biaya (Rp)" value="${p.biaya || 0}" onchange="updatePerbaikan(${i}, 'biaya', this.value)" style="flex:1; padding:7px; border:1px solid #ccc; border-radius:4px; font-size:0.8rem;">
      <button type="button" onclick="removePerbaikan(${i})" style="background:none; border:none; color:#ef4444; cursor:pointer; font-weight:bold" title="Hapus">\u2715</button>
    </div>
  `).join('');
}

function addPerbaikanRow() {
  currentPerbaikan.push({ tanggal: new Date().toISOString().split('T')[0], keterangan: '', biaya: 0 });
  renderPerbaikanRows();
}
function removePerbaikan(idx) { currentPerbaikan.splice(idx, 1); renderPerbaikanRows(); }
function updatePerbaikan(idx, fld, val) {
  currentPerbaikan[idx][fld] = fld === 'biaya' ? Number(val) : val;
}

// Submit Inventaris
document.getElementById('inventarisForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const sb = getSupabase();
  if(!sb) return;

  const btn = document.getElementById('btnSimpanInventaris');
  const oldText = btn.textContent;
  btn.textContent = 'Menyimpan...'; btn.disabled = true;

  try {
    const id = document.getElementById('inventarisId').value;
    const payload = {
      nama_barang: document.getElementById('inv_nama').value.trim(),
      kode_barang: document.getElementById('inv_kode').value.trim(),
      kategori: document.getElementById('inv_kategori').value,
      jumlah: parseInt(document.getElementById('inv_jumlah').value) || 1,
      kondisi: document.getElementById('inv_kondisi').value,
      tanggal_perolehan: document.getElementById('inv_tanggal').value || null,
      lokasi: document.getElementById('inv_lokasi').value.trim(),
      catatan_perbaikan: currentPerbaikan.filter(p => p.keterangan.trim() !== '' || p.biaya > 0)
    };

    if (id) {
      payload.updated_at = new Date().toISOString();
      const { error } = await sb.from('barang_inventaris').update(payload).eq('id', id);
      if (error) throw error;
      showToast('Data inventaris berhasil diperbarui');
    } else {
      const { error } = await sb.from('barang_inventaris').insert(payload);
      if (error) throw error;
      showToast('Data inventaris berhasil ditambahkan');
    }
    closeInventarisModal();
    loadInventaris();
  } catch (err) {
    console.error(err);
    showToast('Gagal menyimpan data inventaris', 'error');
  } finally {
    btn.textContent = oldText; btn.disabled = false;
  }
});

function editInventaris(id) {
  const d = allInventaris.find(x => x.id === id);
  if(!d) return;
  openInventarisModal();
  document.getElementById('inventarisId').value = d.id;
  document.getElementById('inv_nama').value = d.nama_barang || '';
  document.getElementById('inv_kode').value = d.kode_barang || '';
  document.getElementById('inv_kategori').value = d.kategori || '';
  document.getElementById('inv_jumlah').value = d.jumlah || 1;
  document.getElementById('inv_kondisi').value = d.kondisi || 'Baik';
  document.getElementById('inv_tanggal').value = d.tanggal_perolehan || '';
  document.getElementById('inv_lokasi').value = d.lokasi || '';
  currentPerbaikan = d.catatan_perbaikan && d.catatan_perbaikan.length
    ? JSON.parse(JSON.stringify(d.catatan_perbaikan))
    : [];
  renderPerbaikanRows();
  document.getElementById('inventarisModalTitle').textContent = 'Edit Barang Inventaris';
}

async function deleteInventaris(id, nama) {
  const ok = await showCustomConfirm('Hapus Inventaris', `Yakin ingin menghapus barang "${nama}"?`, { confirmText: 'Ya, Hapus', type: 'danger' });
  if (!ok) return;
  const sb = getSupabase();
  if(!sb) return;
  const { error } = await sb.from('barang_inventaris').delete().eq('id', id);
  if(error) { showToast('Gagal menghapus', 'error'); }
  else { showToast('Data inventaris berhasil dihapus'); loadInventaris(); }
}

function viewInventarisDetail(id) {
  const d = allInventaris.find(x => x.id === id);
  if(!d) return;

  let perbaikanHTML = '';
  if (d.catatan_perbaikan && d.catatan_perbaikan.length > 0) {
    perbaikanHTML = d.catatan_perbaikan.map((p, i) => `
      <div style="background:#FFFBEB;padding:10px;border-radius:8px;border:1px solid #FDE68A;margin-bottom:6px;">
        <div style="display:flex;justify-content:space-between;font-size:0.82rem;">
          <strong>#${i+1} - ${p.tanggal ? formatDate(p.tanggal) : 'Tanggal tidak diketahui'}</strong>
          <span style="color:#059669;font-weight:600;">${formatRupiah(p.biaya || 0)}</span>
        </div>
        <p style="margin:4px 0 0;font-size:0.82rem;color:#4B5563;">${p.keterangan || '-'}</p>
      </div>
    `).join('');
  } else {
    perbaikanHTML = '<p style="color:#9CA3AF;font-size:0.82rem;">Tidak ada catatan perbaikan.</p>';
  }

  const totalBiaya = (d.catatan_perbaikan || []).reduce((sum, p) => sum + (p.biaya || 0), 0);

  const detailHTML = `
    <div class="detail-grid">
      <div class="detail-section">
        <h4>Informasi Barang</h4>
        <div class="detail-row"><span>Nama Barang</span><strong>${d.nama_barang || '-'}</strong></div>
        <div class="detail-row"><span>Kode Barang</span><strong>${d.kode_barang || '-'}</strong></div>
        <div class="detail-row"><span>Kategori</span><strong>${d.kategori || '-'}</strong></div>
        <div class="detail-row"><span>Jumlah</span><strong>${d.jumlah || 1}</strong></div>
        <div class="detail-row"><span>Kondisi</span><strong>${d.kondisi || '-'}</strong></div>
        <div class="detail-row"><span>Lokasi</span><strong>${d.lokasi || '-'}</strong></div>
        <div class="detail-row"><span>Tgl Perolehan</span><strong>${d.tanggal_perolehan ? formatDate(d.tanggal_perolehan) : '-'}</strong></div>
      </div>
      <div class="detail-section">
        <h4>Catatan Perbaikan (Total Biaya: ${formatRupiah(totalBiaya)})</h4>
        ${perbaikanHTML}
      </div>
    </div>
  `;
  document.getElementById('detailContent').innerHTML = detailHTML;
  document.getElementById('detailModalOverlay').classList.add('active');
}

// Print Inventaris
function printInventaris() {
  document.getElementById('printAreaInventaris').classList.add('active-print');
  document.getElementById('printArea').classList.remove('active-print');
  document.getElementById('printAreaLaporan').classList.remove('active-print');
  document.getElementById('printAreaPengurus').classList.remove('active-print');
  setTimeout(() => { window.print(); document.getElementById('printAreaInventaris').classList.remove('active-print'); }, 300);
}

// Export Excel Inventaris
function exportInventarisExcel() {
  try {
    if (allInventaris.length === 0) {
      showToast('Tidak ada data untuk diekspor', 'error');
      return;
    }
    const ws_data = [
      ["PONDOK PESANTREN AL-FATHONAH KUDUKERAS"],
      ["Jl. H. Mastra No. 04, RT. 03 RW.03, Desa Kudukeras, Kec. Babakan, Kab. Cirebon, Jawa Barat 45191"],
      ["Telp/WA: 085323056221-089604194056 | Email: ponpesalfathonah7@gmail.com"],
      [""],
      ["DATA BARANG INVENTARIS"],
      [""],
      ["NO", "KODE", "NAMA BARANG", "KATEGORI", "JML", "KONDISI", "LOKASI", "TGL PEROLEHAN", "CATATAN PERBAIKAN", "TOTAL BIAYA PERBAIKAN"]
    ];

    allInventaris.forEach((s, i) => {
      const perbaikanText = (s.catatan_perbaikan && s.catatan_perbaikan.length)
        ? s.catatan_perbaikan.map(p => `${p.tanggal || '-'}: ${p.keterangan || '-'} (Rp${(p.biaya||0).toLocaleString('id-ID')})`).join('\n')
        : '-';
      const totalBiaya = (s.catatan_perbaikan || []).reduce((sum, p) => sum + (p.biaya || 0), 0);
      ws_data.push([
        i+1,
        s.kode_barang || '-',
        s.nama_barang || '-',
        s.kategori || '-',
        s.jumlah || 1,
        s.kondisi || '-',
        s.lokasi || '-',
        s.tanggal_perolehan ? formatDate(s.tanggal_perolehan) : '-',
        perbaikanText,
        totalBiaya
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    ws['!merges'] = [
      { s:{r:0,c:0}, e:{r:0,c:9} },
      { s:{r:1,c:0}, e:{r:1,c:9} },
      { s:{r:2,c:0}, e:{r:2,c:9} },
      { s:{r:4,c:0}, e:{r:4,c:9} }
    ];
    ws['!cols'] = [
      {wch:5}, {wch:12}, {wch:25}, {wch:18}, {wch:5}, {wch:14}, {wch:20}, {wch:15}, {wch:40}, {wch:20}
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventaris');
    XLSX.writeFile(wb, 'Data_Barang_Inventaris.xlsx');
  } catch(err) {
    console.error(err);
    showToast('Gagal export Excel', 'error');
  }
}

// ===== LOGOUT =====
async function handleLogout(e) {
  e.preventDefault();
  const ok = await showCustomConfirm('Keluar dari Dashboard', 'Apakah Anda yakin ingin keluar dari akun ini?', { confirmText: 'Ya, Keluar', type: 'logout' });
  if (!ok) return;
  const sb = getSupabase();
  if (sb) await sb.auth.signOut();
  window.location.replace('login.html');
}

// Close modals on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
});

// ==========================================
// MASTER AKADEMIK LOGIC
// ==========================================
async function fetchMasterKelas() {
  const sb = getSupabase();
  if(!sb) return;
  const {data} = await sb.from('master_kelas').select('*').order('nama_kelas');
  allMasterKelas = data || [];
}

async function loadMasterAkademik() {
  const sb = getSupabase();
  if (!sb) return;

  // Load Tahun
  const { data: tData } = await sb.from('master_tahun_ajaran').select('*').order('created_at', { ascending: false });
  allMasterTahun = tData || [];
  const tahunBody = document.getElementById('masterTahunTableBody');
  if(allMasterTahun.length === 0) {
    tahunBody.innerHTML = '<tr><td colspan="3" style="text-align:center;">Tidak ada data</td></tr>';
  } else {
    tahunBody.innerHTML = allMasterTahun.map((t, index) => {
      const isAktif = index === 0;
      return `
      <tr>
        <td>${t.tahun_ajaran}</td>
        <td><span style="color: ${isAktif ? 'green' : 'gray'}; font-weight: 500;">${isAktif ? 'Aktif' : 'Riwayat'}</span></td>
        <td>
          <button class="btn-action btn-delete" onclick="deleteMaster('master_tahun_ajaran', '${t.id}', '${t.tahun_ajaran}')" title="Hapus">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </td>
      </tr>
      `;
    }).join('');
  }

  // Load Kelas
  await fetchMasterKelas();
  const kelasBody = document.getElementById('masterKelasTableBody');
  if(allMasterKelas.length === 0) {
    kelasBody.innerHTML = '<tr><td colspan="3" style="text-align:center;">Tidak ada data</td></tr>';
  } else {
    kelasBody.innerHTML = allMasterKelas.map(k => `
      <tr>
        <td>${k.nama_kelas}</td>
        <td>-</td>
        <td>
          <button class="btn-action btn-delete" onclick="deleteMaster('master_kelas', '${k.id}', '${k.nama_kelas}')" title="Hapus">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </td>
      </tr>
    `).join('');
  }

  // Load Mapel
  const { data: mData } = await sb.from('master_mapel').select('*').order('nama_mapel');
  allMasterMapel = mData || [];
  const mapelBody = document.getElementById('masterMapelTableBody');
  if(allMasterMapel.length === 0) {
    mapelBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Tidak ada data</td></tr>';
  } else {
    mapelBody.innerHTML = allMasterMapel.map((m, i) => `
      <tr>
        <td>${i+1}</td>
        <td>${m.nama_mapel}</td>
        <td>${m.kategori || '-'}</td>
        <td>
          <button class="btn-action btn-delete" onclick="deleteMaster('master_mapel', '${m.id}', '${m.nama_mapel}')" title="Hapus">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </td>
      </tr>
    `).join('');
  }
}

function openMasterModal(type) {
  document.getElementById('masterType').value = type;
  document.getElementById('masterId').value = '';
  document.getElementById('masterForm').reset();
  
  const container = document.getElementById('masterInputContainer');
  let html = '';
  
  if (type === 'tahun_ajaran') {
    document.getElementById('masterModalTitle').textContent = 'Tambah Tahun Ajaran';
    html = `<div class="form-group"><label>Tahun Ajaran <span class="req">*</span></label><input type="text" id="m_input1" placeholder="Misal: 2026/2027" required></div>`;
  } else if (type === 'kelas') {
    document.getElementById('masterModalTitle').textContent = 'Tambah Kelas';
    html = `<div class="form-group"><label>Nama Kelas <span class="req">*</span></label><input type="text" id="m_input1" placeholder="Misal: VII A" required></div>`;
  } else if (type === 'mapel') {
    document.getElementById('masterModalTitle').textContent = 'Tambah Mata Pelajaran';
    html = `
      <div class="form-group"><label>Nama Mapel <span class="req">*</span></label><input type="text" id="m_input1" placeholder="Misal: Fiqih" required></div>
      <div class="form-group"><label>Kategori</label><select id="m_input2"><option value="Umum">Umum</option><option value="Agama">Agama</option><option value="Tahfidz">Tahfidz</option></select></div>
    `;
  }
  container.innerHTML = html;
  document.getElementById('masterModalOverlay').classList.add('active');
}

function closeMasterModal() {
  document.getElementById('masterModalOverlay').classList.remove('active');
}

async function saveMasterData(e) {
  e.preventDefault();
  const sb = getSupabase();
  const type = document.getElementById('masterType').value;
  const btn = document.getElementById('btnSimpanMaster');
  btn.disabled = true;
  btn.textContent = 'Menyimpan...';

  let table = '';
  let payload = {};

  if (type === 'tahun_ajaran') {
    table = 'master_tahun_ajaran';
    payload = { tahun_ajaran: document.getElementById('m_input1').value };
  } else if (type === 'kelas') {
    table = 'master_kelas';
    payload = { nama_kelas: document.getElementById('m_input1').value };
  } else if (type === 'mapel') {
    table = 'master_mapel';
    payload = { 
      nama_mapel: document.getElementById('m_input1').value,
      kategori: document.getElementById('m_input2') ? document.getElementById('m_input2').value : 'Umum'
    };
  }

  const { error } = await sb.from(table).insert([payload]);
  btn.disabled = false;
  btn.textContent = 'Simpan Data';

  if (error) {
    showToast('Gagal menyimpan: ' + error.message, 'error');
  } else {
    showToast('Berhasil menambahkan master data', 'success');
    closeMasterModal();
    loadMasterAkademik();
    if(type === 'kelas') fetchMasterKelas();
  }
}

async function deleteMaster(table, id, name) {
  const ok = await showCustomConfirm('Hapus Master Data', `Yakin ingin menghapus "${name}"? Jika ada data lain yang menggunakan master ini, menghapus dapat menyebabkan data tersebut kehilangan referensinya.`, { confirmText: 'Ya, Hapus', type: 'warning' });
  if (!ok) return;
  const sb = getSupabase();
  const { error } = await sb.from(table).delete().eq('id', id);
  if(error) showToast('Gagal hapus: '+error.message, 'error');
  else { showToast('Berhasil dihapus', 'success'); loadMasterAkademik(); if(table === 'master_kelas') fetchMasterKelas(); }
}

// ==========================================
// SETORAN HAFALAN LOGIC
// ==========================================
let currentRiwayatSantriId = '';
let currentRiwayatSantriNama = '';

async function loadHafalan() {
  const sb = getSupabase();
  if (!sb) return;
  const { data, error } = await sb.from('setoran_hafalan').select('*').order('tanggal', { ascending: false });
  if (error) { showToast('Gagal load hafalan: '+error.message, 'error'); return; }
  allHafalan = data || [];
  
  if (!allSantri || allSantri.length === 0) {
    const { data: sData } = await sb.from('data_induk_santri').select('*, master_kelas(nama_kelas)').order('nama', { ascending: true });
    allSantri = sData || [];
  }

  // Load master kelas if needed
  if (allMasterKelas.length === 0) {
    await fetchMasterKelas();
  }

  // Populate kelas filter dropdown from master data
  const kelasFilter = document.getElementById('filterKelasHafalan');
  if (kelasFilter && kelasFilter.options.length <= 1) {
    allMasterKelas.forEach(k => {
      const opt = document.createElement('option');
      opt.value = k.nama_kelas; opt.textContent = k.nama_kelas;
      kelasFilter.appendChild(opt);
    });
  }
  
  renderHafalanSantriTable(allSantri);
}

// Helper: get materi text from hafalan record
function getHafalanMateri(h) {
  const kat = h.kategori || "Al-Qur'an";
  if (kat === "Al-Qur'an") {
    let t = h.surah_juz || '-';
    if (h.juz) t = `Juz ${h.juz} - ${t}`;
    if (h.ayat) t += ` : ${h.ayat}`;
    return t;
  } else if (kat === 'Kitab') {
    let t = h.nama_kitab || '-';
    if (h.bab_kitab) t += ` — ${h.bab_kitab}`;
    return t;
  } else if (kat === "Do'a") {
    return h.nama_doa || '-';
  }
  return h.surah_juz || '-';
}

// Helper: status badge style
function getStatusBadge(status, poin) {
  const styles = {
    'Lulus': 'background: #D1FAE5; color: #065F46;',
    'Lulus Bersyarat': 'background: #FEF3C7; color: #92400E;',
    'Belum Lulus': 'background: #FEE2E2; color: #B91C1C;'
  };
  const s = styles[status] || 'background: #F3F4F6; color: #1F2937;';
  const poinText = poin !== null && poin !== undefined ? ` (${poin})` : '';
  return `<span style="padding:4px 8px; border-radius:4px; font-size:0.75rem; font-weight:500; ${s}">${status}${poinText}</span>`;
}

function renderHafalanSantriTable(santriList) {
  const tbody = document.getElementById('hafalanSantriTableBody');
  document.getElementById('countHafalanSantri').textContent = `${santriList.length} santri`;
  
  if(santriList.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:40px; color:#9CA3AF;">Belum ada santri terdaftar</td></tr>';
    return;
  }

  tbody.innerHTML = santriList.map((s, idx) => {
    const santriHafalan = allHafalan.filter(h => h.santri_id === s.id);
    const latest = santriHafalan.length > 0 ? santriHafalan[0] : null;
    const kelasName = s.master_kelas ? s.master_kelas.nama_kelas : '-';
    const totalSetoran = santriHafalan.length;

    let setoranTxt = '<span style="color:#9CA3AF;">Belum ada</span>';
    if(latest) {
      const kat = latest.kategori || "Al-Qur'an";
      const materiTxt = getHafalanMateri(latest);
      const kategoriColors = {
        "Al-Qur'an": 'background: #D1FAE5; color: #065F46;',
        'Kitab': 'background: #E0E7FF; color: #3730A3;',
        "Do'a": 'background: #FEF3C7; color: #92400E;'
      };
      const katStyle = kategoriColors[kat] || 'background: #F3F4F6; color: #374151;';
      setoranTxt = `
        <span style="padding:2px 6px; border-radius:4px; font-size:0.7rem; font-weight:500; ${katStyle}">${kat}</span>
        <span style="font-size:0.85rem; margin-left:4px;">${materiTxt}</span>
        <br><span style="font-size:0.75rem; color:#6B7280;">${formatDate(latest.tanggal)}</span>
        ${getStatusBadge(latest.status_lulus || 'Lulus', latest.poin)}
      `;
    }

    return `
      <tr>
        <td>${idx + 1}</td>
        <td><strong>${s.nama}</strong> <br> <span style="font-size:0.8rem; color:#6B7280;">${s.nis || ''}</span></td>
        <td>${kelasName}</td>
        <td><span style="background: ${totalSetoran > 0 ? '#D1FAE5' : '#F3F4F6'}; color: ${totalSetoran > 0 ? '#065F46' : '#9CA3AF'}; padding:4px 10px; border-radius:6px; font-weight:600; font-size:0.8rem;">${totalSetoran}</span></td>
        <td>${setoranTxt}</td>
        <td>
          <div class="action-btns" style="gap:8px; display:flex; align-items:center;">
            <button class="btn-add" style="padding: 6px 12px; font-size: 0.75rem; width: auto; height: auto;" onclick="openHafalanModal('${s.id}', '${(s.nama||'').replace(/'/g, "\\'")}')">+ Catat</button>
            <button class="btn-secondary" style="padding: 6px 12px; font-size: 0.75rem; width: auto; height: auto; white-space: nowrap; border-radius: 8px; border: 1px solid #C7D2FE; background: #EEF2FF; color: #4338CA;" onclick="openRiwayatHafalanModal('${s.id}', '${(s.nama||'').replace(/'/g, "\\'")}')" ${totalSetoran === 0 ? 'disabled style="padding:6px 12px;font-size:0.75rem;width:auto;height:auto;opacity:0.5;cursor:not-allowed;"' : ''}>Riwayat (${totalSetoran})</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function filterSantriHafalan() {
  const q = document.getElementById('searchHafalan').value.toLowerCase();
  const kelasVal = document.getElementById('filterKelasHafalan').value;
  const d = allSantri.filter(s => {
    const matchQ = (s.nama || '').toLowerCase().includes(q) || (s.nis || '').toLowerCase().includes(q);
    const kelasName = s.master_kelas ? s.master_kelas.nama_kelas : '';
    const matchKelas = kelasVal === '' || kelasName === kelasVal;
    return matchQ && matchKelas;
  });
  renderHafalanSantriTable(d);
}

// Dynamic form fields based on category
function toggleHafalanFields() {
  const kat = document.getElementById('hafalan_kategori').value;
  const container = document.getElementById('hafalanDynamicFields');
  const title = document.getElementById('hafalanFieldsTitle');

  if (kat === "Al-Qur'an") {
    title.textContent = "📖 Detail Setoran Al-Qur'an";
    container.innerHTML = `
      <div class="form-group">
        <label>Juz</label>
        <input type="number" id="hafalan_juz" min="1" max="30" placeholder="1 - 30">
      </div>
      <div class="form-group">
        <label>Nama Surat <span class="req">*</span></label>
        <input type="text" id="hafalan_surah" placeholder="Misal: Al-Baqarah" required>
      </div>
      <div class="form-group">
        <label>Ayat</label>
        <input type="text" id="hafalan_ayat" placeholder="Misal: 1-10">
      </div>
    `;
  } else if (kat === 'Kitab') {
    title.textContent = "📚 Detail Setoran Kitab";
    container.innerHTML = `
      <div class="form-group">
        <label>Nama Kitab <span class="req">*</span></label>
        <input type="text" id="hafalan_nama_kitab" placeholder="Misal: Safinatun Najah, Ta'lim Muta'alim" required>
      </div>
      <div class="form-group">
        <label>Bab / Tentang</label>
        <input type="text" id="hafalan_bab_kitab" placeholder="Misal: Bab Thaharah, Bab Shalat">
      </div>
    `;
  } else if (kat === "Do'a") {
    title.textContent = "🤲 Detail Setoran Do'a";
    container.innerHTML = `
      <div class="form-group" style="grid-column: 1 / -1;">
        <label>Nama Do'a <span class="req">*</span></label>
        <input type="text" id="hafalan_nama_doa" placeholder="Misal: Do'a Sebelum Makan, Do'a Masuk Masjid" required>
      </div>
    `;
  }
}

// Show/hide syarat field
function toggleSyaratField() {
  const status = document.getElementById('hafalan_status').value;
  const syaratGroup = document.getElementById('syaratGroup');
  const syaratField = document.getElementById('hafalan_syarat');
  if (status === 'Lulus Bersyarat') {
    syaratGroup.style.display = 'flex';
    syaratField.required = true;
  } else {
    syaratGroup.style.display = 'none';
    syaratField.required = false;
    syaratField.value = '';
  }
}

function openHafalanModal(santriId, santriNama) {
  document.getElementById('hafalanModalOverlay').classList.add('active');
  document.getElementById('hafalanForm').reset();
  document.getElementById('hafalanId').value = '';
  document.getElementById('hafalan_tanggal').value = new Date().toISOString().split('T')[0];
  document.getElementById('hafalan_santri_id').value = santriId;
  document.getElementById('hafalan_nama_santri').value = santriNama;
  document.getElementById('hafalan_kategori').value = "Al-Qur'an";
  document.getElementById('hafalan_status').value = 'Lulus';
  document.getElementById('syaratGroup').style.display = 'none';
  toggleHafalanFields();
}

function closeHafalanModal() {
  document.getElementById('hafalanModalOverlay').classList.remove('active');
}

function openRiwayatHafalanModal(santriId, santriNama) {
  currentRiwayatSantriId = santriId;
  currentRiwayatSantriNama = santriNama;

  document.getElementById('riwayatHafalanModalTitle').textContent = 'Riwayat Setoran Hafalan';
  document.getElementById('riwayatHafalanModalSubtitle').textContent = `Santri: ${santriNama}`;
  
  const hList = allHafalan.filter(h => h.santri_id === santriId);
  const tbody = document.getElementById('riwayatHafalanTableBody');
  if(hList.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:30px; color:#9CA3AF;">Belum ada riwayat hafalan</td></tr>';
  } else {
    tbody.innerHTML = hList.map((h, idx) => {
      const kat = h.kategori || "Al-Qur'an";
      const materiTxt = getHafalanMateri(h);
      const kategoriColors = {
        "Al-Qur'an": 'background: #D1FAE5; color: #065F46;',
        'Kitab': 'background: #E0E7FF; color: #3730A3;',
        "Do'a": 'background: #FEF3C7; color: #92400E;'
      };
      const katStyle = kategoriColors[kat] || 'background: #F3F4F6; color: #374151;';
      const statusBadge = getStatusBadge(h.status_lulus || 'Lulus', h.poin);
      let ketText = h.keterangan || '';
      if (h.status_lulus === 'Lulus Bersyarat' && h.syarat) {
        ketText = `<strong>Syarat:</strong> ${h.syarat}${ketText ? '<br>' + ketText : ''}`;
      }

      return `
        <tr>
          <td>${idx + 1}</td>
          <td>${formatDate(h.tanggal)}</td>
          <td><span style="padding:3px 7px; border-radius:4px; font-size:0.7rem; font-weight:500; ${katStyle}">${kat}</span></td>
          <td style="max-width:180px; word-break: break-word;">${materiTxt}</td>
          <td style="text-align:center; font-weight:600;">${h.poin ?? '-'}</td>
          <td>${statusBadge}</td>
          <td style="font-size:0.8rem; max-width:150px; word-break:break-word;">${ketText || '-'}</td>
          <td>
            <button class="btn-action btn-delete" onclick="deleteHafalan('${h.id}', '${santriId}', '${santriNama.replace(/'/g, "\\'")}')" title="Hapus">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }
  
  document.getElementById('riwayatHafalanModalOverlay').classList.add('active');
}

function closeRiwayatHafalanModal() {
  document.getElementById('riwayatHafalanModalOverlay').classList.remove('active');
}

async function saveHafalan(e) {
  e.preventDefault();
  const sb = getSupabase();
  const btn = document.getElementById('btnSimpanHafalan');
  btn.disabled = true;
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path></svg> Menyimpan...';

  const kat = document.getElementById('hafalan_kategori').value;
  const payload = {
    santri_id: document.getElementById('hafalan_santri_id').value,
    tanggal: document.getElementById('hafalan_tanggal').value,
    kategori: kat,
    poin: parseInt(document.getElementById('hafalan_poin').value) || 0,
    status_lulus: document.getElementById('hafalan_status').value,
    syarat: document.getElementById('hafalan_syarat').value || null,
    keterangan: document.getElementById('hafalan_keterangan').value || null,
    // Reset all category specific fields
    surah_juz: null, juz: null, ayat: null,
    nama_kitab: null, bab_kitab: null,
    nama_doa: null
  };

  // Fill category-specific fields
  if (kat === "Al-Qur'an") {
    payload.surah_juz = document.getElementById('hafalan_surah')?.value || null;
    payload.juz = document.getElementById('hafalan_juz')?.value || null;
    payload.ayat = document.getElementById('hafalan_ayat')?.value || null;
  } else if (kat === 'Kitab') {
    payload.nama_kitab = document.getElementById('hafalan_nama_kitab')?.value || null;
    payload.bab_kitab = document.getElementById('hafalan_bab_kitab')?.value || null;
  } else if (kat === "Do'a") {
    payload.nama_doa = document.getElementById('hafalan_nama_doa')?.value || null;
  }

  const { error } = await sb.from('setoran_hafalan').insert([payload]);
  
  btn.disabled = false;
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg> Simpan Data';

  if(error) showToast('Gagal simpan: '+error.message, 'error');
  else {
    showToast('Hafalan berhasil ditambah', 'success');
    closeHafalanModal();
    loadHafalan();
  }
}

async function deleteHafalan(id, santriId, santriNama) {
  const ok = await showCustomConfirm('Hapus Data Hafalan', 'Yakin ingin menghapus data hafalan ini?', { confirmText: 'Ya, Hapus', type: 'danger' });
  if (!ok) return;
  const sb = getSupabase();
  const { error } = await sb.from('setoran_hafalan').delete().eq('id', id);
  if(error) {
    showToast('Gagal hapus: '+error.message, 'error');
  } else { 
    showToast('Hafalan dihapus', 'success'); 
    await loadHafalan(); 
    if(santriId) openRiwayatHafalanModal(santriId, santriNama);
  }
}

// Print Massal - All hafalan data with kop surat
function printHafalanMassal() {
  if(allHafalan.length === 0) {
    showToast('Tidak ada data hafalan untuk dicetak', 'error');
    return;
  }

  // Build rows: each hafalan record with santri name
  const tbody = document.getElementById('hafalanTableFullBody');
  tbody.innerHTML = allHafalan.map((h, idx) => {
    const santri = allSantri.find(s => s.id === h.santri_id);
    const nama = santri ? santri.nama : '-';
    const kelas = santri && santri.master_kelas ? santri.master_kelas.nama_kelas : '-';
    const kat = h.kategori || "Al-Qur'an";
    const materiTxt = getHafalanMateri(h);
    let ketText = h.keterangan || '';
    if (h.status_lulus === 'Lulus Bersyarat' && h.syarat) {
      ketText = `Syarat: ${h.syarat}${ketText ? ', ' + ketText : ''}`;
    }
    return `
      <tr>
        <td style="text-align:center;">${idx + 1}</td>
        <td>${nama}</td>
        <td style="text-align:center;">${kelas}</td>
        <td>${formatDate(h.tanggal)}</td>
        <td style="text-align:center;">${kat}</td>
        <td>${materiTxt}</td>
        <td style="text-align:center;">${h.poin ?? '-'}</td>
        <td style="text-align:center;">${h.status_lulus || '-'}</td>
        <td style="font-size:10px;">${ketText || '-'}</td>
      </tr>
    `;
  }).join('');

  document.querySelectorAll('[id^="printArea"], #psbPrintArea').forEach(el => el.classList.remove('active-print'));
  document.getElementById('printAreaHafalan').classList.add('active-print');
  setTimeout(() => { window.print(); document.getElementById('printAreaHafalan').classList.remove('active-print'); }, 300);
}

// Print Per Santri - from riwayat modal
function printHafalanPerSantri() {
  const santriId = currentRiwayatSantriId;
  const santriNama = currentRiwayatSantriNama;
  if (!santriId) return;

  const santri = allSantri.find(s => s.id === santriId);
  const kelas = santri && santri.master_kelas ? santri.master_kelas.nama_kelas : '-';
  const hList = allHafalan.filter(h => h.santri_id === santriId);

  if(hList.length === 0) {
    showToast('Tidak ada data hafalan untuk dicetak', 'error');
    return;
  }

  document.getElementById('printHafalanSantriSubtitle').textContent = `Nama: ${santriNama}  |  Kelas: ${kelas}`;

  const tbody = document.getElementById('hafalanSantriTableFullBody');
  tbody.innerHTML = hList.map((h, idx) => {
    const kat = h.kategori || "Al-Qur'an";
    const materiTxt = getHafalanMateri(h);
    let ketText = h.keterangan || '';
    if (h.status_lulus === 'Lulus Bersyarat' && h.syarat) {
      ketText = `Syarat: ${h.syarat}${ketText ? ', ' + ketText : ''}`;
    }
    return `
      <tr>
        <td style="text-align:center;">${idx + 1}</td>
        <td>${formatDate(h.tanggal)}</td>
        <td style="text-align:center;">${kat}</td>
        <td>${materiTxt}</td>
        <td style="text-align:center;">${h.poin ?? '-'}</td>
        <td style="text-align:center;">${h.status_lulus || '-'}</td>
        <td style="font-size:10px;">${ketText || '-'}</td>
      </tr>
    `;
  }).join('');

  document.querySelectorAll('[id^="printArea"], #psbPrintArea').forEach(el => el.classList.remove('active-print'));
  document.getElementById('printAreaHafalanSantri').classList.add('active-print');
  setTimeout(() => { window.print(); document.getElementById('printAreaHafalanSantri').classList.remove('active-print'); }, 300);
}

// ==========================================
// SURAT MENYURAT LOGIC
// ==========================================
async function loadSurat() {
  const sb = getSupabase();
  if(!sb) return;
  const { data, error } = await sb.from('surat_menyurat').select('*').order('tanggal_surat', { ascending: false });
  if(error) { showToast('Gagal load surat: '+error.message, 'error'); return; }
  allSurat = data || [];
  renderSuratTable(allSurat);
}

function renderSuratTable(data) {
  const tbody = document.getElementById('suratTableBody');
  if(data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">Tidak ada data surat</td></tr>';
    return;
  }
  tbody.innerHTML = data.map((s, idx) => {
    const isMasuk = s.jenis_surat === 'Surat Masuk';
    const badgeType = isMasuk ? 'background: #D1FAE5; color: #065F46;' : 'background: #DBEAFE; color: #1E40AF;';
    const fileLink = s.file_url ? `<a href="${s.file_url}" target="_blank" style="color:var(--primary-color);font-size:0.85rem;text-decoration:none;">📄 Lihat Berkas</a>` : '-';
    return `
      <tr>
        <td>${idx + 1}</td>
        <td><span style="padding:4px 8px; border-radius:4px; font-size:0.75rem; font-weight:500; ${badgeType}">${s.jenis_surat}</span></td>
        <td><strong>${s.nomor_surat}</strong></td>
        <td>${formatDate(s.tanggal_surat)}</td>
        <td>${s.pengirim_penerima || '-'}</td>
        <td>${s.perihal}</td>
        <td>${fileLink}</td>
        <td>
          <button class="btn-action btn-delete" onclick="deleteSurat('${s.id}')" title="Hapus">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </td>
      </tr>
    `
  }).join('');
}

function filterSurat() {
  const q = document.getElementById('searchSurat').value.toLowerCase();
  const jenis = document.getElementById('filterJenisSurat').value;
  const filtered = allSurat.filter(s => {
    const matchJenis = jenis === '' || s.jenis_surat === jenis;
    const matchQ = (s.perihal||'').toLowerCase().includes(q) || (s.nomor_surat||'').toLowerCase().includes(q) || (s.pengirim_penerima||'').toLowerCase().includes(q);
    return matchJenis && matchQ;
  });
  renderSuratTable(filtered);
}

function openSuratModal() {
  document.getElementById('suratModalOverlay').classList.add('active');
  document.getElementById('suratForm').reset();
  document.getElementById('suratId').value = '';
  document.getElementById('surat_tanggal').value = new Date().toISOString().split('T')[0];
  document.getElementById('status_surat_file').textContent = '';
}
function closeSuratModal() {
  document.getElementById('suratModalOverlay').classList.remove('active');
}

async function saveSurat(e) {
  e.preventDefault();
  const sb = getSupabase();
  const btn = document.getElementById('btnSimpanSurat');
  btn.disabled = true;
  btn.textContent = 'Menyimpan...';

  const fileInput = document.getElementById('surat_file');
  document.getElementById('status_surat_file').textContent = 'Mengupload berkas...';
  let fileUrl = null;
  if(fileInput.files.length > 0) {
    fileUrl = await uploadFile(fileInput, 'surat');
  }

  const payload = {
    jenis_surat: document.getElementById('surat_jenis').value,
    nomor_surat: document.getElementById('surat_nomor').value,
    tanggal_surat: document.getElementById('surat_tanggal').value,
    pengirim_penerima: document.getElementById('surat_pengirim').value,
    perihal: document.getElementById('surat_perihal').value,
    keterangan: document.getElementById('surat_keterangan').value,
    file_url: fileUrl
  };

  const { error } = await sb.from('surat_menyurat').insert([payload]);
  
  btn.disabled = false;
  btn.textContent = 'Simpan Surat';
  document.getElementById('status_surat_file').textContent = '';

  if(error) showToast('Gagal simpan: '+error.message, 'error');
  else {
    showToast('Surat berhasil ditambahkan', 'success');
    closeSuratModal();
    loadSurat();
  }
}

async function deleteSurat(id) {
  const ok = await showCustomConfirm('Hapus Surat', 'Yakin ingin menghapus surat ini?', { confirmText: 'Ya, Hapus', type: 'danger' });
  if (!ok) return;
  const sb = getSupabase();
  const { error } = await sb.from('surat_menyurat').delete().eq('id', id);
  if(error) showToast('Gagal hapus: '+error.message, 'error');
  else { showToast('Surat dihapus', 'success'); loadSurat(); }
}

// ==========================================
// JADWAL KEGIATAN LOGIC
// ==========================================
async function loadJadwal() {
  const sb = getSupabase();
  if(!sb) return;
  const { data, error } = await sb.from('jadwal_kegiatan').select('*').order('tanggal_mulai', { ascending: false });
  if(error) { showToast('Gagal load jadwal: '+error.message, 'error'); return; }
  allJadwal = data || [];
  renderJadwalTable(allJadwal);
}

function renderJadwalTable(data) {
  const tbody = document.getElementById('jadwalTableBody');
  document.getElementById('countJadwal').textContent = `${data.length} kegiatan`;
  if(data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:40px; color:#9CA3AF;">Tidak ada kegiatan</td></tr>';
    return;
  }
  tbody.innerHTML = data.map((j, idx) => {
    let statusStyle = 'background: #F3F4F6; color: #1F2937;'; // Selesai
    if(j.status === 'Akan Datang') statusStyle = 'background: #DBEAFE; color: #1E40AF;';
    if(j.status === 'Sedang Berlangsung') statusStyle = 'background: #FEF3C7; color: #92400E;';
    if(j.status === 'Dibatalkan') statusStyle = 'background: #FEE2E2; color: #B91C1C;';

    let dateText = formatDate(j.tanggal_mulai);
    if(j.tanggal_selesai && j.tanggal_selesai !== j.tanggal_mulai) {
      dateText += ` - ${formatDate(j.tanggal_selesai)}`;
    }

    const kategoriColors = {
      'Rapat': 'background: #E0E7FF; color: #3730A3;',
      'Upacara': 'background: #FEF3C7; color: #92400E;',
      'Keagamaan': 'background: #D1FAE5; color: #065F46;',
      'Akademik': 'background: #DBEAFE; color: #1E40AF;',
      'Ekstrakurikuler': 'background: #FCE7F3; color: #9D174D;',
      'Sosial': 'background: #FEE2E2; color: #B91C1C;',
      'Olahraga': 'background: #CCFBF1; color: #115E59;',
      'Peringatan Hari Besar': 'background: #FDE68A; color: #78350F;',
      'Lainnya': 'background: #F3F4F6; color: #374151;'
    };
    const katStyle = kategoriColors[j.kategori] || 'background: #F3F4F6; color: #374151;';

    return `
      <tr>
        <td>${idx + 1}</td>
        <td>${dateText}</td>
        <td><strong>${j.nama_kegiatan}</strong></td>
        <td><span style="padding:4px 8px; border-radius:4px; font-size:0.75rem; font-weight:500; ${katStyle}">${j.kategori || '-'}</span></td>
        <td>
          <div style="font-size:0.85rem;">
            <div>🕒 ${j.waktu_kegiatan || '-'}</div>
            <div style="color:var(--gray-500); margin-top:2px;">📍 ${j.tempat || '-'}</div>
          </div>
        </td>
        <td>${j.penanggung_jawab || '-'}</td>
        <td><span style="padding:4px 8px; border-radius:4px; font-size:0.75rem; font-weight:500; ${statusStyle}">${j.status}</span></td>
        <td>
          <div class="action-btns">
            <button class="btn-action btn-detail" onclick="viewJadwalDetail('${j.id}')" title="Lihat Detail">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </button>
            <button class="btn-action btn-edit" onclick="editJadwal('${j.id}')" title="Edit">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="btn-action btn-delete" onclick="deleteJadwal('${j.id}')" title="Hapus">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </td>
      </tr>
    `
  }).join('');
}

function filterJadwal() {
  const q = document.getElementById('searchJadwal').value.toLowerCase();
  const statusFilter = document.getElementById('filterStatusJadwal').value;
  const filtered = allJadwal.filter(j => {
    const matchQ = (j.nama_kegiatan||'').toLowerCase().includes(q) || (j.tempat||'').toLowerCase().includes(q) || (j.penanggung_jawab||'').toLowerCase().includes(q) || (j.kategori||'').toLowerCase().includes(q) || (j.peserta||'').toLowerCase().includes(q);
    const matchStatus = statusFilter === '' || j.status === statusFilter;
    return matchQ && matchStatus;
  });
  renderJadwalTable(filtered);
}

function openJadwalModal(editId) {
  document.getElementById('jadwalModalOverlay').classList.add('active');
  document.getElementById('jadwalForm').reset();
  document.getElementById('jadwalId').value = '';
  document.getElementById('jadwalModalTitle').textContent = 'Tambah Jadwal Kegiatan';
  document.getElementById('jadwal_tgl_mulai').value = new Date().toISOString().split('T')[0];
}

function closeJadwalModal() {
  document.getElementById('jadwalModalOverlay').classList.remove('active');
}

function editJadwal(id) {
  const j = allJadwal.find(x => x.id === id);
  if(!j) return;

  document.getElementById('jadwalModalOverlay').classList.add('active');
  document.getElementById('jadwalModalTitle').textContent = 'Edit Jadwal Kegiatan';
  document.getElementById('jadwalId').value = j.id;
  document.getElementById('jadwal_nama').value = j.nama_kegiatan || '';
  document.getElementById('jadwal_kategori').value = j.kategori || 'Lainnya';
  document.getElementById('jadwal_status').value = j.status || 'Akan Datang';
  document.getElementById('jadwal_tgl_mulai').value = j.tanggal_mulai || '';
  document.getElementById('jadwal_tgl_selesai').value = j.tanggal_selesai || '';
  document.getElementById('jadwal_waktu').value = j.waktu_kegiatan || '';
  document.getElementById('jadwal_tempat').value = j.tempat || '';
  document.getElementById('jadwal_pj').value = j.penanggung_jawab || '';
  document.getElementById('jadwal_peserta').value = j.peserta || '';
  document.getElementById('jadwal_deskripsi').value = j.deskripsi || '';
}

function viewJadwalDetail(id) {
  const j = allJadwal.find(x => x.id === id);
  if(!j) return;

  let dateText = formatDate(j.tanggal_mulai);
  if(j.tanggal_selesai && j.tanggal_selesai !== j.tanggal_mulai) {
    dateText += ` s/d ${formatDate(j.tanggal_selesai)}`;
  }

  let statusStyle = 'background: #F3F4F6; color: #1F2937;';
  if(j.status === 'Akan Datang') statusStyle = 'background: #DBEAFE; color: #1E40AF;';
  if(j.status === 'Sedang Berlangsung') statusStyle = 'background: #FEF3C7; color: #92400E;';
  if(j.status === 'Dibatalkan') statusStyle = 'background: #FEE2E2; color: #B91C1C;';

  const content = document.getElementById('jadwalDetailContent');
  content.innerHTML = `
    <div class="detail-section">
      <h4>📋 Informasi Kegiatan</h4>
      <div class="detail-row"><span>Nama Kegiatan</span><strong>${j.nama_kegiatan || '-'}</strong></div>
      <div class="detail-row"><span>Kategori</span><strong>${j.kategori || '-'}</strong></div>
      <div class="detail-row"><span>Status</span><strong><span style="padding:4px 10px; border-radius:6px; font-size:0.8rem; font-weight:600; ${statusStyle}">${j.status}</span></strong></div>
    </div>
    <div class="detail-section">
      <h4>📅 Jadwal & Lokasi</h4>
      <div class="detail-row"><span>Tanggal</span><strong>${dateText}</strong></div>
      <div class="detail-row"><span>Waktu</span><strong>${j.waktu_kegiatan || '-'}</strong></div>
      <div class="detail-row"><span>Tempat</span><strong>${j.tempat || '-'}</strong></div>
    </div>
    <div class="detail-section">
      <h4>👤 Penyelenggara</h4>
      <div class="detail-row"><span>Penanggung Jawab</span><strong>${j.penanggung_jawab || '-'}</strong></div>
      <div class="detail-row"><span>Peserta / Sasaran</span><strong>${j.peserta || '-'}</strong></div>
    </div>
    ${j.deskripsi ? `
    <div class="detail-section">
      <h4>📝 Deskripsi Kegiatan</h4>
      <div style="padding:12px; background:var(--gray-50); border-radius:8px; font-size:0.85rem; color:var(--gray-700); line-height:1.6; white-space:pre-line;">${j.deskripsi}</div>
    </div>` : ''}
    <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px; padding-top: 16px; border-top: 1px solid var(--gray-200);">
      <button class="btn-secondary" onclick="editJadwal('${j.id}'); closeJadwalDetailModal();" style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; font-weight: 600;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
        Edit Kegiatan
      </button>
    </div>
  `;
  document.getElementById('jadwalDetailModalOverlay').classList.add('active');
}

function closeJadwalDetailModal() {
  document.getElementById('jadwalDetailModalOverlay').classList.remove('active');
}

async function saveJadwal(e) {
  e.preventDefault();
  const sb = getSupabase();
  const btn = document.getElementById('btnSimpanJadwal');
  btn.disabled = true;
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path></svg> Menyimpan...';

  const tglSelesai = document.getElementById('jadwal_tgl_selesai').value;
  const payload = {
    nama_kegiatan: document.getElementById('jadwal_nama').value,
    kategori: document.getElementById('jadwal_kategori').value,
    tanggal_mulai: document.getElementById('jadwal_tgl_mulai').value,
    tanggal_selesai: tglSelesai ? tglSelesai : null,
    waktu_kegiatan: document.getElementById('jadwal_waktu').value,
    tempat: document.getElementById('jadwal_tempat').value,
    penanggung_jawab: document.getElementById('jadwal_pj').value,
    peserta: document.getElementById('jadwal_peserta').value,
    deskripsi: document.getElementById('jadwal_deskripsi').value,
    status: document.getElementById('jadwal_status').value
  };

  const editId = document.getElementById('jadwalId').value;
  let error;

  if (editId) {
    // Update existing
    const result = await sb.from('jadwal_kegiatan').update(payload).eq('id', editId);
    error = result.error;
  } else {
    // Insert new
    const result = await sb.from('jadwal_kegiatan').insert([payload]);
    error = result.error;
  }
  
  btn.disabled = false;
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg> Simpan Kegiatan';

  if(error) showToast('Gagal simpan: '+error.message, 'error');
  else {
    showToast(editId ? 'Kegiatan berhasil diperbarui' : 'Kegiatan berhasil ditambahkan', 'success');
    closeJadwalModal();
    loadJadwal();
  }
}

async function deleteJadwal(id) {
  const ok = await showCustomConfirm('Hapus Kegiatan', 'Yakin ingin membatalkan/menghapus kegiatan ini?', { confirmText: 'Ya, Hapus', type: 'danger' });
  if (!ok) return;
  const sb = getSupabase();
  const { error } = await sb.from('jadwal_kegiatan').delete().eq('id', id);
  if(error) showToast('Gagal hapus: '+error.message, 'error');
  else { showToast('Kegiatan dihapus', 'success'); loadJadwal(); }
}

// Print Jadwal Kegiatan
function printJadwal() {
  // Get currently filtered data
  const q = document.getElementById('searchJadwal').value.toLowerCase();
  const statusFilter = document.getElementById('filterStatusJadwal').value;
  let dataToPrint = allJadwal;
  if(q || statusFilter) {
    dataToPrint = allJadwal.filter(j => {
      const matchQ = !q || (j.nama_kegiatan||'').toLowerCase().includes(q) || (j.tempat||'').toLowerCase().includes(q) || (j.penanggung_jawab||'').toLowerCase().includes(q) || (j.kategori||'').toLowerCase().includes(q);
      const matchStatus = statusFilter === '' || j.status === statusFilter;
      return matchQ && matchStatus;
    });
  }

  if(dataToPrint.length === 0) {
    showToast('Tidak ada data kegiatan untuk dicetak', 'error');
    return;
  }

  // Fill print table body
  const tbody = document.getElementById('jadwalTableFullBody');
  tbody.innerHTML = dataToPrint.map((j, idx) => {
    let dateText = formatDate(j.tanggal_mulai);
    if(j.tanggal_selesai && j.tanggal_selesai !== j.tanggal_mulai) {
      dateText += ` s/d ${formatDate(j.tanggal_selesai)}`;
    }
    return `
      <tr>
        <td style="text-align:center;">${idx + 1}</td>
        <td>${j.nama_kegiatan || '-'}</td>
        <td style="text-align:center;">${j.kategori || '-'}</td>
        <td>${dateText}</td>
        <td>${j.waktu_kegiatan || '-'}</td>
        <td>${j.tempat || '-'}</td>
        <td>${j.penanggung_jawab || '-'}</td>
        <td>${j.peserta || '-'}</td>
        <td style="text-align:center;">${j.status || '-'}</td>
      </tr>
    `;
  }).join('');

  // Activate print area
  document.querySelectorAll('[id^="printArea"], #psbPrintArea').forEach(el => el.classList.remove('active-print'));
  document.getElementById('printAreaJadwal').classList.add('active-print');
  setTimeout(() => { window.print(); document.getElementById('printAreaJadwal').classList.remove('active-print'); }, 300);
}

// =============================================
// ===== PENDAFTARAN SANTRI BARU (PSB) =====
// =============================================
let allPsb = [];

async function loadPsb() {
  const sb = getSupabase();
  const { data, error } = await sb.from('pendaftaran_santri').select('*').order('created_at', { ascending: false });
  if (error) { showToast('Gagal memuat data PSB: ' + error.message, 'error'); return; }
  allPsb = data || [];
  renderPsb(allPsb);
}

function renderPsb(list) {
  const tbody = document.getElementById('psbTbody');
  const countEl = document.getElementById('countPsb');
  if (countEl) countEl.textContent = `${list.length} data`;
  if (!list.length) { tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:40px;color:#9CA3AF;">Belum ada data pendaftaran.</td></tr>'; return; }
  tbody.innerHTML = list.map((r, i) => {
    const statusColors = { 'Baru': '#3B82F6', 'Diterima': '#10B981', 'Ditolak': '#EF4444' };
    const sc = statusColors[r.status] || '#6B7280';
    const tgl = r.created_at ? new Date(r.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
    return `<tr>
      <td>${i + 1}</td>
      <td><strong>${r.nama_lengkap || '-'}</strong></td>
      <td>${r.jenis_kelamin || '-'}</td>
      <td>${r.tempat_tgl_lahir || '-'}</td>
      <td>${r.nama_ayah || '-'}</td>
      <td>${r.no_telp || '-'}</td>
      <td>${r.nama_sekolah || '-'}</td>
      <td><span style="background:${sc}15;color:${sc};padding:4px 12px;border-radius:20px;font-size:0.8rem;font-weight:600;">${r.status}</span></td>
      <td>${tgl}</td>
      <td>
        <div style="display:flex;gap:6px;align-items:center;">
          <button class="btn-action btn-detail" onclick="printPsb('${r.id}')" title="Cetak Formulir PSB">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
          </button>
          <select onchange="updatePsbStatus('${r.id}',this.value)" style="padding:5px 8px;border-radius:8px;border:1px solid #E5E7EB;font-size:0.8rem;cursor:pointer;outline:none;background:white;">
            <option value="Baru" ${r.status==='Baru'?'selected':''}>Baru</option>
            <option value="Diterima" ${r.status==='Diterima'?'selected':''}>Diterima</option>
            <option value="Ditolak" ${r.status==='Ditolak'?'selected':''}>Ditolak</option>
          </select>
          <button class="btn-action btn-delete" onclick="deletePsb('${r.id}')" title="Hapus Data PSB">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
          </button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function filterPsb() {
  const q = (document.getElementById('psbSearch')?.value || '').toLowerCase();
  const st = document.getElementById('psbFilter')?.value || '';
  let filtered = allPsb;
  if (q) filtered = filtered.filter(r => (r.nama_lengkap||'').toLowerCase().includes(q) || (r.nama_ayah||'').toLowerCase().includes(q) || (r.no_telp||'').includes(q));
  if (st) filtered = filtered.filter(r => r.status === st);
  renderPsb(filtered);
}

async function updatePsbStatus(id, status) {
  const sb = getSupabase();
  const { error } = await sb.from('pendaftaran_santri').update({ status }).eq('id', id);
  if (error) showToast('Gagal update status: ' + error.message, 'error');
  else { showToast('Status diperbarui', 'success'); loadPsb(); }
}

async function deletePsb(id) {
  const ok = await showCustomConfirm('Hapus Data Pendaftaran', 'Yakin ingin menghapus data pendaftaran santri ini?', { confirmText: 'Ya, Hapus', type: 'danger' });
  if (!ok) return;
  const sb = getSupabase();
  const { error } = await sb.from('pendaftaran_santri').delete().eq('id', id);
  if (error) showToast('Gagal hapus: ' + error.message, 'error');
  else { showToast('Data dihapus', 'success'); loadPsb(); }
}

function printPsb(id) {
  const r = allPsb.find(x => x.id === id);
  if (!r) return;
  const tgl = r.created_at ? new Date(r.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '.....................';
  const printArea = document.getElementById('psbPrintArea');
  printArea.innerHTML = `
    <div style="font-family:'Times New Roman',serif;font-size:12pt;color:#000;padding:15mm 20mm;background:#fff;">
      <div style="text-align:center;margin-bottom:20px;">
        <div style="display:flex;align-items:center;justify-content:center;gap:15px;border-bottom:3px double #000;padding-bottom:10px;">
          <img src="img/logo.png" style="width:65px;height:65px;" alt="Logo">
          <div>
            <div style="font-size:11pt;font-weight:bold;">PONDOK PESANTREN</div>
            <div style="font-size:18pt;font-weight:bold;">AL-FATHONAH Kudukeras</div>
            <div style="font-size:8pt;">Jl. H. Mastra No. 04, RT. 03 RW. 03, Desa Kudukeras, Kec. Babakan, Kab. Cirebon, Jawa Barat</div>
            <div style="font-size:8pt;">45191 | Telp/WA: 085223036221-089604194056 | Email: ponpealfathonah7@gmail.com</div>
          </div>
        </div>
      </div>
      <h3 style="text-align:center;text-decoration:underline;margin:15px 0 20px;font-size:14pt;">FORMULIR PENDAFTARAN</h3>
      <table style="width:100%;border-collapse:collapse;font-size:11pt;">
        <tr><td style="padding:5px 0;width:5%;">1.</td><td style="width:30%;">Nama Lengkap</td><td style="width:3%;">:</td><td style="border-bottom:1px dotted #000;">${r.nama_lengkap || ''}</td></tr>
        <tr><td style="padding:5px 0;">2.</td><td>Nama Panggilan</td><td>:</td><td style="border-bottom:1px dotted #000;">${r.nama_panggilan || ''}</td></tr>
        <tr><td style="padding:5px 0;">3.</td><td>Jenis Kelamin</td><td>:</td><td style="border-bottom:1px dotted #000;">${r.jenis_kelamin || ''}</td></tr>
        <tr><td style="padding:5px 0;">4.</td><td>Tempat, Tanggal Lahir</td><td>:</td><td style="border-bottom:1px dotted #000;">${r.tempat_tgl_lahir || ''}</td></tr>
        <tr><td style="padding:5px 0;">5.</td><td>Anak Ke-</td><td>:</td><td style="border-bottom:1px dotted #000;">${r.anak_ke || ''}</td></tr>
        <tr><td style="padding:5px 0;">6.</td><td>Jumlah Saudara Kandung</td><td>:</td><td style="border-bottom:1px dotted #000;">${r.jml_saudara || ''}</td></tr>
        <tr><td style="padding:5px 0;">7.</td><td colspan="3"><strong>Nama Orang Tua</strong></td></tr>
        <tr><td></td><td style="padding-left:15px;">a. Ayah</td><td>:</td><td style="border-bottom:1px dotted #000;">${r.nama_ayah || ''}</td></tr>
        <tr><td></td><td style="padding-left:15px;">b. Ibu</td><td>:</td><td style="border-bottom:1px dotted #000;">${r.nama_ibu || ''}</td></tr>
        <tr><td style="padding:5px 0;">8.</td><td colspan="3"><strong>Pekerjaan Orang Tua</strong></td></tr>
        <tr><td></td><td style="padding-left:15px;">a. Ayah</td><td>:</td><td style="border-bottom:1px dotted #000;">${r.pekerjaan_ayah || ''}</td></tr>
        <tr><td></td><td style="padding-left:15px;">b. Ibu</td><td>:</td><td style="border-bottom:1px dotted #000;">${r.pekerjaan_ibu || ''}</td></tr>
        <tr><td style="padding:5px 0;">9.</td><td colspan="3"><strong>Alamat Rumah</strong></td></tr>
        <tr><td></td><td style="padding-left:15px;">a. Jalan</td><td>:</td><td style="border-bottom:1px dotted #000;">${r.alamat_jalan || ''}</td></tr>
        <tr><td></td><td style="padding-left:15px;">b. Desa / Kelurahan</td><td>:</td><td style="border-bottom:1px dotted #000;">${r.alamat_desa || ''}</td></tr>
        <tr><td></td><td style="padding-left:15px;">c. Kecamatan</td><td>:</td><td style="border-bottom:1px dotted #000;">${r.alamat_kecamatan || ''}</td></tr>
        <tr><td></td><td style="padding-left:15px;">d. Kab. / Provinsi</td><td>:</td><td style="border-bottom:1px dotted #000;">${r.alamat_kab_provinsi || ''}</td></tr>
        <tr><td></td><td style="padding-left:15px;">e. No. Telp</td><td>:</td><td style="border-bottom:1px dotted #000;">${r.no_telp || ''}</td></tr>
        <tr><td style="padding:5px 0;">10.</td><td colspan="3"><strong>Nama Sekolah</strong></td></tr>
        <tr><td></td><td style="padding-left:15px;">a. Kelas</td><td>:</td><td style="border-bottom:1px dotted #000;">${r.kelas_sekolah || ''}</td></tr>
        <tr><td></td><td style="padding-left:15px;">b. Alamat Sekolah</td><td>:</td><td style="border-bottom:1px dotted #000;">${r.alamat_sekolah || ''}</td></tr>
        <tr><td style="padding:5px 0;">11.</td><td colspan="3"><strong>Rincian Biaya</strong></td></tr>
        <tr><td></td><td style="padding-left:15px;">a. Pendaftaran</td><td>:</td><td style="border-bottom:1px dotted #000;"></td></tr>
        <tr><td></td><td style="padding-left:15px;">b. Infaq Bulanan</td><td>:</td><td style="border-bottom:1px dotted #000;"></td></tr>
        <tr><td></td><td style="padding-left:15px;">c. Uang makan /bln</td><td>:</td><td style="border-bottom:1px dotted #000;"></td></tr>
        <tr><td></td><td style="padding-left:15px;">d. Titip uang jajan /bln</td><td>:</td><td style="border-bottom:1px dotted #000;"></td></tr>
      </table>
      <div style="margin-top:40px;display:flex;justify-content:space-between;align-items:flex-end;">
        <div style="text-align:center;">
          <p>Orang tua / Wali</p>
          <div style="height:60px;"></div>
          <p>( ................................... )</p>
        </div>
        <div style="text-align:center;">
          <div style="border:1px solid #000;width:90px;height:120px;display:flex;align-items:center;justify-content:center;font-size:10pt;">FOTO<br>3 X 4</div>
        </div>
        <div style="text-align:center;">
          <p>.................., .................... 20.....</p>
          <p>Pengasuh PP. Al-Fathonah</p>
          <div style="height:60px;"></div>
          <p style="text-decoration:underline;font-weight:bold;">KH. AMINUDDIN LATHIEF</p>
        </div>
      </div>
    </div>
  `;

  // Use the dashboard's standard active-print pattern
  // Hide all other print areas first
  document.querySelectorAll('[id^="printArea"], #psbPrintArea').forEach(el => el.classList.remove('active-print'));
  printArea.classList.add('active-print');
  
  setTimeout(() => {
    window.print();
    printArea.classList.remove('active-print');
  }, 300);
}

// Export PSB data to Excel
function exportPsbExcel() {
  try {
    if (allPsb.length === 0) {
      showToast('Tidak ada data untuk diekspor', 'error');
      return;
    }
    const ws_data = [
      ["PONDOK PESANTREN AL-FATHONAH KUDUKERAS"],
      ["Jl. H. Mastra No. 04, RT. 03 RW.03, Desa Kudukeras, Kec. Babakan, Kab. Cirebon, Jawa Barat 45191"],
      ["Telp/WA: 085323056221-089604194056 | Email: ponpesalfathonah7@gmail.com"],
      [""],
      ["DATA PENDAFTARAN SANTRI BARU"],
      [""],
      ["NO", "NAMA LENGKAP", "JENIS KELAMIN", "TEMPAT/TGL LAHIR", "NAMA AYAH", "NAMA IBU", "NO. TELP", "ASAL SEKOLAH", "STATUS", "TGL DAFTAR"]
    ];

    allPsb.forEach((r, i) => {
      const tgl = r.created_at ? new Date(r.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-';
      ws_data.push([
        i + 1,
        r.nama_lengkap || '-',
        r.jenis_kelamin || '-',
        r.tempat_tgl_lahir || '-',
        r.nama_ayah || '-',
        r.nama_ibu || '-',
        r.no_telp || '-',
        r.nama_sekolah || '-',
        r.status || '-',
        tgl
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    ws['!merges'] = [
      { s:{r:0,c:0}, e:{r:0,c:9} },
      { s:{r:1,c:0}, e:{r:1,c:9} },
      { s:{r:2,c:0}, e:{r:2,c:9} },
      { s:{r:4,c:0}, e:{r:4,c:9} }
    ];
    ws['!cols'] = [
      {wch:5}, {wch:25}, {wch:14}, {wch:22}, {wch:20}, {wch:20}, {wch:16}, {wch:22}, {wch:12}, {wch:18}
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pendaftaran');
    XLSX.writeFile(wb, 'Data_Pendaftaran_Santri_Baru.xlsx');
  } catch(err) {
    console.error(err);
    showToast('Gagal export Excel', 'error');
  }
}

// ==========================================
// PENGELOLAAN AKUN LOGIC
// ==========================================
let allAkun = [];

async function loadAkun() {
  // Hanya admin yang bisa buka halaman kelola akun
  if (currentUserRole !== 'admin') {
    await showCustomAlert('Akses Ditolak', 'Hanya admin yang dapat mengelola akun.', { type: 'danger' });
    showSection('dashboard');
    return;
  }

  const sb = getSupabase();
  if (!sb) return;
  const { data, error } = await sb.from('pengelolaan_akun').select('*').order('created_at', { ascending: false });
  if (error) { showToast('Gagal load data akun: ' + error.message, 'error'); return; }
  allAkun = data || [];
  renderAkunTable(allAkun);
}

function getStatusAkunBadge(status) {
  if(status === 'Aktif') return `<span style="background:#D1FAE5; color:#065F46; padding:4px 8px; border-radius:4px; font-size:0.75rem; font-weight:600;">Aktif</span>`;
  if(status === 'Menunggu') return `<span style="background:#FEF3C7; color:#92400E; padding:4px 8px; border-radius:4px; font-size:0.75rem; font-weight:600;">Menunggu</span>`;
  return `<span style="background:#FEE2E2; color:#B91C1C; padding:4px 8px; border-radius:4px; font-size:0.75rem; font-weight:600;">Nonaktif</span>`;
}

function getRoleAkunBadge(role) {
  const r = (role || '').toLowerCase();
  if (r === 'admin') {
    return `<span style="background:#EEF2FF; color:#4338CA; border:1px solid #C7D2FE; padding:3px 10px; border-radius:6px; font-size:0.78rem; font-weight:600; display:inline-flex; align-items:center; gap:5px;"><span style="width:6px;height:6px;border-radius:50%;background:#4338CA;"></span>Admin</span>`;
  }
  if (r === 'bendahara') {
    return `<span style="background:#ECFDF5; color:#065F46; border:1px solid #A7F3D0; padding:3px 10px; border-radius:6px; font-size:0.78rem; font-weight:600; display:inline-flex; align-items:center; gap:5px;"><span style="width:6px;height:6px;border-radius:50%;background:#059669;"></span>Bendahara</span>`;
  }
  if (r === 'pengawas') {
    return `<span style="background:#FFFBEB; color:#92400E; border:1px solid #FDE68A; padding:3px 10px; border-radius:6px; font-size:0.78rem; font-weight:600; display:inline-flex; align-items:center; gap:5px;"><span style="width:6px;height:6px;border-radius:50%;background:#D97706;"></span>Pengawas</span>`;
  }
  return `<span style="background:#EFF6FF; color:#1D4ED8; border:1px solid #BFDBFE; padding:3px 10px; border-radius:6px; font-size:0.78rem; font-weight:600; display:inline-flex; align-items:center; gap:5px;"><span style="width:6px;height:6px;border-radius:50%;background:#2563EB;"></span>Pengajar</span>`;
}

function renderAkunTable(list) {
  const tbody = document.getElementById('akunTbody');
  if(!list.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:#9CA3AF;">Belum ada data akun terdaftar.</td></tr>';
    return;
  }

  tbody.innerHTML = list.map((a, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td><strong>${a.nama || 'Tanpa Nama'}</strong></td>
      <td>${a.email}</td>
      <td>${getRoleAkunBadge(a.role)}</td>
      <td>${getStatusAkunBadge(a.status)}</td>
      <td>${formatDate(a.created_at)}</td>
      <td>
        <div class="action-btns">
          <button class="btn-action btn-edit" onclick="openAkunModal('${a.id}')" title="Edit Role/Status"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
          <button class="btn-action btn-delete" onclick="deleteAkun('${a.id}')" title="Hapus Akun Permanen"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function filterAkun() {
  const q = document.getElementById('akunSearch').value.toLowerCase();
  const role = document.getElementById('akunRoleFilter').value;
  const filtered = allAkun.filter(a => {
    const matchQ = (a.nama||'').toLowerCase().includes(q) || (a.email||'').toLowerCase().includes(q);
    const matchRole = !role || a.role === role;
    return matchQ && matchRole;
  });
  renderAkunTable(filtered);
}

function openAkunModal(id) {
  const akun = allAkun.find(a => a.id === id);
  if (!akun) return;
  document.getElementById('akun_id').value = akun.id;
  document.getElementById('akun_nama').value = akun.nama || '';
  document.getElementById('akun_email').value = akun.email;
  document.getElementById('akun_role').value = akun.role;
  document.getElementById('akun_status').value = akun.status;
  document.getElementById('akunModalOverlay').classList.add('active');
}

function closeAkunModal() {
  document.getElementById('akunModalOverlay').classList.remove('active');
}

async function saveAkun(e) {
  e.preventDefault();
  const sb = getSupabase();
  const btn = document.getElementById('btnSimpanAkun');
  btn.disabled = true; btn.textContent = 'Menyimpan...';

  const id = document.getElementById('akun_id').value;
  const updates = {
    role: document.getElementById('akun_role').value,
    status: document.getElementById('akun_status').value,
    updated_at: new Date().toISOString()
  };

  const { error } = await sb.from('pengelolaan_akun').update(updates).eq('id', id);

  btn.disabled = false; btn.textContent = 'Simpan Perubahan';

  if(error) { showToast('Gagal update akun: '+error.message, 'error'); }
  else {
    showToast('Hak akses/status berhasil diubah', 'success');
    closeAkunModal();
    loadAkun();
  }
}

async function deleteAkun(id) {
  const ok = await showCustomConfirm('Hapus Akun Permanen', 'YAKIN INGIN MENGHAPUS AKUN INI PERMANEN? Jika dihapus, pengguna dapat menggunakan email yang sama untuk mendaftar kembali.', { confirmText: 'Ya, Hapus Permanen', type: 'danger' });
  if (!ok) return;
  
  const sb = getSupabase();
  // Memanggil RPC Function untuk delete user dari Supabase Auth
  const { error } = await sb.rpc('delete_auth_user', { user_id: id });
  
  if(error) {
    showToast('Gagal hapus akun: ' + error.message, 'error');
  } else {
    showToast('Akun berhasil dihapus permanen', 'success');
    loadAkun();
  }
}

// ====================================================
// ============= DATA BERITA & KEGIATAN WEB =============
// ====================================================

async function loadBerita() {
  const sb = getSupabase();
  if (!sb) return;

  const { data, error } = await sb.from('berita')
    .select('*')
    .order('tanggal', { ascending: false });

  if (error) {
    showToast('Gagal memuat data berita', 'error');
    console.error(error);
    return;
  }

  allBerita = data || [];
  renderBeritaTable(allBerita);
}

function renderBeritaTable(data) {
  const tbody = document.getElementById('beritaTbody');

  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:#9CA3AF;">Belum ada berita/kegiatan web. Klik "Tambah Berita".</td></tr>';
    return;
  }

  tbody.innerHTML = data.map((d, i) => {
    let visualHtml = '';
    if (d.image_url) {
      visualHtml = `<div style="width: 40px; height: 40px; border-radius: 6px; overflow: hidden;"><img src="${d.image_url}" style="width: 100%; height: 100%; object-fit: cover;"></div>`;
    } else {
      visualHtml = `<div style="width: 40px; height: 40px; border-radius: 6px; background: ${d.bg_gradient || '#E5E7EB'}; display: flex; align-items: center; justify-content: center; color: white;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path><path d="M18 14h-8"></path><path d="M15 18h-5"></path><path d="M10 6h8v4h-8V6Z"></path></svg></div>`;
    }

    return `
      <tr>
        <td>${i+1}</td>
        <td>${visualHtml}</td>
        <td>${formatDate(d.tanggal)}</td>
        <td><strong style="color: var(--gray-800);">${d.judul}</strong></td>
        <td><span class="badge" style="background:#E0E7FF; color:#4338CA;">${d.kategori}</span></td>
        <td>
          <div class="action-btns">
            <button class="btn-action btn-edit" onclick="editBerita('${d.id}')" title="Edit Data"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
            <button class="btn-action btn-delete" onclick="deleteBerita('${d.id}', '${d.judul.replace(/'/g, "\\'")}')" title="Hapus"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function filterBerita() {
  const q = document.getElementById('beritaSearch').value.toLowerCase();
  const cat = document.getElementById('beritaKategoriFilter').value;

  const filtered = allBerita.filter(d => {
    const matchQ = d.judul.toLowerCase().includes(q) || (d.deskripsi && d.deskripsi.toLowerCase().includes(q));
    const matchC = cat === '' || d.kategori === cat;
    return matchQ && matchC;
  });
  renderBeritaTable(filtered);
}

async function openBeritaModal(id = null) {
  document.getElementById('beritaModalOverlay').classList.add('active');
  const sb = getSupabase();
  if (!sb) return;

  // Reset form
  document.getElementById('beritaForm').reset();
  document.getElementById('berita_id').value = '';
  document.getElementById('preview_berita_foto').style.display = 'none';
  document.getElementById('berita_image_url_hidden').value = '';

  if (id) {
    document.getElementById('beritaModalTitle').textContent = 'Edit Berita';
    const { data, error } = await sb.from('berita').select('*').eq('id', id).single();
    if (!error && data) {
      const b = data;
      document.getElementById('berita_id').value = b.id;
      document.getElementById('berita_judul').value = b.judul;
      document.getElementById('berita_kategori').value = b.kategori;
      document.getElementById('berita_tanggal').value = b.tanggal;
      document.getElementById('berita_deskripsi').value = b.deskripsi || '';
      document.getElementById('berita_image_url_hidden').value = b.image_url || '';
      if(b.image_url) {
        document.getElementById('preview_berita_foto').src = b.image_url;
        document.getElementById('preview_berita_foto').style.display = 'block';
      }
      document.getElementById('berita_bg_gradient').value = b.bg_gradient || 'linear-gradient(135deg, #064E3B, #10B981)';
    }
  } else {
    document.getElementById('beritaModalTitle').textContent = 'Tambah Berita';
    document.getElementById('berita_tanggal').value = new Date().toISOString().split('T')[0];
    document.getElementById('berita_kategori').value = 'Kegiatan';
    document.getElementById('berita_bg_gradient').value = 'linear-gradient(135deg, #064E3B, #10B981)';
  }
}

function closeBeritaModal() {
  document.getElementById('beritaModalOverlay').classList.remove('active');
}

function editBerita(id) {
  openBeritaModal(id);
}

async function saveBerita(e) {
  e.preventDefault();
  const sb = getSupabase();
  if (!sb) return;

  const btn = document.getElementById('btnSimpanBerita');
  btn.disabled = true;
  btn.innerText = 'Menyimpan...';

  const id = document.getElementById('berita_id').value;
  
  let fotoUrl = document.getElementById('berita_image_url_hidden').value;
  const inputFile = document.getElementById('berita_image_file');
  
  try {
    if (inputFile.files.length > 0) {
      fotoUrl = await uploadToSupabase(inputFile, 'Berita');
    }
  } catch(e) {
    btn.disabled = false;
    btn.innerText = 'Simpan Berita';
    return;
  }

  const payload = {
    judul: document.getElementById('berita_judul').value.trim(),
    kategori: document.getElementById('berita_kategori').value,
    tanggal: document.getElementById('berita_tanggal').value,
    deskripsi: document.getElementById('berita_deskripsi').value.trim() || null,
    image_url: fotoUrl || null,
    bg_gradient: document.getElementById('berita_bg_gradient').value.trim() || 'linear-gradient(135deg, #064E3B, #10B981)'
  };

  try {
    if (id) {
      const { error } = await sb.from('berita').update(payload).eq('id', id);
      if (error) throw error;
      showToast('Berhasil mengubah berita', 'success');
    } else {
      const { error } = await sb.from('berita').insert([payload]);
      if (error) throw error;
      showToast('Berhasil menambahkan berita', 'success');
    }
    closeBeritaModal();
    loadBerita();
  } catch (err) {
    showToast('Terjadi kesalahan: ' + err.message, 'error');
  }

  btn.disabled = false;
  btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg> Simpan Berita`;
}

async function deleteBerita(id, judul) {
  const ok = await showCustomConfirm('Hapus Berita', `Yakin ingin menghapus berita "${judul}"?`, { confirmText: 'Ya, Hapus', type: 'danger' });
  if (!ok) return;

  const sb = getSupabase();
  if (!sb) return;

  try {
    // Ambil data dulu untuk mendapatkan foto (jika ada)
    const { data: record } = await sb.from('berita').select('foto').eq('id', id).single();
    if(record && record.foto) {
      await deleteFromSupabase(record.foto);
    }
    
    const { error } = await sb.from('berita').delete().eq('id', id);
    if (error) {
      showToast('Gagal menghapus berita: ' + error.message, 'error');
    } else {
      showToast('Berhasil menghapus berita', 'success');
      loadBerita();
    }
  } catch (err) {
    showToast('Gagal menghapus berita: ' + err.message, 'error');
  }
}

// ===== FITUR PROFIL SAYA & GANTI PASSWORD =====

async function openMyProfileModal() {
  const sb = getSupabase();
  if(!sb) return;

  const { data: { user } } = await sb.auth.getUser();
  if (!user) return;

  document.getElementById('myProfileModalOverlay').classList.add('active');
  document.getElementById('myProfileForm').reset();
  document.getElementById('my_profile_foto_url').value = '';
  document.getElementById('preview_my_profile_foto').style.display = 'none';
  document.getElementById('preview_my_profile_initial').style.display = 'block';
  document.getElementById('preview_my_profile_initial').textContent = user.email.charAt(0).toUpperCase();

  document.getElementById('my_profile_password').value = '';
  document.getElementById('my_profile_password_confirm').value = '';
  
  const btnToggle = document.getElementById('btnTogglePassword');
  const passContainer = document.getElementById('passwordFieldsContainer');
  if (btnToggle && passContainer) {
    btnToggle.style.display = 'block';
    passContainer.style.display = 'none';
  }

  // Load data from data_pengurus based on email
  try {
    const { data, error } = await sb.from('data_pengurus').select('*').eq('email', user.email).single();
    
    if (data) {
      document.getElementById('my_profile_id').value = data.id || '';
      document.getElementById('my_profile_nama').value = data.nama || '';
      document.getElementById('my_profile_nik').value = data.nik || '';
      document.getElementById('my_profile_jenis_kelamin').value = data.jenis_kelamin || '';
      document.getElementById('my_profile_status').value = data.status_aktif || 'Aktif';
      document.getElementById('my_profile_tempat_lahir').value = data.tempat_lahir || '';
      
      // format date to YYYY-MM-DD
      if (data.tanggal_lahir) {
        document.getElementById('my_profile_tanggal_lahir').value = data.tanggal_lahir.split('T')[0];
      }
      
      document.getElementById('my_profile_jabatan').value = data.jabatan || '';
      document.getElementById('my_profile_tupoksi').value = data.tupoksi || '';
      document.getElementById('my_profile_alamat').value = data.alamat || '';
      
      if (data.foto_url) {
        document.getElementById('my_profile_foto_url').value = data.foto_url;
        document.getElementById('preview_my_profile_foto').src = data.foto_url;
        document.getElementById('preview_my_profile_foto').style.display = 'block';
        document.getElementById('preview_my_profile_initial').style.display = 'none';
      }
    }
  } catch(err) {
    console.log('User belum ada di data_pengurus, form kosong.');
  }
}

function closeMyProfileModal() {
  document.getElementById('myProfileModalOverlay').classList.remove('active');
}

// Preview foto profil
document.getElementById('my_profile_foto')?.addEventListener('change', function(e) {
  const file = e.target.files[0];
  if(file) {
    const url = URL.createObjectURL(file);
    document.getElementById('preview_my_profile_foto').src = url;
    document.getElementById('preview_my_profile_foto').style.display = 'block';
    document.getElementById('preview_my_profile_initial').style.display = 'none';
  }
});

// Upload foto profil
async function uploadMyProfileFoto(file) {
  const sb = getSupabase();
  const ext = file.name.split('.').pop();
  const fileName = `profile_${Date.now()}.${ext}`;
  
  // kita asumsikan bucket 'berkas-santri' sudah ada
  const { data, error } = await sb.storage.from('berkas-santri').upload(fileName, file);
  if (error) throw error;
  
  const { data: publicData } = sb.storage.from('berkas-santri').getPublicUrl(fileName);
  return publicData.publicUrl;
}

document.getElementById('myProfileForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const sb = getSupabase();
  if(!sb) return;

  const btn = document.getElementById('btnSimpanMyProfile');
  const oldText = btn.innerHTML;
  btn.textContent = 'Menyimpan...'; 
  btn.disabled = true;

  try {
    const { data: { user } } = await sb.auth.getUser();
    if (!user) throw new Error('Sesi tidak valid. Silakan login ulang.');

    // 1. Cek & Update Password jika diisi
    const pass = document.getElementById('my_profile_password').value;
    const confirmPass = document.getElementById('my_profile_password_confirm').value;
    if (pass || confirmPass) {
      if (pass !== confirmPass) {
        throw new Error('Password baru dan konfirmasi tidak cocok!');
      }
      if (pass.length < 6) {
        throw new Error('Password harus minimal 6 karakter!');
      }
      const { error: passErr } = await sb.auth.updateUser({ password: pass });
      if (passErr) throw new Error('Gagal mengganti password: ' + passErr.message);
    }

    // 2. Upload Foto jika ada file baru
    const fileInput = document.getElementById('my_profile_foto');
    let finalFotoUrl = document.getElementById('my_profile_foto_url').value;
    if (fileInput.files.length > 0) {
      finalFotoUrl = await uploadMyProfileFoto(fileInput.files[0]);
    }

    // 3. Upsert data ke data_pengurus
    const payload = {
      nama: document.getElementById('my_profile_nama').value.trim(),
      nik: document.getElementById('my_profile_nik').value.trim(),
      jenis_kelamin: document.getElementById('my_profile_jenis_kelamin').value,
      tempat_lahir: document.getElementById('my_profile_tempat_lahir').value.trim(),
      tanggal_lahir: document.getElementById('my_profile_tanggal_lahir').value,
      jabatan: document.getElementById('my_profile_jabatan').value.trim(),
      tupoksi: document.getElementById('my_profile_tupoksi').value.trim(),
      alamat: document.getElementById('my_profile_alamat').value.trim(),
      status_aktif: document.getElementById('my_profile_status').value,
      email: user.email,
      foto_url: finalFotoUrl,
      updated_at: new Date().toISOString()
    };

    const id = document.getElementById('my_profile_id').value;
    if (id) {
      // Update
      const { error } = await sb.from('data_pengurus').update(payload).eq('id', id);
      if (error) throw error;
    } else {
      // Insert
      const { error } = await sb.from('data_pengurus').insert([payload]);
      if (error) throw error;
    }

    showToast('Profil dan pengaturan berhasil disimpan!', 'success');
    closeMyProfileModal();
    
    // Refresh table pengurus jika ada di layar
    if (typeof loadData === 'function') {
      loadData('web_pengurus', renderPengurusTable);
    }
    
    // Update sidebar name if changed
    const nameEl = document.getElementById('sidebarUserName');
    if (nameEl) nameEl.textContent = payload.nama;

  } catch(err) {
    showToast(err.message, 'error');
  } finally {
    btn.innerHTML = oldText;
    btn.disabled = false;
  }
});


