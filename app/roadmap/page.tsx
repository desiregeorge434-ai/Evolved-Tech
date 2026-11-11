'use client'

import Link from 'next/link'
import { ArrowLeft, Check, Loader2, Circle } from 'lucide-react'

const PHASES = [
  {
    id: 'v1',
    era: '2025',
    title: 'Limn Engine',
    tag: 'Shipped',
    state: 'done' as const,
    summary: 'A 2D engine that fits in one file and runs anywhere a browser does.',
    items: [
      { text: 'Dual-renderer: cached static layer, live dynamic layer', done: true },
      { text: '4 FPS → 60 FPS by moving the cache out of the frame loop', done: true },
      { text: 'move.bound, fixed, destroy, camera.shake, particles', done: true },
      { text: 'One file, zero dependencies, MIT licensed', done: true },
    ],
  },
  {
    id: 'v2',
    era: '2026',
    title: 'Limn Studio',
    tag: 'Shipped',
    state: 'done' as const,
    summary: 'The editor and the arcade — somewhere to make games, somewhere to put them.',
    items: [
      { text: 'Browser editor with templates and live preview', done: true },
      { text: 'Arcade with auto-generated thumbnails', done: true },
      { text: 'Profiles, permanent usernames, follows', done: true },
      { text: 'Weekly leaderboard, comments and replies', done: true },
    ],
  },
  {
    id: 'v3',
    era: 'Next',
    title: 'Limn 3D',
    tag: 'In development',
    state: 'active' as const,
    summary: 'The same philosophy, one dimension up. No dates — it ships when it is real.',
    items: [
      { text: 'Core scene and camera primitives', done: false },
      { text: 'One-file import, same as 2D', done: false },
      { text: 'Shared tooling with Limn Studio', done: false },
      { text: 'Browser-first, no build step', done: false },
    ],
  },
]

export default function RoadmapPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 lg:px-10 lg:py-16">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-white/40 transition-colors hover:text-white"
      >
        <ArrowLeft size={13} />
        Back
      </Link>

      <p className="mt-8 text-[11px] uppercase tracking-[0.24em] text-[#00A3FF]">Roadmap</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
        Every version is the last one, improved.
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/50 md:text-base">
        Evolved Tech started with a 2D engine built on a borrowed laptop. What we learned there is
        the reason we are moving into 3D — not a pivot, a continuation.
      </p>

      <div className="mt-14 space-y-4">
        {PHASES.map((phase) => {
          const Icon = phase.state === 'done' ? Check : phase.state === 'active' ? Loader2 : Circle
          return (
            <div
              key={phase.id}
              className={`rounded-2xl border p-6 md:p-8 ${
                phase.state === 'active'
                  ? 'border-[#00A3FF]/30 bg-[#00A3FF]/[0.05]'
                  : 'border-white/8 bg-white/[0.02]'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      phase.state === 'active'
                        ? 'bg-[#00A3FF]/15 text-[#00A3FF]'
                        : 'bg-emerald-400/10 text-emerald-300'
                    }`}
                  >
                    <Icon size={14} className={phase.state === 'active' ? 'animate-spin' : ''} />
                  </span>
                  <div>
                    <h2 className="text-lg font-semibold">{phase.title}</h2>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">{phase.era}</p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-wider ${
                    phase.state === 'active'
                      ? 'bg-[#00A3FF]/15 text-[#00A3FF]'
                      : 'bg-emerald-400/10 text-emerald-300'
                  }`}
                >
                  {phase.tag}
                </span>
              </div>

              <p className="mt-5 text-sm leading-relaxed text-white/55">{phase.summary}</p>

              <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                {phase.items.map((item) => (
                  <li key={item.text} className="flex items-start gap-2.5 text-xs text-white/50">
                    <span
                      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                        item.done ? 'bg-emerald-400/15 text-emerald-300' : 'bg-white/8 text-white/30'
                      }`}
                    >
                      {item.done ? <Check size={10} /> : <span className="h-1 w-1 rounded-full bg-current" />}
                    </span>
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>

      <div className="mt-14 rounded-2xl border border-white/8 bg-white/[0.02] p-6">
        <h3 className="text-sm font-semibold">How we decide what ships</h3>
        <p className="mt-2 text-sm leading-relaxed text-white/50">
          Not by writing a roadmap and following it religiously. By using our own tools until
          something is missing, then building that. Every feature in Limn Studio came from that
          process — the roadmap is a record of it, not a promise about it.
        </p>
      </div>
    </div>
  )
}
