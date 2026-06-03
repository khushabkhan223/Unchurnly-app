'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { BarChart3, Shield, Users, Mail, Settings, LogOut } from 'lucide-react'

const NAV = [
  { href: '/dashboard', label: 'Analytics', icon: BarChart3, exact: true },
  { href: '/dashboard/retention', label: 'Retention', icon: Shield, exact: false },
  { href: '/dashboard/customers', label: 'Customers', icon: Users, exact: false },
  { href: '/dashboard/dunning', label: 'Dunning', icon: Mail, exact: false },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings, exact: false },
]

export default function Sidebar({ userEmail }: { userEmail: string }) {
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
    <aside
      className="flex flex-col w-60 shrink-0 border-r border-zinc-800"
      style={{ backgroundColor: '#111118' }}
    >
      {/* Wordmark */}
      <div className="flex items-center gap-2 px-5 py-5 border-b border-zinc-800">
        <span className="text-zinc-50 font-semibold text-base tracking-tight">Unchurnly</span>
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-px" />
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 p-3 flex-1">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-indigo-500 text-white'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom: email + logout */}
      <div className="p-3 border-t border-zinc-800">
        <p className="text-xs text-zinc-600 px-3 mb-2 truncate">{userEmail}</p>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Log out
        </button>
      </div>
    </aside>
  )
}
