'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Loader2, Mail, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { AuthPanel } from '@/components/AuthPanel'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [next, setNext] = useState('/dashboard')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const target = params.get('next')
    if (target && target.startsWith('/')) setNext(target)
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(
        authError.message === 'Invalid login credentials'
          ? 'That email and password combination did not work.'
          : authError.message
      )
      setLoading(false)
      return
    }

    router.push(next)
    router.refresh()
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
          <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-300">
            {error}
          </p>
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
  icon: React.ReactNode
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
