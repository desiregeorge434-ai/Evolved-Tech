'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'

type Props = { onComplete: () => void }

const BLUE = 0x00a3ff
const TAGLINE = 'DRAWING YOUR GAMES INTO EXISTENCE'

const CONSTELLATIONS = [
  'ORION', 'LYRA', 'CYGNUS', 'DRACO', 'PERSEUS', 'CEPHEUS',
  'AQUILA', 'CASSIOPEIA', 'PEGASUS', 'ANDROMEDA', 'TAURUS', 'LEO',
]

function radialTexture(stops: Array<[number, string]>): THREE.CanvasTexture {
  const s = 512
  const c = document.createElement('canvas')
  c.width = c.height = s
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
  stops.forEach(([o, col]) => g.addColorStop(o, col))
  ctx.fillStyle = g
  ctx.fillRect(0, 0, s, s)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function ringTexture(): THREE.CanvasTexture {
  const w = 512
  const c = document.createElement('canvas')
  c.width = w
  c.height = 8
  const ctx = c.getContext('2d')!
  for (let x = 0; x < w; x++) {
    const t = x / w
    const band = Math.sin(t * 90) * 0.5 + 0.5
    const fade = Math.sin(Math.PI * t)
    const a = Math.max(0, (band * 0.55 + 0.15) * fade)
    const l = 150 + band * 70
    ctx.fillStyle = `rgba(${l + 40},${l + 20},${l - 10},${a})`
    ctx.fillRect(x, 0, 1, 8)
  }
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function streetTexture(): THREE.CanvasTexture {
  const s = 1024
  const c = document.createElement('canvas')
  c.width = c.height = s
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#050b13'
  ctx.fillRect(0, 0, s, s)
  ctx.strokeStyle = 'rgba(60,150,220,0.30)'
  ctx.lineWidth = 2
  for (let i = 0; i <= 16; i++) {
    const p = (i / 16) * s
    ctx.beginPath()
    ctx.moveTo(p, 0)
    ctx.lineTo(p, s)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, p)
    ctx.lineTo(s, p)
    ctx.stroke()
  }
  for (let i = 0; i < 260; i++) {
    ctx.fillStyle = `rgba(90,150,210,${0.02 + Math.random() * 0.05})`
    ctx.fillRect(Math.random() * s, Math.random() * s, 6 + Math.random() * 22, 6 + Math.random() * 22)
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(6, 6)
  return t
}

function windowTexture(): THREE.CanvasTexture {
  const s = 256
  const c = document.createElement('canvas')
  c.width = c.height = s
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#000206'
  ctx.fillRect(0, 0, s, s)
  const cols = 10
  const rows = 26
  const cw = s / cols
  const ch = s / rows
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (Math.random() < 0.38) continue
      const warm = Math.random() < 0.3
      ctx.fillStyle = warm ? 'rgba(255,206,140,0.95)' : 'rgba(160,225,255,0.9)'
      ctx.fillRect(x * cw + cw * 0.2, y * ch + ch * 0.3, cw * 0.6, ch * 0.4)
    }
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  return t
}

function cloudTexture(): THREE.CanvasTexture {
  const w = 1024
  const h = 512
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')!
  for (let i = 0; i < 220; i++) {
    const x = Math.random() * w
    const y = Math.random() * h
    const r = 18 + Math.random() * 70
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, `rgba(255,255,255,${0.16 + Math.random() * 0.28})`)
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = THREE.RepeatWrapping
  return t
}

function ellipseShape(rx: number, rz: number, segments = 96, jitter = 0): THREE.Shape {
  const shape = new THREE.Shape()
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2
    const k = 1 + (jitter ? Math.sin(a * 3.3) * jitter + Math.cos(a * 5.1) * jitter * 0.6 : 0)
    const x = Math.cos(a) * rx * k
    const y = Math.sin(a) * rz * k
    if (i === 0) shape.moveTo(x, y)
    else shape.lineTo(x, y)
  }
  return shape
}

