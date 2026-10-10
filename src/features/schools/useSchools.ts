import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createSchool,
  getSchool,
  listSchools,
  updateSchool,
  type ListSchoolsParams,
  type School,
  type SchoolInput,
} from './schools.api.js'

export const useSchools = (params: ListSchoolsParams) =>
  useQuery({
    queryKey: ['schools', params],
    queryFn: () => listSchools(params),
    placeholderData: (previousData) => previousData,
  })

export const useSchool = (schoolId: string | undefined) =>
  useQuery({
    queryKey: ['school', schoolId],
    queryFn: () => getSchool(schoolId as string),
    enabled: schoolId !== undefined,
  })

const useRefreshSchools = () => {
  const queryClient = useQueryClient()
  return (school: School) => {
    queryClient.setQueryData(['school', school.publicId], school)
    void queryClient.invalidateQueries({ queryKey: ['schools'] })
    // Program cards show the school name.
    void queryClient.invalidateQueries({ queryKey: ['programs'] })
  }
}

export const useCreateSchool = () => {
  const refresh = useRefreshSchools()
  return useMutation({ mutationFn: (input: SchoolInput) => createSchool(input), onSuccess: refresh })
}

export const useUpdateSchool = (schoolId: string) => {
  const refresh = useRefreshSchools()
  return useMutation({
    mutationFn: (input: Partial<SchoolInput>) => updateSchool(schoolId, input),
    onSuccess: refresh,
  })
}
