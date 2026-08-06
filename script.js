// ===== HERO IMAGE SLIDER =====
(function() {
  const slides = document.querySelectorAll('.hero-slide');
  if (slides.length === 0) return;
  let currentSlide = 0;
  slides[0].classList.add('active');
  setInterval(() => {
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
  }, 5000);
})();

// ===== NAVBAR SCROLL EFFECT =====
const navbar = document.getElementById('navbar');
const navLinks = document.getElementById('navLinks');
const navHamburger = document.getElementById('navHamburger');
const navOverlay = document.getElementById('navOverlay');
const backToTop = document.getElementById('backToTop');

// ===== OPTIMIZED SCROLL HANDLER (requestAnimationFrame debounce) =====
let ticking = false;

function onScroll() {
  const scrollY = window.scrollY;

  // Sticky navbar
  if (scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  // Back to top button
  if (scrollY > 500) {
    backToTop.classList.add('visible');
  } else {
    backToTop.classList.remove('visible');
  }

  // Scroll Progress Bar
  const scrollProgressBar = document.getElementById('scrollProgressBar');
  if (scrollProgressBar) {
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (scrollY / scrollHeight) * 100;
    scrollProgressBar.style.width = scrolled + '%';
  }

  // Active nav link highlight
  highlightActiveLink();

  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(onScroll);
    ticking = true;
  }
}, { passive: true });

// ===== HAMBURGER MENU =====
navHamburger.addEventListener('click', () => {
  navHamburger.classList.toggle('active');
  navLinks.classList.toggle('open');
  navOverlay.classList.toggle('active');
  document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
});

navOverlay.addEventListener('click', closeMenu);

function closeMenu() {
  navHamburger.classList.remove('active');
  navLinks.classList.remove('open');
  navOverlay.classList.remove('active');
  document.body.style.overflow = '';
  // Close all dropdowns when mobile menu closes
  document.querySelectorAll('.nav-dropdown').forEach(d => d.classList.remove('open'));
}

// Close menu on link click + smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    if (this.classList.contains('nav-dropdown-toggle') || this.getAttribute('href') === '#') return;
    
    e.preventDefault();
    closeMenu(); // Ensure mobile menu is closed before calculating offset

    const targetId = this.getAttribute('href');
    const targetEl = document.querySelector(targetId);
    if (targetEl) {
      // Small timeout to allow DOM to settle after overflow:hidden is removed
      setTimeout(() => {
        const navHeight = 72; // Exact scrolled navbar height
        const targetPos = targetEl.getBoundingClientRect().top + window.pageYOffset - navHeight;
        window.scrollTo({ top: targetPos, behavior: 'smooth' });
      }, 50);
    }
  });
});

// ===== DROPDOWN =====
const navDropdowns = document.querySelectorAll('.nav-dropdown');

navDropdowns.forEach(dropdown => {
  const toggle = dropdown.querySelector('.nav-dropdown-toggle');
  let dropdownTimeout;

  // Desktop hover
  dropdown.addEventListener('mouseenter', () => {
    if (window.innerWidth > 768) {
      clearTimeout(dropdownTimeout);
      dropdown.classList.add('open');
    }
  });

  dropdown.addEventListener('mouseleave', () => {
    if (window.innerWidth > 768) {
      dropdownTimeout = setTimeout(() => {
        dropdown.classList.remove('open');
      }, 200);
    }
  });

  // Mobile click
  if (toggle) {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.innerWidth <= 768) {
        // Close others first (optional accordion behavior)
        navDropdowns.forEach(d => {
          if (d !== dropdown) d.classList.remove('open');
        });
        dropdown.classList.toggle('open');
      }
    });
  }
});

