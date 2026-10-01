import React, { useState } from 'react';
import { 
  Scan, 
  History, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  User, 
  RotateCcw,
  Sparkles,
  Check,
  X,
  PackageCheck
} from 'lucide-react';
import { RentalTransaction } from '../../types';

interface PengembalianViewProps {
  transactions?: RentalTransaction[];
  onCompleteReturn: (summary: any) => void;
  onOpenBarcodeScanner: () => void;
  onNavigateToSewa?: () => void;
}

interface InspectionItemState {
  isOk: boolean;
  fee: number;
  issueNote: string;
}

export const PengembalianView: React.FC<PengembalianViewProps> = ({
  transactions = [],
  onCompleteReturn,
  onOpenBarcodeScanner,
  onNavigateToSewa,
}) => {
  // Acuan terhadap sewa baru input: ambil transaksi yang masih Aktif / Terlambat
  const pendingTransactions = transactions.filter(
    t => t.status === 'Aktif' || t.status === 'Terlambat' || t.status === 'Jatuh Tempo'
  );
  const completedTransactions = transactions.filter(t => t.status === 'Selesai');
  const hasActiveReturns = pendingTransactions.length > 0;

  // Selected Transaction State
  const [selectedTrxId, setSelectedTrxId] = useState<string>('');
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Active Transaction Resolution
  const activeTrx = (selectedTrxId && pendingTransactions.find(t => t.id === selectedTrxId)) || pendingTransactions[0];

  // Dynamic Inspection & Reconciliation State
  const [itemInspections, setItemInspections] = useState<Record<string, InspectionItemState>>({});
  const [lateHours, setLateHours] = useState(0);
  const [idCardReturned, setIdCardReturned] = useState(true);
  const [refundMethod, setRefundMethod] = useState<'Tunai Langsung' | 'Transfer Bank' | 'E-Wallet'>('Tunai Langsung');

  // Fines calculation
  const initialDeposit = activeTrx?.depositPaid || 0;
  const lateFine = lateHours * 15000;
  const itemDamageFee: number = (Object.values(itemInspections) as InspectionItemState[]).reduce(
    (acc: number, curr: InspectionItemState) => acc + (!curr.isOk ? curr.fee : 0),
    0
  );
  const totalDeductions: number = lateFine + itemDamageFee;
  const netRefund = Math.max(0, initialDeposit - totalDeductions);

  const handleFinishInspection = () => {
    if (!activeTrx) return;

    const summary = {
      trxId: activeTrx.id,
      customerName: activeTrx.customerName,
      phone: activeTrx.customerPhone,
      initialDeposit,
      lateFine,
      missingPegsFine: itemDamageFee,
      laundryFee: 0,
      totalDeductions,
      netRefund,
      refundMethod,
      idCardReturned,
      inspector: 'Administrator (QC)',
      supervisor: 'Administrator (Approval)',
      timestamp: new Date().toLocaleString('id-ID'),
    };

    onCompleteReturn(summary);
  };

  return (
    <div id="pengembalian-inspeksi-view" className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-[#1B4332] uppercase tracking-wider">
              • DEPOT RETURN STATION
            </span>
            <span className="text-[11px] text-[#9CA3AF]">•</span>
            <span className="text-[11px] text-[#6B7280] font-semibold">GATE B RECEIVING</span>
          </div>
          <h2 className="text-2xl font-bold text-[#111827] tracking-tight">
            Log & Verifikasi Pengembalian Alat
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Mengacu langsung pada data transaksi sewa baru. Inspeksi kelengkapan, serah terima jaminan, dan cetak bukti pengembalian.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenBarcodeScanner}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] text-xs font-semibold text-[#374151] transition-colors cursor-pointer shadow-2xs"
          >
            <Scan className="w-3.5 h-3.5 text-[#1B4332]" />
            <span>Scan Barcode Pengembalian</span>
          </button>

          <button
            onClick={() => setShowHistoryModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] text-xs font-semibold text-[#374151] transition-colors cursor-pointer shadow-2xs"
          >
            <History className="w-3.5 h-3.5 text-[#6B7280]" />
            <span>Riwayat Selesai ({completedTransactions.length})</span>
          </button>
        </div>
      </div>

      {/* Main Content: Empty State OR Inspection Workspace */}
      {!hasActiveReturns || !activeTrx ? (
        <div id="pengembalian-empty-state" className="bg-white rounded-xl border border-[#E5E7EB] p-12 text-center shadow-2xs flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-[#ECFDF5] flex items-center justify-center text-[#1B4332] mb-4">
            <RotateCcw className="w-8 h-8 text-[#1B4332]" />
          </div>
          <h3 className="text-base font-bold text-[#111827]">
            {completedTransactions.length > 0 
              ? "Semua Pengembalian Telah Selesai Diproses" 
              : "Log & Pengembalian Masih Kosong"}
          </h3>
          <p className="text-xs text-[#6B7280] max-w-md mt-1.5 leading-relaxed">
            {completedTransactions.length > 0
              ? "Seluruh transaksi sewa aktif telah diselesaikan dan dicairkan jaminannya. Log aktif akan otomatis muncul kembali saat ada sewa baru diinput."
              : "Informasi log dan pengembalian ini mengacu pada input transaksi dari menu Sewa Baru. Setelah transaksi dibuat, data akan langsung siap diverifikasi di sini."}
          </p>
          <div className="mt-6 flex items-center gap-3">
            {onNavigateToSewa && (
              <button
                onClick={onNavigateToSewa}
                className="px-4 py-2 rounded-lg bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold transition-colors shadow-2xs cursor-pointer"
              >
                + Buat Transaksi Sewa Baru
              </button>
            )}
            {completedTransactions.length > 0 && (
              <button
                onClick={() => setShowHistoryModal(true)}
                className="px-4 py-2 rounded-lg border border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#374151] text-xs font-semibold transition-colors cursor-pointer"
              >
                Lihat Riwayat Selesai ({completedTransactions.length})
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Transaction Metadata & Interactive Physical Inspection */}
          <div className="lg:col-span-7 space-y-5">
            {/* Selector Antrian Pengembalian (Bila ada lebih dari 1 transaksi sewa aktif) */}
            {pendingTransactions.length > 1 && (
              <div className="bg-white p-3.5 rounded-xl border border-[#E5E7EB] shadow-2xs">
                <span className="text-[10.5px] font-bold text-[#4B5563] uppercase tracking-wider block mb-2">
                  Pilih Antrian Pengembalian ({pendingTransactions.length} Transaksi Sewa Aktif):
                </span>
                <div className="flex flex-wrap gap-2">
                  {pendingTransactions.map((trx) => (
                    <button
                      key={trx.id}
                      onClick={() => {
                        setSelectedTrxId(trx.id);
                        setItemInspections({});
                        setLateHours(0);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        activeTrx.id === trx.id
                          ? 'bg-[#1B4332] text-white shadow-xs'
                          : 'bg-[#F9FAFB] text-[#374151] border border-[#E5E7EB] hover:bg-[#F3F4F6]'
                      }`}
                    >
                      <span className="font-bold">{trx.id}</span>
                      <span>•</span>
                      <span>{trx.customerName}</span>
                      <span className="text-[10px] opacity-80">({trx.items.length} item)</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Transaction Banner */}
            <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#F3F4F6]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-[#111827]">{activeTrx.id}</span>
                  <span className="text-[10px] font-bold text-[#047857] bg-[#ECFDF5] px-2 py-0.5 rounded-full border border-[#A7F3D0]">
                    Status: {activeTrx.status || 'Aktif'}
                  </span>
                </div>
                <span className="text-[11px] text-[#6B7280]">
                  Jaminan Ditahan: <strong className="text-[#111827]">{activeTrx.idTypeHeld || 'e-KTP Asli'}</strong>
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-[#9CA3AF] uppercase block font-semibold">Penyewa</span>
                  <span className="font-bold text-[#111827]">{activeTrx.customerName}</span>
                  <span className="text-[11px] text-[#6B7280] block">{activeTrx.customerPhone}</span>
                </div>

                <div>
                  <span className="text-[10px] text-[#9CA3AF] uppercase block font-semibold">Jadwal Sewa</span>
                  <span className="font-semibold text-[#111827]">{activeTrx.pickupDate}</span>
                  <span className="text-[10.5px] text-[#6B7280] block">s.d. {activeTrx.returnDate}</span>
                </div>

                <div>
                  <span className="text-[10px] text-[#9CA3AF] uppercase block font-semibold">Tujuan Ekspedisi</span>
                  <span className="font-medium text-[#374151] block truncate">{activeTrx.destination || 'Camping / Pendakian'}</span>
                  <span className="text-[10.5px] text-[#059669] font-semibold">{activeTrx.durationDays} Hari Sewa</span>
                </div>
              </div>
            </div>

            {/* Interactive Inspection Checklists (Sesuai dengan barang yang diinput di Sewa Baru) */}
            <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#F3F4F6]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#1B4332]" />
                  <h3 className="text-sm font-bold text-[#111827]">
                    Checklist Fisik & Kelengkapan ({activeTrx.items.length} Item Sewa)
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-[#059669]">
                  Petugas QC: Administrator
                </span>
              </div>

              {activeTrx.items.map((it, idx) => {
                const inspection = itemInspections[it.itemSku] || { isOk: true, fee: 0, issueNote: '' };
                return (
                  <div key={idx} className="p-3.5 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={it.imageUrl || "https://images.unsplash.com/photo-1478827536114-da961b7f86d2?auto=format&fit=crop&w=120&q=80"}
                          alt={it.itemName}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-lg object-cover border border-[#D1D5DB]"
                        />
                        <div>
                          <span className="font-bold text-xs text-[#111827] block">
                            {it.quantity}x {it.itemName}
                          </span>
                          <span className="text-[10px] font-mono text-[#6B7280]">
                            SKU: {it.itemSku} • {it.category}
                          </span>
                        </div>
                      </div>
                      {inspection.isOk ? (
                        <span className="text-[10px] font-bold text-[#059669] bg-[#ECFDF5] px-2.5 py-0.5 rounded-full border border-[#A7F3D0]">
                          ✓ Lengkap 100% (Baik)
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-[#DC2626] bg-[#FEF2F2] px-2 py-0.5 rounded-full border border-[#FEE2E2]">
                          Potongan -Rp {inspection.fee.toLocaleString('id-ID')}
                        </span>
                      )}
                    </div>

                    <div className="pt-2 border-t border-[#E5E7EB] space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer text-xs select-none">
                        <input
                          type="checkbox"
                          checked={inspection.isOk}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setItemInspections(prev => ({
                              ...prev,
                              [it.itemSku]: {
                                isOk: checked,
                                fee: checked ? 0 : 25000,
                                issueNote: checked ? '' : 'Perlu pencucian laundry standar',
                              }
                            }));
                          }}
                          className="rounded text-[#1B4332] accent-[#1B4332] w-4 h-4 cursor-pointer"
                        />
                        <span className="font-medium text-[#374151]">
                          Kondisi fisik utuh, bersih, pasak/kelengkapan lengkap & berfungsi normal
                        </span>
                      </label>

                      {!inspection.isOk && (
                        <div className="pl-6 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                          <button
                            type="button"
                            onClick={() => setItemInspections(prev => ({
                              ...prev,
                              [it.itemSku]: { isOk: false, fee: 25000, issueNote: 'Kotor lumpur / perlu laundry standard' }
                            }))}
                            className={`py-1 px-2.5 rounded-md border text-left text-[11px] cursor-pointer transition-colors ${
                              inspection.fee === 25000 ? 'bg-[#FFFBEB] border-[#FDE68A] text-[#B45309] font-bold' : 'bg-white border-[#E5E7EB] text-[#4B5563]'
                            }`}
                          >
                            Kotor Lumpur / Laundry (-Rp 25.000)
                          </button>
                          <button
                            type="button"
                            onClick={() => setItemInspections(prev => ({
                              ...prev,
                              [it.itemSku]: { isOk: false, fee: 50000, issueNote: 'Komponen hilang / cacat fisik ringan' }
                            }))}
                            className={`py-1 px-2.5 rounded-md border text-left text-[11px] cursor-pointer transition-colors ${
                              inspection.fee === 50000 ? 'bg-[#FEF2F2] border-[#FCA5A5] text-[#DC2626] font-bold' : 'bg-white border-[#E5E7EB] text-[#4B5563]'
                            }`}
                          >
                            Aksesoris Hilang / Rusak (-Rp 50.000)
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Financial Reconciliation & Deposit Handover */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-2xs sticky top-20">
              <div className="pb-3 border-b border-[#F3F4F6]">
                <span className="text-[10.5px] font-bold text-[#6B7280] uppercase tracking-wider block">
                  Rekapitulasi Klaim & Jaminan
                </span>
                <h3 className="text-base font-extrabold text-[#111827]">
                  Pencairan Deposit Konsumen
                </h3>
              </div>

              {/* Deposit Held */}
              <div className="py-3 border-b border-[#F3F4F6] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[#374151] font-medium block">Deposit Awal Ditahan</span>
                  <span className="text-[10px] text-[#6B7280]">Dari transaksi sewa #{activeTrx.id}</span>
                </div>
                <span className="text-sm font-bold text-[#111827] tnum">
                  Rp {initialDeposit.toLocaleString('id-ID')}
                </span>
              </div>

              {/* Deductions Breakdown */}
              <div className="py-3 border-b border-[#F3F4F6] space-y-2 text-xs">
                <span className="text-[10px] font-bold text-[#9CA3AF] uppercase block">
                  Rincian Potongan Lapangan:
                </span>

                {/* Keterlambatan Jam */}
                <div className="flex items-center justify-between text-[#374151]">
                  <span className="flex items-center gap-1.5 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-[#6B7280]" /> Keterlambatan (Jam):
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setLateHours(h => Math.max(0, h - 1))}
                      className="w-5 h-5 rounded bg-[#F3F4F6] text-xs font-bold text-[#374151] flex items-center justify-center cursor-pointer hover:bg-[#E5E7EB]"
                    >
                      -
                    </button>
                    <span className="font-bold w-5 text-center text-[#111827]">{lateHours}</span>
                    <button
                      type="button"
                      onClick={() => setLateHours(h => h + 1)}
                      className="w-5 h-5 rounded bg-[#F3F4F6] text-xs font-bold text-[#374151] flex items-center justify-center cursor-pointer hover:bg-[#E5E7EB]"
                    >
                      +
                    </button>
                    <span className="text-[10px] text-[#6B7280]">(x Rp 15rb)</span>
                  </div>
                </div>

                {lateFine > 0 && (
                  <div className="flex items-center justify-between text-[#DC2626] text-xs">
                    <span>Denda Terlambat ({lateHours} Jam)</span>
                    <span className="font-bold tnum">-Rp {lateFine.toLocaleString('id-ID')}</span>
                  </div>
                )}

                {itemDamageFee > 0 && (
                  <div className="flex items-center justify-between text-[#DC2626] text-xs">
                    <span>Biaya Kerusakan / Laundry Alat</span>
                    <span className="font-bold tnum">-Rp {itemDamageFee.toLocaleString('id-ID')}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-dashed border-[#E5E7EB] flex items-center justify-between text-[#4B5563]">
                  <span>Total Potongan Klaim:</span>
                  <span className={`font-bold tnum ${totalDeductions > 0 ? 'text-[#DC2626]' : 'text-[#6B7280]'}`}>
                    {totalDeductions > 0 ? `-Rp ${totalDeductions.toLocaleString('id-ID')}` : 'Rp 0'}
                  </span>
                </div>
              </div>

              {/* Net Refund Amount */}
              <div className="py-3.5 bg-[#ECFDF5] -mx-5 px-5 my-1 flex items-baseline justify-between border-y border-[#A7F3D0]">
                <div>
                  <span className="text-xs font-bold text-[#065F46] block">
                    SISA DEPOSIT DIKEMBALIKAN
                  </span>
                  <span className="text-[10.5px] text-[#047857]">
                    {initialDeposit === 0 ? 'Sewa tanpa uang deposit' : 'Wajib diserahkan ke pelanggan'}
                  </span>
                </div>
                <span className="text-2xl font-extrabold text-[#065F46] tnum">
                  Rp {netRefund.toLocaleString('id-ID')}
                </span>
              </div>

              {/* Refund Method */}
              <div className="pt-3 pb-2">
                <span className="text-[11px] font-bold text-[#4B5563] block mb-2">
                  Metode Pengembalian Uang:
                </span>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  {(['Tunai Langsung', 'Transfer Bank', 'E-Wallet'] as const).map((method) => (
                    <button
                      key={method}
                      onClick={() => setRefundMethod(method)}
                      className={`py-1.5 px-1 rounded-lg border text-center font-semibold text-[11px] transition-colors cursor-pointer ${
                        refundMethod === method
                          ? 'bg-[#1B4332] text-white border-[#1B4332]'
                          : 'bg-[#F9FAFB] border-[#E5E7EB] text-[#374151] hover:bg-[#F3F4F6]'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Jaminan Handover Checkbox */}
              <div className="p-3 bg-[#F8FAF9] rounded-lg border border-[#E5E7EB] my-3">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={idCardReturned}
                    onChange={(e) => setIdCardReturned(e.target.checked)}
                    className="w-4 h-4 rounded text-[#1B4332] accent-[#1B4332] mt-0.5 cursor-pointer"
                  />
                  <span className="text-xs text-[#1F2937] leading-snug">
                    <strong>Serah Terima Kartu Jaminan:</strong> Telah mengembalikan{' '}
                    <span className="underline font-semibold">{activeTrx.idTypeHeld || 'e-KTP Asli'}</span> kepada pelanggan atas nama{' '}
                    <strong className="text-[#111827]">{activeTrx.customerName}</strong>.
                  </span>
                </label>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button
                  id="btn-selesaikan-pengembalian"
                  onClick={handleFinishInspection}
                  disabled={!idCardReturned}
                  className="w-full py-2.5 rounded-lg bg-[#1B4332] hover:bg-[#2D6A4F] disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Selesaikan & Cetak Bukti Serah Terima</span>
                </button>

                <button
                  onClick={() => alert("Transaksi ditahan sementara untuk koordinasi lebih lanjut.")}
                  className="w-full py-2 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] hover:bg-[#FEE2E2] text-xs font-semibold text-[#DC2626] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Tahan Jaminan Sementara (Sengketa)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Riwayat Pengembalian Selesai */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl border border-[#E5E7EB] animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F8FAF9]">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#1B4332]" />
                <h3 className="text-sm font-bold text-[#111827]">Riwayat Pengembalian Selesai</h3>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1 rounded-lg text-[#6B7280] hover:text-[#111827] hover:bg-[#E5E7EB]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-3">
              {completedTransactions.length === 0 ? (
                <div className="py-12 text-center text-[#6B7280] text-xs">
                  Belum ada riwayat pengembalian yang diselesaikan.
                </div>
              ) : (
                completedTransactions.map((t, idx) => (
                  <div key={idx} className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-[#111827]">{t.id}</span>
                        <span className="text-[10px] font-bold text-[#059669] bg-[#ECFDF5] border border-[#A7F3D0] px-2 py-0.5 rounded-full">
                          Selesai & Dikembalikan
                        </span>
                      </div>
                      <p className="text-[#4B5563] mt-0.5 font-medium">
                        Penyewa: <strong>{t.customerName}</strong> ({t.customerPhone})
                      </p>
                      <p className="text-[11px] text-[#6B7280]">
                        {t.items.map(i => `${i.quantity}x ${i.itemName}`).join(', ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-[#111827] block">
                        Rp {(t.totalPaid || t.subtotal || 0).toLocaleString('id-ID')}
                      </span>
                      <span className="text-[10.5px] text-[#059669]">
                        Jaminan {t.idTypeHeld} Diserahkan
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 border-t border-[#E5E7EB] bg-[#F9FAFB] text-right">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-1.5 text-xs font-semibold bg-[#111827] text-white rounded-lg hover:bg-black cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
