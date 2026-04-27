"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, LayoutDashboard, ShieldCheck, User, Users } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import type { AppRole } from "@/store/useAppStore";

export default function LoginPage() {
  const login = useAppStore((s) => s.login);
  const registerAccount = useAppStore((s) => s.registerAccount);
  const accounts = useAppStore((s) => s.accounts);
  const lastSelectedAccountId = useAppStore((s) => s.lastSelectedAccountId);
  const setLastSelectedAccountId = useAppStore((s) => s.setLastSelectedAccountId);
  const addNotification = useAppStore((s) => s.addNotification);
  const setNotif = useAppStore((s) => s.setNotif);
  const isLoggedIn = useAppStore((s) => s.isLoggedIn);
  const role = useAppStore((s) => s.role);
  const hasHydrated = useAppStore((s) => s.hasHydrated);
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(lastSelectedAccountId);
  const [loginPin, setLoginPin] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    name: "",
    nik: "",
    phone: "",
    address: "",
    pin: "",
    confirmPin: "",
    role: "warga" as AppRole,
  });

  useEffect(() => {
    if (!hasHydrated || !isLoggedIn || !role) return;

    setIsRedirecting(true);
    router.replace(role === "admin" ? "/admin" : "/warga");
  }, [hasHydrated, isLoggedIn, role, router]);

  useEffect(() => {
    if (!hasHydrated) return;

    const preferredAccount = accounts.find((account) => account.id === lastSelectedAccountId)?.id ?? accounts[0]?.id ?? null;
    setSelectedAccountId(preferredAccount);
  }, [accounts, hasHydrated, lastSelectedAccountId]);

  const handleLogin = () => {
    if (!selectedAccountId) {
      setNotif("Silakan pilih akun terlebih dahulu.");
      return;
    }

    const result = login(selectedAccountId, loginPin);

    if (!result.success || !result.role) {
      setNotif(result.message);
      return;
    }

    addNotification({
      title: "Selamat Datang",
      message: "Selamat datang kembali",
      type: "info",
    });
    setNotif({
      title: result.role === "admin" ? "Admin berhasil masuk" : "Warga berhasil masuk",
      message: "Login berhasil. Selamat datang kembali.",
      variant: "success",
      role: result.role,
    });
    setIsRedirecting(true);
  };

  const handleRegister = () => {
    if (!registerForm.name || !registerForm.nik || !registerForm.phone || !registerForm.address || !registerForm.pin || !registerForm.confirmPin) {
      setNotif("Semua data registrasi wajib diisi.");
      return;
    }

    if (registerForm.pin !== registerForm.confirmPin) {
      setNotif("Konfirmasi PIN tidak cocok.");
      return;
    }

    const result = registerAccount({
      name: registerForm.name,
      nik: registerForm.nik,
      phone: registerForm.phone,
      address: registerForm.address,
      pin: registerForm.pin,
      role: registerForm.role,
    });
    setNotif(result.message);

    if (!result.success) {
      return;
    }

    setRegisterForm({
      name: "",
      nik: "",
      phone: "",
      address: "",
      pin: "",
      confirmPin: "",
      role: "warga",
    });
    setMode("login");
  };

  if (isRedirecting) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-slate-100 text-center animate-in fade-in duration-300">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-200 mb-5">
            <LayoutDashboard className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Sedang Masuk...</h1>
          <p className="text-slate-500 text-sm leading-relaxed">Mohon tunggu sebentar, kami sedang membuka halaman akun Anda.</p>
          <div className="mt-6 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full w-1/2 rounded-full bg-blue-600 animate-pulse" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
        <Link href="/" className="mb-6 flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors">
          <ChevronRight className="rotate-180" size={20} />
          <span className="text-sm font-bold">Kembali</span>
        </Link>
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
            <LayoutDashboard className="text-white w-8 h-8" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center text-slate-800 mb-2">{mode === "login" ? "Masuk ke Akun" : "Daftar Akun Baru"}</h1>
        <p className="text-slate-500 text-center mb-8">{mode === "login" ? "Pilih akun yang terdaftar lalu masukkan PIN keamanan Anda." : "Buat akun baru untuk mengakses layanan warga atau pengurus."}</p>

        <div className="grid grid-cols-2 gap-2 bg-slate-100 rounded-2xl p-1 mb-6">
          <button onClick={() => setMode("login")} className={`py-3 rounded-2xl text-sm font-bold transition-all ${mode === "login" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>Masuk</button>
          <button onClick={() => setMode("register")} className={`py-3 rounded-2xl text-sm font-bold transition-all ${mode === "register" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>Daftar</button>
        </div>

        {mode === "login" ? (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div>
              <p className="text-[11px] uppercase tracking-widest font-bold text-slate-400 mb-3">Pilih Akun</p>
              <div className="space-y-3">
                {accounts.map((account) => {
                  const active = selectedAccountId === account.id;
                  const isLastUsed = lastSelectedAccountId === account.id;

                  return (
                    <button key={account.id} onClick={() => {
                      setSelectedAccountId(account.id);
                      setLastSelectedAccountId(account.id);
                    }} className={`w-full rounded-2xl border px-4 py-4 text-left transition-all hover:scale-[1.01] active:scale-95 ${active ? "border-blue-500 bg-blue-50 shadow-sm" : "border-slate-200 bg-slate-50"}`}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${account.role === "admin" ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"}`}>
                            {account.role === "admin" ? <ShieldCheck size={18} /> : <User size={18} />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-bold text-slate-800">{account.name}</p>
                              {isLastUsed ? <span className="px-2 py-1 rounded-full bg-slate-900 text-white text-[10px] font-black">Terakhir digunakan</span> : null}
                            </div>
                            <p className="text-[11px] text-slate-500">{account.role === "admin" ? "Pengurus RW" : "Warga"} • {account.phone}</p>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 ${active ? "border-blue-600 bg-blue-600" : "border-slate-300 bg-white"}`} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-[11px] uppercase tracking-widest font-bold text-slate-400 mb-1">PIN</p>
              <input value={loginPin} onChange={(e) => setLoginPin(e.target.value.replace(/\D/g, "").slice(0, 6))} type="password" inputMode="numeric" placeholder="••••••" className="w-full bg-transparent outline-none text-sm tracking-[0.3em] text-slate-800" />
            </div>
            <button onClick={handleLogin} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all hover:scale-[1.02] active:scale-95">Masuk Sekarang</button>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <div className="w-10 h-10 rounded-xl bg-white text-blue-600 flex items-center justify-center mb-3"><User size={18} /></div>
                <p className="text-sm font-bold text-slate-800">Demo Warga</p>
                <p className="text-[11px] text-slate-500 mt-1">Pilih akun Budi Santoso</p>
                <p className="text-[11px] text-slate-500">PIN: 123456</p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                <div className="w-10 h-10 rounded-xl bg-white text-emerald-600 flex items-center justify-center mb-3"><Users size={18} /></div>
                <p className="text-sm font-bold text-slate-800">Demo Admin</p>
                <p className="text-[11px] text-slate-500 mt-1">Pilih akun Admin RW</p>
                <p className="text-[11px] text-slate-500">PIN: 654321</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-[11px] uppercase tracking-widest font-bold text-slate-400 mb-1">Nama Lengkap</p>
              <input value={registerForm.name} onChange={(e) => setRegisterForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Masukkan nama lengkap" className="w-full bg-transparent outline-none text-sm text-slate-800" />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-[11px] uppercase tracking-widest font-bold text-slate-400 mb-1">NIK</p>
              <input value={registerForm.nik} onChange={(e) => setRegisterForm((prev) => ({ ...prev, nik: e.target.value.replace(/\D/g, "") }))} inputMode="numeric" placeholder="Masukkan NIK" className="w-full bg-transparent outline-none text-sm text-slate-800" />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-[11px] uppercase tracking-widest font-bold text-slate-400 mb-1">No HP</p>
              <input value={registerForm.phone} onChange={(e) => setRegisterForm((prev) => ({ ...prev, phone: e.target.value.replace(/\D/g, "") }))} inputMode="numeric" placeholder="Masukkan nomor HP" className="w-full bg-transparent outline-none text-sm text-slate-800" />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-[11px] uppercase tracking-widest font-bold text-slate-400 mb-1">Alamat</p>
              <textarea value={registerForm.address} onChange={(e) => setRegisterForm((prev) => ({ ...prev, address: e.target.value }))} rows={3} placeholder="Masukkan alamat lengkap" className="w-full bg-transparent outline-none text-sm text-slate-800 resize-none" />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-[11px] uppercase tracking-widest font-bold text-slate-400 mb-2">Registrasi</p>
              <div className="py-3 rounded-2xl border bg-white text-slate-700 border-slate-200 text-sm font-bold flex items-center justify-center gap-2">
                <User size={16} /> Warga
              </div>
              <p className="text-[11px] text-slate-400 mt-2">Registrasi mandiri hanya tersedia untuk akun warga. Akun admin dibuat oleh sistem/pengelola.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-[11px] uppercase tracking-widest font-bold text-slate-400 mb-1">PIN 6 Digit</p>
              <input value={registerForm.pin} onChange={(e) => setRegisterForm((prev) => ({ ...prev, pin: e.target.value.replace(/\D/g, "").slice(0, 6) }))} type="password" inputMode="numeric" placeholder="••••••" className="w-full bg-transparent outline-none text-sm tracking-[0.3em] text-slate-800" />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-[11px] uppercase tracking-widest font-bold text-slate-400 mb-1">Konfirmasi PIN</p>
              <input value={registerForm.confirmPin} onChange={(e) => setRegisterForm((prev) => ({ ...prev, confirmPin: e.target.value.replace(/\D/g, "").slice(0, 6) }))} type="password" inputMode="numeric" placeholder="••••••" className="w-full bg-transparent outline-none text-sm tracking-[0.3em] text-slate-800" />
            </div>
            <button onClick={handleRegister} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-lg transition-all hover:scale-[1.02] active:scale-95">Daftarkan Akun</button>
          </div>
        )}
      </div>
    </main>
  );
}
