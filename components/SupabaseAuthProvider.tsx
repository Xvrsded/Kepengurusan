"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAppStore } from "@/store/useAppStore";

export default function SupabaseAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const syncSupabaseUser = useAppStore((s) => s.syncSupabaseUser);
  const setSupabaseUser = useAppStore((s) => s.setSupabaseUser);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        syncSupabaseUser();
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          await syncSupabaseUser();
        } else {
          setSupabaseUser(null);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [syncSupabaseUser, setSupabaseUser]);

  return <>{children}</>;
}
