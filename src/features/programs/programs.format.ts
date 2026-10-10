import type { IntakeMonth, Program, ProgramIntake, StudyLevel, VerificationStatus } from './programs.api.js'

export const STUDY_LEVEL_LABEL: Record<StudyLevel, string> = {
  FOUNDATION: 'Foundation',
  UNDERGRADUATE: 'Undergraduate',
  POSTGRADUATE: 'Postgraduate',
  DOCTORATE: 'Doctorate',
}

export const VERIFICATION_LABEL: Record<VerificationStatus, string> = {
  VERIFIED: 'Verified',
  UNVERIFIED: 'Not verified',
  NEEDS_RECHECK: 'Needs re-check',
}

export const monthLabel = (month: IntakeMonth) => month.charAt(0) + month.slice(1).toLowerCase()

export const formatDate = (value: string | null) =>
  value
    ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—'

export const formatTuition = (program: Pick<Program, 'tuitionAmount' | 'tuitionCurrency'>) =>
  `${program.tuitionCurrency} ${Number(program.tuitionAmount).toLocaleString('en-GB')}`

export const intakeLabel = (intake: ProgramIntake) => `${monthLabel(intake.month)} ${intake.year}`

// The soonest deadline that hasn't passed yet.
export const nextDeadline = (intakes: ProgramIntake[]) => {
  const now = Date.now()
  const upcoming = intakes
    .map((intake) => intake.applicationDeadline)
    .filter((deadline): deadline is string => deadline !== null && new Date(deadline).getTime() >= now)
    .sort()
  return upcoming[0] ?? null
}

// Human labels for the evidence keys the extraction step stores.
export const EVIDENCE_LABEL: Record<string, string> = {
  tuitionAmount: 'Tuition',
  feesAcademicYear: 'Fees year',
  intakes: 'Intakes',
  academicRequirements: 'Academic requirements',
  englishRequirements: 'English requirements',
  duration: 'Duration',
  qualification: 'Qualification',
}
