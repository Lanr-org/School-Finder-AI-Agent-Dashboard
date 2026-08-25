import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { assignStudentAdvisor, getStudent, listStudents, type ListStudentsParams } from './students.api.js'

export const useStudents = (params: ListStudentsParams) =>
  useQuery({
    queryKey: ['students', params],
    queryFn: () => listStudents(params),
    placeholderData: (previousData) => previousData,
  })

export const useStudent = (studentId: string | undefined) =>
  useQuery({
    queryKey: ['student', studentId],
    queryFn: () => getStudent(studentId as string),
    enabled: studentId !== undefined,
  })

export const useAssignStudentAdvisor = (studentId: string | undefined) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (advisorId: string | null) => assignStudentAdvisor(studentId as string, advisorId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['student', studentId] })
      void queryClient.invalidateQueries({ queryKey: ['students'] })
      void queryClient.invalidateQueries({ queryKey: ['conversation'] })
      void queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}
