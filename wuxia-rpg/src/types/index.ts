// ============================================
// Wuxia Text RPG - Type Definitions
// ============================================

// --- Core Attributes ---
export interface Attributes {
  insight: number;       // 悟性: 1-10, 影响内功上限和技能学习速度
  constitution: number;  // 体质: min 1, 影响最大生命值
  strength: number;      // 力量: min 1, 影响攻击力
  agility: number;       // 敏捷: min 1, 影响速度
  physique: number;      // 根骨: min 1, 影响防御力、技能熟练度和悟性增益
  luck: number;          // 幸运: -5 to 10, 影响暴击率和随机事件
}

// --- Combat Stats ---
export interface CombatStats {
  maxHP: number;
  currentHP: number;
  maxEnergy: number;    // 内功上限
  currentEnergy: number; // 当前内功
  attack: number;
  defense: number;
  speed: number;
  critChance: number;   // 暴击率 0-100
}

export type CombatStatsType = Omit<CombatStats, 'currentHP' | 'currentEnergy'>;

// --- Attribute Modifier (for buffs, debuffs, equipment, skills) ---
export interface AttributeModifier {
  id: string;
  source: string;
  type: 'add' | 'multiply' | 'override';
  attribute?: keyof Attributes;
  combatStat?: keyof CombatStatsType;
  value: number;
  duration?: number;
  stackable?: boolean;
}

// --- Equipment Rarity ---
export type EquipmentRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export const EQUIPMENT_RARITY_INFO: Record<EquipmentRarity, { nameCN: string; color: string; bonusMultiplier: number }> = {
  common: { nameCN: '普通', color: '#7a7a7a', bonusMultiplier: 1.0 },
  uncommon: { nameCN: '精良', color: '#2563eb', bonusMultiplier: 1.2 },
  rare: { nameCN: '稀有', color: '#7c3aed', bonusMultiplier: 1.5 },
  epic: { nameCN: '史诗', color: '#dc2626', bonusMultiplier: 2.0 },
  legendary: { nameCN: '传说', color: '#f59e0b', bonusMultiplier: 3.0 },
};

// --- Equipment Requirement ---
export interface EquipmentRequirement {
  type: 'level' | 'attribute' | 'technique' | 'profession';
  attribute?: keyof Attributes;
  techniqueId?: string;
  profession?: ProfessionType;
  value: number;
  descriptionCN: string;
}

// --- Equipment Special Effect ---
export interface EquipmentSpecialEffect {
  id: string;
  nameCN: string;
  descriptionCN: string;
  type: 'passive' | 'active' | 'combat_trigger';
  triggerCondition?: string;
  effects: {
    type: 'attribute_bonus' | 'combat_bonus' | 'damage_bonus' | 'defense_bonus' | 'heal_on_hit' | 'lifesteal' | 'critical_bonus';
    attribute?: keyof Attributes;
    combatStat?: keyof CombatStatsType;
    value: number;
    valueType?: 'flat' | 'percent';
  }[];
}

// --- Item Effects ---
export interface ItemEffects {
  attackBonus?: number;
  defenseBonus?: number;
  speedBonus?: number;
  maxHPBonus?: number;
  maxEnergyBonus?: number;
  critChanceBonus?: number;
  attributeBonus?: Partial<Attributes>;
}

// --- Inventory Item ---
export interface InventoryItem {
  id: string;
  name: string;
  nameCN: string;
  type: 'weapon' | 'armor' | 'accessory' | 'consumable' | 'material' | 'quest';
  quantity: number;
  description: string;
  descriptionCN: string;
  effects: ItemEffects;
  stackable: boolean;
  value?: number;
}

// --- Equipment Item (extends InventoryItem) ---
export interface EquipmentItem extends InventoryItem {
  rarity: EquipmentRarity;
  equipEffects: ItemEffects;
  requiredLevel: number;
  requirements: EquipmentRequirement[];
  specialEffects: EquipmentSpecialEffect[];
  craftable?: boolean;
  craftMaterials?: CraftMaterial[];
  uniqueId?: string;
}

// --- Craft Material ---
export interface CraftMaterial {
  itemId: string;
  quantity: number;
}

// --- Craft Recipe ---
export interface CraftRecipe {
  id: string;
  nameCN: string;
  baseItemId: string;
  cost: number;
  materials: CraftMaterial[];
  requiredLevel: number;
  requiredBlacksmithLevel: number;
  descriptionCN: string;
}

// --- Blacksmith Shop ---
export interface BlacksmithShop {
  id: string;
  nameCN: string;
  descriptionCN: string;
  shopItems: ShopListing[];
  craftRecipes: string[];
  canRepair: boolean;
  canEnchant: boolean;
}