function insideEllipse(x: number, z: number, cx: number, cz: number, rx: number, rz: number) {
  const dx = (x - cx) / rx
  const dz = (z - cz) / rz
  return dx * dx + dz * dz <= 1
}

const BODIES = [
  { name: 'MERCURY', radius: 2.2, orbit: 58, speed: 0.20, tilt: 0.02, map: '/mercury.png' },
  { name: 'VENUS', radius: 4, orbit: 80, speed: 0.15, tilt: 0.06, map: '/venus.png' },
  { name: 'EARTH', radius: 9, orbit: 110, speed: 0.10, tilt: 0.41, map: '/earth-day.png' },
  { name: 'MARS', radius: 3.4, orbit: 135, speed: 0.08, tilt: 0.05, map: '/mars.png' },
  { name: 'JUPITER', radius: 16, orbit: 180, speed: 0.045, tilt: 0.05, map: '/jupiter.jpg' },
  { name: 'SATURN', radius: 13, orbit: 225, speed: 0.032, tilt: 0.47, map: '/saturn.png', ring: true },
  { name: 'URANUS', radius: 8.5, orbit: 275, speed: 0.022, tilt: 0.97, map: '/uranus.png' },
  { name: 'NEPTUNE', radius: 8, orbit: 320, speed: 0.016, tilt: 0.49, map: '/neptune.png' },
]

