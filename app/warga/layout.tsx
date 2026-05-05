"use client";

import RouteGuard from "@/components/RouteGuard";
import FloatingPanicButton from "@/components/FloatingPanicButton";

export default function WargaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log("HOOK CHECK - WargaLayout with RouteGuard added back");
  return (
    <RouteGuard allowedRole="warga">
      {children}
      <FloatingPanicButton />
    </RouteGuard>
  );
}
