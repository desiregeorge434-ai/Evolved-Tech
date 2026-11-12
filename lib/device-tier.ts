export type Tier = 'off' | 'low' | 'full'

export type DeviceProfile = {
  tier: Tier
  reason: string
  cores: number
  memory: number
  dpr: number
  small: boolean
}

type NavigatorWithHints = Navigator & {
  deviceMemory?: number
  connection?: { saveData?: boolean; effectiveType?: string }
}

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    if (!gl) return false
    const lose = (gl as WebGLRenderingContext).getExtension('WEBGL_lose_context')
    lose?.loseContext()
    return true
  } catch {
    return false
  }
}

export function detectDevice(): DeviceProfile {
  const base: DeviceProfile = {
    tier: 'full',
    reason: 'default',
    cores: 4,
    memory: 4,
    dpr: 1,
    small: false,
  }

  if (typeof window === 'undefined') return base

  const nav = navigator as NavigatorWithHints
  const cores = nav.hardwareConcurrency ?? 4
  const memory = nav.deviceMemory ?? 4
  const dpr = window.devicePixelRatio || 1
  const minSide = Math.min(window.innerWidth, window.innerHeight)
  const small = minSide < 640

  const profile = { ...base, cores, memory, dpr, small }

  const forced = new URLSearchParams(window.location.search).get('quality')
  if (forced === 'full' || forced === 'low' || forced === 'off') {
    return { ...profile, tier: forced as Tier, reason: 'url-override' }
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return { ...profile, tier: 'off', reason: 'reduced-motion' }
  }

  if (nav.connection?.saveData) {
    return { ...profile, tier: 'off', reason: 'data-saver' }
  }

  if (!hasWebGL()) {
    return { ...profile, tier: 'off', reason: 'no-webgl' }
  }

  const effective = nav.connection?.effectiveType ?? ''
  const slowNetwork = /(^|-)2g/.test(effective)

  if (small || slowNetwork) {
    return {
      ...profile,
      tier: 'low',
      reason: `small=${small} cores=${cores} mem=${memory} net=${effective || 'unknown'}`,
    }
  }

  return { ...profile, tier: 'full', reason: `cores=${cores} mem=${memory} dpr=${dpr}` }
}
