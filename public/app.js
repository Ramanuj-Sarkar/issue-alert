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
const detail = document.getElementById("detail");
const detailForm = document.getElementById("detail-form");
const detailStatus = document.getElementById("detail-status");
const detailClose = document.getElementById("detail-close");
const detailComplete = document.getElementById("detail-complete");
const detailDiscard = document.getElementById("detail-discard");

const VISIBLE_ROWS = 6;
let issuesById = new Map();
let noonTimer = null;

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

function clearErrors(container = document) {
  for (const el of container.querySelectorAll("[data-error-for]")) {
    el.textContent = "";
  }
}

function showErrors(container, fields) {
  for (const [name, message] of Object.entries(fields || {})) {
    const el = container.querySelector(`[data-error-for="${name}"]`);
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
  row.draggable = true;
  row.addEventListener("dragstart", () => row.classList.add("is-dragging"));
  row.addEventListener("dragend", () => row.classList.remove("is-dragging"));
  row.addEventListener("dblclick", () => openDetail(row.dataset.id));
  return row;
}

function rowAfterPoint(y) {
  const rows = [...list.querySelectorAll(".issue-row:not(.is-dragging)")];
  let closest = { offset: Number.NEGATIVE_INFINITY, element: null };
  for (const row of rows) {
    const box = row.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) closest = { offset, element: row };
  }
  return closest.element;
}

list.addEventListener("dragover", (event) => {
  const dragging = list.querySelector(".is-dragging");
  if (!dragging) return;
  event.preventDefault();
  const after = rowAfterPoint(event.clientY);
  if (after) list.insertBefore(dragging, after);
  else list.appendChild(dragging);
});

list.addEventListener("drop", async (event) => {
  if (!list.querySelector(".is-dragging")) return;
  event.preventDefault();
  const ids = [...list.children].map((row) => row.dataset.id);
  await fetch("/api/order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ids),
  });
  await loadState();
});

function openDetail(id) {
  const issue = issuesById.get(id);
  if (!issue) return;
  detailForm.elements.title.value = issue.title;
  detailForm.elements.description.value = issue.description;
  detailForm.elements.urgency.value = issue.urgency;
  detailForm.elements.difficulty.value = issue.difficulty;
  detailForm.elements.deadline.value = issue.deadline || "";
  detailForm.elements.rankingExplanation.value = issue.rankingExplanation || "";
  detail.dataset.id = id;
  clearErrors(detailForm);
  detailStatus.hidden = true;
  detail.hidden = false;
}

function closeDetail() {
  detail.hidden = true;
}

detailClose.addEventListener("click", closeDetail);

async function putDetail() {
  const body = Object.fromEntries(new FormData(detailForm).entries());
  const response = await fetch(`/api/issues/${detail.dataset.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const problem = await response.json().catch(() => ({}));
    showErrors(detailForm, problem.fields);
    detailStatus.textContent = problem.error || "Could not save the issue.";
    detailStatus.hidden = false;
    return false;
  }
  return true;
}

detailForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearErrors(detailForm);
  detailStatus.hidden = true;
  if (await putDetail()) {
    detailStatus.textContent = "Saved.";
    detailStatus.hidden = false;
    await loadState();
  }
});

async function conclude(action) {
  clearErrors(detailForm);
  if (!(await putDetail())) return;
  await fetch(`/api/issues/${detail.dataset.id}/${action}`, { method: "POST" });
  closeDetail();
  await loadState();
}

detailComplete.addEventListener("click", () => conclude("complete"));
detailDiscard.addEventListener("click", () => conclude("discard"));

function render(state) {
  issuesById = new Map(state.issues.map((issue) => [issue.id, issue]));
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
  clearErrors(form);
  formStatus.hidden = true;

  const body = Object.fromEntries(new FormData(form).entries());

  const response = await fetch("/api/issues", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const problem = await response.json().catch(() => ({}));
    showErrors(form, problem.fields);
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

function msUntilNextAlert(alertTime, now = new Date()) {
  const [hours, minutes] = alertTime.split(":").map(Number);
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes || 0, 0, 0);
  if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 1);
  return next.getTime() - now.getTime();
}

function scheduleNoonAlert(alertTime) {
  if (noonTimer) clearTimeout(noonTimer);
  noonTimer = setTimeout(async () => {
    await loadState();
    scheduleNoonAlert(alertTime);
  }, msUntilNextAlert(alertTime) + 1000);
}

async function start() {
  const state = await loadState();
  scheduleNoonAlert(state.config.alertTime);
}

start();
