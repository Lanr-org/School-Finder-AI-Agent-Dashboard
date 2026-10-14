import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  GraduationCap,
  Plus,
  UserRound,
  UserRoundCheck,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell.js'
import UnsavedChangesModal from '../../components/modals/UnsavedChangesModal.js'
import Badge from '../../components/ui/Badge.js'
import Button from '../../components/ui/Button.js'
import Card from '../../components/ui/Card.js'
import Input from '../../components/ui/Input.js'
import useUnsavedChanges from '../../hooks/useUnsavedChanges.js'

const destinationCountries = ['Canada', 'United Kingdom', 'United States', 'Australia', 'Germany']

const AddStudentPage = () => {
  const unsavedChanges = useUnsavedChanges()

  return (
    <AppShell>
      <form
        className="space-y-6"
        onChange={unsavedChanges.markDirty}
        onSubmit={(event) => {
          event.preventDefault()
          unsavedChanges.navigateAfterSave('/students')
        }}
      >
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <Link
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#2B4BFF] transition hover:text-[#1E36D8]"
              to="/students"
            >
              <ArrowLeft size={16} />
              Students / Leads
            </Link>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-normal text-[#111827]">Add student</h1>
              <Badge tone="brand">Manual lead</Badge>
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6B7280]">
              Create a lead received outside Telegram and capture enough context for advisor assignment and school matching.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={() => unsavedChanges.requestNavigation('/students')} size="md" variant="secondary">
              Cancel
            </Button>
            <Button leftIcon={<Plus size={17} />} size="md" type="submit">
              Add student
            </Button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <FormSection
              description="Primary identity and contact information."
              icon={<UserRound size={19} />}
              title="Basic profile"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Input id="full-name" label="Full name" name="fullName" placeholder="Enter student name" required />
                </div>
                <Input id="email" label="Email" name="email" placeholder="student@example.com" type="email" />
                <Input id="phone" label="Phone number" name="phone" placeholder="+234 000 000 0000" type="tel" required />
                <Input id="current-country" label="Current country" name="currentCountry" placeholder="e.g. Nigeria" />
              </div>
            </FormSection>

            <FormSection
              description="Identify where this lead originated for attribution and reporting."
              icon={<ClipboardList size={19} />}
              title="Lead source"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <SelectField
                  id="lead-source"
                  label="Source"
                  name="source"
                  options={[
                    'Select source',
                    'Facebook',
                    'Instagram',
                    'Website',
                    'WhatsApp',
                    'Phone call',
                    'Walk-in',
                    'Referral',
                    'Education fair',
                    'Spreadsheet import',
                    'Other',
                  ]}
                  required
                />
                <Input
                  id="campaign-reference"
                  label="Campaign or referral reference"
                  name="sourceReference"
                  placeholder="Optional campaign, event, or referrer"
                />
                <div className="sm:col-span-2">
                  <TextareaField
                    id="source-note"
                    label="Source note"
                    name="sourceNote"
                    placeholder="Add useful acquisition context."
                    rows={3}
                  />
                </div>
              </div>
            </FormSection>

            <FormSection
              description="Study destination, program, and education-level preferences."
              icon={<BookOpen size={19} />}
              title="Study preferences"
            >
              <fieldset>
                <legend className="text-sm font-medium text-[#111827]">Destination countries</legend>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {destinationCountries.map((country) => (
                    <label
                      className="flex h-12 items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#374151]"
                      key={country}
                    >
                      <input
                        className="h-4 w-4 accent-[#2B4BFF]"
                        name="destinationCountries"
                        type="checkbox"
                        value={country}
                      />
                      {country}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <Input
                  id="preferred-program"
                  label="Program interest"
                  name="preferredProgram"
                  placeholder="e.g. Business Analytics"
                />
                <SelectField
                  id="study-level"
                  label="Study level"
                  name="studyLevel"
                  options={['Select level', 'Certificate', 'Diploma', 'Undergraduate', 'Postgraduate', 'Masters', 'Doctorate']}
                />
              </div>
            </FormSection>

            <FormSection
              description="Budget range, currency, intake, scholarship, and visa priorities."
              icon={<CircleDollarSign size={19} />}
              title="Budget and intake"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Input id="budget-min" label="Minimum budget" min="0" name="budgetMin" placeholder="10000" type="number" />
                <Input id="budget-max" label="Maximum budget" min="0" name="budgetMax" placeholder="25000" type="number" />
                <SelectField
                  defaultValue="USD"
                  id="currency"
                  label="Currency"
                  name="currency"
                  options={['USD', 'CAD', 'GBP', 'AUD', 'EUR', 'NGN']}
                />
                <Input id="target-intake" label="Target intake" name="targetIntake" placeholder="e.g. Fall 2027" />
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <CheckboxField
                  description="Prioritize programs with scholarship or funding options."
                  label="Scholarship interest"
                  name="scholarshipInterest"
                />
                <CheckboxField
                  description="Treat visa friendliness as a high-priority matching factor."
                  label="Visa priority"
                  name="visaPriority"
                />
              </div>
            </FormSection>

            <FormSection
              description="Academic history and current English-test information."
              icon={<GraduationCap size={19} />}
              title="Academic background"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <SelectField
                  id="highest-education"
                  label="Highest education"
                  name="highestEducation"
                  options={['Select qualification', 'Secondary school', 'Diploma', 'Undergraduate degree', 'Postgraduate degree']}
                />
                <Input
                  id="qualification"
                  label="Qualification or field"
                  name="qualification"
                  placeholder="e.g. BSc Accounting"
                />
                <SelectField
                  id="english-test"
                  label="English test"
                  name="englishTestType"
                  options={['Not taken', 'IELTS', 'TOEFL', 'PTE', 'Duolingo', 'Other']}
                />
                <Input
                  id="english-score"
                  label="English test score"
                  name="englishTestScore"
                  placeholder="e.g. Overall 7.0"
                />
              </div>
            </FormSection>

            <FormSection
              description="Set the initial workflow status and ownership."
              icon={<UserRoundCheck size={19} />}
              title="Assignment and notes"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <SelectField
                  defaultValue="New"
                  id="lead-status"
                  label="Lead status"
                  name="status"
                  options={['New', 'Awaiting assignment', 'Assigned', 'Follow-up']}
                />
                <SelectField
                  defaultValue="Unassigned"
                  id="assigned-advisor"
                  label="Assigned advisor"
                  name="assignedAdvisorId"
                  options={['Unassigned', 'Amina Yusuf', 'Daniel Okafor', 'Maya Chen']}
                />
                <div className="sm:col-span-2">
                  <TextareaField
                    id="internal-note"
                    label="Internal note"
                    name="internalNote"
                    placeholder="Add context for the first advisor review."
                    rows={4}
                  />
                </div>
              </div>
            </FormSection>
          </div>

          <aside className="space-y-6 xl:sticky xl:top-26 xl:self-start">
            <Card>
              <h2 className="text-lg font-semibold text-[#111827]">Required to create</h2>
              <div className="mt-5 space-y-4">
                <ChecklistItem label="Full name" />
                <ChecklistItem label="Phone number" />
                <ChecklistItem label="Lead source" />
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-semibold text-[#111827]">Source handling</h2>
              <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                Telegram leads are created automatically. Use this form for Facebook, website, WhatsApp, referrals, walk-ins, calls, events, imports, and other channels.
              </p>
            </Card>

            <Card>
              <h2 className="text-lg font-semibold text-[#111827]">After creation</h2>
              <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                The lead will appear in Students / Leads and can be assigned, enriched, and matched with schools.
              </p>
            </Card>
          </aside>
        </div>

        <div className="sticky bottom-0 z-10 -mx-4 border-t border-[#E5E7EB] bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 xl:hidden">
          <div className="flex justify-end gap-3">
            <Button onClick={() => unsavedChanges.requestNavigation('/students')} size="md" variant="secondary">
              Cancel
            </Button>
            <Button leftIcon={<Plus size={17} />} size="md" type="submit">
              Add student
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
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#ECEFFF] text-[#2B4BFF]">
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

const SelectField = ({
  defaultValue,
  id,
  label,
  name,
  options,
  required,
}: {
  defaultValue?: string
  id: string
  label: string
  name: string
  options: string[]
  required?: boolean
}) => (
  <div>
    <label className="mb-2 block text-sm font-medium text-[#111827]" htmlFor={id}>
      {label}
    </label>
    <select
      className="h-12 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#111827] outline-none transition focus:border-[#2B4BFF] focus:ring-4 focus:ring-[#ECEFFF]"
      defaultValue={defaultValue ?? options[0]}
      id={id}
      name={name}
      required={required}
    >
      {options.map((option, index) => (
        <option disabled={index === 0 && option.startsWith('Select')} key={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
)

const TextareaField = ({
  id,
  label,
  name,
  placeholder,
  rows,
}: {
  id: string
  label: string
  name: string
  placeholder: string
  rows: number
}) => (
  <div>
    <label className="mb-2 block text-sm font-medium text-[#111827]" htmlFor={id}>
      {label}
    </label>
    <textarea
      className="w-full resize-y rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm leading-6 text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#2B4BFF] focus:ring-4 focus:ring-[#ECEFFF]"
      id={id}
      name={name}
      placeholder={placeholder}
      rows={rows}
    />
  </div>
)

const CheckboxField = ({
  description,
  label,
  name,
}: {
  description: string
  label: string
  name: string
}) => (
  <label className="flex items-start gap-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
    <input className="mt-0.5 h-4 w-4 accent-[#2B4BFF]" name={name} type="checkbox" />
    <span>
      <span className="block text-sm font-semibold text-[#111827]">{label}</span>
      <span className="mt-1 block text-sm leading-5 text-[#6B7280]">{description}</span>
    </span>
  </label>
)

const ChecklistItem = ({ label }: { label: string }) => (
  <div className="flex items-center gap-3">
    <CheckCircle2 className="shrink-0 text-[#2B4BFF]" size={18} />
    <span className="text-sm font-medium text-[#374151]">{label}</span>
  </div>
)

export default AddStudentPage
