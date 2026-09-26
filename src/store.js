// The only code that touches data/issues.json.
// Loads the whole file on every request (so hand-edits show up on refresh) and
// writes it back after a change. If the file is missing it creates a fresh one;
// if the file is malformed it refuses to overwrite it and raises a readable error.

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const DATA_FILE = path.join(DATA_DIR, "issues.json");

function emptyData() {
  return {
    issues: [],
    history: [],
    lastGeneratedDate: null,
    lastViewedIssuesAt: null,
  };
}

function load() {
  if (!fs.existsSync(DATA_FILE)) {
    save(emptyData());
    console.log(`Created a fresh data file at ${DATA_FILE}`);
    return emptyData();
  }

  const raw = fs.readFileSync(DATA_FILE, "utf8");
  try {
    const parsed = JSON.parse(raw);
    return {
      issues: Array.isArray(parsed.issues) ? parsed.issues : [],
      history: Array.isArray(parsed.history) ? parsed.history : [],
      lastGeneratedDate: parsed.lastGeneratedDate ?? null,
      lastViewedIssuesAt: parsed.lastViewedIssuesAt ?? null,
    };
  } catch (err) {
    const error = new Error(
      `Could not read ${DATA_FILE}: ${err.message}. ` +
        `Fix the JSON by hand — the file was left untouched.`
    );
    error.code = "MALFORMED_DATA";
    throw error;
  }
}

function save(data) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2) + "\n");
}

module.exports = { load, save, DATA_FILE, emptyData };
