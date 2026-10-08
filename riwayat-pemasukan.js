// riwayat-pemasukan.js - Menangani filter laporan Riwayat Keuangan (Pemasukan & Pengeluaran)

let allRiwayatKeuangan = [];

document.addEventListener('DOMContentLoaded', () => {
    // Set default filter tanggal ke hari ini
    document.getElementById('filterTglPemasukan').value = new Date().toISOString().split('T')[0];
    
    // Tunggu sampai Supabase client siap
    setTimeout(() => {
        if (typeof getSupabase !== 'undefined' && getSupabase()) {
            loadRiwayatPemasukan();
        }
    }, 1500);
});

// Format Rupiah fallback
function rPemasukanRupiah(angka) {
    if (typeof formatRupiah === 'function') return formatRupiah(angka);
    return 'Rp ' + Number(angka).toLocaleString('id-ID');
}

async function loadRiwayatKeuangan() {
    const sb = getSupabase();
    if (!sb) return;
    const tbody = document.getElementById('riwayatPemasukanTableBody');
    if (!tbody) return;
    
    const tgl = document.getElementById('filterTglPemasukan').value;
    const bulan = document.getElementById('filterBulanPemasukan').value;
    const tahun = document.getElementById('filterTahunPemasukan').value;
    const jenisFilter = document.getElementById('filterJenisRiwayat') ? document.getElementById('filterJenisRiwayat').value : '';
    
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:40px; color:#9CA3AF;">Memuat seluruh riwayat transaksi...</td></tr>';
    
    // 1. Fetch pembayaran_bulanan (SPP, Infaq, Jajan, dll)
    let queryBayar = sb
        .from('pembayaran_bulanan')
        .select(`
            id, tgl_bayar, nominal, metode, keterangan, jenis_transaksi, created_at,
            data_induk_santri ( nama, nis ),
            tagihan_bulanan ( * )
        `)
        .order('tgl_bayar', { ascending: false });

    if (jenisFilter) {
        queryBayar = queryBayar.eq('jenis_transaksi', jenisFilter);
    }
    if (tgl) {
        queryBayar = queryBayar.eq('tgl_bayar', tgl);
    } else {
        if (tahun && bulan) {
            queryBayar = queryBayar.gte('tgl_bayar', `${tahun}-${bulan}-01`).lte('tgl_bayar', `${tahun}-${bulan}-31`);
        } else if (tahun) {
            queryBayar = queryBayar.gte('tgl_bayar', `${tahun}-01-01`).lte('tgl_bayar', `${tahun}-12-31`);
        } else if (bulan) {
            const y = new Date().getFullYear();
            queryBayar = queryBayar.gte('tgl_bayar', `${y}-${bulan}-01`).lte('tgl_bayar', `${y}-${bulan}-31`);
        }
    }

    const { data: dataBayar, error: errorBayar } = await queryBayar;
    if (errorBayar) {
        console.error('Error load pembayaran_bulanan:', errorBayar);
    }

    // 2. Fetch transaksi_belanja (Belanja Operasional Pondok - Jenis Pengeluaran)
    let belanjaRows = [];
    if (jenisFilter !== 'Pemasukan') {
        let queryBelanja = sb
            .from('transaksi_belanja')
            .select(`
                id, tanggal, item_nama, total_harga, keterangan, created_at,
                kategori_belanja ( nama_kategori )
            `)
            .order('tanggal', { ascending: false });

        if (tgl) {
            queryBelanja = queryBelanja.eq('tanggal', tgl);
        } else {
            if (tahun && bulan) {
                queryBelanja = queryBelanja.gte('tanggal', `${tahun}-${bulan}-01`).lte('tanggal', `${tahun}-${bulan}-31`);
            } else if (tahun) {
                queryBelanja = queryBelanja.gte('tanggal', `${tahun}-01-01`).lte('tanggal', `${tahun}-12-31`);
            } else if (bulan) {
                const y = new Date().getFullYear();
                queryBelanja = queryBelanja.gte('tanggal', `${y}-${bulan}-01`).lte('tanggal', `${y}-${bulan}-31`);
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
        }
    }

    // Gabungkan seluruh transaksi dan urutkan berdasarkan tanggal terbaru
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
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:40px; color:#9CA3AF;">Tidak ada transaksi pada filter ini.</td></tr>';
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
        const nominal = Number(t.nominal);
        const isPemasukan = t.jenis_transaksi === 'Pemasukan';
        
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
            ? `<span style="background: #D1FAE5; color: #047857; padding: 3px 10px; border-radius: 12px; font-size: 0.78rem; font-weight: 600;">Pemasukan</span>`
            : `<span style="background: #FEE2E2; color: #B91C1C; padding: 3px 10px; border-radius: 12px; font-size: 0.78rem; font-weight: 600;">Pengeluaran</span>`;
        
        const nominalColor = isPemasukan ? '#047857' : '#DC2626';
        const nominalPrefix = isPemasukan ? '+' : '-';
        
        html += `
            <tr>
                <td style="text-align:center;">${i + 1}</td>
                <td>${formatTanggalRiwayat(t.tgl_bayar)}</td>
                <td style="font-weight: 600;">${santriNama}</td>
                <td>${jenisBadge}</td>
                <td style="font-weight: bold; color: ${nominalColor};">${nominalPrefix} ${rPemasukanRupiah(nominal)}</td>
                <td><span style="background: #F3F4F6; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem;">${t.metode || 'Tunai'}</span></td>
                <td>
                    <div style="font-size: 0.85rem; font-weight: 500;">${tagihanKat}</div>
                    ${ket}
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
    
    if(statTotalPemasukan) statTotalPemasukan.textContent = rPemasukanRupiah(totalPemasukan);
    if(statTotalPengeluaran) statTotalPengeluaran.textContent = rPemasukanRupiah(totalPengeluaran);
    if(statSisaSaldo) statSisaSaldo.textContent = rPemasukanRupiah(totalPemasukan - totalPengeluaran);
    if(statCount) statCount.textContent = `${allRiwayatKeuangan.length} Transaksi`;
}

function formatTanggalRiwayat(tglStr) {
    if (!tglStr) return '-';
    const parts = tglStr.split('-');
    if (parts.length !== 3) return tglStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function printRiwayatPemasukan() {
    if (allRiwayatKeuangan.length === 0) {
        if (typeof showToast === 'function') {
            showToast('Tidak ada data untuk dicetak.', 'warning');
        }
        return;
    }
    
    const tgl = document.getElementById('filterTglPemasukan').value;
    const bulan = document.getElementById('filterBulanPemasukan').options[document.getElementById('filterBulanPemasukan').selectedIndex].text;
    const tahun = document.getElementById('filterTahunPemasukan').value;
    const jenisFilter = document.getElementById('filterJenisRiwayat') ? document.getElementById('filterJenisRiwayat').value : '';
    
    let infoPeriode = '';
    if(tgl) {
        infoPeriode = `Tanggal: ${formatTanggalRiwayat(tgl)}`;
    } else {
        infoPeriode = `Periode: ${bulan !== 'Semua Bulan' ? bulan : ''} ${tahun !== 'Semua Tahun' ? tahun : ''}`;
    }
    
    let infoJenis = jenisFilter ? `Jenis: ${jenisFilter}` : 'Jenis: Semua (Pemasukan & Pengeluaran)';

    let totalPemasukan = 0;
    let totalPengeluaran = 0;
    
    let thead = `<tr>
        <th style="border:1px solid #000; padding:8px;">No</th>
        <th style="border:1px solid #000; padding:8px;">Tanggal</th>
        <th style="border:1px solid #000; padding:8px;">Nama Santri</th>
        <th style="border:1px solid #000; padding:8px;">Jenis</th>
        <th style="border:1px solid #000; padding:8px;">Kategori / Keterangan</th>
        <th style="border:1px solid #000; padding:8px;">Metode</th>
        <th style="border:1px solid #000; padding:8px;">Nominal</th>
    </tr>`;
    
    let tbody = '';
    allRiwayatKeuangan.forEach((t, i) => {
        const nominal = Number(t.nominal);
        const isPemasukan = t.jenis_transaksi === 'Pemasukan';
        
        if (isPemasukan) {
            totalPemasukan += nominal;
        } else {
            totalPengeluaran += nominal;
        }
        
        const santriNama = t.data_induk_santri ? t.data_induk_santri.nama : '-';
        const namaKat = (t.tagihan_bulanan && t.tagihan_bulanan.kategori === 'Lainnya' && t.tagihan_bulanan.keterangan)
            ? `${t.tagihan_bulanan.keterangan} (Lainnya)`
            : (t.tagihan_bulanan ? t.tagihan_bulanan.kategori : '-');
        const tagihanKat = namaKat;
        
        tbody += `<tr>
            <td style="border:1px solid #000; padding:8px; text-align:center;">${i+1}</td>
            <td style="border:1px solid #000; padding:8px; text-align:center;">${formatTanggalRiwayat(t.tgl_bayar)}</td>
            <td style="border:1px solid #000; padding:8px;">${santriNama}</td>
            <td style="border:1px solid #000; padding:8px; text-align:center; font-weight:bold; color:${isPemasukan ? '#047857' : '#DC2626'};">${t.jenis_transaksi}</td>
            <td style="border:1px solid #000; padding:8px;">${tagihanKat} ${t.keterangan ? ' - '+t.keterangan : ''}</td>
            <td style="border:1px solid #000; padding:8px; text-align:center;">${t.metode || 'Tunai'}</td>
            <td style="border:1px solid #000; padding:8px; text-align:right; font-weight:bold; color:${isPemasukan ? '#047857' : '#DC2626'};">${isPemasukan ? '+' : '-'} ${rPemasukanRupiah(nominal)}</td>
        </tr>`;
    });
    
    let tfoot = `<tr>
        <th colspan="6" style="border:1px solid #000; padding:8px; text-align:right;">TOTAL PEMASUKAN</th>
        <th style="border:1px solid #000; padding:8px; text-align:right; font-size:1rem; color:#047857;">${rPemasukanRupiah(totalPemasukan)}</th>
    </tr>
    <tr>
        <th colspan="6" style="border:1px solid #000; padding:8px; text-align:right;">TOTAL PENGELUARAN</th>
        <th style="border:1px solid #000; padding:8px; text-align:right; font-size:1rem; color:#DC2626;">${rPemasukanRupiah(totalPengeluaran)}</th>
    </tr>
    <tr>
        <th colspan="6" style="border:1px solid #000; padding:8px; text-align:right; font-size:1.1rem;">SALDO BERSIH</th>
        <th style="border:1px solid #000; padding:8px; text-align:right; font-size:1.1rem;">${rPemasukanRupiah(totalPemasukan - totalPengeluaran)}</th>
    </tr>`;
    
    const now = new Date();
    const dateStr = now.getDate() + ' ' + now.toLocaleString('id-ID', { month: 'long' }) + ' ' + now.getFullYear();

    let printHtml = `
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
              LAPORAN RIWAYAT TRANSAKSI KEUANGAN
            </h2>
            <p style="margin: 4px 0 0 0; font-size: 0.95rem; font-weight: 600; color: #4B5563;">${infoPeriode} &mdash; ${infoJenis}</p>
          </div>

          <!-- TABEL DATA -->
          <table class="report-table" style="width:100%; border-collapse:collapse; margin-bottom: 30px;">
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
        doPrint(printHtml, 'landscape');
    } else {
        const win = window.open('', '_blank');
        if (win) {
            win.document.write(`<html><head><title>Cetak Laporan Keuangan</title></head><body>${printHtml}</body></html>`);
            win.document.close();
            win.print();
        }
    }
}

window.printRiwayatKeuangan = printRiwayatPemasukan;
