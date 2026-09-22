import { api } from '../../lib/api/client.js'
import type { ApiSuccessResponse } from '../../lib/api/types.js'

export type Bulletin = {
  publicId: string
  title: string
  body: string
  sourcePartner: string | null
  countries: string[]
  publishedAt: string
  expiresAt: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type BulletinsPagination = { page: number; limit: number; total: number; totalPages: number }

export type ListBulletinsParams = {
  page?: number | undefined
  limit?: number | undefined
  country?: string | undefined
}

export type ListBulletinsResult = {
  bulletins: Bulletin[]
  pagination: BulletinsPagination
}

export const listBulletins = async (params: ListBulletinsParams = {}): Promise<ListBulletinsResult> => {
  const res = await api.get<ApiSuccessResponse<ListBulletinsResult>>('/bulletins', { params })
  return res.data.data
}

export const createBulletin = async (data: {
  title: string
  body: string
  sourcePartner?: string | undefined
  countries?: string[] | undefined
  publishedAt: string
  expiresAt?: string | undefined
}): Promise<Bulletin> => {
  const res = await api.post<ApiSuccessResponse<Bulletin>>('/bulletins', data)
  return res.data.data
}

export const updateBulletin = async (
  bulletinId: string,
  data: { isActive?: boolean | undefined },
): Promise<Bulletin> => {
  const res = await api.patch<ApiSuccessResponse<Bulletin>>(`/bulletins/${bulletinId}`, data)
  return res.data.data
}

export const deleteBulletin = async (bulletinId: string): Promise<void> => {
  await api.delete(`/bulletins/${bulletinId}`)
}
