import {
  AlertCircle,
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Clock3,
  KeyRound,
  Loader2,
  Mail,
  Pencil,
  Phone,
  Power,
  PowerOff,
  RefreshCw,
  ShieldCheck,
  UserRound,
  Trash2,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell.js'
import AccountAccessConfirmationModal, {
  type AccountAccessAction,
} from '../../components/modals/AccountAccessConfirmationModal.js'
import Badge from '../../components/ui/Badge.js'
import Button from '../../components/ui/Button.js'
import Card from '../../components/ui/Card.js'
import { auditActionLabels } from '../../features/audit/auditLabels.js'
import { useAuditLogs } from '../../features/audit/useAuditLogs.js'
import {
  formatDateTime,
  roleLabels,
  rolePermissions,
  roleTones,
  statusLabels,
  statusTones,
} from '../../features/team/teamRoles.js'
import {
  useCancelInvitation,
  useResendInvitation,
  useTeamMember,
  useUpdateMemberStatus,
} from '../../features/team/useTeamMembers.js'
import { apiErrorMessage } from '../../lib/api/errors.js'

const TeamMemberDetailPage = () => {
  const navigate = useNavigate()
  const { memberId } = useParams()
  const { data: member, isLoading, isError, error } = useTeamMember(memberId)
  // Invitation and account events are both keyed by the member's USR- id.
  const activity = useAuditLogs({ entityId: memberId, limit: 10 })
  const resend = useResendInvitation(memberId)
  const cancel = useCancelInvitation()
  const updateStatus = useUpdateMemberStatus(memberId)
  const [accessAction, setAccessAction] = useState<AccountAccessAction | null>(null)
  const [resendNotice, setResendNotice] = useState<{ tone: 'success' | 'error'; text: string } | null>(null)

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="animate-spin text-[#2B4BFF]" size={32} />
        </div>
      </AppShell>
    )
  }

  if (isError || !member) {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
          <AlertCircle className="text-[#DC2626]" size={28} />
          <p className="text-sm text-[#6B7280]">{apiErrorMessage(error, 'Failed to load this team member')}</p>
          <Link className="text-sm font-semibold text-[#2B4BFF] hover:text-[#1E36D8]" to="/team">
            Back to Team
          </Link>
        </div>
      </AppShell>
    )
  }

  const invitation = member.invitation
  const isInvited = member.status === 'INVITED'
  const isConfirming = cancel.isPending || updateStatus.isPending
  const accessError = cancel.isError
    ? apiErrorMessage(cancel.error)
    : updateStatus.isError
      ? apiErrorMessage(updateStatus.error)
      : null

  const openAccess = (action: AccountAccessAction) => {
    cancel.reset()
    updateStatus.reset()
    setAccessAction(action)
  }

  const confirmAccessChange = () => {
    if (!accessAction) return
    if (accessAction === 'cancel-invitation') {
      if (!invitation) return
      cancel.mutate(invitation.id, { onSuccess: () => navigate('/team') })
      return
    }
    updateStatus.mutate(accessAction === 'activate' ? 'ACTIVE' : 'DISABLED', {
      onSuccess: () => setAccessAction(null),
    })
  }

  const resendNow = () => {
    if (!invitation) return
    setResendNotice(null)
    resend.mutate(invitation.id, {
      onSuccess: (result) =>
        setResendNotice(
          result.emailSent
            ? { tone: 'success', text: `A new link was sent to ${member.email}. It works for 7 days.` }
            : { tone: 'error', text: `A new link was created but the email didn't send. Try again.` },
        ),
      onError: (resendError) => setResendNotice({ tone: 'error', text: apiErrorMessage(resendError) }),
    })
  }

  const permissions = rolePermissions[member.role]
  const logs = activity.data?.logs ?? []

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <Link
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#2B4BFF] transition hover:text-[#1E36D8]"
              to="/team"
            >
              <ArrowLeft size={16} />
              Team
            </Link>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-normal text-[#111827]">{member.fullName}</h1>
              <Badge tone={statusTones[member.status]}>{statusLabels[member.status]}</Badge>
              <Badge tone={roleTones[member.role]}>{roleLabels[member.role]}</Badge>
              <Badge tone="neutral">{member.publicId}</Badge>
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6B7280]">
              Review this internal account's identity, access level, invitation state, and sign-in activity.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              leftIcon={<Pencil size={17} />}
              onClick={() => navigate(`/team/${member.publicId}/edit`)}
              size="md"
              variant="secondary"
            >
              Edit account
            </Button>
            {isInvited ? (
              <>
                <Button
                  disabled={resend.isPending || !invitation}
                  leftIcon={<RefreshCw className={resend.isPending ? 'animate-spin' : undefined} size={17} />}
                  onClick={resendNow}
                  size="md"
                >
                  {resend.isPending ? 'Resending…' : 'Resend invitation'}
                </Button>
                <Button
                  disabled={!invitation}
                  leftIcon={<Trash2 size={17} />}
                  onClick={() => openAccess('cancel-invitation')}
                  size="md"
                  variant="danger"
                >
                  Delete invited account
                </Button>
              </>
            ) : member.status === 'ACTIVE' ? (
              <Button leftIcon={<PowerOff size={17} />} onClick={() => openAccess('disable')} size="md" variant="danger">
                Disable account
              </Button>
            ) : (
              <Button leftIcon={<Power size={17} />} onClick={() => openAccess('activate')} size="md">
                Activate account
              </Button>
            )}
          </div>
        </div>

        {isInvited && !invitation ? (
          <p className="rounded-xl border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3 text-sm text-[#92400E]" role="alert">
            This account is invited, but the server sent no open invitation, so resend and delete are unavailable.
            Refresh the page. If it keeps happening, the API is likely running an older version than the hub.
          </p>
        ) : null}

        {resendNotice ? (
          <p
            className={`rounded-xl border px-4 py-3 text-sm ${
              resendNotice.tone === 'success'
                ? 'border-[#B7E4CB] bg-[#ECFDF3] text-[#067647]'
                : 'border-[#F7C9C5] bg-[#FEF3F2] text-[#B42318]'
            }`}
            role={resendNotice.tone === 'error' ? 'alert' : 'status'}
          >
            {resendNotice.text}
          </p>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
          <div className="space-y-6">
            <Card>
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-[#ECEFFF] text-lg font-semibold text-[#2B4BFF]">
                  {member.fullName
                    .split(' ')
                    .map((name) => name[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-[#111827]">Account profile</h2>
                  <p className="mt-1 text-sm leading-6 text-[#6B7280]">
                    Internal {roleLabels[member.role].toLowerCase()} account
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <ProfileItem icon={<Mail size={17} />} label="Work email" value={member.email} />
                <ProfileItem icon={<Phone size={17} />} label="Phone number" value={member.phone ?? 'Not provided'} />
                <ProfileItem icon={<UserRound size={17} />} label="User ID" value={member.publicId} />
                <ProfileItem
                  icon={<Clock3 size={17} />}
                  label="Last login"
                  value={formatDateTime(member.lastLoginAt, 'Not yet signed in')}
                />
              </div>
            </Card>

            <Card>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-[#111827]">Account state</h2>
                  <p className="mt-1 text-sm leading-6 text-[#6B7280]">Current authentication and access status.</p>
                </div>
                <Badge tone={statusTones[member.status]}>{statusLabels[member.status]}</Badge>
              </div>

              <dl className="mt-5 divide-y divide-[#E5E7EB]">
                <DetailRow label="Account created" value={formatDateTime(member.createdAt)} />
                {isInvited ? (
                  invitation ? (
                    <>
                      <DetailRow label="Invitation first sent" value={formatDateTime(invitation.sentAt)} />
                      <DetailRow label="Last sent" value={formatDateTime(invitation.lastSentAt)} />
                      <DetailRow label="Times sent" value={String(invitation.sendCount)} />
                      <DetailRow
                        label="Link expires"
                        value={
                          new Date(invitation.expiresAt) < new Date()
                            ? `Expired ${formatDateTime(invitation.expiresAt)}`
                            : formatDateTime(invitation.expiresAt)
                        }
                      />
                    </>
                  ) : (
                    <DetailRow label="Invitation" value="No open invitation" />
                  )
                ) : (
                  <DetailRow label="Invitation" value="Accepted" />
                )}
              </dl>
            </Card>
          </div>

          <div className="space-y-6">
            <Card id="access">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ECEFFF] text-[#2B4BFF]">
                  <ShieldCheck size={19} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#111827]">Role and permissions</h2>
                  <p className="mt-1 text-sm leading-6 text-[#6B7280]">
                    Access comes from the member's role. Roles can't be changed after the invitation; invite a new
                    account for a different role.
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-normal text-[#9CA3AF]">Assigned role</p>
                    <p className="mt-1 text-base font-semibold text-[#111827]">{roleLabels[member.role]}</p>
                  </div>
                  <Badge tone={roleTones[member.role]}>{permissions.length} permissions</Badge>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {permissions.map((permission) => (
                  <div
                    className="flex min-h-12 items-center gap-3 rounded-xl border border-[#E5E7EB] px-4 py-3"
                    key={permission}
                  >
                    <CheckCircle2 className="shrink-0 text-[#2B4BFF]" size={17} />
                    <span className="text-sm font-medium text-[#374151]">{permission}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ECEFFF] text-[#2B4BFF]">
                  <CalendarClock size={19} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#111827]">Account activity</h2>
                  <p className="mt-1 text-sm leading-6 text-[#6B7280]">
                    Invitation and access changes from the audit log.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-5">
                {activity.isLoading ? (
                  <p className="flex items-center gap-2 text-sm text-[#6B7280]">
                    <Loader2 className="animate-spin" size={16} />
                    Loading activity…
                  </p>
                ) : activity.isError ? (
                  <p className="text-sm text-[#B42318]">{apiErrorMessage(activity.error, "Couldn't load activity")}</p>
                ) : logs.length === 0 ? (
                  <p className="text-sm text-[#6B7280]">No recorded activity yet.</p>
                ) : (
                  logs.map((log, index) => (
                    <div className="relative flex gap-4" key={log.id}>
                      {index < logs.length - 1 ? (
                        <span className="absolute left-[7px] top-6 h-[calc(100%+4px)] w-px bg-[#E5E7EB]" />
                      ) : null}
                      <span className="relative mt-1.5 h-4 w-4 shrink-0 rounded-full border-4 border-[#ECEFFF] bg-[#2B4BFF]" />
                      <div className="min-w-0 pb-1">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <p className="text-sm font-semibold text-[#111827]">
                            {auditActionLabels[log.action] ?? log.action}
                          </p>
                          <p className="text-xs font-medium text-[#9CA3AF]">{formatDateTime(log.createdAt)}</p>
                        </div>
                        <p className="mt-1 text-sm leading-6 text-[#6B7280]">
                          {log.actor ? `By ${log.actor.fullName}` : 'By the system or the member'}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card className="border-[#C2CBFF] bg-[#F5F7FF]">
              <div className="flex items-start gap-3">
                <KeyRound className="mt-0.5 shrink-0 text-[#2B4BFF]" size={19} />
                <div>
                  <h2 className="text-sm font-semibold text-[#111827]">Password security</h2>
                  <p className="mt-1 text-sm leading-6 text-[#525866]">
                    Passwords are created by account owners and are never visible to administrators.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {accessAction ? (
        <AccountAccessConfirmationModal
          action={accessAction}
          email={member.email}
          errorMessage={accessError}
          isConfirming={isConfirming}
          isOpen
          memberName={member.fullName}
          onClose={() => (isConfirming ? undefined : setAccessAction(null))}
          onConfirm={confirmAccessChange}
        />
      ) : null}
    </AppShell>
  )
}

const ProfileItem = ({ icon, label, value }: { icon: ReactNode; label: string; value: string }) => (
  <div className="flex items-start gap-3">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F3F4F6] text-[#2B4BFF]">
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

export default TeamMemberDetailPage
