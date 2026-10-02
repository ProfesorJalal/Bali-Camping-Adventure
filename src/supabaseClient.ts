import { createClient } from '@supabase/supabase-js';

// Hanya gunakan URL utama project tanpa /rest/v1/
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ctedjwanrrhehngqezgs.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_WV1nHyJxnHOuuQfA2jh3pA_1dqfJkJ3';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);