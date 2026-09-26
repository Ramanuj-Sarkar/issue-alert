---
doc: spec
status: approved
---

# Issue Alert — Technical Spec

## How This Works, In Plain Language

Issue Alert is a small program that runs on your own computer and shows a page in your browser. There are really only four things to understand:

- **A page you see** — two tabs, Input and Issues. The browser just draws what the program tells it. The page is plain HTML, CSS, and JavaScript files you can open and read yourself.
- **A small program that serves it** — a Node.js program. When you open `http://localhost:3000`, the program hands your browser the page and answers small requests ("give me the issues", "save this one", "mark that one done").
- **A text file that holds everything** — `data/issues.json`. Every issue, its fields, your manual order, and your completed/discarded history live here as plain JSON. The program reads it when it needs to and writes it back when something changes. You can open this file in any editor and change it by hand.
- **A clock check, not a background service** — there is no always-running scheduler. When you open the app after noon, the program checks whether today's list has been made yet; if not, it makes it. If the app is open at noon, the page itself notices and asks the program to do the same.

Why this shape: a browser page alone can't write your file (browsers block that), and an always-running background job would add moving parts that are hard to debug. A tiny local program plus an on-open check keeps the whole thing to one command, one file, and no accounts or cloud.

## The Core Journey Through the System

PRD ref: `prd.md > The Core Journey`.

1. You run `npm start` and open `http://localhost:3000`. The program serves the page from `public/`.
2. You land on **Input**, fill the fields, and submit. The page sends the values to the program; the program checks them, adds the issue to `data/issues.json`, and returns the saved issue.
3. At or after noon, your next request for the list ("give me the issues") makes the program check today's date. First time after noon, it builds today's ranked list and records today as generated.
4. You click **Issues**. The page shows up to six ranked issues and clears the red badge (the badge means "a list was generated since you last looked"). Counters for Completed and Discarded (last two days) are computed from `history`.
5. You drag a row. The page sends the new order; the program stores it so it survives the next re-rank.
6. You double-click a row and get the full description and Ranking Explanation. Editing there saves back to the file.
7. You click **Completed** or **Discarded**; the program records it in `history` and the issue leaves the active list. Reloading fills the slot with the next-ranked issue.
8. If the app is open at noon, `app.js` fires a timer, asks the program to generate today's list, and shows the in-app alert.

## Stack

- **Language:** JavaScript, running on **Node.js** (v18 or newer; v24 is installed).
- **Server:** **Express**, a small, free, widely-used Node web framework for serving files and handling the JSON requests. Docs: https://expressjs.com
- **Front end:** plain **HTML, CSS, and JavaScript** — no framework, no build step, no bundler. Keeps every file hand-readable and editable, which is the point of the project.
- **Drag-and-drop:** the browser's built-in HTML5 drag events — no library.
- **IDs:** Node's built-in `crypto.randomUUID()` — no dependency.
- **Data:** one JSON file, `data/issues.json`.

Rationale: one language end to end, one direct dependency (Express), zero paid services, and every visible file is editable by hand. Accepted tradeoff: plain JavaScript means more manual wiring than a framework or component library would give you — deliberately, so there's nothing opaque between you and the app.

Unverified: the exact current Express major version. Check `npm view express version` at the start of the build and pin it in `package.json`.

## Where It Runs and How Someone Tries It

- **Runtime:** Node.js v18+ installed locally. No API keys, no accounts, no network services.
- **Start:** `npm install`, then `npm start`. The program serves `http://localhost:3000`.
- **Open:** a browser at `http://localhost:3000`.
- **Data lives at:** `data/issues.json` in the project folder (created automatically on first run).
- **For the demo video:** start the app, add an issue, open the Issues tab to show the ranked list and counters, drag one, complete one, then open `data/issues.json` in a text editor, change a value, refresh the browser, and show the change take effect. No deployment.
- **Submission:** requires the short demo video and a public GitHub repository. Deployment is optional and not needed here (learner chose local-only).

## Look and Feel

From `prd.md > Look and Feel` and `scope.md > Inspiration & Identity`, in build terms:

