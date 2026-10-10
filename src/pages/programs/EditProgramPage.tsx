import { AlertCircle, ArrowLeft, BadgeCheck, Building2, Loader2 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { changedFields } from '../../components/forms/FormParts.js'
import ProgramForm from '../../components/forms/ProgramForm.js'
import AppShell from '../../components/layout/AppShell.js'
import UnsavedChangesModal from '../../components/modals/UnsavedChangesModal.js'
import Badge from '../../components/ui/Badge.js'
import Card from '../../components/ui/Card.js'
import type { Program, ProgramInput } from '../../features/programs/programs.api.js'
import { STUDY_LEVEL_LABEL } from '../../features/programs/programs.format.js'
import { useProgram, useUpdateProgram } from '../../features/programs/usePrograms.js'
import { useSchools } from '../../features/schools/useSchools.js'
import useUnsavedChanges from '../../hooks/useUnsavedChanges.js'
import { apiErrorMessage } from '../../lib/api/errors.js'

// The record in the same shape the form submits, so the two can be compared field by field.
const toInput = (program: Program): ProgramInput => ({
  name: program.name,
  studyLevel: program.studyLevel,
  qualification: program.qualification,
  category: program.category,
  duration: program.duration,
  schoolId: program.school.publicId,
  tuitionAmount: Number(program.tuitionAmount),
  tuitionCurrency: program.tuitionCurrency,
  scholarshipAvailability: program.scholarshipAvailability,
  intakes: program.intakes.map((intake) => ({
    month: intake.month,
    year: intake.year,
    applicationDeadline: intake.applicationDeadline ? intake.applicationDeadline.slice(0, 10) : null,
  })),
  academicRequirements: program.academicRequirements,
  englishRequirements: program.englishRequirements,
  operationNotes: program.operationNotes,
  sourceUrl: program.sourceUrl,
  feesAcademicYear: program.feesAcademicYear,
})


const EditProgramPage = () => {
  const { programId } = useParams()
  const detailPath = `/programs/${programId ?? ''}`
  const unsavedChanges = useUnsavedChanges()
  const { data: program, isLoading, isError, error } = useProgram(programId)
  const updateProgram = useUpdateProgram(programId ?? '')
  const { data: schoolsData, isLoading: schoolsLoading } = useSchools({ limit: 100 })

  if (isLoading || schoolsLoading) {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="animate-spin text-[#045A58]" size={32} />
        </div>
      </AppShell>
    )
  }

  if (isError || !program) {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
          <AlertCircle className="text-[#DC2626]" size={28} />
          <p className="text-sm text-[#6B7280]">{apiErrorMessage(error, 'Failed to load this program')}</p>
          <Link className="text-sm font-semibold text-[#045A58] hover:text-[#034A48]" to="/programs">
            Back to Programs
          </Link>
        </div>
      </AppShell>
    )
  }

  const schoolOptions = (schoolsData?.schools ?? []).map((school) => ({
    id: school.publicId,
    name: `${school.name} (${school.city})`,
  }))
  // Keep the current school selectable even if it falls outside the first 100.
  if (!schoolOptions.some((option) => option.id === program.school.publicId)) {
    schoolOptions.unshift({ id: program.school.publicId, name: program.school.name })
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <Link
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#045A58] transition hover:text-[#034A48]"
            to={detailPath}
          >
            <ArrowLeft size={16} />
            {program.name}
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-normal text-[#111827]">Edit program</h1>
            <Badge tone="neutral">{program.publicId}</Badge>
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6B7280]">
            Update the shared program record used in school listings, advisor comparison, and student matching.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <ProgramForm
            errorMessage={updateProgram.isError ? apiErrorMessage(updateProgram.error) : null}
            initialValues={program}
            isSubmitting={updateProgram.isPending}
            onCancel={() => unsavedChanges.requestNavigation(detailPath)}
            onDirty={unsavedChanges.markDirty}
            onSubmit={(input) => {
              // Only what changed: resending an untouched fee would wrongly un-verify the programme.
              const changes = changedFields(toInput(program), input)
              if (Object.keys(changes).length === 0) {
                unsavedChanges.navigateAfterSave(detailPath)
                return
              }
              updateProgram.mutate(changes, {
                onSuccess: () => unsavedChanges.navigateAfterSave(detailPath),
              })
            }}
            school={{ mode: 'select', options: schoolOptions }}
            submitLabel="Save changes"
          />

          <aside className="space-y-6 xl:sticky xl:top-26 xl:self-start">
            <Card>
              <div className="space-y-4">
                <SummaryItem label="Program ID" value={program.publicId} />
                <SummaryItem label="Current school" value={program.school.name} />
                <SummaryItem label="Study level" value={STUDY_LEVEL_LABEL[program.studyLevel]} />
              </div>
            </Card>

            {program.verificationStatus === 'VERIFIED' ? (
              <Card>
                <div className="flex items-start gap-3">
                  <BadgeCheck className="mt-0.5 shrink-0 text-[#045A58]" size={19} />
                  <div>
                    <h2 className="text-lg font-semibold text-[#111827]">This programme is verified</h2>
                    <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                      Changing a fee, requirement, intake or the source link marks it as not verified until someone
                      checks it again. Editing only the notes or category keeps it verified.
                    </p>
                  </div>
                </div>
              </Card>
            ) : null}

            <Card>
              <div className="flex items-start gap-3">
                <Building2 className="mt-0.5 shrink-0 text-[#045A58]" size={19} />
                <div>
                  <h2 className="text-lg font-semibold text-[#111827]">School ownership</h2>
                  <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                    Changing the school moves this same program record to another school. It does not create a
                    duplicate.
                  </p>
                </div>
              </div>
            </Card>
          </aside>
        </div>
      </div>
      <UnsavedChangesModal
        isOpen={unsavedChanges.isPromptOpen}
        onDiscard={unsavedChanges.discardChanges}
        onKeepEditing={unsavedChanges.keepEditing}
      />
    </AppShell>
  )
}

const SummaryItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-start justify-between gap-4 border-b border-[#E5E7EB] pb-3 last:border-b-0 last:pb-0">
    <span className="text-sm text-[#6B7280]">{label}</span>
    <span className="max-w-[60%] text-right text-sm font-semibold text-[#111827]">{value}</span>
  </div>
)

export default EditProgramPage
