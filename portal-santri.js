/**
 * PORTAL WALI SANTRI - PONDOK PESANTREN AL-FATHONAH
 * Logika pencarian data santri, verifikasi keamanan, dan tampilan informasi
 * (SPP, Saldo & Riwayat Uang Jajan, Riwayat Setoran Hafalan)
 */

(function () {
  'use strict';

  // Kode Keamanan Resmi yang ditentukan untuk Wali Santri
  const PORTAL_SECURITY_CODE = 'PPAFKUDUKERAS';

  // State
  let currentActiveStudent = null;
  let currentStudentSpp = [];
  let currentStudentJajan = [];
  let currentStudentHafalan = [];
  let currentHafalanFilter = 'all';

  // Helper Supabase Client
  function getClient() {
    if (typeof getSupabase === 'function') {
      const client = getSupabase();
      if (client) return client;
    }
    if (window.supabase && window.supabase.createClient) {
      const url = 'https://rnjqwgwazqlmhmxedhef.supabase.co';
      const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuanF3Z3dhenFsbWhteGVkaGVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5MDQ5MzUsImV4cCI6MjEwMTQ4MDkzNX0.Lg-9PAdE4JbmnbIJUrwkPSaeTwATZpcoQrFWzgkfhME';
      return window.supabase.createClient(url, key);
    }
    return null;
  }

  // Format Rupiah Helper
  function formatRp(num) {
    const val = Number(num) || 0;
    return 'Rp ' + val.toLocaleString('id-ID');
  }

  // Format Tanggal Helper
  function formatTgl(str) {
    if (!str) return '-';
    try {
      const d = new Date(str);
      if (isNaN(d.getTime())) return str;
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return str;
    }
  }

  // Lookup cache untuk master_kelas
  let portalKelasMap = {};

  // Safely format kelas/jenjang - NEVER show raw UUID
  function formatKelasSantri(s) {
    if (!s) return '-';
    if (s.is_lulus) return 'Alumni / Lulus';
    // 1. Cek dari join master_kelas
    if (s.master_kelas && s.master_kelas.nama_kelas) return s.master_kelas.nama_kelas;
    // 2. Cek dari cache portalKelasMap
    if (s.kelas_id && portalKelasMap[s.kelas_id]) return portalKelasMap[s.kelas_id];
    // 3. Cek window.allMasterKelas (dari dashboard jika tersedia)
    if (s.kelas_id && window.allMasterKelas && Array.isArray(window.allMasterKelas)) {
      const found = window.allMasterKelas.find(k => k.id === s.kelas_id);
      if (found && found.nama_kelas) return found.nama_kelas;
    }
    // 4. Jika kelas_id bukan UUID (mungkin nama langsung), tampilkan
    if (s.kelas_id && !s.kelas_id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-/i)) return s.kelas_id;
    // 5. Fallback: jangan pernah tampilkan UUID mentah
    return s.kelas_id ? 'Kelas Terdaftar' : '-';
  }

  // Fetch master_kelas dan bangun lookup map
  async function enrichSantriWithKelas(santriList) {
    try {
      const sb = getClient();
      if (!sb) return;
      // Kumpulkan semua kelas_id unik yang belum ada di cache
      const kelasIds = [...new Set(santriList.filter(s => s.kelas_id && !portalKelasMap[s.kelas_id]).map(s => s.kelas_id))];
      if (kelasIds.length === 0) return;
      // Fetch master_kelas berdasarkan ID
      const { data: kelasData } = await sb
        .from('master_kelas')
        .select('id, nama_kelas')
        .in('id', kelasIds);
      if (kelasData && kelasData.length > 0) {
        kelasData.forEach(k => { portalKelasMap[k.id] = k.nama_kelas; });
      }
    } catch (e) {
      console.warn('Portal: Gagal fetch master_kelas, menggunakan fallback.', e);
    }
  }

  // Toggle Password Visibility
  window.togglePortalKodeVisibility = function () {
    const input = document.getElementById('portalKode');
    const eyeIcon = document.getElementById('portalEyeIcon');
    if (!input || !eyeIcon) return;

    if (input.type === 'password') {
      input.type = 'text';
      eyeIcon.innerHTML = `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>`;
    } else {
      input.type = 'password';
      eyeIcon.innerHTML = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>`;
    }
  };

  // Clear Keyword Input
  window.clearPortalKeyword = function () {
    const input = document.getElementById('portalKeyword');
    const clearBtn = document.getElementById('portalKeywordClear');
    if (input) {
      input.value = '';
      input.focus();
    }
    if (clearBtn) clearBtn.style.display = 'none';
  };

  // Handle Input Changes for Clear Button
  document.addEventListener('DOMContentLoaded', () => {
    const kwInput = document.getElementById('portalKeyword');
    const clearBtn = document.getElementById('portalKeywordClear');
    if (kwInput && clearBtn) {
      kwInput.addEventListener('input', () => {
        clearBtn.style.display = kwInput.value.trim().length > 0 ? 'flex' : 'none';
      });
    }
  });

  // ===== OPEN PORTAL SEARCH MODAL (INITIAL SEARCH VIEW) =====
  window.openPortalSearchModal = function () {
    const modal = document.getElementById('portalSantriModal');
    const modalBody = document.getElementById('portalModalBodyContent');
    const headerTitle = document.getElementById('portalModalHeaderTitle');
    const headerTags = document.getElementById('portalModalHeaderTags');
    const avatarWrap = document.getElementById('portalAvatarWrap');
    const tabsNav = document.getElementById('portalTabsNav');
    const printBtn = document.getElementById('portalBtnPrint');
    const btnBackSearch = document.getElementById('portalBtnBackSearch');

    if (!modal || !modalBody) return;

    if (printBtn) printBtn.style.display = 'none';
    if (btnBackSearch) btnBackSearch.style.display = 'none';
    if (tabsNav) tabsNav.style.display = 'none';

    if (avatarWrap) {
      avatarWrap.innerHTML = `<span class="portal-avatar-initials">🏛️</span>`;
    }

    if (headerTitle) {
      headerTitle.innerHTML = `Portal Wali Santri Terpadu`;
    }

    if (headerTags) {
      headerTags.innerHTML = `
        <span class="portal-meta-tag">Pondok Pesantren Al-Fathonah</span>
        <span class="portal-meta-tag" style="background:#10B981; color:#FFFFFF;">Layanan Mandiri</span>
      `;
    }

    modalBody.innerHTML = `
      <div style="max-width: 680px; margin: 0 auto; padding: 10px 0;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div class="portal-badge-pill" style="margin-bottom: 8px;">
            <span class="portal-pulse-dot"></span>
            <span>Akses Informasi Santri</span>
          </div>
          <h3 style="font-size: 1.55rem; font-weight: 800; color: #064E3B; margin: 0 0 8px 0;">Cek Perkembangan Putra/Putri Anda</h3>
          <p style="font-size: 0.92rem; color: #4B5563; margin: 0; line-height: 1.5;">
            Silakan masukkan identitas santri dan kode keamanan resmi untuk mengecek status pembayaran SPP, sisa saldo uang jajan, serta catatan setoran hafalan secara transparan.
          </p>
        </div>

        <form class="portal-search-form" id="portalSearchForm" action="javascript:void(0);" onsubmit="handlePortalSearch(event); return false;">
          <div class="portal-form-grid" style="grid-template-columns: 1fr; gap: 16px;">
            <div class="portal-input-group">
              <label for="portalKeyword" class="portal-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                Nomor Induk Santri (NIS), NIK, atau Nama Lengkap
              </label>
              <div class="portal-input-wrapper">
                <input type="text" id="portalKeyword" class="portal-input" placeholder="Ketik NIS (cth: AF0001), NIK, atau Nama Lengkap Santri..." required autocomplete="off">
                <button type="button" class="portal-input-clear" id="portalKeywordClear" onclick="clearPortalKeyword()" style="display:none;" title="Hapus kata kunci">✕</button>
              </div>
              <span class="portal-input-hint">Contoh pencarian: <strong>AF0001</strong> atau nama santri</span>
            </div>

            <div class="portal-input-group">
              <label for="portalKode" class="portal-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                Kode Keamanan Wali Santri
              </label>
              <div class="portal-input-wrapper">
                <input type="password" id="portalKode" class="portal-input" placeholder="Masukkan kode keamanan wali..." required autocomplete="off">
                <button type="button" class="portal-toggle-pwd" id="portalTogglePwd" onclick="togglePortalKodeVisibility()" title="Tampilkan/Sembunyikan kode">
                  <svg id="portalEyeIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                </button>
              </div>
              <span class="portal-input-hint">Masukkan kode keamanan khusus yang diberikan oleh pihak pesantren</span>
            </div>
          </div>

          <div class="portal-action-row" style="margin-top: 18px;">
            <button type="submit" class="portal-submit-btn" id="portalSubmitBtn" style="width: 100%;">
              <span class="portal-btn-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </span>
              <span class="portal-btn-text">Cari & Cek Data Santri</span>
            </button>
          </div>
        </form>

        <div class="portal-features-chips" style="justify-content: center; margin-top: 24px; padding-top: 20px;">
          <div class="portal-chip">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
            Status SPP Bulanan
          </div>
          <div class="portal-chip">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="12" cy="12" r="10"></circle><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path><line x1="12" y1="6" x2="12" y2="18"></line></svg>
            Sisa Saldo & Riwayat Jajan
          </div>
          <div class="portal-chip">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
            Riwayat Setoran Hafalan
          </div>
          <div class="portal-chip">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            Akses Aman Khusus Wali
          </div>
        </div>
      </div>
    `;

    // Pasang listener input keyword
    const kwInput = document.getElementById('portalKeyword');
    const clearBtn = document.getElementById('portalKeywordClear');
    if (kwInput && clearBtn) {
      kwInput.addEventListener('input', () => {
        clearBtn.style.display = kwInput.value.trim().length > 0 ? 'flex' : 'none';
      });
      setTimeout(() => kwInput.focus(), 250);
    }

    openPortalModal();
  };

  // ===== SEARCH HANDLER =====
  window.handlePortalSearch = async function (e) {
    if (e) e.preventDefault();

    const kwInput = document.getElementById('portalKeyword');
    const kodeInput = document.getElementById('portalKode');
    const submitBtn = document.getElementById('portalSubmitBtn');

    if (!kwInput || !kodeInput) return;

    const keyword = kwInput.value.trim();
    const kode = kodeInput.value.trim();

    // 1. Validasi Input Kosong
    if (!keyword) {
      alert('Silakan ketik NIS, NIK, atau Nama Lengkap santri terlebih dahulu.');
      kwInput.focus();
      return;
    }

    if (!kode) {
      alert('Silakan masukkan Kode Keamanan Wali Santri.');
      kodeInput.focus();
      return;
    }

    // 2. Validasi Kode Keamanan
    if (kode.toUpperCase() !== PORTAL_SECURITY_CODE) {
      alert('⚠️ Kode Keamanan Salah!\n\nPastikan Anda memasukkan kode keamanan wali santri yang valid. Hubungi pihak tata usaha/pengurus pesantren jika belum memiliki kode akses.');
      kodeInput.focus();
      return;
    }

    // 3. Eksekusi Pencarian ke Database
    const oldBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="portal-spinner" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none" style="animation: spin 1s linear infinite;">
        <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
        <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
      </svg>
      <span>Mencari Data...</span>
    `;

    try {
      const sb = getClient();
      if (!sb) {
        throw new Error('Koneksi sistem belum siap. Silakan refresh halaman.');
      }

      // Cari berdasarkan NIS, NIK, atau Nama (case-insensitive substring)
      const cleanKw = keyword.replace(/[%_]/g, '');
      const { data: santriList, error } = await sb
        .from('data_induk_santri')
        .select('*, master_kelas(nama_kelas)')
        .or(`nis.ilike.%${cleanKw}%,nik.ilike.%${cleanKw}%,nama.ilike.%${cleanKw}%`)
        .order('nama', { ascending: true })
        .limit(15);

      if (error) {
        console.error('Portal Search Error:', error);
        throw error;
      }

      if (!santriList || santriList.length === 0) {
        showPortalModalSelectionEmpty(keyword);
        return;
      }

      // Enrich santri data dengan nama kelas (bypass RLS issue)
      await enrichSantriWithKelas(santriList);

      if (santriList.length === 1) {
        // Tepat 1 santri ditemukan, langsung buka detail
        await loadAndShowStudentDetail(santriList[0]);
      } else {
        // Lebih dari 1 santri ditemukan, tampilkan daftar pilihan
        showPortalModalSelection(santriList, keyword);
      }
    } catch (err) {
      console.error(err);
      alert('Gagal mencari data santri: ' + (err.message || 'Terjadi kesalahan jaringan'));
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = oldBtnText;
    }
  };

  // ===== TAMPILAN PILIHAN SANTRI JIKA LEBIH DARI 1 =====
  function showPortalModalSelection(list, keyword) {
    const modal = document.getElementById('portalSantriModal');
    const modalBody = document.getElementById('portalModalBodyContent');
    const headerTitle = document.getElementById('portalModalHeaderTitle');
    const headerTags = document.getElementById('portalModalHeaderTags');
    const avatarWrap = document.getElementById('portalAvatarWrap');
    const tabsNav = document.getElementById('portalTabsNav');
    const printBtn = document.getElementById('portalBtnPrint');
    const btnBackSearch = document.getElementById('portalBtnBackSearch');

    if (!modal || !modalBody) return;

    if (printBtn) printBtn.style.display = 'none';
    if (btnBackSearch) btnBackSearch.style.display = 'inline-flex';
    if (tabsNav) tabsNav.style.display = 'none';

    avatarWrap.innerHTML = `<span class="portal-avatar-initials">🔍</span>`;
    headerTitle.innerHTML = `Pilih Santri Terdaftar`;
    headerTags.innerHTML = `<span class="portal-meta-tag">Ditemukan ${list.length} Santri untuk pencarian "${keyword}"</span>`;

    let html = `
      <div style="margin-bottom: 16px;">
        <h4 style="margin: 0 0 6px 0; color: #1F2937;">Ditemukan beberapa santri yang cocok</h4>
        <p style="margin: 0; color: #6B7280; font-size: 0.9rem;">Silakan pilih nama putra/putri Anda di bawah ini untuk melihat rincian informasi:</p>
      </div>
      <div class="portal-selection-list">
    `;

    list.forEach(s => {
      const kls = formatKelasSantri(s);
      const jk = s.jenis_kelamin === 'Laki-laki' ? 'Laki-laki' : 'Perempuan';
      const initial = (s.nama || 'S').charAt(0).toUpperCase();

      html += `
        <div class="portal-selection-item" onclick="window.selectPortalStudent('${s.id}')">
          <div class="portal-selection-left">
            <div style="width: 44px; height: 44px; border-radius: 12px; background: #ECFDF5; color: #065F46; font-weight: 700; display:flex; align-items:center; justify-content:center; font-size: 1.1rem; border: 1px solid #A7F3D0;">
              ${initial}
            </div>
            <div>
              <div class="portal-selection-name">${escapeHtml(s.nama)}</div>
              <div class="portal-selection-sub">NIS: <strong>${s.nis || '-'}</strong> • ${kls} • ${jk}</div>
            </div>
          </div>
          <button type="button" class="portal-selection-btn">
            <span>Buka Data</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      `;
    });

    html += `</div>`;
    modalBody.innerHTML = html;

    openPortalModal();

    // Cache list santri agar bisa dipanggil selectPortalStudent
    window._tempPortalSantriList = list;
  }

  // Pilih santri dari list selection
  window.selectPortalStudent = async function (id) {
    const list = window._tempPortalSantriList || [];
    const s = list.find(item => item.id === id);
    if (s) {
      await loadAndShowStudentDetail(s);
    }
  };

  // ===== TAMPILAN TIDAK DITEMUKAN =====
  function showPortalModalSelectionEmpty(keyword) {
    const modal = document.getElementById('portalSantriModal');
    const modalBody = document.getElementById('portalModalBodyContent');
    const headerTitle = document.getElementById('portalModalHeaderTitle');
    const headerTags = document.getElementById('portalModalHeaderTags');
    const avatarWrap = document.getElementById('portalAvatarWrap');
    const tabsNav = document.getElementById('portalTabsNav');
    const printBtn = document.getElementById('portalBtnPrint');
    const btnBackSearch = document.getElementById('portalBtnBackSearch');

    if (!modal || !modalBody) return;

    if (printBtn) printBtn.style.display = 'none';
    if (btnBackSearch) btnBackSearch.style.display = 'inline-flex';
    if (tabsNav) tabsNav.style.display = 'none';

    avatarWrap.innerHTML = `<span class="portal-avatar-initials">⚠️</span>`;
    headerTitle.innerHTML = `Data Tidak Ditemukan`;
    headerTags.innerHTML = `<span class="portal-meta-tag">Pencarian: "${keyword}"</span>`;

    modalBody.innerHTML = `
      <div class="portal-empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="56" height="56">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          <line x1="8" y1="11" x2="14" y2="11"></line>
        </svg>
        <h4>Santri Tidak Ditemukan</h4>
        <p style="max-width: 460px; margin: 0 auto 18px auto; line-height: 1.5;">
          Tidak ada santri yang cocok dengan kata kunci "<strong>${escapeHtml(keyword)}</strong>". 
          Pastikan Nomor Induk Santri (NIS), NIK, atau Nama Lengkap sudah diketik dengan benar.
        </p>
        <button type="button" class="portal-btn-close-modal" onclick="openPortalSearchModal()" style="background:#059669; color:#FFFFFF;">
          Coba Cari Lagi
        </button>
      </div>
    `;

    openPortalModal();
  }

  // ===== LOAD & SHOW STUDENT DETAIL =====
  async function loadAndShowStudentDetail(student) {
    currentActiveStudent = student;
    const sb = getClient();

    // Tampilkan loading di modal
    const avatarWrap = document.getElementById('portalAvatarWrap');
    const headerTitle = document.getElementById('portalModalHeaderTitle');
    const headerTags = document.getElementById('portalModalHeaderTags');
    const modalBody = document.getElementById('portalModalBodyContent');
    const tabsNav = document.getElementById('portalTabsNav');

    if (avatarWrap) {
      if (student.foto_3x4) {
        avatarWrap.innerHTML = `<img src="${student.foto_3x4}" alt="${escapeHtml(student.nama)}" class="portal-avatar-img">`;
      } else {
        const init = (student.nama || 'S').charAt(0).toUpperCase();
        avatarWrap.innerHTML = `<span class="portal-avatar-initials">${init}</span>`;
      }
    }

    if (headerTitle) {
      headerTitle.innerHTML = `
        <span>${escapeHtml(student.nama)}</span>
        <svg class="portal-verified-icon" viewBox="0 0 24 24" fill="currentColor" width="18" height="18" title="Santri Terverifikasi">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      `;
    }

    const kls = formatKelasSantri(student);
    const statusMondok = student.status_mondok || 'Aktif';

    if (headerTags) {
      headerTags.innerHTML = `
        <span class="portal-meta-tag">NIS: <strong>${student.nis || '-'}</strong></span>
        ${student.nik ? `<span class="portal-meta-tag">NIK: ${student.nik}</span>` : ''}
        <span class="portal-meta-tag">Kelas: ${kls}</span>
        <span class="portal-meta-tag" style="background:#10B981; color:#FFFFFF;">${statusMondok}</span>
      `;
    }

    const printBtn = document.getElementById('portalBtnPrint');
    const btnBackSearch = document.getElementById('portalBtnBackSearch');
    if (printBtn) printBtn.style.display = 'inline-flex';
    if (btnBackSearch) btnBackSearch.style.display = 'inline-flex';
    if (tabsNav) tabsNav.style.display = 'flex';

    if (modalBody) {
      modalBody.innerHTML = `
        <div style="text-align: center; padding: 50px 20px; color: #059669;">
          <svg style="animation: spin 1s linear infinite; margin-bottom: 12px;" viewBox="0 0 24 24" width="36" height="36" stroke="currentColor" stroke-width="2.5" fill="none">
            <circle cx="12" cy="12" r="10" stroke-opacity="0.2"></circle>
            <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
          </svg>
          <div style="font-weight: 600; font-size: 1.05rem;">Memuat data administrasi santri...</div>
          <div style="font-size: 0.85rem; color: #6B7280; margin-top: 4px;">Menyinkronkan SPP, Uang Jajan, dan Setoran Hafalan</div>
        </div>
      `;
    }

    openPortalModal();

    try {
      // 1. Ambil data Tagihan Bulanan (SPP & Uang Jajan)
      const { data: tagihanList, error: tErr } = await sb
        .from('tagihan_bulanan')
        .select('*')
        .order('created_at', { ascending: false });

      if (tErr) console.warn('Tagihan error:', tErr);
      const allTagihan = tagihanList || [];

      // 2. Ambil data Pembayaran Santri ini
      const { data: payList, error: pErr } = await sb
        .from('pembayaran_bulanan')
        .select('*')
        .eq('santri_id', student.id)
        .order('tgl_bayar', { ascending: false });

      if (pErr) console.warn('Pembayaran error:', pErr);
      const allPayments = payList || [];

      // 3. Ambil data Setoran Hafalan Santri ini
      const { data: hafalanList, error: hErr } = await sb
        .from('setoran_hafalan')
        .select('*')
        .eq('santri_id', student.id)
        .order('tanggal', { ascending: false });

      if (hErr) console.warn('Hafalan error:', hErr);
      currentStudentHafalan = hafalanList || [];

      // Proses SPP
      const sppTagihan = allTagihan.filter(t => t.kategori === 'SPP');
      currentStudentSpp = sppTagihan.map(tagihan => {
        const trans = allPayments.filter(p => p.tagihan_id === tagihan.id && p.jenis_transaksi === 'Pemasukan');
        const totalBayar = trans.reduce((sum, item) => sum + (Number(item.nominal) || 0), 0);
        const wajib = Number(tagihan.nominal_wajib) || 0;
        const kurang = Math.max(0, wajib - totalBayar);
        const tglBayar = trans.length > 0 ? trans[0].tgl_bayar : null;

        let status = 'Belum Bayar';
        if (totalBayar >= wajib && wajib > 0) {
          status = 'Lunas';
        } else if (totalBayar > 0) {
          status = 'Kurang';
        }

        return {
          id: tagihan.id,
          bulan: tagihan.bulan,
          tahun: tagihan.tahun,
          nominal_wajib: wajib,
          total_bayar: totalBayar,
          kekurangan: kurang,
          status: status,
          tgl_bayar: tglBayar,
          transaksi: trans
        };
      });

      // Proses Uang Jajan
      // Uang jajan dapat terhubung lewat tagihan berkategori 'Uang Jajan'
      const jajanTagihanIds = new Set(allTagihan.filter(t => t.kategori === 'Uang Jajan').map(t => t.id));
      currentStudentJajan = allPayments.filter(p => jajanTagihanIds.has(p.tagihan_id));

      renderPortalStudentDetail();
    } catch (err) {
      console.error('Error loading detail:', err);
      if (modalBody) {
        modalBody.innerHTML = `
          <div class="portal-alert error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <div>Gagal memuat rincian data: ${err.message || 'Error'}</div>
          </div>
        `;
      }
    }
  }

  // ===== RENDER DETAIL SANTRI =====
  function renderPortalStudentDetail() {
    const modalBody = document.getElementById('portalModalBodyContent');
    if (!modalBody || !currentActiveStudent) return;

    const s = currentActiveStudent;

    // Hitung Ringkasan SPP
    let sppTotalTagihan = 0;
    let sppTotalTerbayar = 0;
    let sppTotalTunggakan = 0;
    let sppLunasCount = 0;

    currentStudentSpp.forEach(item => {
      sppTotalTagihan += item.nominal_wajib;
      sppTotalTerbayar += item.total_bayar;
      sppTotalTunggakan += item.kekurangan;
      if (item.status === 'Lunas') sppLunasCount++;
    });

    // Hitung Ringkasan Uang Jajan
    let jajanTotalMasuk = 0;
    let jajanTotalKeluar = 0;

    currentStudentJajan.forEach(item => {
      const nom = Number(item.nominal) || 0;
      if (item.jenis_transaksi === 'Pengeluaran') {
        jajanTotalKeluar += nom;
      } else {
        jajanTotalMasuk += nom;
      }
    });

    const jajanSisaSaldo = jajanTotalMasuk - jajanTotalKeluar;

    // Hitung Ringkasan Hafalan
    const totalSetoran = currentStudentHafalan.length;
    const lulusCount = currentStudentHafalan.filter(h => h.status === 'Lulus').length;

    // Bangun HTML Lengkap
    modalBody.innerHTML = `
      <!-- QUICK STATS CARDS -->
      <div class="portal-stats-grid">
        <!-- Card SPP -->
        <div class="portal-stat-card">
          <div class="portal-stat-icon spp">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22">
              <rect x="2" y="5" width="20" height="14" rx="2"></rect>
              <line x1="2" y1="10" x2="22" y2="10"></line>
            </svg>
          </div>
          <div class="portal-stat-details">
            <span class="portal-stat-label">Status SPP</span>
            <div class="portal-stat-value" style="color: ${sppTotalTunggakan > 0 ? '#DC2626' : '#059669'}; font-size: 1.15rem;">
              ${sppTotalTunggakan > 0 ? 'Tunggakan ' + formatRp(sppTotalTunggakan) : 'Lunas'}
            </div>
            <span class="portal-stat-sub">${sppLunasCount} dari ${currentStudentSpp.length} periode terbayar</span>
          </div>
        </div>

        <!-- Card Uang Jajan -->
        <div class="portal-stat-card">
          <div class="portal-stat-icon jajan">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path>
              <line x1="12" y1="6" x2="12" y2="18"></line>
            </svg>
          </div>
          <div class="portal-stat-details">
            <span class="portal-stat-label">Saldo Uang Jajan</span>
            <div class="portal-stat-value" style="color: ${jajanSisaSaldo < 0 ? '#DC2626' : '#059669'}; font-size: 1.15rem;">
              ${formatRp(jajanSisaSaldo)}
            </div>
            <span class="portal-stat-sub">Deposit: ${formatRp(jajanTotalMasuk)}</span>
          </div>
        </div>

        <!-- Card Hafalan -->
        <div class="portal-stat-card">
          <div class="portal-stat-icon hafalan">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
          </div>
          <div class="portal-stat-details">
            <span class="portal-stat-label">Capaian Hafalan</span>
            <div class="portal-stat-value" style="font-size: 1.15rem;">
              ${totalSetoran} Setoran
            </div>
            <span class="portal-stat-sub">${lulusCount} setoran dinyatakan Lulus</span>
          </div>
        </div>
      </div>

      <!-- TAB 1: STATUS SPP -->
      <div id="portalTabSpp" class="portal-tab-content active">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
          <h4 style="margin: 0; color: #1F2937; font-size: 1.05rem;">Riwayat Tagihan & Pembayaran SPP</h4>
          <span style="font-size: 0.8rem; color: #6B7280;">Total SPP Terbayar: <strong style="color: #059669;">${formatRp(sppTotalTerbayar)}</strong></span>
        </div>
        ${renderSppTableHtml()}
      </div>

      <!-- TAB 2: UANG JAJAN -->
      <div id="portalTabJajan" class="portal-tab-content">
        <div class="portal-jajan-hero">
          <div>
            <span style="font-size: 0.85rem; opacity: 0.9; text-transform: uppercase; letter-spacing: 0.5px;">Sisa Saldo Jajan Santri</span>
            <div class="portal-jajan-main-val">${formatRp(jajanSisaSaldo)}</div>
            <span style="font-size: 0.82rem; opacity: 0.85;">Saldo dapat digunakan santri untuk jajan & kebutuhan harian di pesantren</span>
          </div>
          <div class="portal-jajan-sub-stats">
            <div class="portal-jajan-sub-box">
              <span>Total Uang Masuk</span>
              <strong style="color: #A7F3D0;">+ ${formatRp(jajanTotalMasuk)}</strong>
            </div>
            <div class="portal-jajan-sub-box">
              <span>Total Penarikan/Jajan</span>
              <strong style="color: #FECACA;">- ${formatRp(jajanTotalKeluar)}</strong>
            </div>
          </div>
        </div>

        <div style="margin-bottom: 12px;">
          <h4 style="margin: 0 0 4px 0; color: #1F2937; font-size: 1.05rem;">Riwayat Transaksi Uang Jajan</h4>
          <p style="margin: 0; font-size: 0.82rem; color: #6B7280;">Daftar penambahan saldo (deposit) dan penarikan uang jajan santri</p>
        </div>
        ${renderJajanTableHtml()}
      </div>

      <!-- TAB 3: SETORAN HAFALAN -->
      <div id="portalTabHafalan" class="portal-tab-content">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 10px;">
          <div>
            <h4 style="margin: 0 0 4px 0; color: #1F2937; font-size: 1.05rem;">Riwayat Setoran Hafalan Santri</h4>
            <p style="margin: 0; font-size: 0.82rem; color: #6B7280;">Pantau perkembangan setoran hafalan Al-Qur'an, Kitab, dan Do'a harian</p>
          </div>
          <div class="portal-hafalan-filters">
            <button type="button" class="portal-hfilter-btn ${currentHafalanFilter === 'all' ? 'active' : ''}" onclick="window.filterPortalHafalan('all')">Semua (${totalSetoran})</button>
            <button type="button" class="portal-hfilter-btn ${currentHafalanFilter === "Al-Qur'an" ? 'active' : ''}" onclick="window.filterPortalHafalan('Al-Qur\\'an')">Al-Qur'an</button>
            <button type="button" class="portal-hfilter-btn ${currentHafalanFilter === 'Kitab' ? 'active' : ''}" onclick="window.filterPortalHafalan('Kitab')">Kitab</button>
            <button type="button" class="portal-hfilter-btn ${currentHafalanFilter === "Do'a" ? 'active' : ''}" onclick="window.filterPortalHafalan('Do\\'a')">Do'a</button>
          </div>
        </div>
        <div id="portalHafalanContainer">
          ${renderHafalanTableHtml(currentHafalanFilter)}
        </div>
      </div>

      <!-- TAB 4: BIODATA SANTRI -->
      <div id="portalTabBiodata" class="portal-tab-content">
        <div style="margin-bottom: 14px;">
          <h4 style="margin: 0 0 4px 0; color: #1F2937; font-size: 1.05rem;">Biodata & Informasi Santri</h4>
          <p style="margin: 0; font-size: 0.82rem; color: #6B7280;">Data induk santri yang tercatat di Pondok Pesantren Al-Fathonah</p>
        </div>
        ${renderBiodataHtml(s)}
      </div>
    `;

    // Reset tab aktif ke SPP
    switchPortalTab('spp');
  }

  // HTML Tabel SPP
  function renderSppTableHtml() {
    if (!currentStudentSpp || currentStudentSpp.length === 0) {
      return `
        <div class="portal-empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="40" height="40"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
          <h4>Belum Ada Periode Tagihan SPP</h4>
          <p>Tagihan SPP belum diterbitkan untuk periode saat ini.</p>
        </div>
      `;
    }

    let rows = '';
    currentStudentSpp.forEach((item, index) => {
      let badgeClass = 'danger';
      let badgeLabel = 'Belum Bayar';

      if (item.status === 'Lunas') {
        badgeClass = 'success';
        badgeLabel = 'Lunas';
      } else if (item.status === 'Kurang') {
        badgeClass = 'warning';
        badgeLabel = `Kurang ${formatRp(item.kekurangan)}`;
      }

      rows += `
        <tr>
          <td style="text-align: center; color: #6B7280; width: 40px;">${index + 1}</td>
          <td><strong>${item.bulan} ${item.tahun}</strong></td>
          <td style="font-weight: 600;">${formatRp(item.nominal_wajib)}</td>
          <td style="color: #059669; font-weight: 600;">${item.total_bayar > 0 ? formatRp(item.total_bayar) : '-'}</td>
          <td>${formatTgl(item.tgl_bayar)}</td>
          <td><span class="portal-badge ${badgeClass}">${badgeLabel}</span></td>
        </tr>
      `;
    });

    return `
      <div class="portal-table-wrapper">
        <table class="portal-table">
          <thead>
            <tr>
              <th style="width: 40px; text-align: center;">No</th>
              <th>Periode Bulan</th>
              <th>Nominal SPP</th>
              <th>Terbayar</th>
              <th>Tgl Terakhir Bayar</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  }

  // HTML Tabel Uang Jajan
  function renderJajanTableHtml() {
    if (!currentStudentJajan || currentStudentJajan.length === 0) {
      return `
        <div class="portal-empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="40" height="40"><circle cx="12" cy="12" r="10"></circle><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path></svg>
          <h4>Belum Ada Transaksi Uang Jajan</h4>
          <p>Belum ada pencatatan deposit maupun penarikan uang jajan santri.</p>
        </div>
      `;
    }

    let rows = '';
    currentStudentJajan.forEach((item, index) => {
      const isKeluar = item.jenis_transaksi === 'Pengeluaran';
      const badgeClass = isKeluar ? 'danger' : 'success';
      const nominalDisplay = isKeluar ? `- ${formatRp(item.nominal)}` : `+ ${formatRp(item.nominal)}`;
      const nominalStyle = isKeluar ? 'color: #DC2626; font-weight: 700;' : 'color: #059669; font-weight: 700;';

      rows += `
        <tr>
          <td style="text-align: center; color: #6B7280; width: 40px;">${index + 1}</td>
          <td>${formatTgl(item.tgl_bayar)}</td>
          <td><span class="portal-badge ${badgeClass}">${item.jenis_transaksi || 'Transaksi'}</span></td>
          <td style="${nominalStyle}">${nominalDisplay}</td>
          <td>${escapeHtml(item.keterangan || (isKeluar ? 'Penarikan Jajan' : 'Setoran/Deposit'))}</td>
          <td><span style="font-size: 0.8rem; color: #6B7280;">${item.metode || 'Tunai'}</span></td>
        </tr>
      `;
    });

    return `
      <div class="portal-table-wrapper">
        <table class="portal-table">
          <thead>
            <tr>
              <th style="width: 40px; text-align: center;">No</th>
              <th>Tanggal</th>
              <th>Jenis Transaksi</th>
              <th>Nominal</th>
              <th>Keterangan / Keperluan</th>
              <th>Metode</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  }

  // HTML Tabel Setoran Hafalan
  function renderHafalanTableHtml(filterKat) {
    let list = currentStudentHafalan || [];
    if (filterKat && filterKat !== 'all') {
      list = list.filter(h => (h.kategori || "Al-Qur'an") === filterKat);
    }

    if (list.length === 0) {
      return `
        <div class="portal-empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="40" height="40"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
          <h4>Belum Ada Catatan Setoran</h4>
          <p>Belum ada data setoran hafalan yang tercatat untuk kategori ini.</p>
        </div>
      `;
    }

    let rows = '';
    list.forEach((h, index) => {
      // Materi hafalan
      let materi = '-';
      const kat = h.kategori || "Al-Qur'an";
      if (kat === "Al-Qur'an") {
        materi = h.surah_juz || '-';
        if (h.juz) materi = `Juz ${h.juz} • ${materi}`;
        if (h.ayat) materi += ` (Ayat ${h.ayat})`;
      } else if (kat === 'Kitab') {
        materi = h.nama_kitab || '-';
        if (h.bab_kitab) materi += ` — ${h.bab_kitab}`;
      } else if (kat === "Do'a") {
        materi = h.nama_doa || h.surah_juz || '-';
      }

      // Badge status
      let badgeClass = 'info';
      if (h.status === 'Lulus') badgeClass = 'success';
      else if (h.status === 'Lulus Bersyarat') badgeClass = 'warning';
      else if (h.status === 'Belum Lulus') badgeClass = 'danger';

      const poinText = h.poin !== null && h.poin !== undefined ? ` • Nilai: ${h.poin}` : '';

      rows += `
        <tr>
          <td style="text-align: center; color: #6B7280; width: 40px;">${index + 1}</td>
          <td>${formatTgl(h.tanggal)}</td>
          <td><span class="portal-badge info">${escapeHtml(kat)}</span></td>
          <td><strong>${escapeHtml(materi)}</strong></td>
          <td>
            <span class="portal-badge ${badgeClass}">${escapeHtml(h.status || 'Tercatat')}${poinText}</span>
          </td>
          <td>${escapeHtml(h.penguji || 'Ustadz Penguji')}</td>
          <td style="color: #4B5563; font-size: 0.82rem;">${escapeHtml(h.catatan || '-')}</td>
        </tr>
      `;
    });

    return `
      <div class="portal-table-wrapper">
        <table class="portal-table">
          <thead>
            <tr>
              <th style="width: 40px; text-align: center;">No</th>
              <th>Tanggal</th>
              <th>Kategori</th>
              <th>Materi Hafalan</th>
              <th>Hasil / Status</th>
              <th>Penguji</th>
              <th>Catatan Ustadz</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  }

  // Filter Hafalan Kategori
  window.filterPortalHafalan = function (kat) {
    currentHafalanFilter = kat;
    const btns = document.querySelectorAll('.portal-hfilter-btn');
    btns.forEach(b => b.classList.remove('active'));

    const container = document.getElementById('portalHafalanContainer');
    if (container) {
      container.innerHTML = renderHafalanTableHtml(kat);
    }

    // Perbarui active state pada button
    const targetBtn = Array.from(btns).find(b => {
      if (kat === 'all' && b.textContent.includes('Semua')) return true;
      return b.textContent.includes(kat);
    });
    if (targetBtn) targetBtn.classList.add('active');
  };

  // HTML Biodata Santri
  function renderBiodataHtml(s) {
    const kls = formatKelasSantri(s);
    const jk = s.jenis_kelamin === 'Laki-laki' ? 'Laki-laki (Ikhwan)' : 'Perempuan (Akhwat)';

    return `
      <div class="portal-profile-grid">
        <div class="portal-profile-item">
          <div class="portal-profile-label">Nama Lengkap Santri</div>
          <div class="portal-profile-val">${escapeHtml(s.nama || '-')}</div>
        </div>

        <div class="portal-profile-item">
          <div class="portal-profile-label">Nomor Induk Santri (NIS)</div>
          <div class="portal-profile-val">${escapeHtml(s.nis || '-')}</div>
        </div>

        <div class="portal-profile-item">
          <div class="portal-profile-label">Nomor Induk Kependudukan (NIK)</div>
          <div class="portal-profile-val">${escapeHtml(s.nik || '-')}</div>
        </div>

        <div class="portal-profile-item">
          <div class="portal-profile-label">Jenis Kelamin</div>
          <div class="portal-profile-val">${jk}</div>
        </div>

        <div class="portal-profile-item">
          <div class="portal-profile-label">Kelas / Jenjang</div>
          <div class="portal-profile-val">${escapeHtml(kls)}</div>
        </div>

        <div class="portal-profile-item">
          <div class="portal-profile-label">Status Santri</div>
          <div class="portal-profile-val">
            <span class="portal-badge success">${escapeHtml(s.status_mondok || 'Aktif')}</span>
          </div>
        </div>

        <div class="portal-profile-item">
          <div class="portal-profile-label">Tempat & Tanggal Lahir</div>
          <div class="portal-profile-val">${escapeHtml(s.tempat_lahir || '-')}, ${formatTgl(s.tanggal_lahir)}</div>
        </div>

        <div class="portal-profile-item">
          <div class="portal-profile-label">Usia</div>
          <div class="portal-profile-val">${s.usia ? s.usia + ' Tahun' : '-'}</div>
        </div>

        <div class="portal-profile-item">
          <div class="portal-profile-label">Asal Sekolah</div>
          <div class="portal-profile-val">${escapeHtml(s.sekolah || '-')}</div>
        </div>

        <div class="portal-profile-item">
          <div class="portal-profile-label">Tanggal Masuk Pesantren</div>
          <div class="portal-profile-val">${formatTgl(s.tanggal_masuk)}</div>
        </div>

        <div class="portal-profile-item" style="grid-column: 1 / -1;">
          <div class="portal-profile-label">Alamat Lengkap</div>
          <div class="portal-profile-val">${escapeHtml(s.alamat || '-')}</div>
        </div>
      </div>
    `;
  }

  // ===== TAB SWITCHING =====
  window.switchPortalTab = function (tabId) {
    const tabs = ['spp', 'jajan', 'hafalan', 'biodata'];
    tabs.forEach(t => {
      const btn = document.getElementById('portalTabBtn' + capitalize(t));
      const content = document.getElementById('portalTab' + capitalize(t));
      if (btn) {
        if (t === tabId) btn.classList.add('active');
        else btn.classList.remove('active');
      }
      if (content) {
        if (t === tabId) content.classList.add('active');
        else content.classList.remove('active');
      }
    });
  };

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // ===== MODAL OPEN & CLOSE =====
  window.openPortalModal = function () {
    const modal = document.getElementById('portalSantriModal');
    if (!modal) return;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  window.closePortalModal = function () {
    const modal = document.getElementById('portalSantriModal');
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  // Close modal when clicking on overlay background
  document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('portalSantriModal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closePortalModal();
        }
      });
    }

    // Escape key listener
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.getElementById('portalSantriModal');
        if (modal && modal.classList.contains('active')) {
          closePortalModal();
        }
      }
    });
  });

  // ===== CETAK LEMBAR INFORMASI SANTRI (PRINT VIEW) =====
  window.printPortalStudentInfo = function () {
    if (!currentActiveStudent) {
      alert('Tidak ada data santri yang sedang dibuka.');
      return;
    }

    const s = currentActiveStudent;
    const kls = formatKelasSantri(s);

    // Ringkasan Uang Jajan
    let jajanMasuk = 0, jajanKeluar = 0;
    currentStudentJajan.forEach(p => {
      const n = Number(p.nominal) || 0;
      if (p.jenis_transaksi === 'Pengeluaran') jajanKeluar += n;
      else jajanMasuk += n;
    });
    const sisaJajan = jajanMasuk - jajanKeluar;

    // SPP rows
    let sppRows = '';
    currentStudentSpp.forEach((sp, i) => {
      sppRows += `
        <tr>
          <td style="text-align:center; padding:6px; border:1px solid #ccc;">${i + 1}</td>
          <td style="padding:6px; border:1px solid #ccc;">${sp.bulan} ${sp.tahun}</td>
          <td style="text-align:right; padding:6px; border:1px solid #ccc;">${formatRp(sp.nominal_wajib)}</td>
          <td style="text-align:right; padding:6px; border:1px solid #ccc;">${formatRp(sp.total_bayar)}</td>
          <td style="text-align:center; padding:6px; border:1px solid #ccc;">${sp.status}</td>
        </tr>
      `;
    });

    // Hafalan rows (max 10 terbaru)
    let hafalanRows = '';
    const latestHafalan = (currentStudentHafalan || []).slice(0, 10);
    latestHafalan.forEach((h, i) => {
      let mat = h.surah_juz || h.nama_kitab || h.nama_doa || '-';
      if (h.juz) mat = `Juz ${h.juz} • ${mat}`;
      hafalanRows += `
        <tr>
          <td style="text-align:center; padding:6px; border:1px solid #ccc;">${i + 1}</td>
          <td style="padding:6px; border:1px solid #ccc;">${formatTgl(h.tanggal)}</td>
          <td style="padding:6px; border:1px solid #ccc;">${h.kategori || '-'}</td>
          <td style="padding:6px; border:1px solid #ccc;">${mat}</td>
          <td style="text-align:center; padding:6px; border:1px solid #ccc;">${h.status || '-'}${h.poin ? ' (' + h.poin + ')' : ''}</td>
          <td style="padding:6px; border:1px solid #ccc;">${h.penguji || '-'}</td>
        </tr>
      `;
    });

    const printWin = window.open('', '_blank', 'width=900,height=750');
    if (!printWin) {
      alert('Pop-up jendela cetak terblokir oleh browser. Izinkan pop-up untuk mencetak.');
      return;
    }

    const tglCetak = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Informasi Santri - ${escapeHtml(s.nama)}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #111; margin: 30px; line-height: 1.4; }
          .kop { display: flex; align-items: center; border-bottom: 2px solid #065F46; padding-bottom: 12px; margin-bottom: 18px; }
          .kop img { width: 65px; height: 65px; margin-right: 18px; object-fit: contain; }
          .kop-text h2 { margin: 0 0 4px 0; color: #065F46; font-size: 18px; font-weight: bold; }
          .kop-text p { margin: 0; font-size: 11px; color: #555; }
          .title { text-align: center; font-size: 14px; font-weight: bold; text-transform: uppercase; margin-bottom: 16px; border-bottom: 1px dashed #ccc; padding-bottom: 6px; }
          .info-table { width: 100%; margin-bottom: 16px; font-size: 12px; border-collapse: collapse; }
          .info-table td { padding: 4px 8px; vertical-align: top; }
          .data-table { width: 100%; border-collapse: collapse; margin-bottom: 18px; font-size: 11px; }
          .data-table th { background: #E6F4EA; border: 1px solid #ccc; padding: 6px; font-weight: bold; }
          .sec-header { font-weight: bold; font-size: 13px; color: #065F46; margin: 12px 0 6px 0; border-left: 3px solid #065F46; padding-left: 6px; }
          .footer-sign { display: flex; justify-content: flex-end; margin-top: 30px; }
          .sign-box { text-align: center; width: 200px; }
          .sign-line { border-bottom: 1px solid #333; height: 60px; margin-bottom: 6px; }
          @media print { body { margin: 10mm; } }
        </style>
      </head>
      <body>
        <div class="kop">
          <img src="img/logo.png" onerror="this.style.display='none'">
          <div class="kop-text">
            <h2>PONDOK PESANTREN AL-FATHONAH</h2>
            <p>Lembaga Pendidikan Islam Terpadu Tahfidz & Kepesantrenan</p>
            <p>Portal Informasi Administrasi & Capaian Santri</p>
          </div>
        </div>

        <div class="title">LEMBAR LAPORAN PERKEMBANGAN & ADMINISTRASI SANTRI</div>

        <table class="info-table">
          <tr>
            <td style="width: 15%;"><strong>Nama Santri</strong></td>
            <td style="width: 35%;">: ${escapeHtml(s.nama)}</td>
            <td style="width: 15%;"><strong>Kelas / Jenjang</strong></td>
            <td style="width: 35%;">: ${escapeHtml(kls)}</td>
          </tr>
          <tr>
            <td><strong>NIS</strong></td>
            <td>: ${escapeHtml(s.nis || '-')}</td>
            <td><strong>Status Santri</strong></td>
            <td>: ${escapeHtml(s.status_mondok || 'Aktif')}</td>
          </tr>
          <tr>
            <td><strong>Jenis Kelamin</strong></td>
            <td>: ${escapeHtml(s.jenis_kelamin || '-')}</td>
            <td><strong>Saldo Jajan Aktif</strong></td>
            <td>: <strong style="color: #065F46;">${formatRp(sisaJajan)}</strong></td>
          </tr>
        </table>

        <div class="sec-header">1. STATUS PEMBAYARAN SPP</div>
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 30px;">No</th>
              <th>Periode Bulan</th>
              <th>Nominal SPP</th>
              <th>Terbayar</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${sppRows || '<tr><td colspan="5" style="text-align:center; padding:10px;">Belum ada tagihan SPP</td></tr>'}
          </tbody>
        </table>

        <div class="sec-header">2. RIWAYAT SETORAN HAFALAN (10 TERAKHIR)</div>
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 30px;">No</th>
              <th>Tanggal</th>
              <th>Kategori</th>
              <th>Materi Hafalan</th>
              <th>Status</th>
              <th>Penguji</th>
            </tr>
          </thead>
          <tbody>
            ${hafalanRows || '<tr><td colspan="6" style="text-align:center; padding:10px;">Belum ada riwayat hafalan</td></tr>'}
          </tbody>
        </table>

        <div class="footer-sign">
          <div class="sign-box">
            <div>Dicetak pada: ${tglCetak}</div>
            <div style="font-weight: bold; margin-top: 4px;">Pondok Pesantren Al-Fathonah</div>
            <div class="sign-line"></div>
            <div>Bagian Administrasi & Kesantrian</div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `);
    printWin.document.close();
  };

  // Utility escape HTML
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

})();
