import { Lightbulb, AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { Skeleton } from "@/components/Skeleton";

export function AdminInsight() {
  const profiles = useAppStore((s) => s.profiles);
  const iuranPayments = useAppStore((s) => s.iuranPayments);
  const letters = useAppStore((s) => s.letters);
  const loadingProfiles = useAppStore((s) => s.loadingProfiles);
  const loadingIuranPayments = useAppStore((s) => s.loadingIuranPayments);
  const loadingLetters = useAppStore((s) => s.loadingLetters);

  const isLoading = loadingProfiles || loadingIuranPayments || loadingLetters;

  // Generate insights based on data
  const generateInsights = () => {
    const insights: { type: "warning" | "info" | "success"; icon: React.ReactNode; title: string; message: string }[] = [];

    // Iuran compliance insight
    const totalUsers = profiles?.length || 0;
    const paidUsers = new Set(iuranPayments.filter((p) => p.status === "Lunas").map((p) => p.citizenId)).size;
    const complianceRate = totalUsers === 0 ? 0 : Math.round((paidUsers / totalUsers) * 100);

    if (complianceRate < 50) {
      insights.push({
        type: "warning",
        icon: <AlertTriangle size={20} className="text-amber-600" />,
        title: "Kepatuhan Iuran Rendah",
        message: `${100 - complianceRate}% warga belum bayar iuran bulan ini. Perlu follow-up.`,
      });
    } else if (complianceRate >= 80) {
      insights.push({
        type: "success",
        icon: <CheckCircle2 size={20} className="text-green-600" />,
        title: "Kepatuhan Iuran Baik",
        message: `${complianceRate}% warga sudah bayar iuran bulan ini. Pertahankan!`,
      });
    }

    // Pending letters insight
    const pendingLetters = letters.filter((l) => l.status === "pending").length;
    if (pendingLetters > 5) {
      insights.push({
        type: "warning",
        icon: <AlertTriangle size={20} className="text-amber-600" />,
        title: "Surat Menumpuk",
        message: `${pendingLetters} surat belum diproses. Prioritaskan penyelesaian.`,
      });
    } else if (pendingLetters === 0) {
      insights.push({
        type: "success",
        icon: <CheckCircle2 size={20} className="text-green-600" />,
        title: "Semua Surat Selesai",
        message: "Tidak ada surat yang menunggu diproses.",
      });
    }

    // Total collection insight
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyCollection = iuranPayments
      .filter((p) => {
        const paymentMonth = p.date.slice(0, 7);
        return paymentMonth === currentMonth && p.status === "Lunas";
      })
      .reduce((sum, p) => sum + p.amount, 0);

    if (monthlyCollection > 0) {
      insights.push({
        type: "info",
        icon: <TrendingUp size={20} className="text-blue-600" />,
        title: "Kas Masuk Bulan Ini",
        message: `Rp ${(monthlyCollection / 1000).toFixed(0)}rb telah terkumpul.`,
      });
    }

    // If no insights, add a default one
    if (insights.length === 0) {
      insights.push({
        type: "info",
        icon: <Lightbulb size={20} className="text-slate-600" />,
        title: "Sistem Berjalan Normal",
        message: "Semua data dalam kondisi baik.",
      });
    }

    return insights;
  };

  const insights = generateInsights();

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg shadow-slate-100/70 border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="p-5 space-y-3">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
      </div>
    );
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case "warning":
        return "bg-amber-50 border-amber-200";
      case "success":
        return "bg-green-50 border-green-200";
      case "info":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-slate-50 border-slate-200";
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg shadow-slate-100/70 border border-slate-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Lightbulb size={18} className="text-amber-500" />
          <p className="font-black text-slate-800 text-sm">Smart Insight</p>
        </div>
      </div>
      <div className="p-5 space-y-3">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 p-4 rounded-xl border ${getInsightColor(insight.type)}`}
          >
            <div className="shrink-0">{insight.icon}</div>
            <div className="min-w-0">
              <p className="text-sm font-black text-slate-800">{insight.title}</p>
              <p className="text-xs text-slate-600 mt-1">{insight.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
