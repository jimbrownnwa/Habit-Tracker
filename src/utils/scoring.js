import { isWeekday, isFriday, isSunday, today, addDays, getISOWeek, getWeekDates } from './dates'
import { MVD_THRESHOLD, STRONG_THRESHOLD } from '../constants/habits'

export function getApplicableHabits(habits, dateStr) {
  const weekday = isWeekday(dateStr)
  const friday = isFriday(dateStr)
  const sunday = isSunday(dateStr)

  return habits
    .filter((h) => {
      if (!h.active) return false
      if (h.id === 'h10' && !friday) return false
      if (h.id === 'h11' && !sunday) return false
      if (h.appliesTo === 'both') return true
      if (h.appliesTo === 'weekday' && weekday) return true
      if (h.appliesTo === 'weekend' && !weekday) return true
      return false
    })
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

export function calculateDaySummary(habits, logsForDate, dateStr) {
  const applicable = getApplicableHabits(habits, dateStr)
  const totalXpPossible = applicable.reduce((sum, h) => sum + h.xp, 0)

  const logs = logsForDate || []
  const totalXpEarned = logs.reduce((sum, l) => (l.completed ? sum + l.xpEarned : sum), 0)

  const completionPercent = totalXpPossible > 0
    ? Math.round((totalXpEarned / totalXpPossible) * 100)
    : 0

  const completedCount = logs.filter((l) => l.completed).length
  const allCompleted = completedCount === applicable.length && applicable.length > 0

  const classification = classifyDay(completionPercent)

  return {
    date: dateStr,
    dayType: isWeekday(dateStr) ? 'weekday' : 'weekend',
    totalXpPossible,
    totalXpEarned,
    completionPercent,
    isPerfectDay: allCompleted,
    isMvdDay: classification === 'mvd',
    isZeroDay: classification === 'zero',
    streakDay: completionPercent >= MVD_THRESHOLD,
    classification,
  }
}

export function classifyDay(percent) {
  if (percent >= 100) return 'perfect'
  if (percent >= STRONG_THRESHOLD) return 'strong'
  if (percent >= MVD_THRESHOLD) return 'mvd'
  if (percent > 0) return 'weak'
  return 'zero'
}

export function getDayEmoji(classification) {
  const emojis = {
    perfect: '\u2B50',
    strong: '\u2705',
    mvd: '\uD83D\uDFE1',
    weak: '\uD83D\uDFE0',
    zero: '\u274C',
  }
  return emojis[classification] || '\u2B1C'
}

export function getTotalXp(dailyLogs) {
  let total = 0
  for (const logs of Object.values(dailyLogs)) {
    for (const log of logs) {
      if (log.completed) total += log.xpEarned
    }
  }
  return total
}

export function calculateStreaks(habits, dailyLogs) {
  const todayStr = today()

  // Walk backward from today for current streak
  let currentStreak = 0
  let graceUsedThisWeek = false
  let currentWeek = getISOWeek(todayStr)
  let date = todayStr

  // Check if today has any logs — if not, start from yesterday
  // (don't penalize "today" if it hasn't been filled yet)
  const todayLogs = dailyLogs[todayStr] || []
  const todayHasActivity = todayLogs.some((l) => l.completed)

  if (!todayHasActivity) {
    date = addDays(todayStr, -1)
    currentWeek = getISOWeek(date)
  }

  for (let i = 0; i < 400; i++) {
    const week = getISOWeek(date)
    if (week !== currentWeek) {
      currentWeek = week
      graceUsedThisWeek = false
    }

    const logs = dailyLogs[date] || []
    if (logs.length === 0 && i > 0) {
      // No data for this day
      if (!graceUsedThisWeek) {
        graceUsedThisWeek = true
        currentStreak++
      } else {
        break
      }
    } else {
      const summary = calculateDaySummary(habits, logs, date)
      if (summary.streakDay) {
        currentStreak++
      } else if (!graceUsedThisWeek) {
        graceUsedThisWeek = true
        // Grace day counts toward streak
        currentStreak++
      } else {
        break
      }
    }

    date = addDays(date, -1)
  }

  // If today has activity and counts, include it
  if (todayHasActivity) {
    // Already counted in the loop
  }

  // Walk all dates forward for best streak
  const allDates = Object.keys(dailyLogs).sort()
  let bestStreak = currentStreak
  let perfectStreak = 0
  let currentPerfect = 0

  if (allDates.length > 0) {
    let runStreak = 0
    let runGrace = false
    let runWeek = getISOWeek(allDates[0])

    // Fill in gaps between dates
    const firstDate = allDates[0]
    const lastDate = todayStr
    let d = firstDate

    while (d <= lastDate) {
      const week = getISOWeek(d)
      if (week !== runWeek) {
        runWeek = week
        runGrace = false
      }

      const logs = dailyLogs[d] || []
      const summary = calculateDaySummary(habits, logs, d)

      if (summary.streakDay) {
        runStreak++
      } else if (!runGrace) {
        runGrace = true
        runStreak++
      } else {
        runStreak = 0
        runGrace = false
      }

      if (runStreak > bestStreak) bestStreak = runStreak

      // Perfect streak (no grace)
      if (summary.isPerfectDay) {
        currentPerfect++
        if (currentPerfect > perfectStreak) perfectStreak = currentPerfect
      } else {
        currentPerfect = 0
      }

      d = addDays(d, 1)
    }
  }

  // Weekly streak: consecutive weeks with >= 4/5 weekdays at MVD+
  let weeklyStreak = 0
  let weekDate = todayStr

  for (let w = 0; w < 52; w++) {
    const weekDates = getWeekDates(weekDate)
    const weekdays = weekDates.slice(0, 5) // Mon-Fri
    let mvdDays = 0

    for (const wd of weekdays) {
      if (wd > todayStr) continue // Don't count future days
      const logs = dailyLogs[wd] || []
      const summary = calculateDaySummary(habits, logs, wd)
      if (summary.streakDay) mvdDays++
    }

    // For the current week, adjust threshold based on how many weekdays have passed
    const pastWeekdays = weekdays.filter((wd) => wd <= todayStr).length
    const threshold = weekDate === todayStr ? Math.min(4, pastWeekdays) : 4

    if (mvdDays >= threshold && pastWeekdays > 0) {
      weeklyStreak++
    } else {
      break
    }

    weekDate = addDays(weekDate, -7)
  }

  return { currentStreak, bestStreak, perfectStreak, weeklyStreak }
}
