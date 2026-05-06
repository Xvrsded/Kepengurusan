"use client";

import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useAuthGuard } from "@/lib/useAuthGuard";
import ChatBox from "@/components/ChatBox";

export default function WargaChatPage() {
  useAuthGuard();
  const router = useRouter();
  const supabaseUser = useAppStore((s) => s.supabaseUser);
  const profiles = useAppStore((s) => s.profiles);
  const fetchProfiles = useAppStore((s) => s.fetchProfiles);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  // Find admin user
  const adminProfile = profiles.find((p) => p.role === "admin");

  if (!adminProfile) {
    return (
      <main className="min-h-screen bg-slate-50 pb-24 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500">Admin belum tersedia untuk chat.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <h1 className="text-lg font-bold text-slate-900">Chat Admin</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 h-[calc(100vh-200px)]">
        {supabaseUser && (
          <ChatBox
            currentUserId={supabaseUser.id}
            targetUserId={adminProfile.id}
            targetUserName="Admin"
          />
        )}
      </div>
    </main>
  );
}
