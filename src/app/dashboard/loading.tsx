export default function DashboardLoading() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="grid grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 rounded-lg bg-muted/40" />
        ))}
      </div>
      <div className="grid grid-cols-[1fr_280px] gap-4">
        <div className="h-56 rounded-lg bg-muted/40" />
        <div className="h-56 rounded-lg bg-muted/40" />
      </div>
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="h-11 border-b border-border bg-muted/20" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-border px-5 py-3.5 last:border-0">
            <div className="h-3 w-36 rounded bg-muted/40" />
            <div className="h-3 w-16 rounded bg-muted/40" />
            <div className="h-3 w-20 rounded bg-muted/40" />
            <div className="h-3 w-12 rounded bg-muted/40 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}
