import { NextResponse } from 'next/server'
import { randomInt } from 'crypto'
import Stripe from 'stripe'
import { Resend } from 'resend'
import { decryptToken } from '@/lib/crypto'
import { createServerClient } from '@/lib/supabase'
import { logger } from '@/lib/logger'

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT_MAX = 3
type RateLimitEntry = { count: number; windowStart: number }
const rateLimitMap = new Map<string, RateLimitEntry>()

function checkRateLimit(key: string): boolean {
  const now = Date.now()
  for (const [k, entry] of rateLimitMap) {
    if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) rateLimitMap.delete(k)
  }
  const entry = rateLimitMap.get(key)
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(key, { count: 1, windowStart: now })
    return true
  }
  if (entry.count >= RATE_LIMIT_MAX) return false
  entry.count++
  return true
}

type AppKeyRow = { user_id: string }
type ConnectionRow = { encrypted_access_token: string }

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { appKey, email } =
    body !== null && typeof body === 'object' ? (body as Record<string, unknown>) : {}

  if (typeof appKey !== 'string' || !appKey || typeof email !== 'string' || !email) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  if (!checkRateLimit(email)) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  const supabase = createServerClient()

  const { data: keyData } = await supabase
    .from('founder_app_keys')
    .select('user_id')
    .eq('app_key', appKey)
    .maybeSingle()

  if (!keyData) {
    return NextResponse.json({ error: 'Invalid link.' }, { status: 404 })
  }

  const { user_id: userId } = keyData as AppKeyRow

  const { data: connectionData } = await supabase
    .from('stripe_connections')
    .select('encrypted_access_token')
    .eq('user_id', userId)
    .maybeSingle()

  if (!connectionData) {
    return NextResponse.json({ error: 'Service not configured.' }, { status: 400 })
  }

  const stripeKey = decryptToken((connectionData as ConnectionRow).encrypted_access_token)
  const founderStripe = new Stripe(stripeKey, { apiVersion: '2026-04-22.dahlia' })

  const customers = await founderStripe.customers.list({ email, limit: 1 })
  if (customers.data.length === 0) {
    return NextResponse.json({ error: 'No account found with that email.' }, { status: 404 })
  }

  const code = randomInt(0, 1_000_000).toString().padStart(6, '0')
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

  const { error: insertError } = await supabase.from('cancel_otps').insert({
    app_key: appKey,
    email,
    code,
    expires_at: expiresAt,
    used: false,
  })

  if (insertError) {
    logger.error('Failed to insert cancel OTP', { reason: insertError.message })
    return NextResponse.json({ error: 'Failed to generate code.' }, { status: 500 })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Email service not configured.' }, { status: 500 })
  }

  const resend = new Resend(apiKey)
  const { error: emailError } = await resend.emails.send({
    from: 'billing@unchurnly.com',
    to: email,
    subject: 'Your cancellation verification code',
    html: `<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #111827;">
  <p style="margin: 0 0 16px;">Your verification code is:</p>
  <p style="font-size: 36px; font-weight: 700; letter-spacing: 10px; margin: 24px 0; color: #111827;">${code}</p>
  <p style="color: #6b7280; font-size: 14px; margin: 0;">Valid for 10 minutes. If you didn't request this, you can ignore this email.</p>
</div>`,
  })

  if (emailError) {
    logger.error('Failed to send OTP email', { reason: emailError.message })
    return NextResponse.json({ error: 'Failed to send email.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
