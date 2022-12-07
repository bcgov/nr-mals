const Problem = require('api-problem');
const jwt = require('jsonwebtoken');
const keycloak = require('../keycloak');

const spkiWrapper = (spki) => `-----BEGIN PUBLIC KEY-----\n${spki}\n-----END PUBLIC KEY-----`;

const currentUser = async (req, res, next) => {
  const authorization = req.get('Authorization');
  let isValid = false;

  if (authorization) {
    // OIDC JWT Authorization
    if (authorization.toLowerCase().startsWith('bearer ')) {
      try {
        const bearerToken = authorization.substring(7);

        if (keycloak.publicKey) {
          const { publicKey } = keycloak;
          const pemKey = publicKey.startsWith('-----BEGIN')
            ? publicKey
            : spkiWrapper(publicKey);
          isValid = jwt.verify(bearerToken, pemKey, {
            issuer: `https://dev.loginproxy.gov.bc.ca/auth/realms/standard`
          });
        } else {
          isValid = await keycloak.grantManager.validateAccessToken(bearerToken);
        }

        // Inject currentUser data into request
        if (isValid) {
          const user = jwt.decode(bearerToken);
          req.currentUser = Object.freeze(user);
        }
      } catch (err) {
        return new Problem(403, { detail: err.message }).send(res);
      }
    }
  }

  if (isValid) {
    next();
  }
  else {
    return new Problem(403, { detail: 'Invalid authorization token' }).send(res);
  }
};

module.exports = {
  currentUser
};
