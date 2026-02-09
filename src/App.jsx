import { useState } from 'react'
import Header from './components/Header'
import DailyChecklist from './components/DailyChecklist'
import WeekView from './components/WeekView'
import MonthGrid from './components/MonthGrid'
import StatsPanel from './components/StatsPanel'
import SettingsPanel from './components/SettingsPanel'
import LevelUpToast from './components/LevelUpToast'
import StreakToast from './components/StreakToast'

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <div className="min-h-screen bg-bg text-text font-sans max-w-3xl mx-auto px-4 py-6 space-y-4">
      <LevelUpToast />
      <StreakToast />
      <Header onOpenSettings={() => setSettingsOpen(true)} />
      <DailyChecklist />
      <WeekView />
      <MonthGrid />
      <StatsPanel />
      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}

export default App
