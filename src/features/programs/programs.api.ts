import { api } from '../../lib/api/client.js'
import type { ApiSuccessResponse } from '../../lib/api/types.js'

export type StudyLevel = 'UNDERGRADUATE' | 'POSTGRADUATE' | 'DOCTORATE' | 'FOUNDATION'

export type IntakeMonth =
  | 'JANUARY'
  | 'FEBRUARY'
  | 'MARCH'
  | 'APRIL'
  | 'MAY'
  | 'JUNE'
  | 'JULY'
  | 'AUGUST'
  | 'SEPTEMBER'
  | 'OCTOBER'
  | 'NOVEMBER'
  | 'DECEMBER'

export type ProgramIntake = {
  month: IntakeMonth
  year: number
  applicationDeadline: string | null
}

export type Program = {
  publicId: string
  name: string
  studyLevel: StudyLevel
  qualification: string
  category: string
  duration: string
  school: { publicId: string; name: string }
  tuitionAmount: string
  tuitionCurrency: string
  scholarshipAvailability: string | null
  intakes: ProgramIntake[]
  academicRequirements: string | null
  englishRequirements: string | null
  operationNotes: string | null
  createdAt: string
  updatedAt: string
}

export type ProgramsPagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type ListProgramsParams = {
  page?: number
  limit?: number
  search?: string | undefined
  schoolId?: string | undefined
  studyLevel?: StudyLevel | undefined
  category?: string | undefined
}

export type ListProgramsResult = {
  programs: Program[]
  pagination: ProgramsPagination
}

export const listPrograms = async (params: ListProgramsParams): Promise<ListProgramsResult> => {
  const res = await api.get<ApiSuccessResponse<ListProgramsResult>>('/programs', { params })
  return res.data.data
}

export const getProgram = async (programId: string): Promise<Program> => {
  const res = await api.get<ApiSuccessResponse<Program>>(`/programs/${programId}`)
  return res.data.data
}
