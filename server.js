// Starts Express, serves public/ as static files, and mounts the API.
// Knows nothing about storage or ranking itself — it delegates to src/.

const express = require("express");
const path = require("path");
const routes = require("./src/routes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/api", routes);

app.use((err, req, res, next) => {
  if (err.code === "MALFORMED_DATA") {
    return res.status(500).json({ error: err.message });
  }
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "The request body was not valid JSON." });
  }
  console.error(err);
  res.status(500).json({ error: "Something went wrong on the server." });
});

app.listen(PORT, () => {
  console.log(`Issue Alert is running at http://localhost:${PORT}`);
});
