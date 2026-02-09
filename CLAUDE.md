# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Vite dev server (localhost:5173)
npm run build    # Production build to dist/
npm run lint     # ESLint
npm run preview  # Preview production build
```

No test framework is configured.

## Architecture

Single-page React 19 app with Vite 7, Tailwind CSS v4, and localStorage persistence. No backend, no routing — one user, one page.

### State Management

All state lives in a single `useReducer` inside `src/context/AppContext.jsx`, exposed via the `useApp()` hook. Components never prop-drill state — they call `useApp()` directly.

**State shape:** `{ habits, dailyLogs: { [dateStr]: DailyLog[] }, selectedDate, initialized }`

**Key reducer actions:** `TOGGLE_HABIT` (click), `TOGGLE_MVD` (long-press/right-click for reduced XP), `SET_DATE`, `UPDATE_HABIT`, `ADD_HABIT`, `DELETE_HABIT` (soft-delete via `active: false`), `REORDER_HABITS`, `IMPORT_DATA`.

**Auto-persistence:** A 300ms debounced `useEffect` saves habits and logs to localStorage after every state change. On mount, `loadState()` reads from localStorage or seeds defaults on first run.

**Midnight auto-advance:** A 60-second interval checks if the date has changed and dispatches `SET_DATE` to roll the dashboard to the new day.

### localStorage Schema

Three keys: `kh_version` (schema version, currently `1`), `kh_habits` (Habit[]), `kh_logs` ({ dateStr: DailyLog[] }). First run seeds from `DEFAULT_HABITS` in `src/constants/habits.js`.

### Scoring & Streaks (`src/utils/scoring.js`)

Pure functions, no side effects. Key functions:

- `getApplicableHabits(habits, dateStr)` — filters by weekday/weekend + special-day logic (h10 = Friday only, h11 = Sunday only). These are hardcoded ID checks.
- `calculateDaySummary()` — computes XP totals and day classification (Perfect ≥100%, Strong ≥80%, MVD ≥40%, Weak >0%, Zero = 0%).
- `calculateStreaks()` — walks backward from today counting consecutive MVD+ days. **Grace day rule:** 1 miss per ISO week doesn't break the streak. Grace resets on week boundary.

Thresholds are constants: `MVD_THRESHOLD = 40`, `STRONG_THRESHOLD = 80` (in `src/constants/habits.js`).

### Date Handling (`src/utils/dates.js`)

All dates are `YYYY-MM-DD` strings in local timezone via `toLocaleDateString('en-CA')`. Date constructors always append `T12:00:00` to avoid timezone offset issues. Comparisons are string-based.

### Tailwind v4 Theming

Tailwind v4 uses `@theme` in `src/index.css` instead of `tailwind.config.js`. Theme colors become utility classes directly: `bg-bg`, `text-accent`, `border-border`, `text-muted`, etc. Custom keyframe animations (`golden-pulse`, `fire-pulse`, `fade-in`, `slide-down`) are defined in the same file.

The Vite plugin is `@tailwindcss/vite` (not PostCSS).

### Interaction Pattern: MVD Toggle

`HabitRow` uses pointer events (`onPointerDown`/`onPointerUp`/`onPointerLeave`) with a 500ms timer to distinguish click (full XP toggle) from long-press (MVD toggle). Right-click (`onContextMenu`) also triggers MVD. This is the most complex interaction in the app.

### Toast System

`LevelUpToast` and `StreakToast` are mounted at the top of `App.jsx`. They track previous values via refs and self-manage visibility with auto-dismiss timers. They are not controlled by parent state.

### Motivation Messages (`src/constants/messages.js`)

`getMotivationMessage()` follows strict priority: level-up > streak milestone (60/30/14/7) > broken streak > daily milestone (100%/80%/50%/first) > zero day. Messages are randomized within pools to avoid repetition.

## PRD

`prd-habit-tracker.md` contains the full product requirements including all default habits, XP values, level thresholds, UI spec, and celebration messages. Reference it for any product questions.
