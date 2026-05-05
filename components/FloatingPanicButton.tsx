"use client";

import { useState } from "react";
import { AlertTriangle, X, Loader2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { createClient } from "@/lib/supabase/client";
import { toast } from "react-hot-toast";

export default function FloatingPanicButton() {
  const supabase = createClient();
  const user = useAppStore((s) => s.supabaseUser);
  const role = useAppStore((s) => s.role);
  const setNotif = useAppStore((s) => s.setNotif);

  const [loading, setLoading] = useState(false);
  const [isPanicModalOpen, setIsPanicModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Only show for warga
  if (!user || role !== "warga") return null;

  const handlePanic = async () => {
    if (loading) return;
    setIsPanicModalOpen(true);
  };

  const handleConfirmPanic = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("panic_alerts").insert({
        user_id: user.id,
        message: "Panic button triggered",
        status: "active",
      });

      if (error) {
        console.error("PANIC ERROR:", error);
        toast.error("Gagal mengirim alert: " + error.message);
        return;
      }

      toast.success("Peringatan darurat terkirim!");
      setIsPanicModalOpen(false);
    } catch (err) {
      console.error("PANIC EXCEPTION:", err);
      toast.error("Terjadi kesalahan saat mengirim alert");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={handlePanic}
        className="
          fixed bottom-24 right-4 z-50
          h-14 w-14
          rounded-full
          bg-red-500
          text-white
          shadow-2xl
          flex items-center justify-center
          transition-all duration-300
          hover:scale-110
          active:scale-95
          animate-pulse
        "
        disabled={loading}
      >
        <AlertTriangle size={24} />
      </button>

      {isPanicModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-md mx-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle size={24} className="text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Kirim Peringatan Darurat?</h3>
              </div>
              <button
                onClick={() => setIsPanicModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-slate-600 mb-6">
              Apakah Anda yakin ingin mengirim sinyal darurat ke Admin RT 08 RW 04? Gunakan hanya dalam keadaan mendesak.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsPanicModalOpen(false)}
                className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 rounded-xl font-bold transition-colors hover:bg-slate-200"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmPanic}
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Mengirim...</span>
                  </>
                ) : (
                  "Kirim Sekarang"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
