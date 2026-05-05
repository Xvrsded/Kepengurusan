"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";

export default function DashboardPage() {
  const router = useRouter();
  const isLoggedIn = useAppStore((s) => s.isLoggedIn);
  const hasHydrated = useAppStore((s) => s.hasHydrated);
  const role = useAppStore((s) => s.role);
  
  console.log("HOOK CHECK - DashboardPage hooks added back");

  useEffect(() => {
    if (hasHydrated && !isLoggedIn) {
      router.replace("/login");
    }
  }, [isLoggedIn, hasHydrated, router]);

  useEffect(() => {
    if (hasHydrated && role === "admin") {
      router.replace("/admin");
    } else if (hasHydrated && role === "warga") {
      router.replace("/warga");
    }
  }, [role, hasHydrated, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div style={{ display: !hasHydrated ? 'block' : 'none' }} className="h-8 w-8 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin" />
      <div style={{ display: hasHydrated ? 'block' : 'none' }} className="text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Dashboard</h1>
        <p className="text-slate-600">Redirecting to appropriate dashboard...</p>
      </div>
    </div>
  );
}
