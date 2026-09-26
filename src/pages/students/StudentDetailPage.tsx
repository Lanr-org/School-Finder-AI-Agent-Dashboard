import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CalendarPlus,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FilePlus2,
  GraduationCap,
  Loader2,
  Mail,
  MessageSquareText,
  Phone,
  SlidersHorizontal,
  School,
  Trash2,
  UserRoundCheck,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { isAxiosError } from 'axios'
import { Link, useParams } from 'react-router-dom'
import ApplicationDetailModal from '../../components/modals/ApplicationDetailModal.js'
import AssignAdvisorModal from '../../components/modals/AssignAdvisorModal.js'
import CreateApplicationModal from '../../components/modals/CreateApplicationModal.js'
import QuickStudentEntryModal, {
  type QuickEntryMode,
  type QuickEntryResult,
} from '../../components/modals/QuickStudentEntryModal.js'
import UpdateWorkflowStatusModal, {
  type WorkflowStatusOption,
} from '../../components/modals/UpdateWorkflowStatusModal.js'
import AppShell from '../../components/layout/AppShell.js'
import Badge from '../../components/ui/Badge.js'
import Button from '../../components/ui/Button.js'
import Card from '../../components/ui/Card.js'
import type { ApiErrorResponse } from '../../lib/api/types.js'
import { useAuthStore } from '../../store/authStore.js'
import { useAdvisorProfiles } from '../../features/advisors/useAdvisors.js'
import {
  useAssignStudentAdvisor,
  useStudent,
  useStudentStatusHistory,
  useUpdateStudentStatus,
} from '../../features/students/useStudents.js'
import type { StudentStatus, StudentStatusChangeSource } from '../../features/students/students.api.js'
import { useStudentApplications } from '../../features/applications/useApplications.js'
import {
  applicationStatusLabels,
  applicationStatusTone,
  formatIntakeLabel,
} from '../../features/applications/applicationStatus.js'
import { useCreateNote, useDeleteNote, useNotes } from '../../features/students/useNotes.js'
import {
  useCancelFollowUp,
  useCompleteFollowUp,
  useCreateFollowUp,
  useFollowUps,
} from '../../features/followUps/useFollowUps.js'
import type { FollowUpStatus } from '../../features/followUps/followUps.api.js'

type BadgeTone = 'brand' | 'neutral' | 'success' | 'warning' | 'error'

const STATUS_FLOW: StudentStatus[] = [
  'NEW',
  'AWAITING_ASSIGNMENT',
  'ASSIGNED',
  'FOLLOW_UP',
  'APPLICATION_STARTED',
  'COMPLETED',
]

const statusLabels: Record<StudentStatus, string> = {
  NEW: 'New',
  AWAITING_ASSIGNMENT: 'Awaiting assignment',
  ASSIGNED: 'Assigned',
  FOLLOW_UP: 'Follow-up',
  APPLICATION_STARTED: 'Application started',
  COMPLETED: 'Completed',
  CLOSED: 'Closed',
}

const statusTone: Record<StudentStatus, BadgeTone> = {
  NEW: 'neutral',
  AWAITING_ASSIGNMENT: 'warning',
  ASSIGNED: 'brand',
  FOLLOW_UP: 'warning',
  APPLICATION_STARTED: 'brand',
  COMPLETED: 'success',
  CLOSED: 'neutral',
}

const statusOptions: (WorkflowStatusOption & { value: StudentStatus })[] = [
  { value: 'NEW', label: statusLabels.NEW, tone: statusTone.NEW, description: 'The lead has been captured and still requires initial operational review.' },
  { value: 'AWAITING_ASSIGNMENT', label: statusLabels.AWAITING_ASSIGNMENT, tone: statusTone.AWAITING_ASSIGNMENT, description: 'The lead is ready but has not yet been assigned to an advisor.' },
  { value: 'ASSIGNED', label: statusLabels.ASSIGNED, tone: statusTone.ASSIGNED, description: 'An advisor owns the student workflow and active follow-up.' },
  { value: 'FOLLOW_UP', label: statusLabels.FOLLOW_UP, tone: statusTone.FOLLOW_UP, description: 'The student requires a scheduled or active follow-up from the advisor.' },
  { value: 'APPLICATION_STARTED', label: statusLabels.APPLICATION_STARTED, tone: statusTone.APPLICATION_STARTED, description: 'The student has moved into an active school application workflow.' },
  { value: 'COMPLETED', label: statusLabels.COMPLETED, tone: statusTone.COMPLETED, description: 'The placement workflow is complete and no further operational action is pending.' },
  { value: 'CLOSED', label: statusLabels.CLOSED, tone: statusTone.CLOSED, description: 'The lead is closed and no further action will be taken.' },
]

