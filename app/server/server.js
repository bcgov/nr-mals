const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const statusRouter = require("./routes/status");
const licenceTypesRouter = require("./routes/licenceTypes");
const licenceStatusesRouter = require("./routes/licenceStatuses");
const regionalDistrictsRouter = require("./routes/regionalDistricts");
const regionsRouter = require("./routes/regions");

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/api/status", statusRouter);
app.use("/api/licence-types", licenceTypesRouter);
app.use("/api/licence-statuses", licenceStatusesRouter);
app.use("/api/regional-districts", regionalDistrictsRouter);
app.use("/api/regions", regionsRouter);
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

// eslint-disable-next-line no-unused-vars
app.use(function handleError(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  return res.status(500).send({
    code: 500,
    description: "An unexpected error occurred while handling the request.",
  });
});

module.exports = app;
