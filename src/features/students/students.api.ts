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
