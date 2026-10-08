// --- FUNGSI RESIZE & UPLOAD KE SUPABASE STORAGE ---
async function resizeImageBeforeUpload(file, maxWidth = 1920, maxHeight = 1920, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Kompres ke JPEG dengan kualitas 80% untuk memastikan ukuran file di bawah 1MB
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl.split(',')[1]);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
}

let uploadLoadingCount = 0;
function showUploadLoading() {
  uploadLoadingCount++;
  let overlay = document.getElementById('upload-loading-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'upload-loading-overlay';
    overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,10,25,0.85); z-index:99999; display:flex; flex-direction:column; justify-content:center; align-items:center; color:white; font-family:"Poppins", sans-serif; backdrop-filter:blur(5px);';
    
    const spinner = document.createElement('div');
    spinner.style.cssText = 'width:60px; height:60px; border:6px solid rgba(255,255,255,0.2); border-top:6px solid #F59E0B; border-radius:50%; animation:spin 1s linear infinite; margin-bottom:20px;';
    
    const text = document.createElement('h3');
    text.innerText = 'Mengunggah Foto...';
    text.style.margin = '0 0 10px 0';
    
    const subtext = document.createElement('p');
    subtext.innerText = 'Proses ini mungkin memakan waktu agak lama tergantung ukuran file asli Anda. Mohon jangan tutup halaman ini.';
    subtext.style.opacity = '0.8';
    subtext.style.fontSize = '0.9rem';
    subtext.style.textAlign = 'center';
    subtext.style.maxWidth = '300px';

    const style = document.createElement('style');
    style.innerHTML = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
    
    overlay.appendChild(style);
    overlay.appendChild(spinner);
    overlay.appendChild(text);
    overlay.appendChild(subtext);
    document.body.appendChild(overlay);
  }
  overlay.style.display = 'flex';
}

function hideUploadLoading() {
  uploadLoadingCount--;
  if (uploadLoadingCount <= 0) {
    uploadLoadingCount = 0;
    const overlay = document.getElementById('upload-loading-overlay');
    if (overlay) overlay.style.display = 'none';
  }
}

// Konversi URL Google Drive ke format yang bisa ditampilkan langsung
function convertGDriveUrl(url) {
  if (!url) return url;
  // Format: https://drive.google.com/uc?export=view&id=FILE_ID
  let match = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match) return 'https://lh3.googleusercontent.com/d/' + match[1];
  // Format: https://drive.google.com/file/d/FILE_ID/...
  match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return 'https://lh3.googleusercontent.com/d/' + match[1];
  return url;
}

