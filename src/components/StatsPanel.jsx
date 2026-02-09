import { useApp } from '../context/AppContext'
import { today } from '../utils/dates'
import { calculateDaySummary, calculateStreaks, getTotalXp } from '../utils/scoring'

export default function StatsPanel() {
  const { state } = useApp()
  const { habits, dailyLogs } = state

  const streaks = calculateStreaks(habits, dailyLogs)
  const todayStr = today()

  // Calculate monthly stats for current month
  const currentDate = new Date(todayStr + 'T12:00:00')
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  let perfectDays = 0
  let mvdDays = 0
  let monthlyXpEarned = 0
  let monthlyXpPossible = 0

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    if (dateStr > todayStr) break

    const logs = dailyLogs[dateStr] || []
    const summary = calculateDaySummary(habits, logs, dateStr)

    monthlyXpEarned += summary.totalXpEarned
    monthlyXpPossible += summary.totalXpPossible

    if (summary.isPerfectDay) perfectDays++
    else if (summary.streakDay) mvdDays++
  }

  const stats = [
    {
      label: 'Perfect Days',
      value: perfectDays,
      emoji: '\u2B50',
    },
    {
      label: 'MVD+ Days',
      value: mvdDays,
      emoji: '\uD83D\uDFE1',
    },
    {
      label: 'Current Streak',
      value: streaks.currentStreak,
      emoji: '\uD83D\uDD25',
    },
    {
      label: 'Best Streak',
      value: streaks.bestStreak,
      emoji: '\uD83C\uDFC6',
    },
  ]

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <h2 className="text-sm font-mono text-muted uppercase tracking-wider">Monthly Stats</h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-bg rounded-lg p-3 text-center space-y-1"
          >
            <div className="text-lg">{stat.emoji}</div>
            <div className="text-xl font-mono font-bold text-text">{stat.value}</div>
            <div className="text-xs text-muted">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="flex justify-between text-xs font-mono text-muted px-1 pt-1">
        <span>
          Monthly XP: {monthlyXpEarned.toLocaleString()} / {monthlyXpPossible.toLocaleString()}
        </span>
        <span>
          Total XP: {getTotalXp(dailyLogs).toLocaleString()}
        </span>
      </div>
    </div>
  )
}
