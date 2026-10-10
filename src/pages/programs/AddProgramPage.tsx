import { AlertCircle, ArrowLeft, Building2, Link2, Loader2, MapPin } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import ProgramForm from '../../components/forms/ProgramForm.js'
import AppShell from '../../components/layout/AppShell.js'
import UnsavedChangesModal from '../../components/modals/UnsavedChangesModal.js'
import Badge from '../../components/ui/Badge.js'
import Card from '../../components/ui/Card.js'
import { useCreateProgram } from '../../features/programs/usePrograms.js'
import { useSchool } from '../../features/schools/useSchools.js'
import useUnsavedChanges from '../../hooks/useUnsavedChanges.js'
import { apiErrorMessage } from '../../lib/api/errors.js'

const AddProgramPage = () => {
  const { schoolId } = useParams()
  const schoolPath = `/schools/${schoolId ?? ''}`
  const unsavedChanges = useUnsavedChanges()
  const { data: school, isLoading, isError, error } = useSchool(schoolId)
  const createProgram = useCreateProgram()

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="animate-spin text-[#045A58]" size={32} />
        </div>
      </AppShell>
    )
  }

  if (isError || !school) {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
          <AlertCircle className="text-[#DC2626]" size={28} />
          <p className="text-sm text-[#6B7280]">{apiErrorMessage(error, 'Failed to load this school')}</p>
          <Link className="text-sm font-semibold text-[#045A58] hover:text-[#034A48]" to="/schools">
            Back to Schools
          </Link>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <Link
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#045A58] transition hover:text-[#034A48]"
            to={schoolPath}
          >
            <ArrowLeft size={16} />
            {school.name}
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-normal text-[#111827]">Add program</h1>
            <Badge tone="neutral">{school.publicId}</Badge>
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6B7280]">
            Copy the facts from the university's own course page, and paste its link so anyone can check them.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <ProgramForm
            errorMessage={createProgram.isError ? apiErrorMessage(createProgram.error) : null}
            isSubmitting={createProgram.isPending}
            onCancel={() => unsavedChanges.requestNavigation(schoolPath)}
            onDirty={unsavedChanges.markDirty}
            onSubmit={(input) =>
              createProgram.mutate(input, {
                onSuccess: (program) => unsavedChanges.navigateAfterSave(`/programs/${program.publicId}`),
              })
            }
            school={{ id: school.publicId, mode: 'fixed', name: school.name }}
          />

          <aside className="space-y-6 xl:sticky xl:top-26 xl:self-start">
            <Card>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#E6F4F3] text-[#045A58]">
                  <Building2 size={19} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-normal text-[#9CA3AF]">Adding to</p>
                  <h2 className="mt-1 text-lg font-semibold text-[#111827]">{school.name}</h2>
                  <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-[#6B7280]">
                    <MapPin size={14} />
                    {school.city}, {school.country}
                  </p>
                </div>
              </div>
            </Card>

            <SourceTipCard />
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

export const SourceTipCard = () => (
  <Card>
    <div className="flex items-start gap-3">
      <Link2 className="mt-0.5 shrink-0 text-[#045A58]" size={19} />
      <div>
        <h2 className="text-lg font-semibold text-[#111827]">Use the official page</h2>
        <p className="mt-2 text-sm leading-6 text-[#6B7280]">
          Take fees and requirements from the university's course page, not from Edvoy, ApplyBoard or old notes. Use
          the international (overseas) fee, and the requirements listed for Nigerian applicants where the page has
          them.
        </p>
        <p className="mt-2 text-sm leading-6 text-[#6B7280]">
          After saving, open the programme and mark it verified once you've checked every field.
        </p>
      </div>
    </div>
  </Card>
)

export default AddProgramPage
