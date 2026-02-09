import { isFutureDate, isToday } from '../utils/dates'
import { getDayEmoji } from '../utils/scoring'
import Tooltip from './Tooltip'

export default function MonthCell({ dateStr, summary, isSelected, onClick }) {
  if (!dateStr) {
    return <div className="w-full aspect-square" />
  }

  const isFuture = isFutureDate(dateStr)
  const todayDate = isToday(dateStr)
  const dayNum = new Date(dateStr + 'T12:00:00').getDate()

  let opacity = 0.05
  if (!isFuture && summary) {
    opacity = Math.max(0.08, summary.completionPercent / 100)
  }

  const tooltipContent = summary && !isFuture ? (
    <div className="space-y-0.5">
      <div>{dateStr}</div>
      <div>
        {getDayEmoji(summary.classification)} {summary.totalXpEarned}/{summary.totalXpPossible} XP ({summary.completionPercent}%)
      </div>
    </div>
  ) : (
    <div>{dateStr}{isFuture ? ' (future)' : ''}</div>
  )

  return (
    <Tooltip content={tooltipContent}>
      <button
        onClick={() => onClick && onClick(dateStr)}
        className={`w-full aspect-square rounded-sm flex items-center justify-center text-[10px] font-mono transition-all duration-150 cursor-pointer ${
          isSelected ? 'ring-2 ring-accent' : 'hover:ring-1 hover:ring-accent/50'
        } ${todayDate ? 'ring-1 ring-accent/40' : ''}`}
        style={{
          backgroundColor: isFuture
            ? 'rgba(42, 45, 55, 0.3)'
            : `rgba(245, 166, 35, ${opacity})`,
        }}
      >
        <span className={`${todayDate ? 'text-accent font-bold' : 'text-muted'}`}>
          {dayNum}
        </span>
      </button>
    </Tooltip>
  )
}
