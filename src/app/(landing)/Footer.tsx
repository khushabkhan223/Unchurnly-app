import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 py-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-gray-900 flex items-center justify-center text-white text-[10px] font-bold">
            U
          </div>
          <span className="text-sm text-gray-500">© 2026 Unchurnly</span>
        </div>

        {/* Links */}
        <nav className="flex items-center gap-6">
          <Link href="/privacy" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">Privacy</Link>
          <Link href="/terms" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">Terms</Link>
          <Link href="/refund" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">Refund</Link>
          <a href="mailto:support@unchurnly.com" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">
            support@unchurnly.com
          </a>
        </nav>
      </div>
    </footer>
  )
}
