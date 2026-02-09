# PRD: Keystone Habits — Gamified Tracking Dashboard

**Author:** Jim (NWA Boost)  
**Date:** February 9, 2026  
**Build Tool:** Claude Code  
**Stack:** React + Tailwind CSS + Supabase (or localStorage MVP)  
**Status:** Ready to Build

---

## 1. Product Overview

### What This Is
A single-page gamified habit tracking dashboard designed for one user (Jim) to track daily keystone habits, accumulate XP, maintain streaks, and visualize consistency over time. The system enforces the "Keystone Habit System" — 8 non-negotiable daily habits with weekday/weekend rule variants and a Minimum Viable Day fallback.

### Core Problem It Solves
Jim's #1 failure mode is **uncommitted motion** — context switching, decision avoidance, and blurred work/life boundaries. This dashboard creates a daily scoreboard that makes consistency visible, streaks painful to break, and "zero days" impossible to ignore.

### Design Philosophy
- **Calm, not cluttered.** This is a tool for someone who over-complicates things. The UI must be dead simple.
- **Game mechanics, not game aesthetics.** XP, streaks, and levels — but no cartoon characters or confetti overload. Think: dark, refined, progress-forward.
- **Decision-free.** The dashboard tells Jim what to do today. He checks boxes. That's it.

---

## 2. Dashboard Structure

### 2.1 Layout (Single Page, 4 Sections)

```
┌─────────────────────────────────────────────────┐
│  HEADER BAR                                      │
│  [Today's Date] [Day Type: Weekday/Weekend]      │
│  [Current Level + XP Bar] [Global Streak: 🔥 N]  │
├─────────────────────────────────────────────────┤
│                                                   │
│  SECTION 1: TODAY'S HABITS                        │
│  ┌───────────────────────────────────────────┐   │
│  │ ☐ Habit Name          [XP Badge]  [Time]  │   │
│  │ ☐ Habit Name          [XP Badge]  [Time]  │   │
│  │ ... (8 habits for weekday, adjusted wknd)  │   │
│  │                                             │   │
│  │ [═══════════════░░░░░] 65% — 130/200 XP    │   │
│  │                                             │   │
│  │ 💬 "You've knocked out the hard one. Keep  │   │
│  │     going." (contextual motivation)         │   │
│  └───────────────────────────────────────────┘   │
│                                                   │
│  SECTION 2: WEEK VIEW                             │
│  ┌───────────────────────────────────────────┐   │
│  │  Mon  Tue  Wed  Thu  Fri  │ Sat  Sun       │   │
│  │  ✅   ✅   🟡   ⬜   ⬜  │  ⬜   ⬜        │   │
│  │                                             │   │
│  │  Weekly Score: 420/1000 XP                  │   │
│  │  Weekly Streak: 3 days                      │   │
│  └───────────────────────────────────────────┘   │
│                                                   │
│  SECTION 3: MONTH VIEW                            │
│  ┌───────────────────────────────────────────┐   │
│  │  GitHub-style contribution grid             │   │
│  │  (color intensity = % of daily XP earned)   │   │
│  │                                             │   │
│  │  Monthly Score: 2,840 / 6,000 XP            │   │
│  │  Perfect Days: 8  |  MVD Days: 3            │   │
│  │  Current Streak: 11  |  Best Streak: 22     │   │
│  └───────────────────────────────────────────┘   │
│                                                   │
│  SECTION 4: SETTINGS / HABIT EDITOR (collapsed)   │
│  ┌───────────────────────────────────────────┐   │
│  │  [Edit Habits] [Adjust XP Weights]          │   │
│  │  [Toggle Weekend Mode] [Export Data]         │   │
│  └───────────────────────────────────────────┘   │
│                                                   │
└─────────────────────────────────────────────────┘
```

### 2.2 Component Breakdown

| Component | Description |
|-----------|-------------|
| **Header Bar** | Date, day type (auto-detected), level badge, global streak counter |
| **Daily Checklist** | Toggle/checkbox for each habit. Shows habit name, XP value, optional time-of-day tag (AM/PM/Anytime). Completed habits get a strike-through + subtle glow. |
| **Daily Progress Bar** | Fills as habits are checked. Shows XP earned / XP possible. Color shifts from red → amber → green as % increases. |
| **Motivation Engine** | Context-aware message below the progress bar. Changes based on % complete, time of day, and streak status. |
| **Week View** | 7-day row with status icons per day. Shows weekly XP total. Weekday vs weekend split visible. |
| **Month View** | GitHub-style heat grid. 4–5 rows of 7 columns. Color intensity maps to daily XP %. Hover shows details. |
| **Stats Panel** | Inside month view: perfect days, MVD days, current streak, best streak, monthly XP. |
| **Settings/Editor** | Collapsible panel. Edit habit names, XP weights, toggle weekend-specific habits, export data as JSON. |

