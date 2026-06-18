export default function DunningLoading() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card animate-pulse">
      <div className="h-12 border-b border-border bg-muted/20" />
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-6 border-b border-border px-5 py-4 last:border-0">
          <div className="h-3 w-40 rounded bg-muted/40" />
          <div className="h-3 w-20 rounded bg-muted/40" />
          <div className="h-3 w-16 rounded bg-muted/40" />
          <div className="h-3 w-14 rounded bg-muted/40 ml-auto" />
        </div>
      ))}
    </div>
  )
}
