function XIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="10" fill="#fef2f2" />
      <path d="M6.5 6.5l7 7M13.5 6.5l-7 7" stroke="#ef4444" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="10" fill="#fffbeb" />
      <path d="M7 10h6M10 7l3 3-3 3" stroke="#f59e0b" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const problems = [
  {
    Icon: XIcon,
    title: 'Failed payments disappear silently',
    body: 'When a card fails, Stripe retries quietly. No emails, no urgency, no second chance. The customer churns without ever knowing there was a problem.',
    stat: '9% of MRR lost monthly on average',
    statColor: 'text-red-500',
    statBg: 'bg-red-50',
  },
  {
    Icon: ArrowIcon,
    title: 'Cancellations happen without a fight',
    body: "Most apps let customers cancel in one click. No reason asked. No offer made. 40% of those customers would have stayed with the right offer at the right moment.",
    stat: '40% of cancellations are preventable',
    statColor: 'text-amber-600',
    statBg: 'bg-amber-50',
  },
]

export default function Problem() {
  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
      <div className="max-w-2xl mx-auto text-center mb-14">
        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 text-balance">
          Every month, you&apos;re losing revenue you&apos;ve already earned
        </h2>
        <p className="mt-4 text-gray-500 leading-relaxed">
          Two invisible leaks drain your MRR — silently, automatically, and completely avoidably.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {problems.map(({ Icon, title, body, stat, statColor, statBg }) => (
          <div
            key={title}
            className="bg-white border border-gray-100 rounded-2xl p-8 hover:border-gray-200 hover:shadow-sm transition-all"
          >
            <div className="mb-5">
              <Icon />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3 text-balance">{title}</h3>
            <p className="text-gray-500 leading-relaxed text-sm mb-6">{body}</p>
            <div className={`inline-flex items-center gap-2 ${statBg} ${statColor} text-sm font-medium px-3 py-1.5 rounded-lg`}>
              <span className="font-bold">{stat.split(' ').slice(0, 1)}</span>
              {stat.split(' ').slice(1).join(' ')}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
