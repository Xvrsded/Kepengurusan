"use client";

import RouteGuard from "@/components/RouteGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log("HOOK CHECK - AdminLayout with RouteGuard added back");
  return (
    <div className="min-h-screen bg-slate-50 flex justify-center">
      <div className="w-full max-w-md min-h-screen relative bg-white shadow-2xl overflow-hidden">
        <RouteGuard allowedRole="admin">{children}</RouteGuard>
      </div>
    </div>
  );
}
