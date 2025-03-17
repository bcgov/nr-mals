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
      console.error("JWT Validation Error:", err.message);
      return new Problem(403, { detail: err.message }).send(res);
    }
  } else {
    return new Problem(403, { detail: "Invalid authorization token" }).send(
      res
    );
  }
  if (isValid) {
    next();
  } else {
    return new Problem(403, { detail: "Invalid authorization token" }).send(
      res
    );
  }
};

module.exports = {
  currentUser,
};
