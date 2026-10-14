import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn.js'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  size?: ButtonSize
  variant?: ButtonVariant
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'border-transparent bg-[#2B4BFF] text-white hover:bg-[#1E36D8] focus:ring-[#ECEFFF]',
  secondary:
    'border-[#E5E7EB] bg-white text-[#111827] hover:border-[#D1D5DB] hover:bg-[#F9FAFB] focus:ring-[#ECEFFF]',
  ghost:
    'border-transparent bg-transparent text-[#2B4BFF] hover:bg-[#ECEFFF] hover:text-[#1E36D8] focus:ring-[#ECEFFF]',
  danger:
    'border-transparent bg-[#DC2626] text-white hover:bg-[#B91C1C] focus:ring-[#FEE2E2]',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 rounded-xl px-3 text-sm',
  md: 'h-10 rounded-xl px-4 text-sm',
  lg: 'h-12 rounded-xl px-5 text-sm',
}

const Button = ({
  children,
  className,
  disabled,
  leftIcon,
  rightIcon,
  size = 'md',
  type = 'button',
  variant = 'primary',
  ...props
}: ButtonProps) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 border font-semibold outline-none transition focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      disabled={disabled}
      type={type}
      {...props}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  )
}

export default Button
