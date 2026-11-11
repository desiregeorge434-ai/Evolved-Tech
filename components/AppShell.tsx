'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  LayoutDashboard,
  Settings,
  LogIn,
  LogOut,
  Menu,
  X,
  ArrowUpRight,
  Gamepad2,
  Milestone,
  Info,
  Boxes,
  Mail,
  type LucideIcon,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type NavItem = {
  href: string
  label: string
  icon: LucideIcon
}

const NAV: NavItem[] = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/about', label: 'About', icon: Info },
  { href: '/products', label: 'Products', icon: Boxes },
  { href: '/roadmap', label: 'Roadmap', icon: Milestone },
  { href: '/contact', label: 'Contact', icon: Mail },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    let unsubscribe = () => {}

    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null)
    })

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null)
    })
    unsubscribe = () => data.subscription.unsubscribe()

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setEmail(null)
  }

  const initial = email ? email[0].toUpperCase() : 'E'
  const bare = pathname === '/login' || pathname === '/register'

  if (bare) return <>{children}</>

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {NAV.map((item) => {
        const active = item.href === '/'
          ? pathname === '/'
          : pathname === item.href || pathname.startsWith(`${item.href}/`)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
              active
                ? 'bg-[#00A3FF]/10 text-white'
                : 'text-white/55 hover:bg-white/5 hover:text-white'
            }`}
          >
            {active && (
              <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-[#00A3FF]" />
            )}
            <Icon size={17} className={active ? 'text-[#00A3FF]' : 'text-white/40 group-hover:text-white/70'} />
            {item.label}
          </Link>
        )
      })}

      <div className="my-4 h-px bg-white/5" />

      <Link
        href="https://limn-engine-doc.vercel.app"
        target="_blank"
        rel="noreferrer"
        className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/55 transition-colors hover:bg-white/5 hover:text-white"
      >
        <Gamepad2 size={17} className="text-white/40 group-hover:text-white/70" />
        Limn Engine
        <ArrowUpRight size={13} className="ml-auto text-white/25" />
      </Link>
    </nav>
  )

  const footer = (
    <div className="mt-auto border-t border-white/5 p-3">
      {email ? (
        <div className="rounded-xl bg-white/[0.03] p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#00A3FF]/15 text-sm font-semibold text-[#00A3FF]">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-white">{email}</p>
              <p className="text-[10px] uppercase tracking-wider text-white/35">Member</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/60 transition-colors hover:bg-white/5 hover:text-white"
          >
            <LogOut size={13} />
            Sign out
          </button>
        </div>
      ) : (
        <Link
          href="/login"
          className="flex items-center justify-center gap-2 rounded-xl bg-[#00A3FF] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0089d6]"
        >
          <LogIn size={15} />
          Sign in
        </Link>
      )}
    </div>
  )

  return (
    <div className="relative min-h-screen text-white">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/milky-way.jpg')" }}
        />
        <div className="absolute inset-0 bg-[#05060a]/80" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#05060a]/60 via-transparent to-[#05060a]/92" />
      </div>
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-white/8 bg-[#05060a]/95 px-4 backdrop-blur lg:hidden">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="" className="h-7 w-7 object-contain" />
          <span className="text-sm font-semibold tracking-tight">Evolved Tech</span>
        </Link>
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg border border-white/10 p-2 text-white/70"
          aria-label="Toggle navigation"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open && (
        <button
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          aria-label="Close navigation"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[264px] flex-col border-r border-white/8 bg-[#070810] transition-transform duration-300 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center gap-3 border-b border-white/5 px-5">
          <span className="relative flex h-9 w-9 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-[#00A3FF]/25 blur-md" />
            <img src="/logo.png" alt="Evolved Tech" className="relative h-9 w-9 object-contain" />
          </span>
          <p className="text-sm font-semibold tracking-tight">Evolved Tech</p>
        </div>

        <div className="flex flex-1 flex-col pt-4">{nav}</div>
        {footer}
      </aside>

      <main className="relative z-10 lg:pl-[264px]">
        <div className="pt-14 lg:pt-0">{children}</div>

        <footer className="border-t border-white/[0.06] px-6 py-10 lg:px-10">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 text-xs text-white/35 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="" className="h-6 w-6 object-contain opacity-70" />
              <span>© 2026 Evolved Tech · Lagos, Nigeria</span>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <a
                href="https://limn-engine-doc.vercel.app"
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-white"
              >
                Limn Engine
              </a>
              <Link href="/roadmap" className="transition-colors hover:text-white">
                Roadmap
              </Link>
              <a href="mailto:evolvedtech004@gmail.com" className="transition-colors hover:text-white">
                Contact
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
