import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

type LoginResult = {
  success: boolean
  user?: any
  role?: 'admin' | 'warga' | null
  error?: string
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResult> {
    try {
      // Step 1: Authenticate with Supabase
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

      if (authError || !data.user) {
        return {
          success: false,
          error: authError?.message || 'Authentication failed'
        }
      }

      const user = data.user

      // Step 2: Fetch profile from profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()

      if (profileError) {
        console.error('[AUTH] Profile fetch error:', profileError.message)
        return {
          success: false,
          error: 'Failed to fetch profile'
        }
      }

      if (!profile || !profile.role) {
        console.error('[AUTH] Profile or role not found for user:', user.id)
        return {
          success: false,
          error: 'Profile or role not found'
        }
      }

      // Step 3: Return user and role
      return {
        success: true,
        user,
        role: profile.role as 'admin' | 'warga'
      }
    } catch (error) {
      console.error('[AUTH] Login error:', error)
      return {
        success: false,
        error: 'An unexpected error occurred'
      }
    }
  },

  async logout() {
    return await supabase.auth.signOut()
  },

  async getSession() {
    return await supabase.auth.getSession()
  },

  async getUser() {
    return await supabase.auth.getUser()
  },

  async fetchUserProfile(userId: string): Promise<{ success: boolean; role?: 'admin' | 'warga' | null; error?: string }> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.warn("⚠️ PROFILE NOT FOUND");

      return {
        success: true,
        role: "warga", // fallback aman
      };
    }

    return {
      success: true,
      role: data.role as 'admin' | 'warga',
    };
  }
}
