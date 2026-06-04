'use client'

import { useState } from 'react'
import { Users } from 'lucide-react'
import { type CustomerEvent } from '../customers/page'

function outcomeBadgeClass(outcome: string) {
  if (['paused', 'discounted', 'completed'].includes(outcome))
    return 'bg-emerald-50 text-emerald-700 border border-emerald-100'
  if (outcome === 'cancelled') return 'bg-rose-50 text-rose-700 border border-rose-100'
  if (outcome === 'active') return 'bg-blue-50 text-blue-700 border border-blue-100'
  return 'bg-slate-100 text-slate-600'
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

export default function CustomersTable({ events }: { events: CustomerEvent[] }) {
  const [search, setSearch] = useState('')

  const filtered = search
    ? events.filter((e) => e.email.toLowerCase().includes(search.toLowerCase()))
    : events

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Page header */}
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
        <p className="text-sm text-slate-500 mt-1">All cancellation and dunning events</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="px-6 py-4 border-b border-slate-100">
          <input
            type="text"
            placeholder="Search by email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-slate-900 font-medium text-sm">
              {events.length === 0 ? 'No customer events yet' : 'No results'}
            </p>
            <p className="text-slate-500 text-sm">
              {events.length === 0
                ? 'Install the widget to start tracking.'
                : 'Try a different search term.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {['Customer', 'Type', 'Offer shown', 'Outcome', 'MRR', 'Date'].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((ev, i) => (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-6 py-3 text-slate-900 font-medium max-w-[180px] truncate">
                      {ev.email}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                          ev.type === 'cancellation'
                            ? 'bg-slate-100 text-slate-600 border-slate-200'
                            : 'bg-blue-50 text-blue-700 border-blue-100'
                        }`}
                      >
                        {ev.type === 'cancellation' ? 'Cancellation' : 'Dunning'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-500">{ev.offer}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${outcomeBadgeClass(ev.outcome)}`}
                      >
                        {outcomeLabel(ev.outcome)}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-mono text-rose-600">
                      {ev.mrr > 0
                        ? `$${ev.mrr.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
                        : '—'}
                    </td>
                    <td className="px-6 py-3 text-slate-400 text-xs">
                      {new Date(ev.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
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
