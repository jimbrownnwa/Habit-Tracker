import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { uuid } from '../utils/uuid'

const CATEGORIES = ['health', 'productivity', 'money', 'relationship']
const TIMES = ['morning', 'afternoon', 'evening', 'anytime']
const APPLIES_TO = ['weekday', 'weekend', 'both']

function EditForm({ habit, onSave, onCancel }) {
  const [form, setForm] = useState({ ...habit })

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-3 p-3 bg-bg rounded-lg border border-border">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted block mb-1">Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full bg-card border border-border rounded px-2 py-1.5 text-sm text-text focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">XP</label>
          <input
            type="number"
            value={form.xp}
            onChange={(e) => handleChange('xp', Number(e.target.value))}
            className="w-full bg-card border border-border rounded px-2 py-1.5 text-sm text-text focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-muted block mb-1">Description</label>
        <input
          type="text"
          value={form.description}
          onChange={(e) => handleChange('description', e.target.value)}
          className="w-full bg-card border border-border rounded px-2 py-1.5 text-sm text-text focus:outline-none focus:border-accent"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-muted block mb-1">Category</label>
          <select
            value={form.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className="w-full bg-card border border-border rounded px-2 py-1.5 text-sm text-text focus:outline-none focus:border-accent"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">Time of Day</label>
          <select
            value={form.timeOfDay}
            onChange={(e) => handleChange('timeOfDay', e.target.value)}
            className="w-full bg-card border border-border rounded px-2 py-1.5 text-sm text-text focus:outline-none focus:border-accent"
          >
            {TIMES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">Applies To</label>
          <select
            value={form.appliesTo}
            onChange={(e) => handleChange('appliesTo', e.target.value)}
            className="w-full bg-card border border-border rounded px-2 py-1.5 text-sm text-text focus:outline-none focus:border-accent"
          >
            {APPLIES_TO.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted block mb-1">Bad Day Version</label>
          <input
            type="text"
            value={form.badDayVersion}
            onChange={(e) => handleChange('badDayVersion', e.target.value)}
            className="w-full bg-card border border-border rounded px-2 py-1.5 text-sm text-text focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">Bad Day XP</label>
          <input
            type="number"
            value={form.badDayXp}
            onChange={(e) => handleChange('badDayXp', Number(e.target.value))}
            className="w-full bg-card border border-border rounded px-2 py-1.5 text-sm text-text focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <button
          onClick={onCancel}
          className="text-xs font-mono text-muted hover:text-text px-3 py-1.5 border border-border rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(form)}
          className="text-xs font-mono text-bg bg-accent hover:bg-accent/90 px-3 py-1.5 rounded-lg transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  )
}

export default function HabitEditor() {
  const { state, dispatch } = useApp()
  const [editingId, setEditingId] = useState(null)

  const sortedHabits = [...state.habits].sort((a, b) => a.sortOrder - b.sortOrder)

  function handleSave(habit) {
    dispatch({ type: 'UPDATE_HABIT', habit })
    setEditingId(null)
  }

  function handleToggleActive(habit) {
    dispatch({ type: 'UPDATE_HABIT', habit: { ...habit, active: !habit.active } })
  }

  function handleMoveUp(habit) {
    const index = sortedHabits.findIndex((h) => h.id === habit.id)
    if (index <= 0) return
    const orderedIds = sortedHabits.map((h) => h.id)
    ;[orderedIds[index - 1], orderedIds[index]] = [orderedIds[index], orderedIds[index - 1]]
    dispatch({ type: 'REORDER_HABITS', orderedIds })
  }

  function handleMoveDown(habit) {
    const index = sortedHabits.findIndex((h) => h.id === habit.id)
    if (index >= sortedHabits.length - 1) return
    const orderedIds = sortedHabits.map((h) => h.id)
    ;[orderedIds[index], orderedIds[index + 1]] = [orderedIds[index + 1], orderedIds[index]]
    dispatch({ type: 'REORDER_HABITS', orderedIds })
  }

  function handleAddHabit() {
    const maxOrder = sortedHabits.length > 0 ? Math.max(...sortedHabits.map((h) => h.sortOrder)) : 0
    const newHabit = {
      id: uuid(),
      name: 'New Habit',
      description: '',
      xp: 20,
      category: 'productivity',
      timeOfDay: 'anytime',
      appliesTo: 'both',
      badDayVersion: 'Simplified version',
      badDayXp: 10,
      sortOrder: maxOrder + 1,
      active: true,
      createdAt: new Date().toISOString(),
    }
    dispatch({ type: 'ADD_HABIT', habit: newHabit })
    setEditingId(newHabit.id)
  }

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-mono text-muted uppercase tracking-wider">Habits</h3>

      {sortedHabits.map((habit) => (
        <div key={habit.id}>
          {editingId === habit.id ? (
            <EditForm
              habit={habit}
              onSave={handleSave}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div
              className={`flex items-center gap-2 p-2 rounded-lg ${
                habit.active ? 'hover:bg-border/20' : 'opacity-40'
              }`}
            >
              {/* Reorder buttons */}
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => handleMoveUp(habit)}
                  className="text-[10px] text-muted hover:text-text px-1"
                >
                  {'\u25B2'}
                </button>
                <button
                  onClick={() => handleMoveDown(habit)}
                  className="text-[10px] text-muted hover:text-text px-1"
                >
                  {'\u25BC'}
                </button>
              </div>

              {/* Habit name */}
              <div className="flex-1 min-w-0">
                <span className="text-sm text-text truncate block">{habit.name}</span>
                <span className="text-xs text-muted">
                  {habit.xp} XP &middot; {habit.appliesTo} &middot; {habit.timeOfDay}
                </span>
              </div>

              {/* Actions */}
              <button
                onClick={() => setEditingId(habit.id)}
                className="text-xs text-muted hover:text-accent transition-colors px-2 py-1"
              >
                Edit
              </button>
              <button
                onClick={() => handleToggleActive(habit)}
                className={`text-xs px-2 py-1 transition-colors ${
                  habit.active ? 'text-muted hover:text-danger' : 'text-success hover:text-success/80'
                }`}
              >
                {habit.active ? 'Disable' : 'Enable'}
              </button>
            </div>
          )}
        </div>
      ))}

      <button
        onClick={handleAddHabit}
        className="w-full text-xs font-mono text-accent hover:text-accent/80 py-2 border border-dashed border-accent/30 rounded-lg transition-colors"
      >
        + Add New Habit
      </button>
    </div>
  )
}
