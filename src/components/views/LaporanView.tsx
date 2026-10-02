import React, { useState } from 'react';
import { 
  BarChart2, 
  TrendingUp, 
  DollarSign, 
  Download, 
  Calendar, 
  ArrowUpRight, 
  ShieldAlert, 
  CheckCircle2, 
  FileText,
  PieChart,
  Inbox,
  CreditCard,
  User,
  Clock,
  Sparkles,
  Trash2
} from 'lucide-react';
import { InventoryItem, RentalTransaction } from '../../types';

interface LaporanViewProps {
  inventory?: InventoryItem[];
  transactions?: RentalTransaction[];
  onDeleteTransaction?: (id: string) => void;
}

export const LaporanView: React.FC<LaporanViewProps> = ({
  inventory = [],
  transactions = [],
  onDeleteTransaction,
}) => {
  const [reportPeriod, setReportPeriod] = useState<'oktober' | 'september' | 'q3'>('oktober');

  const totalRevenue = transactions.reduce((sum, t) => sum + (t.totalPaid || 0), 0);
  const totalDepositHeld = transactions.reduce((sum, t) => sum + (t.depositPaid || 0), 0);
  const totalTransactionsCount = transactions.length;

  // Derive top items from transactions or inventory
  const topRentals: { name: string; rentCount: number; revenue: number; margin: string }[] = [];
  
  if (transactions.length > 0) {
    const itemMap = new Map<string, { count: number; revenue: number }>();
    transactions.forEach(t => {
      t.items?.forEach(item => {
        const existing = itemMap.get(item.itemName) || { count: 0, revenue: 0 };
        existing.count += item.quantity;
        existing.revenue += item.quantity * item.unitPrice;
        itemMap.set(item.itemName, existing);
      });
    });

    itemMap.forEach((val, name) => {
      topRentals.push({
        name,
        rentCount: val.count,
        revenue: val.revenue,
        margin: '92%',
      });
    });
    topRentals.sort((a, b) => b.revenue - a.revenue);
  }

  return (
    <div id="laporan-finansial-view" className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-[#1B4332] uppercase tracking-wider">
              • FINANCIAL & AUDIT DEPOT
            </span>
            <span className="text-[11px] text-[#9CA3AF]">•</span>
            <span className="text-[11px] text-[#6B7280] font-semibold">Periode Berjalan</span>
          </div>
          <h2 className="text-2xl font-bold text-[#111827] tracking-tight">
            Laporan Finansial & Utilitas Aset
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Analisis arus kas masuk dari penyewaan, pemotongan denda kerusakan, dan efisiensi utilisasi perlengkapan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-[#F3F4F6] p-1 rounded-lg border border-[#E5E7EB] flex items-center text-xs">
            <button
              onClick={() => setReportPeriod('oktober')}
              className={`px-3 py-1 font-semibold rounded-md transition-colors ${
                reportPeriod === 'oktober' ? 'bg-white text-[#111827] shadow-2xs' : 'text-[#6B7280]'
              }`}
            >
              Bulan Berjalan
            </button>
            <button
              onClick={() => setReportPeriod('september')}
              className={`px-3 py-1 font-semibold rounded-md transition-colors ${
                reportPeriod === 'september' ? 'bg-white text-[#111827] shadow-2xs' : 'text-[#6B7280]'
              }`}
            >
              Bulan Lalu
            </button>
          </div>

          <button
            onClick={() => alert("Mengunduh Laporan Keuangan Lengkap (XLSX/PDF)...")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor Pembukuan</span>
          </button>
        </div>
      </div>

      {/* 4 Financial Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-2xs">
          <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block">
            Total Omzet Sewa
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-[#111827] tnum">
              Rp {totalRevenue.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-[#059669] font-medium pt-2 border-t border-[#F3F4F6]">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{totalTransactionsCount} Transaksi Dibukukan</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-2xs">
          <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block">
            Klaim Kerusakan & Denda
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-[#D97706] tnum">
              Rp 0
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-[#6B7280] pt-2 border-t border-[#F3F4F6]">
            <span>0 Transaksi Klaim</span>
            <span className="text-[#059669] font-semibold">100% Tertagih</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-2xs">
          <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block">
            Biaya Servis & Laundry
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-[#DC2626] tnum">Rp 0</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-[#6B7280] pt-2 border-t border-[#F3F4F6]">
            <span>Perawatan Preventif</span>
            <span className="text-[#4B5563]">0 Unit Dicuci</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-2xs">
          <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block">
            Deposit Jaminan Aktif
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-[#059669] tnum">
              Rp {totalDepositHeld.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-[#059669] font-medium pt-2 border-t border-[#F3F4F6]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Tersimpan di Kasir Toko</span>
          </div>
        </div>
      </div>

      {/* Middle Section: Weekly Utilization Chart & Top Earning Gear */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left (7 cols): Visual Weekly Trend */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#F3F4F6]">
            <div>
              <h3 className="text-sm font-bold text-[#111827]">Grafik Kepadatan Sewa Mingguan</h3>
              <p className="text-xs text-[#6B7280]">Perbandingan volume transaksi weekday vs weekend</p>
            </div>
            <span className="text-xs font-semibold text-[#1B4332] bg-[#ECFDF5] px-2.5 py-0.5 rounded-md">
              {totalTransactionsCount > 0 ? 'Puncak: Akhir Pekan' : 'Data Siap Merekam'}
            </span>
          </div>

          <div className="mt-6 flex items-end justify-between h-48 px-4 pb-2 border-b border-[#E5E7EB]">
            {[
              { day: 'Sen', rate: totalTransactionsCount > 0 ? 30 : 5, count: 0 },
              { day: 'Sel', rate: totalTransactionsCount > 0 ? 25 : 5, count: 0 },
              { day: 'Rab', rate: totalTransactionsCount > 0 ? 40 : 5, count: 0 },
              { day: 'Kam', rate: totalTransactionsCount > 0 ? 55 : 5, count: 0 },
              { day: 'Jum', rate: totalTransactionsCount > 0 ? 80 : 5, count: 0 },
              { day: 'Sab', rate: totalTransactionsCount > 0 ? 95 : 5, count: 0 },
              { day: 'Min', rate: totalTransactionsCount > 0 ? 70 : 5, count: 0 },
            ].map((d) => (
              <div key={d.day} className="flex flex-col items-center gap-2 group flex-1">
                <span className="text-[10px] font-bold text-[#6B7280] opacity-0 group-hover:opacity-100 transition-opacity">
                  {d.count} trx
                </span>
                <div 
                  className={`w-8 sm:w-10 rounded-t-lg transition-all ${
                    d.rate > 85 ? 'bg-[#1B4332]' : 'bg-[#40916C]'
                  }`} 
                  style={{ height: `${Math.max(8, d.rate * 1.5)}px` }}
                ></div>
                <span className="text-xs font-bold text-[#374151] mt-1">{d.day}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-[#6B7280]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-[#1B4332]"></span>
              <span>Weekend Peak (&gt;85% Kapasitas)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-[#40916C]"></span>
              <span>Regular Weekday</span>
            </div>
          </div>
        </div>

        {/* Right (5 cols): Top 5 Aset Paling Menguntungkan */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-[#F3F4F6]">
              <h3 className="text-sm font-bold text-[#111827]">Top 5 Aset Paling Menghasilkan</h3>
              <p className="text-xs text-[#6B7280]">Perlengkapan dengan perputaran sewa & ROI tertinggi</p>
            </div>

            <div className="mt-4 space-y-3.5">
              {topRentals.length === 0 ? (
                <div className="py-8 text-center flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#9CA3AF] mb-2">
                    <Inbox className="w-5 h-5 text-[#6B7280]" />
                  </div>
                  <p className="text-xs font-bold text-[#111827]">Belum Ada Data Transaksi Sewa</p>
                  <p className="text-[11px] text-[#6B7280] max-w-xs mt-0.5 leading-normal">
                    Statistik perlengkapan paling menguntungkan akan terkalkulasi otomatis setelah transaksi sewa dibuat.
                  </p>
                </div>
              ) : (
                topRentals.slice(0, 5).map((r, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="min-w-0 pr-2">
                      <span className="font-bold text-[#111827] block truncate">
                        {idx + 1}. {r.name}
                      </span>
                      <span className="text-[10.5px] text-[#6B7280]">
                        {r.rentCount} kali sewa • Margin {r.margin}
                      </span>
                    </div>
                    <span className="font-extrabold text-[#111827] shrink-0 tnum">
                      Rp {r.revenue.toLocaleString('id-ID')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#F3F4F6] text-right">
            <button 
              onClick={() => alert(`Total ${inventory.length} item terdaftar di sistem depot.`)}
              className="text-xs text-[#1B4332] font-semibold hover:underline cursor-pointer"
            >
              Lihat Detail SKU ({inventory.length} Item) →
            </button>
          </div>
        </div>
      </div>

      {/* Buku Log & Riwayat Transaksi Finansial */}
      <div id="buku-log-finansial" className="bg-white rounded-xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F8FAF9]">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#1B4332]" />
              <h3 className="text-sm font-bold text-[#111827]">Buku Log & Riwayat Transaksi Finansial</h3>
            </div>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Pencatatan transaksi sewa resmi, mutasi kas masuk, deposit jaminan, dan metode pembayaran.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#1B4332] bg-[#ECFDF5] border border-[#A7F3D0] px-2.5 py-1 rounded-lg">
              {transactions.length} Transaksi Terbukukan
            </span>
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#9CA3AF] mb-3">
              <FileText className="w-6 h-6 text-[#9CA3AF]" />
            </div>
            <h4 className="text-xs font-bold text-[#111827]">Belum Ada Log Transaksi</h4>
            <p className="text-[11px] text-[#6B7280] max-w-sm mt-1 leading-relaxed">
              Setelah memproses dan menekan <strong>Selesai Transaksi</strong> pada menu <strong>Sewa Baru</strong>, data transaksi akan otomatis tercatat dan masuk ke dalam buku log finansial ini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#374151]">
              <thead className="bg-[#F9FAFB] text-[10.5px] uppercase tracking-wider font-bold text-[#6B7280] border-b border-[#E5E7EB]">
                <tr>
                  <th className="py-3 px-4">ID Transaksi / Waktu</th>
                  <th className="py-3 px-4">Penyewa & Jaminan</th>
                  <th className="py-3 px-4">Perlengkapan Disewa</th>
                  <th className="py-3 px-4 text-right">Omzet Sewa</th>
                  <th className="py-3 px-4 text-right">Deposit</th>
                  <th className="py-3 px-4 text-right">Total Kas Masuk</th>
                  <th className="py-3 px-4 text-center">Metode Bayar</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {transactions.map((t, idx) => (
                  <tr key={t.id || idx} className={`hover:bg-[#F8FAF9] transition-colors ${idx === 0 ? 'bg-[#F0FDF4]/30' : ''}`}>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-[#111827]">{t.id}</span>
                        {idx === 0 && (
                          <span className="text-[9px] font-bold text-[#059669] bg-[#ECFDF5] border border-[#A7F3D0] px-1.5 py-0.5 rounded">
                            Baru
                          </span>
                        )}
                      </div>
                      <div className="text-[10.5px] text-[#6B7280] mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#9CA3AF]" />
                        <span>{t.pickupDate || 'WITA'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#111827] flex items-center gap-1">
                        <User className="w-3 h-3 text-[#6B7280]" />
                        <span>{t.customerName}</span>
                      </div>
                      <div className="text-[10.5px] text-[#6B7280] mt-0.5">
                        {t.customerPhone} • {t.idTypeHeld || 'Jaminan Fisik'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-xs font-medium text-[#111827] max-w-xs">
                        {t.items?.map((it, i) => (
                          <span key={i} className="inline-block bg-[#F3F4F6] text-[#374151] rounded px-1.5 py-0.5 text-[10px] mr-1 mb-1">
                            {it.itemName} ({it.quantity}x)
                          </span>
                        ))}
                      </div>
                      <span className="text-[10px] text-[#6B7280] block">
                        Durasi: {t.durationDays} hari (s.d. {t.returnDate})
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-[#111827] tnum whitespace-nowrap">
                      Rp {(t.subtotal || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3.5 px-4 text-right text-[#059669] font-medium tnum whitespace-nowrap">
                      Rp {(t.depositPaid || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-[#1B4332] text-sm tnum whitespace-nowrap">
                      Rp {(t.totalPaid || t.subtotal || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10.5px] font-semibold ${
                        t.paymentMethod === 'QRIS POS'
                          ? 'bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]'
                          : t.paymentMethod === 'BCA Transfer'
                          ? 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]'
                          : 'bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]'
                      }`}>
                        {t.paymentMethod || 'QRIS POS'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        t.status === 'Selesai'
                          ? 'bg-[#F3F4F6] text-[#4B5563]'
                          : 'bg-[#ECFDF5] text-[#065F46] border border-[#10B981]/30'
                      }`}>
                        {t.status || 'Aktif'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => onDeleteTransaction && onDeleteTransaction(t.id)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Transaksi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};