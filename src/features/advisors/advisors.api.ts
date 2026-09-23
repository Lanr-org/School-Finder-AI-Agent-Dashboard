import { api } from '../../lib/api/client.js'
import type { ApiSuccessResponse } from '../../lib/api/types.js'
import type { Student, StudentsPagination, StudentStatus } from '../students/students.api.js'
import type { FollowUp, FollowUpsPagination, FollowUpStatus } from '../followUps/followUps.api.js'

export type AdvisorAvailability = 'AVAILABLE' | 'LIMITED' | 'UNAVAILABLE'

export type AdvisorProfile = {
  advisorId: string
  fullName: string
  email: string
  availability: AdvisorAvailability
  maxCapacity: number | null
  activeStudentCount: number
  pendingFollowUpCount: number
  createdAt: string
  updatedAt: string
}

export type ListAdvisorStudentsParams = {
  page?: number | undefined
  limit?: number | undefined
  status?: StudentStatus | undefined
  search?: string | undefined
}

export type ListAdvisorFollowUpsParams = {
  page?: number | undefined
  limit?: number | undefined
  status?: FollowUpStatus | undefined
}

export const listAdvisorProfiles = async (): Promise<AdvisorProfile[]> => {
  const res = await api.get<ApiSuccessResponse<AdvisorProfile[]>>('/advisors')
  return res.data.data
}

export const getOwnAdvisorProfile = async (): Promise<AdvisorProfile> => {
  const res = await api.get<ApiSuccessResponse<AdvisorProfile>>('/advisors/me')
  return res.data.data
}

export const getAdvisorProfile = async (advisorId: string): Promise<AdvisorProfile> => {
  const res = await api.get<ApiSuccessResponse<AdvisorProfile>>(`/advisors/${advisorId}`)
  return res.data.data
}

export const createAdvisorProfile = async (data: {
  userId: string
  availability?: AdvisorAvailability | undefined
  maxCapacity?: number | null | undefined
}): Promise<AdvisorProfile> => {
  const res = await api.post<ApiSuccessResponse<AdvisorProfile>>('/advisors', data)
  return res.data.data
}

export const updateAdvisorProfile = async (
  advisorId: string,
  data: { availability?: AdvisorAvailability | undefined; maxCapacity?: number | null | undefined },
): Promise<AdvisorProfile> => {
  const res = await api.patch<ApiSuccessResponse<AdvisorProfile>>(`/advisors/${advisorId}`, data)
  return res.data.data
}

export const updateOwnAvailability = async (availability: AdvisorAvailability): Promise<AdvisorProfile> => {
  const res = await api.patch<ApiSuccessResponse<AdvisorProfile>>('/advisors/me', { availability })
  return res.data.data
}

export const listStudentsForAdvisor = async (
  advisorId: string,
  params: ListAdvisorStudentsParams,
): Promise<{ students: Student[]; pagination: StudentsPagination }> => {
  const res = await api.get<ApiSuccessResponse<{ students: Student[]; pagination: StudentsPagination }>>(
    `/advisors/${advisorId}/students`,
    { params },
  )
  return res.data.data
}

export const listFollowUpsForAdvisor = async (
  advisorId: string,
  params: ListAdvisorFollowUpsParams,
): Promise<{ followUps: FollowUp[]; pagination: FollowUpsPagination }> => {
  const res = await api.get<ApiSuccessResponse<{ followUps: FollowUp[]; pagination: FollowUpsPagination }>>(
    `/advisors/${advisorId}/follow-ups`,
    { params },
  )
  return res.data.data
}
