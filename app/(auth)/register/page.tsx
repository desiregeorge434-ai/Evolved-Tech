'use client'

import { useState, type FormEvent, type ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Loader2, Mail, Lock, User, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { AuthPanel } from '@/components/AuthPanel'
import { GoogleButton } from '@/components/GoogleButton'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Use at least 8 characters for your password.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo:
          typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : undefined,
      },
    })

    if (authError) {
      setError(
        authError.message.includes('already registered')
          ? 'That email already has an account. Try signing in instead.'
          : authError.message
      )
      setLoading(false)
      return
    }

    if (data.session) {
      router.push('/dashboard')
      router.refresh()
      return
    }

    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <AuthPanel
        title="Check your inbox"
        subtitle="One more step."
        footer={
          <>
            Wrong address?{' '}
            <button onClick={() => setSent(false)} className="text-[#00A3FF] hover:underline">
              Use another email
            </button>
          </>
        }
      >
        <div className="rounded-xl border border-[#00A3FF]/20 bg-[#00A3FF]/[0.06] p-5">
          <CheckCircle2 size={18} className="text-[#00A3FF]" />
          <p className="mt-3 text-sm leading-relaxed text-white/70">
            We sent a confirmation link to <span className="text-white">{email}</span>. Click it and
            your account is live.
          </p>
          <p className="mt-2 text-xs leading-relaxed text-white/35">
            Nothing after a minute? Check spam, or confirm your Supabase project has email sign-ups
            enabled.
          </p>
        </div>
      </AuthPanel>
    )
  }

  return (
    <AuthPanel
      title="Create your account"
      subtitle="Free, and the engine stays free."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="text-[#00A3FF] hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <GoogleButton label="Sign up with Google" />

      <div className="my-6 flex items-center gap-4">
        <span className="h-px flex-1 bg-white/[0.08]" />
        <span className="text-[10px] uppercase tracking-[0.2em] text-white/25">or</span>
        <span className="h-px flex-1 bg-white/[0.08]" />
      </div>

      <form onSubmit={submit} className="space-y-4">
        <Field
          icon={<User size={15} />}
          label="Display name"
          type="text"
          value={name}
          onChange={setName}
          placeholder="Desire"
          autoComplete="name"
        />
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
          placeholder="At least 8 characters"
          autoComplete="new-password"
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
          {loading ? 'Creating account' : 'Create account'}
          {!loading && <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />}
        </button>
      </form>

      <Link
        href="/"
        className="mt-5 inline-flex items-center gap-1.5 text-xs text-white/35 transition-colors hover:text-white"
      >
        <ArrowLeft size={13} />
        Back to site
      </Link>
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
