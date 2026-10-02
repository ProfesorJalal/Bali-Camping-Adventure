import { supabase } from '../supabaseClient';
import { InventoryItem, RentalTransaction } from '../types';

// --- FUNGSI INVENTARIS ---
export async function fetchInventoryFromSupabase(): Promise<InventoryItem[]> {
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error mengambil data inventaris:', error);
    return [];
  }

  return (data || []).map((item: any) => ({
    id: item.id,
    sku: item.sku || '',
    barcode: item.barcode || '',
    name: item.name || '',
    category: item.category || 'Tenda & Shelter',
    tags: item.tags || [],
    imageUrl: item.image_url || '',
    totalUnits: Number(item.total_units) || 1,
    availableUnits: Number(item.available_units) || 1,
    rentedUnits: Number(item.rented_units) || 0,
    maintenanceUnits: Number(item.maintenance_units) || 0,
    condition: item.condition || 'Bagus (Siap Pakai)',
    dailyRate: Number(item.daily_rate) || 0,
    deposit: Number(item.deposit) || 0,
    locationRack: item.location_rack || 'Rak A1',
  }));
}

export async function saveInventoryItemToSupabase(item: InventoryItem) {
  const payload = {
    id: item.id,
    sku: item.sku || `SKU-${Date.now().toString().slice(-4)}`,
    barcode: item.barcode || `BAR-${Math.floor(100000 + Math.random() * 900000)}`,
    name: item.name || 'Barang Tanpa Nama',
    category: item.category || 'Lain-lain',
    tags: item.tags || [],
    image_url: item.imageUrl || '',
    total_units: Number(item.totalUnits) || 1,
    available_units: Number(item.availableUnits) || 0,
    rented_units: Number(item.rentedUnits) || 0,
    maintenance_units: Number(item.maintenanceUnits) || 0,
    condition: item.condition || 'Bagus (Siap Pakai)',
    daily_rate: Number(item.dailyRate) || 0,
    deposit: Number(item.deposit) || 0,
    location_rack: item.locationRack || 'Rak A1',
  };

  const { data, error } = await supabase.from('inventory').upsert(payload);
  if (error) {
    console.error('Error menyimpan barang inventaris ke Supabase:', error);
  } else {
    console.log('Berhasil menyimpan barang ke Supabase:', data);
  }
}

export async function deleteInventoryItemFromSupabase(id: string) {
  const { error } = await supabase.from('inventory').delete().eq('id', id);
  if (error) console.error('Error menghapus barang inventaris:', error);
}

// --- FUNGSI TRANSAKSI ---
export async function fetchTransactionsFromSupabase(): Promise<RentalTransaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error mengambil data transaksi:', error);
    return [];
  }

  return (data || []).map((trx: any) => ({
    id: trx.id,
    customerName: trx.customer_name || '',
    customerPhone: trx.customer_phone || '',
    customerKtp: trx.customer_ktp || '',
    idTypeHeld: trx.id_type_held || 'KTP',
    destination: trx.destination || '',
    pickupDate: trx.pickup_date || '',
    pickupTime: trx.pickup_time || '09:00 WITA',
    returnDate: trx.return_date || '',
    returnTime: trx.return_time || '18:00 WITA',
    durationDays: Number(trx.duration_days) || 1,
    items: trx.items || [],
    subtotal: Number(trx.subtotal) || 0,
    discount: Number(trx.discount) || 0,
    depositPaid: Number(trx.deposit_paid) || 0,
    totalPaid: Number(trx.total_paid) || 0,
    paymentMethod: trx.payment_method || 'QRIS',
    status: trx.status || 'Aktif',
    dispatchOfficer: trx.dispatch_officer || 'Administrator',
    createdAt: trx.created_at || new Date().toISOString(),
  }));
}

export async function saveTransactionToSupabase(trx: RentalTransaction) {
  const payload = {
    id: trx.id,
    customer_name: trx.customerName,
    customer_phone: trx.customerPhone,
    customer_ktp: trx.customerKtp || '',
    id_type_held: trx.idTypeHeld || 'KTP',
    destination: trx.destination || '',
    pickup_date: trx.pickupDate,
    pickup_time: trx.pickupTime || '09:00 WITA',
    return_date: trx.returnDate,
    return_time: trx.returnTime || '18:00 WITA',
    duration_days: Number(trx.durationDays) || 1,
    items: trx.items || [],
    subtotal: Number(trx.subtotal) || 0,
    discount: Number(trx.discount) || 0,
    deposit_paid: Number(trx.depositPaid) || 0,
    total_paid: Number(trx.totalPaid) || 0,
    payment_method: trx.paymentMethod || 'QRIS',
    status: trx.status || 'Aktif',
    dispatch_officer: trx.dispatchOfficer || 'Administrator',
    created_at: trx.createdAt || new Date().toISOString(),
  };

  const { error } = await supabase.from('transactions').upsert(payload);
  if (error) {
    console.error('Error menyimpan transaksi ke Supabase:', error);
  }
}