import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Bot,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  Mail,
  MessageSquareText,
  Phone,
  RotateCcw,
  Send,
  UserRound,
  UserRoundCheck,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { isAxiosError } from 'axios'
import { Link, useParams } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell.js'
import Badge from '../../components/ui/Badge.js'
import Button from '../../components/ui/Button.js'
import Card from '../../components/ui/Card.js'
import type { ApiErrorResponse } from '../../lib/api/types.js'
import { useAuthStore } from '../../store/authStore.js'
import { useTeamMembers } from '../../features/team/useTeamMembers.js'
import { useConversation, useConversationActions } from '../../features/conversations/useConversations.js'
import { useAssignStudentAdvisor } from '../../features/students/useStudents.js'
import type { ConversationMessage, ConversationStatus } from '../../features/conversations/conversations.api.js'

const MANAGE_ROLES = ['ADMIN', 'ADVISOR']

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

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })

const ConversationDetailPage = () => {
  const { conversationId } = useParams()
  const [replyText, setReplyText] = useState('')

  const canManage = useAuthStore((state) => (state.user ? MANAGE_ROLES.includes(state.user.role) : false))
  const isAdmin = useAuthStore((state) => state.user?.role === 'ADMIN')

  const { data: conversation, isLoading, isError, error } = useConversation(conversationId)
  const { data: advisors } = useTeamMembers()
  const advisorOptions = (advisors ?? []).filter((member) => member.role === 'ADVISOR')

  const { reply, escalate, resolve, handback } = useConversationActions(conversationId)
  const assignAdvisor = useAssignStudentAdvisor(conversation?.student.publicId)

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex min-h-96 items-center justify-center">
          <Loader2 className="animate-spin text-[#045A58]" size={28} />
        </div>
      </AppShell>
    )
  }

  if (isError || !conversation) {
    return (
      <AppShell>
        <div className="flex min-h-96 flex-col items-center justify-center gap-3 text-center">
          <AlertCircle className="text-[#DC2626]" size={24} />
          <p className="text-sm text-[#6B7280]">
            {isAxiosError<ApiErrorResponse>(error)
              ? (error.response?.data.error.message ?? 'Failed to load conversation')
              : 'Failed to load conversation'}
          </p>
          <Link className="text-sm font-semibold text-[#045A58] hover:text-[#034A48]" to="/conversations">
            Back to conversations
          </Link>
        </div>
      </AppShell>
    )
  }

  const studentName = `${conversation.student.firstName} ${conversation.student.lastName ?? ''}`.trim()
  const isResolved = conversation.status === 'RESOLVED'
  const isEscalated = conversation.mode === 'HUMAN_ADVISOR'

  const handleReply = () => {
    const content = replyText.trim()
    if (!content) return
    reply.mutate(content, { onSuccess: () => setReplyText('') })
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <Link
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#045A58] transition hover:text-[#034A48]"
              to="/conversations"
            >
              <ArrowLeft size={16} />
              Conversations
            </Link>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-normal text-[#111827]">{studentName}</h1>
              <Badge tone={statusTone[conversation.status]}>{statusLabels[conversation.status]}</Badge>
              <Badge tone="neutral">{conversation.publicId}</Badge>
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6B7280]">
              Review the Telegram message history and advisor handoff state.
            </p>
          </div>

          {canManage && !isResolved ? (
            <div className="flex flex-wrap gap-3">
              {isEscalated ? (
                <>
                  <Button
                    disabled={handback.isPending}
                    leftIcon={<RotateCcw size={17} />}
                    onClick={() => handback.mutate()}
                    size="md"
                    variant="secondary"
                  >
                    Hand back to AI
                  </Button>
                  <Button disabled={resolve.isPending} leftIcon={<CheckCircle2 size={17} />} onClick={() => resolve.mutate()} size="md">
                    Mark resolved
                  </Button>
                </>
              ) : (
                <Button
                  disabled={escalate.isPending}
                  leftIcon={<AlertTriangle size={17} />}
                  onClick={() => escalate.mutate()}
                  size="md"
                  variant="secondary"
                >
                  Escalate
                </Button>
              )}
            </div>
          ) : null}
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <Card className="p-0">
            <div className="flex flex-col gap-3 border-b border-[#E5E7EB] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <h2 className="text-lg font-semibold text-[#111827]">Message history</h2>
                <p className="mt-1 text-sm text-[#6B7280]">{conversation.messages.length} messages</p>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-[#6B7280]">
                <Clock3 size={16} />
                Last activity {formatDateTime(conversation.lastActivityAt)}
              </div>
            </div>

            <div className="space-y-5 bg-[#F9FAFB] px-4 py-6 sm:px-6">
              {conversation.messages.map((message, index) => (
                <MessageBubble key={`${message.createdAt}-${index}`} message={message} />
              ))}
            </div>

            {isResolved ? (
              <div className="border-t border-[#E5E7EB] bg-white p-4 text-center text-sm text-[#6B7280] sm:p-6">
                This conversation is resolved. The student's next message will start a new conversation.
              </div>
            ) : canManage ? (
              <div className="border-t border-[#E5E7EB] bg-white p-4 sm:p-6">
                <label className="sr-only" htmlFor="advisor-reply">
                  Reply to student
                </label>
                <textarea
                  className="min-h-24 w-full resize-y rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm leading-6 text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#045A58] focus:ring-4 focus:ring-[#E6F4F3]"
                  id="advisor-reply"
                  onChange={(event) => setReplyText(event.target.value)}
                  placeholder="Write an advisor reply..."
                  value={replyText}
                />
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs leading-5 text-[#6B7280]">
                    Advisor replies will be sent to the student through Telegram.
                  </p>
                  <Button
                    disabled={reply.isPending || !replyText.trim()}
                    leftIcon={<Send size={16} />}
                    onClick={handleReply}
                    size="md"
                  >
                    Send reply
                  </Button>
                </div>
              </div>
            ) : null}
          </Card>

          <aside className="space-y-6 xl:sticky xl:top-26 xl:self-start">
            <Card>
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E6F4F3] text-sm font-semibold text-[#045A58]">
                  {conversation.student.firstName[0]}
                  {conversation.student.lastName?.[0] ?? ''}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#111827]">{studentName}</h2>
                  <p className="mt-1 text-xs font-medium text-[#6B7280]">{conversation.student.publicId}</p>
                </div>
              </div>

              <div className="mt-5 space-y-4 border-t border-[#E5E7EB] pt-5">
                <ContactItem icon={<Mail size={16} />} value={conversation.student.email ?? 'Not provided'} />
                <ContactItem icon={<Phone size={16} />} value={conversation.student.phone ?? 'Not provided'} />
              </div>

              <Link
                className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-semibold text-[#111827] outline-none transition hover:bg-[#F9FAFB] focus:ring-4 focus:ring-[#E6F4F3]"
                to={`/students/${conversation.student.publicId}`}
              >
                <UserRound size={16} />
                Open student record
              </Link>
            </Card>

            <Card>
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-[#111827]">Assignment</h2>
                  <p className="mt-1 text-sm text-[#6B7280]">Advisor ownership and workflow.</p>
                </div>
                <UserRoundCheck className="text-[#045A58]" size={20} />
              </div>

              <label className="mb-2 block text-sm font-medium text-[#111827]" htmlFor="conversation-advisor">
                Assigned advisor
              </label>
              <select
                className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm font-medium text-[#374151] outline-none transition focus:border-[#045A58] focus:ring-4 focus:ring-[#E6F4F3] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!isAdmin || assignAdvisor.isPending}
                id="conversation-advisor"
                onChange={(event) => assignAdvisor.mutate(event.target.value === '' ? null : event.target.value)}
                value={conversation.student.assignedAdvisor?.publicId ?? ''}
              >
                <option value="">Unassigned</option>
                {advisorOptions.map((advisor) => (
                  <option key={advisor.publicId} value={advisor.publicId}>
                    {advisor.fullName}
                  </option>
                ))}
              </select>
              {!isAdmin ? <p className="mt-2 text-xs text-[#9CA3AF]">Only admins can reassign advisors.</p> : null}

              <div className="mt-5 space-y-4 border-t border-[#E5E7EB] pt-5">
                <MetaItem
                  icon={<MessageSquareText size={16} />}
                  label="Messages"
                  value={String(conversation.messages.length)}
                />
                <MetaItem icon={<CalendarDays size={16} />} label="Started" value={formatDateTime(conversation.createdAt)} />
                <MetaItem icon={<Clock3 size={16} />} label="Last activity" value={formatDateTime(conversation.lastActivityAt)} />
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </AppShell>
  )
}

const MessageBubble = ({ message }: { message: ConversationMessage }) => {
  const isStudent = message.senderType === 'STUDENT'
  const isAdvisor = message.senderType === 'ADVISOR'
  const isAgent = message.senderType === 'AGENT'
  const author = isStudent ? 'Student' : isAdvisor ? 'Advisor' : isAgent ? 'Pikinic AI' : 'System'

  return (
    <div className={`flex ${isStudent ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-[min(100%,42rem)] ${isStudent ? '' : 'text-right'}`}>
        <div className={`mb-2 flex items-center gap-2 ${isStudent ? '' : 'justify-end'}`}>
          {isAgent ? <Bot className="text-[#045A58]" size={15} /> : null}
          {isAdvisor ? <UserRoundCheck className="text-[#045A58]" size={15} /> : null}
          {isStudent ? <UserRound className="text-[#6B7280]" size={15} /> : null}
          <span className="text-xs font-semibold text-[#6B7280]">{author}</span>
          <span className="text-xs text-[#9CA3AF]">{formatDateTime(message.createdAt)}</span>
        </div>
        <div
          className={`rounded-2xl px-4 py-3 text-left text-sm leading-6 ${
            isStudent
              ? 'rounded-tl-md border border-[#E5E7EB] bg-white text-[#374151]'
              : isAdvisor
                ? 'rounded-tr-md bg-[#045A58] text-white'
                : 'rounded-tr-md border border-[#B7D8D6] bg-[#E6F4F3] text-[#174544]'
          }`}
        >
          {message.content}
        </div>
      </div>
    </div>
  )
}

const ContactItem = ({ icon, value }: { icon: ReactNode; value: string }) => (
  <div className="flex min-w-0 items-center gap-3 text-sm text-[#374151]">
    <span className="shrink-0 text-[#045A58]">{icon}</span>
    <span className="break-all">{value}</span>
  </div>
)

const MetaItem = ({ icon, label, value }: { icon: ReactNode; label: string; value: string }) => (
  <div className="flex items-center justify-between gap-4">
    <span className="inline-flex items-center gap-2 text-sm text-[#6B7280]">
      {icon}
      {label}
    </span>
    <span className="text-right text-sm font-semibold text-[#111827]">{value}</span>
  </div>
)

export default ConversationDetailPage
