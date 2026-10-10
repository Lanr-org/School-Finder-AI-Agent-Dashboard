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

export type VerificationStatus = 'UNVERIFIED' | 'VERIFIED' | 'NEEDS_RECHECK'
export type ReportStatus = 'OPEN' | 'RESOLVED'

export type StaffRef = { publicId: string; fullName: string }

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
  sourceUrl: string | null
  feesAcademicYear: string | null
  verificationStatus: VerificationStatus
  verifiedAt: string | null
  verifiedBy: StaffRef | null
  evidence: Record<string, string> | null
  lastCheckedAt: string | null
  createdAt: string
  updatedAt: string
}

// What the create/update endpoints accept (schoolId is the public ID, e.g. SCH-1001).
export type ProgramInput = {
  name: string
  studyLevel: StudyLevel
  qualification: string
  category: string
  duration: string
  schoolId: string
  tuitionAmount: number
  tuitionCurrency: string
  scholarshipAvailability: string | null
  intakes: { month: IntakeMonth; year: number; applicationDeadline: string | null }[]
  academicRequirements: string | null
  englishRequirements: string | null
  operationNotes: string | null
  sourceUrl: string | null
  feesAcademicYear: string | null
}

export type ProgramDataReport = {
  id: string
  program: { publicId: string; name: string; schoolName: string }
  message: string
  status: ReportStatus
  reportedBy: StaffRef
  resolvedBy: StaffRef | null
  createdAt: string
  resolvedAt: string | null
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
  verificationStatus?: VerificationStatus | undefined
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

export const createProgram = async (input: ProgramInput): Promise<Program> => {
  const res = await api.post<ApiSuccessResponse<Program>>('/programs', input)
  return res.data.data
}

export const updateProgram = async (programId: string, input: Partial<ProgramInput>): Promise<Program> => {
  const res = await api.patch<ApiSuccessResponse<Program>>(`/programs/${programId}`, input)
  return res.data.data
}

export const verifyProgram = async (programId: string): Promise<Program> => {
  const res = await api.post<ApiSuccessResponse<Program>>(`/programs/${programId}/verify`)
  return res.data.data
}

export const reportOutdated = async (programId: string, message: string): Promise<ProgramDataReport> => {
  const res = await api.post<ApiSuccessResponse<ProgramDataReport>>(`/programs/${programId}/reports`, {
    message,
  })
  return res.data.data
}

export type ListReportsResult = { reports: ProgramDataReport[]; pagination: ProgramsPagination }

export const listReports = async (params: {
  status: ReportStatus
  page?: number
  limit?: number
}): Promise<ListReportsResult> => {
  const res = await api.get<ApiSuccessResponse<ListReportsResult>>('/program-reports', { params })
  return res.data.data
}

export const resolveReport = async (reportId: string): Promise<ProgramDataReport> => {
  const res = await api.post<ApiSuccessResponse<ProgramDataReport>>(`/program-reports/${reportId}/resolve`)
  return res.data.data
}