---

## 3. Data Model

### 3.1 Habits Table

```typescript
interface Habit {
  id: string;                    // UUID
  name: string;                  // "Feet on floor by 7:15am"
  description: string;           // "Your day's trajectory is set in the first 30 min"
  xp: number;                    // Base XP value (e.g., 30)
  category: "health" | "productivity" | "money" | "relationship";
  timeOfDay: "morning" | "afternoon" | "evening" | "anytime";
  appliesTo: "weekday" | "weekend" | "both";
  badDayVersion: string;         // "7:30am hard ceiling"
  badDayXp: number;              // Reduced XP for MVD version (e.g., 15)
  sortOrder: number;             // Display order
  active: boolean;               // Soft delete / disable
  createdAt: string;             // ISO date
}
```

### 3.2 Daily Log Table

```typescript
interface DailyLog {
  id: string;                    // UUID
  date: string;                  // "2026-02-09" (ISO date, no time)
  habitId: string;               // FK to Habit
  completed: boolean;            // Did they do it?
  isBadDayVersion: boolean;      // Did they do the MVD version?
  xpEarned: number;              // Calculated: full XP or badDayXp
  completedAt: string | null;    // Timestamp when checked off
  note: string | null;           // Optional note
}
```

### 3.3 Day Summary Table (Derived / Cached)

```typescript
interface DaySummary {
  date: string;                  // "2026-02-09"
  dayType: "weekday" | "weekend";
  totalXpPossible: number;       // Sum of all applicable habit XP
  totalXpEarned: number;         // Sum of checked habit XP
  completionPercent: number;     // 0–100
  isPerfectDay: boolean;         // 100% completion
  isMvdDay: boolean;             // Met MVD threshold but not perfect
  isZeroDay: boolean;            // 0 habits completed
  streakDay: boolean;            // Counts toward streak (>= MVD threshold)
}
```

### 3.4 Default Habit Seed Data

