import { getDayName, isToday, isFutureDate } from '../utils/dates'
import { getDayEmoji } from '../utils/scoring'

export default function DayIcon({ dateStr, summary, isSelected, onClick }) {
  const dayName = getDayName(dateStr)
  const dayNum = new Date(dateStr + 'T12:00:00').getDate()
  const isTodayDate = isToday(dateStr)
  const isFuture = isFutureDate(dateStr)

  let emoji = '\u2B1C' // white square for future/no-data
  if (!isFuture && summary) {
    emoji = getDayEmoji(summary.classification)
  }

  return (
    <button
      onClick={() => onClick(dateStr)}
      className={`flex flex-col items-center gap-0.5 px-2 py-2 rounded-lg transition-all duration-150 cursor-pointer ${
        isSelected
          ? 'ring-2 ring-accent bg-accent/10'
          : 'hover:bg-border/30'
      }`}
    >
      <span className="text-xs font-mono text-muted uppercase">{dayName}</span>
      <span className="text-lg">{emoji}</span>
      <span className={`text-xs font-mono ${isTodayDate ? 'text-accent font-bold' : 'text-muted'}`}>
        {dayNum}
      </span>
      {isTodayDate && (
        <div className="w-1 h-1 rounded-full bg-accent" />
      )}
    </button>
  )
}
