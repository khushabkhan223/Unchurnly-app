import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const SESSION_COOKIE = 'session'
const EXPIRES_SECONDS = 7 * 24 * 60 * 60

function getSecret(): Uint8Array {
  const secret = process.env.APP_SECRET
  if (!secret) throw new Error('APP_SECRET is not set')
  return new TextEncoder().encode(secret)
}

export async function createSessionToken(
  userId: string,
  email: string,
  onboardingCompleted = false
): Promise<string> {
  return new SignJWT({ email, onboardingCompleted })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret())
}

export async function verifySessionToken(
  token: string
): Promise<{ userId: string; email: string; onboardingCompleted: boolean } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    if (typeof payload.sub !== 'string' || typeof payload['email'] !== 'string') return null
    return {
      userId: payload.sub,
      email: payload['email'],
      onboardingCompleted: payload['onboardingCompleted'] === true,
    }
  } catch {
    return null
  }
}

export async function setSessionCookie(
  userId: string,
  email: string,
  onboardingCompleted = false
): Promise<void> {
  const token = await createSessionToken(userId, email, onboardingCompleted)
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: EXPIRES_SECONDS,
    secure: process.env.NODE_ENV === 'production',
  })
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export async function signCardUpdateToken(
  customerId: string,
  userId: string
): Promise<string> {
  return new SignJWT({ customerId, userId, purpose: 'card-update' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('48h')
    .sign(getSecret())
}

export async function verifyCardUpdateToken(
  token: string
): Promise<{ customerId: string; userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    if (
      typeof payload.customerId !== 'string' ||
      typeof payload.userId !== 'string' ||
      payload.purpose !== 'card-update'
    ) {
      return null
    }
    return { customerId: payload.customerId, userId: payload.userId }
  } catch {
    return null
  }
}
