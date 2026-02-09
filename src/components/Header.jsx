import { useApp } from '../context/AppContext'
import { formatDisplayDate, isWeekday, isToday, today } from '../utils/dates'
import { getTotalXp, calculateStreaks } from '../utils/scoring'
import { getLevelForXp, getXpToNextLevel } from '../constants/levels'

export default function Header({ onOpenSettings }) {
  const { state, dispatch } = useApp()
  const { selectedDate, dailyLogs, habits } = state

  const totalXp = getTotalXp(dailyLogs)
  const level = getLevelForXp(totalXp)
  const xpProgress = getXpToNextLevel(totalXp)
  const viewingToday = isToday(selectedDate)
  const dayType = isWeekday(selectedDate) ? 'Weekday' : 'Weekend'
  const streaks = calculateStreaks(habits, dailyLogs)

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      {/* Top row: date + day type + streak + gear */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-mono font-semibold text-text">
            {formatDisplayDate(selectedDate)}
          </h1>
          <span className="text-xs font-mono text-muted uppercase tracking-wider">
            {dayType}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Streak counter */}
          {streaks.currentStreak > 0 && (
            <div className="flex items-center gap-1 text-accent font-mono font-bold">
              <span
                className="text-lg"
                style={{ animation: 'fire-pulse 2s ease-in-out infinite' }}
              >
                {'\uD83D\uDD25'}
              </span>
              <span className="text-sm">{streaks.currentStreak}</span>
            </div>
          )}

          {!viewingToday && (
            <button
              onClick={() => dispatch({ type: 'SET_DATE', date: today() })}
              className="text-xs font-mono text-accent hover:text-accent/80 px-3 py-1 border border-accent/30 rounded-lg transition-colors"
            >
              Back to Today
            </button>
          )}

          {/* Settings gear */}
          <button
            onClick={onOpenSettings}
            className="text-muted hover:text-text transition-colors p-1.5 rounded-lg hover:bg-border/30"
            title="Settings"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.248a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Bottom row: level + XP bar */}
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <span className="text-sm font-mono font-semibold bg-accent/15 text-accent px-3 py-1 rounded-lg">
            Lv.{level.level} {level.title}
          </span>
        </div>

        <div className="flex-1">
          <div className="h-2 w-full rounded-full bg-border overflow-hidden">
            <div
              className="h-full rounded-full bg-accent transition-all duration-300 ease-out"
              style={{ width: `${xpProgress.percent}%` }}
            />
          </div>
          <div className="text-xs text-muted font-mono mt-0.5">
            {xpProgress.nextLevel
              ? `${xpProgress.current.toLocaleString()} / ${xpProgress.needed.toLocaleString()} XP to ${xpProgress.nextLevel.title}`
              : `${totalXp.toLocaleString()} XP — Max Level`}
          </div>
        </div>

        <div className="text-lg font-mono font-bold text-accent flex-shrink-0">
          {totalXp.toLocaleString()} XP
        </div>
      </div>
    </div>
  )
}
