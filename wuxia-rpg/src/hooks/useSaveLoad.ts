import type { GameState } from '../types';
import { STORAGE_KEY } from './useInitialState';

export function saveGame(state: GameState): void {
  try {
    const toSave = { ...state, meta: { ...state.meta, lastSaved: Date.now() } };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch { /* ignore */ }
}

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState;
    if (!parsed.player || !parsed.ui) return null;
    return parsed;
  } catch { return null; }
}

export function deleteGame(): void {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}

export function hasSavedGame(): boolean {
  try { return localStorage.getItem(STORAGE_KEY) !== null; } catch { return false; }
}
