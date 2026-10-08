import { useQuery } from '@tanstack/react-query'
import { getDashboardSummary } from './dashboard.api.js'

export const useDashboardSummary = () =>
  useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: getDashboardSummary,
    refetchInterval: 60_000,
  })
