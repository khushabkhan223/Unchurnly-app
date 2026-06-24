'use client'
import posthog from 'posthog-js'

let initialized = false

export function initPostHog() {
  if (typeof window === 'undefined') return
  if (initialized) return
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: 'https://app.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: true,
  })
  initialized = true
}

export { posthog }
