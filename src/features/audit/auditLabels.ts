import type { AuditAction, AuditEntityType } from './audit.api.js'

type BadgeTone = 'brand' | 'neutral' | 'success' | 'warning' | 'error'

export const auditActionLabels: Record<AuditAction, string> = {
  'auth.login_failed': 'Failed login',
  'auth.session_revoked': 'Session revoked',
  'auth.sessions_revoked_all': 'All sessions revoked',
  'auth.password_changed': 'Password changed',
  'auth.password_reset': 'Password reset',
  'team.invitation_created': 'Invitation sent',
  'team.invitation_resent': 'Invitation resent',
  'team.invitation_canceled': 'Invitation canceled',
  'team.invitation_accepted': 'Invitation accepted',
  'team.member_updated': 'Team member updated',
  'team.member_status_changed': 'Team member status changed',
  'student.advisor_assigned': 'Advisor assigned',
  'student.advisor_unassigned': 'Advisor unassigned',
  'student.status_changed': 'Student status changed',
  'application.created': 'Application created',
  'application.status_changed': 'Application status changed',
  'school.created': 'School created',
  'school.updated': 'School updated',
  'school.deactivated': 'School deactivated',
  'program.created': 'Program created',
  'program.updated': 'Program updated',
  'setting.value_created': 'Setting value added',
  'setting.value_updated': 'Setting value updated',
  'setting.value_deleted': 'Setting value deleted',
  'recommendation_weights.updated': 'Recommendation weights updated',
}

// Grouped for the action filter dropdown.
export const auditActionGroups: { label: string; actions: AuditAction[] }[] = [
  {
    label: 'Sign-in & sessions',
    actions: [
      'auth.login_failed',
      'auth.session_revoked',
      'auth.sessions_revoked_all',
      'auth.password_changed',
      'auth.password_reset',
    ],
  },
  {
    label: 'Team',
    actions: [
      'team.invitation_created',
      'team.invitation_resent',
      'team.invitation_canceled',
      'team.invitation_accepted',
      'team.member_updated',
      'team.member_status_changed',
    ],
  },
  {
    label: 'Students',
    actions: ['student.advisor_assigned', 'student.advisor_unassigned', 'student.status_changed'],
  },
  { label: 'Applications', actions: ['application.created', 'application.status_changed'] },
  {
    label: 'Schools & programs',
    actions: ['school.created', 'school.updated', 'school.deactivated', 'program.created', 'program.updated'],
  },
  {
    label: 'Settings',
    actions: [
      'setting.value_created',
      'setting.value_updated',
      'setting.value_deleted',
      'recommendation_weights.updated',
    ],
  },
]

export const auditActionTone = (action: AuditAction): BadgeTone => {
  if (action === 'auth.login_failed') return 'error'
  if (action.startsWith('auth.')) return 'warning'
  if (action.startsWith('team.')) return 'brand'
  if (action.startsWith('setting.') || action.startsWith('recommendation_weights.')) return 'warning'
  return 'neutral'
}

export const auditEntityLabels: Record<AuditEntityType, string> = {
  user: 'Team member',
  auth_session: 'Session',
  invitation: 'Invitation',
  student: 'Student',
  application: 'Application',
  school: 'School',
  program: 'Program',
  setting_value: 'Setting value',
  recommendation_weights: 'Recommendation weights',
}

// Where an entity has its own page. Invitations are keyed by the invitee's USR- id.
export const auditEntityLink = (type: AuditEntityType, id: string | null): string | null => {
  if (!id) return null
  switch (type) {
    case 'student':
      return `/students/${id}`
    case 'school':
      return `/schools/${id}`
    case 'program':
      return `/programs/${id}`
    case 'user':
    case 'invitation':
      return `/team/${id}`
    default:
      return null
  }
}

export type SnapshotChange = { field: string; before: unknown; after: unknown }

// Top-level field diff between two snapshots. Creates (no before) list every
// new value; deletes (no after) list every removed value; updates list only
// the fields whose value changed (nested values compared as JSON).
export const diffSnapshots = (
  before: Record<string, unknown> | null,
  after: Record<string, unknown> | null,
): SnapshotChange[] => {
  const keys = Array.from(new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})]))
  return keys
    .map((field) => ({ field, before: before?.[field], after: after?.[field] }))
    .filter((change) => JSON.stringify(change.before) !== JSON.stringify(change.after))
    // updatedAt always changes on an update — it's noise, not information.
    .filter((change) => !(before && after && change.field === 'updatedAt'))
}

export const formatAuditValue = (value: unknown): string => {
  if (value === undefined || value === null || value === '') return '—'
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) return value.length ? value.map(formatAuditValue).join(', ') : '—'
  if (typeof value === 'object' && 'fullName' in value && typeof value.fullName === 'string') {
    return value.fullName
  }
  return JSON.stringify(value)
}

// camelCase snapshot keys → readable labels for the diff, e.g. "partnerStatus" → "Partner Status".
export const humanizeField = (field: string) =>
  field.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase())
