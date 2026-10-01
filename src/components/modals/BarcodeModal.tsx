import React, { useState } from 'react';
import { Printer, X, Tag, Barcode, Check } from 'lucide-react';
import { InventoryItem } from '../../types';

interface BarcodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: InventoryItem | null;
  allItems?: InventoryItem[];
}

export const BarcodeModal: React.FC<BarcodeModalProps> = ({
  isOpen,
  onClose,
  item,
  allItems = [],
}) => {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(item || allItems[0] || null);
  const [labelQty, setLabelQty] = useState(4);
  const [labelFormat, setLabelFormat] = useState<'thermal_small' | 'rack_large'>('thermal_small');

  if (!isOpen) return null;

  const current = selectedItem || item || allItems[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-[#E5E7EB] overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
        <div className="p-4 bg-[#F8FAF9] border-b border-[#E5E7EB] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#1B4332]" />
            <h3 className="text-xs font-bold text-[#111827]">Cetak Label Barcode Logistik</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#6B7280] hover:text-[#111827]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div>
            <label className="text-[11px] font-bold text-[#4B5563] block mb-1">
              Pilih Item Inventaris
            </label>
            <select
              value={current?.id}
              onChange={(e) => {
                const found = allItems.find(i => i.id === e.target.value);
                if (found) setSelectedItem(found);
              }}
              className="w-full text-xs bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-2 text-[#111827] font-semibold"
            >
              {allItems.map(i => (
                <option key={i.id} value={i.id}>
                  {i.sku} — {i.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-[#4B5563] block mb-1">
                Ukuran Label
              </label>
              <select
                value={labelFormat}
                onChange={(e: any) => setLabelFormat(e.target.value)}
                className="w-full text-xs bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-2 text-[#111827]"
              >
                <option value="thermal_small">30 x 20 mm (Stiker Alat)</option>
                <option value="rack_large">60 x 40 mm (Label Rak Gudang)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#4B5563] block mb-1">
                Jumlah Label
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={labelQty}
                onChange={(e) => setLabelQty(Number(e.target.value))}
                className="w-full text-xs bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-2 text-[#111827] font-semibold"
              />
            </div>
          </div>

          {/* Barcode Preview */}
          <div className="mt-2">
            <span className="text-[10px] font-bold text-[#9CA3AF] uppercase block mb-1.5">
              Pratinjau Cetak Thermal
            </span>
            <div className="p-4 bg-white border-2 border-dashed border-[#D1D5DB] rounded-xl flex flex-col items-center justify-center text-center">
              <span className="text-[9px] font-bold tracking-wider text-[#6B7280] uppercase">
                BALI CAMPING ADVENTURE • DEPOT
              </span>
              <span className="text-xs font-extrabold text-[#111827] mt-0.5">
                {current?.name}
              </span>

              {/* Vector Barcode Graphic */}
              <div className="my-2 py-1 px-4 bg-white flex flex-col items-center">
                <div className="flex items-center gap-0.5 h-10">
                  {[3,1,2,1,4,2,1,3,1,2,3,1,4,1,2,3,2,1,1,3,2,4,1,2,1,3,2,1,4,2,1,3].map((w, i) => (
                    <div
                      key={i}
                      className="bg-black h-full"
                      style={{ width: `${w * 1.5}px` }}
                    />
                  ))}
                </div>
                <span className="font-mono text-[11px] tracking-widest text-[#111827] font-bold mt-1">
                  {current?.barcode || 'BAR-662910'}
                </span>
              </div>

              <div className="flex items-center justify-between w-full text-[9px] text-[#4B5563] border-t border-[#F3F4F6] pt-1">
                <span>SKU: {current?.sku}</span>
                <span>Tarif: Rp {current?.dailyRate.toLocaleString('id-ID')}/hr</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-[#F9FAFB] border-t border-[#E5E7EB] flex items-center justify-between">
          <span className="text-[11px] text-[#6B7280]">
            Siap dikirim ke printer thermal depot
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-[#4B5563] hover:bg-[#E5E7EB] rounded-lg"
            >
              Batal
            </button>
            <button
              onClick={() => {
                alert(`Mencetak ${labelQty} lembar label barcode untuk ${current?.name}...`);
                onClose();
              }}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-semibold rounded-lg shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak {labelQty} Lembar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
