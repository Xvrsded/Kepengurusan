import { TrendingUp, Users, DollarSign } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { Skeleton } from "@/components/Skeleton";

export function AdminIuranAnalytics() {
  const profiles = useAppStore((s) => s.profiles);
  const iuranMaster = useAppStore((s) => s.iuranMaster);
  const iuranUser = useAppStore((s) => s.iuranUser);
  const loadingIuranMaster = useAppStore((s) => s.loadingIuranMaster);
  const loadingIuranUser = useAppStore((s) => s.loadingIuranUser);

  const isLoading = loadingIuranMaster || loadingIuranUser;

  // Calculate progress pembayaran
  const totalUsers = profiles.filter((p) => p.role === "warga").length;
  const paidIuran = iuranUser.filter((iu: any) => iu.status === "paid");
  const unpaidIuran = iuranUser.filter((iu: any) => iu.status === "unpaid");
  const totalCollected = paidIuran.reduce((sum: number, iu: any) => sum + (iu.iuran_master?.amount || 0), 0);
  const paymentRate = iuranUser.length === 0 ? 0 : Math.round((paidIuran.length / iuranUser.length) * 100);

  // Breakdown per jenis iuran
  const iuranBreakdown = iuranMaster.map((master: any) => {
    const userIuran = iuranUser.filter((iu: any) => iu.iuran_master_id === master.id && iu.status === "paid");
    const totalCollected = userIuran.reduce((sum: number, iu: any) => sum + (master.amount || 0), 0);
    const payerCount = userIuran.length;

    return {
      id: master.id,
      name: master.title || "Iuran",
      type: "Iuran",
      totalCollected,
      payerCount,
    };
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg shadow-slate-100/70 border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="p-5 space-y-4">
          <Skeleton className="h-32 rounded-xl" />
          <div className="space-y-3">
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg shadow-slate-100/70 border border-slate-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <p className="font-black text-slate-800 text-sm">Analisis Iuran</p>
      </div>
      <div className="p-5 space-y-4">
        {/* Progress Pembayaran */}
        <div className="bg-linear-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-600" />
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Kepatuhan Pembayaran</p>
            </div>
            <p className="text-2xl font-black text-slate-900">{paymentRate}%</p>
          </div>
          <div className="h-2.5 rounded-full bg-slate-200 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                paymentRate >= 80 ? "bg-green-500" : paymentRate >= 50 ? "bg-amber-500" : "bg-red-500"
              }`}
              style={{ width: `${paymentRate}%` }}
            />
          </div>
          <p className="text-xs text-slate-600 mt-2">
            {paidIuran.length} dari {iuranUser.length} tagihan sudah dibayar
          </p>
        </div>

        {/* Breakdown per Jenis Iuran */}
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Breakdown per Jenis</p>
          <div className="space-y-2">
            {iuranBreakdown.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-xs text-slate-500">Belum ada data iuran</p>
              </div>
            ) : (
              iuranBreakdown.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                      <DollarSign size={16} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800">{item.name}</p>
                      <p className="text-[10px] text-slate-500">{item.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900">Rp {(item.totalCollected / 1000).toFixed(0)}rb</p>
                    <p className="text-[10px] text-slate-500">{item.payerCount} warga</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
