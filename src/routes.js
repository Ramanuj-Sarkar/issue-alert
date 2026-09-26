// The small set of endpoints the page calls.
// Slice 1: reading state and adding an issue. Complete/discard/order/seen arrive later.

const express = require("express");
const crypto = require("crypto");
const config = require("./config");
const store = require("./store");
const ranking = require("./ranking");
const scheduler = require("./scheduler");

const router = express.Router();

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function validateIssue(body) {
  const errors = {};

  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) errors.title = "Title is required.";

  const description =
    typeof body.description === "string" ? body.description.trim() : "";
  if (!description) errors.description = "Description is required.";

  if (!config.urgencyLevels.includes(body.urgency)) {
    errors.urgency = `Urgency must be one of: ${config.urgencyLevels.join(", ")}.`;
  }
  if (!config.difficultyLevels.includes(body.difficulty)) {
    errors.difficulty = `Difficulty must be one of: ${config.difficultyLevels.join(", ")}.`;
  }

  const deadline =
    typeof body.deadline === "string" ? body.deadline.trim() : "";
  if (deadline && !isValidDate(deadline)) {
    errors.deadline = "Deadline must be a real date in YYYY-MM-DD, or blank.";
  }

  return {
    errors,
    value: {
      title,
      description,
      urgency: body.urgency,
      difficulty: body.difficulty,
      deadline: deadline || null,
      rankingExplanation:
        typeof body.rankingExplanation === "string"
          ? body.rankingExplanation.trim()
          : "",
    },
  };
}

function daysAgo(count) {
  return Date.now() - count * 24 * 60 * 60 * 1000;
}

function countersFor(history) {
  const since = daysAgo(2);
  const recent = history.filter((entry) => new Date(entry.at).getTime() >= since);
  return {
    completed: recent.filter((entry) => entry.outcome === "completed").length,
    discarded: recent.filter((entry) => entry.outcome === "discarded").length,
  };
}

router.get("/state", (req, res) => {
  const data = store.load();
  if (scheduler.ensureGenerated(data)) {
    store.save(data);
  }
  res.json({
    issues: ranking.rank(data.issues, config.dailyCount),
    counters: countersFor(data.history),
    badge: scheduler.isBadgeVisible(data),
    config: {
      dailyCount: config.dailyCount,
      alertTime: config.alertTime,
      difficultyLevels: config.difficultyLevels,
      urgencyLevels: config.urgencyLevels,
    },
  });
});

router.post("/seen", (req, res) => {
  const data = store.load();
  data.lastViewedIssuesAt = new Date().toISOString();
  store.save(data);
  res.json({ ok: true });
});

router.post("/issues", (req, res) => {
  const { errors, value } = validateIssue(req.body || {});
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: "Please fix the highlighted fields.", fields: errors });
  }

  const issue = {
    id: crypto.randomUUID(),
    ...value,
    manualRank: null,
    status: "active",
    createdAt: new Date().toISOString(),
  };

  const data = store.load();
  data.issues.push(issue);
  store.save(data);

  res.status(201).json({ issue });
});

module.exports = router;
