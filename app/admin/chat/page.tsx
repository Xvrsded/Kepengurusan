"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useAuthGuard } from "@/lib/useAuthGuard";
import ChatBox from "@/components/ChatBox";

export default function AdminChatPage() {
  useAuthGuard();
  const router = useRouter();
  const supabaseUser = useAppStore((s) => s.supabaseUser);
  const profiles = useAppStore((s) => s.profiles);
  const fetchProfiles = useAppStore((s) => s.fetchProfiles);

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>("");

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const wargaProfiles = profiles.filter((p) => p.role === "warga");

  const handleSelectUser = (userId: string, userName: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <h1 className="text-lg font-bold text-slate-900">Chat Warga</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {selectedUserId ? (
          <div className="h-[calc(100vh-200px)]">
            <button
              onClick={() => setSelectedUserId(null)}
              className="mb-4 text-sm text-slate-600 hover:text-slate-900 flex items-center gap-2"
            >
              <ArrowLeft size={16} /> Kembali ke daftar
            </button>
            {supabaseUser && (
              <ChatBox
                currentUserId={supabaseUser.id}
                targetUserId={selectedUserId}
                targetUserName={selectedUserName}
              />
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <h2 className="text-base font-bold text-slate-900 mb-4">Pilih Warga untuk Chat</h2>
            <div className="space-y-2">
              {wargaProfiles.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">
                  Belum ada warga terdaftar.
                </p>
              ) : (
                wargaProfiles.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => handleSelectUser(profile.id, profile.name || "Unknown")}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                      {(profile.name || "U").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {profile.name || "Unknown"}
                      </p>
                      <p className="text-xs text-slate-500">{profile.phone || "No HP tidak tersedia"}</p>
                    </div>
                    <MessageSquare size={16} className="ml-auto text-slate-400" />
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
