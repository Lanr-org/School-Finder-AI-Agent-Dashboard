import { api } from '../../lib/api/client.js'
import type { ApiSuccessResponse } from '../../lib/api/types.js'

export type ScoreBreakdown = {
  budget: number
  intake: number
  program: number
  visa: number
}

export type RecommendationListItem = {
  createdAt: string
  missingRequirements: string[]
  overallScore: number
  program: {
    category: string
    name: string
    publicId: string
    qualification: string
    tuitionAmount: number
    tuitionCurrency: string
  }
  publicId: string
  reasons: string[]
  school: {
    city: string
    country: string
    name: string
    publicId: string
  }
  scoreBreakdown: ScoreBreakdown
  shortlisted: boolean
  studentId: string
  studentName: string
}

export type RecommendationsPagination = { page: number; limit: number; total: number; totalPages: number }

export type RecommendationsSummary = {
  generated: number
  missingRequirements: number
  shortlisted: number
  strongMatches: number
}

export type ListRecommendationsParams = {
  advisorId?: string | undefined
  country?: string | undefined
  hasMissingRequirements?: boolean | undefined
  limit?: number | undefined
  minScore?: number | undefined
  page?: number | undefined
  search?: string | undefined
}

export type ListRecommendationsResult = {
  pagination: RecommendationsPagination
  recommendations: RecommendationListItem[]
  summary: RecommendationsSummary
}

export const listRecommendations = async (
  params: ListRecommendationsParams,
): Promise<ListRecommendationsResult> => {
  const res = await api.get<ApiSuccessResponse<ListRecommendationsResult>>('/recommendations', { params })
  return res.data.data
}

export type GeneratedRecommendationRun = {
  createdAt: string
  publicId: string
  recommendations: RecommendationListItem[]
  scoringVersion: string
  weightsVersion: number
}

export const generateRecommendationRun = async (
  studentId: string,
  limit?: number,
): Promise<GeneratedRecommendationRun> => {
  const res = await api.post<ApiSuccessResponse<GeneratedRecommendationRun>>(
    `/students/${studentId}/recommendation-runs`,
    { limit },
  )
  return res.data.data
}

export const createShortlist = async (
  studentId: string,
  programId: string,
): Promise<{ programId: string; studentId: string }> => {
  const res = await api.post<ApiSuccessResponse<{ programId: string; studentId: string }>>(
    `/students/${studentId}/shortlists`,
    { programId },
  )
  return res.data.data
}

export const deleteShortlist = async (studentId: string, programId: string): Promise<void> => {
  await api.delete(`/students/${studentId}/shortlists/${programId}`)
}

export type RecommendationWeights = {
  budgetWeight: number
  createdAt: string | null
  intakeWeight: number
  programWeight: number
  version: number
  visaWeight: number
}

export type UpdateRecommendationWeightsData = {
  budgetWeight: number
  intakeWeight: number
  programWeight: number
  visaWeight: number
}

export const getRecommendationWeights = async (): Promise<RecommendationWeights> => {
  const res = await api.get<ApiSuccessResponse<RecommendationWeights>>('/settings/recommendation-weights')
  return res.data.data
}

export const updateRecommendationWeights = async (
  data: UpdateRecommendationWeightsData,
): Promise<RecommendationWeights> => {
  const res = await api.put<ApiSuccessResponse<RecommendationWeights>>('/settings/recommendation-weights', data)
  return res.data.data
}
