'use client'

import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Loader2, Mail, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { AuthPanel } from '@/components/AuthPanel'
import { GoogleButton } from '@/components/GoogleButton'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [needsConfirm, setNeedsConfirm] = useState(false)
  const [resent, setResent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [next, setNext] = useState('/dashboard')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const target = params.get('next')
    if (target && target.startsWith('/')) setNext(target)
  }, [])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      const unconfirmed = /email not confirmed|not confirmed/i.test(authError.message)
      setNeedsConfirm(unconfirmed)
      setError(
        unconfirmed
          ? 'Your email is not confirmed yet. Check your inbox, or resend the link below.'
          : authError.message === 'Invalid login credentials'
            ? 'That email and password combination did not work.'
            : authError.message
      )
      setLoading(false)
      return
    }

    window.location.assign(next)
  }

  const resend = async () => {
    const supabase = createClient()
    const { error: resendError } = await supabase.auth.resend({ type: 'signup', email })
    setResent(!resendError)
    if (resendError) setError(resendError.message)
  }

  return (
    <AuthPanel
      title="Welcome back"
      subtitle="Sign in to your Evolved Tech workspace."
      footer={
        <>
          No account yet?{' '}
          <Link href="/register" className="text-[#00A3FF] hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <GoogleButton />

      <div className="my-6 flex items-center gap-4">
        <span className="h-px flex-1 bg-white/[0.08]" />
        <span className="text-[10px] uppercase tracking-[0.2em] text-white/25">or</span>
        <span className="h-px flex-1 bg-white/[0.08]" />
      </div>

      <form onSubmit={submit} className="space-y-4">
        <Field
          icon={<Mail size={15} />}
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@studio.com"
          autoComplete="email"
        />
        <Field
          icon={<Lock size={15} />}
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          autoComplete="current-password"
        />

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
            <p className="text-xs text-red-300">{error}</p>
            {needsConfirm && (
              <button
                type="button"
                onClick={resend}
                className="mt-2 text-xs font-medium text-[#00A3FF] hover:underline"
              >
                {resent ? 'Confirmation email sent' : 'Resend confirmation email'}
              </button>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !email || !password}
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#00A3FF] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#0089d6] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : null}
          {loading ? 'Signing in' : 'Sign in'}
          {!loading && <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />}
        </button>
      </form>

      <div className="mt-6 flex items-center justify-between text-xs">
        <Link href="/" className="inline-flex items-center gap-1.5 text-white/35 transition-colors hover:text-white">
          <ArrowLeft size={13} />
          Back to site
        </Link>
        <span className="text-white/20">Password reset coming soon</span>
      </div>
    </AuthPanel>
  )
}

function Field({
  icon,
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  icon: ReactNode
  label: string
  type: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  autoComplete?: string
}) {
  return (
    <div>
      <label className="mb-2 block text-[10px] uppercase tracking-[0.18em] text-white/35">{label}</label>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/25">
          {icon}
        </span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
          className="w-full rounded-xl border border-white/10 bg-black/40 py-3 pl-11 pr-4 text-sm text-white outline-none transition-colors placeholder:text-white/20 focus:border-[#00A3FF]/60"
        />
      </div>
    </div>
  )
}
