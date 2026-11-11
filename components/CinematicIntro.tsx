'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'

type Props = { onComplete: () => void }

const BLUE = 0x00a3ff

function glowTexture(): THREE.CanvasTexture {
  const s = 256
  const c = document.createElement('canvas')
  c.width = c.height = s
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.18, 'rgba(255,244,214,0.9)')
  g.addColorStop(0.42, 'rgba(255,168,64,0.38)')
  g.addColorStop(0.7, 'rgba(255,110,0,0.09)')
  g.addColorStop(1, 'rgba(255,90,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, s, s)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function windowTexture(): THREE.CanvasTexture {
  const s = 128
  const c = document.createElement('canvas')
  c.width = c.height = s
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#000005'
  ctx.fillRect(0, 0, s, s)
  const cols = 8
  const rows = 16
  const cw = s / cols
  const ch = s / rows
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (Math.random() < 0.42) continue
      const warm = Math.random() < 0.25
      ctx.fillStyle = warm ? 'rgba(255,214,150,0.95)' : 'rgba(150,220,255,0.85)'
      ctx.fillRect(x * cw + cw * 0.22, y * ch + ch * 0.28, cw * 0.56, ch * 0.44)
    }
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  return t
}

type Body = {
  name: string
  radius: number
  orbit: number
  speed: number
  tilt: number
  color: number
  texture?: string
  ring?: boolean
}

const BODIES: Body[] = [
  { name: 'Mercury', radius: 0.55, orbit: 15, speed: 0.24, tilt: 0.02, color: 0x9c8f84 },
  { name: 'Venus', radius: 1.05, orbit: 20, speed: 0.17, tilt: 0.06, color: 0xd9b382 },
  { name: 'Earth', radius: 1.5, orbit: 27, speed: 0.11, tilt: 0.01, color: 0x2f7fd0, texture: '/earth-day.png' },
  { name: 'Mars', radius: 0.9, orbit: 34, speed: 0.09, tilt: 0.04, color: 0xb4552f },
  { name: 'Jupiter', radius: 3.1, orbit: 46, speed: 0.05, tilt: 0.02, color: 0xc9a27a },
  { name: 'Saturn', radius: 2.5, orbit: 58, speed: 0.035, tilt: 0.18, color: 0xd8c9a3, ring: true },
  { name: 'Neptune', radius: 1.7, orbit: 70, speed: 0.02, tilt: 0.05, color: 0x3a6fd8 },
]

