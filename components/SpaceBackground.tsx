'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

type Props = { quality?: 'full' | 'low' }

const NAMES = ['ORION', 'LYRA', 'CYGNUS', 'DRACO', 'PERSEUS', 'AQUILA', 'PEGASUS', 'ANDROMEDA']

const BODIES = [
  { radius: 2.2, orbit: 58, speed: 0.20, tilt: 0.02, map: '/mercury.png' },
  { radius: 4, orbit: 80, speed: 0.15, tilt: 0.06, map: '/venus.png' },
  { radius: 9, orbit: 110, speed: 0.10, tilt: 0.41, map: '/earth-day.png' },
  { radius: 3.4, orbit: 135, speed: 0.08, tilt: 0.05, map: '/mars.png' },
  { radius: 16, orbit: 180, speed: 0.045, tilt: 0.05, map: '/jupiter.jpg' },
  { radius: 13, orbit: 225, speed: 0.032, tilt: 0.47, map: '/saturn.png' },
]

function glowTexture(): THREE.CanvasTexture {
  const s = 512
  const c = document.createElement('canvas')
  c.width = c.height = s
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.1, 'rgba(255,252,240,0.8)')
  g.addColorStop(0.32, 'rgba(255,226,170,0.2)')
  g.addColorStop(1, 'rgba(255,200,120,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, s, s)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function starSpriteTexture(): THREE.CanvasTexture {
  const s = 64
  const c = document.createElement('canvas')
  c.width = c.height = s
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.4, 'rgba(255,255,255,0.35)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, s, s)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

export function SpaceBackground({ quality = 'full' }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: quality === 'full', alpha: true })
    } catch {
      return
    }

    const dpr = Math.min(window.devicePixelRatio, quality === 'full' ? 1.5 : 1.2)
    renderer.setPixelRatio(dpr)
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.0
    host.appendChild(renderer.domElement)

    const disposables: Array<{ dispose: () => void }> = []
    const track = <T extends { dispose: () => void }>(x: T): T => {
      disposables.push(x)
      return x
    }

    const loader = new THREE.TextureLoader()
    const loadTex = (url: string) => {
      const t = loader.load(url)
      t.colorSpace = THREE.SRGBColorSpace
      t.anisotropy = renderer.capabilities.getMaxAnisotropy()
      return track(t)
    }

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 4000)
    camera.position.set(0, 26, 300)

    const sun = new THREE.Mesh(
      track(new THREE.SphereGeometry(14, 64, 64)),
      track(new THREE.MeshBasicMaterial({ map: loadTex('/sun.jpg'), color: 0xffffff }))
    )
    scene.add(sun)

    const flare = new THREE.Sprite(track(new THREE.SpriteMaterial({
      map: track(glowTexture()),
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      opacity: 0.75,
    })))
    flare.scale.setScalar(150)
    scene.add(flare)

    scene.add(new THREE.PointLight(0xfff6e6, 3.6, 0, 0))
    scene.add(new THREE.AmbientLight(0x141c2a, 1.4))

    const starTex = track(starSpriteTexture())
    const makeStars = (count: number, rMin: number, rMax: number, size: number, opacity: number) => {
      const pos = new Float32Array(count * 3)
      for (let i = 0; i < count; i++) {
        const r = rMin + Math.random() * (rMax - rMin)
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)
        pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
        pos[i * 3 + 1] = r * Math.cos(phi)
        pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
      }
      const geo = track(new THREE.BufferGeometry())
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
      const pts = new THREE.Points(geo, track(new THREE.PointsMaterial({
        color: 0xffffff, size, sizeAttenuation: true, transparent: true, opacity,
        depthWrite: false, map: starTex, alphaTest: 0.01, blending: THREE.AdditiveBlending,
      })))
      scene.add(pts)
      return pts
    }

    const starCount = quality === 'full' ? 1400 : 600
    const starsNear = makeStars(starCount, 240, 520, 2.4, 0.9)
    const starsFar = makeStars(starCount, 800, 1800, 4.2, 0.45)

    const constellations = new THREE.Group()
    scene.add(constellations)
    {
      const R = 2000
      const verts: number[] = []
      const up = new THREE.Vector3(0, 1, 0)
      NAMES.forEach((_, idx) => {
        const count = quality === 'full' ? NAMES.length : 4
        if (idx >= count) return
        const dir = new THREE.Vector3(
          Math.random() * 2 - 1,
          Math.random() * 2 - 1,
          Math.random() * 2 - 1
        ).normalize()
        const t1 = new THREE.Vector3().crossVectors(dir, up)
        if (t1.lengthSq() < 0.01) t1.set(1, 0, 0)
        t1.normalize()
        const t2 = new THREE.Vector3().crossVectors(dir, t1).normalize()
        let prev: THREE.Vector3 | null = null
        const n = 5
        for (let i = 0; i < n; i++) {
          const a = (i / (n - 1) - 0.5) * 0.2
          const b = (Math.random() - 0.5) * 0.12
          const p = dir.clone().addScaledVector(t1, a).addScaledVector(t2, b).normalize().multiplyScalar(R)
          if (prev) verts.push(prev.x, prev.y, prev.z, p.x, p.y, p.z)
          prev = p
        }
      })
      const geo = track(new THREE.BufferGeometry())
      geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
      constellations.add(new THREE.LineSegments(geo, track(new THREE.LineBasicMaterial({
        color: 0x6fa8d8, transparent: true, opacity: 0.22,
      }))))
    }

    const planets: Array<{ mesh: THREE.Mesh; orbit: number; speed: number; tilt: number; phase: number }> = []
    BODIES.forEach((b, i) => {
      if (quality === 'low' && i > 2) return
      const mesh = new THREE.Mesh(
        track(new THREE.SphereGeometry(b.radius, b.radius > 4 ? 64 : 48, b.radius > 4 ? 64 : 48)),
        track(new THREE.MeshStandardMaterial({ map: loadTex(b.map), roughness: 0.92, metalness: 0.02 }))
      )
      mesh.rotation.z = b.tilt
      scene.add(mesh)
      planets.push({
        mesh,
        orbit: b.orbit,
        speed: b.speed,
        tilt: b.tilt,
        phase: (i / BODIES.length) * Math.PI * 2,
      })
    })

    const clock = new THREE.Clock()
    let raf = 0
    let visible = true

    const onVisibility = () => { visible = !document.hidden }
    document.addEventListener('visibilitychange', onVisibility)

    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (!visible) return
      const t = clock.getElapsedTime()

      planets.forEach((p) => {
        const a = p.phase + t * p.speed
        p.mesh.position.set(Math.cos(a) * p.orbit, 0, Math.sin(a) * p.orbit)
        p.mesh.rotation.y = t * 0.02
        p.mesh.rotation.z = p.tilt
      })

      sun.rotation.y = t * 0.008
      starsNear.rotation.y = t * 0.004
      starsFar.rotation.y = t * 0.0015
      constellations.rotation.y = t * 0.0012

      camera.position.x = Math.sin(t * 0.05) * 18
      camera.position.y = 26 + Math.cos(t * 0.037) * 12
      camera.position.z = 300 + Math.sin(t * 0.028) * 20
      camera.lookAt(0, 0, 0)

      renderer.render(scene, camera)
    }
    tick()

    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight)
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('resize', onResize)
      disposables.forEach((d) => d.dispose())
      renderer.dispose()
      renderer.forceContextLoss()
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement)
    }
  }, [quality])

  return <div ref={hostRef} className="absolute inset-0" aria-hidden="true" />
}
