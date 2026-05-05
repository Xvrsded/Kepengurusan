"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, FileSearch, FileText, Search, Sparkles, Users2, ChevronRight, CalendarDays, CircleAlert } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useAuthGuard } from "@/lib/useAuthGuard";

import BottomNav from "@/components/BottomNav";
import Notification from "@/components/Notification";
import type { Letter } from "@/store/useAppStore";

export default function AdminSuratPage() {
  useAuthGuard();
  const letters = useAppStore((s) => s.letters);
  const profiles = useAppStore((s) => s.profiles);
  const updateLetterStatus = useAppStore((s) => s.updateLetterStatus);
  const approveLetter = useAppStore((s) => s.approveLetter);
  const rejectLetter = useAppStore((s) => s.rejectLetter);
  const setNotif = useAppStore((s) => s.setNotif);
  const fetchLetters = useAppStore((s) => s.fetchLetters);
  const loadingLetters = useAppStore((s) => s.loadingLetters);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Semua" | "pending" | "approved" | "rejected">("Semua");

  useEffect(() => {
    console.log('[ADMIN SURAT] Component mounted, calling fetchLetters...');
    fetchLetters();
  }, [fetchLetters]);

  console.log('[ADMIN SURAT] All letters from store:', letters);
  console.log('[ADMIN SURAT] Letters count:', letters.length);
  console.log('[ADMIN SURAT] Letters data:', JSON.stringify(letters, null, 2));

  const processCount = letters.filter((letter) => letter.status === "pending").length;
  const doneCount = letters.filter((letter) => letter.status === "approved").length;
  const rejectedCount = letters.filter((letter) => letter.status === "rejected").length;
  const completionRate = letters.length === 0 ? 0 : Math.round((doneCount / letters.length) * 100);
  const uniqueApplicants = new Set(letters.map((letter) => letter.user_id)).size;
  const latestIncoming = letters.length > 0 ? letters[0] : null;

  const filteredLetters = useMemo(() => {
    // TEMPORARY: Remove all filters to show all data for debugging
    console.log('[ADMIN SURAT] DEBUG MODE - Showing all letters without filters');
    console.log('[ADMIN SURAT] Total letters before filter:', letters.length);
    return letters;
  }, [letters]);

  const groupedTypes = useMemo(() => {
    return Object.entries(
      letters.reduce<Record<string, number>>((acc, letter) => {
        acc[letter.jenis_surat] = (acc[letter.jenis_surat] ?? 0) + 1;
        return acc;
      }, {})
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [letters]);

  const priorityLetters = useMemo(() => {
    return [...letters]
      .filter((letter) => letter.status === "pending")
      .slice(0, 3);
  }, [letters]);

  const handleComplete = async (letter: Letter) => {
    const result = await approveLetter(letter.id, "Disetujui oleh admin");
    setNotif({
      title: result.success ? "Surat disetujui" : "Gagal menyetujui surat",
      message: result.message,
      variant: result.success ? "success" : "warning",
      role: "admin",
    });
  };

  const handleReject = async (letter: Letter) => {
    const result = await rejectLetter(letter.id, "Ditolak oleh admin");
    setNotif({
      title: result.success ? "Surat ditolak" : "Gagal menolak surat",
      message: result.message,
      variant: result.success ? "success" : "warning",
      role: "admin",
    });
  };

  return (
    <div className="min-h-screen font-sans relative overflow-x-hidden pb-24">
      <Notification />
      <div style={{ display: loadingLetters ? 'block' : 'none' }} className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <span className="text-slate-500 font-bold">Memuat data surat...</span>
          <div className="h-8 w-8 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin" />
        </div>
      </div>
      <div style={{ display: !loadingLetters ? 'block' : 'none' }}>
        <div className="bg-linear-to-b from-cyan-500 via-blue-600 to-blue-700 text-white px-6 pt-7 pb-8 relative overflow-hidden animate-in fade-in duration-500">
        <div className="absolute -top-10 -right-8 h-28 w-28 rounded-full bg-cyan-200/35 blur-3xl" />
        <div className="absolute top-10 left-1/2 h-24 w-24 -translate-x-1/2 rounded-full bg-sky-200/20 blur-3xl" />
        <div className="absolute inset-0 bg-linear-to-br from-white/8 via-transparent to-blue-900/10" />
        <div className="relative z-10">
          <div className="inline-flex items-center rounded-full border border-white/20 bg-[rgba(255,255,255,0.14)] px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-cyan-50 backdrop-blur-sm">
            Data Surat Warga
          </div>
          <h1 className="mt-3 text-3xl font-black tracking-tight">Manajemen Surat</h1>
          <p className="text-sm text-blue-50/92 mt-3 leading-relaxed max-w-80">Pantau surat warga, identifikasi permintaan prioritas, dan selesaikan pengajuan dengan alur yang lebih cepat.</p>

          <div className="mt-6 rounded-4xl border border-white/20 bg-[rgba(255,255,255,0.12)] p-5 backdrop-blur-sm shadow-2xl shadow-blue-700/20">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-cyan-50/80">Ringkasan Layanan</p>
                <h2 className="mt-2 text-3xl font-black">{letters.length} Surat</h2>
                <p className="mt-2 text-sm text-blue-50/88">{processCount} surat masih diproses dari total {uniqueApplicants} pemohon yang tercatat.</p>
              </div>
              <div className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-[rgba(255,255,255,0.12)] px-3 py-1 text-[11px] font-black uppercase tracking-widest text-cyan-50">
                <Sparkles size={12} /> {completionRate}% selesai
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-cyan-50/70">
                <span>Progres penyelesaian</span>
                <span>{completionRate}%</span>
              </div>
              <div className="h-2 rounded-full bg-[rgba(255,255,255,0.18)] overflow-hidden">
                <div className="h-full rounded-full bg-linear-to-r from-blue-400 via-cyan-300 to-blue-500 transition-all duration-1000" style={{ width: `${completionRate}%` }} />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-3xl border border-white/18 bg-white/10 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-cyan-50/70">Diproses</p>
                <p className="mt-2 text-xl font-black">{processCount}</p>
              </div>
              <div className="rounded-3xl border border-white/18 bg-white/10 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-cyan-50/70">Selesai</p>
                <p className="mt-2 text-xl font-black">{doneCount}</p>
              </div>
              <div className="rounded-3xl border border-white/18 bg-white/10 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-cyan-50/70">Pemohon</p>
                <p className="mt-2 text-xl font-black">{uniqueApplicants}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4 -mt-2">
        <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-500">
          <div className="rounded-4xl p-4 border border-blue-100/80 bg-linear-to-br from-white via-cyan-50/40 to-blue-50/70 shadow-xl shadow-blue-100/60 text-left">
            <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-blue-500/10 to-cyan-400/15 text-blue-600 border border-blue-100 flex items-center justify-center mb-3"><Clock3 size={20} /></div>
            <p className="text-[11px] text-blue-500 font-black uppercase tracking-widest">Butuh Tindak Lanjut</p>
            <h4 className="text-2xl font-black text-slate-800 mt-1">{processCount}</h4>
            <p className="text-xs text-slate-600 mt-1">Surat aktif yang perlu diselesaikan.</p>
          </div>
          <div className="rounded-4xl p-4 border border-blue-100/80 bg-linear-to-br from-white via-cyan-50/40 to-blue-50/70 shadow-xl shadow-blue-100/60 text-left">
            <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-blue-500/10 to-cyan-400/15 text-blue-600 border border-blue-100 flex items-center justify-center mb-3"><Users2 size={20} /></div>
            <p className="text-[11px] text-blue-500 font-black uppercase tracking-widest">Warga Terlibat</p>
            <h4 className="text-2xl font-black text-slate-800 mt-1">{Math.min(uniqueApplicants, profiles.length)}</h4>
            <p className="text-xs text-slate-600 mt-1">Warga yang mengajukan surat.</p>
          </div>
        </div>

        <div className="bg-linear-to-br from-white via-cyan-50/20 to-blue-50/30 rounded-4xl border border-blue-100/70 shadow-sm overflow-hidden animate-in fade-in duration-500">
          <div className="p-4 border-b border-blue-100/70 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-blue-500/10 to-cyan-400/15 text-blue-600 border border-blue-100 flex items-center justify-center"><FileSearch size={18} /></div>
            <div>
              <p className="text-sm font-black text-slate-800">Filter Surat Masuk</p>
              <p className="text-xs text-slate-600">Cari berdasarkan pemohon, jenis surat, atau tanggal.</p>
            </div>
          </div>
          <div className="p-4 space-y-3 bg-white/60">
            <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-white px-4 py-3 shadow-sm shadow-blue-50/70">
              <Search size={16} className="text-blue-500" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari surat atau nama warga" className="w-full bg-transparent text-sm text-slate-700 outline-none" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(["Semua", "pending", "approved", "rejected"] as const).map((status) => (
                <button key={status} onClick={() => setStatusFilter(status)} className={`px-4 py-2 rounded-full text-xs font-black transition-all ${statusFilter === status ? "bg-linear-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-100" : "bg-white border border-blue-100 text-blue-500"}`}>
                  {status === "pending" ? "Pending" : status === "approved" ? "Disetujui" : status === "rejected" ? "Ditolak" : status}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-500">
          <div className="rounded-4xl bg-white border border-blue-100/70 p-5 shadow-sm shadow-blue-100/50">
            <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-blue-500/10 to-cyan-400/15 text-blue-600 flex items-center justify-center mb-4 border border-blue-100"><CalendarDays size={18} /></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">Surat Terbaru</p>
            <p className="font-black text-slate-900">{latestIncoming?.jenis_surat || "Surat"}</p>
            <p className="mt-1 text-xs text-slate-600">{latestIncoming ? `User ID: ${latestIncoming.user_id.slice(0, 8)}...` : "Menunggu data terbaru"}</p>
          </div>
          <div className="rounded-4xl bg-white border border-blue-100/70 p-5 shadow-sm shadow-blue-100/50">
            <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-blue-500/10 to-cyan-400/15 text-blue-600 flex items-center justify-center mb-4 border border-blue-100"><CircleAlert size={18} /></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">Prioritas Hari Ini</p>
            <p className="mt-2 text-sm font-black text-slate-900">{priorityLetters[0]?.jenis_surat || "Surat"}</p>
            <p className="mt-1 text-xs text-slate-600">{priorityLetters[0] ? `User ID: ${priorityLetters[0].user_id.slice(0, 8)}... perlu tindak lanjut` : "Tidak ada antrean prioritas"}</p>
          </div>
        </div>

        <div className="bg-linear-to-br from-white via-cyan-50/20 to-blue-50/30 rounded-4xl border border-blue-100/70 shadow-sm overflow-hidden animate-in fade-in duration-500">
          <div className="p-4 border-b border-blue-100/70 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black text-slate-800">Jenis Surat Paling Sering</p>
              <p className="text-xs text-slate-600">Bantu admin membaca pola permintaan layanan warga.</p>
            </div>
            <button onClick={() => setNotif("Analisis surat sedang ditingkatkan untuk insight yang lebih lengkap.")} className="inline-flex items-center gap-1 text-xs font-black text-blue-600 transition-all hover:gap-2">Insight <ChevronRight size={14} /></button>
          </div>
          <div className="p-4 grid gap-3">
            {groupedTypes.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-blue-100 px-4 py-8 text-center bg-white/70">
                <p className="text-sm font-bold text-slate-600">Belum ada jenis surat</p>
              </div>
            ) : (
              groupedTypes.map(([type, count], index) => (
                <div key={type} className="rounded-3xl border border-blue-100/70 bg-white/80 px-4 py-4 shadow-sm shadow-blue-50/60 animate-in fade-in duration-500" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-slate-800">{type}</p>
                      <p className="text-xs text-slate-600 mt-1">Digunakan oleh {count} pengajuan surat.</p>
                    </div>
                    <div className="rounded-full bg-linear-to-r from-blue-600 to-cyan-500 px-3 py-1 text-[11px] font-black text-white">{count}x</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-3">
          {filteredLetters.length === 0 ? (
            <div className="w-full bg-white rounded-4xl border border-blue-100/70 shadow-sm p-8 text-center">
              <div className="w-14 h-14 rounded-3xl bg-linear-to-br from-blue-500/10 to-cyan-400/15 text-blue-500 border border-blue-100 flex items-center justify-center mx-auto mb-3"><FileText size={22} /></div>
              <p className="text-sm font-bold text-slate-700">Tidak ada surat yang sesuai</p>
              <p className="text-xs text-slate-500 mt-1">Coba ubah pencarian atau filter status.</p>
            </div>
          ) : (
            filteredLetters.map((letter, index) => (
              <div key={letter.id} className="w-full bg-white/90 p-5 rounded-4xl border border-blue-100/70 shadow-sm shadow-blue-50/60 text-left animate-in fade-in transition-all duration-300 hover:scale-[1.01]" style={{ animationDelay: `${index * 35}ms` }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 ${letter.status === "approved" ? "bg-linear-to-br from-blue-500/10 to-cyan-400/15 text-blue-600 border-blue-100" : letter.status === "rejected" ? "bg-linear-to-br from-red-500/10 to-rose-400/15 text-red-600 border-red-100" : "bg-linear-to-br from-yellow-500/10 to-amber-400/15 text-yellow-600 border-yellow-100"}`}>
                      {letter.status === "approved" ? <CheckCircle2 size={20} /> : letter.status === "rejected" ? <CircleAlert size={20} /> : <Clock3 size={20} />}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-black text-slate-800 leading-snug">{letter.jenis_surat || "Surat"}</h4>
                      <p className="text-xs text-slate-600 mt-1">User ID: {letter.user_id.slice(0, 8)}...</p>
                      {letter.admin_note && (
                        <p className="text-xs text-slate-500 mt-1 italic">Catatan: {letter.admin_note}</p>
                      )}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${letter.status === "approved" ? "bg-linear-to-r from-blue-500/10 to-cyan-400/15 text-blue-600 border border-blue-100" : letter.status === "rejected" ? "bg-linear-to-r from-red-500/10 to-rose-400/15 text-red-600 border border-red-100" : "bg-linear-to-r from-yellow-500/10 to-amber-400/15 text-yellow-600 border border-yellow-100"}`}>
                    {letter.status === "approved" ? "Disetujui" : letter.status === "rejected" ? "Ditolak" : "Pending"}
                  </span>
                </div>

                <div className="mt-4 flex gap-3">
                  <button onClick={() => setNotif(`Surat ${letter.jenis_surat} sedang ${letter.status}.`)} className="flex-1 rounded-2xl border border-blue-100 bg-linear-to-br from-white to-cyan-50/70 py-3 text-sm font-bold text-blue-600 transition-all hover:scale-[1.01] active:scale-95">
                    Lihat Ringkas
                  </button>
                  {letter.status === "pending" ? (
                    <button onClick={() => handleComplete(letter)} className="flex-1 rounded-2xl bg-linear-to-r from-blue-600 to-cyan-500 text-white py-3 text-sm font-bold shadow-xl shadow-blue-100 transition-all hover:scale-[1.01] active:scale-95">
                      Setujui
                    </button>
                  ) : (
                    <button onClick={() => setNotif("Surat ini sudah diproses.")} className="flex-1 rounded-2xl bg-linear-to-br from-blue-500/10 to-cyan-400/15 text-blue-600 border border-blue-100 py-3 text-sm font-bold transition-all hover:scale-[1.01] active:scale-95">
                      {letter.status === "approved" ? "Disetujui" : "Ditolak"}
                    </button>
                  )}
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
