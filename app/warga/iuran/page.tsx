"use client";

import { useMemo, useState } from "react";
import { BadgeCheck, Building2, CheckCircle2, Clock3, CreditCard, QrCode, ReceiptText, Search, Smartphone, Wallet, X } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import BottomNav from "@/components/BottomNav";
import Notification from "@/components/Notification";

const PAYMENT_METHODS = [
  {
    id: "transfer",
    title: "Transfer Bank",
    desc: "Cocok untuk bayar dari mobile banking.",
    icon: <Building2 size={18} />,
    color: "bg-blue-50 text-blue-600",
  },
  {
    id: "ewallet",
    title: "E-Wallet",
    desc: "Praktis untuk pembayaran cepat.",
    icon: <Smartphone size={18} />,
    color: "bg-purple-50 text-purple-600",
  },
  {
    id: "qris",
    title: "QRIS",
    desc: "Scan kode QR untuk pembayaran yang cepat dan praktis.",
    icon: <QrCode size={18} />,
    color: "bg-fuchsia-50 text-fuchsia-600",
  },
  {
    id: "cash",
    title: "Bayar Tunai",
    desc: "Bisa konfirmasi ke pengurus saat setor.",
    icon: <Wallet size={18} />,
    color: "bg-emerald-50 text-emerald-600",
  },
] as const;

