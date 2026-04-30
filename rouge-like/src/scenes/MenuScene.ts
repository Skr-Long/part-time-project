import Phaser from 'phaser'

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' })
  }

  preload(): void {
  }

  create(): void {
    const centerX = this.cameras.main.width / 2
    const centerY = this.cameras.main.height / 2
    const width = this.cameras.main.width
    const height = this.cameras.main.height

    this.createBackground(width, height)

    this.addDecorations(width, height)

    this.createMenuPanel(centerX, centerY)
  }

  private createBackground(width: number, height: number): void {
    const graphics = this.add.graphics()
    graphics.fillStyle(0x1a1a2e, 1)
    graphics.fillRect(0, 0, width, height)

    graphics.lineStyle(1, 0x2a2a4e, 0.3)
    const gridSize = 60
    for (let x = 0; x <= width; x += gridSize) {
      graphics.lineBetween(x, 0, x, height)
    }
    for (let y = 0; y <= height; y += gridSize) {
      graphics.lineBetween(0, y, width, y)
    }
  }

  private addDecorations(width: number, height: number): void {
    const cornerRadius = 50

    const topLeft = this.add.circle(60, 60, cornerRadius, 0x0f3460, 0.3)
    topLeft.setStrokeStyle(3, 0x00d9ff, 0.5)

    const topRight = this.add.circle(width - 60, 60, cornerRadius, 0x0f3460, 0.3)
    topRight.setStrokeStyle(3, 0x00d9ff, 0.5)

    const bottomLeft = this.add.circle(60, height - 60, cornerRadius, 0x0f3460, 0.3)
    bottomLeft.setStrokeStyle(3, 0xe94560, 0.5)

    const bottomRight = this.add.circle(width - 60, height - 60, cornerRadius, 0x0f3460, 0.3)
    bottomRight.setStrokeStyle(3, 0xe94560, 0.5)

    this.addGeometricDecorations(width, height)
  }

  private addGeometricDecorations(width: number, _height: number): void {
    const leftTriangles = this.add.graphics()
    leftTriangles.fillStyle(0x00d9ff, 0.1)
    leftTriangles.lineStyle(2, 0x00d9ff, 0.2)

    for (let i = 0; i < 5; i++) {
      const y = 100 + i * 150
      const size = 20 + i * 10
      leftTriangles.beginPath()
      leftTriangles.moveTo(20, y)
      leftTriangles.lineTo(20 + size, y - size / 2)
      leftTriangles.lineTo(20 + size, y + size / 2)
      leftTriangles.closePath()
      leftTriangles.fillPath()
      leftTriangles.strokePath()
    }

    const rightTriangles = this.add.graphics()
    rightTriangles.fillStyle(0xe94560, 0.1)
    rightTriangles.lineStyle(2, 0xe94560, 0.2)

    for (let i = 0; i < 5; i++) {
      const y = 120 + i * 140
      const size = 25 + i * 8
      rightTriangles.beginPath()
      rightTriangles.moveTo(width - 20, y)
      rightTriangles.lineTo(width - 20 - size, y - size / 2)
      rightTriangles.lineTo(width - 20 - size, y + size / 2)
      rightTriangles.closePath()
      rightTriangles.fillPath()
      rightTriangles.strokePath()
    }

    this.add.tween({
      targets: [leftTriangles, rightTriangles],
      alpha: 0.5,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
  }

  private createMenuPanel(centerX: number, centerY: number): void {
    const panelWidth = Math.min(600, this.cameras.main.width - 100)
    const panelHeight = Math.min(450, this.cameras.main.height - 100)

    const panelBg = this.add.rectangle(centerX, centerY, panelWidth, panelHeight, 0x16213e, 0.9)
    panelBg.setStrokeStyle(3, 0x00d9ff, 0.8)

    const title = this.add.text(centerX, centerY - 120, 'ROGUE-LIKE', {
      fontSize: '56px',
      fontFamily: 'Arial Black, Arial',
      color: '#00d9ff',
      fontStyle: 'bold'
    })
    title.setOrigin(0.5)

    const subtitle = this.add.text(centerX, centerY - 60, '几何骑士', {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#e94560'
    })
    subtitle.setOrigin(0.5)

    this.createStartButton(centerX, centerY + 20)

    this.createControlsInfo(centerX, centerY + 120)
  }

  private createStartButton(centerX: number, centerY: number): void {
    const buttonWidth = 220
    const buttonHeight = 70

    const buttonBg = this.add.rectangle(centerX, centerY, buttonWidth, buttonHeight, 0x0f3460)
    buttonBg.setStrokeStyle(3, 0x00d9ff, 1)
    buttonBg.setInteractive({ useHandCursor: true })

    const buttonText = this.add.text(centerX, centerY, '开始游戏', {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#ffffff'
    })
    buttonText.setOrigin(0.5)

    buttonBg.on('pointerover', () => {
      this.tweens.add({
        targets: buttonBg,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 150,
        ease: 'Sine.easeOut'
      })
      buttonBg.setFillStyle(0x1a1a2e)
    })

    buttonBg.on('pointerout', () => {
      this.tweens.add({
        targets: buttonBg,
        scaleX: 1,
        scaleY: 1,
        duration: 150,
        ease: 'Sine.easeOut'
      })
      buttonBg.setFillStyle(0x0f3460)
    })

    buttonBg.on('pointerdown', () => {
      this.tweens.add({
        targets: buttonBg,
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 100,
        yoyo: true,
        onComplete: () => {
          this.startGame()
        }
      })
    })
  }

  private createControlsInfo(centerX: number, y: number): void {
    const controls = [
      { icon: '🎮', text: 'WASD / 方向键' },
      { icon: '🖱️', text: '鼠标左键射击' },
      { icon: '⚔️', text: '消灭敌人获得经验' }
    ]

    controls.forEach((control, index) => {
      const offsetY = y + index * 30
      const text = this.add.text(centerX, offsetY, `${control.icon} ${control.text}`, {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: '#aaaaaa'
      })
      text.setOrigin(0.5)
    })
  }

  private startGame(): void {
    this.cameras.main.fadeOut(500, 0, 0, 0)

    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start('GameScene')
    })
  }

  update(): void {
  }
}
