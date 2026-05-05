import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export type LocationConfig = {
  id: number
  rt: string
  rw: string
  kelurahan: string
  kota: string
  postal_code: string
  created_at: string
  updated_at: string
}

export const locationService = {
  async getLocationConfig(): Promise<{ success: boolean; data?: LocationConfig; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('location_config')
        .select('*')
        .single()

      if (error) {
        console.error('[LOCATION] Fetch error:', error.message)
        return {
          success: false,
          error: 'Failed to fetch location config'
        }
      }

      if (!data) {
        console.error('[LOCATION] No location config found')
        return {
          success: false,
          error: 'Location config not found'
        }
      }

      return {
        success: true,
        data: data as LocationConfig
      }
    } catch (error) {
      console.error('[LOCATION] Unexpected error:', error)
      return {
        success: false,
        error: 'An unexpected error occurred'
      }
    }
  },

  async updateLocationConfig(config: Partial<LocationConfig>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('location_config')
        .update(config)
        .eq('id', 1) // Assuming single row with id=1

      if (error) {
        console.error('[LOCATION] Update error:', error.message)
        return {
          success: false,
          error: 'Failed to update location config'
        }
      }

      return {
        success: true
      }
    } catch (error) {
      console.error('[LOCATION] Unexpected error:', error)
      return {
        success: false,
        error: 'An unexpected error occurred'
      }
    }
  }
}
