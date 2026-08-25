import { useQuery } from '@tanstack/react-query'
import { getCurrentUser } from './account.api.js'

export const useCurrentUser = () =>
  useQuery({
    queryKey: ['current-user'],
    queryFn: getCurrentUser,
  })
