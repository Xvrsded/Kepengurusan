"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, LayoutDashboard, Mail, Lock, Eye, EyeOff, User, Phone } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/store/useAppStore";

export default function RegisterPage() {
  const router = useRouter();
  const isLoggedIn = useAppStore((s) => s.isLoggedIn);
  const setNotif = useAppStore((s) => s.setNotif);
  const syncSupabaseUser = useAppStore((s) => s.syncSupabaseUser);
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      setNotif({
        title: "Sudah Login",
        message: "Anda sudah login. Silakan navigasi ke halaman yang diinginkan.",
        variant: "success",
      });
    }
  }, [isLoggedIn, setNotif]);

  const handleRegister = async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        alert(error.message);
        return;
      }

      await supabase.from("profiles").insert({
        id: data.user.id,
        full_name: fullName,
        phone: phone,
        role: "warga",
      });

      // auto login
      await supabase.auth.signInWithPassword({ email, password });

      // Sync role to application state
      await syncSupabaseUser();

      // Redirect to warga dashboard (new users are always warga)
      router.push("/warga");

    } finally {
      setLoading(false);
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
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
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

          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? "Loading..." : "Daftar"}
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
