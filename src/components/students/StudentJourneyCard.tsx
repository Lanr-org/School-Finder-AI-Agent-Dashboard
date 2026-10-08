import { CheckSquare, Loader2, Route, Square } from 'lucide-react'
import Badge from '../ui/Badge.js'
import Card from '../ui/Card.js'
import { useSetStudentJourneyCheck, useStudentJourney } from '../../features/students/useStudentJourney.js'

const ownerLabels = { YOU: 'Student', SMETASE: 'Smetase', ADVISOR: 'Advisor' } as const

// Where the student is on their journey, and the steps only people can confirm
// (deposit paid, English test, proof of funds). The student sees and ticks the same list
// in the web app, except proof of funds, which is the advisor's.
const StudentJourneyCard = ({ studentId }: { studentId: string }) => {
  const { data: journey, isLoading, isError } = useStudentJourney(studentId)
  const setCheck = useSetStudentJourneyCheck(studentId)

  if (isLoading) {
    return (
      <Card>
        <Loader2 className="animate-spin text-[#6B7280]" size={20} />
      </Card>
    )
  }
  if (isError || !journey) {
    return (
      <Card>
        <p className="text-sm text-[#6B7280]">Couldn't load the journey.</p>
      </Card>
    )
  }

  const current = journey.stages.find((stage) => stage.status === 'CURRENT')
  // Only the stages with hand-ticked steps; everything else comes from data.
  const tickStages = journey.stages.filter((stage) => stage.checklist.some((item) => item.checkKey))

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E6F4F3] text-[#045A58]">
            <Route size={19} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#111827]">Journey</h2>
            <p className="text-sm text-[#6B7280]">
              {current ? `${current.title} · ${ownerLabels[current.owner]}` : 'Not started'}
            </p>
          </div>
        </div>
        <Badge tone="brand">Now: {current?.title ?? '—'}</Badge>
      </div>

      <p className="mt-4 text-sm text-[#111827]">
        <span className="font-semibold">Next step:</span> {journey.nextStep.title}. {journey.nextStep.description}
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {tickStages.map((stage) => (
          <div key={stage.key} className="rounded-2xl border border-[#E5E7EB] p-4">
            <p className="text-sm font-semibold text-[#111827]">{stage.title}</p>
            <ul className="mt-3 space-y-2">
              {stage.checklist.map((item) => {
                const key = item.checkKey
                return (
                  <li key={item.id} className="text-sm">
                    {key && item.canTick ? (
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={item.done}
                        disabled={setCheck.isPending}
                        onClick={() => setCheck.mutate({ key, done: !item.done })}
                        className="flex items-center gap-2 text-left text-[#111827] disabled:opacity-60"
                      >
                        {item.done ? (
                          <CheckSquare size={16} className="text-[#045A58]" aria-hidden />
                        ) : (
                          <Square size={16} className="text-[#9CA3AF]" aria-hidden />
                        )}
                        {item.label}
                      </button>
                    ) : (
                      <span className={`flex items-center gap-2 ${item.done ? 'text-[#111827]' : 'text-[#9CA3AF]'}`}>
                        {item.done ? (
                          <CheckSquare size={16} className="text-[#9CA3AF]" aria-hidden />
                        ) : (
                          <Square size={16} aria-hidden />
                        )}
                        {item.label}
                        {item.done && key ? <span className="text-xs text-[#9CA3AF]">(automatic)</span> : null}
                      </span>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
      {setCheck.isError ? (
        <p className="mt-3 text-sm text-[#B42318]">Couldn't update that step. Try again.</p>
      ) : null}
    </Card>
  )
}

export default StudentJourneyCard
