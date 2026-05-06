"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Wallet,
  User,
  QrCode,
  Bell,
  Vote,
  AlertTriangle,
  MessageSquare,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export default function BottomNav() {
  const pathname = usePathname();
  const router   = useRouter();
  const role     = useAppStore((s) => s.role);
  const unreadCount = useAppStore((s) => s.notifications.filter((notification) => !notification.isRead).length);
  const base     = role === "admin" ? "/admin" : "/warga";

  const suratLabel = role === "admin" ? "Data" : "Surat";

  const items = role === "admin"
    ? [
        { key: "home",    href: base,                  icon: LayoutDashboard, label: "Home"      },
        { key: "chat",    href: `${base}/chat`,        icon: MessageSquare,   label: "Chat"      },
        { key: "surat",   href: `${base}/surat`,       icon: FileText,        label: "Data"      },
        { key: "iuran",   href: `${base}/iuran`,       icon: Wallet,          label: "Iuran"     },
        { key: "profile", href: `${base}/profile`,     icon: User,           label: "Profil"    },
      ]
    : [
        { key: "home",    href: base,             icon: LayoutDashboard, label: "Home"      },
        { key: "chat",    href: `${base}/chat`,  icon: MessageSquare,   label: "Chat"      },
        { key: "surat",   href: `${base}/surat`,  icon: FileText,        label: suratLabel  },
        { key: "iuran",   href: `${base}/iuran`,  icon: Wallet,          label: "Iuran"     },
        { key: "profile", href: `${base}/profile`, icon: User,           label: "Profil"    },
      ];

  const [left, right] = [items.slice(0, 3), items.slice(3)];
  const centerActive = role === "warga" ? pathname === "/warga/notifikasi" : pathname === "/admin/panic";

  const NavItem = ({ href, icon: Icon, label, delay = 0 }: { href: string; icon: typeof LayoutDashboard; label: string; delay?: number }) => {
    const active = pathname === href;

    return (
      <button
        onClick={() => router.push(href)}
        className={`group relative flex min-w-16 flex-col items-center rounded-3xl px-3 py-2.5 transition-all duration-300 ease-out active:scale-95 ${active ? "-translate-y-1 text-blue-600" : "text-slate-400 hover:text-slate-600"}`}
        style={{ animationDelay: `${delay}ms` }}
      >
        <div className={`absolute left-1/2 top-1.5 h-1.5 -translate-x-1/2 rounded-full transition-all duration-300 ${active ? "w-10 bg-linear-to-r from-blue-500 to-cyan-400 opacity-100 shadow-sm" : "w-0 bg-transparent opacity-0"}`} />
        <div className={`absolute inset-x-1 bottom-1 h-9 rounded-2xl transition-all duration-300 ${active ? "bg-blue-50/80 opacity-100 blur-md" : "bg-transparent opacity-0"}`} />
        <div className={`relative flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-300 ease-out ${active ? "bg-blue-50 shadow-lg shadow-blue-100/80 ring-1 ring-blue-100 scale-105" : "bg-transparent group-hover:bg-slate-100/80"}`}>
          <div className={`absolute inset-0 rounded-2xl transition-all duration-500 ease-out ${active ? "scale-[1.12] opacity-100 bg-blue-100/50" : "scale-75 opacity-0 bg-transparent"}`} />
          <Icon size={22} strokeWidth={active ? 2.6 : 2.1} className={`relative z-10 transition-all duration-300 ease-out ${active ? "scale-[1.12] -translate-y-0.5" : "group-hover:scale-105"}`} />
        </div>
        <span className={`mt-1.5 text-[10px] font-black transition-all duration-300 ${active ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}`}>{label}</span>
      </button>
    );
  };

  console.log("HOOK CHECK - BottomNav hooks added back");

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="mx-auto max-w-md px-3 pb-3">
        <div className="relative rounded-4xl border border-white/50 bg-white/45 px-3 pt-3 pb-2 backdrop-blur-xl shadow-[0_-10px_30px_rgba(15,23,42,0.08)]">
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-white/80 to-transparent" />
          <div className="flex justify-between items-end">

            {left.map(({ key, href, icon: Icon, label }, index) => (
              <NavItem key={key} href={href} icon={Icon} label={label} delay={index * 60} />
            ))}

            <div className="relative -mt-9 flex min-w-16 flex-col items-center justify-end">
              <div className={`absolute top-1 h-16 w-16 rounded-3xl blur-xl transition-all duration-300 ${centerActive ? "bg-blue-200/60 scale-110" : "bg-blue-100/50"}`} />
              <button
                onClick={() => {
                  if (role === "warga") {
                    router.push("/warga/notifikasi");
                    return;
                  }
                  router.push("/admin/panic");
                }}
                className={`relative flex h-16 w-16 items-center justify-center rounded-3xl border-4 border-white/90 text-white shadow-2xl transition-all duration-300 ease-out active:scale-90 ${centerActive ? "bg-linear-to-br from-blue-700 to-cyan-500 shadow-blue-200 scale-105 -translate-y-1" : "bg-linear-to-br from-blue-600 to-cyan-500 shadow-blue-200 hover:scale-105"}`}
              >
                <div className="absolute inset-0 rounded-3xl bg-white/10 opacity-70" />
                <div className={`absolute inset-1 rounded-2xl transition-all duration-500 ease-out ${centerActive ? "bg-white/10 scale-110 opacity-100" : "bg-transparent scale-75 opacity-0"}`} />
                <div className={`absolute inset-x-3 top-2 h-2 rounded-full bg-white/30 blur-sm transition-opacity duration-300 ${centerActive ? "opacity-100" : "opacity-70"}`} />
                <div className={`relative z-10 transition-transform duration-300 ease-out ${centerActive ? "scale-[1.14] -translate-y-0.5" : "scale-100"}`}>
                  {role === "warga" ? <Bell size={24} /> : <AlertTriangle size={24} />}
                </div>
              </button>
              <span className={`mt-1.5 text-[10px] font-black transition-colors duration-300 ${centerActive ? "text-blue-600" : "text-slate-400"}`}>
                {role === "warga" ? "Notif" : "Alert"}
              </span>
              {role === "warga" && unreadCount > 0 ? (
                <>
                  <div className="absolute top-0 right-0 h-6 w-6 rounded-full bg-rose-400/60 blur-md animate-pulse" />
                  <div className="absolute top-0 right-0 min-w-6 h-6 px-1 rounded-full bg-linear-to-br from-rose-500 to-pink-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-lg shadow-rose-200 animate-in zoom-in duration-300">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </div>
                </>
              ) : null}
            </div>

            {right.map(({ key, href, icon: Icon, label }, index) => (
              <NavItem key={key} href={href} icon={Icon} label={label} delay={(index + 2) * 60} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
