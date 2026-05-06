"use server"

import { createClient } from '@supabase/supabase-js';

// Pastikan menggunakan Service Role Key agar bebas dari blokir RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function buatIuranMassal(formData: {
  title: string;
  description?: string;
  amount: number;
  due_date: string;
  category?: "bulanan" | "harian" | "non_rutin";
  period?: string | null;
  admin_id: string; // Didapat dari sesi user yang sedang login
}) {
  try {
    // 1. Insert data utama ke tabel iuran_master
    const { data: masterData, error: masterError } = await supabaseAdmin
      .from('iuran_master')
      .insert({
        title: formData.title,
        amount: formData.amount,
        due_date: formData.due_date,
        category: formData.category || 'bulanan',
        period: formData.period || null,
        created_by: formData.admin_id
      })
      .select('id')
      .single();

    if (masterError) throw new Error("Gagal membuat master iuran: " + masterError.message);

    // 2. Ambil semua ID warga dari tabel profiles (asumsi warga pakai tabel ini)
    const { data: wargaList, error: wargaError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('role', 'warga');

    if (wargaError) throw new Error("Gagal mengambil data warga: " + wargaError.message);

    console.log('[IURAN MASSAL] Warga count:', wargaList?.length || 0);
    console.log('[IURAN MASSAL] Warga IDs:', wargaList?.map(w => w.id));

    // 3. Distribusikan ke semua warga melalui tabel iuran_user
    if (wargaList && wargaList.length > 0) {
      const tagihanMassal = wargaList.map((warga) => ({
        iuran_master_id: masterData.id,
        user_id: warga.id,
        status: 'unpaid' // Sesuai default di database kamu
      }));

      console.log('[IURAN MASSAL] Tagihan to insert:', tagihanMassal);

      const { error: insertUsersError } = await supabaseAdmin
        .from('iuran_user')
        .insert(tagihanMassal);

      if (insertUsersError) throw new Error("Gagal mendistribusikan iuran: " + insertUsersError.message);

      console.log('[IURAN MASSAL] Distribution successful');
    } else {
      console.log('[IURAN MASSAL] No warga found to distribute to');
    }

    return { success: true, message: "Berhasil! Iuran telah dibagikan ke seluruh warga." };

  } catch (error: any) {
    return { success: false, message: error.message };
  }
}