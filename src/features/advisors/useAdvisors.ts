import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createAdvisorProfile,
  getAdvisorProfile,
  getOwnAdvisorProfile,
  listAdvisorProfiles,
  listFollowUpsForAdvisor,
  listStudentsForAdvisor,
  updateAdvisorProfile,
  updateOwnAvailability,
  type AdvisorAvailability,
  type ListAdvisorFollowUpsParams,
  type ListAdvisorStudentsParams,
} from './advisors.api.js'

export const useAdvisorProfiles = () =>
  useQuery({
    queryKey: ['advisor-profiles'],
    queryFn: listAdvisorProfiles,
  })

export const useOwnAdvisorProfile = () =>
  useQuery({
    queryKey: ['advisor-profile', 'me'],
    queryFn: getOwnAdvisorProfile,
  })

export const useAdvisorProfile = (advisorId: string | undefined) =>
  useQuery({
    queryKey: ['advisor-profile', advisorId],
    queryFn: () => getAdvisorProfile(advisorId as string),
    enabled: advisorId !== undefined,
  })

export const useCreateAdvisorProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createAdvisorProfile,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['advisor-profiles'] })
    },
  })
}

export const useUpdateAdvisorProfile = (advisorId: string | undefined) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { availability?: AdvisorAvailability | undefined; maxCapacity?: number | null | undefined }) =>
      updateAdvisorProfile(advisorId as string, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['advisor-profiles'] })
      void queryClient.invalidateQueries({ queryKey: ['advisor-profile', advisorId] })
    },
  })
}

export const useUpdateOwnAvailability = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateOwnAvailability,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['advisor-profiles'] })
      void queryClient.invalidateQueries({ queryKey: ['advisor-profile', 'me'] })
    },
  })
}

export const useAdvisorStudents = (advisorId: string | undefined, params: ListAdvisorStudentsParams) =>
  useQuery({
    queryKey: ['advisor-students', advisorId, params],
    queryFn: () => listStudentsForAdvisor(advisorId as string, params),
    enabled: advisorId !== undefined,
  })

export const useAdvisorFollowUps = (advisorId: string | undefined, params: ListAdvisorFollowUpsParams) =>
  useQuery({
    queryKey: ['advisor-follow-ups', advisorId, params],
    queryFn: () => listFollowUpsForAdvisor(advisorId as string, params),
    enabled: advisorId !== undefined,
  })
