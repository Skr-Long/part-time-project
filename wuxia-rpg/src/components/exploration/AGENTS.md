<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-04-23 | Updated: 2026-04-23 -->

# components/exploration

## Purpose
Map and location exploration UI components.

## Key Files
| File | Description |
|------|-------------|
| `LocationView.tsx` | Displays current location info, connected locations, and actions |

## For AI Agents

### Working In This Directory
- Location data comes from `DEFAULT_LOCATIONS` in `hooks/useInitialState.ts`
- `MOVE_TO_LOCATION` action changes the current location
- Location types: `rest` (heal), `encounter` (combat), `character` (NPC)
- Encounters use `location.encounterPool` and `location.encounterChance`
- `START_COMBAT` dispatched when encounter triggers

### Connected Locations
```typescript
const connectedLocations = DEFAULT_LOCATIONS.filter(l => location.connections.includes(l.id));
```

### Available Actions
- Move to connected location
- Rest at rest locations (costs gold)
- Explore at encounter locations (triggers combat chance)
