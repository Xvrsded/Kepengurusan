import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let supabaseInstance: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
    if (!url || !key) {
      // Build-time / prerender fallback: return a stub that resolves empty
      return new Proxy({} as SupabaseClient, {
        get(__, p: string | symbol) {
          if (p === "from") {
            return () => ({
              select: () => ({ eq: () => ({ order: () => Promise.resolve({ data: [], error: null }), single: () => Promise.resolve({ data: null, error: null }) }), order: () => Promise.resolve({ data: [], error: null }), single: () => Promise.resolve({ data: null, error: null }) }),
              insert: () => ({ select: () => Promise.resolve({ data: [], error: null }) }),
              update: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
              delete: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
            });
          }
          return () => Promise.resolve({ data: [], error: null });
        },
      }) as SupabaseClient;
    }
    supabaseInstance = createClient(url, key);
  }
  return supabaseInstance;
}

// Lazy proxy to avoid evaluating env vars during module init at build-time
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_, prop: string | symbol) {
    const client = getSupabaseClient();
    const value = (client as any)[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
});