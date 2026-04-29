import Phaser from 'phaser'
import { Player } from '../entities/Player'

export class GameScene extends Phaser.Scene {
  private player!: Player
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private wasdKeys!: any
  private walls!: Phaser.Physics.Arcade.StaticGroup

  constructor() {
    super({ key: 'GameScene' })
  }

  preload(): void {
  }

  create(): void {
    const width = this.scale.width
    const height = this.scale.height
    const worldWidth = width * 2
    const worldHeight = height * 2

    this.physics.world.setBounds(0, 0, worldWidth, worldHeight)
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight)

    this.createBackground(worldWidth, worldHeight)

    this.walls = this.physics.add.staticGroup()
    this.createWalls(worldWidth, worldHeight)
    this.createObstacles(worldWidth, worldHeight)

    this.player = new Player(this, worldWidth / 2, worldHeight / 2)

    this.physics.add.collider(this.player, this.walls)

    this.cursors = this.input.keyboard!.createCursorKeys()
    this.wasdKeys = this.input.keyboard!.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    })

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1)

    this.createUI()
  }

  update(): void {
    const velocity = this.player.getVelocity()

    if (velocity.x === 0 && velocity.y === 0) {
      this.player.setIdle()
    } else {
      this.player.setMoving()
    }

    if (this.cursors.left.isDown || this.wasdKeys.left.isDown) {
      this.player.moveLeft()
    } else if (this.cursors.right.isDown || this.wasdKeys.right.isDown) {
      this.player.moveRight()
    } else {
      this.player.stopHorizontal()
    }

    if (this.cursors.up.isDown || this.wasdKeys.up.isDown) {
      this.player.moveUp()
    } else if (this.cursors.down.isDown || this.wasdKeys.down.isDown) {
      this.player.moveDown()
    } else {
      this.player.stopVertical()
    }
  }

  private createBackground(width: number, height: number): void {
    const graphics = this.add.graphics()
    graphics.fillStyle(0x1a1a2e, 1)
    graphics.fillRect(0, 0, width, height)

    graphics.lineStyle(1, 0x2a2a4e, 0.5)
    const gridSize = 50
    for (let x = 0; x <= width; x += gridSize) {
      graphics.lineBetween(x, 0, x, height)
    }
    for (let y = 0; y <= height; y += gridSize) {
      graphics.lineBetween(0, y, width, y)
    }

    this.add.existing(graphics)
  }

  private createWalls(width: number, height: number): void {
    const wallThickness = 40

    const topWall = this.add.rectangle(width / 2, wallThickness / 2, width, wallThickness, 0x16213e)
    const bottomWall = this.add.rectangle(width / 2, height - wallThickness / 2, width, wallThickness, 0x16213e)
    const leftWall = this.add.rectangle(wallThickness / 2, height / 2, wallThickness, height, 0x16213e)
    const rightWall = this.add.rectangle(width - wallThickness / 2, height / 2, wallThickness, height, 0x16213e)

    this.walls.add(topWall)
    this.walls.add(bottomWall)
    this.walls.add(leftWall)
    this.walls.add(rightWall)
  }

  private createObstacles(width: number, height: number): void {
    const obstaclePositions = [
      { x: 300, y: 300, w: 100, h: 150 },
      { x: 800, y: 250, w: 150, h: 100 },
      { x: 500, y: 600, w: 200, h: 80 },
      { x: 1200, y: 400, w: 120, h: 200 },
      { x: 1600, y: 200, w: 180, h: 100 },
      { x: 1400, y: 700, w: 100, h: 150 },
      { x: 2000, y: 500, w: 150, h: 120 },
      { x: 900, y: 900, w: 200, h: 100 }
    ]

    obstaclePositions.forEach(pos => {
      const obstacle = this.add.rectangle(pos.x, pos.y, pos.w, pos.h, 0x0f3460)
      obstacle.setStrokeStyle(2, 0x00d9ff)
      this.walls.add(obstacle)
    })
  }

  private createUI(): void {
    const camera = this.cameras.main

    const healthBarBg = this.add.rectangle(
      camera.midPoint.x - camera.width / 2 + 120,
      camera.midPoint.y - camera.height / 2 + 40,
      200,
      30,
      0x333333,
      0.7
    )
    healthBarBg.setStrokeStyle(2, 0x666666)
    healthBarBg.setScrollFactor(0)

    const healthBar = this.add.rectangle(
      healthBarBg.x,
      healthBarBg.y,
      196,
      26,
      0xe94560
    )
    healthBar.setScrollFactor(0)

    const healthText = this.add.text(
      healthBarBg.x,
      healthBarBg.y,
      '生命: 100/100',
      {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: '#ffffff'
      }
    )
    healthText.setOrigin(0.5)
    healthText.setScrollFactor(0)
  }
}
