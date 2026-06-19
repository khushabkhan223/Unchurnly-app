import { cookies } from 'next/headers'
import { verifySessionToken } from '@/lib/session'

export default async function SubscribePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  const session = token ? await verifySessionToken(token) : null

  const base = process.env.NEXT_PUBLIC_DODO_PAYMENT_LINK ?? '#'
  const paymentLink = (() => {
    if (base === '#' || !session?.userId) return base
    const sep = base.includes('?') ? '&' : '?'
    return `${base}${sep}metadata_unchurnly_user_id=${encodeURIComponent(session.userId)}`
  })()

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
            <svg
              className="h-7 w-7 text-indigo-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-gray-900">Your free period has ended</h1>
        <p className="mt-3 text-base text-gray-500">
          Unchurnly recovered your first payment or cancellation. Start your $49/month plan to keep
          it running.
        </p>

        <a
          href={paymentLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Start $49/month plan →
        </a>

        <p className="mt-4 text-sm text-gray-400">
          <a
            href="mailto:support@unchurnly.com"
            className="underline underline-offset-2 hover:text-gray-600"
          >
            Contact support
          </a>
        </p>
      </div>
    </div>
  )
}
