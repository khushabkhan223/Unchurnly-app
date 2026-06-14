import Link from 'next/link'

export function FinalCTA() {
  return (
    <section id="waitlist" className="bg-gray-900 py-24 px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-4">
          Start recovering your MRR today.
        </h2>

        <p className="text-gray-400 mb-8">
          Lock in founding member pricing at $49/month, forever.
        </p>

        <Link
          href="/signup"
          className="inline-block px-8 py-3.5 bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg transition-all duration-200 shadow-[0_0_20px_rgba(22,163,74,0.3)] hover:shadow-[0_0_35px_rgba(22,163,74,0.5)]"
        >
          Get Early Access →
        </Link>

        <p className="text-sm text-gray-500 mt-4">
          Join 240+ founders already on the waitlist.
        </p>
      </div>
    </section>
  )
}
