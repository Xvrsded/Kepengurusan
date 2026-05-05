"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useAuthGuard } from "@/lib/useAuthGuard";
import BottomNav from "@/components/BottomNav";
import Notification from "@/components/Notification";
import { AdminStats } from "@/components/AdminStats";
import { AdminIuranAnalytics } from "@/components/AdminIuranAnalytics";
import { AdminLetterStats } from "@/components/AdminLetterStats";
import { AdminActivity } from "@/components/AdminActivity";
import { AdminInsight } from "@/components/AdminInsight";
import { Sparkles } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { createClient } from "@/lib/supabase/client";

export default function AdminDashboardPage() {
  useAuthGuard();
  const router = useRouter();
  const supabase = createClient();
  const fetchLetters = useAppStore((s) => s.fetchLetters);
  const fetchIuranPayments = useAppStore((s) => s.fetchIuranPayments);
  const fetchProfiles = useAppStore((s) => s.fetchProfiles);
  const fetchIuranTypes = useAppStore((s) => s.fetchIuranTypes);
  const fetchNotifications = useAppStore((s) => s.fetchNotifications);
  const fetchAllIuranUser = useAppStore((s) => s.fetchAllIuranUser);
  const fetchIuranMaster = useAppStore((s) => s.fetchIuranMaster);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchLetters();
    fetchIuranPayments();
    fetchProfiles();
    fetchIuranTypes();
    fetchNotifications();
    fetchAllIuranUser();
    fetchIuranMaster();
  }, [fetchLetters, fetchIuranPayments, fetchProfiles, fetchIuranTypes, fetchNotifications, fetchAllIuranUser, fetchIuranMaster]);

  // Realtime subscription for iuran data
  useEffect(() => {
    console.log("⚡ ADMIN DASHBOARD REALTIME INIT");

    const channel = supabase
      .channel("admin-dashboard-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "iuran_user",
        },
        (payload: any) => {
          console.log("💰 IURAN_USER CHANGE:", payload);
          fetchAllIuranUser();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "iuran_master",
        },
        (payload: any) => {
          console.log("💰 IURAN_MASTER CHANGE:", payload);
          fetchIuranMaster();
        }
      )
      .subscribe();

    return () => {
      console.log("🧹 ADMIN DASHBOARD REALTIME CLEANUP");
      supabase.removeChannel(channel);
    };
  }, [fetchAllIuranUser, fetchIuranMaster]);

  return (
    <div className="min-h-screen font-sans relative overflow-x-hidden pb-24">
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
            <div className="inline-flex items-center rounded-full border border-white/20 bg-[rgba(255,255,255,0.14)] px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-cyan-50 backdrop-blur-sm">
              <Sparkles size={12} className="mr-1.5" /> Dashboard Analitik RW
            </div>
            <h1 className="mt-3 text-[2rem] font-black tracking-tight leading-none">Dashboard Admin</h1>
            <p className="mt-3 max-w-80 text-sm leading-relaxed text-blue-50/92">Pantau aktivitas warga, status surat, dan progres iuran dalam satu tampilan yang lebih ringkas dan mudah diikuti.</p>
          </div>
        </div>

        {/* DASHBOARD CONTENT */}
        <div className="px-4 pt-4 flex flex-col gap-4 pb-3">
          {/* KPI CARDS */}
          <div className="animate-in fade-in duration-500" style={{ animationDelay: '100ms' }}>
            <AdminStats />
          </div>

          {/* IURAN ANALYTICS */}
          <div className="animate-in fade-in duration-500" style={{ animationDelay: '200ms' }}>
            <AdminIuranAnalytics />
          </div>

          {/* LETTER STATS */}
          <div className="animate-in fade-in duration-500" style={{ animationDelay: '300ms' }}>
            <AdminLetterStats />
          </div>

          {/* ACTIVITY */}
          <div className="animate-in fade-in duration-500" style={{ animationDelay: '400ms' }}>
            <AdminActivity />
          </div>

          {/* SMART INSIGHT */}
          <div className="animate-in fade-in duration-500" style={{ animationDelay: '500ms' }}>
            <AdminInsight />
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
