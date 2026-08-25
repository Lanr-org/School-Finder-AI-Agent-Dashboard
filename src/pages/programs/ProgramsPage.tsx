import {
  AlertCircle,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Loader2,
  Pencil,
  Plus,
  School,
  Search,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { isAxiosError } from 'axios'
import AppShell from '../../components/layout/AppShell.js'
import Badge from '../../components/ui/Badge.js'
import Button from '../../components/ui/Button.js'
import Card from '../../components/ui/Card.js'
import Input from '../../components/ui/Input.js'
import type { ApiErrorResponse } from '../../lib/api/types.js'
import { useAuthStore } from '../../store/authStore.js'
import { useSchools } from '../../features/schools/useSchools.js'
import { usePrograms } from '../../features/programs/usePrograms.js'
import type { ProgramIntake, StudyLevel } from '../../features/programs/programs.api.js'

const PAGE_SIZE = 20
const MANAGE_ROLES = ['ADMIN', 'OPERATIONS']

const studyLevelOptions: { label: string; value: StudyLevel | 'ALL' }[] = [
  { label: 'All levels', value: 'ALL' },
  { label: 'Undergraduate', value: 'UNDERGRADUATE' },
  { label: 'Postgraduate', value: 'POSTGRADUATE' },
  { label: 'Doctorate', value: 'DOCTORATE' },
  { label: 'Foundation', value: 'FOUNDATION' },
]

const studyLevelLabels: Record<StudyLevel, string> = {
  DOCTORATE: 'Doctorate',
  FOUNDATION: 'Foundation',
  POSTGRADUATE: 'Postgraduate',
  UNDERGRADUATE: 'Undergraduate',
}

const formatIntakeMonth = (month: string) => month.charAt(0) + month.slice(1).toLowerCase()

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })

const getNextDeadline = (intakes: ProgramIntake[]) => {
  const deadlines = intakes
    .map((intake) => intake.applicationDeadline)
    .filter((deadline): deadline is string => deadline !== null)
    .sort()
  const now = new Date().toISOString()
  return deadlines.find((deadline) => deadline >= now) ?? deadlines.at(-1) ?? null
}

