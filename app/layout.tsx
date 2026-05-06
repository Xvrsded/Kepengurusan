import type { Metadata } from "next";
import "./globals.css";
import HydrationGuard from "@/components/HydrationGuard";
import AuthProvider from "@/providers/AuthProvider";
import AppToast from "@/components/AppToast";
import { Toaster } from "react-hot-toast";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "RT/RW Digital - Sistem Pengelolaan Lingkungan",
  description: "Platform digital untuk pengelolaan lingkungan RT/RW yang modern dan efisien",
  manifest: "/manifest.json",
  viewport: {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
  },
  themeColor: "#0f172a",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RTRW",
  },
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
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