async function uploadToSupabase(fileInput, folderName) {
  if (!fileInput.files || fileInput.files.length === 0) return null;
  const file = fileInput.files[0];
  
  showUploadLoading();
  try {
    // 1. Gambar otomatis di-resize & dikompres
    const base64Data = await resizeImageBeforeUpload(file);
    
    // Konversi base64 string kembali ke Blob untuk diunggah ke Supabase
    const byteString = atob(base64Data);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: 'image/jpeg' });
    const resizedFile = new File([blob], file.name, { type: 'image/jpeg' });
    
    // Generate unique filename
    const fileExt = 'jpg';
    const fileName = `${folderName}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const sb = getSupabase();
    
    // 2. Unggah ke bucket 'web-assets'
    const { data, error } = await sb.storage
      .from('web-assets')
      .upload(fileName, resizedFile, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (error) {
      console.error('Supabase upload error:', error);
      throw new Error(error.message);
    }
    
    // 3. Dapatkan URL publik
    const { data: publicUrlData } = sb.storage
      .from('web-assets')
      .getPublicUrl(fileName);
      
    return publicUrlData.publicUrl;
  } catch (err) {
    console.error('Error upload:', err);
    if (typeof showToast === 'function') {
      showToast('Gagal mengunggah foto: ' + err.message, 'error');
    }
    throw err;
  } finally {
    hideUploadLoading();
  }
}

async function deleteFromSupabase(url) {
  if (!url || !url.includes('/storage/v1/object/public/web-assets/')) return;
  
  try {
    // Ekstrak path file dari URL
    const urlParts = url.split('/storage/v1/object/public/web-assets/');
    if (urlParts.length !== 2) return;
    
    const filePath = urlParts[1];
    
    const sb = getSupabase();
    const { error } = await sb.storage
      .from('web-assets')
      .remove([filePath]);
      
    if (error) {
      console.error('Gagal menghapus file dari storage:', error);
    } else {
      console.log('File berhasil dihapus dari storage:', filePath);
    }
  } catch (err) {
    console.error('Error deleteFromSupabase:', err);
  }
}

// Global helper untuk preview image
function setupImagePreview(inputId, previewId, hiddenUrlId) {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  if(!input || !preview) return;

  input.addEventListener('change', function() {
    if (this.files && this.files[0]) {
      const reader = new FileReader();
      reader.onload = function(e) {
        preview.src = e.target.result;
        preview.style.display = 'block';
      }
      reader.readAsDataURL(this.files[0]);
    }
  });
}

// Panggil setup untuk semua form CMS
document.addEventListener('DOMContentLoaded', () => {
  setupImagePreview('cms_ketua_foto', 'preview_ketua_foto', 'cms_ketua_foto_url');
  setupImagePreview('cms_wakil_ketua_foto', 'preview_wakil_ketua_foto', 'cms_wakil_ketua_foto_url');
  setupImagePreview('cms_pengasuh_foto', 'preview_pengasuh_foto', 'cms_pengasuh_foto_url');
  setupImagePreview('sarana_foto', 'preview_sarana_foto', 'sarana_foto_url');
  setupImagePreview('ekstra_foto', 'preview_ekstra_foto', 'ekstra_foto_url');
  setupImagePreview('galeri_foto', 'preview_galeri_foto', 'galeri_foto_url');
  setupImagePreview('testimoni_foto', 'preview_testimoni_foto', 'testimoni_foto_url');
  setupImagePreview('berita_image_file', 'preview_berita_foto', 'berita_image_url_hidden');
  setupImagePreview('hero_desktop_file', 'preview_hero_desktop', 'hero_desktop_url_hidden');
  setupImagePreview('hero_mobile_file', 'preview_hero_mobile', 'hero_mobile_url_hidden');
  
  // Load initial settings
  if(getSupabase()) {
    loadWebSettings();
    loadCmsTable('web_sarana', renderSaranaTable);
    loadCmsTable('web_kegiatan_tambahan', renderEkstraTable);
    loadCmsTable('web_galeri', renderGaleriTable);
    loadCmsTable('web_testimoni', renderTestimoniTable);
    loadCmsTable('web_faq', renderFaqTable);
  }
});

// --- SETTINGS (PROFIL, VISI, PENGATURAN) ---
async function loadWebSettings() {
  try {
    const { data, error } = await getSupabase().from('web_settings').select('*').eq('id', 1).single();
    if (error && error.code !== 'PGRST116') throw error;
    if (data) {
      // Profil
      document.getElementById('cms_ketua_nama').value = data.ketua_nama || '';
      document.getElementById('cms_ketua_jabatan').value = data.ketua_jabatan || '';
      document.getElementById('cms_ketua_sambutan').value = data.ketua_sambutan || '';
      if(data.ketua_foto) {
        document.getElementById('preview_ketua_foto').src = data.ketua_foto;
        document.getElementById('preview_ketua_foto').style.display = 'block';
        document.getElementById('cms_ketua_foto_url').value = data.ketua_foto;
      }

      // Wakil Ketua
      document.getElementById('cms_wakil_ketua_nama').value = data.wakil_ketua_nama || localStorage.getItem('cms_wakil_ketua_nama') || 'H. Muhammad Syarif, S.Ag.';
      document.getElementById('cms_wakil_ketua_jabatan').value = data.wakil_ketua_jabatan || localStorage.getItem('cms_wakil_ketua_jabatan') || 'Wakil Ketua Yayasan';
      document.getElementById('cms_wakil_ketua_sambutan').value = data.wakil_ketua_sambutan || localStorage.getItem('cms_wakil_ketua_sambutan') || 'Berkomitmen mendampingi dan mewujudkan tata kelola pendidikan pesantren yang profesional, amanah, serta berlandaskan nilai-nilai Al-Qur\'an dan Sunnah.';
      const wakilFoto = data.wakil_ketua_foto || localStorage.getItem('cms_wakil_ketua_foto') || 'img/wakil_ketua.jpeg';
      if(wakilFoto) {
        document.getElementById('preview_wakil_ketua_foto').src = wakilFoto;
        document.getElementById('preview_wakil_ketua_foto').style.display = 'block';
        document.getElementById('cms_wakil_ketua_foto_url').value = wakilFoto;
      }
      
      document.getElementById('cms_pengasuh_nama').value = data.pengasuh_nama || '';
      document.getElementById('cms_pengasuh_jabatan').value = data.pengasuh_jabatan || '';
      document.getElementById('cms_pengasuh_sambutan').value = data.pengasuh_sambutan || '';
      if(data.pengasuh_foto) {
        document.getElementById('preview_pengasuh_foto').src = data.pengasuh_foto;
        document.getElementById('preview_pengasuh_foto').style.display = 'block';
        document.getElementById('cms_pengasuh_foto_url').value = data.pengasuh_foto;
      }
      
      document.getElementById('cms_tentang_teks').value = data.tentang_teks || '';
      
      // Visi Misi
      document.getElementById('cms_visi_teks').value = data.visi_teks || '';
      let misiStr = '';
      if(Array.isArray(data.misi_teks)) {
         misiStr = data.misi_teks.join('\n');
      }
      document.getElementById('cms_misi_teks').value = misiStr;
      
      // Pengaturan
      document.getElementById('cms_psb_status').value = data.psb_status || 'buka';
      document.getElementById('cms_psb_tahun').value = data.psb_tahun || '';
      
      document.getElementById('cms_sedekah_bank').value = data.sedekah_bank || '';
      document.getElementById('cms_sedekah_rek').value = data.sedekah_rek || '';
      document.getElementById('cms_sedekah_nama').value = data.sedekah_nama || '';
      
      document.getElementById('cms_sosmed_facebook').value = data.sosmed_facebook || '';
      document.getElementById('cms_sosmed_instagram').value = data.sosmed_instagram || '';
      document.getElementById('cms_sosmed_tiktok').value = data.tiktok || data.sosmed_tiktok || '';
      document.getElementById('cms_sosmed_youtube').value = data.sosmed_youtube || '';
    }
  } catch (err) {
    console.error('Error loading web settings:', err);
  }
}

async function saveCmsProfil(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-save-profil');
  const originalText = btn.innerHTML;
  btn.innerHTML = 'Menyimpan...';
  btn.disabled = true;
  
  try {
    let ketuaFotoUrl = document.getElementById('cms_ketua_foto_url').value;
    const inputKetua = document.getElementById('cms_ketua_foto');
    if (inputKetua.files.length > 0) {
      ketuaFotoUrl = await uploadToSupabase(inputKetua, 'Profil');
    }

    let wakilFotoUrl = document.getElementById('cms_wakil_ketua_foto_url').value;
    const inputWakil = document.getElementById('cms_wakil_ketua_foto');
    if (inputWakil.files.length > 0) {
      wakilFotoUrl = await uploadToSupabase(inputWakil, 'Profil');
    }
    
    let pengasuhFotoUrl = document.getElementById('cms_pengasuh_foto_url').value;
    const inputPengasuh = document.getElementById('cms_pengasuh_foto');
    if (inputPengasuh.files.length > 0) {
      pengasuhFotoUrl = await uploadToSupabase(inputPengasuh, 'Profil');
    }

    const wakilNamaVal = document.getElementById('cms_wakil_ketua_nama').value;
    const wakilJabatanVal = document.getElementById('cms_wakil_ketua_jabatan').value;
    const wakilSambutanVal = document.getElementById('cms_wakil_ketua_sambutan').value;

    // Simpan ke localStorage untuk instan cache & offline fallback
    localStorage.setItem('cms_wakil_ketua_nama', wakilNamaVal);
    localStorage.setItem('cms_wakil_ketua_jabatan', wakilJabatanVal);
    localStorage.setItem('cms_wakil_ketua_sambutan', wakilSambutanVal);
    if(wakilFotoUrl) localStorage.setItem('cms_wakil_ketua_foto', wakilFotoUrl);
    
    const payload = {
      ketua_nama: document.getElementById('cms_ketua_nama').value,
      ketua_jabatan: document.getElementById('cms_ketua_jabatan').value,
      ketua_sambutan: document.getElementById('cms_ketua_sambutan').value,
      ketua_foto: ketuaFotoUrl,
      wakil_ketua_nama: wakilNamaVal,
      wakil_ketua_jabatan: wakilJabatanVal,
      wakil_ketua_sambutan: wakilSambutanVal,
      wakil_ketua_foto: wakilFotoUrl,
      pengasuh_nama: document.getElementById('cms_pengasuh_nama').value,
      pengasuh_jabatan: document.getElementById('cms_pengasuh_jabatan').value,
      pengasuh_sambutan: document.getElementById('cms_pengasuh_sambutan').value,
      pengasuh_foto: pengasuhFotoUrl,
      tentang_teks: document.getElementById('cms_tentang_teks').value,
      updated_at: new Date().toISOString()
    };
    
    let { error } = await getSupabase().from('web_settings').update(payload).eq('id', 1);
    if (error && error.message && (error.message.includes('wakil_ketua') || error.code === 'PGRST204' || error.message.includes('column'))) {
      // Jika kolom wakil_ketua belum ada di tabel Supabase
      console.warn('Kolom wakil_ketua belum ada di web_settings Supabase, fallback simpan field lainnya dan cache lokal:', error);
      const fallbackPayload = { ...payload };
      delete fallbackPayload.wakil_ketua_nama;
      delete fallbackPayload.wakil_ketua_jabatan;
      delete fallbackPayload.wakil_ketua_sambutan;
      delete fallbackPayload.wakil_ketua_foto;
      const { error: errFallback } = await getSupabase().from('web_settings').update(fallbackPayload).eq('id', 1);
      if(errFallback) throw errFallback;
      showCustomAlert('Berhasil Tersimpan', 'Data Profil & Sambutan berhasil disimpan (Data Wakil Ketua tersimpan di cache web. Jalankan script add-wakil-ketua-columns.sql di Supabase untuk sinkronisasi database permanen).', 'success');
      return;
    }
    if(error) throw error;
    showCustomAlert('Berhasil', 'Data Profil & Sambutan berhasil disimpan!', 'success');
  } catch(err) {
    showCustomAlert('Gagal', err.message, 'error');
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

async function saveCmsVisi(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-save-visi');
  const originalText = btn.innerHTML;
  btn.innerHTML = 'Menyimpan...';
  btn.disabled = true;
  
  try {
    const misiArray = document.getElementById('cms_misi_teks').value.split('\n').filter(m => m.trim() !== '');
    const payload = {
      visi_teks: document.getElementById('cms_visi_teks').value,
      misi_teks: misiArray,
      updated_at: new Date().toISOString()
    };
    
    const { error } = await getSupabase().from('web_settings').update(payload).eq('id', 1);
    if(error) throw error;
    showCustomAlert('Berhasil', 'Visi & Misi berhasil disimpan!', 'success');
  } catch(err) {
    showCustomAlert('Gagal', err.message, 'error');
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

async function saveCmsPengaturan(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-save-pengaturan');
  const originalText = btn.innerHTML;
  btn.innerHTML = 'Menyimpan...';
  btn.disabled = true;
  
  try {
    const tiktokVal = document.getElementById('cms_sosmed_tiktok').value;
    let payload = {
      psb_status: document.getElementById('cms_psb_status').value,
      psb_tahun: document.getElementById('cms_psb_tahun').value,
      sedekah_bank: document.getElementById('cms_sedekah_bank').value,
      sedekah_rek: document.getElementById('cms_sedekah_rek').value,
      sedekah_nama: document.getElementById('cms_sedekah_nama').value,
      sosmed_facebook: document.getElementById('cms_sosmed_facebook').value,
      sosmed_instagram: document.getElementById('cms_sosmed_instagram').value,
      tiktok: tiktokVal,
      sosmed_youtube: document.getElementById('cms_sosmed_youtube').value,
      updated_at: new Date().toISOString()
    };
    
    let { error } = await getSupabase().from('web_settings').update(payload).eq('id', 1);
    
    // Jika kolom 'tiktok' belum ada di schema cache, coba coba fallback ke 'sosmed_tiktok'
    if(error && error.message && error.message.includes('tiktok')) {
      delete payload.tiktok;
      payload.sosmed_tiktok = tiktokVal;
      const resFallback = await getSupabase().from('web_settings').update(payload).eq('id', 1);
      error = resFallback.error;
      
      // Jika sosmed_tiktok juga belum ada, simpan tanpa field tiktok dulu dan beri notifikasi
      if(error && error.message && (error.message.includes('sosmed_tiktok') || error.message.includes('tiktok'))) {
        delete payload.sosmed_tiktok;
        const resNoTiktok = await getSupabase().from('web_settings').update(payload).eq('id', 1);
        if(!resNoTiktok.error) {
          showCustomAlert(
            'Tersimpan Sebagian', 
            'Pengaturan lain berhasil disimpan, namun kolom TikTok belum dibuat di database Supabase. Silakan jalankan file SQL update-db-profile-tiktok.sql di SQL Editor Supabase!',
            'warning'
          );
          return;
        }
        error = resNoTiktok.error;
      }
    }
    
    if(error) throw error;
    showCustomAlert('Berhasil', 'Pengaturan Web berhasil disimpan!', 'success');
  } catch(err) {
    if(err.message && err.message.includes('schema cache')) {
      showCustomAlert('Perlu Update Database', 'Kolom database belum terdaftar di Supabase: ' + err.message + '. Silakan jalankan update-db-profile-tiktok.sql di Supabase SQL Editor.', 'warning');
    } else {
      showCustomAlert('Gagal', err.message, 'error');
    }
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

// --- GENERAL CRUD FUNCTIONS ---
async function loadCmsTable(table, renderCallback) {
  try {
    const { data, error } = await getSupabase().from(table).select('*').order('urutan', { ascending: true });
    if(error) throw error;
    renderCallback(data);
  } catch(err) {
    console.error(`Error loading ${table}:`, err);
  }
}

async function deleteCmsRecord(table, id, reloadCallback) {
  const ok = await showCustomConfirm('Hapus Data', 'Yakin ingin menghapus data ini?');
  if (!ok) return;

  try {
    const sb = getSupabase();
    
    // Ambil data dulu untuk mendapatkan URL foto (jika ada)
    const { data: record } = await sb.from(table).select('*').eq('id', id).single();
    if(record) {
      if(record.foto) await deleteFromSupabase(record.foto);
      if(record.desktop_url) await deleteFromSupabase(record.desktop_url);
      if(record.mobile_url) await deleteFromSupabase(record.mobile_url);
    }
    
    const { error } = await sb.from(table).delete().eq('id', id);
    if(error) throw error;
    showCustomAlert('Berhasil', 'Data dihapus.', 'success');
    loadCmsTable(table, reloadCallback);
  } catch(err) {
    showCustomAlert('Gagal', err.message, 'error');
  }
}

// --- SARANA & PRASARANA ---
function renderSaranaTable(data) {
  const tbody = document.getElementById('tbody-sarana');
  tbody.innerHTML = '';
  document.getElementById('count-sarana').innerText = `${data.length} Data`;
  
  data.forEach(item => {
    const imgHtml = item.foto ? `<img src="${item.foto}" style="width: 80px; height: 50px; object-fit: cover; border-radius: 6px;">` : '-';
    tbody.innerHTML += `
      <tr>
        <td>${item.urutan || 0}</td>
        <td>${imgHtml}</td>
        <td>${item.judul}</td>
        <td>${item.deskripsi ? item.deskripsi.substring(0,50) + '...' : '-'}</td>
        <td><span class="badge-nis">${item.tag || '-'}</span></td>
        <td>
          <div class="action-btns">
            <button class="btn-action btn-edit" onclick="editSarana('${item.id}')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="btn-action btn-delete" onclick="deleteCmsRecord('web_sarana', '${item.id}', renderSaranaTable)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  });
}

