import React, { useState } from 'react';
import { 
  Printer, 
  FileSpreadsheet, 
  Plus, 
  Search, 
  RotateCw, 
  Edit3, 
  Clock, 
  SlidersHorizontal,
  CheckSquare,
  Square,
  CheckCircle2,
  AlertCircle,
  Wrench,
  ChevronDown,
  Trash2,
  Package
} from 'lucide-react';
import { GearCategory, InventoryItem } from '../../types';

interface InventarisViewProps {
  inventory: InventoryItem[];
  onOpenAddItem: () => void;
  onOpenBarcodeModal: (item?: InventoryItem) => void;
  onOpenEditItem: (item: InventoryItem) => void;
  onDeleteItem?: (id: string) => void;
}

export const InventarisView: React.FC<InventarisViewProps> = ({
  inventory,
  onOpenAddItem,
  onOpenBarcodeModal,
  onOpenEditItem,
  onDeleteItem,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedCondition, setSelectedCondition] = useState<string>('Semua Kondisi');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('Semua');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Dynamic calculations from inventory
  const totalPhysicalUnits = inventory.reduce((sum, item) => sum + (item.totalUnits || 0), 0);
  const rentedPhysicalUnits = inventory.reduce((sum, item) => sum + (item.rentedUnits || 0), 0);
  const availablePhysicalUnits = inventory.reduce((sum, item) => sum + (item.availableUnits || 0), 0);
  const maintenancePhysicalUnits = inventory.reduce((sum, item) => sum + (item.maintenanceUnits || 0), 0);

  const percentRented = totalPhysicalUnits > 0 ? Math.round((rentedPhysicalUnits / totalPhysicalUnits) * 100) : 0;
  const percentAvailable = totalPhysicalUnits > 0 ? Math.round((availablePhysicalUnits / totalPhysicalUnits) * 100) : 0;

  const standardCategories: GearCategory[] = [
    'Tenda & Shelter',
    'Carrier & Backpack',
    'Cooking & Kompor',
    'Climbing & Safety',
    'Sleeping Gear',
  ];

  const categories = [
    { label: 'Semua', count: inventory.length },
    ...standardCategories.map(cat => ({
      label: cat,
      count: inventory.filter(i => i.category === cat).length
    }))
  ];

  const filteredItems = inventory.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.barcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'Semua' || item.category === selectedCategory;

    const matchesCondition = selectedCondition === 'Semua Kondisi' || 
      (selectedCondition === 'Bagus' && item.condition.includes('Bagus')) ||
      (selectedCondition === 'Rusak' && item.condition.includes('Rusak')) ||
      (selectedCondition === 'Perawatan' && item.condition.includes('Perlu'));

    const matchesAvailability = selectedAvailability === 'Semua' ||
      (selectedAvailability === 'Tersedia' && item.availableUnits > 0) ||
      (selectedAvailability === 'Habis' && item.availableUnits === 0);

    return matchesSearch && matchesCategory && matchesCondition && matchesAvailability;
  });

  const handleSelectAll = () => {
    if (selectedItemIds.length === filteredItems.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(filteredItems.map(i => i.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedItemIds.includes(id)) {
      setSelectedItemIds(selectedItemIds.filter(i => i !== id));
    } else {
      setSelectedItemIds([...selectedItemIds, id]);
    }
  };

  return (
    <div id="inventaris-katalog-view" className="space-y-6 pb-12">
      {/* Header & Main Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-[#1B4332] uppercase tracking-wider">
              • Depot Master Logistik
            </span>
            <span className="text-[11px] text-[#9CA3AF]">•</span>
            <span className="text-[11px] text-[#6B7280] font-medium">Seksi Gudang A</span>
          </div>
          <h2 className="text-2xl font-bold text-[#111827] tracking-tight">
            Inventaris & Katalog Perlengkapan Outdoor
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Kelola spesifikasi unit, rasio stok real-time, kondisi fisik, dan tarif harian perlengkapan ekspedisi.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onOpenBarcodeModal()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] text-xs font-semibold text-[#374151] transition-colors cursor-pointer shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-[#6B7280]" />
            <span>Cetak Label Barcode</span>
          </button>

          <button
            onClick={() => alert("Mengunduh Katalog CSV...")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] text-xs font-semibold text-[#374151] transition-colors cursor-pointer shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#6B7280]" />
            <span>Import / Export CSV</span>
          </button>

          <button
            onClick={onOpenAddItem}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Tambah Barang Baru</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-2xs">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
            <span>Total Item Fisik</span>
            <span className="p-1 bg-[#F3F4F6] rounded text-[#1B4332]">
              <FileSpreadsheet className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#111827] tnum">{totalPhysicalUnits}</span>
            <span className="text-[11px] font-semibold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded-full">
              {inventory.length} Jenis SKU
            </span>
          </div>
          <p className="text-[11px] text-[#6B7280] mt-2 pt-2 border-t border-[#F3F4F6]">
            {inventory.length === 0 ? 'Belum ada barang diinput' : `Tersebar di ${standardCategories.filter(c => inventory.some(i => i.category === c)).length} kategori aktif`}
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-2xs">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
            <span>Stok Di Lapangan</span>
            <span className="text-xs">🏃</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#111827] tnum">{rentedPhysicalUnits}</span>
            <span className="text-xs font-bold text-[#D97706]">{percentRented}% Tersewa</span>
          </div>
          <div className="w-full bg-[#F3F4F6] h-1.5 rounded-full overflow-hidden mt-3">
            <div className="bg-[#D97706] h-full transition-all duration-300" style={{ width: `${percentRented}%` }}></div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-2xs">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
            <span>Tersedia Di Rak</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#111827] tnum">{availablePhysicalUnits}</span>
            <span className="text-xs font-bold text-[#059669]">Siap Angkut</span>
          </div>
          <div className="w-full bg-[#F3F4F6] h-1.5 rounded-full overflow-hidden mt-3">
            <div className="bg-[#10B981] h-full transition-all duration-300" style={{ width: `${percentAvailable}%` }}></div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-2xs">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
            <span>Triage & Perbaikan</span>
            <span className="text-xs">🚫</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#DC2626] tnum">{maintenancePhysicalUnits}</span>
            <span className="text-xs font-bold text-[#DC2626]">{maintenancePhysicalUnits > 0 ? 'Perlu QC/Servis' : 'Semua Siap'}</span>
          </div>
          <p className="text-[11px] text-[#6B7280] mt-2 pt-2 border-t border-[#F3F4F6]">
            {maintenancePhysicalUnits === 0 ? 'Tidak ada alat rusak/kotor' : `${maintenancePhysicalUnits} unit dalam perbaikan`}
          </p>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama alat, SKU, merk, atau nomor seri..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
            />
          </div>

          {/* Condition Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="text-xs bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg px-3 py-2 text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
            >
              <option value="Semua Kondisi">Semua Kondisi</option>
              <option value="Bagus">Kondisi Bagus</option>
              <option value="Perawatan">Perlu Perawatan</option>
              <option value="Rusak">Rusak / Servis</option>
            </select>

            {/* Availability Dropdown */}
            <select
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="text-xs bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg px-3 py-2 text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
            >
              <option value="Semua">Ketersediaan: Semua</option>
              <option value="Tersedia">Stok Tersedia</option>
              <option value="Habis">Habis Disewa</option>
            </select>

            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Semua');
                setSelectedCondition('Semua Kondisi');
                setSelectedAvailability('Semua');
              }}
              title="Reset Filter"
              className="p-2 border border-[#E5E7EB] rounded-lg hover:bg-[#F3F4F6] text-[#6B7280] transition-colors"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.label;
            return (
              <button
                key={cat.label}
                onClick={() => setSelectedCategory(cat.label)}
                className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#1B4332] text-white shadow-2xs'
                    : 'bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB]'
                }`}
              >
                {cat.label} ({cat.count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3 w-10 text-center">
                  <button 
                    onClick={handleSelectAll} 
                    className="cursor-pointer text-[#4B5563] flex items-center justify-center"
                  >
                    {selectedItemIds.length === filteredItems.length && filteredItems.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-[#1B4332]" />
                    ) : (
                      <Square className="w-4 h-4 text-[#9CA3AF]" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-4">Kode SKU / Barcode</th>
                <th className="py-3 px-4">Item & Spesifikasi</th>
                <th className="py-3 px-4">Rasio Stok (Tersedia/Total)</th>
                <th className="py-3 px-4">Kondisi Fisik</th>
                <th className="py-3 px-4">Tarif & Deposit</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {filteredItems.map((item) => {
                const isSelected = selectedItemIds.includes(item.id);
                const percentAvailable = Math.round((item.availableUnits / item.totalUnits) * 100);

                return (
                  <tr 
                    key={item.id} 
                    className={`hover:bg-[#F8FAF9] transition-colors ${isSelected ? 'bg-[#F0FDF4]' : ''}`}
                  >
                    <td className="py-3.5 px-3 text-center">
                      <button 
                        onClick={() => handleToggleSelect(item.id)}
                        className="cursor-pointer text-[#4B5563]"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-[#1B4332]" />
                        ) : (
                          <Square className="w-4 h-4 text-[#9CA3AF]" />
                        )}
                      </button>
                    </td>

                    {/* SKU & Barcode */}
                    <td className="py-3.5 px-4 font-mono">
                      <span className="font-bold text-[#111827] block text-xs">{item.sku}</span>
                      <span className="text-[10.5px] text-[#6B7280]">{item.barcode}</span>
                    </td>

                    {/* Item Thumbnail & Specs */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="w-11 h-11 rounded-lg object-cover border border-[#E5E7EB] shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-[#111827] text-xs truncate">{item.name}</p>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            {item.tags.map((tag, idx) => (
                              <span 
                                key={idx} 
                                className="text-[10px] px-1.5 py-0.5 rounded bg-[#EFF6FF] text-[#1E40AF] font-medium"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Stock Ratio & Progress Bar */}
                    <td className="py-3.5 px-4 min-w-40">
                      <div className="flex items-baseline justify-between text-xs mb-1">
                        <span className="font-bold text-[#111827] tnum">
                          {item.availableUnits} / {item.totalUnits} Unit
                        </span>
                        <span className="text-[11px] text-[#6B7280] font-medium tnum">
                          {percentAvailable}%
                        </span>
                      </div>
                      <div className="w-full bg-[#E5E7EB] h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            percentAvailable > 50 
                              ? 'bg-[#10B981]' 
                              : percentAvailable > 0 
                                ? 'bg-[#F59E0B]' 
                                : 'bg-[#EF4444]'
                          }`}
                          style={{ width: `${percentAvailable}%` }}
                        ></div>
                      </div>
                      <span className="text-[10.5px] text-[#6B7280] mt-1 block">
                        {item.rentedUnits > 0 ? `${item.rentedUnits} Sedang Disewa` : 'Stok Penuh Siap'}
                        {item.maintenanceUnits > 0 && ` • ${item.maintenanceUnits} Perlu Servis`}
                      </span>
                    </td>

                    {/* Physical Condition Badge */}
                    <td className="py-3.5 px-4">
                      {item.condition.includes('100% Normal') && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#ECFDF5] text-[#065F46] border border-[#D1FAE5]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                          Bagus (100% Normal)
                        </span>
                      )}
                      {item.condition.includes('Siap Pakai') && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#ECFDF5] text-[#065F46] border border-[#D1FAE5]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                          Bagus (Siap Pakai)
                        </span>
                      )}
                      {item.condition.includes('Di Luar Depot') && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#9CA3AF]"></span>
                          Di Luar Depot
                        </span>
                      )}
                      {item.condition.includes('Rusak') && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FEF2F2] text-[#DC2626] border border-[#FEE2E2]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]"></span>
                          Rusak ({item.conditionNote || 'Perlu Servis'})
                        </span>
                      )}
                      {item.condition.includes('Perlu Perawatan') && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></span>
                          Perlu Perawatan (Cuci)
                        </span>
                      )}
                      {item.condition === 'Perlu Cuci' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></span>
                          Perlu Cuci
                        </span>
                      )}
                    </td>

                    {/* Price & Deposit */}
                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-[#111827] block text-xs tnum">
                        Rp {item.dailyRate.toLocaleString('id-ID')}
                      </span>
                      <span className="text-[10.5px] text-[#6B7280] block">/hari</span>
                      <span className="text-[10.5px] text-[#D97706] font-medium block mt-0.5 tnum">
                        🔒 Dep. Rp {item.deposit.toLocaleString('id-ID')}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => onOpenEditItem(item)}
                          className="p-1.5 rounded-md hover:bg-[#F3F4F6] text-[#4B5563] hover:text-[#111827] transition-colors cursor-pointer"
                          title="Edit Spesifikasi Alat"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onOpenBarcodeModal(item)}
                          className="p-1.5 rounded-md hover:bg-[#F3F4F6] text-[#4B5563] hover:text-[#111827] transition-colors cursor-pointer"
                          title="Cetak Barcode / Riwayat SKU"
                        >
                          <Clock className="w-3.5 h-3.5" />
                        </button>
                        {onDeleteItem && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Hapus "${item.name}" dari inventaris?`)) {
                                onDeleteItem(item.id);
                              }
                            }}
                            className="p-1.5 rounded-md hover:bg-[#FEF2F2] text-[#9CA3AF] hover:text-[#DC2626] transition-colors cursor-pointer"
                            title="Hapus Barang"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State when no items in inventory */}
        {inventory.length === 0 && (
          <div className="p-12 text-center flex flex-col items-center justify-center bg-white">
            <div className="w-16 h-16 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#1B4332] mb-4 shadow-xs">
              <Package className="w-8 h-8 text-[#1B4332]" />
            </div>
            <h4 className="text-base font-bold text-[#111827]">Katalog Inventaris Masih Kosong</h4>
            <p className="text-xs text-[#6B7280] max-w-md mt-1 mb-5 leading-relaxed">
              Belum ada perlengkapan outdoor di depot. Seluruh data inventaris siap diisi secara manual oleh Admin untuk memulai pencatatan stok dan sewa.
            </p>
            <button
              onClick={onOpenAddItem}
              className="px-4 py-2.5 rounded-lg bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Perlengkapan Pertama</span>
            </button>
          </div>
        )}

        {/* Empty state when items exist but filter returns nothing */}
        {inventory.length > 0 && filteredItems.length === 0 && (
          <div className="p-12 text-center flex flex-col items-center justify-center bg-white">
            <div className="w-12 h-12 rounded-xl bg-[#F3F4F6] flex items-center justify-center text-[#6B7280] mb-3">
              <Search className="w-6 h-6 text-[#9CA3AF]" />
            </div>
            <h4 className="text-sm font-bold text-[#111827]">Tidak Ada Hasil yang Cocok</h4>
            <p className="text-xs text-[#6B7280] mt-1 mb-4">
              Tidak ditemukan alat dengan kata kunci atau filter saat ini.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Semua');
                setSelectedCondition('Semua Kondisi');
                setSelectedAvailability('Semua');
              }}
              className="px-3 py-1.5 rounded-md border border-[#E5E7EB] hover:bg-[#F9FAFB] text-xs font-semibold text-[#374151] cursor-pointer"
            >
              Reset Filter Pencarian
            </button>
          </div>
        )}

        {/* Footer & Pagination */}
        <div className="p-3.5 border-t border-[#F3F4F6] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6B7280]">
          <div className="flex items-center gap-2">
            <span>Menampilkan</span>
            <span className="font-semibold text-[#111827]">{filteredItems.length}</span>
            <span>dari {inventory.length} item terdaftar</span>
          </div>

          <div className="flex items-center gap-1">
            <button className="px-2.5 py-1 border border-[#E5E7EB] rounded hover:bg-[#F3F4F6] disabled:opacity-50" disabled>
              Sebelumnya
            </button>
            <button className="w-7 h-7 rounded bg-[#1B4332] text-white font-bold flex items-center justify-center">
              1
            </button>
            <button className="px-2.5 py-1 border border-[#E5E7EB] rounded hover:bg-[#F3F4F6] disabled:opacity-50" disabled>
              Selanjutnya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
