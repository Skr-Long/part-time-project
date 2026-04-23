import { useState } from 'react';
import { useGameDispatch } from '../contexts/GameContext';
import type { Attributes } from '../types';

interface AttributeConfig {
  key: keyof Attributes;
  label: string;
  min: number;
  max: number;
}

const ATTRIBUTE_CONFIGS: AttributeConfig[] = [
  { key: 'insight', label: '悟性', min: 1, max: 10 },
  { key: 'constitution', label: '体质', min: 1, max: 10 },
  { key: 'strength', label: '力量', min: 1, max: 10 },
  { key: 'agility', label: '敏捷', min: 1, max: 10 },
  { key: 'physique', label: '体魄', min: 1, max: 10 },
  { key: 'luck', label: '幸运', min: -5, max: 10 },
];

const TOTAL_POINTS = 30;

export default function CharacterCreationScreen() {
  const dispatch = useGameDispatch();
  const [name, setName] = useState('江湖新人');
  const [attributes, setAttributes] = useState<Attributes>({
    insight: 5,
    constitution: 5,
    strength: 5,
    agility: 5,
    physique: 5,
    luck: 0,
  });

  const usedPoints = Object.values(attributes).reduce((sum, val) => sum + val, 0);
  const remainingPoints = TOTAL_POINTS - usedPoints;

  // Calculate HP: 100 + (constitution - 5) * 10 + (physique - 5) * 5
  const calculatedHP = 100 + (attributes.constitution - 5) * 10 + (attributes.physique - 5) * 5;

  const handleAttributeChange = (key: keyof Attributes, delta: number) => {
    const config = ATTRIBUTE_CONFIGS.find(c => c.key === key);
    if (!config) return;

    const newValue = attributes[key] + delta;
    if (newValue < config.min || newValue > config.max) return;

    // Check if we have points to add (or we're removing points)
    if (delta > 0 && remainingPoints <= 0) return;

    setAttributes(prev => ({ ...prev, [key]: newValue }));
  };

  const isValid = remainingPoints === 0;

  const handleStart = () => {
    if (!isValid) return;

    dispatch({ type: 'INIT_PLAYER_STATS', payload: { name, attributes } });
    dispatch({ type: 'CHANGE_GAME_PHASE', payload: { phase: 'exploration' } });
  };

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
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="江湖新人"
            className="w-full px-4 py-3 text-lg border-2 transition-colors focus:outline-none"
            style={{
              backgroundColor: 'transparent',
              borderColor: 'var(--color-ink-gray)',
              color: 'var(--color-ink-black)',
            }}
          />
        </div>

        {/* Points remaining display */}
        <div
          className="mb-8 p-4 text-center border-2"
          style={{
            borderColor: remainingPoints === 0 ? 'var(--color-jade)' : 'var(--color-gold)',
            backgroundColor: remainingPoints === 0 ? 'rgba(0, 128, 0, 0.05)' : 'rgba(218, 165, 32, 0.05)',
          }}
        >
          <span className="text-lg" style={{ color: 'var(--color-ink-gray)' }}>剩余点数: </span>
          <span
            className="text-3xl font-serif"
            style={{ color: remainingPoints === 0 ? 'var(--color-jade)' : 'var(--color-gold)' }}
          >
            {remainingPoints}
          </span>
          <span style={{ color: 'var(--color-ink-gray)' }}> / {TOTAL_POINTS}</span>
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
            {ATTRIBUTE_CONFIGS.map(config => {
              const value = attributes[config.key];
              const canDecrease = value > config.min;
              const canIncrease = value < config.max && remainingPoints > 0;

              return (
                <div
                  key={config.key}
                  className="flex items-center justify-between p-4 border-2"
                  style={{ borderColor: 'var(--color-ink-gray)' }}
                >
                  {/* Attribute name */}
                  <span
                    className="text-lg w-20"
                    style={{ color: 'var(--color-ink-black)' }}
                  >
                    {config.label}
                  </span>

                  {/* Current value */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleAttributeChange(config.key, -1)}
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
                      onClick={() => handleAttributeChange(config.key, 1)}
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
                    [{config.min} ~ {config.max}]
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* HP Preview */}
        <div
          className="mb-10 p-6 text-center border-2"
          style={{
            borderColor: 'var(--color-jade)',
            backgroundColor: 'rgba(0, 128, 0, 0.05)',
          }}
        >
          <span style={{ color: 'var(--color-ink-gray)' }}>初始生命值: </span>
          <span
            className="text-2xl font-serif"
            style={{ color: 'var(--color-jade)' }}
          >
            {calculatedHP}
          </span>
          <p className="mt-2 text-sm" style={{ color: 'var(--color-ink-gray)' }}>
            HP = 100 + (体质 - 5) × 10 + (体魄 - 5) × 5
          </p>
        </div>

        {/* Validation message */}
        {remainingPoints !== 0 && (
          <p
            className="text-center mb-6"
            style={{ color: 'var(--color-gold)' }}
          >
            请分配完所有 {TOTAL_POINTS} 点属性
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
    </div>
  );
}