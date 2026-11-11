'use client'

import type { ReactNode } from 'react'

type Props = {
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
}

export function AuthPanel({ title, subtitle, children, footer }: Props) {
  return (
    <div className="flex min-h-screen bg-[#05060a] text-white">
      <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden border-r border-white/[0.06] p-12 lg:flex">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(50% 40% at 20% 10%, rgba(0,163,255,0.18), transparent 65%), radial-gradient(40% 40% at 85% 80%, rgba(124,92,255,0.12), transparent 70%)',
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
            backgroundSize: '56px 56px',
          }}
        />

        <div className="relative flex items-center gap-3">
          <img src="/logo.png" alt="Evolved Tech" className="h-9 w-9 object-contain" />
          <span className="text-sm font-semibold tracking-tight">Evolved Tech</span>
        </div>

        <div className="relative">
          <p className="max-w-sm text-2xl font-semibold leading-snug tracking-tight text-white/85">
            We drew a 2D engine. Now we&apos;re drawing deeper.
          </p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/40">
            Limn Engine is the fourth generation of a tool built on a borrowed laptop. One file, no
            build step, free forever.
          </p>
        </div>

        <p className="relative text-[10px] uppercase tracking-[0.24em] text-white/20">
          Lagos, Nigeria
        </p>
      </aside>

      <div className="flex w-full items-center justify-center px-6 py-16 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <img src="/logo.png" alt="Evolved Tech" className="h-9 w-9 object-contain" />
            <span className="text-sm font-semibold tracking-tight">Evolved Tech</span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
          <p className="mt-2 text-sm text-white/40">{subtitle}</p>

          <div className="mt-8">{children}</div>

          {footer && <div className="mt-8 text-xs text-white/40">{footer}</div>}
        </div>
      </div>
    </div>
  )
}