// ===== SCROLL REVEAL ANIMATIONS =====
const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
    }
  });
}, {
  threshold: 0.15,
  rootMargin: '0px 0px -50px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));

// ===== COPY TO CLIPBOARD =====
function copyToClipboard(btn) {
  const text = btn.getAttribute('data-copy');

  navigator.clipboard.writeText(text).then(() => {
    btn.classList.add('copied');
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      Tersalin!
    `;

    setTimeout(() => {
      btn.classList.remove('copied');
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
        Salin
      `;
    }, 2000);
  }).catch(() => {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);

    btn.classList.add('copied');
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      Tersalin!
    `;

    setTimeout(() => {
      btn.classList.remove('copied');
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
        Salin
      `;
    }, 2000);
  });
}

// ===== ACTIVE NAV LINK HIGHLIGHT =====
function highlightActiveLink() {
  const sections = document.querySelectorAll('section[id]');
  const scrollPos = window.scrollY + 120;

  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');

    if (scrollPos >= top && scrollPos < top + height) {
      document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${id}`) {
          link.classList.add('active');
        }
      });
    }
  });
}

// ===== BACK TO TOP =====
backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== INITIAL STATE =====
highlightActiveLink();

// ===== REGISTRATION MODAL =====
const modalOverlay = document.getElementById('modalOverlay');

function openModal() {
  modalOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  // Reset form and show form, hide success
  document.getElementById('registrationForm').style.display = '';
  document.getElementById('modalSuccess').style.display = 'none';
  document.getElementById('registrationForm').reset();
}

function closeModal() {
  modalOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

// Close modal on overlay click
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) {
    closeModal();
  }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
    closeModal();
  }
});

async function submitForm(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  if (btn) { btn.disabled = true; btn.innerHTML = '⏳ Mengirim...'; }

  const record = {
    nama_lengkap: document.getElementById('regNamaLengkap').value.trim(),
    nama_panggilan: document.getElementById('regNamaPanggilan').value.trim(),
    jenis_kelamin: document.getElementById('regJenisKelamin').value,
    tempat_tgl_lahir: document.getElementById('regTempatTglLahir').value.trim(),
    anak_ke: document.getElementById('regAnakKe').value ? parseInt(document.getElementById('regAnakKe').value) : null,
    jml_saudara: document.getElementById('regJmlSaudara').value ? parseInt(document.getElementById('regJmlSaudara').value) : null,
    nama_ayah: document.getElementById('regNamaAyah').value.trim(),
    nama_ibu: document.getElementById('regNamaIbu').value.trim(),
    pekerjaan_ayah: document.getElementById('regPekerjaanAyah').value.trim(),
    pekerjaan_ibu: document.getElementById('regPekerjaanIbu').value.trim(),
    alamat_jalan: document.getElementById('regJalan').value.trim(),
    alamat_desa: document.getElementById('regDesa').value.trim(),
    alamat_kecamatan: document.getElementById('regKecamatan').value.trim(),
    alamat_kab_provinsi: document.getElementById('regKabProvinsi').value.trim(),
    no_telp: document.getElementById('regNoTelp').value.trim(),
    nama_sekolah: document.getElementById('regNamaSekolah').value.trim(),
    kelas_sekolah: document.getElementById('regKelasSekolah').value.trim(),
    alamat_sekolah: document.getElementById('regAlamatSekolah').value.trim(),
  };

  try {
    const sb = getSupabase();
    if (sb) {
      const { error } = await sb.from('pendaftaran_santri').insert([record]);
      if (error) console.error('Supabase insert error:', error);
    }
  } catch (err) {
    console.error('Submit error:', err);
  }

  // Show success
  document.getElementById('registrationForm').style.display = 'none';
  document.getElementById('modalSuccess').style.display = 'block';
}

// ===== SUPABASE INIT (SAFE) =====
const SUPABASE_URL = 'https://rnjqwgwazqlmhmxedhef.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuanF3Z3dhenFsbWhteGVkaGVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5MDQ5MzUsImV4cCI6MjEwMTQ4MDkzNX0.Lg-9PAdE4JbmnbIJUrwkPSaeTwATZpcoQrFWzgkfhME';
let _supabaseClient = null;
function getSupabase() {
  if (!_supabaseClient && window.supabase && window.supabase.createClient) {
    _supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _supabaseClient;
}

// ===== LOGIN MODAL =====
const loginModalOverlay = document.getElementById('loginModalOverlay');
if (!loginModalOverlay) console.warn('loginModalOverlay not found');

function openLoginModal(e) {
  if (e) e.preventDefault();
  if (typeof closeMenu === 'function') closeMenu(); // Close sidebar if it's open
  if (!loginModalOverlay) return;
  loginModalOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  const form = document.getElementById('loginForm');
  if (form) form.reset();
  const errEl = document.getElementById('loginError');
  if (errEl) errEl.style.display = 'none';
}

function closeLoginModal() {
  if (!loginModalOverlay) return;
  loginModalOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

// Close modal on overlay click
if (loginModalOverlay) {
  loginModalOverlay.addEventListener('click', (e) => {
    if (e.target === loginModalOverlay) {
      closeLoginModal();
    }
  });
}

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && loginModalOverlay && loginModalOverlay.classList.contains('active')) {
    closeLoginModal();
  }
});

// ===== HELPER: Show Spinner on Button =====
function showBtnLoading(btn) {
  btn.dataset.originalHtml = btn.innerHTML;
  btn.disabled = true;
  // Create a spin keyframe if it doesn't exist
  if (!document.getElementById('spinStyle')) {
    const style = document.createElement('style');
    style.id = 'spinStyle';
    style.innerHTML = `@keyframes spin { 100% { transform: rotate(360deg); } } .spin { animation: spin 1s linear infinite; }`;
    document.head.appendChild(style);
  }
  btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spin"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> Memproses...`;
}

function resetBtn(btn) {
  btn.disabled = false;
  btn.innerHTML = btn.dataset.originalHtml;
}

// ===== AUTH TABS (LOGIN / REGISTER) =====
function switchAuthTab(tab) {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const forgotForm = document.getElementById('forgotPasswordForm');
  const title = document.getElementById('authModalTitle');
  const subtitle = document.getElementById('authModalSubtitle');

  const errEl = document.getElementById('loginError');
  if (errEl) errEl.style.display = 'none'; // clear errors on switch

  if (tab === 'login') {
    loginForm.style.display = '';
    registerForm.style.display = 'none';
    if (forgotForm) forgotForm.style.display = 'none';
    title.textContent = 'Login Dashboard';
    subtitle.textContent = 'Silakan masuk menggunakan akun Anda';
  } else if (tab === 'register') {
    loginForm.style.display = 'none';
    registerForm.style.display = '';
    if (forgotForm) forgotForm.style.display = 'none';
    title.textContent = 'Daftar Akun Baru';
    subtitle.textContent = 'Buat akun untuk mengakses dashboard';
  } else if (tab === 'forgot') {
    loginForm.style.display = 'none';
    registerForm.style.display = 'none';
    if (forgotForm) forgotForm.style.display = '';
    title.textContent = 'Lupa Password';
    subtitle.textContent = 'Masukkan email untuk mengatur ulang password';
  }
}

// ===== CUSTOM TOAST NOTIFICATION =====
function showToast(message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.style.cssText = 'position: fixed; top: 24px; right: 24px; z-index: 9999; display: flex; flex-direction: column; gap: 12px; pointer-events: none;';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const bgColors = { success: '#DEF7EC', error: '#FDE8E8', info: '#E1EFFE', warning: '#FDF6B2' };
  const textColors = { success: '#03543F', error: '#9B1C1C', info: '#1E429F', warning: '#723B13' };
  const borderColors = { success: '#31C48D', error: '#F98080', info: '#76A9FA', warning: '#E3A008' };
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };

  toast.style.cssText = `
    background: ${bgColors[type] || bgColors.info};
    color: ${textColors[type] || textColors.info};
    border-left: 4px solid ${borderColors[type] || borderColors.info};
    padding: 16px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    font-size: 0.95rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 12px;
    transform: translateX(120%);
    opacity: 0;
    transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    pointer-events: auto;
  `;
  
  toast.innerHTML = `<span style="font-size:1.2rem;">${icons[type] || icons.info}</span> <span>${message}</span>`;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.transform = 'translateX(0)';
    toast.style.opacity = '1';
  });

  setTimeout(() => {
    toast.style.transform = 'translateX(120%)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// ===== SHOW ERROR =====
function showLoginError(message, parentFormId = 'loginForm') {
  let errEl = document.getElementById('loginError');
  if (!errEl) {
    errEl = document.createElement('div');
    errEl.id = 'loginError';
    errEl.style.cssText = 'background:#FEF2F2; color:#DC2626; padding:10px 14px; border-radius:8px; font-size:0.85rem; margin-bottom:16px; border:1px solid #FECACA; display:none; align-items:center; gap:8px; width:100%; box-sizing:border-box;';
  }
  const targetForm = document.getElementById(parentFormId);
  if (targetForm) {
    const btnSubmit = targetForm.querySelector('.btn-submit');
    if (btnSubmit) {
      targetForm.insertBefore(errEl, btnSubmit);
    } else {
      targetForm.insertBefore(errEl, targetForm.firstChild);
    }
  }
  errEl.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> <span>${message}</span>`;
  errEl.style.display = 'flex';
}

function forgotPassword(e) {
  if (e) e.preventDefault();
  switchAuthTab('forgot');
}

async function submitForgotPassword(e) {
  e.preventDefault();
  const emailInput = document.getElementById('forgotEmail');
  const email = emailInput ? emailInput.value.trim() : '';
  
  if (!email) {
    showToast("Silakan masukkan email Anda.", "warning");
    return;
  }
  
  const btn = e.target.querySelector('button[type="submit"]');
  showBtnLoading(btn);
  
  const sb = getSupabase();
  const { data, error } = await sb.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '/reset-password.html' // Opsional, sesuaikan dengan URL halaman reset jika ada
  });
  
  resetBtn(btn);
  
  if (error) {
    showToast("Terjadi kesalahan: " + error.message, "error");
  } else {
    showToast("Berhasil! Tautan pemulihan password telah dikirim ke email " + email + ".", "success");
    if (emailInput) emailInput.value = '';
    switchAuthTab('login');
  }
}

// ===== TOGGLE PASSWORD VISIBILITY =====
function togglePasswordVisibility(inputId, iconSpan) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    iconSpan.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>`;
  } else {
    input.type = 'password';
    iconSpan.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>`;
  }
}

// ===== SHOW SUCCESS =====
function showLoginSuccess(message, parentFormId) {
  let errEl = document.getElementById('loginError');
  if (!errEl) {
    errEl = document.createElement('div');
    errEl.id = 'loginError';
  }
  errEl.style.cssText = 'background:#D1FAE5; color:#065F46; padding:10px 14px; border-radius:8px; font-size:0.85rem; margin-bottom:12px; border:1px solid #A7F3D0; display:block;';
  const form = document.getElementById(parentFormId);
  form.insertBefore(errEl, form.firstChild);
  errEl.textContent = message;
}

// ===== LOGIN WITH EMAIL & PASSWORD =====
async function submitLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;
  const btn = e.target.querySelector('button[type="submit"]');
  
  showBtnLoading(btn);

  const sb = getSupabase();
  if (!sb) {
    showLoginError('Sistem login belum siap. Silakan refresh halaman.', 'loginForm');
    resetBtn(btn);
    return;
  }

  try {
    const { data, error } = await sb.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      showLoginError(error.message === 'Invalid login credentials' 
        ? 'Email atau password salah. Silakan coba lagi.' 
        : error.message, 'loginForm');
      resetBtn(btn);
      return;
    }

    // Login sukses -> cek data profil aktif? (bisa dicek di dashboard.js)
    window.location.href = 'dashboard.html';

  } catch (err) {
    showLoginError('Terjadi kesalahan koneksi. Periksa internet Anda.', 'loginForm');
    resetBtn(btn);
  }
}

// ===== REGISTER NEW ACCOUNT =====
async function submitRegister(e) {
  e.preventDefault();
  const nama = document.getElementById('registerNama').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;
  const btn = e.target.querySelector('button[type="submit"]');
  
  showBtnLoading(btn);

  const sb = getSupabase();
  if (!sb) {
    showLoginError('Sistem registrasi belum siap. Silakan refresh halaman.', 'registerForm');
    resetBtn(btn);
    return;
  }

  try {
    const { data, error } = await sb.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: nama
        }
      }
    });

    if (error) {
      showLoginError(error.message, 'registerForm');
      resetBtn(btn);
      return;
    }

    // Sukses: Bersihkan form & Tampilkan sukses
    document.getElementById('registerForm').reset();
    showLoginSuccess('Pendaftaran berhasil! Akun Anda sedang menunggu verifikasi admin. Silakan coba login nanti.', 'registerForm');
    resetBtn(btn);

  } catch (err) {
    showLoginError('Terjadi kesalahan koneksi. Periksa internet Anda.', 'registerForm');
    resetBtn(btn);
  }
}

// ===== LOGIN WITH GOOGLE =====
async function loginWithGoogle() {
  const sb = getSupabase();
  if (!sb) {
    showLoginError('Sistem login belum siap. Silakan refresh halaman.');
    return;
  }

  try {
    const { data, error } = await sb.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/dashboard.html'
      }
    });

    if (error) {
      showLoginError('Gagal membuka halaman login Google: ' + error.message);
    }
  } catch (err) {
    showLoginError('Terjadi kesalahan koneksi. Periksa internet Anda.');
  }
}

// ===== CHECK IF ALREADY LOGGED IN =====
async function checkExistingSession() {
  try {
    const sb = getSupabase();
    if (!sb) return;
    const { data: { session } } = await sb.auth.getSession();
    // If user is already logged in, optionally do something
  } catch (err) {
    // silently ignore
  }
}

// Wait a moment for CDN to load, then check session
setTimeout(() => {
  checkExistingSession();
  loadLandingBerita();
}, 500);

// ===== LOAD BERITA LANDING PAGE =====
let globalBeritaData = []; // Store data for modal

async function loadLandingBerita() {
  const container = document.getElementById('beritaContainer');
  if (!container) return; // not on landing page

  const sb = getSupabase();
  if(!sb) {
    setTimeout(loadLandingBerita, 500);
    return;
  }

  try {
    const { data, error } = await sb.from('berita')
      .select('*')
      .order('tanggal', { ascending: false })
      .limit(8);

    if (error) throw error;

    if (!data || data.length === 0) {
      container.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--gray-500); padding: 40px;">Belum ada berita terbaru saat ini.</div>`;
      return;
    }

    globalBeritaData = data; // Save for modal reference

    container.innerHTML = data.map((d, i) => {
      const delay = (i % 4) + 1; // 1 to 4 delay cycle
      
      const dateObj = new Date(d.tanggal);
      const day = dateObj.getDate();
      const month = dateObj.toLocaleDateString('id-ID', { month: 'short' });

      // Cek apakah ada logo gambar asli
      let imgStyle = '';
      let iconHtml = `<div class="berita-card-image-icon">${d.icon_emoji || '📰'}</div>`;
      
      if (d.image_url) {
        imgStyle = `background: url('${d.image_url}') center/cover no-repeat;`;
        iconHtml = ''; // Sembunyikan ikon emoji jika gambar asli ada
      } else {
        imgStyle = `background: ${d.bg_gradient || 'linear-gradient(135deg, #064E3B, #10B981)'};`;
      }

      return `
        <div class="berita-card reveal delay-${delay}" onclick="openBeritaModal('${d.id}')" style="cursor: pointer;">
          <div class="berita-card-image" style="${imgStyle}">
            ${iconHtml}
            <div class="berita-card-date"><span class="day">${day}</span><span class="month">${month}</span></div>
          </div>
          <div class="berita-card-body">
            <div class="berita-card-tag">${d.kategori}</div>
            <h4>${d.judul}</h4>
          </div>
        </div>
      `;
    }).join('');

    // Trigger reveal animation observer for new elements
    const revealEls = container.querySelectorAll('.reveal');
    if (typeof revealObserver !== 'undefined') {
      revealEls.forEach(el => revealObserver.observe(el));
    }

  } catch (err) {
    console.error('Gagal meload berita:', err);
    container.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: #EF4444; padding: 40px;">Gagal memuat berita terbaru.</div>`;
  }
}

