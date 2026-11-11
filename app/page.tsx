'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { CinematicIntro } from '@/components/CinematicIntro'
import { AnimatedLogo } from '@/components/AnimatedLogo'

const STAGES = [
  {
    era: '2025',
    title: 'Limn Engine',
    line: 'One file, zero dependencies. A 2D engine built on a Toshiba with 4GB of RAM.',
    state: 'Shipped',
  },
  {
    era: '2026',
    title: 'Limn Studio',
    line: 'The editor to build in, the arcade to publish to. Games with somewhere to live.',
    state: 'Shipped',
  },
  {
    era: 'Next',
    title: 'Limn 3D',
    line: 'The same philosophy, one dimension up. In development, with no date attached.',
    state: 'Building',
  },
]

const LINKS = [
  { label: 'Arcade', href: 'https://limn-engine-doc.vercel.app/arcade' },
  { label: 'Editor', href: 'https://limn-engine-doc.vercel.app/editor' },
  { label: 'Documentation', href: 'https://limn-engine-doc.vercel.app' },
]

const CSS = `
@keyframes riseIn { from { opacity:0; transform: translateY(18px) } to { opacity:1; transform: translateY(0) } }
@keyframes breathe { 0%,100% { opacity:.28 } 50% { opacity:.5 } }
.rise { opacity: 0; animation: riseIn .85s cubic-bezier(.22,1,.36,1) forwards; }
.breathe { animation: breathe 9s ease-in-out infinite; }
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

      <div className="relative overflow-hidden bg-[#05060a]">
        <style>{CSS}</style>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[820px]"
          style={{
            background:
              'radial-gradient(46% 42% at 50% 0%, rgba(0,163,255,0.16), transparent 70%), radial-gradient(30% 30% at 82% 18%, rgba(124,92,255,0.10), transparent 72%)',
          }}
        />
        <div
          aria-hidden="true"
          className="breathe pointer-events-none absolute left-1/2 top-[-180px] h-[560px] w-[560px] -translate-x-1/2 rounded-full blur-[120px]"
          style={{ background: 'radial-gradient(circle, rgba(0,163,255,0.22), transparent 65%)' }}
        />

        <section className="relative">
          <div className="mx-auto flex min-h-[92vh] max-w-5xl flex-col items-center justify-center px-6 py-28 text-center lg:px-8">
            <AnimatedLogo />

            <div
              className="rise mt-12 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.03] px-4 py-1.5"
              style={{ animationDelay: '520ms' }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#00A3FF]" />
              <span className="text-[10px] uppercase tracking-[0.26em] text-white/60">
                Building in three dimensions
              </span>
            </div>

            <h1
              className="rise mt-8 max-w-4xl text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-5xl md:text-7xl"
              style={{ animationDelay: '600ms' }}
            >
              We drew a 2D engine.
              <br />
              <span className="bg-gradient-to-r from-white via-[#cfe9ff] to-[#00A3FF] bg-clip-text text-transparent">
                Now we&apos;re drawing deeper.
              </span>
            </h1>

            <p
              className="rise mt-8 max-w-xl text-sm leading-relaxed text-white/50 md:text-base"
              style={{ animationDelay: '680ms' }}
            >
              Evolved Tech builds engines that evolve. Limn Engine was our first. It is not where
              we stop.
            </p>

            <div
              className="rise mt-11 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row"
              style={{ animationDelay: '760ms' }}
            >
              <a
                href="https://limn-engine-doc.vercel.app/arcade"
                target="_blank"
                rel="noreferrer"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-black transition-colors hover:bg-white/90 sm:w-auto"
              >
                Play what people built
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </a>
              <Link
                href="/roadmap"
                className="inline-flex w-full items-center justify-center rounded-full border border-white/14 px-8 py-3.5 text-sm font-semibold text-white/80 transition-colors hover:bg-white/5 hover:text-white sm:w-auto"
              >
                See the roadmap
              </Link>
            </div>
          </div>
        </section>

        <section className="relative border-t border-white/[0.06]">
          <div className="mx-auto max-w-5xl px-6 py-24 lg:px-8">
            <p className="text-[10px] uppercase tracking-[0.28em] text-white/35">The evolution</p>

            <div className="mt-12 divide-y divide-white/[0.06]">
              {STAGES.map((s, i) => (
                <div
                  key={s.title}
                  className="grid grid-cols-1 items-baseline gap-2 py-8 md:grid-cols-[100px_1fr_auto] md:gap-8"
                >
                  <span className="text-xs uppercase tracking-[0.2em] text-white/30">{s.era}</span>
                  <div>
                    <h2 className={`text-2xl font-semibold tracking-tight ${i === 2 ? 'text-white' : 'text-white/85'}`}>
                      {s.title}
                    </h2>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/45">{s.line}</p>
                  </div>
                  <span
                    className={`text-[10px] uppercase tracking-[0.2em] ${
                      s.state === 'Building' ? 'text-[#00A3FF]' : 'text-white/30'
                    }`}
                  >
                    {s.state}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative border-t border-white/[0.06]">
          <div className="mx-auto grid max-w-5xl gap-10 px-6 py-24 md:grid-cols-[1.1fr_0.9fr] lg:px-8">
            <div>
              <h2 className="max-w-md text-3xl font-bold leading-tight tracking-tight md:text-4xl">
                Not done at two dimensions.
              </h2>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-white/45">
                Limn taught us the shape of the problem: make the common thing a function, make the
                hard thing invisible. That lesson does not stop at a flat plane.
              </p>
            </div>

            <div className="flex flex-col justify-end gap-1">
              {LINKS.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-between border-b border-white/[0.06] py-4 text-sm text-white/60 transition-colors hover:text-white"
                >
                  {l.label}
                  <ArrowUpRight
                    size={15}
                    className="text-white/20 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#00A3FF]"
                  />
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="relative border-t border-white/[0.06]">
          <div className="mx-auto flex max-w-3xl flex-col items-center px-6 py-24 text-center lg:px-8">
            <h2 className="text-2xl font-semibold leading-snug tracking-tight md:text-4xl">
              The third dimension is already in the render queue.
            </h2>
            <Link
              href="/roadmap"
              className="group mt-8 inline-flex items-center gap-2 text-sm font-medium text-[#00A3FF]"
            >
              Follow the build
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
