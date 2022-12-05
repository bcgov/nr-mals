require("dotenv").config();

const express = require("express");
const httpContext = require("express-http-context");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const helmet = require("helmet");

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
const slaughterhouseSpeciesRouter = require("./routes/slaughterhouseSpecies");
const documentsRouter = require("./routes/documents");
const citiesRouter = require("./routes/cities");
const adminRouter = require("./routes/admin");
const dairyFarmTestThresholdsRouter = require("./routes/dairyFarmTestThresholds");
const inspectionsRouter = require("./routes/inspections");
const constants = require("./utilities/constants");
const roleValidation = require("./middleware/roleValidation");


const app = express();
app.disable("x-powered-by");

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "default-src": [
          "self",
          "https://mals.nrs.gov.bc.ca/",
          "https://*.silver.devops.gov.bc.ca/",
          "https://*.oidc.gov.bc.ca/",
          "https://oidc.gov.bc.ca/",
          "https://loginproxy.gov.bc.ca/",
          "https://*.loginproxy.gov.bc.ca/",
        ],
        "script-src": [
          "'self'",
          "mals.nrs.gov.bc.ca",
          "*.silver.devops.gov.bc.ca",
          "*.oidc.gov.bc.ca",
          "oidc.gov.bc.ca",
          "https://loginproxy.gov.bc.ca/",
          "https://*.loginproxy.gov.bc.ca/",
        ],
      },
    },
    xssFilter: false,
  })
);

app.use(function (req, res, next) {
  res.setHeader("X-XSS-Protection", "1");
  next();
});

app.use(keycloak.middleware({}));
app.use(logger("dev"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false, limit: "50mb" }));
app.use(cookieParser());
app.use(httpContext.middleware);

app.use(function (req, res, next) {
  if (req.headers.currentuser) {
    httpContext.set("currentUser", req.headers.currentuser);
  }
  next();
});

// Health check route for readiness and liveness probes
app.get("/hc", (req, res) => {
  res.send("Health check OK");
});

app.use("/api/user", keycloak.protect(), userRouter);
app.use(
  "/api/licence-types",
  keycloak.protect(),
  roleValidation([
    constants.SYSTEM_ROLES.READ_ONLY,
    constants.SYSTEM_ROLES.USER,
    constants.SYSTEM_ROLES.INSPECTOR,
    constants.SYSTEM_ROLES.SYSTEM_ADMIN,
  ]),
  licenceTypesRouter
);
app.use(
  "/api/licence-statuses",
  keycloak.protect(),
  roleValidation([
    constants.SYSTEM_ROLES.READ_ONLY,
    constants.SYSTEM_ROLES.USER,
    constants.SYSTEM_ROLES.INSPECTOR,
    constants.SYSTEM_ROLES.SYSTEM_ADMIN,
  ]),
  licenceStatusesRouter
);
app.use(
  "/api/licences",
  keycloak.protect(),
  roleValidation([
    constants.SYSTEM_ROLES.READ_ONLY,
    constants.SYSTEM_ROLES.USER,
    constants.SYSTEM_ROLES.INSPECTOR,
    constants.SYSTEM_ROLES.SYSTEM_ADMIN,
  ]),
  licencesRouter
);
app.use(
  "/api/sites",
  keycloak.protect(),
  roleValidation([
    constants.SYSTEM_ROLES.READ_ONLY,
    constants.SYSTEM_ROLES.USER,
    constants.SYSTEM_ROLES.INSPECTOR,
    constants.SYSTEM_ROLES.SYSTEM_ADMIN,
  ]),
  sitesRouter
);
app.use(
  "/api/regional-districts",
  keycloak.protect(),
  roleValidation([
    constants.SYSTEM_ROLES.READ_ONLY,
    constants.SYSTEM_ROLES.USER,
    constants.SYSTEM_ROLES.INSPECTOR,
    constants.SYSTEM_ROLES.SYSTEM_ADMIN,
  ]),
  regionalDistrictsRouter
);
app.use(
  "/api/regions",
  keycloak.protect(),
  roleValidation([
    constants.SYSTEM_ROLES.READ_ONLY,
    constants.SYSTEM_ROLES.USER,
    constants.SYSTEM_ROLES.INSPECTOR,
    constants.SYSTEM_ROLES.SYSTEM_ADMIN,
  ]),
  regionsRouter
);
app.use("/api/status", keycloak.protect(), statusRouter);
app.use(
  "/api/comments",
  keycloak.protect(),
  roleValidation([
    constants.SYSTEM_ROLES.READ_ONLY,
    constants.SYSTEM_ROLES.USER,
    constants.SYSTEM_ROLES.INSPECTOR,
    constants.SYSTEM_ROLES.SYSTEM_ADMIN,
  ]),
  commentsRouter.router
);
app.use(
  "/api/licence-species",
  keycloak.protect(),
  roleValidation([
    constants.SYSTEM_ROLES.READ_ONLY,
    constants.SYSTEM_ROLES.USER,
    constants.SYSTEM_ROLES.INSPECTOR,
    constants.SYSTEM_ROLES.SYSTEM_ADMIN,
  ]),
  licenceSpeciesRouter
);
app.use(
  "/api/slaughterhouse-species",
  keycloak.protect(),
  roleValidation([
    constants.SYSTEM_ROLES.READ_ONLY,
    constants.SYSTEM_ROLES.USER,
    constants.SYSTEM_ROLES.INSPECTOR,
    constants.SYSTEM_ROLES.SYSTEM_ADMIN,
  ]),
  slaughterhouseSpeciesRouter
);
app.use(
  "/api/documents",
  keycloak.protect(),
  roleValidation([
    constants.SYSTEM_ROLES.READ_ONLY,
    constants.SYSTEM_ROLES.USER,
    constants.SYSTEM_ROLES.INSPECTOR,
    constants.SYSTEM_ROLES.SYSTEM_ADMIN,
  ]),
  documentsRouter
);
app.use(
  "/api/cities",
  keycloak.protect(),
  roleValidation([
    constants.SYSTEM_ROLES.READ_ONLY,
    constants.SYSTEM_ROLES.USER,
    constants.SYSTEM_ROLES.INSPECTOR,
    constants.SYSTEM_ROLES.SYSTEM_ADMIN,
  ]),
  citiesRouter
);
app.use(
  "/api/dairyfarmtestthresholds",
  keycloak.protect(),
  roleValidation([
    constants.SYSTEM_ROLES.READ_ONLY,
    constants.SYSTEM_ROLES.USER,
    constants.SYSTEM_ROLES.INSPECTOR,
    constants.SYSTEM_ROLES.SYSTEM_ADMIN,
  ]),
  dairyFarmTestThresholdsRouter
);
app.use(
  "/api/inspections",
  keycloak.protect(),
  roleValidation([
    constants.SYSTEM_ROLES.READ_ONLY,
    constants.SYSTEM_ROLES.USER,
    constants.SYSTEM_ROLES.INSPECTOR,
    constants.SYSTEM_ROLES.SYSTEM_ADMIN,
  ]),
  inspectionsRouter
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
