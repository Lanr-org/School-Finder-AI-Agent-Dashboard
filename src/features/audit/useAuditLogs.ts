import { useQuery } from '@tanstack/react-query'
import { listAuditLogs, type ListAuditLogsParams } from './audit.api.js'

export const useAuditLogs = (params: ListAuditLogsParams) =>
  useQuery({
    queryKey: ['audit-logs', params],
    queryFn: () => listAuditLogs(params),
    placeholderData: (previousData) => previousData,
  })
