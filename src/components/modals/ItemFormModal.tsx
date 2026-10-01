import React, { useState, useEffect } from 'react';
import { X, Plus, Save, Package } from 'lucide-react';
import { GearCategory, InventoryItem } from '../../types';

interface ItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<InventoryItem>) => void;
  initialItem?: InventoryItem | null;
}

export const ItemFormModal: React.FC<ItemFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialItem,
}) => {
  const roundToThousand = (val: number, minVal: number = 0) => {
    const num = Number(val);
    if (isNaN(num) || num <= minVal) return minVal;
    return Math.round(num / 1000) * 1000;
  };

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState<GearCategory>('Tenda & Shelter');
  const [totalUnits, setTotalUnits] = useState(5);
  const [dailyRate, setDailyRate] = useState(50000);
  const [deposit, setDeposit] = useState(150000);
  const [imageUrl, setImageUrl] = useState('');
  const [tags, setTags] = useState('Tenda 4P, Waterproof');
  const [condition, setCondition] = useState('Bagus (Siap Pakai)');

  useEffect(() => {
    if (initialItem) {
      setName(initialItem.name);
      setSku(initialItem.sku);
      setCategory(initialItem.category);
      setTotalUnits(initialItem.totalUnits);
      setDailyRate(roundToThousand(initialItem.dailyRate, 1000));
      setDeposit(roundToThousand(initialItem.deposit, 0));
      setImageUrl(initialItem.imageUrl);
      setTags(initialItem.tags.join(', '));
      setCondition(initialItem.condition);
    } else {
      setName('');
      setSku(`EQ-${Math.floor(1000 + Math.random() * 9000)}`);
      setCategory('Tenda & Shelter');
      setTotalUnits(5);
      setDailyRate(50000);
      setDeposit(150000);
      setImageUrl('https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=300&q=80');
      setTags('Outdoor, Premium');
      setCondition('Bagus (Siap Pakai)');
    }
  }, [initialItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalDailyRate = roundToThousand(dailyRate, 1000);
    const finalDeposit = roundToThousand(deposit, 0);

    onSave({
      id: initialItem ? initialItem.id : `item-${Date.now()}`,
      name,
      sku,
      barcode: initialItem ? initialItem.barcode : `BAR-${Math.floor(100000 + Math.random() * 900000)}`,
      category,
      totalUnits: Number(totalUnits),
      availableUnits: initialItem ? initialItem.availableUnits : Number(totalUnits),
      rentedUnits: initialItem ? initialItem.rentedUnits : 0,
      maintenanceUnits: initialItem ? initialItem.maintenanceUnits : 0,
      dailyRate: finalDailyRate,
      deposit: finalDeposit,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=300&q=80',
      tags: tags.split(',').map(t => t.trim()),
      condition,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-[#E5E7EB] overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
        <div className="p-4 bg-[#F8FAF9] border-b border-[#E5E7EB] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-[#1B4332]" />
            <h3 className="text-xs font-bold text-[#111827]">
              {initialItem ? 'Edit Perlengkapan Outdoor' : 'Tambah Perlengkapan Baru ke Katalog'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-[#6B7280] hover:text-[#111827]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs overflow-y-auto max-h-[80vh]">
          <div>
            <label className="text-[11px] font-bold text-[#4B5563] block mb-1">Nama Perlengkapan</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tenda Coleman Sundome 4P"
              className="w-full text-xs bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-2 text-[#111827] font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-[#4B5563] block mb-1">Kode SKU</label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full text-xs bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-2 font-mono text-[#111827]"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-[#4B5563] block mb-1">Kategori</label>
              <select
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
                className="w-full text-xs bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-2 text-[#111827]"
              >
                <option value="Tenda & Shelter">Tenda & Shelter</option>
                <option value="Carrier & Backpack">Carrier & Backpack</option>
                <option value="Cooking & Kompor">Cooking & Kompor</option>
                <option value="Climbing & Safety">Climbing & Safety</option>
                <option value="Sleeping Gear">Sleeping Gear</option>
                <option value="Aksesoris & Lampu">Aksesoris & Lampu</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-[#4B5563] block mb-1">Total Unit Fisik</label>
              <input
                type="number"
                min={1}
                required
                value={totalUnits}
                onChange={(e) => setTotalUnits(Number(e.target.value))}
                className="w-full text-xs bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-2 text-[#111827] font-semibold"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-[#4B5563] block">Tarif Sewa / Hari</label>
                <span className="text-[9px] font-bold text-[#059669] bg-[#ECFDF5] px-1.5 py-0.5 rounded">
                  x 1.000
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-[#6B7280]">Rp</span>
                <input
                  type="number"
                  min={1000}
                  step={1000}
                  required
                  value={dailyRate}
                  onChange={(e) => setDailyRate(Number(e.target.value))}
                  onBlur={() => setDailyRate(roundToThousand(dailyRate, 1000))}
                  className="w-full text-xs bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-2 pl-8 text-[#111827] font-bold tnum focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]"
                />
              </div>
              <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                {[15000, 25000, 35000, 50000, 75000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDailyRate(preset)}
                    className={`text-[9.5px] px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                      dailyRate === preset
                        ? 'bg-[#1B4332] text-white border-[#1B4332] font-bold'
                        : 'bg-white border-[#E5E7EB] text-[#4B5563] hover:bg-[#F3F4F6]'
                    }`}
                  >
                    {(preset / 1000)}rb
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-[#4B5563] block">Deposit Jaminan</label>
                <span className="text-[9px] font-bold text-[#059669] bg-[#ECFDF5] px-1.5 py-0.5 rounded">
                  x 1.000
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-[#6B7280]">Rp</span>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  required
                  value={deposit}
                  onChange={(e) => setDeposit(Number(e.target.value))}
                  onBlur={() => setDeposit(roundToThousand(deposit, 0))}
                  className="w-full text-xs bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-2 pl-8 text-[#111827] font-bold tnum focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]"
                />
              </div>
              <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                {[0, 50000, 100000, 150000, 200000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDeposit(preset)}
                    className={`text-[9.5px] px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                      deposit === preset
                        ? 'bg-[#1B4332] text-white border-[#1B4332] font-bold'
                        : 'bg-white border-[#E5E7EB] text-[#4B5563] hover:bg-[#F3F4F6]'
                    }`}
                  >
                    {preset === 0 ? '0' : `${preset / 1000}rb`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#4B5563] block mb-1">URL Foto Alat</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full text-xs bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-2 text-[#111827]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-[#4B5563] block mb-1">Label Tag (Pisahkan koma)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="4P, Alloy, Waterproof"
                className="w-full text-xs bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-2 text-[#111827]"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-[#4B5563] block mb-1">Kondisi Awal</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full text-xs bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-2 text-[#111827]"
              >
                <option value="Bagus (Siap Pakai)">Bagus (Siap Pakai)</option>
                <option value="Bagus (100% Normal)">Bagus (100% Normal)</option>
                <option value="Perlu Cuci">Perlu Cuci</option>
                <option value="Perlu Perawatan">Perlu Perawatan</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-[#F3F4F6] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold text-[#4B5563] hover:bg-[#F3F4F6]"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan ke Katalog</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
