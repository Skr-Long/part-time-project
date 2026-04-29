import Phaser from 'phaser'

export class Bullet extends Phaser.Physics.Arcade.Image {
  private bulletRadius: number = 6
  private speed: number = 500
  private damage: number = 1
  private isEnemyBullet: boolean = false
  private lifeTime: number = 3000
  private spawnTime: number = 0

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    velocityX: number,
    velocityY: number,
    isEnemyBullet: boolean = false,
    damage: number = 1
  ) {
    super(scene, x, y, '')

    this.isEnemyBullet = isEnemyBullet
    this.damage = damage

    const textureKey = isEnemyBullet ? 'enemyBullet' : 'playerBullet'
    this.createBulletTexture(textureKey)
    this.setTexture(textureKey)

    this.scene.add.existing(this)
    this.scene.physics.add.existing(this)

    const body = this.body as Phaser.Physics.Arcade.Body
    body.setCircle(this.bulletRadius, 0, 0)
    body.setCollideWorldBounds(true)
    body.onWorldBounds = true

    const length = Math.sqrt(velocityX * velocityX + velocityY * velocityY)
    if (length > 0) {
      body.setVelocity((velocityX / length) * this.speed, (velocityY / length) * this.speed)
    }

    this.spawnTime = scene.time.now
  }

  private createBulletTexture(key: string): void {
    if (this.scene.textures.exists(key)) {
      return
    }

    const size = this.bulletRadius * 2 + 4
    const canvas = this.scene.textures.createCanvas(key, size, size)
    const ctx = canvas.getContext()

    ctx.save()
    ctx.translate(size / 2, size / 2)

    if (this.isEnemyBullet) {
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.bulletRadius + 3)
      gradient.addColorStop(0, 'rgba(255, 100, 100, 1)')
      gradient.addColorStop(0.5, 'rgba(233, 69, 96, 0.8)')
      gradient.addColorStop(1, 'rgba(233, 69, 96, 0)')

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(0, 0, this.bulletRadius + 3, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#e94560'
      ctx.beginPath()
      ctx.arc(0, 0, this.bulletRadius, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = '#ff6464'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(0, 0, this.bulletRadius, 0, Math.PI * 2)
      ctx.stroke()
    } else {
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.bulletRadius + 3)
      gradient.addColorStop(0, 'rgba(0, 255, 204, 1)')
      gradient.addColorStop(0.5, 'rgba(0, 217, 255, 0.8)')
      gradient.addColorStop(1, 'rgba(0, 217, 255, 0)')

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(0, 0, this.bulletRadius + 3, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#00d9ff'
      ctx.beginPath()
      ctx.arc(0, 0, this.bulletRadius, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = '#00ffcc'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(0, 0, this.bulletRadius, 0, Math.PI * 2)
      ctx.stroke()
    }

    ctx.restore()

    canvas.refresh()
  }

  public getDamage(): number {
    return this.damage
  }

  public isFromEnemy(): boolean {
    return this.isEnemyBullet
  }

  public checkLifeTime(currentTime: number): boolean {
    return currentTime - this.spawnTime > this.lifeTime
  }
}
