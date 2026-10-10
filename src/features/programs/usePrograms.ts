import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createProgram,
  getProgram,
  listPrograms,
  listReports,
  reportOutdated,
  resolveReport,
  updateProgram,
  verifyProgram,
  type ListProgramsParams,
  type Program,
  type ProgramInput,
  type ReportStatus,
} from './programs.api.js'

export const usePrograms = (params: ListProgramsParams) =>
  useQuery({
    queryKey: ['programs', params],
    queryFn: () => listPrograms(params),
    placeholderData: (previousData) => previousData,
  })

export const useProgram = (programId: string | undefined, enabled = true) =>
  useQuery({
    queryKey: ['program', programId],
    queryFn: () => getProgram(programId as string),
    enabled: enabled && programId !== undefined,
  })

// After any write, refresh the record and every list that might show it.
const useRefreshPrograms = () => {
  const queryClient = useQueryClient()
  return (program?: Program) => {
    if (program) queryClient.setQueryData(['program', program.publicId], program)
    void queryClient.invalidateQueries({ queryKey: ['programs'] })
    void queryClient.invalidateQueries({ queryKey: ['program-reports'] })
  }
}

export const useCreateProgram = () => {
  const refresh = useRefreshPrograms()
  return useMutation({ mutationFn: (input: ProgramInput) => createProgram(input), onSuccess: refresh })
}

export const useUpdateProgram = (programId: string) => {
  const refresh = useRefreshPrograms()
  return useMutation({
    mutationFn: (input: Partial<ProgramInput>) => updateProgram(programId, input),
    onSuccess: refresh,
  })
}

export const useVerifyProgram = (programId: string) => {
  const refresh = useRefreshPrograms()
  return useMutation({ mutationFn: () => verifyProgram(programId), onSuccess: refresh })
}

export const useReportOutdated = (programId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (message: string) => reportOutdated(programId, message),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['program', programId] })
      void queryClient.invalidateQueries({ queryKey: ['programs'] })
      void queryClient.invalidateQueries({ queryKey: ['program-reports'] })
    },
  })
}

export const useProgramReports = (status: ReportStatus, page: number, enabled = true) =>
  useQuery({
    queryKey: ['program-reports', status, page],
    queryFn: () => listReports({ status, page, limit: 20 }),
    placeholderData: (previousData) => previousData,
    enabled,
  })

export const useResolveReport = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (reportId: string) => resolveReport(reportId),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['program-reports'] }),
  })
}
