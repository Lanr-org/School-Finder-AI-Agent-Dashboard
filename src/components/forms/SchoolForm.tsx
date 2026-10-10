import { Building2, Globe2, MapPin, ShieldCheck, Star } from 'lucide-react'
import type { FormEvent } from 'react'
import type {
  PartnerStatus,
  School,
  SchoolInput,
  SchoolRecordStatus,
  SchoolType,
} from '../../features/schools/schools.api.js'
import Button from '../ui/Button.js'
import Input from '../ui/Input.js'
import { FormError, FormSection, SelectField, TextareaField, numberOrNull, textOrNull } from './FormParts.js'

type SchoolFormProps = {
  initialValues?: School | undefined
  errorMessage?: string | null | undefined
  isSubmitting?: boolean
  onCancel: () => void
  onDirty: () => void
  onSubmit: (input: SchoolInput) => void
  submitLabel?: string
}

const SCHOOL_TYPES: { value: SchoolType; label: string }[] = [
  { value: 'UNIVERSITY', label: 'University' },
  { value: 'COLLEGE', label: 'College' },
  { value: 'INSTITUTE', label: 'Institute' },
  { value: 'POLYTECHNIC', label: 'Polytechnic' },
]

const PARTNER_STATUSES: { value: PartnerStatus; label: string }[] = [
  { value: 'PROSPECT', label: 'Prospect' },
  { value: 'PARTNER', label: 'Partner' },
  { value: 'NON_PARTNER', label: 'Non-partner' },
]

const RECORD_STATUSES: { value: SchoolRecordStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
]

// UK first, then Canada and US. Matching compares this name with each student's destination.
const COUNTRIES = ['United Kingdom', 'Canada', 'United States', 'Ireland', 'Australia', 'Germany']

