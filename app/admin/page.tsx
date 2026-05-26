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
import PingStatus from "@/components/PingStatus";

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

  // Realtime subscription (only letters, messages, panic_alerts as per requirements)
  useEffect(() => {
    console.log("⚡ ADMIN DASHBOARD REALTIME INIT");

    const channel = supabase
      .channel("admin-dashboard-realtime")
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
          table: "panic_alerts",
        },
        (payload: any) => {
          console.log("� PANIC ALERT CHANGE:", payload);
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      console.log("🧹 ADMIN DASHBOARD REALTIME CLEANUP");
      supabase.removeChannel(channel);
    };
  }, [fetchLetters, fetchNotifications]);

  return (
    <div className="min-h-screen font-sans relative overflow-x-hidden pb-24">
      <Notification />
      <div style={{ display: !mounted ? 'block' : 'none' }} className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin" />
      </div>
      <div style={{ display: mounted ? 'block' : 'none' }}>
        {/* HERO SECTION */}
        <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 px-5 pt-10 pb-8 text-white relative overflow-hidden">
          {/* Background gradient orbs */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute top-20 left-1/2 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-x-1/2" />
          <div className="absolute -bottom-10 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />

          {/* Status badge - positioned absolutely in top right without affecting layout */}
          <div className="absolute top-5 right-5 z-20">
            <PingStatus />
          </div>

          {/* Main content - centered flex-col */}
          <div className="relative z-10 flex flex-col items-center gap-4 max-w-md mx-auto">
            {/* Logo - truly centered */}
            <div className="flex justify-center">
              <Logo size="large" />
            </div>

            {/* Dashboard badge */}
            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-blue-50 backdrop-blur-sm shadow-sm">
              <Sparkles size={12} className="mr-1.5" /> Dashboard Analitik RW
            </div>

            {/* Heading - centered with max-width */}
            <div className="text-center max-w-sm">
              <h1 className="text-[2rem] font-black tracking-tight leading-none">Dashboard Admin</h1>
              <p className="text-blue-50/95 text-sm mt-3 leading-relaxed">Pantau aktivitas warga, status surat, dan progres iuran dalam satu tampilan yang lebih ringkas dan mudah diikuti.</p>
            </div>
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
