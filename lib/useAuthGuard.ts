"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "./supabaseClient";

export function useAuthGuard() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    supabase.auth.getUser().then(({ data, error }) => {
      if (cancelled) return;
      if (error || !data.user) {
        router.replace("/login");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [router]);
}
