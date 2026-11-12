'use client'

import { useEffect, useState } from 'react'
import { User, Building2, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'workspace', label: 'Workspace', icon: Building2 },
] as const

type TabId = (typeof TABS)[number]['id']

export default function SettingsPage() {
  const [tab, setTab] = useState<TabId>('profile')
  const [email, setEmail] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ''))
  }, [])

  const save = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 lg:px-10 lg:py-14">
      <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">Settings</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Your workspace</h1>
      <p className="mt-2 text-sm text-white/45">
        Manage your account, studio details and engine credentials.
      </p>

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
                  {email ? email[0].toUpperCase() : 'E'}
                </div>
                <div>
                  <p className="text-sm font-medium">{email || 'Not signed in'}</p>
                  <p className="mt-1 text-xs text-white/35">Member since 2026</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Display name" defaultValue="Desire George" />
                <Field label="Email" defaultValue={email} />
                <Field label="Role" defaultValue="Owner" />
                <Field label="Location" defaultValue="Lagos, Nigeria" />
              </div>
            </div>
          )}

          {tab === 'workspace' && (
            <div className="space-y-4">
              <Field label="Studio name" defaultValue="Evolved Tech" />
              <Field label="Workspace slug" defaultValue="evolved-tech" />
              <Field label="Website" defaultValue="evolved-tech.vercel.app" />
              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.14em] text-white/40">
                  About
                </label>
                <textarea
                  rows={4}
                  defaultValue="Browser-first tools for people who make games. Home of Limn Engine."
                  className="w-full resize-none rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[#00A3FF]/60"
                />
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center gap-3 border-t border-white/5 pt-6">
            <button
              onClick={save}
              className="inline-flex items-center gap-2 rounded-xl bg-[#00A3FF] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0089d6]"
            >
              {saved ? <Check size={15} /> : null}
              {saved ? 'Saved' : 'Save changes'}
            </button>
            <span className="text-xs text-white/30">Changes apply to this workspace only.</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, defaultValue }: { label: string; defaultValue?: string }) {
  return (
    <div>
      <label className="mb-2 block text-xs uppercase tracking-[0.14em] text-white/40">{label}</label>
      <input
        defaultValue={defaultValue}
        className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-[#00A3FF]/60"
      />
    </div>
  )
}
