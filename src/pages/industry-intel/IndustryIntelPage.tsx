import { AlertCircle, Loader2, Newspaper, Plus, TrendingUp, Trash2 } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { isAxiosError } from 'axios'
import AppShell from '../../components/layout/AppShell.js'
import DeleteConfirmationModal from '../../components/modals/DeleteConfirmationModal.js'
import Badge from '../../components/ui/Badge.js'
import Button from '../../components/ui/Button.js'
import Card from '../../components/ui/Card.js'
import Input from '../../components/ui/Input.js'
import type { ApiErrorResponse } from '../../lib/api/types.js'
import { useAuthStore } from '../../store/authStore.js'
import { useBulletins, useCreateBulletin, useDeleteBulletin, useUpdateBulletin } from '../../features/bulletins/useBulletins.js'
import type { Bulletin } from '../../features/bulletins/bulletins.api.js'
import { useCreateVisaRate, useDeleteVisaRate, useUpdateVisaRate, useVisaRates } from '../../features/visaRates/useVisaRates.js'
import type { VisaRate } from '../../features/visaRates/visaRates.api.js'

type Tab = 'bulletins' | 'visa-rates'

const todayInputValue = () => new Date().toISOString().slice(0, 10)

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })

const IndustryIntelPage = () => {
  const role = useAuthStore((state) => state.user?.role)
  const canManage = role === 'ADMIN' || role === 'OPERATIONS'
  const [tab, setTab] = useState<Tab>('bulletins')

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium text-[#6B7280]">Operations</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-normal text-[#111827]">Industry Intel</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6B7280]">
            Verified partner-sourced facts (visa success rates, policy updates) that the AI is allowed to cite
            directly in student conversations. Everything here is fetched fresh — nothing is invented.
          </p>
        </div>

        <div className="flex gap-2 border-b border-[#E5E7EB]">
          <TabButton active={tab === 'bulletins'} icon={<Newspaper size={16} />} label="Bulletins" onClick={() => setTab('bulletins')} />
          <TabButton
            active={tab === 'visa-rates'}
            icon={<TrendingUp size={16} />}
            label="Visa success rates"
            onClick={() => setTab('visa-rates')}
          />
        </div>

        {tab === 'bulletins' ? <BulletinsTab canManage={canManage} /> : <VisaRatesTab canManage={canManage} />}
      </div>
    </AppShell>
  )
}

