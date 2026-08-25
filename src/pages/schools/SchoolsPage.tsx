import {
  AlertCircle,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleOff,
  ExternalLink,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Search,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import AppShell from '../../components/layout/AppShell.js'
import Badge from '../../components/ui/Badge.js'
import Button from '../../components/ui/Button.js'
import Card from '../../components/ui/Card.js'
import Input from '../../components/ui/Input.js'
import { api } from '../../lib/api/client.js'
import type { ApiErrorResponse } from '../../lib/api/types.js'
import { useAuthStore } from '../../store/authStore.js'
import { useSchools } from '../../features/schools/useSchools.js'
import type { PartnerStatus, School, SchoolType } from '../../features/schools/schools.api.js'

const PAGE_SIZE = 20
const MANAGE_ROLES = ['ADMIN', 'OPERATIONS']

const typeOptions: { label: string; value: SchoolType | 'ALL' }[] = [
  { label: 'All types', value: 'ALL' },
  { label: 'University', value: 'UNIVERSITY' },
  { label: 'College', value: 'COLLEGE' },
  { label: 'Institute', value: 'INSTITUTE' },
  { label: 'Polytechnic', value: 'POLYTECHNIC' },
]

const partnerOptions: { label: string; value: PartnerStatus | 'ALL' }[] = [
  { label: 'All partner statuses', value: 'ALL' },
  { label: 'Partner', value: 'PARTNER' },
  { label: 'Prospect', value: 'PROSPECT' },
  { label: 'Non-partner', value: 'NON_PARTNER' },
]

const partnerLabels: Record<PartnerStatus, string> = {
  PARTNER: 'Partner',
  PROSPECT: 'Prospect',
  NON_PARTNER: 'Non-partner',
}

const partnerTone: Record<PartnerStatus, 'brand' | 'neutral' | 'success' | 'warning'> = {
  NON_PARTNER: 'neutral',
  PARTNER: 'success',
  PROSPECT: 'warning',
}

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })

