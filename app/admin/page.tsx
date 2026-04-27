"use client";

import { useMemo } from "react";
import { Users, FileText, Bell, Sparkles, Loader2, TrendingUp, CheckCircle2, Volume2, X, Wallet, Clock3, ChevronRight, CircleAlert, SendHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { callGemini, playTTS } from "@/lib/gemini";
import Notification from "@/components/Notification";
import BottomNav from "@/components/BottomNav";

export default function AdminDashboardPage() {
  const router = useRouter();
  const citizens = useAppStore((s) => s.citizens);
  const letters = useAppStore((s) => s.letters);
  const iuran = useAppStore((s) => s.iuran);
  const notifications = useAppStore((s) => s.notifications);
  const aiResult = useAppStore((s) => s.aiResult);
  const setAiResult = useAppStore((s) => s.setAiResult);
  const setNotif = useAppStore((s) => s.setNotif);
  const updateLetterStatus = useAppStore((s) => s.updateLetterStatus);
  const isAiLoading = useAppStore((s) => s.isAiLoading);
  const setIsAiLoading = useAppStore((s) => s.setIsAiLoading);
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY ?? "";

  const handleAiAnnouncement = async () => {
    if (!apiKey) {
      setNotif("API Key Gemini belum diset di .env.local");
      return;
    }
    setIsAiLoading(true);
    try {
      const { text } = await callGemini("Buat draf pengumuman formal kerja bakti minggu depan.", apiKey);
      setAiResult(text);
    } catch {
      setNotif("AI Offline");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleTTS = async () => {
    if (!apiKey || !aiResult) return;
    try {
      await playTTS(aiResult, apiKey);
    } catch {
      setNotif("Gagal memutar analisis AI");
    }
  };

  const sendWA = (phone: string, msg: string) => {
    setNotif(`WA dikirim ke ${phone}: ${msg}`);
  };

  const pendingLetters = useMemo(
    () => letters.filter((letter) => letter.status === "Proses"),
    [letters]
  );
  const completedLetters = useMemo(
    () => letters.filter((letter) => letter.status === "Selesai"),
    [letters]
  );
  const paidIuran = useMemo(
    () => iuran.filter((item) => item.status === "Lunas"),
    [iuran]
  );
  const pendingIuran = useMemo(
    () => iuran.filter((item) => item.status === "Pending"),
    [iuran]
  );
  const totalCollected = useMemo(
    () => paidIuran.reduce((sum, item) => sum + item.amount, 0),
    [paidIuran]
  );
  const collectionRate = iuran.length === 0 ? 0 : Math.round((paidIuran.length / iuran.length) * 100);
  const unreadNotifications = notifications.filter((notification) => !notification.isRead).length;
  const latestActivities = [
    pendingLetters[0]
      ? {
          title: pendingLetters[0].type,
          subtitle: `${pendingLetters[0].applicant} menunggu proses`,
          meta: pendingLetters[0].date,
        }
      : null,
    pendingIuran[0]
      ? {
          title: `Iuran ${pendingIuran[0].month}`,
          subtitle: `${pendingIuran.length} pembayaran belum lunas`,
          meta: `Rp ${pendingIuran[0].amount.toLocaleString("id-ID")}`,
        }
      : null,
    unreadNotifications > 0
      ? {
          title: "Notifikasi baru",
          subtitle: `${unreadNotifications} notifikasi perlu ditinjau`,
          meta: "Hari ini",
        }
      : null,
  ].filter(Boolean) as { title: string; subtitle: string; meta: string }[];

  return (
    <div className="min-h-screen bg-slate-50 font-sans max-w-md mx-auto relative shadow-2xl overflow-x-hidden pb-24 animate-in fade-in duration-500">
      <Notification />

      <div className="bg-linear-to-b from-cyan-500 via-blue-600 to-blue-700 text-white px-6 pt-7 pb-9 relative overflow-hidden">
        <div className="absolute -top-10 -right-8 h-28 w-28 rounded-full bg-cyan-200/35 blur-3xl" />
        <div className="absolute top-12 left-1/2 h-24 w-24 -translate-x-1/2 rounded-full bg-sky-200/20 blur-3xl" />
        <div className="absolute -bottom-10 left-0 h-24 w-24 rounded-full bg-cyan-100/20 blur-2xl" />
        <div className="absolute inset-0 bg-linear-to-br from-white/8 via-transparent to-blue-900/10" />
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="inline-flex items-center rounded-full border border-white/20 bg-white/14 px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-cyan-50 backdrop-blur-sm">
                Panel Pengurus
              </div>
              <h1 className="mt-3 text-[2rem] font-black tracking-tight leading-none">Dashboard Admin</h1>
              <p className="mt-3 max-w-80 text-sm leading-relaxed text-blue-50/92">Pantau aktivitas warga, status surat, dan progres iuran dalam satu tampilan yang lebih ringkas dan mudah diikuti.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={handleAiAnnouncement} className="h-11 w-11 rounded-2xl bg-white/14 text-white border border-white/20 shadow-lg backdrop-blur-sm transition-all hover:scale-105 active:scale-95">
                {isAiLoading ? <Loader2 size={18} className="animate-spin mx-auto" /> : <Sparkles size={18} className="mx-auto" />}
              </button>
              <button onClick={() => setNotif("Broadcast notifikasi siap dikirim")} className="h-11 w-11 rounded-2xl bg-white/14 text-white border border-white/20 shadow-lg backdrop-blur-sm transition-all hover:scale-105 active:scale-95">
                <Bell size={18} className="mx-auto" />
              </button>
            </div>
          </div>

          <div className="mt-6 rounded-4xl border border-white/20 bg-white/12 p-5 backdrop-blur-sm shadow-2xl shadow-blue-700/20">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-cyan-50/80">Ringkasan Kas & Layanan</p>
                <h2 className="mt-2 text-3xl font-black">Rp {totalCollected.toLocaleString("id-ID")}</h2>
                <p className="mt-2 text-sm text-blue-50/88">Dana iuran yang sudah masuk dari {paidIuran.length} pembayaran tercatat.</p>
              </div>
              <div className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/12 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-cyan-50">
                <TrendingUp size={12} /> {collectionRate}% tercapai
              </div>
            </div>
            <div className="mt-5 space-y-2 text-left">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-cyan-50/70">
                <span>Progres kolektif</span>
                <span>{collectionRate}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/18 overflow-hidden">
                <div className="h-full rounded-full bg-linear-to-r from-blue-400 via-cyan-300 to-blue-500 transition-all duration-1000" style={{ width: `${collectionRate}%` }} />
              </div>
            </div>

            <button
              onClick={() => router.push("/admin/panel")}
              className="mt-5 w-full rounded-3xl border border-white/20 bg-white/14 px-4 py-4 text-left shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] active:scale-95"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-cyan-50/75">Admin Panel Lengkap</p>
                  <p className="mt-2 text-sm font-black text-white">Buka pusat management, statistik, analisis, dan kontrol operasional admin.</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/12 text-white shrink-0">
                  <ChevronRight size={18} />
                </div>
              </div>
            </button>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-3xl border border-white/18 bg-white/10 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-cyan-50/70">Warga Aktif</p>
                <p className="mt-2 text-xl font-black">{citizens.length}</p>
              </div>
              <div className="rounded-3xl border border-white/18 bg-white/10 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-cyan-50/70">Surat Proses</p>
                <p className="mt-2 text-xl font-black">{pendingLetters.length}</p>
              </div>
              <div className="rounded-3xl border border-white/18 bg-white/10 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-cyan-50/70">Belum Lunas</p>
                <p className="mt-2 text-xl font-black">{pendingIuran.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-2 grid grid-cols-2 gap-4 pt-3 mb-8">
        {[
          { title: "Warga Terdata", value: citizens.length, subtitle: "Data penghuni aktif", icon: Users },
          { title: "Surat Selesai", value: completedLetters.length, subtitle: "Permintaan yang sudah ditutup", icon: CheckCircle2 },
          { title: "Notifikasi Baru", value: unreadNotifications, subtitle: "Butuh perhatian admin", icon: Bell },
          { title: "Iuran Masuk", value: `Rp ${(totalCollected / 1000).toFixed(0)}rb`, subtitle: "Akumulasi pembayaran warga", icon: Wallet },
        ].map(({ title, value, subtitle, icon: Icon }, index) => (
          <div key={title} className="rounded-4xl p-4 border border-blue-100/80 bg-linear-to-br from-white via-cyan-50/40 to-blue-50/70 shadow-xl shadow-blue-100/60 animate-in fade-in duration-500" style={{ animationDelay: `${index * 60}ms` }}>
            <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-blue-500/10 to-cyan-400/15 text-blue-600 border border-blue-100 flex items-center justify-center mb-4 shadow-sm shadow-blue-100/70"><Icon size={19} /></div>
            <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">{title}</p>
            <h3 className="mt-2 text-2xl font-black text-slate-900">{value}</h3>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed">{subtitle}</p>
          </div>
        ))}
      </div>

      {aiResult && (
        <div className="px-6 mb-8">
          <div className="bg-white rounded-4xl p-5 border border-blue-100 shadow-xl shadow-blue-100/50 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-black text-blue-600 tracking-tight flex items-center gap-2"><Sparkles size={14} /> AI INSIGHT</span>
              <button onClick={() => setAiResult("")} className="text-slate-300"><X size={16} /></button>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed mb-4 italic">{aiResult}</p>
            <button onClick={handleTTS} className="w-full py-3 bg-blue-50 text-blue-600 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95">
              <Volume2 size={16} /> Dengarkan Analisis
            </button>
          </div>
        </div>
      )}

      <div className="px-6 mb-8 space-y-4">
        <div className="bg-linear-to-br from-white via-cyan-50/20 to-blue-50/30 rounded-4xl border border-blue-100/70 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-blue-100/70 flex items-center justify-between gap-3">
            <div>
              <h3 className="font-black text-slate-900 text-sm">Fokus Hari Ini</h3>
              <p className="text-xs text-slate-600 mt-1">Ringkasan hal-hal yang paling perlu ditindaklanjuti pengurus.</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-blue-500/10 to-cyan-400/15 text-blue-600 border border-blue-100 flex items-center justify-center"><CircleAlert size={18} /></div>
          </div>
          <div className="p-5 grid gap-3">
            {latestActivities.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-blue-100 px-4 py-8 text-center bg-white/70">
                <p className="text-sm font-bold text-slate-600">Semua operasional terlihat aman</p>
                <p className="text-xs text-slate-500 mt-1">Belum ada aktivitas penting yang perlu ditindak lanjuti.</p>
              </div>
            ) : (
              latestActivities.map((activity, index) => (
                <div key={`${activity.title}-${index}`} className="rounded-3xl border border-blue-100/70 bg-white/80 px-4 py-4 flex items-start justify-between gap-3 animate-in fade-in duration-500 shadow-sm shadow-blue-50/60" style={{ animationDelay: `${index * 70}ms` }}>
                  <div>
                    <p className="text-sm font-black text-slate-800">{activity.title}</p>
                    <p className="text-xs text-slate-600 mt-1">{activity.subtitle}</p>
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-widest text-blue-500">{activity.meta}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-linear-to-br from-white via-cyan-50/20 to-blue-50/30 rounded-4xl border border-blue-100/70 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-blue-100/70 flex items-center justify-between gap-3">
            <div>
              <h3 className="font-black text-slate-900 text-sm">Tugas Prioritas</h3>
              <p className="text-xs text-slate-600 mt-1">Selesaikan surat aktif dan kirim konfirmasi ke warga lebih cepat.</p>
            </div>
            <button onClick={() => setNotif("Halaman surat siap dibuka untuk tindak lanjut lebih lengkap.")} className="inline-flex items-center gap-1 text-xs font-black text-blue-600 transition-all hover:gap-2">
              Lihat semua <ChevronRight size={14} />
            </button>
          </div>
          <div className="p-5 space-y-3">
            {pendingLetters.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-blue-100 px-4 py-8 text-center bg-white/70">
                <p className="text-sm font-bold text-slate-600">Tidak ada surat aktif saat ini</p>
                <p className="text-xs text-slate-500 mt-1">Semua pengajuan surat sudah selesai diproses.</p>
              </div>
            ) : (
              pendingLetters.map((letter, index) => (
                <div key={letter.id} className="bg-white/85 p-4 rounded-3xl border border-blue-100/70 flex items-center justify-between shadow-sm shadow-blue-50/60 transition-all duration-300 hover:scale-[1.01] animate-in fade-in" style={{ animationDelay: `${index * 40}ms` }}>
                  <div className="flex items-center gap-4 text-left min-w-0">
                    <div className="w-12 h-12 bg-linear-to-br from-blue-500/10 to-cyan-400/15 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100 shrink-0"><FileText size={20} /></div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-black text-slate-800 truncate">{letter.type}</h4>
                      <p className="text-[11px] text-slate-600 font-medium mt-1">{letter.applicant}</p>
                      <p className="text-[11px] text-blue-500 mt-1">Masuk {letter.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => sendWA("628987654321", `Surat ${letter.type} milik ${letter.applicant} sedang diproses.`)}
                      className="w-10 h-10 bg-linear-to-br from-blue-500/10 to-cyan-400/15 text-blue-600 rounded-2xl border border-blue-100 flex items-center justify-center transition-all hover:scale-105 active:scale-90"
                    >
                      <SendHorizontal size={16} />
                    </button>
                    <button
                      onClick={() => {
                        updateLetterStatus(letter.id, "Selesai");
                        sendWA("628987654321", `Surat ${letter.type} selesai!`);
                      }}
                      className="w-11 h-11 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100 flex items-center justify-center transition-all hover:scale-105 active:scale-90"
                    >
                      <CheckCircle2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-1">
          <div className="rounded-4xl bg-linear-to-br from-white via-cyan-50/30 to-blue-50/70 border border-blue-100/70 p-5 shadow-sm shadow-blue-100/50">
            <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-blue-500/10 to-cyan-400/15 text-blue-600 flex items-center justify-center mb-4 border border-blue-100"><Clock3 size={18} /></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">Surat Menunggu</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{pendingLetters.length}</p>
            <p className="mt-1 text-xs text-slate-600">Segera diproses hari ini</p>
          </div>
          <div className="rounded-4xl bg-linear-to-br from-white via-cyan-50/30 to-blue-50/70 border border-blue-100/70 p-5 shadow-sm shadow-blue-100/50">
            <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-blue-500/10 to-cyan-400/15 text-blue-600 flex items-center justify-center mb-4 border border-blue-100"><Wallet size={18} /></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">Iuran Pending</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{pendingIuran.length}</p>
            <p className="mt-1 text-xs text-slate-600">Warga perlu diingatkan</p>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
