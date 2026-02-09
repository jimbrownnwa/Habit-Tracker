export function today() {
  return new Date().toLocaleDateString('en-CA')
}

export function isWeekday(dateStr) {
  const day = new Date(dateStr + 'T12:00:00').getDay()
  return day >= 1 && day <= 5
}

export function isWeekend(dateStr) {
  return !isWeekday(dateStr)
}

export function getDayOfWeek(dateStr) {
  return new Date(dateStr + 'T12:00:00').getDay()
}

export function getDayName(dateStr) {
  const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return names[getDayOfWeek(dateStr)]
}

export function formatDisplayDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

export function getWeekDates(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  const day = d.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  const monday = new Date(d)
  monday.setDate(d.getDate() + mondayOffset)

  const dates = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    dates.push(date.toLocaleDateString('en-CA'))
  }
  return dates
}

export function getMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()

  // Monday-based column index (0=Mon, 6=Sun)
  const startCol = (firstDay.getDay() + 6) % 7

  const grid = []
  let currentRow = []

  // Pad before first day
  for (let i = 0; i < startCol; i++) {
    currentRow.push(null)
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    currentRow.push(dateStr)
    if (currentRow.length === 7) {
      grid.push(currentRow)
      currentRow = []
    }
  }

  // Pad after last day
  if (currentRow.length > 0) {
    while (currentRow.length < 7) {
      currentRow.push(null)
    }
    grid.push(currentRow)
  }

  return grid
}

export function getISOWeek(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  const dayNum = d.getDay() || 7
  d.setDate(d.getDate() + 4 - dayNum)
  const yearStart = new Date(d.getFullYear(), 0, 1)
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7)
}

export function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return d.toLocaleDateString('en-CA')
}

export function isSameDay(a, b) {
  return a === b
}

export function isToday(dateStr) {
  return dateStr === today()
}

export function isFriday(dateStr) {
  return getDayOfWeek(dateStr) === 5
}

export function isSunday(dateStr) {
  return getDayOfWeek(dateStr) === 0
}

export function isFutureDate(dateStr) {
  return dateStr > today()
}
