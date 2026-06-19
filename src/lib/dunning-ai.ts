import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'
import { Resend } from 'resend'
import { createServerClient } from '@/lib/supabase'
import { logger } from '@/lib/logger'

type UserBrandRow = {
  business_model: string | null
  brand_voice: string | null
  company_name: string | null
  support_email: string | null
}

function bodyToHtml(text: string): string {
  return text
    .split(/\n\n+/)
    .map((p) => `<p style="margin:0 0 16px 0">${p.trim().replace(/\n/g, '<br/>')}</p>`)
    .join('\n')
}

function urgencyForAttempt(attemptCount: number): string {
  if (attemptCount <= 1)
    return 'Gentle and friendly — this is likely an automated card issue, not intentional non-payment. Reassure the customer.'
  if (attemptCount <= 2)
    return 'Firm but helpful — acknowledge this is the second failure, offer to help resolve it quickly.'
  if (attemptCount <= 3)
    return 'Urgent — access will be suspended soon. Be direct and clear about consequences without being aggressive.'
  return 'Critical — this is the final notice before subscription termination in 24 hours. State the deadline explicitly.'
}

async function sendFallbackEmail(
  to: string,
  planName: string,
  companyName: string,
  supportEmail: string | null
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    logger.error('RESEND_API_KEY not configured — cannot send fallback dunning email')
    return
  }
  const resend = new Resend(apiKey)
  const supportLine = supportEmail
    ? `<p style="margin:0 0 16px 0;color:#6b7280;font-size:14px">Questions? Email us at ${supportEmail}</p>`
    : ''
  const html = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111827">
  <p style="margin:0 0 16px 0">Hi there,</p>
  <p style="margin:0 0 16px 0">We weren't able to process your payment for <strong>${planName}</strong>. Please update your payment method to keep your account active.</p>
  ${supportLine}<p style="margin:0;color:#6b7280;font-size:14px">— ${companyName} Billing</p>
</div>`

  const { error } = await resend.emails.send({
    from: `${companyName} <billing@unchurnly.com>`,
    to,
    subject: `Action needed: payment failed for ${planName}`,
    html,
  })

  if (error) {
    logger.error('Fallback dunning email failed to send', { reason: error.message })
  }
}

export async function generateAndSendDunning(
  userId: string,
  planName: string,
  amountDue: number,
  attemptCount: number,
  customerEmail: string,
  cardUpdateUrl?: string
): Promise<{ subject: string; body: string } | null> {
  const supabase = createServerClient()
  const { data: userRow } = await supabase
    .from('users')
    .select('business_model, brand_voice, company_name, support_email')
    .eq('id', userId)
    .single()

  const user = userRow as UserBrandRow | null
  const companyName = user?.company_name?.trim() || 'Unchurnly'
  const supportEmail = user?.support_email ?? null
  const businessModel = user?.business_model ?? ''
  const brandVoiceTags = user?.brand_voice
    ? user.brand_voice.split(',').map((t) => t.trim()).filter(Boolean)
    : []

  const geminiKey = process.env.GEMINI_API_KEY
  if (!geminiKey) {
    logger.error('GEMINI_API_KEY not configured — falling back to template dunning email')
    await sendFallbackEmail(customerEmail, planName, companyName, supportEmail)
    return null
  }

  const isB2b = businessModel.toLowerCase().includes('b2b')
  const toneGuide = isB2b
    ? 'Professional, concise corporate tone. No exclamation marks. Lead with business impact.'
    : 'Warm, direct, and conversational. Short sentences. Empathetic but clear.'

  const brandVoiceInstruction =
    brandVoiceTags.length > 0
      ? `\nBrand voice tags (apply all): ${brandVoiceTags.join(', ')}.`
      : ''

  const amountStr = (amountDue / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  })

  const supportEmailInstruction = supportEmail
    ? `- If appropriate, end with a brief note like "Questions? Email us at ${supportEmail}" — mention it as plain text only, not as a link.`
    : ''

  const prompt = `You are writing a payment recovery email on behalf of ${companyName}.

Context:
- Product: ${planName}
- Amount due: ${amountStr}
- Payment attempt number: ${attemptCount}
- Urgency: ${urgencyForAttempt(attemptCount)}
- Tone: ${toneGuide}${brandVoiceInstruction}

Rules:
- Do NOT include any URL, link, or call-to-action button.
- Write in plain text only — no markdown, no HTML, no asterisks.
- Use paragraph breaks (blank lines) to separate thoughts.
- Keep the email under 120 words.
- Sign off as "${companyName} Billing" — no person's name.
${supportEmailInstruction}

Spam filter rules (non-negotiable, override any tone instruction above):
- Avoid ALL CAPS words.
- Use at most one exclamation point in the entire email.
- Never use multiple exclamation points or question marks together.
- Never use phrases like "Uh oh!", "Don't miss out!", "Act now!", "Urgent!", "Last chance!", or similar alarm-style interjections.
- Do not start sentences with overly casual interjections.
- Write in a calm, professional, helpful tone even when the brand voice is enthusiastic — express enthusiasm through positive language, not alarm phrasing.

Return a JSON object with exactly: "subject" (string) and "body" (string).`

  try {
    const genAI = new GoogleGenerativeAI(geminiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-lite',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            subject: { type: SchemaType.STRING },
            body: { type: SchemaType.STRING },
          },
          required: ['subject', 'body'],
        },
      },
    })

    const result = await model.generateContent(prompt)
    const parsed = JSON.parse(result.response.text()) as { subject: string; body: string }

    if (typeof parsed.subject !== 'string' || typeof parsed.body !== 'string') {
      throw new Error('Gemini response missing required fields')
    }

    const ctaHtml = cardUpdateUrl
      ? `\n<div style="margin:24px 0">\n  <a href="${cardUpdateUrl}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px">Update Payment Method</a>\n</div>`
      : ''

    const resend = new Resend(process.env.RESEND_API_KEY)
    const { error } = await resend.emails.send({
      from: `${companyName} <billing@unchurnly.com>`,
      to: customerEmail,
      subject: parsed.subject,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111827">\n${bodyToHtml(parsed.body)}${ctaHtml}\n</div>`,
    })

    if (error) {
      logger.error('Resend failed in AI dunning path', { reason: error.message })
    }

    return { subject: parsed.subject, body: parsed.body }
  } catch (err) {
    logger.error('Gemini generation failed — falling back to template dunning email', {
      reason: err instanceof Error ? err.message : 'unknown',
    })
    await sendFallbackEmail(customerEmail, planName, companyName, supportEmail)
    return null
  }
}
