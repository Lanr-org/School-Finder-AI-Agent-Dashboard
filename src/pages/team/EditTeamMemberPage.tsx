import { AlertCircle, ArrowLeft, CheckCircle2, KeyRound, Loader2, Save, ShieldCheck, UserRound } from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell.js'
import UnsavedChangesModal from '../../components/modals/UnsavedChangesModal.js'
import Badge from '../../components/ui/Badge.js'
import Button from '../../components/ui/Button.js'
import Card from '../../components/ui/Card.js'
import Input from '../../components/ui/Input.js'
import type { TeamMemberDetail, UpdateTeamMemberInput } from '../../features/team/team.api.js'
import {
  formatDateTime,
  roleLabels,
  rolePermissions,
  roleTones,
  statusLabels,
  statusTones,
} from '../../features/team/teamRoles.js'
import { useTeamMember, useUpdateTeamMember } from '../../features/team/useTeamMembers.js'
import useUnsavedChanges from '../../hooks/useUnsavedChanges.js'
import { apiErrorMessage } from '../../lib/api/errors.js'

const EditTeamMemberPage = () => {
  const { memberId } = useParams()
  const { data: member, isLoading, isError, error } = useTeamMember(memberId)

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

  // Keyed so the form starts from the loaded values.
  return <EditTeamMemberForm key={member.publicId} member={member} />
}

