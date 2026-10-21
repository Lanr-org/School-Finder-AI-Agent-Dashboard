import { api } from '../../lib/api/client.js'
import type { ApiSuccessResponse } from '../../lib/api/types.js'

// GET /auth/me returns the raw (snake_case) user record.
type RawUserDetails = {
  public_id: string
  full_name: string
  email: string
  phone: string | null
  role: string
  status: string
  last_login_at: string | null
  created_at: string
  updated_at: string
}

export type CurrentUser = {
  publicId: string
  fullName: string
  email: string
  phone: string | null
  role: string
  status: string
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}

const toCurrentUser = (raw: RawUserDetails): CurrentUser => ({
  publicId: raw.public_id,
  fullName: raw.full_name,
  email: raw.email,
  phone: raw.phone,
  role: raw.role,
  status: raw.status,
  lastLoginAt: raw.last_login_at,
  createdAt: raw.created_at,
  updatedAt: raw.updated_at,
})

export const getCurrentUser = async (): Promise<CurrentUser> => {
  const res = await api.get<ApiSuccessResponse<RawUserDetails>>('/auth/me')
  return toCurrentUser(res.data.data)
}

// PATCH /auth/me takes name and phone only; the sign-in email can't be changed here.
export const updateMyProfile = async (data: { fullName?: string; phone?: string | null }): Promise<void> => {
  await api.patch('/auth/me', data)
}

// Revokes every session, this one included, and clears the refresh cookie.
export const signOutEverywhere = async (): Promise<void> => {
  await api.post('/auth/logout-all')
}
