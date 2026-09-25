import { api } from '../../lib/api/client.js'
import type { ApiSuccessResponse } from '../../lib/api/types.js'
import type { IntakeMonth } from '../programs/programs.api.js'

export type StudentStatus =
  | 'NEW'
  | 'AWAITING_ASSIGNMENT'
  | 'ASSIGNED'
  | 'FOLLOW_UP'
  | 'APPLICATION_STARTED'
  | 'COMPLETED'
  | 'CLOSED'

export type Student = {
  publicId: string
  status: StudentStatus
  contact: {
    firstName: string
    lastName: string | null
    email: string | null
    phone: string | null
    source: 'TELEGRAM' | 'WHATSAPP' | 'LIVE_CHAT' | 'FACEBOOK' | 'MANUAL'
  }
  studyLevel: string | null
  targetDestinations: string[]
  targetIntakeMonth: IntakeMonth | null
  targetIntakeYear: number | null
  budgetRange: string | null
  academicBackground: string | null
  englishTestScore: string | null
  assignedAdvisor: { publicId: string; fullName: string } | null
  createdAt: string
  updatedAt: string
}

export type StudentsPagination = { page: number; limit: number; total: number; totalPages: number }

export type ListStudentsParams = {
  page?: number | undefined
  limit?: number | undefined
  status?: StudentStatus | undefined
  advisorId?: string | undefined
  search?: string | undefined
}

export type ListStudentsResult = {
  students: Student[]
  pagination: StudentsPagination
}

export const listStudents = async (params: ListStudentsParams): Promise<ListStudentsResult> => {
  const res = await api.get<ApiSuccessResponse<ListStudentsResult>>('/students', { params })
  return res.data.data
}

export const getStudent = async (studentId: string): Promise<Student> => {
  const res = await api.get<ApiSuccessResponse<Student>>(`/students/${studentId}`)
  return res.data.data
}

export const assignStudentAdvisor = async (studentId: string, advisorId: string | null): Promise<Student> => {
  const res = await api.patch<ApiSuccessResponse<Student>>(`/students/${studentId}/advisor`, { advisorId })
  return res.data.data
}

export const updateStudentStatus = async (studentId: string, status: StudentStatus): Promise<Student> => {
  const res = await api.patch<ApiSuccessResponse<Student>>(`/students/${studentId}/status`, { status })
  return res.data.data
}

export type StudentStatusChangeSource =
  | 'LEAD_CREATED'
  | 'MANUAL'
  | 'ADVISOR_ASSIGNED'
  | 'ADVISOR_UNASSIGNED'
  | 'FOLLOW_UP_CREATED'
  | 'APPLICATION_CREATED'

export type StudentStatusHistoryEntry = {
  fromStatus: StudentStatus | null
  toStatus: StudentStatus
  source: StudentStatusChangeSource
  changedBy: { publicId: string; fullName: string } | null
  changedAt: string
}

export const getStudentStatusHistory = async (studentId: string): Promise<StudentStatusHistoryEntry[]> => {
  const res = await api.get<ApiSuccessResponse<StudentStatusHistoryEntry[]>>(`/students/${studentId}/status-history`)
  return res.data.data
}
