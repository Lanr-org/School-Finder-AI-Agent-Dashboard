import type { ApplicationStatus } from './applications.api.js'

type BadgeTone = 'brand' | 'neutral' | 'success' | 'warning' | 'error'

// Mirrors the backend's applications.transitions.ts. The server stays the
// authority (it returns 409); this only decides which options the UI offers —
// kept client-side because error details aren't sent outside development.
export const APPLICATION_FLOW: ApplicationStatus[] = [
  'DRAFT',
  'DOCUMENTS_PENDING',
  'SUBMITTED',
  'OFFER_RECEIVED',
  'VISA_PROCESSING',
  'COMPLETED',
]

export const ALL_APPLICATION_STATUSES: ApplicationStatus[] = [...APPLICATION_FLOW, 'REJECTED', 'WITHDRAWN']

export const isTerminal = (status: ApplicationStatus) =>
  status === 'COMPLETED' || status === 'REJECTED' || status === 'WITHDRAWN'

export const canTransition = (from: ApplicationStatus, to: ApplicationStatus) => {
  if (from === to || isTerminal(from)) return false
  if (to === 'REJECTED' || to === 'WITHDRAWN') return true
  return APPLICATION_FLOW.indexOf(to) > APPLICATION_FLOW.indexOf(from)
}

export const applicationStatusLabels: Record<ApplicationStatus, string> = {
  DRAFT: 'Draft',
  DOCUMENTS_PENDING: 'Documents pending',
  SUBMITTED: 'Submitted',
  OFFER_RECEIVED: 'Offer received',
  VISA_PROCESSING: 'Visa processing',
  COMPLETED: 'Completed',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
}

export const applicationStatusTone: Record<ApplicationStatus, BadgeTone> = {
  DRAFT: 'neutral',
  DOCUMENTS_PENDING: 'warning',
  SUBMITTED: 'brand',
  OFFER_RECEIVED: 'brand',
  VISA_PROCESSING: 'warning',
  COMPLETED: 'success',
  REJECTED: 'error',
  WITHDRAWN: 'neutral',
}

export const applicationStatusDescriptions: Record<ApplicationStatus, string> = {
  DRAFT: 'The application is being prepared and has not been sent to the school.',
  DOCUMENTS_PENDING: 'Waiting on transcripts, test scores, or other documents from the student.',
  SUBMITTED: 'The application has been submitted to the school and is awaiting a decision.',
  OFFER_RECEIVED: 'The school has made an offer to the student.',
  VISA_PROCESSING: 'The student has accepted the offer and the visa application is in progress.',
  COMPLETED: 'The student is enrolled or cleared to travel. This is final.',
  REJECTED: 'The school or visa authority declined the application. This is final.',
  WITHDRAWN: 'The student or advisor withdrew the application. This is final.',
}

export const formatIntakeLabel = (month: string, year: number) =>
  `${month.charAt(0)}${month.slice(1).toLowerCase()} ${year}`
