import {
  AlertCircle,
  Bell,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Laptop,
  LockKeyhole,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  Smartphone,
  UserRound,
} from 'lucide-react'
import { isAxiosError } from 'axios'
import { useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell.js'
import Badge from '../../components/ui/Badge.js'
import Button from '../../components/ui/Button.js'
import Card from '../../components/ui/Card.js'
import Input from '../../components/ui/Input.js'
import { api } from '../../lib/api/client.js'
import type { ApiErrorResponse, ApiSuccessResponse } from '../../lib/api/types.js'
import { useAuthStore } from '../../store/authStore.js'
import { useCurrentUser } from '../../features/account/useCurrentUser.js'

type NotificationKey = 'assignments' | 'conversations' | 'followUps' | 'recommendations' | 'team'

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

const AccountSettingsPage = () => {
  const { data: currentUser } = useCurrentUser()
  const [notifications, setNotifications] = useState<Record<NotificationKey, boolean>>({
    assignments: true,
    conversations: true,
    followUps: true,
    recommendations: false,
    team: true,
  })
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordSubmitted, setPasswordSubmitted] = useState(false)
  const [passwordSubmitting, setPasswordSubmitting] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  const passwordRequirements = [
    { label: 'At least 8 characters', met: newPassword.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(newPassword) },
    { label: 'One lowercase letter', met: /[a-z]/.test(newPassword) },
    { label: 'One number', met: /\d/.test(newPassword) },
  ]
  const newPasswordIsValid = passwordRequirements.every((requirement) => requirement.met)
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPasswordSubmitted(true)
    setPasswordError(null)
    setPasswordSuccess(false)

    if (!currentPassword || !newPasswordIsValid || !passwordsMatch) return

    setPasswordSubmitting(true)

    try {
      const res = await api.post<ApiSuccessResponse<{ accessToken: string }>>('/auth/change-password', {
        currentPassword,
        newPassword,
        confirmNewPassword: confirmPassword,
      })
      useAuthStore.getState().setAccessToken(res.data.data.accessToken)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordSubmitted(false)
      setPasswordSuccess(true)
    } catch (error) {
      const message = isAxiosError<ApiErrorResponse>(error)
        ? (error.response?.data.error.message ?? 'Failed to change password')
        : 'Failed to change password'
      setPasswordError(message)
    } finally {
      setPasswordSubmitting(false)
    }
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-medium text-[#6B7280]">Personal account</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal text-[#111827]">Account settings</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6B7280]">
              Manage your contact details, personal notifications, password, and account security.
            </p>
          </div>

          <Link
            className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-semibold text-[#111827] outline-none transition hover:bg-[#F9FAFB] focus:ring-4 focus:ring-[#E6F4F3]"
            to="/profile"
          >
            <UserRound size={17} />
            View profile
          </Link>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <form
              onSubmit={(event) => {
                event.preventDefault()
              }}
            >
              <SettingsSection
                action={
                  <Button leftIcon={<Save size={16} />} size="sm" type="submit">
                    Save profile
                  </Button>
                }
                description="Contact details associated with your own internal account."
                icon={<UserRound size={19} />}
                title="Personal information"
              >
                <div className="grid gap-5 sm:grid-cols-2" key={currentUser?.publicId ?? 'loading'}>
                  <div className="sm:col-span-2">
                    <Input
                      autoComplete="name"
                      defaultValue={currentUser?.fullName ?? ''}
                      id="account-full-name"
                      label="Full name"
                      name="fullName"
                      required
                    />
                  </div>
                  <Input
                    autoComplete="email"
                    defaultValue={currentUser?.email ?? ''}
                    helperText="Your sign-in email. Changes may require verification."
                    id="account-email"
                    label="Work email"
                    leftIcon={<Mail size={17} />}
                    name="email"
                    required
                    type="email"
                  />
                  <Input
                    autoComplete="tel"
                    defaultValue={currentUser?.phone ?? ''}
                    helperText="Used for internal contact only."
                    id="account-phone"
                    label="Phone number"
                    leftIcon={<Phone size={17} />}
                    name="phone"
                    type="tel"
                  />
                </div>
              </SettingsSection>
            </form>

            <SettingsSection
              action={
                <Button leftIcon={<Save size={16} />} size="sm">
                  Save preferences
                </Button>
              }
              description="Choose which operational events should notify you."
              icon={<Bell size={19} />}
              title="Notification preferences"
            >
              <div className="divide-y divide-[#E5E7EB]">
                <NotificationSetting
                  checked={notifications.assignments}
                  description="New student assignments and reassignment changes."
                  label="Student assignments"
                  onChange={() =>
                    setNotifications((current) => ({ ...current, assignments: !current.assignments }))
                  }
                />
                <NotificationSetting
                  checked={notifications.conversations}
                  description="Unread messages, escalations, and conversation ownership changes."
                  label="Conversation activity"
                  onChange={() =>
                    setNotifications((current) => ({ ...current, conversations: !current.conversations }))
                  }
                />
                <NotificationSetting
                  checked={notifications.followUps}
                  description="Upcoming, due, and overdue advisor follow-ups."
                  label="Follow-up reminders"
                  onChange={() =>
                    setNotifications((current) => ({ ...current, followUps: !current.followUps }))
                  }
                />
                <NotificationSetting
                  checked={notifications.recommendations}
                  description="Recommendation generation and review-ready updates."
                  label="Recommendation updates"
                  onChange={() =>
                    setNotifications((current) => ({
                      ...current,
                      recommendations: !current.recommendations,
                    }))
                  }
                />
                <NotificationSetting
                  checked={notifications.team}
                  description="Invitation, permission, and internal account changes relevant to you."
                  label="Team account activity"
                  onChange={() => setNotifications((current) => ({ ...current, team: !current.team }))}
                />
              </div>
            </SettingsSection>

            <form onSubmit={handlePasswordSubmit}>
              <SettingsSection
                action={
                  <Button disabled={passwordSubmitting} leftIcon={<KeyRound size={16} />} size="sm" type="submit">
                    {passwordSubmitting ? 'Changing…' : 'Change password'}
                  </Button>
                }
                description="Verify your current password before creating a new one."
                icon={<LockKeyhole size={19} />}
                title="Password"
              >
                <div className="grid gap-5">
                  {passwordError ? (
                    <div className="flex items-start gap-2 rounded-xl bg-[#FEE2E2] px-4 py-3 text-sm text-[#B91C1C]">
                      <AlertCircle className="mt-0.5 shrink-0" size={16} />
                      <span>{passwordError}</span>
                    </div>
                  ) : null}

                  {passwordSuccess ? (
                    <div className="flex items-start gap-2 rounded-xl bg-[#DCFCE7] px-4 py-3 text-sm text-[#166534]">
                      <CheckCircle2 className="mt-0.5 shrink-0" size={16} />
                      <span>Your password has been changed.</span>
                    </div>
                  ) : null}

                  <Input
                    autoComplete="current-password"
                    {...(passwordSubmitted && !currentPassword
                      ? { error: 'Enter your current password.' }
                      : {})}
                    id="current-password"
                    label="Current password"
                    leftIcon={<LockKeyhole size={17} />}
                    name="currentPassword"
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    placeholder="Enter current password"
                    required
                    rightSlot={
                      <PasswordVisibilityButton
                        label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                        onClick={() => setShowCurrentPassword((visible) => !visible)}
                        visible={showCurrentPassword}
                      />
                    }
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                  />

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Input
                      autoComplete="new-password"
                      {...(passwordSubmitted && !newPasswordIsValid
                        ? { error: 'Your new password does not meet all requirements.' }
                        : {})}
                      id="new-account-password"
                      label="New password"
                      leftIcon={<LockKeyhole size={17} />}
                      name="newPassword"
                      onChange={(event) => setNewPassword(event.target.value)}
                      placeholder="Create new password"
                      required
                      rightSlot={
                        <PasswordVisibilityButton
                          label={showNewPassword ? 'Hide new password' : 'Show new password'}
                          onClick={() => setShowNewPassword((visible) => !visible)}
                          visible={showNewPassword}
                        />
                      }
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                    />
                    <Input
                      autoComplete="new-password"
                      {...(passwordSubmitted && !passwordsMatch
                        ? { error: 'Enter the same new password in both fields.' }
                        : {})}
                      id="confirm-account-password"
                      label="Confirm new password"
                      leftIcon={<LockKeyhole size={17} />}
                      name="confirmPassword"
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="Repeat new password"
                      required
                      rightSlot={
                        <PasswordVisibilityButton
                          label={showConfirmPassword ? 'Hide confirmed password' : 'Show confirmed password'}
                          onClick={() => setShowConfirmPassword((visible) => !visible)}
                          visible={showConfirmPassword}
                        />
                      }
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                    />
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    {passwordRequirements.map((requirement) => (
                      <div
                        className={`flex items-center gap-2 text-xs font-medium ${
                          requirement.met ? 'text-[#166534]' : 'text-[#6B7280]'
                        }`}
                        key={requirement.label}
                      >
                        <CheckCircle2
                          className={requirement.met ? 'text-[#166534]' : 'text-[#9CA3AF]'}
                          size={15}
                        />
                        {requirement.label}
                      </div>
                    ))}
                  </div>
                </div>
              </SettingsSection>
            </form>
          </div>

          <aside className="space-y-6 xl:sticky xl:top-26 xl:self-start">
            <Card>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E6F4F3] text-[#045A58]">
                  <ShieldCheck size={19} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#111827]">Account access</h2>
                  <p className="mt-1 text-sm leading-6 text-[#6B7280]">
                    Role, permissions, and status are managed by administrators through Team.
                  </p>
                </div>
              </div>
              <div className="mt-5 space-y-4 border-t border-[#E5E7EB] pt-5">
                <SummaryItem label="Role" value={currentUser ? (roleLabels[currentUser.role] ?? currentUser.role) : '—'} />
                <SummaryItem
                  label="Status"
                  value={currentUser ? (statusLabels[currentUser.status] ?? currentUser.status) : '—'}
                />
                <SummaryItem label="User ID" value={currentUser?.publicId ?? '—'} />
              </div>
            </Card>

            <Card>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-[#111827]">Active sessions</h2>
                  <p className="mt-1 text-sm leading-6 text-[#6B7280]">Devices currently signed into your account.</p>
                </div>
                <Badge tone="success">2 active</Badge>
              </div>

              <div className="mt-5 space-y-4">
                <SessionItem
                  detail="Chrome on Windows / Lagos"
                  icon={<Laptop size={17} />}
                  label="Current session"
                  time="Active now"
                />
                <SessionItem
                  detail="Mobile browser / Lagos"
                  icon={<Smartphone size={17} />}
                  label="Mobile session"
                  time="June 8, 2026"
                />
              </div>

              <Button className="mt-5 w-full" size="sm" variant="secondary">
                Sign out other sessions
              </Button>
            </Card>

            <Card className="border-[#B9DAD8] bg-[#F2F9F8]">
              <div className="flex items-start gap-3">
                <KeyRound className="mt-0.5 shrink-0 text-[#045A58]" size={19} />
                <div>
                  <h2 className="text-sm font-semibold text-[#111827]">Security boundary</h2>
                  <p className="mt-1 text-sm leading-6 text-[#52605F]">
                    Only you can change your password here. Administrators cannot view or set it.
                  </p>
                </div>
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </AppShell>
  )
}

const SettingsSection = ({
  action,
  children,
  description,
  icon,
  title,
}: {
  action: ReactNode
  children: ReactNode
  description: string
  icon: ReactNode
  title: string
}) => (
  <Card>
    <div className="mb-6 flex flex-col gap-4 border-b border-[#E5E7EB] pb-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E6F4F3] text-[#045A58]">
          {icon}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[#111827]">{title}</h2>
          <p className="mt-1 text-sm leading-5 text-[#6B7280]">{description}</p>
        </div>
      </div>
      <div className="shrink-0 self-end sm:self-auto">{action}</div>
    </div>
    {children}
  </Card>
)

const NotificationSetting = ({
  checked,
  description,
  label,
  onChange,
}: {
  checked: boolean
  description: string
  label: string
  onChange: () => void
}) => (
  <div className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
    <div>
      <p className="text-sm font-semibold text-[#111827]">{label}</p>
      <p className="mt-1 text-sm leading-5 text-[#6B7280]">{description}</p>
    </div>
    <button
      aria-label={`${checked ? 'Disable' : 'Enable'} ${label}`}
      aria-pressed={checked}
      className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full outline-none transition focus:ring-4 focus:ring-[#E6F4F3] ${
        checked ? 'bg-[#045A58]' : 'bg-[#D1D5DB]'
      }`}
      onClick={onChange}
      type="button"
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
          checked ? 'left-6' : 'left-1'
        }`}
      />
    </button>
  </div>
)

const PasswordVisibilityButton = ({
  label,
  onClick,
  visible,
}: {
  label: string
  onClick: () => void
  visible: boolean
}) => (
  <button
    aria-label={label}
    className="flex h-8 w-8 items-center justify-center rounded-lg outline-none transition hover:bg-[#F3F4F6] hover:text-[#111827] focus:ring-4 focus:ring-[#E6F4F3]"
    onClick={onClick}
    title={label}
    type="button"
  >
    {visible ? <EyeOff size={17} /> : <Eye size={17} />}
  </button>
)

const SessionItem = ({
  detail,
  icon,
  label,
  time,
}: {
  detail: string
  icon: ReactNode
  label: string
  time: string
}) => (
  <div className="flex items-start gap-3">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F3F4F6] text-[#045A58]">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-sm font-semibold text-[#111827]">{label}</p>
      <p className="mt-1 text-xs leading-5 text-[#6B7280]">{detail}</p>
      <p className="text-xs font-medium text-[#045A58]">{time}</p>
    </div>
  </div>
)

const SummaryItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between gap-4">
    <span className="text-sm text-[#6B7280]">{label}</span>
    <span className="text-sm font-semibold text-[#111827]">{value}</span>
  </div>
)

export default AccountSettingsPage
