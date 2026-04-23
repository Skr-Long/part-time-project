import React, { createContext, useContext, useReducer, useEffect, useMemo, ReactNode } from 'react';
import type { GameState, GameAction, EquipmentItem } from '../types';
import { getInitialGameState, DEFAULT_LOCATIONS } from '../hooks/useInitialState';
import { calculateCombatStats } from '../utils/combat';

const STORAGE_KEY = 'wuxia_rpg_game_state';

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextValue | null>(null);

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'MOVE_TO_LOCATION': {
      const locationId = action.payload.locationId;
      const newLocation = DEFAULT_LOCATIONS.find(l => l.id === locationId);
      if (!newLocation) return state;
      return {
        ...state,
        location: newLocation,
        ui: { ...state.ui, currentLocationId: locationId },
        player: {
          ...state.player,
          visitedLocations: state.player.visitedLocations.includes(locationId)
            ? state.player.visitedLocations
            : [...state.player.visitedLocations, locationId],
        },
      };
    }

    case 'START_COMBAT': {
      const enemy = action.payload.enemy;
      const enemyStats = calculateCombatStats(enemy.attributes, enemy.level);
      return {
        ...state,
        ui: { ...state.ui, gamePhase: 'combat' },
        combat: {
          isActive: true,
          enemy,
          enemyCurrentHP: enemyStats.maxHP,
          playerSpeedBar: 0,
          enemySpeedBar: 0,
          combatLog: [{
            timestamp: Date.now(),
            type: 'info',
            source: 'player',
            value: 0,
            text: `与 ${enemy.nameCN} 展开战斗！`,
            color: 'text-jade',
          }],
          isPlayerTurn: true,
          combatRewards: null,
        },
      };
    }

    case 'EXECUTE_COMBAT_ACTION': {
      if (!state.combat.isActive || !state.combat.enemy) return state;
      const { action: actionText, damage } = action.payload;
      const newLog = [...state.combat.combatLog];

      let newEnemyHP = state.combat.enemyCurrentHP;
      let newPlayerHP = state.player.combatStats.currentHP;

      if (damage !== undefined) {
        newLog.push({
          timestamp: Date.now(),
          type: 'damage',
          source: damage < 0 ? 'enemy' : 'player',
          value: damage,
          text: actionText,
          color: damage < 0 ? 'text-red-600' : 'text-red-600',
        });
        // damage > 0 means player dealt damage to enemy
        // damage < 0 means enemy dealt damage to player
        if (damage > 0) {
          newEnemyHP = Math.max(0, state.combat.enemyCurrentHP - damage);
        } else if (damage < 0) {
          newPlayerHP = Math.max(0, state.player.combatStats.currentHP + damage); // damage is negative
        }
      } else {
        newLog.push({
          timestamp: Date.now(),
          type: 'info',
          source: 'player',
          value: 0,
          text: actionText,
          color: 'text-ink-gray',
        });
      }

      return {
        ...state,
        player: { ...state.player, combatStats: { ...state.player.combatStats, currentHP: newPlayerHP } },
        combat: {
          ...state.combat,
          enemyCurrentHP: newEnemyHP,
          combatLog: newLog,
        },
      };
    }

    case 'END_COMBAT': {
      const { victory, rewards } = action.payload;
      let newState = { ...state };
      if (victory && rewards) {
        newState.player = {
          ...state.player,
          exp: state.player.exp + rewards.exp,
          gold: state.player.gold + rewards.gold,
          inventory: [...state.player.inventory, ...rewards.items],
        };
        newState.combat = {
          ...state.combat,
          isActive: false,
          isPlayerTurn: false,
          combatRewards: rewards,
        };
        newState.ui = { ...state.ui, gamePhase: 'victory' };
      } else {
        newState.combat = { ...state.combat, isActive: false, isPlayerTurn: false };
        newState.ui = { ...state.ui, gamePhase: 'exploration' };
      }
      return newState;
    }

    case 'USE_ITEM': {
      const itemIndex = state.player.inventory.findIndex(i => i.id === action.payload.itemId);
      if (itemIndex === -1) return state;
      const item = state.player.inventory[itemIndex];
      if (item.type !== 'consumable') return state;
      let newHP = state.player.combatStats.currentHP;
      let newMaxHP = state.player.combatStats.maxHP;
      if (item.effects.maxHPBonus) newMaxHP += item.effects.maxHPBonus;
      if (item.effects.attributeBonus?.constitution) newMaxHP += item.effects.attributeBonus.constitution * 10;
      if (item.effects.attackBonus) newHP += item.effects.attackBonus;
      newHP = Math.min(newMaxHP, newHP);
      const newInventory = [...state.player.inventory];
      if (item.stackable && item.quantity > 1) {
        newInventory[itemIndex] = { ...item, quantity: item.quantity - 1 };
      } else {
        newInventory.splice(itemIndex, 1);
      }
      return {
        ...state,
        player: { ...state.player, combatStats: { ...state.player.combatStats, currentHP: newHP, maxHP: newMaxHP }, inventory: newInventory },
      };
    }

    case 'EQUIP_ITEM': {
      const itemIndex = state.player.inventory.findIndex(i => i.id === action.payload.itemId);
      if (itemIndex === -1) return state;
      const item = state.player.inventory[itemIndex] as EquipmentItem;
      if (!['weapon', 'armor', 'accessory'].includes(item.type)) return state;
      const slot = item.type as 'weapon' | 'armor' | 'accessory';
      const currentEquipped = state.player.equipment[slot];
      const newInventory = state.player.inventory.filter(i => i.id !== action.payload.itemId);
      if (currentEquipped) {
        newInventory.push(currentEquipped);
      }
      const newEquipment = { ...state.player.equipment, [slot]: item };
      return {
        ...state,
        player: { ...state.player, inventory: newInventory, equipment: newEquipment },
      };
    }

    case 'UNEQUIP_ITEM': {
      const { slot } = action.payload;
      const item = state.player.equipment[slot];
      if (!item) return state;
      const newInventory = [...state.player.inventory, item];
      const newEquipment = { ...state.player.equipment, [slot]: null };
      return {
        ...state,
        player: { ...state.player, inventory: newInventory, equipment: newEquipment },
      };
    }

    case 'DROP_ITEM': {
      const itemIndex = state.player.inventory.findIndex(i => i.id === action.payload.itemId);
      if (itemIndex === -1) return state;
      const item = state.player.inventory[itemIndex];
      const quantity = action.payload.quantity || item.quantity;
      const newInventory = [...state.player.inventory];
      if (item.stackable && item.quantity > quantity) {
        newInventory[itemIndex] = { ...item, quantity: item.quantity - quantity };
      } else {
        newInventory.splice(itemIndex, 1);
      }
      return { ...state, player: { ...state.player, inventory: newInventory } };
    }

    case 'LEARN_TECHNIQUE': {
      const techId = action.payload.techniqueId;
      if (state.player.knownTechniques.includes(techId)) return state;
      return {
        ...state,
        player: { ...state.player, knownTechniques: [...state.player.knownTechniques, techId] },
      };
    }

    case 'UPDATE_ATTRIBUTE': {
      const { attribute, value } = action.payload;
      const newAttributes = { ...state.player.attributes, [attribute]: value };
      const newCombatStats = calculateCombatStats(newAttributes, state.player.level);
      return {
        ...state,
        player: { ...state.player, attributes: newAttributes, combatStats: newCombatStats },
      };
    }

    case 'ADD_EXP': {
      const newExp = state.player.exp + action.payload.amount;
      let newLevel = state.player.level;
      let newExpToNext = state.player.expToNext;
      while (newExp >= newExpToNext) {
        newLevel++;
        newExpToNext = Math.floor(newExpToNext * 1.5);
      }
      const newCombatStats = calculateCombatStats(state.player.attributes, newLevel);
      return {
        ...state,
        player: { ...state.player, exp: newExp, level: newLevel, expToNext: newExpToNext, combatStats: newCombatStats },
      };
    }

    case 'MODIFY_GOLD': {
      return {
        ...state,
        player: { ...state.player, gold: Math.max(0, state.player.gold + action.payload.amount) },
      };
    }

    case 'UPDATE_PROFESSION': {
      const profType = action.payload.profession;
      const current = state.player.professions[profType];
      return {
        ...state,
        player: {
          ...state.player,
          professions: {
            ...state.player.professions,
            [profType]: current || { id: profType, nameCN: '', description: '', level: 1, exp: 0, expToNext: 100, benefits: [] },
          },
        },
      };
    }

    case 'GAIN_ITEM': {
      const newItem = action.payload.item;
      const existIndex = state.player.inventory.findIndex(i => i.id === newItem.id && i.stackable);
      if (existIndex !== -1 && newItem.stackable) {
        const newInventory = [...state.player.inventory];
        newInventory[existIndex] = { ...newInventory[existIndex], quantity: newInventory[existIndex].quantity + newItem.quantity };
        return { ...state, player: { ...state.player, inventory: newInventory } };
      }
      return { ...state, player: { ...state.player, inventory: [...state.player.inventory, newItem] } };
    }

    case 'LOSE_ITEM': {
      const itemIndex = state.player.inventory.findIndex(i => i.id === action.payload.itemId);
      if (itemIndex === -1) return state;
      const item = state.player.inventory[itemIndex];
      const quantity = action.payload.quantity || item.quantity;
      const newInventory = [...state.player.inventory];
      if (item.stackable && item.quantity > quantity) {
        newInventory[itemIndex] = { ...item, quantity: item.quantity - quantity };
      } else {
        newInventory.splice(itemIndex, 1);
      }
      return { ...state, player: { ...state.player, inventory: newInventory } };
    }

    case 'COMPLETE_EVENT': {
      return {
        ...state,
        player: { ...state.player, completedEvents: [...state.player.completedEvents, action.payload.eventId] },
      };
    }

    case 'ADD_NOTIFICATION': {
      return {
        ...state,
        ui: { ...state.ui, notifications: [...state.ui.notifications, action.payload.message] },
      };
    }

    case 'OPEN_MODAL': {
      return {
        ...state,
        ui: { ...state.ui, modals: { type: action.payload.modalType, data: action.payload.data } },
      };
    }

    case 'CLOSE_MODAL': {
      return { ...state, ui: { ...state.ui, modals: { type: null, data: undefined } } };
    }

    case 'CHANGE_GAME_PHASE': {
      return { ...state, ui: { ...state.ui, gamePhase: action.payload.phase } };
    }

    case 'REST_AT_LOCATION': {
      const healPercent = 0.5;
      const newHP = Math.min(state.player.combatStats.maxHP, state.player.combatStats.currentHP + Math.floor(state.player.combatStats.maxHP * healPercent));
      return { ...state, player: { ...state.player, combatStats: { ...state.player.combatStats, currentHP: newHP } } };
    }

    case 'LOAD_STATE':
    case 'RESET_GAME':
      return action.type === 'RESET_GAME' ? getInitialGameState() : action.payload;

    case 'SET_PLAYER_NAME':
      return {
        ...state,
        player: { ...state.player, name: action.payload.name },
      };

    case 'INIT_PLAYER_STATS': {
      const { name, attributes } = action.payload;
      const combatStats = calculateCombatStats(attributes, 1);
      return {
        ...state,
        player: {
          ...state.player,
          name,
          attributes,
          combatStats,
        },
        ui: { ...state.ui, gamePhase: 'exploration' },
      };
    }

    default:
      return state;
  }
}

interface GameProviderProps { children: ReactNode; }

export function GameProvider({ children }: GameProviderProps) {
  const [state, dispatch] = useReducer(gameReducer, null, getInitialGameState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch { /* ignore */ }
  }, [state]);

  return (
    <GameContext.Provider value={useMemo(() => ({ state, dispatch }), [state])}>
      {children}
    </GameContext.Provider>
  );
}

export function useGameSelector<T>(selector: (state: GameState) => T): T {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGameSelector must be used within GameProvider');
  return selector(ctx.state);
}

export function useGameDispatch(): React.Dispatch<GameAction> {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGameDispatch must be used within GameProvider');
  return ctx.dispatch;
}

export default GameContext;
