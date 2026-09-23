import { api } from '../../lib/api/client.js'
import type { ApiSuccessResponse } from '../../lib/api/types.js'

export type SchoolType = 'UNIVERSITY' | 'COLLEGE' | 'INSTITUTE' | 'POLYTECHNIC'
export type PartnerStatus = 'PARTNER' | 'PROSPECT' | 'NON_PARTNER'
export type SchoolRecordStatus = 'ACTIVE' | 'INACTIVE'

export type School = {
  publicId: string
  name: string
  schoolType: SchoolType
  recordStatus: SchoolRecordStatus
  description: string | null
  website: string | null
  admissionsEmail: string | null
  phoneNumbers: string[]
  streetAddress: string | null
  city: string
  country: string
  postalCode: string | null
  partnerStatus: PartnerStatus
  visaFriendlinessScore: number | null
  visaFriendlinessNotes: string | null
  admissionFriendlinessScore: number | null
  admissionFriendlinessNotes: string | null
  rankingReputationNotes: string | null
  createdAt: string
  updatedAt: string
}

export type SchoolsPagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type ListSchoolsParams = {
  page?: number
  limit?: number
  search?: string | undefined
  country?: string | undefined
  city?: string | undefined
  schoolType?: SchoolType | undefined
  partnerStatus?: PartnerStatus | undefined
  recordStatus?: SchoolRecordStatus | undefined
}

export type ListSchoolsResult = {
  schools: School[]
  pagination: SchoolsPagination
}

export const listSchools = async (params: ListSchoolsParams): Promise<ListSchoolsResult> => {
  const res = await api.get<ApiSuccessResponse<ListSchoolsResult>>('/schools', { params })
  return res.data.data
}
