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

    this.add.rectangle(centerX, centerY, 800, 500, 0x16213e, 0.8)

    const title = this.add.text(centerX, centerY - 100, 'ROGUE-LIKE', {
      fontSize: '64px',
      fontFamily: 'Arial',
      color: '#00d9ff',
      fontStyle: 'bold'
    })
    title.setOrigin(0.5)

    const subtitle = this.add.text(centerX, centerY - 40, '几何骑士', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#e94560'
    })
    subtitle.setOrigin(0.5)

    const startButton = this.add.rectangle(centerX, centerY + 50, 200, 60, 0x0f3460)
    startButton.setInteractive()

    const startText = this.add.text(centerX, centerY + 50, '开始游戏', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff'
    })
    startText.setOrigin(0.5)

    startButton.on('pointerover', () => {
      startButton.setFillStyle(0x1a1a2e)
    })

    startButton.on('pointerout', () => {
      startButton.setFillStyle(0x0f3460)
    })

    startButton.on('pointerdown', () => {
      this.scene.start('GameScene')
    })

    const controlsText = this.add.text(centerX, centerY + 130, '操作说明：WASD 或 方向键移动', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#888888'
    })
    controlsText.setOrigin(0.5)
  }

  update(): void {
  }
}
