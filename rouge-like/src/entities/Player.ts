import Phaser from 'phaser'

export class Player extends Phaser.Physics.Arcade.Image {
  private moveSpeed: number = 250
  private playerRadius: number = 20
  private glowTween!: Phaser.Tweens.Tween | null
  private playerTexture!: Phaser.Textures.CanvasTexture

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, '')

    this.createPlayerTexture()

    this.setTexture('player')

    this.scene.add.existing(this)
    this.scene.physics.add.existing(this)

    this.setCollideWorldBounds(true)
    this.setBounce(0.2)
    this.setDrag(800, 800)
    this.setMaxVelocity(this.moveSpeed, this.moveSpeed)

    const body = this.body as Phaser.Physics.Arcade.Body
    body.setCircle(this.playerRadius)
    body.setOffset(0, 0)
  }

  private createPlayerTexture(): void {
    if (this.scene.textures.exists('player')) {
      return
    }

    const size = this.playerRadius * 2 + 20
    const canvas = this.scene.textures.createCanvas('player', size, size)
    const ctx = canvas.getContext()

    const gradient = ctx.createRadialGradient(
      size / 2, size / 2, 0,
      size / 2, size / 2, this.playerRadius + 5
    )
    gradient.addColorStop(0, '#00ffcc')
    gradient.addColorStop(0.5, '#00d9ff')
    gradient.addColorStop(1, 'rgba(0, 217, 255, 0)')

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, this.playerRadius + 5, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#00d9ff'
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, this.playerRadius, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = '#00ffcc'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, this.playerRadius, 0, Math.PI * 2)
    ctx.stroke()

    const eyeOffset = 6
    const eyeY = size / 2 - 2
    const eyeRadius = 4

    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(size / 2 - eyeOffset, eyeY, eyeRadius, 0, Math.PI * 2)
    ctx.fill()

    ctx.beginPath()
    ctx.arc(size / 2 + eyeOffset, eyeY, eyeRadius, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#333333'
    ctx.beginPath()
    ctx.arc(size / 2 - eyeOffset, eyeY, eyeRadius - 1.5, 0, Math.PI * 2)
    ctx.fill()

    ctx.beginPath()
    ctx.arc(size / 2 + eyeOffset, eyeY, eyeRadius - 1.5, 0, Math.PI * 2)
    ctx.fill()

    canvas.refresh()
    this.playerTexture = canvas
  }

  public moveLeft(): void {
    const body = this.body as Phaser.Physics.Arcade.Body
    body.setAccelerationX(-800)
    this.setFlipX(true)
  }

  public moveRight(): void {
    const body = this.body as Phaser.Physics.Arcade.Body
    body.setAccelerationX(800)
    this.setFlipX(false)
  }

  public moveUp(): void {
    const body = this.body as Phaser.Physics.Arcade.Body
    body.setAccelerationY(-800)
  }

  public moveDown(): void {
    const body = this.body as Phaser.Physics.Arcade.Body
    body.setAccelerationY(800)
  }

  public stopHorizontal(): void {
    const body = this.body as Phaser.Physics.Arcade.Body
    body.setAccelerationX(0)
  }

  public stopVertical(): void {
    const body = this.body as Phaser.Physics.Arcade.Body
    body.setAccelerationY(0)
  }

  public setMoving(): void {
    if (!this.glowTween || !this.glowTween.isActive()) {
      this.glowTween = this.scene.tweens.add({
        targets: this,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 150,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      })
    }
  }

  public setIdle(): void {
    if (this.glowTween && this.glowTween.isActive()) {
      this.glowTween.stop()
      this.glowTween = null
    }
    this.scene.tweens.add({
      targets: this,
      scale: 1,
      duration: 100,
      ease: 'Sine.easeOut'
    })
  }

  public getVelocity(): Phaser.Math.Vector2 {
    const body = this.body as Phaser.Physics.Arcade.Body
    return body.velocity
  }
}
