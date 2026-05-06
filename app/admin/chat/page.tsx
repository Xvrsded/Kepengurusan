"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, MessageSquare, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useAuthGuard } from "@/lib/useAuthGuard";
import ChatBox from "@/components/ChatBox";
import { getConversations, markConversationAsRead, type Conversation } from "@/services/messageService";

export default function AdminChatPage() {
  useAuthGuard();
  const router = useRouter();
  const supabaseUser = useAppStore((s) => s.supabaseUser);

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);

  useEffect(() => {
    if (supabaseUser) {
      loadConversations();
    }
  }, [supabaseUser]);

  const loadConversations = async () => {
    if (!supabaseUser?.id) return;
    setLoadingConversations(true);
    try {
      const convs = await getConversations(supabaseUser.id);
      setConversations(convs);
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setLoadingConversations(false);
    }
  };

  const handleSelectUser = async (userId: string, userName: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    // Mark conversation as read
    if (supabaseUser) {
      await markConversationAsRead(supabaseUser.id, userId);
      // Reload conversations to update unread count
      loadConversations();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins}m lalu`;
    if (diffHours < 24) return `${diffHours}j lalu`;
    if (diffDays < 7) return `${diffDays}h lalu`;
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
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
              onClick={() => {
                setSelectedUserId(null);
                loadConversations();
              }}
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
            <h2 className="text-base font-bold text-slate-900 mb-4">Percakapan</h2>
            <div className="space-y-2">
              {loadingConversations ? (
                <div className="text-center py-8">
                  <div className="h-6 w-6 rounded-full border-4 border-slate-200 border-t-blue-500 animate-spin mx-auto" />
                </div>
              ) : conversations.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">
                  Belum ada percakapan.
                </p>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectUser(conv.id, conv.name)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-left relative"
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg shrink-0 overflow-hidden">
                      {conv.photo_url ? (
                        <img src={conv.photo_url} alt={conv.name} className="w-full h-full object-cover" />
                      ) : (
                        (conv.name || "U").charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {conv.name}
                        </p>
                        <span className="text-xs text-slate-400 flex items-center gap-1 shrink-0">
                          <Clock size={12} />
                          {formatTime(conv.last_message_time)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 truncate">
                        {conv.last_message}
                      </p>
                    </div>
                    {conv.unread_count > 0 && (
                      <div className="min-w-6 h-6 px-2 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {conv.unread_count > 9 ? "9+" : conv.unread_count}
                      </div>
                    )}
                    <MessageSquare size={16} className="ml-2 text-slate-400 shrink-0" />
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