const SchoolsPage = () => {
  const queryClient = useQueryClient()
  const canManage = useAuthStore((state) => (state.user ? MANAGE_ROLES.includes(state.user.role) : false))
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [type, setType] = useState<SchoolType | 'ALL'>('ALL')
  const [partnerStatus, setPartnerStatus] = useState<PartnerStatus | 'ALL'>('ALL')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchInput.trim()), 300)
    return () => clearTimeout(timeout)
  }, [searchInput])

  const queryParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: debouncedSearch || undefined,
      schoolType: type === 'ALL' ? undefined : type,
      partnerStatus: partnerStatus === 'ALL' ? undefined : partnerStatus,
    }),
    [debouncedSearch, page, partnerStatus, type],
  )

  const { data, error, isError, isLoading, isFetching } = useSchools(queryParams)

  const toggleStatus = useMutation({
    mutationFn: (school: School) =>
      school.recordStatus === 'ACTIVE'
        ? api.delete(`/schools/${school.publicId}`)
        : api.patch(`/schools/${school.publicId}`, { recordStatus: 'ACTIVE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['schools'] }),
  })

  const resetToFirstPage = () => setPage(1)

  const schools = data?.schools ?? []
  const pagination = data?.pagination

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-medium text-[#6B7280]">Directory</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal text-[#111827]">Schools</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6B7280]">
              Maintain school records, partner relationships, program coverage, and visa-readiness data.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button leftIcon={<ExternalLink size={17} />} size="md" variant="secondary">
              Export directory
            </Button>
            {canManage ? (
              <Link
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-transparent bg-[#045A58] px-4 text-sm font-semibold text-white outline-none transition hover:bg-[#034A48] focus:ring-4 focus:ring-[#E6F4F3]"
                to="/schools/new"
              >
                <Plus size={17} />
                Add school
              </Link>
            ) : null}
          </div>
        </div>

        <Card className="p-0">
          <div className="border-b border-[#E5E7EB] px-5 py-5 sm:px-6">
            <div>
              <h2 className="text-lg font-semibold text-[#111827]">School directory</h2>
              <p className="mt-1 text-sm text-[#6B7280]">
                Review school coverage and keep operational records current.
              </p>
            </div>

            <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(280px,1fr)_200px_220px]">
              <Input
                className="h-11 bg-[#F9FAFB]"
                id="school-search"
                leftIcon={<Search size={18} />}
                onChange={(event) => {
                  setSearchInput(event.target.value)
                  resetToFirstPage()
                }}
                placeholder="Search school, city, or country"
                type="search"
                value={searchInput}
              />

              <FilterSelect
                id="type-filter"
                label="Type"
                onChange={(value) => {
                  setType(value as SchoolType | 'ALL')
                  resetToFirstPage()
                }}
                options={typeOptions}
                value={type}
              />
              <FilterSelect
                id="partner-filter"
                label="Partner status"
                onChange={(value) => {
                  setPartnerStatus(value as PartnerStatus | 'ALL')
                  resetToFirstPage()
                }}
                options={partnerOptions}
                value={partnerStatus}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex min-h-72 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
              <Loader2 className="animate-spin text-[#045A58]" size={24} />
              <p className="text-sm text-[#6B7280]">Loading schools…</p>
            </div>
          ) : isError ? (
            <div className="flex min-h-72 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
              <AlertCircle className="text-[#DC2626]" size={24} />
              <p className="text-sm text-[#6B7280]">
                {isAxiosError<ApiErrorResponse>(error)
                  ? (error.response?.data.error.message ?? 'Failed to load schools')
                  : 'Failed to load schools'}
              </p>
            </div>
          ) : schools.length ? (
            <div className={`overflow-x-auto ${isFetching ? 'opacity-60' : ''}`}>
              <table className="w-full min-w-[1000px] text-left">
                <thead>
                  <tr className="border-b border-[#E5E7EB] text-xs font-semibold uppercase tracking-normal text-[#6B7280]">
                    <th className="px-6 py-3">School name</th>
                    <th className="px-6 py-3">Location</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Partner status</th>
                    <th className="px-6 py-3">Visa score</th>
                    <th className="px-6 py-3">Last updated</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {schools.map((school) => (
                    <tr className="transition hover:bg-[#F9FAFB]" key={school.publicId}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#E6F4F3] text-[#045A58]">
                            <Building2 size={18} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <Link
                                className="text-sm font-semibold text-[#111827] outline-none transition hover:text-[#045A58] focus:underline"
                                to={`/schools/${school.publicId}`}
                              >
                                {school.name}
                              </Link>
                              {school.recordStatus === 'INACTIVE' ? <Badge tone="error">Inactive</Badge> : null}
                            </div>
                            <p className="mt-1 text-xs font-medium text-[#6B7280]">{school.publicId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-2 text-sm text-[#374151]">
                          <MapPin className="text-[#6B7280]" size={16} />
                          {school.city}, {school.country}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#6B7280]">
                        {school.schoolType.charAt(0) + school.schoolType.slice(1).toLowerCase()}
                      </td>
                      <td className="px-6 py-4">
                        <Badge tone={partnerTone[school.partnerStatus]}>
                          {partnerLabels[school.partnerStatus]}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {school.visaFriendlinessScore === null ? (
                          <span className="text-sm text-[#6B7280]">—</span>
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="h-2 w-20 rounded-full bg-[#E5E7EB]">
                              <div
                                className="h-2 rounded-full bg-[#045A58]"
                                style={{ width: `${school.visaFriendlinessScore}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-[#111827]">
                              {school.visaFriendlinessScore}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-[#6B7280]">
                        {formatDate(school.updatedAt)}
                      </td>
                      <td className="px-6 py-4">
                        {canManage ? (
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              aria-label={`Edit ${school.name}`}
                              className="flex h-9 w-9 items-center justify-center rounded-xl text-[#6B7280] outline-none transition hover:bg-[#E6F4F3] hover:text-[#045A58] focus:ring-4 focus:ring-[#E6F4F3]"
                              title="Edit school"
                              to={`/schools/${school.publicId}/edit`}
                            >
                              <Pencil size={16} />
                            </Link>
                            <button
                              aria-label={`${school.recordStatus === 'ACTIVE' ? 'Disable' : 'Enable'} ${school.name}`}
                              className="flex h-9 w-9 items-center justify-center rounded-xl text-[#6B7280] outline-none transition hover:bg-[#FEE2E2] hover:text-[#DC2626] focus:ring-4 focus:ring-[#FEE2E2] disabled:cursor-not-allowed disabled:opacity-60"
                              disabled={toggleStatus.isPending}
                              onClick={() => toggleStatus.mutate(school)}
                              title={school.recordStatus === 'ACTIVE' ? 'Disable school' : 'Enable school'}
                              type="button"
                            >
                              {school.recordStatus === 'ACTIVE' ? (
                                <CircleOff size={16} />
                              ) : (
                                <CheckCircle2 size={16} />
                              )}
                            </button>
                          </div>
                        ) : (
                          <p className="text-right text-xs font-medium text-[#9CA3AF]">View only</p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E6F4F3] text-[#045A58]">
                <Building2 size={21} />
              </div>
              <h3 className="mt-4 text-base font-semibold text-[#111827]">No schools match these filters</h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-[#6B7280]">
                Clear or adjust the current search and filters to return to the directory.
              </p>
              <Button
                className="mt-5"
                onClick={() => {
                  setSearchInput('')
                  setType('ALL')
                  setPartnerStatus('ALL')
                  resetToFirstPage()
                }}
                size="md"
                variant="secondary"
              >
                Clear filters
              </Button>
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-[#E5E7EB] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-sm text-[#6B7280]">
              {pagination ? (
                <>
                  Showing <span className="font-semibold text-[#111827]">{schools.length}</span> of{' '}
                  <span className="font-semibold text-[#111827]">{pagination.total}</span> schools
                </>
              ) : null}
            </p>
            <div className="flex items-center gap-2">
              <Button
                disabled={page <= 1}
                leftIcon={<ChevronLeft size={16} />}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                size="sm"
                variant="secondary"
              >
                Previous
              </Button>
              <Button
                disabled={!pagination || page >= pagination.totalPages}
                onClick={() => setPage((current) => current + 1)}
                rightIcon={<ChevronRight size={16} />}
                size="sm"
                variant="secondary"
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  )
}

type FilterSelectProps<TValue extends string> = {
  id: string
  label: string
  onChange: (value: TValue) => void
  options: { label: string; value: TValue }[]
  value: TValue
}

const FilterSelect = <TValue extends string>({ id, label, onChange, options, value }: FilterSelectProps<TValue>) => {
  return (
    <div>
      <label className="sr-only" htmlFor={id}>
        {label}
      </label>
      <select
        className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm font-medium text-[#374151] outline-none transition focus:border-[#045A58] focus:ring-4 focus:ring-[#E6F4F3]"
        id={id}
        onChange={(event) => onChange(event.target.value as TValue)}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default SchoolsPage
