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

  if (!showNotification && !exiting) return null;

  return (
    <>
      <style>{`
        @keyframes notif-in {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to   { opacity: 1; transform: translate(-50%, 0);     }
        }
        @keyframes notif-out {
          from { opacity: 1; transform: translate(-50%, 0);     }
          to   { opacity: 0; transform: translate(-50%, -16px); }
        }
        @keyframes progress {
          from { width: 100%; }
          to   { width: 0%;   }
        }
        .notif-enter {
          animation: notif-in ${EXIT_MS}ms ease-out both;
        }
        .notif-exit {
          animation: notif-out ${EXIT_MS}ms ease-in both;
        }
        .notif-progress {
          animation: progress ${VISIBLE_MS}ms linear both;
        }
      `}</style>

      <div
        role="alert"
        className={`fixed top-6 left-1/2 -translate-x-1/2 z-100
          w-full max-w-md px-4
          ${exiting ? "notif-exit" : "notif-enter"}`}
      >
        <div className="relative overflow-hidden rounded-[1.75rem] border border-blue-100/80 bg-white/92 px-4 py-4 shadow-[0_18px_45px_rgba(37,99,235,0.18)] backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-cyan-300/80 to-transparent" />
          <div className="pointer-events-none absolute -right-8 top-0 h-20 w-20 rounded-full bg-cyan-200/50 blur-2xl" />
          <div className="pointer-events-none absolute -left-6 bottom-0 h-16 w-16 rounded-full bg-blue-200/40 blur-2xl" />

          <div className="relative flex items-start gap-3">
            <div className="mt-0.5 shrink-0 rounded-2xl border border-blue-100 bg-linear-to-br from-blue-500 to-cyan-400 p-2 text-white shadow-lg shadow-blue-100/80">
              <CheckCircle2 size={16} className="text-white" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-black uppercase tracking-widest text-blue-500">Notifikasi</p>
              <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-700">{notifMessage?.message ?? ""}</p>
            </div>

            <button
              onClick={dismiss}
              className="shrink-0 rounded-xl p-2 text-slate-400 transition-all hover:bg-blue-50 hover:text-blue-600 active:scale-90"
              aria-label="Tutup notifikasi"
            >
              <X size={16} />
            </button>
          </div>

          {/* Progress bar */}
          {!exiting && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-100/80 overflow-hidden">
              <div className="h-full bg-linear-to-r from-blue-500 via-cyan-400 to-blue-400 notif-progress" />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
