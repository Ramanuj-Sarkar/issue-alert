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

// The daily list. The automatic ranking first decides *which* issues make the
// list (the top `dailyCount` by age/urgency/difficulty/deadline). Manual order
// then decides their arrangement: issues placed by hand keep their position,
// and the unplaced ones fill the gaps around them in automatic order. Because
// selection happens before arrangement, a new issue can always surface.
function rank(issues, dailyCount) {
  const active = issues.filter((issue) => issue.status === "active");
  const autoOrder = [...active].sort(autoCompare);
  const selected = autoOrder.slice(0, dailyCount);

  const placed = selected
    .filter((issue) => issue.manualRank != null)
    .sort((a, b) => a.manualRank - b.manualRank);
  const unplaced = selected.filter((issue) => issue.manualRank == null);

  if (placed.length === 0) return selected;

  const slots = new Array(selected.length).fill(null);
  for (const issue of placed) {
    let target = Math.min(Math.max(issue.manualRank, 0), slots.length - 1);
    while (target < slots.length && slots[target]) target++;
    if (target >= slots.length) target = slots.indexOf(null);
    if (target >= 0) slots[target] = issue;
  }

  let next = 0;
  for (let i = 0; i < slots.length; i++) {
    if (!slots[i]) slots[i] = unplaced[next++];
  }
  return slots;
}

module.exports = { rank, autoCompare, daysSinceCreated, daysUntil };
