// riwayat-pemasukan.js - Menangani filter laporan Riwayat Keuangan (Pemasukan & Pengeluaran)

let allRiwayatKeuangan = [];

document.addEventListener('DOMContentLoaded', () => {
    // Default: kosongkan filter tanggal spesifik agar menampilkan seluruh riwayat
    const tglEl = document.getElementById('filterTglPemasukan');
    if (tglEl) tglEl.value = '';
    
    // Set default tahun jika ada
    const thnEl = document.getElementById('filterTahunPemasukan');
    if (thnEl && !thnEl.value) {
        thnEl.value = new Date().getFullYear().toString();
    }
    
    // Tunggu sampai Supabase client siap
    setTimeout(() => {
        if (typeof getSupabase !== 'undefined' && getSupabase()) {
            loadRiwayatKeuangan();
        }
    }, 1200);
});

// Format Rupiah fallback
function rPemasukanRupiah(angka) {
    if (typeof formatRupiah === 'function') return formatRupiah(angka);
    return 'Rp ' + Number(angka || 0).toLocaleString('id-ID');
}

// Menghitung tanggal awal dan akhir bulan secara akurat (mencegah bug tanggal 31 Februari)
function getMonthDateRange(year, monthStr) {
    const y = parseInt(year, 10) || new Date().getFullYear();
    const m = parseInt(monthStr, 10);
    const lastDay = new Date(y, m, 0).getDate();
    const mm = String(m).padStart(2, '0');
    return {
        start: `${y}-${mm}-01`,
        end: `${y}-${mm}-${String(lastDay).padStart(2, '0')}`
    };
}

