import { AlertCircle, CheckCircle2, Loader2, Pencil, SlidersHorizontal } from 'lucide-react'
import { useEffect, useState } from 'react'
import { isAxiosError } from 'axios'
import { Link } from 'react-router-dom'
import Badge from '../ui/Badge.js'
import Button from '../ui/Button.js'
import Input from '../ui/Input.js'
import Modal from '../ui/Modal.js'
import UpdateWorkflowStatusModal, { type WorkflowStatusOption } from './UpdateWorkflowStatusModal.js'
import type { ApiErrorResponse } from '../../lib/api/types.js'
import type { IntakeMonth } from '../../features/programs/programs.api.js'
import { useProgram } from '../../features/programs/usePrograms.js'
import {
  useApplication,
  useUpdateApplication,
  useUpdateApplicationStatus,
} from '../../features/applications/useApplications.js'
import type { ApplicationStatus } from '../../features/applications/applications.api.js'
import {
  ALL_APPLICATION_STATUSES,
  applicationStatusDescriptions,
  applicationStatusLabels,
  applicationStatusTone,
  canTransition,
  formatIntakeLabel,
  isTerminal,
} from '../../features/applications/applicationStatus.js'

type ApplicationDetailModalProps = {
  applicationId: string | null
  onClose: () => void
}

type View = 'detail' | 'edit' | 'status'

const NO_INTAKE = ''

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })

const errorMessageOf = (error: unknown, fallback: string) =>
  isAxiosError<ApiErrorResponse>(error) ? (error.response?.data.error.message ?? fallback) : fallback

