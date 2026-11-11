'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Gamepad2, PenTool, Boxes, Circle } from 'lucide-react'
import { CinematicIntro } from '@/components/CinematicIntro'
import { SpaceBackground } from '@/components/SpaceBackground'

const STAGES = [
  {
    era: '2025',
    tag: 'Shipped',
    title: 'Limn Engine',
    body: 'One file. No npm, no build step. Born on a Toshiba with 4GB of RAM and offline W3Schools. A dual-renderer took it from 4 FPS to 60.',
    status: 'done' as const,
  },
  {
    era: '2026',
    tag: 'Shipped',
    title: 'Limn Studio',
    body: 'The editor where you build, the arcade where you publish. Profiles, leaderboards, comments — a place for games to live.',
    status: 'done' as const,
  },
  {
    era: 'Next',
    tag: 'In development',
    title: 'Limn 3D',
    body: 'The same philosophy, one dimension up. Common outcomes as functions. The hard parts made invisible.',
    status: 'next' as const,
  },
]

const PRODUCTS = [
  {
    icon: Gamepad2,
    title: 'Play the arcade',
    body: 'Games built by the community, running in your browser.',
    href: 'https://limn-engine-doc.vercel.app/arcade',
  },
  {
    icon: PenTool,
    title: 'Open the editor',
    body: 'Write a game, publish it, share the link. In one tab.',
    href: 'https://limn-engine-doc.vercel.app/editor',
  },
  {
    icon: Boxes,
    title: 'Read the docs',
    body: 'Beginner guides through to engine internals.',
    href: 'https://limn-engine-doc.vercel.app',
  },
]

const STATS = [
  { value: '1', label: 'file to ship' },
  { value: '0', label: 'dependencies' },
  { value: '60', label: 'FPS target' },
  { value: 'MIT', label: 'licensed' },
]

const CSS = `
@keyframes floatY { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-10px) } }
@keyframes spinSlow { to { transform: rotate(360deg) } }
@keyframes glowPulse { 0%,100% { opacity:.35; transform:scale(1) } 50% { opacity:.75; transform:scale(1.1) } }
@keyframes driftA { 0% { transform: translate3d(0,0,0) scale(1) } 50% { transform: translate3d(5%,-4%,0) scale(1.12) } 100% { transform: translate3d(0,0,0) scale(1) } }
@keyframes driftB { 0% { transform: translate3d(0,0,0) scale(1.05) } 50% { transform: translate3d(-4%,3%,0) scale(.95) } 100% { transform: translate3d(0,0,0) scale(1.05) } }
@keyframes riseIn { from { opacity:0; transform: translateY(20px) } to { opacity:1; transform: translateY(0) } }

.anim-float { animation: floatY 6s ease-in-out infinite; }
.anim-spin { animation: spinSlow 26s linear infinite; }
.anim-glow { animation: glowPulse 5.5s ease-in-out infinite; }
.rise { opacity: 0; animation: riseIn .9s cubic-bezier(.22,1,.36,1) forwards; }

.hero-aurora {
  position: absolute; inset: -25%;
  background:
    radial-gradient(36% 40% at 20% 26%, rgba(0,163,255,.30), transparent 62%),
    radial-gradient(32% 36% at 80% 20%, rgba(124,92,255,.24), transparent 64%),
    radial-gradient(46% 46% at 54% 84%, rgba(0,163,255,.18), transparent 66%);
  filter: blur(34px);
  animation: driftA 20s ease-in-out infinite;
}
.hero-aurora-2 {
  position: absolute; inset: -25%;
  background: radial-gradient(30% 34% at 68% 62%, rgba(255,92,200,.16), transparent 66%);
  filter: blur(40px);
  animation: driftB 26s ease-in-out infinite;
}
.hero-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(to right, rgba(255,255,255,.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255,255,255,.05) 1px, transparent 1px);
  background-size: 64px 64px;
  mask-image: radial-gradient(ellipse 70% 60% at 50% 42%, #000 35%, transparent 78%);
  -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 42%, #000 35%, transparent 78%);
}
`

