import { createContext, useContext, useReducer, useEffect, useRef } from 'react'
import { loadState, saveState } from '../utils/storage'
import { today } from '../utils/dates'
import { uuid } from '../utils/uuid'

const AppContext = createContext(null)

function appReducer(state, action) {
  switch (action.type) {
    case 'INIT':
      return {
        ...state,
        habits: action.habits,
        dailyLogs: action.dailyLogs,
        initialized: true,
      }

    case 'TOGGLE_HABIT': {
      const { date, habitId } = action
      const habit = state.habits.find((h) => h.id === habitId)
      if (!habit) return state

      const dateLogs = [...(state.dailyLogs[date] || [])]
      const existingIndex = dateLogs.findIndex((l) => l.habitId === habitId)

      if (existingIndex >= 0) {
        const existing = dateLogs[existingIndex]
        if (existing.completed) {
          // Uncheck
          dateLogs[existingIndex] = { ...existing, completed: false, xpEarned: 0, completedAt: null }
        } else {
          // Check full
          dateLogs[existingIndex] = {
            ...existing,
            completed: true,
            isBadDayVersion: false,
            xpEarned: habit.xp,
            completedAt: new Date().toISOString(),
          }
        }
      } else {
        // Create new entry as full complete
        dateLogs.push({
          id: uuid(),
          date,
          habitId,
          completed: true,
          isBadDayVersion: false,
          xpEarned: habit.xp,
          completedAt: new Date().toISOString(),
          note: null,
        })
      }

      return {
        ...state,
        dailyLogs: { ...state.dailyLogs, [date]: dateLogs },
      }
    }

    case 'TOGGLE_MVD': {
      const { date, habitId } = action
      const habit = state.habits.find((h) => h.id === habitId)
      if (!habit) return state

      const dateLogs = [...(state.dailyLogs[date] || [])]
      const existingIndex = dateLogs.findIndex((l) => l.habitId === habitId)

      if (existingIndex >= 0) {
        const existing = dateLogs[existingIndex]
        if (existing.completed && !existing.isBadDayVersion) {
          // Downgrade from full to MVD
          dateLogs[existingIndex] = {
            ...existing,
            isBadDayVersion: true,
            xpEarned: habit.badDayXp,
          }
        } else if (existing.completed && existing.isBadDayVersion) {
          // Upgrade from MVD to full
          dateLogs[existingIndex] = {
            ...existing,
            isBadDayVersion: false,
            xpEarned: habit.xp,
          }
        } else {
          // Not completed — create as MVD
          dateLogs[existingIndex] = {
            ...existing,
            completed: true,
            isBadDayVersion: true,
            xpEarned: habit.badDayXp,
            completedAt: new Date().toISOString(),
          }
        }
      } else {
        // Create new as MVD
        dateLogs.push({
          id: uuid(),
          date,
          habitId,
          completed: true,
          isBadDayVersion: true,
          xpEarned: habit.badDayXp,
          completedAt: new Date().toISOString(),
          note: null,
        })
      }

      return {
        ...state,
        dailyLogs: { ...state.dailyLogs, [date]: dateLogs },
      }
    }

    case 'SET_DATE':
      return { ...state, selectedDate: action.date }

    case 'UPDATE_HABIT': {
      const habits = state.habits.map((h) =>
        h.id === action.habit.id ? { ...h, ...action.habit } : h
      )
      return { ...state, habits }
    }

    case 'ADD_HABIT':
      return { ...state, habits: [...state.habits, action.habit] }

    case 'DELETE_HABIT': {
      const habits = state.habits.map((h) =>
        h.id === action.habitId ? { ...h, active: false } : h
      )
      return { ...state, habits }
    }

    case 'REORDER_HABITS': {
      const { orderedIds } = action
      const habits = state.habits.map((h) => {
        const newOrder = orderedIds.indexOf(h.id)
        return newOrder >= 0 ? { ...h, sortOrder: newOrder + 1 } : h
      })
      return { ...state, habits }
    }

    case 'IMPORT_DATA':
      return {
        ...state,
        habits: action.habits,
        dailyLogs: action.dailyLogs,
      }

    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, {
    habits: [],
    dailyLogs: {},
    selectedDate: today(),
    initialized: false,
  })

  const initialDateRef = useRef(today())

  // Load from localStorage on mount
  useEffect(() => {
    const { habits, dailyLogs } = loadState()
    dispatch({ type: 'INIT', habits, dailyLogs })
  }, [])

  // Save to localStorage on state change (debounced)
  useEffect(() => {
    if (!state.initialized) return
    const timer = setTimeout(() => {
      saveState(state.habits, state.dailyLogs)
    }, 300)
    return () => clearTimeout(timer)
  }, [state.habits, state.dailyLogs, state.initialized])

  // Midnight check — auto-advance to new day
  useEffect(() => {
    const interval = setInterval(() => {
      const now = today()
      if (now !== initialDateRef.current) {
        initialDateRef.current = now
        dispatch({ type: 'SET_DATE', date: now })
      }
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {state.initialized ? children : null}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within AppProvider')
  return context
}
