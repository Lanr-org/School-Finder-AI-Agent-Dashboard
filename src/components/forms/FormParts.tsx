import type { ReactNode } from 'react'
import Card from '../ui/Card.js'

export const selectClasses =
  'h-12 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#111827] outline-none transition focus:border-[#045A58] focus:ring-4 focus:ring-[#E6F4F3]'

type FormSectionProps = {
  children: ReactNode
  description: string
  icon: ReactNode
  title: string
}

export const FormSection = ({ children, description, icon, title }: FormSectionProps) => (
  <Card>
    <div className="mb-6 flex items-start gap-3 border-b border-[#E5E7EB] pb-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#E6F4F3] text-[#045A58]">
        {icon}
      </div>
      <div>
        <h2 className="text-lg font-semibold text-[#111827]">{title}</h2>
        <p className="mt-1 text-sm leading-5 text-[#6B7280]">{description}</p>
      </div>
    </div>
    {children}
  </Card>
)

type SelectFieldProps = {
  defaultValue?: string | undefined
  id: string
  label: string
  name: string
  options: { value: string; label: string }[]
  placeholder?: string
  required?: boolean
}

export const SelectField = ({ defaultValue, id, label, name, options, placeholder, required }: SelectFieldProps) => (
  <div>
    <label className="mb-2 block text-sm font-medium text-[#111827]" htmlFor={id}>
      {label}
    </label>
    <select className={selectClasses} defaultValue={defaultValue ?? ''} id={id} name={name} required={required}>
      {placeholder ? (
        <option disabled value="">
          {placeholder}
        </option>
      ) : null}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
)

type TextareaFieldProps = {
  defaultValue?: string | undefined
  id: string
  label: string
  name: string
  placeholder: string
  rows: number
}

export const TextareaField = ({ defaultValue, id, label, name, placeholder, rows }: TextareaFieldProps) => (
  <div>
    <label className="mb-2 block text-sm font-medium text-[#111827]" htmlFor={id}>
      {label}
    </label>
    <textarea
      className="w-full resize-y rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm leading-6 text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#045A58] focus:ring-4 focus:ring-[#E6F4F3]"
      defaultValue={defaultValue}
      id={id}
      name={name}
      placeholder={placeholder}
      rows={rows}
    />
  </div>
)

export const FormError = ({ message }: { message: string | null | undefined }) =>
  message ? (
    <div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-4" role="alert">
      <p className="text-sm leading-5 text-[#991B1B]">{message}</p>
    </div>
  ) : null

// Empty text fields go to the API as null, so clearing a field really clears it.
export const textOrNull = (form: FormData, name: string) => {
  const value = String(form.get(name) ?? '').trim()
  return value === '' ? null : value
}

export const numberOrNull = (form: FormData, name: string) => {
  const value = String(form.get(name) ?? '').trim()
  return value === '' ? null : Number(value)
}

// Send only what changed on edit.
export const changedFields = <T extends object>(before: T, after: T): Partial<T> =>
  Object.fromEntries(
    (Object.keys(after) as (keyof T)[])
      .filter((key) => JSON.stringify(before[key]) !== JSON.stringify(after[key]))
      .map((key) => [key, after[key]]),
  ) as Partial<T>
