export type ApiSuccessResponse<T> = {
  success: true
  message: string
  data: T
}

export type ApiErrorResponse = {
  success: false
  error: {
    message: string
    code: string
    requestId: string
    details?: unknown
  }
}
