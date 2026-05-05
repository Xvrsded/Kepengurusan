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
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return {
          success: false,
          error: 'User not authenticated'
        }
      }

      // Get profile data for location
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, name, phone')
        .eq('id', user.id)
        .maybeSingle()

      const alertData = {
        user_id: user.id,
        citizen_id: profile?.id || null,
        rt: locationData?.rt || null,
        rw: locationData?.rw || null,
        kelurahan: locationData?.kelurahan || null,
        location_description: locationData?.location_description || null,
        status: 'active' as const
      }

      const { data, error } = await supabase
        .from('panic_alerts')
        .insert(alertData)
        .select()
        .single()

      if (error) {
        console.error('[PANIC] Insert error:', error.message)
        return {
          success: false,
          error: 'Failed to trigger panic alert'
        }
      }

      return {
        success: true,
        data: data as PanicAlert
      }
    } catch (error) {
      console.error('[PANIC] Unexpected error:', error)
      return {
        success: false,
        error: 'An unexpected error occurred'
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

      if (error) {
        console.error('[PANIC] Fetch error:', error.message)
        return {
          success: false,
          error: 'Failed to fetch panic alerts'
        }
      }

      const alerts = data?.map((alert: any) => ({
        ...alert,
        user_email: alert.user?.email,
        profile_name: alert.profile?.name,
        profile_phone: alert.profile?.phone
      })) || []

      return {
        success: true,
        data: alerts as PanicAlertWithUser[]
      }
    } catch (error) {
      console.error('[PANIC] Unexpected error:', error)
      return {
        success: false,
        error: 'An unexpected error occurred'
      }
    }
  },

  async getAllPanicAlerts(): Promise<{ success: boolean; data?: PanicAlertWithUser[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('panic_alerts')
        .select(`
          id,
          message,
          status,
          created_at,
          profiles (
            full_name,
            phone
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('[PANIC] Fetch error:', error.message)
        return {
          success: false,
          error: 'Failed to fetch panic alerts'
        }
      }

      const alerts = data?.map((alert: any) => ({
        ...alert,
        profile_name: alert.profiles?.full_name || "Warga",
        profile_phone: alert.profiles?.phone
      })) || []

      return {
        success: true,
        data: alerts as PanicAlertWithUser[]
      }
    } catch (error) {
      console.error('[PANIC] Unexpected error:', error)
      return {
        success: false,
        error: 'An unexpected error occurred'
      }
    }
  },

  async resolvePanicAlert(alertId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
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

      if (error) {
        console.error('[PANIC] Update error:', error.message)
        return {
          success: false,
          error: 'Failed to resolve panic alert'
        }
      }

      return {
        success: true
      }
    } catch (error) {
      console.error('[PANIC] Unexpected error:', error)
      return {
        success: false,
        error: 'An unexpected error occurred'
      }
    }
  },

  subscribeToPanicAlerts(callback: (payload: any) => void) {
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

    return channel
  }
}
