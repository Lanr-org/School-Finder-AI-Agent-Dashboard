import { useQuery } from '@tanstack/react-query'
import { getProgram, listPrograms, type ListProgramsParams } from './programs.api.js'

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
