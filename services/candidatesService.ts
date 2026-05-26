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

      // ✅ Check for database errors
      if (error) {
        console.error('[CANDIDATES] Fetch error:', error.message)
        return {
          success: false,
          data: [],
          error: 'Failed to fetch candidates'
        }
      }

      // ✅ Validate data is array
      const validatedData = Array.isArray(data) ? data : []
      console.log('[CANDIDATES] ✅ Successfully fetched', validatedData.length, 'candidates')

      return {
        success: true,
        data: validatedData as Candidate[],
        error: null
      }
    } catch (error) {
      console.error('[CANDIDATES] Unexpected error:', error)
      return {
        success: false,
        data: [],
        error: 'An unexpected error occurred while fetching candidates'
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

      // ✅ Check for database errors
      if (error) {
        console.error('[CANDIDATES] Fetch error:', error.message)
        return {
          success: false,
          data: [],
          error: 'Failed to fetch active candidates'
        }
      }

      // ✅ Validate data is array
      const validatedData = Array.isArray(data) ? data : []
      console.log('[CANDIDATES] ✅ Successfully fetched', validatedData.length, 'active candidates')

      return {
        success: true,
        data: validatedData as Candidate[],
        error: null
      }
    } catch (error) {
      console.error('[CANDIDATES] Unexpected error:', error)
      return {
        success: false,
        data: [],
        error: 'An unexpected error occurred while fetching active candidates'
      }
    }
  },

  async addCandidate(candidate: Omit<Candidate, 'id' | 'vote_count' | 'created_at' | 'updated_at' | 'created_by'>): Promise<{ success: boolean; data?: Candidate; error?: string }> {
    try {
      // ✅ Validate input
      if (!candidate.name || candidate.name.trim() === '') {
        console.error('[CANDIDATES] Candidate name is required')
        return {
          success: false,
          data: null,
          error: 'Candidate name is required'
        }
      }

      const { data, error } = await supabase
        .from('candidates')
        .insert(candidate)
        .select()
        .single()

      // ✅ Check for database errors
      if (error) {
        console.error('[CANDIDATES] Insert error:', error.message)
        return {
          success: false,
          data: null,
          error: 'Failed to add candidate'
        }
      }

      // ✅ Validate response
      if (!data || !data.id) {
        console.error('[CANDIDATES] Invalid response from insert')
        return {
          success: false,
          data: null,
          error: 'Invalid response from server'
        }
      }

      console.log('[CANDIDATES] ✅ Candidate added successfully:', data.name)
      return {
        success: true,
        data: data as Candidate,
        error: null
      }
    } catch (error) {
      console.error('[CANDIDATES] Unexpected error:', error)
      return {
        success: false,
        data: null,
        error: 'An unexpected error occurred while adding candidate'
      }
    }
  },

  async updateCandidate(id: number, candidate: Partial<Candidate>): Promise<{ success: boolean; error?: string }> {
    try {
      // ✅ Validate input
      if (!id || id <= 0) {
        console.error('[CANDIDATES] Invalid candidate ID')
        return {
          success: false,
          error: 'Invalid candidate ID'
        }
      }

      if (!candidate || Object.keys(candidate).length === 0) {
        console.error('[CANDIDATES] Update data is empty')
        return {
          success: false,
          error: 'Update data cannot be empty'
        }
      }

      const { error } = await supabase
        .from('candidates')
        .update(candidate)
        .eq('id', id)

      // ✅ Check for database errors
      if (error) {
        console.error('[CANDIDATES] Update error:', error.message)
        return {
          success: false,
          error: 'Failed to update candidate'
        }
      }

      console.log('[CANDIDATES] ✅ Candidate updated successfully')
      return {
        success: true,
        error: null
      }
    } catch (error) {
      console.error('[CANDIDATES] Unexpected error:', error)
      return {
        success: false,
        error: 'An unexpected error occurred while updating candidate'
      }
    }
  },

  async deleteCandidate(id: number): Promise<{ success: boolean; error?: string }> {
    try {
      // ✅ Validate input
      if (!id || id <= 0) {
        console.error('[CANDIDATES] Invalid candidate ID')
        return {
          success: false,
          error: 'Invalid candidate ID'
        }
      }

      const { error } = await supabase
        .from('candidates')
        .delete()
        .eq('id', id)

      // ✅ Check for database errors
      if (error) {
        console.error('[CANDIDATES] Delete error:', error.message)
        return {
          success: false,
          error: 'Failed to delete candidate'
        }
      }

      console.log('[CANDIDATES] ✅ Candidate deleted successfully')
      return {
        success: true,
        error: null
      }
    } catch (error) {
      console.error('[CANDIDATES] Unexpected error:', error)
      return {
        success: false,
        error: 'An unexpected error occurred while deleting candidate'
      }
    }
  },

  subscribeToCandidates(callback: (payload: any) => void) {
    try {
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
    } catch (error) {
      console.error('[CANDIDATES] Error subscribing to candidates:', error)
      throw error
    }
  }
}
