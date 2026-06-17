import Stripe from 'stripe'
import { decryptToken } from '@/lib/crypto'
import { logger } from '@/lib/logger'

function subItemsToCents(sub: Stripe.Subscription): number {
  let cents = 0
  for (const item of sub.items.data) {
    const price = item.price
    if (!price?.unit_amount) continue
    const qty = item.quantity ?? 1
    const interval = price.recurring?.interval
    let monthly = price.unit_amount * qty
    if (interval === 'year') monthly = monthly / 12
    else if (interval === 'week') monthly = monthly * 4.33
    else if (interval === 'day') monthly = monthly * 30
    cents += monthly
  }
  return cents
}

type MrrDebug = { activeCount: number; trialingCount: number; totalCents: number; error?: string }

export async function calculateMrr(
  encryptedToken: string,
  userId: string
): Promise<{ mrr: number; debug: MrrDebug }> {
  try {
    const key = decryptToken(encryptedToken)
    const founderStripe = new Stripe(key, { apiVersion: '2026-04-22.dahlia' })
    let totalCents = 0
    let activeCount = 0
    let trialingCount = 0

    for await (const sub of founderStripe.subscriptions.list({ status: 'active', limit: 100 })) {
      activeCount++
      totalCents += subItemsToCents(sub)
    }

    for await (const sub of founderStripe.subscriptions.list({ status: 'trialing', limit: 100 })) {
      trialingCount++
      totalCents += subItemsToCents(sub)
    }

    logger.info('calculateMrr debug', { userId, activeCount, trialingCount, totalCents })

    return { mrr: totalCents / 100, debug: { activeCount, trialingCount, totalCents } }
  } catch (err) {
    logger.error('calculateMrr failed', {
      reason: err instanceof Error ? err.message : String(err),
      userId,
    })
    return {
      mrr: 0,
      debug: {
        activeCount: 0,
        trialingCount: 0,
        totalCents: 0,
        error: err instanceof Error ? err.message : String(err),
      },
    }
  }
}