// --- Craft Result ---
export interface CraftResult {
  success: boolean;
  item?: EquipmentItem;
  message: string;
  bonusEffects?: ItemEffects;
  specialEffects?: EquipmentSpecialEffect[];
}

// --- Enchant Option ---
export interface EnchantOption {
  id: string;
  nameCN: string;
  descriptionCN: string;
  cost: number;
  effectType: 'attack' | 'defense' | 'speed' | 'hp' | 'crit' | 'energy';
  minBonus: number;
  maxBonus: number;
}

// --- Equipment Slots ---
export interface EquipmentSlots {
  weapon: EquipmentItem | null;
  armor: EquipmentItem | null;
  accessory: EquipmentItem | null;
}

// --- Profession Types ---
export type ProfessionType = 'blacksmith' | 'herbalist' | 'merchant';

// --- Profession Benefit ---
export interface ProfessionBenefit {
  type: string;
  value: number;
  description: string;
}

// --- Profession ---
export interface Profession {
  id: ProfessionType;
  nameCN: string;
  descriptionCN: string;
  level: number;
  exp: number;
  expToNext: number;
  benefits: ProfessionBenefit[];
}

// --- Player Professions ---
export interface PlayerProfessions {
  blacksmith: Profession | null;
  herbalist: Profession | null;
  merchant: Profession | null;
}

// --- Monster Book Entry ---
export interface MonsterBookEntry {
  enemyId: string;
  encountered: boolean;
  defeated: number;
  levelSeen: number;
}

// --- Technique Level ---
export interface TechniqueLevel {
  techniqueId: string;
  level: number;
  exp: number;
  expToNext: number;
}

// --- Player State ---
export interface PlayerState {
  id: string;
  name: string;
  level: number;
  exp: number;
  expToNext: number;
  gold: number; // stored as copper
  attributes: Attributes;
  freeAttributePoints: number;
  combatStats: CombatStats;
  inventory: InventoryItem[];
  equipment: EquipmentSlots;
  professions: PlayerProfessions;
  knownTechniques: string[];
  techniqueLevels: TechniqueLevel[];
  visitedLocations: string[];
  exploredLocations: string[];
  completedEvents: string[];
  monsterBook: MonsterBookEntry[];
}

// --- Character Interaction ---
export type CharacterInteractionType = 'talk' | 'shop' | 'quest' | 'train' | 'heal' | 'rest' | 'craft';

export interface CharacterInteraction {
  type: CharacterInteractionType;
  label: string;
  description?: string;
  disabled?: boolean;
  disabledReason?: string;
}

// --- Character Data ---
export interface CharacterData {
  id: string;
  nameCN: string;
  descriptionCN: string;
  quests?: string[];
  shopInventory?: ShopListing[];
  interactions?: CharacterInteraction[];
}

// --- Location Types ---
export type LocationType = 'character' | 'event' | 'encounter' | 'shop' | 'rest';
export type LocationCategory = 'city' | 'village' | 'wilderness' | 'dungeon' | 'special';

// --- Shop Listing ---
export interface ShopListing {
  itemId: string;
  price: number; // copper
  quantity: number;
}

// --- Location Position for Map ---
export interface LocationPosition {
  x: number;
  y: number;
}

// --- Sub Location Type ---
export type SubLocationType = 'inn' | 'blacksmith' | 'martial_hall' | 'shop' | 'clinic' | 'tavern' | 'stable' | 'temple';

// --- Sub Location ---
export interface SubLocation {
  id: string;
  nameCN: string;
  type: SubLocationType;
  descriptionCN: string;
  icon: string;
  interactions?: CharacterInteraction[];
  shopInventory?: ShopListing[];
  restCost?: number;
  disabled?: boolean;
  disabledReason?: string;
}

// --- Location ---
export interface Location {
  id: string;
  nameCN: string;
  descriptionCN: string;
  type: LocationCategory;
  zone: number;
  connections: string[];
  locationType: LocationType;
  position: LocationPosition;
  character?: CharacterData;
  events?: string[];
  encounterPool?: string[];
  encounterChance?: number;
  shopInventory?: ShopListing[];
  restCost?: number;
  restHealPercent?: number;
  subLocations?: SubLocation[];
  requirements?: EventRequirements;
}

// --- Loot Entry ---
export interface LootEntry {
  itemId: string;
  dropChance: number; // 0-100 percentage
  quantityRange: [number, number]; // [min, max]
}

