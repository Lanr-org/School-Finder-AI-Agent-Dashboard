import { api } from '../../lib/api/client.js'
import type { ApiSuccessResponse } from '../../lib/api/types.js'

export type NotificationType =
  | 'ASSIGNMENT'
  | 'CONVERSATION'
  | 'FOLLOW_UP'
  | 'RECOMMENDATION'
  | 'TEAM'
  | 'SYSTEM'

export type NotificationItem = {
  id: string
  type: NotificationType
  title: string
  body: string
  // Staff-app path to open, e.g. /conversations/CNV-1048.
  link: string | null
  readAt: string | null
  createdAt: string
}

export type ListNotificationsResult = {
  notifications: NotificationItem[]
  unreadCount: number
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

export const listNotifications = async (): Promise<ListNotificationsResult> => {
  const res = await api.get<ApiSuccessResponse<ListNotificationsResult>>('/notifications', {
    params: { limit: 30 },
  })
  return res.data.data
}

export const markNotificationRead = async (notificationId: string): Promise<void> => {
  await api.patch(`/notifications/${notificationId}/read`)
}

export const markAllNotificationsRead = async (): Promise<void> => {
  await api.post('/notifications/read-all')
}

export const clearNotifications = async (): Promise<void> => {
  await api.delete('/notifications')
}
