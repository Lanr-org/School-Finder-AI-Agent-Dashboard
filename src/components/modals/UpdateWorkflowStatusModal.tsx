import { Check, ClipboardList } from 'lucide-react'
import { useEffect, useState } from 'react'
import Badge from '../ui/Badge.js'
import Button from '../ui/Button.js'
import Modal from '../ui/Modal.js'

type StatusTone = 'brand' | 'error' | 'neutral' | 'success' | 'warning'

type WorkflowStatusOption = {
  description: string
  label: string
  tone: StatusTone
}

type UpdateWorkflowStatusModalProps = {
  currentStatus: string
  entityName: string
  errorMessage?: string | null | undefined
  isOpen: boolean
  isSaving?: boolean | undefined
  onClose: () => void
  onUpdate: (status: WorkflowStatusOption, note: string) => void
  options: WorkflowStatusOption[]
  workflowLabel: string
}

const UpdateWorkflowStatusModal = ({
  currentStatus,
  entityName,
  errorMessage,
  isOpen,
  isSaving = false,
  onClose,
  onUpdate,
  options,
  workflowLabel,
}: UpdateWorkflowStatusModalProps) => {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus)
  const [note, setNote] = useState('')

  useEffect(() => {
    if (isOpen) {
      setSelectedStatus(currentStatus)
      setNote('')
    }
  }, [currentStatus, isOpen])

  const selectedOption = options.find((option) => option.label === selectedStatus)
  const statusChanged = selectedStatus !== currentStatus

  return (
    <Modal
      description={`Change the ${workflowLabel.toLowerCase()} for ${entityName}. This update will be visible across the operational workspace.`}
      isOpen={isOpen}
      onClose={() => (isSaving ? undefined : onClose())}
      size="lg"
      title="Update workflow status"
    >
      <div className="max-h-[460px] overflow-y-auto px-5 py-5 sm:px-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-[#9CA3AF]">Current status</p>
            <p className="mt-1 text-sm font-semibold text-[#111827]">{currentStatus}</p>
          </div>
          <Badge tone={options.find((option) => option.label === currentStatus)?.tone ?? 'neutral'}>
            {workflowLabel}
          </Badge>
        </div>

        <fieldset>
          <legend className="text-sm font-semibold text-[#111827]">Select the new status</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {options.map((option) => {
              const isSelected = selectedStatus === option.label
              const isCurrent = currentStatus === option.label

              return (
                <label
                  className={`cursor-pointer rounded-xl border p-4 transition ${
                    isSelected
                      ? 'border-[#2B4BFF] bg-[#F5F7FF] ring-1 ring-[#2B4BFF]'
                      : 'border-[#E5E7EB] bg-white hover:border-[#C2CBFF] hover:bg-[#F9FAFB]'
                  }`}
                  key={option.label}
                >
                  <input
                    checked={isSelected}
                    className="sr-only"
                    name="workflowStatus"
                    onChange={() => setSelectedStatus(option.label)}
                    type="radio"
                    value={option.label}
                  />
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-[#111827]">{option.label}</p>
                        {isCurrent ? <Badge tone="neutral">Current</Badge> : null}
                      </div>
                      <p className="mt-2 text-sm leading-5 text-[#6B7280]">{option.description}</p>
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
                  <div className="mt-3">
                    <Badge tone={option.tone}>{option.label}</Badge>
                  </div>
                </label>
              )
            })}
          </div>
        </fieldset>

        <div className="mt-5">
          <label className="block text-sm font-medium text-[#111827]" htmlFor="workflow-status-note">
            Internal note <span className="font-normal text-[#9CA3AF]">(optional)</span>
          </label>
          <textarea
            className="mt-2 min-h-24 w-full resize-y rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm leading-6 text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#2B4BFF] focus:ring-4 focus:ring-[#ECEFFF]"
            id="workflow-status-note"
            onChange={(event) => setNote(event.target.value)}
            placeholder="Add context for this status change."
            value={note}
          />
        </div>

        {selectedOption && statusChanged ? (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#C2CBFF] bg-[#F5F7FF] p-4">
            <ClipboardList className="mt-0.5 shrink-0 text-[#2B4BFF]" size={18} />
            <div>
              <p className="text-sm font-semibold text-[#111827]">
                Status will change to {selectedOption.label}
              </p>
              <p className="mt-1 text-sm leading-5 text-[#525866]">{selectedOption.description}</p>
            </div>
          </div>
        ) : null}

        {errorMessage ? (
          <p className="mt-5 rounded-xl border border-[#F7C9C5] bg-[#FEF3F2] px-4 py-3 text-sm text-[#B42318]" role="alert">
            {errorMessage}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-[#E5E7EB] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-xs leading-5 text-[#6B7280]">
          The change and the optional note are saved to the status history.
        </p>
        <div className="flex shrink-0 justify-end gap-3">
          <Button disabled={isSaving} onClick={onClose} size="md" variant="secondary">
            Cancel
          </Button>
          <Button
            disabled={!statusChanged || !selectedOption || isSaving}
            leftIcon={<ClipboardList size={16} />}
            onClick={() => {
              if (selectedOption) {
                onUpdate(selectedOption, note.trim())
              }
            }}
            size="md"
          >
            {isSaving ? 'Updating…' : 'Update status'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export type { WorkflowStatusOption }
export default UpdateWorkflowStatusModal
