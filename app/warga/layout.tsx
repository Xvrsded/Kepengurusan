import type { ReactNode } from "react";
import RouteGuard from "@/components/RouteGuard";

export default function WargaLayout({ children }: { children: ReactNode }) {
  return <RouteGuard allowedRole="warga">{children}</RouteGuard>;
}
