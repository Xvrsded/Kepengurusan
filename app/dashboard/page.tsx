"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useAuthGuard } from "@/lib/useAuthGuard";

export default function DashboardPage() {
  useAuthGuard();
  const router = useRouter();
  const isLoggedIn = useAppStore((s) => s.isLoggedIn);
  const role = useAppStore((s) => s.role);
  const hasHydrated = useAppStore((s) => s.hasHydrated);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!isLoggedIn) {
      router.replace("/login");
      return;
    }

    if (role === "admin") {
      router.replace("/admin");
    } else {
      router.replace("/warga");
    }
  }, [hasHydrated, isLoggedIn, role, router]);

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-bold text-slate-500">Memuat dashboard...</p>
      </div>
    </main>
  );
}
