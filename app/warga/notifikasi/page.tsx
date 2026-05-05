"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useAuthGuard } from "@/lib/useAuthGuard";
import type { AppNotification } from "@/store/useAppStore";
import Notification from "@/components/Notification";
import BottomNav from "@/components/BottomNav";

type FilterType = "Semua" | "Belum Dibaca";

const TYPE_STYLES: Record<AppNotification["type"], string> = {
  iuran: "bg-amber-50 border-amber-100 text-amber-700",
  surat: "bg-emerald-50 border-emerald-100 text-emerald-700",
  info: "bg-blue-50 border-blue-100 text-blue-700",
  warning: "bg-rose-50 border-rose-100 text-rose-700",
};

export default function WargaNotifikasiPage() {
  useAuthGuard();
  const notifications = useAppStore((s) => s.notifications);
  const markAsRead = useAppStore((s) => s.markAsRead);
  const markAllAsRead = useAppStore((s) => s.markAllAsRead);
  const clearNotifications = useAppStore((s) => s.clearNotifications);
  const fetchNotifications = useAppStore((s) => s.fetchNotifications);
  const loadingNotifications = useAppStore((s) => s.loadingNotifications);
  const [filter, setFilter] = useState<FilterType>("Semua");

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filteredNotifications = useMemo(() => {
    if (filter === "Belum Dibaca") {
      return notifications.filter((notification) => !notification.isRead);
    }

    return notifications;
  }, [filter, notifications]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans max-w-md mx-auto relative shadow-2xl overflow-x-hidden pb-24 animate-in fade-in duration-500">
      <Notification />
      <div style={{ display: loadingNotifications ? 'block' : 'none' }} className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <span className="text-slate-500 font-bold">Memuat notifikasi...</span>
          <div className="h-8 w-8 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin" />
        </div>
      </div>
      <div style={{ display: !loadingNotifications ? 'block' : 'none' }}>
        <div className="bg-linear-to-br from-indigo-600 via-blue-600 to-cyan-500 px-5 pt-9 pb-7 text-white relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute top-10 left-1/2 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-x-1/2" />
          <div className="absolute -bottom-8 left-0 w-28 h-28 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-blue-50 backdrop-blur-sm shadow-sm">
              Notifikasi Warga
            </div>
            <h1 className="text-[2rem] font-black mt-3 tracking-tight leading-none">Pusat Notifikasi</h1>
            <p className="text-blue-50/95 text-sm mt-3 leading-relaxed max-w-88">Pantau semua update terkait surat, iuran, dan pengumuman penting dalam satu tempat.</p>
          </div>
        </div>
        <div className="px-4 pt-4 flex flex-col gap-4 pb-3">
          <div className="flex gap-2 mb-4">
            {(["Semua", "Belum Dibaca"] as FilterType[]).map((item) => {
              const active = filter === item;
              return (
                <button
                  key={item}
                  onClick={() => setFilter(item)}
                  className={`px-4 py-2 rounded-2xl text-sm font-bold transition-all ${active ? "bg-slate-900 text-white shadow-lg" : "bg-slate-100 text-slate-500 hover:scale-105 active:scale-95"}`}
                >
                  {item}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={markAllAsRead} className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 text-emerald-700 px-4 py-3 text-sm font-bold shadow-sm transition-all hover:scale-105 active:scale-95">
              <CheckCheck size={16} /> Tandai Dibaca
            </button>
            <button onClick={clearNotifications} className="flex items-center justify-center gap-2 rounded-2xl bg-rose-50 text-rose-600 px-4 py-3 text-sm font-bold shadow-sm transition-all hover:scale-105 active:scale-95">
              <Trash2 size={16} /> Hapus Semua
            </button>
          </div>
        </div>

        <div className="p-6 space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-8 text-center shadow-sm">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                <Bell size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-800">Belum ada notifikasi</h3>
              <p className="text-sm text-slate-500 mt-2">Update terbaru untuk warga akan muncul di sini secara otomatis.</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => markAsRead(notification.id)}
                className={`w-full text-left rounded-3xl border p-4 shadow-sm transition-all duration-300 hover:scale-[1.02] active:scale-95 ${TYPE_STYLES[notification.type]} ${notification.isRead ? "opacity-70" : "opacity-100"}`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="text-sm font-black">{notification.title}</p>
                    <p className="text-[11px] font-bold uppercase tracking-widest mt-1">{notification.type}</p>
                  </div>
                  {!notification.isRead ? <span className="px-2 py-1 rounded-full bg-white/80 text-[10px] font-black">Baru</span> : null}
                </div>
                <p className="text-sm leading-relaxed">{notification.message}</p>
                <p className="text-[11px] font-semibold mt-3 opacity-80">{notification.createdAt}</p>
              </button>
            ))
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
