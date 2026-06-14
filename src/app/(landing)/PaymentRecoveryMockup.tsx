import { Mail, Check } from 'lucide-react'

const emails = [
  { day: 'Day 1', label: 'Payment failed notice', status: 'sent' },
  { day: 'Day 3', label: 'Card update reminder', status: 'sent' },
  { day: 'Day 7', label: 'Final attempt notice', status: 'sending' },
  { day: 'Day 14', label: 'Last chance email', status: 'queued' },
]

const recoveries = [
  { initials: 'J', email: 'john@startup.io', amount: '$49/mo', time: '2h ago' },
  { initials: 'S', email: 'sara@appco.com', amount: '$79/mo', time: '5h ago' },
]

export function PaymentRecoveryMockup() {
  return (
    <div className="w-full p-5 bg-white border border-gray-200 rounded-2xl shadow-xl shadow-gray-200/60">
      <div className="flex items-center justify-between mb-5">
        <span className="text-gray-900 text-sm font-semibold">Recovery Campaign — June 2025</span>
        <span className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Active
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-5">
        {[
          { value: '$2,840', label: 'Recovered' },
          { value: '87%', label: 'Open Rate' },
          { value: '12', label: 'Saved' },
        ].map((s) => (
          <div key={s.label} className="bg-gray-50 border border-gray-100 rounded-xl p-3">
            <p className="text-gray-900 font-black text-lg leading-none">{s.value}</p>
            <p className="text-gray-400 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Email Sequence</p>
      <div className="bg-gray-50 border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-100 mb-4">
        {emails.map((e) => (
          <div key={e.day} className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2.5">
              <Mail size={13} className="text-gray-400 flex-shrink-0" />
              <span className="text-gray-600 text-xs">
                <span className="font-medium text-gray-800">{e.day}</span> — {e.label}
              </span>
            </div>
            {e.status === 'sent' && (
              <span className="text-xs text-green-600 flex items-center gap-1">
                <Check size={11} /> Sent
              </span>
            )}
            {e.status === 'sending' && (
              <span className="text-xs text-amber-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" /> Sending
              </span>
            )}
            {e.status === 'queued' && (
              <span className="text-xs text-gray-400">Queued</span>
            )}
          </div>
        ))}
      </div>

      <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Recent Recoveries</p>
      <div className="space-y-2">
        {recoveries.map((r) => (
          <div key={r.email} className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600 font-medium flex-shrink-0">
              {r.initials}
            </div>
            <span className="text-gray-500 text-xs flex-1">{r.email}</span>
            <span className="text-green-600 text-xs font-semibold">{r.amount}</span>
            <span className="text-gray-400 text-xs ml-1">{r.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
