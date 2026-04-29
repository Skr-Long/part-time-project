import Phaser from 'phaser'

export class Player extends Phaser.Physics.Arcade.Sprite {
  private moveSpeed: number = 200
  private playerGraphics!: Phaser.GameObjects.Graphics
  private playerRadius: number = 20
  private isMoving: boolean = false
  private targetScale: number = 1
  private glowEffect!: Phaser.FX.Glow

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, '')

    this.scene.add.existing(this)
    this.scene.physics.add.existing(this)

    this.setCollideWorldBounds(true)
    this.setBounce(0)
    this.setDrag(500)
    this.setMaxVelocity(this.moveSpeed, this.moveSpeed)

    this.body!.setSize(this.playerRadius * 2, this.playerRadius * 2)
    this.body!.setOffset(0, 0)

    this.createGraphics()

    const fx = this.preFX
    if (fx) {
      this.glowEffect = fx.addGlow(0x00d9ff, 4, 4)
    }
  }

  private createGraphics(): void {
    this.playerGraphics = this.scene.add.graphics()
    this.playerGraphics.x = this.x
    this.playerGraphics.y = this.y

    this.drawPlayerShape()
  }

  private drawPlayerShape(): void {
    this.playerGraphics.clear()

    const gradient = this.playerGraphics.createLinearGradient(
      -this.playerRadius,
      -this.playerRadius,
      this.playerRadius,
      this.playerRadius
    )
    gradient.addColorStop(0, 0x00ff88)
    gradient.addColorStop(1, 0x00d9ff)

    this.playerGraphics.lineStyle(3, 0x00ff88, 1)
    this.playerGraphics.fillStyle(0x00d9ff, 1)

    this.playerGraphics.fillCircle(0, 0, this.playerRadius)
    this.playerGraphics.strokeCircle(0, 0, this.playerRadius)

    const eyeOffset = 6
    const eyeRadius = 4
    this.playerGraphics.fillStyle(0xffffff, 1)
    this.playerGraphics.fillCircle(-eyeOffset, -2, eyeRadius)
    this.playerGraphics.fillCircle(eyeOffset, -2, eyeRadius)

    this.playerGraphics.fillStyle(0x333333, 1)
    this.playerGraphics.fillCircle(-eyeOffset, -2, eyeRadius - 1.5)
    this.playerGraphics.fillCircle(eyeOffset, -2, eyeRadius - 1.5)
  }

  public moveLeft(): void {
    this.setAccelerationX(-800)
  }

  public moveRight(): void {
    this.setAccelerationX(800)
  }

  public moveUp(): void {
    this.setAccelerationY(-800)
  }

  public moveDown(): void {
    this.setAccelerationY(800)
  }

  public stopHorizontal(): void {
    this.setAccelerationX(0)
  }

  public stopVertical(): void {
    this.setAccelerationY(0)
  }

  public setMoving(): void {
    if (!this.isMoving) {
      this.isMoving = true
      this.targetScale = 1.1
      if (this.glowEffect) {
        this.glowEffect.outerStrength = 8
      }
    }
  }

  public setIdle(): void {
    if (this.isMoving) {
      this.isMoving = false
      this.targetScale = 1
      if (this.glowEffect) {
        this.glowEffect.outerStrength = 4
      }
    }
  }

  public getVelocity(): Phaser.Math.Vector2 {
    return this.body!.velocity
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta)

    if (this.playerGraphics) {
      this.playerGraphics.x = this.x
      this.playerGraphics.y = this.y

      const currentScale = this.playerGraphics.scale
      const newScale = Phaser.Math.Linear(currentScale, this.targetScale, 0.1)
      this.playerGraphics.setScale(newScale)
    }
  }

  destroy(fromScene?: boolean): void {
    if (this.playerGraphics) {
      this.playerGraphics.destroy()
    }
    super.destroy(fromScene)
  }
}
