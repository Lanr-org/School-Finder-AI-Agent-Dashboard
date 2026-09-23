import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { api } from '../lib/api/client.js'
import { useAuthStore, type AuthUser } from '../store/authStore.js'

// GET /auth/me returns the raw (snake_case) user record, unlike
// POST /auth/login which returns a curated camelCase shape.
type RawUserDetails = {
  public_id: string
  full_name: string
  email: string
  role: string
  status: string
}

const toAuthUser = (raw: RawUserDetails): AuthUser => ({
  publicId: raw.public_id,
  fullName: raw.full_name,
  email: raw.email,
  role: raw.role,
  status: raw.status,
})

// Trades the httpOnly refresh cookie for a fresh access token on load, so a
// page reload doesn't bounce an already logged-in user to /login.
const AuthBoot = ({ children }: { children: ReactNode }) => {
  const status = useAuthStore((state) => state.status)

  useEffect(() => {
    api
      .post<{ data: { accessToken: string } }>('/auth/refresh')
      .then((res) => {
        useAuthStore.getState().setAccessToken(res.data.data.accessToken)
        return api.get<{ data: RawUserDetails }>('/auth/me')
      })
      .then((res) => {
        const token = useAuthStore.getState().accessToken
        if (token) {
          useAuthStore.getState().loginSuccess(token, toAuthUser(res.data.data))
        }
      })
      .catch(() => useAuthStore.getState().logout())
  }, [])

  if (status === 'booting') {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-[#6B7280]">
        Loading…
      </div>
    )
  }

  return children
}

export default AuthBoot
