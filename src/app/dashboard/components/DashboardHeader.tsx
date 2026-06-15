'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { RefreshCw } from 'lucide-react'

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': {
    title: 'Analytics',
    subtitle: 'Cancel flow and payment recovery · last 30 days',
  },
  '/dashboard/customers': {
    title: 'Customers',
    subtitle: 'Monitored subscribers',
  },
  '/dashboard/retention': {
    title: 'Cancel Flows',
    subtitle: 'Offers and retention',
  },
  '/dashboard/dunning': {
    title: 'Dunning',
    subtitle: 'Failed payment recovery',
  },
  '/dashboard/installation': {
    title: 'Installation',
    subtitle: 'Widget and integrations',
  },
  '/dashboard/settings': {
    title: 'Settings',
    subtitle: 'Your brand profile',
  },
  '/dashboard/billing': {
    title: 'Billing',
    subtitle: 'Plan and payments',
  },
}

export function DashboardHeader() {
  const pathname = usePathname()
  const [time, setTime] = useState('')

  useEffect(() => {
    setTime(
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    )
  }, [])

  const meta = PAGE_META[pathname] ?? { title: 'Dashboard', subtitle: '' }

  return (
    <header className="flex shrink-0 items-center justify-between border-b border-border px-8 py-4">
      <div>
        <h1 className="text-base font-semibold tracking-tight text-foreground">
          {meta.title}
        </h1>
        {meta.subtitle && (
          <p className="text-xs text-muted-foreground">{meta.subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <RefreshCw className="h-3 w-3" aria-hidden="true" />
        <span className="text-[10px]">{time ? `Updated at ${time}` : 'Just now'}</span>
      </div>
    </header>
  )
}
