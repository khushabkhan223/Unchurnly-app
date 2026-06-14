import Link from 'next/link'

export default function Guarantee() {
  return (
    <section className="w-full bg-gray-50 border-y border-gray-100 py-16">
      <div className="max-w-2xl mx-auto px-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900">
          Free until your first recovery.
        </h2>
        <p className="mt-4 text-lg text-gray-500 leading-relaxed">
          Connect Stripe and install the widget for free. The moment Unchurnly recovers its first
          payment or saves its first cancellation for you, your $49/month subscription begins. If
          nothing is recovered, you never get charged.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
          <span className="bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-600">
            ✓ No credit card to start
          </span>
          <span className="bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-600">
            ✓ Cancel anytime
          </span>
          <span className="bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-600">
            ✓ No revenue share ever
          </span>
        </div>
        <div className="mt-8">
          <Link
            href="/signup"
            className="inline-block bg-gray-900 text-white rounded-xl px-8 py-3 font-medium hover:bg-gray-800 transition-colors"
          >
            Start for free →
          </Link>
        </div>
      </div>
    </section>
  )
}
