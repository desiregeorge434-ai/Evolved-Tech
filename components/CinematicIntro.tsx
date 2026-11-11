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
  { name: 'MERCURY', radius: 1.4, orbit: 52, speed: 0.20, tilt: 0.02, map: '/mercury.png' },
  { name: 'VENUS', radius: 2.6, orbit: 70, speed: 0.15, tilt: 0.06, map: '/venus.png' },
  { name: 'EARTH', radius: 5.5, orbit: 95, speed: 0.10, tilt: 0.41, map: '/earth-day.png' },
  { name: 'MARS', radius: 2.2, orbit: 118, speed: 0.08, tilt: 0.05, map: '/mars.png' },
  { name: 'JUPITER', radius: 11, orbit: 158, speed: 0.045, tilt: 0.05, map: '/jupiter.jpg' },
  { name: 'SATURN', radius: 9, orbit: 200, speed: 0.032, tilt: 0.47, map: '/saturn.png', ring: true },
  { name: 'URANUS', radius: 5.5, orbit: 245, speed: 0.022, tilt: 0.97, map: '/uranus.png' },
  { name: 'NEPTUNE', radius: 5.2, orbit: 285, speed: 0.016, tilt: 0.49, map: '/neptune.png' },
]

export function CinematicIntro({ onComplete }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const flashRef = useRef<HTMLDivElement>(null)
  const blackRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const skipRef = useRef<HTMLButtonElement>(null)
  const barsRef = useRef<HTMLDivElement>(null)

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
      tex.anisotropy = 2
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
    const sunCore = new THREE.Mesh(track(new THREE.SphereGeometry(14, 64, 64)), sunMat)
    sunGroup.add(sunCore)

    const coronaMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color(0xffe7c2) } },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vView;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vView = -mv.xyz;
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor;
        varying vec3 vNormal;
        varying vec3 vView;
        void main() {
          float f = pow(1.0 - abs(dot(normalize(vView), normalize(vNormal))), 2.6);
          float flick = 0.88 + 0.12 * sin(uTime * 2.1) * sin(uTime * 0.8 + 1.1);
          float a = f * flick * 0.55;
          gl_FragColor = vec4(uColor * a, a);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    track(coronaMat)
    const corona = new THREE.Mesh(track(new THREE.SphereGeometry(18, 48, 48)), coronaMat)
    sunGroup.add(corona)

    const flare = new THREE.Sprite(track(new THREE.SpriteMaterial({
      map: track(radialTexture([
        [0, 'rgba(255,255,255,1)'],
        [0.1, 'rgba(255,252,240,0.85)'],
        [0.3, 'rgba(255,226,170,0.25)'],
        [1, 'rgba(255,200,120,0)'],
      ])),
      blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.9,
    })))
    flare.scale.setScalar(120)
    sunGroup.add(flare)

    sunGroup.add(new THREE.PointLight(0xfff6e6, 3.6, 0, 0))
    space.add(new THREE.AmbientLight(0x141c2a, 1.3))

    type Planet = { mesh: THREE.Mesh; label: THREE.Sprite; angle: number; orbit: number; speed: number; tilt: number; spin: number }
    const planets: Planet[] = []
    let earthMesh: THREE.Mesh | null = null
    let earthHalo: THREE.SpriteMaterial | null = null
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

      const geo = track(new THREE.SphereGeometry(body.radius, 64, 64))
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
        const haloMat = track(new THREE.SpriteMaterial({
          map: track(radialTexture([
            [0, 'rgba(70,150,255,0)'],
            [0.72, 'rgba(110,190,255,0.5)'],
            [0.86, 'rgba(90,170,255,0.13)'],
            [1, 'rgba(60,130,255,0)'],
          ])),
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          opacity: 0.6,
        }))
        earthHalo = haloMat
        const halo = new THREE.Sprite(haloMat)
        halo.scale.setScalar(body.radius * 2.7)
        mesh.add(halo)

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
      new THREE.Vector3(0, 70, 430),
      new THREE.Vector3(150, -60, 330),
      new THREE.Vector3(-170, 70, 250),
      new THREE.Vector3(90, 20, 170),
      new THREE.Vector3(-25, 0, 120),
    ])

    const T_SPACE = 6.0
    const T_APPROACH = 3.2
    const T_WORLD = 3.2
    const T_LOGO_HOLD = 1.5

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
    world.background = new THREE.Color(0x05030f)
    world.fog = new THREE.FogExp2(0x0a0620, 0.0028)

    const worldCamera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.5, 4000)
    worldCamera.position.set(0, 150, 240)

    world.add(new THREE.HemisphereLight(0x7a6bff, 0x0a0520, 1.3))
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2)
    keyLight.position.set(80, 160, 60)
    world.add(keyLight)
    const rimLight = new THREE.PointLight(0x00a3ff, 2.4, 0, 0)
    rimLight.position.set(0, 50, -60)
    world.add(rimLight)

    const gridFloor = new THREE.GridHelper(1600, 80, 0x22306a, 0x121a38)
    gridFloor.position.y = -90
    world.add(gridFloor)

    const islands = new THREE.Group()
    world.add(islands)

    const rockMaterial = track(new THREE.MeshStandardMaterial({
      color: 0x1a1f3d, roughness: 0.95, metalness: 0.05, flatShading: true,
    }))
    const grassMaterial = track(new THREE.MeshStandardMaterial({
      color: 0x2b3570, roughness: 0.8, metalness: 0.1,
      emissive: 0x0a1230, emissiveIntensity: 1,
    }))
    const glowMaterial = track(new THREE.MeshStandardMaterial({
      color: 0x0a1030, emissive: BLUE, emissiveIntensity: 2.2, roughness: 0.4, metalness: 0.4,
    }))

    const islandData: Array<{ mesh: THREE.Group; phase: number }> = []

    const makeIsland = (x: number, z: number, r: number, h: number) => {
      const g = new THREE.Group()

      const rock = new THREE.Mesh(track(new THREE.ConeGeometry(r, h, 7, 1)), rockMaterial)
      rock.rotation.x = Math.PI
      rock.position.y = -h / 2
      g.add(rock)

      const top = new THREE.Mesh(track(new THREE.CylinderGeometry(r, r * 0.96, h * 0.08, 7)), grassMaterial)
      top.position.y = h * 0.04
      g.add(top)

      for (let i = 0; i < 4; i++) {
        const bw = r * (0.12 + Math.random() * 0.16)
        const bh = r * (0.15 + Math.random() * 0.45)
        const block = new THREE.Mesh(track(new THREE.BoxGeometry(bw, bh, bw)), glowMaterial)
        const ang = Math.random() * Math.PI * 2
        const rad = Math.random() * r * 0.6
        block.position.set(Math.cos(ang) * rad, bh / 2 + h * 0.05, Math.sin(ang) * rad)
        g.add(block)
      }

      g.position.set(x, 0, z)
      islands.add(g)
      islandData.push({ mesh: g, phase: Math.random() * Math.PI * 2 })
    }

    makeIsland(0, 0, 26, 34)
    makeIsland(-70, -30, 16, 24)
    makeIsland(64, -44, 18, 28)
    makeIsland(-96, 42, 12, 18)
    makeIsland(92, 36, 14, 22)
    makeIsland(-30, 92, 10, 14)
    makeIsland(40, 96, 11, 16)
    makeIsland(-140, -70, 20, 30)
    makeIsland(150, -60, 17, 26)

    const monolith = new THREE.Mesh(track(new THREE.BoxGeometry(7, 46, 7)), glowMaterial)
    monolith.position.set(0, 23, 0)
    world.add(monolith)

    const beam = new THREE.Mesh(
      track(new THREE.CylinderGeometry(1.6, 0.4, 300, 18, 1, true)),
      track(new THREE.MeshBasicMaterial({
        color: BLUE, transparent: true, opacity: 0.35,
        blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
      }))
    )
    beam.position.set(0, 150, 0)
    world.add(beam)

    const rings: THREE.Mesh[] = []
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(
        track(new THREE.RingGeometry(30, 31.4, 128)),
        track(new THREE.MeshBasicMaterial({
          color: BLUE, transparent: true, opacity: 0,
          blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
        }))
      )
      ring.rotation.x = -Math.PI / 2
      ring.position.set(0, 1, 0)
      world.add(ring)
      rings.push(ring)
    }

    const spinShapes: THREE.Mesh[] = []
    const shapeSpecs = [
      { geo: new THREE.TorusGeometry(9, 2.2, 16, 48), x: 46, y: 48, z: -28, c: 0x00a3ff },
      { geo: new THREE.OctahedronGeometry(6, 0), x: -52, y: 62, z: -18, c: 0x9a7bff },
      { geo: new THREE.IcosahedronGeometry(5, 0), x: 18, y: 84, z: -60, c: 0xff7bd0 },
      { geo: new THREE.TorusKnotGeometry(6, 1.4, 64, 8), x: -20, y: 34, z: 40, c: 0x5ce1ff },
    ]
    shapeSpecs.forEach((spec) => {
      const mesh = new THREE.Mesh(track(spec.geo), track(new THREE.MeshStandardMaterial({
        color: 0x0a1030, emissive: spec.c, emissiveIntensity: 1.6, roughness: 0.35, metalness: 0.6,
      })))
      mesh.position.set(spec.x, spec.y, spec.z)
      world.add(mesh)
      spinShapes.push(mesh)
    })

    const motes = (() => {
      const n = 500
      const pos = new Float32Array(n * 3)
      for (let i = 0; i < n; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 420
        pos[i * 3 + 1] = Math.random() * 200 - 40
        pos[i * 3 + 2] = (Math.random() - 0.5) * 420
      }
      const geo = track(new THREE.BufferGeometry())
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
      const pts = new THREE.Points(geo, track(new THREE.PointsMaterial({
        color: 0x9fd0ff, size: 1.6, transparent: true, opacity: 0.7,
        depthWrite: false, blending: THREE.AdditiveBlending,
      })))
      world.add(pts)
      return pts
    })()

    const haze = new THREE.Sprite(track(new THREE.SpriteMaterial({
      map: track(radialTexture([
        [0, 'rgba(120,160,255,0.30)'],
        [0.4, 'rgba(90,110,230,0.12)'],
        [1, 'rgba(60,70,200,0)'],
      ])),
      blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.8,
    })))
    haze.scale.set(900, 380, 1)
    haze.position.set(0, 30, -80)
    world.add(haze)


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

    const shake = (t: number) => {
      const x = Math.sin(t * 0.83) * 0.5 + Math.sin(t * 2.11) * 0.28 + Math.sin(t * 3.71) * 0.12
      const y = Math.cos(t * 0.71) * 0.5 + Math.sin(t * 1.73) * 0.3 + Math.cos(t * 4.11) * 0.1
      const roll = Math.sin(t * 0.61) * 0.6 + Math.sin(t * 1.37) * 0.4
      return { x, y, roll }
    }

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

      coronaMat.uniforms.uTime.value = t
      corona.scale.setScalar(1 + Math.sin(t * 1.3) * 0.015)
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
        if (earthHalo) earthHalo.opacity = 0.35 + eased * 0.55
      }

      smoothTarget.lerp(desiredTarget, 1 - Math.exp(-4.5 * dt))

      const dist = cam.position.distanceTo(smoothTarget)
      const worldAmp = Math.min(0.45, Math.max(0.015, dist * 0.012))

      const s = shake(t)
      cam.position.x += s.x * worldAmp
      cam.position.y += s.y * worldAmp
      cam.lookAt(smoothTarget)
      cam.rotateZ(s.roll * worldAmp * 0.01)
    }

    const renderWorld = (t: number) => {
      const k = THREE.MathUtils.clamp(state.world, 0, 1)
      const e = 1 - Math.pow(1 - k, 3)
      worldCamera.position.set(0, 235 - 125 * e, 320 - 235 * e)
      worldCamera.lookAt(0, 34 + 6 * e, 0)

      const s = shake(t)
      worldCamera.position.x += s.x * 0.6
      worldCamera.position.y += s.y * 0.4
      worldCamera.rotateZ(s.roll * 0.006)

      islandData.forEach((isl, i) => {
        isl.mesh.position.y = Math.sin(t * 0.55 + isl.phase) * 3.2
        isl.mesh.rotation.y = t * 0.05 + i * 0.4
      })

      spinShapes.forEach((m, i) => {
        m.rotation.x = t * (0.18 + i * 0.05)
        m.rotation.y = t * (0.14 + i * 0.04)
        m.position.y += Math.sin(t * 0.7 + i) * 0.01
      })

      motes.rotation.y = t * 0.015
      monolith.scale.y = 1 + Math.sin(t * 1.4) * 0.012

      rings.forEach((ring, i) => {
        const phase = (t * 0.45 + i * 0.33) % 1
        ring.scale.setScalar(1 + phase * 12)
        const mat = ring.material as THREE.MeshBasicMaterial
        mat.opacity = Math.max(0, 0.75 * (1 - phase))
      })

      ;(beam.material as THREE.MeshBasicMaterial).opacity = 0.3 + Math.sin(t * 2.2) * 0.1
      haze.material.opacity = 0.8 + Math.sin(t * 0.8) * 0.08
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
      .to(blackRef.current, { opacity: 1, duration: 0.75, ease: 'power2.inOut' })
      .to(barsRef.current, { opacity: 0, duration: 0.9, ease: 'power2.inOut' }, '-=0.4')

    const revealLogo = () => {
      const root = logoRef.current
      if (!root) return finish()
      const [img, title, sub] = Array.from(root.children) as HTMLElement[]

      gsap.set(root, { opacity: 1 })
      gsap.set([title, sub], { opacity: 0, y: 26 })
      gsap.set(img, { opacity: 0, scale: 0.55, filter: 'blur(20px)' })

      gsap.timeline({ onComplete: finish })
        .to(img, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.2, ease: 'expo.out' })
        .to(title, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5')
        .to(sub, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.6')
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

      <div ref={blackRef} className="pointer-events-none absolute inset-0 z-[8] bg-black opacity-0" />

      <div ref={logoRef} className="absolute inset-0 z-[9] flex flex-col items-center justify-center opacity-0">
        <img src="/logo.png" alt="Evolved Tech" className="h-32 w-32 object-contain md:h-40 md:w-40" />
        <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-white md:text-6xl">EVOLVED TECH</h1>
        <p className="mt-4 text-[10px] tracking-[0.45em] text-[#00A3FF] md:text-sm">
          A WORLD WHERE GAMES ARE MADE
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
