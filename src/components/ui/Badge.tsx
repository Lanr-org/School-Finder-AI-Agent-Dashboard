import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn.js'

type BadgeTone = 'brand' | 'neutral' | 'success' | 'warning' | 'error'

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode
  tone?: BadgeTone
}

const toneClasses: Record<BadgeTone, string> = {
  brand: 'bg-[#ECEFFF] text-[#2B4BFF]',
  neutral: 'bg-[#F3F4F6] text-[#374151]',
  success: 'bg-[#DCFCE7] text-[#166534]',
  warning: 'bg-[#FEF3C7] text-[#92400E]',
  error: 'bg-[#FEE2E2] text-[#991B1B]',
}

const Badge = ({ children, className, tone = 'neutral', ...props }: BadgeProps) => {
  return (
    <span
      className={cn(
        'inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-xs font-semibold',
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export default Badge
