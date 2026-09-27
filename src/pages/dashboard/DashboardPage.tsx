import {
  AlertCircle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Loader2,
  MessageSquareText,
  School,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { isAxiosError } from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell.js'
import Badge from '../../components/ui/Badge.js'
import Button from '../../components/ui/Button.js'
import Card from '../../components/ui/Card.js'
import type { ApiErrorResponse } from '../../lib/api/types.js'
import type { StudentStatus } from '../../features/students/students.api.js'
import type { DashboardSummary } from '../../features/dashboard/dashboard.api.js'
import { useDashboardSummary } from '../../features/dashboard/useDashboardSummary.js'

type Tone = 'brand' | 'neutral' | 'success' | 'warning' | 'error'

// Same labels/tones as StudentsPage so a status looks identical on both pages.
const pipelineStatuses: { status: StudentStatus; label: string; tone: Tone }[] = [
  { status: 'NEW', label: 'New', tone: 'neutral' },
  { status: 'AWAITING_ASSIGNMENT', label: 'Awaiting assignment', tone: 'warning' },
  { status: 'ASSIGNED', label: 'Assigned', tone: 'brand' },
  { status: 'FOLLOW_UP', label: 'Follow-up', tone: 'error' },
  { status: 'APPLICATION_STARTED', label: 'Application started', tone: 'success' },
  { status: 'COMPLETED', label: 'Completed', tone: 'success' },
  { status: 'CLOSED', label: 'Closed', tone: 'neutral' },
]

// "Today" is defined in Lagos time, matching the backend.
const TIMEZONE = 'Africa/Lagos'

const lagosDateKey = (date: Date) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)

const formatLagosTime = (iso: string) =>
  new Intl.DateTimeFormat('en-GB', { timeZone: TIMEZONE, hour: '2-digit', minute: '2-digit' }).format(
    new Date(iso),
  )

