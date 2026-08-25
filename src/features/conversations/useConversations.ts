import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  escalateConversation,
  getConversation,
  handbackConversation,
  listConversations,
  replyToConversation,
  resolveConversation,
  type ListConversationsParams,
} from './conversations.api.js'

export const useConversations = (params: ListConversationsParams) =>
  useQuery({
    queryKey: ['conversations', params],
    queryFn: () => listConversations(params),
    placeholderData: (previousData) => previousData,
  })

export const useConversation = (conversationId: string | undefined) =>
  useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: () => getConversation(conversationId as string),
    enabled: conversationId !== undefined,
  })

export const useConversationActions = (conversationId: string | undefined) => {
  const queryClient = useQueryClient()
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] })
    void queryClient.invalidateQueries({ queryKey: ['conversations'] })
  }

  const reply = useMutation({
    mutationFn: (content: string) => replyToConversation(conversationId as string, content),
    onSuccess: invalidate,
  })
  const escalate = useMutation({
    mutationFn: () => escalateConversation(conversationId as string),
    onSuccess: invalidate,
  })
  const resolve = useMutation({
    mutationFn: () => resolveConversation(conversationId as string),
    onSuccess: invalidate,
  })
  const handback = useMutation({
    mutationFn: () => handbackConversation(conversationId as string),
    onSuccess: invalidate,
  })

  return { reply, escalate, resolve, handback }
}
