import { useApp } from '../context/AppContext'
import { getApplicableHabits, calculateDaySummary, calculateStreaks } from '../utils/scoring'
import { isToday } from '../utils/dates'
import HabitRow from './HabitRow'
import ProgressBar from './ProgressBar'
import MotivationMessage from './MotivationMessage'

export default function DailyChecklist() {
  const { state } = useApp()
  const { habits, dailyLogs, selectedDate } = state

  const applicable = getApplicableHabits(habits, selectedDate)
  const logs = dailyLogs[selectedDate] || []
  const summary = calculateDaySummary(habits, logs, selectedDate)
  const completedCount = logs.filter((l) => l.completed).length

  const viewingToday = isToday(selectedDate)
  const streaks = calculateStreaks(habits, dailyLogs)

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <h2 className="text-sm font-mono text-muted uppercase tracking-wider">
        {viewingToday ? "Today's Habits" : `Habits for ${selectedDate}`}
      </h2>

      <div className="space-y-1">
        {applicable.map((habit) => {
          const log = logs.find((l) => l.habitId === habit.id)
          return <HabitRow key={habit.id} habit={habit} log={log} />
        })}
      </div>

      <div className="pt-2">
        <ProgressBar current={summary.totalXpEarned} max={summary.totalXpPossible} />
      </div>

      <MotivationMessage
        completionPercent={summary.completionPercent}
        completedCount={completedCount}
        currentStreak={streaks.currentStreak}
      />
    </div>
  )
}
