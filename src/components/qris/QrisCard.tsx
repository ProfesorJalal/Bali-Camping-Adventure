import React, { useEffect, useState } from 'react';
import { generateQrisDataUrl } from '../../utils/qris';
import { Download, CheckCircle2, Copy, Smartphone, Scan, CreditCard } from 'lucide-react';

interface QrisCardProps {
  amount: number;
  transactionId?: string;
  onPaymentConfirmed?: () => void;
  compact?: boolean;
}

export const QrisCard: React.FC<QrisCardProps> = ({
  amount,
  transactionId = 'TRX-POS',
  onPaymentConfirmed,
  compact = false,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    generateQrisDataUrl(amount).then((url) => {
      if (isMounted) setQrDataUrl(url);
    });
    return () => {
      isMounted = false;
    };
  }, [amount]);

  const handleCopyNominal = () => {
    navigator.clipboard.writeText(amount.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `QRIS-BaliCamping-Rp${amount}.png`;
    link.click();
  };

  return (
    <div className={`relative bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-md flex flex-col items-center select-none ${compact ? 'max-w-sm p-4' : 'max-w-md p-6'}`}>
      
      {/* Decorative Red Corner Angles matching standard Indonesian QRIS voucher */}
      <div 
        className="absolute -top-12 -left-12 w-28 h-28 bg-[#E11D48] rotate-45 pointer-events-none opacity-90 shadow-sm"
      />
      <div 
        className="absolute -bottom-14 -right-14 w-32 h-32 bg-[#E11D48] rotate-45 pointer-events-none opacity-90 shadow-sm"
      />

      {/* Header: Logos */}
      <div className="w-full flex items-center justify-between z-10 pb-3 border-b border-[#F3F4F6]">
        {/* QRIS Logo */}
        <div className="flex items-center gap-1.5">
          <div className="bg-[#111827] text-white px-2 py-0.5 rounded text-[15px] font-black tracking-tighter italic">
            QRIS
          </div>
          <div className="leading-tight">
            <span className="block text-[8px] font-extrabold text-[#111827] uppercase tracking-tight">
              QR Code Standar
            </span>
            <span className="block text-[8px] font-bold text-[#E11D48] uppercase tracking-tight">
              Pembayaran Nasional
            </span>
          </div>
        </div>

        {/* GPN Logo */}
        <div className="flex items-center gap-1">
          <svg className="w-5 h-5 text-[#E11D48]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5 10 5 10-5-5-2.5-5 2.5z" />
          </svg>
          <span className="text-[13px] font-black text-[#1E3A8A] tracking-tighter">
            GPN
          </span>
        </div>
      </div>

      {/* Merchant Details */}
      <div className="text-center my-3 z-10 w-full">
        <h3 className="text-sm font-black text-[#111827] tracking-tight uppercase">
          BALI CAMPING ADVENTURE
        </h3>
        <p className="text-[11px] font-bold text-[#4B5563] tracking-wide mt-0.5">
          NMID: <span className="font-mono text-[#111827]">ID1026527493195</span>
        </p>
        <div className="inline-block bg-[#F3F4F6] text-[#374151] font-mono font-bold text-[10px] px-2 py-0.5 rounded mt-1">
          A01
        </div>
      </div>

      {/* Dynamic Amount Banner */}
      <div className="w-full bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl p-2.5 mb-3 text-center z-10">
        <span className="text-[10px] font-bold text-[#065F46] uppercase tracking-wider block">
          Total Tagihan QRIS Pos
        </span>
        <div className="flex items-center justify-center gap-1.5 mt-0.5">
          <span className="text-xl font-black text-[#047857] font-mono">
            Rp {amount.toLocaleString('id-ID')}
          </span>
          <button
            type="button"
            onClick={handleCopyNominal}
            title="Salin Nominal"
            className="p-1 hover:bg-[#D1FAE5] rounded text-[#065F46] transition-colors cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
        {copied && (
          <span className="text-[10px] text-[#059669] font-semibold block animate-fade-in">
            Nominal berhasil disalin!
          </span>
        )}
      </div>

      {/* Center QR Code */}
      <div className="relative p-2.5 bg-white border-2 border-[#111827] rounded-xl shadow-xs z-10 my-1">
        {qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt="QRIS Bali Camping Adventure"
            className="w-56 h-56 object-contain block mx-auto"
          />
        ) : (
          <div className="w-56 h-56 flex items-center justify-center text-xs text-[#6B7280]">
            Memuat kode QRIS...
          </div>
        )}
      </div>

      {/* Aspi notice */}
      <div className="text-center mt-3 mb-2 z-10">
        <span className="text-[10.5px] font-extrabold text-[#111827] tracking-wider block">
          SATU QRIS UNTUK SEMUA
        </span>
        <span className="text-[9.5px] text-[#6B7280]">
          Cek aplikasi penyelenggara di: <span className="font-semibold text-[#2563EB]">www.aspi-qris.id</span>
        </span>
      </div>

      {/* Instructions & Footnotes */}
      <div className="w-full pt-3 border-t border-[#F3F4F6] text-center z-10">
        <span className="text-[10px] font-bold text-[#4B5563] block mb-1.5">
          Cara Pembayaran QRIS:
        </span>
        <div className="grid grid-cols-3 gap-1 text-center">
          <div className="p-1.5 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
            <Smartphone className="w-3.5 h-3.5 text-[#059669] mx-auto mb-1" />
            <span className="text-[9px] font-semibold text-[#374151] block leading-tight">
              Buka Aplikasi Berlogo QRIS
            </span>
          </div>
          <div className="p-1.5 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
            <Scan className="w-3.5 h-3.5 text-[#2563EB] mx-auto mb-1" />
            <span className="text-[9px] font-semibold text-[#374151] block leading-tight">
              Scan dan Cek Nominal
            </span>
          </div>
          <div className="p-1.5 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
            <CreditCard className="w-3.5 h-3.5 text-[#7C3AED] mx-auto mb-1" />
            <span className="text-[9px] font-semibold text-[#374151] block leading-tight">
              Konfirmasi & Bayar
            </span>
          </div>
        </div>

        {/* Metadata Footer */}
        <div className="flex items-center justify-between text-[9px] text-[#9CA3AF] mt-3">
          <span>Dicetak oleh: 93600914</span>
          <span>Versi cetak: v0.0.2026.06.02</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full mt-4 flex gap-2 z-10">
        <button
          type="button"
          onClick={handleDownload}
          className="flex-1 py-2 px-3 bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#111827] text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Unduh QRIS</span>
        </button>

        {onPaymentConfirmed && (
          <button
            type="button"
            onClick={onPaymentConfirmed}
            className="flex-1 py-2 px-3 bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Konfirmasi Bayar</span>
          </button>
        )}
      </div>

    </div>
  );
};
