import { api } from '../../lib/api/client.js'
import type { ApiSuccessResponse } from '../../lib/api/types.js'

export type FollowUpPriority = 'NORMAL' | 'HIGH' | 'URGENT'
export type FollowUpStatus = 'PENDING' | 'COMPLETED' | 'CANCELED' | 'OVERDUE'

export type FollowUp = {
  publicId: string
  studentId?: string
  dueAt: string
  priority: FollowUpPriority
  status: FollowUpStatus
  description: string
  completedAt: string | null
  canceledAt: string | null
  createdAt: string
  updatedAt: string
}

export type FollowUpsPagination = { page: number; limit: number; total: number; totalPages: number }

export type ListFollowUpsParams = {
  page?: number | undefined
  limit?: number | undefined
  status?: FollowUpStatus | undefined
}

export type ListFollowUpsResult = {
  followUps: FollowUp[]
  pagination: FollowUpsPagination
}

export const listFollowUps = async (studentId: string, params: ListFollowUpsParams): Promise<ListFollowUpsResult> => {
  const res = await api.get<ApiSuccessResponse<ListFollowUpsResult>>(`/students/${studentId}/follow-ups`, { params })
  return res.data.data
}

export const createFollowUp = async (
  studentId: string,
  data: { dueAt: string; priority?: FollowUpPriority | undefined; description: string },
): Promise<FollowUp> => {
  const res = await api.post<ApiSuccessResponse<FollowUp>>(`/students/${studentId}/follow-ups`, data)
  return res.data.data
}

export const updateFollowUp = async (
  studentId: string,
  followUpId: string,
  data: { dueAt?: string | undefined; priority?: FollowUpPriority | undefined; description?: string | undefined },
): Promise<FollowUp> => {
  const res = await api.patch<ApiSuccessResponse<FollowUp>>(`/students/${studentId}/follow-ups/${followUpId}`, data)
  return res.data.data
}

export const completeFollowUp = async (studentId: string, followUpId: string): Promise<FollowUp> => {
  const res = await api.post<ApiSuccessResponse<FollowUp>>(`/students/${studentId}/follow-ups/${followUpId}/complete`)
  return res.data.data
}

export const cancelFollowUp = async (studentId: string, followUpId: string): Promise<FollowUp> => {
  const res = await api.post<ApiSuccessResponse<FollowUp>>(`/students/${studentId}/follow-ups/${followUpId}/cancel`)
  return res.data.data
}
