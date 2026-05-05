"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useAuthGuard } from "@/lib/useAuthGuard";
import BottomNav from "@/components/BottomNav";
import Notification from "@/components/Notification";
import {
  FileText,
  Wallet,
  Bell,
  ShieldCheck,
  QrCode,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Calendar,
  Info,
  Sparkles,
  Vote,
} from "lucide-react";
import { Skeleton } from "@/components/Skeleton";
import Logo from "@/components/ui/Logo";
import { createClient } from "@/lib/supabase/client";

export default function WargaDashboardPage() {
  useAuthGuard();
  const router = useRouter();
  const supabase = createClient();
  
  const letters = useAppStore((s) => s.letters);
  const iuranUser = useAppStore((s) => s.iuranUser);
  const notifications = useAppStore((s) => s.notifications);
  const userProfile = useAppStore((s) => s.userProfile);
  const securitySettings = useAppStore((s) => s.securitySettings);
  const supabaseUser = useAppStore((s) => s.supabaseUser);
  const fetchLetters = useAppStore((s) => s.fetchLetters);
  const fetchUserIuran = useAppStore((s) => s.fetchUserIuran);
  const fetchNotifications = useAppStore((s) => s.fetchNotifications);
  const loadingLetters = useAppStore((s) => s.loadingLetters);
  const loadingIuranUser = useAppStore((s) => s.loadingIuranUser);
  const loadingNotifications = useAppStore((s) => s.loadingNotifications);
  const setNotif = useAppStore((s) => s.setNotif);

  const [mounted, setMounted] = useState(false);
  const [isVotingActive, setIsVotingActive] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchLetters();
    if (supabaseUser?.id) {
      fetchUserIuran(supabaseUser.id);
    }
    fetchNotifications();
    fetchVotingStatus();

    // Poll voting status every 3 seconds
    const intervalId = setInterval(() => {
      fetchVotingStatus();
    }, 3000);

    return () => clearInterval(intervalId);
  }, [fetchLetters, fetchUserIuran, fetchNotifications, supabaseUser?.id]);

  // Realtime subscription
  useEffect(() => {
    console.log("⚡ INIT REALTIME");

    const channel = supabase
      .channel("realtime-dashboard")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "letters",
        },
        (payload: any) => {
          console.log("📨 LETTER CHANGE:", payload);
          fetchLetters();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "iuran_user",
        },
        (payload: any) => {
          console.log("💰 IURAN CHANGE:", payload);
          if (supabaseUser?.id) {
            fetchUserIuran(supabaseUser.id);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "panic_alerts",
        },
        (payload: any) => {
          console.log("🚨 PANIC ALERT CHANGE:", payload);
          fetchNotifications();
        }
      )
      .subscribe((status: any) => {
        console.log("📣 SUBSCRIBED:", status);
      });

    return () => {
      console.log("🧹 CLEANUP REALTIME");
      supabase.removeChannel(channel);
    };
  }, [fetchLetters, fetchUserIuran, fetchNotifications, supabaseUser?.id]);

  const fetchVotingStatus = async () => {
    try {
      // KUNCI QUERY HANYA PADA ID = 1
      const { data, error } = await supabase
        .from('app_settings')
        .select('is_voting_active')
        .eq('id', 1)
        .single();

      if (error) {
        console.error("❌ Error Fetch Status:", error.message);
        return;
      }

      console.log("✅ DATA SAKLAR DITEMUKAN:", data);
      
      // Binding state
      if (data) {
        setIsVotingActive(data.is_voting_active === true || data.is_voting_active === 'true');
      }
    } catch (err) {
      console.error("❌ Catch Error:", err);
    }
  };

  // Dynamic greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Pagi";
    if (hour < 18) return "Siang";
    return "Malam";
  };

  const greeting = getGreeting();

  const myLetters = useMemo(
    () => letters.filter((letter) => letter.user_id === supabaseUser?.id),
    [letters, supabaseUser?.id]
  );

  const pendingLetters = myLetters.filter((letter) => letter.status === "pending");
  const completedLetters = myLetters.filter((letter) => letter.status === "approved");

  const myIuran = iuranUser;

  const paidIuran = myIuran.filter((iu: any) => iu.status === "paid");
  const pendingIuran = myIuran.filter((iu: any) => iu.status === "unpaid");

  const totalCollected = paidIuran.reduce((sum: number, iu: any) => sum + (iu.iuran_master?.amount || 0), 0);

  // Get last iuran
  const lastIuran = myIuran.length > 0 ? myIuran[0] : null;

  // Get last letter
  const lastLetter = myLetters.length > 0 ? myLetters[0] : null;

  // Get unread notifications
  const unreadNotifications = notifications.filter((n) => !n.isRead).length;

  // Get latest 3 notifications
  const latestNotifications = notifications.slice(0, 3);

  // Calculate compliance rate (progress iuran)
  const complianceRate = myIuran.length > 0
    ? Math.round((paidIuran.length / myIuran.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 font-sans max-w-md mx-auto relative shadow-2xl overflow-x-hidden pb-24">
      <Notification />
      <div style={{ display: !mounted ? 'block' : 'none' }} className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin" />
      </div>
      <div style={{ display: mounted ? 'block' : 'none' }}>
        {/* HERO SECTION */}
        <div className="bg-linear-to-br from-indigo-600 via-blue-600 to-cyan-500 px-5 pt-9 pb-7 text-white relative overflow-hidden animate-in fade-in duration-500">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute top-10 left-1/2 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-x-1/2" />
          <div className="absolute -bottom-8 left-0 w-28 h-28 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="flex justify-center mb-4">
              <Logo size="large" />
            </div>
            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-blue-50 backdrop-blur-sm shadow-sm">
              <Sparkles size={12} className="mr-1.5" /> Dashboard Warga
            </div>
            <h1 className="text-[2rem] font-black mt-3 tracking-tight leading-none">Selamat {greeting}, {userProfile.name || "Warga"}</h1>
            <p className="text-blue-50/95 text-sm mt-3 leading-relaxed max-w-88">Pantau status surat, iuran, dan notifikasi dalam satu tampilan yang mudah diakses.</p>
            
            {/* Iuran Status Badge */}
            <div className="mt-4 flex items-center gap-2">
              <div className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-black border backdrop-blur-sm ${
                pendingIuran.length === 0
                  ? "bg-green-400/20 border-green-300/30 text-green-50"
                  : "bg-amber-400/20 border-amber-300/30 text-amber-50"
              }`}>
                {pendingIuran.length === 0 ? (
                  <>
                    <CheckCircle2 size={12} className="mr-1.5" />
                    Iuran Lunas
                  </>
                ) : (
                  <>
                    <AlertCircle size={12} className="mr-1.5" />
                    {pendingIuran.length} Belum Bayar
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="px-4 pt-4 flex flex-col gap-4 pb-3">
          {/* QUICK STATS - 4 Cards */}
          <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-500" style={{ animationDelay: '100ms' }}>
            {loadingLetters ? (
              <>
                <Skeleton className="h-24 rounded-2xl" />
                <Skeleton className="h-24 rounded-2xl" />
                <Skeleton className="h-24 rounded-2xl" />
                <Skeleton className="h-24 rounded-2xl" />
              </>
            ) : (
              <>
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-lg shadow-slate-100/70 hover:scale-103 transition-transform duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <FileText size={18} className="text-blue-500" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Surat</span>
                  </div>
                  <p className="text-2xl font-black text-slate-900">{pendingLetters.length}</p>
                  <p className="text-[10px] text-slate-500 mt-1">Aktif</p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-lg shadow-slate-100/70 hover:scale-103 transition-transform duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <Wallet size={18} className="text-green-500" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Iuran</span>
                  </div>
                  <p className="text-2xl font-black text-slate-900">Rp {(totalCollected / 1000).toFixed(0)}rb</p>
                  <p className="text-[10px] text-slate-500 mt-1">Bulan Ini</p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-lg shadow-slate-100/70 hover:scale-103 transition-transform duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <Bell size={18} className="text-amber-500" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Notif</span>
                  </div>
                  <p className="text-2xl font-black text-slate-900">{unreadNotifications}</p>
                  <p className="text-[10px] text-slate-500 mt-1">Baru</p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-lg shadow-slate-100/70 hover:scale-103 transition-transform duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <ShieldCheck size={18} className="text-purple-500" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Aman</span>
                  </div>
                  <p className="text-2xl font-black text-slate-900">{securitySettings.appLockEnabled ? "ON" : "OFF"}</p>
                  <p className="text-[10px] text-slate-500 mt-1">Keamanan</p>
                </div>
              </>
            )}
          </div>

          {/* VOTING CARD */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-lg shadow-slate-100/70 hover:scale-[1.02] transition-transform duration-300 animate-in fade-in duration-500" style={{ animationDelay: '150ms' }}>
            <button
              onClick={() => router.push("/warga/voting")}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <Vote size={24} className="text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-800">Pemilihan RT/RW</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Pilih Ketua RT/RW</p>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                isVotingActive 
                  ? "bg-emerald-100 text-emerald-600" 
                  : "bg-amber-100 text-amber-600"
              }`}>
                {isVotingActive ? "Sedang Berlangsung" : "Belum Dimulai"}
              </div>
            </button>
          </div>

          {/* QUICK ACTIONS - 4 Buttons */}
          <div className="w-full bg-white rounded-4xl shadow-lg shadow-slate-100/70 overflow-hidden border border-slate-100 animate-in fade-in duration-500" style={{ animationDelay: '200ms' }}>
            <div className="px-5 py-4 border-b border-slate-100">
              <p className="font-black text-slate-800 text-sm">Aksi Cepat</p>
            </div>
            <div className="p-5 grid grid-cols-2 gap-3">
              <button
                onClick={() => router.push("/warga/surat")}
                className="p-4 rounded-2xl border border-slate-100 bg-linear-to-br from-blue-50 to-cyan-50 text-left hover:scale-[1.02] active:scale-95 transition-all duration-300"
              >
                <FileText size={24} className="text-blue-600 mb-2" />
                <p className="text-sm font-bold text-slate-800">Ajukan Surat</p>
              </button>
              <button
                onClick={() => router.push("/warga/iuran")}
                className="p-4 rounded-2xl border border-slate-100 bg-linear-to-br from-green-50 to-emerald-50 text-left hover:scale-[1.02] active:scale-95 transition-all duration-300"
              >
                <Wallet size={24} className="text-green-600 mb-2" />
                <p className="text-sm font-bold text-slate-800">Bayar Iuran</p>
              </button>
              <button
                onClick={() => router.push("/warga/notifikasi")}
                className="p-4 rounded-2xl border border-slate-100 bg-linear-to-br from-amber-50 to-yellow-50 text-left hover:scale-[1.02] active:scale-95 transition-all duration-300"
              >
                <Bell size={24} className="text-amber-600 mb-2" />
                <p className="text-sm font-bold text-slate-800">Notifikasi</p>
              </button>
              <button
                onClick={() => setNotif("Fitur QR Code akan segera tersedia.")}
                className="p-4 rounded-2xl border border-slate-100 bg-linear-to-br from-purple-50 to-pink-50 text-left hover:scale-[1.02] active:scale-95 transition-all duration-300"
              >
                <QrCode size={24} className="text-purple-600 mb-2" />
                <p className="text-sm font-bold text-slate-800">Scan QR</p>
              </button>
            </div>
          </div>

          {/* STATUS TERBARU */}
          <div className="bg-white rounded-4xl shadow-lg shadow-slate-100/70 overflow-hidden border border-slate-100 animate-in fade-in duration-500" style={{ animationDelay: '300ms' }}>
            <div className="px-5 py-4 border-b border-slate-100">
              <p className="font-black text-slate-800 text-sm">Status Terbaru</p>
            </div>
            <div className="p-5 space-y-3">
              {/* Last Letter Status */}
              {lastLetter ? (
                <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                      lastLetter.status === "approved" ? "bg-green-100" : lastLetter.status === "pending" ? "bg-yellow-100" : "bg-red-100"
                    }`}>
                      <FileText size={18} className={
                        lastLetter.status === "approved" ? "text-green-600" : lastLetter.status === "pending" ? "text-yellow-600" : "text-red-600"
                      } />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Surat Terakhir</p>
                      <p className="text-sm font-black text-slate-800">{lastLetter.jenis_surat}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    lastLetter.status === "approved" ? "bg-green-100 text-green-700" : lastLetter.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                  }`}>
                    {lastLetter.status}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-center p-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50">
                  <p className="text-xs text-slate-500">Belum ada surat</p>
                </div>
              )}

              {/* Last Iuran Status */}
              {myIuran.length > 0 ? (
                <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                      pendingIuran.length === 0 ? "bg-green-100" : "bg-amber-100"
                    }`}>
                      <Wallet size={18} className={pendingIuran.length === 0 ? "text-green-600" : "text-amber-600"} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Iuran Terakhir</p>
                      <p className="text-sm font-black text-slate-800">{lastIuran?.iuran_master?.title || "Iuran"}</p>
                      <p className="text-[10px] text-slate-500 mt-1">Rp {(lastIuran?.iuran_master?.amount || 0).toLocaleString("id-ID")}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    lastIuran?.status === "paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                  }`}>
                    {lastIuran?.status === "paid" ? "LUNAS" : "BELUM"}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-center p-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50">
                  <p className="text-xs text-slate-500">Belum ada iuran</p>
                </div>
              )}
            </div>
          </div>

          {/* NOTIFIKASI TERBARU */}
          <div className="bg-white rounded-4xl shadow-lg shadow-slate-100/70 overflow-hidden border border-slate-100 animate-in fade-in duration-500" style={{ animationDelay: '400ms' }}>
            <div className="px-5 py-4 border-b border-slate-100">
              <p className="font-black text-slate-800 text-sm">Notifikasi Terbaru</p>
            </div>
            <div className="p-5">
              {latestNotifications.length > 0 ? (
                <div className="space-y-3">
                  {latestNotifications.map((notif) => (
                    <div key={notif.id} className="w-full flex items-start gap-3 p-3 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        notif.type === "iuran" ? "bg-green-100" : notif.type === "surat" ? "bg-blue-100" : notif.type === "warning" ? "bg-amber-100" : "bg-slate-100"
                      }`}>
                        {notif.type === "iuran" ? <Wallet size={16} className="text-green-600" /> : notif.type === "surat" ? <FileText size={16} className="text-blue-600" /> : notif.type === "warning" ? <AlertCircle size={16} className="text-amber-600" /> : <Bell size={16} className="text-slate-600" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-black text-slate-800 truncate">{notif.title}</p>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{notif.message}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{new Date(notif.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-slate-200 bg-slate-50">
                  <Bell size={32} className="text-slate-300 mb-2" />
                  <p className="text-sm font-bold text-slate-500">Belum ada notifikasi</p>
                  <p className="text-xs text-slate-400 mt-1">Nanti akan muncul di sini</p>
                </div>
              )}
            </div>
          </div>

          {/* PENGUMUMAN RW */}
          <div className="bg-white rounded-4xl shadow-lg shadow-slate-100/70 overflow-hidden border border-slate-100 animate-in fade-in duration-500" style={{ animationDelay: '500ms' }}>
            <div className="px-5 py-4 border-b border-slate-100">
              <p className="font-black text-slate-800 text-sm">Pengumuman RW</p>
            </div>
            <div className="p-5">
              <div className="w-full flex items-start gap-3 p-4 rounded-2xl bg-linear-to-r from-blue-50 to-cyan-50 border border-blue-100">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                  <Info size={18} className="text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black text-slate-800">Rapat Warga Bulanan</p>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">Rapat warga akan diadakan pada tanggal 15 bulan ini di balai desa.</p>
                  <p className="text-[10px] text-slate-500 mt-2">10 April 2026</p>
                </div>
              </div>
            </div>
          </div>

          {/* PROGRESS IURAN */}
          <div className="bg-white rounded-4xl shadow-lg shadow-slate-100/70 overflow-hidden border border-slate-100 animate-in fade-in duration-500" style={{ animationDelay: '600ms' }}>
            <div className="px-5 py-4 border-b border-slate-100">
              <p className="font-black text-slate-800 text-sm">Progress Iuran</p>
            </div>
            <div className="p-5">
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kepatuhan Warga Bulan Ini</p>
                  <p className="text-lg font-black text-slate-800">{complianceRate}%</p>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      complianceRate >= 80 ? "bg-green-500" : complianceRate >= 50 ? "bg-amber-500" : "bg-red-500"
                    }`}
                    style={{ width: `${complianceRate}%` }}
                  />
                </div>
              </div>
              <p className="text-xs text-slate-500 text-center">
                {complianceRate >= 80 ? "Kepatuhan sangat baik!" : complianceRate >= 50 ? "Kepatuhan cukup baik" : "Perlu peningkatan kepatuhan"}
              </p>
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
