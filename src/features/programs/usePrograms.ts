import { useQuery } from '@tanstack/react-query'
import { listPrograms, type ListProgramsParams } from './programs.api.js'

export const usePrograms = (params: ListProgramsParams) =>
  useQuery({
    queryKey: ['programs', params],
    queryFn: () => listPrograms(params),
    placeholderData: (previousData) => previousData,
  })
