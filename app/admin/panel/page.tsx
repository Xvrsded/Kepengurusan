"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  CircleAlert,
  FileBarChart,
  FileText,
  LayoutDashboard,
  Sparkles,
  Users,
  Wallet,
  CheckCircle2,
  Clock3,
  TrendingUp,
  Search,
  BarChart3,
  X,
  PieChart,
  Activity,
  MapPin,
  CreditCard,
  AlertTriangle,
  Award,
  CalendarDays,
  BarChart,
  Mail,
  Inbox,
  History,
  Home,
  Receipt,
  Banknote,
  TrendingDown,
  UserCheck,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import Notification from "@/components/Notification";
import BottomNav from "@/components/BottomNav";

export default function AdminPanelPage() {
  const router = useRouter();
  const citizens = useAppStore((s) => s.citizens);
  const letters = useAppStore((s) => s.letters);
  const iuran = useAppStore((s) => s.iuran);
  const notifications = useAppStore((s) => s.notifications);
  const setNotif = useAppStore((s) => s.setNotif);

  const pendingLetters = useMemo(() => letters.filter((l) => l.status === "Proses"), [letters]);
  const completedLetters = useMemo(() => letters.filter((l) => l.status === "Selesai"), [letters]);
  const paidIuran = useMemo(() => iuran.filter((i) => i.status === "Lunas"), [iuran]);
  const pendingIuran = useMemo(() => iuran.filter((i) => i.status === "Pending"), [iuran]);
  const unreadNotifications = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);
  const totalCollected = useMemo(() => paidIuran.reduce((sum, i) => sum + i.amount, 0), [paidIuran]);
  const collectionRate = iuran.length === 0 ? 0 : Math.round((paidIuran.length / iuran.length) * 100);
  const completionRate = letters.length === 0 ? 0 : Math.round((completedLetters.length / letters.length) * 100);

  const topLetterTypes = useMemo(() => {
    return Object.entries(
      letters.reduce<Record<string, number>>((acc, l) => {
        acc[l.type] = (acc[l.type] ?? 0) + 1;
        return acc;
      }, {})
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [letters]);

  const monthlyIuranSummary = useMemo(() => {
    return Object.entries(
      iuran.reduce<Record<string, number>>((acc, i) => {
        acc[i.month] = (acc[i.month] ?? 0) + 1;
        return acc;
      }, {})
    )
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 5);
  }, [iuran]);

  const monthlyLetterCounts = useMemo(() => {
    const months = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
    return Object.entries(
      letters.reduce<Record<string, number>>((acc, l) => {
        try { const d = new Date(l.date); const k = `${months[d.getMonth()]} ${d.getFullYear()}`; acc[k] = (acc[k] ?? 0) + 1; } catch { acc["Lainnya"] = (acc["Lainnya"] ?? 0) + 1; }
        return acc;
      }, {})
    ).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [letters]);

  const monthlyIuranAmounts = useMemo(() => {
    return Object.entries(
      iuran.filter((i) => i.status === "Lunas").reduce<Record<string, number>>((acc, i) => {
        acc[i.month] = (acc[i.month] ?? 0) + i.amount;
        return acc;
      }, {})
    ).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 6);
  }, [iuran]);

  const recentLetters = useMemo(() => {
    return [...letters].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  }, [letters]);

  const topPendingCitizens = useMemo(() => {
    const counts = iuran.filter((i) => i.status === "Pending").reduce<Record<number, number>>((acc, i) => { acc[i.citizenId] = (acc[i.citizenId] ?? 0) + 1; return acc; }, {});
    return Object.entries(counts).map(([id, count]) => ({ citizen: citizens.find((c) => c.id === Number(id)), count })).filter((x) => x.citizen).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [iuran, citizens]);

  const latestNotifications = useMemo(() => {
    return [...notifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  }, [notifications]);

  const statusDistribution = useMemo(() => {
    return Object.entries(
      citizens.reduce<Record<string, number>>((acc, c) => { acc[c.status] = (acc[c.status] ?? 0) + 1; return acc; }, {})
    ).sort((a, b) => b[1] - a[1]);
  }, [citizens]);

  const letterVolumeByType = useMemo(() => {
    return Object.entries(
      letters.reduce<Record<string, number>>((acc, l) => { acc[l.type] = (acc[l.type] ?? 0) + 1; return acc; }, {})
    ).sort((a, b) => b[1] - a[1]);
  }, [letters]);

  const topPayingCitizens = useMemo(() => {
    const totals = iuran.filter((i) => i.status === "Lunas").reduce<Record<number, number>>((acc, i) => { acc[i.citizenId] = (acc[i.citizenId] ?? 0) + i.amount; return acc; }, {});
    return Object.entries(totals).map(([id, amount]) => ({ citizen: citizens.find((c) => c.id === Number(id)), amount })).filter((x) => x.citizen).sort((a, b) => b.amount - a.amount).slice(0, 5);
  }, [iuran, citizens]);

  const pendingIuranByMonth = useMemo(() => {
    return Object.entries(
      iuran.filter((i) => i.status === "Pending").reduce<Record<string, number>>((acc, i) => { acc[i.month] = (acc[i.month] ?? 0) + 1; return acc; }, {})
    ).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 6);
  }, [iuran]);

  const collectionEfficiencyByMonth = useMemo(() => {
    const allMonths = Array.from(new Set(iuran.map((i) => i.month)));
    return allMonths.map((month) => {
      const monthIuran = iuran.filter((i) => i.month === month);
      const paid = monthIuran.filter((i) => i.status === "Lunas").length;
      const total = monthIuran.length;
      return { month, paid, total, rate: total ? Math.round((paid / total) * 100) : 0 };
    }).sort((a, b) => b.month.localeCompare(a.month)).slice(0, 6);
  }, [iuran]);

  const averageIuranPerCitizen = useMemo(() => {
    if (citizens.length === 0) return 0;
    return Math.round(totalCollected / citizens.length);
  }, [totalCollected, citizens.length]);

  const notificationStats = useMemo(() => {
    const unread = notifications.filter((n) => !n.isRead).length;
    const read = notifications.filter((n) => n.isRead).length;
    return { unread, read, total: notifications.length };
  }, [notifications]);

  const letterStatusCounts = useMemo(() => {
    return [
      { label: "Selesai", count: completedLetters.length, color: "bg-blue-500", text: "text-blue-600", bg: "bg-blue-100" },
      { label: "Diproses", count: pendingLetters.length, color: "bg-cyan-400", text: "text-cyan-600", bg: "bg-cyan-100" },
    ];
  }, [completedLetters.length, pendingLetters.length]);

  const iuranStatusCounts = useMemo(() => {
    return [
      { label: "Lunas", count: paidIuran.length, color: "bg-blue-500", text: "text-blue-600", bg: "bg-blue-100" },
      { label: "Pending", count: pendingIuran.length, color: "bg-rose-400", text: "text-rose-600", bg: "bg-rose-100" },
    ];
  }, [paidIuran.length, pendingIuran.length]);

  const monthlyLetterTrends = useMemo(() => {
    const months = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
    return Object.entries(
      letters.reduce<Record<string, number>>((acc, l) => {
        try { const d = new Date(l.date); const k = `${months[d.getMonth()]} ${d.getFullYear()}`; acc[k] = (acc[k] ?? 0) + 1; } catch { acc["Lainnya"] = (acc["Lainnya"] ?? 0) + 1; }
        return acc;
      }, {})
    ).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 8);
  }, [letters]);

  const monthlyRevenueTrends = useMemo(() => {
    return Object.entries(
      iuran.filter((i) => i.status === "Lunas").reduce<Record<string, number>>((acc, i) => {
        acc[i.month] = (acc[i.month] ?? 0) + i.amount;
        return acc;
      }, {})
    ).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 8);
  }, [iuran]);

  const addressDistribution = useMemo(() => {
    return Object.entries(
      citizens.reduce<Record<string, number>>((acc, c) => {
        const prefix = c.address.split(" ")[0] || "Lainnya";
        acc[prefix] = (acc[prefix] ?? 0) + 1;
        return acc;
      }, {})
    ).sort((a, b) => b[1] - a[1]);
  }, [citizens]);

  const recentIuran = useMemo(() => {
    return [...iuran]
      .filter((i) => i.status === "Lunas" && i.date !== "-")
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [iuran]);

  const iuranVolumeByMonth = useMemo(() => {
    return Object.entries(
      iuran.reduce<Record<string, number>>((acc, i) => { acc[i.month] = (acc[i.month] ?? 0) + 1; return acc; }, {})
    ).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 6);
  }, [iuran]);

  const [activeTab, setActiveTab] = useState<"dashboard" | "warga" | "surat" | "iuran" | "analisis">("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCitizens = useMemo(() => {
    if (!searchQuery.trim()) return citizens;
    const q = searchQuery.toLowerCase();
    return citizens.filter((c) => c.name.toLowerCase().includes(q) || c.nik.includes(q) || c.address.toLowerCase().includes(q));
  }, [citizens, searchQuery]);

  const filteredLetters = useMemo(() => {
    if (!searchQuery.trim()) return letters;
    const q = searchQuery.toLowerCase();
    return letters.filter((l) => l.type.toLowerCase().includes(q) || l.applicant.toLowerCase().includes(q) || l.status.toLowerCase().includes(q));
  }, [letters, searchQuery]);

  const filteredIuran = useMemo(() => {
    if (!searchQuery.trim()) return iuran;
    const q = searchQuery.toLowerCase();
    return iuran.filter((i) => i.month.toLowerCase().includes(q) || i.status.toLowerCase().includes(q) || String(i.amount).includes(q));
  }, [iuran, searchQuery]);

  const overviewCards = [
    { title: "Warga Aktif", value: citizens.length, subtitle: "Penghuni terdaftar", icon: Users },
    { title: "Surat Selesai", value: completedLetters.length, subtitle: `${completionRate}% penyelesaian`, icon: CheckCircle2 },
    { title: "Dana Masuk", value: `Rp ${(totalCollected / 1000).toFixed(0)}rb`, subtitle: "Akumulasi iuran lunas", icon: Wallet },
    { title: "Pending", value: pendingLetters.length + pendingIuran.length, subtitle: "Butuh tindakan", icon: CircleAlert },
  ];

  const sidebarLinks = [
    { key: "dashboard" as const, title: "Dashboard", icon: LayoutDashboard },
    { key: "warga" as const, title: "Data Warga", icon: Users },
    { key: "surat" as const, title: "Data Surat", icon: FileText },
    { key: "iuran" as const, title: "Data Iuran", icon: Wallet },
    { key: "analisis" as const, title: "Analisis", icon: BarChart3 },
  ];

  const insights = [
    { title: "Surat perlu diprioritaskan", value: `${pendingLetters.length} item`, description: pendingLetters.length > 0 ? "Masih ada surat aktif yang perlu diselesaikan." : "Tidak ada antrean surat aktif.", icon: Clock3 },
    { title: "Progres iuran", value: `${collectionRate}%`, description: `${paidIuran.length} pembayaran lunas dari ${iuran.length} data iuran.`, icon: TrendingUp },
    { title: "Notifikasi baru", value: `${unreadNotifications} baru`, description: unreadNotifications > 0 ? "Ada pembaruan yang perlu dilihat." : "Semua notifikasi sudah terpantau.", icon: Bell },
  ];

  const quickActions = [
    { title: "Kelola Surat", description: "Tinjau pengajuan dan proses surat aktif.", icon: FileText, onClick: () => router.push("/admin/surat") },
    { title: "Kelola Iuran", description: "Pantau pembayaran dan ubah status.", icon: Wallet, onClick: () => router.push("/admin/iuran") },
    { title: "Profil Pengurus", description: "Buka akun admin dan pengaturan.", icon: Users, onClick: () => router.push("/admin/profile") },
  ];

  const showSearch = activeTab === "warga" || activeTab === "surat" || activeTab === "iuran";

  return (
    <div className="min-h-screen bg-slate-50 font-sans relative overflow-x-hidden animate-in fade-in duration-500">
      <Notification />

      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:flex fixed inset-y-0 left-0 z-30 flex-col border-r border-blue-100/80 bg-white/90 backdrop-blur-xl shadow-[20px_0_60px_rgba(59,130,246,0.08)] transition-all duration-300 ease-out ${sidebarOpen ? "w-72" : "w-20"}`}
      >
        <div
          className="flex h-full flex-col px-4 py-5 overflow-y-auto"
          style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(59,130,246,0.25) transparent" }}
        >
          {/* Toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="self-end mb-4 flex h-8 w-8 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 transition-all duration-200 hover:bg-blue-100 hover:scale-105 active:scale-95"
            title={sidebarOpen ? "Tutup sidebar" : "Buka sidebar"}
          >
            <ChevronRight size={16} className={`transition-transform duration-300 ${sidebarOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Header */}
          <div className={`rounded-4xl bg-linear-to-br from-cyan-500 via-blue-600 to-blue-700 text-white shadow-xl shadow-blue-200/50 transition-all duration-300 ${sidebarOpen ? "p-5" : "p-3"}`}>
            {sidebarOpen ? (
              <>
                <div className="inline-flex items-center rounded-full border border-white/20 bg-white/14 px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-cyan-50 backdrop-blur-sm">
                  Management Panel
                </div>
                <h2 className="mt-3 text-xl font-black tracking-tight">Pusat Panel</h2>
                <p className="mt-2 text-xs leading-relaxed text-blue-50/90">Panel terpisah untuk management data dan analisis.</p>
              </>
            ) : (
              <div className="flex justify-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/20 bg-white/14">
                  <LayoutDashboard size={18} />
                </div>
              </div>
            )}
          </div>

          {/* Nav Links */}
          <div className="mt-4 space-y-1.5">
            {sidebarLinks.map(({ key, title, icon: Icon }) => {
              const active = activeTab === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`w-full rounded-2xl py-3 text-left transition-all duration-200 flex items-center ${sidebarOpen ? "px-4 gap-3" : "justify-center px-2"} ${active ? "bg-linear-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-200/50" : "text-slate-600 hover:bg-blue-50/60"}`}
                  title={!sidebarOpen ? title : undefined}
                >
                  <Icon size={18} className={`shrink-0 transition-colors ${active ? "text-white" : "text-blue-500"}`} />
                  {sidebarOpen && (
                    <span className="text-sm font-black whitespace-nowrap overflow-hidden transition-all duration-300">{title}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          {sidebarOpen && (
            <div className="mt-auto rounded-4xl border border-blue-100/80 bg-white/80 p-4 shadow-sm shadow-blue-50/60 transition-all duration-300">
              <p className="text-sm font-black text-slate-800">Mode Management</p>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">Panel khusus pengelolaan data dan analisis.</p>
            </div>
          )}
        </div>
      </div>

      <div className={`transition-all duration-300 ease-out ${sidebarOpen ? "lg:pl-72" : "lg:pl-20"}`}>
        {/* Header */}
        <div className="bg-linear-to-b from-cyan-500 via-blue-600 to-blue-700 text-white relative overflow-hidden">
          <div className="absolute -top-10 -right-8 h-28 w-28 rounded-full bg-cyan-200/35 blur-3xl" />
          <div className="absolute top-12 left-1/2 h-24 w-24 -translate-x-1/2 rounded-full bg-sky-200/20 blur-3xl" />
          <div className="absolute inset-0 bg-linear-to-br from-white/8 via-transparent to-blue-900/10" />
          <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 pb-6 lg:pt-8 lg:pb-8">
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => router.push("/admin")}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/20 bg-white/14 text-white shadow-lg backdrop-blur-sm transition-all hover:scale-105 active:scale-95"
              >
                <ArrowLeft size={16} />
              </button>
              <div className="text-right">
                <div className="inline-flex items-center rounded-full border border-white/20 bg-white/14 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-cyan-50 backdrop-blur-sm">
                  Admin Panel
                </div>
                <h1 className="mt-2 text-xl lg:text-2xl font-black tracking-tight">Pusat Management</h1>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Tab Bar */}
        <div className="lg:hidden sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-blue-100/70 px-4 py-2 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {sidebarLinks.map(({ key, title, icon: Icon }) => {
              const active = activeTab === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-black transition-all duration-200 ${active ? "bg-linear-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-200/50" : "bg-slate-100 text-slate-600"}`}
                >
                  <Icon size={14} />
                  {title}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Bar (conditional) */}
        {showSearch && (
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" />
              <input
                type="text"
                placeholder={`Cari ${activeTab === "warga" ? "warga" : activeTab === "surat" ? "surat" : "iuran"}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-3xl border border-blue-100/80 bg-white/90 py-3 pl-11 pr-10 text-sm text-slate-800 shadow-sm shadow-blue-50/60 focus:outline-hidden focus:ring-2 focus:ring-blue-300/50 placeholder:text-slate-400"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 pb-8 space-y-4">

          {/* DASHBOARD TAB */}
          {activeTab === "dashboard" && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Overview Cards */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                {overviewCards.map(({ title, value, subtitle, icon: Icon }, index) => (
                  <div key={title} className="rounded-4xl p-4 border border-blue-100/80 bg-linear-to-br from-white via-cyan-50/40 to-blue-50/70 shadow-xl shadow-blue-100/60" style={{ animationDelay: `${index * 60}ms` }}>
                    <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-blue-500/10 to-cyan-400/15 text-blue-600 border border-blue-100 flex items-center justify-center mb-3 shadow-sm shadow-blue-100/70"><Icon size={17} /></div>
                    <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">{title}</p>
                    <h3 className="mt-1.5 text-xl font-black text-slate-900">{value}</h3>
                    <p className="mt-1 text-[11px] text-slate-600 leading-relaxed">{subtitle}</p>
                  </div>
                ))}
              </div>

              {/* Status Distribution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-4xl border border-blue-100/80 bg-white/80 shadow-sm shadow-blue-50/60 p-5">
                  <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest mb-4">Distribusi Status Surat</p>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1.5"><span className="font-black text-slate-800">Selesai</span><span className="font-black text-blue-600">{completedLetters.length}</span></div>
                      <div className="h-3 rounded-full bg-blue-100 overflow-hidden"><div className="h-full rounded-full bg-linear-to-r from-blue-500 to-cyan-400 transition-all" style={{ width: `${letters.length ? (completedLetters.length / letters.length) * 100 : 0}%` }} /></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1.5"><span className="font-black text-slate-800">Diproses</span><span className="font-black text-cyan-600">{pendingLetters.length}</span></div>
                      <div className="h-3 rounded-full bg-blue-100 overflow-hidden"><div className="h-full rounded-full bg-linear-to-r from-cyan-400 to-sky-400 transition-all" style={{ width: `${letters.length ? (pendingLetters.length / letters.length) * 100 : 0}%` }} /></div>
                    </div>
                  </div>
                </div>
                <div className="rounded-4xl border border-blue-100/80 bg-white/80 shadow-sm shadow-blue-50/60 p-5">
                  <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest mb-4">Distribusi Status Iuran</p>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1.5"><span className="font-black text-slate-800">Lunas</span><span className="font-black text-blue-600">{paidIuran.length}</span></div>
                      <div className="h-3 rounded-full bg-blue-100 overflow-hidden"><div className="h-full rounded-full bg-linear-to-r from-blue-500 to-cyan-400 transition-all" style={{ width: `${iuran.length ? (paidIuran.length / iuran.length) * 100 : 0}%` }} /></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1.5"><span className="font-black text-slate-800">Pending</span><span className="font-black text-rose-500">{pendingIuran.length}</span></div>
                      <div className="h-3 rounded-full bg-blue-100 overflow-hidden"><div className="h-full rounded-full bg-linear-to-r from-rose-400 to-pink-400 transition-all" style={{ width: `${iuran.length ? (pendingIuran.length / iuran.length) * 100 : 0}%` }} /></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Monthly Trends */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-4xl border border-blue-100/80 bg-white/80 shadow-sm shadow-blue-50/60 p-5">
                  <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest mb-4">Tren Surat per Bulan</p>
                  {monthlyLetterCounts.length === 0 ? (
                    <p className="text-xs text-slate-600 text-center py-4">Belum ada data</p>
                  ) : (
                    <div className="space-y-3">
                      {monthlyLetterCounts.map(([month, count]) => {
                        const max = Math.max(...monthlyLetterCounts.map((c) => c[1]));
                        return (
                          <div key={month}>
                            <div className="flex justify-between text-xs mb-1"><span className="text-slate-700 font-black">{month}</span><span className="text-blue-600 font-black">{count}</span></div>
                            <div className="h-2 rounded-full bg-blue-100 overflow-hidden"><div className="h-full rounded-full bg-blue-400 transition-all" style={{ width: `${max ? (count / max) * 100 : 0}%` }} /></div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className="rounded-4xl border border-blue-100/80 bg-white/80 shadow-sm shadow-blue-50/60 p-5">
                  <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest mb-4">Tren Iuran per Bulan (Rp)</p>
                  {monthlyIuranAmounts.length === 0 ? (
                    <p className="text-xs text-slate-600 text-center py-4">Belum ada data</p>
                  ) : (
                    <div className="space-y-3">
                      {monthlyIuranAmounts.map(([month, amount]) => {
                        const max = Math.max(...monthlyIuranAmounts.map((a) => a[1]));
                        return (
                          <div key={month}>
                            <div className="flex justify-between text-xs mb-1"><span className="text-slate-700 font-black">{month}</span><span className="text-blue-600 font-black">Rp {amount.toLocaleString("id-ID")}</span></div>
                            <div className="h-2 rounded-full bg-blue-100 overflow-hidden"><div className="h-full rounded-full bg-cyan-400 transition-all" style={{ width: `${max ? (amount / max) * 100 : 0}%` }} /></div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Activity + Notifications + Pending */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-start">
                <div className="rounded-4xl border border-blue-100/80 bg-white/80 shadow-sm shadow-blue-50/60 overflow-hidden">
                  <div className="px-5 py-4 border-b border-blue-100/70"><h3 className="font-black text-slate-900 text-sm lg:text-base">Aktivitas Terbaru</h3></div>
                  <div className="p-4 space-y-3">
                    {recentLetters.length === 0 ? (
                      <p className="text-xs text-slate-600 text-center py-4">Belum ada aktivitas</p>
                    ) : (
                      recentLetters.map((letter) => (
                        <div key={letter.id} className="flex items-start gap-3 rounded-2xl border border-blue-100/60 bg-blue-50/40 px-3 py-3">
                          <div className={`shrink-0 w-2 h-2 rounded-full mt-1.5 ${letter.status === "Selesai" ? "bg-blue-500" : "bg-cyan-400"}`} />
                          <div className="min-w-0">
                            <p className="text-sm font-black text-slate-800 truncate">{letter.type}</p>
                            <p className="text-xs text-slate-600">{letter.applicant} &middot; {letter.date}</p>
                            <span className={`inline-flex mt-1 rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${letter.status === "Selesai" ? "bg-blue-100 text-blue-600" : "bg-cyan-100 text-cyan-600"}`}>{letter.status}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-4xl border border-blue-100/80 bg-white/80 shadow-sm shadow-blue-50/60 overflow-hidden">
                  <div className="px-5 py-4 border-b border-blue-100/70 flex items-center justify-between">
                    <h3 className="font-black text-slate-900 text-sm lg:text-base">Notifikasi</h3>
                    {unreadNotifications > 0 && <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{unreadNotifications}</span>}
                  </div>
                  <div className="p-4 space-y-3">
                    {latestNotifications.length === 0 ? (
                      <p className="text-xs text-slate-600 text-center py-4">Tidak ada notifikasi</p>
                    ) : (
                      latestNotifications.map((notif) => (
                        <div key={notif.id} className={`flex items-start gap-3 rounded-2xl border px-3 py-3 ${notif.isRead ? "border-blue-50 bg-white/50" : "border-blue-100 bg-blue-50/60"}`}>
                          <div className={`shrink-0 w-2 h-2 rounded-full mt-1.5 ${notif.isRead ? "bg-slate-300" : "bg-blue-500"}`} />
                          <div className="min-w-0">
                            <p className="text-sm font-black text-slate-800">{notif.title}</p>
                            <p className="text-xs text-slate-600 mt-0.5">{notif.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-4xl border border-blue-100/80 bg-white/80 shadow-sm shadow-blue-50/60 overflow-hidden">
                  <div className="px-5 py-4 border-b border-blue-100/70"><h3 className="font-black text-slate-900 text-sm lg:text-base">Warga dengan Tagihan Pending</h3></div>
                  <div className="p-4 space-y-3">
                    {topPendingCitizens.length === 0 ? (
                      <p className="text-xs text-slate-600 text-center py-4">Tidak ada tagihan pending</p>
                    ) : (
                      topPendingCitizens.map(({ citizen, count }) => (
                        <div key={citizen!.id} className="flex items-center justify-between rounded-2xl border border-blue-100/60 bg-blue-50/40 px-3 py-3">
                          <div className="min-w-0">
                            <p className="text-sm font-black text-slate-800 truncate">{citizen!.name}</p>
                            <p className="text-xs text-slate-600">{citizen!.phone}</p>
                          </div>
                          <span className="shrink-0 bg-rose-100 text-rose-600 text-[10px] font-black px-2.5 py-1 rounded-full">{count} pending</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-linear-to-br from-white via-cyan-50/20 to-blue-50/30 rounded-4xl border border-blue-100/70 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-blue-100/70 flex items-center justify-between gap-3">
                  <div><h3 className="font-black text-slate-900 text-sm lg:text-base">Aksi Cepat</h3><p className="text-xs text-slate-600 mt-1">Langsung ke halaman pengelolaan.</p></div>
                  <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-blue-500/10 to-cyan-400/15 text-blue-600 border border-blue-100 flex items-center justify-center"><LayoutDashboard size={18} /></div>
                </div>
                <div className="p-5 grid gap-3 lg:grid-cols-3">
                  {quickActions.map(({ title, description, icon: Icon, onClick }) => (
                    <button key={title} onClick={onClick} className="rounded-3xl border border-blue-100/70 bg-white/85 px-4 py-4 text-left shadow-sm shadow-blue-50/60 transition-all hover:scale-[1.01] active:scale-95">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-blue-500/10 to-cyan-400/15 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0"><Icon size={17} /></div>
                        <div className="min-w-0"><p className="text-sm font-black text-slate-800">{title}</p><p className="text-xs text-slate-600 mt-0.5">{description}</p></div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Deep Analytics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="rounded-4xl border border-blue-100/80 bg-white/80 p-5 shadow-sm">
                  <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">Total Surat</p>
                  <p className="mt-2 text-3xl font-black text-slate-900">{letters.length}</p>
                  <p className="mt-1 text-xs text-slate-600">{completedLetters.length} selesai &middot; {pendingLetters.length} proses</p>
                </div>
                <div className="rounded-4xl border border-blue-100/80 bg-white/80 p-5 shadow-sm">
                  <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">Total Iuran</p>
                  <p className="mt-2 text-3xl font-black text-slate-900">{iuran.length}</p>
                  <p className="mt-1 text-xs text-slate-600">{paidIuran.length} lunas &middot; {pendingIuran.length} pending</p>
                </div>
                <div className="rounded-4xl border border-blue-100/80 bg-white/80 p-5 shadow-sm">
                  <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">Dana Terkumpul</p>
                  <p className="mt-2 text-3xl font-black text-slate-900">Rp {(totalCollected / 1000).toFixed(0)}rb</p>
                  <p className="mt-1 text-xs text-slate-600">Dari {paidIuran.length} pembayaran</p>
                </div>
                <div className="rounded-4xl border border-blue-100/80 bg-white/80 p-5 shadow-sm">
                  <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">Efisiensi</p>
                  <p className="mt-2 text-3xl font-black text-slate-900">{Math.round((completionRate + collectionRate) / 2)}%</p>
                  <p className="mt-1 text-xs text-slate-600">Rata-rata operasional</p>
                </div>
              </div>
            </div>
          )}

          {/* WARGA TAB */}
          {activeTab === "warga" && (
            <div className="animate-in fade-in duration-500 space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Data Warga & Analitik</h2>
                  <p className="text-xs text-slate-600 mt-1">Kelola dan pantau demografi serta distribusi warga.</p>
                </div>
                <div className="w-12 h-12 rounded-3xl bg-linear-to-br from-blue-500/10 to-cyan-400/15 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 shadow-sm shadow-blue-100/70">
                  <Users size={22} />
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: "Total Warga", value: citizens.length, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
                  { label: "Status Tetap", value: citizens.filter((c) => c.status === "Tetap").length, icon: UserCheck, color: "text-blue-600", bg: "bg-blue-50" },
                  { label: "Status Kontrak", value: citizens.filter((c) => c.status === "Kontrak").length, icon: Clock3, color: "text-cyan-600", bg: "bg-cyan-50" },
                  { label: "Area/Blok", value: addressDistribution.length, icon: MapPin, color: "text-blue-600", bg: "bg-blue-50" },
                ].map((card, i) => (
                  <div key={card.label} className="rounded-4xl border border-blue-100/80 bg-white/80 shadow-sm shadow-blue-50/60 p-4 transition-all hover:scale-[1.02] hover:shadow-md" style={{ animationDelay: `${i * 60}ms` }}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-8 h-8 rounded-2xl ${card.bg} border border-blue-100 flex items-center justify-center ${card.color}`}>
                        <card.icon size={15} />
                      </div>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider">{card.label}</p>
                    </div>
                    <p className={`text-2xl font-black ${card.color}`}>{card.value}</p>
                  </div>
                ))}
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status Distribution */}
                <div className="rounded-4xl border border-blue-100/80 bg-white/80 shadow-sm p-5 transition-all hover:shadow-md">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500"><PieChart size={15} /></div>
                    <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">Distribusi Status Kependudukan</p>
                  </div>
                  {statusDistribution.length === 0 ? (
                    <p className="text-xs text-slate-600 text-center py-8">Belum ada data</p>
                  ) : (
                    <div className="space-y-4">
                      {statusDistribution.map(([status, count], i) => {
                        const total = citizens.length;
                        const pct = total ? Math.round((count / total) * 100) : 0;
                        const barColors = ["bg-blue-500", "bg-cyan-400"];
                        return (
                          <div key={status}>
                            <div className="flex justify-between text-xs mb-1.5">
                              <span className="font-black text-slate-800">{status}</span>
                              <span className="font-black text-blue-600">{count} ({pct}%)</span>
                            </div>
                            <div className="h-4 rounded-xl bg-blue-100 overflow-hidden">
                              <div className={`h-full rounded-xl ${barColors[i % barColors.length]} transition-all duration-700`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div className="mt-4 flex gap-2 flex-wrap">
                    {statusDistribution.map(([status], i) => (
                      <span key={status} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black ${i === 0 ? "bg-blue-100 text-blue-600" : "bg-cyan-100 text-cyan-600"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${i === 0 ? "bg-blue-500" : "bg-cyan-400"}`} />
                        {status}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Address Distribution */}
                <div className="rounded-4xl border border-blue-100/80 bg-white/80 shadow-sm p-5 transition-all hover:shadow-md">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500"><Home size={15} /></div>
                    <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">Distribusi Area / Blok</p>
                  </div>
                  {addressDistribution.length === 0 ? (
                    <p className="text-xs text-slate-600 text-center py-8">Belum ada data</p>
                  ) : (
                    <div className="space-y-4">
                      {addressDistribution.map(([area, count], i) => {
                        const max = Math.max(...addressDistribution.map((c) => c[1]));
                        const pct = max ? Math.round((count / max) * 100) : 0;
                        const colors = ["bg-blue-500", "bg-cyan-400", "bg-sky-400", "bg-indigo-400", "bg-blue-300", "bg-cyan-300"];
                        return (
                          <div key={area}>
                            <div className="flex justify-between text-xs mb-1.5">
                              <span className="font-black text-slate-800">{area}</span>
                              <span className="font-black text-blue-600">{count}</span>
                            </div>
                            <div className="h-4 rounded-xl bg-blue-100 overflow-hidden">
                              <div className={`h-full rounded-xl ${colors[i % colors.length]} transition-all duration-700`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Data Table */}
              <div className="rounded-4xl border border-blue-100/80 bg-white/80 shadow-sm overflow-hidden transition-all hover:shadow-md">
                <div className="px-5 py-4 border-b border-blue-100/70 flex items-center justify-between">
                  <h3 className="font-black text-slate-900 text-sm lg:text-base">Tabel Data Warga</h3>
                  <span className="text-xs font-black text-blue-500 bg-blue-50 border border-blue-100 rounded-full px-3 py-1">{filteredCitizens.length} data</span>
                </div>
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full text-left bg-white/60">
                    <thead>
                      <tr className="border-b border-blue-100/70 bg-white/40 text-[11px] uppercase tracking-widest text-blue-500">
                        <th className="px-5 py-3 font-black">Nama</th>
                        <th className="px-5 py-3 font-black">NIK</th>
                        <th className="px-5 py-3 font-black">Alamat</th>
                        <th className="px-5 py-3 font-black">Telepon</th>
                        <th className="px-5 py-3 font-black">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCitizens.map((citizen, index) => (
                        <tr key={citizen.id} className={`border-b border-blue-50 transition-colors hover:bg-blue-50/30 ${index % 2 === 0 ? "bg-white/50" : "bg-cyan-50/20"}`}>
                          <td className="px-5 py-4 text-sm font-black text-slate-800">{citizen.name}</td>
                          <td className="px-5 py-4 text-xs text-slate-600">{citizen.nik}</td>
                          <td className="px-5 py-4 text-xs text-slate-600">{citizen.address}</td>
                          <td className="px-5 py-4 text-xs text-slate-600">{citizen.phone}</td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase ${citizen.status === "Tetap" ? "bg-blue-100 text-blue-600 border border-blue-100" : "bg-cyan-100 text-cyan-600 border border-cyan-100"}`}>
                              {citizen.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="md:hidden grid gap-3 p-4">
                  {filteredCitizens.map((citizen) => (
                    <div key={citizen.id} className="rounded-3xl border border-blue-100/70 bg-white/85 px-4 py-4 shadow-sm shadow-blue-50/60 transition-all hover:shadow-md">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-black text-slate-800">{citizen.name}</p>
                          <p className="mt-1 text-xs text-slate-600">{citizen.nik}</p>
                        </div>
                        <span className={`shrink-0 inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase ${citizen.status === "Tetap" ? "bg-blue-100 text-blue-600 border border-blue-100" : "bg-cyan-100 text-cyan-600 border border-cyan-100"}`}>
                          {citizen.status}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-slate-600">{citizen.address}</p>
                      <p className="mt-1 text-xs text-blue-500">{citizen.phone}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SURAT TAB */}
          {activeTab === "surat" && (
            <div className="animate-in fade-in duration-500 space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Data Surat & Grafik</h2>
                  <p className="text-xs text-slate-600 mt-1">Pantau pengajuan, proses, dan analisis surat warga.</p>
                </div>
                <div className="w-12 h-12 rounded-3xl bg-linear-to-br from-blue-500/10 to-cyan-400/15 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 shadow-sm shadow-blue-100/70">
                  <Mail size={22} />
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: "Total Surat", value: letters.length, icon: Inbox, color: "text-blue-600", bg: "bg-blue-50" },
                  { label: "Selesai", value: completedLetters.length, icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-50" },
                  { label: "Diproses", value: pendingLetters.length, icon: Clock3, color: "text-cyan-600", bg: "bg-cyan-50" },
                  { label: "Tingkat Selesai", value: `${completionRate}%`, icon: BarChart3, color: "text-blue-600", bg: "bg-blue-50" },
                ].map((card, i) => (
                  <div key={card.label} className="rounded-4xl border border-blue-100/80 bg-white/80 shadow-sm shadow-blue-50/60 p-4 transition-all hover:scale-[1.02] hover:shadow-md" style={{ animationDelay: `${i * 60}ms` }}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-8 h-8 rounded-2xl ${card.bg} border border-blue-100 flex items-center justify-center ${card.color}`}>
                        <card.icon size={15} />
                      </div>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider">{card.label}</p>
                    </div>
                    <p className={`text-2xl font-black ${card.color}`}>{card.value}</p>
                  </div>
                ))}
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Letter Type Chart */}
                <div className="rounded-4xl border border-blue-100/80 bg-white/80 shadow-sm p-5 transition-all hover:shadow-md">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500"><BarChart size={15} /></div>
                    <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">Distribusi Jenis Surat</p>
                  </div>
                  {letterVolumeByType.length === 0 ? (
                    <p className="text-xs text-slate-600 text-center py-8">Belum ada data</p>
                  ) : (
                    <div className="space-y-4">
                      {letterVolumeByType.map(([type, count], i) => {
                        const max = Math.max(...letterVolumeByType.map((c) => c[1]));
                        const pct = max ? Math.round((count / max) * 100) : 0;
                        const colors = ["bg-blue-500", "bg-cyan-400", "bg-sky-400", "bg-indigo-400", "bg-blue-300", "bg-cyan-300"];
                        return (
                          <div key={type}>
                            <div className="flex justify-between text-xs mb-1.5">
                              <span className="font-black text-slate-800">{type}</span>
                              <span className="font-black text-blue-600">{count}</span>
                            </div>
                            <div className="h-4 rounded-xl bg-blue-100 overflow-hidden">
                              <div className={`h-full rounded-xl ${colors[i % colors.length]} transition-all duration-700`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Monthly Trend SVG Chart */}
                <div className="rounded-4xl border border-blue-100/80 bg-white/80 shadow-sm p-5 transition-all hover:shadow-md">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500"><TrendingUp size={15} /></div>
                    <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">Tren Bulanan</p>
                  </div>
                  {monthlyLetterTrends.length === 0 ? (
                    <p className="text-xs text-slate-600 text-center py-8">Belum ada data</p>
                  ) : (
                    <div className="flex flex-col h-48">
                      <div className="flex-1 flex items-end gap-3 px-2">
                        {monthlyLetterTrends.map(([month, count]) => {
                          const max = Math.max(...monthlyLetterTrends.map((c) => c[1]));
                          const h = max ? (count / max) * 100 : 0;
                          return (
                            <div key={month} className="flex-1 flex flex-col items-center gap-2 group">
                              <div className="relative w-full flex items-end h-32">
                                <div
                                  className="w-full bg-linear-to-t from-blue-500 to-cyan-400 rounded-t-lg transition-all duration-700 opacity-90 group-hover:opacity-100"
                                  style={{ height: `${h}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-black text-slate-600 text-center leading-tight">{month}</span>
                              <span className="text-[10px] font-black text-blue-600">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="rounded-4xl border border-blue-100/80 bg-white/80 shadow-sm overflow-hidden transition-all hover:shadow-md">
                <div className="px-5 py-4 border-b border-blue-100/70 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500"><History size={15} /></div>
                  <h3 className="font-black text-slate-900 text-sm lg:text-base">Aktivitas Surat Terbaru</h3>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {recentLetters.length === 0 ? (
                    <p className="text-xs text-slate-600 text-center py-4 col-span-full">Belum ada aktivitas</p>
                  ) : (
                    recentLetters.map((letter, i) => (
                      <div key={letter.id} className="flex items-start gap-3 rounded-2xl border border-blue-100/60 bg-blue-50/40 px-3 py-3 transition-all hover:bg-blue-50/70" style={{ animationDelay: `${i * 80}ms` }}>
                        <div className={`shrink-0 w-2.5 h-2.5 rounded-full mt-1.5 ${letter.status === "Selesai" ? "bg-blue-500" : "bg-cyan-400"}`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-black text-slate-800 truncate">{letter.type}</p>
                          <p className="text-xs text-slate-600">{letter.applicant}</p>
                          <p className="text-[10px] text-blue-500 mt-0.5">{letter.date}</p>
                        </div>
                        <span className={`shrink-0 inline-flex rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${letter.status === "Selesai" ? "bg-blue-100 text-blue-600" : "bg-cyan-100 text-cyan-600"}`}>{letter.status}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Data Table */}
              <div className="rounded-4xl border border-blue-100/80 bg-white/80 shadow-sm overflow-hidden transition-all hover:shadow-md">
                <div className="px-5 py-4 border-b border-blue-100/70 flex items-center justify-between">
                  <h3 className="font-black text-slate-900 text-sm lg:text-base">Tabel Data Surat</h3>
                  <span className="text-xs font-black text-blue-500 bg-blue-50 border border-blue-100 rounded-full px-3 py-1">{filteredLetters.length} data</span>
                </div>
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full text-left bg-white/60">
                    <thead>
                      <tr className="border-b border-blue-100/70 bg-white/40 text-[11px] uppercase tracking-widest text-blue-500">
                        <th className="px-5 py-3 font-black">Jenis</th>
                        <th className="px-5 py-3 font-black">Pemohon</th>
                        <th className="px-5 py-3 font-black">Tanggal</th>
                        <th className="px-5 py-3 font-black">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLetters.map((letter, index) => (
                        <tr key={letter.id} className={`border-b border-blue-50 transition-colors hover:bg-blue-50/30 ${index % 2 === 0 ? "bg-white/50" : "bg-cyan-50/20"}`}>
                          <td className="px-5 py-4 text-sm font-black text-slate-800">{letter.type}</td>
                          <td className="px-5 py-4 text-xs text-slate-600">{letter.applicant}</td>
                          <td className="px-5 py-4 text-xs text-slate-600">{letter.date}</td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase ${letter.status === "Selesai" ? "bg-linear-to-r from-blue-500/10 to-cyan-400/15 text-blue-600 border border-blue-100" : "bg-linear-to-r from-blue-600 to-cyan-500 text-white"}`}>
                              {letter.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="md:hidden grid gap-3 p-4">
                  {filteredLetters.map((letter) => (
                    <div key={letter.id} className="rounded-3xl border border-blue-100/70 bg-white/85 px-4 py-4 shadow-sm shadow-blue-50/60 transition-all hover:shadow-md">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-black text-slate-800">{letter.type}</p>
                          <p className="mt-1 text-xs text-slate-600">{letter.applicant}</p>
                        </div>
                        <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase ${letter.status === "Selesai" ? "bg-linear-to-r from-blue-500/10 to-cyan-400/15 text-blue-600 border border-blue-100" : "bg-linear-to-r from-blue-600 to-cyan-500 text-white"}`}>
                          {letter.status}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-blue-500">{letter.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* IURAN TAB */}
          {/* IURAN TAB */}
          {activeTab === "iuran" && (
            <div className="animate-in fade-in duration-500 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div><h2 className="text-xl font-black text-slate-900 tracking-tight">Data Iuran & Keuangan</h2><p className="text-xs text-slate-600 mt-1">Pantau pembayaran, kolektibilitas, dan tren pendapatan.</p></div>
                <div className="w-12 h-12 rounded-3xl bg-linear-to-br from-blue-500/10 to-cyan-400/15 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 shadow-sm"><Wallet size={22} /></div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                {[
                  { label: "Total Tagihan", value: iuran.length, icon: Receipt, color: "text-blue-600", bg: "bg-blue-50" },
                  { label: "Lunas", value: paidIuran.length, icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-50" },
                  { label: "Pending", value: pendingIuran.length, icon: AlertTriangle, color: "text-rose-500", bg: "bg-rose-50" },
                  { label: "Collection", value: `${collectionRate}%`, icon: TrendingUp, color: "text-cyan-600", bg: "bg-cyan-50" },
                  { label: "Dana Masuk", value: `Rp ${(totalCollected / 1000).toFixed(0)}rb`, icon: Banknote, color: "text-blue-600", bg: "bg-blue-50" },
                  { label: "Rata/Warga", value: `Rp ${averageIuranPerCitizen.toLocaleString("id-ID")}`, icon: CreditCard, color: "text-cyan-600", bg: "bg-cyan-50" },
                ].map((card, i) => (
                  <div key={card.label} className="rounded-4xl border border-blue-100/80 bg-white/80 shadow-sm p-4 transition-all hover:scale-[1.02] hover:shadow-md" style={{ animationDelay: `${i * 60}ms` }}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-8 h-8 rounded-2xl ${card.bg} border border-blue-100 flex items-center justify-center ${card.color}`}><card.icon size={15} /></div>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider">{card.label}</p>
                    </div>
                    <p className={`text-xl font-black ${card.color}`}>{card.value}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-4xl border border-blue-100/80 bg-white/80 shadow-sm p-5 transition-all hover:shadow-md">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500"><PieChart size={15} /></div>
                    <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">Distribusi Status Iuran</p>
                  </div>
                  {iuran.length === 0 ? (<p className="text-xs text-slate-600 text-center py-8">Belum ada data</p>) : (
                    <div className="space-y-4">
                      {iuranStatusCounts.map((item) => {
                        const pct = iuran.length ? Math.round((item.count / iuran.length) * 100) : 0;
                        return (
                          <div key={item.label}>
                            <div className="flex justify-between text-xs mb-1.5"><span className="font-black text-slate-800">{item.label}</span><span className={`font-black ${item.text}`}>{item.count} ({pct}%)</span></div>
                            <div className="h-4 rounded-xl bg-blue-100 overflow-hidden"><div className={`h-full rounded-xl ${item.color} transition-all duration-700`} style={{ width: `${pct}%` }} /></div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div className="mt-4 flex gap-2 flex-wrap">
                    {iuranStatusCounts.map((item) => (
                      <span key={item.label} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black ${item.bg} ${item.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.color}`} />{item.label}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-4xl border border-blue-100/80 bg-white/80 shadow-sm p-5 transition-all hover:shadow-md">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500"><BarChart size={15} /></div>
                    <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">Pendapatan per Bulan</p>
                  </div>
                  {monthlyRevenueTrends.length === 0 ? (<p className="text-xs text-slate-600 text-center py-8">Belum ada data</p>) : (
                    <div className="flex items-end gap-3 h-48 px-2">
                      {monthlyRevenueTrends.map(([month, amount]) => {
                        const max = Math.max(...monthlyRevenueTrends.map((c) => c[1]));
                        const h = max ? (amount / max) * 100 : 0;
                        return (
                          <div key={month} className="flex-1 flex flex-col items-center gap-1.5 group">
                            <span className="text-[10px] font-black text-blue-600">Rp {(amount / 1000).toFixed(0)}k</span>
                            <div className="w-full bg-blue-100 rounded-t-xl relative h-32 overflow-hidden">
                              <div className="absolute bottom-0 w-full bg-linear-to-t from-blue-500 to-cyan-400 rounded-t-xl transition-all duration-700 group-hover:from-blue-600" style={{ height: `${h}%` }} />
                            </div>
                            <span className="text-[10px] font-black text-slate-600 text-center leading-tight">{month}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-4xl border border-blue-100/80 bg-white/80 shadow-sm p-5 transition-all hover:shadow-md">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500"><Activity size={15} /></div>
                    <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">Efisiensi Koleksi per Bulan</p>
                  </div>
                  {collectionEfficiencyByMonth.length === 0 ? (<p className="text-xs text-slate-600 text-center py-8">Belum ada data</p>) : (
                    <div className="space-y-3">
                      {collectionEfficiencyByMonth.map((item) => (
                        <div key={item.month} className="flex items-center gap-3">
                          <span className="text-xs font-black text-slate-700 w-20 shrink-0">{item.month}</span>
                          <div className="flex-1 h-6 rounded-xl bg-blue-100/60 overflow-hidden relative">
                            <div className={`h-full rounded-xl flex items-center px-2 transition-all duration-700 ${item.rate >= 80 ? "bg-blue-500" : item.rate >= 50 ? "bg-cyan-400" : "bg-rose-400"}`} style={{ width: `${item.rate}%` }}>
                              <span className="text-[10px] font-black text-white">{item.rate}%</span>
                            </div>
                          </div>
                          <span className="text-xs font-black text-slate-600 w-16 text-right">{item.paid}/{item.total}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="rounded-4xl border border-blue-100/80 bg-white/80 shadow-sm p-5 transition-all hover:shadow-md">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500"><Award size={15} /></div>
                    <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">Top 5 Pembayar</p>
                  </div>
                  {topPayingCitizens.length === 0 ? (<p className="text-xs text-slate-600 text-center py-8">Belum ada data</p>) : (
                    <div className="space-y-3">
                      {topPayingCitizens.map((item, i) => (
                        <div key={item.citizen!.id} className="flex items-center gap-3 rounded-2xl border border-blue-100/60 bg-blue-50/40 px-3 py-2.5 transition-all hover:bg-blue-50/70" style={{ animationDelay: `${i * 80}ms` }}>
                          <div className="shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-black text-blue-600">{i + 1}</div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-black text-slate-800 truncate">{item.citizen!.name}</p>
                            <p className="text-[10px] text-slate-600">{item.citizen!.address}</p>
                          </div>
                          <span className="shrink-0 text-xs font-black text-blue-600">Rp {item.amount.toLocaleString("id-ID")}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="rounded-4xl border border-blue-100/80 bg-white/80 shadow-sm overflow-hidden transition-all hover:shadow-md">
                <div className="px-5 py-4 border-b border-blue-100/70 flex items-center justify-between">
                  <h3 className="font-black text-slate-900 text-sm lg:text-base">Tabel Data Iuran</h3>
                  <span className="text-xs font-black text-blue-500 bg-blue-50 border border-blue-100 rounded-full px-3 py-1">{filteredIuran.length} data</span>
                </div>
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full text-left bg-white/60">
                    <thead>
                      <tr className="border-b border-blue-100/70 bg-white/40 text-[11px] uppercase tracking-widest text-blue-500">
                        <th className="px-5 py-3 font-black">Bulan</th>
                        <th className="px-5 py-3 font-black">Warga</th>
                        <th className="px-5 py-3 font-black">Nominal</th>
                        <th className="px-5 py-3 font-black">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredIuran.map((item, index) => {
                        const citizenName = citizens.find((c) => c.id === item.citizenId)?.name ?? `Warga #${item.citizenId}`;
                        return (
                          <tr key={item.id} className={`border-b border-blue-50 transition-colors hover:bg-blue-50/30 ${index % 2 === 0 ? "bg-white/50" : "bg-cyan-50/20"}`}>
                            <td className="px-5 py-4 text-sm font-black text-slate-800">{item.month}</td>
                            <td className="px-5 py-4 text-xs text-slate-600">{citizenName}</td>
                            <td className="px-5 py-4 text-xs text-slate-600">Rp {item.amount.toLocaleString("id-ID")}</td>
                            <td className="px-5 py-4">
                              <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase ${item.status === "Lunas" ? "bg-blue-100 text-blue-600 border border-blue-100" : "bg-rose-100 text-rose-600 border border-rose-100"}`}>
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="md:hidden grid gap-3 p-4">
                  {filteredIuran.map((item) => {
                    const citizenName = citizens.find((c) => c.id === item.citizenId)?.name ?? `Warga #${item.citizenId}`;
                    return (
                      <div key={item.id} className="rounded-3xl border border-blue-100/70 bg-white/85 px-4 py-4 shadow-sm shadow-blue-50/60 transition-all hover:shadow-md">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-black text-slate-800">{item.month}</p>
                            <p className="mt-1 text-xs text-slate-600">{citizenName}</p>
                          </div>
                          <span className={`shrink-0 inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase ${item.status === "Lunas" ? "bg-blue-100 text-blue-600 border border-blue-100" : "bg-rose-100 text-rose-600 border border-rose-100"}`}>
                            {item.status}
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-blue-500">Rp {item.amount.toLocaleString("id-ID")}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          {/* ANALISIS TAB */}
          {activeTab === "analisis" && (
            <div className="animate-in fade-in duration-500 space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Analisis & Insight</h2>
                  <p className="text-xs text-slate-600 mt-1">Data-driven overview untuk pengambilan keputusan manajemen.</p>
                </div>
                <div className="w-12 h-12 rounded-3xl bg-linear-to-br from-blue-500/10 to-cyan-400/15 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 shadow-sm shadow-blue-100/70">
                  <BarChart3 size={22} />
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                {[
                  { label: "Total Warga", value: citizens.length, icon: Users, subtitle: "Terdaftar", color: "text-blue-600" },
                  { label: "Total Surat", value: letters.length, icon: FileText, subtitle: `${completionRate}% selesai`, color: "text-cyan-600" },
                  { label: "Dana Masuk", value: `Rp ${(totalCollected / 1000).toFixed(0)}rb`, icon: Wallet, subtitle: "Akumulasi", color: "text-blue-600" },
                  { label: "Efisiensi", value: `${Math.round((completionRate + collectionRate) / 2)}%`, icon: Activity, subtitle: "Rata-rata", color: "text-cyan-600" },
                  { label: "Tunggakan", value: pendingIuran.length, icon: AlertTriangle, subtitle: "Iuran pending", color: "text-rose-500" },
                  { label: "Notifikasi", value: notificationStats.unread, icon: Bell, subtitle: "Belum dibaca", color: "text-amber-500" },
                ].map((card, i) => (
                  <div key={card.label} className="rounded-4xl border border-blue-100/80 bg-white/80 shadow-sm shadow-blue-50/60 p-4 transition-all hover:scale-[1.02] hover:shadow-md" style={{ animationDelay: `${i * 60}ms` }}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500">
                        <card.icon size={15} />
                      </div>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider">{card.label}</p>
                    </div>
                    <p className={`text-xl font-black ${card.color}`}>{card.value}</p>
                    <p className="text-[11px] text-slate-600 mt-0.5">{card.subtitle}</p>
                  </div>
                ))}
              </div>
              {/* Status Distribution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-4xl border border-blue-100/80 bg-white/80 shadow-sm p-5 transition-all hover:shadow-md">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500"><PieChart size={15} /></div>
                    <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">Distribusi Status Surat</p>
                  </div>
                  <div className="space-y-4">
                    {letterStatusCounts.map((item) => {
                      const pct = letters.length ? Math.round((item.count / letters.length) * 100) : 0;
                      return (
                        <div key={item.label}>
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="font-black text-slate-800">{item.label}</span>
                            <span className={`font-black ${item.text}`}>{item.count} ({pct}%)</span>
                          </div>
                          <div className="h-2.5 rounded-full bg-blue-100 overflow-hidden">
                            <div className={`h-full rounded-full ${item.color} transition-all duration-1000`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 flex gap-2">
                    {letterStatusCounts.map((item) => (
                      <span key={item.label} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black ${item.bg} ${item.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
                        {item.label}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-4xl border border-blue-100/80 bg-white/80 shadow-sm p-5 transition-all hover:shadow-md">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500"><CreditCard size={15} /></div>
                    <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">Distribusi Status Iuran</p>
                  </div>
                  <div className="space-y-4">
                    {iuranStatusCounts.map((item) => {
                      const pct = iuran.length ? Math.round((item.count / iuran.length) * 100) : 0;
                      return (
                        <div key={item.label}>
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="font-black text-slate-800">{item.label}</span>
                            <span className={`font-black ${item.text}`}>{item.count} ({pct}%)</span>
                          </div>
                          <div className="h-2.5 rounded-full bg-blue-100 overflow-hidden">
                            <div className={`h-full rounded-full ${item.color} transition-all duration-1000`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 flex gap-2">
                    {iuranStatusCounts.map((item) => (
                      <span key={item.label} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black ${item.bg} ${item.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
                        {item.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Visual Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Vertical Bar Chart - Monthly Letter Volume */}
                <div className="rounded-4xl border border-blue-100/80 bg-white/80 shadow-sm p-5 transition-all hover:shadow-md">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500"><BarChart size={15} /></div>
                    <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">Grafik Volume Surat Bulanan</p>
                  </div>
                  {monthlyLetterTrends.length === 0 ? (
                    <p className="text-xs text-slate-600 text-center py-8">Belum ada data surat</p>
                  ) : (
                    <div className="flex items-end gap-3 h-48 px-2">
                      {monthlyLetterTrends.map(([month, count]) => {
                        const max = Math.max(...monthlyLetterTrends.map((c) => c[1]));
                        const h = max ? (count / max) * 100 : 0;
                        return (
                          <div key={month} className="flex-1 flex flex-col items-center gap-1.5 group">
                            <span className="text-[10px] font-black text-blue-600">{count}</span>
                            <div className="w-full bg-blue-100 rounded-t-xl relative h-32 overflow-hidden">
                              <div className="absolute bottom-0 w-full bg-linear-to-t from-blue-500 to-cyan-400 rounded-t-xl transition-all duration-700 group-hover:from-blue-600 group-hover:to-cyan-500" style={{ height: `${h}%` }} />
                            </div>
                            <span className="text-[10px] font-black text-slate-600 text-center leading-tight">{month}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* SVG Semi-Circle Gauges */}
                <div className="rounded-4xl border border-blue-100/80 bg-white/80 shadow-sm p-5 transition-all hover:shadow-md">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500"><PieChart size={15} /></div>
                    <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">Grafik Proporsi Status</p>
                  </div>
                  {letters.length === 0 ? (
                    <p className="text-xs text-slate-600 text-center py-8">Belum ada data</p>
                  ) : (
                    <div className="flex flex-col items-center">
                      <svg viewBox="0 0 200 110" className="w-full max-w-xs">
                        {/* Background arc */}
                        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#e2e8f0" strokeWidth="24" strokeLinecap="round" />
                        {/* Selesai arc */}
                        <path
                          d="M 20 100 A 80 80 0 0 1 180 100"
                          fill="none"
                          stroke="url(#blueGrad)"
                          strokeWidth="24"
                          strokeLinecap="round"
                          strokeDasharray={`${(completionRate / 100) * 251.3} 251.3`}
                          strokeDashoffset="0"
                          transform="rotate(180 100 100)"
                          className="transition-all duration-1000"
                        />
                        <defs>
                          <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#06b6d4" />
                          </linearGradient>
                        </defs>
                        <text x="100" y="85" textAnchor="middle" className="text-3xl font-black" fill="#1e293b" style={{ fontSize: '28px', fontWeight: 900 }}>{completionRate}%</text>
                        <text x="100" y="105" textAnchor="middle" className="text-xs" fill="#64748b" style={{ fontSize: '12px' }}>Surat Selesai</text>
                      </svg>
                      <div className="flex gap-4 mt-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-blue-500" />
                          <span className="text-xs font-black text-slate-700">Selesai ({completedLetters.length})</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-slate-200" />
                          <span className="text-xs font-black text-slate-700">Diproses ({pendingLetters.length})</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Monthly Trends */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-4xl border border-blue-100/80 bg-white/80 shadow-sm p-5 transition-all hover:shadow-md">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500"><CalendarDays size={15} /></div>
                    <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">Tren Surat Bulanan</p>
                  </div>
                  {monthlyLetterTrends.length === 0 ? (
                    <p className="text-xs text-slate-600 text-center py-8">Belum ada data surat</p>
                  ) : (
                    <div className="space-y-3">
                      {monthlyLetterTrends.map(([month, count]) => {
                        const max = Math.max(...monthlyLetterTrends.map((c) => c[1]));
                        return (
                          <div key={month} className="flex items-center gap-3">
                            <span className="text-xs font-black text-slate-700 w-20 shrink-0">{month}</span>
                            <div className="flex-1 h-6 rounded-xl bg-blue-100/60 overflow-hidden relative">
                              <div className="h-full rounded-xl bg-linear-to-r from-blue-500 to-cyan-400 flex items-center px-2 transition-all duration-700" style={{ width: `${max ? (count / max) * 100 : 0}%` }}>
                                {count > 0 && <span className="text-[10px] font-black text-white ml-auto">{count}</span>}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="rounded-4xl border border-blue-100/80 bg-white/80 shadow-sm p-5 transition-all hover:shadow-md">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500"><TrendingUp size={15} /></div>
                    <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">Tren Pendapatan Bulanan</p>
                  </div>
                  {monthlyRevenueTrends.length === 0 ? (
                    <p className="text-xs text-slate-600 text-center py-8">Belum ada data iuran</p>
                  ) : (
                    <div className="space-y-3">
                      {monthlyRevenueTrends.map(([month, amount]) => {
                        const max = Math.max(...monthlyRevenueTrends.map((a) => a[1]));
                        return (
                          <div key={month} className="flex items-center gap-3">
                            <span className="text-xs font-black text-slate-700 w-20 shrink-0">{month}</span>
                            <div className="flex-1 h-6 rounded-xl bg-blue-100/60 overflow-hidden relative">
                              <div className="h-full rounded-xl bg-linear-to-r from-cyan-400 to-blue-500 flex items-center px-2 transition-all duration-700" style={{ width: `${max ? (amount / max) * 100 : 0}%` }}>
                                {amount > 0 && <span className="text-[10px] font-black text-white ml-auto">Rp {(amount / 1000).toFixed(0)}rb</span>}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Detailed Distribution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-4xl border border-blue-100/80 bg-white/80 shadow-sm p-5 transition-all hover:shadow-md">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500"><FileText size={15} /></div>
                    <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">Volume per Jenis Surat</p>
                  </div>
                  {letterVolumeByType.length === 0 ? (
                    <p className="text-xs text-slate-600 text-center py-8">Belum ada data</p>
                  ) : (
                    <div className="space-y-3">
                      {letterVolumeByType.map(([type, count]) => {
                        const max = Math.max(...letterVolumeByType.map((c) => c[1]));
                        return (
                          <div key={type} className="flex items-center gap-3">
                            <span className="text-xs font-black text-slate-700 w-32 shrink-0 truncate">{type}</span>
                            <div className="flex-1 h-5 rounded-lg bg-blue-100/60 overflow-hidden">
                              <div className="h-full rounded-lg bg-blue-400 transition-all duration-700" style={{ width: `${max ? (count / max) * 100 : 0}%` }} />
                            </div>
                            <span className="text-xs font-black text-blue-600 w-8 text-right">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="rounded-4xl border border-blue-100/80 bg-white/80 shadow-sm p-5 transition-all hover:shadow-md">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500"><MapPin size={15} /></div>
                    <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">Distribusi Status Kependudukan</p>
                  </div>
                  {statusDistribution.length === 0 ? (
                    <p className="text-xs text-slate-600 text-center py-8">Belum ada data warga</p>
                  ) : (
                    <div className="space-y-3">
                      {statusDistribution.map(([status, count]) => {
                        const max = Math.max(...statusDistribution.map((c) => c[1]));
                        return (
                          <div key={status} className="flex items-center gap-3">
                            <span className="text-xs font-black text-slate-700 w-16 shrink-0">{status}</span>
                            <div className="flex-1 h-5 rounded-lg bg-blue-100/60 overflow-hidden">
                              <div className="h-full rounded-lg bg-cyan-400 transition-all duration-700" style={{ width: `${max ? (count / max) * 100 : 0}%` }} />
                            </div>
                            <span className="text-xs font-black text-cyan-600 w-8 text-right">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Top Performers & Pending */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div className="rounded-4xl border border-blue-100/80 bg-white/80 shadow-sm overflow-hidden transition-all hover:shadow-md">
                  <div className="px-5 py-4 border-b border-blue-100/70 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500"><Award size={15} /></div>
                    <h3 className="font-black text-slate-900 text-sm lg:text-base">Top Pembayar Iuran</h3>
                  </div>
                  <div className="p-4 space-y-3">
                    {topPayingCitizens.length === 0 ? (
                      <p className="text-xs text-slate-600 text-center py-4">Belum ada data pembayaran</p>
                    ) : (
                      topPayingCitizens.map(({ citizen, amount }, i) => (
                        <div key={citizen!.id} className="flex items-center gap-3 rounded-2xl border border-blue-100/60 bg-blue-50/40 px-3 py-3 transition-all hover:bg-blue-50/70" style={{ animationDelay: `${i * 80}ms` }}>
                          <div className="w-7 h-7 rounded-full bg-linear-to-br from-blue-500 to-cyan-400 text-white flex items-center justify-center text-[10px] font-black shrink-0">{i + 1}</div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-black text-slate-800 truncate">{citizen!.name}</p>
                            <p className="text-xs text-slate-600">{citizen!.phone}</p>
                          </div>
                          <span className="shrink-0 text-xs font-black text-blue-600">Rp {amount.toLocaleString("id-ID")}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-4xl border border-blue-100/80 bg-white/80 shadow-sm overflow-hidden transition-all hover:shadow-md">
                  <div className="px-5 py-4 border-b border-blue-100/70 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500"><AlertTriangle size={15} /></div>
                    <h3 className="font-black text-slate-900 text-sm lg:text-base">Warga dengan Tunggakan Terbanyak</h3>
                  </div>
                  <div className="p-4 space-y-3">
                    {topPendingCitizens.length === 0 ? (
                      <p className="text-xs text-slate-600 text-center py-4">Tidak ada tunggakan</p>
                    ) : (
                      topPendingCitizens.map(({ citizen, count }, i) => (
                        <div key={citizen!.id} className="flex items-center gap-3 rounded-2xl border border-blue-100/60 bg-blue-50/40 px-3 py-3 transition-all hover:bg-blue-50/70" style={{ animationDelay: `${i * 80}ms` }}>
                          <div className="w-7 h-7 rounded-full bg-rose-400 text-white flex items-center justify-center text-[10px] font-black shrink-0">{i + 1}</div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-black text-slate-800 truncate">{citizen!.name}</p>
                            <p className="text-xs text-slate-600">{citizen!.phone}</p>
                          </div>
                          <span className="shrink-0 bg-rose-100 text-rose-600 text-[10px] font-black px-2.5 py-1 rounded-full">{count} pending</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Collection Efficiency by Month */}
              <div className="rounded-4xl border border-blue-100/80 bg-white/80 shadow-sm p-5 transition-all hover:shadow-md">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-8 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500"><Activity size={15} /></div>
                  <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">Efisiensi Koleksi Iuran per Bulan</p>
                </div>
                {collectionEfficiencyByMonth.length === 0 ? (
                  <p className="text-xs text-slate-600 text-center py-8">Belum ada data</p>
                ) : (
                  <div className="space-y-4">
                    {collectionEfficiencyByMonth.map(({ month, paid, total, rate }) => (
                      <div key={month}>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="font-black text-slate-800">{month}</span>
                          <span className={`font-black ${rate >= 80 ? "text-blue-600" : rate >= 50 ? "text-cyan-600" : "text-rose-500"}`}>{paid} / {total} ({rate}%)</span>
                        </div>
                        <div className="h-2.5 rounded-full bg-blue-100 overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-1000 ${rate >= 80 ? "bg-blue-500" : rate >= 50 ? "bg-cyan-400" : "bg-rose-400"}`} style={{ width: `${rate}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Insights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { icon: CheckCircle2, title: "Operasional Surat", value: `${completionRate}%`, desc: letters.length > 0 ? (completionRate >= 80 ? "Performa sangat baik" : completionRate >= 50 ? "Sedang berjalan normal" : "Perlu percepatan proses") : "Belum ada data", color: completionRate >= 80 ? "text-blue-600" : completionRate >= 50 ? "text-cyan-600" : "text-rose-500", bg: completionRate >= 80 ? "bg-blue-50" : completionRate >= 50 ? "bg-cyan-50" : "bg-rose-50" },
                  { icon: Wallet, title: "Kolektabilitas Iuran", value: `${collectionRate}%`, desc: iuran.length > 0 ? (collectionRate >= 80 ? "Koleksi sangat optimal" : collectionRate >= 50 ? "Koleksi berjalan normal" : "Perlu penagakan lebih intensif") : "Belum ada data", color: collectionRate >= 80 ? "text-blue-600" : collectionRate >= 50 ? "text-cyan-600" : "text-rose-500", bg: collectionRate >= 80 ? "bg-blue-50" : collectionRate >= 50 ? "bg-cyan-50" : "bg-rose-50" },
                  { icon: Users, title: "Rata-rata Iuran/Warga", value: `Rp ${averageIuranPerCitizen.toLocaleString("id-ID")}`, desc: citizens.length > 0 ? "Kontribusi rata-rata per warga terdaftar" : "Belum ada data warga", color: "text-blue-600", bg: "bg-blue-50" },
                ].map((insight, i) => (
                  <div key={insight.title} className="rounded-4xl border border-blue-100/80 bg-white/80 shadow-sm p-5 transition-all hover:shadow-md hover:scale-[1.01]" style={{ animationDelay: `${i * 80}ms` }}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-8 h-8 rounded-2xl ${insight.bg} border border-blue-100 flex items-center justify-center ${insight.color}`}>
                        <insight.icon size={15} />
                      </div>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider">{insight.title}</p>
                    </div>
                    <p className={`text-2xl font-black ${insight.color}`}>{insight.value}</p>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{insight.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BottomNav hanya mobile */}
      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
