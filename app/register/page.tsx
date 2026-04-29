"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, LayoutDashboard, Mail, Lock, Eye, EyeOff, User, Phone } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAppStore } from "@/store/useAppStore";

export default function RegisterPage() {
  const router = useRouter();
  const isLoggedIn = useAppStore((s) => s.isLoggedIn);
  const setNotif = useAppStore((s) => s.setNotif);
  const syncSupabaseUser = useAppStore((s) => s.syncSupabaseUser);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      router.replace("/dashboard");
    }
  }, [isLoggedIn, router]);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !password || !confirmPassword) {
      setNotif("Semua field wajib diisi.");
      return;
    }

    if (password !== confirmPassword) {
      setNotif("Konfirmasi password tidak cocok.");
      return;
    }

    if (password.length < 6) {
      setNotif("Password minimal 6 karakter.");
      return;
    }

    setIsLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          name: name.trim(),
          phone: phone.trim(),
          role: "warga",
        },
      },
    });
    setIsLoading(false);

    if (error) {
      setNotif({
        title: "Registrasi Gagal",
        message: error.message || "Terjadi kesalahan saat mendaftar.",
        variant: "warning",
      });
      return;
    }

    if (data.user) {
      // Cek apakah data citizens sudah ada untuk mencegah duplikat
      const { data: existing } = await supabase
        .from("citizens")
        .select("id")
        .eq("id", data.user.id)
        .single();

      if (!existing) {
        const { error: insertError } = await supabase.from("citizens").insert({
          id: data.user.id,
          name: name.trim(),
          phone: phone.trim(),
          role: "warga",
        });

        if (insertError) {
          console.error("Gagal menyimpan data citizens:", insertError.message);
        }
      }

      await syncSupabaseUser();

      setNotif({
        title: "Registrasi Berhasil",
        message: "Akun berhasil dibuat. Selamat datang!",
        variant: "success",
      });
      router.push("/dashboard");
    }
  };

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
        <h1 className="text-2xl font-bold text-center text-slate-800 mb-2">Daftar Akun Baru</h1>
        <p className="text-slate-500 text-center mb-8">Buat akun baru untuk mengakses layanan warga.</p>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-[11px] uppercase tracking-widest font-bold text-slate-400 mb-1">Nama Lengkap</p>
            <div className="flex items-center gap-2">
              <User size={16} className="text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama lengkap"
                className="w-full bg-transparent outline-none text-sm text-slate-800"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-[11px] uppercase tracking-widest font-bold text-slate-400 mb-1">Email</p>
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full bg-transparent outline-none text-sm text-slate-800"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-[11px] uppercase tracking-widest font-bold text-slate-400 mb-1">No. HP</p>
            <div className="flex items-center gap-2">
              <Phone size={16} className="text-slate-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                placeholder="628123456789"
                className="w-full bg-transparent outline-none text-sm text-slate-800"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-[11px] uppercase tracking-widest font-bold text-slate-400 mb-1">Password</p>
            <div className="flex items-center gap-2">
              <Lock size={16} className="text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent outline-none text-sm text-slate-800"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-[11px] uppercase tracking-widest font-bold text-slate-400 mb-1">Konfirmasi Password</p>
            <div className="flex items-center gap-2">
              <Lock size={16} className="text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent outline-none text-sm text-slate-800"
              />
            </div>
          </div>

          <button
            onClick={handleRegister}
            disabled={isLoading}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? "Memuat..." : "Daftarkan Akun"}
          </button>

          <p className="text-center text-sm text-slate-500 mt-4">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-blue-600 font-bold hover:underline">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
