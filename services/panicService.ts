import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export type PanicAlert = {
  id: string
  user_id: string
  citizen_id: string | null
  rt: string | null
  rw: string | null
  kelurahan: string | null
  location_description: string | null
  status: 'active' | 'resolved' | 'cancelled'
  resolved_by: string | null
  resolved_at: string | null
  created_at: string
  updated_at: string
}

export type PanicAlertWithUser = PanicAlert & {
  user_email?: string
  profile_name?: string
  profile_phone?: string
  profile_rt?: string
  profile_rw?: string
}

export const panicService = {
  async triggerPanicAlert(locationData?: { rt?: string; rw?: string; kelurahan?: string; location_description?: string }): Promise<{ success: boolean; data?: PanicAlert; error?: string }> {
    try {
      // ✅ Get and validate current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user || !user.id) {
        console.error('[PANIC] User not authenticated')
        return {
          success: false,
          data: null,
          error: 'User not authenticated'
        }
      }

      // Get profile data for location (optional)
      let profile = null
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, name, phone')
          .eq('id', user.id)
          .maybeSingle()
        profile = profileData
      } catch (profileError) {
        console.warn('[PANIC] Failed to fetch profile, continuing without it:', profileError)
      }

      const alertData = {
        user_id: user.id,
        citizen_id: profile?.id || null,
        rt: locationData?.rt || null,
        rw: locationData?.rw || null,
        kelurahan: locationData?.kelurahan || null,
        location_description: locationData?.location_description || null,
        status: 'active' as const
      }

      // ✅ Validate alert data
      if (!alertData.user_id) {
        console.error('[PANIC] User ID is required')
        return {
          success: false,
          data: null,
          error: 'Invalid user data'
        }
      }

      const { data, error } = await supabase
        .from('panic_alerts')
        .insert(alertData)
        .select()
        .single()

      // ✅ Check for database errors
      if (error) {
        console.error('[PANIC] Insert error:', error.message)
        return {
          success: false,
          data: null,
          error: 'Failed to trigger panic alert'
        }
      }

      // ✅ Validate response
      if (!data || !data.id) {
        console.error('[PANIC] Invalid response from insert')
        return {
          success: false,
          data: null,
          error: 'Invalid response from server'
        }
      }

      console.log('[PANIC] ✅ Panic alert triggered successfully')
      return {
        success: true,
        data: data as PanicAlert,
        error: null
      }
    } catch (error) {
      console.error('[PANIC] Unexpected error:', error)
      return {
        success: false,
        data: null,
        error: 'An unexpected error occurred while triggering panic alert'
      }
    }
  },

  async getActivePanicAlerts(): Promise<{ success: boolean; data?: PanicAlertWithUser[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('panic_alerts')
        .select(`
          *,
          user:auth.users(email),
          profile:profiles(name, phone)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      // ✅ Check for database errors
      if (error) {
        console.error('[PANIC] Fetch error:', error.message)
        return {
          success: false,
          data: [],
          error: 'Failed to fetch panic alerts'
        }
      }

      // ✅ Validate and transform data
      const alerts = (Array.isArray(data) ? data : []).map((alert: any) => ({
        ...alert,
        user_email: alert.user?.email || '',
        profile_name: alert.profile?.name || 'Unknown',
        profile_phone: alert.profile?.phone || ''
      }))

      console.log('[PANIC] ✅ Successfully fetched', alerts.length, 'active panic alerts')
      return {
        success: true,
        data: alerts as PanicAlertWithUser[],
        error: null
      }
    } catch (error) {
      console.error('[PANIC] Unexpected error:', error)
      return {
        success: false,
        data: [],
        error: 'An unexpected error occurred while fetching panic alerts'
      }
    }
  },

  async getAllPanicAlerts(): Promise<{ success: boolean; data?: PanicAlertWithUser[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('panic_alerts')
        .select(`
          id,
          status,
          created_at,
          profiles (
            full_name,
            phone
          )
        `)
        .order('created_at', { ascending: false })

      // ✅ Check for database errors
      if (error) {
        console.error('[PANIC] Fetch error:', error.message)
        return {
          success: false,
          data: [],
          error: 'Failed to fetch panic alerts'
        }
      }

      // ✅ Validate and transform data
      const alerts = (Array.isArray(data) ? data : []).map((alert: any) => ({
        ...alert,
        profile_name: alert.profiles?.full_name || 'Warga',
        profile_phone: alert.profiles?.phone || ''
      }))

      console.log('[PANIC] ✅ Successfully fetched', alerts.length, 'total panic alerts')
      return {
        success: true,
        data: alerts as PanicAlertWithUser[],
        error: null
      }
    } catch (error) {
      console.error('[PANIC] Unexpected error:', error)
      return {
        success: false,
        data: [],
        error: 'An unexpected error occurred while fetching panic alerts'
      }
    }
  },

  async resolvePanicAlert(alertId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // ✅ Validate input
      if (!alertId || alertId.trim() === '') {
        console.error('[PANIC] Alert ID is required')
        return {
          success: false,
          error: 'Alert ID is required'
        }
      }

      // ✅ Get and validate current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user || !user.id) {
        console.error('[PANIC] User not authenticated')
        return {
          success: false,
          error: 'User not authenticated'
        }
      }

      const { error } = await supabase
        .from('panic_alerts')
        .update({
          status: 'resolved',
          resolved_by: user.id,
          resolved_at: new Date().toISOString()
        })
        .eq('id', alertId)

      // ✅ Check for database errors
      if (error) {
        console.error('[PANIC] Update error:', error.message)
        return {
          success: false,
          error: 'Failed to resolve panic alert'
        }
      }

      console.log('[PANIC] ✅ Panic alert resolved successfully')
      return {
        success: true,
        error: null
      }
    } catch (error) {
      console.error('[PANIC] Unexpected error:', error)
      return {
        success: false,
        error: 'An unexpected error occurred while resolving panic alert'
      }
    }
  },

  subscribeToPanicAlerts(callback: (payload: any) => void) {
    try {
      const channel = supabase
        .channel('panic-alerts-channel')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'panic_alerts'
          },
          callback
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'panic_alerts'
          },
          callback
        )
        .subscribe()

      console.log('[PANIC] ✅ Subscribed to panic alerts')
      return channel
    } catch (error) {
      console.error('[PANIC] Error subscribing to panic alerts:', error)
      throw error
    }
  }
}
