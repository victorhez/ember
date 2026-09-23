---
doc: scope
status: approved
---

# Ember

A pacing planner for people with energy-limiting illness that shows you **tomorrow's crash before you spend today's energy**.

## The Unique Kernel
For people with ME/CFS and Long COVID, overdoing it doesn't hurt today — it hurts **24 to 72 hours later** (post-exertional malaise, "the crash"). Every existing tool looks backwards: symptom diaries log the crash after it happens; wearables give a morning score for today. Ember looks **forward**: as you build today's plan, it projects the delayed payback onto the next three days, so you can see the crash coming and move, shrink or swap activities before it's too late. And it learns *your* lag and *your* payback ratio from your own log.

If this were deleted, Ember would be just another spoon counter.

## Who It's For
Maya, 34, has had Long COVID for two years. Her specialist told her to "pace" — stay inside her energy envelope — but nobody told her how to do that on a Tuesday with a grocery run, a work call and her niece's birthday. Today she keeps a notes-app spoon count and still gets blindsided on Thursday by what she did on Tuesday. Tens of millions of people worldwide live with ME/CFS or Long COVID; pacing is the most widely recommended self-management strategy, and the hardest to do by feel.

## The Core Loop
1. Morning: a ten-second check-in ("how's your body today?") sets today's energy envelope.
2. Plan: add today's activities — tap from a library or just type "shower, groceries, 1h zoom call".
3. Look ahead: the forecast for the next three days updates live. Go over the envelope and you watch Thursday sink.
4. Adjust: take a suggested swap (seated shower, split the call, move groceries to Saturday) and watch the crash risk clear.
5. Over the days, the log teaches Ember your personal crash lag, and the forecast gets sharper. That's why people come back.

## Inspiration & Identity
Calm, warm, low-stimulation. A glowing ember that dims as energy is spent — tending a fire, not draining a battery. Dark-first (light sensitivity is common in this community), with a soft daylight theme. Editorial serif headlines paired with a clean sans; generous spacing; nothing flashing, nothing guilt-inducing. References: Apple Health's clarity, Oura's calm dark palette, the language of the [Spoon Theory](https://butyoudontlooksick.com/articles/written-by-christine/the-spoon-theory/) and the [Patient-Led Research Collaborative pacing guide](https://patientresearchcovid19.com/clinicians-pacing-and-management-guide-for-me-cfs-and-long-covid/).

## Why This Matters to the Learner
The brief was a real problem people would actually use, in a concept that doesn't already exist. Pacing tools exist; a *forward-looking* payback forecast that learns your personal lag does not.

## What "Working" Looks Like
Open Ember, check in, add a normal-looking day. Then add "family birthday party". Today still looks fine — but Thursday's ember goes dark and a "crash likely in ~48h" warning appears, with an arrow showing *why*. Tap the suggested swap and Thursday relights. On the Pattern screen, three weeks of history show arcs from each over-budget day to the crash that followed — and the learned lag ("your crashes arrive ~2 days later") is displayed.

That "Thursday going dark while today looks fine" moment is the demo.

## The POC Boundary
- Morning check-in → today's envelope
- Plan builder: activity library, durations, rest breaks, plain-text quick add
- Live three-day payback forecast with crash-risk state and cause explanation
- Suggested swaps that visibly change the forecast
- Pattern view: history chart with overspend→crash arcs and the learned lag/payback ratio
- Local-only storage; sample history to try it instantly; start-fresh option

## Later
- Clinic summary export (a printable two-week report for doctor appointments)
- Optional wearable input (resting heart rate / HRV) to refine the envelope
- Reminders to rest before crossing the envelope
- Multi-day planning (drag an activity to another day)

## Explicitly Cut
- **Accounts and cloud sync** — health data stays on the device; adds risk with no benefit to proving the kernel.
- **An LLM** — the quick-add parser and forecast are deterministic, instant and private; an API key would be a barrier for exactly the people who need this.
- **Medical claims or diagnosis** — Ember is a planning aid, not medical advice.
