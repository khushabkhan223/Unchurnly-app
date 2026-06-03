'use client'

import { useState } from 'react'
import { type CustomerEvent } from '../customers/page'

function outcomeColor(outcome: string) {
  if (['paused', 'discounted', 'completed'].includes(outcome)) return 'text-green-500'
  if (outcome === 'cancelled') return 'text-red-500'
  if (outcome === 'active') return 'text-indigo-400'
  return 'text-zinc-400'
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
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-zinc-50">Customers</h1>
        <p className="text-sm text-zinc-500 mt-0.5">All cancellation and dunning events</p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800">
          <input
            type="text"
            placeholder="Search by email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-xs px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {filtered.length === 0 ? (
          <p className="px-6 py-10 text-sm text-zinc-600 text-center">
            {events.length === 0
              ? 'No customer events yet. Install the widget to start tracking.'
              : 'No results for that search.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  {['Customer', 'Type', 'Offer shown', 'Outcome', 'MRR', 'Date'].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs text-zinc-500 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((ev, i) => (
                  <tr key={i} className="border-b border-zinc-800/50 hover:bg-white/[0.02]">
                    <td className="px-6 py-3 text-zinc-300 max-w-[180px] truncate">{ev.email}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          ev.type === 'cancellation'
                            ? 'bg-zinc-800 text-zinc-300'
                            : 'bg-indigo-500/10 text-indigo-400'
                        }`}
                      >
                        {ev.type === 'cancellation' ? 'Cancellation' : 'Dunning'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-zinc-400">{ev.offer}</td>
                    <td className={`px-6 py-3 font-medium ${outcomeColor(ev.outcome)}`}>
                      {outcomeLabel(ev.outcome)}
                    </td>
                    <td className="px-6 py-3 font-mono text-red-400">
                      {ev.mrr > 0 ? `$${ev.mrr.toLocaleString('en-US', { maximumFractionDigits: 0 })}` : '—'}
                    </td>
                    <td className="px-6 py-3 text-zinc-500">
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
