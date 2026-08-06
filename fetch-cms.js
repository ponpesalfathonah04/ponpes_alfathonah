
// Konversi URL Google Drive ke format yang bisa ditampilkan langsung
function convertGDriveUrl(url) {
  if (!url) return url;
  let match = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match) return 'https://lh3.googleusercontent.com/d/' + match[1];
  match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return 'https://lh3.googleusercontent.com/d/' + match[1];
  return url;
}

// ===== FETCH WEB CMS DATA =====
document.addEventListener('DOMContentLoaded', () => {
  const isLandingPage = document.getElementById('tentang') !== null;
  if(isLandingPage) {
    loadLandingPageCMS();
  }
});

async function loadLandingPageCMS() {
  const sb = getSupabase();
  if (!sb) return;

  try {
    // 1. Settings (Profil, Visi Misi, Pengaturan Umum)
    const { data: settings, error: errSettings } = await sb.from('web_settings').select('*').eq('id', 1).single();
    if (settings) {
      // Profil & Sambutan
      if(document.getElementById('web_ketua_foto') && settings.ketua_foto) {
        document.getElementById('web_ketua_foto').src = convertGDriveUrl(settings.ketua_foto);
      }
      if(document.getElementById('web_ketua_nama')) document.getElementById('web_ketua_nama').innerText = settings.ketua_nama;
      if(document.getElementById('web_ketua_jabatan')) document.getElementById('web_ketua_jabatan').innerText = settings.ketua_jabatan;
      if(document.getElementById('web_ketua_sambutan')) document.getElementById('web_ketua_sambutan').innerText = settings.ketua_sambutan;
      
      if(document.getElementById('web_pengasuh_foto') && settings.pengasuh_foto) {
        document.getElementById('web_pengasuh_foto').src = convertGDriveUrl(settings.pengasuh_foto);
      }
      if(document.getElementById('web_pengasuh_nama')) document.getElementById('web_pengasuh_nama').innerText = settings.pengasuh_nama;
      if(document.getElementById('web_pengasuh_jabatan')) document.getElementById('web_pengasuh_jabatan').innerText = settings.pengasuh_jabatan;
      if(document.getElementById('web_pengasuh_sambutan')) document.getElementById('web_pengasuh_sambutan').innerText = settings.pengasuh_sambutan;
      
      if(document.getElementById('web_tentang_teks')) document.getElementById('web_tentang_teks').innerHTML = settings.tentang_teks.replace(/\n/g, '<br>');
      
      // Visi Misi
      if(document.getElementById('web_visi_teks')) document.getElementById('web_visi_teks').innerText = settings.visi_teks;
      if(document.getElementById('web_misi_list') && Array.isArray(settings.misi_teks)) {
        let misiHtml = '';
        settings.misi_teks.forEach((misi, index) => {
          misiHtml += `<div class="misi-item"><span class="misi-item-num">${index + 1}</span><span>${misi}</span></div>`;
        });
        document.getElementById('web_misi_list').innerHTML = misiHtml;
      }
      
      // Pengaturan Umum - PSB Status
      const isPsbBuka = settings.psb_status === 'buka';
      const psbTahun = settings.psb_tahun || '';

      // Dashboard element (jika ada)
      const psbStatusEl = document.getElementById('web_psb_status');
      if(psbStatusEl) {
        if(isPsbBuka) {
          psbStatusEl.innerText = 'Pendaftaran Dibuka';
          psbStatusEl.classList.remove('status-closed');
          psbStatusEl.classList.add('pulse');
        } else {
          psbStatusEl.innerText = 'Pendaftaran Ditutup';
          psbStatusEl.classList.add('status-closed');
          psbStatusEl.classList.remove('pulse');
        }
      }

      // Hero Badge PSB
      const heroBadge = document.getElementById('web_hero_psb_badge');
      if(heroBadge) {
        if(isPsbBuka) {
          heroBadge.style.display = 'inline-flex';
          heroBadge.innerHTML = `<span class="dot"></span> Penerimaan Santri Baru ${psbTahun}`;
        } else {
          heroBadge.style.display = 'none';
        }
      }

      // Hero "Daftar Sekarang" button
      const heroBtnDaftar = document.getElementById('heroBtnDaftar');
      if(heroBtnDaftar) {
        if(!isPsbBuka) {
          heroBtnDaftar.style.opacity = '0.5';
          heroBtnDaftar.style.pointerEvents = 'none';
          heroBtnDaftar.style.background = '#9ca3af';
          heroBtnDaftar.style.borderColor = '#9ca3af';
        }
      }

      // PSB Section "Daftar Sekarang" button
      const btnOpenModal = document.getElementById('btnOpenModal');
      if(btnOpenModal) {
        if(!isPsbBuka) {
          btnOpenModal.disabled = true;
          btnOpenModal.style.opacity = '0.5';
          btnOpenModal.style.pointerEvents = 'none';
          btnOpenModal.style.background = '#9ca3af';
          btnOpenModal.style.borderColor = '#9ca3af';
          btnOpenModal.style.cursor = 'not-allowed';
          btnOpenModal.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Pendaftaran Ditutup`;
        }
      }

      // PSB Section subtitle text
      const psbSubtitle = document.getElementById('web_psb_tahun');
      if(psbSubtitle) {
        psbSubtitle.innerText = psbTahun;
        const subtitleParent = psbSubtitle.closest('.section-subtitle');
        if(subtitleParent && !isPsbBuka) {
          subtitleParent.innerHTML = `Pendaftaran Tahun Ajaran <span id="web_psb_tahun">${psbTahun}</span> saat ini <strong style="color: #EF4444;">ditutup</strong>. Silakan pantau informasi terbaru dari kami.`;
        }
      }
      
      if(document.getElementById('web_sedekah_bank')) {
        const bankName = settings.sedekah_bank;
        document.getElementById('web_sedekah_bank').innerText = bankName;
        
        const logoEl = document.getElementById('web_sedekah_logo');
        if(logoEl) {
          let logoSrc = '';
          const b = bankName.toLowerCase();
          if(b.includes('bsi') || b.includes('syariah')) logoSrc = 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Bank_Syariah_Indonesia.svg';
          else if(b.includes('bri')) logoSrc = 'https://upload.wikimedia.org/wikipedia/commons/2/2e/BRI_2020.svg';
          else if(b.includes('bca')) logoSrc = 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg';
          else if(b.includes('mandiri')) logoSrc = 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Bank_Mandiri_Logo_2016.svg';
          else if(b.includes('bni')) logoSrc = 'https://upload.wikimedia.org/wikipedia/id/5/55/BNI_logo.svg';
          else if(b.includes('muamalat')) logoSrc = 'https://upload.wikimedia.org/wikipedia/commons/4/41/Bank_Muamalat_logo.svg';
          
          if(logoSrc) {
            logoEl.src = logoSrc;
            logoEl.style.display = 'block';
            const defaultSvg = document.getElementById('web_sedekah_default_svg');
            if(defaultSvg) defaultSvg.style.display = 'none';
          }
        }
      }
      if(document.getElementById('web_sedekah_rek')) document.getElementById('web_sedekah_rek').innerText = settings.sedekah_rek;
      if(document.getElementById('web_sedekah_nama')) document.getElementById('web_sedekah_nama').innerText = 'A.N. ' + settings.sedekah_nama;
      
      // Sosial Media 
      if(document.getElementById('web_sosmed_facebook') && settings.sosmed_facebook) {
        document.getElementById('web_sosmed_facebook').href = settings.sosmed_facebook;
      }
      if(document.getElementById('web_sosmed_instagram') && settings.sosmed_instagram) {
        document.getElementById('web_sosmed_instagram').href = settings.sosmed_instagram;
      }
      if(document.getElementById('web_sosmed_youtube') && settings.sosmed_youtube) {
        document.getElementById('web_sosmed_youtube').href = settings.sosmed_youtube;
      }
    }

    // 2. Sarana & Prasarana
    if(document.getElementById('web_sarana_grid')) {
      const { data: sarana } = await sb.from('web_sarana').select('*').order('urutan');
      if(sarana && sarana.length > 0) {
        let html = '';
        sarana.forEach((s) => {
          html += `
          <div class="fasilitas-card revealed">
            <div class="fasilitas-card-image">
              <img src="${convertGDriveUrl(s.foto)}" alt="${s.judul}" class="facility-visual" onerror="this.src='img/placeholder.jpg'">
              <div class="overlay"></div>
              ${s.tag ? `<div class="tag"><i data-lucide="check-circle" style="width:14px;height:14px;display:inline-block;vertical-align:middle;margin-right:4px;"></i> ${s.tag}</div>` : ''}
            </div>
            <div class="fasilitas-card-body">
              <h4>${s.judul}</h4>
              <p>${s.deskripsi || ''}</p>
            </div>
          </div>`;
        });
        document.getElementById('web_sarana_grid').innerHTML = html;
        if(typeof lucide !== 'undefined' && lucide.createIcons) {
          setTimeout(() => lucide.createIcons(), 100);
        }
      }
    }

    // 3. Kegiatan Tambahan (Ekstra)
    if(document.getElementById('web_ekstra_grid')) {
      const { data: ekstra } = await sb.from('web_kegiatan_tambahan').select('*').order('urutan');
      if(ekstra && ekstra.length > 0) {
        let html = '';
        ekstra.forEach((e) => {
          html += `
          <div class="kegiatan-card revealed">
            <div class="kegiatan-img-wrapper">
              <img src="${convertGDriveUrl(e.foto)}" alt="${e.judul}" onerror="this.src='img/placeholder.jpg'">
            </div>
            <h4>${e.judul}</h4>
            <p>${e.deskripsi || ''}</p>
          </div>`;
        });
        document.getElementById('web_ekstra_grid').innerHTML = html;
      }
    }

    // 4. Galeri Kegiatan
    if(document.getElementById('web_galeri_grid')) {
      const { data: galeri } = await sb.from('web_galeri').select('*').order('urutan');
      if(galeri && galeri.length > 0) {
        let html = '';
        galeri.forEach((g) => {
          html += `
          <div class="galeri-item revealed">
            <img src="${convertGDriveUrl(g.foto)}" alt="${g.judul || 'Galeri'}" loading="lazy" onerror="this.src='img/placeholder.jpg'">
            <div class="galeri-overlay">
              <span>${g.judul || 'Dokumentasi Kegiatan'}</span>
            </div>
          </div>`;
        });
        document.getElementById('web_galeri_grid').innerHTML = html;
      }
    }

    // 5. Testimoni
    if(document.getElementById('web_testimoni_track')) {
      const { data: testimoni } = await sb.from('web_testimoni').select('*').order('urutan');
      if(testimoni && testimoni.length > 0) {
        let html = '';
        testimoni.forEach(t => {
          html += `
          <div class="testimoni-card">
            <div class="testimoni-quote">"${t.kutipan}"</div>
            <div class="testimoni-author">
              <div class="author-info">
                <h4>${t.nama}</h4>
                <p>${t.peran || 'Wali Santri'}</p>
              </div>
            </div>
          </div>`;
        });
        document.getElementById('web_testimoni_track').innerHTML = html;
        setTimeout(() => { if(typeof initializeCarousel === 'function') initializeCarousel(); }, 100);
      }
    }

    // 6. FAQ
    if(document.getElementById('web_faq_list')) {
      const { data: faq } = await sb.from('web_faq').select('*').order('urutan');
      if(faq && faq.length > 0) {
        let html = '';
        faq.forEach((f) => {
          html += `
          <div class="faq-item">
            <div class="faq-question">
              <h3>${f.pertanyaan}</h3>
              <div class="faq-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </div>
            </div>
            <div class="faq-answer" style="max-height: 0;">
              <p>${f.jawaban}</p>
            </div>
          </div>`;
        });
        document.getElementById('web_faq_list').innerHTML = html;
        // Re-initialize FAQ toggle
        setTimeout(() => initializeFaq(), 100);
      }
    }
    // 9. Fetch Hero Slider Images
    try {
      const { data: heroData, error: heroErr } = await sb.from('web_hero_images').select('*').order('urutan', { ascending: true });
      if(!heroErr && heroData && heroData.length > 0) {
        const sliderContainer = document.getElementById('heroSlider');
        if(sliderContainer) {
          // Remove existing slides if any (keeping the overlay)
          const slides = sliderContainer.querySelectorAll('.hero-slide');
          slides.forEach(s => s.remove());
          
          let html = '';
          heroData.forEach((img, idx) => {
            const activeClass = idx === 0 ? 'active' : '';
            // Convert Google Drive URLs to displayable format
            const dUrl = convertGDriveUrl(img.desktop_url);
            const mUrl = convertGDriveUrl(img.mobile_url);
            // Use picture tag to load desktop/mobile images responsively
            html += `
              <div class="hero-slide ${activeClass}">
                <picture>
                  <source media="(max-width: 768px)" srcset="${mUrl}">
                  <source media="(min-width: 769px)" srcset="${dUrl}">
                  <img src="${dUrl}" alt="Hero ${img.urutan}" style="width:100%; height:100%; object-fit:cover;">
                </picture>
              </div>
            `;
          });
          
          // Insert slides before the overlay
          const overlay = sliderContainer.querySelector('.hero-overlay');
          if (overlay) {
            overlay.insertAdjacentHTML('beforebegin', html);
          } else {
            sliderContainer.innerHTML = html + '<div class="hero-overlay"></div>';
          }
          
          // Initialize Auto-play slider
          initHeroSlider();
        }
      }
    } catch(err) {
      console.error('Error fetching hero slider:', err);
    }
  } catch (error) {
    console.error('Failed to load landing page CMS:', error);
  }
}

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

function initHeroSlider() {
  const slides = document.querySelectorAll('#heroSlider .hero-slide');
  if (slides.length <= 1) return;

  let currentSlide = 0;
  setInterval(() => {
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
  }, 5000);
}
