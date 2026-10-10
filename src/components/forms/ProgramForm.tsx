import {
  BookOpen,
  CalendarDays,
  CircleDollarSign,
  ClipboardCheck,
  GraduationCap,
  Link2,
  Plus,
  Trash2,
} from 'lucide-react'
import { useState, type FormEvent } from 'react'
import type {
  IntakeMonth,
  Program,
  ProgramInput,
  StudyLevel,
} from '../../features/programs/programs.api.js'
import Button from '../ui/Button.js'
import Input from '../ui/Input.js'
import { FormError, FormSection, SelectField, TextareaField, selectClasses, textOrNull } from './FormParts.js'

type ProgramFormProps = {
  initialValues?: Program | undefined
  errorMessage?: string | null | undefined
  isSubmitting?: boolean
  onCancel: () => void
  onDirty: () => void
  onSubmit: (input: ProgramInput) => void
  school:
    | {
        id: string
        mode: 'fixed'
        name: string
      }
    | {
        mode: 'select'
        options: Array<{
          id: string
          name: string
        }>
      }
  submitLabel?: string
}

const STUDY_LEVELS: { value: StudyLevel; label: string }[] = [
  { value: 'FOUNDATION', label: 'Foundation' },
  { value: 'UNDERGRADUATE', label: 'Undergraduate' },
  { value: 'POSTGRADUATE', label: 'Postgraduate' },
  { value: 'DOCTORATE', label: 'Doctorate' },
]

const MONTHS: IntakeMonth[] = [
  'JANUARY',
  'FEBRUARY',
  'MARCH',
  'APRIL',
  'MAY',
  'JUNE',
  'JULY',
  'AUGUST',
  'SEPTEMBER',
  'OCTOBER',
  'NOVEMBER',
  'DECEMBER',
]

const monthLabel = (month: IntakeMonth) => month.charAt(0) + month.slice(1).toLowerCase()

const CATEGORY_SUGGESTIONS = [
  'Business',
  'Computer Science',
  'Data Science',
  'Engineering',
  'Health Sciences',
  'Nursing',
  'Public Health',
  'Law',
  'Social Sciences',
  'Arts and Design',
]

const CURRENCIES = ['GBP', 'CAD', 'USD', 'EUR', 'AUD']

type IntakeRow = { key: number; month: IntakeMonth; year: string; applicationDeadline: string }

let nextIntakeKey = 0
const newIntakeRow = (row: Omit<IntakeRow, 'key'>): IntakeRow => ({ key: nextIntakeKey++, ...row })

const toDateInput = (value: string | null) => (value ? value.slice(0, 10) : '')


