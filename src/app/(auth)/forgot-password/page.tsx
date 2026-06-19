'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase'

const inputClass =
  'w-full bg-card border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-white/20 transition-colors'

const labelClass =
  'text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1.5 block'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createBrowserClient()
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center mb-8">
          <Image src="/icon.png" alt="Unchurnly" width={32} height={32} className="rounded-lg" />
          <span className="text-white font-semibold text-lg ml-2">Unchurnly</span>
        </div>
        <h1 className="text-xl font-semibold text-foreground mb-1">Check your email</h1>
        <p className="text-sm text-muted-foreground mb-6">
          If an account exists for <strong className="text-foreground">{email}</strong>, you&apos;ll
          receive a password reset link shortly.
        </p>
        <Link
          href="/login"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm">
      <div className="flex items-center justify-center mb-8">
        <Image src="/icon.png" alt="Unchurnly" width={32} height={32} className="rounded-lg" />
        <span className="text-white font-semibold text-lg ml-2">Unchurnly</span>
      </div>

      <h1 className="text-xl font-semibold text-foreground mb-1">Reset your password</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Enter your email and we&apos;ll send you a link to reset your password.
      </p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={inputClass}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-emerald text-background rounded-lg py-2.5 text-sm font-medium hover:opacity-90 transition-opacity mt-5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Sending…' : 'Send reset link'}
        </button>
      </form>
      <p className="text-sm text-muted-foreground text-center mt-4">
        <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">
          ← Back to sign in
        </Link>
      </p>
    </div>
  )
}
