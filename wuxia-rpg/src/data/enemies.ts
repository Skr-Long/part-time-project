import type { Enemy } from '../types';
import { scaleEnemyAttributes } from '../utils/combat';

export const ENEMIES: Record<string, Enemy> = {
  'wild-boar': {
    id: 'wild-boar', nameCN: '野猪', descriptionCN: '山林中出没的野猪，性情凶猛',
    level: 1, zone: 1,
    attributes: { constitution: 3, strength: 2, physique: 2, agility: 1, insight: 1, luck: 1 },
    maxEnergy: 25,
    expReward: 12, goldReward: { min: 3, max: 15 }, lootTable: []
  },
  wolf: {
    id: 'wolf', nameCN: '野狼', descriptionCN: '丛林中的野狼，凶猛异常',
    level: 1, zone: 1,
    attributes: { constitution: 2, strength: 2, physique: 1, agility: 1, insight: 2, luck: 2 },
    maxEnergy: 30,
    expReward: 15, goldReward: { min: 5, max: 20 }, lootTable: []
  },
  snake: {
    id: 'snake', nameCN: '毒蛇', descriptionCN: '草丛中潜伏的毒蛇，剧毒无比',
    level: 1, zone: 1,
    attributes: { constitution: 1, strength: 2, physique: 1, agility: 3, insight: 2, luck: 2 },
    maxEnergy: 20,
    expReward: 12, goldReward: { min: 5, max: 18 }, lootTable: []
  },
  thug: {
    id: 'thug', nameCN: '地痞流氓', descriptionCN: '街头小巷的混混，欺压良善',
    level: 1, zone: 1,
    attributes: { constitution: 2, strength: 2, physique: 1, agility: 2, insight: 1, luck: 2 },
    maxEnergy: 25,
    expReward: 10, goldReward: { min: 8, max: 25 }, lootTable: []
  },
  bandit: {
    id: 'bandit', nameCN: '山贼', descriptionCN: '占山为王的匪徒',
    level: 2, zone: 1,
    attributes: { constitution: 3, strength: 3, physique: 2, agility: 1, insight: 2, luck: 2 },
    maxEnergy: 45,
    expReward: 25, goldReward: { min: 10, max: 40 }, lootTable: []
  },
  'debt-collector': {
    id: 'debt-collector', nameCN: '讨债打手', descriptionCN: '地主家的打手，专门欺压百姓',
    level: 2, zone: 1,
    attributes: { constitution: 3, strength: 3, physique: 2, agility: 2, insight: 1, luck: 2 },
    maxEnergy: 40,
    expReward: 20, goldReward: { min: 15, max: 45 }, lootTable: []
  },
  'wild-bear': {
    id: 'wild-bear', nameCN: '野熊', descriptionCN: '深山中的野熊，力大无穷',
    level: 2, zone: 1,
    attributes: { constitution: 5, strength: 4, physique: 3, agility: 1, insight: 1, luck: 1 },
    maxEnergy: 50,
    expReward: 25, goldReward: { min: 5, max: 25 }, lootTable: []
  },
  'mountain-bandit': {
    id: 'mountain-bandit', nameCN: '高山贼', descriptionCN: '盘踞高山的匪首',
    level: 3, zone: 2,
    attributes: { constitution: 4, strength: 4, physique: 3, agility: 2, insight: 2, luck: 2 },
    maxEnergy: 60,
    expReward: 40, goldReward: { min: 20, max: 60 }, lootTable: []
  },
  'cave-spider': {
    id: 'cave-spider', nameCN: '洞穴蜘蛛', descriptionCN: '幽冥洞府中的毒蜘蛛',
    level: 3, zone: 2,
    attributes: { constitution: 3, strength: 4, physique: 2, agility: 3, insight: 2, luck: 2 },
    maxEnergy: 55,
    expReward: 45, goldReward: { min: 25, max: 70 }, lootTable: []
  },
  pickpocket: {
    id: 'pickpocket', nameCN: '小贼', descriptionCN: '混迹江湖的小偷，轻功了得',
    level: 3, zone: 2,
    attributes: { constitution: 2, strength: 2, physique: 1, agility: 5, insight: 3, luck: 4 },
    maxEnergy: 35,
    expReward: 30, goldReward: { min: 20, max: 50 }, lootTable: []
  },
  'shadow-beast': {
    id: 'shadow-beast', nameCN: '幽冥兽', descriptionCN: '幽暗密林中的妖兽',
    level: 4, zone: 2,
    attributes: { constitution: 5, strength: 5, physique: 4, agility: 3, insight: 2, luck: 2 },
    maxEnergy: 75,
    expReward: 60, goldReward: { min: 30, max: 80 }, lootTable: []
  },
  'temple-guard': {
    id: 'temple-guard', nameCN: '寺院护卫', descriptionCN: '古刹禅寺的武僧',
    level: 5, zone: 2,
    attributes: { constitution: 6, strength: 5, physique: 5, agility: 2, insight: 3, luck: 2 },
    maxEnergy: 95,
    expReward: 80, goldReward: { min: 40, max: 100 }, lootTable: []
  },
  'rogue-disciple': {
    id: 'rogue-disciple', nameCN: '叛徒弟子', descriptionCN: '背叛师门的武林败类，武功不弱',
    level: 5, zone: 2,
    attributes: { constitution: 4, strength: 5, physique: 3, agility: 4, insight: 3, luck: 2 },
    maxEnergy: 70,
    expReward: 70, goldReward: { min: 50, max: 120 }, lootTable: []
  },
  'flower-thief': {
    id: 'flower-thief', nameCN: '采花贼', descriptionCN: '江湖上臭名昭著的采花大盗，轻功极佳',
    level: 6, zone: 3,
    attributes: { constitution: 4, strength: 4, physique: 3, agility: 6, insight: 3, luck: 3 },
    maxEnergy: 80,
    expReward: 90, goldReward: { min: 60, max: 150 }, lootTable: []
  },
  jiangshi: {
    id: 'jiangshi', nameCN: '僵尸', descriptionCN: '古墓中复活的僵尸，刀枪不入',
    level: 6, zone: 3,
    attributes: { constitution: 8, strength: 6, physique: 7, agility: 2, insight: 1, luck: 1 },
    maxEnergy: 100,
    expReward: 100, goldReward: { min: 40, max: 90 }, lootTable: []
  },
  'mountain-ape': {
    id: 'mountain-ape', nameCN: '山猿', descriptionCN: '深山中的猿猴，身形敏捷',
    level: 6, zone: 3,
    attributes: { constitution: 5, strength: 6, physique: 4, agility: 5, insight: 3, luck: 2 },
    maxEnergy: 75,
    expReward: 85, goldReward: { min: 30, max: 70 }, lootTable: []
  },
  evildoer: {
    id: 'evildoer', nameCN: '江湖恶人', descriptionCN: '作恶多端的江湖败类',
    level: 7, zone: 3,
    attributes: { constitution: 6, strength: 6, physique: 5, agility: 4, insight: 3, luck: 3 },
    maxEnergy: 90,
    expReward: 110, goldReward: { min: 70, max: 160 }, lootTable: []
  },
  'scorpion-king': {
    id: 'scorpion-king', nameCN: '蝎王', descriptionCN: '万毒谷中的毒蝎之王，剧毒无比',
    level: 7, zone: 3,
    attributes: { constitution: 4, strength: 5, physique: 3, agility: 7, insight: 4, luck: 2 },
    maxEnergy: 85,
    expReward: 115, goldReward: { min: 50, max: 120 }, lootTable: []
  },
  assassin: {
    id: 'assassin', nameCN: '杀手', descriptionCN: '神秘组织派出的杀手，剑法凌厉',
    level: 8, zone: 3,
    attributes: { constitution: 5, strength: 7, physique: 4, agility: 7, insight: 4, luck: 3 },
    maxEnergy: 100,
    expReward: 140, goldReward: { min: 100, max: 250 }, lootTable: []
  },
  'giant-wolf': {
    id: 'giant-wolf', nameCN: '巨狼', descriptionCN: '狼群中的狼王，体型巨大',
    level: 8, zone: 3,
    attributes: { constitution: 7, strength: 8, physique: 6, agility: 5, insight: 3, luck: 2 },
    maxEnergy: 110,
    expReward: 135, goldReward: { min: 60, max: 130 }, lootTable: []
  },
  'blood-sect-disciple': {
    id: 'blood-sect-disciple', nameCN: '血教弟子', descriptionCN: '邪教血神教的弟子，武功邪门',
    level: 9, zone: 4,
    attributes: { constitution: 6, strength: 7, physique: 5, agility: 5, insight: 4, luck: 3 },
    maxEnergy: 115,
    expReward: 160, goldReward: { min: 120, max: 280 }, lootTable: []
  },
  'poison-master': {
    id: 'poison-master', nameCN: '毒师', descriptionCN: '擅长用毒的武林高手',
    level: 9, zone: 4,
    attributes: { constitution: 5, strength: 5, physique: 4, agility: 6, insight: 7, luck: 3 },
    maxEnergy: 105,
    expReward: 155, goldReward: { min: 100, max: 250 }, lootTable: []
  },
  'jiangshi-king': {
    id: 'jiangshi-king', nameCN: '尸王', descriptionCN: '千年古墓中的尸王，功力深厚',
    level: 10, zone: 4,
    attributes: { constitution: 12, strength: 10, physique: 10, agility: 3, insight: 2, luck: 2 },
    maxEnergy: 160,
    expReward: 200, goldReward: { min: 150, max: 350 }, lootTable: [],
    isBoss: true
  },
  'demon-cult-elder': {
    id: 'demon-cult-elder', nameCN: '魔教长老', descriptionCN: '魔教的核心人物，武功高强',
    level: 10, zone: 4,
    attributes: { constitution: 8, strength: 9, physique: 8, agility: 7, insight: 6, luck: 4 },
    maxEnergy: 150,
    expReward: 220, goldReward: { min: 200, max: 400 }, lootTable: []
  },
  'black-wind-boss': {
    id: 'black-wind-boss', nameCN: '黑风寨主', descriptionCN: '黑风山的大寨主，武功高强，手下山贼无数',
    level: 8, zone: 3,
    attributes: { constitution: 9, strength: 10, physique: 7, agility: 5, insight: 4, luck: 3 },
    maxEnergy: 130,
    expReward: 180, goldReward: { min: 150, max: 300 }, lootTable: [],
    isBoss: true
  },
  'poison-valley-boss': {
    id: 'poison-valley-boss', nameCN: '万毒谷主', descriptionCN: '万毒谷的谷主，擅长用毒，杀人于无形',
    level: 9, zone: 3,
    attributes: { constitution: 7, strength: 6, physique: 5, agility: 8, insight: 10, luck: 4 },
    maxEnergy: 125,
    expReward: 190, goldReward: { min: 180, max: 350 }, lootTable: [],
    isBoss: true
  },
  'blood-sect-master': {
    id: 'blood-sect-master', nameCN: '血神教主', descriptionCN: '血神教的教主，武功邪门，杀人如麻',
    level: 12, zone: 4,
    attributes: { constitution: 10, strength: 11, physique: 9, agility: 8, insight: 7, luck: 5 },
    maxEnergy: 180,
    expReward: 280, goldReward: { min: 300, max: 500 }, lootTable: [],
    isBoss: true
  },
  'evil-valley-leader': {
    id: 'evil-valley-leader', nameCN: '恶人谷主', descriptionCN: '恶人谷的谷主，天下恶人之首',
    level: 11, zone: 4,
    attributes: { constitution: 10, strength: 10, physique: 8, agility: 9, insight: 8, luck: 5 },
    maxEnergy: 170,
    expReward: 250, goldReward: { min: 250, max: 450 }, lootTable: [],
    isBoss: true
  },
  'cave-monster': {
    id: 'cave-monster', nameCN: '洞府妖兽', descriptionCN: '幽冥洞府深处的妖兽，体型巨大',
    level: 7, zone: 2,
    attributes: { constitution: 10, strength: 9, physique: 8, agility: 4, insight: 2, luck: 2 },
    maxEnergy: 120,
    expReward: 130, goldReward: { min: 80, max: 200 }, lootTable: [],
    isBoss: true
  },
};

export function getScaledEnemy(enemyId: string, playerLevel: number): Enemy {
  const base = ENEMIES[enemyId];
  if (!base) throw new Error(`Enemy ${enemyId} not found`);
  return scaleEnemyAttributes(base, playerLevel);
}
