import Phaser from 'phaser'
import { Player } from '../entities/Player'

export class UIManager {
  private scene: Phaser.Scene
  private player: Player

  private healthHearts: Phaser.GameObjects.Image[] = []
  private experienceText!: Phaser.GameObjects.Text
  private goldText!: Phaser.GameObjects.Text
  private levelText!: Phaser.GameObjects.Text

  private heartFullKey: string = 'heartFull'
  private heartEmptyKey: string = 'heartEmpty'

  constructor(scene: Phaser.Scene, player: Player) {
    this.scene = scene
    this.player = player

    this.createHeartTextures()
    this.createUI()
  }

  private createHeartTextures(): void {
    if (this.scene.textures.exists(this.heartFullKey)) {
      return
    }

    const size = 32

    const fullCanvas = this.scene.textures.createCanvas(this.heartFullKey, size, size)
    const fullCtx = fullCanvas.getContext()
    this.drawHeart(fullCtx, size, '#e94560', '#ff6464')
    fullCanvas.refresh()

    const emptyCanvas = this.scene.textures.createCanvas(this.heartEmptyKey, size, size)
    const emptyCtx = emptyCanvas.getContext()
    this.drawHeart(emptyCtx, size, '#333333', '#555555')
    emptyCanvas.refresh()
  }

  private drawHeart(
    ctx: CanvasRenderingContext2D,
    size: number,
    fillColor: string,
    strokeColor: string
  ): void {
    const centerX = size / 2
    const centerY = size / 2
    const scale = size / 34

    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.scale(scale, scale)

    ctx.beginPath()
    ctx.moveTo(0, 5)
    ctx.bezierCurveTo(-10, -5, -15, 5, 0, 15)
    ctx.bezierCurveTo(15, 5, 10, -5, 0, 5)
    ctx.closePath()

    ctx.fillStyle = fillColor
    ctx.fill()

    ctx.lineWidth = 1.5
    ctx.strokeStyle = strokeColor
    ctx.stroke()

    ctx.restore()
  }

  private createUI(): void {
    const padding = 20
    let yOffset = padding

    const healthLabel = this.scene.add.text(padding, yOffset, '生命:', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffffff'
    })
    healthLabel.setScrollFactor(0)
    yOffset += 5

    this.createHearts()

    yOffset += 45

    this.levelText = this.scene.add.text(padding, yOffset, `等级: ${this.player.getLevel()}`, {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffd700'
    })
    this.levelText.setScrollFactor(0)
    yOffset += 28

    this.experienceText = this.scene.add.text(
      padding,
      yOffset,
      `经验: ${this.player.getExperience()}`,
      {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: '#00ff88'
      }
    )
    this.experienceText.setScrollFactor(0)
    yOffset += 28

    this.goldText = this.scene.add.text(
      padding,
      yOffset,
      `金币: ${this.player.getGold()}`,
      {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: '#ffd700'
      }
    )
    this.goldText.setScrollFactor(0)
  }

  private createHearts(): void {
    const maxHealth = this.player.getMaxHealth()
    const currentHealth = this.player.getCurrentHealth()
    const startX = 70
    const startY = 20

    this.healthHearts.forEach(heart => heart.destroy())
    this.healthHearts = []

    for (let i = 0; i < maxHealth; i++) {
      const isFull = i < currentHealth
      const heart = this.scene.add.image(
        startX + i * 38,
        startY,
        isFull ? this.heartFullKey : this.heartEmptyKey
      )
      heart.setOrigin(0, 0)
      heart.setScrollFactor(0)
      this.healthHearts.push(heart)
    }
  }

  public update(): void {
    const maxHealth = this.player.getMaxHealth()
    const currentHealth = this.player.getCurrentHealth()

    if (this.healthHearts.length !== maxHealth) {
      this.createHearts()
    } else {
      for (let i = 0; i < maxHealth; i++) {
        const isFull = i < currentHealth
        this.healthHearts[i].setTexture(isFull ? this.heartFullKey : this.heartEmptyKey)
      }
    }

    this.experienceText.setText(`经验: ${this.player.getExperience()}`)
    this.goldText.setText(`金币: ${this.player.getGold()}`)
    this.levelText.setText(`等级: ${this.player.getLevel()}`)
  }

  public destroy(): void {
    this.healthHearts.forEach(heart => heart.destroy())
    this.experienceText.destroy()
    this.goldText.destroy()
    this.levelText.destroy()
  }
}
