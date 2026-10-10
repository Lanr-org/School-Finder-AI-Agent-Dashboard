import { isAxiosError } from 'axios'
import type { ApiErrorResponse } from './types.js'

// The API's message, plus the first problem per field (validation details are { field: [messages] }).
export const apiErrorMessage = (error: unknown, fallback = 'Something went wrong. Please try again.') => {
  if (!isAxiosError<ApiErrorResponse>(error) || !error.response?.data?.error) return fallback

  const { message, details } = error.response.data.error
  if (!details || typeof details !== 'object') return message

  const fieldProblems = Object.entries(details as Record<string, unknown>)
    .map(([field, problems]) =>
      Array.isArray(problems) && typeof problems[0] === 'string' ? `${field}: ${problems[0]}` : null,
    )
    .filter((line): line is string => line !== null)

  return fieldProblems.length > 0 ? `${message} (${fieldProblems.join('; ')})` : message
}
