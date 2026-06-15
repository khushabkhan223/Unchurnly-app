export default function NotFound() {
  return (
    <div
      style={{ background: '#f9fafb' }}
      className="flex min-h-screen items-center justify-center px-4"
    >
      <div className="mx-auto max-w-sm px-8 text-center">
        <p className="font-mono text-6xl font-bold text-gray-200">404</p>
        <h1 className="mt-4 text-xl font-semibold text-gray-900">Page not found</h1>
        <p className="mt-2 text-sm text-gray-500">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-8">
          <a
            href="/"
            className="rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-80"
          >
            Go home →
          </a>
          <a
            href="mailto:support@unchurnly.com"
            className="ml-4 text-sm text-gray-400 transition-colors hover:text-gray-600"
          >
            Contact support
          </a>
        </div>
      </div>
    </div>
  )
}
