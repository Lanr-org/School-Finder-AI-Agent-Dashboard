import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  Loader2,
  Mail,
  Phone,
  Plus,
  Search,
  UserRoundCheck,
  Users,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { isAxiosError } from 'axios'
import { Link } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell.js'
import Badge from '../../components/ui/Badge.js'
import Button from '../../components/ui/Button.js'
import Card from '../../components/ui/Card.js'
import Input from '../../components/ui/Input.js'
import type { ApiErrorResponse } from '../../lib/api/types.js'
import { useTeamMembers } from '../../features/team/useTeamMembers.js'
import { useStudents } from '../../features/students/useStudents.js'
import type { Student, StudentStatus } from '../../features/students/students.api.js'

const PAGE_SIZE = 20

const statusTone: Record<StudentStatus, 'brand' | 'neutral' | 'success' | 'warning' | 'error'> = {
  APPLICATION_STARTED: 'success',
  ASSIGNED: 'brand',
  AWAITING_ASSIGNMENT: 'warning',
  CLOSED: 'neutral',
  COMPLETED: 'success',
  FOLLOW_UP: 'error',
  NEW: 'neutral',
}

const statusLabels: Record<StudentStatus, string> = {
  APPLICATION_STARTED: 'Application started',
  ASSIGNED: 'Assigned',
  AWAITING_ASSIGNMENT: 'Awaiting assignment',
  CLOSED: 'Closed',
  COMPLETED: 'Completed',
  FOLLOW_UP: 'Follow-up',
  NEW: 'New',
}

const statusFilterOptions: StudentStatus[] = [
  'NEW',
  'AWAITING_ASSIGNMENT',
  'ASSIGNED',
  'FOLLOW_UP',
  'APPLICATION_STARTED',
  'COMPLETED',
  'CLOSED',
]

const sourceLabels: Record<Student['contact']['source'], string> = {
  TELEGRAM: 'Telegram',
  WHATSAPP: 'WhatsApp',
  LIVE_CHAT: 'Live chat',
  FACEBOOK: 'Facebook',
  MANUAL: 'Manual',
}

const formatIntake = (student: Student) =>
  student.targetIntakeMonth && student.targetIntakeYear
    ? `${student.targetIntakeMonth.charAt(0)}${student.targetIntakeMonth.slice(1).toLowerCase()} ${student.targetIntakeYear}`
    : '—'

const formatDestinations = (destinations: string[]) => (destinations.length ? destinations.join(', ') : '—')

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })

