'use client'

import { Mail } from 'lucide-react'
import { cn } from '@/lib/utils'
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
  if (status === 'active') return 'border-accent/30 text-accent bg-accent/5'
  if (status === 'completed') return 'border-emerald/30 text-emerald bg-emerald/5'
  if (status === 'cancelled') return 'border-destructive/30 text-destructive bg-destructive/5'
  return 'border-border text-muted-foreground bg-card'
}

export default function DunningTable({ sequences }: { sequences: DunningSequence[] }) {
  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {sequences.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
              <Mail className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            </div>
            <p className="text-sm font-semibold text-foreground">No dunning sequences yet</p>
            <p className="text-sm text-muted-foreground">Failed payments will appear here automatically.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-fixed" aria-label="Dunning sequences">
              <thead>
                <tr className="border-b border-border">
                  {['CUSTOMER', 'STATUS', 'MRR AT RISK', 'EMAILS', 'NEXT EMAIL', 'PROGRESS', 'STARTED'].map(
                    (h) => (
                      <th
                        key={h}
                        className={cn(
                          'px-5 py-4 text-left text-[10px] font-semibold tracking-widest text-muted-foreground/60',
                          h === 'CUSTOMER' && 'w-[280px]',
                        )}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {sequences.map((seq) => {
                  const sentCount = seq.dunning_emails.filter((e) => e.status === 'sent').length
                  return (
                    <tr
                      key={seq.id}
                      className="border-b border-border/50 transition-colors last:border-0 hover:bg-secondary/40"
                    >
                      <td className="w-[280px] px-5 py-4">
                        <span className="block truncate font-mono text-xs text-muted-foreground">
                          {seq.email}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold capitalize',
                            statusBadgeClass(seq.status),
                          )}
                        >
                          {seq.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs font-semibold text-amber-400">
                          {seq.mrr > 0
                            ? `$${seq.mrr.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
                            : '—'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs text-muted-foreground">
                          {sentCount} / {seq.dunning_emails.length || 4}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs text-muted-foreground">{nextEmailLabel(seq)}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          {DAY_NUMBERS.map((day) => {
                            const email = seq.dunning_emails.find((e) => e.day_number === day)
                            const isSent = email?.status === 'sent'
                            const isPending = email?.status === 'pending'
                            return (
                              <div
                                key={day}
                                className={cn(
                                  'h-2.5 w-2.5 rounded-full border',
                                  isSent
                                    ? 'bg-emerald border-emerald'
                                    : isPending
                                      ? 'border-border bg-transparent'
                                      : 'border-border/50 bg-transparent',
                                )}
                                title={`Day ${day}: ${email?.status ?? 'not created'}`}
                              />
                            )
                          })}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs text-muted-foreground">
                          {new Date(seq.started_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
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
