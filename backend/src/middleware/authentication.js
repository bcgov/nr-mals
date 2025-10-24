const Problem = require("api-problem");
const keycloak = require("../keycloak");

const currentUser = async (req, res, next) => {
  const authorization = req.get("Authorization");

  if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
    try {
      const bearerToken = authorization.substring(7).trim();
      const payload = await keycloak.verifyAccessToken(bearerToken);

      req.currentUser = Object.freeze(payload);
      req.accessToken = bearerToken;
      return next();
    } catch (err) {
      console.error("JWT Validation Error:", err.message);
      return new Problem(403, { detail: err.message }).send(res);
    }
  } else {
    return new Problem(403, { detail: "Invalid authorization token" }).send(
      res
    );
  }
};

module.exports = {
  currentUser,
};