```typescript
const DEFAULT_HABITS: Habit[] = [
  {
    id: "h1",
    name: "Feet on floor by 7:15am",
    description: "Day's trajectory is set in the first 30 minutes",
    xp: 30,
    category: "productivity",
    timeOfDay: "morning",
    appliesTo: "weekday",
    badDayVersion: "Up by 7:30am",
    badDayXp: 15,
    sortOrder: 1,
    active: true
  },
  {
    id: "h1w",
    name: "Out of bed by 8:30am",
    description: "No alarm required, but no sleeping past 8:30",
    xp: 20,
    category: "productivity",
    timeOfDay: "morning",
    appliesTo: "weekend",
    badDayVersion: "Up by 9am",
    badDayXp: 10,
    sortOrder: 1,
    active: true
  },
  {
    id: "h2",
    name: "Write tomorrow's Top 3 before bed",
    description: "Eliminates morning decision paralysis. One task must be the thing you're avoiding.",
    xp: 25,
    category: "productivity",
    timeOfDay: "evening",
    appliesTo: "both",
    badDayVersion: "Write 1 task — the one you're dodging",
    badDayXp: 15,
    sortOrder: 2,
    active: true
  },
  {
    id: "h3",
    name: "90-min Deep Work block before noon",
    description: "Phone in another room. No browser tabs except what you need. This is where the business gets built.",
    xp: 40,
    category: "productivity",
    timeOfDay: "morning",
    appliesTo: "weekday",
    badDayVersion: "45 min, one task, no distractions",
    badDayXp: 25,
    sortOrder: 3,
    active: true
  },
  {
    id: "h3w",
    name: "2-hour Saturday Build Block",
    description: "Sanctioned tinkering time. Guilt-free, but bounded.",
    xp: 35,
    category: "productivity",
    timeOfDay: "morning",
    appliesTo: "weekend",
    badDayVersion: "1-hour focused build session",
    badDayXp: 20,
    sortOrder: 3,
    active: true
  },
  {
    id: "h4",
    name: "Walk 20+ minutes",
    description: "Clears decision fog. Keeps the 250-day walking goal alive.",
    xp: 25,
    category: "health",
    timeOfDay: "anytime",
    appliesTo: "both",
    badDayVersion: "10 minutes around the block",
    badDayXp: 15,
    sortOrder: 4,
    active: true
  },
  {
    id: "h5",
    name: "Eat a real meal before noon",
    description: "Protein + anything. You can't make bold decisions on fumes.",
    xp: 20,
    category: "health",
    timeOfDay: "morning",
    appliesTo: "both",
    badDayVersion: "Protein shake or bar — 5 minutes",
    badDayXp: 10,
    sortOrder: 5,
    active: true
  },
  {
    id: "h6",
    name: "Hard shutdown at 6:30pm",
    description: "Laptop closed, notifications off. Your wife gets predictable, present time.",
    xp: 30,
    category: "relationship",
    timeOfDay: "evening",
    appliesTo: "weekday",
    badDayVersion: "Close work tabs — Slack, n8n, email",
    badDayXp: 15,
    sortOrder: 6,
    active: true
  },
  {
    id: "h7",
    name: "No YouTube/AI after 10:30pm",
    description: "This is the #1 thing stealing your morning. Late-night ideas cost 90 min of sleep.",
    xp: 30,
    category: "health",
    timeOfDay: "evening",
    appliesTo: "both",
    badDayVersion: "Phone charges in another room by 10:30",
    badDayXp: 20,
    sortOrder: 7,
    active: true
  },
  {
    id: "h8",
    name: "Lights out by 11:30pm",
    description: "The keystone of the keystones. Protect sleep and habits 1–7 are 3x easier.",
    xp: 30,
    category: "health",
    timeOfDay: "evening",
    appliesTo: "both",
    badDayVersion: "Midnight hard ceiling",
    badDayXp: 15,
    sortOrder: 8,
    active: true
  },
  {
    id: "h9",
    name: "Strength training session",
    description: "3x/week target. 150 sessions/year goal. Pick any 3 of 5 weekdays.",
    xp: 35,
    category: "health",
    timeOfDay: "anytime",
    appliesTo: "both",
    badDayVersion: "20-min bodyweight session at home",
    badDayXp: 20,
    sortOrder: 9,
    active: true
  },
  {
    id: "h10",
    name: "Friday Weekly Review (30 min)",
    description: "What shipped, what got avoided, Monday's Top 3.",
    xp: 30,
    category: "productivity",
    timeOfDay: "afternoon",
    appliesTo: "weekday",  // Friday only — handled in UI logic
    badDayVersion: "15-min quick scan + Monday's #1 task",
    badDayXp: 15,
    sortOrder: 10,
    active: true
  },
  {
    id: "h11",
    name: "Sunday Marriage Meeting",
    description: "30–60 min. Calendar review, one date planned, anything unresolved.",
    xp: 30,
    category: "relationship",
    timeOfDay: "evening",
    appliesTo: "weekend",  // Sunday only — handled in UI logic
    badDayVersion: "15-min calendar sync + one thing planned",
    badDayXp: 15,
    sortOrder: 11,
    active: true
  }
];
```

---

## 4. Scoring Logic

### 4.1 XP System

| Concept | Rule |
|---------|------|
| **Full Completion** | Check habit → earn full XP value |
| **Bad Day / MVD Version** | Long-press or toggle "MVD mode" on a habit → earn reduced `badDayXp` |
| **Daily XP Possible** | Sum of all XP for habits that apply to today's day type |
| **Daily XP Earned** | Sum of XP from all completed habits (full or MVD) |
| **Completion %** | `(xpEarned / xpPossible) * 100` |

### 4.2 Day Classification

| Day Type | Rule |
|----------|------|
| **Perfect Day** ⭐ | 100% of applicable habits completed (full or MVD) |
| **Strong Day** ✅ | ≥ 80% of daily XP earned |
| **MVD Day** 🟡 | ≥ 40% of daily XP earned (meets Minimum Viable Day threshold) |
| **Weak Day** 🟠 | > 0% but < 40% |
| **Zero Day** ❌ | 0 habits completed — streak breaks |

### 4.3 Streak Rules

| Streak Type | Rule |
|-------------|------|
| **Daily Streak** | Consecutive days with at least MVD threshold (≥ 40% XP). A zero day breaks it. |
| **Perfect Streak** | Consecutive perfect days (tracked separately, shown as bonus stat) |
| **Weekly Streak** | Consecutive weeks where ≥ 4 of 5 weekdays hit MVD threshold |

**Streak Recovery:** One "grace day" per week. If you miss one day but the rest of the week hits MVD+, the streak doesn't break. This prevents the "I missed Monday so the week is ruined" spiral.

