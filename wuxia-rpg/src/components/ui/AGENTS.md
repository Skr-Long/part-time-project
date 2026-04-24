<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-04-23 | Updated: 2026-04-23 -->

# components/ui

## Purpose
Common UI primitives used across the application.

## Key Files
| File | Description |
|------|-------------|
| `ActionBar.tsx` | Fixed bottom navigation bar with modal triggers |
| `HPBar.tsx` | Health/mana bar with percentage coloring |
| `CurrencyDisplay.tsx` | Gold/silver/copper display with color coding |

## For AI Agents

### Working In This Directory
- ActionBar buttons dispatch `OPEN_MODAL` with `modalType`
- Modal types: `inventory`, `equipment`, `martial`, `map`, `stats`, `settings`
- HPBar colors: >50% jade (#4a7c59), >25% yellow (#eab308), ≤25% red (#dc2626)
- Currency colors: >=1000 gold (#c9a227), >=10 silver (#6b7280), <10 copper (#b45309)

### Button Hover Effects
Use `onMouseEnter`/`onMouseLeave` with inline style changes for hover states.
