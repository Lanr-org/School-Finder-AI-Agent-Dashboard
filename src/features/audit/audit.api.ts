import { api } from '../../lib/api/client.js'
import type { ApiSuccessResponse } from '../../lib/api/types.js'
import type { UserRole } from '../team/team.api.js'

// Mirrors the backend's AUDIT_ACTIONS / AUDIT_ENTITY_TYPES (src/modules/audit/audit.actions.ts).
export type AuditAction =
  | 'auth.login_failed'
  | 'auth.session_revoked'
  | 'auth.sessions_revoked_all'
  | 'auth.password_changed'
  | 'auth.password_reset'
  | 'team.invitation_created'
  | 'team.invitation_resent'
  | 'team.invitation_canceled'
  | 'team.invitation_accepted'
  | 'team.member_updated'
  | 'team.member_status_changed'
  | 'student.advisor_assigned'
  | 'student.advisor_unassigned'
  | 'student.status_changed'
  | 'application.created'
  | 'application.status_changed'
  | 'school.created'
  | 'school.updated'
  | 'school.deactivated'
  | 'program.created'
  | 'program.updated'
  | 'setting.value_created'
  | 'setting.value_updated'
  | 'setting.value_deleted'
  | 'recommendation_weights.updated'

export type AuditEntityType =
  | 'user'
  | 'auth_session'
  | 'invitation'
  | 'student'
  | 'application'
  | 'school'
  | 'program'
  | 'setting_value'
  | 'recommendation_weights'

export type AuditLog = {
  id: string
  action: AuditAction
  entity: { type: AuditEntityType; id: string | null }
  actor: { publicId: string; fullName: string; role: UserRole | null } | null
  before: Record<string, unknown> | null
  after: Record<string, unknown> | null
  metadata: Record<string, unknown> | null
  requestId: string | null
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
}

export type AuditLogsPagination = { page: number; limit: number; total: number; totalPages: number }

export type ListAuditLogsParams = {
  page?: number | undefined
  limit?: number | undefined
  action?: AuditAction | undefined
  entityType?: AuditEntityType | undefined
  entityId?: string | undefined
  actorId?: string | undefined
  from?: string | undefined
  to?: string | undefined
}

export type ListAuditLogsResult = {
  logs: AuditLog[]
  pagination: AuditLogsPagination
}

export const listAuditLogs = async (params: ListAuditLogsParams): Promise<ListAuditLogsResult> => {
  const res = await api.get<ApiSuccessResponse<ListAuditLogsResult>>('/audit-logs', { params })
  return res.data.data
}
