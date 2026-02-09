import { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { calculateStreaks } from '../utils/scoring'

const STREAK_MILESTONES = {
  7: 'One week. The compound effect is starting.',
  14: "Two weeks. You're rewiring the default.",
  30: "30 days. This isn't a streak anymore \u2014 it's identity.",
  60: '60 days. You are the Calm Machine.',
}

export default function StreakToast() {
  const { state } = useApp()
  const streaks = calculateStreaks(state.habits, state.dailyLogs)

  const prevStreakRef = useRef(streaks.currentStreak)
  const [showToast, setShowToast] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const current = streaks.currentStreak
    const prev = prevStreakRef.current

    // Check if we just crossed a milestone
    for (const milestone of [7, 14, 30, 60]) {
      if (current >= milestone && prev < milestone) {
        setMessage(STREAK_MILESTONES[milestone])
        setShowToast(true)
        const timer = setTimeout(() => setShowToast(false), 3000)
        prevStreakRef.current = current
        return () => clearTimeout(timer)
      }
    }

    prevStreakRef.current = current
  }, [streaks.currentStreak])

  if (!showToast) return null

  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl bg-card border border-accent/50 text-center"
      style={{ animation: 'slide-down 0.4s ease-out' }}
    >
      <div className="flex items-center gap-2">
        <span
          className="text-xl"
          style={{ animation: 'fire-pulse 1s ease-in-out 3' }}
        >
          {'\uD83D\uDD25'}
        </span>
        <span className="text-sm font-mono text-accent">{message}</span>
      </div>
    </div>
  )
}
