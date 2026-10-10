import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import SchoolForm from '../../components/forms/SchoolForm.js'
import AppShell from '../../components/layout/AppShell.js'
import UnsavedChangesModal from '../../components/modals/UnsavedChangesModal.js'
import Card from '../../components/ui/Card.js'
import { useCreateSchool } from '../../features/schools/useSchools.js'
import useUnsavedChanges from '../../hooks/useUnsavedChanges.js'
import { apiErrorMessage } from '../../lib/api/errors.js'

const AddSchoolPage = () => {
  const unsavedChanges = useUnsavedChanges()
  const createSchool = useCreateSchool()

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <Link
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#045A58] transition hover:text-[#034A48]"
            to="/schools"
          >
            <ArrowLeft size={16} />
            Schools
          </Link>
          <h1 className="mt-4 text-3xl font-semibold tracking-normal text-[#111827]">Add school</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6B7280]">
            Create the school record used for program management, advisor research, and student recommendations.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <SchoolForm
            errorMessage={createSchool.isError ? apiErrorMessage(createSchool.error) : null}
            isSubmitting={createSchool.isPending}
            onCancel={() => unsavedChanges.requestNavigation('/schools')}
            onDirty={unsavedChanges.markDirty}
            onSubmit={(input) =>
              createSchool.mutate(input, {
                onSuccess: (school) => unsavedChanges.navigateAfterSave(`/schools/${school.publicId}`),
              })
            }
          />

          <aside className="space-y-6 xl:sticky xl:top-26 xl:self-start">
            <Card>
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 shrink-0 text-[#045A58]" size={19} />
                <div>
                  <h2 className="text-lg font-semibold text-[#111827]">Visa sponsor check</h2>
                  <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                    UK schools are checked automatically against the Home Office register of licensed student
                    sponsors. Use the school's official name so the check can find it.
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

export default AddSchoolPage
