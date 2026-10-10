import { ArrowLeft, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import ProgramForm from '../../components/forms/ProgramForm.js'
import AppShell from '../../components/layout/AppShell.js'
import UnsavedChangesModal from '../../components/modals/UnsavedChangesModal.js'
import Badge from '../../components/ui/Badge.js'
import { useCreateProgram } from '../../features/programs/usePrograms.js'
import { useSchools } from '../../features/schools/useSchools.js'
import useUnsavedChanges from '../../hooks/useUnsavedChanges.js'
import { apiErrorMessage } from '../../lib/api/errors.js'
import { SourceTipCard } from './AddProgramPage.js'

const GlobalAddProgramPage = () => {
  const unsavedChanges = useUnsavedChanges()
  const createProgram = useCreateProgram()
  // The API caps a page at 100; enough for the first catalogue. Swap for a search box past that.
  const { data, isLoading } = useSchools({ limit: 100, recordStatus: 'ACTIVE' })
  const schoolOptions = (data?.schools ?? []).map((school) => ({
    id: school.publicId,
    name: `${school.name} (${school.city})`,
  }))

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
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-normal text-[#111827]">Add program</h1>
            <Badge tone="brand">Global directory</Badge>
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6B7280]">
            Pick the school, then copy the facts from the university's own course page.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
          {isLoading ? (
            <div className="flex min-h-[40vh] items-center justify-center">
              <Loader2 className="animate-spin text-[#045A58]" size={32} />
            </div>
          ) : (
            <ProgramForm
              errorMessage={createProgram.isError ? apiErrorMessage(createProgram.error) : null}
              isSubmitting={createProgram.isPending}
              onCancel={() => unsavedChanges.requestNavigation('/programs')}
              onDirty={unsavedChanges.markDirty}
              onSubmit={(input) =>
                createProgram.mutate(input, {
                  onSuccess: (program) => unsavedChanges.navigateAfterSave(`/programs/${program.publicId}`),
                })
              }
              school={{ mode: 'select', options: schoolOptions }}
            />
          )}

          <aside className="space-y-6 xl:sticky xl:top-26 xl:self-start">
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

export default GlobalAddProgramPage
