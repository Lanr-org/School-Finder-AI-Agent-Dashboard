import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Clock3,
  KeyRound,
  Mail,
  Pencil,
  Phone,
  Power,
  PowerOff,
  RefreshCw,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell.js'
import AccountAccessConfirmationModal, {
  type AccountAccessAction,
} from '../../components/modals/AccountAccessConfirmationModal.js'
import Badge from '../../components/ui/Badge.js'
import Button from '../../components/ui/Button.js'
import Card from '../../components/ui/Card.js'

type AccountStatus = 'Active' | 'Disabled' | 'Invited'
type TeamRole = 'Admin' | 'Advisor' | 'Operations'

type TeamMemberDetail = {
  activity: Array<{
    description: string
    time: string
    title: string
  }>
  createdAt: string
  email: string
  fullName: string
  id: string
  invitationAcceptedAt?: string
  invitedAt: string
  invitedBy: string
  lastLogin: string
  permissions: string[]
  phone?: string
  role: TeamRole
  status: AccountStatus
  updatedAt: string
}

const members: Record<string, TeamMemberDetail> = {
  'USR-1001': {
    activity: [
      { description: 'Signed in successfully from the shared login page.', time: 'Today, 8:42 AM', title: 'Account login' },
      { description: 'Team management permission was confirmed.', time: 'June 6, 2026', title: 'Permissions reviewed' },
      { description: 'Invitation was accepted and the account became active.', time: 'January 12, 2025', title: 'Account activated' },
    ],
    createdAt: 'January 12, 2025',
    email: 'amina@smetase.example',
    fullName: 'Amina Yusuf',
    id: 'USR-1001',
    invitationAcceptedAt: 'January 12, 2025, 2:18 PM',
    invitedAt: 'January 12, 2025, 1:44 PM',
    invitedBy: 'System administrator',
    lastLogin: 'Today, 8:42 AM',
    permissions: ['Manage team access', 'View all students', 'Manage schools and programs', 'Access all workflows'],
    phone: '+234 803 555 0101',
    role: 'Admin',
    status: 'Active',
    updatedAt: 'June 6, 2026',
  },
  'USR-1002': {
    activity: [
      { description: 'Signed in successfully from the shared login page.', time: 'Today, 9:18 AM', title: 'Account login' },
      { description: 'Advisor role permissions were reviewed.', time: 'May 28, 2026', title: 'Permissions reviewed' },
      { description: 'Invitation was accepted and the account became active.', time: 'February 4, 2025', title: 'Account activated' },
    ],
    createdAt: 'February 4, 2025',
    email: 'daniel@smetase.example',
    fullName: 'Daniel Okafor',
    id: 'USR-1002',
    invitationAcceptedAt: 'February 4, 2025, 4:32 PM',
    invitedAt: 'February 4, 2025, 3:10 PM',
    invitedBy: 'Amina Yusuf',
    lastLogin: 'Today, 9:18 AM',
    permissions: ['View assigned students', 'Manage conversations', 'Create recommendations', 'Record follow-ups'],
    phone: '+234 806 555 0102',
    role: 'Advisor',
    status: 'Active',
    updatedAt: 'May 28, 2026',
  },
  'USR-1003': {
    activity: [
      { description: 'Signed in successfully from the shared login page.', time: 'Yesterday, 4:12 PM', title: 'Account login' },
      { description: 'Advisor role permissions were reviewed.', time: 'May 30, 2026', title: 'Permissions reviewed' },
      { description: 'Invitation was accepted and the account became active.', time: 'March 18, 2025', title: 'Account activated' },
    ],
    createdAt: 'March 18, 2025',
    email: 'maya@smetase.example',
    fullName: 'Maya Chen',
    id: 'USR-1003',
    invitationAcceptedAt: 'March 18, 2025, 11:06 AM',
    invitedAt: 'March 18, 2025, 9:20 AM',
    invitedBy: 'Amina Yusuf',
    lastLogin: 'Yesterday, 4:12 PM',
    permissions: ['View assigned students', 'Manage conversations', 'Create recommendations', 'Record follow-ups'],
    role: 'Advisor',
    status: 'Active',
    updatedAt: 'May 30, 2026',
  },
  'USR-1004': {
    activity: [
      { description: 'A secure account setup email was sent.', time: 'June 7, 2026, 10:14 AM', title: 'Invitation sent' },
      { description: 'Operations role was assigned to the pending account.', time: 'June 7, 2026, 10:13 AM', title: 'Account created' },
    ],
    createdAt: 'June 7, 2026',
    email: 'tola@smetase.example',
    fullName: 'Tola Adeyemi',
    id: 'USR-1004',
    invitedAt: 'June 7, 2026, 10:14 AM',
    invitedBy: 'Amina Yusuf',
    lastLogin: 'Not yet signed in',
    permissions: ['Manage schools', 'Manage programs', 'Maintain operational data', 'View supporting workflows'],
    phone: '+234 809 555 0104',
    role: 'Operations',
    status: 'Invited',
    updatedAt: 'June 7, 2026',
  },
  'USR-1005': {
    activity: [
      { description: 'The account setup email was resent.', time: 'June 8, 2026, 2:22 PM', title: 'Invitation resent' },
      { description: 'A secure account setup email was sent.', time: 'June 3, 2026, 9:05 AM', title: 'Invitation sent' },
    ],
    createdAt: 'June 3, 2026',
    email: 'nora@smetase.example',
    fullName: 'Nora Williams',
    id: 'USR-1005',
    invitedAt: 'June 3, 2026, 9:05 AM',
    invitedBy: 'Amina Yusuf',
    lastLogin: 'Not yet signed in',
    permissions: ['View assigned students', 'Manage conversations', 'Create recommendations', 'Record follow-ups'],
    role: 'Advisor',
    status: 'Invited',
    updatedAt: 'June 8, 2026',
  },
  'USR-1006': {
    activity: [
      { description: 'Account access was disabled by an administrator.', time: 'May 13, 2026', title: 'Access disabled' },
      { description: 'Last successful sign-in before access was removed.', time: 'May 12, 2026', title: 'Account login' },
      { description: 'Invitation was accepted and the account became active.', time: 'August 9, 2025', title: 'Account activated' },
    ],
    createdAt: 'August 9, 2025',
    email: 'samuel@smetase.example',
    fullName: 'Samuel Eze',
    id: 'USR-1006',
    invitationAcceptedAt: 'August 9, 2025, 12:40 PM',
    invitedAt: 'August 9, 2025, 11:02 AM',
    invitedBy: 'Amina Yusuf',
    lastLogin: 'May 12, 2026',
    permissions: ['Manage schools', 'Manage programs', 'Maintain operational data', 'View supporting workflows'],
    role: 'Operations',
    status: 'Disabled',
    updatedAt: 'May 13, 2026',
  },
}