const EditTeamMemberForm = ({ member }: { member: TeamMemberDetail }) => {
  const detailPath = `/team/${member.publicId}`
  const unsavedChanges = useUnsavedChanges()
  const update = useUpdateTeamMember(member.publicId)
  const [fullName, setFullName] = useState(member.fullName)
  const [email, setEmail] = useState(member.email)
  const [phone, setPhone] = useState(member.phone ?? '')
  // The backend refuses email changes once the account is active (it's their sign-in).
  const canEditEmail = member.status !== 'ACTIVE'
  const isSaving = update.isPending

  const changes = (): UpdateTeamMemberInput => {
    const data: UpdateTeamMemberInput = {}
    if (fullName.trim() !== member.fullName) data.fullName = fullName.trim()
    if (canEditEmail && email.trim().toLowerCase() !== member.email) data.email = email.trim()
    const nextPhone = phone.trim() ? phone.trim() : null
    if (nextPhone !== member.phone) data.phone = nextPhone
    return data
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSaving) return
    const data = changes()
    if (Object.keys(data).length === 0) {
      unsavedChanges.navigateAfterSave(detailPath)
      return
    }
    update.mutate(data, { onSuccess: () => unsavedChanges.navigateAfterSave(detailPath) })
  }

  const saveButton = (
    <Button disabled={isSaving} leftIcon={<Save size={17} />} size="md" type="submit">
      {isSaving ? 'Saving…' : 'Save changes'}
    </Button>
  )
  const cancelButton = (
    <Button
      disabled={isSaving}
      onClick={() => unsavedChanges.requestNavigation(detailPath)}
      size="md"
      variant="secondary"
    >
      Cancel
    </Button>
  )

  return (
    <AppShell>
      <form className="space-y-6" onChange={unsavedChanges.markDirty} onSubmit={submit}>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <Link
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#2B4BFF] transition hover:text-[#1E36D8]"
              to={detailPath}
            >
              <ArrowLeft size={16} />
              {member.fullName}
            </Link>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-normal text-[#111827]">Edit account</h1>
              <Badge tone={statusTones[member.status]}>{statusLabels[member.status]}</Badge>
              <Badge tone="neutral">{member.publicId}</Badge>
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6B7280]">Update the internal profile.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            {cancelButton}
            {saveButton}
          </div>
        </div>

        {update.isError ? (
          <p className="rounded-xl border border-[#F7C9C5] bg-[#FEF3F2] px-4 py-3 text-sm text-[#B42318]" role="alert">
            {apiErrorMessage(update.error, "Couldn't save the changes. Please try again.")}
          </p>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <FormSection
              description="Internal identity and contact information."
              icon={<UserRound size={19} />}
              title="Account profile"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Input
                    autoComplete="name"
                    id="full-name"
                    label="Full name"
                    minLength={2}
                    name="fullName"
                    onChange={(event) => setFullName(event.target.value)}
                    required
                    value={fullName}
                  />
                </div>
                <Input
                  autoComplete="email"
                  disabled={!canEditEmail}
                  helperText={
                    canEditEmail
                      ? 'Used for invitations and sign-in.'
                      : "Active accounts sign in with this email, so it can't be changed."
                  }
                  id="work-email"
                  label="Work email"
                  maxLength={160}
                  name="email"
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  type="email"
                  value={email}
                />
                <Input
                  autoComplete="tel"
                  helperText="Optional internal contact number."
                  id="phone-number"
                  label="Phone number"
                  maxLength={40}
                  name="phone"
                  onChange={(event) => setPhone(event.target.value)}
                  type="tel"
                  value={phone}
                />
              </div>
            </FormSection>

            <FormSection
              description="Access comes from the role. Roles can't be changed after the invitation; invite a new account for a different role."
              icon={<ShieldCheck size={19} />}
              title="Role and permissions"
            >
              <div className="flex flex-wrap items-center gap-3">
                <Badge tone={roleTones[member.role]}>{roleLabels[member.role]}</Badge>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {rolePermissions[member.role].map((permission) => (
                  <div
                    className="flex min-h-12 items-center gap-3 rounded-xl border border-[#E5E7EB] px-4 py-3"
                    key={permission}
                  >
                    <CheckCircle2 className="shrink-0 text-[#2B4BFF]" size={17} />
                    <span className="text-sm font-medium text-[#374151]">{permission}</span>
                  </div>
                ))}
              </div>
            </FormSection>
          </div>

          <aside className="space-y-6 xl:sticky xl:top-26 xl:self-start">
            <Card>
              <h2 className="text-lg font-semibold text-[#111827]">Account summary</h2>
              <div className="mt-5 space-y-4">
                <SummaryItem label="User ID" value={member.publicId} />
                <SummaryItem label="Account status" value={statusLabels[member.status]} />
                <SummaryItem label="Role" value={roleLabels[member.role]} />
                <SummaryItem label="Last login" value={formatDateTime(member.lastLoginAt, 'Not yet signed in')} />
              </div>
            </Card>

            <Card className="border-[#C2CBFF] bg-[#F5F7FF]">
              <div className="flex items-start gap-3">
                <KeyRound className="mt-0.5 shrink-0 text-[#2B4BFF]" size={19} />
                <div>
                  <h2 className="text-sm font-semibold text-[#111827]">Password security</h2>
                  <p className="mt-1 text-sm leading-6 text-[#525866]">
                    Passwords and account status are not edited here. Access status is managed from the account detail
                    page.
                  </p>
                </div>
              </div>
            </Card>
          </aside>
        </div>

        <div className="sticky bottom-0 z-10 -mx-4 border-t border-[#E5E7EB] bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 xl:hidden">
          <div className="flex justify-end gap-3">
            {cancelButton}
            {saveButton}
          </div>
        </div>
      </form>
      <UnsavedChangesModal
        isOpen={unsavedChanges.isPromptOpen}
        onDiscard={unsavedChanges.discardChanges}
        onKeepEditing={unsavedChanges.keepEditing}
      />
    </AppShell>
  )
}

const FormSection = ({
  children,
  description,
  icon,
  title,
}: {
  children: ReactNode
  description: string
  icon: ReactNode
  title: string
}) => (
  <Card>
    <div className="mb-6 flex items-start gap-3 border-b border-[#E5E7EB] pb-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ECEFFF] text-[#2B4BFF]">
        {icon}
      </div>
      <div>
        <h2 className="text-lg font-semibold text-[#111827]">{title}</h2>
        <p className="mt-1 text-sm leading-5 text-[#6B7280]">{description}</p>
      </div>
    </div>
    {children}
  </Card>
)

const SummaryItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-start justify-between gap-4 border-b border-[#E5E7EB] pb-3 last:border-b-0 last:pb-0">
    <span className="text-sm text-[#6B7280]">{label}</span>
    <span className="max-w-[60%] text-right text-sm font-semibold text-[#111827]">{value}</span>
  </div>
)

export default EditTeamMemberPage
