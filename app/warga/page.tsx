"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FileText, Wallet, QrCode, Vote, Sparkles, Volume2, Loader2, X, AlertTriangle, BellRing, CircleCheckBig, ChevronRight, MessageSquareWarning, Send, CalendarDays, Clock3 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { callGemini, playTTS } from "@/lib/gemini";
import BottomNav from "@/components/BottomNav";
import Notification from "@/components/Notification";

export default function WargaDashboardPage() {
  const router = useRouter();
  const citizens = useAppStore((s) => s.citizens);
  const iuran = useAppStore((s) => s.iuran);
  const aiResult = useAppStore((s) => s.aiResult);
  const setAiResult = useAppStore((s) => s.setAiResult);
  const setNotif = useAppStore((s) => s.setNotif);
  const isTtsLoading = useAppStore((s) => s.isTtsLoading);
  const setIsTtsLoading = useAppStore((s) => s.setIsTtsLoading);
  const isAiLoading = useAppStore((s) => s.isAiLoading);
  const setIsAiLoading = useAppStore((s) => s.setIsAiLoading);
  const [aiQuestion, setAiQuestion] = useState("");

  const warga = citizens[0];
  const latestIuran = iuran[0];
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY ?? "";
  const currentYear = new Date().getFullYear().toString();
  const totalIuranYear = useMemo(
    () => iuran.filter((item) => item.date.includes(currentYear)).reduce((sum, item) => sum + item.amount, 0),
    [currentYear, iuran]
  );
  const unpaidIuran = iuran.filter((item) => item.status === "Pending");
  const latestDoneLetter = useAppStore((s) => s.letters.find((letter) => letter.status === "Selesai"));

  const quickActions = [
    {
      label: "Ajukan Surat",
      icon: <FileText size={20} />,
      color: "bg-orange-50 text-orange-600",
      onClick: () => router.push("/warga/surat"),
    },
    {
      label: "Bayar Iuran",
      icon: <Wallet size={20} />,
      color: "bg-emerald-50 text-emerald-600",
      onClick: () => router.push("/warga/iuran"),
    },
    {
      label: "Lapor Masalah",
      icon: <MessageSquareWarning size={20} />,
      color: "bg-rose-50 text-rose-600",
      onClick: () => setNotif("Fitur laporan sedang dipersiapkan untuk warga."),
    },
    {
      label: "Scan QR",
      icon: <QrCode size={20} />,
      color: "bg-purple-50 text-purple-600",
      onClick: () => setNotif("Scanner QR akan segera tersedia."),
    },
  ];

  const agendaItems = [
    { title: "Kerja bakti lingkungan", date: "Minggu, 29 Okt 2025", time: "07.00 WIB" },
    { title: "Rapat warga bulanan", date: "Selasa, 31 Okt 2025", time: "19.30 WIB" },
  ];

  const handleTipsAI = async () => {
    if (!apiKey) {
      setNotif("API Key Gemini belum diset di .env.local");
      return;
    }
    setIsAiLoading(true);
    try {
      const { text } = await callGemini("Beri saya tips singkat hemat listrik.", apiKey);
      setAiResult(text);
    } catch {
      setNotif("AI Offline");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleTTS = async () => {
    if (!apiKey) {
      setNotif("API Key Gemini belum diset di .env.local");
      return;
    }
    setIsTtsLoading(true);
    try {
      await playTTS("Kerja Bakti Minggu Depan jam 7 pagi.", apiKey);
    } catch {
      setNotif("Gagal memutar suara AI");
    } finally {
      setIsTtsLoading(false);
    }
  };

  const handleAskAi = async () => {
    if (!aiQuestion.trim()) {
      setNotif("Isi pertanyaan untuk AI Assistant terlebih dahulu.");
      return;
    }
    if (!apiKey) {
      setNotif("API Key Gemini belum diset di .env.local");
      return;
    }
    setIsAiLoading(true);
    try {
      const { text } = await callGemini(aiQuestion, apiKey, "You are an RW digital assistant who answers clearly, briefly, and helpfully for residents.");
      setAiResult(text);
      setAiQuestion("");
    } catch {
      setNotif("AI Assistant sedang tidak tersedia.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans max-w-md mx-auto relative shadow-2xl overflow-x-hidden pb-24 animate-in fade-in duration-500">
      <Notification />

      <div className="px-6 pt-6 pb-4 bg-linear-to-b from-white via-white to-slate-50/80 border-b border-slate-100">
        <div className="rounded-4xl border border-slate-100 bg-linear-to-r from-white via-slate-50/70 to-blue-50/70 px-5 py-5 shadow-sm shadow-slate-100/80 relative overflow-hidden">
          <div className="absolute -top-8 -right-6 h-24 w-24 rounded-full bg-blue-100/60 blur-2xl" />
          <div className="absolute -bottom-10 left-10 h-20 w-20 rounded-full bg-indigo-100/50 blur-2xl" />
          <div className="relative z-10 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="inline-flex items-center rounded-full border border-blue-100 bg-white/80 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-blue-600 shadow-sm">
                Halo, Tetangga
              </div>
              <h2 className="mt-3 text-[1.75rem] leading-none font-black text-slate-900 tracking-tight">{warga?.name ?? "Warga"}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-500 max-w-56">Semoga harimu lancar. Cek informasi warga, iuran, dan layanan terbaru dari sini.</p>
            </div>
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-full bg-blue-200/70 blur-xl scale-110" />
              <div className="relative h-16 w-16 rounded-full bg-white border-4 border-white shadow-lg shadow-blue-100 overflow-hidden ring-1 ring-slate-100">
                <Image src="https://api.dicebear.com/7.x/avataaars/svg?seed=Budi" alt="avatar" fill unoptimized />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="bg-linear-to-br from-blue-600 to-indigo-700 rounded-4xl p-6 text-white shadow-xl shadow-blue-200 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-blue-100 text-sm font-medium">Status Iuran {latestIuran?.month ?? "Bulan Ini"}</p>
            <div className="flex items-center mt-1">
              <h3 className="text-3xl font-bold">{latestIuran?.status?.toUpperCase() ?? "LUNAS"}</h3>
              <div className="ml-3 px-2 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[10px] font-bold uppercase">ID: 88291</div>
            </div>
            <div className="mt-6 flex justify-between items-end">
              <div>
                <p className="text-blue-100 text-xs">Jatuh Tempo Berikutnya</p>
                <p className="font-semibold">05 Nov 2025</p>
              </div>
              <button onClick={handleTipsAI} className="bg-white text-blue-600 px-4 py-2 rounded-xl text-sm font-bold shadow-sm active:scale-95 flex items-center gap-2">
                Tips AI <Sparkles size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800">Aksi Cepat</h3>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Quick Action</span>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {quickActions.map((item) => (
            <div key={item.label} className="flex flex-col items-center">
              <button onClick={item.onClick} className={`${item.color} w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl border border-white/70 transition-all duration-300 hover:scale-105 active:scale-95`}>
                {item.icon}
              </button>
              <span className="text-[11px] font-bold text-slate-600 mt-2 text-center leading-tight">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 mb-8">
        <div className="bg-linear-to-br from-slate-900 via-slate-800 to-indigo-900 rounded-2xl p-5 text-white shadow-xl overflow-hidden relative">
          <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]" />
          <div className="relative z-10">
            <div className="flex items-start justify-between gap-3 mb-5">
              <div>
                <p className="text-[11px] uppercase tracking-widest text-slate-300 font-bold">Status Keuangan</p>
                <h3 className="text-xl font-black mt-1">Rp {totalIuranYear.toLocaleString("id-ID")}</h3>
                <p className="text-xs text-slate-300 mt-1">Total iuran tahun ini</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-[10px] font-bold backdrop-blur-md ${latestIuran?.status === "Lunas" ? "bg-emerald-500/20 text-emerald-200" : "bg-amber-500/20 text-amber-100"}`}>
                {latestIuran?.status === "Lunas" ? "Bulan ini lunas" : "Belum bayar"}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/10 p-4 border border-white/10 backdrop-blur-md">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-300 mb-1">Bulan berjalan</p>
                <p className="text-sm font-bold">{latestIuran?.month ?? "Belum tersedia"}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 border border-white/10 backdrop-blur-md">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-300 mb-1">Reminder</p>
                <p className="text-sm font-bold">{unpaidIuran.length > 0 ? `${unpaidIuran.length} iuran menunggu` : "Tidak ada tagihan"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 mb-8">
        <h3 className="font-bold text-slate-800 mb-4">Notifikasi Penting</h3>
        <div className="space-y-3">
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3 shadow-sm transition-all duration-300 hover:scale-[1.01]">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0"><AlertTriangle size={18} /></div>
            <div>
              <p className="text-sm font-bold text-amber-900">Iuran belum bayar</p>
              <p className="text-xs text-amber-700 mt-1">{unpaidIuran.length > 0 ? `Masih ada ${unpaidIuran.length} pembayaran yang perlu dituntaskan bulan ini.` : "Semua iuran kamu sudah aman."}</p>
            </div>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-start gap-3 shadow-sm transition-all duration-300 hover:scale-[1.01]">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"><CircleCheckBig size={18} /></div>
            <div>
              <p className="text-sm font-bold text-emerald-900">Surat selesai</p>
              <p className="text-xs text-emerald-700 mt-1">{latestDoneLetter ? `${latestDoneLetter.type} atas nama ${latestDoneLetter.applicant} sudah selesai diproses.` : "Belum ada surat selesai terbaru."}</p>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3 shadow-sm transition-all duration-300 hover:scale-[1.01]">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0"><BellRing size={18} /></div>
            <div>
              <p className="text-sm font-bold text-blue-900">Pengumuman penting</p>
              <p className="text-xs text-blue-700 mt-1">Akses gerbang utama akan dibatasi sementara saat kerja bakti berlangsung pada akhir pekan ini.</p>
            </div>
          </div>
        </div>
      </div>

      {aiResult && (
        <div className="px-6 mb-6">
          <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl relative overflow-hidden">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-1"><Sparkles size={12} /> AI Assistant</span>
              <button onClick={() => setAiResult("")} className="text-indigo-400"><X size={14} /></button>
            </div>
            <p className="text-xs text-indigo-800 leading-relaxed italic">&quot;{aiResult}&quot;</p>
          </div>
        </div>
      )}

      <div className="px-6 mb-8">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><Sparkles size={16} className="text-indigo-500" /> AI Assistant</h3>
            <button onClick={handleTipsAI} className="text-xs font-bold text-indigo-600">Coba tips</button>
          </div>
          <div className="flex gap-2">
            <input
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              placeholder="Tanya tentang RW…"
              className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:bg-white"
            />
            <button onClick={handleAskAi} disabled={isAiLoading} className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-60">
              {isAiLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
        </div>
      </div>

      <div className="px-6">
        <h3 className="font-bold text-slate-800 mb-4">Agenda Warga</h3>
        <div className="space-y-3 mb-8">
          {agendaItems.map((item) => (
            <div key={item.title} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex gap-4 transition-all duration-300 hover:scale-[1.01]">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                <CalendarDays size={22} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <p className="text-[10px] text-blue-600 font-bold uppercase">Agenda Warga</p>
                    <h4 className="text-sm font-bold text-slate-800 leading-tight mt-1">{item.title}</h4>
                  </div>
                  {item.title.includes("Kerja") ? (
                    <button disabled={isTtsLoading} onClick={handleTTS} className="p-1 text-slate-400 hover:text-blue-600 transition-colors">
                      {isTtsLoading ? <Loader2 size={16} className="animate-spin" /> : <Volume2 size={16} />}
                    </button>
                  ) : null}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                  <span className="flex items-center gap-1"><CalendarDays size={12} /> {item.date}</span>
                  <span className="flex items-center gap-1"><Clock3 size={12} /> {item.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-xl p-5 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 shadow-sm">
              <MessageSquareWarning size={22} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-widest text-rose-500 mb-1">Laporan Warga</p>
              <h4 className="text-base font-bold text-slate-800">Laporkan masalah lingkungan dengan cepat</h4>
              <p className="text-sm text-slate-500 mt-1">Kirim laporan soal lampu mati, saluran mampet, atau keamanan lingkungan langsung dari dashboard.</p>
              <button onClick={() => setNotif("Fitur laporan warga segera hadir.")} className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-slate-900 text-white px-4 py-3 text-sm font-bold shadow-xl transition-all duration-300 hover:scale-105 active:scale-95">
                Laporkan Masalah <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
