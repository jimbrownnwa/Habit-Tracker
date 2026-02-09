import { DEFAULT_HABITS } from '../constants/habits'

const KEYS = {
  version: 'kh_version',
  habits: 'kh_habits',
  logs: 'kh_logs',
}

const STORAGE_VERSION = 1

export function loadState() {
  try {
    const version = localStorage.getItem(KEYS.version)

    if (!version) {
      // First run — seed defaults
      const habits = DEFAULT_HABITS
      const dailyLogs = {}
      saveState(habits, dailyLogs)
      localStorage.setItem(KEYS.version, String(STORAGE_VERSION))
      return { habits, dailyLogs }
    }

    const habitsRaw = localStorage.getItem(KEYS.habits)
    const logsRaw = localStorage.getItem(KEYS.logs)

    const habits = habitsRaw ? JSON.parse(habitsRaw) : DEFAULT_HABITS
    const dailyLogs = logsRaw ? JSON.parse(logsRaw) : {}

    return { habits, dailyLogs }
  } catch (e) {
    console.error('Failed to load state from localStorage:', e)
    return { habits: DEFAULT_HABITS, dailyLogs: {} }
  }
}

export function saveState(habits, dailyLogs) {
  try {
    localStorage.setItem(KEYS.habits, JSON.stringify(habits))
    localStorage.setItem(KEYS.logs, JSON.stringify(dailyLogs))
    localStorage.setItem(KEYS.version, String(STORAGE_VERSION))
  } catch (e) {
    console.error('Failed to save state to localStorage:', e)
  }
}

export function exportData(habits, dailyLogs) {
  return JSON.stringify(
    {
      version: STORAGE_VERSION,
      habits,
      dailyLogs,
      exportedAt: new Date().toISOString(),
    },
    null,
    2
  )
}

export function importData(jsonString) {
  const data = JSON.parse(jsonString)
  if (!data.habits || !data.dailyLogs) {
    throw new Error('Invalid data format: missing habits or dailyLogs')
  }
  if (!Array.isArray(data.habits)) {
    throw new Error('Invalid data format: habits must be an array')
  }
  return { habits: data.habits, dailyLogs: data.dailyLogs }
}

export function clearAllData() {
  localStorage.removeItem(KEYS.version)
  localStorage.removeItem(KEYS.habits)
  localStorage.removeItem(KEYS.logs)
}
