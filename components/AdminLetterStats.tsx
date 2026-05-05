import { FileText, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { Skeleton } from "@/components/Skeleton";

export function AdminLetterStats() {
  const letters = useAppStore((s) => s.letters);
  const loadingLetters = useAppStore((s) => s.loadingLetters);

  const totalSurat = letters.length;
  const pendingSurat = letters.filter((l) => l.status === "pending").length;
  const completedSurat = letters.filter((l) => l.status === "approved").length;
  const rejectedSurat = letters.filter((l) => l.status === "rejected").length;

  const recentLetters = letters.slice(0, 5);

  if (loadingLetters) {
    return (
      <div className="bg-white rounded-2xl shadow-lg shadow-slate-100/70 border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Selesai":
        return "bg-green-100 text-green-700";
      case "Proses":
        return "bg-amber-100 text-amber-700";
      case "Ditolak":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Selesai":
        return <CheckCircle2 size={16} className="text-green-600" />;
      case "Proses":
        return <Clock size={16} className="text-amber-600" />;
      case "Ditolak":
        return <AlertCircle size={16} className="text-red-600" />;
      default:
        return <FileText size={16} className="text-slate-600" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg shadow-slate-100/70 border border-slate-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <p className="font-black text-slate-800 text-sm">Status Surat</p>
      </div>
      <div className="p-5 space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <p className="text-lg font-black text-slate-900">{totalSurat}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-3 text-center">
            <p className="text-lg font-black text-slate-900">{pendingSurat}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Proses</p>
          </div>
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <p className="text-lg font-black text-slate-900">{completedSurat}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Selesai</p>
          </div>
        </div>

        {/* Recent Letters */}
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">5 Terbaru</p>
          {recentLetters.length === 0 ? (
            <div className="text-center py-6">
              <FileText size={32} className="text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">Belum ada surat</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentLetters.map((letter) => (
                <div
                  key={letter.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0">
                      {getStatusIcon(letter.status)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-slate-800 truncate">{letter.jenis_surat}</p>
                      <p className="text-xs text-slate-500 truncate">User ID: {letter.user_id.slice(0, 8)}...</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusColor(letter.status)}`}>
                      {letter.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