const SchoolForm = ({
  initialValues,
  errorMessage,
  isSubmitting = false,
  onCancel,
  onDirty,
  onSubmit,
  submitLabel = 'Add school',
}: SchoolFormProps) => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)

    onSubmit({
      name: String(form.get('name') ?? '').trim(),
      schoolType: form.get('schoolType') as SchoolType,
      recordStatus: form.get('recordStatus') as SchoolRecordStatus,
      description: textOrNull(form, 'description'),
      website: textOrNull(form, 'website'),
      admissionsEmail: textOrNull(form, 'admissionsEmail'),
      phoneNumbers: String(form.get('phoneNumbers') ?? '')
        .split(',')
        .map((phone) => phone.trim())
        .filter((phone) => phone !== ''),
      streetAddress: textOrNull(form, 'streetAddress'),
      city: String(form.get('city') ?? '').trim(),
      country: String(form.get('country') ?? '').trim(),
      postalCode: textOrNull(form, 'postalCode'),
      partnerStatus: form.get('partnerStatus') as PartnerStatus,
      visaFriendlinessScore: numberOrNull(form, 'visaFriendlinessScore'),
      visaFriendlinessNotes: textOrNull(form, 'visaFriendlinessNotes'),
      admissionFriendlinessScore: numberOrNull(form, 'admissionFriendlinessScore'),
      admissionFriendlinessNotes: textOrNull(form, 'admissionFriendlinessNotes'),
      rankingReputationNotes: textOrNull(form, 'rankingReputationNotes'),
    })
  }

  return (
    <form className="space-y-6" onChange={onDirty} onSubmit={handleSubmit}>
      <FormSection description="Core identity and classification." icon={<Building2 size={19} />} title="School profile">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input
              defaultValue={initialValues?.name}
              helperText="Use the official name, as on the Home Office sponsor register (e.g. The University of Manchester)."
              id="school-name"
              label="School name"
              name="name"
              placeholder="Enter official school name"
              required
            />
          </div>
          <SelectField
            defaultValue={initialValues?.schoolType}
            id="school-type"
            label="School type"
            name="schoolType"
            options={SCHOOL_TYPES}
            placeholder="Select type"
            required
          />
          <SelectField
            defaultValue={initialValues?.recordStatus ?? 'ACTIVE'}
            id="record-status"
            label="Record status"
            name="recordStatus"
            options={RECORD_STATUSES}
          />
          <div className="sm:col-span-2">
            <TextareaField
              defaultValue={initialValues?.description ?? undefined}
              id="school-description"
              label="Description"
              name="description"
              placeholder="A short description advisors can use when introducing the school."
              rows={3}
            />
          </div>
        </div>
      </FormSection>

      <FormSection description="Official admissions contact channels." icon={<Globe2 size={19} />} title="Contact and website">
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            defaultValue={initialValues?.website ?? ''}
            id="website"
            label="Website"
            name="website"
            placeholder="https://www.manchester.ac.uk"
            type="url"
          />
          <Input
            defaultValue={initialValues?.admissionsEmail ?? ''}
            id="admissions-email"
            label="Admissions email"
            name="admissionsEmail"
            placeholder="international@school.ac.uk"
            type="email"
          />
          <div className="sm:col-span-2">
            <Input
              defaultValue={initialValues?.phoneNumbers.join(', ') ?? ''}
              helperText="Separate several numbers with commas."
              id="phone"
              label="Phone numbers"
              name="phoneNumbers"
              placeholder="+44 161 306 6000"
              type="tel"
            />
          </div>
        </div>
      </FormSection>

      <FormSection
        description="Used for destination and city filters in matching."
        icon={<MapPin size={19} />}
        title="Location"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input
              defaultValue={initialValues?.streetAddress ?? ''}
              id="address"
              label="Street address"
              name="streetAddress"
              placeholder="Oxford Road"
            />
          </div>
          <Input defaultValue={initialValues?.city} id="city" label="City" name="city" placeholder="Manchester" required />
          <div>
            <Input
              defaultValue={initialValues?.country ?? 'United Kingdom'}
              id="country"
              label="Country"
              list="country-suggestions"
              name="country"
              required
            />
            <datalist id="country-suggestions">
              {COUNTRIES.map((country) => (
                <option key={country} value={country} />
              ))}
            </datalist>
          </div>
          <Input
            defaultValue={initialValues?.postalCode ?? ''}
            id="postal-code"
            label="Postal code"
            name="postalCode"
            placeholder="M13 9PL"
          />
        </div>
      </FormSection>

      <FormSection description="Our relationship with the school." icon={<ShieldCheck size={19} />} title="Partnership">
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            defaultValue={initialValues?.partnerStatus ?? 'PROSPECT'}
            id="partner-status"
            label="Partner status"
            name="partnerStatus"
            options={PARTNER_STATUSES}
          />
        </div>
      </FormSection>

      <FormSection
        description="Internal scores (0–100) used in matching. Advisors see these; students don't."
        icon={<Star size={19} />}
        title="Internal assessment"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            defaultValue={initialValues?.visaFriendlinessScore ?? ''}
            id="visa-score"
            label="Visa friendliness (0–100)"
            max="100"
            min="0"
            name="visaFriendlinessScore"
            step="1"
            type="number"
          />
          <Input
            defaultValue={initialValues?.admissionFriendlinessScore ?? ''}
            id="admission-score"
            label="Admission friendliness (0–100)"
            max="100"
            min="0"
            name="admissionFriendlinessScore"
            step="1"
            type="number"
          />
          <div className="sm:col-span-2">
            <TextareaField
              defaultValue={initialValues?.visaFriendlinessNotes ?? undefined}
              id="visa-notes"
              label="Visa notes"
              name="visaFriendlinessNotes"
              placeholder="e.g. CAS issued quickly; accepts Nigerian bank statements from tier-1 banks."
              rows={3}
            />
          </div>
          <div className="sm:col-span-2">
            <TextareaField
              defaultValue={initialValues?.admissionFriendlinessNotes ?? undefined}
              id="admission-notes"
              label="Admission notes"
              name="admissionFriendlinessNotes"
              placeholder="e.g. Accepts HND with work experience for some masters."
              rows={3}
            />
          </div>
          <div className="sm:col-span-2">
            <TextareaField
              defaultValue={initialValues?.rankingReputationNotes ?? undefined}
              id="ranking-notes"
              label="Ranking and reputation"
              name="rankingReputationNotes"
              placeholder="e.g. Russell Group; strong for engineering."
              rows={3}
            />
          </div>
        </div>
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

export default SchoolForm
