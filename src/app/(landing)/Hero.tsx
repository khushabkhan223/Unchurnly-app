import Link from 'next/link'
import DashboardMockup from './DashboardMockup'

export default function Hero() {
  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-16 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
      {/* Left copy */}
      <div className="flex-1 min-w-0 max-w-xl">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
          $49/month · No revenue share · Ever
        </div>

        {/* Headline */}
        <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.05] tracking-tight text-balance">
          Your MRR is leaking.<br />
          <span className="text-gray-900">Unchurnly stops it.</span>
        </h1>

        {/* Sub */}
        <p className="text-lg text-gray-500 mt-5 max-w-md leading-relaxed">
          AI-personalized dunning emails and a cancel flow widget that saves
          customers before they leave. Set up in 15 minutes.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/signup"
            className="bg-gray-900 text-white rounded-xl px-6 py-3 font-medium text-sm hover:bg-gray-800 active:scale-[0.98] transition-all"
          >
            Start recovering revenue →
          </Link>
          <a
            href="#how-it-works"
            className="text-gray-500 hover:text-gray-900 text-sm transition-colors"
          >
            See how it works ↓
          </a>
        </div>

        {/* Social proof */}
        <p className="mt-6 text-sm text-gray-400">
          Recovers 70% of failed payments on average · Saves 40% of cancellations
        </p>
      </div>

      {/* Right — dashboard mockup */}
      <div className="w-full lg:flex-1 flex justify-center lg:justify-end overflow-visible">
        <DashboardMockup />
      </div>
    </section>
  )
}