function openSaranaModal() {
  document.getElementById('saranaForm').reset();
  document.getElementById('saranaId').value = '';
  document.getElementById('preview_sarana_foto').style.display = 'none';
  document.getElementById('sarana_foto_url').value = '';
  document.getElementById('saranaModalTitle').innerText = 'Tambah Fasilitas';
  openModal('saranaModalOverlay');
}

async function editSarana(id) {
  try {
    const { data, error } = await getSupabase().from('web_sarana').select('*').eq('id', id).single();
    if(error) throw error;
    
    document.getElementById('saranaId').value = data.id;
    document.getElementById('sarana_judul').value = data.judul;
    document.getElementById('sarana_tag').value = data.tag || '';
    document.getElementById('sarana_urutan').value = data.urutan || 0;
    document.getElementById('sarana_deskripsi').value = data.deskripsi || '';
    
    if(data.foto) {
      document.getElementById('preview_sarana_foto').src = data.foto;
      document.getElementById('preview_sarana_foto').style.display = 'block';
      document.getElementById('sarana_foto_url').value = data.foto;
    } else {
      document.getElementById('preview_sarana_foto').style.display = 'none';
      document.getElementById('sarana_foto_url').value = '';
    }
    
    document.getElementById('saranaModalTitle').innerText = 'Edit Fasilitas';
    openModal('saranaModalOverlay');
  } catch(err) {
    showCustomAlert('Error', err.message, 'error');
  }
}

