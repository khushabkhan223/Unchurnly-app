'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  BarChart3,
  Shield,
  Users,
  Mail,
  Settings,
  LogOut,
  ChevronDown,
  Code2,
  BookOpen,
  MessageCircle,
} from 'lucide-react'

type NavItemProps = {
  href: string
  icon: React.ElementType
  label: string
  subtitle?: string
  active: boolean
  badge?: boolean
}

function NavItem({ href, icon: Icon, label, subtitle, active, badge }: NavItemProps) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
        active ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-600 hover:bg-slate-50'
      }`}
    >
      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
      <div className="min-w-0 flex-1">
        <span className="block">{label}</span>
        {subtitle && <span className="block text-xs text-slate-400 leading-tight">{subtitle}</span>}
      </div>
      {badge && <span className="w-2 h-2 rounded-full bg-orange-400 shrink-0" />}
    </Link>
  )
}

export default function Sidebar({
  userEmail,
  widgetInstalled = true,
}: {
  userEmail: string
  widgetInstalled?: boolean
}) {
  const pathname = usePathname()
  const router = useRouter()

  const domain = userEmail.includes('@') ? userEmail.split('@')[1] : userEmail

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href)
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <aside
      className="flex flex-col h-full bg-white border-r border-slate-200 px-4 py-6 shrink-0"
      style={{ width: 260 }}
    >
      {/* Workspace header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">U</span>
          </div>
          <span className="text-slate-900 font-semibold text-sm">Unchurnly</span>
        </div>
        <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 border border-slate-200 text-left mt-1">
          <div className="w-4 h-4 rounded bg-blue-100 flex items-center justify-center shrink-0">
            <span className="text-blue-600 text-[9px] font-bold">
              {domain[0]?.toUpperCase() ?? 'W'}
            </span>
          </div>
          <span className="text-xs text-slate-600 truncate flex-1">{domain}</span>
          <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
        </button>
      </div>

      {/* Grouped navigation */}
      <nav className="flex-1 space-y-4">
        {/* Overview */}
        <div>
          <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Overview
          </p>
          <div className="space-y-0.5">
            <NavItem
              href="/dashboard"
              icon={BarChart3}
              label="Analytics"
              active={isActive('/dashboard', true)}
            />
            <NavItem
              href="/dashboard/customers"
              icon={Users}
              label="Customers"
              active={isActive('/dashboard/customers', false)}
            />
          </div>
        </div>

        {/* Automations */}
        <div>
          <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Automations
          </p>
          <div className="space-y-0.5">
            <NavItem
              href="/dashboard/retention"
              icon={Shield}
              label="Cancel Flows"
              subtitle="Offers & retention"
              active={isActive('/dashboard/retention', false)}
            />
            <NavItem
              href="/dashboard/dunning"
              icon={Mail}
              label="Dunning"
              subtitle="Failed payments"
              active={isActive('/dashboard/dunning', false)}
            />
          </div>
        </div>

        {/* Configuration */}
        <div>
          <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Configuration
          </p>
          <div className="space-y-0.5">
            <NavItem
              href="/dashboard/settings"
              icon={Code2}
              label="Installation"
              active={isActive('/dashboard/settings', false)}
              badge={!widgetInstalled}
            />
            <NavItem
              href="/dashboard/settings"
              icon={Settings}
              label="Settings"
              active={false}
            />
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-100 pt-4 space-y-0.5">
        <a
          href="#"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-slate-50 transition-colors"
        >
          <BookOpen className="w-4 h-4 shrink-0" />
          Documentation
        </a>
        <a
          href="mailto:support@unchurnly.com"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-slate-50 transition-colors"
        >
          <MessageCircle className="w-4 h-4 shrink-0" />
          Support
        </a>
        <div className="flex items-center gap-2 px-3 py-2 mt-1">
          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <span className="text-blue-600 text-xs font-semibold">
              {userEmail[0]?.toUpperCase() ?? 'U'}
            </span>
          </div>
          <span className="text-xs text-slate-600 truncate flex-1">{userEmail}</span>
          <button
            onClick={handleLogout}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            title="Log out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}
