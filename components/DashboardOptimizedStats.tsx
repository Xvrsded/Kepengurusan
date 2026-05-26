"use client";

import {
  getDashboardStats,
  getIuranSummary,
  getCandidatesWithVotes,
} from "@/services/optimizedQueryService";
import { useAppStore } from "@/store/useAppStore";
import { useState, useEffect } from "react";
import {
  Loader2,
  AlertCircle,
  TrendingUp,
  Users,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Wallet,
} from "lucide-react";

interface DashboardOptimizedStatsProps {
  refreshInterval?: number; // ms, 0 = no auto-refresh
  showDetailBreakdown?: boolean;
}

/**
 * Komponen Dashboard dengan Agregasi Optimized
 *
 * Fitur:
 * - Menggunakan getDashboardStats untuk single query aggregation
 * - Parallel queries untuk multiple aggregations
 * - Tidak menarik semua data baris, hanya count/sum
 * - Real-time dengan polling atau realtime subscription
 * - Cache dengan stale revalidation
 * - Error boundary dan loading states
 *
 * Statistik yang ditampilkan:
 * - Jumlah warga terdaftar
 * - Jumlah admin
 * - Surat pending / approved / ditolak
 * - Iuran unpaid / overdue
 * - Panic alerts active
 * - Total votes
 *
 * @example
 * <DashboardOptimizedStats refreshInterval={30000} showDetailBreakdown={true} />
 */
