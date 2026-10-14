import {
  ArrowLeft,
  Check,
  CheckCircle2,
  MailPlus,
  ShieldCheck,
  UserRoundCheck,
  UsersRound,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell.js'
import UnsavedChangesModal from '../../components/modals/UnsavedChangesModal.js'
import Badge from '../../components/ui/Badge.js'
import Button from '../../components/ui/Button.js'
import Card from '../../components/ui/Card.js'
import Input from '../../components/ui/Input.js'
import useUnsavedChanges from '../../hooks/useUnsavedChanges.js'

type TeamRole = 'Admin' | 'Advisor' | 'Operations'

const roles: {
  description: string
  icon: ReactNode
  name: TeamRole
  permissions: string[]
}[] = [
  {
    description: 'Full platform administration and operational oversight.',
    icon: <ShieldCheck size={19} />,
    name: 'Admin',
    permissions: ['Manage team access', 'View all students', 'Manage schools and programs', 'Access all workflows'],
  },
  {
    description: 'Student-facing work for assigned leads and applications.',
    icon: <UserRoundCheck size={19} />,
    name: 'Advisor',
    permissions: ['View assigned students', 'Manage conversations', 'Create recommendations', 'Record follow-ups'],
  },
  {
    description: 'Maintain the school and program information used by advisors.',
    icon: <UsersRound size={19} />,
    name: 'Operations',
    permissions: ['Manage schools', 'Manage programs', 'Maintain operational data', 'View supporting workflows'],
  },
]

const InviteTeamMemberPage = () => {
  const unsavedChanges = useUnsavedChanges()
  const [selectedRole, setSelectedRole] = useState<TeamRole>('Advisor')
  const selectedRoleDetails = roles.find((role) => role.name === selectedRole) ?? roles[0]!

  return (
    <AppShell>
      <form
        className="space-y-6"
        onChange={unsavedChanges.markDirty}
        onSubmit={(event) => {
          event.preventDefault()
          unsavedChanges.navigateAfterSave('/team')
        }}
      >
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
              <h1 className="text-3xl font-semibold tracking-normal text-[#111827]">Invite team member</h1>
              <Badge tone="warning">Pending invitation</Badge>
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6B7280]">
              Create an internal account and send a secure invitation for the team member to set their password.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={() => unsavedChanges.requestNavigation('/team')} size="md" variant="secondary">
              Cancel
            </Button>
            <Button leftIcon={<MailPlus size={17} />} size="md" type="submit">
              Send invitation
            </Button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <FormSection
              description="Identity and contact information for the internal account."
              icon={<UserRoundCheck size={19} />}
              title="Member details"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Input
                    autoComplete="name"
                    id="full-name"
                    label="Full name"
                    name="fullName"
                    placeholder="Enter team member's full name"
                    required
                  />
                </div>
                <Input
                  autoComplete="email"
                  helperText="The invitation will be sent to this address."
                  id="work-email"
                  label="Work email"
                  name="email"
                  placeholder="name@company.com"
                  required
                  type="email"
                />
                <Input
                  autoComplete="tel"
                  helperText="Optional internal contact number."
                  id="phone-number"
                  label="Phone number"
                  name="phone"
                  placeholder="+234 000 000 0000"
                  type="tel"
                />
              </div>
            </FormSection>

            <FormSection
              description="Choose the access level that matches this person's responsibilities."
              icon={<ShieldCheck size={19} />}
              title="Role and access"
            >
              <fieldset>
                <legend className="sr-only">Team member role</legend>
                <div className="grid gap-3 lg:grid-cols-3">
                  {roles.map((role) => {
                    const isSelected = selectedRole === role.name

                    return (
                      <label
                        className={`relative cursor-pointer rounded-xl border p-4 transition ${
                          isSelected
                            ? 'border-[#2B4BFF] bg-[#F5F7FF] ring-1 ring-[#2B4BFF]'
                            : 'border-[#E5E7EB] bg-white hover:border-[#BFCAC9] hover:bg-[#F9FAFB]'
                        }`}
                        key={role.name}
                      >
                        <input
                          checked={isSelected}
                          className="sr-only"
                          name="role"
                          onChange={() => setSelectedRole(role.name)}
                          type="radio"
                          value={role.name}
                        />
                        <div className="flex items-start justify-between gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                              isSelected ? 'bg-[#2B4BFF] text-white' : 'bg-[#ECEFFF] text-[#2B4BFF]'
                            }`}
                          >
                            {role.icon}
                          </div>
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                              isSelected
                                ? 'border-[#2B4BFF] bg-[#2B4BFF] text-white'
                                : 'border-[#D1D5DB] bg-white text-transparent'
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

              <div className="mt-5 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#111827]">{selectedRoleDetails.name} permissions</p>
                    <p className="mt-1 text-xs text-[#6B7280]">Applied when the invitation is accepted.</p>
                  </div>
                  <Badge tone="brand">{selectedRoleDetails.name}</Badge>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {selectedRoleDetails.permissions.map((permission) => (
                    <div className="flex items-center gap-2 text-sm text-[#374151]" key={permission}>
                      <CheckCircle2 className="shrink-0 text-[#2B4BFF]" size={16} />
                      {permission}
                    </div>
                  ))}
                </div>
              </div>
            </FormSection>
          </div>

          <aside className="space-y-6 xl:sticky xl:top-26 xl:self-start">
            <Card>
              <h2 className="text-lg font-semibold text-[#111827]">Required to invite</h2>
              <div className="mt-5 space-y-4">
                <ChecklistItem label="Full name" />
                <ChecklistItem label="Valid work email" />
                <ChecklistItem label="Team role" />
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-semibold text-[#111827]">Invitation process</h2>
              <ol className="mt-4 space-y-4">
                <ProcessStep label="Account is created with Invited status." number="1" />
                <ProcessStep label="A secure setup link is sent by email." number="2" />
                <ProcessStep label="The member creates their own password." number="3" />
                <ProcessStep label="Their account becomes active." number="4" />
              </ol>
            </Card>

            <Card className="border-[#C2CBFF] bg-[#F5F7FF]">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 shrink-0 text-[#2B4BFF]" size={19} />
                <div>
                  <h2 className="text-sm font-semibold text-[#111827]">Password security</h2>
                  <p className="mt-1 text-sm leading-6 text-[#525866]">
                    Administrators do not create, store, or view another team member's password.
                  </p>
                </div>
              </div>
            </Card>
          </aside>
        </div>

        <div className="sticky bottom-0 z-10 -mx-4 border-t border-[#E5E7EB] bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 xl:hidden">
          <div className="flex justify-end gap-3">
            <Button onClick={() => unsavedChanges.requestNavigation('/team')} size="md" variant="secondary">
              Cancel
            </Button>
            <Button leftIcon={<MailPlus size={17} />} size="md" type="submit">
              Send invitation
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

const ChecklistItem = ({ label }: { label: string }) => (
  <div className="flex items-center gap-3">
    <CheckCircle2 className="shrink-0 text-[#2B4BFF]" size={18} />
    <span className="text-sm font-medium text-[#374151]">{label}</span>
  </div>
)

const ProcessStep = ({ label, number }: { label: string; number: string }) => (
  <li className="flex items-start gap-3">
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#ECEFFF] text-xs font-semibold text-[#2B4BFF]">
      {number}
    </span>
    <span className="pt-0.5 text-sm leading-5 text-[#6B7280]">{label}</span>
  </li>
)

export default InviteTeamMemberPage
