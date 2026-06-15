import Image from 'next/image'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 py-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Unchurnly" width={120} height={40} unoptimized />
          <span className="text-sm text-gray-400">© 2026</span>
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
