'use client'

// Pixel-perfect replica of the real Unchurnly dashboard
// Uses exact same colors: canvas #171615, sidebar #1E1D1B, cards #191817, emerald oklch(0.75 0.15 160)

const EMERALD = 'oklch(0.75 0.15 160)'
const CANVAS = '#171615'
const SIDEBAR_BG = '#1E1D1B'
const CARD_BG = '#1C1B19'
const BORDER = 'rgba(255,255,255,0.08)'
const TEXT_DIM = 'rgba(255,255,255,0.45)'
const TEXT_MID = 'rgba(255,255,255,0.65)'
const TEXT_BRIGHT = 'rgba(255,255,255,0.92)'

const kpis = [
  { label: 'MRR PROTECTED', value: '$4,820', color: EMERALD },
  { label: 'RECOVERY ROI', value: '98.4×', color: '#60a5fa' },
  { label: 'OFFER ACCEPT', value: '67%', color: '#60a5fa' },
  { label: 'ACTIVE', value: '3', color: '#fbbf24' },
]

const navItems = [
  { label: 'Analytics', active: true },
  { label: 'Customers', active: false },
  { label: 'Cancel Flows', active: false },
  { label: 'Dunning', active: false },
  { label: 'Installation', active: false },
  { label: 'Settings', active: false },
]

const tableRows = [
  { email: 'sarah@acme.co', type: 'Cancellation', outcome: 'Discounted', outcomeBg: 'rgba(16,185,129,0.12)', outcomeColor: EMERALD, mrr: '$89', date: 'Jun 9' },
  { email: 'tom@getflow.io', type: 'Dunning', outcome: 'Recovered', outcomeBg: 'rgba(16,185,129,0.12)', outcomeColor: EMERALD, mrr: '$149', date: 'Jun 8' },
  { email: 'lisa@workhub.co', type: 'Cancellation', outcome: 'Paused', outcomeBg: 'rgba(251,191,36,0.12)', outcomeColor: '#fbbf24', mrr: '$59', date: 'Jun 8' },
  { email: 'dev@stackpilot.io', type: 'Dunning', outcome: 'Recovered', outcomeBg: 'rgba(16,185,129,0.12)', outcomeColor: EMERALD, mrr: '$99', date: 'Jun 7' },
  { email: 'mark@notion…', type: 'Cancellation', outcome: 'Cancelled', outcomeBg: 'rgba(239,68,68,0.12)', outcomeColor: '#f87171', mrr: '$49', date: 'Jun 7' },
]

