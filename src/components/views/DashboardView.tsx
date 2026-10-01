import React, { useState } from 'react';
import { 
  Download, 
  Plus, 
  Calendar, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight, 
  Layers, 
  ShieldAlert, 
  ChevronRight, 
  FileText,
  MessageSquare,
  Sparkles,
  ExternalLink,
  Wrench
} from 'lucide-react';
import { InventoryItem, RentalTransaction, ViewTab } from '../../types';
import { useLiveWITAClock } from '../../utils/timeZone';

interface DashboardViewProps {
  inventory: InventoryItem[];
  transactions: RentalTransaction[];
  onNavigate: (tab: ViewTab) => void;
  onOpenQuickRent: () => void;
  onProcessReturn: (trxId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  inventory,
  transactions,
  onNavigate,
  onOpenQuickRent,
  onProcessReturn,
}) => {
  const liveWITA = useLiveWITAClock();
  const [activeTimeRange, setActiveTimeRange] = useState<'today' | '7days' | 'month'>('today');
  const [returnFilterTab, setReturnFilterTab] = useState<'all' | 'ontime' | 'overdue'>('all');

  // Dynamic calculations from real inventory and transactions
  const totalUnits = inventory.reduce((sum, item) => sum + (item.totalUnits || 0), 0);
  const totalSku = inventory.length;
  const availableUnits = inventory.reduce((sum, item) => sum + (item.availableUnits || 0), 0);
  const rentedUnits = inventory.reduce((sum, item) => sum + (item.rentedUnits || 0), 0);
  const maintenanceUnits = inventory.reduce((sum, item) => sum + (item.maintenanceUnits || 0), 0);

  const pctAvailable = totalUnits > 0 ? ((availableUnits / totalUnits) * 100).toFixed(1) : '0';
  const pctRented = totalUnits > 0 ? ((rentedUnits / totalUnits) * 100).toFixed(1) : '0';
  const pctMaintenance = totalUnits > 0 ? ((maintenanceUnits / totalUnits) * 100).toFixed(1) : '0';

  // Active customer rentals
  const activeTransactions = transactions.filter(t => t.status === 'Aktif' || t.status === 'Terlambat' || t.status === 'Dalam Pemeriksaan');
  const overdueTransactions = transactions.filter(t => t.status === 'Terlambat');

  // Return queue derived from real transactions
  const returnQueue = activeTransactions.map(t => {
    const isOverdue = t.status === 'Terlambat';
    const inQc = t.status === 'Dalam Pemeriksaan';
    return {
      id: t.id,
      guarantee: `${t.guaranteeType} (${t.guaranteeNumber || 'Tersimpan'})`,
      name: t.customerName,
      phone: t.customerPhone,
      items: t.items.map(i => `${i.quantity}x ${i.itemName}`).join(', ') || 'Alat Camping',
      scheduledReturn: t.returnDate,
      returnDelay: isOverdue ? 'Terlambat Jadwal' : (inQc ? 'Sedang Cek Fisik' : 'Tepat Waktu'),
      status: isOverdue ? 'overdue' : (inQc ? 'in_qc' : 'ontime'),
      fine: t.penaltyFines || 0,
      badgeText: isOverdue ? `Overdue • (+Rp ${(t.penaltyFines || 0).toLocaleString('id-ID')})` : (inQc ? 'Sedang Cek Fisik' : 'Terjadwal Sesuai Janji')
    };
  });

  const countAll = returnQueue.length;
  const countOntime = returnQueue.filter(i => i.status === 'ontime' || i.status === 'in_qc').length;
  const countOverdue = returnQueue.filter(i => i.status === 'overdue').length;

  const filteredQueue = returnQueue.filter(item => {
    if (returnFilterTab === 'overdue') return item.status === 'overdue';
    if (returnFilterTab === 'ontime') return item.status === 'ontime' || item.status === 'in_qc';
    return true;
  });

  // Category Occupancy data
  const categoryStats = [
    { name: 'Tenda & Shelter (Dome, Flysheet)', category: 'Tenda & Shelter' },
    { name: 'Sleeping Bag & Matras Foil', category: 'Sleeping Gear' },
    { name: 'Carrier & Ransel Ekspedisi', category: 'Carrier & Backpack' },
    { name: 'Cooking Set & Kompor Windproof', category: 'Cooking & Kompor' },
    { name: 'Alat Climbing, Carabiner & Harness', category: 'Climbing & Safety' },
  ].map(cat => {
    const items = inventory.filter(i => i.category === cat.category);
    const total = items.reduce((s, i) => s + i.totalUnits, 0);
    const rented = items.reduce((s, i) => s + i.rentedUnits, 0);
    const available = items.reduce((s, i) => s + i.availableUnits, 0);
    const percent = total > 0 ? Math.round((rented / total) * 100) : 0;
    return {
      ...cat,
      total,
      rented,
      available,
      percent,
      itemCount: items.length
    };
  });

  return (
    <div id="dashboard-progress-view" className="space-y-6 pb-12">
      {/* Top Banner / Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
            <span className="text-[11px] font-bold text-[#10B981] uppercase tracking-wider">
              Operasional Real-Time
            </span>
            <span className="text-[11px] text-[#9CA3AF]">•</span>
            <span className="text-[11px] text-[#6B7280] font-medium">
              Bali Camping Adventure Dashboard
            </span>
          </div>
          <h2 className="text-2xl font-bold text-[#111827] tracking-tight">
            Dashboard Progress Operasional
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Ringkasan aktivitas persewaan, ketersediaan stok, dan pemantauan pengembalian hari ini.
          </p>
        </div>

        {/* Action Buttons & Time Filter */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Time Filter Pills */}
          <div className="bg-[#F3F4F6] p-1 rounded-lg border border-[#E5E7EB] flex items-center gap-0.5">
            <button
              onClick={() => setActiveTimeRange('today')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeTimeRange === 'today'
                  ? 'bg-white text-[#111827] shadow-2xs'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => setActiveTimeRange('7days')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeTimeRange === '7days'
                  ? 'bg-white text-[#111827] shadow-2xs'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              7 Hari Terakhir
            </button>
            <button
              onClick={() => setActiveTimeRange('month')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeTimeRange === 'month'
                  ? 'bg-white text-[#111827] shadow-2xs'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              Bulan Ini
            </button>
          </div>

          <button
            onClick={() => alert("Mengunduh Rekap Operasional Hari Ini (PDF/Excel)...")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] text-xs font-semibold text-[#374151] transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#6B7280]" />
            <span>Ekspor Rekap</span>
          </button>

          <button
            onClick={() => onNavigate('sewa-baru')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Buat Booking Cepat</span>
          </button>
        </div>
      </div>

      {/* 4 Stat KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-[#6B7280] uppercase">
              Total Perlengkapan
            </span>
            <span className="p-1.5 bg-[#EFF6FF] rounded-lg text-[#2563EB]">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-[#111827] tracking-tight tnum">{totalUnits}</span>
              <span className="text-xs font-semibold text-[#4B5563]">Unit</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#6B7280] mt-2 pt-2 border-t border-[#F3F4F6]">
              <span>{totalSku} SKU / Jenis Alat</span>
              <span className="text-[#059669] font-medium">{totalUnits > 0 ? `${totalUnits} unit siap operasi` : 'Kondisi kosong'}</span>
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-[#6B7280] uppercase">
              Stok Tersedia
            </span>
            <span className="text-[10.5px] font-bold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded-full border border-[#D1FAE5]">
              {pctAvailable}% Siap Sewa
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-[#10B981] tracking-tight tnum">{availableUnits}</span>
              <span className="text-xs font-semibold text-[#4B5563]">Unit</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#6B7280] mt-2 pt-2 border-t border-[#F3F4F6]">
              <span>Gudang Utama & Display</span>
              <span className="font-semibold text-[#374151]">Rak Logistik</span>
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-[#6B7280] uppercase">
              Sedang Disewa
            </span>
            <span className="text-[10.5px] font-bold text-[#0284C7] bg-[#F0F9FF] px-2 py-0.5 rounded-full border border-[#E0F2FE]">
              {pctRented}% Di Lapangan
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-[#0284C7] tracking-tight tnum">{rentedUnits}</span>
              <span className="text-xs font-semibold text-[#4B5563]">Unit</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#6B7280] mt-2 pt-2 border-t border-[#F3F4F6]">
              <span>{activeTransactions.length} Transaksi Aktif</span>
              <span className="text-[#059669] font-medium">{overdueTransactions.length > 0 ? `${overdueTransactions.length} Overdue` : 'Semua On-Time'}</span>
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-[#6B7280] uppercase">
              Perlu Perawatan / Servis
            </span>
            <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full border ${
              maintenanceUnits > 0 ? 'text-[#DC2626] bg-[#FEF2F2] border-[#FEE2E2]' : 'text-[#059669] bg-[#ECFDF5] border-[#D1FAE5]'
            }`}>
              {pctMaintenance}% Cek Fisik
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className={`text-3xl font-extrabold tracking-tight tnum ${maintenanceUnits > 0 ? 'text-[#DC2626]' : 'text-[#111827]'}`}>
                {maintenanceUnits}
              </span>
              <span className="text-xs font-semibold text-[#4B5563]">Unit</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#6B7280] mt-2 pt-2 border-t border-[#F3F4F6]">
              <span>{maintenanceUnits > 0 ? `${maintenanceUnits} unit perlu cuci/servis` : 'Kondisi barang prima'}</span>
              <span className={maintenanceUnits > 0 ? 'text-[#DC2626] font-bold' : 'text-[#059669] font-bold'}>
                {maintenanceUnits > 0 ? 'Prioritas' : 'Normal'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section: Okupansi Kategori + Kesiapan Alat Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Card (8 cols): Tingkat Okupansi Kategori Alat */}
        <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#F3F4F6] gap-2">
            <div>
              <h3 className="text-sm font-bold text-[#111827]">Tingkat Okupansi Kategori Alat</h3>
              <p className="text-xs text-[#6B7280]">Keterisian stok ekspedisi & penyewaan aktif</p>
            </div>
            <div className="px-3 py-1.5 bg-[#ECFDF5] border border-[#A7F3D0] rounded-lg text-right">
              <span className="text-[10px] text-[#047857] block font-semibold leading-tight">Total Nilai Transaksi:</span>
              <span className="text-xs font-extrabold text-[#065F46] tnum">
                Rp {transactions.reduce((sum, t) => sum + (t.totalPayment || 0), 0).toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Categories Progress Bars or Empty State */}
          {inventory.length === 0 ? (
            <div className="py-10 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] flex items-center justify-center text-[#1B4332] mb-3">
                <Layers className="w-6 h-6 text-[#1B4332]" />
              </div>
              <h4 className="text-xs font-bold text-[#111827]">Belum Ada Data Inventaris</h4>
              <p className="text-[11.5px] text-[#6B7280] max-w-sm mt-1 mb-4 leading-relaxed">
                Inventaris masih kosong. Tambahkan perlengkapan outdoor secara manual oleh Admin untuk melihat grafik okupansi per kategori.
              </p>
              <button
                onClick={() => onNavigate('inventaris')}
                className="px-3 py-1.5 rounded-lg bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-semibold cursor-pointer transition-colors"
              >
                + Buka Inventaris & Tambah Barang
              </button>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {categoryStats.map((cat, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-[#1F2937] flex items-center gap-1.5">
                      {cat.name}
                      <span className="text-[#6B7280] font-normal text-[11px]">
                        {cat.rented} / {cat.total} unit disewa
                      </span>
                    </span>
                    <span className={`font-bold tnum ${cat.percent > 80 ? 'text-[#DC2626]' : 'text-[#10B981]'}`}>
                      {cat.percent}%
                    </span>
                  </div>
                  <div className="w-full bg-[#F3F4F6] h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        cat.percent > 80 ? 'bg-[#EF4444]' : cat.percent > 50 ? 'bg-[#10B981]' : 'bg-[#3B82F6]'
                      }`}
                      style={{ width: `${cat.percent}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#6B7280] mt-1">
                    <span>{cat.itemCount} varian barang diinput</span>
                    <span className="font-medium text-[#059669]">Tersisa {cat.available} Unit</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-[#F3F4F6] flex items-center justify-between text-xs">
            <span className="text-[#4B5563] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
              Status Inventory BCA: <strong className="text-[#111827]">{totalUnits > 0 ? `${totalUnits} Unit Terdata` : 'Menunggu Input Manual'}</strong>
            </span>
            <button 
              onClick={() => onNavigate('inventaris')}
              className="text-[#1B4332] hover:text-[#2D6A4F] font-semibold flex items-center gap-1 cursor-pointer"
            >
              Kelola Katalog Inventaris →
            </button>
          </div>
        </div>

        {/* Right Card (4 cols): Kesiapan Alat */}
        <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#F3F4F6]">
              <div>
                <h3 className="text-sm font-bold text-[#111827]">Kesiapan Alat</h3>
                <p className="text-xs text-[#6B7280]">Pemeriksaan fisik depot</p>
              </div>
              <span className="p-1 bg-[#F3F4F6] rounded text-[#6B7280]">
                <ShieldAlert className="w-4 h-4" />
              </span>
            </div>

            {/* Circular Donut Visual */}
            <div className="py-5 flex flex-col items-center justify-center">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="#F3F4F6" strokeWidth="12" fill="none" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#10B981"
                    strokeWidth="12"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 * (1 - (totalUnits > 0 ? availableUnits / totalUnits : 1))}
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>

                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-extrabold text-[#111827] tnum">
                    {totalUnits > 0 ? `${Math.round((availableUnits / totalUnits) * 100)}%` : '100%'}
                  </span>
                  <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                    Kesiapan Alat
                  </span>
                </div>
              </div>

              {/* Legend Badges */}
              <div className="flex items-center justify-center gap-3 mt-4 text-[11px]">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                  <span className="text-[#374151] font-medium">{availableUnits} Siap</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#0284C7]"></span>
                  <span className="text-[#374151] font-medium">{rentedUnits} Disewa</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#EF4444]"></span>
                  <span className="text-[#374151] font-medium">{maintenanceUnits} Servis</span>
                </div>
              </div>
            </div>

            {/* Alert Card */}
            {maintenanceUnits > 0 ? (
              <div className="p-3 bg-[#FEF2F2] border border-[#FEE2E2] rounded-xl text-xs text-[#991B1B]">
                <div className="flex items-center gap-1.5 font-bold mb-0.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#EF4444]" />
                  <span>Peringatan Perawatan!</span>
                </div>
                <p className="text-[11px] text-[#7F1D1D] leading-snug">
                  {maintenanceUnits} unit perlengkapan membutuhkan cuci atau perbaikan sebelum dapat disewakan kembali.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-[#ECFDF5] border border-[#D1FAE5] rounded-xl text-xs text-[#065F46]">
                <div className="flex items-center gap-1.5 font-bold mb-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Kondisi Inventory BCA</span>
                </div>
                <p className="text-[11px] text-[#047857] leading-snug">
                  {totalUnits > 0 ? 'Semua unit terdaftar dalam kondisi siap pakai tanpa tunggakan servis.' : 'inventory bersih dan siap diisi oleh admin.'}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('inventaris')}
            className="w-full mt-4 py-2 px-3 rounded-lg border border-[#E5E7EB] hover:bg-[#F9FAFB] text-xs font-semibold text-[#1F2937] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Wrench className="w-3.5 h-3.5 text-[#6B7280]" />
            <span>Kelola Inventaris & Status Alat ({totalUnits} Unit)</span>
          </button>
        </div>
      </div>

      {/* Bottom Section 1: Log Pengembalian Hari Ini */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-[#F3F4F6] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#111827]">Log Pengembalian Hari Ini</h3>
              {countOverdue > 0 ? (
                <span className="text-[11px] font-bold text-[#DC2626] bg-[#FEF2F2] px-2 py-0.5 rounded-full border border-[#FEE2E2]">
                  {countOverdue} Overdue
                </span>
              ) : (
                <span className="text-[11px] font-bold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded-full border border-[#D1FAE5]">
                  0 Overdue
                </span>
              )}
            </div>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Prioritas inspeksi barang kembali, denda keterlambatan, dan pencairan deposit jaminan
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 bg-[#F3F4F6] p-1 rounded-lg text-xs">
            <button
              onClick={() => setReturnFilterTab('all')}
              className={`px-3 py-1 font-semibold rounded-md transition-colors ${
                returnFilterTab === 'all' ? 'bg-white text-[#111827] shadow-2xs' : 'text-[#6B7280]'
              }`}
            >
              Semua ({countAll})
            </button>
            <button
              onClick={() => setReturnFilterTab('ontime')}
              className={`px-3 py-1 font-semibold rounded-md transition-colors ${
                returnFilterTab === 'ontime' ? 'bg-white text-[#111827] shadow-2xs' : 'text-[#6B7280]'
              }`}
            >
              Tepat Waktu ({countOntime})
            </button>
            <button
              onClick={() => setReturnFilterTab('overdue')}
              className={`px-3 py-1 font-semibold rounded-md flex items-center gap-1 transition-colors ${
                returnFilterTab === 'overdue' ? 'bg-white text-[#DC2626] shadow-2xs' : 'text-[#DC2626]'
              }`}
            >
              {countOverdue > 0 && <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]"></span>}
              Overdue ({countOverdue})
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">No. Transaksi</th>
                <th className="py-3 px-4">Penyewa & Kontak</th>
                <th className="py-3 px-4">Item Perlengkapan</th>
                <th className="py-3 px-4">Janji Kembali</th>
                <th className="py-3 px-4">Status & Denda</th>
                <th className="py-3 px-4 text-right">Aksi Lapangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {filteredQueue.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#9CA3AF] mb-2">
                        <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                      </div>
                      <p className="text-xs font-bold text-[#111827]">Tidak Ada Antrean Pengembalian</p>
                      <p className="text-[11.5px] text-[#6B7280] mt-0.5 max-w-sm">
                        {transactions.length === 0
                          ? 'Belum ada transaksi penyewaan aktif yang tercatat. Silakan buat transaksi sewa baru.'
                          : 'Semua unit sewa dalam kondisi aman dan tidak ada pengembalian yang menunggu proses pada filter ini.'}
                      </p>
                      {transactions.length === 0 && (
                        <button
                          onClick={() => onNavigate('sewa-baru')}
                          className="mt-3 px-3.5 py-1.5 rounded-lg bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-semibold cursor-pointer transition-colors"
                        >
                          + Buat Booking Sewa Baru
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredQueue.map((row) => (
                  <tr key={row.id} className="hover:bg-[#F8FAF9] transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-[#111827] block">{row.id}</span>
                      <span className="text-[10px] text-[#6B7280]">Jaminan: {row.guarantee}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-[#111827] block">{row.name}</span>
                      <span className="text-[11px] text-[#6B7280]">{row.phone}</span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <span className="text-[#374151] line-clamp-1">{row.items}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-[#111827] block tnum">{row.scheduledReturn}</span>
                      <span className={`text-[10.5px] ${row.status === 'overdue' ? 'text-[#DC2626] font-medium' : 'text-[#6B7280]'}`}>
                        {row.returnDelay}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {row.status === 'overdue' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FEF2F2] text-[#DC2626] border border-[#FEE2E2]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]"></span>
                          {row.badgeText}
                        </span>
                      )}
                      {row.status === 'in_qc' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ECFDF5] text-[#059669] border border-[#D1FAE5]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                          {row.badgeText}
                        </span>
                      )}
                      {row.status === 'ontime' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F3F4F6] text-[#4B5563]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]"></span>
                          {row.badgeText}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {row.status === 'overdue' && (
                        <button
                          onClick={() => onProcessReturn(row.id)}
                          className="px-3 py-1.5 rounded-lg bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Proses Masuk</span>
                        </button>
                      )}
                      {row.status === 'in_qc' && (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => onProcessReturn(row.id)}
                            className="px-2.5 py-1 rounded-md border border-[#E5E7EB] hover:bg-white text-xs font-medium text-[#374151]"
                          >
                            Input QC
                          </button>
                          <button
                            onClick={() => onProcessReturn(row.id)}
                            className="px-2.5 py-1 rounded-md bg-[#1B4332] text-white text-xs font-semibold hover:bg-[#2D6A4F]"
                          >
                            Selesai & Refund
                          </button>
                        </div>
                      )}
                      {row.status === 'ontime' && (
                        <button
                          onClick={() => onProcessReturn(row.id)}
                          className="px-3 py-1 rounded-md border border-[#E5E7EB] hover:bg-[#F3F4F6] text-xs font-medium text-[#4B5563]"
                        >
                          Rincian
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="p-3 border-t border-[#F3F4F6] flex items-center justify-between text-xs text-[#6B7280]">
          <span>Menampilkan {filteredQueue.length} dari {returnQueue.length} antrean pengembalian aktif</span>
          <div className="flex items-center gap-1">
            <button className="px-2 py-1 border border-[#E5E7EB] rounded hover:bg-[#F3F4F6] disabled:opacity-50" disabled>
              Sebelumnya
            </button>
            <span className="px-2 font-semibold text-[#111827]">1 / 1</span>
            <button className="px-2 py-1 border border-[#E5E7EB] rounded hover:bg-[#F3F4F6] disabled:opacity-50" disabled>
              Selanjutnya
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section 2: Timeline + Petugas Gudang */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Timeline Pergerakan Alat Terkini (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#F3F4F6]">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#1B4332]" />
              <h3 className="text-sm font-bold text-[#111827]">Timeline Pergerakan Alat Terkini</h3>
            </div>
            <span className="text-[11px] text-[#9CA3AF]">
              {transactions.length > 0 ? 'Update Real-time' : 'Menunggu Transaksi'}
            </span>
          </div>

          <div className="mt-4 space-y-3.5">
            {transactions.length === 0 ? (
              <div className="py-8 text-center flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#9CA3AF] mb-2">
                  <Clock className="w-5 h-5 text-[#6B7280]" />
                </div>
                <p className="text-xs font-bold text-[#111827]">Belum Ada Riwayat Pergerakan Alat</p>
                <p className="text-[11.5px] text-[#6B7280] mt-0.5 max-w-xs">
                  Log serah terima alat, pelaporan kerusakan, dan pengembalian jaminan akan tercatat otomatis begitu aktivitas persewaan berjalan.
                </p>
              </div>
            ) : (
              transactions.slice(0, 3).map((t, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ring-4 ${
                    t.status === 'Selesai' ? 'bg-[#10B981] ring-[#ECFDF5]' :
                    t.status === 'Terlambat' ? 'bg-[#EF4444] ring-[#FEF2F2]' : 'bg-[#3B82F6] ring-[#EFF6FF]'
                  }`}></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#111827]">
                        {t.status === 'Selesai' ? 'Pengembalian Selesai' : t.status === 'Terlambat' ? 'Sewa Melewati Batas Waktu' : 'Pengambilan Sewa Baru'} {t.id}
                      </span>
                      <span className="text-[11px] text-[#6B7280] tnum">{t.startDate}</span>
                    </div>
                    <p className="text-[11.5px] text-[#4B5563] mt-0.5">
                      Penyewa {t.customerName} ({t.items.map(i => `${i.quantity}x ${i.itemName}`).join(', ')}) • Total Pembayaran: Rp {t.totalPayment?.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[#F3F4F6] text-right">
            <button 
              onClick={() => onNavigate('pengembalian')}
              className="text-xs text-[#1B4332] font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              Lihat Riwayat Lengkap ({transactions.length} Aktivitas Sewa) <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Real-Time Operational WITA (GMT+8) Monitor (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#F3F4F6]">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-[#ECFDF5] text-[#059669] rounded-lg border border-[#A7F3D0]">
                  <Clock className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-[#111827]">Operasional Real-Time WITA</h3>
              </div>
              <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-[#059669] bg-[#ECFDF5] px-2.5 py-0.5 rounded-full border border-[#A7F3D0]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
                GMT+8 Aktif
              </span>
            </div>

            <div className="mt-3.5 space-y-3">
              {/* Live Time Clock Card */}
              <div className="p-3 bg-[#F8FAF9] rounded-xl border border-[#E5E7EB] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">
                    Waktu Sentral Bali (WITA)
                  </span>
                  <span className="text-sm font-semibold text-[#111827] block mt-0.5">
                    {liveWITA.dayDate}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black font-mono text-[#1B4332] block tracking-tight">
                    {liveWITA.timeWithSec}
                  </span>
                  <span className="text-[10px] font-bold text-[#059669]">
                    UTC+08:00
                  </span>
                </div>
              </div>

              {/* Single Administrator Profile */}
              <div className="flex items-center gap-3 p-2.5 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB]">
                <div className="w-9 h-9 rounded-full bg-[#1B4332] text-white flex items-center justify-center font-bold text-xs">
                  AD
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#111827]">Administrator Sentral</span>
                    <span className="text-[10px] text-[#059669] font-medium bg-[#ECFDF5] px-1.5 py-0.2 rounded border border-[#A7F3D0]">
                      Standby 24 Jam
                    </span>
                  </div>
                  <span className="text-[11px] text-[#6B7280]">Bali Camping Adventure</span>
                </div>
              </div>

              {/* Real-time sync note */}
              <div className="p-2.5 bg-[#EFF6FF] border border-[#DBEAFE] rounded-lg text-xs text-[#1E40AF]">
                <span className="font-bold block text-[11px]">SINKRONISASI REAL-TIME PENUH</span>
                <p className="text-[10.5px] text-[#1E3A8A] mt-0.5 leading-snug">
                  Seluruh perhitungan durasi rental, denda keterlambatan, dan pencatatan kasir tersinkronisasi otomatis dengan standar Waktu Indonesia Tengah (WITA).
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onOpenQuickRent}
            className="w-full mt-4 py-2 rounded-lg bg-[#1B4332] hover:bg-[#245842] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Sewa Baru Sekarang</span>
          </button>
        </div>
      </div>
    </div>
  );
};
