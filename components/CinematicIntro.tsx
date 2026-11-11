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
  ctx.clearRect(0, 0, w, 8)
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
    const x = Math.random() * s
    const y = Math.random() * s
    const w = 6 + Math.random() * 22
    const h = 6 + Math.random() * 22
    ctx.fillStyle = `rgba(90,150,210,${0.02 + Math.random() * 0.05})`
    ctx.fillRect(x, y, w, h)
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
  { name: 'Mercury', radius: 0.55, orbit: 16, speed: 0.20, tilt: 0.02, map: '/mercury.png' },
  { name: 'Venus', radius: 1.0, orbit: 22, speed: 0.15, tilt: 0.06, map: '/venus.png' },
  { name: 'Earth', radius: 1.55, orbit: 30, speed: 0.10, tilt: 0.41, map: '/earth-day.png' },
  { name: 'Mars', radius: 0.85, orbit: 38, speed: 0.08, tilt: 0.05, map: '/mars.png' },
  { name: 'Jupiter', radius: 3.2, orbit: 52, speed: 0.045, tilt: 0.05, map: '/jupiter.jpg' },
  { name: 'Saturn', radius: 2.6, orbit: 66, speed: 0.032, tilt: 0.47, map: '/saturn.png', ring: true },
  { name: 'Uranus', radius: 1.7, orbit: 78, speed: 0.022, tilt: 0.97, map: '/uranus.png' },
  { name: 'Neptune', radius: 1.65, orbit: 90, speed: 0.016, tilt: 0.49, map: '/neptune.png' },
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
    renderer.toneMappingExposure = 1.05
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
      if (url.includes('milky-way')) tex.mapping = THREE.EquirectangularReflectionMapping
      return track(tex)
    }

    const space = new THREE.Scene()
    const composer = useBloom ? new EffectComposer(renderer) : null
    if (composer) {
      composer.setPixelRatio(pixelRatio)
      composer.setSize(window.innerWidth, window.innerHeight)
    }

    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 6000)
    camera.position.set(0, 14, 120)

    space.background = loadTex('/milky-way.jpg')
    space.backgroundIntensity = 0.55

    const starSprite = track(radialTexture([
      [0, 'rgba(255,255,255,1)'],
      [0.4, 'rgba(255,255,255,0.35)'],
      [1, 'rgba(255,255,255,0)'],
    ]))

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
        const tint = 0.75 + Math.random() * 0.25
        col[i * 3] = tint
        col[i * 3 + 1] = tint
        col[i * 3 + 2] = Math.min(1, tint + Math.random() * 0.15)
      }
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
    const starsNear = makeStars(1400, 200, 460, 2.4, 0.95)
    const starsFar = makeStars(2200, 700, 1500, 4.5, 0.5)

    const sunGroup = new THREE.Group()
    space.add(sunGroup)

    const sunMat = track(new THREE.MeshBasicMaterial({ map: loadTex('/sun.jpg'), color: 0xffffff }))
    const sunCore = new THREE.Mesh(track(new THREE.SphereGeometry(4.2, 64, 64)), sunMat)
    sunGroup.add(sunCore)

    const coronaMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color(0xff9a3c) } },
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
          float f = pow(1.0 - abs(dot(normalize(vView), normalize(vNormal))), 3.0);
          float flick = 0.82 + 0.18 * sin(uTime * 1.9) * sin(uTime * 0.7 + 1.3);
          float a = f * flick;
          gl_FragColor = vec4(uColor * a * 2.2, a);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    track(coronaMat)
    const corona = new THREE.Mesh(track(new THREE.SphereGeometry(5.6, 48, 48)), coronaMat)
    sunGroup.add(corona)

    const flare = new THREE.Sprite(track(new THREE.SpriteMaterial({
      map: track(radialTexture([
        [0, 'rgba(255,255,255,1)'],
        [0.15, 'rgba(255,240,200,0.7)'],
        [0.45, 'rgba(255,170,60,0.18)'],
        [1, 'rgba(255,120,0,0)'],
      ])),
      blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.55,
    })))
    flare.scale.setScalar(34)
    sunGroup.add(flare)

    sunGroup.add(new THREE.PointLight(0xfff2d8, 3.4, 0, 0))
    space.add(new THREE.AmbientLight(0x1a2436, 1.5))

    type Planet = { mesh: THREE.Mesh; angle: number; orbit: number; speed: number; tilt: number; spin: number }
    const planets: Planet[] = []
    let earthMesh: THREE.Mesh | null = null
    let earthAtmosphere: THREE.ShaderMaterial | null = null

    BODIES.forEach((body, i) => {
      const geo = track(new THREE.SphereGeometry(body.radius, 64, 64))
      const mat = track(new THREE.MeshStandardMaterial({
        map: loadTex(body.map), color: 0xffffff, roughness: 0.92, metalness: 0.02,
      }))
      const mesh = new THREE.Mesh(geo, mat)
      mesh.rotation.z = body.tilt
      space.add(mesh)

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
        angle: (i / BODIES.length) * Math.PI * 2,
        orbit: body.orbit,
        speed: body.speed,
        tilt: body.tilt,
        spin: 0.05 + Math.random() * 0.06,
      })

      if (body.name === 'Earth') {
        earthMesh = mesh
        const atmoMat = new THREE.ShaderMaterial({
          uniforms: {
            uColor: { value: new THREE.Color(0x3aa0ff) },
            uPower: { value: 3.2 },
            uIntensity: { value: 1.0 },
          },
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
            uniform vec3 uColor;
            uniform float uPower;
            uniform float uIntensity;
            varying vec3 vNormal;
            varying vec3 vView;
            void main() {
              float f = pow(1.0 - abs(dot(normalize(vView), normalize(vNormal))), uPower);
              gl_FragColor = vec4(uColor * f * uIntensity, f * 0.85);
            }
          `,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.BackSide,
        })
        track(atmoMat)
        earthAtmosphere = atmoMat
        mesh.add(new THREE.Mesh(track(new THREE.SphereGeometry(body.radius * 1.16, 48, 48)), atmoMat))
      }
    })

    const rockGeo = track(new THREE.IcosahedronGeometry(1, 0))
    const rockMat = track(new THREE.MeshStandardMaterial({
      color: 0x6b665c, roughness: 1, metalness: 0.05, flatShading: true,
    }))

    const belt = new THREE.Group()
    space.add(belt)
    const BELT = isSmall ? 90 : 200
    const asteroids = new THREE.InstancedMesh(rockGeo, rockMat, BELT)
    {
      const mm = new THREE.Matrix4()
      const qq = new THREE.Quaternion()
      const ee = new THREE.Euler()
      const vv = new THREE.Vector3()
      const ss = new THREE.Vector3()
      for (let i = 0; i < BELT; i++) {
        const a = Math.random() * Math.PI * 2
        const r = 44 + Math.random() * 18
        const scl = 0.2 + Math.pow(Math.random(), 2.2) * 1.9
        vv.set(Math.cos(a) * r, (Math.random() - 0.5) * 9, Math.sin(a) * r)
        ee.set(Math.random() * 6.28, Math.random() * 6.28, Math.random() * 6.28)
        qq.setFromEuler(ee)
        ss.set(scl, scl * (0.7 + Math.random() * 0.6), scl)
        mm.compose(vv, qq, ss)
        asteroids.setMatrixAt(i, mm)
      }
      asteroids.instanceMatrix.needsUpdate = true
    }
    belt.add(asteroids)

    const tailMat = new THREE.ShaderMaterial({
      uniforms: { uColor: { value: new THREE.Color(0x9fd8ff) } },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying vec2 vUv;
        void main() {
          float a = pow(clamp(vUv.y, 0.0, 1.0), 1.7) * 0.55;
          gl_FragColor = vec4(uColor, a);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
    track(tailMat)

    const headTex = track(radialTexture([
      [0, 'rgba(255,255,255,1)'],
      [0.2, 'rgba(190,230,255,0.75)'],
      [0.5, 'rgba(120,190,255,0.22)'],
      [1, 'rgba(80,150,255,0)'],
    ]))

    type Comet = { group: THREE.Group; from: THREE.Vector3; to: THREE.Vector3; t0: number; t1: number }
    const comets: Comet[] = []

    const makeComet = (from: THREE.Vector3, to: THREE.Vector3, t0: number, t1: number, scale: number) => {
      const group = new THREE.Group()
      const head = new THREE.Sprite(track(new THREE.SpriteMaterial({
        map: headTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.95,
      })))
      head.scale.setScalar(2.6 * scale)
      group.add(head)

      const tail = new THREE.Mesh(track(new THREE.ConeGeometry(1.1 * scale, 30 * scale, 14, 1, true)), tailMat)
      tail.rotation.x = Math.PI / 2
      tail.position.z = -15 * scale
      group.add(tail)

      group.visible = false
      space.add(group)
      comets.push({ group, from, to, t0, t1 })
    }

    makeComet(
      new THREE.Vector3(-150, 60, -40),
      new THREE.Vector3(160, -30, 30),
      1.2, 5.2, 1.6
    )
    makeComet(
      new THREE.Vector3(120, -50, 90),
      new THREE.Vector3(-140, 30, -20),
      3.0, 6.0, 1.1
    )

    type Flyby = { mesh: THREE.Mesh; from: THREE.Vector3; to: THREE.Vector3; t0: number; t1: number }
    const flybys: Flyby[] = []

    const path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 18, 130),
      new THREE.Vector3(30, -8, 92),
      new THREE.Vector3(-32, 12, 68),
      new THREE.Vector3(20, 4, 46),
      new THREE.Vector3(-10, 0, 30),
    ])

    const T_SPACE = 6.0
    const T_APPROACH = 3.2
    const T_LAGOS = 3.2
    const T_LOGO_HOLD = 1.5

    const state = { u: 0, approach: 0, lagos: 0, phase: 'space' as 'space' | 'approach' | 'lagos' }
    let approachFrom = new THREE.Vector3()
    let approachTo = new THREE.Vector3()

    ;[2.6, 5.0].forEach((t, i) => {
      const u = THREE.MathUtils.clamp(t / T_SPACE, 0, 1)
      const camAt = path.getPointAt(u)
      const perp = new THREE.Vector3(0.3, 1, 0).cross(camAt.clone().normalize()).normalize()
      const mesh = new THREE.Mesh(rockGeo, rockMat)
      mesh.position.copy(camAt)
      mesh.scale.setScalar(2.2 + i * 1.4)
      space.add(mesh)
      flybys.push({
        mesh,
        from: camAt.clone().add(perp.clone().multiplyScalar(i === 0 ? 52 : -48)).add(new THREE.Vector3(0, 14, 0)),
        to: camAt.clone().add(perp.clone().multiplyScalar(i === 0 ? -52 : 48)).add(new THREE.Vector3(0, -14, 0)),
        t0: t - 1.2,
        t1: t + 1.2,
      })
    })

    const lagos = new THREE.Scene()
    lagos.background = new THREE.Color(0x02060d)
    lagos.fog = new THREE.FogExp2(0x04101c, 0.0018)

    const lagosCamera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.5, 3000)
    lagosCamera.position.set(0, 230, 330)

    lagos.add(new THREE.HemisphereLight(0x3a6f9e, 0x050505, 1.1))
    const moonLight = new THREE.DirectionalLight(0x9cc4ff, 0.45)
    moonLight.position.set(-120, 90, -60)
    lagos.add(moonLight)

    const water = new THREE.Mesh(
      track(new THREE.PlaneGeometry(2400, 2400)),
      track(new THREE.MeshStandardMaterial({ color: 0x020c14, roughness: 0.12, metalness: 0.9 }))
    )
    water.rotation.x = -Math.PI / 2
    lagos.add(water)

    const landMat = track(new THREE.MeshStandardMaterial({
      map: track(streetTexture()), color: 0x8a9bb0, roughness: 0.82, metalness: 0.15,
    }))

    const addLand = (rx: number, rz: number, cx: number, cz: number, jitter: number) => {
      const geo = track(new THREE.ExtrudeGeometry(ellipseShape(rx, rz, 128, jitter), {
        depth: 3, bevelEnabled: false, curveSegments: 6,
      }))
      const mesh = new THREE.Mesh(geo, landMat)
      mesh.rotation.x = -Math.PI / 2
      mesh.position.set(cx, 0, cz)
      lagos.add(mesh)
    }

    addLand(420, 230, 0, -300, 0.06)
    addLand(120, 46, 40, 40, 0.10)
    addLand(210, 40, 300, 120, 0.08)
    addLand(150, 34, 210, 20, 0.09)

    const bridgeMat = track(new THREE.MeshStandardMaterial({
      color: 0x121a24, roughness: 0.7, metalness: 0.4, emissive: BLUE, emissiveIntensity: 0.35,
    }))
    const bridge1 = new THREE.Mesh(track(new THREE.BoxGeometry(7, 2.5, 260)), bridgeMat)
    bridge1.position.set(-20, 4, -120)
    bridge1.rotation.y = 0.16
    lagos.add(bridge1)

    const bridge2 = new THREE.Mesh(track(new THREE.BoxGeometry(6, 2.2, 200)), bridgeMat)
    bridge2.position.set(210, 4, -60)
    bridge2.rotation.y = -0.32
    lagos.add(bridge2)

    const BUILDINGS = isSmall ? 400 : 950
    const cityMat = track(new THREE.MeshStandardMaterial({
      color: 0x0b1420,
      emissive: 0xffffff,
      emissiveIntensity: 1.35,
      emissiveMap: track(windowTexture()),
      roughness: 0.55,
      metalness: 0.35,
    }))
    const city = new THREE.InstancedMesh(track(new THREE.BoxGeometry(1, 1, 1)), cityMat, BUILDINGS)
    {
      const m4 = new THREE.Matrix4()
      const q = new THREE.Quaternion()
      const v = new THREE.Vector3()
      const sc = new THREE.Vector3()

      const islandA = { cx: 40, cz: 40, rx: 118, rz: 44 }
      const islandB = { cx: 300, cz: 120, rx: 206, rz: 38 }
      const islandC = { cx: 210, cz: 20, rx: 146, rz: 32 }
      const mainland = { cx: 0, cz: -300, rx: 416, rz: 226 }

      let placed = 0
      let guard = 0
      while (placed < BUILDINGS && guard < BUILDINGS * 40) {
        guard++
        const zone = Math.random() < 0.55
          ? mainland
          : [islandA, islandB, islandC][Math.floor(Math.random() * 3)]

        const x = zone.cx + (Math.random() * 2 - 1) * zone.rx * 0.94
        const z = zone.cz + (Math.random() * 2 - 1) * zone.rz * 0.94
        if (!insideEllipse(x, z, zone.cx, zone.cz, zone.rx * 0.95, zone.rz * 0.95)) continue

        const central = insideEllipse(x, z, 40, 40, 55, 30) || insideEllipse(x, z, 210, 20, 70, 22)
        const h = central
          ? 12 + Math.pow(Math.random(), 1.7) * 78
          : 3 + Math.pow(Math.random(), 2.4) * 34
        const w = 2.4 + Math.random() * 4.5

        v.set(x, h / 2 + 3, z)
        sc.set(w, h, w)
        m4.compose(v, q, sc)
        city.setMatrixAt(placed, m4)
        placed++
      }
      city.count = placed
      city.instanceMatrix.needsUpdate = true
    }
    lagos.add(city)

    const haze = new THREE.Sprite(track(new THREE.SpriteMaterial({
      map: track(radialTexture([
        [0, 'rgba(120,190,255,0.34)'],
        [0.35, 'rgba(70,130,200,0.14)'],
        [1, 'rgba(40,90,160,0)'],
      ])),
      blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.85,
    })))
    haze.scale.set(1100, 420, 1)
    haze.position.set(80, 40, 0)
    lagos.add(haze)

    const beam = new THREE.Mesh(
      track(new THREE.CylinderGeometry(0.9, 0.9, 220, 16, 1, true)),
      track(new THREE.MeshBasicMaterial({
        color: BLUE, transparent: true, opacity: 0.4,
        blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
      }))
    )
    beam.position.set(40, 110, 40)
    lagos.add(beam)

    const rings: THREE.Mesh[] = []
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(
        track(new THREE.RingGeometry(4, 4.7, 96)),
        track(new THREE.MeshBasicMaterial({
          color: BLUE, transparent: true, opacity: 0,
          blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
        }))
      )
      ring.rotation.x = -Math.PI / 2
      ring.position.set(40, 4, 40)
      lagos.add(ring)
      rings.push(ring)
    }

    const composerLagos = useBloom ? new EffectComposer(renderer) : null
    if (composerLagos) {
      composerLagos.setPixelRatio(pixelRatio)
      composerLagos.setSize(window.innerWidth, window.innerHeight)
    }

    const clock = new THREE.Clock()
    let raf = 0

    const smoothTarget = new THREE.Vector3(0, 0, 0)
    const desiredTarget = new THREE.Vector3(0, 0, 0)
    const axisY = new THREE.Vector3(0, 1, 0)

    const shake = (t: number) => {
      const x = Math.sin(t * 0.83) * 0.5 + Math.sin(t * 2.11) * 0.28 + Math.sin(t * 3.71) * 0.12
      const y = Math.cos(t * 0.71) * 0.5 + Math.sin(t * 1.73) * 0.3 + Math.cos(t * 4.11) * 0.1
      const roll = Math.sin(t * 0.61) * 0.6 + Math.sin(t * 1.37) * 0.4
      return { x, y, roll }
    }

    const renderSpace = (t: number, cam: THREE.PerspectiveCamera) => {
      planets.forEach((p) => {
        const a = p.angle + t * p.speed
        p.mesh.position.set(Math.cos(a) * p.orbit, 0, Math.sin(a) * p.orbit)
        p.mesh.rotation.z = p.tilt
        p.mesh.rotateOnAxis(axisY, p.spin * 0.02)
      })

      belt.rotation.y = t * 0.012
      asteroids.rotation.y = t * 0.02

      coronaMat.uniforms.uTime.value = t
      corona.scale.setScalar(1 + Math.sin(t * 1.3) * 0.02)
      flare.material.opacity = 0.5 + Math.sin(t * 0.9) * 0.06
      starsNear.rotation.y = t * 0.006
      starsFar.rotation.y = t * 0.002

      comets.forEach((c) => {
        const k = THREE.MathUtils.clamp((t - c.t0) / (c.t1 - c.t0), 0, 1)
        c.group.visible = k > 0 && k < 1
        if (!c.group.visible) return
        c.group.position.lerpVectors(c.from, c.to, k)
        const dir = c.to.clone().sub(c.from).normalize()
        c.group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, -1), dir)
        const fade = Math.sin(Math.PI * k)
        c.group.children.forEach((child) => {
          const mat = (child as THREE.Mesh).material as THREE.Material & { opacity?: number }
          if ('opacity' in mat) mat.opacity = fade
        })
      })

      flybys.forEach((f) => {
        const k = THREE.MathUtils.clamp((t - f.t0) / (f.t1 - f.t0), 0, 1)
        f.mesh.visible = k > 0 && k < 1
        if (f.mesh.visible) {
          f.mesh.position.lerpVectors(f.from, f.to, k)
          f.mesh.rotation.x = t * 1.6
          f.mesh.rotation.y = t * 1.1
        }
      })

      let amp = 0.35

      if (state.phase === 'space') {
        const u = THREE.MathUtils.clamp(state.u, 0, 1)
        cam.position.copy(path.getPointAt(u))
        const towardEarth = THREE.MathUtils.smoothstep(u, 0.62, 1)
        desiredTarget.lerpVectors(new THREE.Vector3(0, 0, 0), earthMesh ? earthMesh.position : new THREE.Vector3(), towardEarth)
        amp = 0.4
        if (cam.fov !== 55) {
          cam.fov = 55
          cam.updateProjectionMatrix()
        }
      } else {
        const k = THREE.MathUtils.clamp(state.approach, 0, 1)
        const eased = Math.pow(k, 2.4)
        cam.position.lerpVectors(approachFrom, approachTo, eased)
        if (earthMesh) desiredTarget.copy(earthMesh.position)
        const fov = THREE.MathUtils.lerp(55, 30, eased)
        if (Math.abs(cam.fov - fov) > 0.01) {
          cam.fov = fov
          cam.updateProjectionMatrix()
        }
        if (earthAtmosphere) earthAtmosphere.uniforms.uIntensity.value = 1 + eased * 5
        amp = 0.18
      }

      smoothTarget.lerp(desiredTarget, 0.09)

      const s = shake(t)
      cam.position.x += s.x * amp
      cam.position.y += s.y * amp
      cam.lookAt(smoothTarget)
      cam.rotateZ(s.roll * amp * 0.012)
    }

    const renderLagos = (t: number) => {
      const k = THREE.MathUtils.clamp(state.lagos, 0, 1)
      const e = 1 - Math.pow(1 - k, 3)
      lagosCamera.position.set(0, 230 - 165 * e, 330 - 250 * e)
      lagosCamera.lookAt(40 * e, 20 * e, 30 * e)

      const s = shake(t)
      lagosCamera.position.x += s.x * 0.6
      lagosCamera.position.y += s.y * 0.4
      lagosCamera.rotateZ(s.roll * 0.006)

      rings.forEach((ring, i) => {
        const phase = (t * 0.5 + i * 0.33) % 1
        ring.scale.setScalar(1 + phase * 22)
        const mat = ring.material as THREE.MeshBasicMaterial
        mat.opacity = Math.max(0, 0.8 * (1 - phase))
      })

      ;(beam.material as THREE.MeshBasicMaterial).opacity = 0.3 + Math.sin(t * 2.2) * 0.1
      haze.material.opacity = 0.8 + Math.sin(t * 0.8) * 0.08
    }

    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (document.hidden) return
      const t = clock.getElapsedTime()

      if (state.phase === 'lagos') {
        renderLagos(t)
        if (composerLagos) composerLagos.render()
        else renderer.render(lagos, lagosCamera)
      } else {
        renderSpace(t, camera)
        if (composer) composer.render()
        else renderer.render(space, camera)
      }
    }

    if (composer) {
      composer.addPass(new RenderPass(space, camera))
      composer.addPass(new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2), 0.8, 0.65, 0.66
      ))
      composer.addPass(new OutputPass())
    }

    if (composerLagos) {
      composerLagos.addPass(new RenderPass(lagos, lagosCamera))
      composerLagos.addPass(new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2), 1.0, 0.7, 0.4
      ))
      composerLagos.addPass(new OutputPass())
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
        approachTo = target.clone().add(dir.multiplyScalar(2.9))
      })
      .to(state, { approach: 1, duration: T_APPROACH, ease: 'power2.in' })
      .to(flashRef.current, { opacity: 1, duration: 0.5, ease: 'power2.in' }, '-=0.55')
      .add(swapToLagos)
      .to(flashRef.current, { opacity: 0, duration: 0.8, ease: 'power2.out' })
      .to(state, { lagos: 1, duration: T_LAGOS, ease: 'power2.out' }, '-=0.35')
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
      lagosCamera.aspect = w / h
      lagosCamera.updateProjectionMatrix()
      composer?.setSize(w, h)
      composerLagos?.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    function cleanup() {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
      skipRef.current?.removeEventListener('click', skip)
      tl.kill()
      composer?.dispose()
      composerLagos?.dispose()
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