// ===== BERITA MODAL LOGIC =====
const beritaModalOverlay = document.getElementById('beritaModalOverlay');

function openBeritaModal(id) {
  const berita = globalBeritaData.find(b => b.id === id);
  if (!berita) return;

  const dateObj = new Date(berita.tanggal);
  const dateStr = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  document.getElementById('beritaModalKategori').textContent = berita.kategori || 'Kegiatan';
  document.getElementById('beritaModalTanggal').textContent = dateStr;
  document.getElementById('beritaModalJudul').textContent = berita.judul;
  
  // Gunakan field 'konten' jika ada, jika tidak fallback ke 'deskripsi'
  const kontenHtml = berita.konten ? berita.konten.replace(/\n/g, '<br>') : (berita.deskripsi || 'Tidak ada detail lebih lanjut.');
  document.getElementById('beritaModalKonten').innerHTML = kontenHtml;

  const imgContainer = document.getElementById('beritaModalImage');
  if (berita.image_url) {
    imgContainer.style.background = `url('${berita.image_url}') center/cover no-repeat`;
    imgContainer.innerHTML = '';
  } else {
    imgContainer.style.background = berita.bg_gradient || 'linear-gradient(135deg, #064E3B, #10B981)';
    imgContainer.innerHTML = `<div style="font-size: 5rem; opacity: 0.6; color: white;">${berita.icon_emoji || '📰'}</div>`;
  }

  beritaModalOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeBeritaModal() {
  if (beritaModalOverlay) {
    beritaModalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

if (beritaModalOverlay) {
  beritaModalOverlay.addEventListener('click', (e) => {
    if (e.target === beritaModalOverlay) closeBeritaModal();
  });
}

// ===== PRELOADER =====
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    preloader.style.opacity = '0';
    setTimeout(() => {
      preloader.style.display = 'none';
    }, 500);
  }
});

