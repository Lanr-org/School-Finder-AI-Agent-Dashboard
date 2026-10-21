import { AlertTriangle, Trash2 } from 'lucide-react'
import Button from '../ui/Button.js'
import Modal from '../ui/Modal.js'

type DeleteConfirmationModalProps = {
  consequence: string
  description?: string
  errorMessage?: string | null | undefined
  isDeleting?: boolean | undefined
  isOpen: boolean
  itemLabel: string
  itemType: string
  onClose: () => void
  onConfirm: () => void
}

const DeleteConfirmationModal = ({
  consequence,
  description = 'This action cannot be undone.',
  errorMessage,
  isDeleting = false,
  isOpen,
  itemLabel,
  itemType,
  onClose,
  onConfirm,
}: DeleteConfirmationModalProps) => (
  <Modal
    description={description}
    isOpen={isOpen}
    onClose={() => (isDeleting ? undefined : onClose())}
    title={`Delete ${itemType}?`}
  >
    <div className="px-5 py-5 sm:px-6">
      <div className="flex items-start gap-3 rounded-xl border border-[#F7C9C5] bg-[#FEF3F2] p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FEE2E2] text-[#B42318]">
          <Trash2 size={18} />
        </div>
        <div className="min-w-0">
          <p className="break-words text-sm font-semibold text-[#111827]">{itemLabel}</p>
          <p className="mt-1 text-sm leading-5 text-[#6B7280]">
            This {itemType} will be permanently removed.
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-xl border border-[#E5E7EB] p-4">
        <AlertTriangle className="mt-0.5 shrink-0 text-[#B45309]" size={18} />
        <div>
          <p className="text-sm font-semibold text-[#111827]">Before deleting</p>
          <p className="mt-1 text-sm leading-6 text-[#4B5563]">{consequence}</p>
        </div>
      </div>

      {errorMessage ? (
        <p className="mt-4 rounded-xl border border-[#F7C9C5] bg-[#FEF3F2] px-4 py-3 text-sm text-[#B42318]" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>

    <div className="flex flex-col-reverse gap-3 border-t border-[#E5E7EB] px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
      <Button disabled={isDeleting} onClick={onClose} size="md" variant="secondary">
        Keep {itemType}
      </Button>
      <Button disabled={isDeleting} leftIcon={<Trash2 size={16} />} onClick={onConfirm} size="md" variant="danger">
        {isDeleting ? 'Deleting…' : `Delete ${itemType}`}
      </Button>
    </div>
  </Modal>
)

export default DeleteConfirmationModal
