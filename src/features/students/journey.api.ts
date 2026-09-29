import { api } from '../../lib/api/client.js'
import type { ApiSuccessResponse } from '../../lib/api/types.js'

// The student's journey, same shape the student web app shows. Staff can tick every
// hand-ticked step, including proof of funds.

export type JourneyStageKey = 'PROFILE' | 'EXPLORE' | 'CHOOSE' | 'APPLY' | 'OFFER' | 'ENGLISH' | 'FUNDS' | 'VISA'

export type JourneyCheckKey =
  | 'DEPOSIT_PAID'
  | 'ENGLISH_TEST_BOOKED'
  | 'ENGLISH_SCORE_RECEIVED'
  | 'FUNDS_PLAN_AGREED'
  | 'FUNDS_DOCUMENTS_READY'

export type JourneyChecklistItem = {
  id: string
  label: string
  done: boolean
  // null for items derived from data (profile, applications); canTick is false when data already makes it done.
  checkKey: JourneyCheckKey | null
  canTick: boolean
}

export type JourneyStage = {
  key: JourneyStageKey
  title: string
  description: string
  status: 'DONE' | 'CURRENT' | 'UPCOMING'
  owner: 'YOU' | 'SMETASE' | 'ADVISOR'
  checklist: JourneyChecklistItem[]
}

export type StudentJourney = {
  currentStage: JourneyStageKey
  stages: JourneyStage[]
  nextStep: { title: string; description: string }
}

export const getStudentJourney = async (studentId: string): Promise<StudentJourney> => {
  const res = await api.get<ApiSuccessResponse<StudentJourney>>(`/students/${studentId}/journey`)
  return res.data.data
}

export const setStudentJourneyCheck = async (
  studentId: string,
  key: JourneyCheckKey,
  done: boolean,
): Promise<StudentJourney> => {
  const url = `/students/${studentId}/journey/checks/${key}`
  const res = done
    ? await api.put<ApiSuccessResponse<StudentJourney>>(url)
    : await api.delete<ApiSuccessResponse<StudentJourney>>(url)
  return res.data.data
}
