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
  Code2,
  BookOpen,
  LifeBuoy,
} from 'lucide-react'
import { cn } from '@/lib/utils'

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
      className={cn(
        'flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors',
        active
          ? 'bg-sidebar-accent text-foreground'
          : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-foreground',
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-sm font-medium leading-tight">{label}</span>
        {subtitle && (
          <span className="text-xs leading-tight text-muted-foreground/70">{subtitle}</span>
        )}
      </div>
      {badge && <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />}
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

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href)
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <aside className="flex h-full w-[250px] shrink-0 flex-col border-r border-border bg-sidebar">
      {/* Logo */}
      <div className="flex items-center gap-2.5 border-b border-border px-4 py-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-xs font-bold text-background">
          U
        </div>
        <span className="text-sm font-semibold text-foreground">Unchurnly</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {/* Overview */}
        <div className="mb-4">
          <p className="mb-1 px-2 text-[10px] font-medium tracking-widest text-muted-foreground/60">
            OVERVIEW
          </p>
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

        {/* Automations */}
        <div className="mb-4">
          <p className="mb-1 px-2 text-[10px] font-medium tracking-widest text-muted-foreground/60">
            AUTOMATIONS
          </p>
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

        {/* Configuration */}
        <div className="mb-4">
          <p className="mb-1 px-2 text-[10px] font-medium tracking-widest text-muted-foreground/60">
            CONFIGURATION
          </p>
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
      </nav>

      {/* Footer */}
      <div className="border-t border-border px-2 py-2">
        <a
          href="#"
          target="_blank"
          rel="noreferrer"
          className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
        >
          <BookOpen className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>Documentation</span>
        </a>
        <a
          href="mailto:support@unchurnly.com"
          className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
        >
          <LifeBuoy className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>Support</span>
        </a>
        <div className="mt-1 flex items-center gap-2.5 rounded-md px-2 py-1.5">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-semibold text-foreground shrink-0">
            {userEmail[0]?.toUpperCase() ?? 'U'}
          </div>
          <span className="flex-1 truncate text-xs text-muted-foreground">{userEmail}</span>
          <button
            onClick={handleLogout}
            aria-label="Log out"
            className="cursor-pointer"
          >
            <LogOut className="h-3 w-3 text-muted-foreground/50" />
          </button>
        </div>
      </div>
    </aside>
  )
}
