import Link from 'next/link'

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center text-white text-xs font-bold shrink-0">
            U
          </div>
          <span className="text-gray-900 font-semibold text-sm">Unchurnly</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">How it works</a>
          <a href="#pricing" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Pricing</a>
          <a href="#vs-churnkey" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Compare</a>
        </nav>

        {/* CTAs */}
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900 transition-colors hidden sm:block">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="bg-gray-900 text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-gray-800 transition-colors"
          >
            Start free →
          </Link>
        </div>
      </div>
    </header>
  )
}
