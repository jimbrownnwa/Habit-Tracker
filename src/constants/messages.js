export const DEFAULT_MESSAGE = 'Check off your first habit to get started.'

const FIRST_HABIT = [
  'First one down. Momentum is real.',
  'Day started. The rest is easier.',
  'One checked. Keep it rolling.',
]

const FIFTY_PERCENT = [
  "Halfway. You're already ahead of yesterday's version of you.",
  '50% locked. Keep the engine running.',
  'Halfway there. Finish what you started.',
]

const EIGHTY_PERCENT = [
  'Strong day locked in. Finish it.',
  "80%+. This is what consistency looks like.",
  "Almost there. Don't leave points on the table.",
]

const HUNDRED_PERCENT = [
  'Perfect day. This is who you are now.',
  '100%. Nothing left on the table.',
  'All habits. All XP. This is the standard.',
]

const STREAK_MESSAGES = {
  7: 'One week. The compound effect is starting.',
  14: "Two weeks. You're rewiring the default.",
  30: "30 days. This isn't a streak anymore \u2014 it's identity.",
  60: '60 days. You are the Calm Machine.',
}

const BROKEN_STREAK = "Streak reset. Yesterday is data, not destiny. MVD today and you're back."

const ZERO_DAY = 'New day. One checkbox changes everything.'

const LEVEL_MESSAGES = {
  1: 'Every operator starts here.',
  2: "You're building something real.",
  3: 'Designing the system that runs your life.',
  4: 'You command your days now.',
  5: 'Your days run themselves now.',
  6: 'Calm, consistent, unstoppable.',
  7: 'Nothing can stop what you started.',
  8: 'Stories will be told about this stretch.',
  9: 'This is generational discipline.',
  10: 'Immortal. The habits are the identity.',
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function getMotivationMessage({ completionPercent, completedCount, currentStreak, previousStreak, newLevel }) {
  // Priority 1: Level-up
  if (newLevel) {
    return `Level ${newLevel.level}: ${newLevel.title}. ${LEVEL_MESSAGES[newLevel.level] || ''}`
  }

  // Priority 2: Streak milestones
  const streakMilestones = [60, 30, 14, 7]
  for (const milestone of streakMilestones) {
    if (currentStreak === milestone) {
      return STREAK_MESSAGES[milestone]
    }
  }

  // Priority 3: Broken streak
  if (previousStreak > 3 && completedCount === 0) {
    return BROKEN_STREAK
  }

  // Priority 4: Daily milestones
  if (completionPercent >= 100) return randomFrom(HUNDRED_PERCENT)
  if (completionPercent >= 80) return randomFrom(EIGHTY_PERCENT)
  if (completionPercent >= 50) return randomFrom(FIFTY_PERCENT)
  if (completedCount >= 1) return randomFrom(FIRST_HABIT)

  // Priority 5: Zero day encouragement
  if (completedCount === 0) return ZERO_DAY

  return DEFAULT_MESSAGE
}
