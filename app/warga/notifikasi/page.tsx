"use client";

import { useMemo, useState } from "react";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
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

export default function WargaNotificationPage() {
  const notifications = useAppStore((s) => s.notifications);
  const markAsRead = useAppStore((s) => s.markAsRead);
  const markAllAsRead = useAppStore((s) => s.markAllAsRead);
  const clearNotifications = useAppStore((s) => s.clearNotifications);
  const [filter, setFilter] = useState<FilterType>("Semua");

  const filteredNotifications = useMemo(() => {
    if (filter === "Belum Dibaca") {
      return notifications.filter((notification) => !notification.isRead);
    }

    return notifications;
  }, [filter, notifications]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans max-w-md mx-auto relative shadow-2xl overflow-x-hidden pb-24 animate-in fade-in duration-500">
      <Notification />

      <div className="p-6 bg-white border-b border-slate-100">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Notifikasi</h1>
            <p className="text-xs text-slate-500 font-medium">Pantau update iuran, surat, dan info warga</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
            <Bell size={20} />
          </div>
        </div>

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

      <BottomNav />
    </div>
  );
}
