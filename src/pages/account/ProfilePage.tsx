import { AlertCircle, CalendarClock, CheckCircle2, Clock3, KeyRound, Loader2, Mail, Phone, ShieldCheck, UserRound } from 'lucide-react'
import type { ReactNode } from 'react'
import { isAxiosError } from 'axios'
import AppShell from '../../components/layout/AppShell.js'
import Badge from '../../components/ui/Badge.js'
import Card from '../../components/ui/Card.js'
import type { ApiErrorResponse } from '../../lib/api/types.js'
import { useCurrentUser } from '../../features/account/useCurrentUser.js'
import type { CurrentUser } from '../../features/account/account.api.js'

const roleLabels: Record<string, string> = {
  ADMIN: 'Admin',
  ADVISOR: 'Advisor',
  OPERATIONS: 'Operations',
}

const statusLabels: Record<string, string> = {
  ACTIVE: 'Active',
  DISABLED: 'Disabled',
  INVITED: 'Invited',
}

const statusTone: Record<string, 'error' | 'success' | 'warning'> = {
  ACTIVE: 'success',
  DISABLED: 'error',
  INVITED: 'warning',
}

// Mirrors the requireRole(...) rules actually enforced in the backend routes.
const rolePermissions: Record<string, string[]> = {
  ADMIN: [
    'Manage team members, roles, and access status',
    'Create, edit, and deactivate schools',
    'Create and edit programs',
    'View all operational data',
  ],
  ADVISOR: ['View schools and programs (read-only)', 'View all operational data'],
  OPERATIONS: ['Create, edit, and deactivate schools', 'Create and edit programs', 'View all operational data'],
}

const initialsOf = (fullName: string) =>
  fullName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

const ProfilePage = () => {
  const { data: user, error, isError, isLoading } = useCurrentUser()

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium text-[#6B7280]">Personal account</p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-normal text-[#111827]">My profile</h1>
            {user ? (
              <>
                <Badge tone={statusTone[user.status] ?? 'success'}>{statusLabels[user.status] ?? user.status}</Badge>
                <Badge tone="brand">{roleLabels[user.role] ?? user.role}</Badge>
              </>
            ) : null}
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6B7280]">
            Review your identity, assigned role, permissions, and account activity.
          </p>
        </div>

        {isLoading ? (
          <Card>
            <div className="flex min-h-40 flex-col items-center justify-center gap-3 text-center">
              <Loader2 className="animate-spin text-[#045A58]" size={24} />
              <p className="text-sm text-[#6B7280]">Loading profile…</p>
            </div>
          </Card>
        ) : isError || !user ? (
          <Card>
            <div className="flex min-h-40 flex-col items-center justify-center gap-3 text-center">
              <AlertCircle className="text-[#DC2626]" size={24} />
              <p className="text-sm text-[#6B7280]">
                {isAxiosError<ApiErrorResponse>(error)
                  ? (error.response?.data.error.message ?? 'Failed to load profile')
                  : 'Failed to load profile'}
              </p>
            </div>
          </Card>
        ) : (
          <ProfileContent user={user} />
        )}
      </div>
    </AppShell>
  )
}

const ProfileContent = ({ user }: { user: CurrentUser }) => {
  const permissions = rolePermissions[user.role] ?? []

  return (
    <div className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
      <div className="space-y-6">
        <Card>
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px] bg-[#E6F4F3] text-xl font-semibold text-[#045A58]">
              {initialsOf(user.fullName)}
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-[#111827]">{user.fullName}</h2>
              <p className="mt-1 text-sm leading-6 text-[#6B7280]">
                Internal {(roleLabels[user.role] ?? user.role).toLowerCase()} account
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge tone={statusTone[user.status] ?? 'success'}>{statusLabels[user.status] ?? user.status}</Badge>
                <Badge tone="neutral">{user.publicId}</Badge>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4 border-t border-[#E5E7EB] pt-6">
            <ProfileItem icon={<Mail size={17} />} label="Work email" value={user.email} />
            <ProfileItem icon={<Phone size={17} />} label="Phone number" value={user.phone ?? 'Not provided'} />
            <ProfileItem icon={<UserRound size={17} />} label="User ID" value={user.publicId} />
            <ProfileItem
              icon={<Clock3 size={17} />}
              label="Last login"
              value={user.lastLoginAt ? formatDateTime(user.lastLoginAt) : 'Never signed in'}
            />
          </div>
        </Card>

        <Card>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E6F4F3] text-[#045A58]">
              <CalendarClock size={19} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#111827]">Account information</h2>
              <p className="mt-1 text-sm leading-6 text-[#6B7280]">
                Authentication and profile record timestamps.
              </p>
            </div>
          </div>

          <dl className="mt-5 divide-y divide-[#E5E7EB]">
            <DetailRow label="Account status" value={statusLabels[user.status] ?? user.status} />
            <DetailRow label="Account created" value={formatDate(user.createdAt)} />
            <DetailRow label="Profile last updated" value={formatDate(user.updatedAt)} />
            <DetailRow
              label="Last successful login"
              value={user.lastLoginAt ? formatDateTime(user.lastLoginAt) : 'Never'}
            />
          </dl>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E6F4F3] text-[#045A58]">
              <ShieldCheck size={19} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#111827]">Role and permissions</h2>
              <p className="mt-1 text-sm leading-6 text-[#6B7280]">
                Your access is assigned by an administrator through Team management.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-normal text-[#9CA3AF]">Assigned role</p>
                <p className="mt-1 text-base font-semibold text-[#111827]">{roleLabels[user.role] ?? user.role}</p>
              </div>
              <Badge tone="brand">{permissions.length} permissions</Badge>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {permissions.map((permission) => (
              <div
                className="flex min-h-12 items-center gap-3 rounded-xl border border-[#E5E7EB] px-4 py-3"
                key={permission}
              >
                <CheckCircle2 className="shrink-0 text-[#045A58]" size={17} />
                <span className="text-sm font-medium text-[#374151]">{permission}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-[#B9DAD8] bg-[#F2F9F8]">
          <div className="flex items-start gap-3">
            <KeyRound className="mt-0.5 shrink-0 text-[#045A58]" size={19} />
            <div>
              <h2 className="text-sm font-semibold text-[#111827]">Personal account boundaries</h2>
              <p className="mt-1 text-sm leading-6 text-[#52605F]">
                Your role, permissions, and account status are read-only here. Personal preferences and password changes belong in Account settings.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

const ProfileItem = ({ icon, label, value }: { icon: ReactNode; label: string; value: string }) => (
  <div className="flex items-start gap-3">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F3F4F6] text-[#045A58]">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-normal text-[#9CA3AF]">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-[#111827]">{value}</p>
    </div>
  </div>
)

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
    <dt className="text-sm text-[#6B7280]">{label}</dt>
    <dd className="text-sm font-semibold text-[#111827] sm:text-right">{value}</dd>
  </div>
)

export default ProfilePage
