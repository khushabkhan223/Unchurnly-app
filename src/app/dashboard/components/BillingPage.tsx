'use client'

const PAYMENT_LINK = process.env.NEXT_PUBLIC_DODO_PAYMENT_LINK ?? '#'

function fmtDate(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  return isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

const FEATURES = [
  'Cancel flow widget intercepts every cancellation attempt',
  'Dunning sequences automatically recover failed payments',
  'Revenue dashboard tracks exactly what was saved',
  'Works with your existing Stripe customers and subscriptions',
  'No per-event fees — unlimited recoveries included',
]

type Props = {
  subscription_status: string | null
  first_recovery_at: string | null
  subscribed_at: string | null
  grace_period_ends_at: string | null
}

function PulseDot({ color = 'emerald' }: { color?: 'emerald' | 'amber' }) {
  const cls = color === 'amber' ? 'bg-amber-400' : 'bg-emerald'
  return (
    <span className="relative flex h-2 w-2 shrink-0" aria-hidden>
      <span className={`absolute inline-flex h-full w-full animate-ping motion-reduce:animate-none rounded-full opacity-60 ${cls}`} />
      <span className={`relative inline-flex h-2 w-2 rounded-full ${cls}`} />
    </span>
  )
}

function CheckMark() {
  return (
    <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald" fill="none" viewBox="0 0 14 14" aria-hidden>
      <path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function FeatureList() {
  return (
    <ul className="space-y-2.5">
      {FEATURES.map((f) => (
        <li key={f} className="flex items-start gap-2.5">
          <CheckMark />
          <span className="text-sm leading-snug text-muted-foreground">{f}</span>
        </li>
      ))}
    </ul>
  )
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
      {children}
    </p>
  )
}

function Price() {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="font-mono text-[32px] font-bold leading-none tracking-tight text-foreground">
        $49
      </span>
      <span className="text-sm text-muted-foreground/60">/month</span>
    </div>
  )
}

function CTAButton({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex w-full items-center justify-center rounded-lg bg-emerald py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-90"
    >
      {children}
    </a>
  )
}

function TrustNote() {
  return (
    <p className="mt-3 text-center text-xs text-muted-foreground/50">
      Secured by Dodo Payments. No card data stored by Unchurnly.
    </p>
  )
}

// ── Active state ──────────────────────────────────────────────

function ActivePlanCard({ subscribed_at }: { subscribed_at: string | null }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="border-b border-border px-6 pb-5 pt-6">
        <div className="flex items-center justify-between">
          <SectionLabel>Plan</SectionLabel>
          <div className="flex items-center gap-2">
            <PulseDot />
            <span className="text-xs font-medium text-emerald">Active</span>
          </div>
        </div>
        <p className="mt-5 text-xs text-muted-foreground">Unchurnly</p>
        <div className="mt-2">
          <Price />
        </div>
        {subscribed_at && (
          <p className="mt-2 text-xs text-muted-foreground/50">
            Member since {fmtDate(subscribed_at)}
          </p>
        )}
      </div>

      <div className="border-b border-border px-6 py-5">
        <FeatureList />
      </div>

      <div className="px-6 py-4">
        <a
          href={PAYMENT_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Manage subscription →
        </a>
      </div>
    </div>
  )
}

function BillingDetailsCard() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="border-b border-border px-5 pb-4 pt-5">
        <SectionLabel>Billing</SectionLabel>
        <div className="mt-4">
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-xl font-bold tracking-tight text-foreground">
              $49.00
            </span>
            <span className="text-xs text-muted-foreground/60">/mo</span>
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground/60">
            Billed monthly. Cancel anytime.
          </p>
        </div>
      </div>
      <div className="px-5 py-4">
        <p className="text-xs text-muted-foreground/60">
          Questions?{' '}
          <a
            href="mailto:support@unchurnly.com"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            support@unchurnly.com
          </a>
        </p>
      </div>
    </div>
  )
}

// ── Has recovery / needs subscription ────────────────────────

function RecoveryUpgradeCard() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2.5 border-b border-emerald/10 bg-emerald/5 px-6 py-3.5">
        <PulseDot />
        <p className="text-xs font-medium text-emerald">First recovery detected</p>
      </div>

      <div className="border-b border-border px-6 pb-5 pt-6">
        <p className="text-base font-semibold text-foreground">
          Keep Unchurnly protecting your revenue
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Your first recovery happened. Subscribe to keep the cancel flow and dunning sequences running.
        </p>
      </div>

      <div className="border-b border-border px-6 py-5">
        <Price />
        <div className="mt-5">
          <FeatureList />
        </div>
      </div>

      <div className="px-6 py-5">
        <CTAButton href={PAYMENT_LINK}>Start $49/month plan</CTAButton>
        <TrustNote />
      </div>
    </div>
  )
}

