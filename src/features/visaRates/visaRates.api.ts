import { api } from '../../lib/api/client.js'
import type { ApiSuccessResponse } from '../../lib/api/types.js'

export type VisaRate = {
  publicId: string
  country: string
  sourcePartner: string | null
  periodLabel: string
  successRate: number
  sampleSize: number | null
  publishedAt: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type VisaRatesPagination = { page: number; limit: number; total: number; totalPages: number }

export type ListVisaRatesParams = {
  page?: number | undefined
  limit?: number | undefined
  country?: string | undefined
}

export type ListVisaRatesResult = {
  rates: VisaRate[]
  pagination: VisaRatesPagination
}

export const listVisaRates = async (params: ListVisaRatesParams = {}): Promise<ListVisaRatesResult> => {
  const res = await api.get<ApiSuccessResponse<ListVisaRatesResult>>('/visa-success-rates', { params })
  return res.data.data
}

export const createVisaRate = async (data: {
  country: string
  sourcePartner?: string | undefined
  periodLabel: string
  successRate: number
  sampleSize?: number | undefined
  publishedAt: string
}): Promise<VisaRate> => {
  const res = await api.post<ApiSuccessResponse<VisaRate>>('/visa-success-rates', data)
  return res.data.data
}

export const updateVisaRate = async (
  rateId: string,
  data: { isActive?: boolean | undefined },
): Promise<VisaRate> => {
  const res = await api.patch<ApiSuccessResponse<VisaRate>>(`/visa-success-rates/${rateId}`, data)
  return res.data.data
}

export const deleteVisaRate = async (rateId: string): Promise<void> => {
  await api.delete(`/visa-success-rates/${rateId}`)
}