async function saveSarana(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-save-sarana');
  const originalText = btn.innerHTML;
  btn.innerHTML = 'Menyimpan...';
  btn.disabled = true;
  
  try {
    let fotoUrl = document.getElementById('sarana_foto_url').value;
    const inputFile = document.getElementById('sarana_foto');
    if (inputFile.files.length > 0) {
      fotoUrl = await uploadToSupabase(inputFile, 'Sarana');
    }
    
    const payload = {
      judul: document.getElementById('sarana_judul').value,
      deskripsi: document.getElementById('sarana_deskripsi').value,
      tag: document.getElementById('sarana_tag').value,
      urutan: parseInt(document.getElementById('sarana_urutan').value) || 0,
      foto: fotoUrl
    };
    
    const id = document.getElementById('saranaId').value;
    let res;
    if(id) {
      res = await getSupabase().from('web_sarana').update(payload).eq('id', id);
    } else {
      res = await getSupabase().from('web_sarana').insert([payload]);
    }
    
    if(res.error) throw res.error;
    closeModal('saranaModalOverlay');
    showCustomAlert('Berhasil', 'Data Fasilitas disimpan.', 'success');
    loadCmsTable('web_sarana', renderSaranaTable);
  } catch(err) {
    showCustomAlert('Gagal', err.message, 'error');
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

// --- KEGIATAN TAMBAHAN (EKSTRA) ---
// Sama polanya seperti Sarana
function renderEkstraTable(data) {
  const tbody = document.getElementById('tbody-ekstra');
  tbody.innerHTML = '';
  document.getElementById('count-ekstra').innerText = `${data.length} Data`;
  data.forEach(item => {
    const imgHtml = item.foto ? `<img src="${item.foto}" style="width: 80px; height: 50px; object-fit: cover; border-radius: 6px;">` : '-';
    tbody.innerHTML += `
      <tr>
        <td>${item.urutan || 0}</td>
        <td>${imgHtml}</td>
        <td>${item.judul}</td>
        <td>${item.deskripsi ? item.deskripsi.substring(0,50) + '...' : '-'}</td>
        <td>
          <div class="action-btns">
            <button class="btn-action btn-edit" onclick="editEkstra('${item.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
            <button class="btn-action btn-delete" onclick="deleteCmsRecord('web_kegiatan_tambahan', '${item.id}', renderEkstraTable)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
          </div>
        </td>
      </tr>
    `;
  });
}

function openEkstraModal() {
  document.getElementById('ekstraForm').reset();
  document.getElementById('ekstraId').value = '';
  document.getElementById('preview_ekstra_foto').style.display = 'none';
  document.getElementById('ekstra_foto_url').value = '';
  document.getElementById('ekstraModalTitle').innerText = 'Tambah Kegiatan';
  openModal('ekstraModalOverlay');
}

async function editEkstra(id) {
  try {
    const { data, error } = await getSupabase().from('web_kegiatan_tambahan').select('*').eq('id', id).single();
    if(error) throw error;
    document.getElementById('ekstraId').value = data.id;
    document.getElementById('ekstra_judul').value = data.judul;
    document.getElementById('ekstra_urutan').value = data.urutan || 0;
    document.getElementById('ekstra_deskripsi').value = data.deskripsi || '';
    if(data.foto) {
      document.getElementById('preview_ekstra_foto').src = data.foto;
      document.getElementById('preview_ekstra_foto').style.display = 'block';
      document.getElementById('ekstra_foto_url').value = data.foto;
    } else {
      document.getElementById('preview_ekstra_foto').style.display = 'none';
      document.getElementById('ekstra_foto_url').value = '';
    }
    document.getElementById('ekstraModalTitle').innerText = 'Edit Kegiatan';
    openModal('ekstraModalOverlay');
  } catch(err) {
    showCustomAlert('Error', err.message, 'error');
  }
}

async function saveEkstra(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-save-ekstra');
  const originalText = btn.innerHTML;
  btn.innerHTML = 'Menyimpan...';
  btn.disabled = true;
  try {
    let fotoUrl = document.getElementById('ekstra_foto_url').value;
    const inputFile = document.getElementById('ekstra_foto');
    if (inputFile.files.length > 0) { fotoUrl = await uploadToSupabase(inputFile, 'Kegiatan'); }
    const payload = {
      judul: document.getElementById('ekstra_judul').value,
      deskripsi: document.getElementById('ekstra_deskripsi').value,
      urutan: parseInt(document.getElementById('ekstra_urutan').value) || 0,
      foto: fotoUrl
    };
    const id = document.getElementById('ekstraId').value;
    let res = id ? await getSupabase().from('web_kegiatan_tambahan').update(payload).eq('id', id) : await getSupabase().from('web_kegiatan_tambahan').insert([payload]);
    if(res.error) throw res.error;
    closeModal('ekstraModalOverlay');
    showCustomAlert('Berhasil', 'Kegiatan disimpan.', 'success');
    loadCmsTable('web_kegiatan_tambahan', renderEkstraTable);
  } catch(err) {
    showCustomAlert('Gagal', err.message, 'error');
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

// --- GALERI ---
function renderGaleriTable(data) {
  const tbody = document.getElementById('tbody-galeri');
  tbody.innerHTML = '';
  document.getElementById('count-galeri').innerText = `${data.length} Foto`;
  data.forEach(item => {
    const imgHtml = item.foto ? `<img src="${item.foto}" style="width: 120px; height: 80px; object-fit: cover; border-radius: 6px;">` : '-';
    tbody.innerHTML += `
      <tr>
        <td>${item.urutan || 0}</td>
        <td>${imgHtml}</td>
        <td>${item.judul || '-'}</td>
        <td>
          <div class="action-btns">
            <button class="btn-action btn-edit" onclick="editGaleri('${item.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
            <button class="btn-action btn-delete" onclick="deleteCmsRecord('web_galeri', '${item.id}', renderGaleriTable)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
          </div>
        </td>
      </tr>
    `;
  });
}

function openGaleriModal() {
  document.getElementById('galeriForm').reset();
  document.getElementById('galeriId').value = '';
  document.getElementById('preview_galeri_foto').style.display = 'none';
  document.getElementById('galeri_foto_url').value = '';
  document.getElementById('galeriModalTitle').innerText = 'Tambah Foto Galeri';
  openModal('galeriModalOverlay');
}

async function editGaleri(id) {
  try {
    const { data, error } = await getSupabase().from('web_galeri').select('*').eq('id', id).single();
    if(error) throw error;
    document.getElementById('galeriId').value = data.id;
    document.getElementById('galeri_judul').value = data.judul || '';
    document.getElementById('galeri_urutan').value = data.urutan || 0;
    if(data.foto) {
      document.getElementById('preview_galeri_foto').src = data.foto;
      document.getElementById('preview_galeri_foto').style.display = 'block';
      document.getElementById('galeri_foto_url').value = data.foto;
    } else {
      document.getElementById('preview_galeri_foto').style.display = 'none';
      document.getElementById('galeri_foto_url').value = '';
    }
    document.getElementById('galeriModalTitle').innerText = 'Edit Galeri';
    openModal('galeriModalOverlay');
  } catch(err) {
    showCustomAlert('Error', err.message, 'error');
  }
}

async function saveGaleri(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-save-galeri');
  const originalText = btn.innerHTML;
  btn.innerHTML = 'Menyimpan...';
  btn.disabled = true;
  try {
    let fotoUrl = document.getElementById('galeri_foto_url').value;
    const inputFile = document.getElementById('galeri_foto');
    if (inputFile.files.length > 0) { fotoUrl = await uploadToSupabase(inputFile, 'Galeri'); }
    
    if(!fotoUrl) throw new Error("Foto wajib diisi!");

    const payload = {
      judul: document.getElementById('galeri_judul').value,
      urutan: parseInt(document.getElementById('galeri_urutan').value) || 0,
      foto: fotoUrl
    };
    const id = document.getElementById('galeriId').value;
    let res = id ? await getSupabase().from('web_galeri').update(payload).eq('id', id) : await getSupabase().from('web_galeri').insert([payload]);
    if(res.error) throw res.error;
    closeModal('galeriModalOverlay');
    showCustomAlert('Berhasil', 'Foto galeri disimpan.', 'success');
    loadCmsTable('web_galeri', renderGaleriTable);
  } catch(err) {
    showCustomAlert('Gagal', err.message, 'error');
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

// --- TESTIMONI ---
function renderTestimoniTable(data) {
  const tbody = document.getElementById('tbody-testimoni');
  tbody.innerHTML = '';
  document.getElementById('count-testimoni').innerText = `${data.length} Data`;
  data.forEach(item => {
    const imgHtml = item.foto ? `<img src="${item.foto}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 50%;">` : '-';
    tbody.innerHTML += `
      <tr>
        <td>${item.urutan || 0}</td>
        <td>${imgHtml}</td>
        <td><strong>${item.nama}</strong><br><span style="font-size:0.75rem; color:#666;">${item.peran || ''}</span></td>
        <td>${item.kutipan ? item.kutipan.substring(0,80) + '...' : '-'}</td>
        <td>
          <div class="action-btns">
            <button class="btn-action btn-edit" onclick="editTestimoni('${item.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
            <button class="btn-action btn-delete" onclick="deleteCmsRecord('web_testimoni', '${item.id}', renderTestimoniTable)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
          </div>
        </td>
      </tr>
    `;
  });
}

function openTestimoniModal() {
  document.getElementById('testimoniForm').reset();
  document.getElementById('testimoniId').value = '';
  document.getElementById('preview_testimoni_foto').style.display = 'none';
  document.getElementById('testimoni_foto_url').value = '';
  document.getElementById('testimoniModalTitle').innerText = 'Tambah Testimoni';
  openModal('testimoniModalOverlay');
}

async function editTestimoni(id) {
  try {
    const { data, error } = await getSupabase().from('web_testimoni').select('*').eq('id', id).single();
    if(error) throw error;
    document.getElementById('testimoniId').value = data.id;
    document.getElementById('testimoni_nama').value = data.nama;
    document.getElementById('testimoni_peran').value = data.peran || '';
    document.getElementById('testimoni_kutipan').value = data.kutipan || '';
    document.getElementById('testimoni_urutan').value = data.urutan || 0;
    if(data.foto) {
      document.getElementById('preview_testimoni_foto').src = data.foto;
      document.getElementById('preview_testimoni_foto').style.display = 'block';
      document.getElementById('testimoni_foto_url').value = data.foto;
    } else {
      document.getElementById('preview_testimoni_foto').style.display = 'none';
      document.getElementById('testimoni_foto_url').value = '';
    }
    document.getElementById('testimoniModalTitle').innerText = 'Edit Testimoni';
    openModal('testimoniModalOverlay');
  } catch(err) {
    showCustomAlert('Error', err.message, 'error');
  }
}

async function saveTestimoni(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-save-testimoni');
  const originalText = btn.innerHTML;
  btn.innerHTML = 'Menyimpan...';
  btn.disabled = true;
  try {
    let fotoUrl = document.getElementById('testimoni_foto_url').value;
    const inputFile = document.getElementById('testimoni_foto');
    if (inputFile.files.length > 0) { fotoUrl = await uploadToSupabase(inputFile, 'Testimoni'); }
    const payload = {
      nama: document.getElementById('testimoni_nama').value,
      peran: document.getElementById('testimoni_peran').value,
      kutipan: document.getElementById('testimoni_kutipan').value,
      urutan: parseInt(document.getElementById('testimoni_urutan').value) || 0,
      foto: fotoUrl
    };
    const id = document.getElementById('testimoniId').value;
    let res = id ? await getSupabase().from('web_testimoni').update(payload).eq('id', id) : await getSupabase().from('web_testimoni').insert([payload]);
    if(res.error) throw res.error;
    closeModal('testimoniModalOverlay');
    showCustomAlert('Berhasil', 'Testimoni disimpan.', 'success');
    loadCmsTable('web_testimoni', renderTestimoniTable);
  } catch(err) {
    showCustomAlert('Gagal', err.message, 'error');
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

// --- FAQ ---
function renderFaqTable(data) {
  const tbody = document.getElementById('tbody-faq');
  tbody.innerHTML = '';
  document.getElementById('count-faq').innerText = `${data.length} Data`;
  data.forEach(item => {
    tbody.innerHTML += `
      <tr>
        <td>${item.urutan || 0}</td>
        <td><strong>${item.pertanyaan}</strong></td>
        <td>${item.jawaban}</td>
        <td>
          <div class="action-btns">
            <button class="btn-action btn-edit" onclick="editFaq('${item.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
            <button class="btn-action btn-delete" onclick="deleteCmsRecord('web_faq', '${item.id}', renderFaqTable)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
          </div>
        </td>
      </tr>
    `;
  });
}

function openFaqModal() {
  document.getElementById('faqForm').reset();
  document.getElementById('faqId').value = '';
  document.getElementById('faqModalTitle').innerText = 'Tambah FAQ';
  openModal('faqModalOverlay');
}

async function editFaq(id) {
  try {
    const { data, error } = await getSupabase().from('web_faq').select('*').eq('id', id).single();
    if(error) throw error;
    document.getElementById('faqId').value = data.id;
    document.getElementById('faq_pertanyaan').value = data.pertanyaan;
    document.getElementById('faq_jawaban').value = data.jawaban;
    document.getElementById('faq_urutan').value = data.urutan || 0;
    document.getElementById('faqModalTitle').innerText = 'Edit FAQ';
    openModal('faqModalOverlay');
  } catch(err) {
    showCustomAlert('Error', err.message, 'error');
  }
}

async function saveFaq(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-save-faq');
  const originalText = btn.innerHTML;
  btn.innerHTML = 'Menyimpan...';
  btn.disabled = true;
  try {
    const payload = {
      pertanyaan: document.getElementById('faq_pertanyaan').value,
      jawaban: document.getElementById('faq_jawaban').value,
      urutan: parseInt(document.getElementById('faq_urutan').value) || 0
    };
    const id = document.getElementById('faqId').value;
    let res = id ? await getSupabase().from('web_faq').update(payload).eq('id', id) : await getSupabase().from('web_faq').insert([payload]);
    if(res.error) throw res.error;
    closeModal('faqModalOverlay');
    showCustomAlert('Berhasil', 'FAQ disimpan.', 'success');
    loadCmsTable('web_faq', renderFaqTable);
  } catch(err) {
    showCustomAlert('Gagal', err.message, 'error');
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}



// --- FITUR HERO BANNER ---
let allHeroBanners = [];

async function loadHeroBanners() {
  const sb = getSupabase();
  if(!sb) return;
  const { data, error } = await sb.from('web_hero_images').select('*').order('urutan', { ascending: true });
  if(!error && data) {
    allHeroBanners = data;
    renderHeroTable(data);
    
    // Disable Add Button if > 4
    const btnTambah = document.getElementById('btnTambahHero');
    if(data.length >= 5) {
      btnTambah.disabled = true;
      btnTambah.title = "Maksimal 5 banner";
    } else {
      btnTambah.disabled = false;
      btnTambah.title = "";
    }
  }
}

function renderHeroTable(data) {
  const tbody = document.querySelector('#tableHero tbody');
  const countEl = document.getElementById('count-hero');
  if(!tbody) return;
  tbody.innerHTML = '';
  
  if (countEl) {
    countEl.innerText = `${data.length} Banner`;
  }

  if(data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center" style="padding:24px;">Belum ada hero banner</td></tr>';
    return;
  }
  
  data.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.urutan}</td>
      <td><img src="${item.desktop_url}" style="height: 60px; object-fit: cover; border-radius: 4px;"></td>
      <td><img src="${item.mobile_url}" style="height: 60px; object-fit: cover; border-radius: 4px;"></td>
      <td>
        <div class="action-buttons">
          <button class="btn-action btn-edit" onclick="openHeroModal('${item.id}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button class="btn-action btn-delete" onclick="deleteHeroBanner('${item.id}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function openHeroModal(id = null) {
  document.getElementById('heroModalOverlay').classList.add('active');
  document.getElementById('heroForm').reset();
  document.getElementById('hero_id').value = '';
  document.getElementById('hero_desktop_url_hidden').value = '';
  document.getElementById('hero_mobile_url_hidden').value = '';
  document.getElementById('preview_hero_desktop').style.display = 'none';
  document.getElementById('preview_hero_mobile').style.display = 'none';
  
  if (id) {
    document.getElementById('heroModalTitle').innerText = 'Edit Banner';
    const b = allHeroBanners.find(x => x.id === id);
    if(b) {
      document.getElementById('hero_id').value = b.id;
      document.getElementById('hero_urutan').value = b.urutan;
      document.getElementById('hero_desktop_url_hidden').value = b.desktop_url;
      document.getElementById('hero_mobile_url_hidden').value = b.mobile_url;
      if(b.desktop_url) {
        document.getElementById('preview_hero_desktop').src = b.desktop_url;
        document.getElementById('preview_hero_desktop').style.display = 'block';
      }
      if(b.mobile_url) {
        document.getElementById('preview_hero_mobile').src = b.mobile_url;
        document.getElementById('preview_hero_mobile').style.display = 'block';
      }
    }
  } else {
    document.getElementById('heroModalTitle').innerText = 'Tambah Banner';
    document.getElementById('hero_urutan').value = allHeroBanners.length + 1;
  }
}

function closeHeroModal() {
  document.getElementById('heroModalOverlay').classList.remove('active');
}

async function saveHeroBanner(e) {
  e.preventDefault();
  const sb = getSupabase();
  if(!sb) return;
  
  const btn = document.getElementById('btnSimpanHero');
  btn.disabled = true;
  btn.innerText = 'Menyimpan...';
  
  const id = document.getElementById('hero_id').value;
  const urutan = document.getElementById('hero_urutan').value;
  let desktopUrl = document.getElementById('hero_desktop_url_hidden').value;
  let mobileUrl = document.getElementById('hero_mobile_url_hidden').value;
  
  const fileDesktop = document.getElementById('hero_desktop_file');
  const fileMobile = document.getElementById('hero_mobile_file');
  
  try {
    if(fileDesktop.files.length > 0) desktopUrl = await uploadToSupabase(fileDesktop, 'Hero');
    if(fileMobile.files.length > 0) mobileUrl = await uploadToSupabase(fileMobile, 'Hero');
    
    if(!desktopUrl || !mobileUrl) throw new Error("Gambar desktop dan mobile wajib ada.");
    
    const payload = { desktop_url: desktopUrl, mobile_url: mobileUrl, urutan: parseInt(urutan) };
    
    if(id) {
      const { error } = await sb.from('web_hero_images').update(payload).eq('id', id);
      if(error) throw error;
      showCustomAlert('Berhasil', 'Banner berhasil diubah', 'success');
    } else {
      const { error } = await sb.from('web_hero_images').insert([payload]);
      if(error) throw error;
      showCustomAlert('Berhasil', 'Banner berhasil ditambahkan', 'success');
    }
    
    closeHeroModal();
    loadHeroBanners();
  } catch(err) {
    showCustomAlert('Gagal', err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerText = 'Simpan Banner';
  }
}

async function deleteHeroBanner(id) {
  const ok = await showCustomConfirm('Hapus Banner', 'Yakin ingin menghapus banner ini?');
  if (!ok) return;

  const sb = getSupabase();
  if(!sb) return;
  
  try {
    // Ambil data dulu untuk menghapus gambar dari storage
    const { data: record } = await sb.from('web_hero_images').select('desktop_url, mobile_url').eq('id', id).single();
    if(record) {
      if(record.desktop_url) await deleteFromSupabase(record.desktop_url);
      if(record.mobile_url) await deleteFromSupabase(record.mobile_url);
    }
    
    const { error } = await sb.from('web_hero_images').delete().eq('id', id);
    if(error) throw error;
    
    showCustomAlert('Berhasil', 'Banner berhasil dihapus', 'success');
    loadHeroBanners();
  } catch (err) {
    showCustomAlert('Gagal', err.message, 'error');
  }
}

// --- MODAL UTILS ---
function openModal(modalId) {
  const el = document.getElementById(modalId);
  if (el) el.classList.add('active');
}
function closeModal(modalId) {
  const el = document.getElementById(modalId);
  if (el) el.classList.remove('active');
}
