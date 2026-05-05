"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";

export default function Home() {
  const router = useRouter();
  const { role, isAuthReady } = useAppStore();

  useEffect(() => {
    if (!isAuthReady) return;

    if (!role) {
      router.replace("/login");
      return;
    }

    if (role === "admin") {
      router.replace("/admin");
    } else {
      router.replace("/warga");
    }

  }, [role, isAuthReady, router]);

  return null;
}
