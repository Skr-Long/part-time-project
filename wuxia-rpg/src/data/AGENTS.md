<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-23 | Updated: 2026-04-23 -->

# data

## Purpose
Static game data: enemies, items, martial arts, events, professions.

## Key Files
| File | Description |
|------|-------------|
| `enemies.ts` | Enemy definitions with stats and scaling |
| `items.ts` | Item definitions (weapons, armor, consumables, materials) |
| `martialArts.ts` | Martial art techniques with effects |
| `events.ts` | Game events and encounters |
| `professions.ts` | Profession data and craft recipes |

## For AI Agents

### Working In This Directory
- All data is static - no runtime modification
- Items reference `effects` object for bonuses
- Enemy scaling via `getScaledEnemy(enemyId, playerLevel, zone)`

### Data Patterns
```typescript
// Item effects
{ attackBonus?, defenseBonus?, maxHPBonus?, speedBonus? }

// Enemy rewards
{ goldReward: { min, max }, expReward }

// Martial art effects
{ type: 'damage'|'heal'|'buff'|'debuff', value, scalingAttribute?, scalingPercent? }
```
