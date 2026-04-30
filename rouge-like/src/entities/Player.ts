import Phaser from 'phaser';
import { WeaponType, WEAPON_CONFIGS } from './WeaponTypes';
import type { WeaponConfig } from './WeaponTypes';

export class Player extends Phaser.Physics.Arcade.Image {
  private moveSpeed: number = 250;
  private playerRadius: number = 20;
  private glowTween: Phaser.Tweens.Tween | null = null;

  private maxHealth: number = 5;
  private currentHealth: number = 5;
  private experience: number = 0;
  private gold: number = 0;
  private level: number = 1;
  private isInvincible: boolean = false;
  private invincibleTimer: number = 0;

  private lastShootTime: number = 0;
  
  // 武器系统
  private availableWeapons: WeaponType[] = [
    WeaponType.NORMAL,
    WeaponType.PIERCING,
    WeaponType.SPREAD,
    WeaponType.RANGE,
    WeaponType.MINE
  ];
  private currentWeaponIndex: number = 0;
  private currentWeaponType: WeaponType = WeaponType.NORMAL;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, '');
    this.createPlayerTexture();
    this.setTexture('player');
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    this.setBounce(0.2);
    this.setDrag(800, 800);
    this.setMaxVelocity(this.moveSpeed, this.moveSpeed);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCircle(this.playerRadius, 0, 0);
  }

  private createPlayerTexture(): void {
    if (this.scene.textures.exists('player')) {
      return;
    }
    const size = this.playerRadius * 2;
    const canvas = this.scene.textures.createCanvas('player', size, size);
    if (!canvas) return;
    
    const ctx = canvas.getContext();
    if (!ctx) return;
    
    ctx.save();
    ctx.translate(size / 2, size / 2);
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.playerRadius + 8);
    gradient.addColorStop(0, 'rgba(0, 255, 204, 0.8)');
    gradient.addColorStop(0.5, 'rgba(0, 217, 255, 0.4)');
    gradient.addColorStop(1, 'rgba(0, 217, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, this.playerRadius + 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#00d9ff';
    ctx.beginPath();
    ctx.arc(0, 0, this.playerRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#00ffcc';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, this.playerRadius, 0, Math.PI * 2);
    ctx.stroke();
    const eyeOffset = 5;
    const eyeY = -2;
    const eyeRadius = 3;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-eyeOffset, eyeY, eyeRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(eyeOffset, eyeY, eyeRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#333333';
    ctx.beginPath();
    ctx.arc(-eyeOffset, eyeY, eyeRadius - 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(eyeOffset, eyeY, eyeRadius - 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    canvas.refresh();
  }

  public moveLeft(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAccelerationX(-800);
  }

  public moveRight(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAccelerationX(800);
  }

  public moveUp(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAccelerationY(-800);
  }

  public moveDown(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAccelerationY(800);
  }

  public stopHorizontal(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAccelerationX(0);
  }

  public stopVertical(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAccelerationY(0);
  }

  public setMoving(): void {
    if (!this.glowTween || !this.glowTween.isActive()) {
      this.glowTween = this.scene.tweens.add({
        targets: this,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 150,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  public setIdle(): void {
    if (this.glowTween && this.glowTween.isActive()) {
      this.glowTween.stop();
      this.glowTween = null;
    }
    this.scene.tweens.add({
      targets: this,
      scaleX: 1,
      scaleY: 1,
      duration: 100,
      ease: 'Sine.easeOut'
    });
  }

  public getVelocity(): Phaser.Math.Vector2 {
    const body = this.body as Phaser.Physics.Arcade.Body;
    return body.velocity;
  }

  public getCurrentHealth(): number {
    return this.currentHealth;
  }

  public getMaxHealth(): number {
    return this.maxHealth;
  }

  public takeDamage(amount: number = 1): boolean {
    if (this.isInvincible) {
      return false;
    }
    this.currentHealth -= amount;
    this.isInvincible = true;
    this.invincibleTimer = 1500;
    this.scene.tweens.add({
      targets: this,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 5
    });
    return this.currentHealth <= 0;
  }

  public heal(amount: number = 1): void {
    this.currentHealth = Math.min(this.currentHealth + amount, this.maxHealth);
  }

  public addExperience(amount: number): void {
    this.experience += amount;
  }

  public getExperience(): number {
    return this.experience;
  }

  public addGold(amount: number): void {
    this.gold += amount;
  }

  public getGold(): number {
    return this.gold;
  }

  public getLevel(): number {
    return this.level;
  }

  public canShoot(currentTime: number): boolean {
    const currentConfig = this.getCurrentWeaponConfig();
    return currentTime - this.lastShootTime >= currentConfig.cooldown;
  }

  public updateShootTime(currentTime: number): void {
    this.lastShootTime = currentTime;
  }

  public updateInvincibility(delta: number): void {
    if (this.isInvincible) {
      this.invincibleTimer -= delta;
      if (this.invincibleTimer <= 0) {
        this.isInvincible = false;
        this.setAlpha(1);
      }
    }
  }

  public getCurrentWeaponConfig(): WeaponConfig {
    return WEAPON_CONFIGS[this.currentWeaponType];
  }

  public getCurrentWeaponType(): WeaponType {
    return this.currentWeaponType;
  }

  public switchToNextWeapon(): WeaponConfig {
    this.currentWeaponIndex = (this.currentWeaponIndex + 1) % this.availableWeapons.length;
    this.currentWeaponType = this.availableWeapons[this.currentWeaponIndex];
    this.showWeaponSwitchEffect();
    return this.getCurrentWeaponConfig();
  }

  public switchToPrevWeapon(): WeaponConfig {
    this.currentWeaponIndex = (this.currentWeaponIndex - 1 + this.availableWeapons.length) % this.availableWeapons.length;
    this.currentWeaponType = this.availableWeapons[this.currentWeaponIndex];
    this.showWeaponSwitchEffect();
    return this.getCurrentWeaponConfig();
  }

  private showWeaponSwitchEffect(): void {
    // 武器切换时的视觉效果
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 150,
      yoyo: true,
      repeat: 1,
      ease: 'Sine.easeInOut'
    });
  }

  destroy(fromScene?: boolean): void {
    if (this.glowTween) {
      this.glowTween.stop();
    }
    super.destroy(fromScene);
  }
}
