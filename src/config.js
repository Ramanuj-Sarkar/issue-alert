// Code-level settings. Change a value, restart the app, and behavior changes.
// Issue data lives in data/issues.json instead — these are the knobs that shape it.

module.exports = {
  // How many issues the daily list shows.
  dailyCount: 6,

  // The local time of day the daily list is generated, in 24-hour "HH:MM".
  alertTime: "12:00",

  // The allowed values for the two ranked fields. Order is low to high.
  difficultyLevels: ["Low", "Medium", "High"],
  urgencyLevels: ["Low", "Medium", "High"],
};
