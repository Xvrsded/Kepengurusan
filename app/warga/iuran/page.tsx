"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Wallet, Receipt, CheckCircle2, AlertCircle, ChevronRight, Clock, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useAuthGuard } from "@/lib/useAuthGuard";
import BottomNav from "@/components/BottomNav";
import Notification from "@/components/Notification";

export default function WargaIuranPage() {
  useAuthGuard();
  const router = useRouter();
  const citizens = useAppStore((s) => s.citizens);
  const iuranTypes = useAppStore((s) => s.iuranTypes);
  const iuranPayments = useAppStore((s) => s.iuranPayments);
  const payIuranPayment = useAppStore((s) => s.payIuranPayment);
  const setNotif = useAppStore((s) => s.setNotif);
  const userProfile = useAppStore((s) => s.userProfile);
  const fetchCitizens = useAppStore((s) => s.fetchCitizens);
  const fetchIuranTypes = useAppStore((s) => s.fetchIuranTypes);
  const fetchIuranPayments = useAppStore((s) => s.fetchIuranPayments);
  const loadingIuranPayments = useAppStore((s) => s.loadingIuranPayments);
  const loadingCitizens = useAppStore((s) => s.loadingCitizens);
  const loadingIuranTypes = useAppStore((s) => s.loadingIuranTypes);

  const [isLoadingId, setIsLoadingId] = useState<number | null>(null);

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

  const currentCitizen = useMemo(() => citizens.find((c) => c.nik === userProfile.nik), [citizens, userProfile.nik]);

  const myPayments = useMemo(() => {
    if (!currentCitizen) return [];
    return iuranPayments
      .filter((p) => p.citizenId === currentCitizen.id)
      .map((p) => {
        const type = iuranTypes.find((t) => t.id === p.iuranTypeId);
        return { ...p, typeName: type?.name ?? "Iuran", typePeriod: type?.type ?? "custom" };
      })
      .sort((a, b) => (a.status === "Belum" ? -1 : 1) || b.id - a.id);
  }, [iuranPayments, iuranTypes, currentCitizen]);

  const totalJimpitan = useMemo(() => {
    if (!currentCitizen) return 0;
    const jimpitanType = iuranTypes.find((t) => t.type === "weekly");
    if (!jimpitanType) return 0;
    return iuranPayments
      .filter((p) => p.citizenId === currentCitizen.id && p.iuranTypeId === jimpitanType.id && p.status === "Lunas")
      .reduce((sum, p) => sum + p.amount, 0);
  }, [iuranPayments, iuranTypes, currentCitizen]);

  const perTypeSummary = useMemo(() => {
    if (!currentCitizen) return [];
    return iuranTypes.map((t) => {
      const payments = iuranPayments.filter((p) => p.citizenId === currentCitizen.id && p.iuranTypeId === t.id);
      const paid = payments.filter((p) => p.status === "Lunas").length;
      const total = payments.length;
      return { ...t, paid, total, hasPayments: payments.length > 0 };
    });
  }, [iuranTypes, iuranPayments, currentCitizen]);

  const handlePay = (id: number) => {
    setIsLoadingId(id);
    setTimeout(async () => {
      const res = (await payIuranPayment(id)) as { success: boolean; message: string };
      setNotif({ title: res.success ? "Berhasil" : "Gagal", message: res.message, variant: res.success ? "success" : "warning", role: "warga" });
      setIsLoadingId(null);
    }, 500);
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
              <Receipt size={12} className="mr-1.5" /> Tagihan Saya
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight">Iuran Warga</h1>
            <p className="text-sm text-blue-50/92 mt-3 leading-relaxed max-w-80">Lihat semua jenis iuran, status pembayaran, dan bayar langsung dari sini.</p>
          </div>
          <button onClick={() => router.push("/warga")} className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/20 bg-[rgba(255,255,255,0.14)] text-white shadow-lg backdrop-blur-sm transition-all hover:scale-105 active:scale-95 shrink-0">
            <ArrowLeft size={16} />
          </button>
        </div>
      </div>

      <div className="px-6 -mt-4 space-y-4 pb-6">
        {loadingIuranPayments && (
          <div className="flex items-center justify-center gap-2 py-3">
            <div className="h-5 w-5 rounded-full border-2 border-blue-200 border-t-blue-500 animate-spin" />
            <p className="text-xs font-black text-slate-500">Memuat data iuran...</p>
          </div>
        )}
        {currentCitizen && totalJimpitan > 0 && (
          <div className="rounded-4xl border border-blue-100/80 bg-white/90 shadow-sm p-5 animate-in fade-in duration-500">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-2xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600"><TrendingUp size={15} /></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-cyan-600">Total Jimpitan Terbayar</p>
            </div>
            <p className="text-2xl font-black text-slate-900">Rp {totalJimpitan.toLocaleString("id-ID")}</p>
            <p className="text-xs text-slate-600 mt-1">Akumulasi seluruh pembayaran jimpitan mingguan.</p>
          </div>
        )}

        <div>
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Ringkasan per Jenis</p>
          {perTypeSummary.length === 0 ? (
            <div className="rounded-4xl border border-dashed border-blue-100 bg-white/70 px-4 py-6 text-center">
              <p className="text-sm font-bold text-slate-600">Belum ada jenis iuran</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {perTypeSummary.map((t, i) => (
                <div key={t.id} className={`rounded-3xl border p-4 transition-all ${t.hasPayments ? "border-blue-100/80 bg-white/90 shadow-sm" : "border-dashed border-slate-200 bg-white/50"}`} style={{ animationDelay: `${i * 60}ms` }}>
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">{typeLabels[t.type]}</p>
                  <h4 className="mt-1 text-sm font-black text-slate-800 truncate">{t.name}</h4>
                  <p className="text-xs font-black text-blue-600 mt-1">Rp {t.amount.toLocaleString("id-ID")}</p>
                  {t.hasPayments && (
                    <div className="mt-2 flex items-center gap-1.5">
                      <div className="flex-1 h-1.5 rounded-full bg-blue-100 overflow-hidden">
                        <div className="h-full rounded-full bg-blue-400 transition-all" style={{ width: `${t.total ? (t.paid / t.total) * 100 : 0}%` }} />
                      </div>
                      <span className="text-[10px] font-black text-slate-500">{t.paid}/{t.total}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Detail Pembayaran</p>
          {myPayments.length === 0 ? (
            <div className="rounded-4xl border border-dashed border-blue-100 bg-white/70 px-4 py-8 text-center">
              <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-3">
                <Receipt size={20} className="text-blue-400" />
              </div>
              <p className="text-sm font-bold text-slate-700">Belum Ada Tagihan</p>
              <p className="text-xs text-slate-500 mt-1 max-w-60 mx-auto">Saat ini tidak ada data pembayaran iuran yang tercatat untuk akun Anda.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myPayments.map((p, index) => (
                <div key={p.id} className="bg-white/90 p-4 rounded-4xl border border-blue-100/70 shadow-sm animate-in fade-in transition-all hover:shadow-md" style={{ animationDelay: `${index * 40}ms` }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${p.status === "Lunas" ? "bg-blue-50 border-blue-100 text-blue-600" : "bg-rose-50 border-rose-100 text-rose-500"}`}>
                        {p.status === "Lunas" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-black text-slate-800">{p.typeName}</h4>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${p.status === "Lunas" ? "bg-blue-100 text-blue-600" : "bg-rose-100 text-rose-600"}`}>{p.status}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{p.notes || p.date}</p>
                        <p className="text-xs font-black text-blue-600 mt-1">Rp {p.amount.toLocaleString("id-ID")}</p>
                      </div>
                    </div>
                  </div>
                  {p.status === "Belum" && (
                    <div className="mt-3">
                      <button onClick={() => handlePay(p.id)} disabled={isLoadingId === p.id} className="w-full rounded-2xl bg-linear-to-r from-blue-600 to-cyan-500 py-2.5 text-xs font-black text-white shadow-lg shadow-blue-100 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-60">
                        {isLoadingId === p.id ? "Memproses..." : "Bayar Sekarang"}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
