import Phaser from 'phaser'
import { Enemy } from '../entities/Enemy'
import { Player } from '../entities/Player'

export class EnemySpawner {
  private scene: Phaser.Scene
  private player: Player
  private enemies: Phaser.Physics.Arcade.Group

  private spawnInterval: number = 3000
  private nextSpawnTime: number = 0
  private maxEnemies: number = 8
  private worldWidth: number
  private worldHeight: number

  constructor(
    scene: Phaser.Scene,
    player: Player,
    worldWidth: number,
    worldHeight: number
  ) {
    this.scene = scene
    this.player = player
    this.worldWidth = worldWidth
    this.worldHeight = worldHeight

    this.enemies = this.scene.physics.add.group({
      classType: Enemy,
      runChildUpdate: false
    })

    this.nextSpawnTime = this.scene.time.now + this.spawnInterval
  }

  public update(currentTime: number): void {
    if (currentTime >= this.nextSpawnTime && this.enemies.getChildren().length < this.maxEnemies) {
      this.spawnEnemy()
      this.nextSpawnTime = currentTime + this.spawnInterval
    }

    this.enemies.getChildren().forEach((child) => {
      const enemy = child as Enemy
      if (enemy.active) {
        enemy.update(currentTime)
      }
    })
  }

  private spawnEnemy(): void {
    const playerX = this.player.x
    const playerY = this.player.y

    const minDistance = 200
    const maxDistance = 500

    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2)
    const distance = Phaser.Math.FloatBetween(minDistance, maxDistance)

    let spawnX = playerX + Math.cos(angle) * distance
    let spawnY = playerY + Math.sin(angle) * distance

    spawnX = Phaser.Math.Clamp(spawnX, 60, this.worldWidth - 60)
    spawnY = Phaser.Math.Clamp(spawnY, 60, this.worldHeight - 60)

    const enemy = new Enemy(this.scene, spawnX, spawnY, this.player)
    this.enemies.add(enemy)
  }

  public getEnemies(): Phaser.Physics.Arcade.Group {
    return this.enemies
  }

  public removeEnemy(enemy: Enemy): void {
    this.enemies.remove(enemy, true, true)
  }

  public destroy(): void {
    this.enemies.destroy(true)
  }
}
