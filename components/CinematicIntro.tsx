'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'

export function CinematicIntro({ onComplete }: { onComplete: () => void }) {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const currentMount = mountRef.current
    if (!currentMount) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    currentMount.appendChild(renderer.domElement)

    scene.add(new THREE.AmbientLight(0x333333))
    const sunLight = new THREE.PointLight(0xffffff, 5, 2000)
    scene.add(sunLight)

    // 1. THE SUN (Real 3D Sphere, not a flat sprite)
    const sunGeo = new THREE.SphereGeometry(6, 64, 64)
    const sunTexture = new THREE.TextureLoader().load('/sun.png')
    sunTexture.colorSpace = THREE.SRGBColorSpace
    
    const sunMat = new THREE.MeshBasicMaterial({ 
      map: sunTexture,
      blending: THREE.AdditiveBlending, 
      transparent: true,
      depthWrite: false
    })
    const sun = new THREE.Mesh(sunGeo, sunMat)
    scene.add(sun)

    // 2. SUN GLOW (A larger, soft halo around the sun)
    const glowGeo = new THREE.SphereGeometry(8, 32, 32)
    const glowMat = new THREE.MeshBasicMaterial({ 
      color: 0xff8800, 
      transparent: true, 
      opacity: 0.15, 
      side: THREE.BackSide 
    })
    const glow = new THREE.Mesh(glowGeo, glowMat)
    sun.add(glow)

    // 3. MILKY WAY BACKGROUND
    const skyTexture = new THREE.TextureLoader().load('/milky-way.jpg')
    const skyGeo = new THREE.SphereGeometry(900, 32, 32)
    const skyMat = new THREE.MeshBasicMaterial({ map: skyTexture, side: THREE.BackSide })
    const sky = new THREE.Mesh(skyGeo, skyMat)
    scene.add(sky)

    // 4. PLANETS
    const planets: any[] = []
    const createPlanet = (path: string, size: number, distance: number, speed: number, angle: number) => {
      const geo = new THREE.SphereGeometry(size, 32, 32)
      const tex = new THREE.TextureLoader().load(path)
      const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8 })
      const mesh = new THREE.Mesh(geo, mat)
      scene.add(mesh)
      planets.push({ mesh, distance, speed, angle })
    }

    createPlanet('/earth-day.png', 2, 0, 0, 0)
    createPlanet('/mercury.png', 0.4, 8, 0.05, Math.PI * 2)
    createPlanet('/venus.png', 0.8, 12, 0.04, Math.PI * 1.5)
    createPlanet('/mars.png', 1.0, 20, 0.03, Math.PI)
    createPlanet('/jupiter.jpg', 3.5, 28, 0.02, Math.PI / 2)
    createPlanet('/saturn.png', 2.5, 38, 0.015, Math.PI / 3)
    createPlanet('/uranus.png', 1.8, 48, 0.01, 0)
    createPlanet('/neptune.png', 1.7, 58, 0.008, Math.PI * 1.2)

    // 5. CAMERA START
    camera.position.set(-40, 50, 60)
    camera.lookAt(0, 0, 0)

    const clock = new THREE.Clock()
    let animationId: number

    const animate = () => {
      animationId = requestAnimationFrame(animate)
      const time = clock.getElapsedTime()

      // Rotate the Sun and make it pulse slightly
      sun.rotation.y += 0.002
      glow.scale.setScalar(1 + Math.sin(time * 2) * 0.02)

      // Orbit planets
      planets.forEach(p => {
        p.mesh.rotation.y += 0.01
        const currentAngle = p.angle + (time * p.speed)
        p.mesh.position.x = Math.cos(currentAngle) * p.distance
        p.mesh.position.z = Math.sin(currentAngle) * p.distance
      })

      renderer.render(scene, camera)
    }
    animate()

    // 6. CINEMATIC SWEEP
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(sceneRef.current, { opacity: 0, duration: 1, onComplete: onComplete })
      }
    })

    tl.to(camera.position, {
      x: 0, y: 0, z: 10,
      duration: 6,
      ease: "power2.inOut"
    })
    .to(camera.position, {
      x: 0, y: 0, z: 2.1,
      duration: 2,
      ease: "power4.in"
    })
    .to(logoRef.current, {
      opacity: 1,
      scale: 1,
      duration: 1.5,
      ease: "back.out(1.5)"
    }, "-=0.5")

    return () => {
      cancelAnimationFrame(animationId)
      tl.kill()
      renderer.dispose()
      if (currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement)
      }
    }
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-hidden flex items-center justify-center">
      <div ref={sceneRef} className="absolute inset-0">
        <div ref={mountRef} className="absolute inset-0" />
      </div>

      <img
        ref={logoRef}
        src="/logo.png"
        alt="Evolved Tech"
        className="absolute z-50 w-48 h-48 object-contain opacity-0 scale-50"
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
