import React, { createContext, useContext, useReducer, useEffect, useMemo, ReactNode } from 'react';
import type { GameState, GameAction, EquipmentItem } from '../types';
import { getInitialGameState, DEFAULT_LOCATIONS } from '../hooks/useInitialState';
import { calculateCombatStats } from '../utils/combat';
import { getSkillExpBonusMultiplier } from '../utils/attributes';
import { saveGame } from '../hooks/useSaveLoad';
import { checkEquipmentRequirements, craftItem } from '../utils/equipment';
import { getEquipment, getItem, getCraftRecipe } from '../data/items';

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

    case 'EXPLORE_LOCATION': {
      const locationId = action.payload.locationId;
      if (state.player.exploredLocations.includes(locationId)) {
        return state;
      }
      return {
        ...state,
        player: {
          ...state.player,
          exploredLocations: [...state.player.exploredLocations, locationId],
        },
      };
    }

    case 'START_COMBAT': {
      const enemy = action.payload.enemy;
      const enemyStats = calculateCombatStats(enemy.attributes, enemy.level);
      
      let newMonsterBook = [...state.player.monsterBook];
      const existingEntry = newMonsterBook.find(m => m.enemyId === enemy.id);
      
      if (existingEntry) {
        if (enemy.level > existingEntry.levelSeen) {
          existingEntry.levelSeen = enemy.level;
        }
      } else {
        newMonsterBook.push({
          enemyId: enemy.id,
          encountered: true,
          defeated: 0,
          levelSeen: enemy.level,
        });
      }
      
      const playerSnapshot = {
        currentHP: state.player.combatStats.currentHP,
        currentEnergy: state.player.combatStats.currentEnergy,
      };
      
      return {
        ...state,
        ui: { ...state.ui, gamePhase: 'combat' },
        player: {
          ...state.player,
          monsterBook: newMonsterBook,
        },
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
          playerSnapshot,
        },
      };
    }

    case 'EXECUTE_COMBAT_ACTION': {
      if (!state.combat.isActive || !state.combat.enemy) return state;
      const { action: actionText, damage, isHeal, healAmount } = action.payload;
      const newLog = [...state.combat.combatLog];

      let newEnemyHP = state.combat.enemyCurrentHP;
      let newPlayerHP = state.player.combatStats.currentHP;

      if (isHeal && healAmount !== undefined) {
        newLog.push({
          timestamp: Date.now(),
          type: 'heal',
          source: 'player',
          value: healAmount,
          text: actionText,
          color: 'text-jade',
        });
        newPlayerHP = Math.min(state.player.combatStats.maxHP, state.player.combatStats.currentHP + healAmount);
      } else if (damage !== undefined) {
        newLog.push({
          timestamp: Date.now(),
          type: 'damage',
          source: damage < 0 ? 'enemy' : 'player',
          value: damage,
          text: actionText,
          color: damage < 0 ? 'text-red-600' : 'text-jade',
        });
        if (damage > 0) {
          newEnemyHP = Math.max(0, state.combat.enemyCurrentHP - damage);
        } else if (damage < 0) {
          newPlayerHP = Math.max(0, state.player.combatStats.currentHP + damage);
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
        let newMonsterBook = [...state.player.monsterBook];
        const enemy = state.combat.enemy;
        
        if (enemy) {
          const existingEntry = newMonsterBook.find(m => m.enemyId === enemy.id);
          if (existingEntry) {
            existingEntry.defeated = (existingEntry.defeated || 0) + 1;
          }
        }
        
        const baseTechniqueExp = rewards.exp;
        const skillExpMultiplier = getSkillExpBonusMultiplier(state.player.attributes);
        const totalTechniqueExp = Math.floor(baseTechniqueExp * skillExpMultiplier);
        
        let newTechniqueLevels = state.player.techniqueLevels.map(tl => {
          let newExp = tl.exp + totalTechniqueExp;
          let newLevel = tl.level;
          let newExpToNext = tl.expToNext;
          
          while (newExp >= newExpToNext) {
            newExp -= newExpToNext;
            newLevel++;
            newExpToNext = Math.floor(newExpToNext * 1.5);
          }
          
          return {
            ...tl,
            exp: newExp,
            level: newLevel,
            expToNext: newExpToNext,
          };
        });
        
        let newExp = state.player.exp + rewards.exp;
        let newLevel = state.player.level;
        let newExpToNext = state.player.expToNext;
        let levelsGained = 0;
        while (newExp >= newExpToNext) {
          newLevel++;
          newExpToNext = Math.floor(newExpToNext * 1.5);
          levelsGained++;
        }
        const newFreeAttributePoints = state.player.freeAttributePoints + levelsGained * 5;
        const newCombatStats = calculateCombatStats(state.player.attributes, newLevel, state.player.knownTechniques);
        
        newState.player = {
          ...state.player,
          exp: newExp,
          level: newLevel,
          expToNext: newExpToNext,
          freeAttributePoints: newFreeAttributePoints,
          gold: state.player.gold + rewards.gold,
          inventory: [...state.player.inventory, ...rewards.items],
          combatStats: newCombatStats,
          monsterBook: newMonsterBook,
          techniqueLevels: newTechniqueLevels,
        };
        newState.combat = {
          ...state.combat,
          isActive: false,
          isPlayerTurn: false,
          combatRewards: rewards,
        };
        newState.ui = { ...state.ui, gamePhase: 'victory' };
      } else {
        if (state.combat.playerSnapshot) {
          newState.player = {
            ...state.player,
            combatStats: {
              ...state.player.combatStats,
              currentHP: state.combat.playerSnapshot.currentHP,
              currentEnergy: state.combat.playerSnapshot.currentEnergy,
            },
          };
        }
        newState.combat = { ...state.combat, isActive: false, isPlayerTurn: false };
        newState.ui = { ...state.ui, gamePhase: 'game_over' };
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

      const { canEquip, failedRequirements } = checkEquipmentRequirements(
        item,
        state.player.level,
        state.player.attributes,
        state.player.knownTechniques
      );

      if (!canEquip) {
        return {
          ...state,
          ui: {
            ...state.ui,
            notifications: [
              ...state.ui.notifications,
              `无法装备 ${item.nameCN}：${failedRequirements.join('、')}`,
            ],
          },
        };
      }

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
        ui: {
          ...state.ui,
          notifications: [...state.ui.notifications, `装备了 ${item.nameCN}`],
        },
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
        ui: {
          ...state.ui,
          notifications: [...state.ui.notifications, `卸下了 ${item.nameCN}`],
        },
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
      const newKnownTechniques = [...state.player.knownTechniques, techId];
      const newCombatStats = calculateCombatStats(state.player.attributes, state.player.level, newKnownTechniques);
      const preservedCurrentHP = Math.min(state.player.combatStats.currentHP, newCombatStats.maxHP);
      const preservedCurrentEnergy = Math.min(state.player.combatStats.currentEnergy, newCombatStats.maxEnergy);
      return {
        ...state,
        player: { 
          ...state.player, 
          knownTechniques: newKnownTechniques, 
          combatStats: { 
            ...newCombatStats, 
            currentHP: preservedCurrentHP,
            currentEnergy: preservedCurrentEnergy
          } 
        },
      };
    }

    case 'UPDATE_ATTRIBUTE': {
      const { attribute, value } = action.payload;
      const newAttributes = { ...state.player.attributes, [attribute]: value };
      const newCombatStats = calculateCombatStats(newAttributes, state.player.level, state.player.knownTechniques);
      const preservedCurrentHP = Math.min(state.player.combatStats.currentHP, newCombatStats.maxHP);
      const preservedCurrentEnergy = Math.min(state.player.combatStats.currentEnergy, newCombatStats.maxEnergy);
      return {
        ...state,
        player: { 
          ...state.player, 
          attributes: newAttributes, 
          combatStats: { 
            ...newCombatStats, 
            currentHP: preservedCurrentHP,
            currentEnergy: preservedCurrentEnergy
          } 
        },
      };
    }

    case 'ADD_EXP': {
      const newExp = state.player.exp + action.payload.amount;
      let newLevel = state.player.level;
      let newExpToNext = state.player.expToNext;
      let levelsGained = 0;
      while (newExp >= newExpToNext) {
        newLevel++;
        newExpToNext = Math.floor(newExpToNext * 1.5);
        levelsGained++;
      }
      const newFreeAttributePoints = state.player.freeAttributePoints + levelsGained * 5;
      const newCombatStats = calculateCombatStats(state.player.attributes, newLevel, state.player.knownTechniques);
      const preservedCurrentHP = Math.min(state.player.combatStats.currentHP, newCombatStats.maxHP);
      const preservedCurrentEnergy = Math.min(state.player.combatStats.currentEnergy, newCombatStats.maxEnergy);
      
      let notifications = [...state.ui.notifications];
      if (levelsGained > 0) {
        notifications.push(`升级了！获得 ${levelsGained * 5} 点自由属性点`);
      }
      
      return {
        ...state,
        player: { 
          ...state.player, 
          exp: newExp, 
          level: newLevel, 
          expToNext: newExpToNext,
          freeAttributePoints: newFreeAttributePoints,
          combatStats: { 
            ...newCombatStats, 
            currentHP: preservedCurrentHP,
            currentEnergy: preservedCurrentEnergy
          } 
        },
        ui: {
          ...state.ui,
          notifications,
        },
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

    case 'UPDATE_SETTINGS': {
      return {
        ...state,
        meta: {
          ...state.meta,
          settings: {
            ...state.meta.settings,
            ...action.payload,
          },
        },
      };
    }

    case 'CRAFT_ITEM': {
      const { recipeId } = action.payload;
      const blacksmithLevel = state.player.professions.blacksmith?.level || 1;

      const result = craftItem(recipeId, state.player.level, blacksmithLevel);

      if (!result.success || !result.item) {
        return {
          ...state,
          ui: {
            ...state.ui,
            notifications: [...state.ui.notifications, result.message],
          },
        };
      }

      const recipe = getCraftRecipe(recipeId);
      if (!recipe) {
        return {
          ...state,
          ui: {
            ...state.ui,
            notifications: [...state.ui.notifications, '打造配方不存在'],
          },
        };
      }

      if (state.player.gold < recipe.cost) {
        return {
          ...state,
          ui: {
            ...state.ui,
            notifications: [...state.ui.notifications, '金币不足'],
          },
        };
      }

      let newInventory = [...state.player.inventory];
      for (const material of recipe.materials) {
        const itemIndex = newInventory.findIndex(i => i.id === material.itemId);
        if (itemIndex === -1) {
          return {
            ...state,
            ui: {
              ...state.ui,
              notifications: [...state.ui.notifications, `材料不足：${material.itemId}`],
            },
          };
        }
        const item = newInventory[itemIndex];
        if (item.quantity < material.quantity) {
          return {
            ...state,
            ui: {
              ...state.ui,
              notifications: [...state.ui.notifications, `材料不足：${material.itemId}`],
            },
          };
        }
        if (item.quantity > material.quantity) {
          newInventory[itemIndex] = { ...item, quantity: item.quantity - material.quantity };
        } else {
          newInventory.splice(itemIndex, 1);
        }
      }

      newInventory = [...newInventory, result.item];

      return {
        ...state,
        player: {
          ...state.player,
          gold: state.player.gold - recipe.cost,
          inventory: newInventory,
        },
        ui: {
          ...state.ui,
          notifications: [...state.ui.notifications, result.message],
        },
      };
    }

    case 'PURCHASE_ITEM': {
      const { itemId, price } = action.payload;

      if (state.player.gold < price) {
        return {
          ...state,
          ui: {
            ...state.ui,
            notifications: [...state.ui.notifications, '金币不足'],
          },
        };
      }

      const item = getEquipment(itemId) || getItem(itemId);
      if (!item) {
        return {
          ...state,
          ui: {
            ...state.ui,
            notifications: [...state.ui.notifications, '商品不存在'],
          },
        };
      }

      const newItem = { ...item, quantity: 1 };
      const existIndex = state.player.inventory.findIndex(i => i.id === newItem.id && i.stackable);

      let newInventory;
      if (existIndex !== -1 && newItem.stackable) {
        newInventory = [...state.player.inventory];
        newInventory[existIndex] = { ...newInventory[existIndex], quantity: newInventory[existIndex].quantity + newItem.quantity };
      } else {
        newInventory = [...state.player.inventory, newItem];
      }

      return {
        ...state,
        player: {
          ...state.player,
          gold: state.player.gold - price,
          inventory: newInventory,
        },
        ui: {
          ...state.ui,
          notifications: [...state.ui.notifications, `购买了 ${item.nameCN}`],
        },
      };
    }

    case 'ALLOCATE_ATTRIBUTE_POINT': {
      if (state.player.freeAttributePoints <= 0) {
        return {
          ...state,
          ui: {
            ...state.ui,
            notifications: [...state.ui.notifications, '没有可用的自由属性点'],
          },
        };
      }
      
      const attr = action.payload.attribute;
      const currentValue = state.player.attributes[attr];
      
      if (currentValue >= 10) {
        return {
          ...state,
          ui: {
            ...state.ui,
            notifications: [...state.ui.notifications, '该属性已达到上限'],
          },
        };
      }
      
      const newAttributes = {
        ...state.player.attributes,
        [attr]: currentValue + 1,
      };
      
      const newCombatStats = calculateCombatStats(newAttributes, state.player.level, state.player.knownTechniques);
      const preservedCurrentHP = Math.min(state.player.combatStats.currentHP, newCombatStats.maxHP);
      const preservedCurrentEnergy = Math.min(state.player.combatStats.currentEnergy, newCombatStats.maxEnergy);
      
      const attrLabels: Record<string, string> = {
        insight: '悟性',
        constitution: '体质',
        strength: '力量',
        agility: '敏捷',
        physique: '根骨',
        luck: '福缘',
      };
      
      return {
        ...state,
        player: {
          ...state.player,
          attributes: newAttributes,
          freeAttributePoints: state.player.freeAttributePoints - 1,
          combatStats: {
            ...newCombatStats,
            currentHP: preservedCurrentHP,
            currentEnergy: preservedCurrentEnergy,
          },
        },
        ui: {
          ...state.ui,
          notifications: [...state.ui.notifications, `${attrLabels[attr]} +1`],
        },
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
    if (state.ui.gamePhase !== 'title' && state.ui.gamePhase !== 'character_creation') {
      saveGame(state);
    }
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
