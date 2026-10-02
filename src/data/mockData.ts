import { supabase } from '../services/supabaseClient'; // Sesuaikan path supabase client kamu

// Fungsi untuk memaksa Supabase mengikuti data yang ada di Web
export const syncWebDataToSupabase = async (currentInventoryData: InventoryItem[]) => {
  try {
    console.log('Mulai menyinkronkan data web ke Supabase...');

    // 1. Hapus data lama yang ada di Supabase agar tidak bentrok
    const { error: deleteError } = await supabase
      .from('inventory')
      .delete()
      .neq('id', '0'); // Menghapus semua baris

    if (deleteError) {
      console.error('Gagal membersihkan data Supabase:', deleteError);
    }

    // 2. Masukkan seluruh data inventaris yang ada di web ke Supabase
    if (currentInventoryData && currentInventoryData.length > 0) {
      const { data, error: insertError } = await supabase
        .from('inventory')
        .upsert(currentInventoryData);

      if (insertError) {
        console.error('Gagal mengirim data ke Supabase:', insertError);
        alert('Gagal menyinkronkan data ke Supabase: ' + insertError.message);
      } else {
        console.log('Berhasil menyinkronkan data ke Supabase!', data);
        alert('Berhasil! Database Supabase sekarang sudah 100% sama dengan data Web.');
      }
    }
  } catch (err) {
    console.error('Error Sync:', err);
  }
};