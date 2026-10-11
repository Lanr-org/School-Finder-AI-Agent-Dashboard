import { isAxiosError } from 'axios'
import { AlertCircle, CheckCircle2, ClipboardPaste, Loader2, Sparkles, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import type { ProgramExtractResult } from '../../features/programs/programs.api.js'
import { useExtractProgram } from '../../features/programs/usePrograms.js'
import { apiErrorMessage } from '../../lib/api/errors.js'
import type { ApiErrorResponse } from '../../lib/api/types.js'
import Button from '../ui/Button.js'
import Card from '../ui/Card.js'
import Input from '../ui/Input.js'

const FIELD_LABELS: Record<string, string> = {
  name: 'Program name',
  studyLevel: 'Study level',
  qualification: 'Qualification',
  duration: 'Duration',
  tuitionAmount: 'Tuition',
  tuitionCurrency: 'Currency',
  feesAcademicYear: 'Fees year',
  intakes: 'Intakes',
  academicRequirements: 'Academic requirements',
  englishRequirements: 'English requirements',
  scholarshipAvailability: 'Scholarships',
}

// The fees year is left out: the API already warns when a fee has no year.
const KEY_FIELDS = ['tuitionAmount', 'intakes', 'academicRequirements', 'englishRequirements']

// The page couldn't be read (blocked, JavaScript-only, bad link): the API says why under details.url.
const pageProblem = (error: unknown): string | null => {
  if (!isAxiosError<ApiErrorResponse>(error)) return null
  const details = error.response?.data?.error?.details as Record<string, unknown> | undefined
  const problems = details?.['url']
  return Array.isArray(problems) && typeof problems[0] === 'string' ? problems[0] : null
}

type FillFromPageCardProps = {
  onDraft: (result: ProgramExtractResult) => void
}

const FillFromPageCard = ({ onDraft }: FillFromPageCardProps) => {
  const extract = useExtractProgram()
  const [url, setUrl] = useState('')
  const [pageText, setPageText] = useState('')
  const [showPaste, setShowPaste] = useState(false)
  const [result, setResult] = useState<ProgramExtractResult | null>(null)

  const run = (input: { url?: string; pageText?: string }) => {
    setResult(null)
    extract.mutate(input, {
      onSuccess: (data) => {
        setResult(data)
        onDraft(data)
      },
      onError: (error) => {
        if (pageProblem(error)) setShowPaste(true)
      },
    })
  }

  const trimmedUrl = url.trim()
  const problem = extract.isError ? (pageProblem(extract.error) ?? apiErrorMessage(extract.error)) : null
  const filled = result ? Object.keys(result.draft).length : 0
  // Facts that matching relies on but the page doesn't state (often they're on a separate fees page).
  const missing = result
    ? KEY_FIELDS.filter((field) => !(field in result.draft) && !result.dropped.includes(field))
    : []

  return (
    <Card>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#E6F4F3] text-[#045A58]">
          <Sparkles size={19} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-[#111827]">Fill from the course page</h2>
          <p className="mt-1 text-sm leading-6 text-[#6B7280]">
            Paste the university's course link. The AI copies each fact with the exact words it came from; anything it
            can't find on the page stays empty for you to fill.
          </p>

          <form
            className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
            onSubmit={(event) => {
              event.preventDefault()
              if (trimmedUrl !== '') run({ url: trimmedUrl })
            }}
          >
            <div className="min-w-0 flex-1">
              <Input
                id="extract-url"
                label="Course page link"
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://www.herts.ac.uk/courses/postgraduate-masters/..."
                type="url"
                value={url}
              />
            </div>
            <Button
              disabled={extract.isPending || trimmedUrl === ''}
              leftIcon={extract.isPending ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
              size="lg"
              type="submit"
            >
              {extract.isPending ? 'Reading…' : 'Read course page'}
            </Button>
          </form>

          {showPaste ? (
            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-[#111827]" htmlFor="extract-text">
                Or paste the page text
              </label>
              <textarea
                className="w-full resize-y rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm leading-6 text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#045A58] focus:ring-4 focus:ring-[#E6F4F3]"
                id="extract-text"
                onChange={(event) => setPageText(event.target.value)}
                placeholder="On the course page press Ctrl+A, then Ctrl+C, and paste here. Open the fees and entry requirements sections first if they are folded."
                rows={5}
                value={pageText}
              />
              <Button
                className="mt-3"
                disabled={extract.isPending || pageText.trim().length < 200}
                leftIcon={<ClipboardPaste size={16} />}
                onClick={() =>
                  run({
                    pageText: pageText.trim(),
                    ...(trimmedUrl.startsWith('https://') ? { url: trimmedUrl } : {}),
                  })
                }
                size="md"
                type="button"
                variant="secondary"
              >
                Read pasted text
              </Button>
            </div>
          ) : (
            <button
              className="mt-3 text-sm font-semibold text-[#045A58] hover:text-[#034A48]"
              onClick={() => setShowPaste(true)}
              type="button"
            >
              Site won't load? Paste the page text instead
            </button>
          )}

          {problem ? (
            <p className="mt-4 flex items-start gap-2 text-sm leading-6 text-[#B91C1C]">
              <AlertCircle className="mt-1 shrink-0" size={15} />
              {problem}
            </p>
          ) : null}

          {result ? (
            <div className="mt-4 space-y-2 border-t border-[#E5E7EB] pt-4 text-sm leading-6">
              <p className="flex items-start gap-2 text-[#111827]">
                <CheckCircle2 className="mt-1 shrink-0 text-[#045A58]" size={15} />
                {filled > 0
                  ? `Filled ${filled} ${filled === 1 ? 'field' : 'fields'} from the page. Check each against its quote before saving.`
                  : 'Nothing on this page could be confirmed. Fill the form by hand.'}
              </p>
              {missing.length > 0 ? (
                <p className="flex items-start gap-2 text-[#92400E]">
                  <TriangleAlert className="mt-1 shrink-0" size={15} />
                  <span>
                    Not on this page: {missing.map((field) => FIELD_LABELS[field] ?? field).join(', ')}. Check the
                    university's fees or entry pages and fill these by hand.
                  </span>
                </p>
              ) : null}
              {result.dropped.length > 0 ? (
                <p className="flex items-start gap-2 text-[#92400E]">
                  <TriangleAlert className="mt-1 shrink-0" size={15} />
                  <span>
                    Couldn't confirm on the page, so enter by hand:{' '}
                    {result.dropped.map((field) => FIELD_LABELS[field] ?? field).join(', ')}
                  </span>
                </p>
              ) : null}
              {result.warnings.map((warning) => (
                <p className="flex items-start gap-2 text-[#92400E]" key={warning}>
                  <TriangleAlert className="mt-1 shrink-0" size={15} />
                  {warning}
                </p>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  )
}

export default FillFromPageCard
