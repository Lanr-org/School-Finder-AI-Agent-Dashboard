import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import type { AdvisorAvailability, AdvisorProfile } from '../../features/advisors/advisors.api.js'
import { useCreateAdvisorProfile, useUpdateAdvisorProfile } from '../../features/advisors/useAdvisors.js'
import { useTeamMembers } from '../../features/team/useTeamMembers.js'
import { apiErrorMessage } from '../../lib/api/errors.js'
import Button from '../ui/Button.js'
import Input from '../ui/Input.js'
import Modal from '../ui/Modal.js'

const availabilityOptions: { label: string; value: AdvisorAvailability }[] = [
  { label: 'Available', value: 'AVAILABLE' },
  { label: 'Limited', value: 'LIMITED' },
  { label: 'Unavailable', value: 'UNAVAILABLE' },
]

const selectClass =
  'h-12 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#111827] outline-none transition focus:border-[#2B4BFF] focus:ring-4 focus:ring-[#ECEFFF] disabled:opacity-60'

type AdvisorProfileModalProps = {
  /** The profile to edit; omit to create a new one. */
  advisor?: AdvisorProfile | undefined
  existingAdvisorIds: string[]
  onClose: () => void
}

// Create a profile for an ADVISOR account (needed before students can be assigned), or edit one.
const AdvisorProfileModal = ({ advisor, existingAdvisorIds, onClose }: AdvisorProfileModalProps) => {
  const isEdit = advisor !== undefined
  const team = useTeamMembers()
  const create = useCreateAdvisorProfile()
  const update = useUpdateAdvisorProfile(advisor?.advisorId)
  const mutation = isEdit ? update : create

  const candidates = (team.data ?? []).filter(
    (member) => member.role === 'ADVISOR' && member.status !== 'DISABLED' && !existingAdvisorIds.includes(member.publicId),
  )
  const [userId, setUserId] = useState('')
  const [availability, setAvailability] = useState<AdvisorAvailability>(advisor?.availability ?? 'AVAILABLE')
  const [capacity, setCapacity] = useState(advisor?.maxCapacity ? String(advisor.maxCapacity) : '')
  const isSaving = mutation.isPending

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSaving) return
    const maxCapacity = capacity.trim() ? Number(capacity) : null
    if (isEdit) {
      update.mutate({ availability, maxCapacity }, { onSuccess: onClose })
    } else {
      if (!userId) return
      create.mutate({ userId, availability, maxCapacity }, { onSuccess: onClose })
    }
  }

  return (
    <Modal
      description={
        isEdit
          ? 'Change availability and how many active students this advisor can take.'
          : 'An advisor needs a profile before students can be assigned to them.'
      }
      isOpen
      onClose={() => (isSaving ? undefined : onClose())}
      title={isEdit ? `Edit ${advisor.fullName}` : 'Create advisor profile'}
    >
      <form onSubmit={submit}>
        <div className="space-y-5 px-5 py-5 sm:px-6">
          {isEdit ? null : (
            <div>
              <label className="mb-2 block text-sm font-medium text-[#111827]" htmlFor="advisor-user">
                Advisor account
              </label>
              <select
                className={selectClass}
                disabled={team.isLoading || isSaving}
                id="advisor-user"
                onChange={(event) => setUserId(event.target.value)}
                required
                value={userId}
              >
                <option value="">
                  {team.isLoading ? 'Loading team…' : candidates.length ? 'Choose an advisor' : 'No advisor accounts without a profile'}
                </option>
                {candidates.map((member) => (
                  <option key={member.publicId} value={member.publicId}>
                    {member.fullName} · {member.email}
                    {member.status === 'INVITED' ? ' (invited)' : ''}
                  </option>
                ))}
              </select>
              {team.isError ? (
                <p className="mt-2 text-sm text-[#DC2626]">{apiErrorMessage(team.error, "Couldn't load the team")}</p>
              ) : !team.isLoading && candidates.length === 0 ? (
                <p className="mt-2 text-sm text-[#6B7280]">
                  Every advisor account already has a profile.{' '}
                  <Link className="font-semibold text-[#2B4BFF]" to="/team/invite">
                    Invite an advisor
                  </Link>{' '}
                  first.
                </p>
              ) : null}
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-[#111827]" htmlFor="advisor-availability">
              Availability
            </label>
            <select
              className={selectClass}
              disabled={isSaving}
              id="advisor-availability"
              onChange={(event) => setAvailability(event.target.value as AdvisorAvailability)}
              value={availability}
            >
              {availabilityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <Input
            disabled={isSaving}
            helperText="Most active students at once. Leave empty for no limit."
            id="advisor-capacity"
            label="Maximum students"
            min={1}
            onChange={(event) => setCapacity(event.target.value)}
            placeholder="No limit"
            step={1}
            type="number"
            value={capacity}
          />

          {mutation.isError ? (
            <p className="rounded-xl border border-[#F7C9C5] bg-[#FEF3F2] px-4 py-3 text-sm text-[#B42318]" role="alert">
              {apiErrorMessage(mutation.error)}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-[#E5E7EB] px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <Button disabled={isSaving} onClick={onClose} size="md" variant="secondary">
            Cancel
          </Button>
          <Button disabled={isSaving || (!isEdit && !userId)} size="md" type="submit">
            {isSaving ? 'Saving…' : isEdit ? 'Save changes' : 'Create profile'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default AdvisorProfileModal
