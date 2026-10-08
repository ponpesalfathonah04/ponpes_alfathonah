// belanja.js - Menangani logika fitur Belanja & Operasional

let allTransaksiBelanja = [];
let lastFilteredBelanja = [];

const namaBulanMap = {
    '01': 'Januari', '02': 'Februari', '03': 'Maret', '04': 'April',
    '05': 'Mei', '06': 'Juni', '07': 'Juli', '08': 'Agustus',
    '09': 'September', '10': 'Oktober', '11': 'November', '12': 'Desember'
};

document.addEventListener('DOMContentLoaded', () => {
    // Tunggu sampai Supabase client siap (didefinisikan di dashboard.js)
    setTimeout(() => {
        if (typeof getSupabase !== 'undefined' && getSupabase()) {
            loadTransaksiBelanja();
        }
    }, 1000);
});

// Format Rupiah
function fRupiah(angka) {
    if (typeof formatRupiah === 'function') return formatRupiah(angka);
    return 'Rp ' + Number(angka || 0).toLocaleString('id-ID');
}

// Format input Rupiah pada Total Pengeluaran
function formatInputRupiahBelanja(el) {
    let val = el.value.replace(/[^0-9]/g, '');
    const num = parseInt(val, 10) || 0;
    const hidden = document.getElementById('belanja_total_harga');
    if (hidden) hidden.value = num;
    el.value = num > 0 ? num.toLocaleString('id-ID') : '';
}

// Dynamic item rows untuk daftar belanjaan
function addBelanjaItemRow(value = '') {
    const container = document.getElementById('belanjaItemsContainer');
    if (!container) return;

    const row = document.createElement('div');
    row.className = 'belanja-item-row';
    row.style.cssText = 'display: flex; gap: 8px; margin-bottom: 8px; align-items: center;';

    const placeholders = [
        'Misal: Belanja beras',
        'Misal: Belanja minyak goreng',
        'Misal: Belanja telur',
        'Misal: Belanja bumbu dapur',
        'Misal: Belanja daging & ikan',
        'Misal: Operasional listrik & air',
        'Misal: Perlengkapan sabun & kebersihan'
    ];
    const count = container.querySelectorAll('.belanja-item-row').length;
    const ph = placeholders[count % placeholders.length] || 'Nama belanjaan lainnya...';

    row.innerHTML = `
        <input type="text" class="belanja-item-input form-group" style="margin: 0; flex: 1;" placeholder="${ph}" value="${value.replace(/"/g, '&quot;')}" required>
        <button type="button" onclick="removeBelanjaItemRow(this)" style="background: #FEE2E2; color: #DC2626; border: none; border-radius: 8px; width: 36px; height: 38px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: bold; flex-shrink: 0;" title="Hapus item">&times;</button>
    `;

    container.appendChild(row);
    const inp = row.querySelector('input');
    if (inp && !value) inp.focus();
}

function removeBelanjaItemRow(btn) {
    const container = document.getElementById('belanjaItemsContainer');
    if (!container) return;
    const rows = container.querySelectorAll('.belanja-item-row');
    if (rows.length > 1) {
        btn.closest('.belanja-item-row').remove();
    } else {
        const input = rows[0].querySelector('input');
        if (input) input.value = '';
    }
}