- **Light mode only:** white background (`#ffffff`), near-black text (`#15181c`).
- **Large type**, with issue titles in the list clearly larger (roughly 1.5–1.8×) than their descriptions.
- **Color used sparingly:** Completed counter in blue (`#2563b6`), Discarded counter in red (`#c0392b`), and the update badge in red. Everything else is black/white/grey.
- **Minimal and calm** — plain layout, generous spacing, no gradients, shadows, or decorative flourish. Readability and daily use beat polish.
- Implement with plain CSS (CSS custom properties for the palette above). Express serves these as static files; no styling framework. Because there's no build step, styling is one `styles.css` you can edit live and refresh.

## Components

### Server — `server.js`
Serves `public/` as static files and mounts the API. Knows nothing about ranking or storage itself; delegates to the modules below.
PRD ref: `prd.md > Screens and Layout` (delivers the page).

### Data store — `src/store.js`
The only code that touches `data/issues.json`. Loads the file, provides the current data, and writes it back after changes. Creates a fresh empty file if none exists. If the file exists but is malformed JSON, it does **not** overwrite it — it surfaces a readable error (see Failure Modes).
PRD ref: `prd.md > States and Boundaries` (Persistence).

### Ranking — `src/ranking.js`
Produces the ordered list of active issues. Comparator: days since creation (oldest first) → urgency (High > Medium > Low) → difficulty (High > Medium > Low) → deadline (closest first; issues with no deadline last). Also applies manual order: issues you dragged keep their position; the rest sort around them.
PRD ref: `prd.md > The ranked list — Issues tab`, `prd.md > Manual ordering`.

### Scheduler — `src/scheduler.js`
The on-open noon check. On each request for the list, if the current time is at/after the configured alert time and today's list hasn't been generated, it generates it: it marks today as generated. Idempotent per date.
PRD ref: `prd.md > The noon list and alert`.

### API — `src/routes.js`
The small set of endpoints the page calls (listed under External Services and Dependencies → Internal API).
PRD ref: `prd.md > Features and Behavior`.

### Front end — `public/index.html`, `public/styles.css`, `public/app.js`
The two tabs, the input form and its validation, the ranked list, drag-to-reorder, the detail/edit view, the counters, the red badge, and the in-app noon timer.
PRD ref: `prd.md > Screens and Layout`, `prd.md > Adding an issue — Input tab`, `prd.md > Detail and edit mode`, `prd.md > Completing and discarding`.

### Config — `src/config.js`
The code-level settings the learner wants easy to change: `dailyCount` (default 6), `alertTime` (default "12:00"), and the `difficultyLevels` / `urgencyLevels` lists. Changing a value here changes behavior on restart.
PRD ref: `prd.md > Product Decisions` (settings live in code).

## Data Model

One file, `data/issues.json`. Shape:

```json
{
  "issues": [
    {
      "id": "8f2c…",
      "title": "Finish the tax form",
      "description": "The accountant emailed the last two documents…",
      "urgency": "High",
      "difficulty": "High",
      "deadline": "2026-09-25",
      "rankingExplanation": "Must be filed before Friday.",
      "manualRank": null,
      "status": "active",
      "createdAt": "2026-09-20T09:00:00.000Z"
    }
  ],
  "history": [
    { "id": "8f2c…", "outcome": "completed", "at": "2026-09-24T14:10:00.000Z" }
  ],
  "lastGeneratedDate": "2026-09-24",
  "lastViewedIssuesAt": "2026-09-24T09:00:00.000Z"
}
```

Where each piece lives and what happens on return:

- **Issues and their fields** — in `issues[]`. Written on add and on edit. Reading them back happens on every page load from the file, so editing the file by hand and refreshing shows your changes.
- **`manualRank`** — a number set when you drag an issue, or `null` if it's never been placed by hand. Positions are re-derived when the list is displayed. This is what makes a manual order survive a re-rank: placed issues keep their spot, unplaced ones sort around them.
- **`history[]`** — one entry per completed or discarded issue with a timestamp. The two counters are counts of entries with `outcome` = completed/discarded in the last two days.
- **`lastGeneratedDate`** — the last date a noon list was built; used to decide whether a generation is due and to set the badge.
- **`lastViewedIssuesAt`** — updated when you open the Issues tab; compared with `lastGeneratedDate` to decide whether the red badge shows.

There is no in-browser storage of your data — the file is the source of truth, so nothing is stranded in the browser.

