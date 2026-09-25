import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createApplication,
  getApplication,
  listApplications,
  listStudentApplications,
  updateApplication,
  updateApplicationStatus,
  type ApplicationStatus,
  type CreateApplicationInput,
  type ListApplicationsParams,
  type UpdateApplicationInput,
} from './applications.api.js'

export const useApplications = (params: ListApplicationsParams) =>
  useQuery({
    queryKey: ['applications', params],
    queryFn: () => listApplications(params),
    placeholderData: (previousData) => previousData,
  })

export const useStudentApplications = (studentId: string | undefined) =>
  useQuery({
    queryKey: ['student-applications', studentId],
    queryFn: () => listStudentApplications(studentId as string),
    enabled: studentId !== undefined,
  })

export const useApplication = (applicationId: string | null) =>
  useQuery({
    queryKey: ['application', applicationId],
    queryFn: () => getApplication(applicationId as string),
    enabled: applicationId !== null,
  })

// Creating an application can move the student to APPLICATION_STARTED, so the
// student record and its status history are refreshed alongside the lists.
const useInvalidateApplications = () => {
  const queryClient = useQueryClient()
  return (studentId: string, applicationId?: string) => {
    void queryClient.invalidateQueries({ queryKey: ['applications'] })
    void queryClient.invalidateQueries({ queryKey: ['student-applications', studentId] })
    void queryClient.invalidateQueries({ queryKey: ['student', studentId] })
    void queryClient.invalidateQueries({ queryKey: ['students'] })
    void queryClient.invalidateQueries({ queryKey: ['student-status-history', studentId] })
    if (applicationId) {
      void queryClient.invalidateQueries({ queryKey: ['application', applicationId] })
    }
  }
}

export const useCreateApplication = (studentId: string | undefined) => {
  const invalidate = useInvalidateApplications()

  return useMutation({
    mutationFn: (data: CreateApplicationInput) => createApplication(studentId as string, data),
    onSuccess: (application) => invalidate(application.student.publicId),
  })
}

export const useUpdateApplication = (applicationId: string | null) => {
  const invalidate = useInvalidateApplications()

  return useMutation({
    mutationFn: (data: UpdateApplicationInput) => updateApplication(applicationId as string, data),
    onSuccess: (application) => invalidate(application.student.publicId, application.publicId),
  })
}

export const useUpdateApplicationStatus = (applicationId: string | null) => {
  const invalidate = useInvalidateApplications()

  return useMutation({
    mutationFn: (data: { status: ApplicationStatus; note?: string | undefined }) =>
      updateApplicationStatus(applicationId as string, data),
    onSuccess: (application) => invalidate(application.student.publicId, application.publicId),
  })
}
