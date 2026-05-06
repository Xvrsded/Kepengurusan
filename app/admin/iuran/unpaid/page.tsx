"use client";

import { useEffect, useState, useMemo } from "react";
import { ArrowLeft, AlertCircle, CheckCircle2, Calendar, Wallet, TrendingDown, Filter } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useAuthGuard } from "@/lib/useAuthGuard";
import BottomNav from "@/components/BottomNav";
import Notification from "@/components/Notification";
import { createClient } from "@/lib/supabase/client";

export default function AdminUnpaidIuranPage() {
  useAuthGuard();
  const router = useRouter();
  const supabase = createClient();
  
  const supabaseUser = useAppStore((s) => s.supabaseUser);
  const setNotif = useAppStore((s) => s.setNotif);
  
  const [unpaidList, setUnpaidList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<"all" | "bulanan" | "harian" | "non_rutin">("all");

  const fetchUnpaidPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('iuran_user')
        .select('*, iuran_master(*), profiles(*)')
        .eq('status', 'unpaid')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUnpaidList(data || []);
    } catch (error: any) {
      console.error('Error fetching unpaid payments:', error);
      setNotif({
        title: "Error",
        message: error.message || "Gagal memuat data pembayaran",
        variant: "warning",
        role: "admin"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!supabaseUser?.id) return;
    fetchUnpaidPayments();
  }, [supabaseUser?.id]);

  // Filter and sort by category
  const filteredList = useMemo(() => {
    let filtered = unpaidList;
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((item) => item.iuran_master?.category === categoryFilter);
    }
    
    // Sort by due_date (earliest first)
    filtered = filtered.sort((a, b) => {
      const dateA = new Date(a.iuran_master?.due_date || 0);
      const dateB = new Date(b.iuran_master?.due_date || 0);
      return dateA.getTime() - dateB.getTime();
    });
    
    return filtered;
  }, [unpaidList, categoryFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = unpaidList.length;
    const bulanan = unpaidList.filter((item) => item.iuran_master?.category === 'bulanan').length;
    const harian = unpaidList.filter((item) => item.iuran_master?.category === 'harian').length;
    const non_rutin = unpaidList.filter((item) => item.iuran_master?.category === 'non_rutin').length;
    const totalAmount = unpaidList.reduce((sum, item) => sum + (item.iuran_master?.amount || 0), 0);
    
    return { total, bulanan, harian, non_rutin, totalAmount };
  }, [unpaidList]);

  if (!supabaseUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-4 border-indigo-200 border-t-indigo-500 animate-spin" />
          <span className="text-slate-500 font-bold">Memuat user...</span>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-4 border-indigo-200 border-t-indigo-500 animate-spin" />
          <span className="text-slate-500 font-bold">Memuat data pembayaran...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-md mx-auto bg-slate-50 relative overflow-x-hidden overflow-y-auto pb-28">
      <Notification />
      
      {/* Header */}
      <div className="bg-linear-to-b from-rose-500 via-orange-500 to-amber-500 text-white px-6 pt-7 pb-8 relative overflow-hidden">
        <div className="absolute -top-10 -right-8 h-28 w-28 rounded-full bg-orange-200/35 blur-3xl" />
        <div className="absolute top-10 left-1/2 h-24 w-24 -translate-x-1/2 rounded-full bg-rose-200/20 blur-3xl" />
        
        <div className="relative z-10 flex items-start justify-between gap-3">
          <div>
            <button onClick={() => router.push("/admin/iuran")} className="mb-3 flex items-center gap-2 text-white/80 hover:text-white transition-colors">
              <ArrowLeft size={16} />
              <span className="text-xs font-bold">Kembali</span>
            </button>
            <h1 className="text-2xl font-black tracking-tight">Siapa Belum Bayar</h1>
            <p className="text-sm text-rose-50/92 mt-2">Daftar warga dengan pembayaran tertunda</p>
          </div>
        </div>
      </div>

      <div className="px-6 mt-4 space-y-4">
        {/* Statistics Card */}
        <div className="rounded-4xl bg-white/90 border border-rose-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center">
                <AlertCircle size={20} className="text-rose-500" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">{stats.total}</p>
                <p className="text-xs text-slate-500">Total Belum Bayar</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-rose-600">Rp {stats.totalAmount.toLocaleString("id-ID")}</p>
              <p className="text-[10px] text-slate-500">Total Tagihan</p>
            </div>
          </div>
          <div className="flex gap-4 text-xs">
            <div className="flex-1 bg-blue-50 rounded-2xl p-2 text-center">
              <p className="font-black text-blue-600">{stats.bulanan}</p>
              <p className="text-slate-500">Bulanan</p>
            </div>
            <div className="flex-1 bg-cyan-50 rounded-2xl p-2 text-center">
              <p className="font-black text-cyan-600">{stats.harian}</p>
              <p className="text-slate-500">Harian</p>
            </div>
            <div className="flex-1 bg-purple-50 rounded-2xl p-2 text-center">
              <p className="font-black text-purple-600">{stats.non_rutin}</p>
              <p className="text-slate-500">Non Rutin</p>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 appearance-none bg-white"
            >
              <option value="all">Semua Kategori</option>
              <option value="bulanan">Bulanan</option>
              <option value="harian">Harian</option>
              <option value="non_rutin">Non Rutin</option>
            </select>
          </div>
        </div>

        {/* List */}
        {filteredList.length === 0 ? (
          <div className="rounded-4xl border border-dashed border-rose-100 bg-white/80 px-6 py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={24} className="text-green-500" />
            </div>
            <p className="text-sm font-black text-slate-700">Semua warga sudah membayar 🎉</p>
            <p className="text-xs text-slate-500 mt-1 max-w-60 mx-auto">Tidak ada pembayaran tertunda saat ini.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredList.map((item) => {
              const master = item.iuran_master;
              const profile = item.profiles;
              const isOverdue = master && new Date(master.due_date) < new Date();
              
              return (
                <div key={item.id} className="rounded-4xl border border-slate-100 bg-white/90 shadow-sm p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <h3 className="text-sm font-black text-slate-800">{profile?.name || 'Unknown'}</h3>
                      <p className="text-xs text-slate-500 mt-1">{master?.title || 'Iuran'}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                      isOverdue ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                    }`}>
                      {isOverdue ? 'Terlambat' : 'Belum Bayar'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 rounded-2xl p-2">
                      <p className="text-slate-500 mb-1">Kategori</p>
                      <p className="font-black text-slate-700 capitalize">{master?.category || '-'}</p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-2">
                      <p className="text-slate-500 mb-1">Nominal</p>
                      <p className="font-black text-slate-700">Rp {(master?.amount || 0).toLocaleString("id-ID")}</p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-2 col-span-2">
                      <p className="text-slate-500 mb-1">Jatuh Tempo</p>
                      <p className="font-black text-slate-700 flex items-center gap-1">
                        <Calendar size={12} />
                        {master?.due_date ? new Date(master.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
