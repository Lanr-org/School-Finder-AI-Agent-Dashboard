import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  assignStudentAdvisor,
  deleteStudent,
  getStudent,
  getStudentStatusHistory,
  listStudents,
  updateStudentStatus,
  type ListStudentsParams,
  type StudentStatus,
} from './students.api.js'

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
      void queryClient.invalidateQueries({ queryKey: ['advisor-profiles'] })
      void queryClient.invalidateQueries({ queryKey: ['advisor-students'] })
      void queryClient.invalidateQueries({ queryKey: ['student-status-history', studentId] })
    },
  })
}

export const useDeleteStudent = (studentId: string | undefined) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => deleteStudent(studentId as string),
    onSuccess: () => {
      // Drop the student's own queries so nothing refetches a 404, then refresh every list and count.
      queryClient.removeQueries({ queryKey: ['student', studentId] })
      queryClient.removeQueries({ queryKey: ['student-status-history', studentId] })
      void queryClient.invalidateQueries()
    },
  })
}

export const useUpdateStudentStatus = (studentId: string | undefined) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ status, note }: { status: StudentStatus; note?: string | undefined }) =>
      updateStudentStatus(studentId as string, status, note),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['student', studentId] })
      void queryClient.invalidateQueries({ queryKey: ['students'] })
      void queryClient.invalidateQueries({ queryKey: ['student-status-history', studentId] })
    },
  })
}

export const useStudentStatusHistory = (studentId: string | undefined) =>
  useQuery({
    queryKey: ['student-status-history', studentId],
    queryFn: () => getStudentStatusHistory(studentId as string),
    enabled: studentId !== undefined,
  })
