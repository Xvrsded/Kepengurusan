"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { ArrowLeft, Plus, Wallet, Receipt, CheckCircle2, AlertCircle, ChevronRight, Clock, TrendingUp, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useAuthGuard } from "@/lib/useAuthGuard";
import BottomNav from "@/components/BottomNav";
import Notification from "@/components/Notification";
import { createClient } from "@/lib/supabase/client";
import { buatIuranMassal } from "./actions";

export default function AdminIuranPage() {
  useAuthGuard();
  const router = useRouter();
  const supabase = createClient();
  
  // Store state
  const supabaseUser = useAppStore((s) => s.supabaseUser);
  const setNotif = useAppStore((s) => s.setNotif);
  
  // Local state - avoid global state for realtime data
  const [iuranUserList, setIuranUserList] = useState<any[]>([]);
  const [iuranMasterList, setIuranMasterList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "unpaid" | "overdue">("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newIuran, setNewIuran] = useState({ title: "", amount: "", due_date: "" });
  const [isCreating, setIsCreating] = useState(false);
  
  // Fetch lock to prevent spam
  const isFetchingRef = useRef(false);
  const realtimeTimeoutRef = useRef<any>(null);

  // Fetch data - proper pattern with dependency guard
  const fetchData = useCallback(async () => {
    if (isFetchingRef.current) return;
    
    isFetchingRef.current = true;
    
    try {
      console.log('[ADMIN IURAN] Fetching data');
      setLoading(true);

      // Fetch iuran_master
      const { data: masterData, error: masterError } = await supabase
        .from('iuran_master')
        .select('*');

      if (masterError) {
        console.error('[ADMIN IURAN] Master fetch error:', masterError.message || masterError.details || JSON.stringify(masterError));
        // Set empty array if table doesn't exist or error occurs
        setIuranMasterList([]);
      } else {
        console.log('[ADMIN IURAN] Fetched masters:', masterData?.length);
        setIuranMasterList(masterData || []);
      }

      // Fetch iuran_user without profiles relationship
      const { data: userData, error: userError } = await supabase
        .from('iuran_user')
        .select('*, iuran_master(*)');

      if (userError) {
        console.error('[ADMIN IURAN] User fetch error:', userError.message || userError.details || JSON.stringify(userError));
        // Set empty array if table doesn't exist or error occurs
        setIuranUserList([]);
      } else {
        console.log('[ADMIN IURAN] Fetched user entries:', userData?.length);
        setIuranUserList(userData || []);
      }
    } catch (err) {
      console.error('[ADMIN IURAN] Unexpected error:', err);
      setIuranMasterList([]);
      setIuranUserList([]);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [supabase, setNotif]);

  // Initial fetch - proper dependency
  useEffect(() => {
    if (!supabaseUser?.id) return;
    fetchData();
  }, [fetchData, supabaseUser?.id]);

  // Realtime subscription - mandatory
  useEffect(() => {
    if (!supabaseUser?.id) return;
    
    const handleRealtimeChange = () => {
      if (isFetchingRef.current) return;
      clearTimeout(realtimeTimeoutRef.current);
      realtimeTimeoutRef.current = setTimeout(() => {
        console.log('[ADMIN IURAN] Debounced realtime fetch');
        fetchData();
      }, 500);
    };
    
    const channel = supabase
      .channel('admin-iuran-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'iuran_master'
      }, (payload: any) => {
        console.log('[ADMIN IURAN] Master realtime INSERT change:', payload);
        handleRealtimeChange();
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'iuran_master'
      }, (payload: any) => {
        console.log('[ADMIN IURAN] Master realtime UPDATE change:', payload);
        handleRealtimeChange();
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'iuran_user'
      }, (payload: any) => {
        console.log('[ADMIN IURAN] User realtime INSERT change:', payload);
        handleRealtimeChange();
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'iuran_user'
      }, (payload: any) => {
        console.log('[ADMIN IURAN] User realtime UPDATE change:', payload);
        handleRealtimeChange();
      })
      .subscribe((status: any) => {
        if (status === 'SUBSCRIBED') {
          console.log('[ADMIN IURAN] Realtime subscribed');
        }
      });

    return () => {
      console.log('[ADMIN IURAN] Cleaning up realtime');
      clearTimeout(realtimeTimeoutRef.current);
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchData, supabaseUser?.id]);

  // Calculate display status with overdue logic
  const iuranWithStatus = useMemo(() => {
    return iuranUserList.map((iu) => {
      const isOverdue = iu.status === 'unpaid' && iu.iuran_master && new Date(iu.iuran_master.due_date) < new Date();
      return {
        ...iu,
        displayStatus: isOverdue ? 'overdue' : iu.status,
      };
    });
  }, [iuranUserList]);

  // Filter based on search and status
  const filteredIuran = useMemo(() => {
    return iuranWithStatus.filter((iu) => {
      const master = iu.iuran_master;
      const profile = iu.profiles;
      const matchesSearch = !search || 
        master?.title.toLowerCase().includes(search.toLowerCase()) ||
        profile?.name?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || iu.displayStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [iuranWithStatus, search, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = iuranWithStatus.length;
    const paid = iuranWithStatus.filter((iu) => iu.status === 'paid').length;
    const unpaid = iuranWithStatus.filter((iu) => iu.status === 'unpaid').length;
    const overdue = iuranWithStatus.filter((iu) => iu.displayStatus === 'overdue').length;
    const totalCollected = iuranWithStatus
      .filter((iu) => iu.status === 'paid')
      .reduce((sum, iu) => sum + (iu.iuran_master?.amount || 0), 0);
    
    return { total, paid, unpaid, overdue, totalCollected };
  }, [iuranWithStatus]);

  // Group by iuran_master for display
  const groupedByMaster = useMemo(() => {
    const groups: Record<string, any[]> = {};
    filteredIuran.forEach((iu) => {
      const masterId = iu.iuran_master_id;
      if (!groups[masterId]) {
        groups[masterId] = [];
      }
      groups[masterId].push(iu);
    });
    return groups;
  }, [filteredIuran]);

  // Create iuran master - using server action
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    console.log("🚀 START CREATE IURAN VIA SERVER ACTION");

    try {
      // STEP 0: Validate user
      if (!supabaseUser?.id) {
        setNotif({
          title: "Error",
          message: "User belum siap, silakan tunggu",
          variant: "warning",
          role: "admin"
        });
        setIsCreating(false);
        return;
      }

      // STEP 1: Call server action
      console.log("📦 CALLING SERVER ACTION");
      const result = await buatIuranMassal({
        title: newIuran.title,
        amount: parseFloat(newIuran.amount),
        due_date: newIuran.due_date,
        admin_id: supabaseUser.id,
      });

      console.log("📦 SERVER ACTION RESULT:", result);

      if (!result.success) {
        console.error("❌ SERVER ACTION FAILED:", result.message);
        setNotif({
          title: "Error",
          message: result.message || "Gagal membuat iuran",
          variant: "warning",
          role: "admin"
        });
        setIsCreating(false);
        return;
      }

      // STEP 2: Success
      setNotif({
        title: "Berhasil",
        message: result.message || "Iuran berhasil dibuat",
        variant: "success",
        role: "admin"
      });
      setNewIuran({ title: "", amount: "", due_date: "" });
      setShowCreateForm(false);
      fetchData(); // Immediate refetch

      console.log("✅ IURAN CREATED SUCCESSFULLY");
    } catch (err: any) {
      console.error("❌ EXCEPTION:", err);
      setNotif({
        title: "Gagal",
        message: err.message || "Terjadi kesalahan tidak terduga",
        variant: "warning",
        role: "admin"
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Anti-bug rule: Don't fetch before user ready
  if (!supabaseUser?.id) {
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
          <span className="text-slate-500 font-bold">Memuat data iuran...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-md mx-auto bg-slate-50 relative overflow-x-hidden overflow-y-auto pb-28" style={{ paddingBottom: "calc(7rem + env(safe-area-inset-bottom))" }}>
      <Notification />
      
      {/* Header */}
      <div className="bg-linear-to-b from-indigo-500 via-purple-600 to-blue-700 text-white px-6 pt-7 pb-8 relative overflow-hidden">
        <div className="absolute -top-10 -right-8 h-28 w-28 rounded-full bg-purple-200/35 blur-3xl" />
        <div className="absolute top-10 left-1/2 h-24 w-24 -translate-x-1/2 rounded-full bg-blue-200/20 blur-3xl" />
        
        <div className="relative z-10 flex items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center rounded-full border border-white/20 bg-[rgba(255,255,255,0.14)] px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-indigo-50 backdrop-blur-sm">
              <Wallet size={12} className="mr-1.5" /> Manajemen Iuran
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight">Iuran Warga</h1>
            <p className="text-sm text-indigo-50/92 mt-3 leading-relaxed max-w-80">Kelola semua jenis iuran, pantau pembayaran warga, dan buat tagihan baru.</p>
          </div>
          <button onClick={() => router.push("/admin")} className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/20 bg-[rgba(255,255,255,0.14)] text-white shadow-lg backdrop-blur-sm transition-all hover:scale-105 active:scale-95 shrink-0">
            <ArrowLeft size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 mt-4 space-y-4 pb-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-4xl border border-blue-100/80 bg-white/90 shadow-sm p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Receipt size={12} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">Total Tagihan</p>
            </div>
            <p className="text-2xl font-black text-slate-900">{stats.total}</p>
          </div>
          <div className="rounded-4xl border border-green-100/80 bg-white/90 shadow-sm p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <div className="w-6 h-6 rounded-full bg-green-50 border border-green-100 flex items-center justify-center text-green-600">
                <CheckCircle2 size={12} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-green-600">Sudah Bayar</p>
            </div>
            <p className="text-2xl font-black text-slate-900">{stats.paid}</p>
          </div>
          <div className="rounded-4xl border border-rose-100/80 bg-white/90 shadow-sm p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <div className="w-6 h-6 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
                <AlertCircle size={12} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-rose-500">Belum Bayar</p>
            </div>
            <p className="text-2xl font-black text-slate-900">{stats.unpaid}</p>
          </div>
        </div>

        {/* Total Collected */}
        <div className="rounded-4xl border border-blue-100/80 bg-white/90 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-2xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600">
              <TrendingUp size={15} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-cyan-600">Total Terkumpul</p>
          </div>
          <p className="text-3xl font-black text-slate-900">Rp {stats.totalCollected.toLocaleString("id-ID")}</p>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-xs text-slate-600">{stats.paid} sudah lunas</p>
            {stats.overdue > 0 && (
              <p className="text-xs text-yellow-600 font-bold">{stats.overdue} terlambat</p>
            )}
          </div>
        </div>

        {/* Create Button */}
        <button 
          onClick={() => setShowCreateForm(!showCreateForm)} 
          className="w-full rounded-2xl bg-linear-to-r from-indigo-600 to-purple-500 py-3 text-xs font-black text-white shadow-lg shadow-indigo-100 transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2"
        >
          <Plus size={16} /> Buat Iuran Baru
        </button>

        {/* Create Form */}
        {showCreateForm && (
          <div className="rounded-4xl border border-indigo-100 bg-white/90 shadow-sm p-5 animate-in fade-in">
            <h3 className="text-sm font-black text-slate-800 mb-4">Buat Iuran Baru</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Judul Iuran</label>
                <input
                  type="text"
                  value={newIuran.title}
                  onChange={(e) => setNewIuran({ ...newIuran, title: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Contoh: Iuran Kebersihan Bulanan"
                  required
                />
              </div>
              <div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Nominal (Rp)</label>
                <input
                  type="number"
                  value={newIuran.amount}
                  onChange={(e) => setNewIuran({ ...newIuran, amount: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="50000"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Tenggat Pembayaran</label>
                <input
                  type="date"
                  value={newIuran.due_date}
                  onChange={(e) => setNewIuran({ ...newIuran, due_date: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={() => setShowCreateForm(false)} 
                  className="flex-1 rounded-2xl border border-slate-200 py-2.5 text-xs font-black text-slate-600 transition-all hover:bg-slate-50"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isCreating} 
                  className="flex-1 rounded-2xl bg-indigo-600 py-2.5 text-xs font-black text-white transition-all hover:bg-indigo-700 disabled:opacity-60"
                >
                  {isCreating ? "Membuat..." : "Buat Iuran"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari iuran atau warga..."
              className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Semua Status</option>
            <option value="paid">Sudah Bayar</option>
            <option value="unpaid">Belum Bayar</option>
            <option value="overdue">Terlambat</option>
          </select>
        </div>

        {/* Iuran List Grouped by Master */}
        <div className="space-y-4">
          {Object.entries(groupedByMaster).length === 0 ? (
            <div className="rounded-4xl border border-dashed border-indigo-100 bg-white/70 px-4 py-8 text-center">
              <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-3">
                <Receipt size={20} className="text-indigo-400" />
              </div>
              <p className="text-sm font-bold text-slate-700">Tidak Ada Data</p>
              <p className="text-xs text-slate-500 mt-1 max-w-60 mx-auto">
                {statusFilter === 'all' ? 'Belum ada data pembayaran iuran.' : `Tidak ada data dengan status ${statusFilter}.`}
              </p>
            </div>
          ) : (
            Object.entries(groupedByMaster).map(([masterId, users]) => {
              const master = iuranMasterList.find((im) => im.id === masterId);
              if (!master) return null;
              const paidCount = users.filter((u) => u.status === 'paid').length;
              const totalCount = users.length;
              const progress = totalCount > 0 ? (paidCount / totalCount) * 100 : 0;

              return (
                <div key={masterId} className="rounded-4xl border border-indigo-100/80 bg-white/90 shadow-sm p-5">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="min-w-0">
                      <h3 className="text-sm font-black text-slate-800">{master.title}</h3>
                      <p className="text-xs font-black text-blue-600 mt-1">Rp {master.amount.toLocaleString("id-ID")}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-2xl font-black text-slate-900">{paidCount}/{totalCount}</p>
                      <p className="text-[10px] text-slate-500">terbayar</p>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="mb-4">
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-linear-to-r from-indigo-500 to-purple-500 transition-all" 
                        style={{ width: `${progress}%` }} 
                      />
                    </div>
                  </div>
                  
                  {/* User list */}
                  <div className="space-y-2">
                    {users.map((iu) => {
                      const profile = iu.profiles;
                      const displayStatus = iu.displayStatus;
                      return (
                        <div key={iu.id} className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                              displayStatus === 'paid' 
                                ? 'bg-green-50 border-green-100 text-green-600' 
                                : displayStatus === 'overdue' 
                                ? 'bg-yellow-50 border-yellow-100 text-yellow-600' 
                                : 'bg-rose-50 border-rose-100 text-rose-500'
                            }`}>
                              {displayStatus === 'paid' ? <CheckCircle2 size={14} /> : displayStatus === 'overdue' ? <Clock size={14} /> : <AlertCircle size={14} />}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-700 truncate">{profile?.name || 'Unknown'}</p>
                              <p className="text-[10px] text-slate-500">{displayStatus === 'paid' ? 'Lunas' : displayStatus === 'overdue' ? 'Terlambat' : 'Belum'}</p>
                            </div>
                          </div>
                          <ChevronRight size={16} className="text-slate-400 shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