const ProgramForm = ({
  initialValues,
  errorMessage,
  isSubmitting = false,
  onCancel,
  onDirty,
  onSubmit,
  school,
  submitLabel = 'Add program',
}: ProgramFormProps) => {
  const [intakes, setIntakes] = useState<IntakeRow[]>(() =>
    (initialValues?.intakes ?? []).map((intake) =>
      newIntakeRow({
        month: intake.month,
        year: String(intake.year),
        applicationDeadline: toDateInput(intake.applicationDeadline),
      }),
    ),
  )

  const updateIntake = (key: number, patch: Partial<IntakeRow>) => {
    setIntakes((rows) => rows.map((row) => (row.key === key ? { ...row, ...patch } : row)))
    onDirty()
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)

    onSubmit({
      name: String(form.get('name') ?? '').trim(),
      studyLevel: form.get('studyLevel') as StudyLevel,
      qualification: String(form.get('qualification') ?? '').trim(),
      category: String(form.get('category') ?? '').trim(),
      duration: String(form.get('duration') ?? '').trim(),
      schoolId: String(form.get('schoolId') ?? ''),
      tuitionAmount: Number(form.get('tuitionAmount')),
      tuitionCurrency: String(form.get('tuitionCurrency') ?? 'GBP'),
      scholarshipAvailability: textOrNull(form, 'scholarshipAvailability'),
      intakes: intakes
        .filter((row) => row.year.trim() !== '')
        .map((row) => ({
          month: row.month,
          year: Number(row.year),
          applicationDeadline: row.applicationDeadline === '' ? null : row.applicationDeadline,
        })),
      academicRequirements: textOrNull(form, 'academicRequirements'),
      englishRequirements: textOrNull(form, 'englishRequirements'),
      operationNotes: textOrNull(form, 'operationNotes'),
      sourceUrl: textOrNull(form, 'sourceUrl'),
      feesAcademicYear: textOrNull(form, 'feesAcademicYear'),
    })
  }

  return (
    <form className="space-y-6" onChange={onDirty} onSubmit={handleSubmit}>
      <FormSection
        description="The university's own course page. Every fee and requirement below should come from it."
        icon={<Link2 size={19} />}
        title="Official source"
      >
        <div className="grid gap-5 sm:grid-cols-[1fr_180px]">
          <Input
            defaultValue={initialValues?.sourceUrl ?? ''}
            helperText="Required before the programme can be marked verified."
            id="source-url"
            label="Course page link"
            name="sourceUrl"
            placeholder="https://www.manchester.ac.uk/study/masters/courses/list/..."
            type="url"
          />
          <Input
            defaultValue={initialValues?.feesAcademicYear ?? ''}
            helperText="The year the fees apply to."
            id="fees-academic-year"
            label="Fees for year"
            name="feesAcademicYear"
            pattern="\d{4}/\d{2}"
            placeholder="2026/27"
          />
        </div>
      </FormSection>

      <FormSection
        description="Core classification used in program search and student matching."
        icon={<BookOpen size={19} />}
        title="Program details"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input
              defaultValue={initialValues?.name}
              id="program-name"
              label="Program name"
              name="name"
              placeholder="e.g. Data Science"
              required
            />
          </div>
          <SelectField
            defaultValue={initialValues?.studyLevel}
            id="study-level"
            label="Study level"
            name="studyLevel"
            options={STUDY_LEVELS}
            placeholder="Select level"
            required
          />
          <Input
            defaultValue={initialValues?.qualification}
            id="qualification"
            label="Qualification"
            name="qualification"
            placeholder="e.g. MSc, BEng (Hons), MBA"
            required
          />
          <div>
            <Input
              defaultValue={initialValues?.category}
              id="program-category"
              label="Category"
              list="program-category-suggestions"
              name="category"
              placeholder="e.g. Computer Science"
              required
            />
            <datalist id="program-category-suggestions">
              {CATEGORY_SUGGESTIONS.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
          </div>
          <Input
            defaultValue={initialValues?.duration}
            id="duration"
            label="Duration"
            name="duration"
            placeholder="e.g. 1 year"
            required
          />
          <div className="sm:col-span-2">
            {school.mode === 'fixed' ? (
              <>
                <input name="schoolId" type="hidden" value={school.id} />
                <Input disabled id="school" label="School" value={school.name} />
              </>
            ) : (
              <SchoolSelect defaultValue={initialValues?.school.publicId} options={school.options} />
            )}
          </div>
        </div>
      </FormSection>

      <FormSection
        description="International (overseas) tuition per year, used for budget matching."
        icon={<CircleDollarSign size={19} />}
        title="Tuition and funding"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            defaultValue={initialValues?.tuitionAmount}
            id="tuition-amount"
            label="International tuition per year"
            min="1"
            name="tuitionAmount"
            placeholder="31000"
            required
            step="any"
            type="number"
          />
          <SelectField
            defaultValue={initialValues?.tuitionCurrency ?? 'GBP'}
            id="tuition-currency"
            label="Currency"
            name="tuitionCurrency"
            options={CURRENCIES.map((currency) => ({ value: currency, label: currency }))}
            required
          />
          <div className="sm:col-span-2">
            <Input
              defaultValue={initialValues?.scholarshipAvailability ?? ''}
              id="scholarship"
              label="Scholarships"
              name="scholarshipAvailability"
              placeholder="e.g. Up to £5,000 for Nigerian students, or None"
            />
          </div>
        </div>
      </FormSection>

      <FormSection
        description="Each intake this year and next, with its application deadline if the page gives one."
        icon={<CalendarDays size={19} />}
        title="Intakes and deadlines"
      >
        <div className="space-y-3">
          {intakes.length === 0 ? (
            <p className="text-sm text-[#6B7280]">No intakes added yet.</p>
          ) : null}
          {intakes.map((row) => (
            <div className="grid items-end gap-3 sm:grid-cols-[1fr_120px_1fr_auto]" key={row.key}>
              <div>
                <label className="mb-2 block text-sm font-medium text-[#111827]" htmlFor={`intake-month-${row.key}`}>
                  Month
                </label>
                <select
                  className={selectClasses}
                  id={`intake-month-${row.key}`}
                  onChange={(event) => updateIntake(row.key, { month: event.target.value as IntakeMonth })}
                  value={row.month}
                >
                  {MONTHS.map((month) => (
                    <option key={month} value={month}>
                      {monthLabel(month)}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                id={`intake-year-${row.key}`}
                label="Year"
                max="2100"
                min="2024"
                onChange={(event) => updateIntake(row.key, { year: event.target.value })}
                required
                type="number"
                value={row.year}
              />
              <Input
                id={`intake-deadline-${row.key}`}
                label="Application deadline"
                onChange={(event) => updateIntake(row.key, { applicationDeadline: event.target.value })}
                type="date"
                value={row.applicationDeadline}
              />
              <Button
                aria-label="Remove intake"
                onClick={() => {
                  setIntakes((rows) => rows.filter((other) => other.key !== row.key))
                  onDirty()
                }}
                size="lg"
                type="button"
                variant="ghost"
              >
                <Trash2 size={17} />
              </Button>
            </div>
          ))}
          <Button
            leftIcon={<Plus size={16} />}
            onClick={() => {
              setIntakes((rows) => [
                ...rows,
                newIntakeRow({
                  month: 'SEPTEMBER',
                  year: String(new Date().getFullYear() + 1),
                  applicationDeadline: '',
                }),
              ])
              onDirty()
            }}
            size="sm"
            type="button"
            variant="secondary"
          >
            Add intake
          </Button>
        </div>
      </FormSection>

      <FormSection
        description="Copy these from the course page. Include what it says for Nigerian applicants (WAEC, NECO, degree class)."
        icon={<GraduationCap size={19} />}
        title="Entry requirements"
      >
        <div className="grid gap-5">
          <TextareaField
            defaultValue={initialValues?.academicRequirements ?? undefined}
            id="academic-requirements"
            label="Academic requirements"
            name="academicRequirements"
            placeholder="e.g. Nigerian applicants: Second Class Upper (2:1) bachelor's degree in a related subject."
            rows={4}
          />
          <TextareaField
            defaultValue={initialValues?.englishRequirements ?? undefined}
            id="english-requirements"
            label="English requirements"
            name="englishRequirements"
            placeholder="e.g. IELTS 6.5 overall with no less than 6.0 in each component. WAEC English C6 accepted."
            rows={4}
          />
        </div>
      </FormSection>

      <FormSection
        description="Internal context for advisors and operations staff. Not shown to students."
        icon={<ClipboardCheck size={19} />}
        title="Operational notes"
      >
        <TextareaField
          defaultValue={initialValues?.operationNotes ?? undefined}
          id="program-notes"
          label="Notes"
          name="operationNotes"
          placeholder="Add application, pathway, document, or partner guidance."
          rows={5}
        />
      </FormSection>

      <FormError message={errorMessage} />

      <div className="flex flex-col-reverse gap-3 border-t border-[#E5E7EB] pt-6 sm:flex-row sm:justify-end">
        <Button onClick={onCancel} size="md" type="button" variant="secondary">
          Cancel
        </Button>
        <Button disabled={isSubmitting} size="md" type="submit">
          {isSubmitting ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  )
}

const SchoolSelect = ({
  defaultValue,
  options,
}: {
  defaultValue?: string | undefined
  options: Array<{
    id: string
    name: string
  }>
}) => (
  <div>
    <label className="mb-2 block text-sm font-medium text-[#111827]" htmlFor="school-id">
      School
    </label>
    <select className={selectClasses} defaultValue={defaultValue ?? ''} id="school-id" name="schoolId" required>
      <option disabled value="">
        Select school
      </option>
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.name}
        </option>
      ))}
    </select>
  </div>
)

export default ProgramForm
