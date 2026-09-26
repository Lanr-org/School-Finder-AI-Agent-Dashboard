import {
  BookOpen,
  FileCheck2,
  X,
  GraduationCap,
  LayoutDashboard,
  MessageSquareText,
  Newspaper,
  School,
  ScrollText,
  Settings,
  Sparkles,
  UsersRound,
  UserRoundCheck,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '../../utils/cn.js'
import { useAuthStore } from '../../store/authStore.js'

type NavItem = {
  icon: LucideIcon
  label: string
  path: string
  roles?: string[]
}

type NavSection = {
  items: NavItem[]
  label: string
}

type SidebarProps = {
  isMobileOpen: boolean
  onMobileClose: () => void
}

const navSections: NavSection[] = [
  {
    label: 'Overview',
    items: [{ icon: LayoutDashboard, label: 'Dashboard', path: '/' }],
  },
  {
    label: 'Operations',
    items: [
      { icon: Users, label: 'Students', path: '/students' },
      { icon: FileCheck2, label: 'Applications', path: '/applications', roles: ['ADMIN', 'ADVISOR'] },
      { icon: School, label: 'Schools', path: '/schools' },
      { icon: BookOpen, label: 'Programs', path: '/programs' },
      { icon: MessageSquareText, label: 'Conversations', path: '/conversations' },
      { icon: Sparkles, label: 'Recommendations', path: '/recommendations' },
    ],
  },
  {
    label: 'Admin',
    items: [
      { icon: UsersRound, label: 'Team', path: '/team', roles: ['ADMIN'] },
      { icon: UserRoundCheck, label: 'Advisors', path: '/advisors' },
      { icon: Newspaper, label: 'Industry Intel', path: '/industry-intel' },
      { icon: Settings, label: 'Settings', path: '/settings' },
      { icon: ScrollText, label: 'Audit log', path: '/audit-log', roles: ['ADMIN'] },
    ],
  },
]

const SidebarHeader = ({ onClose }: { onClose?: () => void }) => {
  return (
    <div className="mb-8 flex items-center justify-between gap-3 px-2">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E6F4F3] text-[#045A58]">
          <GraduationCap size={23} />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#111827]">Pikinic AI Agent</p>
          <p className="text-xs font-medium text-[#6B7280]">Operations Portal</p>
        </div>
      </div>

      {onClose ? (
        <button
          aria-label="Close navigation"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-[#6B7280] outline-none transition hover:border-[#D1D5DB] hover:bg-[#F9FAFB] hover:text-[#111827] focus:ring-4 focus:ring-[#E6F4F3] lg:hidden"
          onClick={onClose}
          type="button"
        >
          <X size={18} />
        </button>
      ) : null}
    </div>
  )
}

const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => {
  const userRole = useAuthStore((state) => state.user?.role)

  const visibleSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !item.roles || (userRole && item.roles.includes(userRole))),
    }))
    .filter((section) => section.items.length > 0)

  return (
    <>
      <nav className="flex-1 space-y-7 overflow-y-auto pb-5">
        {visibleSections.map((section) => (
          <div key={section.label}>
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-normal text-[#9CA3AF]">
              {section.label}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon

                return (
                  <NavLink
                    className={({ isActive }) =>
                      cn(
                        'flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition',
                        isActive
                          ? 'bg-[#E6F4F3] text-[#045A58]'
                          : 'text-[#6B7280] hover:bg-[#F5F6F8] hover:text-[#111827]',
                      )
                    }
                    end={item.path === '/'}
                    key={item.path}
                    onClick={onNavigate}
                    to={item.path}
                  >
                    <Icon size={18} strokeWidth={2.1} />
                    <span>{item.label}</span>
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="rounded-[20px] border border-[#E5E7EB] bg-[#F9FAFB] p-4">
        <p className="text-sm font-semibold text-[#111827]">Internal workspace</p>
        <p className="mt-1 text-xs leading-5 text-[#6B7280]">
          Manage placement operations, team access, and advisor workflows.
        </p>
      </div>
    </>
  )
}

const Sidebar = ({ isMobileOpen, onMobileClose }: SidebarProps) => {
  return (
    <>
      <aside className="hidden min-h-screen w-72 shrink-0 border-r border-[#E5E7EB] bg-white px-4 py-5 lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:flex-col">
        <SidebarHeader />
        <SidebarContent />
      </aside>

      <div
        aria-hidden={!isMobileOpen}
        className={cn(
          'fixed inset-0 z-40 bg-[#111827]/35 transition-opacity lg:hidden',
          isMobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onMobileClose}
      />

      <aside
        aria-label="Mobile navigation"
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[min(20rem,calc(100vw-2rem))] flex-col border-r border-[#E5E7EB] bg-white px-4 py-5 shadow-[20px_0_50px_rgba(17,24,39,0.16)] transition-transform duration-200 lg:hidden',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <SidebarHeader onClose={onMobileClose} />
        <SidebarContent onNavigate={onMobileClose} />
      </aside>
    </>
  )
}

export default Sidebar
