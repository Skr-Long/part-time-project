import { BrowserRouter } from 'react-router-dom'
import './index.css'
import { GameProvider, useGameSelector, useGameDispatch } from './contexts/GameContext'
import { getMartialArt } from './data/martialArts'
import ActionBar from './components/ui/ActionBar'
import OverviewModal from './components/ui/OverviewModal'
import InventoryModal from './components/inventory/InventoryModal'
import EquipmentModal from './components/equipment/EquipmentModal'
import MartialArtsModal from './components/martial/MartialArtsModal'
import StatsModal from './components/stats/StatsModal'
import CharacterPanel from './components/character/CharacterPanel'
import MonsterBookModal from './components/monster/MonsterBookModal'
import SettingsModal from './components/ui/SettingsModal'
import ShopModal from './components/shop/ShopModal'
import CraftModal from './components/shop/CraftModal'
import DialogModal from './components/ui/DialogModal'
import EventRewardModal from './components/ui/EventRewardModal'
import type { EventRewardModalData } from './components/ui/EventRewardModal'
import TitleScreen from './screens/TitleScreen'
import CharacterCreationScreen from './screens/CharacterCreationScreen'
import { ExplorationMapScreen } from './screens/ExplorationMapScreen'
import { CombatScreen } from './screens/CombatScreen'

function DialogModalWrapper() {
  const dispatch = useGameDispatch()
  const modalData = useGameSelector(state => state.ui.modals.data)
  
  if (!modalData) return null
  
  const data = modalData as { dialogId: string; characterName: string }
  
  return (
    <DialogModal 
      dialogId={data.dialogId}
      characterName={data.characterName}
      onClose={() => dispatch({ type: 'CLOSE_MODAL' })}
    />
  )
}

function ModalRouter() {
  const modalType = useGameSelector(state => state.ui.modals.type)
  const modalData = useGameSelector(state => state.ui.modals.data)
  const dispatch = useGameDispatch()

  if (modalType === 'character') return <CharacterPanel />
  if (modalType === 'overview') return <OverviewModal />
  if (modalType === 'inventory') return <InventoryModal />
  if (modalType === 'equipment') return <EquipmentModal />
  if (modalType === 'martial') return <MartialArtsModal />
  if (modalType === 'stats') return <StatsModal />
  if (modalType === 'monster_book') return <MonsterBookModal />
  if (modalType === 'settings') return <SettingsModal />
  if (modalType === 'shop' && modalData) {
    return <ShopModal 
      shopInventory={(modalData as any).shopInventory || []} 
      shopName={(modalData as any).shopName || '商店'} 
    />
  }
  if (modalType === 'craft') return <CraftModal />
  if (modalType === 'dialog') return <DialogModalWrapper />
  if (modalType === 'event_reward' && modalData) {
    return <EventRewardModal 
      data={modalData as EventRewardModalData}
      onClose={() => dispatch({ type: 'CLOSE_MODAL' })}
    />
  }
  return null
}

