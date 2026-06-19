'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase'
import { createSession } from '@/app/actions/auth'

const inputClass =
  'w-full bg-card border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-white/20 transition-colors'

const labelClass =
  'text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1.5 block'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setResetSuccess(new URLSearchParams(window.location.search).get('reset') === '1')
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createBrowserClient()
    const { data, error: supabaseError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (supabaseError || !data.session) {
      setError(
        supabaseError?.message.includes('confirmed')
          ? 'Please confirm your email before signing in.'
          : 'Incorrect email or password.'
      )
      setIsLoading(false)
      return
    }

    try {
      await createSession(data.session.access_token)
      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Authentication failed. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="flex items-center justify-center mb-8">
        <Image src="/icon.png" alt="Unchurnly" width={32} height={32} className="rounded-lg" />
        <span className="text-white font-semibold text-lg ml-2">Unchurnly</span>
      </div>

      <h1 className="text-xl font-semibold text-foreground mb-1">Welcome back</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Enter your email and password to access your dashboard.
      </p>
      {resetSuccess && (
        <p className="text-sm text-emerald bg-emerald/10 border border-emerald/20 rounded-lg px-3 py-2.5 mb-4">
          Password updated. Sign in with your new password.
        </p>
      )}
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
        <div className="flex items-center justify-between mt-4 mb-1.5">
          <label htmlFor="password" className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
            Password
          </label>
          <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Forgot password?
          </Link>
        </div>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
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
          {isLoading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="text-sm text-muted-foreground text-center mt-4">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-emerald hover:opacity-80">
          Sign up
        </Link>
      </p>
    </div>
  )
}
