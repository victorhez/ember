---
doc: prd
status: approved
---

# Ember — Product Requirements

A forward-looking pacing planner for people with energy-limiting illness (ME/CFS, Long COVID, fibromyalgia) that forecasts the delayed crash of a planned day before it happens.
Source: `scope.md > The Unique Kernel`, `scope.md > Who It's For`.

## The Core Journey
Source: `scope.md > The Core Loop`, `scope.md > What "Working" Looks Like`.

1. **Arrive.** First visit shows a short welcome: what Ember does in one sentence, and two choices — *Explore with sample history* (21 days of realistic, clearly labelled sample data) or *Start fresh* (set your usual good-day budget in spoons).
2. **Check in.** The Today screen asks "How's your body this morning?" with five plainly-worded levels. Choosing one sets today's envelope (e.g. 9 of a usual 12 spoons). The ember orb lights to match.
3. **Plan.** Add activities by tapping the library or typing a sentence into quick add ("shower, groceries, 1h zoom call, cook dinner"). Each shows its spoon cost; durations adjust cost; rest breaks give a little back. The orb dims as the plan fills and shows what's left.
4. **See ahead.** Beside the plan, a four-day forecast (Today, Tomorrow, and the two days after) updates on every change. Going over today's envelope doesn't hurt today — it lowers the projected envelope 1–3 days later, according to the user's learned payback pattern. Days projected below the crash line are marked *Crash likely*, with a sentence explaining which activity caused it and when it lands.
5. **Adjust.** Ember offers up to three swaps (lighter alternative, split with a rest, move to another day). Applying one updates the plan and the forecast instantly; the dimmed future day relights.
6. **Learn.** The Pattern screen shows the logged history: daily spend against envelope, with arcs linking each over-budget day to the dip that followed. It states the learned lag ("your crashes typically land ~2 days later") and payback ratio ("each spoon over costs ~1.7 later"), which feed the forecast.
7. **Return.** Everything is saved on the device. Tomorrow, today's plan becomes part of the history, and the model sharpens.

Success: the user sees a future crash caused by today's plan, takes a swap, and sees it resolve — before living it.

## Screens and Layout

- **Welcome** (first run only): full-screen, centred, the ember motif, headline, one-line explanation, two actions, a privacy line ("Your data never leaves this device").
- **Today** (default): header with date, navigation (Today / Pattern), theme toggle and settings. On wide screens two columns — left: check-in, ember orb and plan; right: forecast, explanation and swaps. On phones, a single column in that order.
- **Pattern**: learned-pattern stat cards on top, the history chart beneath, then a short "how Ember learns" note.
- **Settings sheet** (slide-over): usual budget, theme, load sample history, clear all data (with confirmation), and the medical disclaimer.

## Look and Feel
Source: `scope.md > Inspiration & Identity`.

- **Mood:** calm, warm, humane, low-stimulation. Tending a fire, not draining a battery.
- **Theme:** dark-first ("Night") with a warm near-black background; a soft cream "Daylight" theme. Respect the system preference; remember the manual choice.
- **Colour:** ember orange→amber gradient for energy; a soft teal for rest and recovery; a muted rose-red for crash risk. Never saturated alarm red.
- **Type:** an editorial variable serif for headlines and big numbers (Fraunces); a clean humanist sans for UI text (Inter).
- **Motion:** slow, soft glow and flicker on the ember; numbers ease between values. All motion disabled under `prefers-reduced-motion`.
- **Copy:** kind, direct, never guilt-tripping. "Your body sends the bill later" not "You failed your budget".
- **Avoid:** generic dashboard chrome, loud gradients on everything, emoji-heavy UI, tiny tap targets.

## Features and Behavior

### Welcome and Setup
- As someone opening Ember for the first time, I want to try it immediately or start with my own numbers.
  - [ ] First visit shows the Welcome screen; later visits go straight to Today.
  - [ ] *Explore with sample history* loads 21 days of sample data and a visible "Sample data" badge appears in the header.
  - [ ] *Start fresh* asks for the usual good-day budget (default 12, range 4–30) and opens Today with no history.

### Morning Check-in
- As Maya, I want a ten-second check-in to set today's budget.
  - [ ] Five levels: Depleted, Low, Steady, Good, Strong — each with a one-line description and the resulting envelope in spoons.
  - [ ] Choosing a level sets today's envelope and shows it on the ember orb; it can be changed later via "Change".
  - [ ] Before check-in, the plan still works using the forecast envelope for today, and a gentle prompt invites the check-in.

