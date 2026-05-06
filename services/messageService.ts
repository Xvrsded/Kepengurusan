import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  read_at: string | null;
  is_read: boolean;
};

export type Conversation = {
  id: string;
  name: string;
  photo_url: string | null;
  last_message: string;
  last_message_time: string;
  unread_count: number;
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
    console.error("Error sending message:", JSON.stringify(error, null, 2));
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
    console.error("Error fetching messages:", JSON.stringify(error, null, 2));
    throw error;
  }

  return data as Message[];
}

export async function markAsRead(messageId: string) {
  const { error } = await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString(), is_read: true })
    .eq("id", messageId);

  if (error) {
    console.error("Error marking message as read:", JSON.stringify(error, null, 2));
    throw error;
  }
}

export async function markConversationAsRead(userId: string, partnerId: string) {
  const { error } = await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString(), is_read: true })
    .eq("sender_id", partnerId)
    .eq("receiver_id", userId)
    .eq("is_read", false);

  if (error) {
    console.error("Error marking conversation as read:", JSON.stringify(error, null, 2));
    throw error;
  }
}

export async function getConversations(userId: string): Promise<Conversation[]> {
  try {
    // Get all conversations with last message and unread count
    const { data: conversations, error } = await supabase
      .rpc('get_user_conversations', { user_id: userId });

    if (error) {
      console.error("RPC error:", JSON.stringify(error, null, 2));
      return getConversationsFallback(userId);
    }

    return conversations as Conversation[];
  } catch (err) {
    console.error("getConversations crash:", err);
    return getConversationsFallback(userId);
  }
}

// Fallback function for conversations without RPC
async function getConversationsFallback(userId: string): Promise<Conversation[]> {
  try {
    const { data, error } = await supabase
      .from("messages")
      .select(`
        id,
        message,
        created_at,
        sender_id,
        receiver_id,
        sender:sender_id (id, full_name),
        receiver:receiver_id (id, full_name)
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fallback error:", JSON.stringify(error, null, 2));
      throw error;
    }

    const conversations = new Map();

    data?.forEach((msg: any) => {
      const otherUser =
        msg.sender_id === userId ? msg.receiver : msg.sender;

      if (!otherUser) return;

      if (!conversations.has(otherUser.id)) {
        conversations.set(otherUser.id, {
          user_id: otherUser.id,
          full_name: otherUser.full_name || "Unknown",
          last_message: msg.message,
          last_time: msg.created_at,
        });
      }
    });

    return Array.from(conversations.values());
  } catch (err) {
    console.error("Fallback crash:", err);
    return [];
  }
}
