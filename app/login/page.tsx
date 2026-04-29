"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, LayoutDashboard, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAppStore } from "@/store/useAppStore";

export default function LoginPage() {
  const router = useRouter();
  const isLoggedIn = useAppStore((s) => s.isLoggedIn);
  const setNotif = useAppStore((s) => s.setNotif);
  const syncSupabaseUser = useAppStore((s) => s.syncSupabaseUser);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      router.replace("/dashboard");
    }
  }, [isLoggedIn, router]);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setNotif("Email dan password wajib diisi.");
      return;
    }

    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setIsLoading(false);

    if (error) {
      setNotif({
        title: "Login Gagal",
        message: error.message || "Email atau password salah.",
        variant: "warning",
      });
      return;
    }

    if (data.user) {
      await syncSupabaseUser();
      setNotif({
        title: "Login Berhasil",
        message: "Selamat datang kembali!",
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
        <h1 className="text-2xl font-bold text-center text-slate-800 mb-2">Masuk ke Akun</h1>
        <p className="text-slate-500 text-center mb-8">Masukkan email dan password Anda untuk mengakses aplikasi.</p>

        <div className="space-y-4">
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

          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? "Memuat..." : "Masuk Sekarang"}
          </button>

          <p className="text-center text-sm text-slate-500 mt-4">
            Belum punya akun?{" "}
            <Link href="/register" className="text-blue-600 font-bold hover:underline">
              Daftar di sini
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