export function CinematicIntro({ onComplete }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const flashRef = useRef<HTMLDivElement>(null)
  const blackRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const skipRef = useRef<HTMLButtonElement>(null)

  const doneRef = useRef(onComplete)
  doneRef.current = onComplete

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      doneRef.current()
      return
    }

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
    } catch {
      doneRef.current()
      return
    }

    const isSmall = window.innerWidth < 820
    const pixelRatio = Math.min(window.devicePixelRatio, isSmall ? 1.5 : 1.75)

    renderer.setPixelRatio(pixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    host.appendChild(renderer.domElement)

    const disposables: Array<{ dispose: () => void }> = []
    const track = <T extends { dispose: () => void }>(x: T): T => {
      disposables.push(x)
      return x
    }

    const space = new THREE.Scene()
    space.background = new THREE.Color(0x000206)

    const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 4000)
    camera.position.set(0, 10, 95)

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
      const mat = track(new THREE.PointsMaterial({
        color: 0xffffff, size, sizeAttenuation: true,
        transparent: true, opacity, depthWrite: false,
      }))
      const pts = new THREE.Points(geo, mat)
      space.add(pts)
      return pts
    }
    const starsNear = makeStars(1400, 220, 420, 1.1, 0.95)
    const starsFar = makeStars(2200, 600, 1200, 2.2, 0.55)

    const sunGroup = new THREE.Group()
    space.add(sunGroup)

    const sunCore = new THREE.Mesh(
      track(new THREE.SphereGeometry(3, 32, 32)),
      track(new THREE.MeshBasicMaterial({ color: 0xfff4d6 }))
    )
    sunGroup.add(sunCore)

    const glowTex = track(glowTexture())
    const glow = new THREE.Sprite(track(new THREE.SpriteMaterial({
      map: glowTex, blending: THREE.AdditiveBlending,
      depthWrite: false, transparent: true, opacity: 0.9,
    })))
    glow.scale.setScalar(46)
    sunGroup.add(glow)

    const sunLight = new THREE.PointLight(0xfff0d0, 3.2, 0, 0)
    sunGroup.add(sunLight)
    space.add(new THREE.AmbientLight(0x223044, 1.1))

    type Planet = { mesh: THREE.Mesh; body: Body; angle: number }
    const planets: Planet[] = []
    let earthMesh: THREE.Mesh | null = null

    BODIES.forEach((body, i) => {
      const geo = track(new THREE.SphereGeometry(body.radius, 40, 40))
      const matParams: THREE.MeshStandardMaterialParameters = {
        color: body.color, roughness: 0.85, metalness: 0.05,
      }
      const mat = track(new THREE.MeshStandardMaterial(matParams))

      if (body.texture) {
        const tex = track(new THREE.TextureLoader().load(body.texture))
        tex.colorSpace = THREE.SRGBColorSpace
        mat.map = tex
        mat.color.set(0xffffff)
        mat.needsUpdate = true
      }

      const mesh = new THREE.Mesh(geo, mat)
      mesh.rotation.z = body.tilt
      space.add(mesh)

      if (body.ring) {
        const ringGeo = track(new THREE.RingGeometry(body.radius * 1.45, body.radius * 2.3, 96))
        const ringMat = track(new THREE.MeshBasicMaterial({
          color: 0xd8c9a3, side: THREE.DoubleSide, transparent: true, opacity: 0.55,
        }))
        const ring = new THREE.Mesh(ringGeo, ringMat)
        ring.rotation.x = Math.PI / 2.35
        mesh.add(ring)
      }

      planets.push({ mesh, body, angle: (i / BODIES.length) * Math.PI * 2 })

      if (body.name === 'Earth') {
        earthMesh = mesh
        const atmo = new THREE.Mesh(
          track(new THREE.SphereGeometry(body.radius * 1.12, 32, 32)),
          track(new THREE.MeshBasicMaterial({
            color: BLUE, transparent: true, opacity: 0.18,
            side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false,
          }))
        )
        mesh.add(atmo)
      }
    })

    type Flyby = { mesh: THREE.Mesh; from: THREE.Vector3; to: THREE.Vector3; t0: number; t1: number }
    const flybys: Flyby[] = []
    const flybyGeo = track(new THREE.IcosahedronGeometry(1, 0))
    const flybyMat = track(new THREE.MeshStandardMaterial({ color: 0x6d6a63, roughness: 1 }))

    const path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 14, 108),
      new THREE.Vector3(24, -6, 74),
      new THREE.Vector3(-26, 9, 52),
      new THREE.Vector3(16, 2, 34),
      new THREE.Vector3(-6, 0, 22),
    ])

    const T_SPACE = 5.5
    const T_APPROACH = 2.4
    const T_LAGOS = 2.8
    const T_LOGO_HOLD = 1.4

    const state = { u: 0, approach: 0, lagos: 0, phase: 'space' as 'space' | 'approach' | 'lagos' }

    let approachFrom = new THREE.Vector3()
    let approachTo = new THREE.Vector3()

    ;[2.4, 4.8].forEach((t, i) => {
      const u = THREE.MathUtils.clamp(t / T_SPACE, 0, 1)
      const camAt = path.getPointAt(u)
      const perp = new THREE.Vector3(0, 1, 0).cross(camAt.clone().normalize()).normalize()
      const mesh = new THREE.Mesh(flybyGeo, flybyMat)
      mesh.position.copy(camAt)
      space.add(mesh)
      flybys.push({
        mesh,
        from: camAt.clone().add(perp.clone().multiplyScalar(i === 0 ? 42 : -38)).add(new THREE.Vector3(0, 10, 0)),
        to: camAt.clone().add(perp.clone().multiplyScalar(i === 0 ? -42 : 38)).add(new THREE.Vector3(0, -10, 0)),
        t0: t - 1.1,
        t1: t + 1.1,
      })
    })

    const lagos = new THREE.Scene()
    lagos.background = new THREE.Color(0x01040a)
    lagos.fog = new THREE.FogExp2(0x01040a, 0.0022)

    const lagosCamera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.5, 2600)
    lagosCamera.position.set(0, 190, 250)

    lagos.add(new THREE.HemisphereLight(0x2a6f9e, 0x000000, 1.4))
    const cityLight = new THREE.DirectionalLight(0x88bbff, 0.7)
    cityLight.position.set(40, 120, 60)
    lagos.add(cityLight)

    const ground = new THREE.Mesh(
      track(new THREE.PlaneGeometry(900, 900)),
      track(new THREE.MeshStandardMaterial({ color: 0x040a12, roughness: 0.95, metalness: 0.1 }))
    )
    ground.rotation.x = -Math.PI / 2
    lagos.add(ground)

    const lagoon = new THREE.Mesh(
      track(new THREE.PlaneGeometry(900, 150)),
      track(new THREE.MeshStandardMaterial({
        color: 0x021420, roughness: 0.15, metalness: 0.85,
        emissive: 0x001018, emissiveIntensity: 1,
      }))
    )
    lagoon.rotation.x = -Math.PI / 2
    lagoon.position.set(0, 0.15, 150)
    lagos.add(lagoon)

    const grid = new THREE.GridHelper(600, 60, 0x0a3550, 0x06192a)
    grid.position.y = 0.2
    lagos.add(grid)

    const BUILDINGS = isSmall ? 420 : 900
    const cityGeo = track(new THREE.BoxGeometry(1, 1, 1))
    const cityMat = track(new THREE.MeshStandardMaterial({
      color: 0x0a1220,
      emissive: BLUE,
      emissiveIntensity: 1.5,
      emissiveMap: track(windowTexture()),
      roughness: 0.6,
      metalness: 0.3,
    }))
    const city = new THREE.InstancedMesh(cityGeo, cityMat, BUILDINGS)
    const m4 = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const v = new THREE.Vector3()
    const sc = new THREE.Vector3()

    for (let i = 0; i < BUILDINGS; i++) {
      const a = Math.random() * Math.PI * 2
      const dist = Math.pow(Math.random(), 0.65) * 190
      const x = Math.cos(a) * dist
      const z = Math.sin(a) * dist * 0.8
      const h = 3 + Math.pow(Math.random(), 2.2) * 46
      const w = 2 + Math.random() * 4
      v.set(x, h / 2, z)
      sc.set(w, h, w)
      m4.compose(v, q, sc)
      city.setMatrixAt(i, m4)
    }
    city.instanceMatrix.needsUpdate = true
    lagos.add(city)

    const beam = new THREE.Mesh(
      track(new THREE.CylinderGeometry(0.5, 0.5, 130, 12, 1, true)),
      track(new THREE.MeshBasicMaterial({
        color: BLUE, transparent: true, opacity: 0.35,
        blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
      }))
    )
    beam.position.set(0, 65, 0)
    lagos.add(beam)

    const rings: THREE.Mesh[] = []
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(
        track(new THREE.RingGeometry(2.4, 2.9, 72)),
        track(new THREE.MeshBasicMaterial({
          color: BLUE, transparent: true, opacity: 0.0,
          blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
        }))
      )
      ring.rotation.x = -Math.PI / 2
      ring.position.y = 1.2
      lagos.add(ring)
      rings.push(ring)
    }

    const clock = new THREE.Clock()
    let raf = 0

    const renderSpace = (t: number, cam: THREE.Camera) => {
      planets.forEach((p) => {
        const a = p.angle + t * p.body.speed
        p.mesh.position.set(Math.cos(a) * p.body.orbit, 0, Math.sin(a) * p.body.orbit)
        p.mesh.rotation.y += 0.004
        p.mesh.rotation.z = p.body.tilt
      })

      starsFar.rotation.y = t * 0.004
      starsNear.rotation.y = t * 0.009
      sunCore.rotation.y = t * 0.05
      glow.scale.setScalar(46 + Math.sin(t * 1.6) * 1.6)

      flybys.forEach((f) => {
        const k = THREE.MathUtils.clamp((t - f.t0) / (f.t1 - f.t0), 0, 1)
        f.mesh.visible = k > 0 && k < 1
        if (f.mesh.visible) {
          f.mesh.position.lerpVectors(f.from, f.to, k)
          f.mesh.rotation.x = t * 2
          f.mesh.rotation.y = t * 1.4
        }
      })

      if (state.phase === 'space') {
        const u = THREE.MathUtils.clamp(state.u, 0, 1)
        cam.position.copy(path.getPointAt(u))
        const towardEarth = THREE.MathUtils.smoothstep(u, 0.6, 1)
        const target = new THREE.Vector3()
          .lerpVectors(new THREE.Vector3(0, 0, 0), earthMesh ? earthMesh.position : new THREE.Vector3(), towardEarth)
        cam.lookAt(target)
      } else {
        const k = THREE.MathUtils.clamp(state.approach, 0, 1)
        const eased = k * k
        cam.position.lerpVectors(approachFrom, approachTo, eased)
        if (earthMesh) cam.lookAt(earthMesh.position)
      }
    }

    const renderLagos = (t: number) => {
      const k = THREE.MathUtils.clamp(state.lagos, 0, 1)
      const e = 1 - Math.pow(1 - k, 3)
      lagosCamera.position.set(0, 190 - 150 * e, 250 - 180 * e)
      lagosCamera.lookAt(0, 10 * e, 0)

      rings.forEach((ring, i) => {
        const phase = (t * 0.55 + i * 0.33) % 1
        const s = 1 + phase * 26
        ring.scale.setScalar(s)
        const mat = ring.material as THREE.MeshBasicMaterial
        mat.opacity = Math.max(0, 0.75 * (1 - phase))
      })

      const beamMat = beam.material as THREE.MeshBasicMaterial
      beamMat.opacity = 0.25 + Math.sin(t * 2.2) * 0.08
    }

    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (document.hidden) return
      const t = clock.getElapsedTime()

      if (state.phase === 'lagos') {
        renderLagos(t)
        renderer.render(lagos, lagosCamera)
      } else {
        renderSpace(t, camera)
        renderer.render(space, camera)
      }
    }
    tick()

    const swapToLagos = () => {
      state.phase = 'lagos'
      state.lagos = 0
      lagosCamera.aspect = window.innerWidth / window.innerHeight
      lagosCamera.updateProjectionMatrix()
    }

    const tl = gsap.timeline({
      onComplete: () => {
        revealLogo()
      },
    })

    tl.to(state, { u: 1, duration: T_SPACE, ease: 'power1.inOut' })
      .add(() => {
        state.phase = 'approach'
        approachFrom = camera.position.clone()
        const target = earthMesh ? earthMesh.position.clone() : new THREE.Vector3()
        const dir = approachFrom.clone().sub(target).normalize()
        approachTo = target.clone().add(dir.multiplyScalar(5.4))
      })
      .to(state, { approach: 1, duration: T_APPROACH, ease: 'power2.in' })
      .to(flashRef.current, { opacity: 1, duration: 0.45, ease: 'power2.in' }, '-=0.5')
      .add(swapToLagos)
      .to(flashRef.current, { opacity: 0, duration: 0.7, ease: 'power2.out' })
      .to(state, { lagos: 1, duration: T_LAGOS, ease: 'power2.out' }, '-=0.3')
      .to(blackRef.current, { opacity: 1, duration: 0.7, ease: 'power2.inOut' })

    const revealLogo = () => {
      const root = logoRef.current
      if (!root) return finish()
      const [img, title, sub] = Array.from(root.children) as HTMLElement[]

      gsap.set(root, { opacity: 1 })
      gsap.set([title, sub], { opacity: 0, y: 24 })
      gsap.set(img, { opacity: 0, scale: 0.55, filter: 'blur(18px)' })

      gsap.timeline({ onComplete: finish })
        .to(img, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.1, ease: 'expo.out' })
        .to(title, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.45')
        .to(sub, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.55')
        .to({}, { duration: T_LOGO_HOLD })
        .to(root, { opacity: 0, duration: 0.8, ease: 'power2.inOut' })
    }

    let finished = false
    function finish() {
      if (finished) return
      finished = true
      cleanup()
      doneRef.current()
    }

    const skip = () => {
      tl.kill()
      gsap.killTweensOf([flashRef.current, blackRef.current, logoRef.current])
      finish()
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') skip()
    }
    window.addEventListener('keydown', onKey)
    skipRef.current?.addEventListener('click', skip)

    const onResize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      lagosCamera.aspect = w / h
      lagosCamera.updateProjectionMatrix()
    }
    window.addEventListener('resize', onResize)

    function cleanup() {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
      skipRef.current?.removeEventListener('click', skip)
      tl.kill()
      disposables.forEach((d) => d.dispose())
      renderer.dispose()
      renderer.forceContextLoss()
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement)
    }

    return cleanup
  }, [])

  return (
    <div className="fixed inset-0 z-[100] bg-black overflow-hidden">
      <div ref={hostRef} className="absolute inset-0" />

      <div ref={flashRef} className="pointer-events-none absolute inset-0 bg-white opacity-0" />

      <div ref={blackRef} className="pointer-events-none absolute inset-0 bg-black opacity-0" />

      <div ref={logoRef} className="absolute inset-0 flex flex-col items-center justify-center opacity-0">
        <img src="/logo.png" alt="Evolved Tech" className="h-32 w-32 object-contain md:h-40 md:w-40" />
        <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-white md:text-6xl">EVOLVED TECH</h1>
        <p className="mt-4 text-[10px] tracking-[0.45em] text-[#00A3FF] md:text-sm">
          FROM LAGOS TO THE WORLD
        </p>
      </div>

      <button
        ref={skipRef}
        className="absolute bottom-8 right-8 z-10 rounded-full border border-white/20 px-5 py-2 text-[10px] uppercase tracking-[0.3em] text-white/60 backdrop-blur-md transition-colors hover:bg-white/10 hover:text-white"
      >
        Skip
      </button>
    </div>
  )
}
