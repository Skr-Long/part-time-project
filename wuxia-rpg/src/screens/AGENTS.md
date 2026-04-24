<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-23 | Updated: 2026-04-23 -->

# screens

## Purpose
Full-screen components for each game phase.

## Key Files
| File | Description |
|------|-------------|
| `TitleScreen.tsx` | Main menu with new game / continue |
| `CharacterCreationScreen.tsx` | Attribute point allocation (30 points) |
| `ExplorationScreen.tsx` | Map/location view wrapper |
| `CombatScreen.tsx` | Turn-based combat with speed bars |

## For AI Agents

### Working In This Directory
- Each screen corresponds to a `gamePhase` in UI state
- ExplorationScreen renders `LocationView` component
- CombatScreen has speed bar system where both player and enemy bars fill independently
- When player speed bar reaches 100%, player can act (attack, defend, use skill, flee)

### Combat Flow
1. Both speed bars fill based on agility/speed
2. First to 100% takes action
3. Speed bar resets to 0 and refills
4. `EXECUTE_COMBAT_ACTION` applies damage and updates HP
5. Combat ends when HP reaches 0

### Character Creation
- 6 attributes: insight, constitution, strength, agility, physique, luck
- 30 total points to distribute
- Initial HP = 100 + (constitution-5)*10 + (physique-5)*5
