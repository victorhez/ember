---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast

## Slices

- [ ] **1. A planned day shows its payback on the next three days**
  Becomes usable: A running app where adding activities to today's plan lowers the projected envelope on the following days, with Crash likely states.
  Why now: This is the kernel. Proving the forecast end to end first — scaffold, model, store, UI — means everything else is built around something that already works.
  PRD ref: `prd.md > The Core Journey` (steps 3–4), `prd.md > Payback Forecast`, `prd.md > Plan Builder`
  Spec ref: `spec.md > Model: Activities`, `spec.md > Model: Forecast`, `spec.md > Store`, `spec.md > UI: Today`, `spec.md > File Structure`
  Build: Scaffold Vite + React + TS, install Motion/Fontsource/Vitest, design tokens and base styles, activity library, forecast model with tests, store with persistence, Today screen with check-in, ember orb, plan list, library and four day cards.
  Verify (mechanical): `npm test` passes forecast tests; `npm run build` succeeds; in the browser, adding activities past the envelope turns a future day to Crash likely.
  Learner check: Open the app, check in, add activities until you pass your envelope, and watch a later day go dark.
  Commit: `Forecast the payback of today's plan across the next three days`

- [ ] **2. Ember learns your pattern from history**
  Becomes usable: Sample history loads from the Welcome screen; the forecast uses a lag and ratio fitted from it; the Pattern screen shows history with overspend→crash arcs and learned stats.
  Why now: Personal learning is the second half of the kernel and the source of the most memorable visual.
  PRD ref: `prd.md > Welcome and Setup`, `prd.md > Pattern Learning`
  Spec ref: `spec.md > Model: Learning`, `spec.md > Model: Sample Data`, `spec.md > UI: Welcome`, `spec.md > UI: Pattern`
  Build: Least-squares fit with defaults and confidence, seeded sample generator, payback links, Welcome screen, Pattern screen with stat cards and SVG history chart, navigation.
  Verify (mechanical): Unit test recovers peak lag 2 and ratio within ±0.5 from generated history; build passes; Pattern screen renders arcs.
  Learner check: Choose Explore with sample history, open Pattern, and see arcs linking over-budget days to the crash two days later.
  Commit: `Learn personal payback lag and ratio from logged history`

- [ ] **3. Quick add, swaps and explanations close the loop**
  Becomes usable: Typing a day in plain words fills the plan; a risky plan explains its cause and offers swaps that visibly fix the forecast.
  Why now: Turns the forecast from a warning into an action — the demo's resolution beat.
  PRD ref: `prd.md > Plan Builder`, `prd.md > Swaps`, `prd.md > Payback Forecast`
  Spec ref: `spec.md > Model: Quick Add`, `spec.md > Model: Swaps`, `spec.md > UI: Today`
  Build: Quick-add parser with tests, swap simulation and ranking with tests, explanation sentence, wave chart, swap cards with apply.
  Verify (mechanical): Tests for parsing ("shower, 1h zoom call and groceries" → 3 items, 60 minutes) and for swaps improving the worst day pass; build passes.
  Learner check: Type "shower, groceries, 2h zoom call, birthday party" and apply a suggested swap; watch the crash clear.
  Commit: `Add quick add, crash explanations and swap suggestions`

- [ ] **4. Settings, themes, rollover and ship polish**
  Becomes usable: Night/Daylight themes, settings sheet (budget, sample data, clear data, disclaimer), date rollover, responsive layout, favicon, manifest, social preview, deploy config.
  Why now: Completes a coherent product experience once the kernel is proven.
  PRD ref: `prd.md > Screens and Layout`, `prd.md > Look and Feel`, `prd.md > Persistence and Privacy`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > UI: Shell and Settings`, `spec.md > Store`, `spec.md > Where It Runs and How Someone Tries It`
  Build: Theme toggle and tokens, settings sheet, rollover, empty states, mobile layout, icons/manifest/og image, vercel.json.
  Verify (mechanical): Build passes; browser check at desktop and 375px widths in both themes; reload preserves state; no console errors.
  Learner check: Switch themes, reload, and resize to phone width — everything should stay put and readable.
  Commit: `Add settings, themes, rollover and deployment polish`

## Hands-on Checkpoints

- [ ] Early usable behavior explored — after slice 2
- [ ] Final kick-the-tires exploration and feedback completed

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [ ] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: 
Route and stops: 
Edit outcome: 
Reflection: 
Activity mode: 

## Revisions

