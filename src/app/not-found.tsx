export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="mx-auto max-w-sm text-center">
        <p className="font-mono text-7xl font-bold text-muted-foreground/20">404</p>
        <h1 className="mt-4 text-xl font-semibold text-foreground">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <a
            href="/"
            className="rounded-xl bg-emerald px-6 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-80"
          >
            Go home →
          </a>
          <a
            href="mailto:support@unchurnly.com"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Contact support
          </a>
        </div>
      </div>
    </div>
  )
}
