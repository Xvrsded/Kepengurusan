import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const createClient = (request: NextRequest) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Debug log for environment variables
  console.log("ENV CHECK:", {
    url: !!supabaseUrl,
    key: !!supabaseKey,
  });

  // Validate environment variables before creating Supabase client
  if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase ENV missing:", {
      url: supabaseUrl,
      key: supabaseKey ? "exists" : "missing",
    });
    // Fallback: continue request without Supabase
    return NextResponse.next({
      request,
    });
  }

  // Create an unmodified response
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          supabaseResponse.cookies.set({ name, value, ...options });
        },
        remove(name, options) {
          supabaseResponse.cookies.set({ name, value: "", ...options });
        },
      },
    },
  );

  return supabaseResponse;
};