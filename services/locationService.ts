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

      // ✅ Check for database errors
      if (error) {
        console.error('[LOCATION] Fetch error:', error.message)
        return {
          success: false,
          data: null,
          error: 'Failed to fetch location config'
        }
      }

      // ✅ Validate data existence
      if (!data) {
        console.error('[LOCATION] No location config found')
        return {
          success: false,
          data: null,
          error: 'Location config not found'
        }
      }

      // ✅ Validate required fields
      if (!data.rt || !data.rw || !data.kelurahan) {
        console.error('[LOCATION] Invalid location data structure')
        return {
          success: false,
          data: null,
          error: 'Invalid location data structure'
        }
      }

      return {
        success: true,
        data: data as LocationConfig,
        error: null
      }
    } catch (error) {
      console.error('[LOCATION] Unexpected error:', error)
      return {
        success: false,
        data: null,
        error: 'An unexpected error occurred while fetching location config'
      }
    }
  },

  async updateLocationConfig(config: Partial<LocationConfig>): Promise<{ success: boolean; error?: string }> {
    try {
      // ✅ Validate input
      if (!config || Object.keys(config).length === 0) {
        console.error('[LOCATION] Update config is empty')
        return {
          success: false,
          error: 'Update config cannot be empty'
        }
      }

      const { error } = await supabase
        .from('location_config')
        .update(config)
        .eq('id', 1) // Assuming single row with id=1

      // ✅ Check for database errors
      if (error) {
        console.error('[LOCATION] Update error:', error.message)
        return {
          success: false,
          error: 'Failed to update location config'
        }
      }

      console.log('[LOCATION] ✅ Location config updated successfully')
      return {
        success: true,
        error: null
      }
    } catch (error) {
      console.error('[LOCATION] Unexpected error during update:', error)
      return {
        success: false,
        error: 'An unexpected error occurred while updating location config'
      }
    }
  }
}
