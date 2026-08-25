import { create } from 'zustand'

export type AuthUser = {
  publicId: string
  fullName: string
  email: string
  role: string
  status: string
}

type AuthStatus = 'booting' | 'authenticated' | 'unauthenticated'

type AuthState = {
  accessToken: string | null
  user: AuthUser | null
  status: AuthStatus
  setAccessToken: (accessToken: string) => void
  loginSuccess: (accessToken: string, user: AuthUser) => void
  logout: () => void
}

// accessToken is kept in memory only (never persisted) — the httpOnly
// refresh-token cookie is what survives a reload; see AuthBoot.
export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  status: 'booting',
  setAccessToken: (accessToken) => set({ accessToken }),
  loginSuccess: (accessToken, user) => set({ accessToken, user, status: 'authenticated' }),
  logout: () => set({ accessToken: null, user: null, status: 'unauthenticated' }),
}))
