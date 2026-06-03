import { clearSessionCookie } from '@/lib/session'

export async function POST() {
  await clearSessionCookie()
  return new Response(null, { status: 200 })
}
