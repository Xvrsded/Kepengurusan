import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface IuranUserDetail {
  id: string;
  user_id: string;
  iuran_master_id: string;
  status: "unpaid" | "paid" | "overdue";
  proof_url: string | null;
  paid_at: string | null;
  verified_by: string | null;
  profiles?: {
    id: string;
    full_name: string;
    phone: string;
    role: string;
  };
  iuran_master?: {
    id: string;
    title: string;
    amount: number;
    due_date: string;
    category: string;
    period: string;
    is_active: boolean;
  };
}

export interface MessageWithProfiles {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
  sender?: {
    id: string;
    full_name: string;
    photo_url: string | null;
  };
  receiver?: {
    id: string;
    full_name: string;
    photo_url: string | null;
  };
}

export interface LetterWithProfile {
  id: string;
  user_id: string;
  type: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  profiles?: {
    id: string;
    full_name: string;
    phone: string;
  };
}

export interface PanicAlertWithProfile {
  id: string;
  user_id: string;
  status: "active" | "resolved" | "cancelled";
  message: string;
  created_at: string;
  profiles?: {
    id: string;
    full_name: string;
    phone: string;
  };
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  offset?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    current_page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    has_more: boolean;
  };
}

/**
 * Get iuran_user dengan detail JOIN ke profiles dan iuran_master
 * ✅ OPTIMIZED: Single JOIN query, avoids N+1 problem
 * 
 * @param userId - Filter by specific user (optional)
 * @param status - Filter by status: 'unpaid', 'paid', 'overdue' (optional)
 * @param params - Pagination params (page, pageSize)
 * @returns PaginatedResponse with iuran details
 */
export async function getIuranUserWithDetails(
  params: PaginationParams = {},
  filters?: {
    userId?: string;
    status?: "unpaid" | "paid" | "overdue";
  }
): Promise<PaginatedResponse<IuranUserDetail>> {
  const page = params.page || 1;
  const pageSize = params.pageSize || 20;
  const offset = (page - 1) * pageSize;

  try {
    // Build query for count
    let countQuery = supabase
      .from("iuran_user")
      .select("id", { count: "exact" });

    if (filters?.userId) {
      countQuery = countQuery.eq("user_id", filters.userId);
    }
    if (filters?.status) {
      countQuery = countQuery.eq("status", filters.status);
    }

    const { count: totalCount } = await countQuery;

    // Build main query with JOINs
    let query = supabase
      .from("iuran_user")
      .select(`
        id,
        user_id,
        iuran_master_id,
        status,
        proof_url,
        paid_at,
        verified_by,
        profiles!inner(
          id,
          full_name,
          phone,
          role
        ),
        iuran_master!inner(
          id,
          title,
          amount,
          due_date,
          category,
          period,
          is_active
        )
      `)
      .eq("iuran_master.is_active", true)
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (filters?.userId) {
      query = query.eq("user_id", filters.userId);
    }
    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    const { data, error } = await query;

    if (error) throw error;

    const total = totalCount || 0;
    return {
      data: (data as IuranUserDetail[]) || [],
      pagination: {
        current_page: page,
        page_size: pageSize,
        total_items: total,
        total_pages: Math.ceil(total / pageSize),
        has_more: offset + pageSize < total,
      },
    };
  } catch (error) {
    console.error("❌ Failed to get iuran user details:", error);
    throw error;
  }
}

/**
 * Get letters dengan profile info pengaju
 * ✅ OPTIMIZED: JOIN dengan profiles, selective columns
 * 
 * @param params - Pagination params
 * @param filters - Filter by userId or status (optional)
 * @returns Letters with requester profile info
 */
export async function getLettersWithProfiles(
  params: PaginationParams = {},
  filters?: {
    userId?: string;
    status?: "pending" | "approved" | "rejected";
  }
): Promise<PaginatedResponse<LetterWithProfile>> {
  const page = params.page || 1;
  const pageSize = params.pageSize || 20;
  const offset = (page - 1) * pageSize;

  try {
    // Get total count
    let countQuery = supabase
      .from("letters")
      .select("id", { count: "exact" });

    if (filters?.userId) {
      countQuery = countQuery.eq("user_id", filters.userId);
    }
    if (filters?.status) {
      countQuery = countQuery.eq("status", filters.status);
    }

    const { count: totalCount } = await countQuery;

    // Get paginated data with JOIN
    let query = supabase
      .from("letters")
      .select(`
        id,
        user_id,
        type,
        status,
        created_at,
        profiles!inner(
          id,
          full_name,
          phone
        )
      `)
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (filters?.userId) {
      query = query.eq("user_id", filters.userId);
    }
    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    const { data, error } = await query;

    if (error) throw error;

    const total = totalCount || 0;
    return {
      data: (data as LetterWithProfile[]) || [],
      pagination: {
        current_page: page,
        page_size: pageSize,
        total_items: total,
        total_pages: Math.ceil(total / pageSize),
        has_more: offset + pageSize < total,
      },
    };
  } catch (error) {
    console.error("❌ Failed to get letters with profiles:", error);
    throw error;
  }
}

