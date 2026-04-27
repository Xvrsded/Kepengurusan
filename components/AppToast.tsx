"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Info, ShieldCheck, TriangleAlert, User, X } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

const getToastMeta = (toast: NonNullable<ReturnType<typeof useAppStore.getState>["notifMessage"]>) => {
  const normalized = toast.message.toLowerCase();

  if (toast.variant === "success") {
    const isAdmin = toast.role === "admin";

    return {
      icon: isAdmin ? <ShieldCheck size={22} className="text-white" /> : <User size={22} className="text-white" />,
      iconWrapClassName: isAdmin ? "bg-emerald-600 shadow-emerald-200" : "bg-blue-600 shadow-blue-200",
      cardClassName: "border-slate-200 bg-white/95",
      title: toast.title ?? (isAdmin ? "Admin berhasil masuk" : "Berhasil masuk"),
      messageClassName: "text-slate-600",
      accentClassName: isAdmin ? "from-emerald-500 to-teal-500" : "from-blue-600 to-indigo-500",
      badge: isAdmin ? "Akses Pengurus" : "Akses Warga",
      progressClassName: isAdmin ? "bg-emerald-500" : "bg-blue-600",
    };
  }

  if (normalized.includes("berhasil") || normalized.includes("selamat datang")) {
    return {
      icon: <CheckCircle2 size={20} className="text-emerald-600" />,
      iconWrapClassName: "bg-emerald-100 shadow-emerald-100",
      cardClassName: "border-emerald-100 bg-white/95",
      title: toast.title ?? "Berhasil",
      messageClassName: "text-slate-700",
      accentClassName: "from-emerald-400 to-emerald-500",
      badge: "Aksi berhasil",
      progressClassName: "bg-emerald-500",
    };
  }

  if (normalized.includes("gagal") || normalized.includes("tidak") || normalized.includes("wajib") || normalized.includes("cocok") || normalized.includes("belum")) {
    return {
      icon: <TriangleAlert size={20} className="text-amber-700" />,
      iconWrapClassName: "bg-amber-100 shadow-amber-100",
      cardClassName: "border-amber-100 bg-white/95",
      title: toast.title ?? "Perhatian",
      messageClassName: "text-slate-700",
      accentClassName: "from-amber-400 to-orange-400",
      badge: "Perlu dicek",
      progressClassName: "bg-amber-500",
    };
  }

  return {
    icon: <Info size={20} className="text-blue-600" />,
    iconWrapClassName: "bg-blue-100 shadow-blue-100",
    cardClassName: "border-blue-100 bg-white/95",
    title: toast.title ?? "Informasi",
    messageClassName: "text-slate-700",
    accentClassName: "from-blue-400 to-indigo-400",
    badge: "Informasi sistem",
    progressClassName: "bg-blue-500",
  };
};

export default function AppToast() {
  const toast = useAppStore((s) => s.notifMessage);
  const showNotification = useAppStore((s) => s.showNotification);
  const clearNotif = useAppStore((s) => s.clearNotif);
  const currentRole = useAppStore((s) => s.role);
  const [renderToast, setRenderToast] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (!showNotification || !toast) return;

    setRenderToast(true);
    setIsLeaving(false);

    const visibleDuration = toast.variant === "success" ? 3200 : 3000;
    const leaveAt = window.setTimeout(() => {
      setIsLeaving(true);
    }, Math.max(visibleDuration - 260, 1200));

    const timeout = window.setTimeout(() => {
      clearNotif();
      setRenderToast(false);
      setIsLeaving(false);
    }, visibleDuration);

    return () => {
      window.clearTimeout(leaveAt);
      window.clearTimeout(timeout);
    };
  }, [clearNotif, showNotification, toast]);

  useEffect(() => {
    if (showNotification || !renderToast) return;

    const timeout = window.setTimeout(() => {
      setRenderToast(false);
      setIsLeaving(false);
    }, 260);

    return () => window.clearTimeout(timeout);
  }, [renderToast, showNotification]);

  if ((!showNotification && !renderToast) || !toast) {
    return null;
  }

  const meta = getToastMeta({ ...toast, role: toast.role ?? currentRole });
  const durationClassName = toast.variant === "success" ? "duration-[3200ms]" : "duration-[3000ms]";

  return (
    <div className="fixed inset-x-0 top-4 z-50 flex justify-center px-4 pointer-events-none">
      <div className={`pointer-events-auto relative overflow-hidden w-full max-w-md rounded-3xl border shadow-2xl backdrop-blur-sm transition-all duration-300 ${meta.cardClassName} ${isLeaving ? "-translate-y-2.5 opacity-0 scale-[0.98]" : "translate-y-0 opacity-100 scale-100"}`}>
        <div className={`h-1.5 w-full bg-linear-to-r ${meta.accentClassName}`} />
        <div className="flex items-start gap-3 p-4">
          <div className={`mt-0.5 shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg ${meta.iconWrapClassName}`}>{meta.icon}</div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-slate-900">{meta.title}</p>
            {meta.badge ? <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">{meta.badge}</p> : null}
            <p className={`text-sm leading-relaxed mt-1 ${meta.messageClassName}`}>{toast.message}</p>
          </div>
          <button onClick={clearNotif} className="w-8 h-8 rounded-full bg-white/80 border border-white/70 text-slate-500 flex items-center justify-center transition-colors hover:text-slate-900" aria-label="Tutup notifikasi">
            <X size={16} />
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100/80 overflow-hidden">
          <div className={`h-full origin-left scale-x-100 motion-safe:animate-[toast-progress_linear_forwards] ${durationClassName} ${meta.progressClassName}`} />
        </div>
      </div>
      <style>{`@keyframes toast-progress { from { transform: scaleX(1); } to { transform: scaleX(0); } }`}</style>
    </div>
  );
}
