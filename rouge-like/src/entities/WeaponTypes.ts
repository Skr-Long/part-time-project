export const WeaponType = {
  NORMAL: 'normal',
  PIERCING: 'piercing',
  SPREAD: 'spread',
  RANGE: 'range',
  MINE: 'mine'
} as const;

export type WeaponType = typeof WeaponType[keyof typeof WeaponType];

export interface WeaponConfig {
  type: WeaponType;
  name: string;
  damage: number;
  speed: number;
  cooldown: number;
  bulletCount?: number;
  spreadAngle?: number;
  pierceCount?: number;
  damageDropoff?: number;
  range?: number;
}

export const WEAPON_CONFIGS: Record<WeaponType, WeaponConfig> = {
  [WeaponType.NORMAL]: {
    type: WeaponType.NORMAL,
    name: '普通射击',
    damage: 1,
    speed: 500,
    cooldown: 300,
    bulletCount: 1,
    pierceCount: 0,
    damageDropoff: 0,
    range: Infinity
  },
  [WeaponType.PIERCING]: {
    type: WeaponType.PIERCING,
    name: '穿透射击',
    damage: 1,
    speed: 600,
    cooldown: 400,
    bulletCount: 1,
    pierceCount: 3,
    damageDropoff: 0.2,
    range: Infinity
  },
  [WeaponType.SPREAD]: {
    type: WeaponType.SPREAD,
    name: '散弹射击',
    damage: 0.8,
    speed: 450,
    cooldown: 600,
    bulletCount: 5,
    spreadAngle: 30,
    pierceCount: 0,
    damageDropoff: 0.1,
    range: 400
  },
  [WeaponType.RANGE]: {
    type: WeaponType.RANGE,
    name: '远程射击',
    damage: 0.5,
    speed: 700,
    cooldown: 200,
    bulletCount: 1,
    pierceCount: 0,
    damageDropoff: 0.05,
    range: Infinity
  },
  [WeaponType.MINE]: {
    type: WeaponType.MINE,
    name: '地雷',
    damage: 5,
    speed: 0,
    cooldown: 800,
    bulletCount: 1,
    pierceCount: 0,
    damageDropoff: 0,
    range: 100
  }
};
