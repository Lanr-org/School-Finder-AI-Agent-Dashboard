import { AlertCircle, BookOpen, FilePlus2, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { isAxiosError } from 'axios'
import Button from '../ui/Button.js'
import Input from '../ui/Input.js'
import Modal from '../ui/Modal.js'
import type { ApiErrorResponse } from '../../lib/api/types.js'
import { usePrograms } from '../../features/programs/usePrograms.js'
import type { IntakeMonth, Program } from '../../features/programs/programs.api.js'
import { useCreateApplication } from '../../features/applications/useApplications.js'
import { formatIntakeLabel } from '../../features/applications/applicationStatus.js'

type CreateApplicationModalProps = {
  isOpen: boolean
  onClose: () => void
  studentId: string
  studentName: string
}

const NO_INTAKE = ''

const formatDeadline = (value: string) =>
  new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })

const CreateApplicationModal = ({ isOpen, onClose, studentId, studentName }: CreateApplicationModalProps) => {
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null)
  const [intakeKey, setIntakeKey] = useState(NO_INTAKE)
  const [externalReference, setExternalReference] = useState('')
  const [notes, setNotes] = useState('')

  const createApplication = useCreateApplication(studentId)

  useEffect(() => {
    if (isOpen) {
      setSearchInput('')
      setDebouncedSearch('')
      setSelectedProgram(null)
      setIntakeKey(NO_INTAKE)
      setExternalReference('')
      setNotes('')
      createApplication.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchInput.trim()), 300)
    return () => clearTimeout(timeout)
  }, [searchInput])

  const { data } = usePrograms({ page: 1, limit: 10, search: debouncedSearch || undefined })
  const programs = data?.programs ?? []

  const selectProgram = (program: Program) => {
    setSelectedProgram(program)
    setIntakeKey(NO_INTAKE)
  }

  const handleCreate = () => {
    if (!selectedProgram) return
    // Intake options come only from the program's stored intakes — never free entry.
    const intake = selectedProgram.intakes.find((item) => `${item.month}-${item.year}` === intakeKey)

    createApplication.mutate(
      {
        programId: selectedProgram.publicId,
        intakeMonth: intake?.month as IntakeMonth | undefined,
        intakeYear: intake?.year,
        externalReference: externalReference.trim() || undefined,
        notes: notes.trim() || undefined,
      },
      { onSuccess: onClose },
    )
  }

  const errorMessage = createApplication.isError
    ? isAxiosError<ApiErrorResponse>(createApplication.error)
      ? (createApplication.error.response?.data.error.message ?? 'Failed to create the application')
      : 'Failed to create the application'
    : null

  return (
    <Modal
      description={`Start a school application for ${studentName}. It begins as a draft and moves forward as the application progresses.`}
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title="New application"
    >
      <div className="max-h-[520px] space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
        <div>
          <p className="mb-2 text-sm font-medium text-[#111827]">Program</p>
          <Input
            className="h-11 bg-[#F9FAFB]"
            id="create-application-program-search"
            leftIcon={<Search size={17} />}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search programs by name"
            type="search"
            value={searchInput}
          />

          <div className="mt-3 max-h-56 space-y-2 overflow-y-auto">
            {programs.length ? (
              programs.map((program) => {
                const isSelected = selectedProgram?.publicId === program.publicId

                return (
                  <button
                    aria-pressed={isSelected}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left outline-none transition focus:ring-4 focus:ring-[#E6F4F3] ${
                      isSelected
                        ? 'border-[#045A58] bg-[#F2F9F8] ring-1 ring-[#045A58]'
                        : 'border-[#E5E7EB] bg-white hover:border-[#B9DAD8] hover:bg-[#F9FAFB]'
                    }`}
                    key={program.publicId}
                    onClick={() => selectProgram(program)}
                    type="button"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E6F4F3] text-[#045A58]">
                      <BookOpen size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#111827]">{program.name}</p>
                      <p className="mt-0.5 truncate text-xs text-[#6B7280]">
                        {program.school.name} · {program.publicId}
                      </p>
                    </div>
                  </button>
                )
              })
            ) : (
              <p className="rounded-xl border border-dashed border-[#D1D5DB] bg-[#F9FAFB] px-4 py-5 text-center text-sm text-[#6B7280]">
                No matching programs.
              </p>
            )}
          </div>
        </div>

        {selectedProgram ? (
          <>
            <div>
              <label className="mb-2 block text-sm font-medium text-[#111827]" htmlFor="create-application-intake">
                Intake
              </label>
              <select
                className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm font-medium text-[#374151] outline-none transition focus:border-[#045A58] focus:ring-4 focus:ring-[#E6F4F3]"
                id="create-application-intake"
                onChange={(event) => setIntakeKey(event.target.value)}
                value={intakeKey}
              >
                <option value={NO_INTAKE}>No intake selected yet</option>
                {selectedProgram.intakes.map((intake) => (
                  <option key={`${intake.month}-${intake.year}`} value={`${intake.month}-${intake.year}`}>
                    {formatIntakeLabel(intake.month, intake.year)}
                    {intake.applicationDeadline ? ` — deadline ${formatDeadline(intake.applicationDeadline)}` : ''}
                  </option>
                ))}
              </select>
              {selectedProgram.intakes.length === 0 ? (
                <p className="mt-2 text-xs text-[#6B7280]">
                  This program has no intakes on record yet. Add them on the program page to select one here.
                </p>
              ) : null}
            </div>

            <Input
              id="create-application-reference"
              label="School reference (optional)"
              maxLength={100}
              onChange={(event) => setExternalReference(event.target.value)}
              placeholder="The school's own application number"
              value={externalReference}
            />

            <div>
              <label className="block text-sm font-medium text-[#111827]" htmlFor="create-application-notes">
                Notes <span className="font-normal text-[#9CA3AF]">(optional)</span>
              </label>
              <textarea
                className="mt-2 min-h-24 w-full resize-y rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm leading-6 text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#045A58] focus:ring-4 focus:ring-[#E6F4F3]"
                id="create-application-notes"
                maxLength={5000}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Internal context for this application."
                value={notes}
              />
            </div>
          </>
        ) : null}

        {errorMessage ? (
          <div className="flex items-start gap-3 rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-4">
            <AlertCircle className="mt-0.5 shrink-0 text-[#DC2626]" size={18} />
            <p className="text-sm leading-5 text-[#991B1B]">{errorMessage}</p>
          </div>
        ) : null}
      </div>

      <div className="flex justify-end gap-3 border-t border-[#E5E7EB] px-5 py-4 sm:px-6">
        <Button onClick={onClose} size="md" variant="secondary">
          Cancel
        </Button>
        <Button
          disabled={!selectedProgram || createApplication.isPending}
          leftIcon={<FilePlus2 size={16} />}
          onClick={handleCreate}
          size="md"
        >
          {createApplication.isPending ? 'Creating…' : 'Create application'}
        </Button>
      </div>
    </Modal>
  )
}

export default CreateApplicationModal
