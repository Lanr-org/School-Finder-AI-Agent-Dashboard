import { api } from '../../lib/api/client.js'
import type { ApiSuccessResponse } from '../../lib/api/types.js'

export type ConversationStatus = 'ACTIVE' | 'ESCALATED' | 'RESOLVED'
export type ConversationMode = 'AI_BOT' | 'HUMAN_ADVISOR'
export type MessageSenderType = 'STUDENT' | 'AGENT' | 'ADVISOR' | 'SYSTEM'

export type ConversationStudent = {
  publicId: string
  firstName: string
  lastName: string | null
  assignedAdvisor: { publicId: string; fullName: string } | null
}

export type ConversationSummary = {
  publicId: string
  mode: ConversationMode
  status: ConversationStatus
  lastActivityAt: string
  createdAt: string
  student: ConversationStudent
}

export type ConversationMessage = {
  senderType: MessageSenderType
  content: string
  createdAt: string
}

export type ConversationDetail = Omit<ConversationSummary, 'student'> & {
  student: ConversationStudent & { email: string | null; phone: string | null }
  messages: ConversationMessage[]
}

export type ConversationsPagination = { page: number; limit: number; total: number; totalPages: number }

export type ListConversationsParams = {
  page?: number | undefined
  limit?: number | undefined
  status?: ConversationStatus | undefined
  advisorId?: string | undefined
  unassigned?: boolean | undefined
  search?: string | undefined
}

export type ListConversationsResult = {
  conversations: ConversationSummary[]
  pagination: ConversationsPagination
}

export const listConversations = async (params: ListConversationsParams): Promise<ListConversationsResult> => {
  const res = await api.get<ApiSuccessResponse<ListConversationsResult>>('/conversations', { params })
  return res.data.data
}

export const getConversation = async (conversationId: string): Promise<ConversationDetail> => {
  const res = await api.get<ApiSuccessResponse<ConversationDetail>>(`/conversations/${conversationId}`)
  return res.data.data
}

export const replyToConversation = async (
  conversationId: string,
  content: string,
): Promise<ConversationMessage & { delivered: boolean }> => {
  const res = await api.post<ApiSuccessResponse<ConversationMessage & { delivered: boolean }>>(
    `/conversations/${conversationId}/replies`,
    { content },
  )
  return res.data.data
}

export const escalateConversation = async (conversationId: string): Promise<ConversationSummary> => {
  const res = await api.post<ApiSuccessResponse<ConversationSummary>>(`/conversations/${conversationId}/escalate`)
  return res.data.data
}

export const resolveConversation = async (conversationId: string): Promise<ConversationSummary> => {
  const res = await api.post<ApiSuccessResponse<ConversationSummary>>(`/conversations/${conversationId}/resolve`)
  return res.data.data
}

export const handbackConversation = async (conversationId: string): Promise<ConversationSummary> => {
  const res = await api.post<ApiSuccessResponse<ConversationSummary>>(`/conversations/${conversationId}/handback`)
  return res.data.data
}
