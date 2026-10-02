import { supabase } from '../supabaseClient';
import { InventoryItem, RentalTransaction } from '../types';

// --- FUNGSI INVENTARIS ---
export async function fetchInventoryFromSupabase(): Promise<InventoryItem[]> {
  const { data, error } = await supabase.from('inventory').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error('Error mengambil data inventaris:', error);
    return [];
  }
  return data.map((item: any) => ({
    id: item.id,
    sku: item.sku,
    barcode: item.barcode,
    name: item.name,
    category: item.category,
    tags: item.tags || [],
    imageUrl: item.image_url,
    totalUnits: item.total_units,
    availableUnits: item.available_units,
    rentedUnits: item.rented_units,
    maintenanceUnits: item.maintenance_units,
    condition: item.condition,
    dailyRate: Number(item.daily_rate),
    deposit: Number(item.deposit),
    locationRack: item.location_rack,
  }));
}

export async function saveInventoryItemToSupabase(item: InventoryItem) {
  const { error } = await supabase.from('inventory').upsert({
    id: item.id,
    sku: item.sku,
    barcode: item.barcode,
    name: item.name,
    category: item.category,
    tags: item.tags,
    image_url: item.imageUrl,
    total_units: item.totalUnits,
    available_units: item.availableUnits,
    rented_units: item.rentedUnits,
    maintenance_units: item.maintenanceUnits,
    condition: item.condition,
    daily_rate: item.dailyRate,
    deposit: item.deposit,
    location_rack: item.locationRack,
  });
  if (error) console.error('Error menyimpan barang inventaris:', error);
}

export async function deleteInventoryItemFromSupabase(id: string) {
  const { error } = await supabase.from('inventory').delete().eq('id', id);
  if (error) console.error('Error menghapus barang inventaris:', error);
}

// --- FUNGSI TRANSAKSI ---
export async function fetchTransactionsFromSupabase(): Promise<RentalTransaction[]> {
  const { data, error } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error('Error mengambil data transaksi:', error);
    return [];
  }
  return data.map((trx: any) => ({
    id: trx.id,
    customerName: trx.customer_name,
    customerPhone: trx.customer_phone,
    customerKtp: trx.customer_ktp,
    idTypeHeld: trx.id_type_held,
    destination: trx.destination,
    pickupDate: trx.pickup_date,
    pickupTime: trx.pickup_time,
    returnDate: trx.return_date,
    returnTime: trx.return_time,
    durationDays: trx.duration_days,
    items: trx.items,
    subtotal: Number(trx.subtotal),
    discount: Number(trx.discount),
    depositPaid: Number(trx.deposit_paid),
    totalPaid: Number(trx.total_paid),
    paymentMethod: trx.payment_method,
    status: trx.status,
    dispatchOfficer: trx.dispatch_officer,
    createdAt: trx.created_at,
  }));
}

export async function saveTransactionToSupabase(trx: RentalTransaction) {
  const { error } = await supabase.from('transactions').upsert({
    id: trx.id,
    customer_name: trx.customerName,
    customer_phone: trx.customerPhone,
    customer_ktp: trx.customerKtp,
    id_type_held: trx.idTypeHeld,
    destination: trx.destination,
    pickup_date: trx.pickupDate,
    pickup_time: trx.pickupTime,
    return_date: trx.returnDate,
    return_time: trx.returnTime,
    duration_days: trx.durationDays,
    items: trx.items,
    subtotal: trx.subtotal,
    discount: trx.discount,
    deposit_paid: trx.depositPaid,
    total_paid: trx.totalPaid,
    payment_method: trx.paymentMethod,
    status: trx.status,
    dispatch_officer: trx.dispatchOfficer,
    created_at: trx.createdAt,
  });
  if (error) console.error('Error menyimpan transaksi:', error);
}