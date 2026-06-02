# Unchurnly — Feature Build Order

Work through these in sequence. One feature at a time: complete, verify (`npm run build` passes), then start the next.

---

## 1. Auth flow
- Login page (`/app/login`)
- Signup page (`/app/signup`)
- Auth callback route (`/app/auth/callback`) — handles Supabase magic link / OAuth redirect
- Middleware (`middleware.ts`) — redirects unauthenticated users away from `/dashboard`

## 2. Stripe Connect OAuth
- Connect initiation route (`/app/api/stripe/connect`) — redirects to Stripe OAuth
- OAuth callback route (`/app/api/stripe/callback`) — exchanges code for token, encrypts with `crypto.ts`, stores in `stripe_connections`
- Dashboard shows connected/disconnected state

## 3. Dashboard shell
- Protected layout with sidebar nav (`/app/dashboard/layout.tsx`)
- Auth guard in layout (redirect to login if no session)
- Basic nav links: Customers, Sequences, Settings

## 4. Customer sync
- Server action: fetch Stripe customers + active subscriptions for connected account
- Upsert into `monitored_customers` (by `stripe_customer_id`)
- Dashboard customer table (paginated)

## 5. Stripe webhook handler
- `/app/api/webhooks/stripe/route.ts` — full implementation
- Verify Stripe signature on raw body before any processing
- Handle `invoice.payment_failed` → create/activate dunning sequence
- Handle `customer.subscription.deleted` → mark customer churned

## 6. Dunning sequence engine
- On `invoice.payment_failed`: create `dunning_sequences` row + 4 `dunning_emails` rows (day 1/3/7/14) with status `pending`
- Scheduled job or cron API route to check pending emails and dispatch due ones
- Update sequence status to `completed` or `cancelled` as appropriate

## 7. Email sending (Resend)
- Dunning email templates (payment failed, retry reminder, final notice)
- `lib/email.ts` — `sendDunningEmail(sequenceId, dayNumber)` function
- Mark `dunning_emails` row as `sent` or `failed` after send attempt

## 8. Cancel flow
- `lib/cancelToken.ts` — mint and verify short-lived JWTs (15 min, signed with `APP_SECRET`) using `jose`
- `/app/cancel/[token]/page.tsx` — decode token, show cancel options (pause / discount / downgrade / confirm cancel)
- Server action for each outcome: update `cancel_flow_configs`, create `cancellation_events` row
- Redirect to success screen after choice

## 9. Card update page
- Similar JWT flow as cancel: token contains `stripe_customer_id` + `user_id`
- `/app/card-update/[token]/page.tsx` — embed Stripe Elements or redirect to Stripe-hosted page
- On success: clear any active dunning sequences for the customer

## 10. Founder dashboard UI
- Customer table with status badges, MRR column, sequence status
- Sequence detail drawer — timeline of dunning emails sent
- Key stats header: MRR at risk, sequences active, saves this month

## 11. Cancel flow config UI
- Settings page (`/app/dashboard/settings`)
- Toggle pause / discount / downgrade options
- Set discount percent (validated 1–100)
- Save to `cancel_flow_configs` via server action

## 12. Production hardening
- CSP headers in `next.config.ts`
- Rate limiting on all public API routes (webhook, cancel, card-update)
- Error boundaries on all dashboard pages
- Sentry or equivalent error tracking wired up
- Smoke test checklist before first deploy
