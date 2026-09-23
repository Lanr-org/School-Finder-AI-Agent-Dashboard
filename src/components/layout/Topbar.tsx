import {
  AlertTriangle,
  Bell,
  CheckCheck,
  ChevronDown,
  LogOut,
  MailPlus,
  Menu,
  MessageSquareText,
  Plus,
  Search,
  Settings,
  Trash2,
  UserRound,
  UserRoundCheck,
} from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../ui/Button.js'
import Input from '../ui/Input.js'
import Modal from '../ui/Modal.js'
import { cn } from '../../utils/cn.js'
import { api } from '../../lib/api/client.js'
import { useAuthStore } from '../../store/authStore.js'

type TopbarProps = {
  onMenuClick: () => void
}

const roleLabels: Record<string, string> = {
  ADMIN: 'Admin',
  ADVISOR: 'Advisor',
  OPERATIONS: 'Operations',
}

const initialsOf = (fullName: string) =>
  fullName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

type NotificationItem = {
  description: string
  icon: ReactNode
  id: string
  read: boolean
  time: string
  title: string
  to: string
}

const initialNotifications: NotificationItem[] = [
  {
    description: 'Chinedu Nwosu was assigned to you for recommendation review.',
    icon: <UserRoundCheck size={17} />,
    id: 'notification-1',
    read: false,
    time: '8 minutes ago',
    title: 'New student assignment',
    to: '/students/STU-1048',
  },
  {
    description: 'A Telegram conversation requires advisor attention.',
    icon: <MessageSquareText size={17} />,
    id: 'notification-2',
    read: false,
    time: '24 minutes ago',
    title: 'Conversation escalated',
    to: '/conversations/CONV-2084',
  },
  {
    description: 'Three advisor follow-ups are due before the end of today.',
    icon: <AlertTriangle size={17} />,
    id: 'notification-3',
    read: false,
    time: '1 hour ago',
    title: 'Follow-ups due',
    to: '/advisors',
  },
  {
    description: 'Tola Adeyemi is still waiting to accept the team invitation.',
    icon: <MailPlus size={17} />,
    id: 'notification-4',
    read: true,
    time: 'Yesterday',
    title: 'Invitation pending',
    to: '/team/USR-1004',
  },
]

