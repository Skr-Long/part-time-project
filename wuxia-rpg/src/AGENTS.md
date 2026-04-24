<!-- Parent: AGENTS.md -->
<!-- Generated: 2026-04-23 | Updated: 2026-04-23 -->

# src

## Purpose
Main source directory for the Wuxia RPG game. Contains all React components, game logic, data definitions, and typeScript types.

## Key Files
| File | Description |
|------|-------------|
| `App.tsx` | Root application component with routing based on gamePhase |
| `main.tsx` | Application entry point |
| `index.css` | Global styles with Tailwind v4 theme variables |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `components/` | React UI components (see `components/AGENTS.md`) |
| `contexts/` | React Context for global game state (see `contexts/AGENTS.md`) |
| `data/` | Static game data (enemies, items, events, etc.) (see `data/AGENTS.md`) |
| `hooks/` | Custom React hooks for state access (see `hooks/AGENTS.md`) |
| `screens/` | Full-screen components for each game phase (see `screens/AGENTS.md`) |
| `types/` | TypeScript type definitions (see `types/AGENTS.md`) |
| `utils/` | Utility functions (see `utils/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Uses Vite + React + TypeScript + Tailwind CSS v4
- Tailwind v4 uses CSS variables via `@theme` directive, NOT arbitrary values like `bg-[var(--color-ink)]`
- Prefer inline `style={{}}` for dynamic colors over Tailwind arbitrary values
- Game state managed via React Context (`GameContext.tsx`)

### Theme Colors (defined in index.css)
```css
--color-ink-black: #1a1a1a;
--color-ink-gray: #4a4a4a;
--color-rice: #f5f0e6;
--color-parchment: #e8e0d0;
--color-gold: #c9a227;
--color-jade: #4a7c59;
```

### Testing Requirements
- Run `npm run dev` for hot-reload development
- Run `npm run build` to verify TypeScript compilation

## Dependencies
### External
- React 18.x - UI framework
- TypeScript 5.x - Type safety
- Tailwind CSS v4 - Styling
- Vite - Build tool