const formatLagosDay = (iso: string) =>
  new Intl.DateTimeFormat('en-GB', {
    timeZone: TIMEZONE,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(new Date(iso))

// Compared against the server's generatedAt so the badge agrees with the backend's "overdue".
const dueBadge = (dueAt: string, overdue: boolean, generatedAt: string): { label: string; tone: Tone } => {
  if (overdue) return { label: 'Overdue', tone: 'error' }
  if (lagosDateKey(new Date(dueAt)) === lagosDateKey(new Date(generatedAt))) {
    return { label: 'Today', tone: 'warning' }
  }
  return { label: formatLagosDay(dueAt), tone: 'brand' }
}

const EmptyNote = ({ children }: { children: ReactNode }) => (
  <p className="rounded-2xl border border-dashed border-[#E5E7EB] p-4 text-sm text-[#6B7280]">{children}</p>
)

const DashboardContent = ({ summary }: { summary: DashboardSummary }) => {
  const { leads, conversations } = summary
  const assignedShare = Math.round(leads.assignedShareOfOpen)

  const metrics = [
    { detail: `+${leads.newThisWeek} this week`, icon: Users, label: 'Total student leads', value: leads.total },
    {
      detail: `${leads.newTodayFromTelegram} from Telegram`,
      icon: TrendingUp,
      label: 'New leads today',
      value: leads.newToday,
    },
    { detail: 'Need an advisor', icon: Clock3, label: 'Unassigned leads', value: leads.unassigned },
    {
      detail: `${conversations.escalated} escalated`,
      icon: MessageSquareText,
      label: 'Active conversations',
      value: conversations.active,
    },
  ]

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon

          return (
            <Card className="p-5" key={metric.label}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-[#6B7280]">{metric.label}</p>
                  <p className="mt-3 text-3xl font-semibold tracking-normal text-[#111827]">{metric.value}</p>
                  <p className="mt-2 text-xs font-medium text-[#6B7280]">{metric.detail}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E6F4F3] text-[#045A58]">
                  <Icon size={20} />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <Card className="p-0">
          <div className="flex items-center justify-between gap-4 border-b border-[#E5E7EB] px-6 py-5">
            <div>
              <h2 className="text-lg font-semibold text-[#111827]">Lead pipeline</h2>
              <p className="mt-1 text-sm text-[#6B7280]">Current student workflow status</p>
            </div>
            <Badge tone="brand">{leads.total} total</Badge>
          </div>

          <div className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-4">
            {pipelineStatuses.map((item) => (
              <Link
                className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 transition hover:border-[#D1D5DB] hover:bg-white"
                key={item.status}
                to={`/students?status=${item.status}`}
              >
                <Badge tone={item.tone}>{item.label}</Badge>
                <p className="mt-4 text-2xl font-semibold tracking-normal text-[#111827]">
                  {leads.byStatus[item.status]}
                </p>
              </Link>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[#111827]">Assignment queue</h2>
              <p className="mt-1 text-sm text-[#6B7280]">Open leads waiting for an advisor</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FEF3C7] text-[#92400E]">
              <CalendarClock size={19} />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-4xl font-semibold tracking-normal text-[#111827]">{leads.unassigned}</p>
                <p className="mt-1 text-sm text-[#6B7280]">Unassigned leads</p>
              </div>
              {leads.unassigned > 0 ? (
                <Badge tone="warning">Needs attention</Badge>
              ) : (
                <Badge tone="success">All assigned</Badge>
              )}
            </div>
            <div className="h-2 rounded-full bg-[#F3F4F6]">
              <div className="h-2 rounded-full bg-[#045A58]" style={{ width: `${assignedShare}%` }} />
            </div>
            <p className="text-sm leading-6 text-[#6B7280]">{assignedShare}% of open leads have an advisor.</p>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[#111827]">Top destinations</h2>
              <p className="mt-1 text-sm text-[#6B7280]">Lead interest by country</p>
            </div>
            <School className="text-[#045A58]" size={20} />
          </div>

          {summary.topDestinations.length ? (
            <div className="space-y-4">
              {summary.topDestinations.map((destination) => (
                <div key={destination.country}>
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <p className="text-sm font-medium text-[#111827]">{destination.country}</p>
                    <p className="text-sm font-semibold text-[#6B7280]">{destination.leads}</p>
                  </div>
                  <div className="h-2 rounded-full bg-[#F3F4F6]">
                    <div
                      className="h-2 rounded-full bg-[#045A58]"
                      style={{ width: `${Math.round(destination.percent)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyNote>No destination preferences recorded yet.</EmptyNote>
          )}
        </Card>

        <Card>
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[#111827]">Advisor workload</h2>
              <p className="mt-1 text-sm text-[#6B7280]">Active students and follow-ups</p>
            </div>
            {summary.scope === 'ALL' ? (
              <Link className="text-sm font-semibold text-[#045A58] hover:text-[#034A48]" to="/advisors">
                View all
              </Link>
            ) : (
              <Users className="text-[#045A58]" size={20} />
            )}
          </div>

          {summary.advisorWorkload.length ? (
            <div className="divide-y divide-[#E5E7EB]">
              {summary.advisorWorkload.map((advisor) => (
                <div
                  className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                  key={advisor.advisorId}
                >
                  <div>
                    <p className="text-sm font-semibold text-[#111827]">{advisor.fullName}</p>
                    <p className="mt-1 text-xs font-medium text-[#6B7280]">
                      {advisor.pendingFollowUps} pending follow-ups
                    </p>
                  </div>
                  <Badge tone="neutral">
                    {advisor.maxCapacity === null
                      ? `${advisor.activeStudents} active · no cap`
                      : `${advisor.activeStudents} / ${advisor.maxCapacity} active`}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <EmptyNote>No active advisors yet.</EmptyNote>
          )}
        </Card>

        <Card>
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[#111827]">Pending follow-ups</h2>
              <p className="mt-1 text-sm text-[#6B7280]">Student actions due soonest</p>
            </div>
            <Clock3 className="text-[#045A58]" size={20} />
          </div>

          {summary.pendingFollowUps === null ? (
            <EmptyNote>Not available for your role.</EmptyNote>
          ) : summary.pendingFollowUps.length ? (
            <div className="space-y-3">
              {summary.pendingFollowUps.map((followUp) => {
                const badge = dueBadge(followUp.dueAt, followUp.overdue, summary.generatedAt)

                return (
                  <Link
                    className="block rounded-2xl border border-[#E5E7EB] p-4 transition hover:border-[#D1D5DB] hover:bg-[#F9FAFB]"
                    key={followUp.publicId}
                    to={`/students/${followUp.studentId}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-[#111827]">{followUp.studentName}</p>
                      <Badge tone={badge.tone}>{badge.label}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-[#6B7280]">{followUp.description}</p>
                  </Link>
                )
              })}
            </div>
          ) : (
            <EmptyNote>No pending follow-ups.</EmptyNote>
          )}
        </Card>
      </div>

      <Card className="p-0">
        <div className="flex items-center justify-between gap-4 border-b border-[#E5E7EB] px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-[#111827]">Recently recommended schools</h2>
            <p className="mt-1 text-sm text-[#6B7280]">Top match from each of the latest recommendation runs</p>
          </div>
          <Sparkles className="text-[#045A58]" size={20} />
        </div>

        {summary.recentRecommendations === null ? (
          <div className="p-6">
            <EmptyNote>Not available for your role.</EmptyNote>
          </div>
        ) : summary.recentRecommendations.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="border-b border-[#E5E7EB] text-xs font-semibold uppercase tracking-normal text-[#6B7280]">
                  <th className="px-6 py-3">Student</th>
                  <th className="px-6 py-3">Program</th>
                  <th className="px-6 py-3">School</th>
                  <th className="px-6 py-3">Destination</th>
                  <th className="px-6 py-3 text-right">Fit score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {summary.recentRecommendations.map((recommendation) => (
                  <tr className="hover:bg-[#F9FAFB]" key={recommendation.studentId}>
                    <td className="px-6 py-4 text-sm font-semibold text-[#111827]">
                      <Link className="hover:text-[#045A58]" to={`/students/${recommendation.studentId}`}>
                        {recommendation.studentName}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#6B7280]">
                      <Link className="hover:text-[#045A58]" to={`/programs/${recommendation.program.publicId}`}>
                        {recommendation.program.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#111827]">
                      <Link className="hover:text-[#045A58]" to={`/schools/${recommendation.school.publicId}`}>
                        {recommendation.school.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#6B7280]">{recommendation.country}</td>
                    <td className="px-6 py-4 text-right">
                      <Badge tone="success">
                        <CheckCircle2 size={14} />
                        {Math.round(recommendation.overallScore)}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6">
            <EmptyNote>No recommendation runs yet.</EmptyNote>
          </div>
        )}
      </Card>
    </>
  )
}

const DashboardPage = () => {
  const navigate = useNavigate()
  const { data, error, isError, isFetching, isLoading, refetch } = useDashboardSummary()

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-medium text-[#6B7280]">Dashboard</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal text-[#111827]">
              {data?.scope === 'OWN' ? 'My overview' : 'Operations overview'}
            </h1>
            {data ? (
              <p className="mt-1 text-xs text-[#6B7280]">Updated {formatLagosTime(data.generatedAt)} (Lagos time)</p>
            ) : null}
          </div>

          {data?.scope === 'ALL' ? (
            <Button
              onClick={() => navigate('/students?status=AWAITING_ASSIGNMENT')}
              rightIcon={<ArrowRight size={17} />}
              size="md"
            >
              Review leads
            </Button>
          ) : null}
        </div>

        {isLoading ? (
          <Card className="flex min-h-72 items-center justify-center">
            <Loader2 className="animate-spin text-[#045A58]" size={28} />
          </Card>
        ) : isError || !data ? (
          <Card className="flex min-h-72 flex-col items-center justify-center gap-3 text-center">
            <AlertCircle className="text-[#DC2626]" size={24} />
            <p className="text-sm text-[#6B7280]">
              {isAxiosError<ApiErrorResponse>(error)
                ? (error.response?.data.error.message ?? 'Failed to load the dashboard')
                : 'Failed to load the dashboard'}
            </p>
            <Button disabled={isFetching} onClick={() => void refetch()} size="sm" variant="secondary">
              Try again
            </Button>
          </Card>
        ) : (
          <DashboardContent summary={data} />
        )}
      </div>
    </AppShell>
  )
}

export default DashboardPage
