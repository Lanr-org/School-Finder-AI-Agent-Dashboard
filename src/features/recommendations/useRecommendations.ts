import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createShortlist,
  deleteShortlist,
  generateRecommendationRun,
  getRecommendationWeights,
  listRecommendations,
  updateRecommendationWeights,
  type ListRecommendationsParams,
  type UpdateRecommendationWeightsData,
} from './recommendations.api.js'

export const useRecommendationsList = (params: ListRecommendationsParams) =>
  useQuery({
    queryKey: ['recommendations', params],
    queryFn: () => listRecommendations(params),
    placeholderData: (previousData) => previousData,
  })

const useInvalidateRecommendations = () => {
  const queryClient = useQueryClient()
  return () => void queryClient.invalidateQueries({ queryKey: ['recommendations'] })
}

export const useGenerateRecommendationRun = () => {
  const invalidate = useInvalidateRecommendations()

  return useMutation({
    mutationFn: ({ studentId, limit }: { studentId: string; limit?: number | undefined }) =>
      generateRecommendationRun(studentId, limit),
    onSuccess: invalidate,
  })
}

export const useCreateShortlist = () => {
  const invalidate = useInvalidateRecommendations()

  return useMutation({
    mutationFn: ({ studentId, programId }: { studentId: string; programId: string }) =>
      createShortlist(studentId, programId),
    onSuccess: invalidate,
  })
}

export const useDeleteShortlist = () => {
  const invalidate = useInvalidateRecommendations()

  return useMutation({
    mutationFn: ({ studentId, programId }: { studentId: string; programId: string }) =>
      deleteShortlist(studentId, programId),
    onSuccess: invalidate,
  })
}

export const useRecommendationWeights = () =>
  useQuery({
    queryKey: ['recommendation-weights'],
    queryFn: getRecommendationWeights,
  })

export const useUpdateRecommendationWeights = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateRecommendationWeightsData) => updateRecommendationWeights(data),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['recommendation-weights'] }),
  })
}