function VictoryScreen() {
  const dispatch = useGameDispatch();
  const rewards = useGameSelector(state => state.combat.combatRewards);
  const player = useGameSelector(state => state.player);
  const enemy = useGameSelector(state => state.combat.enemy);

  const handleContinue = () => {
    dispatch({ type: 'CHANGE_GAME_PHASE', payload: { phase: 'exploration' } });
  };

  const getTechniqueLevel = (techId: string) => {
    return player.techniqueLevels.find(t => t.techniqueId === techId);
  };

  const baseTechniqueExp = rewards?.exp || 0;
  const techniqueExpBonus = Math.floor(baseTechniqueExp * (player.attributes.insight / 10));
  const totalTechniqueExp = baseTechniqueExp + techniqueExpBonus;

  const expPercent = Math.min(100, (player.exp / player.expToNext) * 100);

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#f5f0e6' }}>
      <div className="max-w-md w-full bg-white/90 rounded-xl shadow-2xl p-8 text-center" style={{ borderWidth: '3px', borderColor: '#c9a227' }}>
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="text-3xl font-serif font-bold mb-4" style={{ color: '#c9a227' }}>战斗胜利！</h2>
        <p className="mb-6" style={{ color: '#4a4a4a' }}>
          你击败了 <span className="font-bold" style={{ color: '#8b0000' }}>{enemy?.nameCN || '敌人'}</span>！
        </p>
        
        {rewards && (
          <>
            <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: 'rgba(201, 162, 39, 0.1)' }}>
              <h3 className="font-bold mb-3" style={{ color: '#1a1a1a' }}>获得奖励</h3>
              <div className="space-y-2 text-left">
                <div className="flex justify-between">
                  <span style={{ color: '#7a7a7a' }}>经验值</span>
                  <span className="font-bold" style={{ color: '#c9a227' }}>+{rewards.exp}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#7a7a7a' }}>银两</span>
                  <span className="font-bold" style={{ color: '#c9a227' }}>+{rewards.gold}</span>
                </div>
              </div>
            </div>

            <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}>
              <h3 className="font-bold mb-3" style={{ color: '#1a1a1a' }}>
                功法经验
                <span className="ml-2 text-xs font-normal" style={{ color: '#7a7a7a' }}>
                  (悟性加成: +{techniqueExpBonus})
                </span>
              </h3>
              <div className="text-sm text-left" style={{ color: '#4a4a4a' }}>
                <p className="mb-2">
                  战斗中使用的武学获得额外经验：
                  <span className="font-bold ml-2" style={{ color: '#8b5cf6' }}>
                    +{totalTechniqueExp}
                  </span>
                </p>
                <div className="space-y-1">
                  {player.knownTechniques.slice(0, 3).map(techId => {
                    const tech = getMartialArt(techId);
                    const level = getTechniqueLevel(techId);
                    if (!tech) return null;
                    return (
                      <div key={techId} className="flex justify-between items-center">
                        <span>{tech.type === 'internal' ? '🧘' : '👊'} {tech.nameCN}</span>
                        <span className="text-xs" style={{ color: '#7a7a7a' }}>
                          Lv.{level?.level || 1} ({level?.exp || 0}/{level?.expToNext || 100})
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
              <h3 className="font-bold mb-3" style={{ color: '#1a1a1a' }}>图鉴更新</h3>
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl">📖</span>
                <span style={{ color: '#4a4a4a' }}>
                  {enemy?.nameCN} 已记录到怪物图鉴
                </span>
              </div>
            </div>
          </>
        )}

        <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(74, 124, 89, 0.1)' }}>
          <h3 className="font-bold mb-2" style={{ color: '#1a1a1a' }}>当前状态</h3>
          <div className="grid grid-cols-2 gap-2 text-sm mb-3">
            <div className="flex justify-between">
              <span style={{ color: '#7a7a7a' }}>等级</span>
              <span className="font-bold" style={{ color: '#1e40af' }}>{player.level}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: '#7a7a7a' }}>悟性</span>
              <span className="font-bold" style={{ color: '#8b5cf6' }}>{player.attributes.insight}</span>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span style={{ color: '#7a7a7a' }}>经验进度</span>
              <span className="font-bold" style={{ color: '#4a7c59' }}>{player.exp} / {player.expToNext}</span>
            </div>
            <div className="h-4 rounded-full overflow-hidden" style={{ backgroundColor: '#e5e7eb' }}>
              <div 
                className="h-full transition-all duration-500" 
                style={{ 
                  width: `${expPercent}%`, 
                  backgroundColor: '#4a7c59' 
                }} 
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleContinue}
          className="w-full py-4 rounded-lg font-serif text-lg shadow-lg transition-all hover:scale-105"
          style={{ backgroundColor: '#c9a227', color: '#fff' }}
        >
          继续探索
        </button>
      </div>
    </div>
  );
}

function GameOverScreen() {
  const dispatch = useGameDispatch();

  const handleRestart = () => {
    dispatch({ type: 'RESET_GAME' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#1a1a1a' }}>
      <div className="max-w-md w-full bg-white/10 rounded-xl shadow-2xl p-8 text-center" style={{ borderWidth: '3px', borderColor: '#8b0000' }}>
        <div className="text-6xl mb-4">💀</div>
        <h2 className="text-3xl font-serif font-bold mb-4" style={{ color: '#dc2626' }}>战斗失败</h2>
        <p className="mb-6" style={{ color: '#9ca3af' }}>你倒在了血泊之中...<br/>但江湖路远，英雄可以从头再来！</p>

        <button
          onClick={handleRestart}
          className="w-full py-4 rounded-lg font-serif text-lg shadow-lg transition-all hover:scale-105"
          style={{ backgroundColor: '#8b0000', color: '#fff' }}
        >
          重新开始
        </button>
      </div>
    </div>
  );
}

function AppContent() {
  const gamePhase = useGameSelector(state => state.ui.gamePhase)
  const showActionBar = gamePhase === 'exploration' || gamePhase === 'combat'

  if (gamePhase === 'title') return <TitleScreen />
  if (gamePhase === 'character_creation') return <CharacterCreationScreen />
  if (gamePhase === 'combat') {
    return (
      <div className="min-h-screen pb-20">
        <CombatScreen />
        <ModalRouter />
      </div>
    )
  }
  if (gamePhase === 'victory') {
    return (
      <div className="min-h-screen pb-20">
        <VictoryScreen />
        <ModalRouter />
      </div>
    )
  }
  if (gamePhase === 'game_over') {
    return <GameOverScreen />
  }
  if (gamePhase === 'exploration') {
    return (
      <div className="min-h-screen">
        <ExplorationMapScreen />
        {showActionBar && <ActionBar />}
        <ModalRouter />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20">
      <main className="p-6">
        <p className="text-[var(--color-ink-gray)]">游戏内容开发中...</p>
      </main>
      {showActionBar && <ActionBar />}
      <ModalRouter />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <GameProvider>
        <AppContent />
      </GameProvider>
    </BrowserRouter>
  )
}

export default App
