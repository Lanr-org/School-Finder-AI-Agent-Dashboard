import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getCurrentUser, signOutEverywhere, updateMyProfile } from './account.api.js'
import { useAuthStore } from '../../store/authStore.js'

export const useCurrentUser = () =>
  useQuery({
    queryKey: ['current-user'],
    queryFn: getCurrentUser,
  })

export const useUpdateMyProfile = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateMyProfile,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['current-user'] })
      // Keep the topbar name in step with the saved profile.
      const fresh = await queryClient.fetchQuery({ queryKey: ['current-user'], queryFn: getCurrentUser })
      const { user, accessToken } = useAuthStore.getState()
      if (user && accessToken) useAuthStore.getState().loginSuccess(accessToken, { ...user, fullName: fresh.fullName })
    },
  })
}

export const useSignOutEverywhere = () =>
  useMutation({
    mutationFn: signOutEverywhere,
    onSuccess: () => useAuthStore.getState().logout(),
  })