const Topbar = ({ onMenuClick }: TopbarProps) => {
  const navigate = useNavigate()
  const authUser = useAuthStore((state) => state.user)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [notifications, setNotifications] = useState(initialNotifications)
  const unreadCount = notifications.filter((notification) => !notification.read).length

  const currentUser = {
    initials: authUser ? initialsOf(authUser.fullName) : '',
    name: authUser?.fullName ?? '',
    role: authUser ? (roleLabels[authUser.role] ?? authUser.role) : '',
  }

  useEffect(() => {
    const closePopovers = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest('[data-topbar-popover]')) {
        setIsNotificationsOpen(false)
        setIsProfileMenuOpen(false)
      }
    }

    const closePopoversOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsNotificationsOpen(false)
        setIsProfileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', closePopovers)
    document.addEventListener('keydown', closePopoversOnEscape)

    return () => {
      document.removeEventListener('mousedown', closePopovers)
      document.removeEventListener('keydown', closePopoversOnEscape)
    }
  }, [])

  const signOut = async () => {
    setIsSigningOut(true)
    try {
      await api.post('/auth/logout')
    } catch {
      // Session may already be invalid server-side — still clear it locally.
    } finally {
      useAuthStore.getState().logout()
      setIsSigningOut(false)
      setIsSignOutModalOpen(false)
      navigate('/login', { replace: true })
    }
  }

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-[#E5E7EB] bg-white">
        <div className="flex h-20 items-center gap-4 px-4 sm:px-6 lg:px-8">
        <button
          aria-label="Open navigation"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-[#6B7280] outline-none transition hover:border-[#D1D5DB] hover:bg-[#F9FAFB] hover:text-[#111827] focus:ring-4 focus:ring-[#E6F4F3] lg:hidden"
          onClick={onMenuClick}
          type="button"
        >
          <Menu size={19} />
        </button>

        <div className="min-w-0 flex-1">
          <Input
            className="h-11 max-w-xl bg-[#F9FAFB]"
            id="global-search"
            leftIcon={<Search size={18} />}
            placeholder="Search students, schools, programs, conversations..."
            type="search"
          />
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <Link
            aria-label="Add student"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-transparent bg-[#045A58] text-white outline-none transition hover:bg-[#034A48] focus:ring-4 focus:ring-[#E6F4F3] xl:w-auto xl:gap-2 xl:px-4"
            to="/students/new"
          >
            <Plus size={24} strokeWidth={2.8} />
            <span className="hidden xl:inline">Add student</span>
          </Link>

          <div className="relative" data-topbar-popover>
            <button
              aria-expanded={isNotificationsOpen}
              aria-haspopup="dialog"
              aria-label={`View notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
              className={`relative flex h-10 w-10 items-center justify-center rounded-xl border bg-white outline-none transition focus:ring-4 focus:ring-[#E6F4F3] ${
                isNotificationsOpen
                  ? 'border-[#B9DAD8] bg-[#E6F4F3] text-[#045A58]'
                  : 'border-[#E5E7EB] text-[#6B7280] hover:border-[#D1D5DB] hover:bg-[#F9FAFB] hover:text-[#111827]'
              }`}
              onClick={() => {
                setIsNotificationsOpen((isOpen) => !isOpen)
                setIsProfileMenuOpen(false)
              }}
              type="button"
            >
              <Bell size={18} />
              {unreadCount ? (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-[#DC2626] px-1 text-[10px] font-semibold text-white">
                  {unreadCount}
                </span>
              ) : null}
            </button>

            {isNotificationsOpen ? (
              <div
                aria-label="Notifications"
                className="absolute right-0 top-12 z-30 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-[16px] border border-[#E5E7EB] bg-white shadow-[0_18px_45px_rgba(17,24,39,0.14)]"
                role="dialog"
              >
                <div className="flex items-start justify-between gap-4 border-b border-[#E5E7EB] px-4 py-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-semibold text-[#111827]">Notifications</h2>
                      {unreadCount ? (
                        <span className="rounded-full bg-[#E6F4F3] px-2 py-0.5 text-xs font-semibold text-[#045A58]">
                          {unreadCount} unread
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs text-[#6B7280]">Recent operational updates</p>
                  </div>
                  {unreadCount ? (
                    <button
                      className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-[#045A58] outline-none hover:text-[#034A48] focus:underline"
                      onClick={() =>
                        setNotifications((current) =>
                          current.map((notification) => ({ ...notification, read: true })),
                        )
                      }
                      type="button"
                    >
                      <CheckCheck size={15} />
                      Mark all read
                    </button>
                  ) : null}
                </div>

                {notifications.length ? (
                  <>
                    <div className="max-h-[420px] overflow-y-auto">
                      {notifications.map((notification) => (
                        <Link
                          className={`flex gap-3 border-b border-[#E5E7EB] px-4 py-4 transition last:border-b-0 hover:bg-[#F9FAFB] ${
                            notification.read ? 'bg-white' : 'bg-[#F2F9F8]'
                          }`}
                          key={notification.id}
                          onClick={() => {
                            setNotifications((current) =>
                              current.map((item) =>
                                item.id === notification.id ? { ...item, read: true } : item,
                              ),
                            )
                            setIsNotificationsOpen(false)
                          }}
                          to={notification.to}
                        >
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                              notification.read
                                ? 'bg-[#F3F4F6] text-[#6B7280]'
                                : 'bg-[#E6F4F3] text-[#045A58]'
                            }`}
                          >
                            {notification.icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-sm font-semibold text-[#111827]">{notification.title}</p>
                              {!notification.read ? (
                                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#045A58]" />
                              ) : null}
                            </div>
                            <p className="mt-1 text-sm leading-5 text-[#6B7280]">{notification.description}</p>
                            <p className="mt-2 text-xs font-medium text-[#9CA3AF]">{notification.time}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <div className="border-t border-[#E5E7EB] px-4 py-3">
                      <button
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-[#6B7280] outline-none transition hover:bg-[#F3F4F6] hover:text-[#B42318] focus:ring-4 focus:ring-[#E6F4F3]"
                        onClick={() => setNotifications([])}
                        type="button"
                      >
                        <Trash2 size={15} />
                        Clear notifications
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex min-h-60 flex-col items-center justify-center px-6 py-10 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E6F4F3] text-[#045A58]">
                      <Bell size={21} />
                    </div>
                    <h3 className="mt-4 text-sm font-semibold text-[#111827]">You are all caught up</h3>
                    <p className="mt-2 max-w-xs text-sm leading-5 text-[#6B7280]">
                      New assignments, conversations, follow-ups, and account updates will appear here.
                    </p>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          <div className="relative" data-topbar-popover>
            <button
              aria-expanded={isProfileMenuOpen}
              aria-label="Open profile menu"
              aria-haspopup="menu"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white outline-none transition hover:border-[#D1D5DB] hover:bg-[#F9FAFB] focus:ring-4 focus:ring-[#E6F4F3] md:h-11 md:w-auto md:gap-3 md:px-2.5 md:pr-3"
              onClick={() => {
                setIsProfileMenuOpen((isOpen) => !isOpen)
                setIsNotificationsOpen(false)
              }}
              type="button"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E6F4F3] text-xs font-semibold text-[#045A58] md:h-8 md:w-8 md:rounded-xl md:text-sm">
                {currentUser.initials}
              </span>
              <span className="hidden text-left md:block">
                <span className="block text-sm font-semibold text-[#111827]">{currentUser.name}</span>
                <span className="block text-xs font-medium text-[#6B7280]">{currentUser.role}</span>
              </span>
              <ChevronDown
                className={cn('hidden text-[#6B7280] transition-transform md:block', isProfileMenuOpen && 'rotate-180')}
                size={16}
              />
            </button>

            {isProfileMenuOpen ? (
              <div
                className="absolute right-0 mt-2 w-60 rounded-[16px] border border-[#E5E7EB] bg-white p-2 shadow-[0_18px_45px_rgba(17,24,39,0.12)]"
                role="menu"
              >
                <div className="border-b border-[#E5E7EB] px-3 py-3">
                  <p className="text-sm font-semibold text-[#111827]">{currentUser.name}</p>
                  <p className="mt-1 text-xs font-medium text-[#6B7280]">{currentUser.role}</p>
                </div>

                <Link
                  className="mt-2 flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-[#374151] transition hover:bg-[#F5F6F8]"
                  onClick={() => setIsProfileMenuOpen(false)}
                  role="menuitem"
                  to="/profile"
                >
                  <UserRound size={17} />
                  View profile
                </Link>
                <Link
                  className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-[#374151] transition hover:bg-[#F5F6F8]"
                  onClick={() => setIsProfileMenuOpen(false)}
                  role="menuitem"
                  to="/account-settings"
                >
                  <Settings size={17} />
                  Account settings
                </Link>
                <button
                  className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-[#DC2626] transition hover:bg-[#FEE2E2]"
                  onClick={() => {
                    setIsProfileMenuOpen(false)
                    setIsSignOutModalOpen(true)
                  }}
                  role="menuitem"
                  type="button"
                >
                  <LogOut size={17} />
                  Sign out
                </button>
              </div>
            ) : null}
          </div>
        </div>
        </div>
      </header>

      <Modal
        description="You will need to sign in again to access the staff workspace."
        isOpen={isSignOutModalOpen}
        onClose={() => setIsSignOutModalOpen(false)}
        title="Sign out of your account?"
      >
        <div className="px-6 py-5">
          <div className="flex items-start gap-3 rounded-xl border border-[#F7C9C5] bg-[#FEF3F2] p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FEE2E2] text-[#B42318]">
              <LogOut size={17} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#111827]">{currentUser.name}</p>
              <p className="mt-1 text-sm leading-5 text-[#6B7280]">
                Your current session on this device will end.
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col-reverse gap-3 border-t border-[#E5E7EB] px-6 py-4 sm:flex-row sm:justify-end">
          <Button onClick={() => setIsSignOutModalOpen(false)} size="md" variant="secondary">
            Cancel
          </Button>
          <Button
            disabled={isSigningOut}
            leftIcon={<LogOut size={16} />}
            onClick={signOut}
            size="md"
            variant="danger"
          >
            {isSigningOut ? 'Signing out…' : 'Sign out'}
          </Button>
        </div>
      </Modal>
    </>
  )
}

export default Topbar