// ===== FAQ ACCORDION =====
document.querySelectorAll('.faq-question').forEach(button => {
  button.addEventListener('click', () => {
    const faqItem = button.parentElement;
    const isActive = faqItem.classList.contains('active');
    
    // Close all other FAQs
    document.querySelectorAll('.faq-item').forEach(item => {
      item.classList.remove('active');
      const answer = item.querySelector('.faq-answer');
      if(answer) answer.style.maxHeight = null;
    });

    // Toggle current FAQ
    if (!isActive) {
      faqItem.classList.add('active');
      const answer = faqItem.querySelector('.faq-answer');
      if(answer) answer.style.maxHeight = answer.scrollHeight + "px";
    }
  });
});

// ===== KELUARGA BESAR YAYASAN (FAMILY TREE) =====
async function loadFamilyTree() {
  const container = document.getElementById('familyTreeContainer');
  if (!container) return;

  try {
    const sb = getSupabase();
    if (!sb) {
      container.innerHTML = '<p style="color:red;text-align:center;">Supabase client tidak ditemukan.</p>';
      return;
    }

    const { data, error } = await sb
      .from('keluarga_yayasan')
      .select('*')
      .order('urutan', { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      // Data dummy fallback sementara jika tabel masih kosong
      const dummyData = [
        { id: '1', nama: 'Dr. Ir. H. Muhammad Salman, ST., MIT.', kategori: 'Pendiri Suami', parent_id: null, foto_url: 'img/ketua-yayasan.jpeg' },
        { id: '2', nama: 'Istri Pendiri', kategori: 'Pendiri Istri', parent_id: null, foto_url: 'https://ui-avatars.com/api/?name=Istri+Pendiri&background=10B981&color=fff' }
      ];
      renderFamilyTreeUI(dummyData, container);
    } else {
      renderFamilyTreeUI(data, container);
    }
  } catch (error) {
    console.warn('Tabel keluarga_yayasan mungkin belum ada atau error:', error);
    // Render dummy data if table doesn't exist yet
    const dummyData = [
      { id: '1', nama: 'Dr. Ir. H. Muhammad Salman, ST., MIT.', kategori: 'Pendiri Suami', parent_id: null, foto_url: 'img/ketua-yayasan.jpeg' },
      { id: '2', nama: 'Istri Pendiri', kategori: 'Pendiri Istri', parent_id: null, foto_url: 'https://ui-avatars.com/api/?name=Istri+Pendiri&background=10B981&color=fff' }
    ];
    renderFamilyTreeUI(dummyData, container);
  }
}

function renderFamilyTreeUI(data, container) {
  // Susun data hierarkis
  // 1. Ambil pendiri utama (Suami & Istri)
  const pendiri = data.filter(d => d.kategori.includes('Pendiri'));
  const anak = data.filter(d => d.kategori === 'Anak');
  const cucu = data.filter(d => d.kategori === 'Cucu');

  if(pendiri.length === 0) {
    container.innerHTML = '<p>Data pendiri belum ditambahkan.</p>';
    return;
  }

  let html = '';

  // Render Level 1 (Pendiri)
  html += '<div class="tree-level level-1">';
  pendiri.forEach(p => {
    html += `
      <div class="tree-node-container">
        <div class="tree-node">
          <div class="tree-avatar-frame">
            <img src="${p.foto_url || 'https://ui-avatars.com/api/?name=' + p.nama.replace(/ /g, '+') + '&background=10B981&color=fff'}" class="tree-avatar" alt="${p.nama}">
          </div>
          <div class="tree-name">${p.nama}</div>
          <div class="tree-status">${p.kategori}</div>
        </div>
      </div>
    `;
  });
  html += '</div>';

  // Render Level 2 (Anak)
  if (anak.length > 0) {
    html += '<div class="tree-level level-2">';
    anak.forEach(a => {
      // Cari cucu dari anak ini
      const cucuAnakIni = cucu.filter(c => c.parent_id === a.id);
      
      html += '<div class="tree-node-container">';
      html += `
        <div class="tree-node">
          <div class="tree-avatar-frame">
            <img src="${a.foto_url || 'https://ui-avatars.com/api/?name=' + a.nama.replace(/ /g, '+') + '&background=F59E0B&color=fff'}" class="tree-avatar" alt="${a.nama}">
          </div>
          <div class="tree-name">${a.nama}</div>
          <div class="tree-status">Anak</div>
        </div>
      `;

      // Render Level 3 (Cucu) jika ada di bawah anak ini
      if (cucuAnakIni.length > 0) {
        html += '<div class="tree-level level-3">';
        cucuAnakIni.forEach(c => {
          html += `
            <div class="tree-node-container">
              <div class="tree-node">
                <div class="tree-avatar-frame" style="width:60px; height:60px;">
                  <img src="${c.foto_url || 'https://ui-avatars.com/api/?name=' + c.nama.replace(/ /g, '+') + '&background=3B82F6&color=fff'}" class="tree-avatar" alt="${c.nama}">
                </div>
                <div class="tree-name" style="font-size:0.8rem;">${c.nama}</div>
                <div class="tree-status" style="font-size:0.7rem;">Cucu</div>
              </div>
            </div>
          `;
        });
        html += '</div>';
      }
      
      html += '</div>'; // close anak container
    });
    html += '</div>';
  }

  container.innerHTML = html;
}

// Fetch saat DOM siap
document.addEventListener('DOMContentLoaded', () => {
  if (typeof fetchBerita === 'function') {
    fetchBerita();
  }
  if (typeof loadFamilyTree === 'function') {
    loadFamilyTree();
  }

  // ===== TESTIMONI CAROUSEL =====
  const carousel = document.getElementById('testimoniCarousel');
  const indicatorsContainer = document.getElementById('carouselIndicators');
  if (carousel && indicatorsContainer) {
    const cards = carousel.querySelectorAll('.testimoni-card');
    const totalCards = cards.length;
    let currentIndex = 0;
    
    // Create dots
    for (let i = 0; i < totalCards; i++) {
      const dot = document.createElement('div');
      dot.classList.add('carousel-dot');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => {
        goToSlide(i);
      });
      indicatorsContainer.appendChild(dot);
    }
    
    const dots = indicatorsContainer.querySelectorAll('.carousel-dot');
    
    function goToSlide(index) {
      currentIndex = index;
      const offset = -currentIndex * 100;
      carousel.style.transform = `translateX(${offset}%)`;
      
      dots.forEach(d => d.classList.remove('active'));
      dots[currentIndex].classList.add('active');
    }
    
    function nextSlide() {
      currentIndex = (currentIndex + 1) % totalCards;
      goToSlide(currentIndex);
    }
    
    // Auto slide every 5 seconds
    let slideInterval = setInterval(nextSlide, 5000);
    
    // Pause on hover
    carousel.addEventListener('mouseenter', () => clearInterval(slideInterval));
    carousel.addEventListener('mouseleave', () => {
      slideInterval = setInterval(nextSlide, 5000);
    });
  }
});


