import type { Metadata } from "next";
import "./globals.css";
import HydrationGuard from "@/components/HydrationGuard";
import AuthProvider from "@/providers/AuthProvider";
import AppToast from "@/components/AppToast";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "RT/RW Digital - Sistem Pengelolaan Lingkungan",
  description: "Platform digital untuk pengelolaan lingkungan RT/RW yang modern dan efisien",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  console.log("HOOK CHECK - RootLayout with AuthProvider added back");
  return (
    <html lang="id">
      <body className="bg-slate-50 text-slate-900 antialiased">
        <AuthProvider>
          <HydrationGuard>{children}</HydrationGuard>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