### Plan Builder
- As Maya, I want to lay out my day and see what it costs.
  - [ ] The activity library is grouped by kind (Physical, Mental, Social, Sensory, Rest) with a search field; each item shows its cost.
  - [ ] Tapping an item adds it to the plan; each plan item has duration controls (where duration applies) that rescale cost, and a remove control.
  - [ ] Rest items have negative cost (they give spoons back) and are styled in teal.
  - [ ] Quick add accepts free text; comma/"and"/newline separated phrases are matched to library items, durations like "1h", "45 min", "2 hours" are understood, and unrecognised phrases are added as a custom activity with a default moderate cost that the user can adjust.
  - [ ] The ember orb shows spoons remaining; it dims proportionally and turns rose when over the envelope. A thin gauge shows the 80% "comfort zone" pacing target.

### Payback Forecast
The kernel. Source: `scope.md > The Unique Kernel`.
- As Maya, I want to see how today's plan will feel over the next three days.
  - [ ] Four day cards (Today, +1, +2, +3) show projected envelope in spoons, a small ember, and a status: Comfortable, Tight, or Crash likely.
  - [ ] The projection combines (a) payback still owed from logged past days and (b) payback from today's planned overspend, distributed by the learned lag.
  - [ ] Changing the plan updates every card immediately, with numbers easing to new values.
  - [ ] When a future day is *Crash likely*, an explanation names the largest contributing activity, how far over the envelope today is, and when the payback lands.
  - [ ] A small wave chart visualises envelope across the four days against the usual budget.

### Swaps
- As Maya, I want concrete ways to fix a risky plan.
  - [ ] When today is over the envelope, up to three suggestions appear, ranked by how much they improve the worst future day: use a lighter alternative (e.g. Shower → Seated shower), shorten or split an item with a rest, or move an item to a later day.
  - [ ] Each suggestion states its effect in spoons ("Thursday +3").
  - [ ] Applying a suggestion updates the plan and forecast; "move to another day" removes it from today and notes it as moved.
  - [ ] When the plan is within the envelope, the swap area shows a calm "You're pacing well" state instead.

### Pattern Learning
- As Maya, I want to understand my own crash pattern.
  - [ ] Stat cards show: typical payback lag (in hours/days), payback ratio, days within envelope (%), and crashes in the window.
  - [ ] A history chart shows each logged day's spend (bar) against its envelope (line); over-budget portions are highlighted and arcs connect them to the day the payback landed.
  - [ ] With fewer than 7 logged days, Ember uses research-based defaults and says so; the confidence label rises with more data.

### Persistence and Privacy
- As Maya, I want my data private and still there tomorrow.
  - [ ] All data is saved on the device automatically; reloading restores everything.
  - [ ] When the date changes, the previous day's plan and check-in are rolled into history.
  - [ ] Settings can clear all data after a confirmation.

## States and Boundaries
- **First use** — Welcome screen; no history. Forecast uses default pattern (payback mostly at +1 and +2 days, ratio 1.5).
- **Empty plan** — the plan area shows a friendly prompt and three one-tap starter suggestions; the forecast shows Comfortable days.
- **Not checked in** — plan works; check-in prompt stays visible at top.
- **Over envelope** — orb turns rose, remaining shows as negative ("3 over"), swaps appear.
- **Quick add with nothing recognisable** — phrases become custom activities; an empty input does nothing.
- **Sample data** — always labelled; can be cleared from Settings.
- **Persistence** — plan, check-in, history, settings and theme survive reloads; nothing leaves the device.

## Product Decisions
- **Unit is "spoons"** — the community's own language (Spoon Theory); instantly familiar to the target users.
- **Forecast, not diary** — the product's value is the look-ahead; logging exists only to feed it.
- **No account, no cloud** — health data stays local; zero sign-up friction for people with limited energy.
- **Deterministic quick add instead of AI** — instant, private, works offline, no key required.
- **Kind language** — no red alarms or guilt; Crash risk is information, not a scolding.
- **Planning aid, not medical advice** — stated in Settings and the README.

## What We're Building
Welcome & setup, morning check-in, plan builder with library/durations/rest/quick add, the live four-day payback forecast with explanation and wave chart, swap suggestions, the Pattern screen with arcs and learned stats, local persistence with sample data, Night/Daylight themes, responsive layout.

## Deferred From the POC
- **Clinic summary export** — valuable for appointments, but not needed to prove the forecast.
- **Multi-day planner** — "move to another day" records the move but doesn't open a full planner for that day.
- **Editing past days** — history is created from real use or sample data; editing it isn't needed for the demo.
- **Wearable integration** — requires device APIs and permissions.

## Possible Later Enhancements
Clinic export as PDF; rest reminders when nearing the envelope; symptom tagging on crash days; shared view for a carer; installable offline app with notifications.

## Non-Goals
- Diagnosing or treating any condition — Ember is a planning aid.
- Gamification, streaks or scores — pressure is harmful for this audience.
- Social feed or community features — out of scope for a proof of concept.

## Open Questions
- Payback model parameters are research-informed defaults refined by a simple fit on the user's log; tuning against real user data can wait (does not block `4-spec`).
