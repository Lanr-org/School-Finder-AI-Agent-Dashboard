import { api } from '../../lib/api/client.js'
import type { ApiSuccessResponse } from '../../lib/api/types.js'

export type Note = {
  publicId: string
  body: string
  createdAt: string
  updatedAt: string
}

export type NotesPagination = { page: number; limit: number; total: number; totalPages: number }

export type ListNotesResult = {
  notes: Note[]
  pagination: NotesPagination
}

export const listNotes = async (studentId: string): Promise<ListNotesResult> => {
  const res = await api.get<ApiSuccessResponse<ListNotesResult>>(`/students/${studentId}/notes`)
  return res.data.data
}

export const createNote = async (studentId: string, body: string): Promise<Note> => {
  const res = await api.post<ApiSuccessResponse<Note>>(`/students/${studentId}/notes`, { body })
  return res.data.data
}

export const updateNote = async (studentId: string, noteId: string, body: string): Promise<Note> => {
  const res = await api.patch<ApiSuccessResponse<Note>>(`/students/${studentId}/notes/${noteId}`, { body })
  return res.data.data
}

export const deleteNote = async (studentId: string, noteId: string): Promise<void> => {
  await api.delete(`/students/${studentId}/notes/${noteId}`)
}
