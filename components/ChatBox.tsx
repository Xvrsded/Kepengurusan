"use client";

import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { markConversationAsRead } from "@/services/messageService";

type ChatBoxProps = {
  currentUserId: string;
  targetUserId: string;
  targetUserName?: string;
};

export default function ChatBox({ currentUserId, targetUserId, targetUserName }: ChatBoxProps) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const messages = useAppStore((s) => s.messages);
  const loadingMessages = useAppStore((s) => s.loadingMessages);
  const sendMessage = useAppStore((s) => s.sendMessage);
  const fetchMessages = useAppStore((s) => s.fetchMessages);

  useEffect(() => {
    if (currentUserId && targetUserId) {
      fetchMessages(currentUserId, targetUserId);
      // Mark conversation as read when opening
      markConversationAsRead(currentUserId, targetUserId);
    }
  }, [currentUserId, targetUserId, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || !currentUserId || !targetUserId) return;

    await sendMessage(currentUserId, targetUserId, message);
    setMessage("");
    await fetchMessages(currentUserId, targetUserId);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
        <h3 className="text-sm font-bold text-slate-900">
          Chat dengan {targetUserName || "Admin"}
        </h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <div className="h-6 w-6 rounded-full border-4 border-slate-200 border-t-blue-500 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-slate-400 text-sm py-8">
            Belum ada pesan. Mulai percakapan!
          </div>
        ) : (
          messages.map((msg: any) => {
            const isSender = msg.sender_id === currentUserId;
            return (
              <div
                key={msg.id}
                className={`flex ${isSender ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                    isSender
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-slate-100 text-slate-900 rounded-bl-sm"
                  }`}
                >
                  <p className="text-sm">{msg.message}</p>
                  <p className={`text-xs mt-1 ${isSender ? "text-blue-100" : "text-slate-400"}`}>
                    {new Date(msg.created_at).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ketik pesan..."
            className="flex-1 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
