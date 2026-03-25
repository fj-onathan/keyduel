import { create } from 'zustand'
import { getMe, logout as apiLogout, setSessionExpiredHandler, type AuthUser, type AuthProfile } from '../lib/api'

type AuthState = {
  user: AuthUser | null
  profile: AuthProfile | null
  isLoading: boolean
  isAuthenticated: boolean
  fetchMe: () => Promise<void>
  logout: () => Promise<void>
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,

  fetchMe: async () => {
    set({ isLoading: true })
    try {
      const data = await getMe()
      set({
        user: data.user,
        profile: data.profile,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch {
      set({
        user: null,
        profile: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  },

  logout: async () => {
    try {
      await apiLogout()
    } catch {
      // Even if the API call fails, clear local state.
    }
    set({
      user: null,
      profile: null,
      isAuthenticated: false,
      isLoading: false,
    })
  },

  clearAuth: () => {
    set({
      user: null,
      profile: null,
      isAuthenticated: false,
      isLoading: false,
    })
  },
}))

// Register a global handler so that any 401 response from the API
// automatically clears the auth state (handles session expiry).
setSessionExpiredHandler(() => {
  const state = useAuthStore.getState()
  if (state.isAuthenticated) {
    state.clearAuth()
  }
})
