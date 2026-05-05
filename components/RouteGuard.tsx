"use client";

import { usePathname } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

type RouteGuardProps = {
  allowedRole: "admin" | "warga";
  children: React.ReactNode;
};

export default function RouteGuard({ allowedRole, children }: RouteGuardProps) {
  const pathname = usePathname();
  const supabaseUser = useAppStore((s) => s.supabaseUser);
  const role = useAppStore((s) => s.role);
  const isAuthReady = useAppStore((s) => s.isAuthReady);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin" />
      </div>
    );
  }

  const shouldShowChildren = role === allowedRole && supabaseUser;
  const shouldShowError = !supabaseUser || role !== allowedRole;

  return (
    <>
      {shouldShowChildren && children}

      {shouldShowError && (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
          <div className="w-full max-w-md bg-white rounded-4xl border border-slate-100 shadow-xl p-6 text-center animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <ShieldAlert size={28} />
            </div>
            <h2 className="text-xl font-black text-slate-900">Akses Ditutup</h2>
            <p className="text-sm text-slate-500 mt-2">Halaman {pathname} hanya bisa dibuka oleh akun {allowedRole} yang sudah login.</p>
          </div>
        </div>
      )}
    </>
  );
}
