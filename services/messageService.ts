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
    .update({ read_at: new Date().toISOString(), is_read: true })
    .eq("id", messageId);

  if (error) {
    console.error("Error marking message as read:", error);
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
    console.error("Error marking conversation as read:", error);
    throw error;
  }
}

export async function getConversations(userId: string): Promise<Conversation[]> {
  // Get all conversations with last message and unread count
  const { data: conversations, error } = await supabase
    .rpc('get_user_conversations', { user_id: userId });

  if (error) {
    console.error("Error fetching conversations:", error);
    // Fallback to manual query if RPC doesn't exist
    return getConversationsFallback(userId);
  }

  return conversations as Conversation[];
}

// Fallback function for conversations without RPC
async function getConversationsFallback(userId: string): Promise<Conversation[]> {
  // Get all messages involving the user
  const { data: messages, error } = await supabase
    .from("messages")
    .select(`
      id,
      sender_id,
      receiver_id,
      message,
      created_at,
      is_read,
      sender_profile:profiles!messages_sender_id_fkey(id, full_name, photo_url),
      receiver_profile:profiles!messages_receiver_id_fkey(id, full_name, photo_url)
    `)
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching messages for conversations:", error);
    return [];
  }

  // Group by conversation partner
  const conversationMap = new Map<string, Conversation>();

  messages?.forEach((msg: any) => {
    const isSender = msg.sender_id === userId;
    const partnerId = isSender ? msg.receiver_id : msg.sender_id;
    const partnerProfile = isSender ? msg.receiver_profile : msg.sender_profile;

    if (!conversationMap.has(partnerId)) {
      conversationMap.set(partnerId, {
        id: partnerId,
        name: partnerProfile?.full_name || "Unknown",
        photo_url: partnerProfile?.photo_url,
        last_message: msg.message,
        last_message_time: msg.created_at,
        unread_count: isSender ? 0 : (msg.is_read ? 0 : 1),
      });
    } else {
      // Update last message if this one is newer
      const existing = conversationMap.get(partnerId)!;
      if (new Date(msg.created_at) > new Date(existing.last_message_time)) {
        existing.last_message = msg.message;
        existing.last_message_time = msg.created_at;
      }
      // Add to unread count if this is a received unread message
      if (!isSender && !msg.is_read) {
        existing.unread_count += 1;
      }
    }
  });

  // Convert to array and sort by last message time
  return Array.from(conversationMap.values()).sort(
    (a, b) => new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime()
  );
}
