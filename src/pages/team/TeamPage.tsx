import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  KeyRound,
  Loader2,
  MailPlus,
  MoreHorizontal,
  Power,
  PowerOff,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRoundCheck,
  UserRoundX,
  UsersRound,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import AppShell from '../../components/layout/AppShell.js'
import AccountAccessConfirmationModal, {
  type AccountAccessAction,
} from '../../components/modals/AccountAccessConfirmationModal.js'
import Badge from '../../components/ui/Badge.js'
import Button from '../../components/ui/Button.js'
import Card from '../../components/ui/Card.js'
import Input from '../../components/ui/Input.js'
import type { ApiErrorResponse } from '../../lib/api/types.js'
import { apiErrorMessage } from '../../lib/api/errors.js'
import { useCancelInvitation, useResendInvitation, useTeamMembers } from '../../features/team/useTeamMembers.js'
import {
  getTeamMember,
  updateMemberStatus,
  type TeamMember,
  type UserRole,
  type UserStatus,
} from '../../features/team/team.api.js'

const PAGE_SIZE = 10

const statusTone: Record<UserStatus, 'error' | 'success' | 'warning'> = {
  ACTIVE: 'success',
  DISABLED: 'error',
  INVITED: 'warning',
}

const statusLabels: Record<UserStatus, string> = {
  ACTIVE: 'Active',
  DISABLED: 'Disabled',
  INVITED: 'Invited',
}

const roleTone: Record<UserRole, 'brand' | 'neutral' | 'success'> = {
  ADMIN: 'brand',
  ADVISOR: 'success',
  OPERATIONS: 'neutral',
}

const roleLabels: Record<UserRole, string> = {
  ADMIN: 'Admin',
  ADVISOR: 'Advisor',
  OPERATIONS: 'Operations',
}

const roleOptions: { label: string; value: UserRole | 'ALL' }[] = [
  { label: 'All roles', value: 'ALL' },
  { label: 'Admin', value: 'ADMIN' },
  { label: 'Advisor', value: 'ADVISOR' },
  { label: 'Operations', value: 'OPERATIONS' },
]

const statusOptions: { label: string; value: UserStatus | 'ALL' }[] = [
  { label: 'All statuses', value: 'ALL' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Invited', value: 'INVITED' },
  { label: 'Disabled', value: 'DISABLED' },
]

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })

const TeamPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data, error, isError, isLoading } = useTeamMembers()
  const members = data ?? []

  const [query, setQuery] = useState('')
  const [role, setRole] = useState<UserRole | 'ALL'>('ALL')
  const [status, setStatus] = useState<UserStatus | 'ALL'>('ALL')
  const [page, setPage] = useState(1)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [accessAction, setAccessAction] = useState<{
    action: AccountAccessAction
    member: TeamMember
  } | null>(null)

  const [notice, setNotice] = useState<{ tone: 'success' | 'error'; text: string } | null>(null)

  const updateStatus = useMutation({
    mutationFn: ({ userId, nextStatus }: { userId: string; nextStatus: 'ACTIVE' | 'DISABLED' }) =>
      updateMemberStatus(userId, nextStatus),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['team-members'] }),
  })
  const resend = useResendInvitation(undefined)
  const cancel = useCancelInvitation()
  const [resendingId, setResendingId] = useState<string | null>(null)

  // The list has no invitation ids, so look the member up first.
  const invitationIdFor = async (member: TeamMember) => {
    const detail = await queryClient.fetchQuery({
      queryKey: ['team-member', member.publicId],
      queryFn: () => getTeamMember(member.publicId),
    })
    if (!detail.invitation) throw new Error('This invitation is no longer open. Refresh the page.')
    return detail.invitation.id
  }

  const resendFor = async (member: TeamMember) => {
    setOpenMenuId(null)
    setNotice(null)
    setResendingId(member.publicId)
    try {
      const result = await resend.mutateAsync(await invitationIdFor(member))
      setNotice(
        result.emailSent
          ? { tone: 'success', text: `Invitation resent to ${member.email}.` }
          : { tone: 'error', text: `The new link was created but the email to ${member.email} didn't send. Try again.` },
      )
    } catch (resendError) {
      setNotice({
        tone: 'error',
        text: resendError instanceof Error && !isAxiosError(resendError) ? resendError.message : apiErrorMessage(resendError),
      })
    } finally {
      setResendingId(null)
    }
  }

  useEffect(() => {
    const closeMenu = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest('[data-team-menu]')) {
        setOpenMenuId(null)
      }
    }

    const closeMenuOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenMenuId(null)
      }
    }

    document.addEventListener('mousedown', closeMenu)
    document.addEventListener('keydown', closeMenuOnEscape)

    return () => {
      document.removeEventListener('mousedown', closeMenu)
      document.removeEventListener('keydown', closeMenuOnEscape)
    }
  }, [])

  const filteredMembers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return members.filter((member) => {
      const matchesQuery =
        !normalizedQuery ||
        member.fullName.toLowerCase().includes(normalizedQuery) ||
        member.email.toLowerCase().includes(normalizedQuery) ||
        member.publicId.toLowerCase().includes(normalizedQuery)

      return matchesQuery && (role === 'ALL' || member.role === role) && (status === 'ALL' || member.status === status)
    })
  }, [members, query, role, status])

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / PAGE_SIZE))
  const pagedMembers = filteredMembers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const [accessError, setAccessError] = useState<string | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)

  const openAccessConfirmation = (action: AccountAccessAction, member: TeamMember) => {
    setOpenMenuId(null)
    setAccessError(null)
    setAccessAction({ action, member })
  }

  // The dialog stays open, showing progress, until the change succeeds or fails.
  const confirmAccessChange = async () => {
    if (!accessAction) return
    const { action, member } = accessAction
    setAccessError(null)
    setIsConfirming(true)
    try {
      if (action === 'cancel-invitation') {
        await cancel.mutateAsync(await invitationIdFor(member))
        setNotice({ tone: 'success', text: `Invitation for ${member.email} canceled.` })
      } else {
        await updateStatus.mutateAsync({
          userId: member.publicId,
          nextStatus: action === 'activate' ? 'ACTIVE' : 'DISABLED',
        })
      }
      setAccessAction(null)
    } catch (changeError) {
      setAccessError(
        changeError instanceof Error && !isAxiosError(changeError) ? changeError.message : apiErrorMessage(changeError),
      )
    } finally {
      setIsConfirming(false)
    }
  }

  const teamStats = [
    { icon: UsersRound, label: 'Team members', note: 'Across all internal roles', value: members.length },
    {
      icon: CheckCircle2,
      label: 'Active accounts',
      note: 'Can currently sign in',
      value: members.filter((member) => member.status === 'ACTIVE').length,
    },
    {
      icon: MailPlus,
      label: 'Pending invites',
      note: 'Awaiting account setup',
      value: members.filter((member) => member.status === 'INVITED').length,
    },
    {
      icon: UserRoundX,
      label: 'Disabled',
      note: 'Access has been removed',
      value: members.filter((member) => member.status === 'DISABLED').length,
    },
  ] as const

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-medium text-[#6B7280]">Administration</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal text-[#111827]">Team</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6B7280]">
              Manage internal accounts, invitations, roles, permissions, and access status.
            </p>
          </div>

          <Button leftIcon={<MailPlus size={17} />} onClick={() => navigate('/team/invite')} size="md">
            Invite team member
          </Button>
        </div>

        {resendingId ? (
          <p className="flex items-center gap-2 rounded-xl border border-[#C2CBFF] bg-[#F5F7FF] px-4 py-3 text-sm text-[#2B4BFF]" role="status">
            <Loader2 className="animate-spin" size={16} />
            Resending invitation…
          </p>
        ) : notice ? (
          <p
            className={`rounded-xl border px-4 py-3 text-sm ${
              notice.tone === 'success'
                ? 'border-[#B7E4CB] bg-[#ECFDF3] text-[#067647]'
                : 'border-[#F7C9C5] bg-[#FEF3F2] text-[#B42318]'
            }`}
            role={notice.tone === 'error' ? 'alert' : 'status'}
          >
            {notice.text}
          </p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {teamStats.map((stat) => {
            const Icon = stat.icon

            return (
              <Card className="p-5" key={stat.label}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[#6B7280]">{stat.label}</p>
                    <p className="mt-3 text-3xl font-semibold tracking-normal text-[#111827]">{stat.value}</p>
                    <p className="mt-2 text-xs font-medium text-[#6B7280]">{stat.note}</p>
                  </div>
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#ECEFFF] text-[#2B4BFF]">
                    <Icon size={20} />
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        <Card className="p-0">
          <div className="border-b border-[#E5E7EB] px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#111827]">Internal accounts</h2>
                <p className="mt-1 text-sm text-[#6B7280]">
                  Advisors, operations staff, and administrators use the shared login page.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-[minmax(260px,1fr)_160px_160px] xl:w-[720px]">
                <Input
                  className="h-11 bg-[#F9FAFB]"
                  id="team-search"
                  leftIcon={<Search size={18} />}
                  onChange={(event) => {
                    setQuery(event.target.value)
                    setPage(1)
                  }}
                  placeholder="Search name, email, or user ID"
                  type="search"
                  value={query}
                />
                <FilterSelect
                  label="Role"
                  onChange={(value) => {
                    setRole(value as UserRole | 'ALL')
                    setPage(1)
                  }}
                  options={roleOptions}
                  value={role}
                />
                <FilterSelect
                  label="Status"
                  onChange={(value) => {
                    setStatus(value as UserStatus | 'ALL')
                    setPage(1)
                  }}
                  options={statusOptions}
                  value={status}
                />
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex min-h-72 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
              <Loader2 className="animate-spin text-[#2B4BFF]" size={24} />
              <p className="text-sm text-[#6B7280]">Loading team members…</p>
            </div>
          ) : isError ? (
            <div className="flex min-h-72 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
              <AlertCircle className="text-[#DC2626]" size={24} />
              <p className="text-sm text-[#6B7280]">
                {isAxiosError<ApiErrorResponse>(error)
                  ? (error.response?.data.error.message ?? 'Failed to load team members')
                  : 'Failed to load team members'}
              </p>
            </div>
          ) : pagedMembers.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-left">
                <thead>
                  <tr className="border-b border-[#E5E7EB] text-xs font-semibold uppercase tracking-normal text-[#6B7280]">
                    <th className="px-6 py-3">Team member</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3">Account status</th>
                    <th className="px-6 py-3">Joined</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {pagedMembers.map((member) => (
                    <tr className="transition hover:bg-[#F9FAFB]" key={member.publicId}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#ECEFFF] text-sm font-semibold text-[#2B4BFF]">
                            {member.fullName
                              .split(' ')
                              .map((name) => name[0])
                              .join('')
                              .slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#111827]">{member.fullName}</p>
                            <p className="mt-1 text-xs font-medium text-[#6B7280]">
                              {member.email} / {member.publicId}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge tone={roleTone[member.role]}>{roleLabels[member.role]}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge tone={statusTone[member.status]}>{statusLabels[member.status]}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-2 text-sm text-[#6B7280]">
                          <Clock3 size={15} />
                          {formatDate(member.createdAt)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative flex justify-end" data-team-menu>
                          <button
                            aria-expanded={openMenuId === member.publicId}
                            aria-haspopup="menu"
                            aria-label={`Manage ${member.fullName}`}
                            className={`flex h-9 w-9 items-center justify-center rounded-xl outline-none transition focus:ring-4 focus:ring-[#ECEFFF] ${
                              openMenuId === member.publicId
                                ? 'bg-[#ECEFFF] text-[#2B4BFF]'
                                : 'text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]'
                            }`}
                            onClick={() =>
                              setOpenMenuId((currentId) => (currentId === member.publicId ? null : member.publicId))
                            }
                            title="Manage account"
                            type="button"
                          >
                            <MoreHorizontal size={17} />
                          </button>

                          {openMenuId === member.publicId ? (
                            <div
                              aria-label={`Actions for ${member.fullName}`}
                              className="absolute right-0 top-11 z-30 w-64 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white py-1.5 text-left shadow-[0_14px_36px_rgba(17,24,39,0.14)]"
                              role="menu"
                            >
                              <TeamMenuAction
                                icon={<Eye size={16} />}
                                label="View account"
                                onClick={() => navigate(`/team/${member.publicId}`)}
                              />
                              <TeamMenuAction
                                icon={<KeyRound size={16} />}
                                label="Edit account"
                                onClick={() => navigate(`/team/${member.publicId}/edit`)}
                              />

                              <div className="my-1.5 border-t border-[#E5E7EB]" />

                              {member.status === 'INVITED' ? (
                                <>
                                  <TeamMenuAction
                                    icon={<RefreshCw size={16} />}
                                    label="Resend invitation"
                                    onClick={() => void resendFor(member)}
                                  />
                                  <TeamMenuAction
                                    danger
                                    icon={<PowerOff size={16} />}
                                    label="Cancel invitation"
                                    onClick={() => openAccessConfirmation('cancel-invitation', member)}
                                  />
                                </>
                              ) : member.status === 'ACTIVE' ? (
                                <TeamMenuAction
                                  danger
                                  icon={<PowerOff size={16} />}
                                  label="Disable account"
                                  onClick={() => openAccessConfirmation('disable', member)}
                                />
                              ) : (
                                <TeamMenuAction
                                  icon={<Power size={16} />}
                                  label="Activate account"
                                  onClick={() => openAccessConfirmation('activate', member)}
                                />
                              )}
                            </div>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ECEFFF] text-[#2B4BFF]">
                <UsersRound size={21} />
              </div>
              <h3 className="mt-4 text-base font-semibold text-[#111827]">No team members match these filters</h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-[#6B7280]">
                Clear the current search, role, and status filters to return to the team directory.
              </p>
              <Button
                className="mt-5"
                onClick={() => {
                  setQuery('')
                  setRole('ALL')
                  setStatus('ALL')
                  setPage(1)
                }}
                size="md"
                variant="secondary"
              >
                Clear filters
              </Button>
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-[#E5E7EB] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-sm text-[#6B7280]">
              Showing <span className="font-semibold text-[#111827]">{pagedMembers.length}</span> of{' '}
              <span className="font-semibold text-[#111827]">{filteredMembers.length}</span> team members
            </p>
            <div className="flex items-center gap-2">
              <Button
                disabled={page <= 1}
                leftIcon={<ChevronLeft size={16} />}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                size="sm"
                variant="secondary"
              >
                Previous
              </Button>
              <Button
                disabled={page >= totalPages}
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                rightIcon={<ChevronRight size={16} />}
                size="sm"
                variant="secondary"
              >
                Next
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid gap-6 xl:grid-cols-3">
          <RoleSummary
            description="Full system access, team management, and operational oversight."
            icon={<ShieldCheck size={19} />}
            label="Admins"
            value={String(members.filter((member) => member.role === 'ADMIN').length)}
          />
          <RoleSummary
            description="Assigned students, conversations, recommendations, and follow-ups."
            icon={<UserRoundCheck size={19} />}
            label="Advisors"
            value={String(members.filter((member) => member.role === 'ADVISOR').length)}
          />
          <RoleSummary
            description="School, program, and operational data maintenance."
            icon={<UsersRound size={19} />}
            label="Operations"
            value={String(members.filter((member) => member.role === 'OPERATIONS').length)}
          />
        </div>
      </div>

      {accessAction ? (
        <AccountAccessConfirmationModal
          action={accessAction.action}
          email={accessAction.member.email}
          errorMessage={accessError}
          isConfirming={isConfirming}
          isOpen
          memberName={accessAction.member.fullName}
          onClose={() => (isConfirming ? undefined : setAccessAction(null))}
          onConfirm={() => void confirmAccessChange()}
        />
      ) : null}
    </AppShell>
  )
}

const FilterSelect = ({
  label,
  onChange,
  options,
  value,
}: {
  label: string
  onChange: (value: string) => void
  options: { label: string; value: string }[]
  value: string
}) => (
  <select
    aria-label={label}
    className="h-11 rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm font-medium text-[#374151] outline-none transition focus:border-[#2B4BFF] focus:ring-4 focus:ring-[#ECEFFF]"
    onChange={(event) => onChange(event.target.value)}
    value={value}
  >
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
)

const TeamMenuAction = ({
  danger = false,
  icon,
  label,
  onClick,
}: {
  danger?: boolean
  icon: React.ReactNode
  label: string
  onClick?: () => void
}) => (
  <button
    className={`flex w-full items-center gap-3 px-3.5 py-2.5 text-sm font-medium outline-none transition focus:bg-[#F3F4F6] ${
      danger
        ? 'text-[#B42318] hover:bg-[#FEF3F2]'
        : 'text-[#374151] hover:bg-[#F3F4F6] hover:text-[#111827]'
    }`}
    onClick={onClick}
    role="menuitem"
    type="button"
  >
    <span className="flex h-5 w-5 shrink-0 items-center justify-center">{icon}</span>
    {label}
  </button>
)

const RoleSummary = ({
  description,
  icon,
  label,
  value,
}: {
  description: string
  icon: React.ReactNode
  label: string
  value: string
}) => (
  <Card>
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#ECEFFF] text-[#2B4BFF]">
        {icon}
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-[#111827]">{label}</h2>
          <Badge tone="neutral">{value}</Badge>
        </div>
        <p className="mt-2 text-sm leading-6 text-[#6B7280]">{description}</p>
      </div>
    </div>
  </Card>
)

export default TeamPage