export default function Home() {
  const [showIntro, setShowIntro] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [bgReady, setBgReady] = useState(false)
  const [quality, setQuality] = useState<'full' | 'low'>('full')

  useEffect(() => {
    setMounted(true)
    const lowPower = window.innerWidth < 820 || (navigator as Navigator & { deviceMemory?: number }).deviceMemory === 2
    setQuality(lowPower ? 'low' : 'full')

    if (!sessionStorage.getItem('hasSeenIntro')) {
      setShowIntro(true)
    } else {
      setBgReady(true)
    }
  }, [])

  const handleIntroComplete = () => {
    sessionStorage.setItem('hasSeenIntro', 'true')
    setShowIntro(false)
    setBgReady(true)
  }

  if (!mounted) return null

  return (
    <>
      {showIntro && <CinematicIntro onComplete={handleIntroComplete} />}

      <div className="relative overflow-hidden bg-[#05060a]">
        <style>{CSS}</style>

        <section className="relative min-h-screen">
          <div className="hero-aurora" />
          <div className="hero-aurora-2" />
          {bgReady && <SpaceBackground quality={quality} />}
          <div className="absolute inset-0 bg-[#05060a]/58" />
          <div className="hero-grid" />

          <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-24 lg:px-10">
            <div className="relative mb-9 rise">
              <div className="relative inline-flex h-24 w-24 items-center justify-center md:h-28 md:w-28">
                <span className="anim-glow absolute inset-0 rounded-full bg-[#00A3FF]/25 blur-2xl" />
                <span className="anim-spin absolute inset-[-12px] rounded-full border border-dashed border-[#00A3FF]/25" />
                <img
                  src="/logo.png"
                  alt="Evolved Tech"
                  className="anim-float relative h-20 w-20 object-contain drop-shadow-[0_0_24px_rgba(0,163,255,0.55)] md:h-24 md:w-24"
                />
              </div>
            </div>

            <div
              className="rise mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-3.5 py-1.5 backdrop-blur-md"
              style={{ animationDelay: '90ms' }}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00A3FF] opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#00A3FF]" />
              </span>
              <span className="text-[11px] uppercase tracking-[0.22em] text-white/70">
                Now building in three dimensions
              </span>
            </div>

            <h1
              className="rise max-w-3xl text-5xl font-extrabold leading-[0.94] tracking-tight md:text-7xl"
              style={{ animationDelay: '160ms' }}
            >
              We drew a 2D engine.
              <br />
              <span className="bg-gradient-to-r from-white via-[#cfe9ff] to-[#00A3FF] bg-clip-text text-transparent">
                Now we&apos;re drawing deeper.
              </span>
            </h1>

            <p
              className="rise mt-7 max-w-xl text-base leading-relaxed text-white/55 md:text-lg"
              style={{ animationDelay: '240ms' }}
            >
              Evolved Tech builds engines that evolve. Limn Engine was our first — one file, zero
              dependencies, shipped from a Toshiba with 4GB of RAM. It is not where we stop.
            </p>

            <div
              className="rise mt-10 flex flex-col gap-3 sm:flex-row"
              style={{ animationDelay: '320ms' }}
            >
              <a
                href="https://limn-engine-doc.vercel.app/arcade"
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#00A3FF] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_0_30px_rgba(0,163,255,0.35)] transition-all hover:bg-[#0089d6] hover:shadow-[0_0_44px_rgba(0,163,255,0.5)]"
              >
                Play what people built
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </a>
              <Link
                href="/roadmap"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/14 bg-white/[0.04] px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/10"
              >
                See the roadmap
              </Link>
            </div>

            <div
              className="rise mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] sm:grid-cols-4"
              style={{ animationDelay: '400ms' }}
            >
              {STATS.map((s) => (
                <div key={s.label} className="bg-[#05060a]/80 p-5 backdrop-blur-md">
                  <p className="text-2xl font-semibold text-white">{s.value}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-white/40">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative border-t border-white/5 bg-[#05060a] px-6 py-24 lg:px-10">
          <div className="mx-auto max-w-6xl">
            <p className="text-[11px] uppercase tracking-[0.24em] text-[#00A3FF]">The evolution</p>
            <h2 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight md:text-5xl">
              We are not done at two dimensions.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/50 md:text-base">
              Limn Engine taught us the shape of the problem: make the common thing a function, make
              the hard thing invisible. That lesson does not stop at a flat plane.
            </p>

            <div className="mt-14 grid gap-4 md:grid-cols-3">
              {STAGES.map((s) => (
                <div
                  key={s.title}
                  className={`relative rounded-2xl border p-6 transition-colors ${
                    s.status === 'next'
                      ? 'border-[#00A3FF]/30 bg-[#00A3FF]/[0.06]'
                      : 'border-white/8 bg-white/[0.02] hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.22em] text-white/35">{s.era}</span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wider ${
                        s.status === 'next'
                          ? 'bg-[#00A3FF]/15 text-[#00A3FF]'
                          : 'bg-emerald-400/10 text-emerald-300'
                      }`}
                    >
                      {s.tag}
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-white/45">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative border-t border-white/5 bg-[#03040a] px-6 py-24 lg:px-10">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Limn Engine, today</h2>
              <a
                href="https://limn-engine-doc.vercel.app"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-[#00A3FF] hover:underline"
              >
                limn-engine-doc.vercel.app
                <ArrowUpRight size={14} />
              </a>
            </div>

            <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] md:grid-cols-3">
              {PRODUCTS.map((p) => {
                const Icon = p.icon
                return (
                  <a
                    key={p.title}
                    href={p.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group bg-[#05060a]/80 p-7 backdrop-blur-md transition-colors hover:bg-[#080b12]"
                  >
                    <Icon
                      size={18}
                      className="text-[#00A3FF] transition-transform duration-500 group-hover:scale-110"
                    />
                    <h3 className="mt-4 flex items-center gap-1.5 text-sm font-semibold">
                      {p.title}
                      <ArrowUpRight
                        size={13}
                        className="text-white/25 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-white/45">{p.body}</p>
                  </a>
                )
              })}
            </div>
          </div>
        </section>

        <section className="relative border-t border-white/5 px-6 py-24 lg:px-10">
          <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
            <Circle size={10} className="fill-[#00A3FF] text-[#00A3FF]" />
            <h2 className="mt-6 text-3xl font-bold tracking-tight md:text-5xl">
              The third dimension is already in the render queue.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/50 md:text-base">
              We are building Limn 3D on the same principle: the things you write in every project
              become functions, and the hard parts disappear.
            </p>
            <Link
              href="/roadmap"
              className="mt-9 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-black transition-colors hover:bg-white/90"
            >
              Follow the build
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
