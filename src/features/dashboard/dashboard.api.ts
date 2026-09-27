import { api } from '../../lib/api/client.js'
import type { ApiSuccessResponse } from '../../lib/api/types.js'
import type { StudentStatus } from '../students/students.api.js'

export type FollowUpPriority = 'NORMAL' | 'HIGH' | 'URGENT'

export type DashboardSummary = {
  scope: 'ALL' | 'OWN'
  generatedAt: string
  timezone: 'Africa/Lagos'
  leads: {
    total: number
    newThisWeek: number
    newToday: number
    newTodayFromTelegram: number
    unassigned: number
    byStatus: Record<StudentStatus, number>
    assignedShareOfOpen: number
  }
  conversations: { active: number; escalated: number }
  topDestinations: { country: string; leads: number; percent: number }[]
  advisorWorkload: {
    advisorId: string
    fullName: string
    activeStudents: number
    pendingFollowUps: number
    maxCapacity: number | null
  }[]
  // null for OPERATIONS (no student-level lists)
  pendingFollowUps:
    | {
        publicId: string
        studentId: string
        studentName: string
        description: string
        dueAt: string
        priority: FollowUpPriority
        overdue: boolean
      }[]
    | null
  recentRecommendations:
    | {
        studentId: string
        studentName: string
        program: { publicId: string; name: string }
        school: { publicId: string; name: string }
        country: string
        overallScore: number
        createdAt: string
      }[]
    | null
}

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  const res = await api.get<ApiSuccessResponse<DashboardSummary>>('/dashboard/summary')
  return res.data.data
}