// --- Enemy ---
export interface Enemy {
  id: string;
  nameCN: string;
  descriptionCN: string;
  level: number;
  zone: number;
  attributes: {
    constitution: number;
    strength: number;
    physique: number;
    agility: number;
    insight: number;
    luck: number;
  };
  maxEnergy: number;
  expReward: number;
  goldReward: { min: number; max: number };
  lootTable: LootEntry[];
  techniques?: string[];
  isBoss?: boolean;
}

// --- Combat Log Entry ---
export interface CombatLogEntry {
  timestamp: number;
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'info';
  source: 'player' | 'enemy';
  value: number;
  text: string;
  color: string;
}

// --- Combat Rewards ---
export interface CombatRewards {
  exp: number;
  gold: number; // copper
  items: InventoryItem[];
}

// --- Player Combat Snapshot ---
export interface PlayerCombatSnapshot {
  currentHP: number;
  currentEnergy: number;
}

// --- Combat State ---
export interface CombatState {
  isActive: boolean;
  enemy: Enemy | null;
  enemyCurrentHP: number;
  playerSpeedBar: number; // 0-100
  enemySpeedBar: number; // 0-100
  combatLog: CombatLogEntry[];
  isPlayerTurn: boolean;
  combatRewards: CombatRewards | null;
  playerSnapshot?: PlayerCombatSnapshot | null;
}

export type MartialArtSourceType = 'event' | 'purchase' | 'insight' | 'initial';

export interface MartialArtPassiveEffect {
  type: 'attribute_bonus' | 'combat_bonus' | 'hp_regen' | 'energy_regen';
  attribute?: keyof Attributes;
  combatStat?: keyof Omit<CombatStats, 'currentHP' | 'currentEnergy'>;
  value: number;
  description: string;
}

export interface MartialArtSource {
  type: MartialArtSourceType;
  description: string;
  eventId?: string;
  price?: number;
  minInsight?: number;
}

export interface MartialArtEffect {
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'defense';
  value: number;
  scalingAttribute?: keyof Attributes;
  scalingPercent?: number;
  duration?: number;
  application: 'instant' | 'temporary';
}

export interface MartialArt {
  id: string;
  nameCN: string;
  type: 'internal' | 'external' | 'weapon' | 'special';
  level: number;
  insightRequired: number;
  prerequisiteSkills?: string[];
  learningChanceBase: number;
  lore: string;
  effects: MartialArtEffect[];
  passiveEffects: MartialArtPassiveEffect[];
  source: MartialArtSource;
  upgradedFrom?: string;
  upgradedTo?: string;
}

// --- Event Requirements ---
export interface EventRequirements {
  minLevel?: number;
  maxLevel?: number;
  requiredAttributes?: Partial<Attributes>;
  requiredItems?: string[];
  requiredProfessions?: ProfessionType[];
  notCompletedEvents?: string[];
}

// --- Event Effect ---
export interface EventEffect {
  type: 'gain_exp' | 'lose_exp' | 'gain_gold' | 'lose_gold' | 'gain_item' | 'lose_item' | 'gain_attribute' | 'lose_attribute' | 'teleport' | 'trigger_combat' | 'learn_skill' | 'gain_reputation' | 'complete_event' | 'start_event';
  value: number;
  itemId?: string;
  locationId?: string;
}

// --- Event Outcome ---
export interface EventOutcome {
  textCN: string;
  requirements?: {
    minLevel?: number;
    requiredAttributes?: Partial<Attributes>;
    requiredItems?: string[];
  };
  effects: EventEffect[];
  nextEventId?: string;
}

// --- Event Trigger Condition ---
export interface EventTriggerCondition {
  type: 'location' | 'combat' | 'time' | 'item' | 'choice';
  locationId?: string;
  enemyId?: string;
  result?: 'victory' | 'defeat';
  minVisits?: number;
  itemId?: string;
}

// --- Event Action ---
export interface EventAction {
  type: 'startCombat' | 'learnTechnique' | 'gainItem' | 'gainGold' | 'modifyAttribute' | 'gainExp' | 'loseGold' | 'triggerEvent' | 'openShop';
  enemyId?: string;
  techniqueId?: string;
  item?: InventoryItem;
  amount?: number;
  attribute?: keyof Attributes;
  value?: number;
  eventId?: string;
}

// --- Event Choice ---
export interface EventChoice {
  text: string;
  cost: { gold?: number };
  result: {
    success: boolean;
    message: string;
    effects: EventAction[];
    rewards?: { exp?: number; gold?: number; items?: InventoryItem[] };
  };
}

