import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createNote, deleteNote, listNotes, updateNote } from './notes.api.js'

export const useNotes = (studentId: string | undefined) =>
  useQuery({
    queryKey: ['notes', studentId],
    queryFn: () => listNotes(studentId as string),
    enabled: studentId !== undefined,
  })

const useInvalidateNotes = (studentId: string | undefined) => {
  const queryClient = useQueryClient()
  return () => void queryClient.invalidateQueries({ queryKey: ['notes', studentId] })
}

export const useCreateNote = (studentId: string | undefined) => {
  const invalidate = useInvalidateNotes(studentId)

  return useMutation({
    mutationFn: (body: string) => createNote(studentId as string, body),
    onSuccess: invalidate,
  })
}

export const useUpdateNote = (studentId: string | undefined) => {
  const invalidate = useInvalidateNotes(studentId)

  return useMutation({
    mutationFn: ({ noteId, body }: { noteId: string; body: string }) => updateNote(studentId as string, noteId, body),
    onSuccess: invalidate,
  })
}

export const useDeleteNote = (studentId: string | undefined) => {
  const invalidate = useInvalidateNotes(studentId)

  return useMutation({
    mutationFn: (noteId: string) => deleteNote(studentId as string, noteId),
    onSuccess: invalidate,
  })
}