// 1. Fetch Transaksi Belanja
async function loadTransaksiBelanja() {
    const tbody = document.getElementById('belanjaTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:40px; color:#9CA3AF;">Memuat data belanja...</td></tr>';
    
    const sb = getSupabase();
    if (!sb) return;
    const { data, error } = await sb
        .from('transaksi_belanja')
        .select(`id, tanggal, item_nama, kategori_id, qty, satuan, harga_satuan, total_harga, keterangan`)
        .order('tanggal', { ascending: false });
        
    if (error) {
        console.error('Error load transaksi belanja:', error);
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:40px; color:#EF4444;">Gagal memuat data</td></tr>`;
        return;
    }
    
    allTransaksiBelanja = data || [];
    filterBelanja();
}

// 2. Filter & Render Table Belanja
function filterBelanja() {
    const q = (document.getElementById('searchBelanja')?.value || '').toLowerCase().trim();
    const tgl = document.getElementById('filterTglBelanja')?.value || '';
    const bulan = document.getElementById('filterBulanBelanja')?.value || '';
    const tahun = document.getElementById('filterTahunBelanja')?.value || '';
    
    let filtered = allTransaksiBelanja.filter(t => {
        // 1. Filter Nama Belanjaan / Keterangan
        const matchNama = !q || (t.item_nama || '').toLowerCase().includes(q) || (t.keterangan || '').toLowerCase().includes(q);
        
        // 2. Filter Tanggal Spesifik (YYYY-MM-DD)
        const matchTgl = !tgl || t.tanggal === tgl;
        
        // 3. Filter Bulan & Tahun dari t.tanggal
        let matchBulan = true;
        let matchTahun = true;
        if (t.tanggal) {
            const parts = t.tanggal.split('-'); // [YYYY, MM, DD]
            if (parts.length >= 2) {
                if (bulan) {
                    matchBulan = parts[1] === bulan;
                }
                if (tahun) {
                    matchTahun = parts[0] === tahun;
                }
            }
        }
        
        return matchNama && matchTgl && matchBulan && matchTahun;
    });
    
    lastFilteredBelanja = filtered;
    renderBelanjaTable(filtered);
    renderBelanjaStats(filtered, { q, tgl, bulan, tahun });
}

function resetFilterBelanja() {
    const searchEl = document.getElementById('searchBelanja');
    const tglEl = document.getElementById('filterTglBelanja');
    const bulanEl = document.getElementById('filterBulanBelanja');
    const tahunEl = document.getElementById('filterTahunBelanja');
    
    if (searchEl) searchEl.value = '';
    if (tglEl) tglEl.value = '';
    if (bulanEl) bulanEl.value = '';
    if (tahunEl) tahunEl.value = '';
    
    filterBelanja();
}

function renderBelanjaTable(data) {
    const tbody = document.getElementById('belanjaTableBody');
    if (!tbody) return;
    
    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:40px; color:#9CA3AF;">Tidak ada transaksi belanja yang sesuai filter.</td></tr>';
        return;
    }
    
    let html = '';
    data.forEach(t => {
        // Format items: pecah jika ada tanda koma atau baris baru
        const items = (t.item_nama || '').split(/,\s*|\n+/).map(s => s.trim()).filter(Boolean);
        let itemsDisplay = '';
        if (items.length > 1) {
            itemsDisplay = `<div style="display: flex; flex-wrap: wrap; gap: 6px;">` +
                items.map(it => `<span style="background: #F1F5F9; color: #1E293B; padding: 4px 9px; border-radius: 6px; font-size: 0.83rem; font-weight: 500; border: 1px solid #E2E8F0;">${it}</span>`).join('') +
                `</div>`;
        } else {
            itemsDisplay = `<span style="font-weight: 600; color: #1E293B; font-size: 0.95rem;">${t.item_nama || '-'}</span>`;
        }

        html += `
            <tr>
                <td style="white-space: nowrap; font-weight: 500;">${formatTanggal(t.tanggal)}</td>
                <td>${itemsDisplay}</td>
                <td style="font-weight: 800; color: #DC2626; font-size: 1rem; white-space: nowrap;">${fRupiah(t.total_harga)}</td>
                <td style="color: #64748B; font-size: 0.85rem;">${t.keterangan || '-'}</td>
                <td style="text-align: center; white-space: nowrap;">
                    <button class="btn-action btn-edit" style="margin-right:4px;" onclick="editBelanja('${t.id}')" title="Edit">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button class="btn-action btn-delete" onclick="deleteBelanja('${t.id}')" title="Hapus">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

function formatTanggal(tglStr) {
    if (!tglStr) return '-';
    const parts = tglStr.split('-');
    if (parts.length !== 3) return tglStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// 3. Render Statistik Belanja (Total Catatan Belanja Dihapus Sesuai Permintaan)
function renderBelanjaStats(data, filters = {}) {
    const container = document.getElementById('belanjaStatsContainer');
    if (!container) return;
    
    let totalAll = 0;
    data.forEach(t => {
        totalAll += Number(t.total_harga || 0);
    });

    // Buat keterangan filter yang aktif
    let filterTexts = [];
    if (filters.q) filterTexts.push(`Cari "${filters.q}"`);
    if (filters.tgl) filterTexts.push(`Tanggal ${formatTanggal(filters.tgl)}`);
    if (filters.bulan) filterTexts.push(`Bulan ${namaBulanMap[filters.bulan] || filters.bulan}`);
    if (filters.tahun) filterTexts.push(`Tahun ${filters.tahun}`);
    
    const filterInfo = filterTexts.length > 0 
        ? `Filter: ${filterTexts.join(' • ')} (${data.length} transaksi)`
        : `Semua catatan belanja (${data.length} transaksi)`;
    
    let html = `
        <div class="card" style="padding: 24px 28px; min-height: 110px; display: flex; align-items: center; gap: 20px; border-left: 5px solid #EF4444; border-radius: 16px; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05); background: #ffffff; max-width: 480px; width: 100%; box-sizing: border-box;">
            <div style="width: 56px; height: 56px; border-radius: 16px; background: #FEE2E2; color: #B91C1C; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.18);">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="28" height="28"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
            </div>
            <div style="flex: 1; min-width: 0;">
                <p style="font-size: 0.82rem; color: #64748B; margin-bottom: 6px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;">TOTAL PENGELUARAN BELANJA</p>
                <h3 style="font-size: 1.65rem; font-weight: 800; color: #B91C1C; margin: 0; line-height: 1.2; white-space: nowrap;">${fRupiah(totalAll)}</h3>
                <small style="font-size: 0.75rem; color: #94A3B8; margin-top: 5px; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${filterInfo}">${filterInfo}</small>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

// 4. Modal Operations
function openBelanjaModal() {
    const form = document.getElementById('belanjaForm');
    if (form) form.reset();
    
    const idEl = document.getElementById('belanja_id');
    if (idEl) idEl.value = '';
    
    const tglEl = document.getElementById('belanja_tanggal');
    if (tglEl) tglEl.value = new Date().toISOString().split('T')[0];
    
    const titleEl = document.getElementById('belanjaModalTitle');
    if (titleEl) titleEl.textContent = 'Catat Belanja & Operasional';
    
    // Reset list item belanjaan ke 1 baris kosong
    const container = document.getElementById('belanjaItemsContainer');
    if (container) {
        container.innerHTML = `
            <div class="belanja-item-row" style="display: flex; gap: 8px; margin-bottom: 8px; align-items: center;">
                <input type="text" class="belanja-item-input form-group" style="margin: 0; flex: 1;" placeholder="Misal: Belanja sayur" required>
            </div>
        `;
    }

    const totalDisplay = document.getElementById('belanja_total_harga_display');
    const totalVal = document.getElementById('belanja_total_harga');
    if (totalDisplay) totalDisplay.value = '';
    if (totalVal) totalVal.value = '';

    const overlay = document.getElementById('belanjaModalOverlay');
    if (overlay) overlay.classList.add('active');
}

function closeBelanjaModal() {
    const overlay = document.getElementById('belanjaModalOverlay');
    if (overlay) overlay.classList.remove('active');
}

function editBelanja(id) {
    const t = allTransaksiBelanja.find(x => x.id === id);
    if (!t) return;
    
    document.getElementById('belanja_id').value = t.id;
    document.getElementById('belanja_tanggal').value = t.tanggal;
    
    // Isi kembali rincian item belanjaan
    const container = document.getElementById('belanjaItemsContainer');
    if (container) {
        container.innerHTML = '';
        const rawItems = (t.item_nama || '').split(/,\s*|\n+/).map(s => s.trim()).filter(Boolean);
        if (rawItems.length === 0) {
            container.innerHTML = `
                <div class="belanja-item-row" style="display: flex; gap: 8px; margin-bottom: 8px; align-items: center;">
                    <input type="text" class="belanja-item-input form-group" style="margin: 0; flex: 1;" placeholder="Misal: Belanja sayur" required>
                </div>
            `;
        } else {
            rawItems.forEach((itemText, idx) => {
                if (idx === 0) {
                    const row = document.createElement('div');
                    row.className = 'belanja-item-row';
                    row.style.cssText = 'display: flex; gap: 8px; margin-bottom: 8px; align-items: center;';
                    row.innerHTML = `
                        <input type="text" class="belanja-item-input form-group" style="margin: 0; flex: 1;" placeholder="Misal: Belanja sayur" value="${itemText.replace(/"/g, '&quot;')}" required>
                    `;
                    container.appendChild(row);
                } else {
                    addBelanjaItemRow(itemText);
                }
            });
        }
    }

    // Set jumlah total harga
    const tot = Number(t.total_harga || 0);
    const hiddenTot = document.getElementById('belanja_total_harga');
    const displayTot = document.getElementById('belanja_total_harga_display');
    if (hiddenTot) hiddenTot.value = tot;
    if (displayTot) displayTot.value = tot > 0 ? tot.toLocaleString('id-ID') : '';

    const ketEl = document.getElementById('belanja_keterangan');
    if (ketEl) ketEl.value = t.keterangan || '';
    
    document.getElementById('belanjaModalTitle').textContent = 'Edit Catatan Belanja';
    const overlay = document.getElementById('belanjaModalOverlay');
    if (overlay) overlay.classList.add('active');
}

async function saveBelanja(e) {
    e.preventDefault();
    const id = document.getElementById('belanja_id').value;
    const btn = document.getElementById('btnSimpanBelanja');
    
    // Kumpulkan semua input item
    const itemInputs = document.querySelectorAll('.belanja-item-input');
    const items = [];
    itemInputs.forEach(inp => {
        const val = inp.value.trim();
        if (val) items.push(val);
    });

    if (items.length === 0) {
        showToast('Mohon masukkan minimal 1 barang/belanjaan.', 'warning');
        return;
    }

    const rawTotal = document.getElementById('belanja_total_harga').value;
    const totalHarga = parseFloat(rawTotal) || 0;
    if (totalHarga <= 0) {
        showToast('Mohon masukkan jumlah harga total pengeluaran.', 'warning');
        const disp = document.getElementById('belanja_total_harga_display');
        if (disp) disp.focus();
        return;
    }

    const itemNamaMerged = items.join(', ');

    const payload = {
        tanggal: document.getElementById('belanja_tanggal').value,
        kategori_id: null,
        item_nama: itemNamaMerged,
        qty: 1,
        satuan: null,
        harga_satuan: totalHarga,
        total_harga: totalHarga,
        keterangan: document.getElementById('belanja_keterangan').value || null
    };
    
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = 'Menyimpan...';
    }
    
    const sb = getSupabase();
    if (!sb) {
        showToast('Sistem database belum siap', 'error');
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = 'Simpan Transaksi Belanja';
        }
        return;
    }

    let err = null;
    if (id) {
        const { error } = await sb.from('transaksi_belanja').update(payload).eq('id', id);
        err = error;
    } else {
        const { error } = await sb.from('transaksi_belanja').insert(payload);
        err = error;
    }
    
    if (btn) {
        btn.disabled = false;
        btn.innerHTML = 'Simpan Transaksi Belanja';
    }
    
    if (err) {
        showToast('Gagal menyimpan belanja: ' + err.message, 'error');
    } else {
        if (typeof showToast === 'function') {
            showToast('Transaksi belanja berhasil disimpan!', 'success');
        }
        closeBelanjaModal();
        loadTransaksiBelanja(); // reload data belanja
        if (typeof filterSpp === 'function') {
            filterSpp(); // refresh statistik spp jika sedang terbuka
        }
        if (typeof loadRiwayatKeuangan === 'function') {
            loadRiwayatKeuangan(); // sinkronkan riwayat transaksi
        }
    }
}

async function deleteBelanja(id) {
    const doDelete = async () => {
        const sb = getSupabase();
        if (!sb) return;
        const { error } = await sb.from('transaksi_belanja').delete().eq('id', id);
        if (error) {
            if (typeof showToast === 'function') {
                showToast('Gagal menghapus: ' + error.message, 'error');
            } else {
                console.error('Gagal menghapus: ' + error.message);
            }
        } else {
            if (typeof showToast === 'function') {
                showToast('Transaksi belanja berhasil dihapus!', 'success');
            }
            loadTransaksiBelanja();
            if (typeof filterSpp === 'function') {
                filterSpp();
            }
            if (typeof loadRiwayatKeuangan === 'function') {
                loadRiwayatKeuangan();
            }
        }
    };

    if (typeof showCustomConfirm === 'function') {
        const ok = await showCustomConfirm(
            'Hapus Belanja',
            'Yakin ingin menghapus catatan belanja ini? Data yang dihapus tidak bisa dikembalikan.',
            { confirmText: 'Hapus', cancelText: 'Batal', type: 'danger' }
        );
        if (ok) doDelete();
    } else {
        doDelete();
    }
}

// 5. Cetak Laporan Belanja
function printLaporanBelanja() {
    let dataToPrint = lastFilteredBelanja.length > 0 ? lastFilteredBelanja : allTransaksiBelanja;
    
    if (dataToPrint.length === 0) {
        if (typeof showToast === 'function') {
            showToast('Tidak ada data belanja untuk dicetak.', 'warning');
        }
        return;
    }

    let totalKeseluruhan = 0;
    
    let thead = `<tr>
        <th style="border:1px solid #000; padding:8px; width:40px;">No</th>
        <th style="border:1px solid #000; padding:8px; width:110px;">Tanggal</th>
        <th style="border:1px solid #000; padding:8px;">Daftar Belanja / Item</th>
        <th style="border:1px solid #000; padding:8px; width:160px;">Keterangan</th>
        <th style="border:1px solid #000; padding:8px; width:140px; text-align:right;">Total Pengeluaran</th>
    </tr>`;
    
    let tbody = '';
    dataToPrint.forEach((t, i) => {
        totalKeseluruhan += Number(t.total_harga || 0);
        tbody += `<tr>
            <td style="border:1px solid #000; padding:8px; text-align:center;">${i+1}</td>
            <td style="border:1px solid #000; padding:8px;">${formatTanggal(t.tanggal)}</td>
            <td style="border:1px solid #000; padding:8px; font-weight:600;">${t.item_nama || '-'}</td>
            <td style="border:1px solid #000; padding:8px;">${t.keterangan || '-'}</td>
            <td style="border:1px solid #000; padding:8px; text-align:right; font-weight:bold; color:#B91C1C;">${fRupiah(t.total_harga)}</td>
        </tr>`;
    });
    
    let tfoot = `<tr>
        <th colspan="4" style="border:1px solid #000; padding:10px 8px; text-align:right; font-size:1rem;">TOTAL PENGELUARAN</th>
        <th style="border:1px solid #000; padding:10px 8px; text-align:right; font-size:1.1rem; color:#B91C1C;">${fRupiah(totalKeseluruhan)}</th>
    </tr>`;
    
    const now = new Date();
    const dateStr = now.getDate() + ' ' + now.toLocaleString('id-ID', { month: 'long' }) + ' ' + now.getFullYear();

    // Info filter aktif
    const fBulan = document.getElementById('filterBulanBelanja')?.value || '';
    const fTahun = document.getElementById('filterTahunBelanja')?.value || '';
    const fTgl = document.getElementById('filterTglBelanja')?.value || '';
    let infoPeriode = '';
    if (fTgl) infoPeriode = `Tanggal: ${formatTanggal(fTgl)}`;
    else if (fBulan && fTahun) infoPeriode = `Periode: ${namaBulanMap[fBulan] || fBulan} ${fTahun}`;
    else if (fBulan) infoPeriode = `Bulan: ${namaBulanMap[fBulan] || fBulan}`;
    else if (fTahun) infoPeriode = `Tahun: ${fTahun}`;
    else infoPeriode = 'Semua Periode';

    let printHtml = `
        <div style="font-family: 'Times New Roman', Times, serif; padding: 20px; color: #111827; background: white;">
          <!-- KOP SURAT -->
          <div style="text-align: center; margin-bottom: 16px;">
            <img src="img/kop_surat.jpg" alt="Kop Surat Pondok Pesantren Al-Fathonah" style="width: 100%; max-width: 750px; height: auto;" onerror="this.style.display='none'">
          </div>

          <!-- JUDUL LAPORAN -->
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="font-size: 1.25rem; font-weight: bold; text-decoration: underline; text-transform: uppercase; margin: 0 0 4px 0;">
              LAPORAN PENGELUARAN BELANJA & OPERASIONAL
            </h2>
            <p style="margin: 4px 0 0 0; font-size: 0.95rem; font-weight: 600; color: #4B5563;">${infoPeriode} &mdash; ${dataToPrint.length} Transaksi</p>
          </div>

          <!-- TABEL DATA -->
          <table style="width:100%; border-collapse:collapse; font-family: sans-serif; font-size:0.9rem; margin-bottom: 30px;">
            <thead>${thead}</thead>
            <tbody>${tbody}</tbody>
            <tfoot>${tfoot}</tfoot>
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
    
    if (typeof doPrint === 'function') {
        doPrint(printHtml, 'portrait');
    } else {
        const win = window.open('', '_blank');
        if (win) {
            win.document.write(`<html><head><title>Cetak Laporan Belanja</title></head><body>${printHtml}</body></html>`);
            win.document.close();
            win.print();
        }
    }
}
