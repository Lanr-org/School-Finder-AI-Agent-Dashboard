import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  BookOpen,
  Building2,
  CircleDashed,
  ExternalLink,
  Globe2,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  ShieldCheck,
  Star,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell.js'
import Badge from '../../components/ui/Badge.js'
import Card from '../../components/ui/Card.js'
import {
  STUDY_LEVEL_LABEL,
  VERIFICATION_LABEL,
  formatDate,
  formatTuition,
} from '../../features/programs/programs.format.js'
import { usePrograms } from '../../features/programs/usePrograms.js'
import type { PartnerStatus, School, SchoolType } from '../../features/schools/schools.api.js'
import { useSchool } from '../../features/schools/useSchools.js'
import { apiErrorMessage } from '../../lib/api/errors.js'
import { useAuthStore } from '../../store/authStore.js'

const MANAGE_ROLES = ['ADMIN', 'OPERATIONS']

const SCHOOL_TYPE_LABEL: Record<SchoolType, string> = {
  UNIVERSITY: 'University',
  COLLEGE: 'College',
  INSTITUTE: 'Institute',
  POLYTECHNIC: 'Polytechnic',
}

const PARTNER_LABEL: Record<PartnerStatus, string> = {
  PARTNER: 'Partner',
  PROSPECT: 'Prospect',
  NON_PARTNER: 'Non-partner',
}

const linkButtonClasses =
  'inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold outline-none transition focus:ring-4 focus:ring-[#E6F4F3]'

