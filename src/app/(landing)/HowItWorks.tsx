function Check() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0 mt-0.5">
      <circle cx="8" cy="8" r="8" fill="#f0fdf4" />
      <path d="M5 8l2 2 4-4" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const features = [
  {
    num: '01',
    title: 'AI dunning emails that actually get read',
    bullets: [
      '4-email sequence at Day 1, 3, 7, and 14',
      "Personalized using your brand voice and the customer's plan",
      'Day 7 automatically generates a 15% recovery coupon',
      'Hosted card update page — no login required',
    ],
  },
  {
    num: '02',
    title: 'A cancel flow that saves customers before they leave',
    bullets: [
      'One script tag. Works on any app.',
      'Customer selects reason → sees personalized offer',
      'Pause, discount, or support — based on their answer',
      'Zero redirect. Stays inside your app.',
    ],
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-gray-50 border-y border-gray-100 py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 text-balance">
            Two systems. One goal. Zero revenue lost.
          </h2>
          <p className="mt-4 text-gray-500 leading-relaxed">
            Unchurnly automates the two most impactful retention workflows — dunning and cancellation — so you never have to think about them again.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {features.map(({ num, title, bullets }) => (
            <div key={num} className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
              <span className="text-6xl font-black text-gray-100 leading-none select-none">{num}</span>
              <h3 className="text-xl font-semibold text-gray-900 mt-3 mb-6 text-balance">{title}</h3>
              <ul className="flex flex-col gap-3">
                {bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <Check />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
