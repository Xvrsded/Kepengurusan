"use client";

import { useEffect, useState, useMemo } from "react";
import { ArrowLeft, CheckCircle2, X, Clock, AlertCircle, Image as ImageIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useAuthGuard } from "@/lib/useAuthGuard";
import BottomNav from "@/components/BottomNav";
import Notification from "@/components/Notification";
import { createClient } from "@/lib/supabase/client";

export default function AdminIuranVerificationsPage() {
  useAuthGuard();
  const router = useRouter();
  const supabase = createClient();
  
  const supabaseUser = useAppStore((s) => s.supabaseUser);
  const setNotif = useAppStore((s) => s.setNotif);
  
  const [iuranUserList, setIuranUserList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchPendingPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('iuran_user')
        .select('*, iuran_master(*), profiles(*)')
        .in('status', ['pending', 'rejected'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIuranUserList(data || []);
    } catch (error: any) {
      console.error('Error fetching pending payments:', error);
      setNotif({
        title: "Error",
        message: error.message || "Gagal memuat data pembayaran",
        variant: "warning",
        role: "admin"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!supabaseUser?.id) return;
    fetchPendingPayments();
  }, [supabaseUser?.id]);

  const handleApprove = async (iuranUserId: string) => {
    if (!supabaseUser?.id) return;
    setProcessingId(iuranUserId);
    try {
      const { error } = await supabase
        .from('iuran_user')
        .update({
          status: 'paid',
          verified_by: supabaseUser.id,
          verified_at: new Date().toISOString()
        })
        .eq('id', iuranUserId);

      if (error) throw error;

      setNotif({
        title: "Berhasil",
        message: "Pembayaran berhasil diverifikasi",
        variant: "success",
        role: "admin"
      });
      fetchPendingPayments();
    } catch (error: any) {
      console.error('Error approving payment:', error);
      setNotif({
        title: "Gagal",
        message: error.message || "Gagal memverifikasi pembayaran",
        variant: "warning",
        role: "admin"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (iuranUserId: string) => {
    if (!supabaseUser?.id) return;
    setProcessingId(iuranUserId);
    try {
      const { error } = await supabase
        .from('iuran_user')
        .update({
          status: 'rejected',
          verified_by: supabaseUser.id,
          verified_at: new Date().toISOString()
        })
        .eq('id', iuranUserId);

      if (error) throw error;

      setNotif({
        title: "Berhasil",
        message: "Pembayaran ditolak",
        variant: "success",
        role: "admin"
      });
      fetchPendingPayments();
    } catch (error: any) {
      console.error('Error rejecting payment:', error);
      setNotif({
        title: "Gagal",
        message: error.message || "Gagal menolak pembayaran",
        variant: "warning",
        role: "admin"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const filteredList = useMemo(() => {
    return iuranUserList.filter((iu) => iu.status === 'pending' || iu.status === 'rejected');
  }, [iuranUserList]);

  if (!supabaseUser) {
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
          <span className="text-slate-500 font-bold">Memuat data pembayaran...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-md mx-auto bg-slate-50 relative overflow-x-hidden overflow-y-auto pb-28">
      <Notification />
      
      {/* Header */}
      <div className="bg-linear-to-b from-indigo-500 via-purple-600 to-blue-700 text-white px-6 pt-7 pb-8 relative overflow-hidden">
        <div className="absolute -top-10 -right-8 h-28 w-28 rounded-full bg-purple-200/35 blur-3xl" />
        <div className="absolute top-10 left-1/2 h-24 w-24 -translate-x-1/2 rounded-full bg-blue-200/20 blur-3xl" />
        
        <div className="relative z-10 flex items-start justify-between gap-3">
          <div>
            <button onClick={() => router.push("/admin/iuran")} className="mb-3 flex items-center gap-2 text-white/80 hover:text-white transition-colors">
              <ArrowLeft size={16} />
              <span className="text-xs font-bold">Kembali</span>
            </button>
            <h1 className="text-2xl font-black tracking-tight">Verifikasi Pembayaran</h1>
            <p className="text-sm text-blue-50/92 mt-2">Verifikasi bukti transfer dari warga</p>
          </div>
        </div>
      </div>

      <div className="px-6 mt-4 space-y-4">
        {filteredList.length === 0 ? (
          <div className="rounded-4xl border border-dashed border-indigo-100 bg-white/80 px-6 py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={24} className="text-indigo-400" />
            </div>
            <p className="text-sm font-black text-slate-700">Tidak Ada Pembayaran Pending</p>
            <p className="text-xs text-slate-500 mt-1 max-w-60 mx-auto">Semua pembayaran sudah diverifikasi.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredList.map((iu) => {
              const master = iu.iuran_master;
              const profile = iu.profiles;
              const isPending = iu.status === 'pending';
              
              return (
                <div key={iu.id} className="rounded-4xl border border-indigo-100/80 bg-white/90 shadow-sm p-5">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-black text-slate-800">{master?.title || 'Iuran'}</h3>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                          isPending ? 'bg-yellow-50 text-yellow-600 border border-yellow-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                        }`}>
                          {isPending ? 'Pending' : 'Rejected'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {profile?.name || 'Unknown'} • Rp {(master?.amount || 0).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>

                  {/* Proof Image */}
                  {iu.proof_url && (
                    <div className="mb-4">
                      <div 
                        className="rounded-2xl border border-slate-200 overflow-hidden cursor-pointer hover:border-blue-300 transition-colors"
                        onClick={() => window.open(iu.proof_url, '_blank')}
                      >
                        <img
                          src={iu.proof_url}
                          alt="Bukti Transfer"
                          className="w-full h-48 object-cover"
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 text-center">Klik untuk memperbesar</p>
                    </div>
                  )}

                  {/* Notes */}
                  {iu.notes && (
                    <div className="mb-4 rounded-2xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-600">{iu.notes}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(iu.id)}
                      disabled={processingId === iu.id}
                      className="flex-1 rounded-2xl bg-green-500 py-2.5 text-xs font-black text-white transition-all hover:bg-green-600 disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {processingId === iu.id ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Memproses...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={14} />
                          <span>Approve</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleReject(iu.id)}
                      disabled={processingId === iu.id}
                      className="flex-1 rounded-2xl bg-rose-500 py-2.5 text-xs font-black text-white transition-all hover:bg-rose-600 disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {processingId === iu.id ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Memproses...</span>
                        </>
                      ) : (
                        <>
                          <X size={14} />
                          <span>Reject</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
