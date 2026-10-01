import React, { useState } from 'react';
import { 
  Check, 
  Calendar, 
  User, 
  Phone, 
  CreditCard, 
  Mountain, 
  Search, 
  Plus, 
  Minus, 
  Printer, 
  Bookmark, 
  HelpCircle, 
  QrCode, 
  Building2, 
  Banknote,
  CheckCircle2,
  Trash2,
  ShieldCheck,
  Clock,
  Copy
} from 'lucide-react';
import { InventoryItem, SelectedRentalItem } from '../../types';
import { 
  getTodayWITAYMD, 
  getCurrentWITATimeHM, 
  addDaysToYMD, 
  calculateDurationDays 
} from '../../utils/timeZone';
import { QrisCard } from '../qris/QrisCard';
import { QrisPaymentModal } from '../modals/QrisPaymentModal';
import { BcaTransferModal } from '../modals/BcaTransferModal';

interface SewaBaruViewProps {
  inventory: InventoryItem[];
  onPrintRentalContract: (rentalData: any) => void;
  onCompleteTransaction?: (rentalData: any) => void;
}

export const SewaBaruView: React.FC<SewaBaruViewProps> = ({
  inventory,
  onPrintRentalContract,
  onCompleteTransaction,
}) => {
  // State to track if contract has been processed / printed
  const [isContractProcessed, setIsContractProcessed] = useState(false);
  const [processedPayload, setProcessedPayload] = useState<any | null>(null);

  // Customer Form State - starts empty to be filled manually by admin
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerKtp, setCustomerKtp] = useState('');
  const [isPhysicalGuaranteeHeld, setIsPhysicalGuaranteeHeld] = useState(true);
  const [guaranteeType, setGuaranteeType] = useState<'E-KTP Asli' | 'SIM A' | 'Paspor RI'>('E-KTP Asli');
  const [destination, setDestination] = useState('');

  // Logistic Schedule State (Real-time WITA GMT+8)
  const [pickupDate, setPickupDate] = useState(() => getTodayWITAYMD());
  const [pickupTime, setPickupTime] = useState(() => getCurrentWITATimeHM() || '10:00');
  const [durationDays, setDurationDays] = useState(3);
  const [returnDate, setReturnDate] = useState(() => addDaysToYMD(getTodayWITAYMD(), 2));
  const [returnTime, setReturnTime] = useState('18:00');

  // Selected Rental Items - starts empty to be filled manually
  const [selectedItems, setSelectedItems] = useState<{
    item: InventoryItem;
    quantity: number;
    pricePerDay: number;
  }[]>([]);

  // Payment & QC State
  const [applyMemberDiscount, setApplyMemberDiscount] = useState(true);
  const [refundableDeposit, setRefundableDeposit] = useState(0); // 0 = Tanpa Jaminan
  const [paymentMethod, setPaymentMethod] = useState<'QRIS POS' | 'BCA Transfer' | 'Tunai'>('QRIS POS');
  const [isQrisModalOpen, setIsQrisModalOpen] = useState(false);
  const [isBcaModalOpen, setIsBcaModalOpen] = useState(false);
  const [qcNotes, setQcNotes] = useState(
    'Semua tenda sudah disinfeksi, pasak lengkap (10 pcs), flysheet bersih tanpa bocor. Tali webbing carrier utuh & buckle responsif.'
  );

  // Quick Catalog Picker Modal State
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [catalogFilter, setCatalogFilter] = useState('');

  // Helper for rounding to multiples of 1,000
  const roundToThousand = (val: number, minVal: number = 0) => {
    const num = Number(val);
    if (isNaN(num) || num <= minVal) return minVal;
    return Math.round(num / 1000) * 1000;
  };

  // Two-way synchronization handlers for Duration and Schedule
  const handleDurationChange = (newDays: number) => {
    const validDays = Math.max(1, Math.round(newDays) || 1);
    setDurationDays(validDays);
    setReturnDate(addDaysToYMD(pickupDate, validDays - 1));
  };

  const handlePickupDateChange = (newPickupDate: string) => {
    setPickupDate(newPickupDate);
    // Keep duration intact and update returnDate accordingly
    setReturnDate(addDaysToYMD(newPickupDate, durationDays - 1));
  };

  const handleReturnDateChange = (newReturnDate: string) => {
    if (newReturnDate < pickupDate) {
      setReturnDate(pickupDate);
      setDurationDays(1);
      return;
    }
    setReturnDate(newReturnDate);
    const calculatedDays = calculateDurationDays(pickupDate, newReturnDate);
    setDurationDays(calculatedDays);
  };

  // Calculations (strictly in multiples of 1,000)
  const subtotalSewa = selectedItems.reduce((acc, curr) => {
    const cleanRate = roundToThousand(curr.pricePerDay, 1000);
    return acc + curr.quantity * durationDays * cleanRate;
  }, 0);

  const discountAmount = applyMemberDiscount ? roundToThousand(subtotalSewa * 0.1, 0) : 0;
  const totalPayment = subtotalSewa - discountAmount + roundToThousand(refundableDeposit, 0);

  const handleUpdateQuantity = (index: number, delta: number) => {
    const updated = [...selectedItems];
    const newQty = updated[index].quantity + delta;
    if (newQty <= 0) {
      updated.splice(index, 1);
    } else {
      updated[index].quantity = newQty;
    }
    setSelectedItems(updated);
  };

  const handleUpdateItemPrice = (index: number, newPrice: number) => {
    const updated = [...selectedItems];
    updated[index].pricePerDay = roundToThousand(newPrice, 1000);
    setSelectedItems(updated);
  };

  const handleAddItemFromCatalog = (item: InventoryItem) => {
    const cleanRate = roundToThousand(item.dailyRate, 1000);
    const existingIndex = selectedItems.findIndex(i => i.item.id === item.id);
    if (existingIndex >= 0) {
      handleUpdateQuantity(existingIndex, 1);
    } else {
      setSelectedItems([
        ...selectedItems,
        { item, quantity: 1, pricePerDay: cleanRate }
      ]);
    }
    setShowCatalogModal(false);
  };

  const handleTriggerContractPrint = () => {
    if (!customerName.trim()) {
      alert("Harap masukkan nama lengkap penyewa terlebih dahulu.");
      return;
    }
    if (selectedItems.length === 0) {
      alert("Harap pilih minimal satu alat perlengkapan dari katalog terlebih dahulu.");
      return;
    }

    const rentalPayload = {
      bookingId: `#TRX-${Date.now().toString().slice(-6)}`,
      customerName,
      customerPhone: customerPhone || '-',
      customerKtp: customerKtp || '-',
      guaranteeType,
      destination: destination || 'Ekspedisi Pendakian',
      pickupDate: `${pickupDate} (${pickupTime} WITA)`,
      rawPickupDate: pickupDate,
      pickupTime: `${pickupTime} WITA`,
      returnDate: `${returnDate} (${returnTime} WITA)`,
      rawReturnDate: returnDate,
      returnTime: `${returnTime} WITA`,
      rentalDate: pickupDate,
      durationDays,
      items: selectedItems,
      subtotalSewa,
      discountAmount,
      refundableDeposit,
      totalPayment,
      paymentMethod,
      qcNotes,
      dispatchOfficer: 'Bali Camping Adventure',
      createdAt: new Date().toISOString(),
    };
    setProcessedPayload(rentalPayload);
    setIsContractProcessed(true);
    onPrintRentalContract(rentalPayload);
  };

  const handleCompleteTransactionAction = () => {
    let payload = processedPayload;
    if (!payload) {
      if (!customerName.trim()) {
        alert("Harap masukkan nama lengkap penyewa terlebih dahulu.");
        return;
      }
      if (selectedItems.length === 0) {
        alert("Harap pilih minimal satu alat perlengkapan dari katalog terlebih dahulu.");
        return;
      }
      payload = {
        bookingId: `#TRX-${Date.now().toString().slice(-6)}`,
        customerName,
        customerPhone: customerPhone || '-',
        customerKtp: customerKtp || '-',
        guaranteeType,
        destination: destination || 'Ekspedisi Pendakian',
        pickupDate: `${pickupDate} (${pickupTime} WITA)`,
        rawPickupDate: pickupDate,
        pickupTime: `${pickupTime} WITA`,
        returnDate: `${returnDate} (${returnTime} WITA)`,
        rawReturnDate: returnDate,
        returnTime: `${returnTime} WITA`,
        rentalDate: pickupDate,
        durationDays,
        items: selectedItems,
        subtotalSewa,
        discountAmount,
        refundableDeposit,
        totalPayment,
        paymentMethod,
        qcNotes,
        dispatchOfficer: 'Bali Camping Adventure',
        createdAt: new Date().toISOString(),
      };
    }

    if (onCompleteTransaction) {
      onCompleteTransaction(payload);
    }

    // Reset Form to Clean State
    setCustomerName('');
    setCustomerPhone('');
    setCustomerKtp('');
    setDestination('');
    setSelectedItems([]);
    setRefundableDeposit(0);
    setIsContractProcessed(false);
    setProcessedPayload(null);
  };

  return (
    <div id="buat-transaksi-sewa-view" className="space-y-6 pb-12">
      {/* Top Header & Breadcrumb Progress */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-[#1B4332] uppercase tracking-wider">
              • Bali Camping Adventure RENTAL DISPATCH
            </span>
            <span className="text-[11px] text-[#9CA3AF]">•</span>
            <span className="text-[11px] text-[#6B7280] font-semibold">POS Module v2.4</span>
          </div>
          <h2 className="text-2xl font-bold text-[#111827] tracking-tight">
            Buat Transaksi Sewa Baru
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Formulir input booking sewa outdoor, pemilihan alat multi-item, dan kalkulasi otomatis tarif rental.
          </p>
        </div>

        {/* Stepper Pills */}
        <div className="flex items-center gap-1.5 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] font-semibold">
            <Check className="w-3.5 h-3.5" />
            <span>1. Data Penyewa</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#111827] text-white font-semibold">
            <span>2. Pemilihan Alat & Durasi</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3F4F6] text-[#9CA3AF] font-medium">
            <span>3. Konfirmasi</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Form (7 cols) + Right Summary (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Forms) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Card 1: Data Identitas Penyewa */}
          <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#F3F4F6]">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#1B4332]" />
                <h3 className="text-sm font-bold text-[#111827]">Data Identitas Penyewa</h3>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#059669] bg-[#ECFDF5] px-2.5 py-0.5 rounded-full border border-[#D1FAE5]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                Terverifikasi
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Nama Lengkap */}
              <div>
                <label className="text-[11px] font-bold text-[#4B5563] block mb-1">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full pl-8.5 pr-3 py-2 text-xs bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg font-semibold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                  />
                </div>
              </div>

              {/* No. WhatsApp / Telepon */}
              <div>
                <label className="text-[11px] font-bold text-[#4B5563] block mb-1">
                  No. WhatsApp / Telepon
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full pl-8.5 pr-3 py-2 text-xs bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg font-semibold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                  />
                </div>
              </div>

              {/* No. Identitas KTP / SIM */}
              <div>
                <label className="text-[11px] font-bold text-[#4B5563] block mb-1">
                  No. Identitas KTP / SIM
                </label>
                <div className="relative">
                  <CreditCard className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={customerKtp}
                    onChange={(e) => setCustomerKtp(e.target.value)}
                    className="w-full pl-8.5 pr-3 py-2 text-xs bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg font-mono text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                  />
                </div>
              </div>

              {/* Jaminan Fisik */}
              <div>
                <label className="text-[11px] font-bold text-[#4B5563] block mb-1">
                  Jaminan Fisik Ditahan di Toko
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isPhysicalGuaranteeHeld}
                      onChange={(e) => setIsPhysicalGuaranteeHeld(e.target.checked)}
                      className="w-4 h-4 rounded text-[#1B4332] accent-[#1B4332]"
                    />
                    <span className="text-xs font-semibold text-[#374151]">Ditahan di Toko</span>
                  </label>
                  <select
                    value={guaranteeType}
                    onChange={(e: any) => setGuaranteeType(e.target.value)}
                    className="text-xs bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E40AF] font-bold rounded-lg px-2.5 py-1 focus:outline-none"
                  >
                    <option value="E-KTP Asli">E-KTP Asli</option>
                    <option value="SIM A">SIM A Asli</option>
                    <option value="Paspor RI">Paspor RI</option>
                  </select>
                </div>
              </div>

              {/* Lokasi / Rencana Pendakian (full width) */}
              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold text-[#4B5563] block mb-1">
                  Lokasi / Rencana Pendakian
                </label>
                <div className="relative">
                  <Mountain className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full pl-8.5 pr-3 py-2 text-xs bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-[#111827] font-medium focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Jadwal Logistik & Durasi */}
          <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#F3F4F6] gap-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#1B4332]" />
                <h3 className="text-sm font-bold text-[#111827]">Jadwal Logistik & Durasi Sewa</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-[#065F46] bg-[#ECFDF5] px-2.5 py-0.5 rounded-md border border-[#A7F3D0]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
                  Real-time WITA (GMT+8)
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1B4332] bg-[#F0FDF4] px-2.5 py-0.5 rounded-md border border-[#BBF7D0]">
                  ⏳ {durationDays} Hari ({Math.max(0, durationDays - 1)} Malam)
                </span>
              </div>
            </div>

            {/* Interactive Duration Controller */}
            <div className="mt-4 p-3.5 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                <div>
                  <span className="text-xs font-bold text-[#111827] block">Pilih Durasi Jangka Waktu Sewa</span>
                  <span className="text-[11px] text-[#6B7280]">
                    Mengubah durasi otomatis memperbarui tanggal kembali dan subtotal biaya sewa.
                  </span>
                </div>
                {/* Stepper Input */}
                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handleDurationChange(durationDays - 1)}
                    disabled={durationDays <= 1}
                    className="w-7 h-7 rounded-lg border border-[#D1D5DB] bg-white text-[#374151] font-bold flex items-center justify-center hover:bg-[#F3F4F6] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <div className="flex items-center bg-white border border-[#D1D5DB] rounded-lg px-2 py-1">
                    <input
                      type="number"
                      min={1}
                      max={90}
                      value={durationDays}
                      onChange={(e) => handleDurationChange(Number(e.target.value))}
                      className="w-10 text-center text-xs font-bold text-[#111827] focus:outline-none"
                    />
                    <span className="text-[11px] font-semibold text-[#6B7280] ml-0.5">Hari</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDurationChange(durationDays + 1)}
                    className="w-7 h-7 rounded-lg border border-[#D1D5DB] bg-white text-[#374151] font-bold flex items-center justify-center hover:bg-[#F3F4F6] cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Preset Duration Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { days: 1, label: '1 Hari (24 Jam)' },
                  { days: 2, label: '2 Hari (1 Malam)' },
                  { days: 3, label: '3 Hari (2 Malam)' },
                  { days: 4, label: '4 Hari (3 Malam)' },
                  { days: 5, label: '5 Hari (4 Malam)' },
                  { days: 7, label: '7 Hari (1 Minggu)' },
                  { days: 10, label: '10 Hari' },
                  { days: 14, label: '14 Hari (2 Minggu)' },
                ].map((preset) => (
                  <button
                    key={preset.days}
                    type="button"
                    onClick={() => handleDurationChange(preset.days)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold transition-colors cursor-pointer ${
                      durationDays === preset.days
                        ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-xs'
                        : 'bg-white border-[#D1D5DB] text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827]'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Pickers */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Ambil */}
              <div className="p-3 bg-[#F8FAF9] rounded-lg border border-[#E5E7EB]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#10B981] uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                    Tanggal & Jam Ambil
                  </div>
                  <span className="text-[10px] font-semibold text-[#6B7280]">WITA (GMT+8)</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={pickupDate}
                    onChange={(e) => handlePickupDateChange(e.target.value)}
                    className="text-xs bg-white border border-[#D1D5DB] rounded-md px-2 py-1.5 text-[#111827] font-semibold focus:border-[#1B4332]"
                  />
                  <input
                    type="time"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="text-xs bg-white border border-[#D1D5DB] rounded-md px-2 py-1.5 text-[#111827] font-semibold focus:border-[#1B4332]"
                  />
                </div>
                <span className="text-[10.5px] text-[#6B7280] block mt-1.5 font-medium">
                  Bali Camping Central  • Denpasar utara, Bali
                </span>
              </div>

              {/* Kembali */}
              <div className="p-3 bg-[#F8FAF9] rounded-lg border border-[#E5E7EB]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#DC2626] uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-[#DC2626]"></span>
                    Tanggal & Jam Kembali
                  </div>
                  <span className="text-[10px] font-semibold text-[#6B7280]">WITA (GMT+8)</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    min={pickupDate}
                    value={returnDate}
                    onChange={(e) => handleReturnDateChange(e.target.value)}
                    className="text-xs bg-white border border-[#D1D5DB] rounded-md px-2 py-1.5 text-[#111827] font-semibold focus:border-[#1B4332]"
                  />
                  <input
                    type="time"
                    value={returnTime}
                    onChange={(e) => setReturnTime(e.target.value)}
                    className="text-xs bg-white border border-[#D1D5DB] rounded-md px-2 py-1.5 text-[#111827] font-semibold focus:border-[#1B4332]"
                  />
                </div>
                <span className="text-[10.5px] text-[#6B7280] block mt-1.5">
                  Toleransi batas serah terima max 23:00 WITA (GMT+8)
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Katalog & Alokasi Alat */}
          <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#F3F4F6] gap-2">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#111827]">Katalog & Alokasi Alat</h3>
                <span className="text-[11px] font-bold text-[#1B4332] bg-[#ECFDF5] px-2 py-0.5 rounded-full">
                  {selectedItems.length} Barang Terpilih
                </span>
              </div>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari alat di depot..."
                  onClick={() => setShowCatalogModal(true)}
                  readOnly
                  className="pl-7 pr-3 py-1 text-xs bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg cursor-pointer hover:bg-[#F3F4F6] transition-colors"
                />
              </div>
            </div>

            {/* List of selected items */}
            {selectedItems.length === 0 ? (
              <div className="py-8 px-4 text-center border-2 border-dashed border-[#E5E7EB] rounded-xl flex flex-col items-center justify-center my-3 bg-[#F9FAFB]">
                <div className="w-10 h-10 rounded-full bg-white shadow-2xs border border-[#E5E7EB] flex items-center justify-center text-[#1B4332] mb-2">
                  <Plus className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-[#111827]">Belum Ada Perlengkapan Dipilih</p>
                <p className="text-[11px] text-[#6B7280] mt-0.5 max-w-xs">
                  Pilih barang dari katalog BCAMP yang telah diinput admin secara manual.
                </p>
                <button
                  type="button"
                  onClick={() => setShowCatalogModal(true)}
                  className="mt-3 px-3.5 py-1.5 rounded-lg bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
                >
                  + Buka Katalog Bali Camp Adv
                </button>
              </div>
            ) : (
              <div className="mt-3 divide-y divide-[#F3F4F6]">
                {selectedItems.map((entry, idx) => {
                  const itemTotal = entry.quantity * durationDays * entry.pricePerDay;

                  return (
                    <div key={idx} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={entry.item.imageUrl}
                          alt={entry.item.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-lg object-cover border border-[#E5E7EB] shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#111827] truncate">
                            {entry.item.name}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-[#6B7280] mt-0.5">
                            <span className="text-[#059669] font-semibold">
                              Stok Ready: {entry.item.availableUnits} unit
                            </span>
                            <span>•</span>
                            <span className="tnum">Rp {entry.pricePerDay.toLocaleString('id-ID')} / hari</span>
                          </div>
                        </div>
                      </div>

                      {/* Stepper + Subtotal */}
                      <div className="flex items-center gap-4 shrink-0">
                        {/* Stepper */}
                        <div className="flex items-center border border-[#E5E7EB] rounded-lg bg-[#F9FAFB] overflow-hidden">
                          <button
                            onClick={() => handleUpdateQuantity(idx, -1)}
                            className="px-2 py-1 hover:bg-[#E5E7EB] text-[#4B5563] cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 text-xs font-bold text-[#111827] tnum">
                            {entry.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(idx, 1)}
                            className="px-2 py-1 hover:bg-[#E5E7EB] text-[#4B5563] cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Subtotal */}
                        <div className="text-right min-w-20">
                          <span className="text-[10px] text-[#9CA3AF] block uppercase">Subtotal</span>
                          <span className="text-xs font-extrabold text-[#111827] tnum">
                            Rp {itemTotal.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add More Items Button */}
            {selectedItems.length > 0 && (
              <button
                onClick={() => setShowCatalogModal(true)}
                className="w-full mt-3 py-2.5 rounded-lg border-2 border-dashed border-[#D1D5DB] hover:border-[#1B4332] hover:bg-[#F9FAFB] text-xs font-semibold text-[#1B4332] flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah Item Lain dari Katalog</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Checkout & Summary */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-2xs sticky top-20">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#F3F4F6]">
              <div>
                <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">
                  Nomor Transaksi Booking
                </span>
                <span className="text-sm font-extrabold text-[#111827] font-mono">
                  #TRX-NEW-{getTodayWITAYMD().replace(/-/g, '')}
                </span>
              </div>
              <span className="text-[10px] font-bold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded-md border border-[#A7F3D0] flex items-center gap-1">
                ⚡ Real-Time Calc
              </span>
            </div>

            {/* Itemized Duration Breakdown */}
            <div className="py-3 border-b border-[#F3F4F6]">
              <span className="text-[11px] font-bold text-[#4B5563] uppercase tracking-wider block mb-2">
                Rincian Durasi ({durationDays} Hari)
              </span>
              <div className="space-y-2">
                {selectedItems.length === 0 ? (
                  <p className="text-xs text-[#9CA3AF] italic py-1">
                    Belum ada perlengkapan yang dipilih.
                  </p>
                ) : (
                  selectedItems.map((entry, idx) => {
                    const lineTotal = entry.quantity * durationDays * entry.pricePerDay;
                    return (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <div>
                          <p className="font-semibold text-[#1F2937] leading-tight">{entry.item.name}</p>
                          <p className="text-[10.5px] text-[#6B7280]">
                            {entry.quantity} unit x {durationDays} hari x Rp {entry.pricePerDay.toLocaleString('id-ID')}
                          </p>
                        </div>
                        <span className="font-bold text-[#111827] tnum">
                          Rp {lineTotal.toLocaleString('id-ID')}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Calculation Totals */}
            <div className="py-3 space-y-2 text-xs border-b border-[#F3F4F6]">
              <div className="flex items-center justify-between">
                <span className="text-[#6B7280]">Subtotal Sewa</span>
                <span className="font-bold text-[#111827] tnum">
                  Rp {subtotalSewa.toLocaleString('id-ID')}
                </span>
              </div>

              <div className="flex items-center justify-between text-[#059669]">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={applyMemberDiscount}
                    onChange={(e) => setApplyMemberDiscount(e.target.checked)}
                    className="accent-[#059669]"
                  />
                  <span>Diskon Member Rimba (10%)</span>
                </label>
                <span className="font-bold tnum">
                  -Rp {discountAmount.toLocaleString('id-ID')}
                </span>
              </div>

              <div className="pt-2 border-t border-[#F3F4F6]">
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <span className="text-xs text-[#374151] font-semibold flex items-center gap-1">
                      🔒 Deposit Jaminan
                    </span>
                    <span className="text-[10px] text-[#059669] font-medium">
                      Kelipatan Rp 1.000
                    </span>
                  </div>
                  <div className="relative w-36">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-[#6B7280]">Rp</span>
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      value={refundableDeposit}
                      onChange={(e) => setRefundableDeposit(Number(e.target.value))}
                      onBlur={() => setRefundableDeposit(roundToThousand(refundableDeposit, 0))}
                      className="w-full text-right text-xs bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg py-1 px-2 text-[#111827] font-bold tnum focus:border-[#1B4332]"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-1 flex-wrap">
                  {[0, 50000, 100000, 150000, 200000].map((dep) => (
                    <button
                      key={dep}
                      type="button"
                      onClick={() => setRefundableDeposit(dep)}
                      className={`text-[9.5px] px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                        refundableDeposit === dep
                          ? 'bg-[#1B4332] text-white border-[#1B4332] font-bold'
                          : 'bg-white border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6]'
                      }`}
                    >
                      {dep === 0 ? 'Tanpa Jaminan' : `${dep / 1000}rb`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Total Grand */}
            <div className="py-3 flex items-baseline justify-between">
              <div>
                <span className="text-xs font-bold text-[#111827] block">
                  TOTAL PEMBAYARAN AWAL
                </span>
                <span className="text-[10.5px] text-[#6B7280]">
                  Termasuk jaminan & sewa
                </span>
              </div>
              <span className="text-xl font-extrabold text-[#111827] tnum">
                Rp {totalPayment.toLocaleString('id-ID')}
              </span>
            </div>

            {/* Payment Method Selector */}
            <div className="pt-2 pb-3">
              <span className="text-[11px] font-bold text-[#4B5563] block mb-2">
                Metode Pembayaran Kasir
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  id="btn-qris-pos"
                  onClick={() => {
                    setPaymentMethod('QRIS POS');
                    setIsQrisModalOpen(true);
                  }}
                  className={`py-2 px-1 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer relative ${
                    paymentMethod === 'QRIS POS'
                      ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-2xs ring-2 ring-[#1B4332]/30'
                      : 'bg-[#F9FAFB] border-[#E5E7EB] text-[#374151] hover:bg-[#F3F4F6]'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>QRIS Pos</span>
                  <span className="text-[9px] font-bold opacity-80">
                    {paymentMethod === 'QRIS POS' ? 'QR Aktif' : 'Lihat QR'}
                  </span>
                </button>

                <button
                  type="button"
                  id="btn-bca-transfer"
                  onClick={() => {
                    setPaymentMethod('BCA Transfer');
                    setIsBcaModalOpen(true);
                  }}
                  className={`py-2 px-1 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer relative ${
                    paymentMethod === 'BCA Transfer'
                      ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-2xs ring-2 ring-[#1B4332]/30'
                      : 'bg-[#F9FAFB] border-[#E5E7EB] text-[#374151] hover:bg-[#F3F4F6]'
                  }`}
                  title="No Rekening: 008419440417 (blu by BCA Digital) a/n I Made Ferry Amanda Putra, S.tr.T"
                >
                  <Building2 className="w-4 h-4" />
                  <span>BCA Transfer</span>
                  <span className="text-[9px] font-bold opacity-80">
                    {paymentMethod === 'BCA Transfer' ? 'Info Aktif' : 'Lihat Rekening'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Tunai')}
                  className={`py-2 px-1 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    paymentMethod === 'Tunai'
                      ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-2xs'
                      : 'bg-[#F9FAFB] border-[#E5E7EB] text-[#374151] hover:bg-[#F3F4F6]'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  <span>Tunai</span>
                </button>
              </div>

              {/* Inline BCA Transfer Account Details Card */}
              {paymentMethod === 'BCA Transfer' && (
                <div id="bca-transfer-detail-card" className="mt-3 p-3.5 bg-[#F8FAF9] rounded-xl border border-[#10B981]/40 shadow-xs animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-[#E5E7EB]">
                    <div className="flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2563EB]"></span>
                      </span>
                      <span className="text-[11px] font-bold text-[#111827]">
                        Informasi Rekening Transfer Bank
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsBcaModalOpen(true)}
                      className="text-[10px] font-bold text-[#1B4332] bg-[#ECFDF5] hover:bg-[#D1FAE5] px-2 py-0.5 rounded border border-[#A7F3D0] transition-colors cursor-pointer"
                    >
                      Buka Layar Penuh ↗
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    {/* No Rekening */}
                    <div className="bg-white p-2.5 rounded-lg border border-[#E5E7EB]">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[10.5px] text-[#6B7280] font-medium">No Rekening</span>
                        <span className="text-[10px] font-bold text-[#00529C] bg-[#EFF6FF] px-1.5 py-0.5 rounded border border-[#BFDBFE]">
                          blu by BCA Digital
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-sm text-[#111827] tracking-wider select-all">
                          008419440417
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText('008419440417');
                            alert('No Rekening 008419440417 (blu by BCA Digital) berhasil disalin!');
                          }}
                          className="text-[10.5px] font-semibold text-[#1B4332] bg-[#ECFDF5] hover:bg-[#D1FAE5] px-2 py-1 rounded border border-[#A7F3D0] flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Salin No. Rek</span>
                        </button>
                      </div>
                    </div>

                    {/* Atas Nama */}
                    <div className="bg-white p-2.5 rounded-lg border border-[#E5E7EB]">
                      <span className="text-[10.5px] text-[#6B7280] font-medium block mb-0.5">Atas Nama</span>
                      <p className="font-bold text-xs text-[#111827]">
                        I Made Ferry Amanda Putra, S.tr.T
                      </p>
                    </div>

                    {/* Total Transfer */}
                    <div className="bg-[#ECFDF5] p-2.5 rounded-lg border border-[#A7F3D0]">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[10.5px] text-[#065F46] font-semibold">Total Transfer</span>
                        <span className="text-[9.5px] font-bold text-[#059669] bg-white px-1.5 py-0.5 rounded border border-[#A7F3D0]">
                          Sesuaikan dengan total pembayaran
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm text-[#047857] tnum">
                          Rp {totalPayment.toLocaleString('id-ID')}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(String(totalPayment));
                            alert(`Nominal transfer Rp ${totalPayment.toLocaleString('id-ID')} berhasil disalin!`);
                          }}
                          className="text-[10.5px] font-semibold text-[#065F46] bg-white hover:bg-[#D1FAE5] px-2 py-1 rounded border border-[#A7F3D0] flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Salin Nominal</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Inline QRIS Image Card corresponding to total payment */}
              {paymentMethod === 'QRIS POS' && (
                <div className="mt-3 p-3 bg-[#F8FAF9] rounded-xl border border-[#10B981]/40 shadow-xs">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E5E7EB]">
                    <div className="flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
                      </span>
                      <span className="text-[11px] font-bold text-[#111827]">
                        QRIS Pos Siap Dipindai
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsQrisModalOpen(true)}
                      className="text-[10px] font-bold text-[#1B4332] bg-[#ECFDF5] hover:bg-[#D1FAE5] px-2 py-0.5 rounded border border-[#A7F3D0] transition-colors cursor-pointer"
                    >
                      Buka Layar Penuh ↗
                    </button>
                  </div>

                  {/* QRIS Card with exact nominal total payment */}
                  <div className="flex justify-center">
                    <QrisCard
                      amount={totalPayment}
                      compact={true}
                      transactionId="TRX-NEW"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Catatan Kondisi Keluar (Depot QC) */}
            <div className="py-2.5 bg-[#F8FAF9] p-3 rounded-lg border border-[#E5E7EB] mb-4">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#111827] mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Catatan Kondisi Keluar (Depot QC)</span>
              </div>
              <textarea
                value={qcNotes}
                onChange={(e) => setQcNotes(e.target.value)}
                rows={2}
                className="w-full text-[11px] bg-white border border-[#D1D5DB] rounded-md p-1.5 text-[#374151] leading-relaxed resize-none focus:outline-none"
              />
            </div>

            {/* Actions */}
            <div className="space-y-2.5">
              <button
                id="btn-cetak-surat-perjanjian"
                onClick={handleTriggerContractPrint}
                className={`w-full py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isContractProcessed
                    ? 'border-2 border-[#1B4332] bg-white hover:bg-[#F0FDF4] text-[#1B4332]'
                    : 'bg-[#1B4332] hover:bg-[#2D6A4F] text-white shadow-xs'
                }`}
              >
                <Printer className="w-4 h-4" />
                <span>
                  {isContractProcessed ? 'Cetak Ulang Surat Perjanjian Sewa' : 'Proses & Cetak Surat Perjanjian Sewa'}
                </span>
              </button>

              {/* Tombol Selesai Transaksi (Aktif setelah proses & cetak surat perjanjian sewa) */}
              {isContractProcessed && (
                <div className="p-3 bg-[#ECFDF5] border border-[#10B981] rounded-xl space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-[#065F46]">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                      <span>Surat Perjanjian Siap / Dicetak</span>
                    </div>
                    <span className="text-[10px] font-extrabold text-[#047857] bg-white px-2 py-0.5 rounded border border-[#A7F3D0]">
                      {processedPayload?.bookingId}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#047857] leading-relaxed">
                    Klik tombol <strong>Selesai Transaksi</strong> di bawah untuk membukukan transaksi secara resmi ke dalam <strong>Log & Finansial</strong>.
                  </p>
                  <button
                    id="btn-selesai-transaksi"
                    type="button"
                    onClick={handleCompleteTransactionAction}
                    className="w-full py-3 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer transform active:scale-[0.99] ring-2 ring-[#059669]/20"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>✓ Selesai Transaksi (Masuk ke Log & Finansial)</span>
                  </button>
                </div>
              )}

              <button
                onClick={() => alert("Draft booking #TRX-NEW berhasil disimpan di sistem.")}
                className="w-full py-2 rounded-lg border border-[#E5E7EB] hover:bg-[#F9FAFB] text-xs font-semibold text-[#4B5563] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Bookmark className="w-3.5 h-3.5 text-[#9CA3AF]" />
                <span>Simpan sebagai Draft</span>
              </button>
            </div>

            {/* Footer Dispatcher */}
            <div className="mt-4 pt-3 border-t border-[#F3F4F6] flex items-center justify-between text-[11px] text-[#6B7280]">
              <span className="flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-[#9CA3AF]" />
                Petugas Dispatch: <strong className="text-[#111827]">Administrator</strong>
              </span>
              <span className="font-semibold text-[#111827]">Sentral</span>
            </div>
          </div>
        </div>
      </div>

      {/* Catalog Selector Modal */}
      {showCatalogModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl border border-[#E5E7EB] animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#111827]">Pilih Alat dari Katalog Depot</h3>
                <p className="text-xs text-[#6B7280]">Klik untuk menambahkan ke daftar sewa</p>
              </div>
              <button
                onClick={() => setShowCatalogModal(false)}
                className="text-sm font-bold text-[#6B7280] hover:text-black px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="p-3 border-b border-[#F3F4F6]">
              <input
                type="text"
                placeholder="Cari alat (nama, kategori, spesifikasi)..."
                value={catalogFilter}
                onChange={(e) => setCatalogFilter(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg"
              />
            </div>

            <div className="p-3 overflow-y-auto space-y-2 flex-1 max-h-96">
              {inventory.length === 0 ? (
                <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#6B7280] mb-2">
                    <Plus className="w-5 h-5 text-[#9CA3AF]" />
                  </div>
                  <p className="text-xs font-bold text-[#111827]">Katalog Inventaris Masih Kosong</p>
                  <p className="text-[11px] text-[#6B7280] max-w-xs mt-1">
                    Belum ada perlengkapan yang dimasukkan ke depot. Silakan tambahkan barang secara manual di menu <strong>Inventaris</strong> terlebih dahulu.
                  </p>
                </div>
              ) : inventory.filter(item => item.name.toLowerCase().includes(catalogFilter.toLowerCase())).length === 0 ? (
                <div className="py-8 text-center text-xs text-[#6B7280]">
                  Tidak ada barang yang cocok dengan kata kunci "{catalogFilter}".
                </div>
              ) : (
                inventory
                  .filter(item => item.name.toLowerCase().includes(catalogFilter.toLowerCase()))
                  .map(item => (
                    <div 
                      key={item.id} 
                      onClick={() => handleAddItemFromCatalog(item)}
                      className="p-2.5 rounded-lg border border-[#E5E7EB] hover:border-[#1B4332] hover:bg-[#F8FAF9] flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-md object-cover border border-[#E5E7EB]"
                        />
                        <div>
                          <p className="text-xs font-bold text-[#111827]">{item.name}</p>
                          <p className="text-[10px] text-[#6B7280]">
                            Stok: {item.availableUnits} unit • Rp {item.dailyRate.toLocaleString('id-ID')}/hari
                          </p>
                        </div>
                      </div>
                      <button className="px-2.5 py-1 text-xs font-bold bg-[#1B4332] text-white rounded-md">
                        + Pilih
                      </button>
                    </div>
                  ))
              )}
            </div>

            <div className="p-3 border-t border-[#E5E7EB] text-right">
              <button
                onClick={() => setShowCatalogModal(false)}
                className="px-4 py-1.5 text-xs font-semibold bg-[#F3F4F6] text-[#374151] rounded-lg"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QRIS POS Payment Modal */}
      <QrisPaymentModal
        isOpen={isQrisModalOpen}
        onClose={() => setIsQrisModalOpen(false)}
        amount={totalPayment}
        transactionId="ORDER"
      />

      {/* BCA Transfer Payment Modal */}
      <BcaTransferModal
        isOpen={isBcaModalOpen}
        onClose={() => setIsBcaModalOpen(false)}
        amount={totalPayment}
        customerName={customerName || 'Penyewa'}
      />
    </div>
  );
};
