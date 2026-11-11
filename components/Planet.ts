import * as THREE from 'three'
import { Planet } from './Planet'

export class SceneManager {
  public scene: THREE.Scene
  public camera: THREE.PerspectiveCamera
  public renderer: THREE.WebGLRenderer
  public earth: Planet
  private planets: Planet[] = []
  private animationFrameId: number = 0
  private clock: THREE.Clock
  private sunSprite: THREE.Sprite

  constructor(mountElement: HTMLDivElement) {
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000)
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    mountElement.appendChild(this.renderer.domElement)
    
    this.clock = new THREE.Clock()
    this.setupEnvironment()
    
    this.earth = new Planet('/earth-day.png', 2, 0, 0, 0.005)
    this.scene.add(this.earth.mesh)
    const atmosGeo = new THREE.SphereGeometry(2.1, 64, 64)
    const atmosMat = new THREE.MeshBasicMaterial({ color: 0x00A3FF, transparent: true, opacity: 0.2, side: THREE.BackSide })
    this.earth.mesh.add(new THREE.Mesh(atmosGeo, atmosMat))

    const mercury = new Planet('/mercury.png', 0.4, 8, 0.05, 0.01, Math.PI * 2)
    const venus = new Planet('/venus.png', 0.8, 12, 0.04, 0.01, Math.PI * 1.5)
    const mars = new Planet('/mars.png', 1.0, 20, 0.03, 0.008, Math.PI)
    const jupiter = new Planet('/jupiter.jpg', 3.5, 28, 0.02, 0.01, Math.PI / 2)
    
    const saturn = new Planet('/saturn.png', 2.5, 38, 0.015, 0.01, Math.PI / 3)
    const ringGeo = new THREE.RingGeometry(3.5, 5, 64)
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xaaaaaa, side: THREE.DoubleSide, wireframe: true })
    const ring = new THREE.Mesh(ringGeo, ringMat)
    ring.rotation.x = Math.PI / 2
    saturn.mesh.add(ring)

    const uranus = new Planet('/uranus.png', 1.8, 48, 0.01, 0.01, 0)
    const neptune = new Planet('/neptune.png', 1.7, 58, 0.008, 0.01, Math.PI * 1.2)

    this.planets.push(this.earth, mercury, venus, mars, jupiter, saturn, uranus, neptune)
    this.planets.forEach(p => this.scene.add(p.mesh))
    
    this.camera.position.set(0, 60, 80)
    this.camera.lookAt(0, 0, 0)
  }

  private setupEnvironment() {
    this.scene.add(new THREE.AmbientLight(0x333333))
    
    const sunTexture = new THREE.TextureLoader().load('/sun.png')
    sunTexture.colorSpace = THREE.SRGBColorSpace
    const sunMat = new THREE.SpriteMaterial({ 
      map: sunTexture, 
      blending: THREE.AdditiveBlending, 
      depthWrite: false,
      transparent: true
    })
    this.sunSprite = new THREE.Sprite(sunMat)
    this.sunSprite.scale.set(20, 20, 1)
    this.scene.add(this.sunSprite)

    const sunLight = new THREE.PointLight(0xffffff, 5, 2000)
    this.scene.add(sunLight)

    const milkyWayTexture = new THREE.TextureLoader().load('/milky-way.jpg')
    milkyWayTexture.colorSpace = THREE.SRGBColorSpace
    const skyGeo = new THREE.SphereGeometry(900, 64, 64)
    const skyMat = new THREE.MeshBasicMaterial({ map: milkyWayTexture, side: THREE.BackSide })
    const sky = new THREE.Mesh(skyGeo, skyMat)
    sky.rotation.x = Math.PI / 4
    this.scene.add(sky)
  }

  public startAnimation() {
    const animate = () => {
      this.animationFrameId = requestAnimationFrame(animate)
      const time = this.clock.getElapsedTime()
      
      this.planets.forEach(planet => planet.update(time))
      
      const scale = 20 + Math.sin(time * 2) * 0.5
      this.sunSprite.scale.set(scale, scale, 1)
      
      this.renderer.render(this.scene, this.camera)
    }
    animate()
  }

  public dispose() {
    cancelAnimationFrame(this.animationFrameId)
    this.renderer.dispose()
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement)
    }
  }
}
