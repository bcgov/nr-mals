const Keycloak = require("keycloak-connect");

const getKeycloakConfig = () => {
  if (process.env.ENVIRONMENT_LABEL === "dev") {
    return {
      realm: "ichqx89w",
      "auth-server-url": "https://dev.oidc.gov.bc.ca/auth/",
      "ssl-required": "external",
      resource: "mals",
      "public-client": true,
      "verify-token-audience": true,
      "use-resource-role-mappings": true,
      "confidential-port": 0,
    };
  } else if (
    process.env.ENVIRONMENT_LABEL === "test" ||
    process.env.ENVIRONMENT_LABEL === "uat"
  ) {
    return {
      realm: "ichqx89w",
      "auth-server-url": "https://test.oidc.gov.bc.ca/auth/",
      "ssl-required": "external",
      resource: "mals",
      "public-client": true,
      "verify-token-audience": true,
      "use-resource-role-mappings": true,
      "confidential-port": 0,
    };
  } else if (process.env.ENVIRONMENT_LABEL === "prod") {
    return {
      realm: "ichqx89w",
      "auth-server-url": "https://oidc.gov.bc.ca/auth/",
      "ssl-required": "external",
      resource: "mals",
      "public-client": true,
      "verify-token-audience": true,
      "use-resource-role-mappings": true,
      "confidential-port": 0,
    };
  }
};

module.exports = new Keycloak({}, getKeycloakConfig());
