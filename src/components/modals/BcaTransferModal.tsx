import React, { useState } from 'react';
import { X, Building2, Copy, CheckCircle2, ArrowRight } from 'lucide-react';

interface BcaTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  customerName?: string;
  onPaymentConfirmed?: () => void;
}

export const BcaTransferModal: React.FC<BcaTransferModalProps> = ({
  isOpen,
  onClose,
  amount,
  customerName,
  onPaymentConfirmed,
}) => {
  const [copiedRekening, setCopiedRekening] = useState(false);
  const [copiedNominal, setCopiedNominal] = useState(false);

  if (!isOpen) return null;

  const handleCopyRekening = () => {
    navigator.clipboard.writeText('008419440417');
    setCopiedRekening(true);
    setTimeout(() => setCopiedRekening(false), 2000);
  };

  const handleCopyNominal = () => {
    navigator.clipboard.writeText(String(amount));
    setCopiedNominal(true);
    setTimeout(() => setCopiedNominal(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-[#E5E7EB] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#F3F4F6] flex items-center justify-between bg-[#F8FAF9]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#EFF6FF] text-[#1E40AF] rounded-xl border border-[#BFDBFE]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#111827]">
                Pembayaran Transfer Bank BCA
              </h2>
              <p className="text-[11px] text-[#6B7280]">
                blu by BCA Digital • Bali Camping Adventure
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#9CA3AF] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3.5 bg-[#F9FAFB]">
          {/* Total Transfer Card */}
          <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl p-3.5 text-center">
            <span className="text-[11px] font-semibold text-[#065F46] block mb-1">
              TOTAL TRANSFER (SESUAI TOTAL PEMBAYARAN)
            </span>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-extrabold text-[#047857] tnum">
                Rp {amount.toLocaleString('id-ID')}
              </span>
              <button
                type="button"
                onClick={handleCopyNominal}
                className="text-[11px] font-bold text-[#065F46] bg-white hover:bg-[#D1FAE5] px-2 py-1 rounded-md border border-[#A7F3D0] flex items-center gap-1 cursor-pointer transition-colors"
                title="Salin total transfer"
              >
                {copiedNominal ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                    <span>Disalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>
            {customerName && (
              <p className="text-[10.5px] text-[#059669] mt-1.5 font-medium">
                Penyewa: {customerName}
              </p>
            )}
          </div>

          {/* Bank Details Box */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 space-y-3 shadow-2xs">
            {/* Bank Info */}
            <div className="flex items-center justify-between pb-2.5 border-b border-[#F3F4F6]">
              <span className="text-xs text-[#6B7280]">Bank Tujuan</span>
              <span className="text-xs font-bold text-[#1E40AF] bg-[#EFF6FF] px-2.5 py-0.5 rounded-full border border-[#BFDBFE]">
                blu by BCA Digital
              </span>
            </div>

            {/* No Rekening */}
            <div>
              <span className="text-[10.5px] text-[#6B7280] font-medium block mb-1">
                No. Rekening
              </span>
              <div className="flex items-center justify-between bg-[#F9FAFB] p-2.5 rounded-lg border border-[#E5E7EB]">
                <span className="font-mono font-extrabold text-base text-[#111827] tracking-wider select-all">
                  008419440417
                </span>
                <button
                  type="button"
                  onClick={handleCopyRekening}
                  className="text-xs font-bold text-[#1B4332] bg-[#ECFDF5] hover:bg-[#D1FAE5] px-2.5 py-1 rounded-md border border-[#A7F3D0] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {copiedRekening ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                      <span>Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Rekening</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Atas Nama */}
            <div>
              <span className="text-[10.5px] text-[#6B7280] font-medium block mb-1">
                Atas Nama
              </span>
              <div className="bg-[#F9FAFB] p-2.5 rounded-lg border border-[#E5E7EB]">
                <p className="font-bold text-xs text-[#111827]">
                  I Made Ferry Amanda Putra, S.tr.T
                </p>
              </div>
            </div>
          </div>

          {/* Quick guide */}
          <div className="p-3 bg-white rounded-xl border border-[#E5E7EB] text-[11px] text-[#6B7280] space-y-1">
            <span className="font-bold text-[#111827] block text-[11px] mb-0.5">
              Panduan Pembayaran:
            </span>
            <p className="flex items-center gap-1.5">
              <ArrowRight className="w-3 h-3 text-[#1B4332] shrink-0" />
              Transfer melalui BCA Mobile, myBCA, blu app, atau ATM bank lain.
            </p>
            <p className="flex items-center gap-1.5">
              <ArrowRight className="w-3 h-3 text-[#1B4332] shrink-0" />
              Pastikan nama penerima <strong>I Made Ferry Amanda Putra, S.tr.T</strong>.
            </p>
            <p className="flex items-center gap-1.5">
              <ArrowRight className="w-3 h-3 text-[#1B4332] shrink-0" />
              Masukkan nominal tepat <strong>Rp {amount.toLocaleString('id-ID')}</strong>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F9FAFB] border-t border-[#E5E7EB] flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#4B5563] hover:bg-[#E5E7EB] rounded-lg transition-colors cursor-pointer"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={() => {
              if (onPaymentConfirmed) onPaymentConfirmed();
              onClose();
            }}
            className="px-4 py-2 text-xs font-bold bg-[#1B4332] hover:bg-[#2D6A4F] text-white rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Konfirmasi Pembayaran Selesai</span>
          </button>
        </div>
      </div>
    </div>
  );
};
