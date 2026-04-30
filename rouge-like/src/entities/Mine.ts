import Phaser from 'phaser'
import { Enemy } from './Enemy'

export class Mine extends Phaser.Physics.Arcade.Image {
  private mineRadius: number = 15
  private explosionRadius: number = 100
  private damage: number = 5
  private lifeTime: number = 15000
  private spawnTime: number = 0
  private isArmed: boolean = false
  private armDelay: number = 1000
  private isExploding: boolean = false

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    damage: number = 5,
    explosionRadius: number = 100
  ) {
    super(scene, x, y, '')
    
    this.damage = damage
    this.explosionRadius = explosionRadius
    this.spawnTime = scene.time.now

    this.createMineTexture()
    this.setTexture('mine')

    this.scene.add.existing(this)
    this.scene.physics.add.existing(this)

    const body = this.body as Phaser.Physics.Arcade.Body
    body.setCircle(this.mineRadius, 0, 0)
    body.setCollideWorldBounds(true)
    body.setImmovable(true)
  }

  private createMineTexture(): void {
    if (this.scene.textures.exists('mine')) {
      return
    }

    const size = this.mineRadius * 2 + 10
    const canvas = this.scene.textures.createCanvas('mine', size, size)
    if (!canvas) return
    
    const ctx = canvas.getContext()
    if (!ctx) return

    ctx.save()
    ctx.translate(size / 2, size / 2)

    // 外圈光晕
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.mineRadius + 5)
    gradient.addColorStop(0, 'rgba(255, 200, 0, 0.6)')
    gradient.addColorStop(0.5, 'rgba(255, 150, 0, 0.3)')
    gradient.addColorStop(1, 'rgba(255, 100, 0, 0)')

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(0, 0, this.mineRadius + 5, 0, Math.PI * 2)
    ctx.fill()

    // 主体
    ctx.fillStyle = '#ffaa00'
    ctx.beginPath()
    ctx.arc(0, 0, this.mineRadius, 0, Math.PI * 2)
    ctx.fill()

    // 边框
    ctx.strokeStyle = '#ff6600'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(0, 0, this.mineRadius, 0, Math.PI * 2)
    ctx.stroke()

    // 中心的感叹号
    ctx.fillStyle = '#000000'
    ctx.font = 'bold 14px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('!', 0, 0)

    ctx.restore()
    canvas.refresh()
  }

  public update(currentTime: number): void {
    if (this.isExploding) {
      return
    }

    // 检查是否已经过了延迟时间，地雷是否已就绪
    if (!this.isArmed && currentTime - this.spawnTime >= this.armDelay) {
      this.isArmed = true
      this.armEffect()
    }

    // 检查生命时间
    if (currentTime - this.spawnTime > this.lifeTime) {
      this.explode()
    }
  }

  private armEffect(): void {
    // 地雷就绪时的闪烁效果
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 200,
      yoyo: true,
      repeat: 1,
      ease: 'Sine.easeInOut'
    })
  }

  public checkShouldExplode(enemies: Phaser.Physics.Arcade.Group): boolean {
    if (!this.isArmed || this.isExploding) {
      return false
    }

    const enemiesList = enemies.getChildren() as Enemy[]
    
    for (const enemy of enemiesList) {
      if (!enemy.active) continue
      
      const distance = Phaser.Math.Distance.Between(
        this.x, this.y,
        enemy.x, enemy.y
      )
      
      if (distance <= this.explosionRadius) {
        return true
      }
    }
    
    return false
  }

  public explode(): void {
    if (this.isExploding) return
    
    this.isExploding = true
    
    // 爆炸视觉效果
    this.createExplosionEffect()
    
    // 销毁地雷
    this.destroy()
  }

  public getExplosionDamage(enemyDistance: number): number {
    // 伤害随距离衰减
    const damageMultiplier = 1 - (enemyDistance / this.explosionRadius) * 0.5
    return Math.max(1, Math.floor(this.damage * damageMultiplier))
  }

  private createExplosionEffect(): void {
    // 爆炸光圈
    const explosion = this.scene.add.circle(this.x, this.y, this.explosionRadius, 0xff6600, 0.6)
    explosion.setStrokeStyle(4, 0xffaa00, 0.8)
    
    // 爆炸动画
    this.scene.tweens.add({
      targets: explosion,
      scale: 1.5,
      alpha: 0,
      duration: 400,
      ease: 'Expo.out',
      onComplete: () => {
        explosion.destroy()
      }
    })
    
    // 粒子效果
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12
      const distance = Phaser.Math.FloatBetween(this.explosionRadius * 0.3, this.explosionRadius * 0.8)
      const endX = this.x + Math.cos(angle) * distance
      const endY = this.y + Math.sin(angle) * distance

      const particle = this.scene.add.circle(this.x, this.y, 6, 0xffaa00)
      particle.setStrokeStyle(2, 0xff6600)

      this.scene.tweens.add({
        targets: particle,
        x: endX,
        y: endY,
        alpha: 0,
        scale: 0,
        duration: 400,
        ease: 'Sine.easeOut',
        onComplete: () => {
          particle.destroy()
        }
      })
    }
  }

  public getDamage(): number {
    return this.damage
  }

  public getExplosionRadius(): number {
    return this.explosionRadius
  }

  public isArmedNow(): boolean {
    return this.isArmed
  }
}
