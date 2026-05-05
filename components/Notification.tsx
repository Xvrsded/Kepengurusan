"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

const VISIBLE_MS  = 3000;
const EXIT_MS     = 300;

export default function Notification() {
  const notifMessage     = useAppStore((s) => s.notifMessage);
  const showNotification = useAppStore((s) => s.showNotification);
  const clearNotif       = useAppStore((s) => s.clearNotif);

  const [exiting, setExiting] = useState(false);

  const dismiss = () => {
    setExiting(true);
    setTimeout(() => {
      clearNotif();
      setExiting(false);
    }, EXIT_MS);
  };

  useEffect(() => {
    if (!showNotification) return;
    setExiting(false);
    const hide  = setTimeout(() => dismiss(), VISIBLE_MS);
    return () => clearTimeout(hide);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showNotification, notifMessage]);

  const shouldDisplay = showNotification || exiting;
  
  console.log("HOOK CHECK - Notification hooks added back");

  if (!shouldDisplay) return null;

  return (
    <div className="fixed inset-x-0 top-4 z-50 flex justify-center px-4 pointer-events-none">
      <div className={`pointer-events-auto relative overflow-hidden w-full max-w-md rounded-3xl border shadow-2xl backdrop-blur-sm transition-all duration-300 animate-in slide-in-from-top-2 fade-in duration-300 ${exiting ? "-translate-y-2.5 opacity-0 scale-[0.98]" : "translate-y-0 opacity-100 scale-100"} bg-slate-900/95 border-slate-800 text-white`}>
        <div className="flex items-start gap-3 p-4">
          <div className="mt-0.5 shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg bg-emerald-500/20 text-emerald-400"><CheckCircle2 size={22} /></div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-white">{notifMessage?.title ?? "Notifikasi"}</p>
            <p className="text-sm leading-relaxed mt-1 text-slate-200">{notifMessage?.message ?? ""}</p>
          </div>
          <button onClick={dismiss} className="w-8 h-8 rounded-full bg-white/10 border border-white/10 text-slate-300 flex items-center justify-center transition-colors hover:text-white" aria-label="Tutup notifikasi">
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

