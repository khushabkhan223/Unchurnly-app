import Link from 'next/link'

export default function CTA() {
  return (
    <section className="py-24">
      <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
        <div className="bg-gray-900 rounded-3xl px-10 py-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-white text-balance mb-4">
            Stop losing revenue. Start in 15 minutes.
          </h2>
          <p className="text-gray-400 leading-relaxed mb-8 max-w-lg mx-auto">
            Connect Stripe, install the widget, and watch Unchurnly silently
            recover payments and save cancellations — on autopilot.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/signup"
              className="bg-white text-gray-900 font-semibold rounded-xl px-8 py-3.5 hover:bg-gray-100 active:scale-[0.98] transition-all text-sm"
            >
              Start recovering revenue →
            </Link>
            <Link
              href="/login"
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Already have an account? Sign in
            </Link>
          </div>
          <p className="text-xs text-gray-600 mt-6">
            First recovery free · No credit card required · Cancel anytime
          </p>
        </div>
      </div>
    </section>
  )
}
