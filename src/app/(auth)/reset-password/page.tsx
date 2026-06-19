'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase'

const inputClass =
  'w-full bg-card border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-white/20 transition-colors'

const labelClass =
  'text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1.5 block'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const supabase = createBrowserClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsReady(true)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setIsLoading(true)
    const supabase = createBrowserClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError(updateError.message)
      setIsLoading(false)
      return
    }

    router.push('/login?reset=1')
  }

  if (!isReady) {
    return (
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center mb-8">
          <Image src="/icon.png" alt="Unchurnly" width={32} height={32} className="rounded-lg" />
          <span className="text-white font-semibold text-lg ml-2">Unchurnly</span>
        </div>
        <p className="text-sm text-muted-foreground text-center">Verifying your reset link…</p>
        <p className="text-xs text-muted-foreground/60 text-center mt-3">
          If nothing happens,{' '}
          <Link href="/forgot-password" className="underline hover:text-muted-foreground transition-colors">
            request a new link
          </Link>
          .
        </p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm">
      <div className="flex items-center justify-center mb-8">
        <Image src="/icon.png" alt="Unchurnly" width={32} height={32} className="rounded-lg" />
        <span className="text-white font-semibold text-lg ml-2">Unchurnly</span>
      </div>

      <h1 className="text-xl font-semibold text-foreground mb-1">Set a new password</h1>
      <p className="text-sm text-muted-foreground mb-6">Choose a strong password for your account.</p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="password" className={labelClass}>
          New password
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
        <label htmlFor="confirm" className={`${labelClass} mt-4`}>
          Confirm password
        </label>
        <input
          id="confirm"
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Repeat your password"
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
          {isLoading ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </div>
  )
}
