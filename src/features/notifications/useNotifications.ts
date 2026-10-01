import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  clearNotifications,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from './notifications.api.js'

const NOTIFICATIONS_KEY = ['notifications'] as const

// Polled rather than pushed, so it survives a refresh and works without Centrifugo.
export const useNotifications = () =>
  useQuery({
    queryKey: NOTIFICATIONS_KEY,
    queryFn: listNotifications,
    refetchInterval: 30_000,
  })

export const useNotificationActions = () => {
  const queryClient = useQueryClient()
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY })
  }

  const markRead = useMutation({ mutationFn: markNotificationRead, onSuccess: invalidate })
  const markAllRead = useMutation({ mutationFn: markAllNotificationsRead, onSuccess: invalidate })
  const clear = useMutation({ mutationFn: clearNotifications, onSuccess: invalidate })

  return { markRead, markAllRead, clear }
}