const SchoolDetailPage = () => {
  const { schoolId } = useParams()
  const { data: school, isLoading, isError, error } = useSchool(schoolId)
  const { data: programsData } = usePrograms({ schoolId, limit: 100 })
  const canManage = useAuthStore((state) => (state.user ? MANAGE_ROLES.includes(state.user.role) : false))

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="animate-spin text-[#045A58]" size={32} />
        </div>
      </AppShell>
    )
  }

  if (isError || !school) {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
          <AlertCircle className="text-[#DC2626]" size={28} />
          <p className="text-sm text-[#6B7280]">{apiErrorMessage(error, 'Failed to load this school')}</p>
          <Link className="text-sm font-semibold text-[#045A58] hover:text-[#034A48]" to="/schools">
            Back to Schools
          </Link>
        </div>
      </AppShell>
    )
  }

  const programs = programsData?.programs ?? []
  const verifiedCount = programs.filter((program) => program.verificationStatus === 'VERIFIED').length

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <Link
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#045A58] transition hover:text-[#034A48]"
              to="/schools"
            >
              <ArrowLeft size={16} />
              Schools
            </Link>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-normal text-[#111827]">{school.name}</h1>
              <Badge tone={school.recordStatus === 'ACTIVE' ? 'success' : 'neutral'}>
                {school.recordStatus === 'ACTIVE' ? 'Active' : 'Inactive'}
              </Badge>
              <Badge tone="neutral">{school.publicId}</Badge>
            </div>
            <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-[#6B7280]">
              <MapPin size={15} />
              {school.city}, {school.country}
            </p>
          </div>

          {canManage ? (
            <div className="flex flex-wrap gap-3">
              <Link
                className={`${linkButtonClasses} border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F9FAFB]`}
                to={`/schools/${school.publicId}/programs/new`}
              >
                <Plus size={17} />
                Add program
              </Link>
              <Link
                className={`${linkButtonClasses} border-transparent bg-[#045A58] text-white hover:bg-[#034A48]`}
                to={`/schools/${school.publicId}/edit`}
              >
                <Pencil size={17} />
                Edit school
              </Link>
            </div>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard icon={Building2} label="School type" value={SCHOOL_TYPE_LABEL[school.schoolType]} />
          <SummaryCard
            icon={BookOpen}
            label="Programs"
            value={`${programs.length} (${verifiedCount} verified)`}
          />
          <SummaryCard
            icon={ShieldCheck}
            label="Visa score"
            value={school.visaFriendlinessScore === null ? '—' : `${school.visaFriendlinessScore}/100`}
          />
          <SummaryCard icon={Star} label="Partner status" value={PARTNER_LABEL[school.partnerStatus]} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <Card className="p-0">
              <div className="flex items-center justify-between gap-3 border-b border-[#E5E7EB] px-6 py-5">
                <div>
                  <h2 className="text-lg font-semibold text-[#111827]">Programs</h2>
                  <p className="mt-1 text-sm text-[#6B7280]">Every programme recorded for this school.</p>
                </div>
                <BookOpen className="text-[#045A58]" size={20} />
              </div>
              {programs.length === 0 ? (
                <p className="px-6 py-8 text-sm text-[#6B7280]">No programmes yet.</p>
              ) : (
                <ul className="divide-y divide-[#E5E7EB]">
                  {programs.map((program) => (
                    <li key={program.publicId}>
                      <Link
                        className="flex flex-col gap-1 px-6 py-4 transition hover:bg-[#F9FAFB] sm:flex-row sm:items-center sm:justify-between"
                        to={`/programs/${program.publicId}`}
                      >
                        <div>
                          <p className="text-sm font-semibold text-[#111827]">
                            {program.qualification} {program.name}
                          </p>
                          <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-[#6B7280]">
                            {STUDY_LEVEL_LABEL[program.studyLevel]} ·{' '}
                            {program.verificationStatus === 'VERIFIED' ? (
                              <BadgeCheck className="text-[#166534]" size={13} />
                            ) : program.verificationStatus === 'NEEDS_RECHECK' ? (
                              <AlertTriangle className="text-[#B45309]" size={13} />
                            ) : (
                              <CircleDashed className="text-[#9CA3AF]" size={13} />
                            )}
                            {VERIFICATION_LABEL[program.verificationStatus]}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-[#111827]">{formatTuition(program)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card>
              <h2 className="text-lg font-semibold text-[#111827]">About</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[#374151]">
                {school.description ?? 'No description yet.'}
              </p>
            </Card>

            <Card>
              <div className="mb-5 flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-[#111827]">Internal assessment</h2>
                <Star className="text-[#045A58]" size={20} />
              </div>
              <div className="space-y-4">
                <NoteItem label="Visa notes" value={school.visaFriendlinessNotes} />
                <NoteItem
                  label={`Admission notes${
                    school.admissionFriendlinessScore === null ? '' : ` (${school.admissionFriendlinessScore}/100)`
                  }`}
                  value={school.admissionFriendlinessNotes}
                />
                <NoteItem label="Ranking and reputation" value={school.rankingReputationNotes} />
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <SponsorCard school={school} />

            <Card>
              <div className="mb-5 flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-[#111827]">Contact and website</h2>
                <Globe2 className="text-[#045A58]" size={20} />
              </div>
              <div className="space-y-4">
                <ContactItem icon={Globe2} label="Website">
                  {school.website ? (
                    <a
                      className="inline-flex items-center gap-1.5 break-all font-semibold text-[#045A58] hover:text-[#034A48]"
                      href={school.website}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {school.website}
                      <ExternalLink className="shrink-0" size={13} />
                    </a>
                  ) : (
                    '—'
                  )}
                </ContactItem>
                <ContactItem icon={Mail} label="Admissions email">
                  {school.admissionsEmail ?? '—'}
                </ContactItem>
                <ContactItem icon={Phone} label="Phone">
                  {school.phoneNumbers.length > 0 ? school.phoneNumbers.join(', ') : '—'}
                </ContactItem>
              </div>
            </Card>

            <Card>
              <div className="mb-5 flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-[#111827]">Location</h2>
                <MapPin className="text-[#045A58]" size={20} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <DetailItem label="Address" value={school.streetAddress ?? '—'} />
                <DetailItem label="City" value={school.city} />
                <DetailItem label="Country" value={school.country} />
                <DetailItem label="Postal code" value={school.postalCode ?? '—'} />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

const SponsorCard = ({ school }: { school: School }) => (
  <Card>
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-lg font-semibold text-[#111827]">Student visa sponsor</h2>
      <ShieldCheck className="text-[#045A58]" size={20} />
    </div>
    {school.visaSponsorStatus === 'LICENSED' ? (
      <p className="flex items-start gap-2 text-sm leading-6 text-[#166534]">
        <BadgeCheck className="mt-0.5 shrink-0" size={17} />
        On the official register of licensed student sponsors.
      </p>
    ) : school.visaSponsorStatus === 'NOT_LISTED' ? (
      <p className="flex items-start gap-2 text-sm leading-6 text-[#92400E]">
        <AlertTriangle className="mt-0.5 shrink-0" size={17} />
        Not found on the official sponsor register. It may not be able to issue a CAS. Check before advising students.
      </p>
    ) : (
      <p className="flex items-start gap-2 text-sm leading-6 text-[#6B7280]">
        <CircleDashed className="mt-0.5 shrink-0" size={17} />
        Not checked against the official sponsor register yet.
      </p>
    )}
    {school.visaSponsorCheckedAt ? (
      <p className="mt-3 text-xs text-[#6B7280]">
        {school.visaSponsorSource ?? 'Official register'}, checked {formatDate(school.visaSponsorCheckedAt)}
      </p>
    ) : null}
  </Card>
)

type SummaryCardProps = {
  icon: typeof BookOpen
  label: string
  value: string
}

const SummaryCard = ({ icon: Icon, label, value }: SummaryCardProps) => (
  <Card className="p-5">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-[#6B7280]">{label}</p>
        <p className="mt-3 text-lg font-semibold text-[#111827]">{value}</p>
      </div>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E6F4F3] text-[#045A58]">
        <Icon size={20} />
      </div>
    </div>
  </Card>
)

const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs font-semibold uppercase tracking-normal text-[#9CA3AF]">{label}</p>
    <p className="mt-1 text-sm font-semibold text-[#111827]">{value}</p>
  </div>
)

const NoteItem = ({ label, value }: { label: string; value: string | null }) => (
  <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
    <p className="text-sm font-semibold text-[#111827]">{label}</p>
    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#6B7280]">{value ?? 'Nothing recorded.'}</p>
  </div>
)

const ContactItem = ({
  children,
  icon: Icon,
  label,
}: {
  children: React.ReactNode
  icon: typeof BookOpen
  label: string
}) => (
  <div className="flex items-start gap-3">
    <Icon className="mt-0.5 shrink-0 text-[#6B7280]" size={16} />
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-normal text-[#9CA3AF]">{label}</p>
      <div className="mt-1 text-sm text-[#111827]">{children}</div>
    </div>
  </div>
)

export default SchoolDetailPage
