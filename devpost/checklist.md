---
doc: checklist
status: approved
---

# Build Checklist

Build mode: learn

## Slices

- [x] **1. You can add an issue and see it in the list**
  Becomes usable: `npm install` then `npm start` serves the app at `http://localhost:3000`. The Input tab accepts a valid issue and saves it to `data/issues.json`; the Issues tab lists saved issues as rows (age spot, large title with truncated description beneath, urgency/difficulty/deadline on the right). Invalid input shows a field-level error and saves nothing.
  Why now: Bootstrapping lives inside this slice. It proves the whole path — form → Express → file → render — on the first slice, so every later slice has somewhere to land.
  PRD ref: `prd.md > The Core Journey` (steps 1-4), `prd.md > Adding an issue — Input tab`, `prd.md > Screens and Layout`
  Spec ref: `spec.md > Components`, `spec.md > File Structure`, `spec.md > Data Model`, `spec.md > Look and Feel`
  Build: Scaffold `server.js`, `src/config.js`, `src/store.js` (load/create/hand-edit-safe JSON), `src/routes.js` (`GET /api/state`, `POST /api/issues`), and `public/index.html` / `public/styles.css` / `public/app.js` (two-tab shell, validated Input form, Issues list rendering rows). Plain CSS per the light-mode palette.
  Verify (mechanical): `npm install` and `npm start` with no errors; `POST /api/issues` with a valid body returns it and updates the file; an invalid body returns an error and leaves the file unchanged; `GET /api/state` returns the saved issue.
  Learner check: Open `http://localhost:3000`, add an issue, and open the Issues tab. Does the row look the way you pictured it — big title, description beneath, the three values on the right?
  Commit: `Scaffold Issue Alert with input form and issue list`

- [ ] **2. The 6 most important issues rise to the top**
  Becomes usable: The Issues tab shows up to `dailyCount` (6) active issues in ranked order — days since creation (oldest first), then urgency (High > Medium > Low), then difficulty (High > Medium > Low), then deadline (closest first). Each row's left number is the issue's age in days. Six rows fill the screen; more than six shows a down-arrow and scrolls.
  Why now: This is the unique kernel — the app deciding for you. Settling the comparator before later slices depend on it is cheap.
  PRD ref: `prd.md > The ranked list — Issues tab`, `prd.md > Product Decisions`, `prd.md > States and Boundaries` (fewer than count, more than fits)
  Spec ref: `spec.md > Components > Ranking — src/ranking.js`
  Build: Add the `src/ranking.js` comparator; `GET /api/state` returns the ranked, capped list; render six rows with the sizing and down-arrow/scroll affordance.
  Verify (mechanical): Seed mixed issues and confirm the returned order matches days-since-creation → urgency → difficulty → deadline; with more than six, exactly six are returned; with fewer, only those show.
  Learner check: Add a few issues, then hand-edit one issue's `createdAt` in `data/issues.json` to a few days ago, refresh, and confirm it climbs to the top; among same-age issues, check that urgency then difficulty then deadline set the order.
  Commit: `Rank the daily list by age, urgency, difficulty, then deadline`

- [ ] **3. The noon list and the red badge**
  Becomes usable: Opening the app at or after noon generates that day's list once and records `lastGeneratedDate`. A red badge appears on the Issues tab when a list was generated since you last looked, and clears when you open the tab.
  Why now: The spec's named uncertainty — how "noon" works with no background process — is settled here, before more list features build on it.
  PRD ref: `prd.md > The noon list and alert`
  Spec ref: `spec.md > Components > Scheduler — src/scheduler.js`, `spec.md > Data Model` (`lastGeneratedDate`, `lastViewedIssuesAt`)
  Build: Add `src/scheduler.js` (idempotent per-date on-open check honoring `alertTime`), `POST /api/seen`, and the badge logic.
  Verify (mechanical): With `lastGeneratedDate` clear and time at/after `alertTime`, `GET /api/state` records today's date once; a second call the same day leaves it unchanged; before `alertTime` it does not generate.
  Learner check: Set `alertTime` in `src/config.js` a couple of minutes ahead (or clear `lastGeneratedDate` in `data/issues.json`), reopen after it passes, and check the red badge appears then clears when you open Issues.
  Commit: `Generate the daily list on open and show the update badge`