const TabButton = ({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean
  icon: ReactNode
  label: string
  onClick: () => void
}) => (
  <button
    className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
      active ? 'border-[#045A58] text-[#045A58]' : 'border-transparent text-[#6B7280] hover:text-[#111827]'
    }`}
    onClick={onClick}
    type="button"
  >
    {icon}
    {label}
  </button>
)

// ── Bulletins ────────────────────────────────────────────────────────────────

const BulletinsTab = ({ canManage }: { canManage: boolean }) => {
  const { data, isLoading, isError, error } = useBulletins()
  const createBulletin = useCreateBulletin()
  const updateBulletin = useUpdateBulletin()
  const deleteBulletin = useDeleteBulletin()

  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [sourcePartner, setSourcePartner] = useState('')
  const [countries, setCountries] = useState('')
  const [publishedAt, setPublishedAt] = useState(todayInputValue())
  const [expiresAt, setExpiresAt] = useState('')
  const [pendingDelete, setPendingDelete] = useState<Bulletin | null>(null)

  const bulletins = data?.bulletins ?? []
  const canSubmit = title.trim().length > 0 && body.trim().length > 0

  const resetForm = () => {
    setTitle('')
    setBody('')
    setSourcePartner('')
    setCountries('')
    setPublishedAt(todayInputValue())
    setExpiresAt('')
    setShowForm(false)
  }

  const submit = () => {
    if (!canSubmit) return
    createBulletin.mutate(
      {
        title: title.trim(),
        body: body.trim(),
        sourcePartner: sourcePartner.trim() || undefined,
        countries: countries
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean),
        publishedAt: new Date(publishedAt).toISOString(),
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      },
      { onSuccess: resetForm },
    )
  }

  return (
    <Card className="p-0">
      {canManage ? (
        <div className="border-b border-[#E5E7EB] px-5 py-4 sm:px-6">
          {showForm ? (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input id="bulletin-title" label="Title" onChange={(e) => setTitle(e.target.value)} value={title} />
                <Input
                  id="bulletin-source"
                  label="Source partner (optional)"
                  onChange={(e) => setSourcePartner(e.target.value)}
                  placeholder="e.g. Edvoy"
                  value={sourcePartner}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[#111827]" htmlFor="bulletin-body">
                  Body
                </label>
                <textarea
                  className="min-h-24 w-full resize-y rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm leading-6 text-[#111827] outline-none transition focus:border-[#045A58] focus:ring-4 focus:ring-[#E6F4F3]"
                  id="bulletin-body"
                  onChange={(e) => setBody(e.target.value)}
                  value={body}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <Input
                  id="bulletin-countries"
                  label="Countries (comma-separated, blank = global)"
                  onChange={(e) => setCountries(e.target.value)}
                  placeholder="UK, Canada"
                  value={countries}
                />
                <Input
                  id="bulletin-published"
                  label="Published"
                  onChange={(e) => setPublishedAt(e.target.value)}
                  type="date"
                  value={publishedAt}
                />
                <Input
                  id="bulletin-expires"
                  label="Expires (optional)"
                  onChange={(e) => setExpiresAt(e.target.value)}
                  type="date"
                  value={expiresAt}
                />
              </div>
              <div className="flex gap-3">
                <Button disabled={!canSubmit || createBulletin.isPending} onClick={submit} size="md">
                  {createBulletin.isPending ? 'Saving…' : 'Publish bulletin'}
                </Button>
                <Button onClick={resetForm} size="md" variant="secondary">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button leftIcon={<Plus size={17} />} onClick={() => setShowForm(true)} size="md">
              Add bulletin
            </Button>
          )}
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex min-h-52 items-center justify-center">
          <Loader2 className="animate-spin text-[#045A58]" size={26} />
        </div>
      ) : isError ? (
        <ErrorState error={error} />
      ) : bulletins.length === 0 ? (
        <div className="px-6 py-10 text-center text-sm text-[#6B7280]">No bulletins yet.</div>
      ) : (
        <div className="divide-y divide-[#E5E7EB]">
          {bulletins.map((bulletin) => (
            <div className="flex flex-col gap-3 px-5 py-4 sm:px-6" key={bulletin.publicId}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-[#111827]">{bulletin.title}</p>
                    <Badge tone={bulletin.isActive ? 'success' : 'neutral'}>
                      {bulletin.isActive ? 'Active' : 'Retracted'}
                    </Badge>
                    {bulletin.sourcePartner ? <Badge tone="brand">{bulletin.sourcePartner}</Badge> : null}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#374151]">{bulletin.body}</p>
                  <p className="mt-2 text-xs text-[#6B7280]">
                    {bulletin.countries.length ? bulletin.countries.join(', ') : 'Global'} · Published{' '}
                    {formatDate(bulletin.publishedAt)}
                    {bulletin.expiresAt ? ` · Expires ${formatDate(bulletin.expiresAt)}` : ''}
                  </p>
                </div>

                {canManage ? (
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      className={`relative h-6 w-11 shrink-0 rounded-full outline-none transition focus:ring-4 focus:ring-[#E6F4F3] ${
                        bulletin.isActive ? 'bg-[#045A58]' : 'bg-[#D1D5DB]'
                      }`}
                      onClick={() =>
                        updateBulletin.mutate({ bulletinId: bulletin.publicId, data: { isActive: !bulletin.isActive } })
                      }
                      title={bulletin.isActive ? 'Retract' : 'Reactivate'}
                      type="button"
                    >
                      <span
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
                          bulletin.isActive ? 'left-6' : 'left-1'
                        }`}
                      />
                    </button>
                    <button
                      aria-label={`Delete ${bulletin.title}`}
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-[#6B7280] outline-none transition hover:bg-[#FEE2E2] hover:text-[#B42318] focus:ring-4 focus:ring-[#FEE2E2]"
                      onClick={() => setPendingDelete(bulletin)}
                      type="button"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {pendingDelete ? (
        <DeleteConfirmationModal
          consequence="This bulletin will stop being cited by the AI immediately and cannot be recovered."
          isOpen
          itemLabel={pendingDelete.title}
          itemType="bulletin"
          onClose={() => setPendingDelete(null)}
          onConfirm={() => deleteBulletin.mutate(pendingDelete.publicId, { onSuccess: () => setPendingDelete(null) })}
        />
      ) : null}
    </Card>
  )
}

// ── Visa Success Rates ───────────────────────────────────────────────────────

