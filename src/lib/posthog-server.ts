import { PostHog } from 'posthog-node'

let _instance: PostHog | null = null

function getInstance(): PostHog {
  if (!_instance) {
    _instance = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      host: 'https://app.posthog.com',
    })
  }
  return _instance
}

export const posthogServer = {
  capture(event: Parameters<PostHog['capture']>[0]): void {
    getInstance().capture(event)
  },
}
