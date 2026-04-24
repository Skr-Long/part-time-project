<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-23 | Updated: 2026-04-23 -->

# types

## Purpose
TypeScript type definitions for the entire application.

## Key Files
| File | Description |
|------|-------------|
| `index.ts` | All type definitions |

## Key Types

### PlayerState
```typescript
interface PlayerState {
  id, name, level, exp, gold
  attributes: { insight, constitution, strength, agility, physique, luck }
  currentHP, maxHP
  inventory: InventoryItem[]
  equipment: { weapon, armor, accessory }
  knownTechniques: string[]
  visitedLocations: string[]
}
```

### CombatState
```typescript
interface CombatState {
  isActive: boolean
  enemy: Enemy | null
  enemyCurrentHP: number
  combatLog: CombatLogEntry[]
  combatRewards: { exp, gold, items } | null
}
```

### GamePhase
```typescript
type GamePhase = 'title' | 'character_creation' | 'exploration' | 'combat' | 'victory' | 'game_over'
```

### GameAction
Discriminated union for reducer - all game state mutations.

## For AI Agents

### Working In This Directory
- When adding new game features, add types here first
- Keep `GameAction` reducer cases in sync with type definitions
- Use `InventoryItem` for items in inventory, `EquipmentItem` extends it with `equipEffects`
