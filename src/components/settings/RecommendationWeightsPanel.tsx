import { AlertCircle, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { isAxiosError } from 'axios'
import Badge from '../ui/Badge.js'
import Button from '../ui/Button.js'
import type { ApiErrorResponse } from '../../lib/api/types.js'
import {
  useRecommendationWeights,
  useUpdateRecommendationWeights,
} from '../../features/recommendations/useRecommendations.js'

type WeightKey = 'budgetWeight' | 'intakeWeight' | 'programWeight' | 'visaWeight'

const factors: { description: string; key: WeightKey; label: string }[] = [
  { description: 'Match between student interest and the program offering.', key: 'programWeight', label: 'Program fit' },
  { description: 'Alignment between tuition and the student budget range.', key: 'budgetWeight', label: 'Budget fit' },
  { description: 'Availability for the student target intake period.', key: 'intakeWeight', label: 'Intake fit' },
  { description: 'Internal visa-friendliness assessment and priorities.', key: 'visaWeight', label: 'Visa fit' },
]

type RecommendationWeightsPanelProps = {
  canManage: boolean
}

const RecommendationWeightsPanel = ({ canManage }: RecommendationWeightsPanelProps) => {
  const { data, isLoading, isError, error } = useRecommendationWeights()
  const updateWeights = useUpdateRecommendationWeights()

  const [weights, setWeights] = useState<Record<WeightKey, number>>({
    programWeight: 35,
    budgetWeight: 25,
    intakeWeight: 20,
    visaWeight: 20,
  })
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (data) {
      setWeights({
        programWeight: data.programWeight,
        budgetWeight: data.budgetWeight,
        intakeWeight: data.intakeWeight,
        visaWeight: data.visaWeight,
      })
    }
  }, [data])

  const total = factors.reduce((sum, factor) => sum + weights[factor.key], 0)

  const handleChange = (key: WeightKey, value: number) => {
    setWeights((current) => ({ ...current, [key]: Math.max(0, Math.min(100, value)) }))
  }

  const handleSave = () => {
    setSaveError(null)
    updateWeights.mutate(weights, {
      onError: (mutationError) => {
        setSaveError(
          isAxiosError<ApiErrorResponse>(mutationError)
            ? (mutationError.response?.data.error.message ?? 'Failed to save weights')
            : 'Failed to save weights',
        )
      },
    })
  }

  if (isLoading) {
    return (
      <div className="flex min-h-52 items-center justify-center">
        <Loader2 className="animate-spin text-[#045A58]" size={26} />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-52 flex-col items-center justify-center gap-3 px-6 py-10 text-center">
        <AlertCircle className="text-[#DC2626]" size={22} />
        <p className="text-sm text-[#6B7280]">
          {isAxiosError<ApiErrorResponse>(error)
            ? (error.response?.data.error.message ?? 'Failed to load recommendation weights')
            : 'Failed to load recommendation weights'}
        </p>
      </div>
    )
  }

  return (
    <div className="p-5 sm:p-6">
      <div
        className={`mb-6 flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
          total === 100 ? 'border-[#B9DAD8] bg-[#F2F9F8]' : 'border-[#F7C9C5] bg-[#FEF3F2]'
        }`}
      >
        <div>
          <p className="text-sm font-semibold text-[#111827]">Combined scoring weight</p>
          <p className="mt-1 text-xs text-[#6B7280]">Weights must total exactly 100% before saving.</p>
        </div>
        <Badge tone={total === 100 ? 'success' : 'error'}>{total}% total</Badge>
      </div>

      <div className="space-y-5">
        {factors.map((factor) => (
          <div
            className="grid gap-4 border-b border-[#E5E7EB] pb-5 last:border-b-0 last:pb-0 lg:grid-cols-[minmax(220px,1fr)_minmax(240px,1fr)_88px] lg:items-center"
            key={factor.key}
          >
            <div>
              <label className="text-sm font-semibold text-[#111827]" htmlFor={`weight-${factor.key}`}>
                {factor.label}
              </label>
              <p className="mt-1 text-sm leading-5 text-[#6B7280]">{factor.description}</p>
            </div>
            <input
              aria-label={`${factor.label} weight`}
              className="w-full accent-[#045A58] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!canManage}
              max="100"
              min="0"
              onChange={(event) => handleChange(factor.key, Number(event.target.value))}
              type="range"
              value={weights[factor.key]}
            />
            <div className="relative">
              <input
                className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 pr-8 text-right text-sm font-semibold text-[#111827] outline-none transition focus:border-[#045A58] focus:ring-4 focus:ring-[#E6F4F3] disabled:cursor-not-allowed disabled:bg-[#F9FAFB] disabled:opacity-70"
                disabled={!canManage}
                id={`weight-${factor.key}`}
                max="100"
                min="0"
                onChange={(event) => handleChange(factor.key, Number(event.target.value))}
                type="number"
                value={weights[factor.key]}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#6B7280]">
                %
              </span>
            </div>
          </div>
        ))}
      </div>

      {canManage ? (
        <div className="mt-6 flex flex-col items-start gap-3 border-t border-[#E5E7EB] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[#6B7280]">
            {saveError ?? 'Saving creates a new weights version — past recommendation runs keep the weights that generated them.'}
          </p>
          <Button
            className="shrink-0"
            disabled={total !== 100 || updateWeights.isPending}
            onClick={handleSave}
            size="md"
          >
            {updateWeights.isPending ? 'Saving…' : 'Save weights'}
          </Button>
        </div>
      ) : (
        <p className="mt-6 border-t border-[#E5E7EB] pt-5 text-xs text-[#6B7280]">
          Only Admins can change recommendation weights.
        </p>
      )}
    </div>
  )
}

export default RecommendationWeightsPanel
