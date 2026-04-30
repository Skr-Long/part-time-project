import Phaser from 'phaser'
import { WeaponType } from './WeaponTypes'

export class Bullet extends Phaser.Physics.Arcade.Image {
  private bulletRadius: number = 6
  private speed: number = 500
  private damage: number = 1
  private isEnemyBullet: boolean = false
  private lifeTime: number = 3000
  private spawnTime: number = 0
  
  // 武器特性
  private weaponType: WeaponType = WeaponType.NORMAL
  private currentPierceCount: number = 0
  private damageDropoff: number = 0
  private maxRange: number = Infinity
  private startPosition: Phaser.Math.Vector2
  private hitEnemies: Set<number> = new Set()

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    velocityX: number,
    velocityY: number,
    isEnemyBullet: boolean = false,
    damage: number = 1,
    weaponType: WeaponType = WeaponType.NORMAL,
    _pierceCount: number = 0,
    damageDropoff: number = 0,
    maxRange: number = Infinity
  ) {
    super(scene, x, y, '')

    this.isEnemyBullet = isEnemyBullet
    this.damage = damage
    this.weaponType = weaponType
    this.currentPierceCount = _pierceCount
    this.damageDropoff = damageDropoff
    this.maxRange = maxRange
    this.startPosition = new Phaser.Math.Vector2(x, y)

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
    if (!canvas) return
    
    const ctx = canvas.getContext()
    if (!ctx) return

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

  public getWeaponType(): WeaponType {
    return this.weaponType
  }

  public canPierce(): boolean {
    return this.currentPierceCount > 0
  }

  public registerHit(): void {
    if (this.currentPierceCount > 0) {
      this.currentPierceCount--
      this.damage = Math.max(0.1, this.damage - this.damageDropoff)
    }
  }

  public hasHitEnemy(enemyId: number): boolean {
    return this.hitEnemies.has(enemyId)
  }

  public markEnemyAsHit(enemyId: number): void {
    this.hitEnemies.add(enemyId)
  }

  public checkRange(): boolean {
    if (this.maxRange === Infinity) {
      return false
    }
    
    const distance = Phaser.Math.Distance.Between(
      this.startPosition.x, this.startPosition.y,
      this.x, this.y
    )
    
    return distance > this.maxRange
  }

  public getMaxRange(): number {
    return this.maxRange
  }
}
