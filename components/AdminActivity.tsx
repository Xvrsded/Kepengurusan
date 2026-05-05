import { Bell, Wallet, FileText, Info, AlertCircle } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { Skeleton } from "@/components/Skeleton";

export function AdminActivity() {
  const notifications = useAppStore((s) => s.notifications);
  const loadingNotifications = useAppStore((s) => s.loadingNotifications);

  const recentActivities = notifications.slice(0, 5);

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    return `${diffDays} hari lalu`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "iuran":
        return <Wallet size={16} className="text-green-600" />;
      case "surat":
        return <FileText size={16} className="text-blue-600" />;
      case "warning":
        return <AlertCircle size={16} className="text-amber-600" />;
      default:
        return <Info size={16} className="text-slate-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "iuran":
        return "bg-green-100";
      case "surat":
        return "bg-blue-100";
      case "warning":
        return "bg-amber-100";
      default:
        return "bg-slate-100";
    }
  };

  if (loadingNotifications) {
    return (
      <div className="bg-white rounded-2xl shadow-lg shadow-slate-100/70 border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="p-5 space-y-2">
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg shadow-slate-100/70 border border-slate-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <p className="font-black text-slate-800 text-sm">Aktivitas Terbaru</p>
      </div>
      <div className="p-5">
        {recentActivities.length === 0 ? (
          <div className="text-center py-6">
            <Bell size={32} className="text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500">Belum ada aktivitas</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div className={`w-8 h-8 rounded-lg ${getActivityColor(activity.type)} flex items-center justify-center shrink-0`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black text-slate-800 truncate">{activity.title}</p>
                  <p className="text-xs text-slate-500 line-clamp-2">{activity.message}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{formatTimeAgo(activity.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
