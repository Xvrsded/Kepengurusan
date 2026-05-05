"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertTriangle, CheckCircle, Clock, Loader2, User, MapPin } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { panicService } from "@/services/panicService";
import { RealtimeChannel } from "@supabase/supabase-js";
import ConfirmDialog from "@/components/ConfirmDialog";
import BottomNav from "@/components/BottomNav";
import { createClient } from "@/lib/supabase/client";

export default function PanicAlertsPage() {
  const router = useRouter();
  const supabase = createClient();
  const setNotif = useAppStore((s) => s.setNotif);
  const panicAlerts = useAppStore((s) => s.panicAlerts);
  const loadingPanicAlerts = useAppStore((s) => s.loadingPanicAlerts);
  const fetchPanicAlerts = useAppStore((s) => s.fetchPanicAlerts);

  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; alertId: string | null }>({ isOpen: false, alertId: null });

  useEffect(() => {
    console.log("👀 ADMIN PAGE RENDER");
    fetchPanicAlerts();

    // Setup realtime subscription - match working pattern from warga iuran page
    const panicChannel = supabase
      .channel('panic-alerts-admin')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'panic_alerts'
      }, (payload: any) => {
        console.log("🚨 PANIC ALERT EVENT:", payload);
        console.log("🚨 EVENT TYPE:", payload.eventType);
        console.log("🚨 RECORD:", payload.record);

        if (payload.eventType === "INSERT") {
          alert("ALERT MASUK!");
        }

        fetchPanicAlerts();
      })
      .subscribe((status: any) => {
        console.log("📡 REALTIME STATUS:", status);
      });

    setChannel(panicChannel);

    return () => {
      console.log("🧹 CLEANUP REALTIME");
      supabase.removeChannel(panicChannel);
    };
  }, [fetchPanicAlerts]);

  const handleResolve = async (alertId: string) => {
    setConfirmDialog({ isOpen: true, alertId });
  };

  const handleConfirmResolve = async () => {
    if (!confirmDialog.alertId) return;

    const result = await panicService.resolvePanicAlert(confirmDialog.alertId);
    if (result.success) {
      setNotif({
        title: "Berhasil",
        message: "Alert berhasil diselesaikan.",
        variant: "success",
      });
      await fetchPanicAlerts();
    } else {
      setNotif({
        title: "Gagal",
        message: result.error || "Gagal menyelesaikan alert.",
        variant: "warning",
      });
    }
  };

  const activeAlerts = panicAlerts.filter(alert => alert.status === 'active');
  const resolvedAlerts = panicAlerts.filter(alert => alert.status === 'resolved');

  if (loadingPanicAlerts) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="bg-linear-to-br from-rose-600 via-red-600 to-orange-600 text-white px-6 pt-7 pb-8">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.push("/admin")}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm transition-all hover:scale-105"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-2xl font-black tracking-tight">Alert Darurat</h1>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-rose-100 text-sm">Monitor sinyal darurat dari warga</p>
          {activeAlerts.length > 0 && (
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
              <div className="h-2 w-2 bg-white rounded-full animate-pulse" />
              <span className="text-sm font-bold">{activeAlerts.length} Aktif</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 max-w-2xl mx-auto">
        {activeAlerts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="text-rose-600" size={20} />
              Alert Aktif
            </h2>
            <div className="space-y-3">
              {activeAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="bg-white rounded-2xl shadow-lg p-4 border-l-4 border-rose-500"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                        <AlertTriangle size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">
                          {alert.profile_name || 'Warga'}
                        </h3>
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          <Clock size={14} />
                          {new Date(alert.created_at).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-bold">
                      Aktif
                    </span>
                  </div>

                  {(alert.rt || alert.rw || alert.kelurahan) && (
                    <div className="bg-slate-50 rounded-xl p-3 mb-3">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin size={16} />
                        <span>
                          {alert.rt && `RT ${alert.rt}`}
                          {alert.rt && alert.rw && ' '}
                          {alert.rw && `RW ${alert.rw}`}
                          {alert.kelurahan && `, ${alert.kelurahan}`}
                        </span>
                      </div>
                    </div>
                  )}

                  {alert.location_description && (
                    <p className="text-sm text-slate-600 mb-3">{alert.location_description}</p>
                  )}

                  {alert.profile_phone && (
                    <p className="text-sm text-slate-500 mb-3 flex items-center gap-2">
                      <User size={16} />
                      {alert.profile_phone}
                    </p>
                  )}

                  <button
                    onClick={() => handleResolve(alert.id)}
                    className="w-full py-3 bg-rose-600 text-white rounded-xl font-bold shadow-lg shadow-rose-200 transition-all hover:scale-[1.02] active:scale-95"
                  >
                    Selesaikan Alert
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {resolvedAlerts.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <CheckCircle className="text-green-600" size={20} />
              Riwayat Alert
            </h2>
            <div className="space-y-3">
              {resolvedAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="bg-white rounded-2xl shadow-lg p-4 border-l-4 border-green-500 opacity-75"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                        <CheckCircle size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">
                          {alert.profile_name || 'Warga'}
                        </h3>
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          <Clock size={14} />
                          {new Date(alert.created_at).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                      Selesai
                    </span>
                  </div>

                  {alert.resolved_at && (
                    <p className="text-sm text-slate-500">
                      Diselesaikan: {new Date(alert.resolved_at).toLocaleString('id-ID')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {panicAlerts.length === 0 && (
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100 text-center">
            <AlertTriangle className="mx-auto h-16 w-16 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">Tidak Ada Alert</h3>
            <p className="text-slate-500">Belum ada sinyal darurat yang diterima</p>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, alertId: null })}
        onConfirm={handleConfirmResolve}
        title="Selesaikan Alert"
        message="Yakin ingin menyelesaikan alert ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Ya, Selesaikan"
        cancelText="Batal"
        variant="danger"
      />
      <BottomNav />
    </div>
  );
}
