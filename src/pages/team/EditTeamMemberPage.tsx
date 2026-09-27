import {
  ArrowLeft,
  Check,
  CheckCircle2,
  KeyRound,
  Save,
  ShieldCheck,
  UserRound,
  UserRoundCheck,
  UsersRound,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell.js'
import UnsavedChangesModal from '../../components/modals/UnsavedChangesModal.js'
import Badge from '../../components/ui/Badge.js'
import Button from '../../components/ui/Button.js'
import Card from '../../components/ui/Card.js'
import Input from '../../components/ui/Input.js'
import useUnsavedChanges from '../../hooks/useUnsavedChanges.js'

type AccountStatus = 'Active' | 'Disabled' | 'Invited'
type TeamRole = 'Admin' | 'Advisor' | 'Operations'

type EditableMember = {
  email: string
  fullName: string
  id: string
  lastLogin: string
  permissions: string[]
  phone?: string
  role: TeamRole
  status: AccountStatus
}

const roleOptions: {
  description: string
  icon: ReactNode
  name: TeamRole
  permissions: string[]
}[] = [
  {
    description: 'Full administration and operational oversight.',
    icon: <ShieldCheck size={19} />,
    name: 'Admin',
    permissions: ['Manage team access', 'View all students', 'Manage schools and programs', 'Access all workflows'],
  },
  {
    description: 'Student-facing work for assigned leads.',
    icon: <UserRoundCheck size={19} />,
    name: 'Advisor',
    permissions: ['View assigned students', 'Manage conversations', 'Create recommendations', 'Record follow-ups'],
  },
  {
    description: 'School, program, and operational data maintenance.',
    icon: <UsersRound size={19} />,
    name: 'Operations',
    permissions: ['Manage schools', 'Manage programs', 'Maintain operational data', 'View supporting workflows'],
  },
]

const members: Record<string, EditableMember> = {
  'USR-1001': {
    email: 'amina@smetase.example',
    fullName: 'Amina Yusuf',
    id: 'USR-1001',
    lastLogin: 'Today, 8:42 AM',
    permissions: roleOptions[0]!.permissions,
    phone: '+234 803 555 0101',
    role: 'Admin',
    status: 'Active',
  },
  'USR-1002': {
    email: 'daniel@smetase.example',
    fullName: 'Daniel Okafor',
    id: 'USR-1002',
    lastLogin: 'Today, 9:18 AM',
    permissions: roleOptions[1]!.permissions,
    phone: '+234 806 555 0102',
    role: 'Advisor',
    status: 'Active',
  },
  'USR-1003': {
    email: 'maya@smetase.example',
    fullName: 'Maya Chen',
    id: 'USR-1003',
    lastLogin: 'Yesterday, 4:12 PM',
    permissions: roleOptions[1]!.permissions,
    role: 'Advisor',
    status: 'Active',
  },
  'USR-1004': {
    email: 'tola@smetase.example',
    fullName: 'Tola Adeyemi',
    id: 'USR-1004',
    lastLogin: 'Not yet signed in',
    permissions: roleOptions[2]!.permissions,
    phone: '+234 809 555 0104',
    role: 'Operations',
    status: 'Invited',
  },
  'USR-1005': {
    email: 'nora@smetase.example',
    fullName: 'Nora Williams',
    id: 'USR-1005',
    lastLogin: 'Not yet signed in',
    permissions: roleOptions[1]!.permissions,
    role: 'Advisor',
    status: 'Invited',
  },
  'USR-1006': {
    email: 'samuel@smetase.example',
    fullName: 'Samuel Eze',
    id: 'USR-1006',
    lastLogin: 'May 12, 2026',
    permissions: roleOptions[2]!.permissions,
    role: 'Operations',
    status: 'Disabled',
  },
}

const fallbackMember = members['USR-1002']!

const statusTone: Record<AccountStatus, 'error' | 'success' | 'warning'> = {
  Active: 'success',
  Disabled: 'error',
  Invited: 'warning',
}

const EditTeamMemberPage = () => {
  const { memberId } = useParams()
  const member = (memberId && members[memberId]) || fallbackMember
  const displayId = memberId ?? member.id
  const detailPath = `/team/${displayId}`
  const unsavedChanges = useUnsavedChanges()
  const [selectedRole, setSelectedRole] = useState<TeamRole>(member.role)
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(member.permissions)
  const availablePermissions =
    roleOptions.find((role) => role.name === selectedRole)?.permissions ?? roleOptions[0]!.permissions

  const selectRole = (role: TeamRole) => {
    const roleDetails = roleOptions.find((option) => option.name === role)
    setSelectedRole(role)
    setSelectedPermissions(roleDetails?.permissions ?? [])
  }

  const togglePermission = (permission: string) => {
    setSelectedPermissions((current) =>
      current.includes(permission)
        ? current.filter((currentPermission) => currentPermission !== permission)
        : [...current, permission],
    )
  }

  return (
    <AppShell>
      <form
        className="space-y-6"
        onChange={unsavedChanges.markDirty}
        onSubmit={(event) => {
          event.preventDefault()
          unsavedChanges.navigateAfterSave(detailPath)
        }}
      >
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <Link
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#045A58] transition hover:text-[#034A48]"
              to={detailPath}
            >
              <ArrowLeft size={16} />
              {member.fullName}
            </Link>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-normal text-[#111827]">Edit account</h1>
              <Badge tone={statusTone[member.status]}>{member.status}</Badge>
              <Badge tone="neutral">{displayId}</Badge>
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6B7280]">
              Update the internal profile, assigned role, and account permissions.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={() => unsavedChanges.requestNavigation(detailPath)} size="md" variant="secondary">
              Cancel
            </Button>
            <Button leftIcon={<Save size={17} />} size="md" type="submit">
              Save changes
            </Button>
          </div>
        </div>

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
                    defaultValue={member.fullName}
                    id="full-name"
                    label="Full name"
                    name="fullName"
                    required
                  />
                </div>
                <Input
                  autoComplete="email"
                  defaultValue={member.email}
                  helperText="Used for invitations and sign-in."
                  id="work-email"
                  label="Work email"
                  name="email"
                  required
                  type="email"
                />
                <Input
                  autoComplete="tel"
                  defaultValue={member.phone}
                  helperText="Optional internal contact number."
                  id="phone-number"
                  label="Phone number"
                  name="phone"
                  type="tel"
                />
              </div>
            </FormSection>

            <FormSection
              description="Select the responsibility group that determines the available permissions."
              icon={<ShieldCheck size={19} />}
              title="Assigned role"
            >
              <fieldset>
                <legend className="sr-only">Team member role</legend>
                <div className="grid gap-3 lg:grid-cols-3">
                  {roleOptions.map((role) => {
                    const isSelected = selectedRole === role.name

                    return (
                      <label
                        className={`cursor-pointer rounded-xl border p-4 transition ${
                          isSelected
                            ? 'border-[#045A58] bg-[#F2F9F8] ring-1 ring-[#045A58]'
                            : 'border-[#E5E7EB] bg-white hover:border-[#BFCAC9] hover:bg-[#F9FAFB]'
                        }`}
                        key={role.name}
                      >
                        <input
                          checked={isSelected}
                          className="sr-only"
                          name="role"
                          onChange={() => selectRole(role.name)}
                          type="radio"
                          value={role.name}
                        />
                        <div className="flex items-start justify-between gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                              isSelected ? 'bg-[#045A58] text-white' : 'bg-[#E6F4F3] text-[#045A58]'
                            }`}
                          >
                            {role.icon}
                          </div>
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                              isSelected
                                ? 'border-[#045A58] bg-[#045A58] text-white'
                                : 'border-[#D1D5DB] text-transparent'
                            }`}
                          >
                            <Check size={13} strokeWidth={3} />
                          </span>
                        </div>
                        <p className="mt-4 text-sm font-semibold text-[#111827]">{role.name}</p>
                        <p className="mt-1 text-sm leading-5 text-[#6B7280]">{role.description}</p>
                      </label>
                    )
                  })}
                </div>
              </fieldset>
            </FormSection>

            <FormSection
              description="Review the access granted within the selected role."
              icon={<KeyRound size={19} />}
              title="Permissions"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {availablePermissions.map((permission) => {
                  const isChecked = selectedPermissions.includes(permission)

                  return (
                    <label
                      className={`flex min-h-16 cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                        isChecked
                          ? 'border-[#B9DAD8] bg-[#F2F9F8]'
                          : 'border-[#E5E7EB] bg-white hover:bg-[#F9FAFB]'
                      }`}
                      key={permission}
                    >
                      <input
                        checked={isChecked}
                        className="mt-0.5 h-4 w-4 shrink-0 accent-[#045A58]"
                        name="permissions"
                        onChange={() => togglePermission(permission)}
                        type="checkbox"
                        value={permission}
                      />
                      <span className="text-sm font-medium leading-5 text-[#374151]">{permission}</span>
                    </label>
                  )
                })}
              </div>
            </FormSection>
          </div>

          <aside className="space-y-6 xl:sticky xl:top-26 xl:self-start">
            <Card>
              <h2 className="text-lg font-semibold text-[#111827]">Account summary</h2>
              <div className="mt-5 space-y-4">
                <SummaryItem label="User ID" value={displayId} />
                <SummaryItem label="Account status" value={member.status} />
                <SummaryItem label="Current role" value={member.role} />
                <SummaryItem label="Last login" value={member.lastLogin} />
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-semibold text-[#111827]">Access changes</h2>
              <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                Role changes replace the available permission set. Review individual permissions before saving.
              </p>
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                <CheckCircle2 className="shrink-0 text-[#045A58]" size={18} />
                <p className="text-sm font-medium text-[#374151]">
                  {selectedPermissions.length} of {availablePermissions.length} permissions selected
                </p>
              </div>
            </Card>

            <Card className="border-[#B9DAD8] bg-[#F2F9F8]">
              <div className="flex items-start gap-3">
                <KeyRound className="mt-0.5 shrink-0 text-[#045A58]" size={19} />
                <div>
                  <h2 className="text-sm font-semibold text-[#111827]">Password security</h2>
                  <p className="mt-1 text-sm leading-6 text-[#52605F]">
                    Passwords and account status are not edited here. Access status is managed separately from the account detail page.
                  </p>
                </div>
              </div>
            </Card>
          </aside>
        </div>

        <div className="sticky bottom-0 z-10 -mx-4 border-t border-[#E5E7EB] bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 xl:hidden">
          <div className="flex justify-end gap-3">
            <Button onClick={() => unsavedChanges.requestNavigation(detailPath)} size="md" variant="secondary">
              Cancel
            </Button>
            <Button leftIcon={<Save size={17} />} size="md" type="submit">
              Save changes
            </Button>
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
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E6F4F3] text-[#045A58]">
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
