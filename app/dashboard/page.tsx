'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowUpRight,
  Gamepad2,
  Users,
  Heart,
  MessageSquare,
  Settings as SettingsIcon,
  Loader2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { loadLimnOverview, arcadeUrl, type LimnOverview } from '@/lib/limn'

export default function DashboardPage() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)
  const [data, setData] = useState<LimnOverview | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: auth }) => {
      if (!auth.user) {
        router.replace('/login?next=/dashboard')
        return
      }
      setEmail(auth.user.email ?? null)
      setChecking(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) router.replace('/login?next=/dashboard')
    })

    return () => sub.subscription.unsubscribe()
  }, [router])

  useEffect(() => {
    let cancelled = false
    loadLimnOverview()
      .then((overview) => {
        if (!cancelled) setData(overview)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (checking) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 size={18} className="animate-spin text-white/30" />
      </div>
    )
  }

  const stats = [
    { label: 'Games published', value: data?.games, icon: Gamepad2 },
    { label: 'Creators', value: data?.creators, icon: Users },
    { label: 'Likes', value: data?.likes, icon: Heart },
    { label: 'Comments', value: data?.comments, icon: MessageSquare },
  ]

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 lg:px-10 lg:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">Workspace</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            {email ? `Welcome back, ${email.split('@')[0]}` : 'Welcome back'}
          </h1>
          <p className="mt-2 text-sm text-white/40">
            Live activity from Limn Engine — the engine you signed in to.
          </p>
        </div>
        <Link
          href="/dashboard/settings"
          className="inline-flex items-center gap-2 rounded-xl border border-white/12 px-4 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
        >
          <SettingsIcon size={15} />
          Settings
        </Link>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/40">{s.label}</p>
                <Icon size={15} className="text-[#00A3FF]" />
              </div>
              <p className="mt-4 text-2xl font-semibold tabular-nums">
                {failed ? '—' : s.value === undefined ? '···' : s.value.toLocaleString()}
              </p>
            </div>
          )
        })}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-6 backdrop-blur-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Recently published</h2>
            <a
              href={arcadeUrl()}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-[#00A3FF] hover:underline"
            >
              Open arcade <ArrowUpRight size={12} />
            </a>
          </div>

          <div className="mt-5 divide-y divide-white/5">
            {!data && !failed && (
              <p className="py-6 text-xs text-white/30">Loading activity…</p>
            )}
            {failed && (
              <p className="py-6 text-xs text-red-300/70">
                Could not reach Limn Engine. Check the project connection.
              </p>
            )}
            {data?.recent.map((g) => (
              <a
                key={g.slug}
                href={arcadeUrl(g.slug)}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between py-3.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white/85 group-hover:text-white">{g.title}</p>
                  <p className="mt-0.5 font-mono text-[10px] text-white/30">/{g.slug}</p>
                </div>
                <time className="ml-4 shrink-0 text-[10px] uppercase tracking-wider text-white/25">
                  {new Date(g.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </time>
              </a>
            ))}
            {data && data.recent.length === 0 && !failed && (
              <p className="py-6 text-xs text-white/30">No games published yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-6 backdrop-blur-sm">
          <h2 className="text-sm font-semibold">Jump to</h2>
          <div className="mt-5 flex flex-col gap-2">
            {[
              { label: 'The arcade', href: arcadeUrl() },
              { label: 'Build a game', href: 'https://limn-engine-doc.vercel.app/editor/' },
              { label: 'Engine docs', href: 'https://limn-engine-doc.vercel.app/tutorial.html' },
              { label: 'Roadmap', href: '/roadmap' },
            ].map((a) => (
              <a
                key={a.label}
                href={a.href}
                target={a.href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                className="flex items-center justify-between rounded-xl border border-white/8 px-4 py-3 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
              >
                {a.label}
                <ArrowUpRight size={14} className="text-white/30" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
