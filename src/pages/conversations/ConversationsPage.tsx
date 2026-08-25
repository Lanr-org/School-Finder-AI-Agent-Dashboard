import {
  AlertCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock3,
  Eye,
  Loader2,
  MessageSquareText,
  Search,
  UserRoundCheck,
  Users,
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
import { useTeamMembers } from '../../features/team/useTeamMembers.js'
import { useConversations } from '../../features/conversations/useConversations.js'
import type { ConversationStatus } from '../../features/conversations/conversations.api.js'

const PAGE_SIZE = 20

const statusTone: Record<ConversationStatus, 'brand' | 'error' | 'success'> = {
  ACTIVE: 'brand',
  ESCALATED: 'error',
  RESOLVED: 'success',
}

const statusLabels: Record<ConversationStatus, string> = {
  ACTIVE: 'Active',
  ESCALATED: 'Escalated',
  RESOLVED: 'Resolved',
}

const statusTabs = ['ALL', 'ACTIVE', 'ESCALATED', 'RESOLVED', 'UNASSIGNED'] as const
type StatusTab = (typeof statusTabs)[number]

const formatRelativeTime = (value: string) => {
  const diffMs = Date.now() - new Date(value).getTime()
  const minutes = Math.round(diffMs / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`
  return new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

const ConversationsPage = () => {
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [advisorId, setAdvisorId] = useState('ALL')
  const [status, setStatus] = useState<StatusTab>('ALL')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchInput.trim()), 300)
    return () => clearTimeout(timeout)
  }, [searchInput])

  useEffect(() => setPage(1), [debouncedSearch, advisorId, status])

  const { data: advisors } = useTeamMembers()
  const advisorOptions = useMemo(() => (advisors ?? []).filter((member) => member.role === 'ADVISOR'), [advisors])

  const queryParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: debouncedSearch || undefined,
      advisorId: advisorId !== 'ALL' ? advisorId : undefined,
      status: status === 'ALL' || status === 'UNASSIGNED' ? undefined : status,
      unassigned: status === 'UNASSIGNED' ? true : undefined,
    }),
    [page, debouncedSearch, advisorId, status],
  )

  const { data, isLoading, isFetching, isError, error } = useConversations(queryParams)

  const activeCount = useConversations({ page: 1, limit: 1, status: 'ACTIVE' }).data?.pagination.total
  const escalatedCount = useConversations({ page: 1, limit: 1, status: 'ESCALATED' }).data?.pagination.total
  const resolvedCount = useConversations({ page: 1, limit: 1, status: 'RESOLVED' }).data?.pagination.total
  const unassignedCount = useConversations({ page: 1, limit: 1, unassigned: true }).data?.pagination.total

  const conversationStats = [
    { icon: MessageSquareText, label: 'Active', value: activeCount },
    { icon: AlertTriangle, label: 'Escalated', value: escalatedCount },
    { icon: Users, label: 'Unassigned', value: unassignedCount },
    { icon: CheckCircle2, label: 'Resolved', value: resolvedCount },
  ] as const

  const conversations = data?.conversations ?? []
  const pagination = data?.pagination

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium text-[#6B7280]">Telegram operations</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-normal text-[#111827]">Conversations</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6B7280]">
            Review AI-agent conversations, identify escalations, and route students to the right advisor.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {conversationStats.map((stat) => {
            const Icon = stat.icon

            return (
              <Card className="p-5" key={stat.label}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[#6B7280]">{stat.label}</p>
                    <p className="mt-3 text-3xl font-semibold tracking-normal text-[#111827]">
                      {stat.value ?? '—'}
                    </p>
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
          <div className="border-b border-[#E5E7EB] px-5 pt-5 sm:px-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#111827]">Conversation queue</h2>
                <p className="mt-1 text-sm text-[#6B7280]">Prioritize escalated and unassigned conversations.</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-[minmax(260px,1fr)_190px] xl:w-[620px]">
                <Input
                  className="h-11 bg-[#F9FAFB]"
                  id="conversation-search"
                  leftIcon={<Search size={18} />}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search student name or ID"
                  type="search"
                  value={searchInput}
                />
                <select
                  aria-label="Filter by advisor"
                  className="h-11 rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm font-medium text-[#374151] outline-none transition focus:border-[#045A58] focus:ring-4 focus:ring-[#E6F4F3]"
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

            <div className="mt-5 flex gap-1 overflow-x-auto">
              {statusTabs.map((tab) => (
                <button
                  className={`h-10 shrink-0 border-b-2 px-4 text-sm font-semibold outline-none transition ${
                    status === tab
                      ? 'border-[#045A58] text-[#045A58]'
                      : 'border-transparent text-[#6B7280] hover:text-[#111827]'
                  }`}
                  key={tab}
                  onClick={() => setStatus(tab)}
                  type="button"
                >
                  {tab === 'ALL' ? 'All' : tab === 'UNASSIGNED' ? 'Unassigned' : statusLabels[tab]}
                </button>
              ))}
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
                  ? (error.response?.data.error.message ?? 'Failed to load conversations')
                  : 'Failed to load conversations'}
              </p>
            </div>
          ) : conversations.length ? (
            <div className={`divide-y divide-[#E5E7EB] ${isFetching ? 'opacity-60' : ''}`}>
              {conversations.map((conversation) => (
                <article className="px-5 py-5 transition hover:bg-[#F9FAFB] sm:px-6" key={conversation.publicId}>
                  <div className="grid gap-5 sm:grid-cols-[220px_minmax(0,1fr)_96px] sm:items-center">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#E6F4F3] text-sm font-semibold text-[#045A58]">
                        {conversation.student.firstName[0]}
                        {conversation.student.lastName?.[0] ?? ''}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#111827]">
                          {conversation.student.firstName} {conversation.student.lastName ?? ''}
                        </p>
                        <p className="mt-1 text-xs font-medium text-[#6B7280]">
                          {conversation.student.publicId} · {conversation.publicId}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Badge tone={statusTone[conversation.status]}>{statusLabels[conversation.status]}</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-normal text-[#9CA3AF]">Assigned advisor</p>
                        {conversation.student.assignedAdvisor ? (
                          <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-[#111827]">
                            <UserRoundCheck className="text-[#045A58]" size={16} />
                            {conversation.student.assignedAdvisor.fullName}
                          </p>
                        ) : (
                          <Badge className="mt-2" tone="warning">Unassigned</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                        <Clock3 size={15} />
                        {formatRelativeTime(conversation.lastActivityAt)}
                      </div>
                    </div>

                    <div className="flex sm:justify-end">
                      <Link
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-transparent bg-transparent px-3 text-sm font-semibold text-[#045A58] outline-none transition hover:bg-[#E6F4F3] hover:text-[#034A48] focus:ring-4 focus:ring-[#E6F4F3]"
                        to={`/conversations/${conversation.publicId}`}
                      >
                        <Eye size={16} />
                        Open
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E6F4F3] text-[#045A58]">
                <MessageSquareText size={21} />
              </div>
              <h3 className="mt-4 text-base font-semibold text-[#111827]">No conversations match this view</h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-[#6B7280]">
                Change the status, advisor, or search filters to return to the conversation queue.
              </p>
              <Button
                className="mt-5"
                onClick={() => {
                  setAdvisorId('ALL')
                  setSearchInput('')
                  setStatus('ALL')
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
              <p className="text-sm text-[#6B7280]">
                Showing <span className="font-semibold text-[#111827]">{conversations.length}</span> of{' '}
                <span className="font-semibold text-[#111827]">{pagination.total}</span> conversations
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

export default ConversationsPage
