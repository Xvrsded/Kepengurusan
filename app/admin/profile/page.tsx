"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";
import { Bell, ChevronRight, LogOut, ShieldCheck, Users2, Wallet, FileText, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useAuthGuard } from "@/lib/useAuthGuard";
import BottomNav from "@/components/BottomNav";
import Notification from "@/components/Notification";

export default function AdminProfilePage() {
  useAuthGuard();
  const router = useRouter();
  const logout = useAppStore((s) => s.logout);
  const setNotif = useAppStore((s) => s.setNotif);
  const profiles = useAppStore((s) => s.profiles);
  const letters = useAppStore((s) => s.letters);
  const iuran = useAppStore((s) => s.iuran);
  const loadingProfiles = useAppStore((s) => s.loadingProfiles);
  const fetchProfiles = useAppStore((s) => s.fetchProfiles);
  useEffect(() => { fetchProfiles(); }, [fetchProfiles]);

  const adminData = useMemo(() => ({
    activeLetters: letters.filter((letter) => letter.status === "pending").length,
    paidIuran: iuran.filter((item) => item.status === "Lunas").length,
    totalCollected: iuran.filter((item) => item.status === "Lunas").reduce((sum, item) => sum + item.amount, 0),
  }), [letters, iuran]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen font-sans relative overflow-x-hidden pb-24">
      <Notification />
      <div style={{ display: loadingProfiles ? 'block' : 'none' }} className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <span className="text-slate-500 font-bold">Memuat data profil admin...</span>
          <div className="h-8 w-8 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin" />
        </div>
      </div>
      <div style={{ display: !loadingProfiles ? 'block' : 'none' }}>
        <div className="bg-linear-to-b from-cyan-500 via-blue-600 to-blue-700 text-white px-6 pt-7 pb-8 relative overflow-hidden animate-in fade-in duration-500">
          <div className="absolute -top-10 -right-8 h-28 w-28 rounded-full bg-cyan-200/35 blur-3xl" />
          <div className="absolute top-10 left-1/2 h-24 w-24 -translate-x-1/2 rounded-full bg-sky-200/20 blur-3xl" />
          <div className="absolute inset-0 bg-linear-to-br from-white/8 via-transparent to-blue-900/10" />
          <div className="relative z-10 text-center">
            <div className="relative mx-auto mt-5 h-24 w-24">
              <div className="absolute inset-0 rounded-full bg-cyan-200/40 blur-xl" />
              <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-white/90 shadow-2xl shadow-blue-800/25">
                <Image src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin" alt="profile" fill unoptimized />
              </div>
            </div>
            <h3 className="mt-4 text-2xl font-black tracking-tight">Ketua RW 04</h3>
            <p className="mt-2 text-sm text-blue-50/88">ID Pengurus: 001 • Pengelola layanan warga</p>

            <div className="mt-6 rounded-4xl border border-white/20 bg-[rgba(255,255,255,0.12)] p-5 backdrop-blur-sm shadow-2xl shadow-blue-700/20 text-left">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-cyan-50/80">Status Operasional</p>
                  <h2 className="mt-2 text-2xl font-black">Panel Admin Aktif</h2>
                  <p className="mt-2 text-sm text-blue-50/88">Kelola data warga, surat, dan iuran dari akun pengurus utama dengan tampilan yang lebih rapi.</p>
                </div>
                <div className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-[rgba(255,255,255,0.12)] px-3 py-1 text-[11px] font-black uppercase tracking-widest text-cyan-50">
                  <Sparkles size={12} /> Siap kerja
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <div className="rounded-3xl border border-white/18 bg-white/10 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-cyan-50/70">Warga</p>
                  <p className="mt-2 text-xl font-black">{profiles.length}</p>
                </div>
                <div className="rounded-3xl border border-white/18 bg-white/10 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-cyan-50/70">Surat</p>
                  <p className="mt-2 text-xl font-black">{adminData.activeLetters}</p>
                </div>
                <div className="rounded-3xl border border-white/18 bg-white/10 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-cyan-50/70">Iuran</p>
                  <p className="mt-2 text-xl font-black">{adminData.paidIuran}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4 -mt-2">
          <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-500">
            <div className="rounded-4xl p-4 border border-blue-100/80 bg-linear-to-br from-white via-cyan-50/40 to-blue-50/70 shadow-xl shadow-blue-100/60 text-left">
              <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-blue-500/10 to-cyan-400/15 text-blue-600 border border-blue-100 flex items-center justify-center mb-3"><Users2 size={18} /></div>
              <p className="text-[11px] text-blue-500 font-black uppercase tracking-widest">Warga Aktif</p>
              <h4 className="text-2xl font-black text-slate-800 mt-1">{profiles.length}</h4>
              <p className="text-xs text-slate-600 mt-1">Data warga yang saat ini tercatat.</p>
            </div>
            <div className="rounded-4xl p-4 border border-blue-100/80 bg-linear-to-br from-white via-cyan-50/40 to-blue-50/70 shadow-xl shadow-blue-100/60 text-left">
              <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-blue-500/10 to-cyan-400/15 text-blue-600 border border-blue-100 flex items-center justify-center mb-3"><Wallet size={18} /></div>
              <p className="text-[11px] text-blue-500 font-black uppercase tracking-widest">Kas Masuk</p>
              <h4 className="text-2xl font-black text-slate-800 mt-1">Rp {(adminData.totalCollected / 1000).toFixed(0)}rb</h4>
              <p className="text-xs text-slate-600 mt-1">Total iuran yang berhasil dikumpulkan.</p>
            </div>
          </div>

          <div className="rounded-4xl border border-blue-100/70 bg-linear-to-br from-white via-cyan-50/20 to-blue-50/30 shadow-sm overflow-hidden animate-in fade-in duration-500">
            <div className="p-4 border-b border-blue-100/70">
              <p className="text-sm font-black text-slate-800">Ringkasan Tanggung Jawab</p>
              <p className="text-xs text-slate-600 mt-1">Gambaran singkat area kerja utama pengurus.</p>
            </div>
            <div className="p-4 grid gap-3">
              <div className="rounded-3xl border border-blue-100/70 bg-white/80 px-4 py-4 shadow-sm shadow-blue-50/60">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-blue-500/10 to-cyan-400/15 text-blue-600 border border-blue-100 flex items-center justify-center"><FileText size={18} /></div>
                    <div>
                      <p className="text-sm font-black text-slate-800">Surat Aktif</p>
                      <p className="text-xs text-slate-600 mt-1">{adminData.activeLetters} surat masih perlu penyelesaian.</p>
                    </div>
                  </div>
                  <div className="rounded-full bg-linear-to-r from-blue-600 to-cyan-500 px-3 py-1 text-[11px] font-black text-white">Fokus</div>
                </div>
              </div>
              <div className="rounded-3xl border border-blue-100/70 bg-white/80 px-4 py-4 shadow-sm shadow-blue-50/60">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-blue-500/10 to-cyan-400/15 text-blue-600 border border-blue-100 flex items-center justify-center"><ShieldCheck size={18} /></div>
                    <div>
                      <p className="text-sm font-black text-slate-800">Akses Pengurus</p>
                      <p className="text-xs text-slate-600 mt-1">Akun ini punya akses pengelolaan data dan layanan warga.</p>
                    </div>
                  </div>
                  <div className="rounded-full bg-linear-to-r from-blue-500/10 to-cyan-400/15 border border-blue-100 px-3 py-1 text-[11px] font-black text-blue-600">Aman</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 text-left">
            <button onClick={() => setNotif("Pusat notifikasi admin akan segera hadir dengan kontrol yang lebih lengkap.")} className="w-full py-4 px-5 bg-white border border-blue-100/70 rounded-4xl flex items-center justify-between text-slate-700 font-semibold group transition-all duration-300 hover:scale-[1.01] active:scale-95 shadow-sm shadow-blue-50/70">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-blue-500/10 to-cyan-400/15 text-blue-600 border border-blue-100 flex items-center justify-center"><Bell size={18} /></div>
                <div className="text-left">
                  <p className="text-sm font-black text-slate-800">Notifikasi Admin</p>
                  <p className="text-xs text-slate-500 mt-1">Lihat pusat pemberitahuan dan update operasional.</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-blue-500 transition-transform group-hover:translate-x-1" />
            </button>

            <button onClick={() => setNotif("Pengaturan profil admin akan segera tersedia.")} className="w-full py-4 px-5 bg-white border border-blue-100/70 rounded-4xl flex items-center justify-between text-slate-700 font-semibold group transition-all duration-300 hover:scale-[1.01] active:scale-95 shadow-sm shadow-blue-50/70">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-blue-500/10 to-cyan-400/15 text-blue-600 border border-blue-100 flex items-center justify-center"><ShieldCheck size={18} /></div>
                <div className="text-left">
                  <p className="text-sm font-black text-slate-800">Pengaturan Akun</p>
                  <p className="text-xs text-slate-500 mt-1">Kelola preferensi akun dan keamanan pengurus.</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-blue-500 transition-transform group-hover:translate-x-1" />
            </button>

            <button onClick={handleLogout} className="w-full mt-6 py-4 px-6 bg-rose-50 text-rose-600 rounded-4xl flex items-center justify-center gap-3 font-bold border border-rose-100 shadow-sm transition-transform active:scale-95">
              <LogOut size={18} /> Keluar Aplikasi
            </button>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
