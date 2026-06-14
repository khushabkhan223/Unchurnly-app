import Link from 'next/link'

export default function RefundPage() {
  return (
    <div className="max-w-3xl mx-auto px-8 py-16">
      <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors inline-block">
        ← Back to unchurnly.com
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-2 mt-8">Refund Policy</h1>
      <p className="text-sm text-gray-400 mb-10">Last updated: 14 June 2026</p>

      <div className="text-gray-600 text-sm leading-relaxed space-y-6">
        <h2 className="text-base font-semibold text-gray-900 mt-8 mb-2">Overview</h2>
        <p>
          Unchurnly operates on a &quot;free until your first recovery&quot; model. You never pay anything until Unchurnly
          has already recovered a failed payment or prevented a cancellation on your behalf. Because of this
          model, our refund policy is intentionally narrow — you only pay after receiving value.
        </p>

        <h2 className="text-base font-semibold text-gray-900 mt-8 mb-2">When Billing Begins</h2>
        <p>
          Your $49/month subscription begins automatically the first time Unchurnly successfully recovers a failed
          payment or saves a cancellation through the cancel flow widget. From that point forward, you are billed
          $49/month on the same date each month until you cancel.
        </p>
        <p>
          You will receive an email notification when your first recovery event is detected and your billing begins.
        </p>

        <h2 className="text-base font-semibold text-gray-900 mt-8 mb-2">Refund Eligibility</h2>
        <p>
          Because you only pay after receiving demonstrable value, we generally do not offer refunds on subscription
          charges. However, we will issue a full refund for any charge if:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>You were charged due to a technical error on our end (e.g., a bug caused a billing trigger that should not have fired).</li>
          <li>Your first recovery event was recorded incorrectly due to a verified bug in our system, and no genuine recovery took place.</li>
          <li>You contact us within 48 hours of your first charge and have not actively used the dashboard since being charged.</li>
        </ul>
        <p>
          Refunds are not available for charges that followed a genuine recovery event, even if you later decide
          the service is not for you. In all ambiguous cases, we will review your account history and err on the
          side of the customer.
        </p>

        <h2 className="text-base font-semibold text-gray-900 mt-8 mb-2">How to Request a Refund</h2>
        <p>
          Email us at{' '}
          <a href="mailto:support@unchurnly.com" className="underline hover:text-gray-900">support@unchurnly.com</a>{' '}
          with the subject line &quot;Refund Request&quot; and include your account email address and a brief description
          of the issue. We will respond within 2 business days. Approved refunds are processed back to your
          original payment method and typically appear within 5–10 business days depending on your card issuer.
        </p>

        <h2 className="text-base font-semibold text-gray-900 mt-8 mb-2">Cancellation</h2>
        <p>
          You can cancel your Unchurnly subscription at any time from your account settings or by emailing{' '}
          <a href="mailto:support@unchurnly.com" className="underline hover:text-gray-900">support@unchurnly.com</a>.
          Cancellation takes effect at the end of your current billing period — you will not be charged again
          after that date. No partial-month refunds are issued for unused days within a billing period you have
          already been charged for.
        </p>
        <p>
          After cancellation, your account and Stripe connection remain accessible in read-only mode until the
          end of your billing period, at which point access is revoked. Your data is retained for 90 days after
          account closure, then permanently deleted unless you request earlier deletion.
        </p>

        <h2 className="text-base font-semibold text-gray-900 mt-8 mb-2">Questions</h2>
        <p>
          If you have any questions about this Refund Policy or a specific charge, please contact us at{' '}
          <a href="mailto:support@unchurnly.com" className="underline hover:text-gray-900">support@unchurnly.com</a>.
          We aim to respond to all support enquiries within 1 business day.
        </p>
      </div>
    </div>
  )
}