- [ ] **4. Drag rows to set your own order, and it survives the next re-rank**
  Becomes usable: Dragging a row sets a manual position that persists. When the automatic ranking runs again, hand-placed issues keep their spot and the rest sort around them.
  Why now: The spec calls this the subtlest behavior and says to verify it before the other list features; it depends on slice 2's ranking being in place.
  PRD ref: `prd.md > Manual ordering`
  Spec ref: `spec.md > Components > Ranking — src/ranking.js` (manual order), `spec.md > Data Model` (`manualRank`)
  Build: HTML5 drag events in `app.js`; `POST /api/order`; `ranking.js` merges manual placements with the auto order; persist `manualRank`.
  Verify (mechanical): Place issues, re-run generation, and confirm placed issues keep position while others sort around them; reload persists the order.
  Learner check: Drag two issues into a new order, change a deadline so the auto-rank would move them, reopen Issues, and confirm your placements held.
  Commit: `Persist manual row order across re-ranks`

- [ ] **5. Open an issue, edit it, then complete or discard it**
  Becomes usable: Double-clicking a row opens a detail view with the full description and Ranking Explanation, both editable and saved. Completed and Discarded buttons remove the issue, add a history entry, bump the matching last-two-day counter (Completed blue / Discarded red, centered), and the next-ranked issue fills the gap. The X exits.
  Why now: These are the journey's action steps and belong together — the action buttons live inside the detail view.
  PRD ref: `prd.md > Detail and edit mode`, `prd.md > Completing and discarding`, `prd.md > Screens and Layout` (counters)
  Spec ref: `spec.md > Components > API — src/routes.js`, `spec.md > Data Model` (`history`)
  Build: Detail overlay with X; `PUT /api/issues/:id`; complete/discard endpoints appending to `history`; centered counters computed over the last two days; row removal and refill.
  Verify (mechanical): Edit a field and confirm the file and list update; complete one and confirm the history entry, the counter increment, and a replacement row.
  Learner check: Double-click an issue, edit its Ranking Explanation, complete it, and check that the blue counter moved and a new issue filled the slot.
  Commit: `Add detail/edit, complete/discard, and history counters`

- [ ] **6. The in-app alert when the app is open at noon**
  Becomes usable: If the app is open when `alertTime` passes, it asks the program to generate today's list and shows the in-app alert, with no manual refresh.
  Why now: The last journey step. It reuses slice 3's generation endpoint, so it is small and safest once generation is proven.
  PRD ref: `prd.md > The noon list and alert` (in-app alert)
  Spec ref: `spec.md > How This Works, In Plain Language` (clock check), `spec.md > The Core Journey` (step 8)
  Build: Timer in `app.js` that detects the alert time, calls generation, and surfaces the alert.
  Verify (mechanical): With a near-future `alertTime`, leave the page open and confirm generation fires and the alert appears with no refresh.
  Learner check: Set `alertTime` a minute ahead, leave the app open, and confirm it alerts and refreshes the list by itself.
  Commit: `Fire the in-app noon alert while open`

## Hands-on Checkpoints

- [ ] Early usable behavior explored — after slice 2, to confirm the ranking rule before we build on it
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

- The ranking rule was changed from difficulty → deadline-within-two-days → urgency to days-since-creation → urgency → difficulty → deadline, and the two-day deadline window was dropped — the learner confirmed during the early checkpoint that age should dominate, to surface issues that have been ignored longest.
- The ignored count was dropped entirely: the left number on each row is now the issue's age in days, and `shownCount`/`lastShownDate` were removed from the data model. This replaces the original "quietly counts how many times it has shown up" accountability layer with the visible age — the learner's call.
