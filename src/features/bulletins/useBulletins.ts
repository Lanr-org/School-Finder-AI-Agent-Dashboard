import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createBulletin,
  deleteBulletin,
  listBulletins,
  updateBulletin,
  type ListBulletinsParams,
} from './bulletins.api.js'

export const useBulletins = (params: ListBulletinsParams = {}) =>
  useQuery({
    queryKey: ['bulletins', params],
    queryFn: () => listBulletins(params),
  })

const useInvalidateBulletins = () => {
  const queryClient = useQueryClient()
  return () => void queryClient.invalidateQueries({ queryKey: ['bulletins'] })
}

export const useCreateBulletin = () => {
  const invalidate = useInvalidateBulletins()
  return useMutation({ mutationFn: createBulletin, onSuccess: invalidate })
}

export const useUpdateBulletin = () => {
  const invalidate = useInvalidateBulletins()

  return useMutation({
    mutationFn: ({ bulletinId, data }: { bulletinId: string; data: { isActive?: boolean | undefined } }) =>
      updateBulletin(bulletinId, data),
    onSuccess: invalidate,
  })
}

export const useDeleteBulletin = () => {
  const invalidate = useInvalidateBulletins()
  return useMutation({ mutationFn: deleteBulletin, onSuccess: invalidate })
}
