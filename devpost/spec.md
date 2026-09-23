---
doc: spec
status: approved
---

# Ember — Technical Spec

## How This Works, In Plain Language
Ember is a single web page that runs entirely in the browser. There is no server and no account.

- **The model** is a handful of small, pure functions. One turns a morning check-in into today's envelope. One looks at logged days and works out how long a crash usually takes to arrive and how big it is (the *payback pattern*). One uses that pattern to project today's plan onto the next three days (the *forecast*). One suggests swaps by trying each possible change and keeping the ones that help the most.
- **The store** holds everything the user has entered — settings, today's check-in and plan, and past days — and saves it to the browser's local storage after every change. When the date changes, it moves yesterday into history.
- **The screens** (Welcome, Today, Pattern, Settings) read from the store and call the model. The forecast is recomputed on every change; it's cheap enough to be instant.

This shape keeps the kernel — the forecast — as plain testable functions separate from the UI, and keeps health data on the device.

## The Core Journey Through the System
PRD ref: `prd.md > The Core Journey`.

1. User opens the page → `store` loads from local storage → nothing saved → `Welcome` renders.
2. User picks *Explore with sample history* → `sample.generateSampleHistory()` creates 21 labelled days → store saves → `Today` renders.
3. User picks a check-in level → `forecast.envelopeFromCheckIn(level, baseline)` → store saves `today.checkIn` → `EmberOrb` shows the envelope.
4. User taps a library item or submits quick add → `quickAdd.parse(text)` returns plan items → store appends to `today.plan`.
5. On every render, `learn.fitPattern(history, baseline)` (memoised) yields `{ lagWeights, ratio, confidence }`; `forecast.projectDays(...)` returns four `DayProjection`s → `Forecast` and `WaveChart` render them; `forecast.explain(...)` produces the cause sentence.
6. If today is over the envelope, `swaps.suggest(...)` simulates each candidate change through `projectDays` and returns the top three → user applies one → store updates `today.plan` → forecast re-renders.
7. User opens Pattern → `HistoryChart` draws history and overspend→dip arcs from `learn.findPaybackLinks(...)`; stat cards read the fitted pattern.
8. Next day, `store.rollover()` moves `today` into `history` with its spend and envelope.

