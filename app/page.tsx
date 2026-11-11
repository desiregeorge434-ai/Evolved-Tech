'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Sparkles, Layers, Cpu } from 'lucide-react'
import { CinematicIntro } from '@/components/CinematicIntro'

const FEATURES = [
  {
    icon: Cpu,
    title: 'Limn Engine',
    body: 'A browser-first runtime. No installs, no plugins — your game runs anywhere with a URL.',
  },
  {
    icon: Layers,
    title: 'Draw, then ship',
    body: 'Sketch a mechanic, wire it up, publish it. The gap between idea and playable stays in hours.',
  },
  {
    icon: Sparkles,
    title: 'Built in Lagos',
    body: 'An independent studio shipping tools for developers across Africa and beyond.',
  },
]

const TICKER = ['LIMN ENGINE', 'BROWSER NATIVE', 'ZERO INSTALL', 'FROM LAGOS', 'GAMES FIRST']

const CSS = `
@keyframes floatY { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-10px) } }
@keyframes spinSlow { to { transform: rotate(360deg) } }
@keyframes glowPulse { 0%,100% { opacity:.35; transform:scale(1) } 50% { opacity:.75; transform:scale(1.1) } }
@keyframes driftA { 0% { transform: translate3d(0,0,0) scale(1) } 50% { transform: translate3d(5%,-4%,0) scale(1.12) } 100% { transform: translate3d(0,0,0) scale(1) } }
@keyframes driftB { 0% { transform: translate3d(0,0,0) scale(1.05) } 50% { transform: translate3d(-4%,3%,0) scale(.95) } 100% { transform: translate3d(0,0,0) scale(1.05) } }
@keyframes riseIn { from { opacity:0; transform: translateY(20px) } to { opacity:1; transform: translateY(0) } }
@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }

.anim-float { animation: floatY 6s ease-in-out infinite; }
.anim-spin { animation: spinSlow 26s linear infinite; }
.anim-glow { animation: glowPulse 5.5s ease-in-out infinite; }

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
    linear-gradient(to right, rgba(255,255,255,.055) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255,255,255,.055) 1px, transparent 1px);
  background-size: 64px 64px;
  mask-image: radial-gradient(ellipse 70% 60% at 50% 42%, #000 35%, transparent 78%);
  -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 42%, #000 35%, transparent 78%);
}
.rise { opacity: 0; animation: riseIn .9s cubic-bezier(.22,1,.36,1) forwards; }
.marquee-track { animation: marquee 26s linear infinite; }
`

export default function Home() {
  const [showIntro, setShowIntro] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (!sessionStorage.getItem('hasSeenIntro')) {
      setShowIntro(true)
    }
  }, [])

  const handleIntroComplete = () => {
    sessionStorage.setItem('hasSeenIntro', 'true')
    setShowIntro(false)
  }

  if (!mounted) return null

  return (
    <>
      {showIntro && <CinematicIntro onComplete={handleIntroComplete} />}

      <div className="relative min-h-screen overflow-hidden bg-[#05060a]">
        <style>{CSS}</style>

        <div className="hero-aurora" />
        <div className="hero-aurora-2" />
        <div className="hero-grid" />

        <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-24 lg:px-10">
          <div className="relative mb-9 rise" style={{ animationDelay: '0ms' }}>
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
              Limn Engine · live
            </span>
          </div>

          <h1
            className="rise max-w-3xl text-5xl font-extrabold leading-[0.94] tracking-tight md:text-7xl"
            style={{ animationDelay: '160ms' }}
          >
            Draw your game
            <br />
            <span className="bg-gradient-to-r from-white via-[#cfe9ff] to-[#00A3FF] bg-clip-text text-transparent">
              into existence.
            </span>
          </h1>

          <p
            className="rise mt-7 max-w-xl text-base leading-relaxed text-white/55 md:text-lg"
            style={{ animationDelay: '240ms' }}
          >
            Evolved Tech builds browser-first tools for people who make games. Start with an idea,
            finish with something playable.
          </p>

          <div
            className="rise mt-10 flex flex-col gap-3 sm:flex-row"
            style={{ animationDelay: '320ms' }}
          >
            <Link
              href="/dashboard"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#00A3FF] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_0_30px_rgba(0,163,255,0.35)] transition-all hover:bg-[#0089d6] hover:shadow-[0_0_44px_rgba(0,163,255,0.5)]"
            >
              Open dashboard
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl border border-white/14 bg-white/[0.04] px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/10"
            >
              Sign in
            </Link>
          </div>

          <div
            className="rise mt-20 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] sm:grid-cols-3"
            style={{ animationDelay: '400ms' }}
          >
            {FEATURES.map((f) => {
              const Icon = f.icon
              return (
                <div
                  key={f.title}
                  className="group bg-[#05060a]/80 p-6 backdrop-blur-md transition-colors hover:bg-[#080b12]/90"
                >
                  <Icon
                    size={18}
                    className="text-[#00A3FF] transition-transform duration-500 group-hover:scale-110"
                  />
                  <h3 className="mt-4 text-sm font-semibold">{f.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-white/45">{f.body}</p>
                </div>
              )
            })}
          </div>
        </div>

        <div className="relative z-10 border-t border-white/5 py-4">
          <div className="flex overflow-hidden">
            <div className="marquee-track flex shrink-0 items-center gap-10 pr-10">
              {[...TICKER, ...TICKER, ...TICKER, ...TICKER].map((word, i) => (
                <span
                  key={`${word}-${i}`}
                  className="whitespace-nowrap text-[10px] uppercase tracking-[0.35em] text-white/25"
                >
                  {word}
                  <span className="ml-10 text-[#00A3FF]/50">◆</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
