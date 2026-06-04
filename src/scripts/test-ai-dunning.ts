import { config } from 'dotenv'
import { resolve } from 'path'
import { generateAndSendDunning } from '../lib/dunning-ai'

// Next.js splits env across .env (public vars) and .env.local (secrets).
// Load base first, then let .env.local override.
config({ path: resolve(process.cwd(), '.env') })
config({ path: resolve(process.cwd(), '.env.local'), override: true })

const userId: string = process.argv[2] ?? 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
const attemptCount: number = parseInt(process.argv[3] ?? '1', 10)
const planName = 'Growth SaaS Engine'
const amountDue = 4900
const customerEmail = 'khushabkhan222@gmail.com'

async function main() {
  console.log('='.repeat(60))
  console.log('AI Dunning Email — Test Run')
  console.log('='.repeat(60))
  console.log(`  userId       : ${userId}`)
  console.log(`  planName     : ${planName}`)
  console.log(`  amountDue    : $${(amountDue / 100).toFixed(2)}`)
  console.log(`  attemptCount : ${attemptCount}`)
  console.log(`  customerEmail: ${customerEmail}`)
  console.log('='.repeat(60))
  console.log()

  const result = await generateAndSendDunning(
    userId,
    planName,
    amountDue,
    attemptCount,
    customerEmail
  )

  console.log()
  if (result) {
    console.log('--- GENERATED SUBJECT ---')
    console.log(result.subject)
    console.log()
    console.log('--- GENERATED BODY ---')
    console.log(result.body)
    console.log()
    console.log('✓ Email generated and sent via Resend.')
  } else {
    console.log('⚠  Gemini generation failed or GEMINI_API_KEY missing.')
    console.log('   Fallback template email was sent instead.')
  }
}

main().catch(console.error)
