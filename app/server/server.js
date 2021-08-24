require("dotenv").config();

const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");
const cors = require("cors");
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
      reportOnly: true,
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "default-src": [
          "self",
          "https://*.silver.devops.gov.bc.ca/",
          "https://dev.oidc.gov.bc.ca/",
        ],
        "script-src": [
          "'self'",
          "*.silver.devops.gov.bc.ca",
          "https://dev.oidc.gov.bc.ca",
        ],
      },
    },
  })
);

var corsWhitelist = [
  "https://*.silver.devops.gov.bc.ca/",
  "https://dev.oidc.gov.bc.ca/",
];

if (process.env.ENVIRONMENT_LABEL === "dev") {
  corsWhitelist.push("http://127.0.0.1:3000/");
  corsWhitelist.push("http://127.0.0.1:3001/");
}

var corsOptions = {
  origin: function (origin, callback) {
    if (!origin || corsWhitelist.indexOf(origin) !== -1) {
      console.log(`${origin} allowed`);
      callback(null, true);
    } else {
      console.log(`${origin} nope`);
      callback(new Error("Not allowed by CORS"));
    }
  },
};

app.use(cors(corsOptions));

app.use(keycloak.middleware({}));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

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
