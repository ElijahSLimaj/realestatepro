import { useState } from 'react'
import { Outlet, NavLink, Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard,
  Home,
  FileText,
  Star,
  MapPin,
  Briefcase,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Loader2,
} from 'lucide-react'

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/properties', icon: Home, label: 'Woningen' },
  { to: '/admin/blog', icon: FileText, label: 'Blog' },
  { to: '/admin/testimonials', icon: Star, label: 'Recensies' },
  { to: '/admin/neighborhoods', icon: MapPin, label: 'Wijken' },
  { to: '/admin/services', icon: Briefcase, label: 'Diensten' },
  { to: '/admin/leads', icon: Users, label: 'Leads' },
  { to: '/admin/chat', icon: MessageSquare, label: 'Chat' },
  { to: '/admin/settings', icon: Settings, label: 'Instellingen' },
]

function SidebarContent({ onSignOut, onNavClick }) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo / Brand */}
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
            <Home className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight tracking-tight">
              VastGoed Elite
            </h1>
            <p className="text-white/40 text-xs">Administratie</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-accent text-white shadow-md shadow-accent/20'
                  : 'text-white/60 hover:bg-white/8 hover:text-white'
              }`
            }
          >
            <Icon className="w-5 h-5 shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:bg-white/8 hover:text-white transition-colors"
        >
          <ExternalLink className="w-5 h-5 shrink-0" />
          <span>Bekijk website</span>
        </a>
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:bg-error/20 hover:text-error transition-colors cursor-pointer"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span>Uitloggen</span>
        </button>
      </div>
    </div>
  )
}

export default function AdminLayout() {
  const { user, loading, signOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (err) {
      console.error('Sign out error:', err)
    }
  }

  const closeSidebar = () => setSidebarOpen(false)

  // Derive current page name from the active nav item
  const currentPath = window.location.pathname
  const currentNav = navItems.find((item) =>
    item.end ? currentPath === item.to : currentPath.startsWith(item.to) && item.to !== '/admin'
  )
  const pageTitle = currentNav?.label || 'Dashboard'

  return (
    <div className="min-h-screen flex bg-neutral-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar - desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-primary">
        <SidebarContent onSignOut={handleSignOut} onNavClick={undefined} />
      </aside>

      {/* Sidebar - mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-primary transform transition-transform duration-200 ease-in-out lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent onSignOut={handleSignOut} onNavClick={closeSidebar} />
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top header */}
        <header className="sticky top-0 z-30 bg-white border-b border-neutral-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              {/* Mobile hamburger */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 -ml-2 rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
                aria-label="Toggle menu"
              >
                {sidebarOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
              <h2 className="text-lg font-semibold text-primary">{pageTitle}</h2>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-neutral-500 hidden sm:block">
                {user.email}
              </span>
              <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center">
                <span className="text-sm font-semibold text-accent">
                  {user.email?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
