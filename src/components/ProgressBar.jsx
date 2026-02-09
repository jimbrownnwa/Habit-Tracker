export default function ProgressBar({ current, max, showLabel = true }) {
  const percent = max > 0 ? Math.round((current / max) * 100) : 0

  function getBarColor(pct) {
    if (pct >= 80) return 'bg-success'
    if (pct >= 40) return 'bg-warning'
    if (pct > 0) return 'bg-danger'
    return 'bg-border'
  }

  return (
    <div className="space-y-1">
      <div className="h-3 w-full rounded-full bg-border overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out ${getBarColor(percent)}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between text-xs text-muted font-mono">
          <span>{percent}%</span>
          <span>
            {current} / {max} XP
          </span>
        </div>
      )}
    </div>
  )
}
