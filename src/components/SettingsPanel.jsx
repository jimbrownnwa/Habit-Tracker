import { useEffect } from 'react'
import HabitEditor from './HabitEditor'
import ExportImport from './ExportImport'

export default function SettingsPanel({ isOpen, onClose }) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-card border-l border-border shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-sm font-mono text-muted uppercase tracking-wider">Settings</h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-text transition-colors p-1 rounded-lg hover:bg-border/30"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6 overflow-y-auto" style={{ height: 'calc(100% - 57px)' }}>
          <HabitEditor />
          <div className="border-t border-border pt-4">
            <ExportImport />
          </div>
        </div>
      </div>
    </>
  )
}
