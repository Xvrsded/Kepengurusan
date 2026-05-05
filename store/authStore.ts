import { create } from 'zustand'

type Role = 'admin' | 'warga'

interface AuthState {
  user: any
  role: Role | null
  loading: boolean
  setUser: (user: any) => void
  setRole: (role: Role) => void
  setLoading: (val: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  loading: true,

  setUser: (user) => set({ user }),
  setRole: (role) => set({ role }),
  setLoading: (loading) => set({ loading }),
}))
