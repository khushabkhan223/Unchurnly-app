'use client'

import { useState } from 'react'

type Props = { appKey: string }

type FlowData = {
  customerId: string
  subscriptionId: string
  customerName: string
  planName: string
  amount: number
  currency: string
}

const cardStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: '12px',
  padding: '32px',
  width: '100%',
  maxWidth: '400px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
}

const wrapStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  background: '#f9fafb',
  fontFamily: 'sans-serif',
  padding: '24px',
  boxSizing: 'border-box',
}

const headingStyle: React.CSSProperties = {
  margin: '0 0 8px',
  fontSize: '18px',
  fontWeight: 600,
  color: '#111827',
}

const subtitleStyle: React.CSSProperties = {
  margin: '0 0 24px',
  fontSize: '14px',
  color: '#6b7280',
  lineHeight: 1.5,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #e5e7eb',
  borderRadius: '6px',
  fontSize: '14px',
  marginBottom: '12px',
  boxSizing: 'border-box',
  outline: 'none',
  color: '#111827',
}

const errorStyle: React.CSSProperties = {
  color: '#dc2626',
  fontSize: '13px',
  margin: '0 0 12px',
}

function primaryBtn(disabled: boolean): React.CSSProperties {
  return {
    width: '100%',
    padding: '10px',
    background: disabled ? '#9ca3af' : '#111827',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: disabled ? 'not-allowed' : 'pointer',
  }
}

const ghostBtn: React.CSSProperties = {
  width: '100%',
  padding: '8px',
  background: 'none',
  border: 'none',
  color: '#6b7280',
  fontSize: '13px',
  cursor: 'pointer',
  marginTop: '8px',
}

export default function EmailVerifyFlow({ appKey }: Props) {
  const [step, setStep] = useState<'email' | 'code' | 'flow'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [flowData, setFlowData] = useState<FlowData | null>(null)

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/cancel/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appKey, email }),
      })
      const data: { error?: string } = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong.')
      } else {
        setStep('code')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCodeSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/cancel/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appKey, email, code }),
      })
      const data: FlowData & { error?: string } = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Invalid or expired code.')
      } else {
        setFlowData(data)
        setStep('flow')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'flow' && flowData) {
    const src = `/cancel-flow?key=${encodeURIComponent(appKey)}&customerId=${encodeURIComponent(flowData.customerId)}&authHash=`
    return (
      <iframe
        src={src}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: 'none',
          zIndex: 999999,
          background: 'white',
        }}
      />
    )
  }

  return (
    <div style={wrapStyle}>
      <div style={cardStyle}>
        {step === 'email' && (
          <form onSubmit={handleEmailSubmit}>
            <h2 style={headingStyle}>Verify your email</h2>
            <p style={subtitleStyle}>
              Enter the email address associated with your account to continue.
            </p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={loading}
              style={inputStyle}
            />
            {error && <p style={errorStyle}>{error}</p>}
            <button type="submit" disabled={loading || !email} style={primaryBtn(loading || !email)}>
              {loading ? 'Sending…' : 'Send verification code'}
            </button>
          </form>
        )}

        {step === 'code' && (
          <form onSubmit={handleCodeSubmit}>
            <h2 style={headingStyle}>Enter verification code</h2>
            <p style={subtitleStyle}>We sent a 6-digit code to {email}.</p>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              required
              disabled={loading}
              style={{
                ...inputStyle,
                fontSize: '28px',
                letterSpacing: '10px',
                textAlign: 'center',
                fontWeight: 600,
              }}
            />
            {error && <p style={errorStyle}>{error}</p>}
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              style={primaryBtn(loading || code.length !== 6)}
            >
              {loading ? 'Verifying…' : 'Verify code'}
            </button>
            <button
              type="button"
              onClick={() => { setStep('email'); setCode(''); setError('') }}
              style={ghostBtn}
            >
              Use a different email
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
