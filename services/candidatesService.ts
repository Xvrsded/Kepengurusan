import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export type Candidate = {
  id: number
  name: string
  photo_url: string | null
  description: string | null
  vote_count: number
  is_active: boolean
  created_at: string
  updated_at: string
  created_by: string | null
}

export const candidatesService = {
  async getCandidates(): Promise<{ success: boolean; data?: Candidate[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('[CANDIDATES] Fetch error:', error.message)
        return {
          success: false,
          error: 'Failed to fetch candidates'
        }
      }

      return {
        success: true,
        data: data as Candidate[]
      }
    } catch (error) {
      console.error('[CANDIDATES] Unexpected error:', error)
      return {
        success: false,
        error: 'An unexpected error occurred'
      }
    }
  },

  async getActiveCandidates(): Promise<{ success: boolean; data?: Candidate[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('[CANDIDATES] Fetch error:', error.message)
        return {
          success: false,
          error: 'Failed to fetch active candidates'
        }
      }

      return {
        success: true,
        data: data as Candidate[]
      }
    } catch (error) {
      console.error('[CANDIDATES] Unexpected error:', error)
      return {
        success: false,
        error: 'An unexpected error occurred'
      }
    }
  },

  async addCandidate(candidate: Omit<Candidate, 'id' | 'vote_count' | 'created_at' | 'updated_at' | 'created_by'>): Promise<{ success: boolean; data?: Candidate; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('candidates')
        .insert(candidate)
        .select()
        .single()

      if (error) {
        console.error('[CANDIDATES] Insert error:', error.message)
        return {
          success: false,
          error: 'Failed to add candidate'
        }
      }

      return {
        success: true,
        data: data as Candidate
      }
    } catch (error) {
      console.error('[CANDIDATES] Unexpected error:', error)
      return {
        success: false,
        error: 'An unexpected error occurred'
      }
    }
  },

  async updateCandidate(id: number, candidate: Partial<Candidate>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('candidates')
        .update(candidate)
        .eq('id', id)

      if (error) {
        console.error('[CANDIDATES] Update error:', error.message)
        return {
          success: false,
          error: 'Failed to update candidate'
        }
      }

      return {
        success: true
      }
    } catch (error) {
      console.error('[CANDIDATES] Unexpected error:', error)
      return {
        success: false,
        error: 'An unexpected error occurred'
      }
    }
  },

  async deleteCandidate(id: number): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('candidates')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('[CANDIDATES] Delete error:', error.message)
        return {
          success: false,
          error: 'Failed to delete candidate'
        }
      }

      return {
        success: true
      }
    } catch (error) {
      console.error('[CANDIDATES] Unexpected error:', error)
      return {
        success: false,
        error: 'An unexpected error occurred'
      }
    }
  },

  subscribeToCandidates(callback: (payload: any) => void) {
    const channel = supabase
      .channel('candidates-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'candidates'
        },
        callback
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'candidates'
        },
        callback
      )
      .subscribe()

    return channel
  }
}
