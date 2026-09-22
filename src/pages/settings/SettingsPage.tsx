import {
  AlertCircle,
  BookOpen,
  Check,
  CircleDot,
  Globe2,
  GraduationCap,
  Loader2,
  Plus,
  Trash2,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { isAxiosError } from 'axios'
import AppShell from '../../components/layout/AppShell.js'
import DeleteConfirmationModal from '../../components/modals/DeleteConfirmationModal.js'
import Button from '../../components/ui/Button.js'
import Card from '../../components/ui/Card.js'
import Input from '../../components/ui/Input.js'
import type { ApiErrorResponse } from '../../lib/api/types.js'
import {
  useCreateSettingValue,
  useDeleteSettingValue,
  useSettingGroups,
  useUpdateSettingValue,
} from '../../features/settings/useSettings.js'
import type { SettingGroupKey, SettingValue } from '../../features/settings/settings.api.js'

type PendingDeletion = {
  groupKey: SettingGroupKey
  groupLabel: string
  value: SettingValue
}

const sectionMeta: { description: string; icon: ReactNode; key: SettingGroupKey; label: string }[] = [
  {
    description: 'Countries available in school, program, and student preference records.',
    icon: <Globe2 size={18} />,
    key: 'countries',
    label: 'Destination countries',
  },
  {
    description: 'Categories used to organize programs and student interests.',
    icon: <BookOpen size={18} />,
    key: 'categories',
    label: 'Program categories',
  },
  {
    description: 'Academic levels available across programs and student preferences.',
    icon: <GraduationCap size={18} />,
    key: 'study-levels',
    label: 'Study levels',
  },
]

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState<SettingGroupKey>('countries')
  const [newItem, setNewItem] = useState('')
  const [pendingDeletion, setPendingDeletion] = useState<PendingDeletion | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const { data: groups, isLoading, isError, error } = useSettingGroups()
  const createValue = useCreateSettingValue()
  const updateValue = useUpdateSettingValue()
  const deleteValue = useDeleteSettingValue()

  const sectionInfo = sectionMeta.find((item) => item.key === activeSection) ?? sectionMeta[0]!
  const activeGroup = groups?.find((group) => group.key === activeSection)
  const values = activeGroup?.values ?? []

  const addItem = () => {
    const label = newItem.trim()
    if (!label) return

    createValue.mutate(
      { groupKey: activeSection, label },
      { onSuccess: () => setNewItem('') },
    )
  }

  const toggleItem = (value: SettingValue) => {
    updateValue.mutate({ groupKey: activeSection, valueId: value.id, data: { isActive: !value.isActive } })
  }

  const confirmDelete = () => {
    if (!pendingDeletion) return

    deleteValue.mutate(
      { groupKey: pendingDeletion.groupKey, valueId: pendingDeletion.value.id },
      {
        onSuccess: () => {
          setPendingDeletion(null)
          setDeleteError(null)
        },
        onError: (mutationError) => {
          setDeleteError(
            isAxiosError<ApiErrorResponse>(mutationError)
              ? (mutationError.response?.data.error.message ?? 'Failed to delete this value')
              : 'Failed to delete this value',
          )
        },
      },
    )
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium text-[#6B7280]">Administration</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-normal text-[#111827]">Settings</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6B7280]">
            Manage the controlled values used across student, school, and program workflows.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
          <Card className="h-fit p-3 xl:sticky xl:top-26">
            <nav aria-label="Settings categories" className="space-y-1">
              {sectionMeta.map((item) => {
                const isActive = activeSection === item.key
                const count = groups?.find((group) => group.key === item.key)?.values.length

                return (
                  <button
                    className={`flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition ${
                      isActive
                        ? 'bg-[#E6F4F3] text-[#045A58]'
                        : 'text-[#6B7280] hover:bg-[#F5F6F8] hover:text-[#111827]'
                    }`}
                    key={item.key}
                    onClick={() => {
                      setActiveSection(item.key)
                      setNewItem('')
                      setPendingDeletion(null)
                      setDeleteError(null)
                    }}
                    type="button"
                  >
                    <span className="mt-0.5 shrink-0">{item.icon}</span>
                    <span>
                      <span className="block text-sm font-semibold">{item.label}</span>
                      <span className="mt-1 block text-xs leading-4 text-[#6B7280]">
                        {count === undefined ? '…' : `${count} values`}
                      </span>
                    </span>
                  </button>
                )
              })}
            </nav>
          </Card>

          <div className="space-y-6">
            <Card className="p-0">
              <div className="border-b border-[#E5E7EB] px-5 py-5 sm:px-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E6F4F3] text-[#045A58]">
                    {sectionInfo.icon}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#111827]">{sectionInfo.label}</h2>
                    <p className="mt-1 text-sm leading-6 text-[#6B7280]">{sectionInfo.description}</p>
                  </div>
                </div>
              </div>

              <div className="border-b border-[#E5E7EB] bg-[#F9FAFB] px-5 py-4 sm:px-6">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Input
                    className="h-11"
                    id="new-setting-value"
                    onChange={(event) => setNewItem(event.target.value)}
                    placeholder={`Add ${sectionInfo.label.toLowerCase().replace(/s$/, '')}`}
                    value={newItem}
                  />
                  <Button
                    className="shrink-0"
                    disabled={!newItem.trim() || createValue.isPending}
                    leftIcon={<Plus size={17} />}
                    onClick={addItem}
                    size="md"
                  >
                    Add value
                  </Button>
                </div>
              </div>

              {isLoading ? (
                <div className="flex min-h-52 items-center justify-center">
                  <Loader2 className="animate-spin text-[#045A58]" size={26} />
                </div>
              ) : isError ? (
                <div className="flex min-h-52 flex-col items-center justify-center gap-3 px-6 py-10 text-center">
                  <AlertCircle className="text-[#DC2626]" size={22} />
                  <p className="text-sm text-[#6B7280]">
                    {isAxiosError<ApiErrorResponse>(error)
                      ? (error.response?.data.error.message ?? 'Failed to load settings')
                      : 'Failed to load settings'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#E5E7EB]">
                  {values.map((value) => (
                    <div
                      className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                      key={value.id}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                            value.isActive ? 'bg-[#E6F4F3] text-[#045A58]' : 'bg-[#F3F4F6] text-[#9CA3AF]'
                          }`}
                        >
                          {value.isActive ? <Check size={17} /> : <CircleDot size={17} />}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#111827]">{value.label}</p>
                          <p className="mt-1 text-xs text-[#6B7280]">
                            {value.isActive ? 'Available in operational forms' : 'Hidden from new records'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          aria-pressed={value.isActive}
                          className={`relative h-6 w-11 rounded-full outline-none transition focus:ring-4 focus:ring-[#E6F4F3] ${
                            value.isActive ? 'bg-[#045A58]' : 'bg-[#D1D5DB]'
                          }`}
                          onClick={() => toggleItem(value)}
                          title={value.isActive ? 'Disable value' : 'Enable value'}
                          type="button"
                        >
                          <span
                            className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
                              value.isActive ? 'left-6' : 'left-1'
                            }`}
                          />
                        </button>
                        <button
                          aria-label={`Delete ${value.label}`}
                          className="flex h-9 w-9 items-center justify-center rounded-xl text-[#6B7280] outline-none transition hover:bg-[#FEE2E2] hover:text-[#B42318] focus:ring-4 focus:ring-[#FEE2E2]"
                          onClick={() => {
                            setDeleteError(null)
                            setPendingDeletion({ groupKey: activeSection, groupLabel: sectionInfo.label, value })
                          }}
                          title="Delete value"
                          type="button"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {values.length === 0 ? (
                    <div className="px-6 py-10 text-center text-sm text-[#6B7280]">No values yet.</div>
                  ) : null}
                </div>
              )}
            </Card>

            <Card className="border-[#B9DAD8] bg-[#F2F9F8]">
              <h2 className="text-sm font-semibold text-[#111827]">Operational impact</h2>
              <p className="mt-1 text-sm leading-6 text-[#52605F]">
                Disabled values remain on existing records but are hidden from new selections. A value must be
                disabled before it can be deleted.
              </p>
            </Card>
          </div>
        </div>
      </div>

      {pendingDeletion ? (
        <DeleteConfirmationModal
          consequence={
            deleteError ??
            'Confirm that no existing records depend on this value. If it is still enabled, disable it first.'
          }
          description={`Remove this value from ${pendingDeletion.groupLabel.toLowerCase()}.`}
          isOpen
          itemLabel={pendingDeletion.value.label}
          itemType="setting value"
          onClose={() => {
            setPendingDeletion(null)
            setDeleteError(null)
          }}
          onConfirm={confirmDelete}
        />
      ) : null}
    </AppShell>
  )
}

export default SettingsPage
