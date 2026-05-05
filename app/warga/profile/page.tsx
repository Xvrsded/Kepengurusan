"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Bell, ChevronRight, Eye, EyeOff, FileText, Fingerprint, KeyRound, LogOut, MapPin, PencilLine, Phone, ShieldCheck, ShieldPlus, Smartphone, UserRound, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useAuthGuard } from "@/lib/useAuthGuard";
import BottomNav from "@/components/BottomNav";
import Notification from "@/components/Notification";

export default function WargaProfilePage() {
  useAuthGuard();
  const loadingCitizens = useAppStore((s) => s.loadingCitizens);
  const fetchCitizens = useAppStore((s) => s.fetchCitizens);
  
  console.log("HOOK CHECK - WargaProfilePage hooks called");
  
  useEffect(() => {
    if (typeof fetchCitizens === "function") {
      fetchCitizens();
    } else {
      console.error("fetchCitizens is not defined in store");
    }
  }, [fetchCitizens]);

  const showLoading = loadingCitizens;

  type SecurityActionModal = {
    mode: "confirm" | "result";
    action: "pin" | "sessions";
    title: string;
    message: string;
    confirmLabel?: string;
    tone: "blue" | "rose" | "emerald" | "amber";
  } | null;

  const router = useRouter();
  const citizens = useAppStore((s) => s.citizens);
  const userProfile = useAppStore((s) => s.userProfile);
  const letters = useAppStore((s) => s.letters);
  const iuran = useAppStore((s) => s.iuran);
  const notifications = useAppStore((s) => s.notifications);
  const logout = useAppStore((s) => s.logout);
  const setNotif = useAppStore((s) => s.setNotif);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const securitySettings = useAppStore((s) => s.securitySettings);
  const updateSecuritySettings = useAppStore((s) => s.updateSecuritySettings);
  const changePin = useAppStore((s) => s.changePin);
  const logoutOtherSessions = useAppStore((s) => s.logoutOtherSessions);
  const [isEditing, setIsEditing] = useState(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: userProfile.name,
    phone: userProfile.phone,
    address: userProfile.address,
  });
  const [pinForm, setPinForm] = useState({
    currentPin: "",
    newPin: "",
    confirmPin: "",
  });
  const [showPin, setShowPin] = useState({
    currentPin: false,
    newPin: false,
    confirmPin: false,
  });
  const [securityModal, setSecurityModal] = useState<SecurityActionModal>(null);

  useEffect(() => {
    setFormData({
      name: userProfile.name,
      phone: userProfile.phone,
      address: userProfile.address,
    });
  }, [userProfile.address, userProfile.name, userProfile.phone]);

  const currentCitizen = Array.isArray(citizens)
    ? citizens.find((citizen) => citizen.nik === userProfile.nik) ?? citizens[0]
    : null;
  const userLetters = Array.isArray(letters)
    ? letters.filter((letter) => letter.applicant === (currentCitizen?.name ?? userProfile.name)).slice(0, 3)
    : [];
  const userIuran = Array.isArray(iuran)
    ? iuran.filter((item) => item.citizenId === currentCitizen?.id).slice(0, 3)
    : [];
  const unreadNotifications = Array.isArray(notifications)
    ? notifications.filter((notification) => !notification.isRead).length
    : 0;
  const safeCitizen = currentCitizen ?? {};

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const handleSaveProfile = () => {
    updateProfile({
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
    });
    setNotif("Profil berhasil diperbarui");
    setIsEditing(false);
  };

  const handleSecurityToggle = (
    key: "biometricEnabled" | "appLockEnabled" | "loginAlertsEnabled" | "twoFactorEnabled"
  ) => {
    const nextValue = !securitySettings[key];
    updateSecuritySettings({ [key]: nextValue });
    setNotif(nextValue ? "Fitur keamanan diaktifkan" : "Fitur keamanan dinonaktifkan");
  };

  const executePinChange = async () => {
    if (pinForm.newPin !== pinForm.confirmPin) {
      setNotif("Konfirmasi PIN baru belum cocok.");
      return;
    }

    const result = await changePin(pinForm.currentPin, pinForm.newPin);
    setNotif(result.message);
    setSecurityModal({
      mode: "result",
      action: "pin",
      title: result.success ? "PIN berhasil diperbarui" : "Perubahan PIN belum berhasil",
      message: result.message,
      tone: result.success ? "emerald" : "amber",
    });

    if (result.success) {
      setPinForm({ currentPin: "", newPin: "", confirmPin: "" });
    }
  };

  const handlePinChange = () => {
    if (!pinForm.currentPin || !pinForm.newPin || !pinForm.confirmPin) {
      setNotif("Lengkapi semua data PIN terlebih dahulu.");
      return;
    }

    setSecurityModal({
      mode: "confirm",
      action: "pin",
      title: "Simpan PIN baru?",
      message: "PIN akun Anda akan diganti. Pastikan PIN baru mudah diingat namun tidak mudah ditebak.",
      confirmLabel: "Ya, simpan PIN",
      tone: "blue",
    });
  };

  const executeLogoutOtherSessions = () => {
    logoutOtherSessions();
    setNotif("Semua sesi lain berhasil dikeluarkan.");
    setSecurityModal({
      mode: "result",
      action: "sessions",
      title: "Sesi lain berhasil dikeluarkan",
      message: "Perangkat lain sudah keluar dari akun Anda. Hanya sesi di perangkat ini yang masih aktif.",
      tone: "emerald",
    });
  };

  const handleLogoutOtherSessions = () => {
    if (securitySettings.activeSessions <= 1) {
      setNotif("Tidak ada sesi lain yang aktif.");
      return;
    }

    setSecurityModal({
      mode: "confirm",
      action: "sessions",
      title: "Logout semua sesi lain?",
      message: "Semua perangkat lain akan dikeluarkan dari akun ini. Gunakan fitur ini jika Anda merasa akun sedang dipakai di perangkat lain.",
      confirmLabel: "Ya, keluarkan sesi lain",
      tone: "rose",
    });
  };

  const handleSecurityModalConfirm = () => {
    if (!securityModal || securityModal.mode !== "confirm") return;

    if (securityModal.action === "pin") {
      executePinChange();
      return;
    }

    executeLogoutOtherSessions();
  };

  const securityModalTone = securityModal?.tone === "rose"
    ? {
        iconClassName: "bg-rose-100 text-rose-600",
        buttonClassName: "bg-rose-600 text-white shadow-rose-200",
      }
    : securityModal?.tone === "emerald"
      ? {
          iconClassName: "bg-emerald-100 text-emerald-600",
          buttonClassName: "bg-emerald-600 text-white shadow-emerald-200",
        }
      : securityModal?.tone === "amber"
        ? {
            iconClassName: "bg-amber-100 text-amber-600",
            buttonClassName: "bg-amber-500 text-white shadow-amber-200",
          }
        : {
            iconClassName: "bg-blue-100 text-blue-600",
            buttonClassName: "bg-blue-600 text-white shadow-blue-200",
          };

  return (
    <>
      <div style={{ display: showLoading ? 'block' : 'none' }} className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <span className="text-slate-500 font-bold">Memuat data profil...</span>
          <div className="h-8 w-8 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin" />
        </div>
      </div>

      <div style={{ display: !showLoading ? 'block' : 'none' }} className="min-h-screen bg-slate-50 font-sans max-w-md mx-auto relative shadow-2xl overflow-x-hidden pb-24 animate-in fade-in duration-500">
        <Notification />

        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-24 h-24 bg-slate-200 rounded-full mx-auto mb-4 overflow-hidden border-4 border-white shadow-lg relative">
              <Image src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userProfile.name || "warga")}`} alt="profile" fill unoptimized />
            </div>
            <h3 className="text-xl font-bold text-slate-800">{userProfile.name || "Nama warga belum tersedia"}</h3>
            <p className="text-sm text-slate-500">{userProfile.address || "Alamat belum tersedia"}</p>
            <button onClick={() => setIsEditing(true)} className="mt-4 inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900 text-white text-sm font-bold shadow-xl transition-all hover:scale-105 active:scale-95">
              <PencilLine size={16} /> Edit Profil
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-5 mb-5">
            <h4 className="text-base font-black text-slate-800 mb-4">Informasi Warga</h4>
            <div className="space-y-3">
              {[
                { icon: <UserRound size={16} />, label: "Nama", value: userProfile.name },
                { icon: <ShieldCheck size={16} />, label: "NIK", value: userProfile.nik },
                { icon: <MapPin size={16} />, label: "Alamat", value: userProfile.address },
                { icon: <Phone size={16} />, label: "No HP", value: userProfile.phone },
              ].map((item) => (
                <div key={item.label} className="w-full flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                  <div className="w-9 h-9 rounded-xl bg-white text-slate-500 flex items-center justify-center shadow-sm">{item.icon}</div>
                  <div>
                    <p className="text-[11px] uppercase font-bold tracking-widest text-slate-400">{item.label}</p>
                    <p className="text-sm font-semibold text-slate-700">{item.value || `${item.label} belum tersedia`}</p>
                  </div>
                </div>
              ))}
            </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-5 mb-5">
          <h4 className="text-base font-black text-slate-800 mb-4">Pengaturan</h4>
          <div className="space-y-3 text-left">
            <button onClick={() => router.push("/warga/notifikasi")} className="w-full py-4 px-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between text-slate-700 font-semibold transition-all hover:scale-[1.02] active:scale-95">
              <div className="flex items-center gap-3"><Bell size={18} /> Notifikasi</div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                {unreadNotifications > 0 ? `${unreadNotifications} baru` : "Semua dibaca"}
                <ChevronRight size={16} />
              </div>
            </button>
            <button onClick={() => setIsSecurityOpen(true)} className="w-full py-4 px-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between text-slate-700 font-semibold transition-all hover:scale-[1.02] active:scale-95">
              <div className="flex items-center gap-3"><ShieldCheck size={18} /> Keamanan akun</div>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-5 mb-5">
          <h4 className="text-base font-black text-slate-800 mb-4">Aktivitas Terakhir</h4>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Riwayat Iuran</p>
              <div className="space-y-2">
                {userIuran.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-5 text-sm text-slate-400">Belum ada riwayat iuran</div>
                ) : (
                  userIuran.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white text-emerald-600 flex items-center justify-center shadow-sm"><Wallet size={16} /></div>
                        <div>
                          <p className="text-sm font-semibold text-slate-700">{item.month}</p>
                          <p className="text-xs text-slate-500">Rp {item.amount.toLocaleString("id-ID")}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-bold ${item.status === "Lunas" ? "text-emerald-600" : "text-amber-500"}`}>{item.status}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Riwayat Surat</p>
              <div className="space-y-2">
                {userLetters.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-5 text-sm text-slate-400">Belum ada riwayat surat</div>
                ) : (
                  userLetters.map((letter) => (
                    <div key={letter.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white text-blue-600 flex items-center justify-center shadow-sm"><FileText size={16} /></div>
                        <div>
                          <p className="text-sm font-semibold text-slate-700">{letter.type}</p>
                          <p className="text-xs text-slate-500">{letter.date}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-bold ${letter.status === "Selesai" ? "text-emerald-600" : "text-orange-500"}`}>{letter.status}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-left">
          <button onClick={handleLogout} className="w-full mt-4 py-4 px-6 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center gap-3 font-bold active:scale-95 transition-all hover:scale-[1.02]">
            <LogOut size={18} /> Keluar Aplikasi
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-end justify-center px-4 pb-6">
          <div className="w-full max-w-md bg-white rounded-4xl p-6 shadow-2xl animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-slate-900">Edit Profil</h3>
              <button onClick={() => setIsEditing(false)} className="text-sm font-bold text-slate-400">Tutup</button>
            </div>
            <div className="space-y-4">
              <input
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Nama"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-slate-400"
              />
              <input
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="No HP"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-slate-400"
              />
              <textarea
                value={formData.address}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                placeholder="Alamat"
                rows={3}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-slate-400 resize-none"
              />
              <button onClick={handleSaveProfile} className="w-full rounded-2xl bg-slate-900 text-white py-3 text-sm font-bold shadow-xl transition-all hover:scale-[1.02] active:scale-95">
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isSecurityOpen ? (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-end justify-center px-4 pb-6">
          <div className="w-full max-w-md bg-white rounded-4xl p-6 shadow-2xl animate-in fade-in duration-300 max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-black text-slate-900">Keamanan Akun</h3>
                <p className="text-xs text-slate-500 font-medium">Kelola proteksi akun dan sesi perangkat Anda</p>
              </div>
              <button onClick={() => setIsSecurityOpen(false)} className="text-sm font-bold text-slate-400 transition-all hover:scale-105">Tutup</button>
            </div>

            <div className="space-y-5">
              <div className="bg-linear-to-br from-slate-900 via-slate-800 to-slate-700 rounded-3xl p-5 text-white shadow-xl animate-in fade-in duration-500">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-widest text-slate-300 font-bold">Ringkasan Keamanan</p>
                    <h4 className="text-lg font-black mt-1">Perlindungan Akun Aktif</h4>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10">
                    <ShieldPlus size={20} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-2xl bg-white/10 p-3 border border-white/10 backdrop-blur-md">
                    <p className="text-slate-300">Sesi aktif</p>
                    <p className="text-lg font-black mt-1">{securitySettings.activeSessions}</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-3 border border-white/10 backdrop-blur-md">
                    <p className="text-slate-300">PIN terakhir</p>
                    <p className="text-sm font-bold mt-1">{securitySettings.lastPinChangedAt}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-3xl p-4 border border-slate-100 space-y-3">
                {[
                  {
                    key: "appLockEnabled",
                    title: "Kunci aplikasi",
                    desc: "Minta verifikasi saat aplikasi dibuka kembali.",
                    icon: <KeyRound size={18} />,
                  },
                  {
                    key: "biometricEnabled",
                    title: "Biometrik",
                    desc: "Gunakan sidik jari atau face unlock di perangkat.",
                    icon: <Fingerprint size={18} />,
                  },
                  {
                    key: "loginAlertsEnabled",
                    title: "Peringatan login",
                    desc: "Kirim notifikasi saat akun dipakai masuk.",
                    icon: <Bell size={18} />,
                  },
                  {
                    key: "twoFactorEnabled",
                    title: "Verifikasi 2 langkah",
                    desc: "Tambahkan perlindungan ekstra saat login.",
                    icon: <ShieldCheck size={18} />,
                  },
                ].map((item) => {
                  const active = securitySettings[item.key as keyof typeof securitySettings] as boolean;

                  return (
                    <div key={item.key} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm transition-all duration-300 hover:scale-[1.01]">
                      <div className="w-full flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${active ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
                          {item.icon}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{item.title}</p>
                          <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSecurityToggle(item.key as "biometricEnabled" | "appLockEnabled" | "loginAlertsEnabled" | "twoFactorEnabled")}
                        className={`w-14 h-7 rounded-full p-1 transition-all duration-300 ${active ? "bg-emerald-500" : "bg-slate-200"}`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ${active ? "translate-x-6" : "translate-x-0"}`} />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="bg-white rounded-3xl border border-slate-100 p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <KeyRound size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800">Ubah PIN Keamanan</h4>
                    <p className="text-xs text-slate-500">PIN harus terdiri dari 6 digit angka</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { key: "currentPin", label: "PIN lama", value: pinForm.currentPin },
                    { key: "newPin", label: "PIN baru", value: pinForm.newPin },
                    { key: "confirmPin", label: "Konfirmasi PIN baru", value: pinForm.confirmPin },
                  ].map((item) => {
                    const visible = showPin[item.key as keyof typeof showPin];

                    return (
                      <div key={item.key} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition-all focus-within:border-blue-400 focus-within:bg-white">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1">
                            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">{item.label}</p>
                            <input
                              type={visible ? "text" : "password"}
                              inputMode="numeric"
                              autoComplete="off"
                              value={item.value}
                              onChange={(e) => setPinForm((prev) => ({ ...prev, [item.key]: e.target.value.replace(/\D/g, "").slice(0, 6) }))}
                              placeholder="••••••"
                              className="w-full bg-transparent text-sm font-semibold tracking-[0.35em] text-slate-800 outline-none placeholder:tracking-[0.35em] placeholder:text-slate-300"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowPin((prev) => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                            className="w-10 h-10 rounded-2xl bg-white text-slate-500 flex items-center justify-center shadow-sm transition-all hover:scale-105 active:scale-95"
                          >
                            {visible ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  <p className="text-[11px] text-slate-400 px-1">Gunakan 6 digit angka dan jangan bagikan PIN kepada siapa pun.</p>
                  <button onClick={handlePinChange} className="w-full rounded-2xl bg-blue-600 text-white py-3 text-sm font-bold shadow-xl transition-all hover:scale-[1.02] active:scale-95">
                    Simpan PIN Baru
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-100 p-4 shadow-sm">
                <div className="w-full flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Smartphone size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800">Manajemen Perangkat</h4>
                    <p className="text-xs text-slate-500 mt-1">Perangkat terpercaya: {securitySettings.trustedDeviceName}</p>
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 mb-3 border border-slate-100">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Sesi Aktif</p>
                  <p className="text-sm font-semibold text-slate-700 mt-1">{securitySettings.activeSessions} perangkat sedang terhubung</p>
                </div>
                <button onClick={handleLogoutOtherSessions} className="w-full rounded-2xl bg-rose-50 text-rose-600 py-3 text-sm font-bold transition-all hover:scale-[1.02] active:scale-95">
                  Logout Semua Sesi Lain
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {securityModal ? (
        <div className="fixed inset-0 z-60 bg-slate-900/45 backdrop-blur-sm flex items-end justify-center px-4 pb-6">
          <div className="w-full max-w-md rounded-4xl bg-white p-6 shadow-2xl animate-in fade-in duration-300">
            <div className={`w-14 h-14 rounded-3xl flex items-center justify-center mb-4 shadow-lg ${securityModalTone.iconClassName}`}>
              {securityModal.action === "pin" ? <KeyRound size={24} /> : <Smartphone size={24} />}
            </div>
            <h3 className="text-xl font-black text-slate-900">{securityModal.title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed mt-2">{securityModal.message}</p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setSecurityModal(null)} className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 py-3 text-sm font-bold text-slate-600 transition-all hover:scale-[1.01] active:scale-95">
                {securityModal.mode === "result" ? "Tutup" : "Batal"}
              </button>
              {securityModal.mode === "confirm" ? (
                <button onClick={handleSecurityModalConfirm} className={`flex-1 rounded-2xl py-3 text-sm font-bold shadow-xl transition-all hover:scale-[1.01] active:scale-95 ${securityModalTone.buttonClassName}`}>
                  {securityModal.confirmLabel}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <BottomNav />
    </div>
    </>
  );
}
