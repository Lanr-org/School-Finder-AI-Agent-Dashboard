import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { changedFields } from '../../components/forms/FormParts.js'
import SchoolForm from '../../components/forms/SchoolForm.js'
import AppShell from '../../components/layout/AppShell.js'
import UnsavedChangesModal from '../../components/modals/UnsavedChangesModal.js'
import Badge from '../../components/ui/Badge.js'
import type { School, SchoolInput } from '../../features/schools/schools.api.js'
import { useSchool, useUpdateSchool } from '../../features/schools/useSchools.js'
import useUnsavedChanges from '../../hooks/useUnsavedChanges.js'
import { apiErrorMessage } from '../../lib/api/errors.js'

// The record in the same shape the form submits, so the two can be compared field by field.
const toInput = (school: School): SchoolInput => ({
  name: school.name,
  schoolType: school.schoolType,
  recordStatus: school.recordStatus,
  description: school.description,
  website: school.website,
  admissionsEmail: school.admissionsEmail,
  phoneNumbers: school.phoneNumbers,
  streetAddress: school.streetAddress,
  city: school.city,
  country: school.country,
  postalCode: school.postalCode,
  partnerStatus: school.partnerStatus,
  visaFriendlinessScore: school.visaFriendlinessScore,
  visaFriendlinessNotes: school.visaFriendlinessNotes,
  admissionFriendlinessScore: school.admissionFriendlinessScore,
  admissionFriendlinessNotes: school.admissionFriendlinessNotes,
  rankingReputationNotes: school.rankingReputationNotes,
})

const EditSchoolPage = () => {
  const { schoolId } = useParams()
  const detailPath = `/schools/${schoolId ?? ''}`
  const unsavedChanges = useUnsavedChanges()
  const { data: school, isLoading, isError, error } = useSchool(schoolId)
  const updateSchool = useUpdateSchool(schoolId ?? '')

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
            to={detailPath}
          >
            <ArrowLeft size={16} />
            {school.name}
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-normal text-[#111827]">Edit school</h1>
            <Badge tone="neutral">{school.publicId}</Badge>
          </div>
        </div>

        <div className="max-w-4xl">
          <SchoolForm
            errorMessage={updateSchool.isError ? apiErrorMessage(updateSchool.error) : null}
            initialValues={school}
            isSubmitting={updateSchool.isPending}
            onCancel={() => unsavedChanges.requestNavigation(detailPath)}
            onDirty={unsavedChanges.markDirty}
            onSubmit={(input) => {
              const changes = changedFields(toInput(school), input)
              if (Object.keys(changes).length === 0) {
                unsavedChanges.navigateAfterSave(detailPath)
                return
              }
              updateSchool.mutate(changes, {
                onSuccess: () => unsavedChanges.navigateAfterSave(detailPath),
              })
            }}
            submitLabel="Save changes"
          />
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

export default EditSchoolPage
