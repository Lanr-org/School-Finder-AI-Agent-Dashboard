import { Search, Sparkles, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import Button from '../ui/Button.js'
import Input from '../ui/Input.js'
import Modal from '../ui/Modal.js'
import { useStudents } from '../../features/students/useStudents.js'
import { useGenerateRecommendationRun } from '../../features/recommendations/useRecommendations.js'

type GenerateRecommendationsModalProps = {
  isOpen: boolean
  onClose: () => void
}

const GenerateRecommendationsModal = ({ isOpen, onClose }: GenerateRecommendationsModalProps) => {
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setSearchInput('')
      setDebouncedSearch('')
      setSelectedStudentId(null)
    }
  }, [isOpen])

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchInput.trim()), 300)
    return () => clearTimeout(timeout)
  }, [searchInput])

  const { data } = useStudents({ page: 1, limit: 10, search: debouncedSearch || undefined })
  const students = data?.students ?? []
  const generateRun = useGenerateRecommendationRun()

  const handleGenerate = () => {
    if (!selectedStudentId) return
    generateRun.mutate(
      { studentId: selectedStudentId },
      { onSuccess: onClose },
    )
  }

  return (
    <Modal
      description="Search for a student to score their profile against active programs and generate a fresh set of recommendations."
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title="Generate recommendations"
    >
      <div className="border-b border-[#E5E7EB] px-5 py-4 sm:px-6">
        <Input
          className="h-11 bg-[#F9FAFB]"
          id="generate-recommendations-search"
          leftIcon={<Search size={17} />}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Search student by name, email, or student ID"
          type="search"
          value={searchInput}
        />
      </div>

      <div className="max-h-[380px] overflow-y-auto px-5 py-4 sm:px-6">
        {students.length ? (
          <div className="space-y-2">
            {students.map((student) => {
              const isSelected = selectedStudentId === student.publicId

              return (
                <button
                  aria-pressed={isSelected}
                  className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left outline-none transition focus:ring-4 focus:ring-[#E6F4F3] ${
                    isSelected
                      ? 'border-[#045A58] bg-[#F2F9F8] ring-1 ring-[#045A58]'
                      : 'border-[#E5E7EB] bg-white hover:border-[#B9DAD8] hover:bg-[#F9FAFB]'
                  }`}
                  key={student.publicId}
                  onClick={() => setSelectedStudentId(student.publicId)}
                  type="button"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E6F4F3] text-sm font-semibold text-[#045A58]">
                    {student.contact.firstName[0]}
                    {student.contact.lastName?.[0] ?? ''}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#111827]">
                      {student.contact.firstName} {student.contact.lastName ?? ''}
                    </p>
                    <p className="mt-0.5 text-xs text-[#6B7280]">{student.publicId}</p>
                  </div>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="flex min-h-40 flex-col items-center justify-center text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E6F4F3] text-[#045A58]">
              <Users size={19} />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-[#111827]">No matching students</h3>
            <p className="mt-1 text-sm text-[#6B7280]">Try another name or student ID.</p>
          </div>
        )}
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-[#E5E7EB] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-xs leading-5 text-[#6B7280]">
          Generating replaces the student's current recommendation list with a new scored run.
        </p>
        <div className="flex shrink-0 justify-end gap-3">
          <Button onClick={onClose} size="md" variant="secondary">
            Cancel
          </Button>
          <Button
            disabled={!selectedStudentId || generateRun.isPending}
            leftIcon={<Sparkles size={16} />}
            onClick={handleGenerate}
            size="md"
          >
            {generateRun.isPending ? 'Generating…' : 'Generate'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default GenerateRecommendationsModal
