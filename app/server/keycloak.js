const Keycloak = require("keycloak-connect");

const getKeycloakConfig = () => {
  let config;
  if (process.env.ENVIRONMENT_LABEL === "dev") {
    config = {
      bearerOnly: true,
      "confidential-port": 0,
      "auth-server-url": "https://dev.loginproxy.gov.bc.ca/auth",
      "realm": "standard",
      "ssl-required": "external",
      "resource": "mals-4444",
      "credentials": {
        "secret": process.env.KEYCLOAK_SECRET,
      },
      realmPublicKey: process.env.KEYCLOAK_PUBLIC_KEY,
    };
  }
  if (process.env.ENVIRONMENT_LABEL === "test") {
    config = {
      bearerOnly: true,
      "confidential-port": 0,
      "auth-server-url": "https://test.loginproxy.gov.bc.ca/auth",
      "realm": "standard",
      "ssl-required": "external",
      "resource": "mals-4444",
      "credentials": {
        "secret": process.env.KEYCLOAK_SECRET,
      },
      realmPublicKey: process.env.KEYCLOAK_PUBLIC_KEY,
    };
  }
  if (process.env.ENVIRONMENT_LABEL === "prod") {
    config = {
      bearerOnly: true,
      "confidential-port": 0,
      "auth-server-url": "https://loginproxy.gov.bc.ca/auth",
      "realm": "standard",
      "ssl-required": "external",
      "resource": "mals-4444",
      "credentials": {
        "secret": process.env.KEYCLOAK_PUBLIC_KEY,
      },
      realmPublicKey: process.env.KEYCLOAK_PUBLICKEY,
    };
  }

  return config;
};

module.exports = new Keycloak({}, getKeycloakConfig());
