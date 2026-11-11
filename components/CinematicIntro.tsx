'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'

export function CinematicIntro({ onComplete }: { onComplete: () => void }) {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const currentMount = mountRef.current
    if (!currentMount) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    currentMount.appendChild(renderer.domElement)

    const textureLoader = new THREE.TextureLoader()

    const ambientLight = new THREE.AmbientLight(0x222222)
    scene.add(ambientLight)

    const sunGeo = new THREE.SphereGeometry(8, 64, 64)
    const sunTexture = textureLoader.load('/sun.jpg')
    sunTexture.colorSpace = THREE.SRGBColorSpace
    
    const sunMat = new THREE.MeshBasicMaterial({ 
      map: sunTexture,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false
    })
    const sun = new THREE.Mesh(sunGeo, sunMat)
    sun.position.set(-40, 15, -15)
    scene.add(sun)

    const sunGlowGeo = new THREE.SphereGeometry(10, 32, 32)
    const sunGlowMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.2, side: THREE.BackSide })
    const sunGlow = new THREE.Mesh(sunGlowGeo, sunGlowMat)
    sun.add(sunGlow)

    const sunLight = new THREE.PointLight(0xffffff, 4, 2000)
    sunLight.position.copy(sun.position)
    scene.add(sunLight)

    const milkyWayTexture = textureLoader.load('/milky-way.jpg')
    milkyWayTexture.colorSpace = THREE.SRGBColorSpace 
    const skyGeo = new THREE.SphereGeometry(900, 64, 64)
    const skyMat = new THREE.MeshBasicMaterial({ map: milkyWayTexture, side: THREE.BackSide })
    const sky = new THREE.Mesh(skyGeo, skyMat)
    sky.rotation.x = Math.PI / 4
    scene.add(sky)

    const earthGeo = new THREE.SphereGeometry(2, 64, 64)
    const earthMat = new THREE.MeshStandardMaterial({ 
      map: textureLoader.load('/earth-day.png'),
      roughness: 0.8
    })
    const earth = new THREE.Mesh(earthGeo, earthMat)
    earth.position.set(0, 0, 0)
    earth.rotation.y = -2.5
    scene.add(earth)

    const atmosGeo = new THREE.SphereGeometry(2.1, 64, 64)
    const atmosMat = new THREE.MeshBasicMaterial({ color: 0x00A3FF, transparent: true, opacity: 0.2, side: THREE.BackSide })
    earth.add(new THREE.Mesh(atmosGeo, atmosMat))

    const jupiterGeo = new THREE.SphereGeometry(3.5, 64, 64)
    const jupiterMat = new THREE.MeshStandardMaterial({ map: textureLoader.load('/jupiter.jpg'), roughness: 0.8 })
    const jupiter = new THREE.Mesh(jupiterGeo, jupiterMat)
    jupiter.position.set(25, 2, 8)
    scene.add(jupiter)

    const marsGeo = new THREE.SphereGeometry(1.2, 64, 64)
    const marsMat = new THREE.MeshStandardMaterial({ map: textureLoader.load('/mars.png'), roughness: 0.8 })
    const mars = new THREE.Mesh(marsGeo, marsMat)
    mars.position.set(12, -1, 4)
    scene.add(mars)

    camera.position.set(35, 8, 20)
    camera.lookAt(0, 0, 0)

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(currentMount, { opacity: 0, duration: 1, onComplete: onComplete })
      }
    })

    tl.to(camera.position, { 
      x: 0, y: 0, z: 4.5, 
      duration: 8, 
      ease: "power2.inOut" 
    })
    .to("#lagos-text", { opacity: 1, duration: 0.5 }, "-=1.5")
    .to("#logo-reveal", { opacity: 1, scale: 1, rotationY: 360, duration: 1.5, ease: "back.out(1.5)" }, "+=0.5")

    const clock = new THREE.Clock()

    const animate = () => {
      requestAnimationFrame(animate)
      const time = clock.getElapsedTime()

      earth.rotation.y += 0.005
      jupiter.rotation.y += 0.01
      mars.rotation.y += 0.008

      jupiter.position.x = 25 + Math.sin(time * 0.2) * 1.5
      mars.position.x = 12 + Math.cos(time * 0.3) * 1

      sunGlow.scale.setScalar(1 + Math.sin(time * 2) * 0.05)

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      if (currentMount) currentMount.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [onComplete])

  return (
    <div ref={mountRef} className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden perspective-[1000px]">
      
      <div id="lagos-text" className="absolute inset-0 flex flex-col items-center justify-center opacity-0 z-40 pointer-events-none">
        <h2 className="text-white text-4xl md:text-6xl font-bold tracking-widest uppercase mb-4 drop-shadow-[0_0_20px_rgba(0,163,255,1)]">
          Lagos, Nigeria
        </h2>
        <div className="w-24 h-1 bg-[#00A3FF] shadow-[0_0_15px_rgba(0,163,255,1)]"></div>
      </div>

      <img 
        id="logo-reveal"
        src="/logo.png" 
        alt="Evolved Tech" 
        className="absolute z-50 w-32 h-32 object-contain opacity-0 scale-50 drop-shadow-[0_0_30px_rgba(0,163,255,0.8)]"
      />

      <button 
        onClick={onComplete}
        className="absolute bottom-10 text-white/50 hover:text-white text-sm z-50 tracking-widest uppercase border border-white/20 px-4 py-2 rounded-full backdrop-blur-md hover:bg-white/10 transition-colors"
      >
        Skip Intro
      </button>
    </div>
  )
}
