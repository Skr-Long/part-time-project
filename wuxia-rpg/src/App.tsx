import { BrowserRouter } from 'react-router-dom'
import './index.css'
import { GameProvider, useGameSelector } from './contexts/GameContext'
import ActionBar from './components/ui/ActionBar'
import InventoryModal from './components/inventory/InventoryModal'
import EquipmentModal from './components/equipment/EquipmentModal'
import MartialArtsModal from './components/martial/MartialArtsModal'
import TitleScreen from './screens/TitleScreen'
import CharacterCreationScreen from './screens/CharacterCreationScreen'
import { ExplorationScreen } from './screens/ExplorationScreen'
import { CombatScreen } from './screens/CombatScreen'

function Header() {
  return (
    <header className="bg-[var(--color-ink-black)] text-[var(--color-rice)] py-4 px-6 shadow-lg">
      <h1 className="text-2xl font-serif">江湖游历</h1>
    </header>
  )
}

function ModalRouter() {
  const modalType = useGameSelector(state => state.ui.modals.type)

  if (modalType === 'inventory') return <InventoryModal />
  if (modalType === 'equipment') return <EquipmentModal />
  if (modalType === 'martial') return <MartialArtsModal />
  return null
}

function AppContent() {
  const gamePhase = useGameSelector(state => state.ui.gamePhase)
  const showActionBar = gamePhase === 'exploration' || gamePhase === 'combat'

  if (gamePhase === 'title') return <TitleScreen />
  if (gamePhase === 'character_creation') return <CharacterCreationScreen />
  if (gamePhase === 'combat') {
    return (
      <div className="min-h-screen pb-20">
        <Header />
        <CombatScreen />
        <ModalRouter />
      </div>
    )
  }
  if (gamePhase === 'exploration') {
    return (
      <div className="min-h-screen pb-20">
        <Header />
        <ExplorationScreen />
        {showActionBar && <ActionBar />}
        <ModalRouter />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20">
      <Header />
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