const fallbackMember = members['USR-1002']!

const statusTone: Record<AccountStatus, 'error' | 'success' | 'warning'> = {
  Active: 'success',
  Disabled: 'error',
  Invited: 'warning',
}

const roleTone: Record<TeamRole, 'brand' | 'neutral' | 'success'> = {
  Admin: 'brand',
  Advisor: 'success',
  Operations: 'neutral',
}

const TeamMemberDetailPage = () => {
  const navigate = useNavigate()
  const { memberId } = useParams()
  const member = (memberId && members[memberId]) || fallbackMember
  const displayId = memberId ?? member.id
  const [accountStatus, setAccountStatus] = useState<AccountStatus>(member.status)
  const [accessAction, setAccessAction] = useState<AccountAccessAction | null>(null)

  useEffect(() => {
    setAccountStatus(member.status)
    setAccessAction(null)
  }, [member.id, member.status])

  const confirmAccessChange = () => {
    if (!accessAction) return

    if (accessAction === 'cancel-invitation') {
      setAccessAction(null)
      navigate('/team')
      return
    }

    setAccountStatus(accessAction === 'activate' ? 'Active' : 'Disabled')
    setAccessAction(null)
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <Link
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#045A58] transition hover:text-[#034A48]"
              to="/team"
            >
              <ArrowLeft size={16} />
              Team
            </Link>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-normal text-[#111827]">{member.fullName}</h1>
              <Badge tone={statusTone[accountStatus]}>{accountStatus}</Badge>
              <Badge tone={roleTone[member.role]}>{member.role}</Badge>
              <Badge tone="neutral">{displayId}</Badge>
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6B7280]">
              Review this internal account's identity, access level, invitation state, and sign-in activity.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              leftIcon={<Pencil size={17} />}
              onClick={() => navigate(`/team/${displayId}/edit`)}
              size="md"
              variant="secondary"
            >
              Edit account
            </Button>
            {accountStatus === 'Invited' ? (
              <>
                <Button leftIcon={<RefreshCw size={17} />} size="md">
                  Resend invitation
                </Button>
                <Button
                  leftIcon={<PowerOff size={17} />}
                  onClick={() => setAccessAction('cancel-invitation')}
                  size="md"
                  variant="danger"
                >
                  Cancel invitation
                </Button>
              </>
            ) : accountStatus === 'Active' ? (
              <Button
                leftIcon={<PowerOff size={17} />}
                onClick={() => setAccessAction('disable')}
                size="md"
                variant="danger"
              >
                Disable account
              </Button>
            ) : (
              <Button
                leftIcon={<Power size={17} />}
                onClick={() => setAccessAction('activate')}
                size="md"
              >
                Activate account
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
          <div className="space-y-6">
            <Card>
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-[#E6F4F3] text-lg font-semibold text-[#045A58]">
                  {member.fullName
                    .split(' ')
                    .map((name) => name[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-[#111827]">Account profile</h2>
                  <p className="mt-1 text-sm leading-6 text-[#6B7280]">
                    Internal {member.role.toLowerCase()} account
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <ProfileItem icon={<Mail size={17} />} label="Work email" value={member.email} />
                <ProfileItem icon={<Phone size={17} />} label="Phone number" value={member.phone ?? 'Not provided'} />
                <ProfileItem icon={<UserRound size={17} />} label="User ID" value={displayId} />
                <ProfileItem icon={<Clock3 size={17} />} label="Last login" value={member.lastLogin} />
              </div>
            </Card>

            <Card>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-[#111827]">Account state</h2>
                  <p className="mt-1 text-sm leading-6 text-[#6B7280]">
                    Current authentication and access status.
                  </p>
                </div>
                <Badge tone={statusTone[accountStatus]}>{accountStatus}</Badge>
              </div>

              <dl className="mt-5 divide-y divide-[#E5E7EB]">
                <DetailRow label="Invited by" value={member.invitedBy} />
                <DetailRow label="Invitation sent" value={member.invitedAt} />
                <DetailRow
                  label="Invitation accepted"
                  value={member.invitationAcceptedAt ?? 'Awaiting acceptance'}
                />
                <DetailRow label="Account created" value={member.createdAt} />
                <DetailRow label="Last updated" value={member.updatedAt} />
              </dl>
            </Card>
          </div>

          <div className="space-y-6">
            <Card id="access">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E6F4F3] text-[#045A58]">
                    <ShieldCheck size={19} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#111827]">Role and permissions</h2>
                    <p className="mt-1 text-sm leading-6 text-[#6B7280]">
                      Access is determined by the member's assigned internal role.
                    </p>
                  </div>
                </div>
                <Button
                  leftIcon={<Pencil size={16} />}
                  onClick={() => navigate(`/team/${displayId}/edit`)}
                  size="sm"
                  variant="secondary"
                >
                  Edit permissions
                </Button>
              </div>

              <div className="mt-6 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-normal text-[#9CA3AF]">Assigned role</p>
                    <p className="mt-1 text-base font-semibold text-[#111827]">{member.role}</p>
                  </div>
                  <Badge tone={roleTone[member.role]}>{member.permissions.length} permissions</Badge>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {member.permissions.map((permission) => (
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

            <Card>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E6F4F3] text-[#045A58]">
                  <CalendarClock size={19} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#111827]">Account activity</h2>
                  <p className="mt-1 text-sm leading-6 text-[#6B7280]">
                    Recent invitation, access, and authentication events.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-5">
                {member.activity.map((activity, index) => (
                  <div className="relative flex gap-4" key={`${activity.title}-${activity.time}`}>
                    {index < member.activity.length - 1 ? (
                      <span className="absolute left-[7px] top-6 h-[calc(100%+4px)] w-px bg-[#E5E7EB]" />
                    ) : null}
                    <span className="relative mt-1.5 h-4 w-4 shrink-0 rounded-full border-4 border-[#E6F4F3] bg-[#045A58]" />
                    <div className="min-w-0 pb-1">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <p className="text-sm font-semibold text-[#111827]">{activity.title}</p>
                        <p className="text-xs font-medium text-[#9CA3AF]">{activity.time}</p>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-[#6B7280]">{activity.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="border-[#B9DAD8] bg-[#F2F9F8]">
              <div className="flex items-start gap-3">
                <KeyRound className="mt-0.5 shrink-0 text-[#045A58]" size={19} />
                <div>
                  <h2 className="text-sm font-semibold text-[#111827]">Password security</h2>
                  <p className="mt-1 text-sm leading-6 text-[#52605F]">
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
          isOpen
          memberName={member.fullName}
          onClose={() => setAccessAction(null)}
          onConfirm={confirmAccessChange}
        />
      ) : null}
    </AppShell>
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

export default TeamMemberDetailPage
