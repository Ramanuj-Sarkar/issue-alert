// Turns active issues into the ordered daily list.
// Order: days since creation (oldest first) -> urgency (high first)
// -> difficulty (hard first) -> deadline (closest first; no deadline last).
// Manual order is layered on in a later slice.

const LEVEL_RANK = { High: 3, Medium: 2, Low: 1 };
const DAY_MS = 24 * 60 * 60 * 1000;

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

// Whole calendar days since the issue was created. Older means larger.
function daysSinceCreated(issue) {
  if (!issue.createdAt) return 0;
  const created = new Date(issue.createdAt);
  const createdDay = new Date(created.getFullYear(), created.getMonth(), created.getDate());
  return Math.round((startOfToday() - createdDay) / DAY_MS);
}

// How many whole days until the deadline. Negative means overdue.
function daysUntil(deadline) {
  const due = new Date(`${deadline}T00:00:00`);
  return Math.round((due - startOfToday()) / DAY_MS);
}

function deadlineValue(issue) {
  return issue.deadline ? daysUntil(issue.deadline) : Infinity;
}

function autoCompare(a, b) {
  const byAge = daysSinceCreated(b) - daysSinceCreated(a);
  if (byAge !== 0) return byAge;

  const byUrgency = (LEVEL_RANK[b.urgency] || 0) - (LEVEL_RANK[a.urgency] || 0);
  if (byUrgency !== 0) return byUrgency;

  const byDifficulty = (LEVEL_RANK[b.difficulty] || 0) - (LEVEL_RANK[a.difficulty] || 0);
  if (byDifficulty !== 0) return byDifficulty;

  const aDeadline = deadlineValue(a);
  const bDeadline = deadlineValue(b);
  if (aDeadline !== bDeadline) return aDeadline - bDeadline;
  return 0;
}

function rank(issues, dailyCount) {
  const active = issues.filter((issue) => issue.status === "active");
  const ordered = [...active].sort(autoCompare);
  return ordered.slice(0, dailyCount);
}

module.exports = { rank, autoCompare, daysSinceCreated, daysUntil };
