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

      <div className="relative min-h-screen overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/videos/bg-video.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-[#05060a]/72" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05060a] via-transparent to-[#05060a]/60" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />

        <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-24 lg:px-10">
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00A3FF]" />
            <span className="text-[11px] uppercase tracking-[0.22em] text-white/70">
              Limn Engine · v1
            </span>
          </div>

          <h1 className="max-w-3xl text-5xl font-extrabold leading-[0.95] tracking-tight md:text-7xl">
            Draw your game
            <br />
            <span className="bg-gradient-to-r from-white via-[#cfe9ff] to-[#00A3FF] bg-clip-text text-transparent">
              into existence.
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-base leading-relaxed text-white/60 md:text-lg">
            Evolved Tech builds browser-first tools for people who make games. Start with an idea,
            finish with something playable.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/dashboard"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#00A3FF] px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#0089d6]"
            >
              Open dashboard
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/10"
            >
              Sign in
            </Link>
          </div>

          <div className="mt-20 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/5 sm:grid-cols-3">
            {FEATURES.map((f) => {
              const Icon = f.icon
              return (
                <div key={f.title} className="bg-[#05060a]/70 p-6 backdrop-blur-md">
                  <Icon size={18} className="text-[#00A3FF]" />
                  <h3 className="mt-4 text-sm font-semibold">{f.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-white/50">{f.body}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