const VisaRatesTab = ({ canManage }: { canManage: boolean }) => {
  const { data, isLoading, isError, error } = useVisaRates()
  const createRate = useCreateVisaRate()
  const updateRate = useUpdateVisaRate()
  const deleteRate = useDeleteVisaRate()

  const [showForm, setShowForm] = useState(false)
  const [country, setCountry] = useState('')
  const [sourcePartner, setSourcePartner] = useState('')
  const [periodLabel, setPeriodLabel] = useState('')
  const [successRate, setSuccessRate] = useState('')
  const [sampleSize, setSampleSize] = useState('')
  const [publishedAt, setPublishedAt] = useState(todayInputValue())
  const [pendingDelete, setPendingDelete] = useState<VisaRate | null>(null)

  const rates = data?.rates ?? []
  const canSubmit = country.trim().length > 0 && periodLabel.trim().length > 0 && successRate !== ''

  const resetForm = () => {
    setCountry('')
    setSourcePartner('')
    setPeriodLabel('')
    setSuccessRate('')
    setSampleSize('')
    setPublishedAt(todayInputValue())
    setShowForm(false)
  }

  const submit = () => {
    if (!canSubmit) return
    createRate.mutate(
      {
        country: country.trim(),
        sourcePartner: sourcePartner.trim() || undefined,
        periodLabel: periodLabel.trim(),
        successRate: Number(successRate),
        sampleSize: sampleSize ? Number(sampleSize) : undefined,
        publishedAt: new Date(publishedAt).toISOString(),
      },
      { onSuccess: resetForm },
    )
  }

  return (
    <Card className="p-0">
      {canManage ? (
        <div className="border-b border-[#E5E7EB] px-5 py-4 sm:px-6">
          {showForm ? (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input id="rate-country" label="Country" onChange={(e) => setCountry(e.target.value)} value={country} />
                <Input
                  id="rate-source"
                  label="Source partner (optional)"
                  onChange={(e) => setSourcePartner(e.target.value)}
                  placeholder="e.g. Edvoy"
                  value={sourcePartner}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-4">
                <Input
                  id="rate-period"
                  label="Period"
                  onChange={(e) => setPeriodLabel(e.target.value)}
                  placeholder="Q3 2026"
                  value={periodLabel}
                />
                <Input
                  id="rate-success"
                  label="Success rate (%)"
                  max={100}
                  min={0}
                  onChange={(e) => setSuccessRate(e.target.value)}
                  type="number"
                  value={successRate}
                />
                <Input
                  id="rate-sample"
                  label="Sample size (optional)"
                  min={0}
                  onChange={(e) => setSampleSize(e.target.value)}
                  type="number"
                  value={sampleSize}
                />
                <Input
                  id="rate-published"
                  label="Published"
                  onChange={(e) => setPublishedAt(e.target.value)}
                  type="date"
                  value={publishedAt}
                />
              </div>
              <div className="flex gap-3">
                <Button disabled={!canSubmit || createRate.isPending} onClick={submit} size="md">
                  {createRate.isPending ? 'Saving…' : 'Publish rate'}
                </Button>
                <Button onClick={resetForm} size="md" variant="secondary">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button leftIcon={<Plus size={17} />} onClick={() => setShowForm(true)} size="md">
              Add visa success rate
            </Button>
          )}
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex min-h-52 items-center justify-center">
          <Loader2 className="animate-spin text-[#045A58]" size={26} />
        </div>
      ) : isError ? (
        <ErrorState error={error} />
      ) : rates.length === 0 ? (
        <div className="px-6 py-10 text-center text-sm text-[#6B7280]">No visa success rates yet.</div>
      ) : (
        <div className="divide-y divide-[#E5E7EB]">
          {rates.map((rate) => (
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6" key={rate.publicId}>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-[#111827]">{rate.country}</p>
                  <Badge tone="success">{rate.successRate}%</Badge>
                  <Badge tone={rate.isActive ? 'success' : 'neutral'}>{rate.isActive ? 'Active' : 'Retracted'}</Badge>
                  {rate.sourcePartner ? <Badge tone="brand">{rate.sourcePartner}</Badge> : null}
                </div>
                <p className="mt-2 text-xs text-[#6B7280]">
                  {rate.periodLabel}
                  {rate.sampleSize ? ` · n=${rate.sampleSize}` : ''} · Published {formatDate(rate.publishedAt)}
                </p>
              </div>

              {canManage ? (
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    className={`relative h-6 w-11 shrink-0 rounded-full outline-none transition focus:ring-4 focus:ring-[#E6F4F3] ${
                      rate.isActive ? 'bg-[#045A58]' : 'bg-[#D1D5DB]'
                    }`}
                    onClick={() => updateRate.mutate({ rateId: rate.publicId, data: { isActive: !rate.isActive } })}
                    title={rate.isActive ? 'Retract' : 'Reactivate'}
                    type="button"
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
                        rate.isActive ? 'left-6' : 'left-1'
                      }`}
                    />
                  </button>
                  <button
                    aria-label={`Delete ${rate.country} rate`}
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-[#6B7280] outline-none transition hover:bg-[#FEE2E2] hover:text-[#B42318] focus:ring-4 focus:ring-[#FEE2E2]"
                    onClick={() => setPendingDelete(rate)}
                    type="button"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {pendingDelete ? (
        <DeleteConfirmationModal
          consequence="This rate will stop being cited by the AI immediately and cannot be recovered."
          isOpen
          itemLabel={`${pendingDelete.country} — ${pendingDelete.periodLabel}`}
          itemType="visa success rate"
          onClose={() => setPendingDelete(null)}
          onConfirm={() => deleteRate.mutate(pendingDelete.publicId, { onSuccess: () => setPendingDelete(null) })}
        />
      ) : null}
    </Card>
  )
}

const ErrorState = ({ error }: { error: unknown }) => (
  <div className="flex min-h-52 flex-col items-center justify-center gap-3 px-6 py-10 text-center">
    <AlertCircle className="text-[#DC2626]" size={22} />
    <p className="text-sm text-[#6B7280]">
      {isAxiosError<ApiErrorResponse>(error)
        ? (error.response?.data.error.message ?? 'Failed to load data')
        : 'Failed to load data'}
    </p>
  </div>
)

export default IndustryIntelPage
