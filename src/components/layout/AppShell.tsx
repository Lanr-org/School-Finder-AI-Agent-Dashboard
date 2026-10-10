import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar.js'
import Topbar from './Topbar.js'

type AppShellProps = {
  children: ReactNode
}

const AppShell = ({ children }: AppShellProps) => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const { pathname } = useLocation()

  // A new page starts at the top, not at the previous page's scroll position.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="min-h-screen bg-[#F5F6F8] text-[#111827]">
      <Sidebar
        isMobileOpen={isMobileNavOpen}
        onMobileClose={() => setIsMobileNavOpen(false)}
      />
      <main className="min-h-screen lg:pl-72">
        <Topbar onMenuClick={() => setIsMobileNavOpen(true)} />
        <div className="px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  )
}

export default AppShell
