"use client";

import { useAppStore } from "@/store/useAppStore";

export function useAuthGuard() {
  const user = useAppStore((s) => s.supabaseUser);
  const role = useAppStore((s) => s.role);
  const loading = useAppStore((s) => s.loading);

  // PURE GUARD: Only returns state, NO redirect logic
  // Redirects are handled ONLY by login page (single redirect point)
  return {
    isAuthenticated: !!user,
    role,
    loading
  };
}