// ── Free / no recovery ────────────────────────────────────────

function FreeTierCard() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="border-b border-border px-6 pb-5 pt-6">
        <SectionLabel>Plan</SectionLabel>
        <div className="mt-4">
          <p className="text-base font-semibold text-foreground">Free tier</p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            No charges yet. Billing starts on your first recovery event.
          </p>
        </div>
      </div>

      <div className="border-b border-border px-6 py-5">
        <SectionLabel>To activate</SectionLabel>
        <ol className="mt-4 space-y-3">
          {[
            { label: 'Connect Stripe', href: '/dashboard/settings' },
            { label: 'Install the cancel flow widget', href: '/dashboard/installation' },
            { label: 'Your first recovery event activates billing', href: null },
          ].map(({ label, href }, i) => (
            <li key={i} className="flex items-center gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border text-[10px] font-semibold text-muted-foreground/50">
                {i + 1}
              </span>
              {href ? (
                <a
                  href={href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {label} →
                </a>
              ) : (
                <span className="text-sm text-muted-foreground/50">{label}</span>
              )}
            </li>
          ))}
        </ol>
      </div>

      <div className="px-6 py-5">
        <SectionLabel>$49/month includes</SectionLabel>
        <div className="mt-4">
          <FeatureList />
        </div>
      </div>
    </div>
  )
}

// ── Cancelled ─────────────────────────────────────────────────

function CancelledCard() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="border-b border-border px-6 pb-5 pt-6">
        <div className="flex items-center justify-between">
          <SectionLabel>Plan</SectionLabel>
          <span className="inline-flex items-center rounded-full border border-destructive/30 bg-destructive/5 px-2.5 py-0.5 text-xs font-medium text-destructive">
            Cancelled
          </span>
        </div>
        <p className="mt-4 text-base font-semibold text-foreground">
          Resubscribe to resume revenue protection
        </p>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Your cancel flow and dunning sequences are paused.
        </p>
      </div>

      <div className="border-b border-border px-6 py-5">
        <Price />
        <div className="mt-5">
          <FeatureList />
        </div>
      </div>

      <div className="px-6 py-5">
        <CTAButton href={PAYMENT_LINK}>Resubscribe for $49/month</CTAButton>
        <TrustNote />
      </div>
    </div>
  )
}

// ── Payment issue ─────────────────────────────────────────────

function PaymentIssueCard() {
  return (
    <div className="overflow-hidden rounded-xl border border-amber-500/20 bg-card">
      <div className="flex items-center gap-2.5 border-b border-amber-500/10 bg-amber-500/5 px-6 py-3.5">
        <PulseDot color="amber" />
        <p className="text-xs font-medium text-amber-400">Payment failed</p>
      </div>

      <div className="border-b border-border px-6 pb-5 pt-6">
        <p className="text-base font-semibold text-foreground">Update your payment method</p>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Your last payment failed. Update your card details to restore access.
        </p>
      </div>

      <div className="px-6 py-4">
        <a
          href={PAYMENT_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-emerald transition-opacity hover:opacity-80"
        >
          Update payment method →
        </a>
      </div>
    </div>
  )
}

// ── Root ──────────────────────────────────────────────────────

export default function BillingPage(props: Props) {
  const { subscription_status, first_recovery_at, subscribed_at } = props
  const isActive = subscription_status === 'active'
  const isCancelled = subscription_status === 'cancelled'
  const isPaymentIssue =
    subscription_status === 'on_hold' || subscription_status === 'expired'
  const hasRecovery = first_recovery_at !== null

  if (isActive) {
    return (
      <div className="grid max-w-2xl grid-cols-[1fr_220px] gap-4 items-start">
        <ActivePlanCard subscribed_at={subscribed_at} />
        <BillingDetailsCard />
      </div>
    )
  }

  return (
    <div className="max-w-xl">
      {isCancelled ? (
        <CancelledCard />
      ) : isPaymentIssue ? (
        <PaymentIssueCard />
      ) : hasRecovery ? (
        <RecoveryUpgradeCard />
      ) : (
        <FreeTierCard />
      )}
    </div>
  )
}
