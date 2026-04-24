<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-04-23 | Updated: 2026-04-23 -->

# components/martial

## Purpose
Martial arts (武学) skill system for learning and viewing techniques.

## Key Files
| File | Description |
|------|-------------|
| `MartialArtsModal.tsx` | Full martial arts panel with tabs and learning |

## For AI Agents

### Working In This Directory
- Martial arts data in `data/martialArts.ts`
- Learning chance = `baseChance + (playerInsight - requiredInsight) * 5`
- Types: `internal` (🧘), `external` (👊), `weapon` (⚔️), `special` (✨)
- Prerequisites must be met before learning
- `LEARN_TECHNIQUE` action adds to `player.knownTechniques`

### Available Skills Display
- Skills shown based on player's `knownTechniques` array
- Available skills filtered by insight requirement and prerequisites
- Skills have `speedCost` determining when they can be used in combat
