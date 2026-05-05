import { Users, Wallet, AlertCircle, FileText } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { Skeleton } from "@/components/Skeleton";

export function AdminStats() {
  const profiles = useAppStore((s) => s.profiles);
  const iuranMaster = useAppStore((s) => s.iuranMaster);
  const iuranUser = useAppStore((s) => s.iuranUser);
  const letters = useAppStore((s) => s.letters);
  const loadingProfiles = useAppStore((s) => s.loadingProfiles);
  const loadingIuranMaster = useAppStore((s) => s.loadingIuranMaster);
  const loadingIuranUser = useAppStore((s) => s.loadingIuranUser);
  const loadingLetters = useAppStore((s) => s.loadingLetters);

  // Calculate KPIs
  const totalWarga = profiles.filter((p) => p.role === "warga").length;

  const paidIuran = iuranUser.filter((iu: any) => iu.status === "paid");
  const unpaidIuran = iuranUser.filter((iu: any) => iu.status === "unpaid");

  const iuranMasukBulanIni = paidIuran.reduce((sum: number, iu: any) => sum + (iu.iuran_master?.amount || 0), 0);

  const iuranBelumBayar = unpaidIuran.length;

  const suratAktif = letters.filter((l) => l.status === "pending").length;

  const isLoading = loadingProfiles || loadingIuranMaster || loadingIuranUser || loadingLetters;

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
    );
  }

  const stats = [
    {
      title: "Total Warga",
      value: totalWarga,
      subtitle: "Data penghuni aktif",
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "Iuran Masuk Bulan Ini",
      value: `Rp ${(iuranMasukBulanIni / 1000).toFixed(0)}rb`,
      subtitle: "Akumulasi pembayaran",
      icon: Wallet,
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      title: "Iuran Belum Bayar",
      value: iuranBelumBayar,
      subtitle: "Tagihan pending",
      icon: AlertCircle,
      color: "text-amber-500",
      bgColor: "bg-amber-50",
    },
    {
      title: "Surat Aktif",
      value: suratAktif,
      subtitle: "Permintaan diproses",
      icon: FileText,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat, index) => (
        <div
          key={stat.title}
          className="bg-white rounded-2xl p-4 border border-slate-100 shadow-lg shadow-slate-100/70 hover:scale-[1.02] transition-transform duration-300"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center mb-3`}>
            <stat.icon size={20} className={stat.color} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{stat.title}</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stat.value}</p>
          <p className="text-[10px] text-slate-500 mt-1">{stat.subtitle}</p>
        </div>
      ))}
    </div>
  );
}
