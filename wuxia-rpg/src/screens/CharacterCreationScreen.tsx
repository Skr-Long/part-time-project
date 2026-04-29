import { useState } from 'react';
import { useGameDispatch } from '../contexts/GameContext';
import type { Attributes } from '../types';
import {
  ATTRIBUTE_INFO,
  TOTAL_ATTRIBUTE_POINTS,
  getAttributeInfo,
  calculateBaseCombatStats,
  generateRandomAttributes,
  getCombatStatsDisplay,
} from '../utils/attributes';
import { generateRandomName } from '../utils/names';
import {
  getSaveSlotInfo,
  formatSaveDate,
  setCurrentSlotIndex,
} from '../hooks/useSaveLoad';

interface TooltipState {
  visible: boolean;
  attribute: keyof Attributes | null;
  x: number;
  y: number;
}

interface SaveSlotModalState {
  visible: boolean;
  name: string;
  attributes: Attributes;
}

export default function CharacterCreationScreen() {
  const dispatch = useGameDispatch();
  const [name, setName] = useState('江湖新人');
  const [attributes, setAttributes] = useState<Attributes>({
    insight: 5,
    constitution: 5,
    strength: 5,
    agility: 5,
    physique: 5,
    luck: 5,
  });
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    attribute: null,
    x: 0,
    y: 0,
  });
  const [saveSlotModal, setSaveSlotModal] = useState<SaveSlotModalState>({
    visible: false,
    name: '',
    attributes: {} as Attributes,
  });

  const usedPoints = Object.values(attributes).reduce((sum, val) => sum + val, 0);
  const remainingPoints = TOTAL_ATTRIBUTE_POINTS - usedPoints;

  const combatStats = calculateBaseCombatStats(attributes, 1);
  const statsDisplay = getCombatStatsDisplay(combatStats);

  const handleAttributeChange = (key: keyof Attributes, delta: number) => {
    const info = getAttributeInfo(key);
    if (!info) return;

    const newValue = attributes[key] + delta;
    if (newValue < info.min || newValue > info.max) return;

    if (delta > 0 && remainingPoints <= 0) return;

    setAttributes(prev => ({ ...prev, [key]: newValue }));
  };

  const handleRandomize = () => {
    setAttributes(generateRandomAttributes());
  };

  const handleRandomizeName = () => {
    setName(generateRandomName());
  };

  const showTooltip = (attribute: keyof Attributes, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltip({
      visible: true,
      attribute,
      x: rect.left,
      y: rect.bottom + 8,
    });
  };

  const hideTooltip = () => {
    setTooltip({
      visible: false,
      attribute: null,
      x: 0,
      y: 0,
    });
  };

  const isValid = remainingPoints === 0;

  const handleStart = () => {
    if (!isValid) return;
    setSaveSlotModal({
      visible: true,
      name,
      attributes: { ...attributes },
    });
  };

  const handleSelectSaveSlot = (slotIndex: number) => {
    setCurrentSlotIndex(slotIndex);
    dispatch({ type: 'INIT_PLAYER_STATS', payload: { name, attributes } });
    setSaveSlotModal({ visible: false, name: '', attributes: {} as Attributes });
  };

  const handleCloseSaveModal = () => {
    setSaveSlotModal({ visible: false, name: '', attributes: {} as Attributes });
  };

  const tooltipInfo = tooltip.attribute ? getAttributeInfo(tooltip.attribute) : null;

  return (
    <div
      className="min-h-screen py-12 px-8"
      style={{ backgroundColor: 'var(--color-rice)' }}
    >
      {/* Ink-wash texture overlay */}
      <div
        className="fixed inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Tooltip */}
      {tooltip.visible && tooltipInfo && (
        <div
          className="fixed z-50 p-4 rounded-lg shadow-xl border-2 max-w-xs"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            backgroundColor: 'var(--color-rice)',
            borderColor: 'var(--color-ink-gray)',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-serif font-bold" style={{ color: 'var(--color-ink-black)' }}>
              {tooltipInfo.labelCN}
            </span>
          </div>
          <p className="text-sm mb-3" style={{ color: 'var(--color-ink-gray)' }}>
            {tooltipInfo.description}
          </p>
          <div className="space-y-2">
            {tooltipInfo.effects.map((effect, idx) => (
              <div key={idx} className="text-sm">
                <span className="font-bold" style={{ color: 'var(--color-jade)' }}>
                  {effect.statCN}:
                </span>
                <span className="ml-1" style={{ color: 'var(--color-ink-gray)' }}>
                  {effect.description}
                </span>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-ink-gray)', opacity: 0.7 }}>
                  {effect.formula}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h1
            className="text-4xl font-serif mb-2"
            style={{ color: 'var(--color-ink-black)' }}
          >
            角色创建
          </h1>
          <div
            className="w-32 h-0.5 mx-auto"
            style={{ backgroundColor: 'var(--color-ink-gray)' }}
          />
        </div>

        {/* Name input section */}
        <div className="mb-10 p-6 border-2" style={{ borderColor: 'var(--color-ink-gray)' }}>
          <label
            className="block text-lg mb-3"
            style={{ color: 'var(--color-ink-black)' }}
          >
            姓名
          </label>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="江湖新人"
              className="flex-1 px-4 py-3 text-lg border-2 transition-colors focus:outline-none"
              style={{
                backgroundColor: 'transparent',
                borderColor: 'var(--color-ink-gray)',
                color: 'var(--color-ink-black)',
              }}
            />
            <button
              onClick={handleRandomizeName}
              className="px-4 py-3 text-sm font-serif border-2 transition-all duration-300 hover:scale-105 active:scale-95"
              style={{
                backgroundColor: 'var(--color-rice)',
                color: 'var(--color-ink-black)',
                borderColor: 'var(--color-ink-gray)',
              }}
            >
              🎲 随机
            </button>
          </div>
        </div>

        {/* Points remaining display with random button */}
        <div
          className="mb-8 p-4 border-2"
          style={{
            borderColor: remainingPoints === 0 ? 'var(--color-jade)' : 'var(--color-gold)',
            backgroundColor: remainingPoints === 0 ? 'rgba(0, 128, 0, 0.05)' : 'rgba(218, 165, 32, 0.05)',
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg" style={{ color: 'var(--color-ink-gray)' }}>剩余点数: </span>
              <span
                className="text-3xl font-serif"
                style={{ color: remainingPoints === 0 ? 'var(--color-jade)' : 'var(--color-gold)' }}
              >
                {remainingPoints}
              </span>
              <span style={{ color: 'var(--color-ink-gray)' }}> / {TOTAL_ATTRIBUTE_POINTS}</span>
            </div>
            <button
              onClick={handleRandomize}
              className="px-4 py-2 text-sm font-serif border-2 transition-all duration-300 hover:scale-105 active:scale-95"
              style={{
                backgroundColor: 'var(--color-rice)',
                color: 'var(--color-ink-black)',
                borderColor: 'var(--color-ink-gray)',
              }}
            >
              🎲 随机分配
            </button>
          </div>
        </div>

        {/* Attributes section */}
        <div className="mb-8">
          <h2
            className="text-xl font-serif mb-6 text-center"
            style={{ color: 'var(--color-ink-black)' }}
          >
            分配属性
          </h2>

          <div className="space-y-4">
            {ATTRIBUTE_INFO.map(info => {
              const value = attributes[info.key];
              const canDecrease = value > info.min;
              const canIncrease = value < info.max && remainingPoints > 0;

              return (
                <div
                  key={info.key}
                  className="flex items-center justify-between p-4 border-2"
                  style={{ borderColor: 'var(--color-ink-gray)' }}
                >
                  {/* Attribute name with help button */}
                  <div className="flex items-center gap-2">
                    <span
                      className="text-lg w-20"
                      style={{ color: 'var(--color-ink-black)' }}
                    >
                      {info.labelCN}
                    </span>
                    <button
                      onMouseEnter={(e) => showTooltip(info.key, e)}
                      onMouseLeave={hideTooltip}
                      className="w-6 h-6 flex items-center justify-center text-sm rounded-full border transition-colors"
                      style={{
                        borderColor: 'var(--color-ink-gray)',
                        color: 'var(--color-ink-gray)',
                        backgroundColor: 'transparent',
                      }}
                    >
                      ?
                    </button>
                  </div>

                  {/* Current value */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleAttributeChange(info.key, -1)}
                      disabled={!canDecrease}
                      className="w-10 h-10 text-xl font-bold border-2 disabled:opacity-30 transition-colors"
                      style={{
                        borderColor: 'var(--color-ink-gray)',
                        color: 'var(--color-ink-black)',
                        backgroundColor: 'transparent',
                      }}
                    >
                      −
                    </button>
                    <span
                      className="text-2xl font-serif w-12 text-center"
                      style={{ color: 'var(--color-ink-black)' }}
                    >
                      {value}
                    </span>
                    <button
                      onClick={() => handleAttributeChange(info.key, 1)}
                      disabled={!canIncrease}
                      className="w-10 h-10 text-xl font-bold border-2 disabled:opacity-30 transition-colors"
                      style={{
                        borderColor: 'var(--color-ink-gray)',
                        color: 'var(--color-ink-black)',
                        backgroundColor: 'transparent',
                      }}
                    >
                      +
                    </button>
                  </div>

                  {/* Range indicator */}
                  <span
                    className="text-sm w-20 text-right"
                    style={{ color: 'var(--color-ink-gray)' }}
                  >
                    [{info.min} ~ {info.max}]
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Combat Stats Preview */}
        <div
          className="mb-10 p-6 border-2"
          style={{
            borderColor: 'var(--color-jade)',
            backgroundColor: 'rgba(0, 128, 0, 0.05)',
          }}
        >
          <h3
            className="text-lg font-serif mb-4 text-center"
            style={{ color: 'var(--color-ink-black)' }}
          >
            基础属性预览 (等级 1)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {statsDisplay.map((stat) => (
              <div
                key={stat.key}
                className="p-3 text-center rounded-lg border"
                style={{
                  borderColor: 'rgba(122, 122, 122, 0.3)',
                  backgroundColor: 'rgba(255, 255, 255, 0.5)',
                }}
              >
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-sm" style={{ color: 'var(--color-ink-gray)' }}>{stat.label}</div>
                <div className="text-xl font-serif font-bold" style={{ color: 'var(--color-ink-black)' }}>
                  {stat.key === 'critChance' ? `${stat.value}%` : stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Validation message */}
        {remainingPoints !== 0 && (
          <p
            className="text-center mb-6"
            style={{ color: 'var(--color-gold)' }}
          >
            请分配完所有 {TOTAL_ATTRIBUTE_POINTS} 点属性
          </p>
        )}

        {/* Start button */}
        <div className="text-center">
          <button
            onClick={handleStart}
            disabled={!isValid}
            className="px-16 py-4 text-xl font-serif border-2 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed"
            style={{
              backgroundColor: isValid ? 'var(--color-ink-black)' : 'transparent',
              color: isValid ? 'var(--color-rice)' : 'var(--color-ink-black)',
              borderColor: 'var(--color-ink-black)',
            }}
          >
            开始江湖之旅
          </button>
        </div>
      </div>

      {/* Save Slot Selection Modal */}
      {saveSlotModal.visible && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          style={{ backgroundColor: 'rgba(26, 26, 26, 0.7)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseSaveModal();
          }}
        >
          <div
            className="w-full max-w-lg flex flex-col rounded-lg shadow-2xl border-2"
            style={{
              backgroundColor: '#e8e0d0',
              borderColor: 'rgba(122, 122, 122, 0.3)',
              maxHeight: '80vh',
            }}
          >
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(122, 122, 122, 0.3)' }}>
              <div className="flex items-center gap-2">
                <span className="text-2xl">💾</span>
                <h2 className="text-xl font-serif" style={{ color: '#1a1a1a' }}>选择记忆槽</h2>
              </div>
              <button
                onClick={handleCloseSaveModal}
                className="w-8 h-8 flex items-center justify-center transition-colors"
                style={{ color: '#4a4a4a' }}
              >
                ✕
              </button>
            </div>

            <div className="p-4 text-center border-b" style={{ borderColor: 'rgba(122, 122, 122, 0.3)' }}>
              <p className="text-sm" style={{ color: '#7a7a7a' }}>
                角色: <span className="font-bold" style={{ color: '#1a1a1a' }}>{saveSlotModal.name}</span>
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {Array.from({ length: 10 }, (_, i) => i).map((slotIndex) => {
                const slotInfo = getSaveSlotInfo(slotIndex);
                const isEmpty = !slotInfo;

                return (
                  <button
                    key={slotIndex}
                    onClick={() => handleSelectSaveSlot(slotIndex)}
                    className="w-full p-4 rounded-lg border transition-all duration-200 hover:scale-102 text-left"
                    style={{
                      backgroundColor: isEmpty ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.8)',
                      borderColor: isEmpty ? 'rgba(122, 122, 122, 0.3)' : 'var(--color-jade)',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span
                          className="text-lg font-serif font-bold w-8 text-center"
                          style={{ color: isEmpty ? '#7a7a7a' : '#1a1a1a' }}
                        >
                          {slotIndex + 1}
                        </span>
                        {isEmpty ? (
                          <span style={{ color: '#7a7a7a' }}>空记忆槽</span>
                        ) : (
                          <div>
                            <div className="font-bold" style={{ color: '#1a1a1a' }}>{slotInfo.name}</div>
                            <div className="text-xs" style={{ color: '#7a7a7a' }}>
                              {formatSaveDate(slotInfo.savedAt)}
                            </div>
                          </div>
                        )}
                      </div>
                      {isEmpty ? (
                        <span className="text-sm" style={{ color: 'var(--color-jade)' }}>点击创建</span>
                      ) : (
                        <span className="text-sm" style={{ color: 'var(--color-gold)' }}>将覆盖</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
