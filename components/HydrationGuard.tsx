"use client";

import type { ReactNode } from "react";
import { useAppStore } from "@/store/useAppStore";

type HydrationGuardProps = {
  children: ReactNode;
};

export default function HydrationGuard({ children }: HydrationGuardProps) {
  const hasHydrated = useAppStore((s) => s.hasHydrated);

  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="w-full max-w-md bg-white rounded-4xl border border-slate-100 shadow-xl p-6 animate-pulse">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-slate-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded-full w-1/2" />
              <div className="h-3 bg-slate-100 rounded-full w-2/3" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-24 bg-slate-100 rounded-3xl" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-20 bg-slate-100 rounded-3xl" />
              <div className="h-20 bg-slate-100 rounded-3xl" />
            </div>
            <div className="h-28 bg-slate-100 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