## File Structure

```
issue-alert/
├── server.js              # starts Express, serves public/, mounts the API
├── src/
│   ├── config.js          # dailyCount, alertTime, difficulty/urgency levels
│   ├── store.js           # read/write data/issues.json
│   ├── ranking.js         # auto-sort + manual-order logic
│   ├── scheduler.js        # on-open "has today's list been made?" check
│   └── routes.js          # API endpoints
├── public/
│   ├── index.html         # two-tab shell
│   ├── styles.css         # light-mode styling
│   └── app.js             # tabs, form, list, detail, drag, badge, noon timer
├── data/
│   └── issues.json        # human-editable data (created on first run)
├── package.json
├── README.md              # how to run it
└── devpost/               # learning workspace (planning docs, keep in repo)
```

## External Services and Dependencies

- **Express** — the one runtime dependency. Install via `npm install express`. Docs: https://expressjs.com. Free, no key.
- **Node's built-in `http`, `fs`, `crypto`** — no install; used for the server transport, file reads/writes, and IDs.
- No database, no hosting, no APIs, no accounts, no keys, no rate limits, no cost.

### Internal API (the page ↔ program calls)

- `GET /api/state` → runs the noon check, returns `{ issues (ranked), counters, badge, config }`.
- `POST /api/issues` → body is the new issue's fields; validates and saves; returns the saved issue.
- `PUT /api/issues/:id` → updates an issue's fields (from the detail/edit view).
- `POST /api/issues/:id/complete` and `POST /api/issues/:id/discard` → append to `history` and set `status`.
- `POST /api/order` → body is an array of issue ids in the new manual order; updates `manualRank`.
- `POST /api/seen` → marks the Issues tab as viewed (clears the badge).

All are local `http://localhost:3000` calls; no auth.

## Important Failure Modes

- **`data/issues.json` is missing** → the program creates it with an empty structure and a clear log line, so first run just works.
- **`data/issues.json` is malformed** (a hand-edit broke the JSON) → the program does **not** overwrite it. It shows a plain message naming the file and the parse error, so you can fix it. A backup copy is never silently made in its place.
- **Invalid input on the Input tab** (blank title, bad date, unknown level) → the page shows a field-level error and nothing is saved.
- **The app is never opened for several days** → no list is generated for those days; the next open generates one list for that day.

## What Was Simplified and Why

- **On-open check instead of a background scheduler** — a real cron/daemon would run even when closed but is hard to build and debug; the check-on-open gives the same visible behavior. (Agreed in `scope.md` and this interview.)
- **One JSON file instead of a database** — a database would hide the data behind machinery; the file keeps it hand-editable, which is the kernel.
- **No framework or build step** — a framework would add tooling between you and the code; plain files stay readable.
- **Native browser drag-and-drop instead of a library** — avoids a dependency for a small, well-supported feature.
- **Local-only, no deployment** — the required demo is a recorded video plus a repo; hosting adds setup without proving anything new.

## Decisions and Open Issues

Learner choices:
- **Node.js + Express + plain HTML/CSS/JS**, local-only — chosen for a single language, no build step, and hand-editable files; accepted tradeoff of more manual wiring and no component library.
- **JSON file storage** — chosen over a flat line format for structure and standard tooling; accepted tradeoff that malformed JSON must be handled gracefully.
- **Settings in code (`src/config.js`), issues in the file** — carries forward `prd.md > Product Decisions`.
- **On-open noon check rather than a background service** — carries forward the scope decision.

Learner uncertainty discussed:
- **How "noon" works without a background process.** Unclear at first; clarified by the check-on-open mechanism above. **Verification during the build:** open the app after noon on a fresh date and confirm exactly one generation happens (counts increment once), and that reopening the same day doesn't double-count.

Implementation details derived from those choices (not separate learner decisions): the endpoint list, the file tree, the JSON schema, and using `crypto.randomUUID()` for ids.

Open issues:
- Ranking was revised during the build: the comparator in `src/ranking.js` now sorts by days since creation first, then urgency, then difficulty, then deadline, and the two-day deadline window was removed. See `checklist.md > Revisions`.
- The manual-order rule (placed items keep their spot; others sort around them) is the subtlest behavior — verify it first when building, before the other list features.
