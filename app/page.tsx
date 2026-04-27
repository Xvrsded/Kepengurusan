import Link from "next/link";
import { ShieldCheck, FileText, Wallet, Bell, Heart, ArrowUpRight, CheckCircle2, Users, Smartphone, MapPinned } from "lucide-react";

const FEATURES = [
  {
    icon: <FileText className="text-orange-500" />,
    title: "Minta Surat RT/RW",
    desc: "Tidak perlu lagi ketuk pintu, ajukan surat langsung dari HP Anda.",
  },
  {
    icon: <Wallet className="text-emerald-500" />,
    title: "Bayar Iuran Bulanan",
    desc: "Cek pembayaran iuran sampah dan keamanan dengan transparan.",
  },
  {
    icon: <Bell className="text-blue-500" />,
    title: "Dapatkan Kabar Terbaru",
    desc: "Info kerja bakti atau rapat warga akan langsung muncul di HP.",
  },
];

const HIGHLIGHTS = [
  "Tulisan besar dan mudah dibaca",
  "Menu sederhana dan tidak membingungkan",
  "Cocok dipakai warga dari rumah lewat HP",
];

const STEPS = [
  {
    icon: <Smartphone className="text-blue-600" size={20} />,
    title: "Masuk ke akun Anda",
    desc: "Pilih akun yang terdaftar lalu masukkan PIN dengan cepat dan aman.",
  },
  {
    icon: <FileText className="text-orange-500" size={20} />,
    title: "Pilih layanan yang dibutuhkan",
    desc: "Ajukan surat, cek iuran, atau lihat pemberitahuan warga tanpa repot.",
  },
  {
    icon: <MapPinned className="text-emerald-600" size={20} />,
    title: "Ikuti info lingkungan",
    desc: "Dapatkan pengumuman penting, agenda warga, dan status layanan secara jelas.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-linear-to-b from-white via-slate-50 to-white font-sans selection:bg-blue-100">
      <div className="relative overflow-hidden pt-12 pb-10 px-6 max-w-md mx-auto">
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-600/8 rounded-full -mr-36 -mt-36 blur-3xl" />
        <div className="absolute bottom-24 left-0 w-56 h-56 bg-emerald-400/8 rounded-full -ml-24 blur-3xl" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-bold border border-blue-100 mb-6 shadow-sm">
            <ShieldCheck size={16} /> Layanan warga yang lebih mudah
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-4xl border border-slate-100 shadow-xl p-7 text-center mb-6">
            <div className="w-20 h-20 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-blue-200 mb-6">
              <ShieldCheck className="text-white w-10 h-10" />
            </div>

            <h1 className="text-4xl font-black text-slate-900 leading-tight tracking-tight mb-4">
              Urusan Warga Jadi
              <span className="block text-blue-600">Lebih Mudah dan Jelas</span>
            </h1>

            <p className="text-lg text-slate-600 font-medium leading-relaxed mb-6">
              Aplikasi sederhana untuk membantu warga dan pengurus mengurus surat, iuran, dan informasi lingkungan dengan lebih nyaman.
            </p>

            <div className="space-y-3 text-left mb-8">
              {HIGHLIGHTS.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3 border border-slate-100">
                  <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={18} />
                  <p className="text-sm font-semibold text-slate-700 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>

            <Link
              href="/login"
              className="w-full py-5 bg-blue-600 text-white rounded-3xl text-xl font-black shadow-xl shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              Masuk ke Aplikasi <ArrowUpRight size={22} />
            </Link>

            <p className="text-xs text-slate-400 mt-4 font-medium">
              Bisa digunakan warga maupun pengurus langsung dari HP.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-xl">
              <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
                <Users size={20} />
              </div>
              <p className="text-sm font-black">Untuk Warga</p>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">Lihat info lingkungan, ajukan surat, dan cek iuran dengan lebih praktis.</p>
            </div>
            <div className="bg-white rounded-3xl p-5 shadow-xl border border-slate-100">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <ShieldCheck size={20} />
              </div>
              <p className="text-sm font-black text-slate-800">Untuk Pengurus</p>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">Kelola data warga, pantau surat, dan sampaikan informasi penting dengan rapi.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 max-w-md mx-auto">
        <div className="bg-white rounded-4xl p-6 border border-slate-100 shadow-xl mb-6">
          <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
            <Heart className="text-rose-500 fill-rose-500" size={24} />
            Apa Saja Yang Bisa Dilakukan?
          </h2>
          <div className="space-y-5">
            {FEATURES.map((item, i) => (
              <div key={i} className="flex gap-4 rounded-3xl bg-slate-50 p-4 border border-slate-100">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1 leading-snug">{item.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-50 rounded-4xl p-6 border border-slate-100 shadow-sm">
          <h2 className="text-xl font-black text-slate-800 mb-6">Cara Menggunakannya</h2>
          <div className="space-y-4">
            {STEPS.map((step, index) => (
              <div key={step.title} className="flex gap-4 items-start bg-white rounded-3xl p-4 border border-slate-100 shadow-sm">
                <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-sm font-black text-slate-700 shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {step.icon}
                    <h3 className="text-base font-black text-slate-800">{step.title}</h3>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center pt-8 pb-12">
          <p className="text-sm text-slate-500 leading-relaxed mb-4">
            Jika Anda ingin mulai, cukup masuk ke akun dan pilih layanan yang dibutuhkan.
          </p>
          <Link href="/login" className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-3xl text-base font-black shadow-lg active:scale-95 transition-all">
            Buka Halaman Login <ArrowUpRight size={18} />
          </Link>
        </div>
      </div>
    </main>
  );
}
