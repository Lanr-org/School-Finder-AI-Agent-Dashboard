import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileCheck2,
  FileClock,
  Loader2,
  Plane,
  Search,
  Send,
  Users,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { isAxiosError } from 'axios'
import AppShell from '../../components/layout/AppShell.js'
import ApplicationDetailModal from '../../components/modals/ApplicationDetailModal.js'
import Badge from '../../components/ui/Badge.js'
import Button from '../../components/ui/Button.js'
import Card from '../../components/ui/Card.js'
import Input from '../../components/ui/Input.js'
import type { ApiErrorResponse } from '../../lib/api/types.js'
import { cn } from '../../utils/cn.js'
import { useAuthStore } from '../../store/authStore.js'
import { useTeamMembers } from '../../features/team/useTeamMembers.js'
import { useApplications } from '../../features/applications/useApplications.js'
import type { ApplicationStatus } from '../../features/applications/applications.api.js'
import {
  ALL_APPLICATION_STATUSES,
  applicationStatusLabels,
  applicationStatusTone,
  formatIntakeLabel,
} from '../../features/applications/applicationStatus.js'

const PAGE_SIZE = 20

const selectClassName =
  'h-11 rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm font-medium text-[#374151] outline-none transition focus:border-[#045A58] focus:ring-4 focus:ring-[#E6F4F3]'

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })

const ApplicationsPage = () => {
  const isAdmin = useAuthStore((state) => state.user?.role === 'ADMIN')

  const [status, setStatus] = useState<ApplicationStatus | 'ALL'>('ALL')
  const [advisorId, setAdvisorId] = useState('ALL')
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null)

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchInput.trim()), 300)
    return () => clearTimeout(timeout)
  }, [searchInput])

  useEffect(() => setPage(1), [debouncedSearch, status, advisorId])

  const { data: teamMembers } = useTeamMembers()
  const advisorOptions = useMemo(
    () => (teamMembers ?? []).filter((member) => member.role === 'ADVISOR'),
    [teamMembers],
  )

  const queryParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: debouncedSearch || undefined,
      status: status === 'ALL' ? undefined : status,
      // The server ignores advisorId for advisors anyway; only admins get the filter.
      advisorId: isAdmin && advisorId !== 'ALL' ? advisorId : undefined,
    }),
    [page, debouncedSearch, status, advisorId, isAdmin],
  )

  const { data, isLoading, isFetching, isError, error } = useApplications(queryParams)
  const applications = data?.applications ?? []
  const pagination = data?.pagination
  const summary = data?.summary

  const stats = [
    {
      icon: FileClock,
      label: 'In preparation',
      note: 'Draft or documents pending',
      value: summary ? summary.DRAFT + summary.DOCUMENTS_PENDING : undefined,
    },
    {
      icon: Send,
      label: 'With schools',
      note: 'Submitted or offer received',
      value: summary ? summary.SUBMITTED + summary.OFFER_RECEIVED : undefined,
    },
    { icon: Plane, label: 'Visa processing', note: 'Offer accepted', value: summary?.VISA_PROCESSING },
    { icon: CheckCircle2, label: 'Completed', note: 'Enrolled or cleared to travel', value: summary?.COMPLETED },
  ] as const

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium text-[#6B7280]">Placement pipeline</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-normal text-[#111827]">Applications</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6B7280]">
            Track school applications from draft through offer and visa. New applications are started from a
            student&apos;s profile.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon

            return (
              <Card className="p-5" key={stat.label}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[#6B7280]">{stat.label}</p>
                    <p className="mt-3 text-3xl font-semibold tracking-normal text-[#111827]">{stat.value ?? '—'}</p>
                    <p className="mt-2 text-xs font-medium text-[#6B7280]">{stat.note}</p>
                  </div>
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E6F4F3] text-[#045A58]">
                    <Icon size={20} />
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        <Card className="p-0">
          <div className="border-b border-[#E5E7EB] px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#111827]">All applications</h2>
                <p className="mt-1 text-sm text-[#6B7280]">Most recently updated first.</p>
              </div>

              <div className={cn('grid gap-3', isAdmin ? 'sm:grid-cols-3 xl:w-[760px]' : 'sm:grid-cols-2 xl:w-[520px]')}>
                <Input
                  className="h-11 bg-[#F9FAFB]"
                  id="application-search"
                  leftIcon={<Search size={18} />}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search student, program, or APP ID"
                  type="search"
                  value={searchInput}
                />
                <label className="sr-only" htmlFor="application-status-filter">
                  Status
                </label>
                <select
                  className={selectClassName}
                  id="application-status-filter"
                  onChange={(event) => setStatus(event.target.value as ApplicationStatus | 'ALL')}
                  value={status}
                >
                  <option value="ALL">All statuses</option>
                  {ALL_APPLICATION_STATUSES.map((value) => (
                    <option key={value} value={value}>
                      {applicationStatusLabels[value]}
                    </option>
                  ))}
                </select>
                {isAdmin ? (
                  <>
                    <label className="sr-only" htmlFor="application-advisor-filter">
                      Advisor
                    </label>
                    <select
                      className={selectClassName}
                      id="application-advisor-filter"
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
                  </>
                ) : null}
              </div>
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
                  ? (error.response?.data.error.message ?? 'Failed to load applications')
                  : 'Failed to load applications'}
              </p>
            </div>
          ) : applications.length ? (
            <div className={cn('overflow-x-auto', isFetching && 'opacity-60')}>
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="bg-[#F9FAFB] text-xs font-semibold uppercase tracking-normal text-[#6B7280]">
                  <tr>
                    <th className="px-6 py-3">Student</th>
                    <th className="px-6 py-3">Program / school</th>
                    <th className="px-6 py-3">Intake</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {applications.map((application) => (
                    <tr
                      className="cursor-pointer transition hover:bg-[#F9FAFB]"
                      key={application.publicId}
                      onClick={() => setSelectedApplicationId(application.publicId)}
                    >
                      <td className="px-6 py-4">
                        <Link
                          className="font-semibold text-[#111827] outline-none transition hover:text-[#045A58] focus:underline"
                          onClick={(event) => event.stopPropagation()}
                          to={`/students/${application.student.publicId}`}
                        >
                          {`${application.student.firstName} ${application.student.lastName ?? ''}`.trim()}
                        </Link>
                        <p className="mt-1 text-xs text-[#6B7280]">
                          {application.student.publicId} · {application.publicId}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-[#111827]">{application.program.name}</p>
                        <p className="mt-1 text-xs text-[#6B7280]">
                          {application.school.name} · {application.school.country}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-[#374151]">
                        {application.intake
                          ? formatIntakeLabel(application.intake.month, application.intake.year)
                          : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <Badge tone={applicationStatusTone[application.status]}>
                          {applicationStatusLabels[application.status]}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-[#6B7280]">{formatDate(application.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E6F4F3] text-[#045A58]">
                <FileCheck2 size={19} />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-[#111827]">No applications found</h3>
              <p className="mt-1 max-w-sm text-sm text-[#6B7280]">
                Start an application from a student&apos;s profile, or adjust the filters.
              </p>
            </div>
          )}

          {pagination && pagination.totalPages > 1 ? (
            <div className="flex flex-col gap-3 border-t border-[#E5E7EB] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                <Users size={16} />
                Showing <span className="font-semibold text-[#111827]">{applications.length}</span> of{' '}
                <span className="font-semibold text-[#111827]">{pagination.total}</span> applications
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

      <ApplicationDetailModal
        applicationId={selectedApplicationId}
        onClose={() => setSelectedApplicationId(null)}
      />
    </AppShell>
  )
}

export default ApplicationsPage
