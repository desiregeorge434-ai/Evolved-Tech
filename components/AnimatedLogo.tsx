'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

type Props = {
  className?: string
  delay?: number
}

export function AnimatedLogo({ className = 'h-32 w-32 md:h-40 md:w-40', delay = 0.15 }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const mainRef = useRef<HTMLImageElement>(null)
  const redRef = useRef<HTMLImageElement>(null)
  const cyanRef = useRef<HTMLImageElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const root = rootRef.current
    const main = mainRef.current
    const red = redRef.current
    const cyan = cyanRef.current
    const line = lineRef.current
    const ring = ringRef.current
    if (!root || !main || !red || !cyan || !line || !ring) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set([main, red, cyan, ring], { opacity: 1, scale: 1, filter: 'none' })
      return
    }

    gsap.set(main, { opacity: 0, scale: 1.55, filter: 'blur(38px) brightness(2.4)' })
    gsap.set([red, cyan], { opacity: 0, scale: 1.55 })
    gsap.set(line, { xPercent: -130 })
    gsap.set(ring, { opacity: 0, scale: 0.7 })

    const tl = gsap.timeline({ delay })
    tl.to(main, { opacity: 1, scale: 1, filter: 'blur(0px) brightness(1)', duration: 1.15, ease: 'expo.out' })
      .to([red, cyan], { opacity: 0.5, scale: 1, duration: 0.9, ease: 'expo.out' }, '<')
      .to(red, { x: -7, y: 2, duration: 0.28, ease: 'power2.out' }, '-=0.55')
      .to(cyan, { x: 7, y: -2, duration: 0.28, ease: 'power2.out' }, '<')
      .to([red, cyan], { x: 0, y: 0, opacity: 0, duration: 0.55, ease: 'power2.inOut' }, '+=0.2')
      .to(line, { xPercent: 130, duration: 0.95, ease: 'power2.inOut' }, '-=0.7')
      .to(ring, { opacity: 1, scale: 1, duration: 1.1, ease: 'power3.out' }, '-=0.8')

    return () => { tl.kill() }
  }, [delay])

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <img
        ref={redRef}
        src="/logo.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-contain opacity-0"
        style={{ filter: 'drop-shadow(0 0 12px rgba(255,0,80,0.9)) saturate(2)' }}
      />
      <img
        ref={cyanRef}
        src="/logo.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-contain opacity-0"
        style={{ filter: 'drop-shadow(0 0 12px rgba(0,200,255,0.9)) saturate(2)' }}
      />
      <img
        ref={mainRef}
        src="/logo.png"
        alt="Evolved Tech"
        className="relative h-full w-full object-contain opacity-0"
      />
      <span
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-[-14px] rounded-full border border-dashed border-[#00A3FF]/25 opacity-0"
      />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          ref={lineRef}
          className="absolute left-0 top-0 h-full w-1/3 -translate-x-full bg-gradient-to-r from-transparent via-white/70 to-transparent"
        />
      </div>
    </div>
  )
}
