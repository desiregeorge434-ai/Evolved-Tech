'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CinematicIntro } from '@/components/CinematicIntro'

export default function Home() {
  const [showIntro, setShowIntro] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const hasSeen = sessionStorage.getItem('hasSeenIntro')
    if (!hasSeen) {
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
      
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
        >
          <source src="/videos/bg-video.mp4" type="video/mp4" />
        </video>

        <div className="absolute top-0 left-0 w-full h-full bg-black/70 z-10"></div>

        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
          
          <img 
            src="/logo.png" 
            alt="Evolved Tech Logo" 
            className="w-24 h-24 object-contain mb-8 drop-shadow-[0_0_20px_rgba(0,163,255,0.8)]" 
          />
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-white leading-tight">
            Build the future with <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00A3FF] to-[#E2E8F0]">
              Evolved Tech
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl font-light">
            From Lagos to the world. We build browser-first tools, platforms, and games. Home of Limn Engine.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link 
              href="/feed" 
              className="bg-[#00A3FF] text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-600 transition-all text-lg shadow-[0_0_25px_rgba(0,163,255,0.4)] hover:shadow-[0_0_35px_rgba(0,163,255,0.6)]"
            >
              Go to Feed
            </Link>
            <Link 
              href="/projects" 
              className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition-all text-lg"
            >
              Explore Projects
            </Link>
          </div>

          <Link 
            href="/about" 
            className="mt-10 text-gray-400 hover:text-white underline underline-offset-8 decoration-[#00A3FF]/50 hover:decoration-[#00A3FF] transition-all"
          >
            Read our story & meet the team
          </Link>
          
        </div>
      </div>
    </>
  )
}