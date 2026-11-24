'use client'

import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { ImageSlot } from '@/components/ImageSlot'

const TIMELINE = [
  {
    year: '2023',
    title: 'JGame',
    body: 'A first attempt at a reusable game loop. Unpublished, unfinished, real. Built behind a sister\'s back on a Thinkpad that hung like hell, with one eye on the screen and one ear on the footsteps.',
  },
  {
    year: '2024',
    title: 'TCGame → TCJSGame',
    body: 'The tile class, the flow state, the first version that felt like an engine. Coded on a brother\'s HP—this time with permission. The fear of being caught was replaced by the fear of not shipping.',
  },
  {
    year: '2025',
    title: 'Limn Engine',
    body: 'Fourth generation. One file, zero dependencies. The breakthrough was not a feature—it was moving a Base64 cache out of the frame loop. 4 FPS became 60. A 94/100 engine built on a Toshiba with 4GB of RAM.',
  },
  {
    year: '2026',
    title: 'Limn Studio',
    body: 'The editor to build in and the arcade to publish to. Games with somewhere to live. The engine finally had a home.',
  },
  {
    year: 'Next',
    title: 'Limn 3D',
    body: 'Same philosophy, one dimension up. In development.',
  },
]

const VALUES = [
  {
    title: 'Common outcomes are functions',
    body: 'If you write it in every game, it belongs in the engine. Bounds, cameras, particles, shakes—named, not memorised.',
  },
  {
    title: 'Respect the machine',
    body: 'Built on a Toshiba with 4GB of RAM and a Tecno Pop 4 with 1GB. Nothing here assumes a fast laptop, a good connection, or a build step.',
  },
  {
    title: 'Respect your time',
    body: 'No npm, no config, no toolchain. Include one file, write JavaScript, play the game.',
  },
]

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16 lg:px-8 lg:py-24">
      <p className="text-[10px] uppercase tracking-[0.28em] text-[#00A3FF]">About</p>
      <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
        Two people. One engine. Four generations.
      </h1>
      <p className="mt-6 max-w-2xl text-sm leading-relaxed text-white/50 md:text-base">
        Evolved Tech is a game technology company in Lagos, Nigeria. We build tools that get out of
        the way—engines that evolve with the people using them.
      </p>

      <div className="mt-16 grid gap-4 md:grid-cols-2">
        <ImageSlot src="/images/team.jpg" alt="The Evolved Tech team" label="Team photo" ratio="aspect-[4/3]" />
        <ImageSlot src="/images/working.jpg" alt="Building Limn Engine" label="Studio / working" ratio="aspect-[4/3]" />
      </div>

      <section className="mt-24">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">The story</h2>
        <div className="mt-6 space-y-5 text-sm leading-relaxed text-white/55 md:text-base">
          <p>
            Limn began with a question that would not go away:
            <span className="text-white"> why do I write the same code in every game?</span>
          </p>
          <p>
            There was no laptop at first. Kehinde learned on a button phone, Googling code and
            writing it down on paper because there was nowhere to save files. When his sister got a
            Toshiba, he coded on it behind her back—closing the lid at the sound of footsteps. When
            his brother David got an HP, he was finally allowed to work without hiding. Three
            laptops. Two siblings. One engine that kept evolving because the alternative was writing
            edge detection and camera math for the hundredth time.
          </p>
          <p>
            The breakthrough was not a feature. It was finding that the engine was converting the
            entire canvas to Base64 sixty times a second. Moving that cache out of the frame loop
            took it from 4 frames per second to 60. That is the dual-renderer: draw the static world
            once, paste it every frame. Limn scored 94/100 on SitePoint and ran at full speed on a
            Tecno Pop 4 with 1GB of RAM—because respecting the machine was never optional.
          </p>
          <p className="text-white/40">
            Desire joined as co-founder to build the other half of the ecosystem: the editor, the
            arcade, the marketing, the video design, the publicity that turns a tool into a
            community. He works in Python, Three.js, and JavaScript, and is drawn to AI and
            animation. His ambition for Evolved Tech is simple and enormous—to become a company on
            the scale of Unity, and to build Limn 3D as the next step in the same philosophy.
          </p>
        </div>

        <blockquote className="mt-10 border-l-2 border-[#00A3FF]/40 pl-6">
          <p className="text-lg font-medium leading-relaxed text-white/80 md:text-xl">
            &ldquo;If you&apos;re writing it in every game, it should be a function.&rdquo;
          </p>
          <footer className="mt-3 text-xs uppercase tracking-[0.2em] text-white/30">
            The rule every line of Limn follows
          </footer>
        </blockquote>
      </section>

      <section className="mt-24">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Generations</h2>
        <div className="mt-8 divide-y divide-white/[0.06]">
          {TIMELINE.map((t) => (
            <div key={t.title} className="grid gap-2 py-6 md:grid-cols-[90px_1fr] md:gap-8">
              <span className="text-xs uppercase tracking-[0.2em] text-white/30">{t.year}</span>
              <div>
                <h3 className="text-base font-medium text-white/90">{t.title}</h3>
                <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-white/45">{t.body}</p>
              </div>
            </div>
          ))}
        </div>
        <Link
          href="/roadmap"
          className="group mt-6 inline-flex items-center gap-2 text-sm text-[#00A3FF]"
        >
          Full roadmap
          <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </section>

      <section className="mt-24">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">The people</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
            <ImageSlot
              src="/images/kehinde.jpg"
              alt="Kehinde Owolabi"
              label="Portrait"
              ratio="aspect-[4/3]"
            />
            <h3 className="mt-5 text-base font-semibold">Owolabi Kehinde</h3>
            <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[#00A3FF]">
              Founder — Engine
            </p>
            <p className="mt-3 text-sm leading-relaxed text-white/45">
              Built Limn Engine across four generations on borrowed laptops and a button phone.
              Wrote code on paper before he ever typed it. Scored 94/100 on SitePoint and still
              checks whether the thing runs on 1GB of RAM before calling it done.
            </p>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
            <ImageSlot
              src="/images/desire.jpg"
              alt="Olu Desire George"
              label="Portrait"
              ratio="aspect-[4/3]"
            />
            <h3 className="mt-5 text-base font-semibold">Olu Desire George</h3>
            <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[#00A3FF]">
              Co-founder — Product & Growth
            </p>
            <p className="mt-3 text-sm leading-relaxed text-white/45">
              Handles the marketing, video design, and publicity that turn an engine into an
              ecosystem. Works in Python, Three.js, and JavaScript, with an eye on AI and animation.
              Wants Evolved Tech to become a multibillion company like Unity—and wants Limn 3D to be
              the next thing that gets there.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-24">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">What we believe</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {VALUES.map((v) => (
            <div key={v.title} className="rounded-2xl border border-white/8 bg-white/[0.02] p-6">
              <h3 className="text-sm font-semibold">{v.title}</h3>
              <p className="mt-2.5 text-xs leading-relaxed text-white/45">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-24 flex flex-col items-start justify-between gap-6 rounded-2xl border border-white/8 bg-white/[0.02] p-8 md:flex-row md:items-center">
        <div>
          <h2 className="text-lg font-semibold">Want to work with us?</h2>
          <p className="mt-1.5 text-sm text-white/45">
            Games, tools, partnerships, or just to argue about engines.
          </p>
        </div>
        <Link
          href="/contact"
          className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-white/90"
        >
          Get in touch
          <ArrowUpRight size={15} />
        </Link>
      </section>
    </div>
  )
}
