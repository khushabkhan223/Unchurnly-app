import Stripe from 'stripe'
import { decryptToken } from '@/lib/crypto'

export async function calculateMrr(encryptedToken: string): Promise<number> {
  try {
    const key = decryptToken(encryptedToken)
    const founderStripe = new Stripe(key, { apiVersion: '2026-04-22.dahlia' })
    let totalCents = 0

    for await (const sub of founderStripe.subscriptions.list({ status: 'active', limit: 100 })) {
      for (const item of sub.items.data) {
        const price = item.price
        if (!price?.unit_amount) continue
        const qty = item.quantity ?? 1
        const interval = price.recurring?.interval
        let monthly = price.unit_amount * qty
        if (interval === 'year') monthly = monthly / 12
        else if (interval === 'week') monthly = monthly * 4.33
        else if (interval === 'day') monthly = monthly * 30
        totalCents += monthly
      }
    }

    return totalCents / 100
  } catch {
    return 0
  }
}
