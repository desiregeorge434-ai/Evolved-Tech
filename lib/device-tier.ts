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

// NEW: Stress test the GPU to see how fast it can render a complex frame
function runGpuStressTest(): boolean {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const gl = canvas.getContext('webgl', { failIfMajorPerformanceCaveat: true })
    if (!gl) return true // If it fails, let the normal WebGL check handle it

    // A heavy fragment shader (simulating particles/shadows) to stress the GPU
    const vsSource = `
      attribute vec2 position;
      void main() { gl_Position = vec4(position, 0.0, 1.0); }
    `
    const fsSource = `
      precision highp float;
      void main() {
        vec2 p = gl_FragCoord.xy;
        float c = 0.0;
        // Heavy loop to simulate complex cinematic rendering
        for(int i = 0; i < 500; i++) {
          c += sin(p.x * 0.01 + float(i)) * cos(p.y * 0.01 + float(i));
        }
        gl_FragColor = vec4(vec3(abs(c)), 1.0);
      }
    `

    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type)!
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      return shader
    }

    const program = gl.createProgram()!
    gl.attachShader(program, compileShader(gl.VERTEX_SHADER, vsSource))
    gl.attachShader(program, compileShader(gl.FRAGMENT_SHADER, fsSource))
    gl.linkProgram(program)
    gl.useProgram(program)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)

    const posAttrib = gl.getAttribLocation(program, 'position')
    gl.enableVertexAttribArray(posAttrib)
    gl.vertexAttribPointer(posAttrib, 2, gl.FLOAT, false, 0, 0)

    // Run the render and measure the time
    const start = performance.now()
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    gl.finish() // Wait for GPU to actually finish drawing
    const end = performance.now()

    // Clean up memory immediately
    gl.deleteProgram(program)
    gl.deleteBuffer(buffer)
    const lose = gl.getExtension('WEBGL_lose_context')
    lose?.loseContext()

    const timeTaken = end - start
    console.log(`[Device Tier] GPU Stress Test took ${timeTaken.toFixed(2)}ms`)

    // If the frame took longer than 25ms (less than 40fps), it's a laggy device
    return timeTaken < 25
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

  // NEW: If hardware looks good, run the stress test to double-check
  const passedStressTest = runGpuStressTest()
  if (!passedStressTest) {
    return {
      ...profile,
      tier: 'low',
      reason: 'failed-gpu-stress-test',
    }
  }

  return { ...profile, tier: 'full', reason: `cores=${cores} mem=${memory} dpr=${dpr}` }
}
