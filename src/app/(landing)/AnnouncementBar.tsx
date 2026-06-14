export function AnnouncementBar() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 w-full bg-sky-50 border-b border-sky-100 py-2 px-4 text-center text-sm text-sky-700">
      Unchurnly is now in early access —{' '}
      <a
        href="#pricing"
        className="font-semibold underline underline-offset-2 hover:text-sky-900 transition-colors"
      >
        $49/month flat, no revenue share →
      </a>
    </div>
  )
}
