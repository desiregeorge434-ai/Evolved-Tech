'use client'

import { Mail, MessageCircle, Github, MapPin, ArrowUpRight } from 'lucide-react'
import { ImageSlot } from '@/components/ImageSlot'

const CHANNELS = [
  {
    icon: Mail,
    label: 'Email',
    value: 'evolvedtech004@gmail.com',
    href: 'mailto:evolvedtech004@gmail.com',
    note: 'Best for partnerships, press and anything long-form.',
  },
  {
    icon: MessageCircle,
    label: 'Discord',
    value: 'Join the community',
    href: 'https://discord.gg/ZqnUtTQb8',
    note: 'Where the builders are. Games, help, engine talk.',
  },
  {
    icon: Github,
    label: 'GitHub',
    value: 'terracodes004',
    href: 'https://github.com/terracodes004',
    note: 'The engine, the docs, and the pieces in between.',
  },
]

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16 lg:px-8 lg:py-24">
      <p className="text-[10px] uppercase tracking-[0.28em] text-[#00A3FF]">Contact</p>
      <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
        Say something.
      </h1>
      <p className="mt-6 max-w-xl text-sm leading-relaxed text-white/50 md:text-base">
        Bug reports, feature ideas, games you built, or a reason we should be building this
        differently. All of it is welcome.
      </p>

      <div className="mt-14 divide-y divide-white/[0.06] border-y border-white/[0.06]">
        {CHANNELS.map((c) => {
          const Icon = c.icon
          return (
            <a
              key={c.label}
              href={c.href}
              target={c.href.startsWith('mailto') ? undefined : '_blank'}
              rel="noreferrer"
              className="group flex items-start gap-5 py-7 transition-colors"
            >
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/50 transition-colors group-hover:border-[#00A3FF]/40 group-hover:text-[#00A3FF]">
                <Icon size={15} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/30">{c.label}</p>
                <p className="mt-1.5 truncate text-sm font-medium text-white/85 transition-colors group-hover:text-white">
                  {c.value}
                </p>
                <p className="mt-1 text-xs text-white/35">{c.note}</p>
              </div>
              <ArrowUpRight
                size={15}
                className="mt-1 shrink-0 text-white/15 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#00A3FF]"
              />
            </a>
          )
        })}
      </div>

      <div className="mt-14 flex items-center gap-3 text-sm text-white/40">
        <MapPin size={15} className="text-white/30" />
        Lagos, Nigeria — building for the open web
      </div>

      <div className="mt-14 grid gap-4 md:grid-cols-2">
        <ImageSlot src="/images/office.jpg" alt="Where we work" label="Office / studio" ratio="aspect-[4/3]" />
        <ImageSlot src="/images/team-2.jpg" alt="Evolved Tech at work" label="Team" ratio="aspect-[4/3]" />
      </div>
    </div>
  )
}
