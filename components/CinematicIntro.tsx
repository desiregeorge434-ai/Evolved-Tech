'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { SceneManager } from './SceneManager'

export function CinematicIntro({ onComplete }: { onComplete: () => void }) {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (!mountRef.current) return
    
    const engine = new SceneManager(mountRef.current)
    engine.startAnimation()

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(sceneRef.current, { opacity: 0, duration: 1, onComplete: onComplete })
      }
    })

    tl.to(engine.camera.position, { 
      x: 0, y: 0, z: 8, 
      duration: 6, 
      ease: "power2.inOut"
    })
    .to(engine.camera.position, {
      x: 0, y: 0, z: 2.1,
      duration: 2,
      ease: "power4.in"
    })
    .to(engine.earth.mesh.rotation, {
      y: `+=${Math.PI * 4}`,
      duration: 2,
      ease: "power4.in"
    }, "-=2")
    .to(logoRef.current, { 
      opacity: 1, 
      scale: 1, 
      duration: 1.5, 
      ease: "back.out(1.5)" 
    }, "-=0.5")

    return () => {
      tl.kill()
      engine.dispose()
    }
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-hidden perspective-[1000px]">
      
      <div ref={sceneRef} className="absolute inset-0">
        <div ref={mountRef} className="absolute inset-0" />
      </div>

      <img 
        ref={logoRef}
        src="/logo.png" 
        alt="Evolved Tech" 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-48 h-48 object-contain opacity-0 scale-50 drop-shadow-[0_0_40px_rgba(0,163,255,0.8)]"
      />

      <button 
        onClick={onComplete}
        className="absolute bottom-10 right-10 text-white/50 hover:text-white text-sm z-50 tracking-widest uppercase border border-white/20 px-4 py-2 rounded-full backdrop-blur-md hover:bg-white/10 transition-colors"
      >
        Skip Intro
      </button>
    </div>
  )
}