// ===== CAROUSEL & FAQ INITIALIZATION =====
function initializeCarousel() {
  const carousel = document.getElementById('web_testimoni_track');
  const indicatorsContainer = document.querySelector('.carousel-indicators');
  
  if (carousel && indicatorsContainer) {
    indicatorsContainer.innerHTML = ''; // clear old dots
    const cards = carousel.querySelectorAll('.testimoni-card');
    const totalCards = cards.length;
    let currentIndex = 0;
    
    // Create dots
    for (let i = 0; i < totalCards; i++) {
      const dot = document.createElement('div');
      dot.classList.add('carousel-dot');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goToSlide(i));
      indicatorsContainer.appendChild(dot);
    }
    
    const dots = indicatorsContainer.querySelectorAll('.carousel-dot');
    
    function goToSlide(index) {
      currentIndex = index;
      const offset = -currentIndex * 100;
      carousel.style.transform = `translateX(${offset}%)`;
      
      dots.forEach(d => d.classList.remove('active'));
      dots[currentIndex].classList.add('active');
    }
    
    function nextSlide() {
      currentIndex = (currentIndex + 1) % totalCards;
      goToSlide(currentIndex);
    }
    
    // Auto slide every 5 seconds
    if(window.testimonialInterval) clearInterval(window.testimonialInterval);
    window.testimonialInterval = setInterval(nextSlide, 5000);
    
    // Pause on hover
    carousel.addEventListener('mouseenter', () => clearInterval(window.testimonialInterval));
    carousel.addEventListener('mouseleave', () => {
      window.testimonialInterval = setInterval(nextSlide, 5000);
    });
  }
}

function initializeFaq() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    // Remove old listeners to avoid duplicates
    const clone = item.cloneNode(true);
    item.parentNode.replaceChild(clone, item);
  });
  
  // Bind new listeners
  document.querySelectorAll('.faq-item').forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      // Tutup semua dulu
      document.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('active');
        i.querySelector('.faq-answer').style.maxHeight = '0';
      });
      // Buka yang di-klik jika sebelumnya tidak aktif
      if (!isActive) {
        item.classList.add('active');
        const answer = item.querySelector('.faq-answer');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}
