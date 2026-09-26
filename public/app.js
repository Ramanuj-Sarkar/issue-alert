// Tabs, the Input form, and the Issues list.
// Drag, detail view, badge, and the noon timer arrive in later slices.

const tabs = {
  input: document.getElementById("tab-input"),
  issues: document.getElementById("tab-issues"),
};
const panels = {
  input: document.getElementById("panel-input"),
  issues: document.getElementById("panel-issues"),
};
const form = document.getElementById("issue-form");
const formStatus = document.getElementById("form-status");
const list = document.getElementById("issue-list");
const emptyState = document.getElementById("empty-state");
const completedCount = document.getElementById("completed-count");
const discardedCount = document.getElementById("discarded-count");
const scrollDown = document.getElementById("scroll-down");
const badge = document.getElementById("badge");

const VISIBLE_ROWS = 6;

async function markSeen() {
  badge.hidden = true;
  await fetch("/api/seen", { method: "POST" });
}

function showTab(name) {
  for (const key of Object.keys(tabs)) {
    const active = key === name;
    tabs[key].classList.toggle("is-active", active);
    panels[key].hidden = !active;
  }
  if (name === "issues") markSeen();
}

tabs.input.addEventListener("click", () => showTab("input"));
tabs.issues.addEventListener("click", () => showTab("issues"));

function clearErrors() {
  for (const el of document.querySelectorAll("[data-error-for]")) {
    el.textContent = "";
  }
}

function showErrors(fields) {
  for (const [name, message] of Object.entries(fields || {})) {
    const el = document.querySelector(`[data-error-for="${name}"]`);
    if (el) el.textContent = message;
  }
}

function daysSinceCreated(issue) {
  if (!issue.createdAt) return 0;
  const created = new Date(issue.createdAt);
  const createdDay = new Date(created.getFullYear(), created.getMonth(), created.getDate());
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((today - createdDay) / (24 * 60 * 60 * 1000));
}

function renderRow(issue) {
  const row = document.createElement("li");
  row.className = "issue-row";
  row.dataset.id = issue.id;

  const count = document.createElement("div");
  count.className = "issue-row__count";
  count.textContent = daysSinceCreated(issue);
  count.title = "Days since you added it";

  const main = document.createElement("div");
  main.className = "issue-row__main";
  const title = document.createElement("div");
  title.className = "issue-row__title";
  title.textContent = issue.title;
  const description = document.createElement("div");
  description.className = "issue-row__description";
  description.textContent = issue.description;
  main.append(title, description);

  const meta = document.createElement("div");
  meta.className = "issue-row__meta";
  const parts = [issue.urgency, issue.difficulty, issue.deadline].filter(Boolean);
  meta.textContent = parts.join(" · ");

  row.append(count, main, meta);
  return row;
}

function render(state) {
  list.replaceChildren(...state.issues.map(renderRow));
  emptyState.hidden = state.issues.length > 0;
  completedCount.textContent = state.counters.completed;
  discardedCount.textContent = state.counters.discarded;
  scrollDown.hidden = state.issues.length <= VISIBLE_ROWS;
  badge.hidden = !state.badge;
}

scrollDown.addEventListener("click", () => {
  list.scrollBy({ top: list.clientHeight, behavior: "smooth" });
});

async function loadState() {
  const response = await fetch("/api/state");
  const state = await response.json();
  render(state);
  return state;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearErrors();
  formStatus.hidden = true;

  const body = Object.fromEntries(new FormData(form).entries());

  const response = await fetch("/api/issues", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const problem = await response.json().catch(() => ({}));
    showErrors(problem.fields);
    formStatus.textContent = problem.error || "Could not save the issue.";
    formStatus.hidden = false;
    return;
  }

  form.reset();
  form.elements.title.focus();
  formStatus.textContent = "Issue added. Open the Issues tab to see it.";
  formStatus.hidden = false;
  await loadState();
});

loadState();