const ApplicationDetailModal = ({ applicationId, onClose }: ApplicationDetailModalProps) => {
  const [view, setView] = useState<View>('detail')
  const [intakeKey, setIntakeKey] = useState(NO_INTAKE)
  const [externalReference, setExternalReference] = useState('')
  const [notes, setNotes] = useState('')

  const { data: application, isLoading, isError, error } = useApplication(applicationId)
  const updateApplication = useUpdateApplication(applicationId)
  const updateStatus = useUpdateApplicationStatus(applicationId)

  // The program's stored intakes feed the edit dropdown — only fetched while editing.
  const { data: program } = useProgram(application?.program.publicId, view === 'edit')
  const programIntakes = program?.intakes ?? []

  useEffect(() => {
    if (applicationId) {
      setView('detail')
      updateApplication.reset()
      updateStatus.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId])

  const openEdit = () => {
    if (!application) return
    setIntakeKey(application.intake ? `${application.intake.month}-${application.intake.year}` : NO_INTAKE)
    setExternalReference(application.externalReference ?? '')
    setNotes(application.notes ?? '')
    updateApplication.reset()
    setView('edit')
  }

  const saveEdit = () => {
    const intake = programIntakes.find((item) => `${item.month}-${item.year}` === intakeKey)
    updateApplication.mutate(
      {
        intakeMonth: intake ? (intake.month as IntakeMonth) : null,
        intakeYear: intake ? intake.year : null,
        externalReference: externalReference.trim() || null,
        notes: notes.trim() || null,
      },
      { onSuccess: () => setView('detail') },
    )
  }

  if (!applicationId) return null

  // Status change reuses the shared workflow modal, offering only the statuses
  // the forward-only rule allows from the current one.
  if (view === 'status' && application) {
    const statusOptions: (WorkflowStatusOption & { value: ApplicationStatus })[] = ALL_APPLICATION_STATUSES.filter(
      (status) => canTransition(application.status, status),
    ).map((status) => ({
      value: status,
      label: applicationStatusLabels[status],
      tone: applicationStatusTone[status],
      description: applicationStatusDescriptions[status],
    }))

    return (
      <UpdateWorkflowStatusModal
        currentStatus={applicationStatusLabels[application.status]}
        entityName={`${application.program.name} (${application.publicId})`}
        isOpen
        onClose={() => setView('detail')}
        onUpdate={(option, note) => {
          const selected = statusOptions.find((candidate) => candidate.label === option.label)
          if (!selected) return
          updateStatus.mutate(
            { status: selected.value, note: note || undefined },
            { onSuccess: () => setView('detail'), onError: () => setView('detail') },
          )
        }}
        options={statusOptions}
        workflowLabel="Application status"
      />
    )
  }

  const studentName = application
    ? `${application.student.firstName} ${application.student.lastName ?? ''}`.trim()
    : ''

  return (
    <Modal
      {...(application && { description: `${application.publicId} · ${studentName}` })}
      isOpen
      onClose={onClose}
      size="lg"
      title={view === 'edit' ? 'Edit application' : 'Application'}
    >
      <div className="max-h-[560px] overflow-y-auto px-5 py-5 sm:px-6">
        {isLoading ? (
          <div className="flex min-h-48 items-center justify-center">
            <Loader2 className="animate-spin text-[#045A58]" size={26} />
          </div>
        ) : isError || !application ? (
          <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-center">
            <AlertCircle className="text-[#DC2626]" size={24} />
            <p className="text-sm text-[#6B7280]">{errorMessageOf(error, 'Failed to load this application')}</p>
          </div>
        ) : view === 'edit' ? (
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#111827]" htmlFor="edit-application-intake">
                Intake
              </label>
              <select
                className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm font-medium text-[#374151] outline-none transition focus:border-[#045A58] focus:ring-4 focus:ring-[#E6F4F3]"
                id="edit-application-intake"
                onChange={(event) => setIntakeKey(event.target.value)}
                value={intakeKey}
              >
                <option value={NO_INTAKE}>No intake selected</option>
                {programIntakes.map((intake) => (
                  <option key={`${intake.month}-${intake.year}`} value={`${intake.month}-${intake.year}`}>
                    {formatIntakeLabel(intake.month, intake.year)}
                    {intake.applicationDeadline ? ` — deadline ${formatDate(intake.applicationDeadline)}` : ''}
                  </option>
                ))}
              </select>
            </div>
            <Input
              id="edit-application-reference"
              label="School reference"
              maxLength={100}
              onChange={(event) => setExternalReference(event.target.value)}
              placeholder="The school's own application number"
              value={externalReference}
            />
            <div>
              <label className="block text-sm font-medium text-[#111827]" htmlFor="edit-application-notes">
                Notes
              </label>
              <textarea
                className="mt-2 min-h-24 w-full resize-y rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm leading-6 text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#045A58] focus:ring-4 focus:ring-[#E6F4F3]"
                id="edit-application-notes"
                maxLength={5000}
                onChange={(event) => setNotes(event.target.value)}
                value={notes}
              />
            </div>
            {updateApplication.isError ? (
              <p className="text-sm text-[#991B1B]">
                {errorMessageOf(updateApplication.error, 'Failed to save changes')}
              </p>
            ) : null}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-[#111827]">{application.program.name}</p>
                <p className="mt-1 text-sm text-[#6B7280]">
                  {application.school.name} · {application.school.country}
                </p>
                <Link
                  className="mt-2 inline-block text-sm font-semibold text-[#045A58] hover:text-[#034A48]"
                  onClick={onClose}
                  to={`/students/${application.student.publicId}`}
                >
                  {studentName || application.student.publicId}
                </Link>
              </div>
              <Badge tone={applicationStatusTone[application.status]}>
                {applicationStatusLabels[application.status]}
              </Badge>
            </div>

            <dl className="grid gap-4 sm:grid-cols-2">
              <DetailItem
                label="Intake"
                value={
                  application.intake
                    ? formatIntakeLabel(application.intake.month, application.intake.year)
                    : 'Not selected'
                }
              />
              <DetailItem
                label="Application deadline"
                value={
                  application.intake?.applicationDeadline
                    ? formatDate(application.intake.applicationDeadline)
                    : 'Not on record'
                }
              />
              <DetailItem label="School reference" value={application.externalReference ?? 'Not provided'} />
              <DetailItem label="Created by" value={application.createdBy.fullName} />
            </dl>

            {application.notes ? (
              <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                <p className="text-xs font-semibold uppercase tracking-normal text-[#9CA3AF]">Notes</p>
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#374151]">{application.notes}</p>
              </div>
            ) : null}

            <div>
              <h3 className="text-sm font-semibold text-[#111827]">Status history</h3>
              <ol className="mt-3 space-y-3">
                {application.history.map((entry, index) => (
                  <li className="flex gap-3" key={`${entry.toStatus}-${entry.changedAt}-${index}`}>
                    <CheckCircle2 className="mt-0.5 shrink-0 text-[#045A58]" size={17} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#111827]">
                        {entry.fromStatus
                          ? `${applicationStatusLabels[entry.fromStatus]} → ${applicationStatusLabels[entry.toStatus]}`
                          : `Created as ${applicationStatusLabels[entry.toStatus]}`}
                      </p>
                      <p className="mt-0.5 text-xs text-[#6B7280]">
                        {entry.changedBy?.fullName ?? 'System'} · {formatDateTime(entry.changedAt)}
                      </p>
                      {entry.note ? <p className="mt-1 text-sm leading-5 text-[#4B5563]">{entry.note}</p> : null}
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {updateStatus.isError ? (
              <div className="flex items-start gap-3 rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-4">
                <AlertCircle className="mt-0.5 shrink-0 text-[#DC2626]" size={18} />
                <p className="text-sm leading-5 text-[#991B1B]">
                  {errorMessageOf(updateStatus.error, 'Failed to update the status')}
                </p>
              </div>
            ) : null}

            {isTerminal(application.status) ? (
              <p className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 text-sm text-[#6B7280]">
                This application is {applicationStatusLabels[application.status].toLowerCase()} and can no longer
                be changed.
              </p>
            ) : null}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 border-t border-[#E5E7EB] px-5 py-4 sm:px-6">
        {view === 'edit' ? (
          <>
            <Button onClick={() => setView('detail')} size="md" variant="secondary">
              Back
            </Button>
            <Button disabled={updateApplication.isPending} onClick={saveEdit} size="md">
              {updateApplication.isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </>
        ) : (
          <>
            <Button onClick={onClose} size="md" variant="secondary">
              Close
            </Button>
            {application && !isTerminal(application.status) ? (
              <>
                <Button leftIcon={<Pencil size={15} />} onClick={openEdit} size="md" variant="secondary">
                  Edit details
                </Button>
                <Button
                  disabled={updateStatus.isPending}
                  leftIcon={<SlidersHorizontal size={16} />}
                  onClick={() => {
                    updateStatus.reset()
                    setView('status')
                  }}
                  size="md"
                >
                  Change status
                </Button>
              </>
            ) : null}
          </>
        )}
      </div>
    </Modal>
  )
}

const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <div>
    <dt className="text-xs font-semibold uppercase tracking-normal text-[#9CA3AF]">{label}</dt>
    <dd className="mt-1 text-sm font-semibold text-[#111827]">{value}</dd>
  </div>
)

export default ApplicationDetailModal
