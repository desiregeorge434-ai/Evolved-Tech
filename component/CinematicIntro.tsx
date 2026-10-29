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
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    
    renderer.setSize(window.innerWidth, window.innerHeight)
    currentMount.appendChild(renderer.domElement)

    const starsGeometry = new THREE.BufferGeometry()
    const starsCount = 3000
    const posArray = new Float32Array(starsCount * 3)
    for (let i = 0; i < starsCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 200
    }
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3))
    const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 })
    const stars = new THREE.Points(starsGeometry, starsMaterial)
    scene.add(stars)

    const earthGeometry = new THREE.IcosahedronGeometry(5, 2)
    const earthMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x00A3FF, 
      wireframe: true, 
      transparent: true,
      opacity: 0.3
    })
    const earth = new THREE.Mesh(earthGeometry, earthMaterial)
    scene.add(earth)

    camera.position.z = 20

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(currentMount, { opacity: 0, duration: 1, onComplete: onComplete })
      }
    })

    tl.to(camera.position, { z: 8, duration: 3, ease: "power2.inOut" })
      .to(earth.rotation, { y: Math.PI, duration: 3 }, 0)
      .to(camera.position, { z: 5.5, duration: 1.5, ease: "power4.in" })

    const animate = () => {
      requestAnimationFrame(animate)
      stars.rotation.y += 0.0005
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      if (currentMount) currentMount.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [onComplete])

  return (
    <div ref={mountRef} className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      <button 
        onClick={onComplete}
        className="absolute bottom-10 text-white/50 hover:text-white text-sm z-50 tracking-widest uppercase"
      >
        Skip Intro
      </button>
    </div>
  )
}