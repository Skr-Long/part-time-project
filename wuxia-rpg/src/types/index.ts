// ============================================
// Wuxia Text RPG - Type Definitions
// ============================================

// --- Core Attributes ---
export interface Attributes {
  insight: number;       // 1-10, skill learning speed
  constitution: number;  // min 1, determines HP
  strength: number;     // min 1, determines attack
  agility: number;      // min 1, determines speed
  physique: number;     // min 1, determines defense
  luck: number;         // -5 to 10, encounter probability
}

// --- Item Effects ---
export interface ItemEffects {
  attackBonus?: number;
  defenseBonus?: number;
  speedBonus?: number;
  maxHPBonus?: number;
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
}

// --- Equipment Item (extends InventoryItem) ---
export interface EquipmentItem extends InventoryItem {
  equipEffects: ItemEffects;
  requiredLevel: number;
  requiredProfession?: ProfessionType;
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

// --- Player State ---
export interface PlayerState {
  id: string;
  name: string;
  level: number;
  exp: number;
  expToNext: number;
  gold: number; // stored as copper
  attributes: Attributes;
  currentHP: number;
  maxHP: number;
  inventory: InventoryItem[];
  equipment: EquipmentSlots;
  professions: PlayerProfessions;
  knownTechniques: string[];
  visitedLocations: string[];
  completedEvents: string[];
}

// --- Character Data ---
export interface CharacterData {
  id: string;
  nameCN: string;
  descriptionCN: string;
  quests?: string[];
  shopInventory?: ShopListing[];
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

// --- Location ---
export interface Location {
  id: string;
  nameCN: string;
  descriptionCN: string;
  type: LocationCategory;
  zone: number;
  connections: string[];
  locationType: LocationType;
  character?: CharacterData;
  events?: string[];
  encounterPool?: string[];
  encounterChance?: number;
  shopInventory?: ShopListing[];
  restCost?: number;
  restHealPercent?: number;
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
  baseHP: number;
  baseAttack: number;
  baseDefense: number;
  baseSpeed: number;
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
}

// --- Martial Arts Effect ---
export interface MartialArtEffect {
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'defense';
  value: number;
  scalingAttribute?: keyof Attributes;
  scalingPercent?: number;
  duration?: number;
  application: 'instant' | 'temporary';
}

// --- Martial Art ---
export interface MartialArt {
  id: string;
  nameCN: string;
  descriptionCN: string;
  type: 'internal' | 'external' | 'weapon' | 'special';
  level: number;
  insightRequired: number;
  prerequisiteSkills?: string[];
  learningChanceBase: number;
  effects: MartialArtEffect[];
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
  | { type: 'START_COMBAT'; payload: { enemy: Enemy } }
  | { type: 'EXECUTE_COMBAT_ACTION'; payload: { action: string; damage?: number } }
  | { type: 'END_COMBAT'; payload: { victory: boolean; rewards?: CombatRewards } }
  | { type: 'USE_ITEM'; payload: { itemId: string } }
  | { type: 'EQUIP_ITEM'; payload: { itemId: string } }
  | { type: 'UNEQUIP_ITEM'; payload: { slot: keyof EquipmentSlots } }
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
  | { type: 'INIT_PLAYER_STATS'; payload: { name: string; attributes: Attributes } };
