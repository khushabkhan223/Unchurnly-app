import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not set')
}

const resend = new Resend(process.env.RESEND_API_KEY)

type TemplateEntry = {
  subject: string
  getBody: (customerName: string, productName: string, cardUpdateUrl: string) => string
}

export const DUNNING_TEMPLATES: Record<1 | 3 | 7 | 14, TemplateEntry> = {
  1: {
    subject: 'Your payment failed — please update your card',
    getBody: (customerName, productName, cardUpdateUrl) => `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #111827;">
  <p>Hi ${customerName},</p>
  <p>We weren't able to process your payment for <strong>${productName}</strong>. These things happen — your card may have expired or reached its limit.</p>
  <p>Click below to update your payment method and keep your account running smoothly.</p>
  <p style="margin: 32px 0;">
    <a href="${cardUpdateUrl}" style="background: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Update payment method</a>
  </p>
  <p style="color: #6b7280; font-size: 14px;">If you've already sorted this out, please ignore this email.</p>
  <p style="color: #6b7280; font-size: 14px;">— The ${productName} team</p>
</div>`,
  },
  3: {
    subject: 'Reminder: your payment still needs attention',
    getBody: (customerName, productName, cardUpdateUrl) => `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #111827;">
  <p>Hi ${customerName},</p>
  <p>Just a quick reminder — we still haven't been able to charge your card for <strong>${productName}</strong>.</p>
  <p>Updating your payment method only takes a moment and will keep your access uninterrupted.</p>
  <p style="margin: 32px 0;">
    <a href="${cardUpdateUrl}" style="background: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Update payment method</a>
  </p>
  <p style="color: #6b7280; font-size: 14px;">Questions? Reply to this email and we'll help you out.</p>
  <p style="color: #6b7280; font-size: 14px;">— The ${productName} team</p>
</div>`,
  },
  7: {
    subject: 'Your access is at risk — payment update needed',
    getBody: (customerName, productName, cardUpdateUrl) => `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #111827;">
  <p>Hi ${customerName},</p>
  <p>Your <strong>${productName}</strong> account is at risk. Your payment has been overdue for 7 days, and access will be suspended soon if this isn't resolved.</p>
  <p>Please update your payment method now to avoid any interruption.</p>
  <p style="margin: 32px 0;">
    <a href="${cardUpdateUrl}" style="background: #dc2626; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Update payment method now</a>
  </p>
  <p style="color: #6b7280; font-size: 14px;">If you need help, reply to this email and we'll sort it out.</p>
  <p style="color: #6b7280; font-size: 14px;">— The ${productName} team</p>
</div>`,
  },
  14: {
    subject: 'Final notice: your subscription will be cancelled today',
    getBody: (customerName, productName, cardUpdateUrl) => `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #111827;">
  <p>Hi ${customerName},</p>
  <p>This is your final notice. Your <strong>${productName}</strong> subscription will be cancelled today due to an unpaid balance.</p>
  <p>If you'd like to keep your account, please update your payment method immediately. This is the last reminder we'll send.</p>
  <p style="margin: 32px 0;">
    <a href="${cardUpdateUrl}" style="background: #dc2626; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Update payment method — save my account</a>
  </p>
  <p style="color: #6b7280; font-size: 14px;">If you've decided to cancel, no action is needed.</p>
  <p style="color: #6b7280; font-size: 14px;">— The ${productName} team</p>
</div>`,
  },
}

type SendDunningEmailParams = {
  to: string
  customerName: string
  productName: string
  cardUpdateUrl: string
  dayNumber: 1 | 3 | 7 | 14
  fromEmail?: string
}

export async function sendDunningEmail(
  params: SendDunningEmailParams
): Promise<{ success: boolean; error?: string }> {
  try {
    const template = DUNNING_TEMPLATES[params.dayNumber]
    const from = params.fromEmail ?? 'Unchurnly <onboarding@resend.dev>'

    const { error } = await resend.emails.send({
      from,
      to: params.to,
      subject: template.subject,
      html: template.getBody(params.customerName, params.productName, params.cardUpdateUrl),
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}
