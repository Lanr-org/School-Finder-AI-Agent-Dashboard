import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Clock3,
  MessageSquareText,
  School,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react'
import AppShell from '../../components/layout/AppShell.js'
import Badge from '../../components/ui/Badge.js'
import Button from '../../components/ui/Button.js'
import Card from '../../components/ui/Card.js'

const dashboardMetrics = [
  {
    change: '+18 this week',
    icon: Users,
    label: 'Total student leads',
    tone: 'brand',
    value: '248',
  },
  {
    change: '12 from Telegram',
    icon: TrendingUp,
    label: 'New leads today',
    tone: 'success',
    value: '16',
  },
  {
    change: 'Needs advisor',
    icon: Clock3,
    label: 'Awaiting assignment',
    tone: 'warning',
    value: '27',
  },
  {
    change: '9 escalated',
    icon: MessageSquareText,
    label: 'Active conversations',
    tone: 'neutral',
    value: '84',
  },
] as const

const leadStatusSummary = [
  { count: 42, label: 'New', tone: 'brand' },
  { count: 27, label: 'Unassigned', tone: 'warning' },
  { count: 96, label: 'Assigned', tone: 'success' },
  { count: 18, label: 'Follow-up', tone: 'error' },
] as const

const destinationSummary = [
  { country: 'Canada', leads: 78, percent: 82 },
  { country: 'United Kingdom', leads: 56, percent: 64 },
  { country: 'United States', leads: 41, percent: 48 },
  { country: 'Australia', leads: 33, percent: 38 },
] as const

const advisorWorkload = [
  { active: 34, advisor: 'Amina Yusuf', followUps: 8 },
  { active: 29, advisor: 'Daniel Okafor', followUps: 5 },
  { active: 24, advisor: 'Maya Chen', followUps: 4 },
] as const

const recentRecommendations = [
  {
    destination: 'Canada',
    fit: 92,
    program: 'Business Analytics',
    school: 'Northbridge College',
    student: 'Chinedu N.',
  },
  {
    destination: 'United Kingdom',
    fit: 88,
    program: 'Public Health',
    school: 'Westhaven University',
    student: 'Sofia A.',
  },
  {
    destination: 'Australia',
    fit: 84,
    program: 'Computer Science',
    school: 'Harbour Institute',
    student: 'Emeka I.',
  },
] as const

const pendingFollowUps = [
  {
    due: 'Today',
    note: 'IELTS score pending',
    student: 'Grace O.',
    tone: 'warning',
  },
  {
    due: 'Today',
    note: 'Advisor handoff required',
    student: 'Malik B.',
    tone: 'error',
  },
  {
    due: 'Tomorrow',
    note: 'Confirm intake preference',
    student: 'Tara M.',
    tone: 'brand',
  },
] as const

const DashboardPage = () => {
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-medium text-[#6B7280]">Dashboard</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal text-[#111827]">
              Operations overview
            </h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button size="md" variant="secondary">
              Export report
            </Button>
            <Button rightIcon={<ArrowRight size={17} />} size="md">
              Review leads
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {dashboardMetrics.map((metric) => {
            const Icon = metric.icon

            return (
              <Card className="p-5" key={metric.label}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[#6B7280]">{metric.label}</p>
                    <p className="mt-3 text-3xl font-semibold tracking-normal text-[#111827]">
                      {metric.value}
                    </p>
                    <p className="mt-2 text-xs font-medium text-[#6B7280]">{metric.change}</p>
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
              <Badge tone="brand">248 total</Badge>
            </div>

            <div className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-4">
              {leadStatusSummary.map((status) => (
                <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4" key={status.label}>
                  <Badge tone={status.tone}>{status.label}</Badge>
                  <p className="mt-4 text-2xl font-semibold tracking-normal text-[#111827]">
                    {status.count}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-[#111827]">Assignment queue</h2>
                <p className="mt-1 text-sm text-[#6B7280]">Leads waiting for advisor action</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FEF3C7] text-[#92400E]">
                <CalendarClock size={19} />
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-4xl font-semibold tracking-normal text-[#111827]">27</p>
                  <p className="mt-1 text-sm text-[#6B7280]">Unassigned leads</p>
                </div>
                <Badge tone="warning">High priority</Badge>
              </div>
              <div className="h-2 rounded-full bg-[#F3F4F6]">
                <div className="h-2 w-[68%] rounded-full bg-[#045A58]" />
              </div>
              <p className="text-sm leading-6 text-[#6B7280]">
                68% of today&apos;s queue has been assigned to advisors.
              </p>
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

            <div className="space-y-4">
              {destinationSummary.map((destination) => (
                <div key={destination.country}>
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <p className="text-sm font-medium text-[#111827]">{destination.country}</p>
                    <p className="text-sm font-semibold text-[#6B7280]">{destination.leads}</p>
                  </div>
                  <div className="h-2 rounded-full bg-[#F3F4F6]">
                    <div
                      className="h-2 rounded-full bg-[#045A58]"
                      style={{ width: `${destination.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-[#111827]">Advisor workload</h2>
                <p className="mt-1 text-sm text-[#6B7280]">Active students and follow-ups</p>
              </div>
              <Users className="text-[#045A58]" size={20} />
            </div>

            <div className="divide-y divide-[#E5E7EB]">
              {advisorWorkload.map((advisor) => (
                <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0" key={advisor.advisor}>
                  <div>
                    <p className="text-sm font-semibold text-[#111827]">{advisor.advisor}</p>
                    <p className="mt-1 text-xs font-medium text-[#6B7280]">
                      {advisor.followUps} follow-ups
                    </p>
                  </div>
                  <Badge tone="neutral">{advisor.active} active</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-[#111827]">Pending follow-ups</h2>
                <p className="mt-1 text-sm text-[#6B7280]">Student actions due soon</p>
              </div>
              <Clock3 className="text-[#045A58]" size={20} />
            </div>

            <div className="space-y-3">
              {pendingFollowUps.map((followUp) => (
                <div className="rounded-2xl border border-[#E5E7EB] p-4" key={followUp.student}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[#111827]">{followUp.student}</p>
                    <Badge tone={followUp.tone}>{followUp.due}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-[#6B7280]">{followUp.note}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-0">
          <div className="flex items-center justify-between gap-4 border-b border-[#E5E7EB] px-6 py-5">
            <div>
              <h2 className="text-lg font-semibold text-[#111827]">Recently recommended schools</h2>
              <p className="mt-1 text-sm text-[#6B7280]">Latest scored placement matches</p>
            </div>
            <Sparkles className="text-[#045A58]" size={20} />
          </div>

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
                {recentRecommendations.map((recommendation) => (
                  <tr className="hover:bg-[#F9FAFB]" key={`${recommendation.student}-${recommendation.school}`}>
                    <td className="px-6 py-4 text-sm font-semibold text-[#111827]">
                      {recommendation.student}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#6B7280]">{recommendation.program}</td>
                    <td className="px-6 py-4 text-sm text-[#111827]">{recommendation.school}</td>
                    <td className="px-6 py-4 text-sm text-[#6B7280]">{recommendation.destination}</td>
                    <td className="px-6 py-4 text-right">
                      <Badge tone="success">
                        <CheckCircle2 size={14} />
                        {recommendation.fit}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  )
}

export default DashboardPage