const ProgramsPage = () => {
  const canManage = useAuthStore((state) => (state.user ? MANAGE_ROLES.includes(state.user.role) : false))
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [studyLevel, setStudyLevel] = useState<StudyLevel | 'ALL'>('ALL')
  const [schoolId, setSchoolId] = useState('ALL')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchInput.trim()), 300)
    return () => clearTimeout(timeout)
  }, [searchInput])

  const { data: schoolsData } = useSchools({ page: 1, limit: 100 })
  const schoolOptions = schoolsData?.schools ?? []

  const queryParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: debouncedSearch || undefined,
      studyLevel: studyLevel === 'ALL' ? undefined : studyLevel,
      schoolId: schoolId === 'ALL' ? undefined : schoolId,
    }),
    [debouncedSearch, page, schoolId, studyLevel],
  )

  const { data, error, isError, isLoading, isFetching } = usePrograms(queryParams)

  const resetToFirstPage = () => setPage(1)

  const programs = data?.programs ?? []
  const pagination = data?.pagination

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-medium text-[#6B7280]">Academic directory</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal text-[#111827]">Programs</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6B7280]">
              Search and manage program records across every school, intake, study level, and tuition range.
            </p>
          </div>

          {canManage ? (
            <Link
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-transparent bg-[#045A58] px-4 text-sm font-semibold text-white outline-none transition hover:bg-[#034A48] focus:ring-4 focus:ring-[#E6F4F3]"
              to="/programs/new"
            >
              <Plus size={17} />
              Add program
            </Link>
          ) : null}
        </div>

        <Card className="p-0">
          <div className="border-b border-[#E5E7EB] px-5 py-5 sm:px-6">
            <div>
              <h2 className="text-lg font-semibold text-[#111827]">Program directory</h2>
              <p className="mt-1 text-sm text-[#6B7280]">
                Compare structured program data and open the associated school record.
              </p>
            </div>

            <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(280px,1fr)_220px_200px]">
              <Input
                className="h-11 bg-[#F9FAFB]"
                id="program-search"
                leftIcon={<Search size={18} />}
                onChange={(event) => {
                  setSearchInput(event.target.value)
                  resetToFirstPage()
                }}
                placeholder="Search by program name"
                type="search"
                value={searchInput}
              />
              <FilterSelect
                id="school-filter"
                label="School"
                onChange={(value) => {
                  setSchoolId(value)
                  resetToFirstPage()
                }}
                options={[
                  { label: 'All schools', value: 'ALL' },
                  ...schoolOptions.map((s) => ({ label: s.name, value: s.publicId })),
                ]}
                value={schoolId}
              />
              <FilterSelect
                id="level-filter"
                label="Level"
                onChange={(value) => {
                  setStudyLevel(value as StudyLevel | 'ALL')
                  resetToFirstPage()
                }}
                options={studyLevelOptions}
                value={studyLevel}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex min-h-72 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
              <Loader2 className="animate-spin text-[#045A58]" size={24} />
              <p className="text-sm text-[#6B7280]">Loading programs…</p>
            </div>
          ) : isError ? (
            <div className="flex min-h-72 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
              <AlertCircle className="text-[#DC2626]" size={24} />
              <p className="text-sm text-[#6B7280]">
                {isAxiosError<ApiErrorResponse>(error)
                  ? (error.response?.data.error.message ?? 'Failed to load programs')
                  : 'Failed to load programs'}
              </p>
            </div>
          ) : programs.length ? (
            <div className={`overflow-x-auto ${isFetching ? 'opacity-60' : ''}`}>
              <table className="w-full min-w-[1160px] text-left">
                <thead>
                  <tr className="border-b border-[#E5E7EB] text-xs font-semibold uppercase tracking-normal text-[#6B7280]">
                    <th className="px-6 py-3">Program name</th>
                    <th className="px-6 py-3">School</th>
                    <th className="px-6 py-3">Level</th>
                    <th className="px-6 py-3">Tuition</th>
                    <th className="px-6 py-3">Intake periods</th>
                    <th className="px-6 py-3">Deadline</th>
                    <th className="px-6 py-3">Scholarship</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {programs.map((program) => (
                    <tr className="transition hover:bg-[#F9FAFB]" key={program.publicId}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#E6F4F3] text-[#045A58]">
                            <BookOpen size={18} />
                          </div>
                          <div>
                            <Link
                              className="text-sm font-semibold text-[#111827] outline-none transition hover:text-[#045A58] focus:underline"
                              to={`/programs/${program.publicId}`}
                            >
                              {program.name}
                            </Link>
                            <p className="mt-1 text-xs font-medium text-[#6B7280]">
                              {program.publicId} · {program.category}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          className="inline-flex items-center gap-2 text-sm font-semibold text-[#045A58] outline-none hover:text-[#034A48] focus:underline"
                          to={`/schools/${program.school.publicId}`}
                        >
                          <School size={16} />
                          {program.school.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <Badge tone="brand">{studyLevelLabels[program.studyLevel]}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#111827]">
                          <CircleDollarSign className="text-[#6B7280]" size={16} />
                          {program.tuitionCurrency} {Number(program.tuitionAmount).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {program.intakes.map((intake) => (
                            <Badge className="h-6 px-2" key={`${intake.month}-${intake.year}`} tone="neutral">
                              {formatIntakeMonth(intake.month)} {intake.year}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-[#6B7280]">
                        {(() => {
                          const nextDeadline = getNextDeadline(program.intakes)
                          return nextDeadline ? formatDate(nextDeadline) : '—'
                        })()}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#6B7280]">
                        {program.scholarshipAvailability ?? '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {canManage ? (
                          <Link
                            aria-label={`Edit ${program.name}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-[#6B7280] outline-none transition hover:bg-[#E6F4F3] hover:text-[#045A58] focus:ring-4 focus:ring-[#E6F4F3]"
                            title="Edit program"
                            to={`/programs/${program.publicId}/edit`}
                          >
                            <Pencil size={16} />
                          </Link>
                        ) : (
                          <p className="text-xs font-medium text-[#9CA3AF]">View only</p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E6F4F3] text-[#045A58]">
                <BookOpen size={21} />
              </div>
              <h3 className="mt-4 text-base font-semibold text-[#111827]">No programs match these filters</h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-[#6B7280]">
                Adjust the search or clear filters to return to the complete program directory.
              </p>
              <Button
                className="mt-5"
                onClick={() => {
                  setSearchInput('')
                  setStudyLevel('ALL')
                  setSchoolId('ALL')
                  resetToFirstPage()
                }}
                size="md"
                variant="secondary"
              >
                Clear filters
              </Button>
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-[#E5E7EB] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-sm text-[#6B7280]">
              {pagination ? (
                <>
                  Showing <span className="font-semibold text-[#111827]">{programs.length}</span> of{' '}
                  <span className="font-semibold text-[#111827]">{pagination.total}</span> programs
                </>
              ) : null}
            </p>
            <div className="flex items-center gap-2">
              <Button
                disabled={page <= 1}
                leftIcon={<ChevronLeft size={16} />}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                size="sm"
                variant="secondary"
              >
                Previous
              </Button>
              <Button
                disabled={!pagination || page >= pagination.totalPages}
                onClick={() => setPage((current) => current + 1)}
                rightIcon={<ChevronRight size={16} />}
                size="sm"
                variant="secondary"
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  )
}

type FilterSelectProps = {
  id: string
  label: string
  onChange: (value: string) => void
  options: { label: string; value: string }[]
  value: string
}

const FilterSelect = ({ id, label, onChange, options, value }: FilterSelectProps) => (
  <div>
    <label className="sr-only" htmlFor={id}>
      {label}
    </label>
    <select
      className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm font-medium text-[#374151] outline-none transition focus:border-[#045A58] focus:ring-4 focus:ring-[#E6F4F3]"
      id={id}
      onChange={(event) => onChange(event.target.value)}
      value={value}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
)

export default ProgramsPage
