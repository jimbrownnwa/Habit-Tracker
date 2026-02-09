import { useRef, useState } from 'react'
import { useApp } from '../context/AppContext'
import { exportData, importData, clearAllData } from '../utils/storage'
import { today } from '../utils/dates'

export default function ExportImport() {
  const { state, dispatch } = useApp()
  const fileInputRef = useRef(null)
  const [status, setStatus] = useState(null)
  const [confirmReset, setConfirmReset] = useState(false)

  function handleExport() {
    const json = exportData(state.habits, state.dailyLogs)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `keystone-habits-backup-${today()}.json`
    a.click()
    URL.revokeObjectURL(url)
    setStatus('Data exported successfully.')
    setTimeout(() => setStatus(null), 3000)
  }

  function handleImport(e) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = importData(event.target.result)
        if (window.confirm('This will replace all current data. Continue?')) {
          dispatch({ type: 'IMPORT_DATA', habits: data.habits, dailyLogs: data.dailyLogs })
          setStatus('Data imported successfully.')
        }
      } catch (err) {
        setStatus(`Import failed: ${err.message}`)
      }
      setTimeout(() => setStatus(null), 3000)
    }
    reader.readAsText(file)

    // Reset the file input so the same file can be selected again
    e.target.value = ''
  }

  function handleReset() {
    if (!confirmReset) {
      setConfirmReset(true)
      return
    }
    clearAllData()
    window.location.reload()
  }

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-mono text-muted uppercase tracking-wider">Data</h3>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleExport}
          className="text-xs font-mono text-text bg-border hover:bg-border/70 px-3 py-1.5 rounded-lg transition-colors"
        >
          Export JSON
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-xs font-mono text-text bg-border hover:bg-border/70 px-3 py-1.5 rounded-lg transition-colors"
        >
          Import JSON
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />

        <button
          onClick={handleReset}
          className={`text-xs font-mono px-3 py-1.5 rounded-lg transition-colors ${
            confirmReset
              ? 'text-white bg-danger hover:bg-danger/80'
              : 'text-danger border border-danger/30 hover:bg-danger/10'
          }`}
        >
          {confirmReset ? 'Confirm Reset - All Data Will Be Lost' : 'Reset All Data'}
        </button>
        {confirmReset && (
          <button
            onClick={() => setConfirmReset(false)}
            className="text-xs font-mono text-muted hover:text-text px-2"
          >
            Cancel
          </button>
        )}
      </div>

      {status && (
        <div className="text-xs font-mono text-accent" style={{ animation: 'fade-in 0.3s ease-out' }}>
          {status}
        </div>
      )}
    </div>
  )
}
