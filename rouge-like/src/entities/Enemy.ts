import Phaser from 'phaser'

let enemyIdCounter = 0;

export class Enemy extends Phaser.Physics.Arcade.Image {
  private enemyId: number;
  private enemyRadius: number = 18
  private moveSpeed: number = 100
  private maxHealth: number = 3
  private currentHealth: number = 3
  private experienceValue: number = 10
  private goldValue: number = 5
  private damage: number = 1

  private attackCooldown: number = 1000
  private lastAttackTime: number = 0
  private targetPlayer!: Phaser.Physics.Arcade.Image

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    player: Phaser.Physics.Arcade.Image
  ) {
    super(scene, x, y, '')

    this.enemyId = ++enemyIdCounter
    this.targetPlayer = player

    this.createEnemyTexture()
    this.setTexture('enemy')

    this.scene.add.existing(this)
    this.scene.physics.add.existing(this)

    this.setCollideWorldBounds(true)
    this.setBounce(0.3)
    this.setDrag(600, 600)
    this.setMaxVelocity(this.moveSpeed, this.moveSpeed)

    const body = this.body as Phaser.Physics.Arcade.Body
    body.setCircle(this.enemyRadius, 0, 0)
  }

  private createEnemyTexture(): void {
    if (this.scene.textures.exists('enemy')) {
      return
    }

    const size = this.enemyRadius * 2
    const canvas = this.scene.textures.createCanvas('enemy', size, size)
    if (!canvas) return
    
    const ctx = canvas.getContext()
    if (!ctx) return

    ctx.save()
    ctx.translate(size / 2, size / 2)

    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.enemyRadius + 6)
    gradient.addColorStop(0, 'rgba(255, 100, 100, 0.8)')
    gradient.addColorStop(0.5, 'rgba(233, 69, 96, 0.4)')
    gradient.addColorStop(1, 'rgba(233, 69, 96, 0)')

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(0, 0, this.enemyRadius + 6, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#e94560'
    ctx.beginPath()
    ctx.arc(0, 0, this.enemyRadius, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = '#ff6464'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(0, 0, this.enemyRadius, 0, Math.PI * 2)
    ctx.stroke()

    const eyeOffset = 4
    const eyeY = -2
    const eyeRadius = 2.5

    ctx.fillStyle = '#333333'
    ctx.beginPath()
    ctx.arc(-eyeOffset, eyeY, eyeRadius, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(eyeOffset, eyeY, eyeRadius, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#ff0000'
    ctx.beginPath()
    ctx.arc(-eyeOffset, eyeY, eyeRadius - 1, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(eyeOffset, eyeY, eyeRadius - 1, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()

    canvas.refresh()
  }

  public update(_currentTime: number): void {
    if (!this.targetPlayer || !this.targetPlayer.active) {
      return
    }

    const body = this.body as Phaser.Physics.Arcade.Body
    const dx = this.targetPlayer.x - this.x
    const dy = this.targetPlayer.y - this.y

    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance > 30) {
      const moveX = (dx / distance) * 400
      const moveY = (dy / distance) * 400
      body.setAcceleration(moveX, moveY)
    } else {
      body.setAcceleration(0, 0)
    }
  }

  public canAttack(currentTime: number): boolean {
    return currentTime - this.lastAttackTime >= this.attackCooldown
  }

  public attack(currentTime: number): number {
    this.lastAttackTime = currentTime
    return this.damage
  }

  public takeDamage(amount: number = 1): boolean {
    this.currentHealth -= amount

    this.scene.tweens.add({
      targets: this,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 1
    })

    return this.currentHealth <= 0
  }

  public getExperienceValue(): number {
    return this.experienceValue
  }

  public getGoldValue(): number {
    return this.goldValue
  }

  public getCurrentHealth(): number {
    return this.currentHealth
  }

  public getMaxHealth(): number {
    return this.maxHealth;
  }

  public getEnemyId(): number {
    return this.enemyId;
  }
}
