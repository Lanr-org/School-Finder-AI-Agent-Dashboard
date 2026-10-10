import { AlertCircle, ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, Flag, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell.js'
import Button from '../../components/ui/Button.js'
import Card from '../../components/ui/Card.js'
import type { ReportStatus } from '../../features/programs/programs.api.js'
import { formatDate } from '../../features/programs/programs.format.js'
import { useProgramReports, useResolveReport } from '../../features/programs/usePrograms.js'
import { apiErrorMessage } from '../../lib/api/errors.js'

const TABS: { label: string; value: ReportStatus }[] = [
  { label: 'Open', value: 'OPEN' },
  { label: 'Resolved', value: 'RESOLVED' },
]

const ProgramReportsPage = () => {
  const [status, setStatus] = useState<ReportStatus>('OPEN')
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, error, isFetching } = useProgramReports(status, page)
  const resolve = useResolveReport()

  const reports = data?.reports ?? []
  const pagination = data?.pagination

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <Link
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#045A58] transition hover:text-[#034A48]"
            to="/programs"
          >
            <ArrowLeft size={16} />
            Programs
          </Link>
          <h1 className="mt-4 text-3xl font-semibold tracking-normal text-[#111827]">Outdated-data reports</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6B7280]">
            Staff flag programmes whose fees, deadlines or requirements look wrong. Check each one against the official
            course page, fix it, mark the programme verified, then resolve the report.
          </p>
        </div>

        <Card className="p-0">
          <div className="flex gap-2 border-b border-[#E5E7EB] px-5 py-4 sm:px-6" role="tablist">
            {TABS.map((tab) => (
              <button
                aria-selected={status === tab.value}
                className={`h-9 rounded-xl px-4 text-sm font-semibold transition ${
                  status === tab.value ? 'bg-[#E6F4F3] text-[#045A58]' : 'text-[#6B7280] hover:bg-[#F9FAFB]'
                }`}
                key={tab.value}
                onClick={() => {
                  setStatus(tab.value)
                  setPage(1)
                }}
                role="tab"
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex min-h-60 items-center justify-center">
              <Loader2 className="animate-spin text-[#045A58]" size={24} />
            </div>
          ) : isError ? (
            <div className="flex min-h-60 flex-col items-center justify-center gap-3 px-6 text-center">
              <AlertCircle className="text-[#DC2626]" size={24} />
              <p className="text-sm text-[#6B7280]">{apiErrorMessage(error, 'Failed to load reports')}</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="flex min-h-60 flex-col items-center justify-center gap-3 px-6 text-center">
              <Flag className="text-[#9CA3AF]" size={24} />
              <p className="text-sm text-[#6B7280]">
                {status === 'OPEN' ? 'No open reports. Nothing flagged as outdated.' : 'No resolved reports yet.'}
              </p>
            </div>
          ) : (
            <ul className={`divide-y divide-[#E5E7EB] ${isFetching ? 'opacity-60' : ''}`}>
              {reports.map((report) => (
                <li className="flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6" key={report.id}>
                  <div className="min-w-0">
                    <Link
                      className="text-sm font-semibold text-[#111827] hover:text-[#045A58]"
                      to={`/programs/${report.program.publicId}`}
                    >
                      {report.program.name}
                    </Link>
                    <p className="mt-0.5 text-xs font-medium text-[#6B7280]">
                      {report.program.schoolName} · {report.program.publicId}
                    </p>
                    <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[#374151]">{report.message}</p>
                    <p className="mt-2 text-xs text-[#6B7280]">
                      Reported by {report.reportedBy.fullName} on {formatDate(report.createdAt)}
                      {report.resolvedBy
                        ? ` · Resolved by ${report.resolvedBy.fullName} on ${formatDate(report.resolvedAt)}`
                        : ''}
                    </p>
                  </div>
                  {report.status === 'OPEN' ? (
                    <Button
                      className="shrink-0"
                      disabled={resolve.isPending && resolve.variables === report.id}
                      leftIcon={<CheckCircle2 size={16} />}
                      onClick={() => resolve.mutate(report.id)}
                      size="sm"
                      variant="secondary"
                    >
                      Mark resolved
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
          )}

          {resolve.isError ? (
            <p className="border-t border-[#E5E7EB] px-6 py-3 text-sm text-[#991B1B]" role="alert">
              {apiErrorMessage(resolve.error)}
            </p>
          ) : null}

          {pagination && pagination.totalPages > 1 ? (
            <div className="flex items-center justify-between border-t border-[#E5E7EB] px-6 py-4">
              <p className="text-sm text-[#6B7280]">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  aria-label="Previous page"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => current - 1)}
                  size="sm"
                  variant="secondary"
                >
                  <ChevronLeft size={16} />
                </Button>
                <Button
                  aria-label="Next page"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((current) => current + 1)}
                  size="sm"
                  variant="secondary"
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          ) : null}
        </Card>
      </div>
    </AppShell>
  )
}

export default ProgramReportsPage
