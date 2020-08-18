const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const statusRouter = require("./routes/status");

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/api/status", statusRouter);
app.use("/api/*", (req, res) => {
  res.status(404).send({
    code: 404,
    description: "The requested endpoint could not be found.",
  });
});

// serve client
app.use(express.static(path.join(__dirname, "../client/build")));
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});

module.exports = app;
