<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-23 | Updated: 2026-04-23 -->

# hooks

## Purpose
Custom React hooks for state access and game initialization.

## Key Files
| File | Description |
|------|-------------|
| `useGame.ts` | Re-exports context hooks + convenience selectors |
| `useInitialState.ts` | `DEFAULT_LOCATIONS` and `getInitialGameState()` |
| `useSaveLoad.ts` | localStorage save/load functions |

## For AI Agents

### Working In This Directory
- `useGame()` returns `{ state, dispatch, saveGame, loadGame, player, location, combat, ui }`
- `DEFAULT_LOCATIONS` contains 6 map locations
- Save key: `wuxia_rpg_game_state`

### Usage
```typescript
import { useGame } from '../hooks/useGame';
const { player, location, dispatch } = useGame();
```
