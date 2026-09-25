import { api } from '../../lib/api/client.js'
import type { ApiSuccessResponse } from '../../lib/api/types.js'
import type { IntakeMonth, StudyLevel } from '../programs/programs.api.js'

export type ApplicationStatus =
  | 'DRAFT'
  | 'DOCUMENTS_PENDING'
  | 'SUBMITTED'
  | 'OFFER_RECEIVED'
  | 'VISA_PROCESSING'
  | 'COMPLETED'
  | 'REJECTED'
  | 'WITHDRAWN'

type StaffRef = { publicId: string; fullName: string }

export type Application = {
  publicId: string
  status: ApplicationStatus
  student: { publicId: string; firstName: string; lastName: string | null }
  program: { publicId: string; name: string; studyLevel: StudyLevel }
  school: { publicId: string; name: string; country: string }
  intake: { month: IntakeMonth; year: number; applicationDeadline: string | null } | null
  externalReference: string | null
  notes: string | null
  createdBy: StaffRef
  createdAt: string
  updatedAt: string
}

export type ApplicationHistoryEntry = {
  fromStatus: ApplicationStatus | null
  toStatus: ApplicationStatus
  note: string | null
  changedBy: StaffRef | null
  changedAt: string
}

export type ApplicationDetail = Application & { history: ApplicationHistoryEntry[] }

export type ApplicationsPagination = { page: number; limit: number; total: number; totalPages: number }

export type ListApplicationsParams = {
  page?: number | undefined
  limit?: number | undefined
  status?: ApplicationStatus | undefined
  advisorId?: string | undefined
  search?: string | undefined
}

export type ListApplicationsResult = {
  applications: Application[]
  summary: Record<ApplicationStatus, number>
  pagination: ApplicationsPagination
}

export type ListStudentApplicationsResult = {
  applications: Application[]
  pagination: ApplicationsPagination
}

export type CreateApplicationInput = {
  programId: string
  intakeMonth?: IntakeMonth | undefined
  intakeYear?: number | undefined
  externalReference?: string | undefined
  notes?: string | undefined
}

// null clears a field; omitted leaves it unchanged.
export type UpdateApplicationInput = {
  intakeMonth?: IntakeMonth | null | undefined
  intakeYear?: number | null | undefined
  externalReference?: string | null | undefined
  notes?: string | null | undefined
}

export const listApplications = async (params: ListApplicationsParams): Promise<ListApplicationsResult> => {
  const res = await api.get<ApiSuccessResponse<ListApplicationsResult>>('/applications', { params })
  return res.data.data
}

export const listStudentApplications = async (studentId: string): Promise<ListStudentApplicationsResult> => {
  const res = await api.get<ApiSuccessResponse<ListStudentApplicationsResult>>(
    `/students/${studentId}/applications`,
    { params: { limit: 100 } },
  )
  return res.data.data
}

export const getApplication = async (applicationId: string): Promise<ApplicationDetail> => {
  const res = await api.get<ApiSuccessResponse<ApplicationDetail>>(`/applications/${applicationId}`)
  return res.data.data
}

export const createApplication = async (studentId: string, data: CreateApplicationInput): Promise<Application> => {
  const res = await api.post<ApiSuccessResponse<Application>>(`/students/${studentId}/applications`, data)
  return res.data.data
}

export const updateApplication = async (
  applicationId: string,
  data: UpdateApplicationInput,
): Promise<Application> => {
  const res = await api.patch<ApiSuccessResponse<Application>>(`/applications/${applicationId}`, data)
  return res.data.data
}

export const updateApplicationStatus = async (
  applicationId: string,
  data: { status: ApplicationStatus; note?: string | undefined },
): Promise<Application> => {
  const res = await api.patch<ApiSuccessResponse<Application>>(`/applications/${applicationId}/status`, data)
  return res.data.data
}
