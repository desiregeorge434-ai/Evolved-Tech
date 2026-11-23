'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Building2, Check, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  getProfile,
  updateProfile,
  type Profile,
  type ProfileUpdate,
} from '@/lib/supabase/profile'

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'account', label: 'Account', icon: Building2 },
] as const

type TabId = (typeof TABS)[number]['id']

export default function SettingsPage() {
  const router = useRouter()
  const [tab, setTab] = useState<TabId>('profile')
  const [email, setEmail] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState<ProfileUpdate>({})

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: auth }) => {
      if (!auth.user) {
        router.replace('/login?next=/dashboard/settings')
        return
      }
      setEmail(auth.user.email ?? '')
      setUserId(auth.user.id)
      const p = await getProfile(supabase, auth.user.id)
      setProfile(p)
      setForm({
        full_name: p?.full_name ?? '',
        username: p?.username ?? '',
        bio: p?.bio ?? '',
        role: p?.role ?? '',
      })
      setLoading(false)
    })
  }, [router])

  const field = (key: keyof ProfileUpdate) => ({
    value: form[key] ?? '',
    onChange: (v: string) => setForm((f) => ({ ...f, [key]: v })),
  })

  const save = async () => {
    if (!userId) return
    setSaving(true)
    setError(null)

    const supabase = createClient()
    const result = await updateProfile(supabase, userId, form)

    setSaving(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
    const fresh = await getProfile(supabase, userId)
    setProfile(fresh)
  }

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 size={18} className="animate-spin text-white/30" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 lg:px-10 lg:py-14">
      <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">Settings</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Your account</h1>
      <p className="mt-2 text-sm text-white/45">Manage your profile and account details.</p>

      <div className="mt-10 grid gap-6 lg:grid-cols-[200px_1fr]">
        <div className="flex gap-1 overflow-x-auto lg:flex-col">
          {TABS.map((t) => {
            const Icon = t.icon
            const active = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm transition-colors ${
                  active ? 'bg-white/8 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={15} className={active ? 'text-[#00A3FF]' : 'text-white/35'} />
                {t.label}
              </button>
            )
          })}
        </div>

        <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-6 md:p-8">
          {tab === 'profile' && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#00A3FF]/12 text-2xl font-bold text-[#00A3FF]">
                  {(profile?.full_name?.[0] ?? profile?.username?.[0] ?? email?.[0] ?? 'E').toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {profile?.full_name || profile?.username || email}
                  </p>
                  <p className="mt-1 text-xs text-white/35">
                    {profile?.is_verified ? 'Verified' : 'Member'} since{' '}
                    {profile?.created_at
                      ? new Date(profile.created_at).toLocaleDateString(undefined, {
                          month: 'long',
                          year: 'numeric',
                        })
                      : '—'}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" {...field('full_name')} />
                <Field label="Username" {...field('username')} />
                <Field label="Role" {...field('role')} />
                <Field label="Email" defaultValue={email} disabled />
              </div>

              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.14em] text-white/40">
                  Bio
                </label>
                <textarea
                  rows={4}
                  value={form.bio ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                  className="w-full resize-none rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[#00A3FF]/60"
                />
              </div>
            </div>
          )}

          {tab === 'account' && (
            <div className="space-y-4">
              <Field label="Email" defaultValue={email} disabled />
              <Field label="User ID" defaultValue={userId ?? ''} disabled />
              <p className="pt-2 text-xs leading-relaxed text-white/35">
                Email and user ID are managed by authentication.
              </p>
            </div>
          )}

          {error && (
            <p className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-300">
              {error}
            </p>
          )}

          <div className="mt-8 flex items-center gap-3 border-t border-white/5 pt-6">
            <button
              onClick={save}
              disabled={saving || tab !== 'profile'}
              className="inline-flex items-center gap-2 rounded-xl bg-[#00A3FF] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0089d6] disabled:opacity-60"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : saved ? <Check size={15} /> : null}
              {saving ? 'Saving' : saved ? 'Saved' : 'Save changes'}
            </button>
            <span className="text-xs text-white/30">
              {tab === 'profile' ? 'Changes save to your profile.' : 'Read-only.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  defaultValue,
  disabled,
}: {
  label: string
  value?: string
  onChange?: (v: string) => void
  defaultValue?: string
  disabled?: boolean
}) {
  return (
    <div>
      <label className="mb-2 block text-xs uppercase tracking-[0.14em] text-white/40">{label}</label>
      <input
        value={value}
        defaultValue={defaultValue}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        disabled={disabled}
        className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-[#00A3FF]/60 disabled:opacity-50"
      />
    </div>
  )
}
