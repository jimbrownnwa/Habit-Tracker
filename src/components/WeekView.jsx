import { useApp } from '../context/AppContext'
import { getWeekDates } from '../utils/dates'
import { calculateDaySummary } from '../utils/scoring'
import DayIcon from './DayIcon'

export default function WeekView() {
  const { state, dispatch } = useApp()
  const { habits, dailyLogs, selectedDate } = state

  const weekDates = getWeekDates(selectedDate)

  let weeklyXpEarned = 0
  let weeklyXpPossible = 0

  const summaries = weekDates.map((d) => {
    const logs = dailyLogs[d] || []
    const summary = calculateDaySummary(habits, logs, d)
    weeklyXpEarned += summary.totalXpEarned
    weeklyXpPossible += summary.totalXpPossible
    return { date: d, summary }
  })

  const weekdaySummaries = summaries.slice(0, 5)
  const weekendSummaries = summaries.slice(5)

  function handleDayClick(dateStr) {
    dispatch({ type: 'SET_DATE', date: dateStr })
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <h2 className="text-sm font-mono text-muted uppercase tracking-wider">This Week</h2>

      <div className="flex items-center justify-center gap-1">
        {/* Weekdays */}
        {weekdaySummaries.map(({ date, summary }) => (
          <DayIcon
            key={date}
            dateStr={date}
            summary={summary}
            isSelected={date === selectedDate}
            onClick={handleDayClick}
          />
        ))}

        {/* Separator */}
        <div className="w-px h-12 bg-border mx-1" />

        {/* Weekend */}
        {weekendSummaries.map(({ date, summary }) => (
          <DayIcon
            key={date}
            dateStr={date}
            summary={summary}
            isSelected={date === selectedDate}
            onClick={handleDayClick}
          />
        ))}
      </div>

      <div className="flex justify-between text-xs font-mono text-muted px-1">
        <span>
          Weekly Score: {weeklyXpEarned.toLocaleString()} / {weeklyXpPossible.toLocaleString()} XP
        </span>
      </div>
    </div>
  )
}
