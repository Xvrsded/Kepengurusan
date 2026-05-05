"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/store/useAppStore";
import Logo from "@/components/ui/Logo";

export default function LoginPage() {
  const router = useRouter();
  const setNotif = useAppStore((s) => s.setNotif);
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState("");
  const [isResending, setIsResending] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Handle email not confirmed error
        if (error.message.includes("Email not confirmed")) {
          setError("Email belum dikonfirmasi. Silakan cek inbox email Anda.");
        } else {
          setError(error.message);
        }
        return;
      }

      // redirect cepat
      window.location.href = "/";

    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      if (error) {
        setError("Gagal mengirim ulang email konfirmasi: " + error.message);
      } else {
        setError("Email konfirmasi berhasil dikirim ulang! Silakan cek inbox Anda.");
      }
    } finally {
      setIsResending(false);
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
          <Logo size="large" />
        </div>
        <h1 className="text-2xl font-bold text-center text-slate-800 mb-2">Masuk ke Akun</h1>
        <p className="text-slate-500 text-center mb-8">Masukkan email dan password Anda untuk mengakses aplikasi.</p>

        {/* Error Message */}
        {error && (
          <div className="rounded-2xl bg-red-50 border border-red-200 p-4 mb-6 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-bold text-red-800">{error}</p>
                {error.includes("belum dikonfirmasi") && (
                  <button
                    onClick={handleResendConfirmation}
                    disabled={isResending}
                    className="mt-2 text-xs font-bold text-red-600 hover:text-red-800 flex items-center gap-1 transition-colors disabled:opacity-60"
                  >
                    {isResending ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        <span>Mengirim...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw size={12} />
                        <span>Kirim Ulang Email Konfirmasi</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

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
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Logging in...</span>
              </>
            ) : (
              "Masuk Sekarang"
            )}
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
