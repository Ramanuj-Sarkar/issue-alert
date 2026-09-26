---
doc: prd
status: approved
---

# Issue Alert — Product Requirements

A personal daily-priority tracker: it stores your issues in a plain-text file and, every day at noon, ranks the 6 it thinks matter most so you stop second-guessing yourself.
Source: `scope.md > The Unique Kernel`, `scope.md > The Core Loop`.

## The Core Journey
1. Open Issue Alert. The **Input** tab comes up first.
2. Fill the form rows: Title, Description, Urgency (Low/Medium/High), Difficulty (Low/Medium/High), optional Deadline (YYYY-MM-DD), and optional Ranking Explanation. Values that don't fit are rejected with a visible error.
3. Submit. The issue is saved to the text file.
4. A fresh noon list of 6 is generated; if that happened since you last looked, a red badge appears on the **Issues** tab.
5. Click **Issues**. The badge clears. Up to 6 issues are ranked and shown, each row reading left to right: days since creation, title + truncated description, then urgency / difficulty / deadline.
6. Drag rows to reorder. Your manual order sticks.
7. Double-click an issue to open its detail view: full (untruncated) description and Ranking Explanation, editable. Exit with the X on the left.
8. In detail, click **Completed** (blue) or **Discarded** (red). The issue leaves the list, the matching counter at the top increments, and the list reloads with the next-ranked issue filling the gap.
9. Each day at noon, the list re-ranks. Manual order and Ranking Explanations carry over. If the app happens to be open at noon, it refreshes quietly and the red badge appears.

Success: a reviewer can see the ranked list, open one issue, act on it, and then change a value in the text file or the source — and watch the app respond without losing saved data.

## Screens and Layout
Two browser-style tabs across the top, **Input** and **Issues**, with the active one clearly marked. Input opens first.

**Input tab** — labeled form rows, each on its own line, with blank fields beside the labels. Light, large text.

**Issues tab** — top row: two counters centered on either side of the screen's center line, each with a label above its number. **Completed** — label and number both in blue — sits to the left of center; **Discarded** — label and number both in red — sits to the right. Below: the ranked list. Each issue row is arranged left to right as:
- days since creation (leftmost),
- title (large) on its own line, with the description truncated to a single line directly **beneath** it (middle),
- urgency, difficulty, and deadline (right).

Title text is notably larger than description text. When the count is 6 (default), six rows fit on screen. If the configured count is higher, rows stay sized so six fill the screen and a down-arrow on the right signals that you can scroll for more.

**Detail view** — opened by double-clicking a row. Form-like, the same separate-rows layout as the Input tab, showing the full description and Ranking Explanation and allowing edits. An **X** on the left exits back to the list.

## Look and Feel
Light mode: white background, black text. Large text throughout, with titles noticeably larger than descriptions. Minimal — no color except the Completed counter (blue), the Discarded counter (red), and the red update badge. Plain, readable lists rather than a polished or decorative UI; the priority is daily usability and editability, not visual flourish.

## Features and Behavior

### Adding an issue — Input tab
- Fields: Title, Description, Urgency, Difficulty, Deadline (optional), Ranking Explanation (optional).
- Urgency and Difficulty are chosen from Low / Medium / High.
- Deadline accepts `YYYY-MM-DD` or is left blank.
- Invalid input (e.g., text where the date format is expected, or a missing required Title) shows a visible error and blocks saving.
- Acceptance: entering a valid issue and submitting it adds it to the text file and clears the form; entering an invalid value shows an error and saves nothing.

### The ranked list — Issues tab
Ranking order, applied top to bottom:
1. **Days since creation**, oldest first — the longer an issue has been waiting, the higher it ranks.
2. **Urgency**, high first: High > Medium > Low.
3. **Difficulty**, hard first: High > Medium > Low.
4. **Deadline**, closest first; issues with no deadline sit last at this step.

- Each row shows days since creation (left), title + truncated description (middle), urgency/difficulty/deadline (right).
- Acceptance: with a mix of issues, the list matches the rule above; each row shows its age, title, truncated description, and the three values.

### Manual ordering
- Drag a row to a new position to break ties.
- Acceptance: a manual order survives the next noon re-rank; the automatic ranking reorders around issues you placed by hand.

### Detail and edit mode
- Double-click a row to open it. Full description and Ranking Explanation are shown.
- Edits made here are saved to the text file.
- Acceptance: editing a field in detail view persists and is reflected in the list after exiting.

