import type { Metadata } from "next";
import "./globals.css";
import HydrationGuard from "@/components/HydrationGuard";
import AppToast from "@/components/AppToast";
import SupabaseAuthProvider from "@/components/SupabaseAuthProvider";

export const metadata: Metadata = {
  title: "RT/RW Digital",
  description: "Aplikasi administrasi warga RT/RW",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-slate-50 text-slate-900 antialiased"><HydrationGuard><SupabaseAuthProvider><AppToast />{children}</SupabaseAuthProvider></HydrationGuard></body>
    </html>
  );
}
