<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-23 | Updated: 2026-04-23 -->

# contexts

## Purpose
Global React Context for game state management.

## Key Files
| File | Description |
|------|-------------|
| `GameContext.tsx` | Central game state with reducer, provider, and hooks |

## For AI Agents

### Working In This Directory
- `GameProvider` wraps entire app and manages state with `useReducer`
- `useGameSelector(selector)` - read state slices
- `useGameDispatch()` - get dispatch function
- State persisted to localStorage on every change

### Key Game Actions
- `INIT_PLAYER_STATS` - initialize player after character creation
- `MOVE_TO_LOCATION` - change current location
- `START_COMBAT` / `END_COMBAT` - combat management
- `EXECUTE_COMBAT_ACTION` - log combat actions and apply damage
- `EQUIP_ITEM` / `UNEQUIP_ITEM` - equipment management
- `USE_ITEM` / `GAIN_ITEM` / `LOSE_ITEM` - inventory management
- `LEARN_TECHNIQUE` - add martial art to known techniques
- `OPEN_MODAL` / `CLOSE_MODAL` - UI modals
- `CHANGE_GAME_PHASE` - transition between game phases

### Game Phases
`title` → `character_creation` → `exploration` → `combat` → `victory` → `exploration`

### State Shape
```typescript
interface GameState {
  player: PlayerState;      // Player stats, inventory, equipment
  location: Location;       // Current map location
  combat: CombatState;      // Active combat data
  professions: ...;
  ui: UIState;             // gamePhase, modals, notifications
}
```