### Completing and discarding
- In detail view, **Completed** and **Discarded** buttons remove the issue from the active list.
- The matching counter (Completed blue, Discarded red) increments; both counters count the last two days.
- The vacant slot is filled by the next-ranked issue.
- Acceptance: acting on an issue removes it, increments the correct counter, and a replacement appears.

### The noon list and alert
- A fresh list of up to 6 issues is generated at noon each day; if fewer than 6 issues exist, only those show, packed into the top positions.
- If that happened since the app was last viewed, a red badge appears on the Issues tab; clicking the tab clears it.
- If the app is open at noon, it refreshes quietly in the background; the red badge is the only signal. There is no notification while the app is closed.
- Acceptance: after noon, the list reflects a new ranking; the badge appears and clears on tab click.

## States and Boundaries
- **First use** — Input tab shows; the Issues tab has no rows and both counters read zero.
- **Fewer than the configured count** — only the available issues are shown, in the higher positions; empty positions are not drawn.
- **More than fits on screen** — rows remain sized so six are visible; a down-arrow on the right indicates more, and the list scrolls.
- **Invalid input** — a visible error is shown and the issue is not saved.
- **No deadline** — the deadline area is blank and the issue gets no deadline boost in the ranking.
- **Persistence** — issues, manual order, Ranking Explanations, and the two counters survive closing and reopening; the text file is the source of truth.
- **Daily re-rank** — every noon the automatic order is recomputed around any manual placements.

## Product Decisions
- **Age first** — an issue that has been waiting longer outranks a newer one, so nothing gets quietly buried: the older it gets, the higher it climbs.
- **Urgency next, then difficulty** — among issues of the same age, the more urgent one ranks higher, then the harder one.
- **Deadline is the final tie-breaker** — closest first; an issue with no deadline sits last at this step. The original "deadline within two days" window has been removed.
- **No ignored count** — the number on the left of each row is the issue's age in days, not a tally of how often it has appeared; the visible age is itself the accountability signal.
- **No algorithm-generated explanation** — the "why" is the visible age/urgency/difficulty plus the learner's own Ranking Explanation.
- **Manual order and Ranking Explanation persist** across noon re-ranks rather than being overwritten.
- **Issues live in the text file; settings live in code** — number of results, alert time, and difficulty/urgency levels are source-level values; issue data (including per-issue values) is hand-editable text.
- **Completed and Discarded are separate, last-two-day counters** — both the label text and the number are colored (Completed blue, Discarded red), and the pair is centered so Completed sits left of the center line and Discarded right.
- **Open-at-noon over background notifications** — keeps the build small while preserving the daily ritual.

## What We're Building
- Input tab with the six fields and validation.
- Text-file storage of issues; settings in code.
- Noon ranking: days since creation (oldest first) → urgency (High first) → difficulty (High first) → deadline (closest first).
- Issues tab: Completed/Discarded counters, ranked rows with days since creation, title, truncated description, and right-side values.
- Row sizing for six, scroll + down-arrow when the count is raised.
- Drag-to-reorder that survives re-ranks.
- Detail/edit view with full description + Ranking Explanation and an X to exit.
- Complete and Discard actions with last-two-day counters.
- Red update badge, refreshed quietly when the app is open at noon.

## Deferred From the POC
- **Background notification while closed** — deliberately deferred in scope; open-at-noon keeps the build small.
- **Any syncing or backup beyond the local text file** — would complicate the hand-editable storage that defines the project.

## Possible Later Enhancements
- A scheduled notification that fires while the app is closed.
- Optional polish or theming.
- More urgency/difficulty levels or a different daily count, enabled by the code-level settings.

## Non-Goals
- Accounts, login, multi-user — a personal tool; no payoff here.
- Cloud storage or a database — would make the data harder to hand-edit.
- A mobile app — a local/desktop app demonstrates the loop.
- Analytics, dashboards, collaboration — resist the pull to "add more and more."
- An app-computed explanation sentence — the learner chose visible values plus their own note.

## Open Questions
- Resolved during `5-build`: the ranking order is now days since creation (oldest first) → urgency → difficulty → deadline, replacing the original difficulty → deadline-within-two-days → urgency, and the two-day deadline window was removed. See `checklist.md > Revisions`.
