import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createSettingValue,
  deleteSettingValue,
  listSettingGroups,
  updateSettingValue,
  type SettingGroupKey,
} from './settings.api.js'

export const useSettingGroups = () =>
  useQuery({
    queryKey: ['setting-groups'],
    queryFn: listSettingGroups,
  })

const useInvalidateSettingGroups = () => {
  const queryClient = useQueryClient()
  return () => void queryClient.invalidateQueries({ queryKey: ['setting-groups'] })
}

export const useCreateSettingValue = () => {
  const invalidate = useInvalidateSettingGroups()

  return useMutation({
    mutationFn: ({ groupKey, label }: { groupKey: SettingGroupKey; label: string }) =>
      createSettingValue(groupKey, label),
    onSuccess: invalidate,
  })
}

export const useUpdateSettingValue = () => {
  const invalidate = useInvalidateSettingGroups()

  return useMutation({
    mutationFn: ({
      groupKey,
      valueId,
      data,
    }: {
      groupKey: SettingGroupKey
      valueId: string
      data: { label?: string | undefined; isActive?: boolean | undefined }
    }) => updateSettingValue(groupKey, valueId, data),
    onSuccess: invalidate,
  })
}

export const useDeleteSettingValue = () => {
  const invalidate = useInvalidateSettingGroups()

  return useMutation({
    mutationFn: ({ groupKey, valueId }: { groupKey: SettingGroupKey; valueId: string }) =>
      deleteSettingValue(groupKey, valueId),
    onSuccess: invalidate,
  })
}
