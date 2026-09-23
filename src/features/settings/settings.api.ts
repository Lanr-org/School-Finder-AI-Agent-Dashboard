import { api } from '../../lib/api/client.js'
import type { ApiSuccessResponse } from '../../lib/api/types.js'

export type SettingGroupKey = 'countries' | 'categories' | 'study-levels'

export type SettingValue = {
  id: string
  key: string
  label: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type SettingGroup = {
  key: SettingGroupKey
  label: string
  values: SettingValue[]
}

export const listSettingGroups = async (): Promise<SettingGroup[]> => {
  const res = await api.get<ApiSuccessResponse<SettingGroup[]>>('/settings')
  return res.data.data
}

export const createSettingValue = async (groupKey: SettingGroupKey, label: string): Promise<SettingValue> => {
  const res = await api.post<ApiSuccessResponse<SettingValue>>(`/settings/${groupKey}/values`, { label })
  return res.data.data
}

export const updateSettingValue = async (
  groupKey: SettingGroupKey,
  valueId: string,
  data: { label?: string | undefined; isActive?: boolean | undefined },
): Promise<SettingValue> => {
  const res = await api.patch<ApiSuccessResponse<SettingValue>>(`/settings/${groupKey}/values/${valueId}`, data)
  return res.data.data
}

export const deleteSettingValue = async (groupKey: SettingGroupKey, valueId: string): Promise<void> => {
  await api.delete(`/settings/${groupKey}/values/${valueId}`)
}
