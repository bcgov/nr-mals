require("dotenv").config();

const express = require("express");
const Problem = require("api-problem");
const httpContext = require("express-http-context");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const helmet = require("helmet");
const cors = require("cors");

const appRouter = require("./routes/v1");
const { Error, Log, getGitRevision } = require("./utilities/util");

const apiRouter = express.Router();
const state = {
  gitRev: getGitRevision(),
  ready: false,
  shutdown: false,
};

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
          "loginproxy.gov.bc.ca",
          "*.loginproxy.gov.bc.ca/",
        ],
      },
    },
    xssFilter: false,
  }),
);

app.use(function (req, res, next) {
  res.setHeader("X-XSS-Protection", "1");
  next();
});

app.use(
  cors({
    origin: true, // Set true to dynamically set Access-Control-Allow-Origin based on Origin
  }),
);
app.use(logger("dev"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false, limit: "50mb" }));
app.use(cookieParser());
app.use(httpContext.middleware);

// Skip if running tests
if (process.env.NODE_ENV !== "test") {
  // Initialize connections and exit if unsuccessful
  initializeConnections();
}

// Block requests until service is ready
app.use((_req, res, next) => {
  if (state.shutdown) {
    new Problem(503, { details: "Server is shutting down" }).send(res);
  } else if (!state.ready) {
    new Problem(503, { details: "Server is not ready" }).send(res);
  } else {
    next();
  }
});

// Health check route for readiness and liveness probes
app.get("/hc", (req, res) => {
  res.send("Health check OK");
});

// app Router
apiRouter.use("/v1/config", (req, res) => {
  const response = {
    environment: process.env.ENVIRONMENT_LABEL || "dev",
    nodeVersion: process.version,
    version: process.env.npm_package_version,
  };
  return res.send(response);
});

// Debug middleware to track requests
apiRouter.use("/v1", (req, res, next) => {
  console.log("DEBUG: Request reached v1 router:", req.method, req.path);
  next();
});

apiRouter.use("/v1", appRouter);

// Root level Router
app.use(/(\/api)?/, apiRouter);

app.use("/api/*", (req, res) => {
  res.status(404).send({
    code: 404,
    description: "The requested endpoint could not be found.",
  });
});

// serve static files
app.use(express.static("static"));

// eslint-disable-next-line no-unused-vars
app.use(function handleError(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  // Always log the full error to console for debugging
  console.error("ERROR HANDLER - Full error details:");
  console.error("Error type:", typeof error);
  console.error("Error constructor:", error?.constructor?.name);
  console.error("Error object:", error);
  console.error("Error message:", error.message);
  console.error("Error stack:", error.stack);
  console.error("Request URL:", req.originalUrl);
  console.error("Request method:", req.method);

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

// Graceful shutdown support
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
process.on("SIGUSR1", shutdown);
process.on("SIGUSR2", shutdown);
process.on("exit", () => {
  Log("Exiting...");
});

/**
 * @function cleanup
 * Cleans up connections in this application.
 */
function cleanup() {
  Log("Service no longer accepting traffic");
  state.shutdown = true;

  Log("Cleaning up...");

  // Wait 10 seconds max before hard exiting
  setTimeout(() => process.exit(), 10000);
}

/**
 * @function shutdown
 * Shuts down this application after at least 3 seconds.
 */
function shutdown() {
  Log("Received kill signal. Shutting down...");
  // Wait 3 seconds before starting cleanup
  if (!state.shutdown) setTimeout(cleanup, 3000);
}

/**
 * @function initializeConnections
 * Initializes any connections
 * This will force the application to exit if it fails
 */
function initializeConnections() {
  try {
    // Empty block
  } catch (error) {
    Error("Connection initialization failure");
    Error(error.message);
    if (!state.ready) {
      process.exitCode = 1;
      shutdown();
    }
  } finally {
    state.ready = true;
    if (state.ready) {
      Log("Service ready to accept traffic");
    }
  }
}

module.exports = app;
