import { useQuery } from '@tanstack/react-query'
import { listSchools, type ListSchoolsParams } from './schools.api.js'

export const useSchools = (params: ListSchoolsParams) =>
  useQuery({
    queryKey: ['schools', params],
    queryFn: () => listSchools(params),
    placeholderData: (previousData) => previousData,
  })
