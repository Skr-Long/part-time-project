<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-23 | Updated: 2026-04-23 -->

# components

## Purpose
Reusable React UI components organized by feature area.

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `equipment/` | Equipment display and management (see `equipment/AGENTS.md`) |
| `exploration/` | Map/location viewing components (see `exploration/AGENTS.md`) |
| `inventory/` | Inventory display and item management (see `inventory/AGENTS.md`) |
| `martial/` | Martial arts/skill system (see `martial/AGENTS.md`) |
| `ui/` | Common UI primitives (ActionBar, HPBar, etc.) (see `ui/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Components use inline `style={{}}` for dynamic colors (Tailwind v4 limitation)
- Modal components are fixed-position overlays with backdrop
- Use `useGameDispatch` and `useGameSelector` hooks from context for state

### Common Props Patterns
- Modal components: `handleClose` dispatches `CLOSE_MODAL`
- Item components: `onClick` dispatches actions like `EQUIP_ITEM`, `USE_ITEM`
