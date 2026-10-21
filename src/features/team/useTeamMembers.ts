import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  cancelInvitation,
  getTeamMember,
  inviteTeamMember,
  listTeamMembers,
  resendInvitation,
  updateMemberStatus,
  updateTeamMember,
  type UpdateTeamMemberInput,
} from './team.api.js'

// GET /team is ADMIN-only; pages that also serve other roles pass `enabled: isAdmin`.
export const useTeamMembers = ({ enabled = true }: { enabled?: boolean } = {}) =>
  useQuery({
    queryKey: ['team-members'],
    queryFn: listTeamMembers,
    enabled,
  })

export const useTeamMember = (userId: string | undefined) =>
  useQuery({
    queryKey: ['team-member', userId],
    queryFn: () => getTeamMember(userId as string),
    enabled: userId !== undefined,
  })

// Every team write refreshes the list, the member's page and their audit trail.
const useInvalidateTeam = () => {
  const queryClient = useQueryClient()
  return (userId?: string) => {
    void queryClient.invalidateQueries({ queryKey: ['team-members'] })
    if (userId) void queryClient.invalidateQueries({ queryKey: ['team-member', userId] })
    void queryClient.invalidateQueries({ queryKey: ['audit-logs'] })
  }
}

export const useInviteTeamMember = () => {
  const invalidate = useInvalidateTeam()
  return useMutation({
    mutationFn: inviteTeamMember,
    onSuccess: () => invalidate(),
  })
}

export const useResendInvitation = (userId: string | undefined) => {
  const invalidate = useInvalidateTeam()
  return useMutation({
    mutationFn: resendInvitation,
    onSuccess: () => invalidate(userId),
  })
}

export const useCancelInvitation = () => {
  const invalidate = useInvalidateTeam()
  return useMutation({
    mutationFn: cancelInvitation,
    onSuccess: () => invalidate(),
  })
}

export const useUpdateTeamMember = (userId: string | undefined) => {
  const invalidate = useInvalidateTeam()
  return useMutation({
    mutationFn: (data: UpdateTeamMemberInput) => updateTeamMember(userId as string, data),
    onSuccess: () => invalidate(userId),
  })
}

export const useUpdateMemberStatus = (userId: string | undefined) => {
  const invalidate = useInvalidateTeam()
  return useMutation({
    mutationFn: (status: 'ACTIVE' | 'DISABLED') => updateMemberStatus(userId as string, status),
    onSuccess: () => invalidate(userId),
  })
}
