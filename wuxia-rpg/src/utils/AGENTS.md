<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-23 | Updated: 2026-04-23 -->

# utils

## Purpose
Utility functions for currency conversion.

## Key Files
| File | Description |
|------|-------------|
| `currency.ts` | Currency conversion (copper/silver/gold) |

## For AI Agents

### Working In This Directory
- 1 gold = 1000 copper, 1 silver = 10 copper
- `convertCurrency(copper)` returns `{ gold, silver, copper, formatted }`
- `formatted` is display string like "1金 5银 3铜"
- Used by `CurrencyDisplay` component

### Usage
```typescript
import { convertCurrency } from '../utils/currency';
const { gold, silver, copper, formatted } = convertCurrency(1523);
// gold=1, silver=2, copper=3, formatted="1金 2银 3铜"
```
