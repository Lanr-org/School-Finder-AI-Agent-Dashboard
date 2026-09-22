import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  cancelFollowUp,
  completeFollowUp,
  createFollowUp,
  listFollowUps,
  updateFollowUp,
  type FollowUpPriority,
  type ListFollowUpsParams,
} from './followUps.api.js'

export const useFollowUps = (studentId: string | undefined, params: ListFollowUpsParams) =>
  useQuery({
    queryKey: ['follow-ups', studentId, params],
    queryFn: () => listFollowUps(studentId as string, params),
    enabled: studentId !== undefined,
  })

const useInvalidateFollowUps = (studentId: string | undefined) => {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: ['follow-ups', studentId] })
    void queryClient.invalidateQueries({ queryKey: ['student', studentId] })
    void queryClient.invalidateQueries({ queryKey: ['advisor-follow-ups'] })
  }
}

export const useCreateFollowUp = (studentId: string | undefined) => {
  const invalidate = useInvalidateFollowUps(studentId)

  return useMutation({
    mutationFn: (data: { dueAt: string; priority?: FollowUpPriority | undefined; description: string }) =>
      createFollowUp(studentId as string, data),
    onSuccess: invalidate,
  })
}

export const useUpdateFollowUp = (studentId: string | undefined) => {
  const invalidate = useInvalidateFollowUps(studentId)

  return useMutation({
    mutationFn: ({
      followUpId,
      data,
    }: {
      followUpId: string
      data: { dueAt?: string | undefined; priority?: FollowUpPriority | undefined; description?: string | undefined }
    }) => updateFollowUp(studentId as string, followUpId, data),
    onSuccess: invalidate,
  })
}

export const useCompleteFollowUp = (studentId: string | undefined) => {
  const invalidate = useInvalidateFollowUps(studentId)

  return useMutation({
    mutationFn: (followUpId: string) => completeFollowUp(studentId as string, followUpId),
    onSuccess: invalidate,
  })
}

export const useCancelFollowUp = (studentId: string | undefined) => {
  const invalidate = useInvalidateFollowUps(studentId)

  return useMutation({
    mutationFn: (followUpId: string) => cancelFollowUp(studentId as string, followUpId),
    onSuccess: invalidate,
  })
}
