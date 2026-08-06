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
let chartKeuanganInst = null;
let chartInventarisInst = null;

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
  } else if (sectionId === 'bayar') {
    if (allSantri.length === 0) loadSantri(); // pre-load santri for dropdown
    loadBayar();
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
  showSection('dashboard'); // Loads dashboard by default
}

// ===== AUTH CHECK =====
let currentUserRole = ''; // Global role so we can control UI elements
let currentUserName = ''; // Global name

async function checkAuth() {
  const sb = getSupabase();
  try {
    const { data: { session } } = await sb.auth.getSession();
    if (!session) { window.location.href = 'index.html'; return; }
    
    // Check user status in pengelolaan_akun
    const { data: profile, error } = await sb.from('pengelolaan_akun').select('role, status, nama, email').eq('id', session.user.id).single();
    if (error && error.code !== 'PGRST116') throw error; // Ignore if no rows just yet (might be fresh trigger run)
    
    if (profile) {
      if (profile.status === 'Nonaktif') {
        await showCustomAlert('Akun Dinonaktifkan', 'Akun Anda saat ini dinonaktifkan. Silakan hubungi Administrator.', { type: 'danger' });
        await sb.auth.signOut();
        window.location.href = 'index.html';
        return;
      }
      if (profile.status === 'Menunggu') {
        await showCustomAlert('Menunggu Persetujuan', 'Pendaftaran akun Anda sedang menunggu persetujuan Administrator.', { type: 'warning' });
        await sb.auth.signOut();
        window.location.href = 'index.html';
        return;
      }
      currentUserRole = profile.role || 'pengajar'; // Save role globally
      currentUserName = profile.nama || profile.email || 'User';
      
      // Update sidebar user profile
      updateUserDisplay(currentUserName, currentUserRole);
    }
  } catch (err) {
    console.error('Session error:', err);
    window.location.href = 'index.html';
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
        sb.from('web_pengurus').select('foto_url').eq('email', user.email).single()
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

// ===== DASHBOARD STATISTIK =====
async function loadDashboard() {
  const sb = getSupabase();
  if(!sb) return;

  try {
    // Stat Santri
    const { count: countSantri, error: errS } = await sb.from('data_induk_santri').select('*', { count: 'exact', head: true });
    document.getElementById('statSantri').textContent = countSantri || 0;

    // Stat Pengurus
    const { count: countPengurus, error: errP } = await sb.from('data_pengurus').select('*', { count: 'exact', head: true }).eq('status_aktif', 'Aktif');
    document.getElementById('statPengurus').textContent = countPengurus || 0;

    // Stat Inventaris (Total Kondisi Baik)
    const { count: countInv, error: errI } = await sb.from('barang_inventaris').select('*', { count: 'exact', head: true }).eq('kondisi', 'Baik');
    document.getElementById('statInventaris').textContent = countInv || 0;

    // Stat Keuangan (Pembayaran Bulan Ini)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    const { data: bayarBulanIni } = await sb.from('pembayaran_bulanan').select('nominal').gte('tgl_bayar', startOfMonth.toISOString().split('T')[0]);
    let totalMasuk = 0;
    if(bayarBulanIni) {
      bayarBulanIni.forEach(p => totalMasuk += p.nominal);
    }
    document.getElementById('statBayar').textContent = 'Rp' + totalMasuk.toLocaleString('id-ID');

    // Hitung pengeluaran untuk chart jika diperlukan (optional)
    const ctxK = document.getElementById('chartKeuangan').getContext('2d');
    if(chartKeuanganInst) chartKeuanganInst.destroy();
    
    // Untuk chart keuangan, ambil total pemasukan vs total pengeluaran
    const { data: lapAll } = await sb.from('laporan_operasional').select('pemasukan, pengeluaran');
    let cIn = 0, cOut = 0;
    if(lapAll) {
      lapAll.forEach(l => {
        (l.pemasukan||[]).forEach(x => cIn += Number(x.jumlah));
        (l.pengeluaran||[]).forEach(x => cOut += Number(x.jumlah));
      });
    }

    chartKeuanganInst = new Chart(ctxK, {
      type: 'doughnut',
      data: {
        labels: ['Pemasukan', 'Pengeluaran'],
        datasets: [{
          data: [cIn, cOut],
          backgroundColor: ['#10B981', '#EF4444'],
          borderWidth: 0
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });

    // Draw Chart Inventaris
    const { data: invData } = await sb.from('barang_inventaris').select('kondisi');
    let baik = 0, rr = 0, rb = 0;
    if(invData) {
      invData.forEach(d => {
        if(d.kondisi === 'Baik') baik++;
        else if(d.kondisi === 'Rusak Ringan') rr++;
        else if(d.kondisi === 'Rusak Berat') rb++;
      });
    }
    const ctxI = document.getElementById('chartInventaris').getContext('2d');
    if(chartInventarisInst) chartInventarisInst.destroy();
    chartInventarisInst = new Chart(ctxI, {
      type: 'bar',
      data: {
        labels: ['Baik', 'Rusak Ringan', 'Rusak Berat'],
        datasets: [{
          label: 'Jumlah Barang',
          data: [baik, rr, rb],
          backgroundColor: ['#34D399', '#FBBF24', '#F87171'],
          borderRadius: 4
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });
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
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  setTimeout(() => toast.className = 'toast', 3000);
}

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

function printSantri() {
  setPrintPageSize('landscape');
  document.getElementById('printArea').classList.add('active-print');
  document.getElementById('printAreaLaporan').classList.remove('active-print');
  window.print();
  document.getElementById('printArea').classList.remove('active-print');
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
    <div style="display:flex; gap:8px; align-items:center;">
      <input type="text" placeholder="Sumber Dana" value="${p.sumber}" onchange="updatePemasukan(${i}, 'sumber', this.value)" style="flex:2; padding:8px; border:1px solid #ccc; border-radius:4px; font-size:0.8rem;">
      <input type="number" placeholder="Rp" value="${p.jumlah}" onchange="updatePemasukan(${i}, 'jumlah', this.value)" style="flex:1; padding:8px; border:1px solid #ccc; border-radius:4px; font-size:0.8rem;">
      <button type="button" onclick="removePemasukan(${i})" style="background:none; border:none; color:#ef4444; cursor:pointer; font-weight:bold" title="Hapus">✕</button>
    </div>
  `).join('');
  
  eCon.innerHTML = currentPengeluaran.map((p, i) => `
    <div style="display:flex; gap:8px; align-items:center;">
      <input type="text" placeholder="Jenis / Keterangan" value="${p.jenis}" onchange="updatePengeluaran(${i}, 'jenis', this.value)" style="flex:2; padding:8px; border:1px solid #ccc; border-radius:4px; font-size:0.8rem;">
      <input type="number" placeholder="Rp" value="${p.jumlah}" onchange="updatePengeluaran(${i}, 'jumlah', this.value)" style="flex:1; padding:8px; border:1px solid #ccc; border-radius:4px; font-size:0.8rem;">
      <button type="button" onclick="removePengeluaran(${i})" style="background:none; border:none; color:#ef4444; cursor:pointer; font-weight:bold" title="Hapus">✕</button>
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
  window.print();
  document.getElementById('printAreaLaporan').classList.remove('active-print');
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
    ws_data.push(["Pengawas Yayasan Al Fathonah", "", "", "", "", "Bendahara"]);
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

async function loadBayar() {
  const sb = getSupabase();
  if(!sb) return;
  const { data, error } = await sb.from('pembayaran_bulanan')
    .select('*, santri:santri_id(*)')
    .order('tgl_bayar', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    showToast('Gagal memuat data pembayaran', 'error');
    console.error(error);
    return;
  }
  allBayar = data || [];
  filterBayar(); // renders the table
}

function renderBayarTable(data) {
  const tbody = document.getElementById('bayarTableBody');
  const fullTbody = document.getElementById('bayarTableFullBody');
  document.getElementById('countBayar').textContent = `${data.length} data`;

  if(data.length === 0) {
    const emptyMsg = `<tr><td colspan="8" style="text-align:center;padding:40px;color:#9CA3AF;">Belum ada riwayat pembayaran.</td></tr>`;
    tbody.innerHTML = emptyMsg;
    if(fullTbody) fullTbody.innerHTML = '';
    return;
  }

  // Print Summary
  let totalNominal = 0;

  tbody.innerHTML = data.map((d, i) => {
    totalNominal += (d.nominal || 0);
    const nama = d.santri ? d.santri.nama : 'Santri Terhapus';
    const nis = d.santri ? d.santri.nis : '-';
    
    return `
      <tr>
        <td>${i+1}</td>
        <td>${formatDate(d.tgl_bayar)}</td>
        <td><strong>${nis}</strong><br><span style="font-size:0.75rem;color:var(--gray-500);">${nama}</span></td>
        <td>${d.jenis_pembayaran || '-'}</td>
        <td>${d.bulan} ${d.tahun}</td>
        <td style="font-weight:600;color:var(--green-700)">${formatRupiah(d.nominal || 0)}</td>
        <td>${d.metode_bayar}</td>
        <td>
          <div class="action-btns">
            <button class="btn-action btn-detail" onclick="printKwitansi('${d.id}')" title="Cetak Kwitansi"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg></button>
            <button class="btn-action btn-edit" onclick="editBayar('${d.id}')" title="Edit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
            <button class="btn-action btn-delete" onclick="deleteBayar('${d.id}')" title="Hapus"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  if(fullTbody) {
    fullTbody.innerHTML = data.map((d, i) => {
      const nama = d.santri ? d.santri.nama : '-';
      const nis = d.santri ? d.santri.nis : '-';
      return `
        <tr>
          <td style="text-align:center;">${i+1}</td>
          <td>${formatDate(d.tgl_bayar)}</td>
          <td>${nama}</td>
          <td>${nis}</td>
          <td>${d.jenis_pembayaran || '-'}</td>
          <td>${d.bulan} ${d.tahun}</td>
          <td>${d.metode_bayar}</td>
          <td style="text-align:right;">${formatRupiah(d.nominal || 0)}</td>
        </tr>
      `;
    }).join('');
    
    document.getElementById('printBayarTotalLaporan').textContent = formatRupiah(totalNominal);
  }
}

function filterBayar() {
  const q = document.getElementById('searchBayar').value.toLowerCase();
  const bln = document.getElementById('filterBulanBayar').value;
  
  let filtered = allBayar.filter(d => {
    const nama = (d.santri?.nama || '').toLowerCase();
    const nis = (d.santri?.nis || '').toLowerCase();
    const jenis = (d.jenis_pembayaran || '').toLowerCase();
    const matchQ = nama.includes(q) || nis.includes(q) || jenis.includes(q);
    const matchB = bln ? d.bulan === bln : true;
    return matchQ && matchB;
  });
  renderBayarTable(filtered);
}

// Modal bayar
function openBayarModal() {
  document.getElementById('bayarModalOverlay').classList.add('active');
  document.getElementById('bayarForm').reset();
  document.getElementById('bayarId').value = '';
  document.getElementById('bayarModalTitle').textContent = 'Catat Pembayaran Santri';
  
  // Set default tgl
  document.getElementById('bayar_tgl').value = new Date().toISOString().split('T')[0];
  document.getElementById('bayar_tahun').value = new Date().getFullYear();
  
  const m = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  document.getElementById('bayar_bulan').value = m[new Date().getMonth()];
  
  // Populate santri options
  const sel = document.getElementById('bayar_santri_id');
  sel.innerHTML = '<option value="">-- Pilih Santri --</option>' + allSantri.map(s => `<option value="${s.id}">${s.nis} - ${s.nama}</option>`).join('');
}

function closeBayarModal() {
  document.getElementById('bayarModalOverlay').classList.remove('active');
}

// Submit Pembayaran
document.getElementById('bayarForm')?.addEventListener('submit', async(e) => {
  e.preventDefault();
  const sb = getSupabase();
  if(!sb) return;

  const btn = document.getElementById('btnSimpanBayar');
  const oldText = btn.textContent;
  btn.textContent = 'Menyimpan...'; btn.disabled = true;

  try {
    const id = document.getElementById('bayarId').value;
    const payload = {
      santri_id: document.getElementById('bayar_santri_id').value,
      jenis_pembayaran: document.getElementById('bayar_jenis').value.trim(),
      bulan: document.getElementById('bayar_bulan').value,
      tahun: parseInt(document.getElementById('bayar_tahun').value),
      nominal: parseInt(document.getElementById('bayar_nominal').value),
      tgl_bayar: document.getElementById('bayar_tgl').value,
      metode_bayar: document.getElementById('bayar_metode').value,
      keterangan: document.getElementById('bayar_keterangan').value.trim()
    };

    if (id) {
      payload.updated_at = new Date().toISOString();
      const {error} = await sb.from('pembayaran_bulanan').update(payload).eq('id', id);
      if(error) throw error;
      showToast('Transaksi pembayaran diperbarui');
    } else {
      const {error} = await sb.from('pembayaran_bulanan').insert(payload);
      if(error) throw error;
      showToast('Pembayaran berhasil dicatat');
    }
    
    closeBayarModal();
    loadBayar();
  } catch(err) {
    console.error(err);
    showToast('Gagal memproses transaksi', 'error');
  } finally {
    btn.textContent = oldText; btn.disabled = false;
  }
});

function editBayar(id) {
  const d = allBayar.find(x => x.id === id);
  if(!d) return;
  openBayarModal();
  document.getElementById('bayarId').value = d.id;
  document.getElementById('bayar_santri_id').value = d.santri_id;
  document.getElementById('bayar_jenis').value = d.jenis_pembayaran;
  document.getElementById('bayar_bulan').value = d.bulan;
  document.getElementById('bayar_tahun').value = d.tahun;
  document.getElementById('bayar_nominal').value = d.nominal;
  document.getElementById('bayar_tgl').value = d.tgl_bayar;
  document.getElementById('bayar_metode').value = d.metode_bayar;
  document.getElementById('bayar_keterangan').value = d.keterangan || '';
  document.getElementById('bayarModalTitle').textContent = 'Edit Transaksi Pembayaran';
}

async function deleteBayar(id) {
  const ok = await showCustomConfirm('Hapus Transaksi', 'Yakin ingin membatalkan/menghapus transaksi pembayaran ini?', { confirmText: 'Ya, Hapus', type: 'danger' });
  if (!ok) return;
  const sb = getSupabase();
  const {error} = await sb.from('pembayaran_bulanan').delete().eq('id', id);
  if(!error) {
     showToast('Transaksi dihapus');
     loadBayar();
  }
}

// Helper Print Page Size (Dinamis Portrait/Landscape)
function setPrintPageSize(size) {
  let styleEl = document.getElementById('dynamicPrintStyle');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'dynamicPrintStyle';
    document.head.appendChild(styleEl);
  }
  styleEl.innerHTML = `@page { size: ${size}; margin: 10mm; }`;
}

// Print Laporan Bayar
function printBayarLaporan() {
  setPrintPageSize('landscape');
  document.getElementById('printAreaBayarLaporan').classList.add('active-print');
  document.getElementById('printArea').classList.remove('active-print');
  document.getElementById('printAreaLaporan').classList.remove('active-print');
  document.getElementById('printAreaPengurus').classList.remove('active-print');
  document.getElementById('printAreaInventaris').classList.remove('active-print');
  window.print();
  document.getElementById('printAreaBayarLaporan').classList.remove('active-print');
}

// Export Bayar Excel
function exportBayarExcel() {
  try {
    const q = document.getElementById('searchBayar').value.toLowerCase();
    const bln = document.getElementById('filterBulanBayar').value;
    
    let filtered = allBayar.filter(d => {
      const nama = (d.santri?.nama || '').toLowerCase();
      const nis = (d.santri?.nis || '').toLowerCase();
      const jenis = (d.jenis_pembayaran || '').toLowerCase();
      const matchQ = nama.includes(q) || nis.includes(q) || jenis.includes(q);
      const matchB = bln ? d.bulan === bln : true;
      return matchQ && matchB;
    });

    if (filtered.length === 0) {
      showToast('Tidak ada data untuk diekspor', 'error'); return;
    }
    const ws_data = [
      ["PONDOK PESANTREN AL-FATHONAH KUDUKERAS"],
      ["Jl. H. Mastra No. 04, RT. 03 RW.03, Desa Kudukeras, Kec. Babakan, Kab. Cirebon, Jawa Barat 45191"],
      ["Telp/WA: 085323056221-089604194056 | Email: ponpesalfathonah7@gmail.com"],
      [""],
      ["REKAPITULASI PEMBAYARAN IURAN SANTRI " + (bln ? `BULAN ${bln.toUpperCase()}` : "SELURUH BULAN")],
      [""],
      ["NO", "TGL BAYAR", "NAMA SANTRI", "NIS", "JENIS TRANSAKSI", "PERIODE", "METODE", "NOMINAL"]
    ];

    let t = 0;
    filtered.forEach((s, i) => {
      t += (s.nominal||0);
      ws_data.push([
        i+1,
        formatDate(s.tgl_bayar),
        s.santri ? s.santri.nama : '-',
        s.santri ? s.santri.nis : '-',
        s.jenis_pembayaran || '-',
        `${s.bulan} ${s.tahun}`,
        s.metode_bayar || '-',
        s.nominal || 0
      ]);
    });
    
    ws_data.push(["TOTAL PENERIMAAN", "", "", "", "", "", "", t]);

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    ws['!merges'] = [
      { s:{r:0,c:0}, e:{r:0,c:7} },
      { s:{r:1,c:0}, e:{r:1,c:7} },
      { s:{r:2,c:0}, e:{r:2,c:7} },
      { s:{r:4,c:0}, e:{r:4,c:7} },
      { s:{r:6+filtered.length+1,c:0}, e:{r:6+filtered.length+1,c:6} }
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Penerimaan');
    XLSX.writeFile(wb, `Laporan_Penerimaan_${bln||'Semua'}.xlsx`);
  } catch(err) {
    showToast('Gagal export excel', 'error');
  }
}

// Fungsi Terbilang Rupiah
function terbilang(angka) {
  var bilangan = ['','Satu','Dua','Tiga','Empat','Lima','Enam','Tujuh','Delapan','Sembilan','Sepuluh','Sebelas'];
  if (angka < 12) return bilangan[angka];
  else if (angka < 20) return terbilang(angka - 10) + ' Belas';
  else if (angka < 100) return terbilang(Math.floor(angka / 10)) + ' Puluh ' + terbilang(angka % 10);
  else if (angka < 200) return 'Seratus ' + terbilang(angka - 100);
  else if (angka < 1000) return terbilang(Math.floor(angka / 100)) + ' Ratus ' + terbilang(angka % 100);
  else if (angka < 2000) return 'Seribu ' + terbilang(angka - 1000);
  else if (angka < 1000000) return terbilang(Math.floor(angka / 1000)) + ' Ribu ' + terbilang(angka % 1000);
  else if (angka < 1000000000) return terbilang(Math.floor(angka / 1000000)) + ' Juta ' + terbilang(angka % 1000000);
  else return '';
}

// Cetak Kwitansi Khusus
function printKwitansi(id) {
  const d = allBayar.find(x => x.id === id);
  if(!d) return;
  
  const kwitansiHTML = `
    <div class="kwitansi-item">
      <div class="kwitansi-header">
        <div class="kwitansi-header-left">
          <img src="img/logo.png" alt="Logo">
          <div class="kwitansi-header-text">
            <h2>PONDOK PESANTREN</h2>
            <h1>AL-FATHONAH KUDUKERAS</h1>
            <p>Jl. H. Mastra No. 04, RT. 03/03 Kudukeras | WA: 085323056221</p>
          </div>
        </div>
        <div class="kwitansi-title-center">
          <div class="kwitansi-title">K W I T A N S I</div>
        </div>
        <div class="kwitansi-no-right">
          <div class="kwitansi-no">No. ${d.id.substring(0,8).toUpperCase()}</div>
        </div>
      </div>
      <div class="kwitansi-body">
        <label>Telah terima dari</label><span>:</span><span>${d.santri ? d.santri.nama : '-'} (NIS: ${d.santri ? d.santri.nis : '-'})</span>
        <label>Uang Sebesar</label><span>:</span><span class="terbilang-box">### ${terbilang(d.nominal || 0)} Rupiah ###</span>
        <label>Untuk bayar</label><span>:</span><span style="font-weight:bold;">${d.jenis_pembayaran} Bulan ${d.bulan} ${d.tahun}</span>
        <label>Tanggal / Metode</label><span>:</span><span>${formatDate(d.tgl_bayar)} / ${d.metode_bayar}</span>
        <label>Keterangan</label><span>:</span><span style="font-size:0.85rem;font-style:italic;">${d.keterangan || '-'}</span>
      </div>
      <div class="kwitansi-footer">
        <div class="kwitansi-nominal">Rp ${Number(d.nominal||0).toLocaleString('id-ID')},-</div>
        <div class="kwitansi-sign">
          <p>Cirebon, ${formatDate(d.tgl_bayar)}</p>
          <p>Petugas Administrasi,</p>
          <div class="sign-name">( ............................ )</div>
        </div>
      </div>
    </div>
  `;
  
  const container = document.getElementById('kwitansiContainer');
  container.innerHTML = kwitansiHTML;
  document.querySelectorAll('[id^="printArea"]').forEach(el => el.classList.remove('active-print'));
  document.getElementById('printAreaKwitansi').classList.add('active-print');
  
  setPrintPageSize('portrait');
  window.print();
  
  document.getElementById('printAreaKwitansi').classList.remove('active-print');
}

function printSemuaKwitansi() {
  const q = document.getElementById('searchBayar').value.toLowerCase();
  const bln = document.getElementById('filterBulanBayar').value;
  let filtered = allBayar.filter(d => {
    const nama = (d.santri?.nama || '').toLowerCase();
    const nis = (d.santri?.nis || '').toLowerCase();
    const jenis = (d.jenis_pembayaran || '').toLowerCase();
    const matchQ = nama.includes(q) || nis.includes(q) || jenis.includes(q);
    const matchB = bln ? d.bulan === bln : true;
    return matchQ && matchB;
  });

  if (filtered.length === 0) {
    showToast('Tidak ada kwitansi untuk dicetak', 'error'); return;
  }
  
  let html = '';
  filtered.forEach(d => {
    html += `
    <div class="kwitansi-item">
      <div class="kwitansi-header">
        <div class="kwitansi-header-left">
          <img src="img/logo.png" alt="Logo">
          <div class="kwitansi-header-text">
            <h2>PONDOK PESANTREN</h2>
            <h1>AL-FATHONAH KUDUKERAS</h1>
            <p>Jl. H. Mastra No. 04, RT. 03/03 Kudukeras | WA: 085323056221</p>
          </div>
        </div>
        <div class="kwitansi-title-center">
          <div class="kwitansi-title">K W I T A N S I</div>
        </div>
        <div class="kwitansi-no-right">
          <div class="kwitansi-no">No. ${d.id.substring(0,8).toUpperCase()}</div>
        </div>
      </div>
      <div class="kwitansi-body">
        <label>Telah terima dari</label><span>:</span><span>${d.santri ? d.santri.nama : '-'} (NIS: ${d.santri ? d.santri.nis : '-'})</span>
        <label>Uang Sebesar</label><span>:</span><span class="terbilang-box">### ${terbilang(d.nominal || 0)} Rupiah ###</span>
        <label>Untuk bayar</label><span>:</span><span style="font-weight:bold;">${d.jenis_pembayaran} Bulan ${d.bulan} ${d.tahun}</span>
        <label>Tanggal / Metode</label><span>:</span><span>${formatDate(d.tgl_bayar)} / ${d.metode_bayar}</span>
        <label>Keterangan</label><span>:</span><span style="font-size:0.85rem;font-style:italic;">${d.keterangan || '-'}</span>
      </div>
      <div class="kwitansi-footer">
        <div class="kwitansi-nominal">Rp ${Number(d.nominal||0).toLocaleString('id-ID')},-</div>
        <div class="kwitansi-sign">
          <p>Cirebon, ${formatDate(d.tgl_bayar)}</p>
          <p>Petugas Administrasi,</p>
          <div class="sign-name">( ............................ )</div>
        </div>
      </div>
    </div>`;
  });
  
  const container = document.getElementById('kwitansiContainer');
  container.innerHTML = html;
  
  document.querySelectorAll('[id^="printArea"]').forEach(el => el.classList.remove('active-print'));
  document.getElementById('printAreaKwitansi').classList.add('active-print');
  
  setPrintPageSize('portrait');
  window.print();
  
  document.getElementById('printAreaKwitansi').classList.remove('active-print');
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
      status_aktif: document.getElementById('pengurus_status').value
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
  window.print();
  document.getElementById('printAreaPengurus').classList.remove('active-print');
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
  window.print();
  document.getElementById('printAreaInventaris').classList.remove('active-print');
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
  window.location.href = 'index.html';
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
          <button class="btn-action btn-delete" onclick="deleteMaster('master_tahun_ajaran', '${t.id}', '${t.tahun_ajaran}')" title="Hapus">✕</button>
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
          <button class="btn-action btn-delete" onclick="deleteMaster('master_kelas', '${k.id}', '${k.nama_kelas}')" title="Hapus">✕</button>
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
          <button class="btn-action btn-delete" onclick="deleteMaster('master_mapel', '${m.id}', '${m.nama_mapel}')" title="Hapus">✕</button>
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
          <div class="action-btns" style="gap:8px;">
            <button class="btn-add" style="padding: 6px 12px; font-size: 0.75rem; width: auto; height: auto;" onclick="openHafalanModal('${s.id}', '${(s.nama||'').replace(/'/g, "\\'")}')">+ Catat</button>
            <button class="btn-cancel" style="padding: 6px 12px; font-size: 0.75rem; width: auto; height: auto; text-wrap: nowrap;" onclick="openRiwayatHafalanModal('${s.id}', '${(s.nama||'').replace(/'/g, "\\'")}')" ${totalSetoran === 0 ? 'disabled style="padding:6px 12px;font-size:0.75rem;width:auto;height:auto;opacity:0.5;cursor:not-allowed;"' : ''}>Riwayat (${totalSetoran})</button>
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
  window.print();
  document.getElementById('printAreaHafalan').classList.remove('active-print');
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
  window.print();
  document.getElementById('printAreaHafalanSantri').classList.remove('active-print');
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
          <button class="btn-action btn-delete" onclick="deleteSurat('${s.id}')" title="Hapus">✕</button>
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
      <button class="btn-cancel" onclick="editJadwal('${j.id}'); closeJadwalDetailModal();" style="display: flex; align-items: center; gap: 6px;">
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
  window.print();
  document.getElementById('printAreaJadwal').classList.remove('active-print');
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
        <div style="display:flex;gap:6px;">
          <button onclick="printPsb('${r.id}')" title="Cetak" style="background:#059669;color:#fff;border:none;padding:6px 10px;border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg></button>
          <select onchange="updatePsbStatus('${r.id}',this.value)" style="padding:5px 8px;border-radius:8px;border:1px solid #E5E7EB;font-size:0.8rem;cursor:pointer;">
            <option value="Baru" ${r.status==='Baru'?'selected':''}>Baru</option>
            <option value="Diterima" ${r.status==='Diterima'?'selected':''}>Diterima</option>
            <option value="Ditolak" ${r.status==='Ditolak'?'selected':''}>Ditolak</option>
          </select>
          <button onclick="deletePsb('${r.id}')" title="Hapus" style="background:#EF4444;color:#fff;border:none;padding:6px 10px;border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg></button>
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
  if(status === 'Aktif') return `<span style="background:#D1FAE5; color:#065F46; padding:4px 8px; border-radius:4px; font-size:0.75rem;">Aktif</span>`;
  if(status === 'Menunggu') return `<span style="background:#FEF3C7; color:#92400E; padding:4px 8px; border-radius:4px; font-size:0.75rem;">Menunggu</span>`;
  return `<span style="background:#FEE2E2; color:#B91C1C; padding:4px 8px; border-radius:4px; font-size:0.75rem;">Nonaktif</span>`;
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
      <td style="text-transform: capitalize;">${a.role}</td>
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

  // Load data from web_pengurus based on email
  try {
    const { data, error } = await sb.from('web_pengurus').select('*').eq('email', user.email).single();
    
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
    console.log('User belum ada di web_pengurus, form kosong.');
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
  
  // kita asumsikan bucket 'images' sudah ada
  const { data, error } = await sb.storage.from('images').upload(fileName, file);
  if (error) throw error;
  
  const { data: publicData } = sb.storage.from('images').getPublicUrl(fileName);
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

    // 3. Upsert data ke web_pengurus
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
      const { error } = await sb.from('web_pengurus').update(payload).eq('id', id);
      if (error) throw error;
    } else {
      // Insert
      const { error } = await sb.from('web_pengurus').insert([payload]);
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
