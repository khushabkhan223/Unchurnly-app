'use client'

import { useState } from 'react'
import { Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type CustomerEvent } from '../customers/page'

function outcomeBadgeClass(outcome: string) {
  if (['paused', 'discounted', 'completed'].includes(outcome))
    return 'border-emerald/30 text-emerald bg-emerald/5'
  if (outcome === 'cancelled') return 'border-destructive/30 text-destructive bg-destructive/5'
  if (outcome === 'active') return 'border-accent/30 text-accent bg-accent/5'
  return 'border-border text-muted-foreground bg-card'
}

function outcomeLabel(outcome: string) {
  const map: Record<string, string> = {
    paused: 'Paused',
    discounted: 'Discounted',
    cancelled: 'Cancelled',
    completed: 'Recovered',
    active: 'Active',
    downgraded: 'Downgraded',
  }
  return map[outcome] ?? outcome
}

function fmtDate(d: string): string {
  const p = new Date(d)
  return isNaN(p.getTime())
    ? '—'
    : p.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function CustomersTable({ events }: { events: CustomerEvent[] }) {
  const [search, setSearch] = useState('')

  const filtered = search
    ? events.filter((e) => e.email.toLowerCase().includes(search.toLowerCase()))
    : events

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {/* Search bar */}
        <div className="border-b border-border px-5 py-3.5">
          <input
            type="text"
            placeholder="Search by email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-xs rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
              <Users className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              {events.length === 0 ? 'No customer events yet' : 'No results'}
            </p>
            <p className="text-sm text-muted-foreground">
              {events.length === 0
                ? 'Install the widget to start tracking.'
                : 'Try a different search term.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-fixed" aria-label="Customer events">
              <thead>
                <tr className="border-b border-border">
                  {['CUSTOMER', 'TYPE', 'OFFER SHOWN', 'OUTCOME', 'MRR', 'DATE'].map((h) => (
                    <th
                      key={h}
                      className={cn(
                        'px-5 py-4 text-left text-[10px] font-semibold tracking-widest text-muted-foreground/60',
                        h === 'CUSTOMER' && 'w-[280px]',
                      )}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((ev, i) => (
                  <tr
                    key={i}
                    className="border-b border-border/50 transition-colors last:border-0 hover:bg-secondary/40"
                  >
                    <td className="w-[280px] px-5 py-4">
                      <span className="block truncate font-mono text-xs text-muted-foreground">
                        {ev.email}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center rounded-md border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {ev.type === 'cancellation' ? 'Cancellation' : 'Dunning'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs text-muted-foreground">{ev.offer}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold',
                          outcomeBadgeClass(ev.outcome),
                        )}
                      >
                        {outcomeLabel(ev.outcome)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs font-semibold text-emerald">
                        {ev.mrr > 0
                          ? `$${ev.mrr.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
                          : '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs text-muted-foreground">{fmtDate(ev.date)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
