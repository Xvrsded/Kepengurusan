"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Wallet, Sparkles, Users2, CircleAlert, CalendarDays, ChevronRight, Filter, ArrowLeft, Tag, Receipt } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useAuthGuard } from "@/lib/useAuthGuard";
import BottomNav from "@/components/BottomNav";
import Notification from "@/components/Notification";

  useAuthGuard();
  const router = useRouter();
  const citizens = useAppStore((s) => s.citizens);
  const iuranTypes = useAppStore((s) => s.iuranTypes);
  const iuranPayments = useAppStore((s) => s.iuranPayments);
  const updateIuranPayment = useAppStore((s) => s.updateIuranPayment);
  const setNotif = useAppStore((s) => s.setNotif);
  const fetchCitizens = useAppStore((s) => s.fetchCitizens);
  const fetchIuranTypes = useAppStore((s) => s.fetchIuranTypes);
  const fetchIuranPayments = useAppStore((s) => s.fetchIuranPayments);
  const loadingIuranPayments = useAppStore((s) => s.loadingIuranPayments);
  const loadingCitizens = useAppStore((s) => s.loadingCitizens);
  const loadingIuranTypes = useAppStore((s) => s.loadingIuranTypes);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<number | "all">("all");

  useEffect(() => {
    fetchCitizens();
    fetchIuranTypes();
    fetchIuranPayments();
  }, [fetchCitizens, fetchIuranTypes, fetchIuranPayments]);
    if (loadingCitizens || loadingIuranTypes || loadingIuranPayments) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="flex flex-col items-center gap-3">
            <span className="text-slate-500 font-bold">Memuat data iuran...</span>
            <div className="h-8 w-8 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin" />
          </div>
        </div>
      );
    }
  const [statusFilter, setStatusFilter] = useState<"all" | "Lunas" | "Belum">("all");
  const [isLoadingId, setIsLoadingId] = useState<number | null>(null);

  const totalCollected = useMemo(() => iuranPayments.filter((p) => p.status === "Lunas").reduce((sum, p) => sum + p.amount, 0), [iuranPayments]);
  const paidCount = iuranPayments.filter((p) => p.status === "Lunas").length;
  const pendingCount = iuranPayments.filter((p) => p.status === "Belum").length;
  const collectionRate = iuranPayments.length ? Math.round((paidCount / iuranPayments.length) * 100) : 0;

  const filteredPayments = useMemo(() => {
    return iuranPayments.filter((p) => {
      const citizen = citizens.find((c) => c.id === p.citizenId);
      const type = iuranTypes.find((t) => t.id === p.iuranTypeId);
      const searchStr = `${citizen?.name ?? ""} ${type?.name ?? ""} ${p.notes ?? ""} ${p.date}`.toLowerCase();
      const matchesSearch = !search || searchStr.includes(search.toLowerCase());
      const matchesType = typeFilter === "all" || p.iuranTypeId === typeFilter;
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [citizens, iuranTypes, iuranPayments, search, typeFilter, statusFilter]);

  const perTypeStats = useMemo(() => {
    return iuranTypes.map((t) => {
      const payments = iuranPayments.filter((p) => p.iuranTypeId === t.id);
      const paid = payments.filter((p) => p.status === "Lunas").length;
      const total = payments.length;
      const collected = payments.filter((p) => p.status === "Lunas").reduce((s, p) => s + p.amount, 0);
      return { ...t, paid, total, collected, rate: total ? Math.round((paid / total) * 100) : 0 };
    });
  }, [iuranTypes, iuranPayments]);

  const pendingCitizens = useMemo(() => {
    return iuranPayments
      .filter((p) => p.status === "Belum")
      .slice(0, 5)
      .map((p) => {
        const citizen = citizens.find((c) => c.id === p.citizenId);
        const type = iuranTypes.find((t) => t.id === p.iuranTypeId);
        return { ...p, citizenName: citizen?.name ?? `Warga #${p.citizenId}`, typeName: type?.name ?? "Iuran" };
      });
  }, [iuranPayments, citizens, iuranTypes]);

  const handleToggleStatus = async (id: number, current: "Lunas" | "Belum") => {
    setIsLoadingId(id);
    await new Promise((resolve) => setTimeout(resolve, 300));
    const next = current === "Lunas" ? "Belum" : "Lunas";
    const date = next === "Lunas" ? new Date().toISOString().slice(0, 10) : "-";
    const res = (await updateIuranPayment(id, { status: next, date })) as { success: boolean; message: string };
    setNotif({ title: res.success ? "Status diperbarui" : "Gagal", message: res.message, variant: res.success ? "success" : "warning", role: "admin" });
    setIsLoadingId(null);
  };

  const typeLabels: Record<string, string> = { monthly: "Bulanan", weekly: "Mingguan", custom: "Khusus" };

  return (
    <div className="min-h-screen bg-slate-50 font-sans max-w-md mx-auto relative shadow-2xl overflow-x-hidden pb-24">
      <Notification />

      <div className="bg-linear-to-b from-cyan-500 via-blue-600 to-blue-700 text-white px-6 pt-7 pb-8 relative overflow-hidden animate-in fade-in duration-500">
        <div className="absolute -top-10 -right-8 h-28 w-28 rounded-full bg-cyan-200/35 blur-3xl" />
        <div className="absolute top-10 left-1/2 h-24 w-24 -translate-x-1/2 rounded-full bg-sky-200/20 blur-3xl" />
        <div className="relative z-10 flex items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center rounded-full border border-white/20 bg-[rgba(255,255,255,0.14)] px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-cyan-50 backdrop-blur-sm">
              <Receipt size={12} className="mr-1.5" /> Data Iuran Warga
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight">Monitoring Iuran</h1>
            <p className="text-sm text-blue-50/92 mt-3 leading-relaxed max-w-80">Pantau semua jenis pembayaran warga, filter per jenis iuran, dan kelola status lunas.</p>
          </div>
          <button onClick={() => router.push("/admin")} className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/20 bg-[rgba(255,255,255,0.14)] text-white shadow-lg backdrop-blur-sm transition-all hover:scale-105 active:scale-95 shrink-0">
            <ArrowLeft size={16} />
          </button>
        </div>

        <div className="mt-6 rounded-4xl border border-white/20 bg-[rgba(255,255,255,0.12)] p-5 backdrop-blur-sm shadow-2xl shadow-blue-700/20">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-cyan-50/80">Total Pemasukan</p>
              <h2 className="mt-2 text-3xl font-black">Rp {totalCollected.toLocaleString("id-ID")}</h2>
              <p className="mt-2 text-sm text-blue-50/88">Dari {paidCount} pembayaran lunas dari total {iuranPayments.length} tagihan.</p>
            </div>
            <div className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-[rgba(255,255,255,0.12)] px-3 py-1 text-[11px] font-black uppercase tracking-widest text-cyan-50">
              <Sparkles size={12} /> {collectionRate}%
            </div>
          </div>
          <div className="mt-5 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-cyan-50/70">
              <span>Kolektibilitas</span>
              <span>{collectionRate}%</span>
            </div>
            <div className="h-2 rounded-full bg-[rgba(255,255,255,0.18)] overflow-hidden">
              <div className="h-full rounded-full bg-linear-to-r from-blue-400 via-cyan-300 to-blue-500 transition-all duration-1000" style={{ width: `${collectionRate}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-4 space-y-4 pb-6">
        {loadingIuranPayments && (
          <div className="flex items-center justify-center gap-2 py-3">
            <div className="h-5 w-5 rounded-full border-2 border-blue-200 border-t-blue-500 animate-spin" />
            <p className="text-xs font-black text-slate-500">Memuat data iuran...</p>
          </div>
        )}
        <div className="flex items-center justify-between">
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Jenis Iuran</p>
          <button onClick={() => router.push("/admin/iuran/types")} className="inline-flex items-center gap-1 text-xs font-black text-blue-600 transition-all hover:gap-2">
            Kelola <ChevronRight size={14} />
          </button>
        </div>

        {perTypeStats.length === 0 ? (
          <div className="rounded-4xl border border-dashed border-blue-100 bg-white/70 px-4 py-6 text-center">
            <p className="text-sm font-bold text-slate-600">Belum ada jenis iuran</p>
            <button onClick={() => router.push("/admin/iuran/types")} className="mt-2 text-xs font-black text-blue-600">Tambah Jenis</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {perTypeStats.map((t, i) => (
              <button key={t.id} onClick={() => setTypeFilter(typeFilter === t.id ? "all" : t.id)} className={`rounded-3xl border p-4 text-left transition-all hover:scale-[1.02] ${typeFilter === t.id ? "border-blue-300 bg-blue-50 shadow-md" : "border-blue-100/80 bg-white/90 shadow-sm"}`} style={{ animationDelay: `${i * 60}ms` }}>
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">{typeLabels[t.type]}</p>
                <h4 className="mt-1 text-sm font-black text-slate-800 truncate">{t.name}</h4>
                <p className="mt-1 text-xs font-black text-blue-600">Rp {t.amount.toLocaleString("id-ID")}</p>
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] font-black text-slate-500 mb-1">
                    <span>{t.paid}/{t.total}</span>
                    <span>{t.rate}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-blue-100 overflow-hidden">
                    <div className="h-full rounded-full bg-linear-to-r from-blue-400 to-cyan-400 transition-all duration-700" style={{ width: `${t.rate}%` }} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="bg-linear-to-br from-white via-cyan-50/20 to-blue-50/30 rounded-4xl border border-blue-100/70 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-blue-100/70">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <p className="text-sm font-black text-slate-800">Filter Pembayaran</p>
                <p className="text-xs text-slate-600 mt-1">Cari warga, filter jenis iuran, atau status bayar.</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0"><Filter size={18} /></div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-white px-4 py-3 shadow-sm">
              <Search size={16} className="text-blue-500 shrink-0" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama warga, jenis iuran..." className="w-full bg-transparent text-sm text-slate-700 outline-none" />
            </div>
            <div className="mt-3 flex gap-2 flex-wrap">
              <button onClick={() => setTypeFilter("all")} className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${typeFilter === "all" ? "bg-blue-600 text-white" : "bg-white border border-blue-100 text-blue-500"}`}>Semua Jenis</button>
              {iuranTypes.map((t) => (
                <button key={t.id} onClick={() => setTypeFilter(typeFilter === t.id ? "all" : t.id)} className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${typeFilter === t.id ? "bg-blue-600 text-white" : "bg-white border border-blue-100 text-blue-500"}`}>
                  {t.name}
                </button>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              {(["all", "Lunas", "Belum"] as const).map((s) => (
                <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${statusFilter === s ? "bg-cyan-500 text-white" : "bg-white border border-blue-100 text-slate-500"}`}>
                  {s === "all" ? "Semua Status" : s}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 space-y-3">
            {filteredPayments.length === 0 ? (
              <div className="rounded-4xl border border-dashed border-blue-100 bg-white/70 px-4 py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-3">
                  <CircleAlert size={20} className="text-blue-400" />
                </div>
                <p className="text-sm font-bold text-slate-700">Tidak ada data</p>
                <p className="text-xs text-slate-500 mt-1">Coba ubah pencarian atau filter.</p>
              </div>
            ) : (
              filteredPayments.map((p, index) => {
                const citizen = citizens.find((c) => c.id === p.citizenId);
                const type = iuranTypes.find((t) => t.id === p.iuranTypeId);
                return (
                  <div key={p.id} className="bg-white/90 p-4 rounded-4xl border border-blue-100/70 shadow-sm animate-in fade-in transition-all hover:scale-[1.01]" style={{ animationDelay: `${index * 30}ms` }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-blue-500/10 to-cyan-400/15 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                          <Wallet size={16} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-black text-slate-800">{citizen?.name ?? `Warga #${p.citizenId}`}</h4>
                            <span className="rounded-full bg-blue-50 border border-blue-100 px-2 py-0.5 text-[10px] font-black text-blue-500">{type?.name ?? "Iuran"}</span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1">{p.notes || p.date}</p>
                          <p className="text-xs font-black text-blue-600 mt-1">Rp {p.amount.toLocaleString("id-ID")}</p>
                        </div>
                      </div>
                      <span className={`shrink-0 px-3 py-1 rounded-full text-[10px] font-black uppercase ${p.status === "Lunas" ? "bg-blue-100 text-blue-600 border border-blue-100" : "bg-rose-100 text-rose-600 border border-rose-100"}`}>
                        {p.status}
                      </span>
                    </div>
                    <div className="mt-3">
                      <button onClick={() => handleToggleStatus(p.id, p.status)} disabled={isLoadingId === p.id} className={`w-full rounded-2xl py-2.5 text-xs font-black transition-all active:scale-95 disabled:opacity-60 ${p.status === "Lunas" ? "bg-rose-50 text-rose-600 border border-rose-100" : "bg-linear-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-100"}`}>
                        {isLoadingId === p.id ? "Memproses..." : p.status === "Lunas" ? "Jadikan Belum" : "Tandai Lunas"}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-linear-to-br from-white via-cyan-50/20 to-blue-50/30 rounded-4xl border border-blue-100/70 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-blue-100/70 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black text-slate-800">Prioritas Penagihan</p>
              <p className="text-xs text-slate-600">Warga dengan status belum lunas.</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shrink-0"><CircleAlert size={18} /></div>
          </div>
          <div className="p-4 grid gap-3">
            {pendingCitizens.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-blue-100 px-4 py-6 text-center bg-white/70">
                <p className="text-sm font-bold text-slate-600">Semua lunas!</p>
                <p className="text-xs text-slate-500 mt-1">Tidak ada tagihan yang perlu ditindaklanjuti.</p>
              </div>
            ) : (
              pendingCitizens.map((entry, index) => (
                <div key={entry.id} className="rounded-3xl border border-rose-100/70 bg-rose-50/40 px-4 py-3 shadow-sm animate-in fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-slate-800">{entry.citizenName}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{entry.typeName} • Rp {entry.amount.toLocaleString("id-ID")}</p>
                    </div>
                    <span className="rounded-full bg-rose-100 px-3 py-1 text-[10px] font-black text-rose-600">Belum</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