export function CinematicIntro({ onComplete }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const flashRef = useRef<HTMLDivElement>(null)
  const blackRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const skipRef = useRef<HTMLButtonElement>(null)
  const barsRef = useRef<HTMLDivElement>(null)
  const phraseRef = useRef<HTMLDivElement>(null)
  const logoMainRef = useRef<HTMLImageElement>(null)
  const logoRedRef = useRef<HTMLImageElement>(null)
  const logoCyanRef = useRef<HTMLImageElement>(null)
  const logoTitleRef = useRef<HTMLHeadingElement>(null)
  const logoSubRef = useRef<HTMLParagraphElement>(null)
  const logoLineRef = useRef<HTMLDivElement>(null)

  const doneRef = useRef(onComplete)
  doneRef.current = onComplete

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
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
    const useBloom = !isSmall
    const pixelRatio = Math.min(window.devicePixelRatio, isSmall ? 1.2 : 1.35)

    renderer.setPixelRatio(pixelRatio)
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
    const loadTex = (url: string): THREE.Texture => {
      const tex = loader.load(url)
      tex.colorSpace = THREE.SRGBColorSpace
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy()
      tex.minFilter = THREE.LinearMipmapLinearFilter
      tex.magFilter = THREE.LinearFilter
      tex.generateMipmaps = true
      return track(tex)
    }

    const makeLabel = (text: string, color: string, size: number) => {
      const fs = 44
      const pad = 12
      const measure = document.createElement('canvas').getContext('2d')!
      measure.font = `600 ${fs}px system-ui, sans-serif`
      const w = Math.ceil(measure.measureText(text).width) + pad * 2
      const h = fs + pad * 2
      const c = document.createElement('canvas')
      c.width = w
      c.height = h
      const ctx = c.getContext('2d')!
      ctx.font = `600 ${fs}px system-ui, sans-serif`
      ctx.fillStyle = color
      ctx.textBaseline = 'middle'
      ctx.fillText(text, pad, h / 2)
      const tex = track(new THREE.CanvasTexture(c))
      tex.colorSpace = THREE.SRGBColorSpace
      const mat = track(new THREE.SpriteMaterial({
        map: tex, transparent: true, depthWrite: false, depthTest: false,
        sizeAttenuation: false, opacity: 0.75,
      }))
      const spr = new THREE.Sprite(mat)
      spr.scale.set((w / h) * size, size, 1)
      return spr
    }

    const space = new THREE.Scene()
    space.background = new THREE.Color(0x000104)

    const composer = useBloom ? new EffectComposer(renderer) : null
    if (composer) {
      composer.setPixelRatio(pixelRatio)
      composer.setSize(window.innerWidth, window.innerHeight)
    }

    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 8000)
    camera.position.set(0, 14, 120)

    const starSprite = track(radialTexture([
      [0, 'rgba(255,255,255,1)'],
      [0.35, 'rgba(255,255,255,0.4)'],
      [1, 'rgba(255,255,255,0)'],
    ]))

    const starPositions: Float32Array[] = []
    const makeStars = (count: number, rMin: number, rMax: number, size: number, opacity: number) => {
      const pos = new Float32Array(count * 3)
      const col = new Float32Array(count * 3)
      for (let i = 0; i < count; i++) {
        const r = rMin + Math.random() * (rMax - rMin)
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)
        pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
        pos[i * 3 + 1] = r * Math.cos(phi)
        pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
        const tint = 0.78 + Math.random() * 0.22
        col[i * 3] = tint
        col[i * 3 + 1] = tint
        col[i * 3 + 2] = Math.min(1, tint + Math.random() * 0.12)
      }
      starPositions.push(pos)
      const geo = track(new THREE.BufferGeometry())
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3))
      const mat = track(new THREE.PointsMaterial({
        vertexColors: true, size, sizeAttenuation: true,
        transparent: true, opacity, depthWrite: false,
        map: starSprite, alphaTest: 0.01, blending: THREE.AdditiveBlending,
      }))
      const pts = new THREE.Points(geo, mat)
      space.add(pts)
      return pts
    }
    makeStars(1500, 260, 520, 2.6, 0.95)
    const starsFar = makeStars(2400, 800, 2200, 5.0, 0.55)

    const constellationGroup = new THREE.Group()
    space.add(constellationGroup)
    {
      const R = 2400
      const lineVerts: number[] = []
      const up = new THREE.Vector3(0, 1, 0)
      CONSTELLATIONS.forEach((name) => {
        const dir = new THREE.Vector3(
          Math.random() * 2 - 1,
          Math.random() * 2 - 1,
          Math.random() * 2 - 1
        ).normalize()
        const t1 = new THREE.Vector3().crossVectors(dir, up)
        if (t1.lengthSq() < 0.01) t1.set(1, 0, 0)
        t1.normalize()
        const t2 = new THREE.Vector3().crossVectors(dir, t1).normalize()

        const n = 5 + Math.floor(Math.random() * 3)
        const pts: THREE.Vector3[] = []
        for (let i = 0; i < n; i++) {
          const a = (i / (n - 1) - 0.5) * 0.20 + (Math.random() - 0.5) * 0.04
          const b = (Math.random() - 0.5) * 0.12
          pts.push(dir.clone().addScaledVector(t1, a).addScaledVector(t2, b).normalize().multiplyScalar(R))
        }
        for (let i = 0; i < pts.length - 1; i++) {
          lineVerts.push(pts[i].x, pts[i].y, pts[i].z, pts[i + 1].x, pts[i + 1].y, pts[i + 1].z)
        }
        const label = makeLabel(name, '#9ec9f0', 0.022)
        label.position.copy(pts[Math.floor(pts.length / 2)]).multiplyScalar(0.97)
        constellationGroup.add(label)
      })

      const geo = track(new THREE.BufferGeometry())
      geo.setAttribute('position', new THREE.Float32BufferAttribute(lineVerts, 3))
      constellationGroup.add(new THREE.LineSegments(geo, track(new THREE.LineBasicMaterial({
        color: 0x6fa8d8, transparent: true, opacity: 0.28,
      }))))
    }

    const sunGroup = new THREE.Group()
    space.add(sunGroup)

    const sunMat = track(new THREE.MeshBasicMaterial({ map: loadTex('/sun.jpg'), color: 0xffffff }))
    const sunCore = new THREE.Mesh(track(new THREE.SphereGeometry(20, 96, 96)), sunMat)
    sunGroup.add(sunCore)


    const flare = new THREE.Sprite(track(new THREE.SpriteMaterial({
      map: track(radialTexture([
        [0, 'rgba(255,255,255,1)'],
        [0.1, 'rgba(255,252,240,0.85)'],
        [0.3, 'rgba(255,226,170,0.25)'],
        [1, 'rgba(255,200,120,0)'],
      ])),
      blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.9,
    })))
    flare.scale.setScalar(170)
    sunGroup.add(flare)

    sunGroup.add(new THREE.PointLight(0xfff6e6, 3.6, 0, 0))
    space.add(new THREE.AmbientLight(0x141c2a, 1.3))

    type Planet = { mesh: THREE.Mesh; label: THREE.Sprite; angle: number; orbit: number; speed: number; tilt: number; spin: number }
    const planets: Planet[] = []
    let earthMesh: THREE.Mesh | null = null
    let earthClouds: THREE.Mesh | null = null
    let earthRadius = 5.5

    BODIES.forEach((body, i) => {
      const orbitPts: THREE.Vector3[] = []
      for (let s = 0; s <= 220; s++) {
        const a = (s / 220) * Math.PI * 2
        orbitPts.push(new THREE.Vector3(Math.cos(a) * body.orbit, 0, Math.sin(a) * body.orbit))
      }
      const orbitGeo = track(new THREE.BufferGeometry().setFromPoints(orbitPts))
      space.add(new THREE.Line(orbitGeo, track(new THREE.LineBasicMaterial({
        color: 0x3f6f9e, transparent: true, opacity: 0.2,
      }))))

      const geo = track(new THREE.SphereGeometry(body.radius, body.radius > 4 ? 96 : 64, body.radius > 4 ? 96 : 64))
      const mat = track(new THREE.MeshStandardMaterial({
        map: loadTex(body.map), roughness: 0.92, metalness: 0.02,
      }))
      const mesh = new THREE.Mesh(geo, mat)
      mesh.rotation.z = body.tilt
      space.add(mesh)

      const label = makeLabel(body.name, '#a8cbe8', 0.016)
      space.add(label)

      if (body.ring) {
        const ringGeo = track(new THREE.RingGeometry(body.radius * 1.5, body.radius * 2.55, 128))
        const pos = ringGeo.attributes.position
        const uv = ringGeo.attributes.uv
        for (let k = 0; k < pos.count; k++) {
          const d = Math.hypot(pos.getX(k), pos.getY(k))
          uv.setXY(k, (d - body.radius * 1.5) / (body.radius * 1.05), 0.5)
        }
        const ring = new THREE.Mesh(ringGeo, track(new THREE.MeshBasicMaterial({
          map: track(ringTexture()), transparent: true, side: THREE.DoubleSide,
          depthWrite: false, opacity: 0.9,
        })))
        ring.rotation.x = Math.PI / 2.1
        mesh.add(ring)
      }

      planets.push({
        mesh,
        label,
        angle: (i / BODIES.length) * Math.PI * 2,
        orbit: body.orbit,
        speed: body.speed,
        tilt: body.tilt,
        spin: 0.05 + Math.random() * 0.06,
      })

      if (body.name === 'EARTH') {
        earthMesh = mesh
        earthRadius = body.radius

        earthClouds = new THREE.Mesh(
          track(new THREE.SphereGeometry(body.radius * 1.02, 64, 64)),
          track(new THREE.MeshStandardMaterial({
            map: track(cloudTexture()),
            transparent: true,
            opacity: 0.75,
            depthWrite: false,
            roughness: 1,
            metalness: 0,
          }))
        )
        mesh.add(earthClouds)
      }
    })

    const rockGeo = track(new THREE.IcosahedronGeometry(1, 0))
    const rockMat = track(new THREE.MeshStandardMaterial({
      color: 0x6b665c, roughness: 1, metalness: 0.05, flatShading: true,
    }))

    const belt = new THREE.Group()
    space.add(belt)
    const BELT = isSmall ? 70 : 140
    const asteroids = new THREE.InstancedMesh(rockGeo, rockMat, BELT)
    {
      const mm = new THREE.Matrix4()
      const qq = new THREE.Quaternion()
      const ee = new THREE.Euler()
      const vv = new THREE.Vector3()
      const ss = new THREE.Vector3()
      for (let i = 0; i < BELT; i++) {
        const a = Math.random() * Math.PI * 2
        const r = 128 + Math.random() * 22
        const scl = 0.2 + Math.pow(Math.random(), 2.2) * 1.7
        vv.set(Math.cos(a) * r, (Math.random() - 0.5) * 8, Math.sin(a) * r)
        ee.set(Math.random() * 6.28, Math.random() * 6.28, Math.random() * 6.28)
        qq.setFromEuler(ee)
        ss.set(scl, scl * (0.7 + Math.random() * 0.6), scl)
        mm.compose(vv, qq, ss)
        asteroids.setMatrixAt(i, mm)
      }
      asteroids.instanceMatrix.needsUpdate = true
    }
    belt.add(asteroids)

    const path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 34, 470),
      new THREE.Vector3(18, 12, 350),
      new THREE.Vector3(-12, 2, 250),
      new THREE.Vector3(6, -2, 175),
      new THREE.Vector3(0, 0, 128),
    ])

    const T_SPACE = 6.0
    const T_APPROACH = 3.2
    const T_WORLD = 3.2
    const T_LOGO_HOLD = 2.2

    const state = { u: 0, approach: 0, world: 0, phase: 'space' as 'space' | 'approach' | 'world' }
    let approachFrom = new THREE.Vector3()
    let approachTo = new THREE.Vector3()

    type Flyby = { mesh: THREE.Mesh; from: THREE.Vector3; to: THREE.Vector3; t0: number; t1: number }
    const flybys: Flyby[] = []

    ;[2.6, 5.0].forEach((t, i) => {
      const u = THREE.MathUtils.clamp(t / T_SPACE, 0, 1)
      const camAt = path.getPointAt(u)
      const perp = new THREE.Vector3(0.3, 1, 0).cross(camAt.clone().normalize()).normalize()
      const mesh = new THREE.Mesh(rockGeo, rockMat)
      mesh.position.copy(camAt)
      mesh.scale.setScalar(6 + i * 4)
      space.add(mesh)
      flybys.push({
        mesh,
        from: camAt.clone().add(perp.clone().multiplyScalar(i === 0 ? 52 : -48)).add(new THREE.Vector3(0, 14, 0)),
        to: camAt.clone().add(perp.clone().multiplyScalar(i === 0 ? -52 : 48)).add(new THREE.Vector3(0, -14, 0)),
        t0: t - 1.2,
        t1: t + 1.2,
      })
    })

    const world = new THREE.Scene()
    world.background = new THREE.Color(0x02030a)
    world.fog = new THREE.FogExp2(0x02030a, 0.0015)

    const worldCamera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.5, 5000)
    worldCamera.position.set(0, 200, 340)

    world.add(new THREE.HemisphereLight(0x5a6bff, 0x02030a, 0.9))
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4)
    keyLight.position.set(60, 160, 90)
    world.add(keyLight)
    const rimLight = new THREE.PointLight(0x00a3ff, 2.2, 0, 0)
    rimLight.position.set(0, 40, -140)
    world.add(rimLight)

    const gridFloor = new THREE.GridHelper(2400, 120, 0x1c3a6e, 0x0e1c38)
    gridFloor.position.y = -20
    world.add(gridFloor)

    const gridCeiling = new THREE.GridHelper(2400, 60, 0x14223c, 0x0a1224)
    gridCeiling.position.y = 280
    world.add(gridCeiling)

    const gridMats: THREE.LineBasicMaterial[] = []
    ;[gridFloor, gridCeiling].forEach((g) => {
      const m = g.material as THREE.LineBasicMaterial
      m.transparent = true
      m.opacity = 0
      gridMats.push(m)
    })

    const objects: THREE.Mesh[] = []
    const shapes = [
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.IcosahedronGeometry(1, 0),
      new THREE.OctahedronGeometry(1, 0),
      new THREE.TorusGeometry(1, 0.34, 12, 36),
      new THREE.ConeGeometry(1, 1.7, 6),
      new THREE.DodecahedronGeometry(1, 0),
    ]
    const palette = [0x00a3ff, 0x7c5cff, 0xff5cc8, 0x35e0c0, 0xffb347]

    for (let i = 0; i < 18; i++) {
      const mat = track(new THREE.MeshStandardMaterial({
        color: 0x05060f,
        emissive: palette[i % palette.length],
        emissiveIntensity: 1.45,
        roughness: 0.35,
        metalness: 0.55,
        flatShading: true,
      }))
      const mesh = new THREE.Mesh(track(shapes[i % shapes.length]), mat)
      const s = 4 + Math.random() * 9
      mesh.userData.base = s
      mesh.scale.setScalar(0.001)
      mesh.position.set(
        (Math.random() - 0.5) * 430,
        5 + Math.random() * 150,
        (Math.random() - 0.5) * 430
      )
      mesh.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3)
      world.add(mesh)
      objects.push(mesh)
    }

    const composerWorld = useBloom ? new EffectComposer(renderer) : null
    if (composerWorld) {
      composerWorld.setPixelRatio(pixelRatio)
      composerWorld.setSize(window.innerWidth, window.innerHeight)
    }

    const clock = new THREE.Clock()
    let raf = 0

    const smoothTarget = new THREE.Vector3(0, 0, 0)
    const desiredTarget = new THREE.Vector3(0, 0, 0)
    const axisY = new THREE.Vector3(0, 1, 0)
    const labelOffset = new THREE.Vector3()

    let orbitPhase = 0
    let prevT = 0

    const renderSpace = (t: number, cam: THREE.PerspectiveCamera) => {
      const dt = Math.min(0.05, Math.max(0.001, t - prevT))
      prevT = t
      const timeScale = state.phase === 'space'
        ? 1
        : THREE.MathUtils.lerp(1, 0.06, state.approach)
      orbitPhase += dt * timeScale

      planets.forEach((p) => {
        const a = p.angle + orbitPhase * p.speed
        p.mesh.position.set(Math.cos(a) * p.orbit, 0, Math.sin(a) * p.orbit)
        p.mesh.rotation.z = p.tilt
        p.mesh.rotateOnAxis(axisY, p.spin * 0.02)
        labelOffset.copy(p.mesh.position).multiplyScalar(1.06)
        labelOffset.y += p.mesh.geometry.boundingSphere
          ? p.mesh.geometry.boundingSphere.radius * 1.9
          : 2
        p.label.position.copy(labelOffset)
      })

      belt.rotation.y = t * 0.012
      asteroids.rotation.y = t * 0.02
      constellationGroup.rotation.y = t * 0.0025
      if (earthClouds) earthClouds.rotation.y = t * 0.012

      starsFar.rotation.y = t * 0.002

      flybys.forEach((f) => {
        const k = THREE.MathUtils.clamp((t - f.t0) / (f.t1 - f.t0), 0, 1)
        f.mesh.visible = k > 0 && k < 1
        if (f.mesh.visible) {
          f.mesh.position.lerpVectors(f.from, f.to, k)
          f.mesh.rotation.x = t * 1.6
          f.mesh.rotation.y = t * 1.1
        }
      })

      if (state.phase === 'space') {
        const u = THREE.MathUtils.clamp(state.u, 0, 1)
        cam.position.copy(path.getPointAt(u))
        const towardEarth = THREE.MathUtils.smoothstep(u, 0.62, 1)
        desiredTarget.lerpVectors(
          new THREE.Vector3(0, 0, 0),
          earthMesh ? earthMesh.position : new THREE.Vector3(),
          towardEarth
        )
        if (cam.fov !== 55) {
          cam.fov = 55
          cam.updateProjectionMatrix()
        }
      } else {
        const k = THREE.MathUtils.clamp(state.approach, 0, 1)
        const eased = Math.pow(k, 2.4)
        cam.position.lerpVectors(approachFrom, approachTo, eased)
        if (earthMesh) desiredTarget.copy(earthMesh.position)
        const fov = THREE.MathUtils.lerp(55, 26, eased)
        if (Math.abs(cam.fov - fov) > 0.01) {
          cam.fov = fov
          cam.updateProjectionMatrix()
        }
      }

      smoothTarget.lerp(desiredTarget, 1 - Math.exp(-3.2 * dt))
      cam.lookAt(smoothTarget)
    }

    const renderWorld = (t: number) => {
      const k = THREE.MathUtils.clamp(state.world, 0, 1)
      const e = 1 - Math.pow(1 - k, 3)
      worldCamera.position.set(0, 205 - 155 * e, 345 - 250 * e)
      worldCamera.lookAt(0, 55 - 10 * e, 0)

      objects.forEach((m, i) => {
        const base = (m.userData.base as number) || 6
        const appear = THREE.MathUtils.smoothstep(k, 0.02 + (i % 7) * 0.05, 0.5 + (i % 7) * 0.06)
        m.scale.setScalar(Math.max(0.001, base * appear))
        m.rotation.x = t * (0.10 + (i % 5) * 0.03)
        m.rotation.y = t * (0.08 + (i % 4) * 0.03)
      })

      gridMats.forEach((m) => { m.opacity = 0.55 * THREE.MathUtils.smoothstep(k, 0, 0.5) })

      gridFloor.position.z = (t * 6) % 20
      gridCeiling.position.z = (t * 3) % 40
    }

    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (document.hidden) return
      const t = clock.getElapsedTime()

      if (state.phase === 'world') {
        renderWorld(t)
        if (composerWorld) composerWorld.render()
        else renderer.render(world, worldCamera)
      } else {
        renderSpace(t, camera)
        if (composer) composer.render()
        else renderer.render(space, camera)
      }
    }

    if (composer) {
      composer.addPass(new RenderPass(space, camera))
      composer.addPass(new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2), 0.9, 0.6, 0.72
      ))
      composer.addPass(new OutputPass())
    }

    if (composerWorld) {
      composerWorld.addPass(new RenderPass(world, worldCamera))
      composerWorld.addPass(new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2), 1.0, 0.7, 0.4
      ))
      composerWorld.addPass(new OutputPass())
    }

    tick()

    const swapToWorld = () => {
      state.phase = 'world'
      state.world = 0
      worldCamera.aspect = window.innerWidth / window.innerHeight
      worldCamera.updateProjectionMatrix()
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
        approachTo = target.clone().add(dir.multiplyScalar(earthRadius * 1.04))
      })
      .to(state, { approach: 1, duration: T_APPROACH, ease: 'power2.in' })
      .to(flashRef.current, { opacity: 1, duration: 0.5, ease: 'power2.in' }, '-=0.55')
      .add(swapToWorld)
      .to(flashRef.current, { opacity: 0, duration: 0.8, ease: 'power2.out' })
      .to(state, { world: 1, duration: T_WORLD, ease: 'power2.out' }, '-=0.35')
      .to(phraseRef.current, { opacity: 1, duration: 1.1, ease: 'power2.out' }, '-=2.2')
      .to(phraseRef.current, { opacity: 0, duration: 0.5, ease: 'power2.in' }, '+=1.4')
      .to(blackRef.current, { opacity: 0.78, duration: 0.75, ease: 'power2.inOut' })
      .to(barsRef.current, { opacity: 0, duration: 0.9, ease: 'power2.inOut' }, '-=0.4')

    const revealLogo = () => {
      const root = logoRef.current
      const main = logoMainRef.current
      const red = logoRedRef.current
      const cyan = logoCyanRef.current
      const title = logoTitleRef.current
      const sub = logoSubRef.current
      const line = logoLineRef.current
      if (!root || !main || !red || !cyan || !title || !sub || !line) return finish()

      gsap.set(root, { opacity: 1 })
      gsap.set(main, { opacity: 0, scale: 1.55, filter: 'blur(38px) brightness(2.4)' })
      gsap.set([red, cyan], { opacity: 0, scale: 1.55 })
      gsap.set([title, sub], { opacity: 0, y: 30 })
      gsap.set(line, { xPercent: -130 })

      gsap.timeline({ onComplete: finish })
        .to(main, { opacity: 1, scale: 1, filter: 'blur(0px) brightness(1)', duration: 1.15, ease: 'expo.out' })
        .to([red, cyan], { opacity: 0.5, scale: 1, duration: 0.9, ease: 'expo.out' }, '<')
        .to(red, { x: -7, y: 2, duration: 0.28, ease: 'power2.out' }, '-=0.55')
        .to(cyan, { x: 7, y: -2, duration: 0.28, ease: 'power2.out' }, '<')
        .to([red, cyan], { x: 0, y: 0, opacity: 0, duration: 0.55, ease: 'power2.inOut' }, '+=0.2')
        .to(line, { xPercent: 130, duration: 0.95, ease: 'power2.inOut' }, '-=0.7')
        .to(title, { opacity: 1, y: 0, duration: 0.7, ease: 'power4.out' }, '-=0.5')
        .to(sub, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.45')
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
      gsap.killTweensOf([flashRef.current, blackRef.current, logoRef.current, barsRef.current])
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
      worldCamera.aspect = w / h
      worldCamera.updateProjectionMatrix()
      composer?.setSize(w, h)
      composerWorld?.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    function cleanup() {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
      skipRef.current?.removeEventListener('click', skip)
      tl.kill()
      composer?.dispose()
      composerWorld?.dispose()
      disposables.forEach((d) => d.dispose())
      renderer.dispose()
      renderer.forceContextLoss()
      if (host && renderer.domElement.parentNode === host) host.removeChild(renderer.domElement)
    }

    return cleanup
  }, [])

  return (
    <div className="fixed inset-0 z-[100] bg-black overflow-hidden">
      <div ref={hostRef} className="absolute inset-0" />

      <div className="pointer-events-none absolute inset-0 z-[5]" style={{
        background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 100%)',
      }} />

      <div ref={barsRef} className="pointer-events-none absolute inset-0 z-[6]">
        <div className="absolute inset-x-0 top-0 h-[7vh] bg-black" />
        <div className="absolute inset-x-0 bottom-0 h-[7vh] bg-black" />
      </div>

      <div ref={flashRef} className="pointer-events-none absolute inset-0 z-[7] bg-white opacity-0" />

      <div ref={phraseRef} className="pointer-events-none absolute inset-0 z-[8] flex items-center justify-center opacity-0">
        <p className="px-8 text-center text-xl font-semibold uppercase leading-relaxed tracking-[0.22em] text-white md:text-4xl md:tracking-[0.3em]">
          {TAGLINE}
        </p>
      </div>

      <div ref={blackRef} className="pointer-events-none absolute inset-0 z-[8] bg-black opacity-0" />

      <div ref={logoRef} className="absolute inset-0 z-[9] flex flex-col items-center justify-center opacity-0">
        <div className="relative flex h-32 w-32 items-center justify-center md:h-44 md:w-44">
          <img
            ref={logoRedRef}
            src="/logo.png"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-contain opacity-0"
            style={{ filter: 'drop-shadow(0 0 10px rgba(255,0,80,0.9)) saturate(2)' }}
          />
          <img
            ref={logoCyanRef}
            src="/logo.png"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-contain opacity-0"
            style={{ filter: 'drop-shadow(0 0 10px rgba(0,200,255,0.9)) saturate(2)' }}
          />
          <img
            ref={logoMainRef}
            src="/logo.png"
            alt="Evolved Tech"
            className="relative h-full w-full object-contain opacity-0"
          />
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div
              ref={logoLineRef}
              className="absolute left-0 top-0 h-full w-1/3 -translate-x-full bg-gradient-to-r from-transparent via-white/70 to-transparent"
            />
          </div>
        </div>

        <h1 ref={logoTitleRef} className="mt-8 text-4xl font-extrabold tracking-tight text-white opacity-0 md:text-6xl">
          EVOLVED TECH
        </h1>
        <p ref={logoSubRef} className="mt-4 text-[10px] tracking-[0.45em] text-[#00A3FF] opacity-0 md:text-sm">
          HOME OF LIMN ENGINE
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
