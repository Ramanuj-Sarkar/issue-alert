# Issue Alert

A tiny, hackable daily priority list. Your issues live in a plain-text file
(`data/issues.json`), and every day at noon the app ranks the 6 that matter
most — the ones waiting longest first, then by urgency, then difficulty, then
the closest deadline — so you stop second-guessing yourself.

## Run it

Requires Node.js 18 or newer.

```
npm install
npm start
```

Then open <http://localhost:3000>.

## Where things live

- `server.js` — starts Express, serves `public/`, mounts the API
- `src/config.js` — the settings you change in code (daily count, alert time, levels)
- `src/store.js` — reads and writes `data/issues.json`
- `src/routes.js` — the API the page calls
- `public/` — the page: `index.html`, `styles.css`, `app.js`
- `data/issues.json` — your issues, created on first run; edit it by hand if you like
- `devpost/` — the planning documents behind the project

## Try the hand-editable part

With the app closed, open `data/issues.json`, change a title or a deadline,
save, and reload the page. Your change is there — the file is the source of
truth.
