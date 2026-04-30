import Phaser from 'phaser'
import { Player } from '../entities/Player'
import { Enemy } from '../entities/Enemy'
import { Bullet } from '../entities/Bullet'
import { Mine } from '../entities/Mine'
import { WeaponType } from '../entities/WeaponTypes'
import type { WeaponConfig } from '../entities/WeaponTypes'
import { UIManager } from '../managers/UIManager'
import { EnemySpawner } from '../managers/EnemySpawner'

export class GameScene extends Phaser.Scene {
  private player!: Player
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private wasdKeys!: any
  private walls!: Phaser.Physics.Arcade.StaticGroup

  private uiManager!: UIManager
  private enemySpawner!: EnemySpawner

  private playerBullets!: Phaser.Physics.Arcade.Group
  private enemyBullets!: Phaser.Physics.Arcade.Group
  private playerMines!: Phaser.Physics.Arcade.Group

  private worldWidth: number = 3000
  private worldHeight: number = 2000

  private pointer!: Phaser.Input.Pointer
  private isPointerDown: boolean = false

  private isPaused: boolean = false

  private backgroundDecorations: Phaser.GameObjects.Group | null = null

  constructor() {
    super({ key: 'GameScene' })
  }

  preload(): void {
  }

  create(): void {
    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight)
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight)

    this.createBackground(this.worldWidth, this.worldHeight)

    this.walls = this.physics.add.staticGroup()
    this.createWalls(this.worldWidth, this.worldHeight)
    this.createObstacles(this.worldWidth, this.worldHeight)

    this.player = new Player(this, this.worldWidth / 2, this.worldHeight / 2)

    this.physics.add.collider(this.player, this.walls)

    this.playerBullets = this.physics.add.group({
      classType: Bullet,
      runChildUpdate: false
    })

    this.enemyBullets = this.physics.add.group({
      classType: Bullet,
      runChildUpdate: false
    })

    this.playerMines = this.physics.add.group({
      classType: Mine,
      runChildUpdate: false
    })

    this.enemySpawner = new EnemySpawner(this, this.player, this.worldWidth, this.worldHeight)

    this.uiManager = new UIManager(this, this.player)

    this.cursors = this.input.keyboard!.createCursorKeys()
    this.wasdKeys = this.input.keyboard!.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    })

    this.pointer = this.input.activePointer

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonDown()) {
        this.isPointerDown = true
      }
    })

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (!pointer.leftButtonDown()) {
        this.isPointerDown = false
      }
    })

    this.input.keyboard!.on('keydown-ESC', () => {
      this.isPaused = !this.isPaused
      this.physics.world.timeScale = this.isPaused ? 0 : 1
    })

    // 武器切换
    this.input.keyboard!.on('keydown-Q', () => {
      const newWeapon = this.player.switchToPrevWeapon()
      console.log(`切换武器: ${newWeapon.name}`)
    })

    this.input.keyboard!.on('keydown-E', () => {
      const newWeapon = this.player.switchToNextWeapon()
      console.log(`切换武器: ${newWeapon.name}`)
    })

    this.cameras.main.startFollow(this.player, true, 0.08, 0.08)
    this.cameras.main.setZoom(1)

    this.setupCollisions()

    this.cameras.main.fadeIn(500, 0, 0, 0)
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

    this.addBackgroundDecorations(width, height)
  }

  private addBackgroundDecorations(width: number, height: number): void {
    this.backgroundDecorations = this.add.group()

    for (let i = 0; i < 30; i++) {
      const x = Phaser.Math.FloatBetween(100, width - 100)
      const y = Phaser.Math.FloatBetween(100, height - 100)
      const size = Phaser.Math.FloatBetween(20, 60)
      const isCircle = Phaser.Math.Between(0, 1) === 0

      let decoration: Phaser.GameObjects.Shape
      if (isCircle) {
        decoration = this.add.circle(x, y, size / 2, 0x0f3460, 0.15)
        ;(decoration as Phaser.GameObjects.Arc).setStrokeStyle(1, 0x00d9ff, 0.2)
      } else {
        decoration = this.add.rectangle(x, y, size, size, 0x0f3460, 0.15)
        decoration.rotation = Phaser.Math.FloatBetween(0, Math.PI / 4)
        decoration.setStrokeStyle(1, 0xe94560, 0.2)
      }

      this.backgroundDecorations!.add(decoration)
    }
  }

  private setupCollisions(): void {
    this.physics.add.collider(this.enemySpawner.getEnemies(), this.walls)

    this.physics.add.collider(
      this.playerBullets,
      this.enemySpawner.getEnemies(),
      this.handleBulletEnemyCollision,
      undefined,
      this
    )

    this.physics.add.collider(
      this.playerBullets,
      this.walls,
      this.handleBulletWallCollision,
      undefined,
      this
    )

    this.physics.add.collider(
      this.enemyBullets,
      this.player,
      this.handleEnemyBulletPlayerCollision,
      undefined,
      this
    )

    this.physics.add.collider(
      this.enemyBullets,
      this.walls,
      this.handleBulletWallCollision,
      undefined,
      this
    )

    this.physics.add.overlap(
      this.player,
      this.enemySpawner.getEnemies(),
      this.handlePlayerEnemyOverlap,
      undefined,
      this
    )
  }

  private handleBulletEnemyCollision(
    bulletObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile,
    enemyObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile
  ): void {
    if (!(bulletObj instanceof Bullet) || !(enemyObj instanceof Enemy)) {
      return
    }
    
    const bullet = bulletObj as Bullet
    const enemy = enemyObj as Enemy

    if (!bullet.active || !enemy.active) {
      return
    }

    const enemyId = enemy.getEnemyId()

    // 检查是否已经击中过这个敌人（防止穿透时重复计算）
    if (bullet.hasHitEnemy(enemyId)) {
      return
    }

    // 标记敌人为已击中
    bullet.markEnemyAsHit(enemyId)

    const isDead = enemy.takeDamage(bullet.getDamage())

    // 处理穿透逻辑
    if (bullet.canPierce()) {
      // 子弹可以穿透，减少穿透计数并降低伤害
      bullet.registerHit()
    } else {
      // 子弹不能穿透，销毁子弹
      this.playerBullets.remove(bullet, true, true)
    }

    if (isDead) {
      this.player.addExperience(enemy.getExperienceValue())
      this.player.addGold(enemy.getGoldValue())
      this.enemySpawner.removeEnemy(enemy)

      this.addDeathEffect(enemy.x, enemy.y)
    }
  }

  private handleBulletWallCollision(
    bulletObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile,
    _wall: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile
  ): void {
    if (!(bulletObj instanceof Bullet)) {
      return
    }
    
    const bullet = bulletObj as Bullet
    if (bullet.active) {
      bullet.destroy()
    }
  }

  private handleEnemyBulletPlayerCollision(
    bulletObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile,
    playerObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile
  ): void {
    if (!(bulletObj instanceof Bullet) || !(playerObj instanceof Player)) {
      return
    }
    
    const bullet = bulletObj as Bullet
    const player = playerObj as Player

    if (!bullet.active) {
      return
    }

    const isDead = player.takeDamage(bullet.getDamage())
    this.enemyBullets.remove(bullet, true, true)

    if (isDead) {
      this.handlePlayerDeath()
    }
  }

  private handlePlayerEnemyOverlap(
    playerObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile,
    enemyObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile
  ): void {
    if (!(playerObj instanceof Player) || !(enemyObj instanceof Enemy)) {
      return
    }
    
    const player = playerObj as Player
    const enemy = enemyObj as Enemy
    const currentTime = this.time.now

    if (enemy.canAttack(currentTime)) {
      const damage = enemy.attack(currentTime)
      const isDead = player.takeDamage(damage)

      if (isDead) {
        this.handlePlayerDeath()
      }
    }
  }

  private addDeathEffect(x: number, y: number): void {
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8
      const distance = Phaser.Math.FloatBetween(20, 60)
      const endX = x + Math.cos(angle) * distance
      const endY = y + Math.sin(angle) * distance

      const particle = this.add.circle(x, y, 4, 0xe94560)
      particle.setStrokeStyle(1, 0xff6464)

      this.tweens.add({
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

  private handlePlayerDeath(): void {
    this.cameras.main.fadeOut(1000, 0, 0, 0)

    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.restart()
    })
  }

  update(time: number, delta: number): void {
    if (this.isPaused) {
      return
    }

    this.player.updateInvincibility(delta)
    this.updatePlayerMovement()
    this.handleShooting(time)
    this.enemySpawner.update(time)
    this.updateBullets(time)
    this.updateMines(time)
    this.uiManager.update()
  }

  private updatePlayerMovement(): void {
    const velocity = this.player.getVelocity()

    if (Math.abs(velocity.x) < 1 && Math.abs(velocity.y) < 1) {
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

  private handleShooting(currentTime: number): void {
    if (!this.isPointerDown) {
      return
    }

    if (!this.player.canShoot(currentTime)) {
      return
    }

    const currentWeaponType = this.player.getCurrentWeaponType()
    const currentWeaponConfig = this.player.getCurrentWeaponConfig()

    if (currentWeaponType === WeaponType.MINE) {
      // 放置地雷
      this.placeMine(currentWeaponConfig)
    } else {
      // 发射子弹类武器
      const worldPoint = this.cameras.main.getWorldPoint(this.pointer.x, this.pointer.y)

      const dx = worldPoint.x - this.player.x
      const dy = worldPoint.y - this.player.y

      const length = Math.sqrt(dx * dx + dy * dy)
      if (length === 0) {
        return
      }

      this.fireBullets(dx, dy, currentWeaponConfig)
    }

    this.player.updateShootTime(currentTime)
  }

  private placeMine(config: WeaponConfig): void {
    const mine = new Mine(this, this.player.x, this.player.y, config.damage, config.range || 100)
    this.playerMines.add(mine)
  }

  private fireBullets(dx: number, dy: number, config: WeaponConfig): void {
    const bulletCount = config.bulletCount || 1
    const spreadAngle = config.spreadAngle || 0

    if (bulletCount === 1 || spreadAngle === 0) {
      // 单发射击
      this.createBullet(dx, dy, config)
    } else {
      // 散弹射击
      const angle = Math.atan2(dy, dx)
      const angleIncrement = Phaser.Math.DegToRad(spreadAngle) / (bulletCount - 1)
      const startAngle = angle - Phaser.Math.DegToRad(spreadAngle) / 2

      for (let i = 0; i < bulletCount; i++) {
        const currentAngle = startAngle + angleIncrement * i
        const bulletDx = Math.cos(currentAngle)
        const bulletDy = Math.sin(currentAngle)
        this.createBullet(bulletDx, bulletDy, config)
      }
    }
  }

  private createBullet(dx: number, dy: number, config: WeaponConfig): void {
    const bullet = new Bullet(
      this,
      this.player.x,
      this.player.y,
      dx,
      dy,
      false,
      config.damage,
      config.type,
      config.pierceCount || 0,
      config.damageDropoff || 0,
      config.range || Infinity
    )
    this.playerBullets.add(bullet)
  }

  private updateBullets(currentTime: number): void {
    this.playerBullets.getChildren().forEach((child) => {
      const bullet = child as Bullet
      if (bullet.active) {
        // 检查生命周期
        if (bullet.checkLifeTime(currentTime)) {
          bullet.destroy()
        }
        // 检查射程
        else if (bullet.checkRange()) {
          bullet.destroy()
        }
      }
    })

    this.enemyBullets.getChildren().forEach((child) => {
      const bullet = child as Bullet
      if (bullet.active && bullet.checkLifeTime(currentTime)) {
        bullet.destroy()
      }
    })
  }

  private updateMines(currentTime: number): void {
    const mines = this.playerMines.getChildren() as Mine[]
    const enemies = this.enemySpawner.getEnemies()
    
    for (const mine of mines) {
      if (!mine.active) continue
      
      // 更新地雷状态
      mine.update(currentTime)
      
      // 检查是否需要爆炸
      if (mine.checkShouldExplode(enemies)) {
        // 处理爆炸伤害
        this.handleMineExplosion(mine, enemies)
        
        // 触发地雷爆炸视觉效果
        mine.explode()
      }
    }
  }

  private handleMineExplosion(mine: Mine, enemies: Phaser.Physics.Arcade.Group): void {
    const enemiesList = enemies.getChildren() as Enemy[]
    
    for (const enemy of enemiesList) {
      if (!enemy.active) continue
      
      const distance = Phaser.Math.Distance.Between(
        mine.x, mine.y,
        enemy.x, enemy.y
      )
      
      if (distance <= mine.getExplosionRadius()) {
        const damage = mine.getExplosionDamage(distance)
        const isDead = enemy.takeDamage(damage)
        
        if (isDead) {
          this.player.addExperience(enemy.getExperienceValue())
          this.player.addGold(enemy.getGoldValue())
          this.enemySpawner.removeEnemy(enemy)
          this.addDeathEffect(enemy.x, enemy.y)
        }
      }
    }
  }

  private createWalls(width: number, height: number): void {
    const wallThickness = 60

    const topWall = this.add.rectangle(width / 2, wallThickness / 2, width, wallThickness, 0x16213e)
    const bottomWall = this.add.rectangle(width / 2, height - wallThickness / 2, width, wallThickness, 0x16213e)
    const leftWall = this.add.rectangle(wallThickness / 2, height / 2, wallThickness, height, 0x16213e)
    const rightWall = this.add.rectangle(width - wallThickness / 2, height / 2, wallThickness, height, 0x16213e)

    topWall.setStrokeStyle(4, 0x00d9ff, 0.5)
    bottomWall.setStrokeStyle(4, 0x00d9ff, 0.5)
    leftWall.setStrokeStyle(4, 0xe94560, 0.5)
    rightWall.setStrokeStyle(4, 0xe94560, 0.5)

    this.walls.add(topWall)
    this.walls.add(bottomWall)
    this.walls.add(leftWall)
    this.walls.add(rightWall)
  }

  private createObstacles(_width: number, _height: number): void {
    const obstaclePositions = [
      { x: 300, y: 300, w: 120, h: 180 },
      { x: 800, y: 250, w: 180, h: 120 },
      { x: 500, y: 600, w: 240, h: 100 },
      { x: 1200, y: 400, w: 150, h: 240 },
      { x: 1600, y: 200, w: 220, h: 120 },
      { x: 1400, y: 700, w: 130, h: 180 },
      { x: 2000, y: 500, w: 180, h: 150 },
      { x: 900, y: 900, w: 240, h: 120 },
      { x: 2200, y: 800, w: 200, h: 160 },
      { x: 2500, y: 400, w: 160, h: 200 },
      { x: 400, y: 1200, w: 180, h: 140 },
      { x: 1000, y: 1400, w: 220, h: 120 },
      { x: 1800, y: 1200, w: 200, h: 180 },
      { x: 2400, y: 1500, w: 160, h: 200 },
      { x: 700, y: 1600, w: 180, h: 150 }
    ]

    obstaclePositions.forEach(pos => {
      const obstacle = this.add.rectangle(pos.x, pos.y, pos.w, pos.h, 0x0f3460)
      obstacle.setStrokeStyle(3, 0x00d9ff)
      this.walls.add(obstacle)
    })
  }
}
