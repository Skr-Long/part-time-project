import { useState, useEffect } from 'react';
import { useGameSelector, useGameDispatch } from '../../contexts/GameContext';
import { saveGlobalSettings } from '../../hooks/useSaveLoad';

export default function SettingsModal() {
  const dispatch = useGameDispatch();
  const combatSpeedMultiplier = useGameSelector(state => state.meta.settings.combatSpeedMultiplier) ?? 0.5;
  
  const [localSpeed, setLocalSpeed] = useState(combatSpeedMultiplier);

  useEffect(() => {
    setLocalSpeed(combatSpeedMultiplier);
  }, [combatSpeedMultiplier]);

  const handleClose = () => {
    dispatch({ type: 'CLOSE_MODAL' });
  };

  const handleSave = () => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: { combatSpeedMultiplier: localSpeed } });
    saveGlobalSettings({ combatSpeedMultiplier: localSpeed });
    handleClose();
  };

  const handleDecrease = () => {
    setLocalSpeed(prev => Math.max(0.1, prev - 0.1));
  };

  const handleIncrease = () => {
    setLocalSpeed(prev => Math.min(2.0, prev + 0.1));
  };

  const getSpeedLabel = (value: number): string => {
    if (value <= 0.3) return '极慢';
    if (value <= 0.6) return '较慢';
    if (value <= 0.9) return '正常';
    if (value <= 1.2) return '较快';
    if (value <= 1.5) return '快速';
    return '极快';
  };

  const displayValue = Math.round(localSpeed * 100);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ backgroundColor: 'rgba(26, 26, 26, 0.7)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className="w-full max-w-md flex flex-col rounded-lg shadow-2xl border-2"
        style={{
          backgroundColor: '#e8e0d0',
          borderColor: 'rgba(122, 122, 122, 0.3)',
        }}
      >
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(122, 122, 122, 0.3)' }}>
          <h2 className="text-xl font-serif" style={{ color: '#1a1a1a' }}>游戏设置</h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center transition-colors"
            style={{ color: '#4a4a4a' }}
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="p-4 bg-white/60 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium" style={{ color: '#1a1a1a' }}>战斗进度条速度</span>
              <span 
                className="px-3 py-1 rounded text-sm font-bold"
                style={{ 
                  backgroundColor: 'rgba(30, 64, 175, 0.1)', 
                  color: '#1e40af' 
                }}
              >
                {getSpeedLabel(localSpeed)}
              </span>
            </div>

            <p className="text-sm mb-4" style={{ color: '#7a7a7a' }}>
              调整战斗中速度条的移动速度。数值越小，速度越慢，你有越多时间思考策略。
            </p>

            <div className="flex items-center justify-center gap-4 mb-4">
              <button
                onClick={handleDecrease}
                disabled={localSpeed <= 0.1}
                className="w-12 h-12 rounded-lg border-2 text-2xl font-bold transition-all"
                style={{
                  backgroundColor: localSpeed <= 0.1 ? 'rgba(122, 122, 122, 0.2)' : 'rgba(26, 26, 26, 0.05)',
                  borderColor: localSpeed <= 0.1 ? 'rgba(122, 122, 122, 0.3)' : '#4a4a4a',
                  color: localSpeed <= 0.1 ? '#9ca3af' : '#1a1a1a',
                  cursor: localSpeed <= 0.1 ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={(e) => {
                  if (localSpeed > 0.1) {
                    e.currentTarget.style.backgroundColor = 'rgba(30, 64, 175, 0.1)';
                    e.currentTarget.style.borderColor = '#1e40af';
                  }
                }}
                onMouseLeave={(e) => {
                  if (localSpeed > 0.1) {
                    e.currentTarget.style.backgroundColor = 'rgba(26, 26, 26, 0.05)';
                    e.currentTarget.style.borderColor = '#4a4a4a';
                  }
                }}
              >
                −
              </button>

              <div className="flex flex-col items-center">
                <span 
                  className="text-4xl font-serif font-bold"
                  style={{ color: '#1e40af' }}
                >
                  {displayValue}%
                </span>
                <span className="text-xs mt-1" style={{ color: '#7a7a7a' }}>
                  默认: 50%
                </span>
              </div>

              <button
                onClick={handleIncrease}
                disabled={localSpeed >= 2.0}
                className="w-12 h-12 rounded-lg border-2 text-2xl font-bold transition-all"
                style={{
                  backgroundColor: localSpeed >= 2.0 ? 'rgba(122, 122, 122, 0.2)' : 'rgba(26, 26, 26, 0.05)',
                  borderColor: localSpeed >= 2.0 ? 'rgba(122, 122, 122, 0.3)' : '#4a4a4a',
                  color: localSpeed >= 2.0 ? '#9ca3af' : '#1a1a1a',
                  cursor: localSpeed >= 2.0 ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={(e) => {
                  if (localSpeed < 2.0) {
                    e.currentTarget.style.backgroundColor = 'rgba(30, 64, 175, 0.1)';
                    e.currentTarget.style.borderColor = '#1e40af';
                  }
                }}
                onMouseLeave={(e) => {
                  if (localSpeed < 2.0) {
                    e.currentTarget.style.backgroundColor = 'rgba(26, 26, 26, 0.05)';
                    e.currentTarget.style.borderColor = '#4a4a4a';
                  }
                }}
              >
                +
              </button>
            </div>

            <div className="text-xs p-3 rounded" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#92400e' }}>
              💡 提示：当前速度为 {displayValue}%。
              {localSpeed <= 0.5 && ' 这将给你充足的时间思考战斗策略。'}
              {localSpeed > 0.5 && localSpeed <= 1.0 && ' 这是适中的游戏速度。'}
              {localSpeed > 1.0 && ' 这将加快战斗节奏，适合熟练玩家。'}
            </div>
          </div>

          <div className="p-4 bg-white/60 rounded-lg">
            <h3 className="font-medium mb-2" style={{ color: '#1a1a1a' }}>速度参考</h3>
            <div className="text-xs space-y-1" style={{ color: '#7a7a7a' }}>
              <p>• <span className="font-medium">10%-30%</span>: 极慢 - 非常充裕的思考时间</p>
              <p>• <span className="font-medium">40%-60%</span>: 较慢 - 推荐新手使用</p>
              <p>• <span className="font-medium">70%-90%</span>: 正常 - 平衡的游戏节奏</p>
              <p>• <span className="font-medium">100%-120%</span>: 较快 - 稍快的战斗节奏</p>
              <p>• <span className="font-medium">130%-200%</span>: 极快 - 快速战斗，适合熟练玩家</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-4 border-t" style={{ borderColor: 'rgba(122, 122, 122, 0.3)' }}>
          <button
            onClick={handleClose}
            className="px-6 py-2 rounded border-2 transition-colors font-serif"
            style={{
              borderColor: '#7a7a7a',
              color: '#7a7a7a',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(122, 122, 122, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 rounded border-2 transition-colors font-serif"
            style={{
              backgroundColor: '#1a1a1a',
              borderColor: '#1a1a1a',
              color: '#f5f0e6',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#c9a227';
              e.currentTarget.style.borderColor = '#c9a227';
              e.currentTarget.style.color = '#1a1a1a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#1a1a1a';
              e.currentTarget.style.borderColor = '#1a1a1a';
              e.currentTarget.style.color = '#f5f0e6';
            }}
          >
            保存设置
          </button>
        </div>
      </div>
    </div>
  );
}