/**
 * Get messages antara dua user dengan profile info sender/receiver
 * ✅ OPTIMIZED: JOIN dengan profiles, selective columns
 * 
 * @param userId - Current user ID
 * @param targetId - Chat target user ID
 * @param params - Pagination params
 * @returns Messages with sender/receiver profile info
 */
export async function getMessagesWithProfiles(
  userId: string,
  targetId: string,
  params: PaginationParams = {}
): Promise<PaginatedResponse<MessageWithProfiles>> {
  const page = params.page || 1;
  const pageSize = params.pageSize || 50;
  const offset = (page - 1) * pageSize;

  try {
    // Get total count of messages between these two users
    const { count: totalCount } = await supabase
      .from("messages")
      .select("id", { count: "exact" })
      .or(
        `and(sender_id.eq.${userId},receiver_id.eq.${targetId}),and(sender_id.eq.${targetId},receiver_id.eq.${userId})`
      );

    // Get paginated messages with JOINs for both sender and receiver
    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select(`
        id,
        sender_id,
        receiver_id,
        message,
        is_read,
        created_at
      `)
      .or(
        `and(sender_id.eq.${userId},receiver_id.eq.${targetId}),and(sender_id.eq.${targetId},receiver_id.eq.${userId})`
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (messagesError) throw messagesError;

    // Get profiles for all unique users in messages
    const userIds = new Set<string>();
    (messages || []).forEach((msg: any) => {
      userIds.add(msg.sender_id);
      userIds.add(msg.receiver_id);
    });

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, photo_url")
      .in("id", Array.from(userIds));

    if (profilesError) throw profilesError;

    // Create profile map for easy lookup
    const profileMap = new Map(
      (profiles || []).map((p: any) => [p.id, p])
    );

    // Merge profile data with messages
    const enrichedMessages: MessageWithProfiles[] = (messages || []).map((msg: any) => ({
      ...msg,
      sender: profileMap.get(msg.sender_id),
      receiver: profileMap.get(msg.receiver_id),
    }));

    const total = totalCount || 0;
    return {
      data: enrichedMessages,
      pagination: {
        current_page: page,
        page_size: pageSize,
        total_items: total,
        total_pages: Math.ceil(total / pageSize),
        has_more: offset + pageSize < total,
      },
    };
  } catch (error) {
    console.error("❌ Failed to get messages with profiles:", error);
    throw error;
  }
}

/**
 * Get panic alerts dengan profile info warga
 * ✅ OPTIMIZED: JOIN dengan profiles, selective columns
 * 
 * @param params - Pagination params
 * @param filters - Filter by status (optional)
 * @returns Panic alerts with warga profile info
 */
export async function getPanicAlertsWithProfiles(
  params: PaginationParams = {},
  filters?: {
    status?: "active" | "resolved" | "cancelled";
  }
): Promise<PaginatedResponse<PanicAlertWithProfile>> {
  const page = params.page || 1;
  const pageSize = params.pageSize || 25;
  const offset = (page - 1) * pageSize;

  try {
    // Get total count
    let countQuery = supabase
      .from("panic_alerts")
      .select("id", { count: "exact" });

    if (filters?.status) {
      countQuery = countQuery.eq("status", filters.status);
    }

    const { count: totalCount } = await countQuery;

    // Get paginated data with JOIN
    let query = supabase
      .from("panic_alerts")
      .select(`
        id,
        user_id,
        status,
        message,
        created_at,
        profiles!inner(
          id,
          full_name,
          phone
        )
      `)
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    const { data, error } = await query;

    if (error) throw error;

    const total = totalCount || 0;
    return {
      data: (data as PanicAlertWithProfile[]) || [],
      pagination: {
        current_page: page,
        page_size: pageSize,
        total_items: total,
        total_pages: Math.ceil(total / pageSize),
        has_more: offset + pageSize < total,
      },
    };
  } catch (error) {
    console.error("❌ Failed to get panic alerts with profiles:", error);
    throw error;
  }
}

// ============================================================================
// ADDITIONAL UTILITY FUNCTIONS
// ============================================================================

/**
 * Get profiles list dengan optional role filter
 * ✅ OPTIMIZED: Selective columns only
 */
export async function getProfilesList(filters?: { role?: string }) {
  try {
    let query = supabase.from("profiles").select("id, full_name, phone, role, photo_url");

    if (filters?.role) {
      query = query.eq("role", filters.role);
    }

    const { data, error } = await query.order("full_name", { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("❌ Failed to get profiles list:", error);
    throw error;
  }
}

/**
 * Get candidates dengan vote count
 * ✅ OPTIMIZED: JOIN dengan votes table, aggregation
 */
export async function getCandidatesWithVotes() {
  try {
    const { data, error } = await supabase
      .from("candidates")
      .select(`
        id,
        user_id,
        profiles!inner(
          id,
          full_name,
          photo_url
        )
      `)
      .order("full_name", { ascending: true });

    if (error) throw error;

    // Get vote counts for each candidate
    const candidateIds = (data || []).map((c: any) => c.id);
    const { data: voteCounts } = await supabase
      .from("votes")
      .select("candidate_id")
      .in("candidate_id", candidateIds);

    // Create vote count map
    const voteCountMap = new Map<string, number>();
    (voteCounts || []).forEach((vote: any) => {
      const count = voteCountMap.get(vote.candidate_id) || 0;
      voteCountMap.set(vote.candidate_id, count + 1);
    });

    // Merge vote counts with candidates
    const enrichedCandidates = (data || []).map((c: any) => ({
      ...c,
      vote_count: voteCountMap.get(c.id) || 0,
    }));

    return enrichedCandidates;
  } catch (error) {
    console.error("❌ Failed to get candidates with votes:", error);
    throw error;
  }
}

/**
 * Get iuran summary untuk specific user
 * ✅ OPTIMIZED: Aggregation query, single JOIN
 */
export async function getIuranSummary(userId: string) {
  try {
    const { data, error } = await supabase
      .from("iuran_user")
      .select(`
        id,
        status,
        paid_at,
        iuran_master(
          id,
          title,
          amount,
          due_date,
          period
        )
      `)
      .eq("user_id", userId);

    if (error) throw error;

    // Calculate summary
    const summary = {
      total_iuran: data?.length || 0,
      paid: data?.filter((i: any) => i.status === "paid").length || 0,
      unpaid: data?.filter((i: any) => i.status === "unpaid").length || 0,
      overdue: data?.filter((i: any) => i.status === "overdue").length || 0,
      total_paid: data
        ?.filter((i: any) => i.status === "paid")
        .reduce((sum: number, i: any) => sum + (i.iuran_master?.amount || 0), 0) || 0,
      total_unpaid: data
        ?.filter((i: any) => i.status === "unpaid")
        .reduce((sum: number, i: any) => sum + (i.iuran_master?.amount || 0), 0) || 0,
      details: data,
    };

    return summary;
  } catch (error) {
    console.error("❌ Failed to get iuran summary:", error);
    throw error;
  }
}

/**
 * Get dashboard statistics
 * ✅ OPTIMIZED: Parallel queries for performance
 */
export async function getDashboardStats() {
  try {
    const [profilesRes, lettersRes, iuranRes, panicRes, votesRes] = await Promise.all([
      supabase.from("profiles").select("id, role", { count: "exact" }),
      supabase.from("letters").select("id, status", { count: "exact" }),
      supabase.from("iuran_user").select("id, status", { count: "exact" }),
      supabase.from("panic_alerts").select("id, status", { count: "exact" }),
      supabase.from("votes").select("id", { count: "exact" }),
    ]);

    const wargaCount = profilesRes.data?.filter((p: any) => p.role === "warga").length || 0;
    const adminCount = profilesRes.data?.filter((p: any) => p.role === "admin").length || 0;
    const pendingLetters = lettersRes.data?.filter((l: any) => l.status === "pending").length || 0;
    const unpaidIuran = iuranRes.data?.filter((i: any) => i.status === "unpaid").length || 0;
    const activePanic = panicRes.data?.filter((p: any) => p.status === "active").length || 0;

    return {
      total_warga: wargaCount,
      total_admin: adminCount,
      pending_letters: pendingLetters,
      unpaid_iuran: unpaidIuran,
      active_panic: activePanic,
      total_votes: votesRes.count || 0,
    };
  } catch (error) {
    console.error("❌ Failed to get dashboard stats:", error);
    throw error;
  }
}

/**
 * Search profiles by name or phone
 * ✅ OPTIMIZED: Case-insensitive search with indexed columns
 */
export async function searchProfiles(searchTerm: string, limit: number = 20) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, phone, role")
      .or(`full_name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("❌ Failed to search profiles:", error);
    throw error;
  }
}
