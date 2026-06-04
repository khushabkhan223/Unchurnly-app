'use client'

import { Mail } from 'lucide-react'
import { type DunningSequence } from '../dunning/page'

const DAY_NUMBERS = [1, 3, 7, 14]

function nextEmailLabel(seq: DunningSequence): string {
  const pending = seq.dunning_emails
    .filter((e) => e.status === 'pending')
    .sort((a, b) => a.day_number - b.day_number)
  const next = pending[0]
  if (!next) return '—'
  const dueMs =
    new Date(seq.started_at).getTime() + next.day_number * 24 * 60 * 60 * 1000
  const daysUntil = Math.ceil((dueMs - Date.now()) / (24 * 60 * 60 * 1000))
  if (daysUntil < 0) return `Day ${next.day_number} — overdue`
  if (daysUntil === 0) return `Day ${next.day_number} — today`
  return `Day ${next.day_number} — in ${daysUntil} day${daysUntil === 1 ? '' : 's'}`
}

function statusBadgeClass(status: string) {
  if (status === 'active') return 'bg-blue-50 text-blue-700 border border-blue-100'
  if (status === 'completed') return 'bg-emerald-50 text-emerald-700 border border-emerald-100'
  if (status === 'cancelled') return 'bg-rose-50 text-rose-700 border border-rose-100'
  return 'bg-slate-100 text-slate-600'
}

export default function DunningTable({ sequences }: { sequences: DunningSequence[] }) {
  return (
    <div className="space-y-6 max-w-6xl">
      {/* Page header */}
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-bold text-slate-900">Dunning</h1>
        <p className="text-sm text-slate-500 mt-1">Automated email sequences for failed payments</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
        {sequences.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
              <Mail className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-slate-900 font-medium text-sm">No dunning sequences yet</p>
            <p className="text-slate-500 text-sm">Failed payments will appear here automatically.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {['Customer', 'Status', 'MRR at Risk', 'Emails', 'Next email', 'Progress', 'Started'].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {sequences.map((seq) => {
                  const sentCount = seq.dunning_emails.filter((e) => e.status === 'sent').length
                  return (
                    <tr key={seq.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="px-6 py-3 text-slate-900 font-medium max-w-[160px] truncate">
                        {seq.email}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${statusBadgeClass(seq.status)}`}
                        >
                          {seq.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 font-mono text-rose-600">
                        {seq.mrr > 0
                          ? `$${seq.mrr.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
                          : '—'}
                      </td>
                      <td className="px-6 py-3 text-slate-500">
                        {sentCount} / {seq.dunning_emails.length || 4}
                      </td>
                      <td className="px-6 py-3 text-slate-500">{nextEmailLabel(seq)}</td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-1.5">
                          {DAY_NUMBERS.map((day) => {
                            const email = seq.dunning_emails.find((e) => e.day_number === day)
                            const isSent = email?.status === 'sent'
                            const isPending = email?.status === 'pending'
                            return (
                              <div
                                key={day}
                                className={`w-2.5 h-2.5 rounded-full border ${
                                  isSent
                                    ? 'bg-indigo-500 border-indigo-500'
                                    : isPending
                                    ? 'bg-transparent border-slate-300'
                                    : 'bg-transparent border-slate-200'
                                }`}
                                title={`Day ${day}: ${email?.status ?? 'not created'}`}
                              />
                            )
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-3 text-slate-400 text-xs">
                        {new Date(seq.started_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
