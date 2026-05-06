import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  read_at: string | null;
};

export async function sendMessage(senderId: string, receiverId: string, message: string) {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      sender_id: senderId,
      receiver_id: receiverId,
      message: message.trim(),
    })
    .select()
    .single();

  if (error) {
    console.error("Error sending message:", error);
    throw error;
  }

  return data;
}

export async function getMessages(userId: string, targetId: string) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(`and(sender_id.eq.${userId},receiver_id.eq.${targetId}),and(sender_id.eq.${targetId},receiver_id.eq.${userId})`)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }

  return data as Message[];
}

export async function markAsRead(messageId: string) {
  const { error } = await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("id", messageId);

  if (error) {
    console.error("Error marking message as read:", error);
    throw error;
  }
}

export async function getConversations(userId: string) {
  // Get all unique conversation partners
  const { data: sentMessages } = await supabase
    .from("messages")
    .select("receiver_id, profiles!messages_receiver_id_fkey(full_name, photo_url)")
    .eq("sender_id", userId);

  const { data: receivedMessages } = await supabase
    .from("messages")
    .select("sender_id, profiles!messages_sender_id_fkey(full_name, photo_url)")
    .eq("receiver_id", userId);

  // Combine and deduplicate
  const conversations = new Map();

  sentMessages?.forEach((msg: any) => {
    if (!conversations.has(msg.receiver_id)) {
      conversations.set(msg.receiver_id, {
        id: msg.receiver_id,
        name: msg.profiles?.full_name || "Unknown",
        photo_url: msg.profiles?.photo_url,
      });
    }
  });

  receivedMessages?.forEach((msg: any) => {
    if (!conversations.has(msg.sender_id)) {
      conversations.set(msg.sender_id, {
        id: msg.sender_id,
        name: msg.profiles?.full_name || "Unknown",
        photo_url: msg.profiles?.photo_url,
      });
    }
  });

  return Array.from(conversations.values());
}
