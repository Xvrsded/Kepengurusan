"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, FilePlus2, FileText, Search, Sparkles } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useAuthGuard } from "@/lib/useAuthGuard";
import type { Letter } from "@/store/useAppStore";

import { callGemini } from "@/lib/gemini";
import BottomNav from "@/components/BottomNav";
import Notification from "@/components/Notification";

const SURAT_TYPES = [
  "Surat Keterangan Domisili",
  "Surat Pengantar KTP",
  "Surat Keterangan Usaha",
  "Surat Keterangan Tidak Mampu",
  "Surat Pengantar SKCK",
];

const STATUS_LABEL: Record<Letter["status"], string> = {
  pending: "Pending",
  approved: "Disetujui",
  rejected: "Ditolak",
};

const STATUS_COLOR: Record<Letter["status"], string> = {
  pending: "bg-yellow-50 text-yellow-600",
  approved: "bg-emerald-50 text-emerald-600",
  rejected: "bg-rose-50 text-rose-600",
};

export default function WargaSuratPage() {
  useAuthGuard();
  const letters      = useAppStore((s) => s.letters);
  const setAiResult  = useAppStore((s) => s.setAiResult);
  const setNotif     = useAppStore((s) => s.setNotif);
  const aiResult     = useAppStore((s) => s.aiResult);
  const userProfile  = useAppStore((s) => s.userProfile);
  const requestLetter = useAppStore((s) => s.requestLetter);
  const fetchLetters = useAppStore((s) => s.fetchLetters);
  const fetchUserLetters = useAppStore((s) => s.fetchUserLetters);
  const loadingLetters = useAppStore((s) => s.loadingLetters);
  const supabaseUser = useAppStore((s) => s.supabaseUser);

  const [selectedType, setSelectedType] = useState(SURAT_TYPES[0]);
  const [loading, setLoading]           = useState(false);
  const [draft, setDraft]               = useState("");
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState<"Semua" | Letter["status"]>("Semua");

  useEffect(() => {
    if (supabaseUser?.id) {
      fetchUserLetters(supabaseUser.id);
    }
  }, [fetchUserLetters, supabaseUser?.id]);

  console.log("HOOK CHECK - WargaSuratPage hooks added back");
  console.log("SURAT DATA:", letters);

  const filteredLetters = useMemo(() => {
    return letters.filter((letter) => {
      const matchesSearch = `${letter.jenis_surat} ${letter.created_at}`.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "Semua" ? true : letter.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [letters, search, statusFilter]);

  const processCount = letters.filter((letter) => letter.status === "pending").length;
  const doneCount = letters.filter((letter) => letter.status === "approved").length;

  const handleRequestLetter = async () => {
    const result = await requestLetter(selectedType);
    setNotif({
      title: result.success ? "Pengajuan berhasil dikirim" : "Pengajuan belum berhasil",
      message: result.message,
      variant: result.success ? "success" : "warning",
      role: "warga",
    });
  };

  const handleDraft = async () => {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY ?? "";
    if (!apiKey) {
      setNotif("API Key Gemini belum diset di .env.local");
      return;
    }
    setLoading(true);
    setDraft("");
    try {
      const prompt =
        `Buatkan draft ${selectedType} untuk warga RT 001 RW 002. ` +
        `Gunakan bahasa formal dan singkat, maksimal 5 kalimat.`;
      const { text } = await callGemini(prompt, apiKey);
      setDraft(text);
      setAiResult(text);
    } catch {
      setNotif("Gagal menghubungi Gemini AI. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans max-w-md mx-auto relative shadow-2xl overflow-x-hidden pb-24">
      <Notification />
      <div style={{ display: loadingLetters ? 'block' : 'none' }} className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <span className="text-slate-500 font-bold">Memuat data surat...</span>
          <div className="h-8 w-8 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin" />
        </div>
      </div>
      <div style={{ display: !loadingLetters ? 'block' : 'none' }}>
        <div className="bg-linear-to-br from-indigo-600 via-blue-600 to-cyan-500 px-5 pt-9 pb-7 text-white relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute top-10 left-1/2 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-x-1/2" />
        <div className="absolute -bottom-8 left-0 w-28 h-28 bg-white/10 rounded-full blur-2xl" />
        <div className="relative z-10">
          <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-blue-50 backdrop-blur-sm shadow-sm">
            Layanan Warga
          </div>
          <h1 className="text-[2rem] font-black mt-3 tracking-tight leading-none">Pengajuan Surat</h1>
          <p className="text-blue-50/95 text-sm mt-3 leading-relaxed max-w-88">Ajukan surat secara mandiri, pantau prosesnya, dan siapkan draft resmi lebih cepat tanpa harus datang langsung.</p>
        </div>
      </div>
      <div className="px-4 pt-4 flex flex-col gap-4 pb-3">
        <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-500">
          <div className="w-full bg-white rounded-4xl p-4 border border-slate-100 shadow-lg shadow-slate-100/70">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-widest text-slate-400 font-black">Sedang Diproses</p>
                <p className="text-2xl font-black text-slate-900 mt-2">{processCount}</p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0"><Clock3 size={20} /></div>
            </div>
            <div className="mt-4 h-2 rounded-full bg-orange-50 overflow-hidden">
              <div className="h-full rounded-full bg-orange-500 transition-all duration-700" style={{ width: `${Math.min(processCount * 25, 100)}%` }} />
            </div>
          </div>
          <div className="w-full bg-white rounded-4xl p-4 border border-slate-100 shadow-lg shadow-slate-100/70">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-widest text-slate-400 font-black">Sudah Selesai</p>
                <p className="text-2xl font-black text-slate-900 mt-2">{doneCount}</p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"><CheckCircle2 size={20} /></div>
            </div>
            <div className="mt-4 h-2 rounded-full bg-emerald-50 overflow-hidden">
              <div className="h-full rounded-full bg-emerald-500 transition-all duration-700" style={{ width: `${Math.min(doneCount * 25, 100)}%` }} />
            </div>
          </div>
        </div>
        <div className="w-full bg-white rounded-4xl shadow-lg shadow-slate-100/70 overflow-hidden border border-slate-100 animate-in fade-in duration-500">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center"><FilePlus2 size={18} /></div>
            <div>
              <p className="font-black text-slate-800 text-sm">Ajukan Surat Baru</p>
              <p className="text-xs text-slate-500">Pilih jenis surat lalu kirim pengajuan Anda.</p>
            </div>
          </div>
          <div className="p-5 flex flex-col gap-4">
            <div className="rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3">
              <p className="text-[11px] uppercase tracking-widest font-bold text-slate-400 mb-2">Jenis Surat</p>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none"
              >
                {SURAT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <button onClick={handleRequestLetter} className="w-full py-4 rounded-2xl bg-blue-600 text-white text-sm font-black shadow-xl shadow-blue-100 transition-all duration-300 hover:scale-[1.01] active:scale-95">
              Kirim Pengajuan Surat
            </button>
          </div>
        </div>
        <div className="w-full bg-white rounded-4xl shadow-lg shadow-slate-100/70 overflow-hidden border border-slate-100 animate-in fade-in duration-500">
          <div className="px-5 py-4 border-b border-slate-100">
            <p className="font-bold text-slate-700 text-sm flex items-center gap-2"><Sparkles size={16} className="text-indigo-500" /> Buat Draft Surat dengan AI</p>
          </div>
          <div className="p-5 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500">Jenis Surat</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full border border-slate-200 rounded-2xl px-3 py-3 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                {SURAT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleDraft}
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Membuat draft..." : "✨ Generate Draft"}
            </button>
            {draft && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 animate-in fade-in duration-300">
                <p className="text-xs font-bold text-indigo-600 mb-1.5">Hasil Draft AI</p>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{draft}</p>
              </div>
            )}
            {!draft && aiResult && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <p className="text-xs font-bold text-slate-400 mb-1.5">Draft Sebelumnya</p>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{aiResult}</p>
              </div>
            )}
          </div>
        </div>
        <div className="w-full bg-white rounded-4xl shadow-lg shadow-slate-100/70 overflow-hidden border border-slate-100 animate-in fade-in duration-500">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
            <div>
              <p className="font-black text-slate-800 text-sm">Riwayat Surat Saya</p>
              <p className="text-xs text-slate-500 mt-1">Pantau status pengajuan Anda dengan lebih mudah.</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-500 flex items-center justify-center"><FileText size={18} /></div>
          </div>
          <div className="p-5 space-y-3 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <Search size={16} className="text-slate-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari jenis surat atau tanggal" className="w-full bg-transparent text-sm text-slate-700 outline-none" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(["Semua", "pending", "approved"] as const).map((status) => (
                <button key={status} onClick={() => setStatusFilter(status)} className={`px-4 py-2 rounded-full text-xs font-black transition-all ${statusFilter === status ? "bg-slate-900 text-white shadow" : "bg-white border border-slate-200 text-slate-500"}`}>
                  {status === "pending" ? "Pending" : status === "approved" ? "Disetujui" : status}
                </button>
              ))}
            </div>
          </div>
          {filteredLetters.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <div className="w-14 h-14 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3"><FileText size={22} /></div>
              <p className="text-sm font-bold text-slate-600">Belum ada surat yang sesuai</p>
              <p className="text-xs text-slate-400 mt-1">Coba ubah pencarian, filter, atau ajukan surat baru.</p>
            </div>
          ) : (
            <ul className="p-5 space-y-3">
              {filteredLetters.map((letter, index) => (
                <li key={letter.id} className="rounded-3xl border border-slate-100 bg-linear-to-br from-white to-slate-50/60 p-4 shadow-sm transition-all duration-300 hover:scale-[1.01] animate-in fade-in" style={{ animationDelay: `${index * 40}ms` }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${letter.status === "approved" ? "bg-emerald-50 text-emerald-600" : letter.status === "pending" ? "bg-yellow-50 text-yellow-600" : "bg-rose-50 text-rose-600"}`}>
                        {letter.status === "approved" ? <CheckCircle2 size={20} /> : letter.status === "pending" ? <Clock3 size={20} /> : <AlertCircle size={20} />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-slate-800 leading-snug">{letter.jenis_surat}</p>
                        <p className="text-xs text-slate-500 mt-1">Diajukan pada {new Date(letter.created_at).toLocaleDateString('id-ID')}</p>
                        {letter.admin_note && (
                          <p className="text-xs text-slate-400 mt-1 italic">Catatan: {letter.admin_note}</p>
                        )}
                        {letter.updated_at && letter.updated_at !== letter.created_at && (
                          <p className="text-[10px] text-slate-400 mt-1">Update: {new Date(letter.updated_at).toLocaleDateString('id-ID')}</p>
                        )}
                      </div>
                    </div>
                    <span className={`shrink-0 text-[10px] font-bold px-3 py-1 rounded-full ${STATUS_COLOR[letter.status]}`}>
                      {STATUS_LABEL[letter.status]}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      </div>
      <BottomNav />
    </div>
  );
}
