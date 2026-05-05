"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Plus, Pencil, Trash2, X, Receipt, CalendarDays, Tag, CheckCircle2, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";

import BottomNav from "@/components/BottomNav";
import Notification from "@/components/Notification";
import type { IuranType } from "@/store/useAppStore";

export default function AdminIuranTypesPage() {
  const router = useRouter();
  const iuranTypes = useAppStore((s) => s.iuranTypes);
  const iuranPayments = useAppStore((s) => s.iuranPayments);
  const addIuranType = useAppStore((s) => s.addIuranType);
  const updateIuranType = useAppStore((s) => s.updateIuranType);
  const deleteIuranType = useAppStore((s) => s.deleteIuranType);
  const setNotif = useAppStore((s) => s.setNotif);
  const fetchIuranTypes = useAppStore((s) => s.fetchIuranTypes);
  const fetchIuranPayments = useAppStore((s) => s.fetchIuranPayments);
  const loadingIuranTypes = useAppStore((s) => s.loadingIuranTypes);
  const loadingIuranPayments = useAppStore((s) => s.loadingIuranPayments);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<IuranType | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState<{
    name: string;
    type: "monthly" | "weekly" | "custom";
    amount: string;
    description: string;
  }>({
    name: "",
    type: "monthly",
    amount: "",
    description: "",
  });

  useEffect(() => {
    fetchIuranTypes();
    fetchIuranPayments();
  }, [fetchIuranTypes, fetchIuranPayments]);

  const typeLabels: Record<string, string> = useMemo(() => ({
    monthly: "Bulanan",
    weekly: "Mingguan",
    custom: "Khusus",
  }), []);

  const typeColors: Record<string, string> = {
    monthly: "bg-blue-500",
    weekly: "bg-cyan-500",
    custom: "bg-rose-500",
  };

  const resetForm = () => {
    setForm({ name: "", type: "monthly", amount: "", description: "" });
    setEditingType(null);
    setDeleteConfirmId(null);
  };

  const openAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEdit = (t: IuranType) => {
    setEditingType(t);
    setForm({
      name: t.name,
      type: t.type as "monthly" | "weekly" | "custom",
      amount: String(t.amount),
      description: t.description ?? "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    const amountNum = Number(form.amount.replace(/\D/g, ""));
    if (!form.name.trim() || amountNum <= 0) {
      setNotif({ title: "Validasi Gagal", message: "Nama dan nominal wajib diisi dengan benar.", variant: "warning", role: "admin" });
      return;
    }

    setIsLoading(true);
    setTimeout(async () => {
      if (editingType) {
        const res = (await updateIuranType(editingType.id, {
          name: form.name,
          type: form.type,
          amount: amountNum,
          description: form.description,
        })) as { success: boolean; message: string };
        setNotif({ title: res.success ? "Berhasil" : "Gagal", message: res.message, variant: res.success ? "success" : "warning", role: "admin" });
      } else {
        const res = (await addIuranType({
          name: form.name,
          type: form.type,
          amount: amountNum,
          description: form.description,
        })) as { success: boolean; message: string };
        setNotif({ title: res.success ? "Berhasil" : "Gagal", message: res.message, variant: res.success ? "success" : "warning", role: "admin" });
      }
      setIsLoading(false);
      setIsModalOpen(false);
      resetForm();
    }, 400);
  };

  const handleDelete = async (id: number | null) => {
    if (id === null) return;
    const res = (await deleteIuranType(id)) as { success: boolean; message: string };
    setNotif({ title: res.success ? "Dihapus" : "Gagal", message: res.message, variant: res.success ? "success" : "warning", role: "admin" });
    setDeleteConfirmId(null);
  };

  const getPaymentCount = (typeId: number) => iuranPayments.filter((p) => p.iuranTypeId === typeId).length;
  const getPaidCount = (typeId: number) => iuranPayments.filter((p) => p.iuranTypeId === typeId && p.status === "Lunas").length;

  return (
    <div className="min-h-screen w-full max-w-md mx-auto bg-slate-50 relative overflow-x-hidden overflow-y-auto pb-28" style={{ paddingBottom: "calc(7rem + env(safe-area-inset-bottom))" }}>
      <Notification />
      <div style={{ display: loadingIuranTypes || loadingIuranPayments ? 'block' : 'none' }} className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <span className="text-slate-500 font-bold">Memuat data jenis iuran...</span>
          <div className="h-8 w-8 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin" />
        </div>
      </div>
      <div style={{ display: !(loadingIuranTypes || loadingIuranPayments) ? 'block' : 'none' }}>
        <div className="bg-linear-to-b from-cyan-500 via-blue-600 to-blue-700 text-white px-6 pt-7 pb-8 relative overflow-hidden animate-in fade-in duration-500">
          <div className="absolute -top-10 -right-8 h-28 w-28 rounded-full bg-cyan-200/35 blur-3xl" />
          <div className="absolute top-10 left-1/2 h-24 w-24 -translate-x-1/2 rounded-full bg-sky-200/20 blur-3xl" />
          <div className="absolute inset-0 bg-linear-to-br from-white/8 via-transparent to-blue-900/10" />
          <div className="relative z-10 flex items-start justify-between gap-3">
            <div>
              <div className="inline-flex items-center rounded-full border border-white/20 bg-[rgba(255,255,255,0.14)] px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-cyan-50 backdrop-blur-sm">
                <Receipt size={12} className="mr-1.5" /> Jenis Iuran
              </div>
              <h1 className="mt-3 text-3xl font-black tracking-tight">Jenis Iuran</h1>
              <p className="text-sm text-blue-50/92 mt-3 leading-relaxed max-w-80">Kelola semua jenis iuran: tambah, ubah nominal, atau hapus sesuai kebutuhan warga.</p>
            </div>
            <button onClick={() => router.push("/admin/iuran")} className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/20 bg-[rgba(255,255,255,0.14)] text-white shadow-lg backdrop-blur-sm transition-all hover:scale-105 active:scale-95 shrink-0">
              <ArrowLeft size={16} />
            </button>
          </div>
        </div>

      <div className="px-6 mt-4 space-y-4 pb-6">
        {loadingIuranTypes && (
          <div className="flex items-center justify-center gap-2 py-3">
            <div className="h-5 w-5 rounded-full border-2 border-blue-200 border-t-blue-500 animate-spin" />
            <p className="text-xs font-black text-slate-500">Memuat data...</p>
          </div>
        )}
        <div className="flex items-center justify-between">
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Daftar Jenis</p>
          <button onClick={openAdd} className="inline-flex items-center gap-1.5 rounded-full bg-linear-to-r from-blue-600 to-cyan-500 px-4 py-2 text-xs font-black text-white shadow-lg shadow-blue-100 transition-all hover:scale-105 active:scale-95">
            <Plus size={14} /> Tambah
          </button>
        </div>

        {iuranTypes.length === 0 ? (
          <div className="rounded-4xl border border-dashed border-blue-100 bg-white/80 px-6 py-12 text-center animate-in fade-in duration-500">
            <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-4">
              <Receipt size={24} className="text-blue-400" />
            </div>
            <p className="text-sm font-black text-slate-700">Belum Ada Jenis Iuran</p>
            <p className="text-xs text-slate-500 mt-1 max-w-60 mx-auto">Tambahkan jenis iuran pertama untuk mulai mencatat pembayaran warga.</p>
            <button onClick={openAdd} className="mt-4 rounded-2xl bg-blue-600 px-5 py-2.5 text-xs font-black text-white transition-all hover:bg-blue-700">Tambah Jenis Iuran</button>
          </div>
        ) : (
          <div className="grid gap-3">
            {iuranTypes.map((t, i) => {
              const totalPayments = getPaymentCount(t.id);
              const paidPayments = getPaidCount(t.id);
              const rate = totalPayments ? Math.round((paidPayments / totalPayments) * 100) : 0;

              return (
                <div key={t.id} className="rounded-4xl border border-blue-100/80 bg-white/90 shadow-sm p-5 transition-all hover:shadow-md animate-in fade-in duration-500" style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-2xl ${typeColors[t.type]}/10 border border-blue-100 flex items-center justify-center shrink-0`}>
                        <Receipt size={18} className="text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-black text-slate-800">{t.name}</h4>
                          <span className="rounded-full bg-blue-50 border border-blue-100 px-2 py-0.5 text-[10px] font-black text-blue-500 uppercase tracking-wider">{typeLabels[t.type]}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{t.description || "Tidak ada deskripsi"}</p>
                        <p className="text-xs font-black text-blue-600 mt-2">Rp {t.amount.toLocaleString("id-ID")} / {typeLabels[t.type].toLowerCase()}</p>
                      </div>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button onClick={() => openEdit(t)} className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center transition-all hover:scale-105 active:scale-95">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setDeleteConfirmId(t.id)} className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center transition-all hover:scale-105 active:scale-95">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                        <span>Kolektibilitas</span>
                        <span>{rate}%</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-blue-100 overflow-hidden">
                        <div className="h-full rounded-full bg-linear-to-r from-blue-400 to-cyan-400 transition-all duration-700" style={{ width: `${rate}%` }} />
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-black text-slate-700">{paidPayments}/{totalPayments}</p>
                      <p className="text-[10px] text-slate-500">bayar</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setIsModalOpen(false); resetForm(); }} />
          <div className="relative w-full max-w-md bg-white rounded-t-4xl sm:rounded-4xl p-6 shadow-2xl animate-in slide-in-from-bottom-8 duration-300 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-black text-slate-900">{editingType ? "Edit Jenis Iuran" : "Tambah Jenis Iuran"}</h3>
              <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 transition-all hover:bg-slate-200">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1.5 block">Nama Iuran</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Contoh: Iuran Kebersihan" className="w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-300 transition-colors" />
              </div>

              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1.5 block">Periode</label>
                <div className="flex gap-2">
                  {(["monthly", "weekly", "custom"] as const).map((t) => (
                    <button key={t} onClick={() => setForm({ ...form, type: t })} className={`flex-1 rounded-2xl border py-3 text-xs font-black transition-all ${form.type === t ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100" : "bg-white border-blue-100 text-slate-600"}`}>
                      {typeLabels[t]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1.5 block">Nominal (Rp)</label>
                <input value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} type="number" placeholder="50000" className="w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-300 transition-colors" />
              </div>

              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1.5 block">Deskripsi (Opsional)</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Keterangan tambahan..." className="w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-300 transition-colors resize-none" />
              </div>
            </div>

            <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={24} className="text-rose-500" />
            </div>
            <h3 className="text-lg font-black text-slate-900 text-center">Hapus Jenis Iuran?</h3>
            <p className="text-xs text-slate-600 text-center mt-2">Jenis iuran ini akan dihapus secara permanen. Pastikan tidak ada data pembayaran yang terkait.</p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 rounded-2xl border border-blue-100 bg-white py-3 text-xs font-black text-slate-600">Batal</button>
              <button onClick={() => deleteConfirmId !== null && handleDelete(deleteConfirmId)} className="flex-1 rounded-2xl bg-rose-500 py-3 text-xs font-black text-white shadow-lg shadow-rose-100 transition-all hover:bg-rose-600 active:scale-95">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}
      </div>
      <BottomNav />
    </div>
  );
}
