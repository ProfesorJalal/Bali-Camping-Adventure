import React from 'react';
import { Printer, Download, Share2, X, CheckCircle2 } from 'lucide-react';
import { BaliCampingBadge } from '../AppLogo';
import { formatWITADate } from '../../utils/timeZone';

interface RentalAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  onCompleteTransaction?: (data: any) => void;
}

export const RentalAgreementModal: React.FC<RentalAgreementModalProps> = ({
  isOpen,
  onClose,
  data,
  onCompleteTransaction,
}) => {
  if (!isOpen || !data) return null;

  const handlePrint = () => {
    window.print();
  };

  // Menyesuaikan otomatis tanggal sewa secara real-time WITA
  const getFormattedRentalDate = () => {
    const rawDate = data.rawPickupDate || data.rentalDate;
    if (rawDate) {
      return formatWITADate(rawDate);
    }
    if (data.pickupDate) {
      const datePart = data.pickupDate.split('(')[0].trim();
      const parsed = new Date(datePart);
      if (!isNaN(parsed.getTime())) {
        return formatWITADate(datePart);
      }
      return data.pickupDate;
    }
    if (data.createdAt) {
      return formatWITADate(data.createdAt);
    }
    return formatWITADate(new Date());
  };

  const formattedRentalDate = getFormattedRentalDate();
  const defaultBookingId = `#SP-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-001`;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full my-auto shadow-2xl border border-[#E5E7EB] overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95">
        {/* Modal Top Bar (Screen only) */}
        <div className="p-4 bg-[#F8FAF9] border-b border-[#E5E7EB] flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
            <span className="text-xs font-bold text-[#111827]">Surat Perjanjian Sewa (Digital Contract)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Kontrak</span>
            </button>
            {onCompleteTransaction && (
              <button
                onClick={() => {
                  onCompleteTransaction(data);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                title="Selesaikan transaksi dan masukkan ke Log & Finansial"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Selesai & Masuk Log</span>
              </button>
            )}
            <button
              onClick={() => alert(`Link PDF dikirim via WhatsApp ke ${data.customerPhone || '0813-9944-1234'}`)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#E5E7EB] hover:bg-white text-xs font-medium text-[#374151]"
              title="Kirim ke WhatsApp Penyewa"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#111827] hover:bg-[#E5E7EB]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Contract Body */}
        <div className="p-6 sm:p-8 overflow-y-auto font-sans text-xs text-[#1F2937] space-y-6 print:p-0">
          {/* Letterhead */}
          <div className="flex items-start justify-between border-b-2 border-[#1B4332] pb-4">
            <div className="flex items-center gap-3">
              <BaliCampingBadge className="w-12 h-12" />
              <div>
                <h1 className="text-base font-extrabold text-[#111827] tracking-tight">
                  BALI CAMPING ADVENTURE
                </h1>
                <p className="text-[10.5px] text-[#4B5563] font-medium">
                  Sewa Alat Camping dan Mendaki di Bali
                </p>
                <p className="text-[10px] text-[#6B7280]">
                  Jl. Astasura, Gg.Lestari No.2, Denpasar, Bali • CS: 0812-0821-6669-7203
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">
                SURAT PERJANJIAN SEWA
              </span>
              <span className="text-xs font-extrabold text-[#1B4332] font-mono">
                {data.bookingId || defaultBookingId}
              </span>
              <span className="text-[10px] text-[#6B7280] block mt-0.5">
                Tanggal: {formattedRentalDate}
              </span>
            </div>
          </div>

          {/* Part 1 & Part 2 Info */}
          <div className="grid grid-cols-2 gap-4 p-3 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] text-[11px]">
            <div>
              <span className="font-bold text-[#1B4332] block uppercase text-[10px] tracking-wider mb-1">
                PIHAK PERTAMA (PENYEDIA):
              </span>
              <p className="font-semibold text-[#111827]">Bali Camping Adventure</p>
            </div>
            <div>
              <span className="font-bold text-[#1B4332] block uppercase text-[10px] tracking-wider mb-1">
                PIHAK KEDUA (PENYEWA):
              </span>
              <p className="font-semibold text-[#111827]">{data.customerName || 'Bintang Ramadhan'}</p>
              <p className="text-[#6B7280]">No. HP: {data.customerPhone || '0813-9944-1234'}</p>
              <p className="text-[#6B7280]">Jaminan Ditahan: <strong className="text-[#111827]">{data.guaranteeType || 'E-KTP Asli'}</strong></p>
              <p className="text-[#6B7280]">Tujuan: {data.destination || 'Gunung Gede Pangrango'}</p>
              <p className="text-[#6B7280]">Jadwal Sewa: <strong className="text-[#111827]">{data.pickupDate || `${formattedRentalDate} (09:00 WITA)`} s/d {data.returnDate || `${formattedRentalDate} (18:00 WITA)`}</strong></p>
            </div>
          </div>

          {/* Table of Rented Items */}
          <div>
            <span className="text-[11px] font-bold text-[#111827] uppercase tracking-wider block mb-2">
              Daftar Perlengkapan yang Diserahkan (Kondisi Bersih & Siap Pakai)
            </span>
            <table className="w-full text-left text-xs border border-[#E5E7EB] rounded-lg overflow-hidden">
              <thead className="bg-[#F3F4F6] text-[10.5px] font-bold text-[#4B5563] uppercase">
                <tr>
                  <th className="py-2 px-3">Nama Alat & Spesifikasi</th>
                  <th className="py-2 px-2 text-center">Qty</th>
                  <th className="py-2 px-3">Durasi Sewa</th>
                  <th className="py-2 px-3 text-right">Tarif / Hari</th>
                  <th className="py-2 px-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {data.items?.map((itemEntry: any, i: number) => (
                  <tr key={i}>
                    <td className="py-2 px-3 font-semibold text-[#111827]">
                      {itemEntry.item?.name || itemEntry.name}
                    </td>
                    <td className="py-2 px-2 text-center font-bold">{itemEntry.quantity}</td>
                    <td className="py-2 px-3 text-[#4B5563]">{data.durationDays || 3} Hari</td>
                    <td className="py-2 px-3 text-right text-[#4B5563] tnum">
                      Rp {(itemEntry.pricePerDay || itemEntry.item?.dailyRate || 50000).toLocaleString('id-ID')}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-[#111827] tnum">
                      Rp {(itemEntry.quantity * (data.durationDays || 3) * (itemEntry.pricePerDay || itemEntry.item?.dailyRate || 50000)).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Breakdown */}
          <div className="flex justify-end">
            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-[#6B7280]">
                <span>Total Sewa Alat:</span>
                <span className="font-semibold text-[#111827] tnum">
                  Rp {(data.subtotalSewa || 510000).toLocaleString('id-ID')}
                </span>
              </div>
              {data.discountAmount > 0 && (
                <div className="flex justify-between text-[#059669]">
                  <span>Diskon Member:</span>
                  <span className="font-semibold tnum">
                    -Rp {data.discountAmount.toLocaleString('id-ID')}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-[#6B7280]">
                <span>Deposit Jaminan (Refundable):</span>
                <span className="font-semibold text-[#111827] tnum">
                  Rp {(data.refundableDeposit || 200000).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="pt-2 border-t border-[#111827] flex justify-between font-extrabold text-sm text-[#111827]">
                <span>TOTAL DITERIMA:</span>
                <span className="tnum">Rp {(data.totalPayment || 659000).toLocaleString('id-ID')}</span>
              </div>
              <div className="text-right text-[10px] text-[#059669] font-bold">
                ✓ LUNAS via {data.paymentMethod || 'QRIS POS'}
                {data.paymentMethod === 'BCA Transfer' && (
                  <span className="block text-[9px] text-[#6B7280] font-normal mt-0.5">
                    Rek: 008419440417 (blu by BCA Digital) a/n I Made Ferry Amanda Putra, S.tr.T
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Legal Clauses */}
          <div className="p-3 bg-[#F8FAF9] rounded-lg border border-[#E5E7EB] text-[10px] text-[#4B5563] space-y-1 leading-relaxed">
            <span className="font-bold text-[#111827] block text-[10.5px]">KETENTUAN & KESEPAKATAN:</span>
            <p>1. Penyewa wajib mengembalikan perlengkapan paling lambat tanggal <strong>{data.returnDate || `${formattedRentalDate} (18:00 WITA)`}</strong>.</p>
            <p>2. Keterlambatan pengembalian tanpa konfirmasi dikenakan denda Rp 5.000 / jam.</p>
            <p>3. Segala kerusakan kain, frame bengkok, atau kehilangan komponen pasak/tali menjadi tanggung jawab Penyewa.</p>
            <p>4. Jaminan fisik akan dikembalikan utuh segera setelah pengecekan fisik selesai di Basecamp Bali Camping Adventure.</p>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-4">
            <div className="text-center">
              <p className="text-[10px] text-[#6B7280]">Pihak Pertama (Bali Camping Adventure),</p>
              <div className="h-16 flex items-center justify-center font-serif italic text-sm text-[#1B4332]">
                ( Administrator )
              </div>
              <p className="text-xs font-bold text-[#111827] border-t border-[#9CA3AF] pt-1 inline-block px-4">
                Administrator
              </p>
            </div>

            <div className="text-center">
              <p className="text-[10px] text-[#6B7280]">Pihak Kedua (Penyewa),</p>
              <div className="h-16 flex items-center justify-center font-serif italic text-sm text-[#1B4332]">
                ( {data.customerName || 'Bintang Ramadhan'} )
              </div>
              <p className="text-xs font-bold text-[#111827] border-t border-[#9CA3AF] pt-1 inline-block px-4">
                {data.customerName || 'Bintang Ramadhan'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#F9FAFB] border-t border-[#E5E7EB] flex items-center justify-between print:hidden">
          <span className="text-[11px] text-[#6B7280]">
            Dokumen sah digital nomor <strong>{data.bookingId || defaultBookingId}</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-[#4B5563] hover:bg-[#E5E7EB] rounded-lg cursor-pointer"
            >
              Tutup Preview
            </button>
            {onCompleteTransaction && (
              <button
                onClick={() => {
                  onCompleteTransaction(data);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-[#1B4332] hover:bg-[#2D6A4F] text-white rounded-lg shadow-xs cursor-pointer transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Selesai Transaksi & Masuk Log</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
