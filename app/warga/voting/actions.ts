"use server";

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from "next/cache";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function getCandidates() {
  const { data, error } = await supabase
    .from("candidates")
    .select("id, name, photo_url, description, vote_count, is_active, created_at, updated_at, created_by")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching candidates:", error);
    return [];
  }

  return data || [];
}

export async function checkHasVoted(userId: string) {
  const { data, error } = await supabase
    .from("votes")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error checking vote status:", error);
    return false;
  }

  return !!data;
}

export async function submitVote(userId: string, candidateId: number) {
  const { error } = await supabase
    .from("votes")
    .insert({
      user_id: userId,
      candidate_id: candidateId,
    });

  if (error) {
    console.error("Error submitting vote:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/warga/voting");
  return { success: true };
}

export async function getVotingStatus() {
  const { data, error } = await supabase
    .from("app_settings")
    .select("is_voting_active")
    .eq("id", 1)
    .single();

  if (error) {
    console.error("Error fetching voting status:", error);
    return false;
  }

  return data?.is_voting_active ?? false;
}

export async function toggleVotingStatus(currentStatus: boolean) {
  const { error } = await supabase
    .from("app_settings")
    .update({ is_voting_active: !currentStatus })
    .eq("id", 1);

  if (error) {
    console.error("Error toggling voting status:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/voting");
  revalidatePath("/warga");
  revalidatePath("/warga/voting");
  return { success: true };
}
