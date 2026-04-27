"use client";

import { useMemo, useState } from "react";
import { BadgeCheck, Clock3, Search, Wallet, Sparkles, Users2, CircleAlert, CalendarDays, ChevronRight } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import type { Iuran } from "@/lib/mockData";
import BottomNav from "@/components/BottomNav";
import Notification from "@/components/Notification";

export default function AdminIuranPage() {
  const iuran = useAppStore((s) => s.iuran);
  const citizens = useAppStore((s) => s.citizens);
  const updateIuranStatus = useAppStore((s) => s.updateIuranStatus);
  const setNotif = useAppStore((s) => s.setNotif);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Semua" | Iuran["status"]>("Semua");

  const paidCount = iuran.filter((item) => item.status === "Lunas").length;
  const pendingCount = iuran.filter((item) => item.status === "Pending").length;
  const totalCollected = iuran.filter((item) => item.status === "Lunas").reduce((sum, item) => sum + item.amount, 0);
  const collectionRate = iuran.length === 0 ? 0 : Math.round((paidCount / iuran.length) * 100);
  const uniqueCitizens = new Set(iuran.map((item) => item.citizenId)).size;
  const latestPaid = [...iuran].filter((item) => item.status === "Lunas").sort((a, b) => b.date.localeCompare(a.date))[0];

  const filteredIuran = useMemo(() => {
    return iuran.filter((item) => {
      const citizenName = citizens.find((citizen) => citizen.id === item.citizenId)?.name ?? `Warga #${item.citizenId}`;
      const matchesSearch = `${item.month} ${item.date} ${citizenName}`.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "Semua" ? true : item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [citizens, iuran, search, statusFilter]);

  const pendingCitizens = useMemo(() => {
    return iuran
      .filter((item) => item.status === "Pending")
      .map((item) => {
        const citizen = citizens.find((row) => row.id === item.citizenId);
        return {
          id: item.id,
          month: item.month,
          amount: item.amount,
          name: citizen?.name ?? `Warga #${item.citizenId}`,
        };
      })
      .slice(0, 3);
  }, [citizens, iuran]);

  const monthlySummary = useMemo(() => {
    return Object.entries(
      iuran.reduce<Record<string, number>>((acc, item) => {
        acc[item.month] = (acc[item.month] ?? 0) + 1;
        return acc;
      }, {})
    )
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 2);
  }, [iuran]);

  const handleUpdateStatus = (item: Iuran, status: Iuran["status"]) => {
    const result = updateIuranStatus(item.id, status);
    setNotif({
      title: result.success ? "Status iuran diperbarui" : "Status iuran belum berubah",
      message: result.message,
      variant: result.success ? "success" : "warning",
      role: "admin",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans max-w-md mx-auto relative shadow-2xl overflow-x-hidden pb-24">
      <Notification />
      <div className="bg-linear-to-b from-cyan-500 via-blue-600 to-blue-700 text-white px-6 pt-7 pb-8 relative overflow-hidden animate-in fade-in duration-500">
        <div className="absolute -top-10 -right-8 h-28 w-28 rounded-full bg-cyan-200/35 blur-3xl" />
        <div className="absolute top-10 left-1/2 h-24 w-24 -translate-x-1/2 rounded-full bg-sky-200/20 blur-3xl" />
        <div className="absolute inset-0 bg-linear-to-br from-white/8 via-transparent to-blue-900/10" />
        <div className="relative z-10">
          <div className="inline-flex items-center rounded-full border border-white/20 bg-[rgba(255,255,255,0.14)] px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-cyan-50 backdrop-blur-sm">
            Data Iuran Warga
          </div>
          <h1 className="mt-3 text-3xl font-black tracking-tight">Monitoring Iuran</h1>
          <p className="text-sm text-blue-50/92 mt-3 leading-relaxed max-w-80">Pantau pembayaran warga, lihat tagihan prioritas, dan perbarui status pembayaran langsung dari satu halaman.</p>

          <div className="mt-6 rounded-4xl border border-white/20 bg-[rgba(255,255,255,0.12)] p-5 backdrop-blur-sm shadow-2xl shadow-blue-700/20">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-cyan-50/80">Ringkasan Kas Warga</p>
                <h2 className="mt-2 text-3xl font-black">Rp {totalCollected.toLocaleString("id-ID")}</h2>
                <p className="mt-2 text-sm text-blue-50/88">Dana masuk dari {paidCount} pembayaran tercatat dan {uniqueCitizens} warga terpantau.</p>
              </div>
              <div className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-[rgba(255,255,255,0.12)] px-3 py-1 text-[11px] font-black uppercase tracking-widest text-cyan-50">
                <Sparkles size={12} /> {collectionRate}% lunas
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-cyan-50/70">
                <span>Progres penagihan</span>
                <span>{collectionRate}%</span>
              </div>
              <div className="h-2 rounded-full bg-[rgba(255,255,255,0.18)] overflow-hidden">
                <div className="h-full rounded-full bg-linear-to-r from-blue-400 via-cyan-300 to-blue-500 transition-all duration-1000" style={{ width: `${collectionRate}%` }} />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-3xl border border-white/18 bg-white/10 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-cyan-50/70">Lunas</p>
                <p className="mt-2 text-xl font-black">{paidCount}</p>
              </div>
              <div className="rounded-3xl border border-white/18 bg-white/10 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-cyan-50/70">Pending</p>
                <p className="mt-2 text-xl font-black">{pendingCount}</p>
              </div>
              <div className="rounded-3xl border border-white/18 bg-white/10 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-cyan-50/70">Warga</p>
                <p className="mt-2 text-xl font-black">{uniqueCitizens}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4 -mt-2">
        <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-500">
          <div className="rounded-4xl p-4 border border-blue-100/80 bg-linear-to-br from-white via-cyan-50/40 to-blue-50/70 shadow-xl shadow-blue-100/60 text-left">
            <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-blue-500/10 to-cyan-400/15 text-blue-600 border border-blue-100 flex items-center justify-center mb-3"><Wallet size={18} /></div>
            <p className="text-[11px] text-blue-500 font-black uppercase tracking-widest">Dana Masuk</p>
            <h4 className="text-2xl font-black text-slate-800 mt-1">Rp {(totalCollected / 1000).toFixed(0)}rb</h4>
            <p className="text-xs text-slate-600 mt-1">Akumulasi iuran yang sudah diterima.</p>
          </div>
          <div className="rounded-4xl p-4 border border-blue-100/80 bg-linear-to-br from-white via-cyan-50/40 to-blue-50/70 shadow-xl shadow-blue-100/60 text-left">
            <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-blue-500/10 to-cyan-400/15 text-blue-600 border border-blue-100 flex items-center justify-center mb-3"><Users2 size={18} /></div>
            <p className="text-[11px] text-blue-500 font-black uppercase tracking-widest">Warga Terpantau</p>
            <h4 className="text-2xl font-black text-slate-800 mt-1">{Math.min(uniqueCitizens, citizens.length)}</h4>
            <p className="text-xs text-slate-600 mt-1">Akun warga yang punya data iuran.</p>
          </div>
        </div>

        <div className="bg-linear-to-br from-white via-cyan-50/20 to-blue-50/30 rounded-4xl border border-blue-100/70 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-blue-100/70">
            <p className="text-sm font-black text-slate-800">Filter Pembayaran</p>
            <p className="text-xs text-slate-600 mt-1">Cari nama warga, bulan, atau tanggal pembayaran.</p>
          </div>
          <div className="p-5 space-y-3 bg-white/60 border-b border-blue-100/70">
            <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-white px-4 py-3 shadow-sm shadow-blue-50/70">
              <Search size={16} className="text-blue-500" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari iuran atau nama warga" className="w-full bg-transparent text-sm text-slate-700 outline-none" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(["Semua", "Pending", "Lunas"] as const).map((status) => (
                <button key={status} onClick={() => setStatusFilter(status)} className={`px-4 py-2 rounded-full text-xs font-black transition-all ${statusFilter === status ? "bg-linear-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-100" : "bg-white border border-blue-100 text-blue-500"}`}>
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 space-y-3">
            {filteredIuran.length === 0 ? (
              <div className="rounded-4xl border border-dashed border-blue-100 bg-white/70 px-4 py-8 text-center">
                <p className="text-sm font-bold text-slate-700">Tidak ada data iuran yang sesuai</p>
                <p className="text-xs text-slate-500 mt-1">Coba ubah pencarian atau filter status.</p>
              </div>
            ) : (
              filteredIuran.map((item, index) => {
                const citizenName = citizens.find((citizen) => citizen.id === item.citizenId)?.name ?? `Warga #${item.citizenId}`;

                return (
                  <div key={item.id} className="bg-white/90 p-4 rounded-4xl border border-blue-100/70 shadow-sm shadow-blue-50/60 animate-in fade-in transition-all duration-300 hover:scale-[1.01]" style={{ animationDelay: `${index * 30}ms` }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-linear-to-br from-blue-500/10 to-cyan-400/15 text-blue-600 border border-blue-100 shrink-0">
                          <Wallet size={18} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-black text-slate-800">{item.month}</h4>
                          <p className="text-xs text-slate-600 mt-1">{citizenName}</p>
                          <p className="text-xs text-blue-500 mt-2">Rp {item.amount.toLocaleString("id-ID")} • {item.date === "-" ? "Belum bayar" : item.date}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${item.status === "Lunas" ? "bg-linear-to-r from-blue-500/10 to-cyan-400/15 text-blue-600 border border-blue-100" : "bg-linear-to-r from-blue-600 to-cyan-500 text-white"}`}>
                        {item.status}
                      </span>
                    </div>

                    <div className="mt-4 flex gap-3">
                      {item.status === "Pending" ? (
                        <button onClick={() => handleUpdateStatus(item, "Lunas")} className="flex-1 rounded-2xl bg-linear-to-r from-blue-600 to-cyan-500 text-white py-3 text-sm font-black shadow-xl shadow-blue-100 transition-all hover:scale-[1.01] active:scale-95">
                          Tandai Lunas
                        </button>
                      ) : (
                        <button onClick={() => handleUpdateStatus(item, "Pending")} className="flex-1 rounded-2xl bg-linear-to-br from-blue-500/10 to-cyan-400/15 text-blue-600 border border-blue-100 py-3 text-sm font-black transition-all hover:scale-[1.01] active:scale-95">
                          Jadikan Pending
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-500">
          <div className="rounded-4xl bg-white border border-blue-100/70 p-5 shadow-sm shadow-blue-100/50">
            <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-blue-500/10 to-cyan-400/15 text-blue-600 flex items-center justify-center mb-4 border border-blue-100"><CalendarDays size={18} /></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">Pembayaran Terakhir</p>
            <p className="mt-2 text-sm font-black text-slate-900">{latestPaid?.month ?? "Belum ada data"}</p>
            <p className="mt-1 text-xs text-slate-600">{latestPaid ? `${latestPaid.date} • Rp ${latestPaid.amount.toLocaleString("id-ID")}` : "Menunggu pembayaran pertama"}</p>
          </div>
          <div className="rounded-4xl bg-white border border-blue-100/70 p-5 shadow-sm shadow-blue-100/50">
            <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-blue-500/10 to-cyan-400/15 text-blue-600 flex items-center justify-center mb-4 border border-blue-100"><CircleAlert size={18} /></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">Perlu Diingatkan</p>
            <p className="mt-2 text-sm font-black text-slate-900">{pendingCitizens[0]?.name ?? "Semua lunas"}</p>
            <p className="mt-1 text-xs text-slate-600">{pendingCitizens[0] ? `${pendingCitizens[0].month} • Rp ${pendingCitizens[0].amount.toLocaleString("id-ID")}` : "Tidak ada tunggakan aktif"}</p>
          </div>
        </div>

        <div className="bg-linear-to-br from-white via-cyan-50/20 to-blue-50/30 rounded-4xl border border-blue-100/70 shadow-sm overflow-hidden animate-in fade-in duration-500">
          <div className="p-4 border-b border-blue-100/70 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black text-slate-800">Prioritas Penagihan</p>
              <p className="text-xs text-slate-600">Warga yang paling perlu ditindak lanjuti hari ini.</p>
            </div>
            <button onClick={() => setNotif("Fitur pengingat massal akan segera ditambahkan.")} className="inline-flex items-center gap-1 text-xs font-black text-blue-600 transition-all hover:gap-2">Pengingat <ChevronRight size={14} /></button>
          </div>
          <div className="p-4 grid gap-3">
            {pendingCitizens.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-blue-100 px-4 py-8 text-center bg-white/70">
                <p className="text-sm font-bold text-slate-700">Tidak ada tagihan prioritas</p>
                <p className="text-xs text-slate-500 mt-1">Semua pembayaran sudah tertangani dengan baik.</p>
              </div>
            ) : (
              pendingCitizens.map((entry, index) => (
                <div key={entry.id} className="rounded-3xl border border-blue-100/70 bg-white/80 px-4 py-4 shadow-sm shadow-blue-50/60 animate-in fade-in duration-500" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-slate-800">{entry.name}</p>
                      <p className="text-xs text-slate-600 mt-1">{entry.month} • Rp {entry.amount.toLocaleString("id-ID")}</p>
                    </div>
                    <div className="rounded-full bg-linear-to-r from-blue-600 to-cyan-500 px-3 py-1 text-[11px] font-black text-white">Pending</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-linear-to-br from-white via-cyan-50/20 to-blue-50/30 rounded-4xl border border-blue-100/70 shadow-sm overflow-hidden animate-in fade-in duration-500">
          <div className="p-4 border-b border-blue-100/70">
            <p className="text-sm font-black text-slate-800">Ringkasan Bulan Aktif</p>
            <p className="text-xs text-slate-600">Periode iuran yang saat ini paling sering muncul di data.</p>
          </div>
          <div className="p-4 grid gap-3">
            {monthlySummary.map(([month, count], index) => (
              <div key={month} className="rounded-3xl border border-blue-100/70 bg-white/80 px-4 py-4 shadow-sm shadow-blue-50/60 animate-in fade-in duration-500" style={{ animationDelay: `${index * 50}ms` }}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-slate-800">{month}</p>
                    <p className="text-xs text-slate-600 mt-1">{count} data iuran tercatat pada periode ini.</p>
                  </div>
                  <div className="rounded-full bg-linear-to-r from-blue-600 to-cyan-500 px-3 py-1 text-[11px] font-black text-white">{count}x</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
