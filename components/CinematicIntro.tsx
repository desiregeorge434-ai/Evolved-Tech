'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'

export function CinematicIntro({ onComplete }: { onComplete: () => void }) {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<HTMLDivElement>(null)
  const lagosRef = useRef<HTMLDivElement>(null)

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
    const sunMat = new THREE.MeshBasicMaterial({ map: sunTexture, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false })
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
    const earthMat = new THREE.MeshStandardMaterial({ map: textureLoader.load('/earth-day.png'), roughness: 0.8 })
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
    jupiter.position.set(25, 0, 0)
    scene.add(jupiter)

    const marsGeo = new THREE.SphereGeometry(1.2, 64, 64)
    const marsMat = new THREE.MeshStandardMaterial({ map: textureLoader.load('/mars.png'), roughness: 0.8 })
    const mars = new THREE.Mesh(marsGeo, marsMat)
    mars.position.set(12, 0, 0)
    scene.add(mars)

    camera.position.set(35, 8, 20)
    camera.lookAt(0, 0, 0)

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(sceneRef.current, { opacity: 0, duration: 1, onComplete: onComplete })
      }
    })

    tl.to(camera.position, { 
      x: 0, y: 0, z: 2.05, 
      duration: 6, 
      ease: "none"
    })
    .to(scene.rotation, {
      z: Math.PI * 4,
      x: Math.PI * 2,
      duration: 2,
      ease: "power4.in"
    }, "-=1.5")
    .to(camera.position, {
      z: 1.95,
      duration: 2,
      ease: "power4.in"
    }, "-=2")
    .to(sceneRef.current, {
      opacity: 0,
      duration: 0.1,
      onComplete: () => {
        if(lagosRef.current) {
          lagosRef.current.style.display = 'flex'
        }
      }
    })
    .fromTo(lagosRef.current,
      { opacity: 0, scale: 1.2 },
      { opacity: 1, scale: 1, duration: 2, ease: "power2.out" }
    )
    .to(lagosRef.current, {
      scale: 1.5,
      opacity: 0,
      duration: 2,
      ease: "power2.in",
      delay: 1
    })
    .to("#logo-reveal", { 
      opacity: 1, 
      scale: 1, 
      duration: 1.5, 
      ease: "back.out(1.5)" 
    })

    const clock = new THREE.Clock()

    const animate = () => {
      requestAnimationFrame(animate)
      const time = clock.getElapsedTime()

      // REAL ORBITAL MECHANICS
      // Jupiter orbits at a radius of 25 around the Sun
      const jupiterOrbitSpeed = time * 0.2;
      jupiter.position.x = Math.cos(jupiterOrbitSpeed) * 25;
      jupiter.position.z = Math.sin(jupiterOrbitSpeed) * 25;
      jupiter.rotation.y += 0.01;

      // Mars orbits at a radius of 12 around the Sun
      const marsOrbitSpeed = time * 0.4;
      mars.position.x = Math.cos(marsOrbitSpeed) * 12;
      mars.position.z = Math.sin(marsOrbitSpeed) * 12;
      mars.rotation.y += 0.008;

      // Earth spins
      earth.rotation.y += 0.005

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
    <div className="fixed inset-0 z-50 bg-black overflow-hidden perspective-[1000px]">
      
      <div ref={sceneRef} className="absolute inset-0">
        <div ref={mountRef} className="absolute inset-0" />
      </div>

      <div ref={lagosRef} className="absolute inset-0 hidden items-center justify-center bg-black">
        <img 
          src="/lagos.jpg" 
          alt="Lagos" 
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
        
        <div className="absolute bottom-20 text-center z-10">
          <h2 className="text-white text-4xl md:text-6xl font-bold tracking-widest uppercase mb-4 drop-shadow-[0_0_20px_rgba(0,163,255,1)]">
            Lagos, Nigeria
          </h2>
          <p className="text-[#00A3FF] text-xl tracking-widest uppercase">Evolved Tech HQ</p>
        </div>
      </div>

      <img 
        id="logo-reveal"
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
