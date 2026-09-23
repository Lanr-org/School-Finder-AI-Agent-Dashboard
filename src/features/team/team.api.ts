import { api } from '../../lib/api/client.js'
import type { ApiSuccessResponse } from '../../lib/api/types.js'

export type UserRole = 'ADMIN' | 'ADVISOR' | 'OPERATIONS'
export type UserStatus = 'INVITED' | 'ACTIVE' | 'DISABLED'

export type TeamMember = {
  publicId: string
  fullName: string
  email: string
  role: UserRole
  status: UserStatus
  phone: string | null
  createdAt: string
}

export const listTeamMembers = async (): Promise<TeamMember[]> => {
  const res = await api.get<ApiSuccessResponse<TeamMember[]>>('/team')
  return res.data.data
}

export const updateMemberStatus = async (
  userId: string,
  status: Extract<UserStatus, 'ACTIVE' | 'DISABLED'>,
): Promise<TeamMember> => {
  const res = await api.patch<ApiSuccessResponse<TeamMember>>(`/team/${userId}/status`, { status })
  return res.data.data
}
