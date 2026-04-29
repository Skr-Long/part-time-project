import { useGameDispatch, useGameSelector } from '../../contexts/GameContext';

export default function ActionBar() {
  const dispatch = useGameDispatch();
  const freeAttributePoints = useGameSelector(state => state.player.freeAttributePoints);
  const hasUnusedPoints = freeAttributePoints > 0;

  const buttons = [
    { icon: '🧑', label: '角色', modal: 'character', hasBadge: hasUnusedPoints },
    { icon: '🗺️', label: '总览', modal: 'overview', hasBadge: false },
    { icon: '🎒', label: '背包', modal: 'inventory', hasBadge: false },
    { icon: '📜', label: '武学', modal: 'martial', hasBadge: false },
    { icon: '⚙️', label: '设置', modal: 'settings', hasBadge: false },
  ];

  const handleClick = (modal: string) => {
    console.log('ActionBar clicked:', modal);
    dispatch({ type: 'OPEN_MODAL', payload: { modalType: modal } });
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 border-t-2"
      style={{
        backgroundColor: 'rgba(26, 26, 26, 0.95)',
        borderColor: 'rgba(122, 122, 122, 0.3)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div className="flex justify-around items-center py-3 px-4">
        {buttons.map(btn => (
          <button
            key={btn.modal}
            onClick={() => handleClick(btn.modal)}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors relative"
            style={{ color: 'rgba(245, 240, 230, 0.8)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'rgba(245, 240, 230, 1)';
              e.currentTarget.style.backgroundColor = 'rgba(122, 122, 122, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(245, 240, 230, 0.8)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div className="relative">
              <span className="text-2xl">{btn.icon}</span>
              {btn.hasBadge && (
                <span 
                  className="absolute -top-1 -right-2 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ 
                    backgroundColor: '#dc2626', 
                    color: '#fff',
                    boxShadow: '0 0 0 2px rgba(26, 26, 26, 0.95)',
                  }}
                >
                  {freeAttributePoints > 9 ? '9+' : freeAttributePoints}
                </span>
              )}
            </div>
            <span className="text-xs">{btn.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
