"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Save, Loader2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { locationService } from "@/services/locationService";

export default function LocationConfigPage() {
  const router = useRouter();
  const setNotif = useAppStore((s) => s.setNotif);
  const locationConfig = useAppStore((s) => s.locationConfig);
  const loadingLocationConfig = useAppStore((s) => s.loadingLocationConfig);
  const fetchLocationConfig = useAppStore((s) => s.fetchLocationConfig);

  const [rt, setRt] = useState("");
  const [rw, setRw] = useState("");
  const [kelurahan, setKelurahan] = useState("");
  const [kota, setKota] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchLocationConfig();
  }, [fetchLocationConfig]);

  useEffect(() => {
    if (locationConfig) {
      setRt(locationConfig.rt || "");
      setRw(locationConfig.rw || "");
      setKelurahan(locationConfig.kelurahan || "");
      setKota(locationConfig.kota || "");
      setPostalCode(locationConfig.postal_code || "");
    }
  }, [locationConfig]);

  const handleSave = async () => {
    if (!rt || !rw || !kelurahan || !kota || !postalCode) {
      setNotif("Semua field wajib diisi.");
      return;
    }

    setIsSaving(true);
    const result = await locationService.updateLocationConfig({
      rt,
      rw,
      kelurahan,
      kota,
      postal_code: postalCode
    });

    setIsSaving(false);

    if (result.success) {
      setNotif({
        title: "Berhasil",
        message: "Konfigurasi lokasi diperbarui.",
        variant: "success",
      });
      await fetchLocationConfig();
    } else {
      setNotif({
        title: "Gagal",
        message: result.error || "Gagal memperbarui konfigurasi lokasi.",
        variant: "warning",
      });
    }
  };

  if (loadingLocationConfig) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  if (!locationConfig) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <MapPin className="mx-auto h-16 w-16 text-rose-500 mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Konfigurasi Lokasi Tidak Ditemukan</h2>
          <p className="text-slate-500 mb-6">Silakan jalankan SQL migration untuk membuat tabel location_config.</p>
          <button
            onClick={() => router.push("/admin")}
            className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white px-6 pt-7 pb-8">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.push("/admin")}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm transition-all hover:scale-105"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-2xl font-black tracking-tight">Konfigurasi Lokasi</h1>
        </div>
        <p className="text-blue-100 text-sm">Kelola informasi RT/RW dan lokasi kelurahan</p>
      </div>

      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-6 border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <MapPin size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Informasi Lokasi</h2>
              <p className="text-slate-500 text-sm">Data akan ditampilkan di seluruh aplikasi</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  RT
                </label>
                <input
                  type="text"
                  value={rt}
                  onChange={(e) => setRt(e.target.value)}
                  placeholder="01"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  RW
                </label>
                <input
                  type="text"
                  value={rw}
                  onChange={(e) => setRw(e.target.value)}
                  placeholder="01"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Kelurahan
              </label>
              <input
                type="text"
                value={kelurahan}
                onChange={(e) => setKelurahan(e.target.value)}
                placeholder="Nama Kelurahan"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Kota
              </label>
              <input
                type="text"
                value={kota}
                onChange={(e) => setKota(e.target.value)}
                placeholder="Nama Kota"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Kode Pos
              </label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="12345"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
            >
              {isSaving ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save size={20} />
                  <span>Simpan Konfigurasi</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm text-amber-800">
            <strong>Preview:</strong> RT {rt} RW {rw}, Kelurahan {kelurahan}, {kota} - {postalCode}
          </p>
        </div>
      </div>
    </div>
  );
}
