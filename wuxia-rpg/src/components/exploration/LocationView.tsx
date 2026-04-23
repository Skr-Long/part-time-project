import { useGameSelector, useGameDispatch } from '../../hooks/useGame';
import { HPBar } from '../ui/HPBar';
import { CurrencyDisplay } from '../ui/CurrencyDisplay';
import { DEFAULT_LOCATIONS } from '../../hooks/useInitialState';
import { getScaledEnemy } from '../../data/enemies';

export function LocationView() {
  const dispatch = useGameDispatch();
  const location = useGameSelector(s => s.location);
  const player = useGameSelector(s => s.player);

  if (!location) return <div className="text-center p-8">Loading...</div>;

  const connectedLocations = DEFAULT_LOCATIONS.filter(l => location.connections.includes(l.id));

  const handleMove = (locId: string) => {
    dispatch({ type: 'MOVE_TO_LOCATION', payload: { locationId: locId } });
  };

  const handleRest = () => {
    if (player.gold >= (location.restCost || 50)) {
      dispatch({ type: 'MODIFY_GOLD', payload: { amount: -(location.restCost || 50) } });
      dispatch({ type: 'REST_AT_LOCATION' });
    }
  };

  const handleExplore = () => {
    if (!location.encounterPool || location.encounterPool.length === 0) return;
    const chance = (location.encounterChance || 30) * (1 + (player.attributes.luck + 5) / 50);
    if (Math.random() * 100 > chance) return;
    const enemyId = location.encounterPool[Math.floor(Math.random() * location.encounterPool.length)];
    const enemy = getScaledEnemy(enemyId, player.level);
    dispatch({ type: 'START_COMBAT', payload: { enemy } });
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div style={{ marginBottom: '1.5rem', padding: '1rem', borderWidth: '2px', borderColor: '#4a4a4a', backgroundColor: 'rgba(255,255,255,0.5)' }}>
        <h2 className="text-3xl font-serif mb-2" style={{ color: '#1a1a1a' }}>{location.nameCN}</h2>
        <p style={{ color: '#4a4a4a' }}>{location.descriptionCN}</p>
      </div>

      <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.3)', borderWidth: '1px', borderStyle: 'solid', borderColor: '#4a4a4a' }}>
        <HPBar current={player.combatStats.currentHP} max={player.combatStats.maxHP} />
        <div className="mt-2 flex justify-between text-sm">
          <span>等级 {player.level}</span>
          <CurrencyDisplay copper={player.gold} />
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-bold mb-3" style={{ color: '#1a1a1a' }}>可前往的地方</h3>
        <div className="flex flex-wrap gap-2">
          {connectedLocations.map(loc => (
            <button
              key={loc.id}
              onClick={() => handleMove(loc.id)}
              className="px-4 py-2 transition-colors"
              style={{
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: '#4a4a4a',
                backgroundColor: 'rgba(255,255,255,0.5)',
                color: '#1a1a1a',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1a1a1a';
                e.currentTarget.style.color = '#f5f0e6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.5)';
                e.currentTarget.style.color = '#1a1a1a';
              }}
            >
              {loc.nameCN}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {location.locationType === 'rest' && (
          <button
            onClick={handleRest}
            disabled={player.gold < (location.restCost || 50)}
            className="px-6 py-3 transition-colors"
            style={{
              backgroundColor: player.gold < (location.restCost || 50) ? '#9ca3af' : '#4a7c59',
              color: '#fff',
              opacity: player.gold < (location.restCost || 50) ? 0.5 : 1,
            }}
          >
            休息 (消耗{location.restCost || 50}铜钱)
          </button>
        )}
        {location.locationType === 'encounter' && (
          <button
            onClick={handleExplore}
            className="px-6 py-3 transition-colors"
            style={{
              backgroundColor: '#1a1a1a',
              color: '#f5f0e6',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#c9a227';
              e.currentTarget.style.color = '#1a1a1a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#1a1a1a';
              e.currentTarget.style.color = '#f5f0e6';
            }}
          >
            探索 (可能遭遇敌人)
          </button>
        )}
        {location.locationType === 'character' && location.character && (
          <div style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.5)', borderWidth: '1px', borderStyle: 'solid', borderColor: '#c9a227' }}>
            <p className="font-bold" style={{ color: '#1a1a1a' }}>{location.character.nameCN}</p>
            <p className="text-sm" style={{ color: '#4a4a4a' }}>{location.character.descriptionCN}</p>
          </div>
        )}
      </div>
    </div>
  );
}
