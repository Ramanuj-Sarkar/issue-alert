// The on-open noon check. There is no background service: whenever the page asks
// for the list, we check whether today's list is due and, if so, mark today as
// generated. The badge shows when a generation has happened since you last looked.

const config = require("./config");

function todayString(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function alertTimeParts() {
  const [hours, minutes] = config.alertTime.split(":").map(Number);
  return { hours, minutes: minutes || 0 };
}

function isAtOrAfterAlertTime(now) {
  const { hours, minutes } = alertTimeParts();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return nowMinutes >= hours * 60 + minutes;
}

// Mutates `data` and returns true when it generated today's list.
function ensureGenerated(data, now = new Date()) {
  const today = todayString(now);
  if (data.lastGeneratedDate === today) return false;
  if (!isAtOrAfterAlertTime(now)) return false;
  data.lastGeneratedDate = today;
  return true;
}

// The moment of the last generation: its date, at the alert time.
function lastGenerationMoment(data) {
  if (!data.lastGeneratedDate) return null;
  const { hours, minutes } = alertTimeParts();
  const moment = new Date(`${data.lastGeneratedDate}T00:00:00`);
  moment.setHours(hours, minutes, 0, 0);
  return moment;
}

function isBadgeVisible(data) {
  const generatedAt = lastGenerationMoment(data);
  if (!generatedAt) return false;
  const viewedAt = data.lastViewedIssuesAt ? new Date(data.lastViewedIssuesAt) : null;
  if (!viewedAt) return true;
  return viewedAt.getTime() < generatedAt.getTime();
}

module.exports = { ensureGenerated, isBadgeVisible, todayString };
