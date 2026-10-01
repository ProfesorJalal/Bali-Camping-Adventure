import React from 'react';
import { X, QrCode } from 'lucide-react';
import { QrisCard } from '../qris/QrisCard';

interface QrisPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  transactionId?: string;
  onPaymentConfirmed?: () => void;
}

export const QrisPaymentModal: React.FC<QrisPaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  transactionId,
  onPaymentConfirmed,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[95vh] overflow-y-auto shadow-2xl border border-[#E5E7EB] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#F3F4F6] flex items-center justify-between bg-[#F8FAF9]">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#ECFDF5] text-[#059669] rounded-lg border border-[#A7F3D0]">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#111827]">
                Pembayaran QRIS POS Sentral
              </h2>
              <p className="text-[11px] text-[#6B7280]">
                Scan barcode menggunakan M-Banking atau E-Wallet apa pun
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

        {/* Content Card */}
        <div className="p-5 flex justify-center bg-[#F9FAFB]">
          <QrisCard
            amount={amount}
            transactionId={transactionId}
            onPaymentConfirmed={() => {
              if (onPaymentConfirmed) onPaymentConfirmed();
              onClose();
            }}
          />
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-white border-t border-[#F3F4F6] text-center text-[11px] text-[#6B7280]">
          Setelah penyewa melakukan transfer QRIS, sistem kasir akan menandai pesanan lunas secara instan.
        </div>
      </div>
    </div>
  );
};