### 4.4 Leveling System

| Level | XP Required | Title |
|-------|-------------|-------|
| 1 | 0 | Operator |
| 2 | 500 | Builder |
| 3 | 1,500 | Architect |
| 4 | 3,500 | Commander |
| 5 | 7,000 | Machine |
| 6 | 12,000 | Calm Machine |
| 7 | 20,000 | Inevitable |
| 8 | 35,000 | Legendary |
| 9 | 55,000 | Generational |
| 10 | 80,000 | Immortal |

XP is cumulative and never resets. Levels are lifetime achievement. At ~200 XP/day average, Level 5 ("Machine") takes ~35 days. Level 6 ("Calm Machine") takes ~60 days. Level 10 takes over a year of consistency.

### 4.5 Celebration Messages

Messages are contextual based on state:

**On habit check-off:**
- First habit of the day: "First one down. Momentum is real."
- The "avoiding" task: "That was the hard one. The rest is downhill."
- Deep work block: "90 minutes protected. That's where the money is."

**On daily milestones:**
- 50% daily XP: "Halfway. You're already ahead of yesterday's version of you."
- 80% daily XP: "Strong day locked in. Finish it."
- 100% daily XP: "Perfect day. This is who you are now."

**On streaks:**
- 7-day streak: "One week. The compound effect is starting."
- 14-day streak: "Two weeks. You're rewiring the default."
- 30-day streak: "30 days. This isn't a streak anymore — it's identity."
- 60-day streak: "60 days. You are the Calm Machine."

**On level-ups:**
- Display level title prominently with a brief animation
- "Level 5: Machine. Your days run themselves now."

**On broken streaks:**
- No shaming. Just: "Streak reset. Yesterday is data, not destiny. MVD today and you're back."

---

## 5. UI/UX Design Spec

### 5.1 Aesthetic Direction

**Theme:** Dark, refined, utilitarian. Think: a cockpit instrument panel for your life. Not a toy — a tool.

