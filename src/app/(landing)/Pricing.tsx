import Link from 'next/link'

function Check() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0">
      <circle cx="8" cy="8" r="8" fill="#f0fdf4" />
      <path d="M5 8l2 2 4-4" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const features = [
  'AI dunning emails (Day 1, 3, 7, 14)',
  'Automatic 15% recovery coupon on Day 7',
  'Cancel flow widget (JS embed)',
  'Pause, discount, and support offers',
  'Hosted cancel page with email verification',
  'Real-time analytics dashboard',
  'Stripe integration in 15 minutes',
  'Email support',
]

export default function Pricing() {
  return (
    <section id="pricing" className="py-24">
      <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 text-balance">
          Simple pricing. Serious results.
        </h2>
        <p className="mt-4 text-gray-500">
          One plan. Everything included. No revenue share ever.
        </p>

        {/* Pricing card */}
        <div className="mt-12 max-w-md mx-auto bg-white border-2 border-gray-900 rounded-2xl p-10 text-left shadow-sm">
          {/* Price */}
          <div className="flex items-end gap-1 mb-1">
            <span className="text-5xl font-bold text-gray-900">$49</span>
            <span className="text-gray-400 text-lg mb-1.5">/month</span>
          </div>
          <p className="text-sm text-gray-400 mb-8">No revenue share · No setup fees · Cancel anytime</p>

          {/* Divider */}
          <div className="border-t border-gray-100 mb-8" />

          {/* Features */}
          <ul className="flex flex-col gap-3.5 mb-10">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-gray-700">
                <Check />
                {f}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <Link
            href="/signup"
            className="block w-full bg-gray-900 text-white text-center font-medium rounded-xl py-3.5 hover:bg-gray-800 active:scale-[0.98] transition-all text-sm"
          >
            Start recovering revenue →
          </Link>

          <p className="text-center text-xs text-gray-400 mt-4">
            First recovery free. No credit card required to start.
          </p>
        </div>
      </div>
    </section>
  )
}
