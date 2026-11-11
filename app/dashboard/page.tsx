'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Boxes, Clock, Activity, Settings as SettingsIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const STATS = [
  { label: 'Engine status', value: 'Operational', hint: '99.98% uptime', icon: Activity },
  { label: 'Active projects', value: '3', hint: '2 published', icon: Boxes },
  { label: 'Build minutes', value: '142', hint: 'this month', icon: Clock },
]

export default function DashboardPage() {
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null))
  }, [])

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 lg:px-10 lg:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">Dashboard</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            {email ? `Welcome back, ${email.split('@')[0]}` : 'Welcome back'}
          </h1>
        </div>
        <Link
          href="/dashboard/settings"
          className="inline-flex items-center gap-2 rounded-xl border border-white/12 px-4 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
        >
          <SettingsIcon size={15} />
          Settings
        </Link>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {STATS.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.14em] text-white/40">{s.label}</p>
                <Icon size={15} className="text-[#00A3FF]" />
              </div>
              <p className="mt-4 text-2xl font-semibold">{s.value}</p>
              <p className="mt-1 text-xs text-white/35">{s.hint}</p>
            </div>
          )
        })}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Projects</h2>
            <span className="text-[11px] uppercase tracking-wider text-white/30">3 total</span>
          </div>

          <div className="mt-5 divide-y divide-white/5">
            {[
              { name: 'Limn Engine', status: 'Live', meta: 'Updated 2h ago' },
              { name: 'Neon Drift', status: 'Live', meta: 'Updated yesterday' },
              { name: 'Untitled prototype', status: 'Draft', meta: 'Updated 4d ago' },
            ].map((p) => (
              <div key={p.name} className="flex items-center justify-between py-3.5">
                <div>
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="mt-0.5 text-[11px] text-white/35">{p.meta}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wider ${
                    p.status === 'Live'
                      ? 'bg-emerald-400/10 text-emerald-300'
                      : 'bg-white/8 text-white/45'
                  }`}
                >
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-6">
          <h2 className="text-sm font-semibold">Quick actions</h2>
          <div className="mt-5 flex flex-col gap-2">
            {['New project', 'Invite teammate', 'View API keys'].map((a) => (
              <button
                key={a}
                className="flex items-center justify-between rounded-xl border border-white/8 px-4 py-3 text-left text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
              >
                {a}
                <ArrowUpRight size={14} className="text-white/30" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
