import * as THREE from 'three'

export class Planet {
  public mesh: THREE.Mesh
  private orbitRadius: number
  private orbitSpeed: number
  private rotationSpeed: number
  private angle: number

  constructor(
    texturePath: string, 
    size: number, 
    orbitRadius: number, 
    orbitSpeed: number, 
    rotationSpeed: number,
    initialAngle: number = 0
  ) {
    const geometry = new THREE.SphereGeometry(size, 64, 64)
    const texture = new THREE.TextureLoader().load(texturePath)
    texture.colorSpace = THREE.SRGBColorSpace
    const material = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.8 })
    
    this.mesh = new THREE.Mesh(geometry, material)
    this.orbitRadius = orbitRadius
    this.orbitSpeed = orbitSpeed
    this.rotationSpeed = rotationSpeed
    this.angle = initialAngle
    
    this.updatePosition(0)
  }

  public update(time: number) {
    this.mesh.rotation.y += this.rotationSpeed
    this.updatePosition(time)
  }

  private updatePosition(time: number) {
    this.angle = this.angle + (time * this.orbitSpeed)
    this.mesh.position.x = Math.cos(this.angle) * this.orbitRadius
    this.mesh.position.z = Math.sin(this.angle) * this.orbitRadius
  }
}
