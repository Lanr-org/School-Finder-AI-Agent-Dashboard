import { MailX, Power, PowerOff, ShieldAlert } from 'lucide-react'
import type { ComponentType } from 'react'
import Badge from '../ui/Badge.js'
import Button from '../ui/Button.js'
import Modal from '../ui/Modal.js'

type AccountAccessAction = 'activate' | 'cancel-invitation' | 'disable'

type AccountAccessConfirmationModalProps = {
  action: AccountAccessAction
  email: string
  errorMessage?: string | null | undefined
  isConfirming?: boolean | undefined
  isOpen: boolean
  memberName: string
  onClose: () => void
  onConfirm: () => void
}

type ActionContent = {
  buttonLabel: string
  pendingLabel: string
  description: string
  detail: string
  icon: ComponentType<{ size?: number }>
  title: string
  variant: 'danger' | 'primary'
}

const actionContent: Record<AccountAccessAction, ActionContent> = {
  activate: {
    buttonLabel: 'Activate account',
    pendingLabel: 'Activating…',
    description: "Restore this team member's access to the staff workspace.",
    detail:
      'The member will be able to sign in again with their existing credentials. Their role and permissions will remain unchanged.',
    icon: Power,
    title: 'Activate this account?',
    variant: 'primary',
  },
  'cancel-invitation': {
    buttonLabel: 'Delete account',
    pendingLabel: 'Deleting…',
    description: 'Remove this invited account before it is set up.',
    detail:
      'The invitation link stops working and the account is deleted. Send a new invitation if this person needs access later.',
    icon: MailX,
    title: 'Delete this invited account?',
    variant: 'danger',
  },
  disable: {
    buttonLabel: 'Disable account',
    pendingLabel: 'Disabling…',
    description: "Remove this team member's access to the staff workspace.",
    detail:
      'The member will no longer be able to sign in. Their role, assignments, and activity history will be preserved for operational review.',
    icon: PowerOff,
    title: 'Disable this account?',
    variant: 'danger',
  },
}

const AccountAccessConfirmationModal = ({
  action,
  email,
  errorMessage,
  isConfirming = false,
  isOpen,
  memberName,
  onClose,
  onConfirm,
}: AccountAccessConfirmationModalProps) => {
  const content = actionContent[action]
  const Icon = content.icon
  const isDangerous = content.variant === 'danger'

  return (
    <Modal
      description={content.description}
      isOpen={isOpen}
      onClose={onClose}
      title={content.title}
    >
      <div className="px-5 py-5 sm:px-6">
        <div
          className={`flex items-start gap-3 rounded-xl border p-4 ${
            isDangerous
              ? 'border-[#F7C9C5] bg-[#FEF3F2]'
              : 'border-[#C2CBFF] bg-[#F5F7FF]'
          }`}
        >
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              isDangerous ? 'bg-[#FEE2E2] text-[#B42318]' : 'bg-[#ECEFFF] text-[#2B4BFF]'
            }`}
          >
            <Icon size={18} />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-[#111827]">{memberName}</p>
              <Badge tone={action === 'activate' ? 'success' : 'error'}>
                {action === 'cancel-invitation' ? 'Pending invitation' : 'Account access'}
              </Badge>
            </div>
            <p className="mt-1 break-words text-sm text-[#6B7280]">{email}</p>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-3 rounded-xl border border-[#E5E7EB] p-4">
          <ShieldAlert className="mt-0.5 shrink-0 text-[#6B7280]" size={18} />
          <p className="text-sm leading-6 text-[#4B5563]">{content.detail}</p>
        </div>

        {errorMessage ? (
          <p className="mt-4 rounded-xl border border-[#F7C9C5] bg-[#FEF3F2] px-4 py-3 text-sm text-[#B42318]" role="alert">
            {errorMessage}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-[#E5E7EB] px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
        <Button disabled={isConfirming} onClick={onClose} size="md" variant="secondary">
          Keep current access
        </Button>
        <Button
          disabled={isConfirming}
          leftIcon={<Icon size={16} />}
          onClick={onConfirm}
          size="md"
          variant={content.variant}
        >
          {isConfirming ? content.pendingLabel : content.buttonLabel}
        </Button>
      </div>
    </Modal>
  )
}

export type { AccountAccessAction }
export default AccountAccessConfirmationModal
