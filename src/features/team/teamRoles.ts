import type { UserRole, UserStatus } from './team.api.js'

export const roleLabels: Record<UserRole, string> = { ADMIN: 'Admin', ADVISOR: 'Advisor', OPERATIONS: 'Operations' }
export const statusLabels: Record<UserStatus, string> = { ACTIVE: 'Active', DISABLED: 'Disabled', INVITED: 'Invited' }

export const roleTones: Record<UserRole, 'brand' | 'neutral' | 'success'> = {
  ADMIN: 'brand',
  ADVISOR: 'success',
  OPERATIONS: 'neutral',
}
export const statusTones: Record<UserStatus, 'error' | 'success' | 'warning'> = {
  ACTIVE: 'success',
  DISABLED: 'error',
  INVITED: 'warning',
}

// What each role can do; permissions come from the role (AGENTS.md "Baseline Access").
export const rolePermissions: Record<UserRole, string[]> = {
  ADMIN: ['Manage team access', 'View all students', 'Manage schools and programs', 'Access all workflows'],
  ADVISOR: ['View assigned students', 'Manage conversations', 'Create recommendations', 'Record follow-ups'],
  OPERATIONS: ['Manage schools', 'Manage programs', 'Maintain operational data', 'View supporting workflows'],
}

export const formatDateTime = (value: string | null | undefined, empty = '—') =>
  value
    ? new Date(value).toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : empty
