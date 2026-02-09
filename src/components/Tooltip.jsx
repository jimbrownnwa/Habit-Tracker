import { useState, useRef } from 'react'

export default function Tooltip({ children, content }) {
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef(null)

  function handleMouseEnter() {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPosition({
        top: rect.top - 8,
        left: rect.left + rect.width / 2,
      })
    }
    setVisible(true)
  }

  function handleMouseLeave() {
    setVisible(false)
  }

  return (
    <div
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative"
    >
      {children}
      {visible && (
        <div
          className="fixed z-50 px-3 py-2 text-xs font-mono bg-card border border-border rounded-lg shadow-lg text-text whitespace-nowrap pointer-events-none"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          {content}
        </div>
      )}
    </div>
  )
}
