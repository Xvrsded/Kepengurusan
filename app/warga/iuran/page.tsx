"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { ArrowLeft, Receipt, CheckCircle2, AlertCircle, Clock, TrendingUp, Filter, Copy, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useAuthGuard } from "@/lib/useAuthGuard";
import BottomNav from "@/components/BottomNav";
import Notification from "@/components/Notification";
import PaymentModal from "@/components/PaymentModal";
import { createClient } from "@/lib/supabase/client";
import { toast } from "react-hot-toast";

// ⚡ GLOBAL CACHE FOR INSTANT LOAD
let GLOBAL_IURAN_CACHE: any[] | null = null;

export default function WargaIuranPage() {
  useAuthGuard();
  const router = useRouter();
  const supabase = createClient();
  
  // Store state
  const supabaseUser = useAppStore((s) => s.supabaseUser);
  const setNotif = useAppStore((s) => s.setNotif);
  const iuranUser = useAppStore((s) => s.iuranUser);
  const fetchUserIuran = useAppStore((s) => s.fetchUserIuran);

  // Local state
  const [loading, setLoading] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "unpaid" | "paid" | "overdue">("all");
  
  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedIuranId, setSelectedIuranId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Payment confirmation form state
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [formData, setFormData] = useState({
    nama: '',
    blok_rumah: '',
    no_telp: '',
    bukti_transfer: null as File | null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stable userId reference
  const userId = supabaseUser?.id;

  // Realtime subscription - optimized with direct state update
  const realtimeTimeoutRef = useRef<any>(null);

  useEffect(() => {
    if (!userId) return;

    console.log('[WARGA IURAN] Fetching for user ID:', userId);
    console.log('[WARGA IURAN] SupabaseUser ID:', supabaseUser?.id);

    fetchUserIuran(userId);

    const handleRealtimeChange = (payload: any) => {
      console.log('[WARGA IURAN] Realtime change:', payload);
      fetchUserIuran(userId);
    };

    const channel = supabase
      .channel('iuran-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'iuran_user',
        filter: `user_id=eq.${userId}`
      }, (payload: any) => {
        handleRealtimeChange(payload);
      })
      .subscribe((status: any) => {
        if (status === 'SUBSCRIBED') {
          console.log('[WARGA IURAN] Realtime subscribed');
        }
      });

    return () => {
      clearTimeout(realtimeTimeoutRef.current);
      supabase.removeChannel(channel);
    };
  }, [supabase, userId, fetchUserIuran, supabaseUser]);

  // Calculate display status with overdue logic
  const iuranWithStatus = useMemo(() => {
    return iuranUser.map((iu: any) => {
      const isOverdue = iu.status === 'unpaid' && iu.iuran_master && new Date(iu.iuran_master.due_date) < new Date();
      return {
        ...iu,
        displayStatus: isOverdue ? 'overdue' : iu.status,
      };
    });
  }, [iuranUser]);

  // Filter based on status
  const filteredIuran = useMemo(() => {
    if (statusFilter === 'all') return iuranWithStatus;
    return iuranWithStatus.filter((iu) => iu.displayStatus === statusFilter);
  }, [iuranWithStatus, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = iuranWithStatus.length;
    const paid = iuranWithStatus.filter((iu) => iu.status === 'paid').length;
    const unpaid = iuranWithStatus.filter((iu) => iu.status === 'unpaid').length;
    const overdue = iuranWithStatus.filter((iu) => iu.displayStatus === 'overdue').length;
    const totalPaidAmount = iuranWithStatus
      .filter((iu) => iu.status === 'paid')
      .reduce((sum, iu) => sum + (iu.iuran_master?.amount || 0), 0);
    
    return { total, paid, unpaid, overdue, totalPaidAmount };
  }, [iuranWithStatus]);

  // Open payment modal
  const handleOpenPaymentModal = (iuranId: string) => {
    setSelectedIuranId(iuranId);
    setShowPaymentModal(true);
  };

  // Upload proof and submit payment
  const handleUploadProof = async (file: File, notes: string) => {
    if (!selectedIuranId || !supabaseUser?.id) return;

    setIsUploading(true);

    try {
      // Upload to Supabase Storage
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `${supabaseUser.id}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(filePath, file);

      if (uploadError) {
        throw new Error('Gagal upload bukti: ' + uploadError.message);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(filePath);

      // Update iuran_user
      const { error: updateError } = await supabase
        .from('iuran_user')
        .update({
          proof_url: publicUrl,
          status: 'pending',
          paid_at: new Date().toISOString(),
          notes: notes || null
        })
        .eq('id', selectedIuranId);

      if (updateError) {
        throw new Error('Gagal update status: ' + updateError.message);
      }

      setNotif({
        title: "Berhasil",
        message: "Bukti transfer berhasil diupload. Menunggu verifikasi admin.",
        variant: "success",
        role: "warga"
      });

      setShowPaymentModal(false);
      setSelectedIuranId(null);
      fetchUserIuran(supabaseUser.id);
    } catch (error: any) {
      console.error('Upload error:', error);
      setNotif({
        title: "Gagal",
        message: error.message || "Terjadi kesalahan saat upload bukti",
        variant: "warning",
        role: "warga"
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Fallback loading user check
  if (!supabaseUser) {
    console.log('[WARGA IURAN] User not ready, showing loading');
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-4 border-indigo-200 border-t-indigo-500 animate-spin" />
          <span className="text-slate-500 font-bold">Memuat user...</span>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-4 border-indigo-200 border-t-indigo-500 animate-spin" />
          <span className="text-slate-500 font-bold">Memuat data iuran...</span>
        </div>
      </div>
    );
  }

  // Payment action - with optimistic update
  const handlePay = async (iuranId: string) => {
    setPayingId(iuranId);

    try {
      const { error } = await supabase
        .from('iuran_user')
        .update({
          status: 'paid'
        })
        .eq('id', iuranId);

      if (error) {
        console.error('[WARGA IURAN] Payment error:', error.message || error.details || JSON.stringify(error));
        setNotif({ title: "Gagal", message: "Pembayaran gagal, silakan coba lagi", variant: "warning", role: "warga" });
        return;
      }

      // Refresh data after successful payment
      fetchUserIuran(userId!);
      setNotif({ title: "Berhasil", message: "Pembayaran berhasil dikonfirmasi", variant: "success", role: "warga" });
    } catch (err) {
      console.error('[WARGA IURAN] Payment exception:', err);
      setNotif({ title: "Gagal", message: "Terjadi kesalahan", variant: "warning", role: "warga" });
    } finally {
      setPayingId(null);
    }
  };

  // Copy to clipboard function
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Nomor rekening berhasil disalin');
    } catch (error) {
      toast.error('Gagal menyalin nomor rekening');
    }
  };

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, bukti_transfer: file }));
    }
  };

  // Handle form submission
  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nama || !formData.blok_rumah || !formData.no_telp || !formData.bukti_transfer) {
      toast.error('Mohon lengkapi semua field');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload file to Supabase Storage
      const fileName = `${Date.now()}-${formData.bukti_transfer.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('bukti_transfer')
        .upload(fileName, formData.bukti_transfer);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error('Gagal mengupload bukti transfer');
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('bukti_transfer')
        .getPublicUrl(fileName);

      // Insert to database
      const { error: insertError } = await supabase
        .from('iuran_payments')
        .insert({
          nama: formData.nama,
          blok_rumah: formData.blok_rumah,
          no_telp: formData.no_telp,
          bukti_url: urlData.publicUrl,
          status: 'Menunggu Konfirmasi'
        });

      if (insertError) {
        console.error('Insert error:', insertError);
        toast.error('Gagal menyimpan data pembayaran');
        return;
      }

      toast.success('Konfirmasi pembayaran berhasil dikirim');
      
      // Reset form
      setFormData({
        nama: '',
        blok_rumah: '',
        no_telp: '',
        bukti_transfer: null
      });
      setShowPaymentForm(false);
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Terjadi kesalahan saat mengirim konfirmasi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full max-w-md mx-auto bg-slate-50 relative overflow-x-hidden overflow-y-auto pb-28" style={{ paddingBottom: "calc(7rem + env(safe-area-inset-bottom))" }}>
      <Notification />
      
      {/* Header */}
      <div className="bg-linear-to-b from-cyan-500 via-blue-600 to-blue-700 text-white px-6 pt-7 pb-8 relative overflow-hidden">
        <div className="absolute -top-10 -right-8 h-28 w-28 rounded-full bg-cyan-200/35 blur-3xl" />
        <div className="absolute top-10 left-1/2 h-24 w-24 -translate-x-1/2 rounded-full bg-sky-200/20 blur-3xl" />
        
        <div className="relative z-10 flex items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center rounded-full border border-white/20 bg-[rgba(255,255,255,0.14)] px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-cyan-50 backdrop-blur-sm">
              <Receipt size={12} className="mr-1.5" /> Tagihan Saya
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight">Iuran Warga</h1>
            <p className="text-sm text-blue-50/92 mt-3 leading-relaxed max-w-80">Lihat semua jenis iuran, status pembayaran, dan bayar langsung dari sini.</p>
          </div>
          <button onClick={() => router.push("/warga")} className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/20 bg-[rgba(255,255,255,0.14)] text-white shadow-lg backdrop-blur-sm transition-all hover:scale-105 active:scale-95 shrink-0">
            <ArrowLeft size={16} />
          </button>
        </div>

        {/* Stats card */}
        {stats.totalPaidAmount > 0 && (
          <div className="mt-6 rounded-4xl border border-white/20 bg-[rgba(255,255,255,0.12)] p-5 backdrop-blur-sm shadow-2xl shadow-blue-700/20">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-2xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600">
                <TrendingUp size={15} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-cyan-50">Total Terbayar</p>
            </div>
            <p className="text-2xl font-black text-white">Rp {stats.totalPaidAmount.toLocaleString("id-ID")}</p>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-xs text-blue-50/88">{stats.paid} lunas</p>
              <p className="text-xs text-blue-50/88">{stats.unpaid} belum</p>
              {stats.overdue > 0 && (
                <p className="text-xs text-yellow-200 font-bold">{stats.overdue} terlambat</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-6 mt-4 space-y-4 pb-6">
        {/* Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all whitespace-nowrap ${
              statusFilter === 'all' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            Semua ({stats.total})
          </button>
          <button
            onClick={() => setStatusFilter('unpaid')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all whitespace-nowrap ${
              statusFilter === 'unpaid' 
                ? 'bg-rose-500 text-white shadow-lg' 
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            Belum ({stats.unpaid})
          </button>
          <button
            onClick={() => setStatusFilter('paid')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all whitespace-nowrap ${
              statusFilter === 'paid' 
                ? 'bg-green-500 text-white shadow-lg' 
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            Lunas ({stats.paid})
          </button>
          {stats.overdue > 0 && (
            <button
              onClick={() => setStatusFilter('overdue')}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition-all whitespace-nowrap ${
                statusFilter === 'overdue' 
                  ? 'bg-yellow-500 text-white shadow-lg' 
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              Terlambat ({stats.overdue})
            </button>
          )}
        </div>

        {/* Bank Account Info Card */}
        <div className="rounded-4xl border border-blue-100/80 bg-white/90 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Receipt size={15} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">Rekening Tujuan Transfer</p>
          </div>
          
          <div className="space-y-3">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-slate-700">Bank BSI</p>
                <button
                  onClick={() => copyToClipboard('7999333979')}
                  className="p-2 rounded-xl bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Copy size={14} />
                </button>
              </div>
              <p className="text-lg font-black text-slate-900 mb-1">7999333979</p>
              <p className="text-[10px] text-slate-600">a.n. RT 08 RW 04 Latsari</p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-slate-700">Bank BSI</p>
                <button
                  onClick={() => copyToClipboard('7197450252')}
                  className="p-2 rounded-xl bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Copy size={14} />
                </button>
              </div>
              <p className="text-lg font-black text-slate-900 mb-1">7197450252</p>
              <p className="text-[10px] text-slate-600">a.n. Musholla Nurusshobah</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowPaymentForm(!showPaymentForm)}
            className="w-full mt-4 rounded-2xl bg-linear-to-r from-blue-600 to-cyan-500 py-3 text-xs font-black text-white shadow-lg shadow-blue-100 transition-all hover:scale-[1.01] active:scale-95"
          >
            {showPaymentForm ? 'Tutup Form Konfirmasi' : 'Konfirmasi Pembayaran'}
          </button>
        </div>

        {/* Payment Confirmation Form */}
        {showPaymentForm && (
          <div className="rounded-4xl border border-blue-100/80 bg-white/90 shadow-sm p-5 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center text-green-600">
                <Upload size={15} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-green-600">Form Konfirmasi Pembayaran</p>
            </div>
            
            <form onSubmit={handleSubmitPayment} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Nama Lengkap *</label>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan nama lengkap"
                />
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Blok Rumah *</label>
                <input
                  type="text"
                  name="blok_rumah"
                  value={formData.blok_rumah}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Contoh: A-12"
                />
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">No Telpon *</label>
                <input
                  type="text"
                  name="no_telp"
                  value={formData.no_telp}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Contoh: 08123456789"
                />
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Bukti Transfer *</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {formData.bukti_transfer && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, bukti_transfer: null }))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                {formData.bukti_transfer && (
                  <p className="text-[10px] text-slate-500 mt-1">{formData.bukti_transfer.name}</p>
                )}
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-linear-to-r from-green-600 to-emerald-500 py-3 text-xs font-black text-white shadow-lg shadow-green-100 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Mengirim...' : 'Kirim Konfirmasi'}
              </button>
            </form>
          </div>
        )}

        {/* Iuran list */}
        <div>
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Daftar Tagihan</p>
          
          {filteredIuran.length === 0 ? (
            <div className="rounded-4xl border border-dashed border-blue-100 bg-white/70 px-4 py-8 text-center">
              <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-3">
                <Receipt size={20} className="text-blue-400" />
              </div>
              <p className="text-sm font-bold text-slate-700">Tidak Ada Tagihan</p>
              <p className="text-xs text-slate-500 mt-1 max-w-60 mx-auto">
                {statusFilter === 'all' ? 'Saat ini tidak ada data pembayaran iuran.' : `Tidak ada tagihan dengan status ${statusFilter}.`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredIuran.map((iu, index) => {
                const master = iu.iuran_master;
                const displayStatus = iu.displayStatus;
                
                return (
                  <div 
                    key={iu.id} 
                    className={`bg-white/90 p-4 rounded-4xl border shadow-sm animate-in fade-in transition-all hover:shadow-md ${
                      displayStatus === 'overdue' ? 'border-yellow-200' : 'border-blue-100/70'
                    }`}
                    style={{ animationDelay: `${index * 40}ms` }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                          displayStatus === 'paid' 
                            ? 'bg-green-50 border-green-100 text-green-600' 
                            : displayStatus === 'overdue' 
                            ? 'bg-yellow-50 border-yellow-100 text-yellow-600' 
                            : 'bg-rose-50 border-rose-100 text-rose-500'
                        }`}>
                          {displayStatus === 'paid' ? <CheckCircle2 size={18} /> : displayStatus === 'overdue' ? <Clock size={18} /> : <AlertCircle size={18} />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-black text-slate-800">{master?.title ?? 'Iuran'}</h4>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
                              displayStatus === 'paid' 
                                ? 'bg-green-100 text-green-600' 
                                : displayStatus === 'overdue' 
                                ? 'bg-yellow-100 text-yellow-600' 
                                : 'bg-rose-100 text-rose-600'
                            }`}>
                              {displayStatus === 'paid' ? 'Lunas' : displayStatus === 'overdue' ? 'Terlambat' : 'Belum'}
                            </span>
                          </div>
                          {master?.due_date && (
                            <p className="text-xs text-slate-600 mt-1">
                              Tenggat: {new Date(master.due_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                            </p>
                          )}
                          <p className="text-xs font-black text-blue-600 mt-1">
                            Rp {(master?.amount || 0).toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {displayStatus === 'unpaid' && (
                      <div className="mt-3">
                        <button 
                          onClick={() => handleOpenPaymentModal(iu.id)} 
                          className="w-full rounded-2xl bg-linear-to-r from-blue-600 to-cyan-500 py-2.5 text-xs font-black text-white shadow-lg shadow-blue-100 transition-all hover:scale-[1.01] active:scale-95"
                        >
                          Upload Bukti Transfer
                        </button>
                      </div>
                    )}
                    {displayStatus === 'rejected' && (
                      <div className="mt-3">
                        <button 
                          onClick={() => handleOpenPaymentModal(iu.id)} 
                          className="w-full rounded-2xl bg-linear-to-r from-rose-500 to-orange-500 py-2.5 text-xs font-black text-white shadow-lg shadow-rose-100 transition-all hover:scale-[1.01] active:scale-95"
                        >
                          Upload Ulang Bukti
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <BottomNav />

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSubmit={handleUploadProof}
        isLoading={isUploading}
      />
    </div>
  );
}
