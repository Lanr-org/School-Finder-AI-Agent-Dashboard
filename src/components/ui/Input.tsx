import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn.js'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string
  helperText?: string
  label?: string
  leftIcon?: ReactNode
  rightSlot?: ReactNode
}

const Input = ({
  className,
  error,
  helperText,
  id,
  label,
  leftIcon,
  rightSlot,
  ...props
}: InputProps) => {
  const describedBy = error ? `${id}-error` : helperText ? `${id}-helper` : undefined

  return (
    <div>
      {label ? (
        <label className="mb-2 block text-sm font-medium text-[#111827]" htmlFor={id}>
          {label}
        </label>
      ) : null}

      <div className="relative">
        {leftIcon ? (
          <span className="pointer-events-none absolute left-4 top-1/2 flex -translate-y-1/2 text-[#6B7280]">
            {leftIcon}
          </span>
        ) : null}

        <input
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          className={cn(
            'h-12 w-full rounded-xl border bg-white px-4 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:ring-4',
            leftIcon ? 'pl-11' : undefined,
            rightSlot ? 'pr-12' : undefined,
            error
              ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#FEE2E2]'
              : 'border-[#E5E7EB] focus:border-[#2B4BFF] focus:ring-[#ECEFFF]',
            className,
          )}
          id={id}
          {...props}
        />

        {rightSlot ? (
          <span className="absolute right-4 top-1/2 flex -translate-y-1/2 text-[#6B7280]">
            {rightSlot}
          </span>
        ) : null}
      </div>

      {error ? (
        <p className="mt-2 text-sm text-[#DC2626]" id={`${id}-error`}>
          {error}
        </p>
      ) : helperText ? (
        <p className="mt-2 text-sm text-[#6B7280]" id={`${id}-helper`}>
          {helperText}
        </p>
      ) : null}
    </div>
  )
}

export default Input