async function loadRiwayatKeuangan() {
    const sb = getSupabase();
    if (!sb) return;
    const tbody = document.getElementById('riwayatPemasukanTableBody');
    if (!tbody) return;
    
    const tgl = document.getElementById('filterTglPemasukan') ? document.getElementById('filterTglPemasukan').value : '';
    const bulan = document.getElementById('filterBulanPemasukan') ? document.getElementById('filterBulanPemasukan').value : '';
    const tahun = document.getElementById('filterTahunPemasukan') ? document.getElementById('filterTahunPemasukan').value : '';
    const jenisFilter = document.getElementById('filterJenisRiwayat') ? document.getElementById('filterJenisRiwayat').value : '';
    
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:40px; color:#9CA3AF;">Memuat seluruh riwayat transaksi (masuk & keluar)...</td></tr>';
    
    // 1. Fetch pembayaran_bulanan (SPP, Infaq, Jajan, Tagihan Lainnya)
    let queryBayar = sb
        .from('pembayaran_bulanan')
        .select(`
            id, tgl_bayar, nominal, metode, keterangan, jenis_transaksi, created_at,
            data_induk_santri ( nama, nis ),
            tagihan_bulanan ( * )
        `)
        .order('tgl_bayar', { ascending: false })
        .limit(5000);

    if (jenisFilter === 'Pemasukan') {
        queryBayar = queryBayar.or('jenis_transaksi.eq.Pemasukan,jenis_transaksi.is.null');
    } else if (jenisFilter === 'Pengeluaran') {
        queryBayar = queryBayar.eq('jenis_transaksi', 'Pengeluaran');
    }

    if (tgl) {
        queryBayar = queryBayar.eq('tgl_bayar', tgl);
    } else {
        if (tahun && bulan) {
            const range = getMonthDateRange(tahun, bulan);
            queryBayar = queryBayar.gte('tgl_bayar', range.start).lte('tgl_bayar', range.end);
        } else if (tahun) {
            queryBayar = queryBayar.gte('tgl_bayar', `${tahun}-01-01`).lte('tgl_bayar', `${tahun}-12-31`);
        } else if (bulan) {
            const y = new Date().getFullYear();
            const range = getMonthDateRange(y, bulan);
            queryBayar = queryBayar.gte('tgl_bayar', range.start).lte('tgl_bayar', range.end);
        }
    }

    const { data: dataBayar, error: errorBayar } = await queryBayar;
    if (errorBayar) {
        console.error('Error load pembayaran_bulanan:', errorBayar);
    }

    // 2. Fetch transaksi_belanja (Belanja & Pengeluaran Operasional Pondok)
    let belanjaRows = [];
    if (jenisFilter !== 'Pemasukan') {
        let queryBelanja = sb
            .from('transaksi_belanja')
            .select(`
                id, tanggal, item_nama, total_harga, keterangan, created_at,
                kategori_belanja ( nama_kategori )
            `)
            .order('tanggal', { ascending: false })
            .limit(5000);

        if (tgl) {
            queryBelanja = queryBelanja.eq('tanggal', tgl);
        } else {
            if (tahun && bulan) {
                const range = getMonthDateRange(tahun, bulan);
                queryBelanja = queryBelanja.gte('tanggal', range.start).lte('tanggal', range.end);
            } else if (tahun) {
                queryBelanja = queryBelanja.gte('tanggal', `${tahun}-01-01`).lte('tanggal', `${tahun}-12-31`);
            } else if (bulan) {
                const y = new Date().getFullYear();
                const range = getMonthDateRange(y, bulan);
                queryBelanja = queryBelanja.gte('tanggal', range.start).lte('tanggal', range.end);
            }
        }

        const { data: dataBelanja, error: errorBelanja } = await queryBelanja;
        if (!errorBelanja && dataBelanja) {
            belanjaRows = dataBelanja.map(b => ({
                id: 'belanja_' + b.id,
                tgl_bayar: b.tanggal,
                nominal: b.total_harga,
                metode: 'Kas Pondok',
                keterangan: b.item_nama + (b.keterangan ? ` (${b.keterangan})` : ''),
                jenis_transaksi: 'Pengeluaran',
                data_induk_santri: { nama: 'Operasional Pondok' },
                tagihan_bulanan: {
                    kategori: 'Belanja & Operasional',
                    keterangan: b.kategori_belanja ? b.kategori_belanja.nama_kategori : 'Operasional',
                    bulan: '',
                    tahun: ''
                },
                created_at: b.created_at
            }));
        } else if (errorBelanja) {
            console.error('Error load transaksi_belanja:', errorBelanja);
        }
    }

    // Gabungkan seluruh transaksi (pembayaran_bulanan + transaksi_belanja)
    const combined = [...(dataBayar || []), ...belanjaRows];
    combined.sort((a, b) => {
        const da = new Date(a.tgl_bayar || a.created_at);
        const db = new Date(b.tgl_bayar || b.created_at);
        return db - da;
    });

    allRiwayatKeuangan = combined;
    renderRiwayatKeuanganTable();
}

window.loadRiwayatPemasukan = loadRiwayatKeuangan;
window.loadRiwayatKeuangan = loadRiwayatKeuangan;

