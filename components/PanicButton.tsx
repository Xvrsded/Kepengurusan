"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, CheckCircle } from "lucide-react";
import { panicService } from "@/services/panicService";
import { useAppStore } from "@/store/useAppStore";

export default function PanicButton() {
  const setNotif = useAppStore((s) => s.setNotif);
  const [isTriggering, setIsTriggering] = useState(false);
  const [isTriggered, setIsTriggered] = useState(false);

  const handlePanic = async () => {
    if (isTriggering || isTriggered) return;

    if (!confirm("Yakin ingin mengirim sinyal darurat? Admin akan diberitahu segera.")) {
      return;
    }

    setIsTriggering(true);

    const result = await panicService.triggerPanicAlert();

    setIsTriggering(false);

    if (result.success) {
      setIsTriggered(true);
      setNotif({
        title: "Sinyal Darurat Terkirim",
        message: "Admin telah diberitahu. Bantuan akan segera tiba.",
        variant: "warning",
      });

      // Reset after 30 seconds
      setTimeout(() => {
        setIsTriggered(false);
      }, 30000);
    } else {
      setNotif({
        title: "Gagal",
        message: result.error || "Gagal mengirim sinyal darurat.",
        variant: "warning",
      });
    }
  };

  return (
    <button
      onClick={handlePanic}
      disabled={isTriggering || isTriggered}
      className={`
        fixed bottom-24 right-6 z-50
        h-16 w-16 rounded-full
        flex items-center justify-center
        shadow-2xl transition-all
        hover:scale-110 active:scale-95
        ${isTriggering ? 'bg-slate-400 cursor-not-allowed' : 'bg-rose-600'}
        ${isTriggered ? 'animate-pulse' : ''}
        ${isTriggering ? '' : 'shadow-rose-300'}
      `}
    >
      {isTriggering ? (
        <Loader2 size={28} className="text-white animate-spin" />
      ) : isTriggered ? (
        <CheckCircle size={28} className="text-white" />
      ) : (
        <AlertTriangle size={28} className="text-white" />
      )}
    </button>
  );
}
