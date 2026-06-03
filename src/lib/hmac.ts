import { createHmac, timingSafeEqual } from 'crypto'

export function generateHmac(customerId: string, appSecret: string): string {
  return createHmac('sha256', appSecret).update(customerId).digest('hex')
}

export function verifyHmac(
  customerId: string,
  authHash: string,
  appSecret: string
): boolean {
  const expected = generateHmac(customerId, appSecret)
  try {
    return timingSafeEqual(
      Buffer.from(expected, 'hex'),
      Buffer.from(authHash, 'hex')
    )
  } catch {
    return false
  }
}
