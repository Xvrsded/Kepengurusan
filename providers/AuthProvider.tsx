'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/store/useAppStore'

const supabase = createClient()

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const handleSession = async (session: any) => {
    console.log("🔄 HANDLE SESSION", session ? "SESSION EXISTS" : "NO SESSION");

    if (!session) {
      useAppStore.setState({
        supabaseUser: null,
        role: null,
        userProfile: {
          name: "",
          nik: "",
          address: "",
          phone: "",
          role: null,
        },
        isAuthReady: true,
      });
      return;
    }

    const user = session.user;

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, full_name, nik, address, status, phone, role")
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

      console.log("✅ AUTH READY", profile?.role || "warga");
    } catch (error) {
      console.error("❌ Error fetching profile:", error);
      // Fallback to warga role if profile fetch fails
      useAppStore.setState({
        supabaseUser: user,
        role: "warga",
        userProfile: {
          name: user.email || "",
          nik: "",
          address: "",
          phone: "",
          role: "warga",
        },
        isAuthReady: true,
      });
      console.log("✅ AUTH READY (FALLBACK)");
    }
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      console.log("🔄 INIT AUTH");

      const { data } = await supabase.auth.getSession();

      if (!mounted) return;

      await handleSession(data.session);
    };

    init();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: any) => {
        console.log("🔔 AUTH STATE CHANGE:", event);
        if (!mounted) return;
        await handleSession(session);
      }
    );

    // Cleanup on unmount
    return () => {
      mounted = false;
      subscription.unsubscribe();
      console.log("🧹 AUTH PROVIDER CLEANUP");
    };
  }, []);

  return children
}
