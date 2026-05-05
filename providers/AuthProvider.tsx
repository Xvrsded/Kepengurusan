'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/store/useAppStore'

const supabase = createClient()

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const init = async () => {
      console.log("🔄 INIT AUTH");

      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        useAppStore.setState({
          supabaseUser: null,
          role: null,
          isAuthReady: true,
        });
        return;
      }

      const user = data.session.user;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      useAppStore.setState({
        supabaseUser: user,
        role: profile?.role || "warga",
        userProfile: {
          name: profile?.full_name || user.email || "",
          nik: profile?.nik || "",
          address: profile?.address || "",
          phone: profile?.phone || "",
          role: profile?.role || null,
        },
        isAuthReady: true,
      });

      console.log("✅ AUTH READY");
    };

    init();
  }, []);

  return children
}
