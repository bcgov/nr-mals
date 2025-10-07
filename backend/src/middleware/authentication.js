const Problem = require("api-problem");
const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");
const keycloak = require("../keycloak");

const client = jwksClient({
  jwksUri: `${keycloak.config.realmUrl}/protocol/openid-connect/certs`,
});

const getKey = async (header) => {
  try {
    const key = await client.getSigningKey(header.kid);
    const signingKey = key.publicKey || key.rsaPublicKey;
    return signingKey;
  } catch (err) {
    console.error("Error fetching JWKS key:", err);
    throw err;
  }
};

const currentUser = async (req, res, next) => {
  console.log(`Auth middleware: ${req.method} ${req.path}`);
  const authorization = req.get("Authorization");
  let isValid = null;

  if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
    try {
      const bearerToken = authorization.substring(7);
      const decodedHeader = jwt.decode(bearerToken, { complete: true });
      if (!decodedHeader) {
        throw new Error("Invalid JWT format");
      }
      const publicKey = await getKey(decodedHeader.header);

      isValid = jwt.verify(bearerToken, publicKey, {
        issuer: keycloak.config.realmUrl,
        algorithms: ["RS256"],
      });

      if (isValid) {
        const user = jwt.decode(bearerToken);
        req.currentUser = Object.freeze(user);
      }
    } catch (err) {
      console.error(`Auth error for ${req.method} ${req.path}:`, err.message);
      return new Problem(403, { detail: err.message }).send(res);
    }
  } else {
    console.error(`No authorization header for ${req.method} ${req.path}`);
    return new Problem(403, { detail: "Invalid authorization token" }).send(
      res
    );
  }
  if (isValid) {
    console.log(`Auth success for ${req.method} ${req.path}`);
    next();
  } else {
    console.error(`Auth failed for ${req.method} ${req.path}: invalid token`);
    return new Problem(403, { detail: "Invalid authorization token" }).send(
      res
    );
  }
};

module.exports = {
  currentUser,
};
