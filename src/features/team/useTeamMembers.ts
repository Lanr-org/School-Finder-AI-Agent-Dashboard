import { useQuery } from '@tanstack/react-query'
import { listTeamMembers } from './team.api.js'

export const useTeamMembers = () =>
  useQuery({
    queryKey: ['team-members'],
    queryFn: listTeamMembers,
  })
