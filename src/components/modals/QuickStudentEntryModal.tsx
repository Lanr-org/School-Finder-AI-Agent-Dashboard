import { CalendarPlus, MessageSquareText, StickyNote } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import Badge from '../ui/Badge.js'
import Button from '../ui/Button.js'
import Input from '../ui/Input.js'
import Modal from '../ui/Modal.js'
import type { FollowUpPriority } from '../../features/followUps/followUps.api.js'

type QuickEntryMode = 'follow-up' | 'note'

type QuickEntryResult =
  | { mode: 'note'; body: string }
  | { mode: 'follow-up'; dueAt: string; priority: FollowUpPriority; description: string }

type QuickStudentEntryModalProps = {
  isOpen: boolean
  isSaving?: boolean
  mode: QuickEntryMode
  onClose: () => void
  onSave: (entry: QuickEntryResult) => void
  studentName: string
}

const getLocalDateTimeInputValue = () => {
  const now = new Date()
  const offset = now.getTimezoneOffset()
  return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 16)
}

const QuickStudentEntryModal = ({
  isOpen,
  isSaving = false,
  mode,
  onClose,
  onSave,
  studentName,
}: QuickStudentEntryModalProps) => {
  const [body, setBody] = useState('')
  const [dueAt, setDueAt] = useState('')
  const [priority, setPriority] = useState<FollowUpPriority>('NORMAL')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (!isOpen) return

    setBody('')
    setDueAt('')
    setPriority('NORMAL')
    setDescription('')
  }, [isOpen, mode])

  const isNote = mode === 'note'
  const canSave = isNote ? body.trim().length > 0 : dueAt.length > 0 && description.trim().length > 0

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSave) return

    if (isNote) {
      onSave({ mode: 'note', body: body.trim() })
      return
    }

    onSave({
      mode: 'follow-up',
      dueAt: new Date(dueAt).toISOString(),
      priority,
      description: description.trim(),
    })
  }

  return (
    <Modal
      description={
        isNote
          ? `Record internal advisor context for ${studentName}.`
          : `Create the next advisor action for ${studentName}.`
      }
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={isNote ? 'Add internal note' : 'Schedule follow-up'}
    >
      <form onSubmit={handleSubmit}>
        <div className="max-h-[520px] overflow-y-auto px-5 py-5 sm:px-6">
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-[#B9DAD8] bg-[#F2F9F8] p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E6F4F3] text-[#045A58]">
              {isNote ? <StickyNote size={18} /> : <CalendarPlus size={18} />}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-[#111827]">{studentName}</p>
                <Badge tone={isNote ? 'neutral' : 'warning'}>
                  {isNote ? 'Internal only' : 'Advisor action'}
                </Badge>
              </div>
              <p className="mt-1 text-sm leading-5 text-[#52605F]">
                {isNote
                  ? 'Notes support advisor handoffs and are never sent to the student.'
                  : 'The assigned advisor will see this item in their follow-up workload.'}
              </p>
            </div>
          </div>

          {isNote ? (
            <TextareaField
              id="quick-note-body"
              label="Internal note"
              onChange={setBody}
              placeholder="Record useful context for the next advisor action."
              required
              value={body}
            />
          ) : (
            <div className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Input
                  id="follow-up-due-at"
                  label="Due"
                  min={getLocalDateTimeInputValue()}
                  onChange={(event) => setDueAt(event.target.value)}
                  required
                  type="datetime-local"
                  value={dueAt}
                />
                <SelectField
                  id="follow-up-priority"
                  label="Priority"
                  onChange={(value) => setPriority(value as FollowUpPriority)}
                  optionLabels={{ NORMAL: 'Normal', HIGH: 'High', URGENT: 'Urgent' }}
                  options={['NORMAL', 'HIGH', 'URGENT']}
                  value={priority}
                />
              </div>
              <TextareaField
                id="follow-up-description"
                label="What needs to happen"
                onChange={setDescription}
                placeholder="e.g. Confirm final school shortlist with the student."
                required
                value={description}
              />
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-[#E5E7EB] px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <Button disabled={isSaving} onClick={onClose} size="md" variant="secondary">
            Cancel
          </Button>
          <Button
            disabled={!canSave || isSaving}
            leftIcon={isNote ? <MessageSquareText size={16} /> : <CalendarPlus size={16} />}
            size="md"
            type="submit"
          >
            {isSaving ? 'Saving…' : isNote ? 'Add note' : 'Schedule follow-up'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

const SelectField = ({
  id,
  label,
  onChange,
  options,
  optionLabels,
  value,
}: {
  id: string
  label: string
  onChange: (value: string) => void
  options: string[]
  optionLabels?: Record<string, string>
  value: string
}) => (
  <div>
    <label className="mb-2 block text-sm font-medium text-[#111827]" htmlFor={id}>
      {label}
    </label>
    <select
      className="h-12 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#111827] outline-none transition focus:border-[#045A58] focus:ring-4 focus:ring-[#E6F4F3]"
      id={id}
      onChange={(event) => onChange(event.target.value)}
      value={value}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {optionLabels?.[option] ?? option}
        </option>
      ))}
    </select>
  </div>
)

const TextareaField = ({
  id,
  label,
  onChange,
  placeholder,
  required = false,
  value,
}: {
  id: string
  label: string
  onChange: (value: string) => void
  placeholder: string
  required?: boolean
  value: string
}) => (
  <div>
    <label className="mb-2 block text-sm font-medium text-[#111827]" htmlFor={id}>
      {label}
    </label>
    <textarea
      className="min-h-28 w-full resize-y rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm leading-6 text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#045A58] focus:ring-4 focus:ring-[#E6F4F3]"
      id={id}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      required={required}
      value={value}
    />
  </div>
)

export type { QuickEntryMode, QuickEntryResult }
export default QuickStudentEntryModal
