export default function XpBadge({ value, earned = false, isMvd = false }) {
  const base = 'text-xs font-mono px-2 py-0.5 rounded-full'

  if (earned && isMvd) {
    return <span className={`${base} bg-warning/20 text-warning`}>{value} XP</span>
  }
  if (earned) {
    return <span className={`${base} bg-accent/20 text-accent`}>{value} XP</span>
  }
  return <span className={`${base} bg-border text-muted`}>{value} XP</span>
}
