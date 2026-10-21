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

// The open invitation of an INVITED member; its id is what resend/cancel take.
export type TeamInvitation = {
  id: string
  expiresAt: string
  sentAt: string
  lastSentAt: string
  sendCount: number
}

export type TeamMemberDetail = TeamMember & {
  lastLoginAt: string | null
  invitation: TeamInvitation | null
}

export type InviteMemberInput = {
  fullName: string
  email: string
  role: UserRole
  phone?: string | null | undefined
}

export type InviteMemberResult = {
  publicId: string
  fullName: string
  email: string
  role: UserRole
  status: UserStatus
  expiresAt: string
  sentAt: string
  /** False when the email provider refused the message; the account still exists. */
  emailSent: boolean
}

export type ResendInvitationResult = {
  publicId: string
  status: UserStatus
  expiresAt: string
  sentAt: string
  sendCount: number
  emailSent: boolean
}

export type UpdateTeamMemberInput = {
  fullName?: string | undefined
  email?: string | undefined
  phone?: string | null | undefined
}

export const listTeamMembers = async (): Promise<TeamMember[]> => {
  const res = await api.get<ApiSuccessResponse<TeamMember[]>>('/team')
  return res.data.data
}

export const getTeamMember = async (userId: string): Promise<TeamMemberDetail> => {
  const res = await api.get<ApiSuccessResponse<TeamMemberDetail>>(`/team/${userId}`)
  return res.data.data
}

export const inviteTeamMember = async (data: InviteMemberInput): Promise<InviteMemberResult> => {
  const res = await api.post<ApiSuccessResponse<InviteMemberResult>>('/team/invitations', data)
  return res.data.data
}

export const resendInvitation = async (invitationId: string): Promise<ResendInvitationResult> => {
  const res = await api.post<ApiSuccessResponse<ResendInvitationResult>>(`/team/invitations/${invitationId}/resend`)
  return res.data.data
}

export const cancelInvitation = async (invitationId: string): Promise<void> => {
  await api.delete(`/team/invitations/${invitationId}`)
}

export const updateTeamMember = async (userId: string, data: UpdateTeamMemberInput): Promise<TeamMember> => {
  const res = await api.patch<ApiSuccessResponse<TeamMember>>(`/team/${userId}`, data)
  return res.data.data
}

export const updateMemberStatus = async (
  userId: string,
  status: Extract<UserStatus, 'ACTIVE' | 'DISABLED'>,
): Promise<TeamMember> => {
  const res = await api.patch<ApiSuccessResponse<TeamMember>>(`/team/${userId}/status`, { status })
  return res.data.data
}
