import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  GitCompareArrows,
  GraduationCap,
  Loader2,
  MapPin,
  Search,
  Sparkles,
  Star,
  Users,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { isAxiosError } from 'axios'
import AppShell from '../../components/layout/AppShell.js'
import Badge from '../../components/ui/Badge.js'
import Button from '../../components/ui/Button.js'
import Card from '../../components/ui/Card.js'
import Input from '../../components/ui/Input.js'
import GenerateRecommendationsModal from '../../components/modals/GenerateRecommendationsModal.js'
import type { ApiErrorResponse } from '../../lib/api/types.js'
import { cn } from '../../utils/cn.js'
import { useTeamMembers } from '../../features/team/useTeamMembers.js'
import { useSettingGroups } from '../../features/settings/useSettings.js'
import {
  useCreateShortlist,
  useDeleteShortlist,
  useRecommendationsList,
} from '../../features/recommendations/useRecommendations.js'
import type { RecommendationListItem } from '../../features/recommendations/recommendations.api.js'

const PAGE_SIZE = 20

const formatTuition = (amount: number, currency: string) =>
  `${currency} ${amount.toLocaleString()}`

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })

const RecommendationsPage = () => {
  const [comparisonIds, setComparisonIds] = useState<string[]>([])
  const [country, setCountry] = useState('ALL')
  const [advisorId, setAdvisorId] = useState('ALL')
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchInput.trim()), 300)
    return () => clearTimeout(timeout)
  }, [searchInput])

  useEffect(() => setPage(1), [debouncedSearch, country, advisorId])

  const { data: advisors } = useTeamMembers()
  const advisorOptions = useMemo(() => (advisors ?? []).filter((member) => member.role === 'ADVISOR'), [advisors])

  const { data: settingGroups } = useSettingGroups()
  const countryOptions = useMemo(
    () => settingGroups?.find((group) => group.key === 'countries')?.values ?? [],
    [settingGroups],
  )

  const queryParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: debouncedSearch || undefined,
      country: country === 'ALL' ? undefined : country,
      advisorId: advisorId !== 'ALL' ? advisorId : undefined,
    }),
    [page, debouncedSearch, country, advisorId],
  )

  const { data, isLoading, isFetching, isError, error } = useRecommendationsList(queryParams)
  const recommendations = data?.recommendations ?? []
  const pagination = data?.pagination
  const summary = data?.summary

  const createShortlist = useCreateShortlist()
  const deleteShortlist = useDeleteShortlist()

  const comparisonItems = recommendations.filter((item) => comparisonIds.includes(item.publicId))

  const toggleComparison = (id: string) => {
    setComparisonIds((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id)
      }
      if (current.length >= 2) {
        return current
      }
      return [...current, id]
    })
  }

  const toggleShortlist = (recommendation: RecommendationListItem) => {
    if (recommendation.shortlisted) {
      deleteShortlist.mutate({ studentId: recommendation.studentId, programId: recommendation.program.publicId })
    } else {
      createShortlist.mutate({ studentId: recommendation.studentId, programId: recommendation.program.publicId })
    }
  }

  const recommendationStats = [
    { icon: Sparkles, label: 'Generated', note: 'Across the current scope', value: summary?.generated },
    { icon: Star, label: 'Shortlisted', note: 'Programs shortlisted', value: summary?.shortlisted },
    { icon: CheckCircle2, label: 'Strong matches', note: 'Score of 85 or higher', value: summary?.strongMatches },
    { icon: AlertCircle, label: 'Missing requirements', note: 'Needs advisor review', value: summary?.missingRequirements },
  ] as const

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-medium text-[#6B7280]">Placement review</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal text-[#111827]">Recommendations</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6B7280]">
              Review scored school matches from stored program data, inspect scoring evidence, compare options, and manage student shortlists.
            </p>
          </div>

          <Button
            leftIcon={<Sparkles size={17} />}
            onClick={() => setIsGenerateModalOpen(true)}
            size="md"
          >
            Generate recommendations
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {recommendationStats.map((stat) => {
            const Icon = stat.icon

            return (
              <Card className="p-5" key={stat.label}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[#6B7280]">{stat.label}</p>
                    <p className="mt-3 text-3xl font-semibold tracking-normal text-[#111827]">
                      {stat.value ?? '—'}
                    </p>
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
                <h2 className="text-lg font-semibold text-[#111827]">Recommendation review</h2>
                <p className="mt-1 text-sm text-[#6B7280]">
                  Select up to two recommendations for side-by-side comparison.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 xl:w-[760px]">
                <Input
                  className="h-11 bg-[#F9FAFB]"
                  id="recommendation-search"
                  leftIcon={<Search size={18} />}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search student, school, or program"
                  type="search"
                  value={searchInput}
                />
                <label className="sr-only" htmlFor="advisor-filter">
                  Advisor
                </label>
                <select
                  className="h-11 rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm font-medium text-[#374151] outline-none transition focus:border-[#045A58] focus:ring-4 focus:ring-[#E6F4F3]"
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
                <label className="sr-only" htmlFor="country-filter">
                  Country
                </label>
                <select
                  className="h-11 rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm font-medium text-[#374151] outline-none transition focus:border-[#045A58] focus:ring-4 focus:ring-[#E6F4F3]"
                  id="country-filter"
                  onChange={(event) => setCountry(event.target.value)}
                  value={country}
                >
                  <option value="ALL">All countries</option>
                  {countryOptions.map((value) => (
                    <option key={value.id} value={value.label}>
                      {value.label}
                    </option>
                  ))}
                </select>
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
                  ? (error.response?.data.error.message ?? 'Failed to load recommendations')
                  : 'Failed to load recommendations'}
              </p>
            </div>
          ) : recommendations.length ? (
            <div className={cn('divide-y divide-[#E5E7EB]', isFetching && 'opacity-60')}>
              {recommendations.map((recommendation) => {
                const isCompared = comparisonIds.includes(recommendation.publicId)

                return (
                  <article className="px-5 py-6 transition hover:bg-[#F9FAFB] sm:px-6" key={recommendation.publicId}>
                    <div className="grid gap-6 2xl:grid-cols-[220px_minmax(0,1fr)_260px_180px]">
                      <div>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#E6F4F3] text-sm font-semibold text-[#045A58]">
                            {recommendation.studentName
                              .split(' ')
                              .map((name) => name[0])
                              .join('')
                              .slice(0, 2)}
                          </div>
                          <div>
                            <Link
                              className="text-sm font-semibold text-[#111827] outline-none transition hover:text-[#045A58] focus:underline"
                              to={`/students/${recommendation.studentId}`}
                            >
                              {recommendation.studentName}
                            </Link>
                            <p className="mt-1 text-xs font-medium text-[#6B7280]">
                              {recommendation.studentId} / {formatDate(recommendation.createdAt)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 rounded-2xl border border-[#E5E7EB] bg-white p-4">
                          <div className="flex items-end justify-between gap-3">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-normal text-[#9CA3AF]">Fit score</p>
                              <p className="mt-1 text-3xl font-semibold text-[#111827]">
                                {recommendation.overallScore}
                              </p>
                            </div>
                            <Badge tone={recommendation.overallScore >= 85 ? 'success' : 'warning'}>
                              {recommendation.overallScore >= 85 ? 'Strong match' : 'Review'}
                            </Badge>
                          </div>
                          <div className="mt-3 h-2 rounded-full bg-[#E5E7EB]">
                            <div
                              className="h-2 rounded-full bg-[#045A58]"
                              style={{ width: `${recommendation.overallScore}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <Link
                              className="text-base font-semibold text-[#111827] outline-none transition hover:text-[#045A58] focus:underline"
                              to={`/schools/${recommendation.school.publicId}`}
                            >
                              {recommendation.school.name}
                            </Link>
                            <Link
                              className="mt-1 block text-sm font-medium text-[#045A58] outline-none hover:text-[#034A48] focus:underline"
                              to={`/programs/${recommendation.program.publicId}`}
                            >
                              {recommendation.program.name}
                            </Link>
                          </div>
                          <div className="text-right">
                            <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#111827]">
                              <CircleDollarSign size={16} className="text-[#6B7280]" />
                              {formatTuition(recommendation.program.tuitionAmount, recommendation.program.tuitionCurrency)}
                            </p>
                            <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-[#6B7280]">
                              <MapPin size={14} />
                              {recommendation.school.country}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-normal text-[#9CA3AF]">Why it matches</p>
                            {recommendation.reasons.length ? (
                              <ul className="mt-2 space-y-2">
                                {recommendation.reasons.map((reason) => (
                                  <li className="flex items-start gap-2 text-sm text-[#374151]" key={reason}>
                                    <Check className="mt-0.5 shrink-0 text-[#16A34A]" size={15} />
                                    {reason}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="mt-2 text-sm text-[#6B7280]">No standout reasons on file.</p>
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-normal text-[#9CA3AF]">Missing requirements</p>
                            {recommendation.missingRequirements.length ? (
                              <ul className="mt-2 space-y-2">
                                {recommendation.missingRequirements.map((requirement) => (
                                  <li className="flex items-start gap-2 text-sm text-[#92400E]" key={requirement}>
                                    <AlertCircle className="mt-0.5 shrink-0" size={15} />
                                    {requirement}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-[#166534]">
                                <CheckCircle2 size={15} />
                                No known gaps
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-normal text-[#9CA3AF]">Score breakdown</p>
                        <div className="mt-3 space-y-3">
                          <ScoreRow label="Program" value={recommendation.scoreBreakdown.program} />
                          <ScoreRow label="Budget" value={recommendation.scoreBreakdown.budget} />
                          <ScoreRow label="Intake" value={recommendation.scoreBreakdown.intake} />
                          <ScoreRow label="Visa" value={recommendation.scoreBreakdown.visa} />
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <button
                          className={cn(
                            'inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold outline-none transition focus:ring-4',
                            recommendation.shortlisted
                              ? 'border-[#B7D8D6] bg-[#E6F4F3] text-[#045A58] focus:ring-[#E6F4F3]'
                              : 'border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F9FAFB] focus:ring-[#E6F4F3]',
                          )}
                          disabled={createShortlist.isPending || deleteShortlist.isPending}
                          onClick={() => toggleShortlist(recommendation)}
                          type="button"
                        >
                          <Star fill={recommendation.shortlisted ? 'currentColor' : 'none'} size={16} />
                          {recommendation.shortlisted ? 'Shortlisted' : 'Shortlist'}
                        </button>
                        <button
                          className={cn(
                            'inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold outline-none transition focus:ring-4',
                            isCompared
                              ? 'border-[#045A58] bg-[#045A58] text-white focus:ring-[#E6F4F3]'
                              : 'border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F9FAFB] focus:ring-[#E6F4F3]',
                            !isCompared && comparisonIds.length >= 2 && 'cursor-not-allowed opacity-50',
                          )}
                          disabled={!isCompared && comparisonIds.length >= 2}
                          onClick={() => toggleComparison(recommendation.publicId)}
                          type="button"
                        >
                          <GitCompareArrows size={16} />
                          {isCompared ? 'Selected' : 'Compare'}
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E6F4F3] text-[#045A58]">
                <Sparkles size={21} />
              </div>
              <h3 className="mt-4 text-base font-semibold text-[#111827]">No recommendations match these filters</h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-[#6B7280]">
                Change the advisor, country, or search filters, or generate recommendations for a student.
              </p>
              <Button
                className="mt-5"
                onClick={() => {
                  setCountry('ALL')
                  setAdvisorId('ALL')
                  setSearchInput('')
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
                Showing <span className="font-semibold text-[#111827]">{recommendations.length}</span> of{' '}
                <span className="font-semibold text-[#111827]">{pagination.total}</span> recommendations
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

        {comparisonItems.length ? (
          <Card className="p-0">
            <div className="flex flex-col gap-3 border-b border-[#E5E7EB] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#111827]">School comparison</h2>
                <p className="mt-1 text-sm text-[#6B7280]">
                  {comparisonItems.length === 1 ? 'Select one more recommendation to compare.' : 'Side-by-side recommendation evidence.'}
                </p>
              </div>
              <Button onClick={() => setComparisonIds([])} size="sm" variant="ghost">
                Clear comparison
              </Button>
            </div>

            <div className="grid divide-y divide-[#E5E7EB] lg:grid-cols-2 lg:divide-x lg:divide-y-0">
              {comparisonItems.map((item) => (
                <div className="p-6" key={item.publicId}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-base font-semibold text-[#111827]">{item.school.name}</p>
                      <p className="mt-1 text-sm text-[#045A58]">{item.program.name}</p>
                    </div>
                    <button
                      aria-label={`Remove ${item.school.name} from comparison`}
                      className="flex h-8 w-8 items-center justify-center rounded-xl text-[#6B7280] outline-none hover:bg-[#F3F4F6] hover:text-[#111827]"
                      onClick={() => toggleComparison(item.publicId)}
                      type="button"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-4">
                    <ComparisonMetric icon={<Sparkles size={16} />} label="Fit score" value={`${item.overallScore}%`} />
                    <ComparisonMetric
                      icon={<CircleDollarSign size={16} />}
                      label="Tuition"
                      value={formatTuition(item.program.tuitionAmount, item.program.tuitionCurrency)}
                    />
                    <ComparisonMetric icon={<GraduationCap size={16} />} label="Program fit" value={`${item.scoreBreakdown.program}%`} />
                    <ComparisonMetric icon={<MapPin size={16} />} label="Country" value={item.school.country} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : null}
      </div>

      <GenerateRecommendationsModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
      />
    </AppShell>
  )
}

const ScoreRow = ({ label, value }: { label: string; value: number }) => (
  <div>
    <div className="mb-1.5 flex items-center justify-between gap-3">
      <span className="text-sm text-[#6B7280]">{label}</span>
      <span className="text-sm font-semibold text-[#111827]">{value}</span>
    </div>
    <div className="h-1.5 rounded-full bg-[#E5E7EB]">
      <div className="h-1.5 rounded-full bg-[#045A58]" style={{ width: `${value}%` }} />
    </div>
  </div>
)

const ComparisonMetric = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) => (
  <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
    <div className="flex items-center gap-2 text-[#045A58]">
      {icon}
      <span className="text-xs font-semibold uppercase tracking-normal text-[#6B7280]">{label}</span>
    </div>
    <p className="mt-2 text-sm font-semibold text-[#111827]">{value}</p>
  </div>
)

export default RecommendationsPage