// --- Shop Item ---
export interface ShopItem {
  id: string;
  nameCN: string;
  price: number;
  type: InventoryItem['type'];
  effects: ItemEffects;
  descriptionCN: string;
  stackable: boolean;
  quantity: number;
}

// --- Game Event ---
export interface GameEvent {
  id: string;
  nameCN: string;
  descriptionCN: string;
  type: 'story' | 'encounter' | 'choice' | 'training' | 'shop';
  triggerCondition: EventTriggerCondition;
  prerequisiteEvents?: string[];
  isExclusive: boolean;
  exclusiveWith?: string[];
  actions?: EventAction[];
  rewards?: { exp?: number; gold?: number; items?: InventoryItem[] };
  choices?: EventChoice[];
  shopItems?: ShopItem[];
}

// --- UI State ---
export interface UIState {
  gamePhase: GamePhase;
  currentLocationId: string | null;
  notifications: string[];
  modals: {
    type: string | null;
    data?: unknown;
  };
}

// --- Meta State ---
export interface MetaState {
  version: string;
  lastSaved: number | null;
  settings: {
    soundEnabled?: boolean;
    textSpeed?: 'slow' | 'normal' | 'fast';
    autoSave?: boolean;
    combatSpeedMultiplier?: number;
  };
}

// --- Game Phase ---
export type GamePhase =
  | 'title'
  | 'character_creation'
  | 'exploration'
  | 'character_talk'
  | 'event'
  | 'shop'
  | 'combat'
  | 'rest'
  | 'victory'
  | 'game_over';

// --- Save Slot ---
export interface SaveSlot {
  id: string;
  name: string;
  savedAt: number;
  gameState: GameState;
}

// --- Game State ---
export interface GameState {
  player: PlayerState;
  location: Location | null;
  combat: CombatState;
  events: Map<string, GameEvent>;
  professions: PlayerProfessions;
  martialArts: Map<string, MartialArt>;
  ui: UIState;
  meta: MetaState;
}

// ============================================
// Game Action Types
// ============================================
export type GameAction =
  | { type: 'MOVE_TO_LOCATION'; payload: { locationId: string } }
  | { type: 'EXPLORE_LOCATION'; payload: { locationId: string } }
  | { type: 'START_COMBAT'; payload: { enemy: Enemy } }
  | { type: 'EXECUTE_COMBAT_ACTION'; payload: { action: string; damage?: number; isHeal?: boolean; healAmount?: number; isCrit?: boolean } }
  | { type: 'END_COMBAT'; payload: { victory: boolean; rewards?: CombatRewards } }
  | { type: 'USE_ITEM'; payload: { itemId: string } }
  | { type: 'EQUIP_ITEM'; payload: { itemId: string } }
  | { type: 'UNEQUIP_ITEM'; payload: { slot: keyof EquipmentSlots } }
  | { type: 'UNEQUIP_ALL_ITEMS' }
  | { type: 'DROP_ITEM'; payload: { itemId: string; quantity?: number } }
  | { type: 'LEARN_TECHNIQUE'; payload: { techniqueId: string } }
  | { type: 'UPDATE_ATTRIBUTE'; payload: { attribute: keyof Attributes; value: number } }
  | { type: 'ADD_EXP'; payload: { amount: number } }
  | { type: 'MODIFY_GOLD'; payload: { amount: number } }
  | { type: 'UPDATE_PROFESSION'; payload: { profession: ProfessionType } }
  | { type: 'GAIN_ITEM'; payload: { item: InventoryItem } }
  | { type: 'LOSE_ITEM'; payload: { itemId: string; quantity?: number } }
  | { type: 'COMPLETE_EVENT'; payload: { eventId: string } }
  | { type: 'ADD_NOTIFICATION'; payload: { message: string } }
  | { type: 'OPEN_MODAL'; payload: { modalType: string; data?: unknown } }
  | { type: 'CLOSE_MODAL' }
  | { type: 'CHANGE_GAME_PHASE'; payload: { phase: GamePhase } }
  | { type: 'REST_AT_LOCATION'; payload?: { healthRestore?: number } }
  | { type: 'LOAD_STATE'; payload: GameState }
  | { type: 'RESET_GAME' }
  | { type: 'SET_PLAYER_NAME'; payload: { name: string } }
  | { type: 'INIT_PLAYER_STATS'; payload: { name: string; attributes: Attributes } }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<MetaState['settings']> }
  | { type: 'CRAFT_ITEM'; payload: { recipeId: string } }
  | { type: 'PURCHASE_ITEM'; payload: { itemId: string; price: number } }
  | { type: 'ALLOCATE_ATTRIBUTE_POINT'; payload: { attribute: keyof Attributes } };
