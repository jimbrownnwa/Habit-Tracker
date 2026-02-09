import { useRef } from 'react'
import { useApp } from '../context/AppContext'
import XpBadge from './XpBadge'

const TIME_LABELS = {
  morning: 'AM',
  afternoon: 'PM',
  evening: 'PM',
  anytime: 'Any',
}

export default function HabitRow({ habit, log }) {
  const { state, dispatch } = useApp()
  const longPressTimer = useRef(null)
  const isLongPress = useRef(false)

  const isCompleted = log?.completed || false
  const isMvd = log?.isBadDayVersion || false
  const xpEarned = log?.xpEarned || 0

  function handlePointerDown(e) {
    // Only trigger long press for primary button or touch
    if (e.button && e.button !== 0) return
    isLongPress.current = false
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true
      dispatch({ type: 'TOGGLE_MVD', date: state.selectedDate, habitId: habit.id })
    }, 500)
  }

  function handlePointerUp() {
    clearTimeout(longPressTimer.current)
    if (!isLongPress.current) {
      dispatch({ type: 'TOGGLE_HABIT', date: state.selectedDate, habitId: habit.id })
    }
  }

  function handlePointerLeave() {
    clearTimeout(longPressTimer.current)
  }

  function handleContextMenu(e) {
    e.preventDefault()
    dispatch({ type: 'TOGGLE_MVD', date: state.selectedDate, habitId: habit.id })
  }

  const rowClasses = [
    'flex items-center gap-3 p-3 rounded-lg transition-all duration-150 cursor-pointer select-none',
    isCompleted && !isMvd && 'bg-accent/5 shadow-[0_0_8px_rgba(245,166,35,0.15)]',
    isCompleted && isMvd && 'bg-warning/5',
    !isCompleted && 'hover:bg-border/30',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={rowClasses}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onContextMenu={handleContextMenu}
    >
      {/* Checkbox */}
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150 ${
          isCompleted
            ? isMvd
              ? 'bg-warning border-warning scale-110'
              : 'bg-accent border-accent scale-110'
            : 'border-muted'
        }`}
      >
        {isCompleted && (
          <svg className="w-3 h-3 text-bg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>

      {/* Habit info */}
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium transition-all duration-150 ${isCompleted ? 'line-through text-muted' : 'text-text'}`}>
          {habit.name}
          {isMvd && <span className="ml-2 text-xs text-warning font-mono">(MVD)</span>}
        </div>
        {isMvd && (
          <div className="text-xs text-muted mt-0.5">{habit.badDayVersion}</div>
        )}
      </div>

      {/* Time tag */}
      <span className="text-xs text-muted font-mono flex-shrink-0">
        {TIME_LABELS[habit.timeOfDay]}
      </span>

      {/* XP Badge */}
      <XpBadge
        value={isCompleted ? xpEarned : habit.xp}
        earned={isCompleted}
        isMvd={isMvd}
      />
    </div>
  )
}
