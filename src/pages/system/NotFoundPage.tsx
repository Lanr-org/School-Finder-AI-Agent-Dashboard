import {
  ArrowLeft,
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  LogIn,
  MessageSquareText,
  RouteOff,
  School,
  Users,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell.js'
import Button from '../../components/ui/Button.js'
import Card from '../../components/ui/Card.js'
import { useAuthStore } from '../../store/authStore.js'

const workspaceLinks = [
  { icon: <LayoutDashboard size={18} />, label: 'Dashboard', to: '/' },
  { icon: <Users size={18} />, label: 'Students', to: '/students' },
  { icon: <School size={18} />, label: 'Schools', to: '/schools' },
  { icon: <BookOpen size={18} />, label: 'Programs', to: '/programs' },
  { icon: <MessageSquareText size={18} />, label: 'Conversations', to: '/conversations' },
]

const NotFoundPage = () => {
  const isAuthenticated = useAuthStore((state) => state.status === 'authenticated')
  const location = useLocation()

  const content = (
    <NotFoundContent
      isAuthenticated={isAuthenticated}
      requestedPath={`${location.pathname}${location.search}`}
    />
  )

  if (isAuthenticated) {
    return <AppShell>{content}</AppShell>
  }

  return (
    <div className="min-h-screen bg-[#F5F6F8] px-4 py-8 text-[#111827] sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#ECEFFF] text-[#2B4BFF]">
            <GraduationCap size={23} />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#111827]">Smetase</p>
            <p className="text-xs font-medium text-[#6B7280]">Staff Portal</p>
          </div>
        </div>
        {content}
      </div>
    </div>
  )
}

const NotFoundContent = ({
  isAuthenticated,
  requestedPath,
}: {
  isAuthenticated: boolean
  requestedPath: string
}) => {
  const navigate = useNavigate()

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-5xl items-center justify-center">
      <Card className="w-full overflow-hidden p-0">
        <div className="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)]">
          <section className="p-6 sm:p-8 lg:p-10">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#ECEFFF] text-[#2B4BFF]">
                <RouteOff size={23} />
              </div>
              <span className="text-5xl font-semibold tracking-normal text-[#D1D5DB]">404</span>
            </div>

            <p className="mt-7 text-sm font-medium text-[#2B4BFF]">Route not found</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal text-[#111827]">
              This workspace path does not exist
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#6B7280]">
              The address may be incomplete, outdated, or linked to a record that is no longer available.
            </p>

            <div className="mt-6 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <p className="text-xs font-semibold uppercase tracking-normal text-[#9CA3AF]">Requested path</p>
              <p className="mt-2 break-all font-mono text-sm font-medium text-[#374151]">{requestedPath}</p>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button
                leftIcon={<ArrowLeft size={17} />}
                onClick={() => navigate(-1)}
                size="md"
                variant="secondary"
              >
                Go back
              </Button>
              {isAuthenticated ? (
                <Link
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-transparent bg-[#2B4BFF] px-4 text-sm font-semibold text-white outline-none transition hover:bg-[#1E36D8] focus:ring-4 focus:ring-[#ECEFFF]"
                  to="/"
                >
                  <LayoutDashboard size={17} />
                  Return to dashboard
                </Link>
              ) : (
                <Link
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-transparent bg-[#2B4BFF] px-4 text-sm font-semibold text-white outline-none transition hover:bg-[#1E36D8] focus:ring-4 focus:ring-[#ECEFFF]"
                  to="/login"
                >
                  <LogIn size={17} />
                  Go to sign in
                </Link>
              )}
            </div>
          </section>

          <aside className="border-t border-[#E5E7EB] bg-[#F9FAFB] p-6 sm:p-8 lg:border-l lg:border-t-0">
            {isAuthenticated ? (
              <>
                <h2 className="text-lg font-semibold text-[#111827]">Open a workspace</h2>
                <p className="mt-1 text-sm leading-6 text-[#6B7280]">
                  Continue from one of the primary operational areas.
                </p>
                <nav className="mt-6 space-y-2" aria-label="Workspace recovery links">
                  {workspaceLinks.map((item) => (
                    <RecoveryLink icon={item.icon} key={item.to} label={item.label} to={item.to} />
                  ))}
                </nav>
              </>
            ) : (
              <div className="flex h-full min-h-64 flex-col justify-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#ECEFFF] text-[#2B4BFF]">
                  <LogIn size={20} />
                </div>
                <h2 className="mt-5 text-lg font-semibold text-[#111827]">Staff access required</h2>
                <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                  Sign in with your company account to open protected students, schools, programs, conversations, and team workflows.
                </p>
              </div>
            )}
          </aside>
        </div>
      </Card>
    </div>
  )
}

const RecoveryLink = ({ icon, label, to }: { icon: ReactNode; label: string; to: string }) => (
  <Link
    className="flex min-h-12 items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-semibold text-[#374151] outline-none transition hover:border-[#C2CBFF] hover:bg-[#F5F7FF] hover:text-[#2B4BFF] focus:ring-4 focus:ring-[#ECEFFF]"
    to={to}
  >
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#ECEFFF] text-[#2B4BFF]">
      {icon}
    </span>
    {label}
  </Link>
)

export default NotFoundPage