function MiniChart() {
  const w = 380
  const h = 80
  const points: [number, number][] = [
    [0, 68], [50, 65], [95, 58], [140, 52], [185, 42], [230, 34], [275, 22], [320, 14], [380, 8],
  ]
  const pathD = points
    .map(([x, y], i) => {
      if (i === 0) return `M ${x} ${y}`
      const prev = points[i - 1]
      const cx1 = prev[0] + (x - prev[0]) * 0.4
      const cy1 = prev[1]
      const cx2 = prev[0] + (x - prev[0]) * 0.6
      const cy2 = y
      return `C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x} ${y}`
    })
    .join(' ')
  const areaD = pathD + ` L ${w} ${h} L 0 ${h} Z`

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={EMERALD} stopOpacity="0.18" />
          <stop offset="100%" stopColor={EMERALD} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#chartFill)" />
      <path d={pathD} fill="none" stroke={EMERALD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function DashboardMockup() {
  return (
    <div
      className="w-full max-w-[660px] shrink-0"
      style={{
        transform: 'perspective(1200px) rotateY(-8deg) rotateX(4deg)',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Browser chrome */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          boxShadow: '0 32px 80px rgba(0,0,0,0.22), 0 8px 24px rgba(0,0,0,0.12)',
          border: '1px solid #e5e7eb',
        }}
      >
        {/* Browser bar */}
        <div className="bg-gray-100 border-b border-gray-200 px-4 py-2.5 flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="ml-3 bg-white rounded-md px-3 py-1 text-xs text-gray-400 flex-1 max-w-xs">
            app.unchurnly.com/dashboard
          </div>
        </div>

        {/* Dashboard content */}
        <div
          className="flex overflow-hidden"
          style={{ background: CANVAS, height: '400px' }}
        >
          {/* Sidebar */}
          <div
            className="flex flex-col shrink-0"
            style={{ width: '148px', background: SIDEBAR_BG, borderRight: `1px solid ${BORDER}` }}
          >
            {/* Logo */}
            <div
              className="flex items-center gap-2 px-3 py-3"
              style={{ borderBottom: `1px solid ${BORDER}` }}
            >
              <div
                className="flex items-center justify-center rounded text-xs font-bold"
                style={{ width: '22px', height: '22px', background: TEXT_BRIGHT, color: CANVAS, fontSize: '10px' }}
              >
                U
              </div>
              <span style={{ color: TEXT_BRIGHT, fontSize: '11px', fontWeight: 600 }}>Unchurnly</span>
            </div>

            {/* Nav */}
            <nav className="flex flex-col gap-0.5 px-2 py-2 flex-1">
              <p style={{ color: TEXT_DIM, fontSize: '8px', fontWeight: 600, letterSpacing: '0.08em', paddingLeft: '6px', marginBottom: '2px', marginTop: '4px' }}>OVERVIEW</p>
              {navItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-1.5 px-2 rounded"
                  style={{
                    height: '26px',
                    background: item.active ? 'rgba(255,255,255,0.08)' : 'transparent',
                    color: item.active ? TEXT_BRIGHT : TEXT_MID,
                    fontSize: '11px',
                    fontWeight: item.active ? 500 : 400,
                    cursor: 'default',
                  }}
                >
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: item.active ? EMERALD : 'transparent', border: item.active ? 'none' : `1px solid ${TEXT_DIM}`, flexShrink: 0 }} />
                  {item.label}
                </div>
              ))}
            </nav>
          </div>

          {/* Main content */}
          <div className="flex-1 overflow-hidden flex flex-col" style={{ padding: '14px 14px 0' }}>
            {/* Page title */}
            <div className="flex items-center justify-between mb-3">
              <span style={{ color: TEXT_BRIGHT, fontSize: '13px', fontWeight: 600 }}>Analytics</span>
              <div
                className="flex items-center gap-1 px-2 rounded"
                style={{ background: 'rgba(255,255,255,0.06)', height: '22px', fontSize: '10px', color: TEXT_DIM }}
              >
                Last 30 days ↓
              </div>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              {kpis.map((kpi) => (
                <div
                  key={kpi.label}
                  className="rounded-lg px-2 py-2"
                  style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}
                >
                  <p style={{ color: TEXT_DIM, fontSize: '8px', fontWeight: 600, letterSpacing: '0.06em', marginBottom: '4px' }}>
                    {kpi.label}
                  </p>
                  <p style={{ color: kpi.color, fontSize: '14px', fontWeight: 700, fontFamily: 'ui-monospace, monospace' }}>
                    {kpi.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div
              className="rounded-lg p-3 mb-3"
              style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}
            >
              <div className="flex items-center justify-between mb-2">
                <span style={{ color: TEXT_BRIGHT, fontSize: '10px', fontWeight: 600 }}>MRR Protected</span>
                <span style={{ color: EMERALD, fontSize: '10px', fontWeight: 600 }}>+34% ↑</span>
              </div>
              <MiniChart />
              <div className="flex justify-between mt-1">
                {['May 12', 'May 19', 'May 26', 'Jun 2', 'Jun 9'].map((d) => (
                  <span key={d} style={{ color: TEXT_DIM, fontSize: '8px' }}>{d}</span>
                ))}
              </div>
            </div>

            {/* Activity table */}
            <div
              className="rounded-lg overflow-hidden flex-1"
              style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}
            >
              <div
                className="grid px-3 py-1.5"
                style={{
                  gridTemplateColumns: '1fr 80px 80px 44px 44px',
                  borderBottom: `1px solid ${BORDER}`,
                }}
              >
                {['CUSTOMER', 'TYPE', 'OUTCOME', 'MRR', 'DATE'].map((h) => (
                  <span key={h} style={{ color: TEXT_DIM, fontSize: '8px', fontWeight: 600, letterSpacing: '0.06em' }}>{h}</span>
                ))}
              </div>
              {tableRows.map((row, i) => (
                <div
                  key={i}
                  className="grid items-center px-3 py-1.5"
                  style={{
                    gridTemplateColumns: '1fr 80px 80px 44px 44px',
                    borderBottom: i < tableRows.length - 1 ? `1px solid ${BORDER}` : 'none',
                  }}
                >
                  <span style={{ color: TEXT_MID, fontSize: '9px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {row.email}
                  </span>
                  <span style={{ color: TEXT_DIM, fontSize: '9px' }}>{row.type}</span>
                  <span>
                    <span
                      style={{
                        background: row.outcomeBg,
                        color: row.outcomeColor,
                        fontSize: '8px',
                        fontWeight: 600,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        display: 'inline-block',
                      }}
                    >
                      {row.outcome}
                    </span>
                  </span>
                  <span style={{ color: TEXT_BRIGHT, fontSize: '9px', fontFamily: 'ui-monospace, monospace' }}>{row.mrr}</span>
                  <span style={{ color: TEXT_DIM, fontSize: '9px' }}>{row.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