export default function WargaIuranPage() {
  const iuran = useAppStore((s) => s.iuran);
  const citizens = useAppStore((s) => s.citizens);
  const userProfile = useAppStore((s) => s.userProfile);
  const payIuran = useAppStore((s) => s.payIuran);
  const setNotif = useAppStore((s) => s.setNotif);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Semua" | "Lunas" | "Pending">("Semua");
  const [selectedMethod, setSelectedMethod] = useState<(typeof PAYMENT_METHODS)[number]["id"]>("transfer");
  const [receiptData, setReceiptData] = useState<{
    month: string;
    amount: number;
    paidAt: string;
    method: string;
    reference: string;
  } | null>(null);

  const currentCitizen = citizens.find((citizen) => citizen.nik === userProfile.nik);
  const myIuran = useMemo(
    () => iuran.filter((item) => item.citizenId === currentCitizen?.id),
    [currentCitizen?.id, iuran]
  );

  const filteredIuran = useMemo(() => {
    return myIuran.filter((item) => {
      const matchesSearch = `${item.month} ${item.date}`.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "Semua" ? true : item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [myIuran, search, statusFilter]);

  const totalPaid = myIuran
    .filter((item) => item.status === "Lunas")
    .reduce((sum, item) => sum + item.amount, 0);
  const paidCount = myIuran.filter((item) => item.status === "Lunas").length;
  const pendingCount = myIuran.filter((item) => item.status === "Pending").length;
  const totalTagihan = myIuran.reduce((sum, item) => sum + item.amount, 0);
  const paymentProgress = totalTagihan === 0 ? 0 : Math.round((totalPaid / totalTagihan) * 100);
  const nextPending = myIuran.find((item) => item.status === "Pending");

  const downloadReceipt = () => {
    if (!receiptData) {
      return;
    }

    const printWindow = window.open("", "_blank", "width=800,height=900");

    if (!printWindow) {
      setNotif({
        title: "PDF belum bisa dibuka",
        message: "Izinkan popup browser agar bukti pembayaran dapat diekspor ke PDF.",
        variant: "warning",
        role: "warga",
      });
      return;
    }

    const printableHtml = `
      <!DOCTYPE html>
      <html lang="id">
        <head>
          <meta charset="UTF-8" />
          <title>Bukti Pembayaran ${receiptData.reference}</title>
          <style>
            * { box-sizing: border-box; }
            body {
              margin: 0;
              font-family: Arial, Helvetica, sans-serif;
              background: #f8fafc;
              color: #0f172a;
              padding: 32px;
            }
            .sheet {
              max-width: 720px;
              margin: 0 auto;
              background: white;
              border: 1px solid #e2e8f0;
              border-radius: 24px;
              overflow: hidden;
            }
            .header {
              padding: 28px 32px;
              background: linear-gradient(135deg, #059669, #14b8a6);
              color: white;
            }
            .eyebrow {
              font-size: 12px;
              font-weight: 700;
              letter-spacing: 0.18em;
              text-transform: uppercase;
              opacity: 0.9;
            }
            .title {
              margin: 10px 0 0;
              font-size: 28px;
              font-weight: 800;
            }
            .subtitle {
              margin: 8px 0 0;
              font-size: 14px;
              line-height: 1.7;
              opacity: 0.92;
            }
            .content {
              padding: 28px 32px 32px;
            }
            .status {
              display: inline-block;
              padding: 8px 14px;
              border-radius: 999px;
              background: #ecfdf5;
              color: #047857;
              font-size: 12px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.08em;
            }
            .section {
              margin-top: 22px;
              border: 1px dashed #cbd5e1;
              border-radius: 20px;
              padding: 20px;
              background: #f8fafc;
            }
            .row {
              display: flex;
              justify-content: space-between;
              gap: 16px;
              padding: 12px 0;
              border-bottom: 1px solid #e2e8f0;
            }
            .row:last-child {
              border-bottom: none;
            }
            .label {
              color: #64748b;
              font-size: 14px;
            }
            .value {
              color: #0f172a;
              font-size: 14px;
              font-weight: 700;
              text-align: right;
            }
            .footer {
              margin-top: 24px;
              font-size: 12px;
              color: #64748b;
              line-height: 1.7;
            }
            @media print {
              body {
                background: white;
                padding: 0;
              }
              .sheet {
                border: none;
                border-radius: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="sheet">
            <div class="header">
              <div class="eyebrow">RT/RW Digital</div>
              <h1 class="title">Bukti Pembayaran Iuran</h1>
              <p class="subtitle">Dokumen ini merupakan catatan pembayaran iuran warga yang dapat disimpan sebagai PDF untuk arsip pribadi.</p>
            </div>
            <div class="content">
              <span class="status">Pembayaran Berhasil</span>
              <div class="section">
                <div class="row">
                  <div class="label">Periode</div>
                  <div class="value">${receiptData.month}</div>
                </div>
                <div class="row">
                  <div class="label">Nominal</div>
                  <div class="value">Rp ${receiptData.amount.toLocaleString("id-ID")}</div>
                </div>
                <div class="row">
                  <div class="label">Metode Pembayaran</div>
                  <div class="value">${receiptData.method}</div>
                </div>
                <div class="row">
                  <div class="label">Waktu Bayar</div>
                  <div class="value">${receiptData.paidAt}</div>
                </div>
                <div class="row">
                  <div class="label">No. Referensi</div>
                  <div class="value">${receiptData.reference}</div>
                </div>
              </div>
              <div class="footer">
                Simpan dokumen ini melalui menu <strong>Save as PDF</strong> pada dialog cetak browser Anda.<br />
                Bukti pembayaran ini dibuat otomatis oleh sistem RT/RW Digital.
              </div>
            </div>
          </div>
          <script>
            window.onload = function () {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(printableHtml);
    printWindow.document.close();

    setNotif({
      title: "Ekspor PDF dibuka",
      message: "Gunakan opsi Save as PDF pada dialog cetak untuk menyimpan bukti pembayaran.",
      variant: "success",
      role: "warga",
    });
  };

  const handlePay = (id: number) => {
    const target = myIuran.find((item) => item.id === id);
    const result = payIuran(id);

    setNotif({
      title: result.success ? "Pembayaran berhasil" : "Pembayaran belum berhasil",
      message: result.message,
      variant: result.success ? "success" : "warning",
      role: "warga",
    });

    if (result.success && target) {
      const reference = `TRX-${Date.now().toString().slice(-8)}-${target.id}`;

      setReceiptData({
        month: target.month,
        amount: target.amount,
        paidAt: new Date().toLocaleString("id-ID"),
        method: PAYMENT_METHODS.find((method) => method.id === selectedMethod)?.title ?? "Metode pembayaran",
        reference,
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans max-w-md mx-auto relative shadow-2xl overflow-x-hidden pb-24">
      <Notification />

      <div className="bg-linear-to-br from-emerald-600 via-teal-600 to-cyan-500 px-5 pt-9 pb-8 text-white relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-8 left-0 w-28 h-28 bg-white/10 rounded-full blur-2xl" />
        <div className="relative z-10">
          <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-emerald-50 backdrop-blur-sm shadow-sm">
            Layanan Pembayaran
          </div>
          <h1 className="text-[2rem] font-black mt-3 tracking-tight leading-none">Iuran Warga</h1>
          <p className="text-emerald-50/95 text-sm mt-3 leading-relaxed max-w-88">Lihat tagihan, bayar iuran yang masih pending, dan pantau riwayat pembayaran dengan cara yang lebih mudah.</p>
        </div>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-4 pb-3">
        <div className="bg-white rounded-4xl p-5 border border-slate-100 shadow-lg shadow-slate-100/70">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-slate-400 font-black">Total Pembayaran</p>
              <h2 className="text-3xl font-black text-slate-900 mt-2">Rp {totalPaid.toLocaleString("id-ID")}</h2>
              <p className="text-xs text-slate-500 mt-2">{paidCount} iuran lunas • {pendingCount} iuran menunggu</p>
            </div>
            <div className="w-12 h-12 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"><Wallet size={22} /></div>
          </div>
          <div className="mt-4 h-2 rounded-full bg-emerald-50 overflow-hidden">
            <div className="h-full rounded-full bg-emerald-500 transition-all duration-700" style={{ width: `${paymentProgress}%` }} />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Progres pembayaran</span>
            <span>{paymentProgress}%</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-4xl p-4 border border-slate-100 shadow-sm text-center">
            <div className="mx-auto mb-2 w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={18} />
            </div>
            <p className="text-lg font-black text-slate-800">{paidCount}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Lunas</p>
          </div>
          <div className="bg-white rounded-4xl p-4 border border-slate-100 shadow-sm text-center">
            <div className="mx-auto mb-2 w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Clock3 size={18} />
            </div>
            <p className="text-lg font-black text-slate-800">{pendingCount}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Pending</p>
          </div>
          <div className="bg-white rounded-4xl p-4 border border-slate-100 shadow-sm text-center">
            <div className="mx-auto mb-2 w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <BadgeCheck size={18} />
            </div>
            <p className="text-lg font-black text-slate-800">{paymentProgress}%</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Target</p>
          </div>
        </div>

        <div className="bg-white rounded-4xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center"><CreditCard size={18} /></div>
            <div>
              <p className="text-sm font-black text-slate-800">Metode Pembayaran</p>
              <p className="text-xs text-slate-500">Pilih cara bayar yang paling mudah dipahami dan nyaman dipakai.</p>
            </div>
          </div>
          <div className="p-5 grid gap-3">
            {PAYMENT_METHODS.map((method) => {
              const active = selectedMethod === method.id;

              return (
                <button key={method.id} onClick={() => setSelectedMethod(method.id)} className={`rounded-3xl border p-4 text-left transition-all duration-300 hover:scale-[1.01] active:scale-95 ${active ? "border-slate-900 bg-slate-900 text-white shadow-lg" : "border-slate-100 bg-white"}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${active ? "bg-white/10 text-white" : method.color}`}>
                      {method.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className={`text-sm font-black ${active ? "text-white" : "text-slate-800"}`}>{method.title}</p>
                        <div className={`w-5 h-5 rounded-full border-2 ${active ? "border-white bg-white" : "border-slate-300 bg-white"}`}>
                          <div className={`w-full h-full rounded-full scale-50 ${active ? "bg-slate-900" : "bg-transparent"}`} />
                        </div>
                      </div>
                      <p className={`text-xs mt-1 leading-relaxed ${active ? "text-slate-200" : "text-slate-500"}`}>{method.desc}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-4xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><CreditCard size={18} /></div>
            <div>
              <p className="text-sm font-black text-slate-800">Tagihan Terdekat</p>
              <p className="text-xs text-slate-500">Bayar langsung dari halaman ini.</p>
            </div>
          </div>
          <div className="p-5">
            {nextPending ? (
              <div className="rounded-3xl bg-slate-50 border border-slate-100 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-slate-800">{nextPending.month}</p>
                    <p className="text-xs text-slate-500 mt-1">Rp {nextPending.amount.toLocaleString("id-ID")}</p>
                    <p className="text-[11px] text-orange-500 font-bold uppercase tracking-widest mt-3">Belum dibayar</p>
                  </div>
                  <button onClick={() => handlePay(nextPending.id)} className="rounded-2xl bg-emerald-600 text-white px-4 py-3 text-sm font-black shadow-xl shadow-emerald-100 transition-all hover:scale-[1.01] active:scale-95">
                    Bayar
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl bg-emerald-50 border border-emerald-100 p-4 text-center">
                <p className="text-sm font-black text-emerald-700">Semua iuran sudah lunas</p>
                <p className="text-xs text-emerald-600 mt-1">Terima kasih, pembayaran Anda sudah lengkap.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-4xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
            <div>
              <h3 className="font-black text-slate-900 text-sm">Riwayat Pembayaran</h3>
              <p className="text-xs text-slate-500 mt-1">Cari dan cek status pembayaran bulan berjalan maupun sebelumnya.</p>
            </div>
          </div>
          <div className="p-5 space-y-3 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <Search size={16} className="text-slate-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari bulan iuran atau tanggal" className="w-full bg-transparent text-sm text-slate-700 outline-none" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(["Semua", "Pending", "Lunas"] as const).map((status) => (
                <button key={status} onClick={() => setStatusFilter(status)} className={`px-4 py-2 rounded-full text-xs font-black transition-all ${statusFilter === status ? "bg-slate-900 text-white shadow" : "bg-white border border-slate-200 text-slate-500"}`}>
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 space-y-3 text-left">
            {filteredIuran.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 px-4 py-8 text-center">
                <p className="text-sm font-bold text-slate-600">Belum ada data iuran yang sesuai</p>
                <p className="text-xs text-slate-400 mt-1">Coba ubah pencarian atau filter status.</p>
              </div>
            ) : (
              filteredIuran.map((item, index) => (
                <div key={item.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm animate-in fade-in transition-all duration-300 hover:scale-[1.01]" style={{ animationDelay: `${index * 35}ms` }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${item.status === "Lunas" ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"}`}>
                        {item.status === "Lunas" ? <CheckCircle2 size={18} /> : <Clock3 size={18} />}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800">{item.month}</h4>
                        <p className="text-xs text-slate-500 mt-1">Rp {item.amount.toLocaleString("id-ID")}</p>
                        <p className="text-xs text-slate-400 mt-2">Tanggal bayar: {item.date === "-" ? "Belum ada" : item.date}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${item.status === "Lunas" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                      {item.status}
                    </span>
                  </div>
                  {item.status === "Pending" ? (
                    <button onClick={() => handlePay(item.id)} className="w-full mt-4 rounded-2xl bg-emerald-600 text-white py-3 text-sm font-black shadow-xl shadow-emerald-100 transition-all hover:scale-[1.01] active:scale-95">
                      Bayar Iuran Ini
                    </button>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {receiptData ? (
        <div className="fixed inset-0 z-60 bg-slate-900/45 backdrop-blur-sm flex items-end justify-center px-4 pb-6">
          <div className="w-full max-w-md rounded-4xl bg-white shadow-2xl overflow-hidden animate-in fade-in duration-300">
            <div className="bg-linear-to-r from-emerald-600 to-teal-500 p-5 text-white relative overflow-hidden">
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10 blur-2xl" />
              <div className="relative z-10 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-emerald-50">Bukti Pembayaran</p>
                  <h3 className="text-xl font-black mt-2">Pembayaran Berhasil</h3>
                </div>
                <button onClick={() => setReceiptData(null)} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="p-5">
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <ReceiptText size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800">RT/RW Digital</p>
                    <p className="text-xs text-slate-500 mt-1">Simpan bukti ini sebagai catatan pembayaran Anda.</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-400">Periode</span>
                    <span className="font-bold text-slate-800 text-right">{receiptData.month}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-400">Nominal</span>
                    <span className="font-bold text-slate-800 text-right">Rp {receiptData.amount.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-400">Metode</span>
                    <span className="font-bold text-slate-800 text-right">{receiptData.method}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-400">Waktu bayar</span>
                    <span className="font-bold text-slate-800 text-right">{receiptData.paidAt}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-400">No. referensi</span>
                    <span className="font-bold text-slate-800 text-right">{receiptData.reference}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                <button onClick={downloadReceipt} className="flex-1 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-black text-slate-700 transition-all hover:scale-[1.01] active:scale-95">
                  Export PDF
                </button>
                <button onClick={() => setReceiptData(null)} className="flex-1 rounded-2xl bg-slate-900 text-white py-3 text-sm font-black shadow-xl transition-all hover:scale-[1.01] active:scale-95">
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <BottomNav />
    </div>
  );
}
