import React from 'react';
import { Printer, CheckCircle2, X, Download } from 'lucide-react';
import { BaliCampingBadge } from '../AppLogo';

interface ReturnReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: any;
}

export const ReturnReceiptModal: React.FC<ReturnReceiptModalProps> = ({
  isOpen,
  onClose,
  summary,
}) => {
  if (!isOpen || !summary) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full my-auto shadow-2xl border border-[#E5E7EB] overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95">
        <div className="p-4 bg-[#ECFDF5] border-b border-[#A7F3D0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#059669]" />
            <div>
              <h3 className="text-xs font-bold text-[#065F46]">
                Pengembalian Sukses & Deposit Dicairkan
              </h3>
              <p className="text-[10px] text-[#047857]">
                Transaksi {summary.trxId} telah ditutup
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#065F46] hover:bg-[#D1FAE5]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs text-[#1F2937] overflow-y-auto">
          {/* Header */}
          <div className="text-center pb-3 border-b border-[#F3F4F6]">
            <BaliCampingBadge className="w-10 h-10 mx-auto mb-2" />
            <h2 className="font-extrabold text-sm text-[#111827]">
              BALI CAMPING ADVENTURE
            </h2>
            <p className="text-[10px] text-[#6B7280]">
              BUKTI SERAH TERIMA PENGEMBALIAN & REFUND JAMINAN
            </p>
            <span className="font-mono font-bold text-[#1B4332] text-xs">
              {summary.trxId}
            </span>
          </div>

          {/* Customer */}
          <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] text-[11px] space-y-1">
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Penyewa:</span>
              <strong className="text-[#111827]">{summary.customerName}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Status Kartu Identitas:</span>
              <strong className="text-[#059669]">✓ Telah Diserahkan Kembali</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Waktu Verifikasi:</span>
              <span>{summary.timestamp}</span>
            </div>
          </div>

          {/* Accounting calculation */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-[#4B5563]">
              <span>Deposit Jaminan Ditahan Awal:</span>
              <span className="font-bold text-[#111827] tnum">
                Rp {summary.initialDeposit?.toLocaleString('id-ID')}
              </span>
            </div>

            {summary.lateFine > 0 && (
              <div className="flex justify-between text-[#DC2626]">
                <span>Denda Keterlambatan:</span>
                <span className="font-semibold tnum">-Rp {summary.lateFine?.toLocaleString('id-ID')}</span>
              </div>
            )}

            {summary.missingPegsFine > 0 && (
              <div className="flex justify-between text-[#DC2626]">
                <span>Ganti Rugi Pasak Hilang (2 pcs):</span>
                <span className="font-semibold tnum">-Rp {summary.missingPegsFine?.toLocaleString('id-ID')}</span>
              </div>
            )}

            {summary.laundryFee > 0 && (
              <div className="flex justify-between text-[#D97706]">
                <span>Biaya Cuci Deep Clean:</span>
                <span className="font-semibold tnum">-Rp {summary.laundryFee?.toLocaleString('id-ID')}</span>
              </div>
            )}

            <div className="pt-2 border-t border-[#111827] flex justify-between font-extrabold text-sm text-[#065F46] bg-[#ECFDF5] p-2 rounded-lg">
              <span>UANG REFUND DIKEMBALIKAN:</span>
              <span className="tnum">Rp {summary.netRefund?.toLocaleString('id-ID')}</span>
            </div>
            <div className="text-right text-[10.5px] text-[#6B7280]">
              Diserahkan via: <strong className="text-[#111827]">{summary.refundMethod}</strong>
            </div>
          </div>

          <div className="text-[10px] text-[#6B7280] text-center italic">
            Terima kasih telah menyewa perlengkapan di Bali Camping Adventure. Semoga pendakian Anda berkesan dan selamat kembali beraktivitas.
          </div>
        </div>

        <div className="p-4 bg-[#F9FAFB] border-t border-[#E5E7EB] flex items-center justify-between">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1B4332] text-white text-xs font-semibold hover:bg-[#2D6A4F] cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Struk Thermal</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-[#E5E7EB] text-[#374151] rounded-lg hover:bg-[#D1D5DB] cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
