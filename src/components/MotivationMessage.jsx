import { getMotivationMessage } from '../constants/messages'

export default function MotivationMessage({ completionPercent, completedCount, currentStreak }) {
  const message = getMotivationMessage({
    completionPercent,
    completedCount,
    currentStreak,
    previousStreak: 0,
    newLevel: null,
  })

  return (
    <div
      className="text-sm text-muted italic px-1 py-2"
      style={{ animation: 'fade-in 0.3s ease-out' }}
      key={message}
    >
      &ldquo;{message}&rdquo;
    </div>
  )
}
