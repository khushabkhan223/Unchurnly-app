import type { ReactNode } from 'react'

function Yes({ em }: { em?: boolean }) {
  return (
    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${em ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'}`}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-label="Yes">
        <path d="M2.5 6l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

function No() {
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-50 text-gray-400">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-label="No">
        <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </span>
  )
}

const rows: { feature: string; unchurnly: ReactNode; churnkey: ReactNode }[] = [
  { feature: 'AI dunning emails', unchurnly: <Yes em />, churnkey: <Yes /> },
  { feature: 'Cancel flow widget', unchurnly: <Yes em />, churnkey: <Yes /> },
  { feature: 'Brand voice personalization', unchurnly: <Yes em />, churnkey: <Yes /> },
  { feature: 'Recovery analytics', unchurnly: <Yes em />, churnkey: <Yes /> },
  {
    feature: 'Revenue share',
    unchurnly: <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">None</span>,
    churnkey: <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">None</span>,
  },
  {
    feature: 'Starting price',
    unchurnly: <span className="text-sm font-bold text-gray-900">$49/mo</span>,
    churnkey: <span className="text-sm font-semibold text-gray-500">$250/mo</span>,
  },
  {
    feature: 'Setup time',
    unchurnly: <span className="text-sm font-semibold text-emerald-600">15 minutes</span>,
    churnkey: <span className="text-sm text-gray-500">Up to 1 hour</span>,
  },
]

// suppress unused warning — No is used in rows but TS can't detect JSX usage statically
void No

export default function Comparison() {
  return (
    <section id="vs-churnkey" className="bg-gray-50 border-y border-gray-100 py-24">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 text-balance">
            Everything Churnkey does. At 80% less.
          </h2>
          <p className="mt-4 text-gray-500">
            Built for founders who can&apos;t justify $250/month.
          </p>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          {/* Header */}
          <div className="grid grid-cols-3 border-b border-gray-100">
            <div className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Feature</div>
            <div className="px-6 py-4 bg-gray-900 text-white text-sm font-semibold text-center">Unchurnly</div>
            <div className="px-6 py-4 text-sm font-semibold text-gray-500 text-center border-l border-gray-100">Churnkey</div>
          </div>

          {/* Rows */}
          {rows.map(({ feature, unchurnly, churnkey }, i) => (
            <div
              key={feature}
              className={`grid grid-cols-3 ${i < rows.length - 1 ? 'border-b border-gray-50' : ''} hover:bg-gray-50/60 transition-colors`}
            >
              <div className="px-6 py-4 text-sm text-gray-700">{feature}</div>
              <div className="px-6 py-4 bg-gray-900/[0.025] flex items-center justify-center">{unchurnly}</div>
              <div className="px-6 py-4 flex items-center justify-center border-l border-gray-50">{churnkey}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
