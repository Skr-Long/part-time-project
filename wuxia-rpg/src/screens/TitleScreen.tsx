import { useState, useEffect } from 'react';
import { useGameDispatch } from '../contexts/GameContext';
import {
  hasAnySavedGame,
  loadGame,
  getAllSaveSlots,
  formatSaveDate,
  type SaveSlotInfo,
} from '../hooks/useSaveLoad';

interface SaveSlotModalState {
  visible: boolean;
}

export default function TitleScreen() {
  const dispatch = useGameDispatch();
  const [canContinue, setCanContinue] = useState(false);
  const [saveSlots, setSaveSlots] = useState<(SaveSlotInfo | null)[]>([]);
  const [saveSlotModal, setSaveSlotModal] = useState<SaveSlotModalState>({
    visible: false,
  });

  useEffect(() => {
    setCanContinue(hasAnySavedGame());
    setSaveSlots(getAllSaveSlots());
  }, []);

  const refreshSaveSlots = () => {
    setSaveSlots(getAllSaveSlots());
    setCanContinue(hasAnySavedGame());
  };

  const handleNewGame = () => {
    dispatch({ type: 'RESET_GAME' });
    dispatch({ type: 'CHANGE_GAME_PHASE', payload: { phase: 'character_creation' } });
  };

  const handleOpenSaveSlotModal = () => {
    refreshSaveSlots();
    setSaveSlotModal({ visible: true });
  };

  const handleCloseSaveSlotModal = () => {
    setSaveSlotModal({ visible: false });
  };

  const handleLoadSaveSlot = (slotIndex: number) => {
    const savedState = loadGame(slotIndex);
    if (savedState) {
      dispatch({ type: 'LOAD_STATE', payload: savedState });
      dispatch({ type: 'CHANGE_GAME_PHASE', payload: { phase: 'exploration' } });
    }
    handleCloseSaveSlotModal();
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
            onClick={handleOpenSaveSlotModal}
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

      {/* Save Slot Selection Modal */}
      {saveSlotModal.visible && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          style={{ backgroundColor: 'rgba(26, 26, 26, 0.7)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseSaveSlotModal();
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
                <span className="text-2xl">📜</span>
                <h2 className="text-xl font-serif" style={{ color: '#1a1a1a' }}>选择游历记忆</h2>
              </div>
              <button
                onClick={handleCloseSaveSlotModal}
                className="w-8 h-8 flex items-center justify-center transition-colors"
                style={{ color: '#4a4a4a' }}
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {saveSlots.map((slotInfo, slotIndex) => {
                const isEmpty = !slotInfo;

                return (
                  <button
                    key={slotIndex}
                    onClick={() => !isEmpty && handleLoadSaveSlot(slotIndex)}
                    disabled={isEmpty}
                    className="w-full p-4 rounded-lg border transition-all duration-200 text-left disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: isEmpty ? 'rgba(200, 200, 200, 0.3)' : 'rgba(255, 255, 255, 0.8)',
                      borderColor: isEmpty ? 'rgba(122, 122, 122, 0.2)' : 'var(--color-jade)',
                      opacity: isEmpty ? 0.6 : 1,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 flex items-center justify-center rounded-lg border-2"
                          style={{
                            backgroundColor: isEmpty ? 'rgba(200, 200, 200, 0.3)' : 'rgba(0, 128, 0, 0.1)',
                            borderColor: isEmpty ? 'rgba(122, 122, 122, 0.2)' : 'var(--color-jade)',
                          }}
                        >
                          <span className="text-lg font-serif font-bold" style={{ color: isEmpty ? '#7a7a7a' : '#1a1a1a' }}>
                            {slotIndex + 1}
                          </span>
                        </div>
                        {isEmpty ? (
                          <div>
                            <span style={{ color: '#7a7a7a' }}>空记忆槽</span>
                            <p className="text-xs" style={{ color: '#999' }}>暂无存档</p>
                          </div>
                        ) : (
                          <div>
                            <div className="font-bold" style={{ color: '#1a1a1a' }}>
                              {slotInfo.name}
                            </div>
                            <div className="text-xs flex items-center gap-2" style={{ color: '#7a7a7a' }}>
                              <span>等级 {slotInfo.level}</span>
                              {slotInfo.locationName && (
                                <>
                                  <span>•</span>
                                  <span>{slotInfo.locationName}</span>
                                </>
                              )}
                              <span>•</span>
                              <span>{formatSaveDate(slotInfo.savedAt)}</span>
                            </div>
                            {slotInfo.attributes && (
                              <div className="text-xs mt-1 flex gap-2" style={{ color: '#999' }}>
                                <span>悟{slotInfo.attributes.insight}</span>
                                <span>体{slotInfo.attributes.constitution}</span>
                                <span>力{slotInfo.attributes.strength}</span>
                                <span>敏{slotInfo.attributes.agility}</span>
                                <span>骨{slotInfo.attributes.physique}</span>
                                <span>运{slotInfo.attributes.luck}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {!isEmpty && (
                        <span className="text-sm font-bold" style={{ color: 'var(--color-jade)' }}>
                          点击继续 →
                        </span>
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
