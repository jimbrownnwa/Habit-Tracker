import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { getMonthGrid } from '../utils/dates'
import { calculateDaySummary } from '../utils/scoring'
import MonthCell from './MonthCell'

const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function MonthGrid() {
  const { state, dispatch } = useApp()
  const { habits, dailyLogs, selectedDate } = state

  const selectedDateObj = new Date(selectedDate + 'T12:00:00')
  const [viewYear, setViewYear] = useState(selectedDateObj.getFullYear())
  const [viewMonth, setViewMonth] = useState(selectedDateObj.getMonth())

  const grid = getMonthGrid(viewYear, viewMonth)

  const monthName = new Date(viewYear, viewMonth).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear(viewYear - 1)
    } else {
      setViewMonth(viewMonth - 1)
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear(viewYear + 1)
    } else {
      setViewMonth(viewMonth + 1)
    }
  }

  function handleDayClick(dateStr) {
    dispatch({ type: 'SET_DATE', date: dateStr })
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-mono text-muted uppercase tracking-wider">Month View</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={prevMonth}
            className="text-muted hover:text-text transition-colors px-2 py-1 rounded hover:bg-border/30"
          >
            &larr;
          </button>
          <span className="text-sm font-mono text-text min-w-[140px] text-center">
            {monthName}
          </span>
          <button
            onClick={nextMonth}
            className="text-muted hover:text-text transition-colors px-2 py-1 rounded hover:bg-border/30"
          >
            &rarr;
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1">
        {DAY_HEADERS.map((day) => (
          <div key={day} className="text-center text-[10px] font-mono text-muted uppercase py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Grid cells */}
      <div className="grid grid-cols-7 gap-1">
        {grid.flat().map((dateStr, i) => {
          const logs = dateStr ? (dailyLogs[dateStr] || []) : []
          const summary = dateStr ? calculateDaySummary(habits, logs, dateStr) : null
          return (
            <MonthCell
              key={dateStr || `empty-${i}`}
              dateStr={dateStr}
              summary={summary}
              isSelected={dateStr === selectedDate}
              onClick={handleDayClick}
            />
          )
        })}
      </div>
    </div>
  )
}
