import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Loader2,
  Search,
  SlidersHorizontal,
  UserRoundCheck,
  Users,
  UsersRound,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { isAxiosError } from 'axios'
import { useNavigate } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell.js'
import Badge from '../../components/ui/Badge.js'
import Button from '../../components/ui/Button.js'
import Card from '../../components/ui/Card.js'
import Input from '../../components/ui/Input.js'
import type { ApiErrorResponse } from '../../lib/api/types.js'
import { useAdvisorProfiles } from '../../features/advisors/useAdvisors.js'
import type { AdvisorAvailability, AdvisorProfile } from '../../features/advisors/advisors.api.js'

type WorkloadState = 'Balanced' | 'Near capacity' | 'Over capacity'

const PAGE_SIZE = 10

const availabilityLabels: Record<AdvisorAvailability, string> = {
  AVAILABLE: 'Available',
  LIMITED: 'Limited',
  UNAVAILABLE: 'Unavailable',
}

const availabilityTone: Record<AdvisorAvailability, 'error' | 'success' | 'warning'> = {
  AVAILABLE: 'success',
  LIMITED: 'warning',
  UNAVAILABLE: 'error',
}

const workloadTone: Record<WorkloadState, 'error' | 'success' | 'warning'> = {
  Balanced: 'success',
  'Near capacity': 'warning',
  'Over capacity': 'error',
}

const getWorkloadState = (advisor: AdvisorProfile): WorkloadState => {
  if (advisor.maxCapacity === null) return 'Balanced'
  const percentage = (advisor.activeStudentCount / advisor.maxCapacity) * 100
  if (percentage >= 100) return 'Over capacity'
  if (percentage >= 85) return 'Near capacity'
  return 'Balanced'
}

const getInitials = (fullName: string) =>
  fullName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