function renderRiwayatKeuanganTable() {
    const tbody = document.getElementById('riwayatPemasukanTableBody');
    const statTotalPemasukan = document.getElementById('statRiwayatTotalPemasukan');
    const statTotalPengeluaran = document.getElementById('statRiwayatTotalPengeluaran');
    const statSisaSaldo = document.getElementById('statRiwayatSisaSaldo');
    const statCount = document.getElementById('statRiwayatTotalTransaksi');
    
    if (allRiwayatKeuangan.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:40px; color:#9CA3AF;">Belum ada catatan transaksi pada filter ini.</td></tr>';
        if(statTotalPemasukan) statTotalPemasukan.textContent = 'Rp 0';
        if(statTotalPengeluaran) statTotalPengeluaran.textContent = 'Rp 0';
        if(statSisaSaldo) statSisaSaldo.textContent = 'Rp 0';
        if(statCount) statCount.textContent = '0 Transaksi';
        return;
    }
    
    let html = '';
    let totalPemasukan = 0;
    let totalPengeluaran = 0;
    
    allRiwayatKeuangan.forEach((t, i) => {
        const nominal = Number(t.nominal || 0);
        const isPemasukan = !t.jenis_transaksi || t.jenis_transaksi === 'Pemasukan';
        
        if (isPemasukan) {
            totalPemasukan += nominal;
        } else {
            totalPengeluaran += nominal;
        }
        
        const santriNama = t.data_induk_santri ? t.data_induk_santri.nama : '-';
        const namaKat = (t.tagihan_bulanan && t.tagihan_bulanan.kategori === 'Lainnya' && t.tagihan_bulanan.keterangan)
            ? t.tagihan_bulanan.keterangan
            : (t.tagihan_bulanan ? t.tagihan_bulanan.kategori : '-');
        const periodeInfo = (t.tagihan_bulanan && t.tagihan_bulanan.bulan && t.tagihan_bulanan.tahun) ? ` (${t.tagihan_bulanan.bulan} ${t.tagihan_bulanan.tahun})` : '';
        const tagihanKat = t.tagihan_bulanan ? `${namaKat}${periodeInfo}` : '-';
        const ket = t.keterangan ? `<br><small style="color:#6B7280">${t.keterangan}</small>` : '';
        
        // Badge jenis transaksi
        const jenisBadge = isPemasukan 
            ? `<span style="background: #D1FAE5; color: #047857; padding: 3px 10px; border-radius: 12px; font-size: 0.78rem; font-weight: 700;">Masuk (+)</span>`
            : `<span style="background: #FEE2E2; color: #B91C1C; padding: 3px 10px; border-radius: 12px; font-size: 0.78rem; font-weight: 700;">Keluar (-)</span>`;
        
        const nominalColor = isPemasukan ? '#047857' : '#DC2626';
        const nominalPrefix = isPemasukan ? '+ ' : '- ';
        
        html += `
            <tr>
                <td style="text-align:center;">${i + 1}</td>
                <td>${formatTanggalRiwayat(t.tgl_bayar)}</td>
                <td style="font-weight: 600;">${santriNama}</td>
                <td style="text-align:center;">${jenisBadge}</td>
                <td style="font-weight: bold; color: ${nominalColor};">${nominalPrefix}${rPemasukanRupiah(nominal)}</td>
                <td style="text-align:center;"><span style="background: #F3F4F6; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem;">${t.metode || 'Tunai'}</span></td>
                <td>
                    <div style="font-size: 0.85rem; font-weight: 500;">${tagihanKat}</div>
                    ${ket}
                </td>
                <td style="text-align:center;">
                    <button type="button" class="btn-action btn-delete" onclick="deleteRiwayatItem('${t.id}')" title="Hapus Transaksi" style="width:30px; height:30px; border-radius:8px; display:inline-flex; align-items:center; justify-content:center; margin:0 auto;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
    
    if(statTotalPemasukan) statTotalPemasukan.textContent = rPemasukanRupiah(totalPemasukan);
    if(statTotalPengeluaran) statTotalPengeluaran.textContent = rPemasukanRupiah(totalPengeluaran);
    if(statSisaSaldo) {
        const saldoBersih = totalPemasukan - totalPengeluaran;
        statSisaSaldo.textContent = (saldoBersih < 0 ? '- ' : '') + rPemasukanRupiah(Math.abs(saldoBersih));
        statSisaSaldo.style.color = saldoBersih >= 0 ? '#10B981' : '#EF4444';
    }
    if(statCount) statCount.textContent = `${allRiwayatKeuangan.length} Transaksi`;
}

// Hapus transaksi langsung dari tabel Semua Riwayat Transaksi
async function deleteRiwayatItem(id) {
    if (!id) return;
    const ok = await showCustomConfirm(
        'Hapus Transaksi', 
        'Apakah Anda yakin ingin menghapus catatan transaksi ini? Saldo dan riwayat akan otomatis disinkronkan.',
        { confirmText: 'Ya, Hapus', type: 'danger' }
    );
    if (!ok) return;

    const sb = getSupabase();
    if (!sb) return;

    try {
        if (String(id).startsWith('belanja_')) {
            const rawId = String(id).replace('belanja_', '');
            const { error } = await sb.from('transaksi_belanja').delete().eq('id', rawId);
            if (error) throw error;
        } else {
            const { error } = await sb.from('pembayaran_bulanan').delete().eq('id', id);
            if (error) throw error;
        }

        if (typeof showToast === 'function') {
            showToast('Transaksi berhasil dihapus dari sistem', 'success');
        }
        
        // Refresh tabel riwayat
        loadRiwayatKeuangan();

        // Refresh modul terkait jika sedang aktif
        if (typeof loadTransaksiBelanja === 'function') loadTransaksiBelanja();
        if (typeof loadTagihan === 'function') loadTagihan();
        if (typeof currentTagihanId !== 'undefined' && currentTagihanId && typeof loadDetailTagihan === 'function') {
            loadDetailTagihan(currentTagihanId);
        }
    } catch (err) {
        console.error('Error delete riwayat item:', err);
        if (typeof showToast === 'function') {
            showToast('Gagal menghapus transaksi: ' + (err.message || 'Error database'), 'error');
        }
    }
}
window.deleteRiwayatItem = deleteRiwayatItem;

function resetFilterRiwayat() {
    const tglEl = document.getElementById('filterTglPemasukan');
    const blnEl = document.getElementById('filterBulanPemasukan');
    const thnEl = document.getElementById('filterTahunPemasukan');
    const jnsEl = document.getElementById('filterJenisRiwayat');
    
    if (tglEl) tglEl.value = '';
    if (blnEl) blnEl.value = '';
    if (jnsEl) jnsEl.value = '';
    if (thnEl) thnEl.value = new Date().getFullYear().toString();
    
    loadRiwayatKeuangan();
}
window.resetFilterRiwayat = resetFilterRiwayat;

function formatTanggalRiwayat(tglStr) {
    if (!tglStr) return '-';
    const parts = tglStr.split('-');
    if (parts.length !== 3) return tglStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function printRiwayatPemasukan() {
    if (allRiwayatKeuangan.length === 0) {
        if (typeof showToast === 'function') {
            showToast('Tidak ada data transaksi untuk dicetak.', 'warning');
        }
        return;
    }
    
    const tgl = document.getElementById('filterTglPemasukan') ? document.getElementById('filterTglPemasukan').value : '';
    const blnEl = document.getElementById('filterBulanPemasukan');
    const bulan = blnEl ? blnEl.options[blnEl.selectedIndex].text : 'Semua Bulan';
    const thnEl = document.getElementById('filterTahunPemasukan');
    const tahun = thnEl ? thnEl.value : 'Semua Tahun';
    const jenisFilter = document.getElementById('filterJenisRiwayat') ? document.getElementById('filterJenisRiwayat').value : '';
    
    let infoPeriode = '';
    if (tgl) {
        infoPeriode = `Tanggal: ${formatTanggalRiwayat(tgl)}`;
    } else {
        infoPeriode = `Periode: ${bulan !== 'Semua Bulan' ? bulan : ''} ${tahun !== 'Semua Tahun' ? tahun : ''}`.trim() || 'Semua Periode';
    }
    
    let infoJenis = jenisFilter ? `Jenis: ${jenisFilter}` : 'Jenis: Seluruh Transaksi (Pemasukan & Pengeluaran)';

    let totalPemasukan = 0;
    let totalPengeluaran = 0;
    
    let thead = `<tr>
        <th style="border:1px solid #000; padding:8px; text-align:center;">No</th>
        <th style="border:1px solid #000; padding:8px;">Tanggal</th>
        <th style="border:1px solid #000; padding:8px;">Nama / Pihak</th>
        <th style="border:1px solid #000; padding:8px; text-align:center;">Jenis</th>
        <th style="border:1px solid #000; padding:8px;">Kategori / Keterangan</th>
        <th style="border:1px solid #000; padding:8px; text-align:center;">Metode</th>
        <th style="border:1px solid #000; padding:8px; text-align:right;">Nominal</th>
    </tr>`;
    
    let tbody = '';
    allRiwayatKeuangan.forEach((t, i) => {
        const nominal = Number(t.nominal || 0);
        const isPemasukan = !t.jenis_transaksi || t.jenis_transaksi === 'Pemasukan';
        
        if (isPemasukan) {
            totalPemasukan += nominal;
        } else {
            totalPengeluaran += nominal;
        }
        
        const santriNama = t.data_induk_santri ? t.data_induk_santri.nama : '-';
        const namaKat = (t.tagihan_bulanan && t.tagihan_bulanan.kategori === 'Lainnya' && t.tagihan_bulanan.keterangan)
            ? t.tagihan_bulanan.keterangan
            : (t.tagihan_bulanan ? t.tagihan_bulanan.kategori : '-');
        const periodeInfo = (t.tagihan_bulanan && t.tagihan_bulanan.bulan && t.tagihan_bulanan.tahun) ? ` (${t.tagihan_bulanan.bulan} ${t.tagihan_bulanan.tahun})` : '';
        const tagihanKat = t.tagihan_bulanan ? `${namaKat}${periodeInfo}` : '-';
        const ket = t.keterangan ? ` - ${t.keterangan}` : '';
        const jenisLabel = isPemasukan ? 'Pemasukan' : 'Pengeluaran';
        const prefix = isPemasukan ? '+ ' : '- ';

        tbody += `<tr>
            <td style="border:1px solid #000; padding:8px; text-align:center;">${i + 1}</td>
            <td style="border:1px solid #000; padding:8px;">${formatTanggalRiwayat(t.tgl_bayar)}</td>
            <td style="border:1px solid #000; padding:8px;">${santriNama}</td>
            <td style="border:1px solid #000; padding:8px; text-align:center;">${jenisLabel}</td>
            <td style="border:1px solid #000; padding:8px;">${tagihanKat}${ket}</td>
            <td style="border:1px solid #000; padding:8px; text-align:center;">${t.metode || 'Tunai'}</td>
            <td style="border:1px solid #000; padding:8px; text-align:right; font-weight:bold;">${prefix}${rPemasukanRupiah(nominal)}</td>
        </tr>`;
    });
    
    const saldoAkhir = totalPemasukan - totalPengeluaran;

    const printContainer = document.getElementById('printAreaRiwayatKeuangan');
    if (!printContainer) return;
    
    printContainer.innerHTML = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #000;">
            <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 16px;">
                <h2 style="margin: 0 0 4px 0; font-size: 1.3rem;">REKAPITULASI SELURUH RIWAYAT TRANSAKSI KEUANGAN</h2>
                <h3 style="margin: 0 0 6px 0; font-size: 1.1rem;">PONDOK PESANTREN AL-FATHONAH</h3>
                <p style="margin: 0; font-size: 0.9rem; color: #4B5563;">${infoPeriode} | ${infoJenis}</p>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 14px; font-size: 0.9rem;">
                <div><strong>Total Pemasukan:</strong> ${rPemasukanRupiah(totalPemasukan)}</div>
                <div><strong>Total Pengeluaran:</strong> ${rPemasukanRupiah(totalPengeluaran)}</div>
                <div><strong>Sisa Saldo Kas:</strong> ${rPemasukanRupiah(saldoAkhir)}</div>
            </div>

            <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; margin-bottom: 24px;">
                <thead>${thead}</thead>
                <tbody>${tbody}</tbody>
            </table>
            
            <div style="display: flex; justify-content: flex-end; margin-top: 30px;">
                <div style="text-align: center; width: 200px;">
                    <p style="margin-bottom: 60px;">Dicetak Tanggal: ${new Date().toLocaleDateString('id-ID')}<br>Bendahara Pesantren,</p>
                    <p style="font-weight: bold; text-decoration: underline; margin: 0;">( ELIANA )</p>
                </div>
            </div>
        </div>
    `;

    window.print();
}
