'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'

export function CinematicIntro({ onComplete }: { onComplete: () => void }) {
  const mountRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const currentMount = mountRef.current
    if (!currentMount) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    currentMount.appendChild(renderer.domElement)

    const textureLoader = new THREE.TextureLoader()

    const sunGeo = new THREE.SphereGeometry(3, 32, 32)
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 })
    const sun = new THREE.Mesh(sunGeo, sunMat)
    scene.add(sun)
    const sunLight = new THREE.PointLight(0xffffff, 2, 1000)
    scene.add(sunLight)

    const milkyWayTexture = textureLoader.load('/milky-way.jpg')
    milkyWayTexture.colorSpace = THREE.SRGBColorSpace 
    const skyGeo = new THREE.SphereGeometry(800, 64, 64)
    const skyMat = new THREE.MeshBasicMaterial({ map: milkyWayTexture, side: THREE.BackSide, color: 0x888888 })
    const sky = new THREE.Mesh(skyGeo, skyMat)
    sky.rotation.x = Math.PI / 4
    scene.add(sky)

    const earthGeo = new THREE.SphereGeometry(1.2, 64, 64)
    const dayTexture = textureLoader.load('/earth-day.png')
    const nightTexture = textureLoader.load('/earth-night.png')
    
    const earthMat = new THREE.ShaderMaterial({
      uniforms: {
        dayTexture: { value: dayTexture },
        nightTexture: { value: nightTexture },
        sunDirection: { value: new THREE.Vector3(0, 0, 0) }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D dayTexture;
        uniform sampler2D nightTexture;
        uniform vec3 sunDirection;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vec3 lightDir = normalize(sunDirection - vPosition);
          float intensity = dot(vNormal, lightDir);
          vec4 dayColor = texture2D(dayTexture, vUv);
          vec4 nightColor = texture2D(nightTexture, vUv);
          float blend = smoothstep(-0.2, 0.2, intensity);
          nightColor.rgb *= 1.5;
          gl_FragColor = mix(nightColor, dayColor, blend);
        }
      `
    })

    const earth = new THREE.Mesh(earthGeo, earthMat)
    const earthOrbit = new THREE.Group()
    earthOrbit.add(earth)
    earth.position.x = 10
    scene.add(earthOrbit)

    const atmosGeo = new THREE.SphereGeometry(1.25, 64, 64)
    const atmosMat = new THREE.MeshBasicMaterial({ color: 0x00A3FF, transparent: true, opacity: 0.15, side: THREE.BackSide })
    earth.add(new THREE.Mesh(atmosGeo, atmosMat))

    const createStandardPlanet = (texturePath: string, size: number, distance: number) => {
      const geo = new THREE.SphereGeometry(size, 64, 64)
      const mat = new THREE.MeshStandardMaterial({ map: textureLoader.load(texturePath), roughness: 0.8 })
      const planet = new THREE.Mesh(geo, mat)
      const orbit = new THREE.Group()
      orbit.add(planet)
      planet.position.x = distance
      scene.add(orbit)
      return { planet, orbit }
    }

    const marsData = createStandardPlanet('/mars.png', 0.8, 16)
    const mercuryData = createStandardPlanet('/mercury.png', 0.5, 6)
    const jupiterData = createStandardPlanet('/jupiter.png', 2.5, 25)

    camera.position.set(0, 40, 60)
    camera.lookAt(0, 0, 0)

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(currentMount, { opacity: 0, duration: 1, onComplete: onComplete })
      }
    })

    tl.to(camera.position, { x: 10, y: 10, z: 25, duration: 4, ease: "power2.inOut" })
      .to(camera.rotation, { x: -0.3, y: 0.4, z: 0, duration: 4, ease: "power2.inOut" }, "-=4")
      .to(camera.position, { x: 10, y: 2, z: 14, duration: 2, ease: "power2.inOut" })
      .to(camera.rotation, { x: 0, y: 0.7, z: 0, duration: 2, ease: "power2.inOut" }, "-=2")
      .to(earth.rotation, { y: -0.2, duration: 2, ease: "power2.inOut" }, "-=2")
      .to(camera.position, { x: 10, y: 0.5, z: 8.8, duration: 2.5, ease: "power4.in" })
      .to(camera.rotation, { x: 0.1, y: 0.7, z: 0, duration: 2.5, ease: "power4.in" }, "-=2.5")
      .to("#lagos-text", { opacity: 1, duration: 0.5, ease: "power2.inOut" }, "-=1")
      .to("#logo-reveal", { opacity: 1, scale: 1, rotationY: 360, duration: 1.5, ease: "back.out(1.7)" }, "-=0.5")

    const clock = new THREE.Clock()

    const animate = () => {
      requestAnimationFrame(animate)
      const time = clock.getElapsedTime()

      if (time < 6) {
        earth.rotation.y = time * 0.2
        marsData.planet.rotation.y = time * 0.15
        mercuryData.planet.rotation.y = time * 0.3
        jupiterData.planet.rotation.y = time * 0.1
        earthOrbit.rotation.y = time * 0.05
        marsData.orbit.rotation.y = time * 0.03
        mercuryData.orbit.rotation.y = time * 0.01
        jupiterData.orbit.rotation.y = time * 0.02
      }

      const worldPos = new THREE.Vector3()
      earth.getWorldPosition(worldPos)
      const sunDirection = new THREE.Vector3().subVectors(sun.position, worldPos).normalize()
      earthMat.uniforms.sunDirection.value.copy(sunDirection)

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
        ref={logoRef}
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
