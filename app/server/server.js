require("dotenv").config();

const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");
const cors = require("cors");

const keycloak = require("./keycloak");

const userRouter = require("./routes/user");
const licenceTypesRouter = require("./routes/licenceTypes");
const licenceStatusesRouter = require("./routes/licenceStatuses");
const licencesRouter = require("./routes/licences");
const sitesRouter = require("./routes/sites");
const regionalDistrictsRouter = require("./routes/regionalDistricts");
const regionsRouter = require("./routes/regions");
const statusRouter = require("./routes/status");
const commentsRouter = require("./routes/comments");
const licenceSpeciesRouter = require("./routes/licenceSpecies");
const documentsRouter = require("./routes/documents");
const citiesRouter = require("./routes/cities");
const adminRouter = require("./routes/admin");
const dairyFarmTestThresholdsRouter = require("./routes/dairyFarmTestThresholds");
const constants = require("./utilities/constants");

const roleValidation = require("./middleware/roleValidation");

const app = express();

app.use(cors());
app.options("*", cors()); // enable for all pre-flight requests

app.use(keycloak.middleware({}));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/api/user", keycloak.protect(), userRouter);
app.use("/api/licence-types", keycloak.protect(), licenceTypesRouter);
app.use("/api/licence-statuses", keycloak.protect(), licenceStatusesRouter);
app.use("/api/licences", keycloak.protect(), licencesRouter);
app.use("/api/sites", keycloak.protect(), sitesRouter);
app.use("/api/regional-districts", keycloak.protect(), regionalDistrictsRouter);
app.use("/api/regions", keycloak.protect(), regionsRouter);
app.use("/api/status", keycloak.protect(), statusRouter);
app.use("/api/comments", keycloak.protect(), commentsRouter.router);
app.use("/api/licence-species", keycloak.protect(), licenceSpeciesRouter);
app.use("/api/documents", keycloak.protect(), documentsRouter);
app.use("/api/cities", keycloak.protect(), citiesRouter);
app.use(
  "/api/dairyfarmtestthresholds",
  keycloak.protect(),
  dairyFarmTestThresholdsRouter
);
app.use(
  "/api/admin",
  keycloak.protect(),
  roleValidation([constants.SYSTEM_ROLES.SYSTEM_ADMIN]),
  adminRouter
);
app.use("/api/*", keycloak.protect(), (req, res) => {
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
