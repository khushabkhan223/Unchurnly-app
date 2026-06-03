export default function CancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-sm text-center p-8">
        <h1 className="text-xl font-semibold text-foreground mb-3">Link unavailable</h1>
        <p className="text-muted-foreground">This link has expired or is invalid.</p>
      </div>
    </div>
  )
}
