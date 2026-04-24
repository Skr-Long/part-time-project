<!-- Generated: 2026-04-23 | Updated: 2026-04-23 -->

# wuxia-rpg

## Purpose
A pure frontend Wuxia (martial arts) text RPG game with Chinese ink-wash painting aesthetic.

## Key Files
| File | Description |
|------|-------------|
| `package.json` | Project dependencies and scripts |
| `vite.config.ts` | Vite build configuration |
| `tsconfig.json` | TypeScript configuration |
| `tailwind.config.js` | Tailwind theme (v4 uses index.css @theme) |
| `index.html` | HTML entry point |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `src/` | Application source code (see `src/AGENTS.md`) |

## Game Features

### Core Systems
- **Map Exploration**: 6 locations (village, forest, mountain-path, deep-forest, cave, temple)
- **Character Creation**: 30 attribute points across 6 attributes
- **Turn-based Combat**: Speed bar system with martial arts skills
- **Equipment**: 3 slots (weapon, armor, accessory)
- **Martial Arts**: 12 techniques across 4 types (internal, external, weapon, special)
- **Professions**: blacksmith, herbalist, merchant
- **Events**: Location-based and combat-based events
- **Save System**: localStorage persistence

### Attributes
- **悟性 (Insight)**: Affects martial arts learning
- **体质 (Constitution)**: HP bonus
- **力量 (Strength)**: Attack power
- **敏捷 (Agility)**: Speed bar fill rate
- **体魄 (Physique)**: Defense
- **幸运 (Luck)**: Critical hit chance

## Tech Stack
- Vite + React 18 + TypeScript
- Tailwind CSS v4 (with CSS custom properties)
- localStorage for persistence
- No backend required

## For AI Agents

### Working In This Directory
- Run `npm run dev` to start development server
- Run `npm run build` to verify TypeScript and build
- Tailwind v4: Use `style={{}}` for dynamic colors, NOT arbitrary values
- Theme colors defined in `src/index.css` @theme block

### Color Palette
| Variable | Hex | Usage |
|----------|-----|-------|
| ink-black | #1a1a1a | Text, primary |
| ink-gray | #4a4a4a | Secondary text |
| rice | #f5f0e6 | Background |
| parchment | #e8e0d0 | Card backgrounds |
| gold | #c9a227 | Gold/currency |
| jade | #4a7c59 | Success/health |

### Game State Flow
1. `title` - Title screen
2. `character_creation` - Allocate attributes
3. `exploration` - Navigate map, encounter events
4. `combat` - Speed bar turn-based battle
5. `victory` - Combat rewards
6. (loop back to exploration)

## Commands
```bash
npm run dev    # Start dev server
npm run build  # TypeScript check + build
```
