'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { AnimatedLogo } from './AnimatedLogo'

type Props = { onComplete: () => void }

export function LogoIntro({ onComplete }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subRef = useRef<HTMLParagraphElement>(null)
  const doneRef = useRef(onComplete)
  doneRef.current = onComplete

  useEffect(() => {
    const root = rootRef.current
    const title = titleRef.current
    const sub = subRef.current
    if (!root || !title || !sub) return

    gsap.set([title, sub], { opacity: 0, y: 24 })

    const tl = gsap.timeline()

    tl.to(title, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 0.9)
      .to(sub, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 1.1)
      .to({}, { duration: 2.2 })
      .to(root, {
        opacity: 0,
        duration: 0.6,
        ease: 'power2.inOut',
        onComplete: () => doneRef.current(),
      })

    return () => { tl.kill() }
  }, [])

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black"
    >
      <AnimatedLogo className="h-28 w-28 md:h-36 md:w-36" />

      <h1
        ref={titleRef}
        className="mt-9 text-3xl font-extrabold tracking-tight text-white opacity-0 md:text-5xl"
      >
        EVOLVED TECH
      </h1>
      <p
        ref={subRef}
        className="mt-4 text-[9px] uppercase tracking-[0.4em] text-[#00A3FF] opacity-0 md:text-xs"
      >
        Draw your game into existence
      </p>

      <button
        onClick={() => doneRef.current()}
        className="absolute bottom-8 right-8 rounded-full border border-white/20 px-5 py-2 text-[10px] uppercase tracking-[0.3em] text-white/50 transition-colors hover:text-white"
      >
        Skip
      </button>
    </div>
  )
}
