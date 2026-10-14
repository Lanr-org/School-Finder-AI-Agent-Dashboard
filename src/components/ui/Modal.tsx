import { X } from 'lucide-react'
import { useEffect, useId, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../../utils/cn.js'

type ModalProps = {
  children: ReactNode
  description?: string
  isOpen: boolean
  onClose: () => void
  size?: 'md' | 'lg'
  title: string
}

const Modal = ({ children, description, isOpen, onClose, size = 'md', title }: ModalProps) => {
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', closeOnEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <div
      aria-labelledby={titleId}
      {...(description ? { 'aria-describedby': descriptionId } : {})}
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#111827]/45 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
      role="dialog"
    >
      <div
        className={cn(
          'w-full rounded-[20px] border border-[#E5E7EB] bg-white shadow-[0_24px_70px_rgba(17,24,39,0.22)]',
          size === 'lg' ? 'max-w-2xl' : 'max-w-md',
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#E5E7EB] px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-[#111827]" id={titleId}>
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-sm leading-6 text-[#6B7280]" id={descriptionId}>
                {description}
              </p>
            ) : null}
          </div>
          <button
            aria-label="Close dialog"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#6B7280] outline-none transition hover:bg-[#F3F4F6] hover:text-[#111827] focus:ring-4 focus:ring-[#ECEFFF]"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  )
}

export default Modal