- **Background:** Deep charcoal/near-black (#0F1117)
- **Primary accent:** Warm amber/gold (#F5A623) — progress, XP, streaks
- **Secondary accent:** Cool teal (#2DD4BF) — health habits
- **Success:** Muted green (#22C55E)
- **Warning/MVD:** Amber (#EAB308)
- **Danger/Zero:** Muted red (#EF4444)
- **Text:** Off-white (#E5E7EB) primary, muted gray (#6B7280) secondary
- **Cards:** Slightly elevated dark surface (#1A1D27) with subtle border (#2A2D37)

**Typography:**
- Display/headers: JetBrains Mono or IBM Plex Mono (technical, intentional)
- Body: IBM Plex Sans (clean, readable)

**Motion:**
- Checkbox toggles: snappy 150ms with subtle scale bounce
- Progress bar: smooth 300ms ease-out fill
- Level-up: brief golden pulse animation on header
- Streak counter: subtle fire emoji pulse on increment

### 5.2 Interaction Patterns

| Action | Behavior |
|--------|----------|
| **Tap checkbox** | Toggle full completion. Habit row gets subtle amber glow + strikethrough. XP animates into progress bar. |
| **Long-press / right-click checkbox** | Toggle MVD version. Shows reduced XP. Badge changes to "MVD" indicator. |
| **Tap day in week view** | Navigates to that day's log (can retroactively fill in yesterday if missed) |
| **Hover month grid cell** | Tooltip with date, XP earned, day classification |
| **Settings gear icon** | Slides open habit editor panel |

### 5.3 Responsive Behavior

- **Desktop (primary):** Full dashboard, all 4 sections visible
- **Tablet:** Stacked sections, week + month views scroll horizontally
- **Mobile:** Single column, collapsible sections, bottom nav for quick toggle between Today / Week / Month

---

## 6. Build Plan (Claude Code)

### Phase 1: Core MVP (Session 1 — ~2 hours)

**Goal:** Working daily checklist with XP scoring

1. **Scaffold React app** with Tailwind CSS
2. **Seed default habits** from the constant data above
3. **Build `<DailyChecklist />` component**
   - Render today's applicable habits (weekday vs weekend auto-detected)
   - Checkbox toggles with full XP
   - MVD toggle (secondary action)
   - Daily progress bar with XP counter
4. **localStorage persistence** — save daily logs, load on refresh
5. **Day classification logic** — calculate Perfect/Strong/MVD/Weak/Zero

**Deliverable:** Can check off habits, see progress bar fill, data persists on refresh.

### Phase 2: Streaks + Week View (Session 2 — ~1.5 hours)

**Goal:** Streak tracking and weekly visibility

1. **Build streak calculation engine**
   - Daily streak (MVD+ threshold)
   - Grace day logic (1 miss/week allowed)
   - Track current + best streak
2. **Build `<WeekView />` component**
   - 7-day row with status icons
   - Weekly XP total
   - Click-to-navigate to past days
3. **Retroactive entry** — allow checking off yesterday's habits
4. **Add streak counter to header**

**Deliverable:** Streaks work, week view shows 7-day history, can edit yesterday.

### Phase 3: Month View + Leveling (Session 3 — ~1.5 hours)

**Goal:** Long-term visibility and gamification

1. **Build `<MonthGrid />` component**
   - GitHub-style heat map (color intensity = completion %)
   - Hover tooltips with daily details
   - Monthly stats: perfect days, MVD days, streaks
2. **Implement leveling system**
   - Cumulative XP tracking
   - Level thresholds from spec
   - Level badge in header with title
3. **Build `<StatsPanel />`**
   - Current level + XP to next level
   - Current streak / best streak
   - Monthly XP total
   - Perfect day count

**Deliverable:** Full month visibility, levels working, stats panel populated.

### Phase 4: Celebration Engine + Polish (Session 4 — ~1 hour)

**Goal:** Motivation and delight

1. **Build motivation message system**
   - Context-aware messages based on state (see Section 4.5)
   - Rotate messages to avoid repetition
   - Time-of-day awareness (morning encouragement vs evening wrap-up)
2. **Level-up animation** — golden pulse + title reveal
3. **Streak milestone celebrations** — brief toast/banner at 7/14/30/60 days
4. **Broken streak handling** — compassionate reset message
5. **UI polish pass** — spacing, transitions, hover states, dark theme refinement

**Deliverable:** Dashboard feels alive, motivating, and polished.

### Phase 5: Settings + Habit Editor (Session 5 — ~1 hour)

**Goal:** Customization without complexity

1. **Build `<HabitEditor />` panel**
   - Add/edit/disable habits
   - Adjust XP weights
   - Set day-type applicability
   - Edit MVD versions
   - Drag to reorder
2. **Weekend toggle** — quick switch to see weekend-specific habits
3. **Data export** — JSON download of all logs
4. **Data import** — JSON upload to restore

**Deliverable:** Fully customizable, data portable.

### Phase 6 (Future): Supabase Backend

**Goal:** Persistent, cross-device, queryable

1. Migrate from localStorage to Supabase tables (habits, daily_logs, day_summaries)
2. Auth (magic link or OAuth) for single-user access
3. Real-time sync across devices
4. Supabase Edge Functions for weekly email summary
5. API endpoint for n8n integration (daily reminder workflow, weekly report)

---

## 7. Integration Opportunities (Post-MVP)

| Integration | Purpose |
|-------------|---------|
| **n8n workflow** | Morning reminder at 7am, evening check-in at 9pm, weekly summary on Friday |
| **Notion database** | Mirror habit data for long-term journaling |
| **Apple Health / Google Fit** | Auto-complete walking habit via step count |
| **Calendar (Google/Outlook)** | Auto-detect if deep work block was actually protected |
| **Supabase + OpenAI** | Weekly AI-generated coaching note based on patterns |

---

## 8. Success Metrics

After 30 days of use:

| Metric | Target |
|--------|--------|
| Zero days per month | ≤ 2 |
| MVD+ days per month | ≥ 25 |
| Perfect days per month | ≥ 12 |
| Longest streak | ≥ 14 days |
| Deep work blocks completed (weekdays) | ≥ 16 of 20 |
| Strength sessions logged | ≥ 10 |

---

## 9. What This PRD Does NOT Include (By Design)

- **No social features.** This is a personal accountability tool, not a social app.
- **No complex habit scheduling.** (e.g., "only on Tuesdays"). Keep it simple: weekday, weekend, or both. Special days (Friday review, Sunday meeting) are handled in UI display logic, not data model complexity.
- **No notification system in V1.** Rely on n8n for external reminders. The dashboard is a pull tool, not a push tool.
- **No analytics dashboard.** The month grid + stats panel is enough. If you're staring at analytics, you're not doing the habits.

---

*"You don't need more ideas — you need to pick the offer and sell it 10 times."*  
*This PRD is the offer equivalent for your daily operating system. Build it. Ship it. Use it.*
