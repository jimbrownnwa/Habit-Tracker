import { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { getTotalXp } from '../utils/scoring'
import { getLevelForXp } from '../constants/levels'

export default function LevelUpToast() {
  const { state } = useApp()
  const totalXp = getTotalXp(state.dailyLogs)
  const level = getLevelForXp(totalXp)

  const prevLevelRef = useRef(level.level)
  const [showToast, setShowToast] = useState(false)
  const [newLevel, setNewLevel] = useState(null)

  useEffect(() => {
    if (level.level > prevLevelRef.current) {
      setNewLevel(level)
      setShowToast(true)
      const timer = setTimeout(() => setShowToast(false), 4000)
      prevLevelRef.current = level.level
      return () => clearTimeout(timer)
    }
    prevLevelRef.current = level.level
  }, [level])

  if (!showToast || !newLevel) return null

  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-xl bg-card border border-accent text-center"
      style={{ animation: 'slide-down 0.4s ease-out, golden-pulse 1.5s ease-in-out 3' }}
    >
      <div className="text-xs font-mono text-accent uppercase tracking-widest mb-1">
        Level Up
      </div>
      <div className="text-xl font-mono font-bold text-accent">
        Lv.{newLevel.level} {newLevel.title}
      </div>
    </div>
  )
}
