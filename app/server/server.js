require("dotenv").config();

const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const licenceTypesRouter = require("./routes/licenceTypes");
const licenceStatusesRouter = require("./routes/licenceStatuses");
const licencesRouter = require("./routes/licences");
const sitesRouter = require("./routes/sites");
const regionalDistrictsRouter = require("./routes/regionalDistricts");
const regionsRouter = require("./routes/regions");
const statusRouter = require("./routes/status");
const commentsRouter = require("./routes/comments");
const gameFarmRouter = require("./routes/gameFarm");
const furFarmRouter = require("./routes/furFarm");
const documentsRouter = require("./routes/documents");
const citiesRouter = require("./routes/cities");

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/api/licence-types", licenceTypesRouter);
app.use("/api/licence-statuses", licenceStatusesRouter);
app.use("/api/licences", licencesRouter);
app.use("/api/sites", sitesRouter);
app.use("/api/regional-districts", regionalDistrictsRouter);
app.use("/api/regions", regionsRouter);
app.use("/api/status", statusRouter);
app.use("/api/comments", commentsRouter.router);
app.use("/api/game-farm", gameFarmRouter);
app.use("/api/fur-farm", furFarmRouter);
app.use("/api/documents", documentsRouter);
app.use("/api/cities", citiesRouter);
app.use("/api/*", (req, res) => {
  res.status(404).send({
    code: 404,
    description: "The requested endpoint could not be found.",
  });
});

// serve static files
app.use(express.static("static"));

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

  let description = "An unexpected error occurred while handling the request.";
  if (
    process.env.ENVIRONMENT_LABEL === "dev" ||
    process.env.ENVIRONMENT_LABEL === "test" ||
    process.env.ENVIRONMENT_LABEL === "uat"
  ) {
    description = error.message;
  }

  return res.status(500).send({
    code: 500,
    description,
  });
});

module.exports = app;
