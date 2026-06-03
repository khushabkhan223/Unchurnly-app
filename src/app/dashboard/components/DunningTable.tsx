'use client'

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

function statusColor(status: string) {
  if (status === 'active') return 'bg-indigo-500/10 text-indigo-400'
  if (status === 'completed') return 'bg-green-500/10 text-green-500'
  if (status === 'cancelled') return 'bg-red-500/10 text-red-400'
  return 'bg-zinc-800 text-zinc-400'
}

export default function DunningTable({ sequences }: { sequences: DunningSequence[] }) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-zinc-50">Dunning</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          Automated email sequences for failed payments
        </p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        {sequences.length === 0 ? (
          <p className="px-6 py-10 text-sm text-zinc-600 text-center">
            No dunning sequences yet. Failed payments will appear here automatically.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  {['Customer', 'Status', 'MRR at Risk', 'Emails', 'Next email', 'Progress', 'Started'].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-6 py-3 text-left text-xs text-zinc-500 font-medium"
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
                    <tr key={seq.id} className="border-b border-zinc-800/50 hover:bg-white/[0.02]">
                      <td className="px-6 py-3 text-zinc-300 max-w-[160px] truncate">
                        {seq.email}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${statusColor(seq.status)}`}
                        >
                          {seq.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 font-mono text-red-400">
                        {seq.mrr > 0
                          ? `$${seq.mrr.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
                          : '—'}
                      </td>
                      <td className="px-6 py-3 text-zinc-400">
                        {sentCount} / {seq.dunning_emails.length || 4}
                      </td>
                      <td className="px-6 py-3 text-zinc-400">{nextEmailLabel(seq)}</td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-1.5">
                          {DAY_NUMBERS.map((day) => {
                            const email = seq.dunning_emails.find(
                              (e) => e.day_number === day
                            )
                            const isSent = email?.status === 'sent'
                            const isPending = email?.status === 'pending'
                            return (
                              <div
                                key={day}
                                className={`w-2.5 h-2.5 rounded-full border ${
                                  isSent
                                    ? 'bg-indigo-500 border-indigo-500'
                                    : isPending
                                    ? 'bg-transparent border-zinc-600'
                                    : 'bg-transparent border-zinc-800'
                                }`}
                                title={`Day ${day}: ${email?.status ?? 'not created'}`}
                              />
                            )
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-3 text-zinc-500">
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
