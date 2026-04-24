import type { GameState } from '../types';

export const SAVE_SLOT_COUNT = 10;
export const SAVE_SLOT_PREFIX = 'wuxia_rpg_slot_';
export const CURRENT_SLOT_KEY = 'wuxia_rpg_current_slot';

export interface SaveSlotInfo {
  slotIndex: number;
  name: string;
  savedAt: number;
  level: number;
  locationName?: string;
  attributes?: {
    insight: number;
    constitution: number;
    strength: number;
    agility: number;
    physique: number;
    luck: number;
  };
}

function getSlotKey(slotIndex: number): string {
  return `${SAVE_SLOT_PREFIX}${slotIndex}`;
}

export function getCurrentSlotIndex(): number {
  try {
    const raw = localStorage.getItem(CURRENT_SLOT_KEY);
    if (raw) {
      const slot = parseInt(raw, 10);
      if (slot >= 0 && slot < SAVE_SLOT_COUNT) {
        return slot;
      }
    }
  } catch { /* ignore */ }
  return 0;
}

export function setCurrentSlotIndex(slotIndex: number): void {
  try {
    if (slotIndex >= 0 && slotIndex < SAVE_SLOT_COUNT) {
      localStorage.setItem(CURRENT_SLOT_KEY, String(slotIndex));
    }
  } catch { /* ignore */ }
}

export function saveGame(state: GameState, slotIndex?: number): void {
  const slot = slotIndex !== undefined ? slotIndex : getCurrentSlotIndex();
  try {
    const slotKey = getSlotKey(slot);
    const toSave = {
      ...state,
      meta: { ...state.meta, lastSaved: Date.now() },
    };
    localStorage.setItem(slotKey, JSON.stringify(toSave));
    setCurrentSlotIndex(slot);
  } catch { /* ignore */ }
}

export function loadGame(slotIndex?: number): GameState | null {
  const slot = slotIndex !== undefined ? slotIndex : getCurrentSlotIndex();
  try {
    const slotKey = getSlotKey(slot);
    const raw = localStorage.getItem(slotKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState;
    if (!parsed.player || !parsed.ui) return null;
    setCurrentSlotIndex(slot);
    return parsed;
  } catch { return null; }
}

export function deleteGame(slotIndex?: number): void {
  const slot = slotIndex !== undefined ? slotIndex : getCurrentSlotIndex();
  try {
    const slotKey = getSlotKey(slot);
    localStorage.removeItem(slotKey);
  } catch { /* ignore */ }
}

export function hasSavedGame(slotIndex?: number): boolean {
  const slot = slotIndex !== undefined ? slotIndex : getCurrentSlotIndex();
  try {
    const slotKey = getSlotKey(slot);
    return localStorage.getItem(slotKey) !== null;
  } catch { return false; }
}

export function hasAnySavedGame(): boolean {
  for (let i = 0; i < SAVE_SLOT_COUNT; i++) {
    if (hasSavedGame(i)) {
      return true;
    }
  }
  return false;
}

export function getSaveSlotInfo(slotIndex: number): SaveSlotInfo | null {
  try {
    const slotKey = getSlotKey(slotIndex);
    const raw = localStorage.getItem(slotKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState;
    
    return {
      slotIndex,
      name: parsed.player.name || '江湖新人',
      savedAt: parsed.meta.lastSaved || Date.now(),
      level: parsed.player.level || 1,
      locationName: parsed.location?.nameCN,
      attributes: parsed.player.attributes,
    };
  } catch { return null; }
}

export function getAllSaveSlots(): (SaveSlotInfo | null)[] {
  return Array.from({ length: SAVE_SLOT_COUNT }, (_, i) => getSaveSlotInfo(i));
}

export function formatSaveDate(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}
