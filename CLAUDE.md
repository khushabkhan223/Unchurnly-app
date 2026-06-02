@AGENTS.md
# Project: Unchurnly (App)

## What this is
B2B SaaS app. Stripe dunning automation + cancel flow tool for indie founders.
This is the product — not the landing page (separate repo: unchurnly-landing).

## Stack
Next.js 16 App Router, TypeScript strict mode, Tailwind CSS v4, shadcn/ui,
Supabase (PostgreSQL + Auth + RLS), Stripe Connect OAuth, Resend, Vercel.
Package manager: npm.

## Hard rules
- TypeScript strict mode everywhere. Never use `any` — use `unknown` and narrow.
- All DB access through server actions or API routes only. Never expose Supabase service role key to client.
- Use `src/lib/logger.ts` for all logging. Never use console.log in production paths.
- Stripe OAuth tokens: always encrypt with AES-256 before storing. Decrypt only at runtime in server context.
- Never write secrets, API keys, or tokens into any file. All secrets live in environment variables.
- Never modify anything outside the `unchurnly-app` directory.

## Security requirements (enforce on every feature)
- Every API route: verify Supabase auth session as first operation before anything else.
- Webhook handler at `/app/api/webhooks/stripe/route.ts`: verify Stripe signature on raw body before any processing. Never parse JSON before signature check.
- Every DB query: verify the requesting user owns the resource. Auth alone is not enough.
- Cancel flow tokens: short-lived JWTs signed with APP_SECRET, 15 min expiry.
- RLS policies required on every Supabase table — verify after every migration.

## Architecture
- `/app` — Next.js App Router pages and API routes
- `/app/api/webhooks/stripe` — Stripe webhook handler (raw body, signature verified)
- `/app/dashboard` — founder-facing dashboard (auth protected)
- `/app/cancel` — cancel flow pages (public, JWT verified)
- `/app/card-update` — hosted card update page (public, JWT verified)
- `/components` — UI components, shadcn/ui based
- `/lib` — all utility modules
- `/lib/stripe.ts` — Stripe client and Connect helpers
- `/lib/supabase.ts` — Supabase client (server and browser)
- `/lib/crypto.ts` — AES-256 encrypt/decrypt for token storage
- `/lib/email.ts` — Resend client and dunning sequence logic
- `/lib/logger.ts` — logging utility

## Workflow
- Non-trivial feature: plan mode first. Write plan to `tasks/todo.md`. Wait for approval before touching files.
- After every feature: run `npm run build` — zero errors before moving on.
- One feature at a time. Complete, verify, then start the next.
- When asked to verify: explain how to test end to end, not just that the code looks right.

## Database tables
users, stripe_connections, monitored_customers, dunning_sequences,
dunning_emails, cancel_flow_configs, cancellation_events.
All tables: UUID primary keys, created_at, updated_at, RLS enabled.

## Failure log
(Claude: append here whenever a mistake is corrected, one line per entry)