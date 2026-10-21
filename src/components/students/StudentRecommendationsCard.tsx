import { AlertCircle, Check, Loader2, Sparkles, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import Badge from '../ui/Badge.js'
import Button from '../ui/Button.js'
import Card from '../ui/Card.js'
import { apiErrorMessage } from '../../lib/api/errors.js'
import {
  useCreateShortlist,
  useDeleteShortlist,
  useGenerateRecommendationRun,
  useStudentRecommendations,
} from '../../features/recommendations/useRecommendations.js'
import type { StudentRecommendation } from '../../features/recommendations/recommendations.api.js'

const formatTuition = (amount: number, currency: string) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)

const scoreTone = (score: number) => (score >= 85 ? 'success' : score >= 65 ? 'brand' : 'warning')

// The student's latest scored matches and shortlist, so the advisor doesn't have to
// leave the student to see them. Same data the student sees in the web app.
const StudentRecommendationsCard = ({ studentId }: { studentId: string }) => {
  const { data, isLoading, isError } = useStudentRecommendations(studentId)
  const generateRun = useGenerateRecommendationRun()
  const createShortlist = useCreateShortlist()
  const deleteShortlist = useDeleteShortlist()

  const pendingProgramId =
    (createShortlist.isPending && createShortlist.variables?.programId) ||
    (deleteShortlist.isPending && deleteShortlist.variables?.programId) ||
    null
  const shortlistError = createShortlist.error ?? deleteShortlist.error

  const toggleShortlist = (recommendation: StudentRecommendation) => {
    createShortlist.reset()
    deleteShortlist.reset()
    const variables = { studentId, programId: recommendation.program.publicId }
    if (recommendation.shortlisted) deleteShortlist.mutate(variables)
    else createShortlist.mutate(variables)
  }

  const recommendations = data?.recommendations ?? []
  const shortlistedCount = recommendations.filter((item) => item.shortlisted).length

  return (
    <Card>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#ECEFFF] text-[#2B4BFF]">
            <Sparkles size={19} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#111827]">Recommendations</h2>
            <p className="text-sm text-[#6B7280]">
              {data?.createdAt
                ? `${recommendations.length} matches · ${shortlistedCount} shortlisted · scored ${new Date(data.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
                : 'Not generated yet'}
            </p>
          </div>
        </div>
        <Button
          disabled={generateRun.isPending}
          leftIcon={generateRun.isPending ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
          onClick={() => generateRun.mutate({ studentId })}
          size="md"
          variant="secondary"
        >
          {generateRun.isPending ? 'Generating…' : data?.createdAt ? 'Regenerate' : 'Generate'}
        </Button>
      </div>

      {generateRun.isError ? (
        <p className="mt-3 text-sm text-[#B42318]">{apiErrorMessage(generateRun.error, "Couldn't generate recommendations.")}</p>
      ) : null}
      {shortlistError ? (
        <p className="mt-3 text-sm text-[#B42318]">{apiErrorMessage(shortlistError, "Couldn't update the shortlist.")}</p>
      ) : null}

      {isLoading ? (
        <Loader2 className="mt-5 animate-spin text-[#6B7280]" size={20} />
      ) : isError ? (
        <p className="mt-5 text-sm text-[#6B7280]">Couldn't load recommendations.</p>
      ) : recommendations.length ? (
        <ul className="mt-5 space-y-3">
          {recommendations.map((recommendation) => {
            const isRowPending = pendingProgramId === recommendation.program.publicId
            return (
              <li className="rounded-2xl border border-[#E5E7EB] p-4" key={recommendation.publicId}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <Link
                      className="block truncate text-sm font-semibold text-[#111827] hover:text-[#2B4BFF]"
                      to={`/programs/${recommendation.program.publicId}`}
                    >
                      {recommendation.program.name}
                    </Link>
                    <p className="mt-0.5 text-sm text-[#6B7280]">
                      {recommendation.school.name} · {recommendation.school.city}, {recommendation.school.country} ·{' '}
                      {formatTuition(recommendation.program.tuitionAmount, recommendation.program.tuitionCurrency)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge tone={scoreTone(recommendation.overallScore)}>{Math.round(recommendation.overallScore)}</Badge>
                    <button
                      aria-pressed={recommendation.shortlisted}
                      className={`inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-sm font-semibold outline-none transition focus:ring-4 focus:ring-[#ECEFFF] disabled:opacity-60 ${
                        recommendation.shortlisted
                          ? 'border-[#C2CBFF] bg-[#ECEFFF] text-[#2B4BFF]'
                          : 'border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F9FAFB]'
                      }`}
                      disabled={pendingProgramId !== null}
                      onClick={() => toggleShortlist(recommendation)}
                      type="button"
                    >
                      {isRowPending ? (
                        <Loader2 className="animate-spin" size={15} />
                      ) : (
                        <Star fill={recommendation.shortlisted ? 'currentColor' : 'none'} size={15} />
                      )}
                      {isRowPending ? 'Saving…' : recommendation.shortlisted ? 'Shortlisted' : 'Shortlist'}
                    </button>
                  </div>
                </div>

                <p className="mt-3 text-xs text-[#6B7280]">
                  Program {Math.round(recommendation.scoreBreakdown.program)} · Budget{' '}
                  {Math.round(recommendation.scoreBreakdown.budget)} · Intake {Math.round(recommendation.scoreBreakdown.intake)}{' '}
                  · Visa {Math.round(recommendation.scoreBreakdown.visa)}
                </p>

                {recommendation.reasons.length || recommendation.missingRequirements.length ? (
                  <ul className="mt-2 space-y-1">
                    {recommendation.reasons.map((reason) => (
                      <li className="flex items-start gap-2 text-sm text-[#374151]" key={reason}>
                        <Check className="mt-0.5 shrink-0 text-[#16A34A]" size={14} />
                        {reason}
                      </li>
                    ))}
                    {recommendation.missingRequirements.map((requirement) => (
                      <li className="flex items-start gap-2 text-sm text-[#92400E]" key={requirement}>
                        <AlertCircle className="mt-0.5 shrink-0" size={14} />
                        {requirement}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="mt-5 text-sm text-[#6B7280]">
          No matches yet. Generate to score this student's profile against active programs.
        </p>
      )}
    </Card>
  )
}

export default StudentRecommendationsCard