## Stack
- **TypeScript 5 + React 19** — component model suits a highly interactive single page. [react.dev](https://react.dev)
- **Vite** — instant dev server and a static production build with no server required. [vite.dev](https://vite.dev)
- **Motion** (`motion/react`) — spring animations for the orb, numbers and layout changes, with reduced-motion support. [motion.dev](https://motion.dev)
- **Hand-written CSS with design tokens** — full control over the look; no utility framework.
- **Self-hosted variable fonts** via Fontsource (Fraunces, Inter) — no third-party font requests, works offline. [fontsource.org](https://fontsource.org)
- **Vitest** — unit tests for the model (forecast, learning, quick add, swaps). [vitest.dev](https://vitest.dev)
- Charts are hand-drawn SVG; no chart library needed for two small charts.

## Where It Runs and How Someone Tries It
- Runtime: any modern browser. Node 20+ for development.
- Install and start: `npm install` then `npm run dev`, open `http://localhost:5173`.
- Tests: `npm test`. Production build: `npm run build` (outputs static files to `dist/`).
- No API keys or environment variables.
- Demo recording: run locally or use the deployed site; choose *Explore with sample history*.
- Deployment: static hosting (Vercel). `vercel.json` sets the build output and long-lived caching for hashed assets.

## Look and Feel
From `prd.md > Look and Feel`.
- Tokens on `:root` for both themes (`[data-theme="night"]` default, `[data-theme="day"]`).
- Night: background `#0f0c0a`, raised surfaces `#18130f` / `#1f1914`, text `#f4ece2`, muted `#a89a8a`. Day: background `#f7f1e8`, surfaces `#fffaf3`, text `#2a211a`.
- Ember gradient `#ff6a2b → #ffb347 → #ffd98a`; rest teal `#5ec8b5`; risk rose `#e8677a`; comfort green-gold `#c9d67a` used sparingly.
- Fraunces (variable, optical sizing, soft) for headlines and numerals; Inter for UI.
- Radius 20–28px on cards, soft inner highlights and glow instead of hard borders; 8px spacing grid; minimum 44px tap targets.
- Ember orb: layered radial gradients + blurred glow, gentle flicker animation; brightness and scale map to remaining/total.
- Motion via springs; `prefers-reduced-motion` disables flicker and number easing.

## Components

### Model: Activities
`src/model/activities.ts` — the library: id, name, kind, base cost, base minutes (or none), keywords for quick add, and an optional lighter alternative id. Rest items carry negative cost. Cost scales linearly with minutes.
PRD ref: `prd.md > Plan Builder`.

### Model: Forecast
`src/model/forecast.ts` — `envelopeFromCheckIn`, `planCost`, `projectDays` and `explain`.
Projection for day `t+k` (k = 0..3): `baseline − owed(t+k) − ratio · Σ over(t) · w[k]` where `over(t) = max(0, planCost − envelope)`, `w` are lag weights for 1..3 days (k=0 gets none), and `owed` is payback from logged past days still landing. Today's projected envelope is the check-in envelope if present, else `baseline − owed(t)`. Status: *Crash likely* below 55% of baseline, *Tight* below 75%, else *Comfortable*.
PRD ref: `prd.md > Payback Forecast`, `prd.md > Morning Check-in`.

### Model: Learning
`src/model/learn.ts` — `fitPattern(history, baseline)`: for each logged day, the dip is `baseline − envelope`; fit `dip(d) ≈ Σ_k β_k · over(d−k)` for k=1..3 by least squares (3×3 normal equations with a small ridge term), clamp β ≥ 0, blend with defaults by confidence (`n/21`, capped at 1). Returns `lagWeights` (β normalised), `ratio` (Σβ), `peakLagDays`, `confidence`. Under 7 days → defaults (`w = [0.45, 0.4, 0.15]`, ratio 1.5). `findPaybackLinks` pairs each over-budget day with the largest dip in the following 1–3 days for the chart arcs.
PRD ref: `prd.md > Pattern Learning`.

### Model: Quick Add
`src/model/quickAdd.ts` — splits on commas, "and", "then", newlines; extracts durations (`1h`, `1.5 hours`, `45 min`, `half an hour`); matches the phrase against activity keywords (longest keyword wins); falls back to a custom activity (cost 2 per 30 min).
PRD ref: `prd.md > Plan Builder`.

### Model: Swaps
`src/model/swaps.ts` — candidate changes: lighter alternative, halve duration and add a 20-minute rest, move item to a later day. Each is simulated with `projectDays`; ranked by improvement to the worst future day, then by fewest spoons removed; top three returned with a human label and effect.
PRD ref: `prd.md > Swaps`.

### Model: Sample Data
`src/model/sample.ts` — deterministic (seeded) 21-day history generated from a known pattern (peak lag 2 days, ratio ≈ 1.7) plus noise, with a realistic mix of over-budget days. Flagged `sample: true`.
PRD ref: `prd.md > Welcome and Setup`.

### Store
`src/state/store.tsx` — React context + reducer. State: `{ version, settings: { baseline, theme }, sample, today: { date, checkIn, plan, moved }, history: DayLog[] }`. Saves to `localStorage` (`ember:v1`) on change, wrapped in try/catch; `rollover()` on load and on focus when the date has changed.
PRD ref: `prd.md > Persistence and Privacy`.

### UI: Welcome
`src/components/Welcome.tsx`. PRD ref: `prd.md > Welcome and Setup`.

### UI: Today
`src/components/Today.tsx` composing `CheckIn`, `EmberOrb`, `PlanBuilder` (`QuickAdd`, `ActivityLibrary`, plan list), `Forecast` (`DayCard`, `WaveChart`, explanation) and `Swaps`.
PRD ref: `prd.md > Morning Check-in`, `prd.md > Plan Builder`, `prd.md > Payback Forecast`, `prd.md > Swaps`.

### UI: Pattern
`src/components/Pattern.tsx` with `HistoryChart`. PRD ref: `prd.md > Pattern Learning`.

### UI: Shell and Settings
`src/App.tsx`, `src/components/Header.tsx`, `src/components/SettingsSheet.tsx`. PRD ref: `prd.md > Screens and Layout`, `prd.md > Persistence and Privacy`.

## Data Model
```ts
type Kind = 'physical' | 'mental' | 'social' | 'sensory' | 'rest'
interface PlanItem { id: string; activityId: string | null; name: string; kind: Kind; minutes: number | null; cost: number }
interface DayLog { date: string; checkIn: 1|2|3|4|5; envelope: number; spent: number; items: string[] }
interface Today { date: string; checkIn: 1|2|3|4|5 | null; plan: PlanItem[]; moved: PlanItem[] }
```
All in one `localStorage` key. Leaving and returning restores everything; a new date rolls `today` into `history` (only if it had a check-in or a plan). History keeps the latest 60 days.

## File Structure
```
ember/
├── index.html                 # app shell, meta, theme-color, icons
├── public/
│   ├── favicon.svg            # ember mark
│   ├── og.png                 # social preview
│   └── manifest.webmanifest   # installable app metadata
├── src/
│   ├── main.tsx               # entry: fonts, styles, providers
│   ├── App.tsx                # routing between Welcome / Today / Pattern
│   ├── model/                 # pure logic — the kernel lives here
│   │   ├── types.ts
│   │   ├── activities.ts
│   │   ├── forecast.ts
│   │   ├── learn.ts
│   │   ├── quickAdd.ts
│   │   ├── swaps.ts
│   │   ├── sample.ts
│   │   ├── dates.ts
│   │   └── *.test.ts          # Vitest unit tests
│   ├── state/store.tsx        # state, persistence, rollover
│   ├── components/            # UI pieces listed under Components
│   └── styles/                # tokens.css, base.css, component styles
├── docs/                      # README screenshots
├── devpost/                   # scope, PRD, spec, checklist, app map
├── vercel.json
└── package.json
```

## External Services and Dependencies
None at runtime. npm packages only (React, Motion, Fontsource, Vite, Vitest). Hosting on Vercel's free static tier; no keys.

## Important Failure Modes
- **Local storage unavailable (private mode, blocked)** → app still works for the session; nothing crashes; data just isn't kept.
- **Corrupt or old saved data** → version check; on mismatch or parse failure, start from the Welcome screen rather than crashing.
- **Degenerate fit (no over-budget days, singular matrix)** → fall back to default pattern with "Learning" confidence.

## What Was Simplified and Why
- **Linear payback model** instead of a physiological model — transparent, explainable in one sentence, and learnable from a few weeks of data. A fuller version would add symptom severity and recovery curves.
- **Keyword quick add** instead of an LLM — private and instant. A fuller version could optionally use an on-device model.
- **"Move to later"** records the move rather than scheduling it — a full multi-day planner is deferred.

## Decisions and Open Issues
- Browser-only, local storage, no backend — privacy and zero friction; tradeoff: no cross-device sync.
- React + Vite + Motion — best fit for a very interactive, animated single page; tradeoff: a JS build step.
- Uncertainty examined: *can a simple least-squares fit really recover a person's crash lag from ~3 weeks of noisy data?* Checked in the build with a unit test that generates noisy history from a known pattern (peak lag 2) and asserts the fit recovers peak lag 2 and a ratio within ±0.5.
- Open: default parameters are research-informed, not clinically validated — stated in the disclaimer.
