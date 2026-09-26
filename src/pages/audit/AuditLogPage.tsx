import { AlertCircle, ChevronDown, ChevronLeft, ChevronRight, Loader2, ScrollText, Search } from 'lucide-react'
import { Fragment, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { isAxiosError } from 'axios'
import AppShell from '../../components/layout/AppShell.js'
import Badge from '../../components/ui/Badge.js'
import Button from '../../components/ui/Button.js'
import Card from '../../components/ui/Card.js'
import Input from '../../components/ui/Input.js'
import type { ApiErrorResponse } from '../../lib/api/types.js'
import { cn } from '../../utils/cn.js'
import { useTeamMembers } from '../../features/team/useTeamMembers.js'
import { useAuditLogs } from '../../features/audit/useAuditLogs.js'
import type { AuditAction, AuditEntityType, AuditLog } from '../../features/audit/audit.api.js'
import {
  auditActionGroups,
  auditActionLabels,
  auditActionTone,
  auditEntityLabels,
  auditEntityLink,
  diffSnapshots,
  formatAuditValue,
  humanizeField,
} from '../../features/audit/auditLabels.js'

const PAGE_SIZE = 20

const selectClassName =
  'h-11 rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm font-medium text-[#374151] outline-none transition focus:border-[#045A58] focus:ring-4 focus:ring-[#E6F4F3]'

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  })

// Date inputs give "YYYY-MM-DD"; widen to cover the whole selected days.
const startOfDay = (date: string) => (date ? new Date(`${date}T00:00:00`).toISOString() : undefined)
const endOfDay = (date: string) => (date ? new Date(`${date}T23:59:59.999`).toISOString() : undefined)

