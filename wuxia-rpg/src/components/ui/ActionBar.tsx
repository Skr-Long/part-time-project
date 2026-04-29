import { useGameDispatch } from '../../contexts/GameContext';

export default function ActionBar() {
  const dispatch = useGameDispatch();

  const buttons = [
    { icon: '🗺️', label: '总览', modal: 'overview' },
    { icon: '🎒', label: '背包', modal: 'inventory' },
    { icon: '⚔️', label: '装备', modal: 'equipment' },
    { icon: '📜', label: '武学', modal: 'martial' },
    { icon: '📊', label: '属性', modal: 'stats' },
    { icon: '⚙️', label: '设置', modal: 'settings' },
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
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors"
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
            <span className="text-2xl">{btn.icon}</span>
            <span className="text-xs">{btn.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
