"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users, CheckCircle2, Loader2, X, Vote, Clock } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { getCandidates, checkHasVoted, submitVote } from "./actions";
import { toast } from "react-hot-toast";
import BottomNav from "@/components/BottomNav";
import { createClient } from "@/lib/supabase/client";

export default function VotingPage() {
  const router = useRouter();
  const supabase = createClient();
  const user = useAppStore((s) => s.supabaseUser);
  const role = useAppStore((s) => s.role);

  // Store cache
  const candidates = useAppStore((s) => s.candidates);
  const hasVoted = useAppStore((s) => s.hasVoted);
  const votingActive = useAppStore((s) => s.votingActive);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; candidateId: number | null; candidateName: string }>({ isOpen: false, candidateId: null, candidateName: "" });

  useEffect(() => {
    if (!user || role !== "warga") {
      router.replace("/warga");
      return;
    }
  }, [user, role, router]);

  const handleVote = (candidateId: number, candidateName: string) => {
    setConfirmDialog({ isOpen: true, candidateId, candidateName });
  };

  const handleConfirmVote = async () => {
    if (!confirmDialog.candidateId || !user) return;

    setIsSubmitting(true);
    try {
      const result = await submitVote(user.id, confirmDialog.candidateId);
      if (result.success) {
        toast.success("Suara Anda telah berhasil direkam!");
        setConfirmDialog({ isOpen: false, candidateId: null, candidateName: "" });
        // Refresh data from store
        const { checkHasVoted } = await import("./actions");
        const voted = await checkHasVoted(user.id);
        useAppStore.setState({ hasVoted: voted });
      } else {
        toast.error("Gagal memberikan suara");
      }
    } catch (error) {
      console.error("Error submitting vote:", error);
      toast.error("Terjadi kesalahan saat memberikan suara");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto w-full min-h-screen bg-slate-50 overflow-x-hidden pb-24">
      <div className="bg-linear-to-br from-indigo-600 via-blue-600 to-cyan-500 text-white px-6 pt-7 pb-8">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.push("/warga")}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm transition-all hover:scale-105"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-2xl font-black tracking-tight">Pemilihan Ketua RT/RW</h1>
        </div>
        <p className="text-indigo-100 text-sm">Gunakan hak suara Anda untuk memilih pemimpin lingkungan</p>
      </div>

      <div className="p-4 max-w-md mx-auto">
        {!votingActive ? (
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100 text-center">
            <Clock size={48} className="mx-auto text-amber-500 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">⏳ Pemilihan Ketua RT/RW belum dimulai</h3>
            <p className="text-slate-500 mb-6">Silakan tunggu informasi dari Admin</p>
            <button
              onClick={() => router.push("/warga")}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors"
            >
              Kembali ke Dashboard
            </button>
          </div>
        ) : (
          <>
            {hasVoted && (
              <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-3xl p-4 flex items-center gap-3">
                <CheckCircle2 size={24} className="text-emerald-600" />
                <div>
                  <p className="font-bold text-emerald-900">Terima kasih, Anda sudah memberikan hak suara.</p>
                  <p className="text-sm text-emerald-700">Suara yang sudah masuk tidak dapat diubah.</p>
                </div>
              </div>
            )}

            {candidates.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100 text-center">
                <Users className="mx-auto h-16 w-16 text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">Belum Ada Kandidat</h3>
                <p className="text-slate-500">Kandidat pemilihan belum ditambahkan oleh admin</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {candidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="bg-white rounded-3xl shadow-lg p-6 border border-slate-100 flex flex-col items-center text-center transition-all hover:shadow-xl"
                  >
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg">
                      {candidate.name.charAt(0).toUpperCase()}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{candidate.name}</h3>
                    {candidate.description && (
                      <p className="text-sm text-slate-600 mb-4 line-clamp-2">{candidate.description}</p>
                    )}
                    {!hasVoted && (
                      <button
                        onClick={() => handleVote(candidate.id, candidate.name)}
                        disabled={isSubmitting || !votingActive}
                        className="mt-auto w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Vote size={18} />
                        <span>Pilih Kandidat</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, candidateId: null, candidateName: "" })}
        onConfirm={handleConfirmVote}
        title="Konfirmasi Pilihan"
        message={`Apakah Anda yakin ingin memilih ${confirmDialog.candidateName}? Suara yang sudah masuk tidak dapat diubah.`}
        confirmText="Ya, Pilih"
        cancelText="Batal"
        variant="info"
        isSubmitting={isSubmitting}
      />
      <BottomNav />
    </div>
  );
}

function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, variant, isSubmitting }: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  variant: "danger" | "warning" | "info";
  isSubmitting: boolean;
}) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      confirm: "bg-rose-600 hover:bg-rose-700 text-white",
      icon: "bg-rose-100 text-rose-600",
    },
    warning: {
      confirm: "bg-amber-600 hover:bg-amber-700 text-white",
      icon: "bg-amber-100 text-amber-600",
    },
    info: {
      confirm: "bg-indigo-600 hover:bg-indigo-700 text-white",
      icon: "bg-indigo-100 text-indigo-600",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Tutup"
        >
          <X size={20} />
        </button>

        <div className="flex items-start gap-4 mb-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${styles.icon}`}>
            <Vote size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 rounded-xl font-bold transition-colors hover:bg-slate-200"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className={`flex-1 py-3 px-4 rounded-xl font-bold transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${styles.confirm}`}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