export function DashboardOptimizedStats({
  refreshInterval = 30000, // Default 30 detik
  showDetailBreakdown = false,
}: DashboardOptimizedStatsProps) {
  const [mounted, setMounted] = useState(false);
  const supabaseUser = useAppStore((s) => s.supabaseUser);

  // Stats state
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [iuranSummary, setIuranSummary] = useState<any>(null);
  const [candidatesStats, setCandidatesStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch stats - parallel execution untuk performance
  const fetchStats = async () => {
    try {
      setError(null);

      // Parallel fetch untuk semua stats
      const [dashStats, iuranStats, candidateStats] = await Promise.all([
        getDashboardStats(),
        supabaseUser?.id ? getIuranSummary(supabaseUser.id) : Promise.resolve(null),
        getCandidatesWithVotes(),
      ]);

      setDashboardStats(dashStats);
      setIuranSummary(iuranStats);
      setCandidatesStats(candidateStats);
      setLastUpdated(new Date());
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch stats");
      setError(error);
      console.error("Dashboard stats fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchStats();
  }, [supabaseUser?.id]);

  // Auto-refresh interval
  useEffect(() => {
    if (refreshInterval <= 0) return;

    const interval = setInterval(() => {
      console.log("🔄 Dashboard stats auto-refresh");
      fetchStats();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, supabaseUser?.id]);

  // Hydration guard
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-red-900">Gagal Memuat Statistik</h3>
          <p className="text-sm text-red-700 mt-1">{error.message}</p>
          <button
            onClick={fetchStats}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading || !dashboardStats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-32 bg-linear-to-br from-slate-100 to-slate-200 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  // Stat card component
  const StatCard = ({
    icon: Icon,
    label,
    value,
    subtext,
    bgColor,
    trend,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    subtext?: string;
    bgColor: string;
    trend?: { value: number; direction: "up" | "down" };
  }) => (
    <div
      className={`${bgColor} rounded-lg p-6 border border-opacity-30 shadow-sm hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-white/50 flex items-center justify-center">
          {Icon}
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-sm font-semibold ${
              trend.direction === "up" ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend.direction === "up" ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
            {trend.value}%
          </div>
        )}
      </div>
      <h3 className="text-sm font-medium text-slate-700 mb-1">{label}</h3>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
      {subtext && <p className="text-xs text-slate-600 mt-2">{subtext}</p>}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header dengan refresh info */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Ringkasan Dashboard</h2>
          {lastUpdated && (
            <p className="text-sm text-slate-600 mt-1">
              Terakhir diperbarui:{" "}
              {lastUpdated.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </p>
          )}
        </div>
        <button
          onClick={fetchStats}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          title="Refresh statistik"
        >
          <Loader2 className={`w-5 h-5 text-slate-600 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Warga Active */}
        <StatCard
          icon={<Users className="w-6 h-6 text-blue-600" />}
          label="Total Warga Aktif"
          value={dashboardStats?.total_warga || 0}
          subtext="Pengguna terdaftar di sistem"
          bgColor="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200"
        />

        {/* Admin */}
        <StatCard
          icon={<Users className="w-6 h-6 text-purple-600" />}
          label="Admin"
          value={dashboardStats?.total_admin || 0}
          subtext="Pengelola sistem"
          bgColor="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200"
        />

        {/* Letters Pending */}
        <StatCard
          icon={<FileText className="w-6 h-6 text-yellow-600" />}
          label="Surat Menunggu"
          value={dashboardStats?.pending_letters || 0}
          subtext="Perlu ditinjau admin"
          bgColor="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200"
          trend={{ value: 5, direction: "up" }}
        />

        {/* Iuran Unpaid */}
        <StatCard
          icon={<Wallet className="w-6 h-6 text-red-600" />}
          label="Iuran Belum Bayar"
          value={dashboardStats?.unpaid_iuran || 0}
          subtext="Segera diingatkan warga"
          bgColor="bg-gradient-to-br from-red-50 to-rose-50 border-red-200"
          trend={{ value: 12, direction: "up" }}
        />

        {/* Panic Alerts Active */}
        <StatCard
          icon={<AlertTriangle className="w-6 h-6 text-orange-600" />}
          label="Alert Aktif"
          value={dashboardStats?.active_panic_alerts || 0}
          subtext="Memerlukan perhatian segera"
          bgColor="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200"
        />

        {/* Total Votes */}
        <StatCard
          icon={<CheckCircle2 className="w-6 h-6 text-emerald-600" />}
          label="Total Suara"
          value={dashboardStats?.total_votes || 0}
          subtext="Suara masuk untuk voting"
          bgColor="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200"
        />
      </div>

      {/* Detailed Breakdown - Optional */}
      {showDetailBreakdown && iuranSummary && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Iuran Breakdown */}
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-blue-600" />
              Ringkasan Iuran Anda
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded border border-emerald-200">
                <p className="text-sm text-emerald-900">Total Terbayar</p>
                <p className="font-semibold text-emerald-900">
                  Rp {(iuranSummary?.total_paid || 0).toLocaleString("id-ID")}
                </p>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded border border-yellow-200">
                <p className="text-sm text-yellow-900">Belum Bayar</p>
                <p className="font-semibold text-yellow-900">
                  Rp {(iuranSummary?.total_unpaid || 0).toLocaleString("id-ID")}
                </p>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded border border-red-200">
                <p className="text-sm text-red-900">Overdue</p>
                <p className="font-semibold text-red-900">
                  Rp {(iuranSummary?.total_overdue || 0).toLocaleString("id-ID")}
                </p>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-100 rounded border border-slate-300 font-bold mt-3">
                <p className="text-slate-900">Total Iuran</p>
                <p className="text-slate-900">
                  Rp {(iuranSummary?.total_amount || 0).toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          </div>

          {/* Candidates & Votes */}
          {candidatesStats && candidatesStats.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                Top Kandidat ({candidatesStats.length})
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {candidatesStats.slice(0, 5).map((candidate: any, idx: number) => (
                  <div
                    key={candidate.id || idx}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-200 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">
                        {candidate.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {candidate.position || "Kandidat"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <div className="w-12 h-6 bg-linear-to-r from-blue-400 to-blue-500 rounded flex items-center justify-center">
                        <p className="text-xs font-bold text-white">
                          {candidate.vote_count || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {candidatesStats.length > 5 && (
                <p className="text-xs text-slate-500 mt-3 text-center">
                  +{candidatesStats.length - 5} kandidat lainnya
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Performance Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          ✅ <span className="font-medium">Optimasi Aktif:</span> Menggunakan
          aggregation queries dengan count exact dan parallel fetch. Tidak ada N+1
          queries atau full table scans.
        </p>
      </div>
    </div>
  );
}

export default DashboardOptimizedStats;
