export const LEVELS = [
  { level: 1, xp: 0, title: 'Operator' },
  { level: 2, xp: 500, title: 'Builder' },
  { level: 3, xp: 1500, title: 'Architect' },
  { level: 4, xp: 3500, title: 'Commander' },
  { level: 5, xp: 7000, title: 'Machine' },
  { level: 6, xp: 12000, title: 'Calm Machine' },
  { level: 7, xp: 20000, title: 'Inevitable' },
  { level: 8, xp: 35000, title: 'Legendary' },
  { level: 9, xp: 55000, title: 'Immortal' },
  { level: 10, xp: 80000, title: 'Generational' },
]

export function getLevelForXp(totalXp) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVELS[i].xp) return LEVELS[i]
  }
  return LEVELS[0]
}

export function getXpToNextLevel(totalXp) {
  const current = getLevelForXp(totalXp)
  const nextIndex = LEVELS.findIndex((l) => l.level === current.level) + 1
  if (nextIndex >= LEVELS.length) {
    return { current: totalXp, needed: totalXp, percent: 100, nextLevel: null }
  }
  const next = LEVELS[nextIndex]
  const xpIntoLevel = totalXp - current.xp
  const xpNeeded = next.xp - current.xp
  return {
    current: xpIntoLevel,
    needed: xpNeeded,
    percent: Math.round((xpIntoLevel / xpNeeded) * 100),
    nextLevel: next,
  }
}
