import { useState, useEffect } from 'react';
import { useGameDispatch } from '../contexts/GameContext';
import { hasSavedGame, loadGame } from '../hooks/useSaveLoad';

export default function TitleScreen() {
  const dispatch = useGameDispatch();
  const [canContinue, setCanContinue] = useState(false);

  useEffect(() => {
    setCanContinue(hasSavedGame());
  }, []);

  const handleNewGame = () => {
    dispatch({ type: 'RESET_GAME' });
    dispatch({ type: 'CHANGE_GAME_PHASE', payload: { phase: 'character_creation' } });
  };

  const handleContinue = () => {
    const savedState = loadGame();
    if (savedState) {
      dispatch({ type: 'LOAD_STATE', payload: savedState });
      dispatch({ type: 'CHANGE_GAME_PHASE', payload: { phase: 'exploration' } });
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: 'var(--color-rice)' }}
    >
      {/* Ink-wash paper texture overlay */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Ink brush stroke decorations */}
      <div
        className="absolute top-20 left-0 w-64 h-8 opacity-30"
        style={{ backgroundColor: 'var(--color-ink-black)', clipPath: 'polygon(0 50%, 100% 30%, 95% 70%, 5% 80%)' }}
      />
      <div
        className="absolute bottom-40 right-0 w-48 h-6 opacity-25"
        style={{ backgroundColor: 'var(--color-ink-black)', clipPath: 'polygon(0 40%, 100% 50%, 98% 75%, 8% 85%)' }}
      />

      {/* Main content */}
      <div className="relative z-10 text-center px-8 py-16">
        {/* Chinese seal decoration */}
        <div
          className="w-20 h-20 mx-auto mb-8 flex items-center justify-center rounded-sm border-4"
          style={{
            borderColor: 'var(--color-gold)',
            backgroundColor: 'var(--color-rice)',
          }}
        >
          <span className="text-2xl" style={{ color: 'var(--color-gold)' }}>江</span>
        </div>

        {/* Main title */}
        <h1
          className="text-7xl font-serif mb-4 tracking-wider"
          style={{ color: 'var(--color-ink-black)' }}
        >
          江湖游历
        </h1>

        {/* Subtitle */}
        <p
          className="text-xl mb-12 tracking-widest"
          style={{ color: 'var(--color-ink-gray)' }}
        >
          WUXIA RPG
        </p>

        {/* Ink line separator */}
        <div
          className="w-48 h-1 mx-auto mb-12 opacity-60"
          style={{ backgroundColor: 'var(--color-ink-black)' }}
        />

        {/* Buttons */}
        <div className="flex flex-col gap-4 items-center">
          <button
            onClick={handleNewGame}
            className="px-12 py-4 text-lg font-serif transition-all duration-300 border-2 hover:scale-105 active:scale-95"
            style={{
              backgroundColor: 'var(--color-ink-black)',
              color: 'var(--color-rice)',
              borderColor: 'var(--color-ink-black)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-gold)';
              e.currentTarget.style.color = 'var(--color-ink-black)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-ink-black)';
              e.currentTarget.style.color = 'var(--color-rice)';
            }}
          >
            开始新游戏
          </button>

          <button
            onClick={handleContinue}
            disabled={!canContinue}
            className="px-12 py-4 text-lg font-serif transition-all duration-300 border-2 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed"
            style={{
              backgroundColor: canContinue ? 'var(--color-rice)' : 'transparent',
              color: 'var(--color-ink-black)',
              borderColor: 'var(--color-ink-gray)',
            }}
            onMouseEnter={(e) => {
              if (canContinue) {
                e.currentTarget.style.backgroundColor = 'var(--color-gold)';
                e.currentTarget.style.color = 'var(--color-ink-black)';
              }
            }}
            onMouseLeave={(e) => {
              if (canContinue) {
                e.currentTarget.style.backgroundColor = 'var(--color-rice)';
                e.currentTarget.style.color = 'var(--color-ink-black)';
              }
            }}
          >
            继续游戏
          </button>
        </div>

        {/* Version */}
        <p
          className="mt-16 text-sm"
          style={{ color: 'var(--color-ink-gray)' }}
        >
          v1.0.0
        </p>
      </div>

      {/* Bottom decorative strokes */}
      <div className="absolute bottom-10 left-1/4 w-32 h-1 opacity-20" style={{ backgroundColor: 'var(--color-ink-black)' }} />
      <div className="absolute bottom-10 right-1/4 w-24 h-1 opacity-15" style={{ backgroundColor: 'var(--color-ink-black)' }} />
    </div>
  );
}