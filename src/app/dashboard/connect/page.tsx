'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function ConnectPage() {
  const [restrictedKey, setRestrictedKey] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const res = await fetch('/api/stripe/validate-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restrictedKey }),
    })

    const data: unknown = await res.json()

    if (!res.ok) {
      const message =
        data !== null &&
        typeof data === 'object' &&
        'error' in data &&
        typeof (data as Record<string, unknown>).error === 'string'
          ? (data as Record<string, string>).error
          : 'Something went wrong. Please try again.'
      setError(message)
      setIsLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Connect your Stripe account</CardTitle>
          <CardDescription>
            In your Stripe Dashboard &rarr; Developers &rarr; API Keys &rarr; Create
            restricted key. Give it these permissions: Customers (read), Subscriptions
            (read), Invoices (read), Webhook endpoints (write). Paste the key below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="connect-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="restrictedKey">Restricted API key</Label>
              <Input
                id="restrictedKey"
                type="password"
                placeholder="rk_live_..."
                required
                value={restrictedKey}
                onChange={(e) => setRestrictedKey(e.target.value)}
                autoComplete="off"
              />
            </div>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
          </form>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            form="connect-form"
            className="w-full"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? 'Validating…' : 'Connect Stripe'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
