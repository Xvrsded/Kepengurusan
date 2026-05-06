import { usePing } from "@/hooks/usePing";
import { Activity } from "lucide-react";

export default function PingStatus() {
  const { latency, status } = usePing(3000);

  const getStatusColor = () => {
    switch (status) {
      case "good":
        return "bg-green-500";
      case "warning":
        return "bg-yellow-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-slate-400";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "good":
        return "Good";
      case "warning":
        return "Slow";
      case "error":
        return "Bad";
      default:
        return "Loading";
    }
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200">
      <Activity size={14} className="text-slate-500" />
      <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
      <span className="text-xs font-semibold text-slate-700">
        {latency !== null ? `${latency}ms` : getStatusText()}
      </span>
    </div>
  );
}