const StudentsPage = () => {
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState<StudentStatus | 'ALL'>('ALL')
  const [advisorId, setAdvisorId] = useState('ALL')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchInput.trim()), 300)
    return () => clearTimeout(timeout)
  }, [searchInput])

  useEffect(() => setPage(1), [debouncedSearch, status, advisorId])

  const { data: advisors } = useTeamMembers()
  const advisorOptions = useMemo(() => (advisors ?? []).filter((member) => member.role === 'ADVISOR'), [advisors])

  const queryParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: debouncedSearch || undefined,
      status: status === 'ALL' ? undefined : status,
      advisorId: advisorId !== 'ALL' ? advisorId : undefined,
    }),
    [page, debouncedSearch, status, advisorId],
  )

  const { data, isLoading, isFetching, isError, error } = useStudents(queryParams)
  const totalCount = useStudents({ page: 1, limit: 1 }).data?.pagination.total
  const newCount = useStudents({ page: 1, limit: 1, status: 'NEW' }).data?.pagination.total
  const awaitingCount = useStudents({ page: 1, limit: 1, status: 'AWAITING_ASSIGNMENT' }).data?.pagination.total
  const followUpCount = useStudents({ page: 1, limit: 1, status: 'FOLLOW_UP' }).data?.pagination.total

  const leadStats = [
    { label: 'Total leads', value: totalCount },
    { label: 'New', value: newCount },
    { label: 'Awaiting advisor', value: awaitingCount },
    { label: 'Follow-up', value: followUpCount },
  ] as const

  const students = data?.students ?? []
  const pagination = data?.pagination

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-medium text-[#6B7280]">Operations</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal text-[#111827]">Students / Leads</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6B7280]">
              Review student leads collected from Telegram and manual entry, then prioritize advisor assignment.
            </p>
          </div>

          <Link
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-transparent bg-[#045A58] px-4 text-sm font-semibold text-white outline-none transition hover:bg-[#034A48] focus:ring-4 focus:ring-[#E6F4F3]"
            to="/students/new"
          >
            <Plus size={17} />
            Add student
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {leadStats.map((stat) => (
            <Card className="p-5" key={stat.label}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-[#6B7280]">{stat.label}</p>
                  <p className="mt-3 text-3xl font-semibold tracking-normal text-[#111827]">{stat.value ?? '—'}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-0">
          <div className="border-b border-[#E5E7EB] px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#111827]">Lead workspace</h2>
                <p className="mt-1 text-sm text-[#6B7280]">Search, filter, and open student records.</p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_200px_200px]">
              <Input
                className="h-11 bg-[#F9FAFB]"
                id="student-search"
                leftIcon={<Search size={18} />}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search name, email, or student ID"
                type="search"
                value={searchInput}
              />

              <label className="sr-only" htmlFor="status-filter">
                Lead status
              </label>
              <select
                className="h-11 rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#374151] outline-none transition focus:border-[#045A58] focus:ring-4 focus:ring-[#E6F4F3]"
                id="status-filter"
                onChange={(event) => setStatus(event.target.value as StudentStatus | 'ALL')}
                value={status}
              >
                <option value="ALL">All statuses</option>
                {statusFilterOptions.map((option) => (
                  <option key={option} value={option}>
                    {statusLabels[option]}
                  </option>
                ))}
              </select>

              <label className="sr-only" htmlFor="advisor-filter">
                Assigned advisor
              </label>
              <select
                className="h-11 rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#374151] outline-none transition focus:border-[#045A58] focus:ring-4 focus:ring-[#E6F4F3]"
                id="advisor-filter"
                onChange={(event) => setAdvisorId(event.target.value)}
                value={advisorId}
              >
                <option value="ALL">All advisors</option>
                {advisorOptions.map((advisor) => (
                  <option key={advisor.publicId} value={advisor.publicId}>
                    {advisor.fullName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex min-h-72 items-center justify-center">
              <Loader2 className="animate-spin text-[#045A58]" size={28} />
            </div>
          ) : isError ? (
            <div className="flex min-h-72 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
              <AlertCircle className="text-[#DC2626]" size={24} />
              <p className="text-sm text-[#6B7280]">
                {isAxiosError<ApiErrorResponse>(error)
                  ? (error.response?.data.error.message ?? 'Failed to load students')
                  : 'Failed to load students'}
              </p>
            </div>
          ) : students.length ? (
            <div className={`overflow-x-auto ${isFetching ? 'opacity-60' : ''}`}>
              <table className="w-full min-w-[1120px] text-left">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-[#E5E7EB] text-xs font-semibold uppercase tracking-normal text-[#6B7280]">
                    <th className="px-6 py-3">Student name</th>
                    <th className="px-6 py-3">Destination</th>
                    <th className="px-6 py-3">Budget</th>
                    <th className="px-6 py-3">Intake</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Assigned advisor</th>
                    <th className="px-6 py-3">Updated</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {students.map((student) => (
                    <tr className="transition hover:bg-[#F9FAFB]" key={student.publicId}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#E6F4F3] text-sm font-semibold text-[#045A58]">
                            {student.contact.firstName[0]}
                            {student.contact.lastName?.[0] ?? ''}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-[#111827]">
                                {student.contact.firstName} {student.contact.lastName ?? ''}
                              </p>
                              <Badge className="h-6 px-2" tone={student.contact.source === 'TELEGRAM' ? 'brand' : 'neutral'}>
                                {sourceLabels[student.contact.source]}
                              </Badge>
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-[#6B7280]">
                              {student.contact.email ? (
                                <span className="inline-flex items-center gap-1">
                                  <Mail size={13} />
                                  {student.contact.email}
                                </span>
                              ) : null}
                              {student.contact.phone ? (
                                <span className="inline-flex items-center gap-1">
                                  <Phone size={13} />
                                  {student.contact.phone}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-[#111827]">
                        {formatDestinations(student.targetDestinations)}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#6B7280]">{student.budgetRange ?? '—'}</td>
                      <td className="px-6 py-4 text-sm text-[#6B7280]">{formatIntake(student)}</td>
                      <td className="px-6 py-4">
                        <Badge tone={statusTone[student.status]}>{statusLabels[student.status]}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        {student.assignedAdvisor ? (
                          <span className="inline-flex items-center gap-2 text-sm font-medium text-[#111827]">
                            <UserRoundCheck className="text-[#045A58]" size={16} />
                            {student.assignedAdvisor.fullName}
                          </span>
                        ) : (
                          <Badge tone="warning">Unassigned</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-[#6B7280]">
                        <span className="inline-flex items-center gap-1">
                          <Clock3 size={13} />
                          {formatDate(student.updatedAt)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-transparent bg-transparent px-3 text-sm font-semibold text-[#045A58] outline-none transition hover:bg-[#E6F4F3] hover:text-[#034A48] focus:ring-4 focus:ring-[#E6F4F3]"
                          to={`/students/${student.publicId}`}
                        >
                          <Eye size={16} />
                          Open
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E6F4F3] text-[#045A58]">
                <Users size={21} />
              </div>
              <h3 className="mt-4 text-base font-semibold text-[#111827]">No students match this view</h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-[#6B7280]">
                Change the status, advisor, or search filters to return to the lead workspace.
              </p>
              <Button
                className="mt-5"
                onClick={() => {
                  setSearchInput('')
                  setStatus('ALL')
                  setAdvisorId('ALL')
                }}
                size="md"
                variant="secondary"
              >
                Clear filters
              </Button>
            </div>
          )}

          {pagination ? (
            <div className="flex flex-col gap-3 border-t border-[#E5E7EB] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                <Users size={16} />
                Showing <span className="font-semibold text-[#111827]">{students.length}</span> of{' '}
                <span className="font-semibold text-[#111827]">{pagination.total}</span> leads
              </div>
              <div className="flex items-center gap-2">
                <Button
                  disabled={page <= 1}
                  leftIcon={<ChevronLeft size={16} />}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  size="sm"
                  variant="secondary"
                >
                  Previous
                </Button>
                <Button
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  rightIcon={<ChevronRight size={16} />}
                  size="sm"
                  variant="secondary"
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </Card>
      </div>
    </AppShell>
  )
}

export default StudentsPage
