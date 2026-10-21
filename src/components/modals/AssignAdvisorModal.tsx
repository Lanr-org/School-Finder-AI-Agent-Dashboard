import { Check, Search, UserRoundCheck, Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Badge from '../ui/Badge.js'
import Button from '../ui/Button.js'
import Input from '../ui/Input.js'
import Modal from '../ui/Modal.js'
import type { AdvisorAvailability, AdvisorProfile } from '../../features/advisors/advisors.api.js'

type AssignAdvisorModalProps = {
  advisors: AdvisorProfile[]
  currentAdvisorId: string | null
  errorMessage?: string | null | undefined
  isOpen: boolean
  isSaving?: boolean | undefined
  onAssign: (advisorId: string) => void
  onClose: () => void
  studentName: string
}

const availabilityTone: Record<AdvisorAvailability, 'error' | 'success' | 'warning'> = {
  AVAILABLE: 'success',
  LIMITED: 'warning',
  UNAVAILABLE: 'error',
}

const availabilityLabels: Record<AdvisorAvailability, string> = {
  AVAILABLE: 'Available',
  LIMITED: 'Limited',
  UNAVAILABLE: 'Unavailable',
}

const AssignAdvisorModal = ({
  advisors,
  currentAdvisorId,
  errorMessage,
  isOpen,
  isSaving = false,
  onAssign,
  onClose,
  studentName,
}: AssignAdvisorModalProps) => {
  const [query, setQuery] = useState('')
  const [selectedAdvisorId, setSelectedAdvisorId] = useState(currentAdvisorId ?? '')

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedAdvisorId(currentAdvisorId ?? '')
    }
  }, [currentAdvisorId, isOpen])

  const filteredAdvisors = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    // Only ACTIVE accounts can be assigned (the API refuses the rest). Search matches name or email.
    return advisors.filter(
      (advisor) =>
        advisor.status === 'ACTIVE' &&
        (!normalizedQuery ||
          advisor.fullName.toLowerCase().includes(normalizedQuery) ||
          advisor.email.toLowerCase().includes(normalizedQuery)),
    )
  }, [advisors, query])

  const selectedAdvisor = advisors.find((advisor) => advisor.advisorId === selectedAdvisorId)
  const assignmentChanged = Boolean(selectedAdvisor && selectedAdvisor.advisorId !== currentAdvisorId)

  return (
    <Modal
      description={`Choose the advisor who should own ${studentName}'s follow-ups, conversations, and recommendation workflow.`}
      isOpen={isOpen}
      onClose={() => (isSaving ? undefined : onClose())}
      size="lg"
      title={currentAdvisorId ? 'Reassign advisor' : 'Assign advisor'}
    >
      <div className="border-b border-[#E5E7EB] px-5 py-4 sm:px-6">
        <Input
          className="h-11 bg-[#F9FAFB]"
          id="advisor-assignment-search"
          leftIcon={<Search size={17} />}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search advisor by name or email"
          type="search"
          value={query}
        />
      </div>

      <div className="max-h-[430px] overflow-y-auto px-5 py-4 sm:px-6">
        {filteredAdvisors.length ? (
          <div className="space-y-3">
            {filteredAdvisors.map((advisor) => {
              const isSelected = selectedAdvisorId === advisor.advisorId
              const isCurrent = currentAdvisorId === advisor.advisorId
              const isOverCapacity =
                advisor.maxCapacity !== null && advisor.activeStudentCount >= advisor.maxCapacity
              const isUnavailable = advisor.availability === 'UNAVAILABLE'
              const isDisabled = (isUnavailable || isOverCapacity) && !isCurrent
              const workloadPercentage =
                advisor.maxCapacity === null
                  ? 0
                  : Math.min(Math.round((advisor.activeStudentCount / advisor.maxCapacity) * 100), 100)

              return (
                <button
                  aria-pressed={isSelected}
                  className={`w-full rounded-xl border p-4 text-left outline-none transition focus:ring-4 focus:ring-[#ECEFFF] ${
                    isSelected
                      ? 'border-[#2B4BFF] bg-[#F5F7FF] ring-1 ring-[#2B4BFF]'
                      : isDisabled
                        ? 'cursor-not-allowed border-[#E5E7EB] bg-[#F9FAFB] opacity-65'
                        : 'border-[#E5E7EB] bg-white hover:border-[#C2CBFF] hover:bg-[#F9FAFB]'
                  }`}
                  disabled={isDisabled}
                  key={advisor.advisorId}
                  onClick={() => setSelectedAdvisorId(advisor.advisorId)}
                  type="button"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ECEFFF] text-sm font-semibold text-[#2B4BFF]">
                      {advisor.fullName
                        .split(' ')
                        .map((name) => name[0])
                        .join('')
                        .slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-[#111827]">{advisor.fullName}</p>
                        <Badge tone={availabilityTone[advisor.availability]}>
                          {availabilityLabels[advisor.availability]}
                        </Badge>
                        {isCurrent ? <Badge tone="brand">Current</Badge> : null}
                      </div>
                      <p className="mt-0.5 truncate text-xs text-[#6B7280]">{advisor.email}</p>
                      <div className="mt-3">
                        <div className="flex items-center justify-between gap-3 text-xs">
                          <span className="font-medium text-[#6B7280]">
                            {advisor.activeStudentCount}
                            {advisor.maxCapacity === null ? ' active students (no limit)' : ` of ${advisor.maxCapacity} active students`}
                          </span>
                          {advisor.maxCapacity !== null ? (
                            <span className="font-semibold text-[#374151]">{workloadPercentage}%</span>
                          ) : null}
                        </div>
                        {advisor.maxCapacity !== null ? (
                          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#E5E7EB]">
                            <div
                              className={`h-full rounded-full ${
                                isOverCapacity
                                  ? 'bg-[#DC2626]'
                                  : workloadPercentage >= 85
                                    ? 'bg-[#D97706]'
                                    : 'bg-[#2B4BFF]'
                              }`}
                              style={{ width: `${workloadPercentage}%` }}
                            />
                          </div>
                        ) : null}
                        {isDisabled ? (
                          <p className="mt-2 text-xs font-medium text-[#B42318]">
                            {isUnavailable
                              ? 'Unavailable for new assignments'
                              : 'At capacity and unavailable for new assignments'}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        isSelected
                          ? 'border-[#2B4BFF] bg-[#2B4BFF] text-white'
                          : 'border-[#D1D5DB] text-transparent'
                      }`}
                    >
                      <Check size={13} strokeWidth={3} />
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="flex min-h-52 flex-col items-center justify-center text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#ECEFFF] text-[#2B4BFF]">
              <Users size={19} />
            </div>
            {!advisors.some((advisor) => advisor.status === 'ACTIVE') ? (
              <>
                <h3 className="mt-4 text-sm font-semibold text-[#111827]">No active advisors yet</h3>
                <p className="mt-1 max-w-sm text-sm text-[#6B7280]">
                  Advisors appear here once they accept their invitation.{' '}
                  <Link className="font-semibold text-[#2B4BFF]" to="/team/invite">
                    Invite an advisor
                  </Link>
                  .
                </p>
              </>
            ) : (
              <>
                <h3 className="mt-4 text-sm font-semibold text-[#111827]">No matching advisors</h3>
                <p className="mt-1 text-sm text-[#6B7280]">Try another name or email.</p>
              </>
            )}
          </div>
        )}
      </div>

      {errorMessage ? (
        <p className="mx-5 mb-4 rounded-xl border border-[#F7C9C5] bg-[#FEF3F2] px-4 py-3 text-sm text-[#B42318] sm:mx-6" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-3 border-t border-[#E5E7EB] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-xs leading-5 text-[#6B7280]">
          Assignment changes affect workflow ownership, not account permissions.
        </p>
        <div className="flex shrink-0 justify-end gap-3">
          <Button disabled={isSaving} onClick={onClose} size="md" variant="secondary">
            Cancel
          </Button>
          <Button
            disabled={!assignmentChanged || !selectedAdvisor || isSaving}
            leftIcon={<UserRoundCheck size={16} />}
            onClick={() => {
              if (selectedAdvisor) {
                onAssign(selectedAdvisor.advisorId)
              }
            }}
            size="md"
          >
            {isSaving ? 'Assigning…' : currentAdvisorId ? 'Reassign advisor' : 'Assign advisor'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default AssignAdvisorModal
