'use client'

import Link from 'next/link'
import { ArrowUpRight, ArrowRight } from 'lucide-react'
import { ImageSlot } from '@/components/ImageSlot'

const FEATURES = [
  ['Display', 'Canvas, game loop, keyboard, mouse and touch input'],
  ['Component', 'Rect, image and text objects with built-in physics'],
  ['Camera', 'Follow, smooth follow, zoom, shake, rotation shake'],
  ['Particles', 'Emit, burst, emitters and six built-in presets'],
  ['TileMap', 'Grid-based levels with runtime tile editing'],
  ['AnimatedSprite', 'Spritesheet animation with named clips'],
  ['SoundManager', 'Effects, music, per-channel volume, mute'],
]

export default function ProductsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16 lg:px-8 lg:py-24">
      <p className="text-[10px] uppercase tracking-[0.28em] text-[#00A3FF]">Products</p>
      <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
        One engine, and everything around it.
      </h1>
      <p className="mt-6 max-w-2xl text-sm leading-relaxed text-white/50 md:text-base">
        Limn is the engine. Studio is where you build with it. The arcade is where the results live.
        The third product is still being written.
      </p>

      <section className="mt-20 border-t border-white/[0.06] pt-14">
        <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-start">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Limn Engine</h2>
              <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[10px] uppercase tracking-wider text-emerald-300">
                Shipped
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/50">
              A zero-config 2D engine for the browser, built on HTML5 Canvas. One file —
              <code className="mx-1 rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[11px] text-white/70">epic.js</code>
              — no npm, no build step, no configuration. Fourth generation, MIT licensed.
            </p>

            <dl className="mt-8 divide-y divide-white/[0.06]">
              {FEATURES.map(([name, desc]) => (
                <div key={name} className="grid gap-1 py-3 md:grid-cols-[130px_1fr] md:gap-6">
                  <dt className="font-mono text-xs text-[#00A3FF]">{name}</dt>
                  <dd className="text-xs leading-relaxed text-white/45">{desc}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="https://limn-engine-doc.vercel.app"
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-1.5 text-sm text-white/70 transition-colors hover:text-white"
              >
                Documentation
                <ArrowUpRight size={14} className="text-white/30" />
              </a>
              <a
                href="https://limn-engine-doc.vercel.app/asset/epic.js"
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-1.5 text-sm text-white/70 transition-colors hover:text-white"
              >
                Download epic.js
                <ArrowUpRight size={14} className="text-white/30" />
              </a>
            </div>
          </div>

          <ImageSlot
            src="/images/limn-engine.png"
            alt="Limn Engine running a game"
            label="Engine screenshot"
            ratio="aspect-[4/3]"
          />
        </div>
      </section>

      <section className="mt-20 border-t border-white/[0.06] pt-14">
        <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-start">
          <ImageSlot
            src="/images/limn-studio.png"
            alt="Limn Studio editor"
            label="Studio screenshot"
            ratio="aspect-[4/3]"
          />
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Limn Studio</h2>
              <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[10px] uppercase tracking-wider text-emerald-300">
                Shipped
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/50">
              The editor you build games in and the arcade you publish them to. Write code in the
              browser, preview live, ship a link. Profiles, follows, a weekly leaderboard, comments
              and replies — the parts that turn a demo into a place.
            </p>

            <div className="mt-8 flex flex-col gap-1">
              {[
                { label: 'Open the editor', href: 'https://limn-engine-doc.vercel.app/editor' },
                { label: 'Browse the arcade', href: 'https://limn-engine-doc.vercel.app/arcade' },
                { label: 'Weekly leaderboard', href: 'https://limn-engine-doc.vercel.app/arcade/leaderboard.html' },
              ].map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-between border-b border-white/[0.06] py-3.5 text-sm text-white/60 transition-colors hover:text-white"
                >
                  {l.label}
                  <ArrowUpRight
                    size={14}
                    className="text-white/20 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#00A3FF]"
                  />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-20 border-t border-white/[0.06] pt-14">
        <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-start">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Limn 3D</h2>
              <span className="rounded-full bg-[#00A3FF]/15 px-2.5 py-1 text-[10px] uppercase tracking-wider text-[#00A3FF]">
                In development
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/50">
              The same principle, one dimension up: the things you write in every project become
              functions, and the hard parts disappear. Browser-first, one file, no build step — the
              constraints that made the 2D engine good are the constraints we are keeping.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-white/35">
              No release date. It ships when it is real.
            </p>
            <Link
              href="/roadmap"
              className="group mt-8 inline-flex items-center gap-2 text-sm text-[#00A3FF]"
            >
              See where it is
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <ImageSlot
            src="/images/limn-3d.png"
            alt="Limn 3D early preview"
            label="3D preview"
            ratio="aspect-[4/3]"
          />
        </div>
      </section>
    </div>
  )
}
