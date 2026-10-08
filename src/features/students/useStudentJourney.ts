import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getStudentJourney, setStudentJourneyCheck, type JourneyCheckKey } from './journey.api.js'

export const useStudentJourney = (studentId: string | undefined) =>
  useQuery({
    queryKey: ['student-journey', studentId],
    queryFn: () => getStudentJourney(studentId as string),
    enabled: studentId !== undefined,
  })

export const useSetStudentJourneyCheck = (studentId: string | undefined) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ key, done }: { key: JourneyCheckKey; done: boolean }) =>
      setStudentJourneyCheck(studentId as string, key, done),
    onSuccess: (journey) => {
      queryClient.setQueryData(['student-journey', studentId], journey)
    },
  })
}
