export type ViewTab = 'dashboard' | 'inventaris' | 'sewa-baru' | 'pengembalian' | 'laporan';

export type GearCategory = 
  | 'Tenda & Shelter'
  | 'Carrier & Backpack'
  | 'Cooking & Kompor'
  | 'Climbing & Safety'
  | 'Sleeping Gear';

export type GearCondition = 
  | 'Bagus (100% Normal)'
  | 'Bagus (Siap Pakai)'
  | 'Di Luar Depot'
  | 'Rusak (Perlu Servis)'
  | 'Perlu Perawatan (Cuci Belay)'
  | 'Perlu Cuci';

export interface InventoryItem {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  category: GearCategory;
  tags: string[];
  imageUrl: string;
  totalUnits: number;
  availableUnits: number;
  rentedUnits: number;
  maintenanceUnits: number;
  condition: GearCondition;
  dailyRate: number;
  deposit: number;
  locationRack?: string;
  conditionNote?: string;
}

export interface SelectedRentalItem {
  item: InventoryItem;
  quantity: number;
  days: number;
}

export interface RentalTransaction {
  id: string; // e.g. #TRX-20241021-04
  customerName: string;
  customerPhone: string;
  customerKtp: string;
  idTypeHeld: 'E-KTP Asli' | 'SIM A' | 'Paspor RI';
  destination: string;
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
  durationDays: number;
  items: {
    itemSku: string;
    itemName: string;
    category: GearCategory;
    quantity: number;
    unitPrice: number;
    unitDeposit: number;
    imageUrl: string;
    assetCodes?: string[];
  }[];
  subtotal: number;
  discount: number;
  depositPaid: number;
  totalPaid: number;
  paymentMethod: 'QRIS POS' | 'BCA Transfer' | 'Tunai';
  status: 'Aktif' | 'Jatuh Tempo' | 'Overdue' | 'Dalam Pemeriksaan' | 'Selesai';
  overdueHours?: number;
  calculatedFine?: number;
  qcNotes?: string;
  dispatchOfficer: string;
  createdAt?: string;
}

export interface ReturnVerificationState {
  transactionId: string;
  officer: string;
  itemInspections: {
    sku: string;
    itemName: string;
    assetCode: string;
    badgeStatus: string;
    condition: 'Bagus/Bersih' | 'Kotor/Lumpur' | 'Sobek/Rusak' | 'Bagus, Utuh & Kering' | 'Kotor / Perlu Cuci';
    components: {
      id: string;
      name: string;
      checked: boolean;
      missingPenalty?: number;
      isMissing?: boolean;
    }[];
  }[];
  initialDeposit: number;
  lateFee: number;
  missingDamageFee: number;
  refundMethod: 'Tunai Kasir' | 'Transfer BCA' | 'QRIS Refund';
  status: 'draft' | 'completed';
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Kepala Logistik & Rental' | 'Admin Kasir & POS' | 'Staff Gudang & QC';
  gate: string;
  avatar: string;
  phone?: string;
}
