"use client";

import Link from "next/link";
import { ArrowRight, Shield, Users, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-black text-slate-900 mb-6">
            Sistem Manajemen RT/RW Digital
          </h1>
          <p className="text-xl text-slate-600 mb-12">
            Platform digital modern untuk pengelolaan administrasi warga
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-2xl p-8 shadow-lg shadow-slate-100">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="text-blue-600" size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Manajemen Warga</h3>
              <p className="text-slate-600">Kelola data warga dengan mudah dan efisien</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg shadow-slate-100">
              <div className="w-16 h-16 bg-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="text-cyan-600" size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Layanan Digital</h3>
              <p className="text-slate-600">Pengajuan surat dan pembayaran iuran online</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg shadow-slate-100">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="text-green-600" size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Keamanan Terjamin</h3>
              <p className="text-slate-600">Sistem keamanan modern dan terpercaya</p>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-colors"
            >
              Masuk
              <ArrowRight size={20} />
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 border-2 border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-colors"
            >
              Daftar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
