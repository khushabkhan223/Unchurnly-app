'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase'

const inputClass =
  'w-full bg-card border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-white/20 transition-colors'

const labelClass =
  'text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1.5 block'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createBrowserClient()
    const { error: supabaseError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/callback`,
      },
    })

    if (supabaseError) {
      setError(supabaseError.message)
      setIsLoading(false)
      return
    }

    setEmailSent(true)
  }

  if (emailSent) {
    return (
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center mb-8">
          <div className="w-8 h-8 rounded-lg bg-foreground text-background text-sm font-bold flex items-center justify-center">
            U
          </div>
          <span className="text-white font-semibold text-lg ml-2">Unchurnly</span>
        </div>
        <h1 className="text-xl font-semibold text-foreground mb-1">Check your email</h1>
        <p className="text-sm text-muted-foreground mb-6">
          We sent a confirmation link to{' '}
          <strong className="text-foreground">{email}</strong>. Click the link to activate
          your account.
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
      {/* Logo */}
      <div className="flex items-center justify-center mb-8">
        <div className="w-8 h-8 rounded-lg bg-foreground text-background text-sm font-bold flex items-center justify-center">
          U
        </div>
        <span className="text-white font-semibold text-lg ml-2">Unchurnly</span>
      </div>

      <h1 className="text-xl font-semibold text-foreground mb-1">Create your account</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Start recovering revenue in under 5 minutes.
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
        <label htmlFor="password" className={`${labelClass} mt-4`}>
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Min. 6 characters"
          className={inputClass}
        />
        {error && (
          <p role="alert" className="text-sm text-destructive mt-2">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-emerald text-background rounded-lg py-2.5 text-sm font-medium hover:opacity-90 transition-opacity mt-5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="text-sm text-muted-foreground text-center mt-4">
        Already have an account?{' '}
        <Link href="/login" className="text-emerald hover:opacity-80">
          Sign in
        </Link>
      </p>
    </div>
  )
}