const AdvisorsPage = () => {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [availability, setAvailability] = useState<'All availability' | AdvisorAvailability>('All availability')
  const [workload, setWorkload] = useState<'All workloads' | WorkloadState>('All workloads')
  const [page, setPage] = useState(1)

  const { data: advisors, isLoading, isError, error } = useAdvisorProfiles()

  const filteredAdvisors = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const all = advisors ?? []

    return all.filter((advisor) => {
      const matchesQuery =
        !normalizedQuery ||
        advisor.fullName.toLowerCase().includes(normalizedQuery) ||
        advisor.email.toLowerCase().includes(normalizedQuery)

      return (
        matchesQuery &&
        (availability === 'All availability' || advisor.availability === availability) &&
        (workload === 'All workloads' || getWorkloadState(advisor) === workload)
      )
    })
  }, [advisors, availability, query, workload])

  const pageCount = Math.max(1, Math.ceil(filteredAdvisors.length / PAGE_SIZE))
  const pagedAdvisors = filteredAdvisors.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const stats = useMemo(() => {
    const all = advisors ?? []
    const assignedStudents = all.reduce((sum, advisor) => sum + advisor.activeStudentCount, 0)
    const availableCapacity = all.reduce((sum, advisor) => {
      if (advisor.maxCapacity === null) return sum
      return sum + Math.max(0, advisor.maxCapacity - advisor.activeStudentCount)
    }, 0)
    const followUpsDue = all.reduce((sum, advisor) => sum + advisor.pendingFollowUpCount, 0)

    return [
      { icon: UserRoundCheck, label: 'Advisor profiles', note: 'Configured for assignment', value: String(all.length) },
      { icon: Users, label: 'Assigned students', note: 'Across active advisors', value: String(assignedStudents) },
      { icon: CheckCircle2, label: 'Available capacity', note: 'Open student slots', value: String(availableCapacity) },
      { icon: CalendarClock, label: 'Follow-ups due', note: 'Require advisor attention', value: String(followUpsDue) },
    ] as const
  }, [advisors])

  const followUpQueue = useMemo(
    () =>
      (advisors ?? [])
        .filter((advisor) => advisor.pendingFollowUpCount > 0)
        .sort((a, b) => b.pendingFollowUpCount - a.pendingFollowUpCount)
        .slice(0, 4),
    [advisors],
  )

  const capacitySummary = useMemo(() => {
    const all = advisors ?? []
    let over = 0
    let near = 0
    let available = 0

    for (const advisor of all) {
      const state = getWorkloadState(advisor)
      if (state === 'Over capacity') over += 1
      else if (state === 'Near capacity') near += 1
      else available += 1
    }

    return { available, near, over }
  }, [advisors])

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-medium text-[#6B7280]">Administration</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal text-[#111827]">Advisors</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6B7280]">
              Monitor advisor workload, availability, student assignments, and follow-up demand.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              leftIcon={<UsersRound size={17} />}
              onClick={() => navigate('/team')}
              size="md"
              variant="secondary"
            >
              Manage team accounts
            </Button>
            <Button leftIcon={<Users size={17} />} onClick={() => navigate('/students')} size="md">
              Review assignments
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon

            return (
              <Card className="p-5" key={stat.label}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[#6B7280]">{stat.label}</p>
                    <p className="mt-3 text-3xl font-semibold tracking-normal text-[#111827]">{stat.value}</p>
                    <p className="mt-2 text-xs font-medium text-[#6B7280]">{stat.note}</p>
                  </div>
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E6F4F3] text-[#045A58]">
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
                <h2 className="text-lg font-semibold text-[#111827]">Advisor workload</h2>
                <p className="mt-1 text-sm text-[#6B7280]">
                  Capacity and availability should be reviewed before assigning new students.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-[minmax(260px,1fr)_170px_170px] xl:w-[760px]">
                <Input
                  className="h-11 bg-[#F9FAFB]"
                  id="advisor-search"
                  leftIcon={<Search size={18} />}
                  onChange={(event) => {
                    setQuery(event.target.value)
                    setPage(1)
                  }}
                  placeholder="Search advisor name or email"
                  type="search"
                  value={query}
                />
                <FilterSelect
                  label="Availability"
                  onChange={(value) => {
                    setAvailability(value as typeof availability)
                    setPage(1)
                  }}
                  options={['All availability', 'AVAILABLE', 'LIMITED', 'UNAVAILABLE']}
                  optionLabels={{ AVAILABLE: 'Available', LIMITED: 'Limited', UNAVAILABLE: 'Unavailable' }}
                  value={availability}
                />
                <FilterSelect
                  label="Workload"
                  onChange={(value) => {
                    setWorkload(value as typeof workload)
                    setPage(1)
                  }}
                  options={['All workloads', 'Balanced', 'Near capacity', 'Over capacity']}
                  value={workload}
                />
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
                  ? (error.response?.data.error.message ?? 'Failed to load advisors')
                  : 'Failed to load advisors'}
              </p>
            </div>
          ) : pagedAdvisors.length ? (
            <div className="max-h-[620px] overflow-auto overscroll-contain">
              <table className="w-full min-w-[960px] text-left">
                <thead className="sticky top-0 z-10 bg-white">
                  <tr className="border-b border-[#E5E7EB] text-xs font-semibold uppercase tracking-normal text-[#6B7280]">
                    <th className="px-6 py-3">Advisor</th>
                    <th className="px-6 py-3">Availability</th>
                    <th className="px-6 py-3">Workload</th>
                    <th className="whitespace-nowrap px-6 py-3">Follow-ups</th>
                    <th className="whitespace-nowrap px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {pagedAdvisors.map((advisor) => {
                    const workloadState = getWorkloadState(advisor)
                    const workloadPercentage =
                      advisor.maxCapacity === null
                        ? 0
                        : Math.min(Math.round((advisor.activeStudentCount / advisor.maxCapacity) * 100), 100)

                    return (
                      <tr className="transition hover:bg-[#F9FAFB]" key={advisor.advisorId}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E6F4F3] text-sm font-semibold text-[#045A58]">
                              {getInitials(advisor.fullName)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#111827]">{advisor.fullName}</p>
                              <p className="mt-1 text-xs font-medium text-[#6B7280]">{advisor.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge tone={availabilityTone[advisor.availability]}>
                            {availabilityLabels[advisor.availability]}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-44">
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-sm font-semibold text-[#111827]">
                                {advisor.activeStudentCount}
                                {advisor.maxCapacity === null ? '' : ` / ${advisor.maxCapacity}`}
                              </span>
                              {advisor.maxCapacity !== null ? (
                                <Badge tone={workloadTone[workloadState]}>{workloadState}</Badge>
                              ) : (
                                <Badge tone="neutral">No limit</Badge>
                              )}
                            </div>
                            {advisor.maxCapacity !== null ? (
                              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#E5E7EB]">
                                <div
                                  className={`h-full rounded-full ${
                                    workloadState === 'Over capacity'
                                      ? 'bg-[#DC2626]'
                                      : workloadState === 'Near capacity'
                                        ? 'bg-[#D97706]'
                                        : 'bg-[#045A58]'
                                  }`}
                                  style={{ width: `${workloadPercentage}%` }}
                                />
                              </div>
                            ) : null}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-2 whitespace-nowrap text-sm font-semibold ${
                              advisor.pendingFollowUpCount >= 7 ? 'text-[#B42318]' : 'text-[#374151]'
                            }`}
                          >
                            <CalendarClock size={16} />
                            {advisor.pendingFollowUpCount} due
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          <Button
                            className="w-max whitespace-nowrap"
                            onClick={() => navigate(`/students?advisorId=${advisor.advisorId}`)}
                            size="sm"
                            variant="secondary"
                          >
                            View students
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E6F4F3] text-[#045A58]">
                <SlidersHorizontal size={21} />
              </div>
              <h3 className="mt-4 text-base font-semibold text-[#111827]">No advisors match these filters</h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-[#6B7280]">
                Clear the current search, availability, and workload filters to return to the advisor directory.
              </p>
              <Button
                className="mt-5"
                onClick={() => {
                  setQuery('')
                  setAvailability('All availability')
                  setWorkload('All workloads')
                  setPage(1)
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
              Showing <span className="font-semibold text-[#111827]">{pagedAdvisors.length}</span> of{' '}
              <span className="font-semibold text-[#111827]">{filteredAdvisors.length}</span> advisors
            </p>
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
                disabled={page >= pageCount}
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                rightIcon={<ChevronRight size={16} />}
                size="sm"
                variant="secondary"
              >
                Next
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <Card className="p-0">
            <div className="border-b border-[#E5E7EB] px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-[#111827]">Follow-up review</h2>
                  <p className="mt-1 text-sm text-[#6B7280]">Advisors with the largest pending follow-up queues.</p>
                </div>
                <Badge tone="warning">{stats[3].value} due</Badge>
              </div>
            </div>
            {followUpQueue.length ? (
              <div className="divide-y divide-[#E5E7EB]">
                {followUpQueue.map((advisor) => (
                  <div
                    className="grid gap-3 px-6 py-4 sm:grid-cols-[1fr_100px_110px] sm:items-center"
                    key={advisor.advisorId}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F3F4F6] text-[#045A58]">
                        <UserRoundCheck size={17} />
                      </div>
                      <span className="text-sm font-semibold text-[#111827]">{advisor.fullName}</span>
                    </div>
                    <span className="text-sm font-semibold text-[#111827]">{advisor.pendingFollowUpCount} due</span>
                    <Button
                      onClick={() => navigate(`/students?advisorId=${advisor.advisorId}`)}
                      size="sm"
                      variant="secondary"
                    >
                      Review
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-10 text-center text-sm text-[#6B7280]">No pending follow-ups right now.</div>
            )}
          </Card>

          <Card>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FEE2E2] text-[#B42318]">
                <AlertCircle size={19} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#111827]">Capacity attention</h2>
                <p className="mt-1 text-sm leading-6 text-[#6B7280]">
                  {capacitySummary.over > 0
                    ? `${capacitySummary.over} advisor${capacitySummary.over === 1 ? ' is' : 's are'} over capacity.`
                    : 'No advisors are currently over capacity.'}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <CapacityItem label="Over capacity" tone="error" value={`${capacitySummary.over} advisors`} />
              <CapacityItem label="Near capacity" tone="warning" value={`${capacitySummary.near} advisors`} />
              <CapacityItem label="Available" tone="success" value={`${capacitySummary.available} advisors`} />
            </div>

            <Button className="mt-6 w-full" onClick={() => navigate('/students')} size="md" variant="secondary">
              Review student assignments
            </Button>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}

const FilterSelect = ({
  label,
  onChange,
  options,
  optionLabels,
  value,
}: {
  label: string
  onChange: (value: string) => void
  options: string[]
  optionLabels?: Record<string, string>
  value: string
}) => (
  <select
    aria-label={label}
    className="h-11 rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm font-medium text-[#374151] outline-none transition focus:border-[#045A58] focus:ring-4 focus:ring-[#E6F4F3]"
    onChange={(event) => onChange(event.target.value)}
    value={value}
  >
    {options.map((option) => (
      <option key={option} value={option}>
        {optionLabels?.[option] ?? option}
      </option>
    ))}
  </select>
)

const CapacityItem = ({
  label,
  tone,
  value,
}: {
  label: string
  tone: 'error' | 'success' | 'warning'
  value: string
}) => (
  <div className="flex items-center justify-between gap-4 border-b border-[#E5E7EB] pb-4 last:border-b-0 last:pb-0">
    <span className="text-sm text-[#6B7280]">{label}</span>
    <Badge tone={tone}>{value}</Badge>
  </div>
)

export default AdvisorsPage
