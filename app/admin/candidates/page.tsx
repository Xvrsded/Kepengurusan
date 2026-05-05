"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users, Plus, Trash2, Edit, Loader2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { candidatesService } from "@/services/candidatesService";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function CandidatesPage() {
  const router = useRouter();
  const setNotif = useAppStore((s) => s.setNotif);
  const candidates = useAppStore((s) => s.candidates);
  const loadingCandidates = useAppStore((s) => s.loadingCandidates);
  const fetchCandidates = useAppStore((s) => s.fetchCandidates);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<any>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; candidateId: number | null }>({ isOpen: false, candidateId: null });

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const handleAdd = () => {
    setName("");
    setDescription("");
    setEditingCandidate(null);
    setShowAddModal(true);
  };

  const handleEdit = (candidate: any) => {
    setName(candidate.name);
    setDescription(candidate.description || "");
    setEditingCandidate(candidate);
    setShowAddModal(true);
  };

  const handleDelete = async (id: number) => {
    setConfirmDialog({ isOpen: true, candidateId: id });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDialog.candidateId) return;

    const result = await candidatesService.deleteCandidate(confirmDialog.candidateId);
    if (result.success) {
      setNotif({
        title: "Berhasil",
        message: "Calon berhasil dihapus.",
        variant: "success",
      });
      await fetchCandidates();
    } else {
      setNotif({
        title: "Gagal",
        message: result.error || "Gagal menghapus calon.",
        variant: "warning",
      });
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setNotif("Nama calon wajib diisi.");
      return;
    }

    setIsSaving(true);

    if (editingCandidate) {
      const result = await candidatesService.updateCandidate(editingCandidate.id, {
        name: name.trim(),
        description: description.trim() || null
      });

      setIsSaving(false);

      if (result.success) {
        setNotif({
          title: "Berhasil",
          message: "Calon berhasil diperbarui.",
          variant: "success",
        });
        setShowAddModal(false);
        await fetchCandidates();
      } else {
        setNotif({
          title: "Gagal",
          message: result.error || "Gagal memperbarui calon.",
          variant: "warning",
        });
      }
    } else {
      const result = await candidatesService.addCandidate({
        name: name.trim(),
        description: description.trim() || null,
        photo_url: null,
        is_active: true
      });

      setIsSaving(false);

      if (result.success) {
        setNotif({
          title: "Berhasil",
          message: "Calon berhasil ditambahkan.",
          variant: "success",
        });
        setShowAddModal(false);
        await fetchCandidates();
      } else {
        setNotif({
          title: "Gagal",
          message: result.error || "Gagal menambahkan calon.",
          variant: "warning",
        });
      }
    }
  };

  if (loadingCandidates) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="bg-linear-to-br from-indigo-600 via-purple-600 to-pink-600 text-white px-6 pt-7 pb-8">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.push("/admin")}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm transition-all hover:scale-105"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-2xl font-black tracking-tight">Calon Pemilihan RT</h1>
        </div>
        <p className="text-indigo-100 text-sm">Kelola daftar calon untuk pemilihan RT</p>
      </div>

      <div className="p-6 max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-slate-900">Daftar Calon</h2>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all hover:scale-105 active:scale-95"
          >
            <Plus size={18} />
            <span>Tambah Calon</span>
          </button>
        </div>

        {candidates.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100 text-center">
            <Users className="mx-auto h-16 w-16 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">Belum Ada Calon</h3>
            <p className="text-slate-500 mb-6">Tambahkan calon untuk memulai pemilihan RT</p>
            <button
              onClick={handleAdd}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold"
            >
              Tambah Calon Pertama
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {candidates.map((candidate) => (
              <div
                key={candidate.id}
                className="bg-white rounded-2xl shadow-lg p-4 border border-slate-100 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {candidate.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{candidate.name}</h3>
                    {candidate.description && (
                      <p className="text-sm text-slate-500">{candidate.description}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">
                      {candidate.vote_count} suara
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(candidate)}
                    className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(candidate.id)}
                    className="p-2 rounded-xl bg-rose-100 text-rose-600 hover:bg-rose-200 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              {editingCandidate ? "Edit Calon" : "Tambah Calon"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Nama Calon
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama lengkap calon"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Deskripsi (Opsional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Deskripsi singkat calon"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold transition-colors hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold transition-colors hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    "Simpan"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, candidateId: null })}
        onConfirm={handleConfirmDelete}
        title="Hapus Calon"
        message="Yakin ingin menghapus calon ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="danger"
      />
    </div>
  );
}