const followUpStatusTone: Record<FollowUpStatus, BadgeTone> = {
  PENDING: 'brand',
  OVERDUE: 'error',
  COMPLETED: 'success',
  CANCELED: 'neutral',
}

const statusChangeSourceLabels: Record<StudentStatusChangeSource, string> = {
  LEAD_CREATED: 'Lead created',
  MANUAL: 'Updated manually',
  ADVISOR_ASSIGNED: 'Advisor assigned',
  ADVISOR_UNASSIGNED: 'Advisor unassigned',
  FOLLOW_UP_CREATED: 'Follow-up scheduled',
  APPLICATION_CREATED: 'Application started',
}

const RECENT_HISTORY_LIMIT = 5

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })

const formatIntake = (studyMonth: string | null, year: number | null) =>
  studyMonth && year ? `${studyMonth.charAt(0)}${studyMonth.slice(1).toLowerCase()} ${year}` : 'Not specified'

const StudentDetailPage = () => {
  const { studentId } = useParams()
  const currentUser = useAuthStore((state) => state.user)
  const isAdmin = currentUser?.role === 'ADMIN'

  const { data: student, isLoading, isError, error } = useStudent(studentId)
  const { data: advisors } = useAdvisorProfiles()
  const assignAdvisor = useAssignStudentAdvisor(studentId)
  const updateStatus = useUpdateStudentStatus(studentId)

  const { data: notesResult } = useNotes(studentId)
  const createNote = useCreateNote(studentId)
  const deleteNote = useDeleteNote(studentId)

  const { data: followUpsResult } = useFollowUps(studentId, {})
  const createFollowUp = useCreateFollowUp(studentId)
  const completeFollowUp = useCompleteFollowUp(studentId)
  const cancelFollowUp = useCancelFollowUp(studentId)

  const { data: statusHistory } = useStudentStatusHistory(studentId)
  const { data: applicationsResult } = useStudentApplications(studentId)

  const [isCreateApplicationOpen, setIsCreateApplicationOpen] = useState(false)
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null)
  const [isAdvisorModalOpen, setIsAdvisorModalOpen] = useState(false)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [quickEntryMode, setQuickEntryMode] = useState<QuickEntryMode>('note')
  const [isQuickEntryModalOpen, setIsQuickEntryModalOpen] = useState(false)

  const notes = notesResult?.notes ?? []
  const followUps = followUpsResult?.followUps ?? []
  const applications = applicationsResult?.applications ?? []
  const recentStatusChanges = (statusHistory ?? []).slice(0, RECENT_HISTORY_LIMIT)

  const currentStatusIndex = student ? STATUS_FLOW.indexOf(student.status) : -1

  const openQuickEntry = (mode: QuickEntryMode) => {
    setQuickEntryMode(mode)
    setIsQuickEntryModalOpen(true)
  }

  const saveQuickEntry = (entry: QuickEntryResult) => {
    if (entry.mode === 'note') {
      createNote.mutate(entry.body, { onSuccess: () => setIsQuickEntryModalOpen(false) })
      return
    }

    createFollowUp.mutate(
      { dueAt: entry.dueAt, priority: entry.priority, description: entry.description },
      { onSuccess: () => setIsQuickEntryModalOpen(false) },
    )
  }

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="animate-spin text-[#045A58]" size={32} />
        </div>
      </AppShell>
    )
  }

  if (isError || !student) {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
          <AlertCircle className="text-[#DC2626]" size={28} />
          <p className="text-sm text-[#6B7280]">
            {isAxiosError<ApiErrorResponse>(error)
              ? (error.response?.data.error.message ?? 'Failed to load this student')
              : 'Failed to load this student'}
          </p>
          <Link className="text-sm font-semibold text-[#045A58] hover:text-[#034A48]" to="/students">
            Back to Students / Leads
          </Link>
        </div>
      </AppShell>
    )
  }

  const fullName = `${student.contact.firstName} ${student.contact.lastName ?? ''}`.trim()
  const initials = `${student.contact.firstName[0] ?? ''}${student.contact.lastName?.[0] ?? ''}`.toUpperCase()

  const profileItems = [
    { label: 'Email', value: student.contact.email ?? 'Not provided', icon: Mail },
    { label: 'Phone', value: student.contact.phone ?? 'Not provided', icon: Phone },
    { label: 'Student ID', value: student.publicId, icon: SlidersHorizontal },
    { label: 'Advisor', value: student.assignedAdvisor?.fullName ?? 'Unassigned', icon: UserRoundCheck },
  ] as const

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <Link
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#045A58] transition hover:text-[#034A48]"
              to="/students"
            >
              <ArrowLeft size={16} />
              Students / Leads
            </Link>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-normal text-[#111827]">{fullName || 'Unnamed lead'}</h1>
              <Badge tone={statusTone[student.status]}>{statusLabels[student.status]}</Badge>
              <Badge tone="neutral">{student.publicId}</Badge>
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6B7280]">
              Student profile, advisor assignment, workflow status, applications, notes, and follow-ups.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {isAdmin ? (
              <Button
                leftIcon={<UserRoundCheck size={17} />}
                onClick={() => setIsAdvisorModalOpen(true)}
                size="md"
                variant="secondary"
              >
                {student.assignedAdvisor ? 'Reassign advisor' : 'Assign advisor'}
              </Button>
            ) : null}
            <Button leftIcon={<SlidersHorizontal size={17} />} onClick={() => setIsStatusModalOpen(true)} size="md">
              Update status
            </Button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
          <div className="space-y-6">
            <Card>
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-[#E6F4F3] text-lg font-semibold text-[#045A58]">
                  {initials || '—'}
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-[#111827]">Basic profile</h2>
                  <p className="mt-1 text-sm leading-6 text-[#6B7280]">
                    {student.studyLevel ?? 'Study level not specified'} applicant for{' '}
                    {formatIntake(student.targetIntakeMonth, student.targetIntakeYear)}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {profileItems.map((item) => {
                  const Icon = item.icon

                  return (
                    <div className="flex items-start gap-3" key={item.label}>
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F3F4F6] text-[#045A58]">
                        <Icon size={17} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-normal text-[#9CA3AF]">
                          {item.label}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-[#111827]">{item.value}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>

            <Card>
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-[#111827]">Workflow status</h2>
                  <p className="mt-1 text-sm text-[#6B7280]">{statusLabels[student.status]}</p>
                </div>
                <button
                  aria-label="Update student workflow status"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#045A58] outline-none transition hover:bg-[#E6F4F3] focus:ring-4 focus:ring-[#E6F4F3]"
                  onClick={() => setIsStatusModalOpen(true)}
                  title="Update status"
                  type="button"
                >
                  <SlidersHorizontal size={18} />
                </button>
              </div>

              {student.status === 'CLOSED' ? (
                <div className="rounded-2xl border border-[#E5E7EB] p-4 text-sm text-[#6B7280]">
                  This lead is closed. Update the status to reopen the workflow.
                </div>
              ) : (
                <div className="space-y-3">
                  {STATUS_FLOW.map((step, index) => {
                    const stepState = index < currentStatusIndex ? 'Done' : index === currentStatusIndex ? 'Current' : 'Pending'

                    return (
                      <div
                        className="flex items-center justify-between gap-4 rounded-2xl border border-[#E5E7EB] p-3"
                        key={step}
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle2
                            className={stepState === 'Pending' ? 'text-[#9CA3AF]' : 'text-[#045A58]'}
                            size={18}
                          />
                          <span className="text-sm font-semibold text-[#111827]">{statusLabels[step]}</span>
                        </div>
                        <Badge tone={stepState === 'Current' ? 'brand' : stepState === 'Done' ? 'success' : 'neutral'}>
                          {stepState}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              )}

              <div className="mt-6 border-t border-[#E5E7EB] pt-5">
                <h3 className="text-sm font-semibold text-[#111827]">Recent changes</h3>
                {recentStatusChanges.length ? (
                  <ol className="mt-3 space-y-3">
                    {recentStatusChanges.map((entry, index) => (
                      <li className="flex gap-3" key={`${entry.toStatus}-${entry.changedAt}-${index}`}>
                        <Clock3 className="mt-0.5 shrink-0 text-[#9CA3AF]" size={15} />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#111827]">
                            {statusLabels[entry.toStatus]}
                            {entry.fromStatus ? (
                              <span className="font-normal text-[#6B7280]"> from {statusLabels[entry.fromStatus]}</span>
                            ) : null}
                          </p>
                          <p className="mt-0.5 text-xs text-[#6B7280]">
                            {statusChangeSourceLabels[entry.source]} · {entry.changedBy?.fullName ?? 'System'} ·{' '}
                            {formatDateTime(entry.changedAt)}
                          </p>
                          {entry.note ? <p className="mt-1 text-sm leading-5 text-[#4B5563]">{entry.note}</p> : null}
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="mt-2 text-xs leading-5 text-[#6B7280]">
                    No recorded changes yet. Status changes are tracked from now on.
                  </p>
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <Card>
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E6F4F3] text-[#045A58]">
                  <School size={19} />
                </div>
                <p className="text-sm font-medium text-[#6B7280]">Destination</p>
                <p className="mt-2 text-lg font-semibold text-[#111827]">
                  {student.targetDestinations.length ? student.targetDestinations.join(', ') : 'Not specified'}
                </p>
              </Card>
              <Card>
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E6F4F3] text-[#045A58]">
                  <BookOpen size={19} />
                </div>
                <p className="text-sm font-medium text-[#6B7280]">Study level</p>
                <p className="mt-2 text-lg font-semibold text-[#111827]">{student.studyLevel ?? 'Not specified'}</p>
              </Card>
              <Card>
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E6F4F3] text-[#045A58]">
                  <GraduationCap size={19} />
                </div>
                <p className="text-sm font-medium text-[#6B7280]">Budget and intake</p>
                <p className="mt-2 text-lg font-semibold text-[#111827]">
                  {formatIntake(student.targetIntakeMonth, student.targetIntakeYear)}
                </p>
                <p className="mt-1 text-sm text-[#6B7280]">{student.budgetRange ?? 'Budget not specified'}</p>
              </Card>
            </div>

            <Card>
              <h2 className="text-lg font-semibold text-[#111827]">Academic background</h2>
              <div className="mt-5 space-y-4">
                <div className="flex items-start justify-between gap-4 border-b border-[#E5E7EB] pb-3">
                  <p className="text-sm font-medium text-[#6B7280]">English test</p>
                  <p className="max-w-[60%] text-right text-sm font-semibold text-[#111827]">
                    {student.englishTestScore ?? 'Not provided'}
                  </p>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <p className="text-sm font-medium text-[#6B7280]">Background</p>
                  <p className="max-w-[60%] text-right text-sm leading-6 text-[#111827]">
                    {student.academicBackground ?? 'Not provided'}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <Card>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#111827]">Applications</h2>
              <p className="mt-1 text-sm text-[#6B7280]">School applications for this student, newest first.</p>
            </div>
            <Button leftIcon={<FilePlus2 size={17} />} onClick={() => setIsCreateApplicationOpen(true)} size="md">
              New application
            </Button>
          </div>

          {applications.length ? (
            <div className="divide-y divide-[#E5E7EB] rounded-2xl border border-[#E5E7EB]">
              {applications.map((application) => (
                <button
                  className="flex w-full flex-col gap-3 p-4 text-left outline-none transition hover:bg-[#F9FAFB] focus:bg-[#F9FAFB] sm:flex-row sm:items-center sm:justify-between"
                  key={application.publicId}
                  onClick={() => setSelectedApplicationId(application.publicId)}
                  type="button"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#111827]">{application.program.name}</p>
                    <p className="mt-1 truncate text-xs text-[#6B7280]">
                      {application.school.name} · {application.school.country} ·{' '}
                      {application.intake
                        ? formatIntakeLabel(application.intake.month, application.intake.year)
                        : 'No intake selected'}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-xs text-[#9CA3AF]">{application.publicId}</span>
                    <Badge tone={applicationStatusTone[application.status]}>
                      {applicationStatusLabels[application.status]}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#D1D5DB] bg-[#F9FAFB] px-4 py-6 text-center">
              <FileCheck2 className="mx-auto text-[#9CA3AF]" size={20} />
              <p className="mt-2 text-sm font-medium text-[#374151]">No applications yet</p>
              <button
                className="mt-2 text-sm font-semibold text-[#045A58] outline-none hover:text-[#034A48] focus:underline"
                onClick={() => setIsCreateApplicationOpen(true)}
                type="button"
              >
                Start the first application
              </button>
            </div>
          )}
        </Card>

        <Card>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#111827]">Advisor notes and follow-ups</h2>
              <p className="mt-1 text-sm text-[#6B7280]">Internal notes and scheduled advisor actions.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                leftIcon={<CalendarPlus size={17} />}
                onClick={() => openQuickEntry('follow-up')}
                size="md"
                variant="secondary"
              >
                Schedule follow-up
              </Button>
              <Button leftIcon={<MessageSquareText size={17} />} onClick={() => openQuickEntry('note')} size="md">
                Add note
              </Button>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_0.72fr]">
            <div className="space-y-3">
              {notes.length ? (
                notes.map((note) => (
                  <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4" key={note.publicId}>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="text-xs font-medium text-[#6B7280]">{formatDateTime(note.createdAt)}</p>
                      <button
                        aria-label="Delete note"
                        className="text-[#9CA3AF] transition hover:text-[#DC2626]"
                        onClick={() => deleteNote.mutate(note.publicId)}
                        type="button"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[#374151]">{note.body}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-[#D1D5DB] bg-[#F9FAFB] px-4 py-6 text-center">
                  <MessageSquareText className="mx-auto text-[#9CA3AF]" size={20} />
                  <p className="mt-2 text-sm font-medium text-[#374151]">No notes yet</p>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-[#E5E7EB] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-[#111827]">Scheduled follow-ups</h3>
                  <p className="mt-1 text-xs leading-5 text-[#6B7280]">Upcoming advisor actions for this student.</p>
                </div>
                <Badge tone={followUps.length ? 'warning' : 'neutral'}>{followUps.length}</Badge>
              </div>

              {followUps.length ? (
                <div className="mt-4 space-y-3">
                  {followUps.map((followUp) => (
                    <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-3" key={followUp.publicId}>
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <Badge tone={followUpStatusTone[followUp.status]}>{followUp.status}</Badge>
                        <span className="text-xs font-semibold text-[#374151]">{followUp.priority}</span>
                      </div>
                      <p className="mt-2 text-xs font-medium text-[#045A58]">Due {formatDateTime(followUp.dueAt)}</p>
                      <p className="mt-2 text-sm leading-5 text-[#4B5563]">{followUp.description}</p>
                      {followUp.status === 'PENDING' || followUp.status === 'OVERDUE' ? (
                        <div className="mt-3 flex gap-2">
                          <Button
                            leftIcon={<CheckCircle2 size={14} />}
                            onClick={() => completeFollowUp.mutate(followUp.publicId)}
                            size="sm"
                            variant="secondary"
                          >
                            Mark complete
                          </Button>
                          <Button
                            leftIcon={<X size={14} />}
                            onClick={() => cancelFollowUp.mutate(followUp.publicId)}
                            size="sm"
                            variant="secondary"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-dashed border-[#D1D5DB] bg-[#F9FAFB] px-4 py-6 text-center">
                  <CalendarPlus className="mx-auto text-[#9CA3AF]" size={20} />
                  <p className="mt-2 text-sm font-medium text-[#374151]">No follow-up scheduled</p>
                  <button
                    className="mt-2 text-sm font-semibold text-[#045A58] outline-none hover:text-[#034A48] focus:underline"
                    onClick={() => openQuickEntry('follow-up')}
                    type="button"
                  >
                    Schedule the next action
                  </button>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {isAdmin ? (
        <AssignAdvisorModal
          advisors={advisors ?? []}
          currentAdvisorId={student.assignedAdvisor?.publicId ?? null}
          isOpen={isAdvisorModalOpen}
          onAssign={(advisorId) => {
            assignAdvisor.mutate(advisorId, { onSuccess: () => setIsAdvisorModalOpen(false) })
          }}
          onClose={() => setIsAdvisorModalOpen(false)}
          studentName={fullName || student.publicId}
        />
      ) : null}
      <UpdateWorkflowStatusModal
        currentStatus={statusLabels[student.status]}
        entityName={fullName || student.publicId}
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onUpdate={(status, note) => {
          const option = statusOptions.find((candidate) => candidate.label === status.label)
          if (!option) return
          updateStatus.mutate(
            { status: option.value, note: note || undefined },
            { onSuccess: () => setIsStatusModalOpen(false) },
          )
        }}
        options={statusOptions}
        workflowLabel="Student workflow"
      />
      <QuickStudentEntryModal
        isOpen={isQuickEntryModalOpen}
        isSaving={createNote.isPending || createFollowUp.isPending}
        mode={quickEntryMode}
        onClose={() => setIsQuickEntryModalOpen(false)}
        onSave={saveQuickEntry}
        studentName={fullName || student.publicId}
      />
      <CreateApplicationModal
        isOpen={isCreateApplicationOpen}
        onClose={() => setIsCreateApplicationOpen(false)}
        studentId={student.publicId}
        studentName={fullName || student.publicId}
      />
      <ApplicationDetailModal
        applicationId={selectedApplicationId}
        onClose={() => setSelectedApplicationId(null)}
      />
    </AppShell>
  )
}

export default StudentDetailPage