const AuditLogPage = () => {
  const [action, setAction] = useState<AuditAction | 'ALL'>('ALL')
  const [entityType, setEntityType] = useState<AuditEntityType | 'ALL'>('ALL')
  const [actorId, setActorId] = useState('ALL')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [entityInput, setEntityInput] = useState('')
  const [entityId, setEntityId] = useState('')
  const [page, setPage] = useState(1)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    const timeout = setTimeout(() => {
      const value = entityInput.trim()
      // Public IDs (STU-1927, USR-…) are stored uppercase; session and setting
      // IDs are lowercase UUIDs, so only normalise what looks like a public ID.
      setEntityId(/^[a-z]{2,4}-[a-z0-9]+$/i.test(value) ? value.toUpperCase() : value)
    }, 300)
    return () => clearTimeout(timeout)
  }, [entityInput])

  useEffect(() => setPage(1), [action, entityType, actorId, fromDate, toDate, entityId])

  const { data: teamMembers } = useTeamMembers()

  const queryParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      action: action === 'ALL' ? undefined : action,
      entityType: entityType === 'ALL' ? undefined : entityType,
      actorId: actorId === 'ALL' ? undefined : actorId,
      entityId: entityId || undefined,
      from: startOfDay(fromDate),
      to: endOfDay(toDate),
    }),
    [page, action, entityType, actorId, entityId, fromDate, toDate],
  )

  const { data, isLoading, isFetching, isError, error } = useAuditLogs(queryParams)
  const logs = data?.logs ?? []
  const pagination = data?.pagination

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium text-[#6B7280]">Admin</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-normal text-[#111827]">Audit log</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6B7280]">
            Who changed what, and when — sign-in failures, team changes, student and application status, catalog
            edits, and settings. Entries are permanent and cannot be edited.
          </p>
        </div>

        <Card className="p-0">
          <div className="border-b border-[#E5E7EB] px-5 py-5 sm:px-6">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
              <label className="sr-only" htmlFor="audit-action-filter">
                Action
              </label>
              <select
                className={cn(selectClassName, 'xl:col-span-2')}
                id="audit-action-filter"
                onChange={(event) => setAction(event.target.value as AuditAction | 'ALL')}
                value={action}
              >
                <option value="ALL">All actions</option>
                {auditActionGroups.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.actions.map((value) => (
                      <option key={value} value={value}>
                        {auditActionLabels[value]}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>

              <label className="sr-only" htmlFor="audit-entity-filter">
                Record type
              </label>
              <select
                className={selectClassName}
                id="audit-entity-filter"
                onChange={(event) => setEntityType(event.target.value as AuditEntityType | 'ALL')}
                value={entityType}
              >
                <option value="ALL">All record types</option>
                {(Object.keys(auditEntityLabels) as AuditEntityType[]).map((value) => (
                  <option key={value} value={value}>
                    {auditEntityLabels[value]}
                  </option>
                ))}
              </select>

              <label className="sr-only" htmlFor="audit-actor-filter">
                Changed by
              </label>
              <select
                className={selectClassName}
                id="audit-actor-filter"
                onChange={(event) => setActorId(event.target.value)}
                value={actorId}
              >
                <option value="ALL">Anyone</option>
                {(teamMembers ?? []).map((member) => (
                  <option key={member.publicId} value={member.publicId}>
                    {member.fullName}
                  </option>
                ))}
              </select>

              <Input
                aria-label="Record ID"
                className="h-11 bg-[#F9FAFB]"
                id="audit-entity-id"
                leftIcon={<Search size={18} />}
                onChange={(event) => setEntityInput(event.target.value)}
                placeholder="Record ID, e.g. STU-1927"
                type="search"
                value={entityInput}
              />

              <div className="grid grid-cols-2 gap-2">
                <input
                  aria-label="From date"
                  className={selectClassName}
                  max={toDate || undefined}
                  onChange={(event) => setFromDate(event.target.value)}
                  type="date"
                  value={fromDate}
                />
                <input
                  aria-label="To date"
                  className={selectClassName}
                  min={fromDate || undefined}
                  onChange={(event) => setToDate(event.target.value)}
                  type="date"
                  value={toDate}
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
                  ? (error.response?.data.error.message ?? 'Failed to load the audit log')
                  : 'Failed to load the audit log'}
              </p>
            </div>
          ) : logs.length ? (
            <div className={cn('overflow-x-auto', isFetching && 'opacity-60')}>
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="bg-[#F9FAFB] text-xs font-semibold uppercase tracking-normal text-[#6B7280]">
                  <tr>
                    <th className="px-6 py-3">When</th>
                    <th className="px-6 py-3">Changed by</th>
                    <th className="px-6 py-3">Action</th>
                    <th className="px-6 py-3">Record</th>
                    <th className="w-12 px-6 py-3">
                      <span className="sr-only">Details</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {logs.map((log) => {
                    const isExpanded = expandedId === log.id
                    const link = auditEntityLink(log.entity.type, log.entity.id)

                    return (
                      <Fragment key={log.id}>
                        <tr
                          aria-expanded={isExpanded}
                          className="cursor-pointer transition hover:bg-[#F9FAFB]"
                          onClick={() => setExpandedId(isExpanded ? null : log.id)}
                        >
                          <td className="whitespace-nowrap px-6 py-4 text-[#374151]">
                            {formatDateTime(log.createdAt)}
                          </td>
                          <td className="px-6 py-4">
                            {log.actor ? (
                              <>
                                <p className="font-semibold text-[#111827]">{log.actor.fullName}</p>
                                <p className="mt-0.5 text-xs text-[#6B7280]">
                                  {log.actor.publicId}
                                  {log.actor.role ? ` · ${log.actor.role}` : ''}
                                </p>
                              </>
                            ) : (
                              <p className="text-[#6B7280]">System / anonymous</p>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <Badge tone={auditActionTone(log.action)}>{auditActionLabels[log.action]}</Badge>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-xs text-[#6B7280]">{auditEntityLabels[log.entity.type]}</p>
                            {link ? (
                              <Link
                                className="font-semibold text-[#045A58] outline-none hover:text-[#034A48] focus:underline"
                                onClick={(event) => event.stopPropagation()}
                                to={link}
                              >
                                {log.entity.id}
                              </Link>
                            ) : (
                              <p className="truncate font-medium text-[#374151]">{log.entity.id ?? '—'}</p>
                            )}
                          </td>
                          <td className="px-6 py-4 text-[#9CA3AF]">
                            <ChevronDown
                              className={cn('transition', isExpanded && 'rotate-180')}
                              size={18}
                            />
                          </td>
                        </tr>
                        {isExpanded ? (
                          <tr className="bg-[#F9FAFB]">
                            <td className="px-6 pb-5 pt-1" colSpan={5}>
                              <AuditLogDetail log={log} />
                            </td>
                          </tr>
                        ) : null}
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E6F4F3] text-[#045A58]">
                <ScrollText size={19} />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-[#111827]">No audit entries found</h3>
              <p className="mt-1 max-w-sm text-sm text-[#6B7280]">Try widening the date range or clearing filters.</p>
            </div>
          )}

          {pagination && pagination.totalPages > 1 ? (
            <div className="flex flex-col gap-3 border-t border-[#E5E7EB] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="text-sm text-[#6B7280]">
                Page <span className="font-semibold text-[#111827]">{pagination.page}</span> of{' '}
                <span className="font-semibold text-[#111827]">{pagination.totalPages}</span> ·{' '}
                {pagination.total} entries
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

const AuditLogDetail = ({ log }: { log: AuditLog }) => {
  const changes = diffSnapshots(log.before, log.after)
  const metadataEntries = Object.entries(log.metadata ?? {})
  const isCreate = !log.before && Boolean(log.after)
  const isRemoval = Boolean(log.before) && !log.after

  return (
    <div className="space-y-4">
      {changes.length ? (
        <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
          <div className="border-b border-[#E5E7EB] px-4 py-2 text-xs font-semibold uppercase tracking-normal text-[#9CA3AF]">
            {isCreate ? 'Created with' : isRemoval ? 'Removed' : 'Changes'}
          </div>
          <dl className="divide-y divide-[#F3F4F6]">
            {changes.map((change) => (
              <div className="grid gap-1 px-4 py-2 text-sm sm:grid-cols-[180px_1fr]" key={change.field}>
                <dt className="font-medium text-[#6B7280]">{humanizeField(change.field)}</dt>
                <dd className="text-[#111827]">
                  {isCreate ? (
                    formatAuditValue(change.after)
                  ) : isRemoval ? (
                    formatAuditValue(change.before)
                  ) : (
                    <>
                      <span className="text-[#9CA3AF] line-through">{formatAuditValue(change.before)}</span>
                      <span className="mx-2 text-[#9CA3AF]">→</span>
                      <span className="font-semibold">{formatAuditValue(change.after)}</span>
                    </>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}

      {metadataEntries.length ? (
        <dl className="grid gap-2 sm:grid-cols-2">
          {metadataEntries.map(([key, value]) => (
            <div className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-2" key={key}>
              <dt className="text-xs font-semibold uppercase tracking-normal text-[#9CA3AF]">{humanizeField(key)}</dt>
              <dd className="mt-1 text-sm text-[#111827]">{formatAuditValue(value)}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {!changes.length && !metadataEntries.length ? (
        <p className="text-sm text-[#6B7280]">No field-level details were recorded for this action.</p>
      ) : null}

      <p className="text-xs leading-5 text-[#9CA3AF]">
        Request {log.requestId ?? '—'} · IP {log.ipAddress ?? '—'} · {log.userAgent ?? 'Unknown client'}
      </p>
    </div>
  )
}

export default AuditLogPage
