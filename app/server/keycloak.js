const Keycloak = require("keycloak-connect");

const getKeycloakConfig = () => {
  if (process.env.ENVIRONMENT_LABEL === "dev") {
    return {
      realm: "ichqx89w",
      authServerUrl: "https://dev.oidc.gov.bc.ca/auth/",
      sslRequired: "external",
      resource: "mals",
      publicClient: true,
      confidentialPort: 0,
    };
  } else if (
    process.env.ENVIRONMENT_LABEL === "test" ||
    process.env.ENVIRONMENT_LABEL === "uat"
  ) {
    return {
      realm: "ichqx89w",
      authServerUrl: "https://test.oidc.gov.bc.ca/auth/",
      sslRequired: "external",
      resource: "mals",
      publicClient: true,
      confidentialPort: 0,
    };
  } else if (process.env.ENVIRONMENT_LABEL === "prod") {
    return {
      realm: "ichqx89w",
      authServerUrl: "https://oidc.gov.bc.ca/auth/",
      sslRequired: "external",
      resource: "mals",
      publicClient: true,
      confidentialPort: 0,
    };
  }
};

module.exports = new Keycloak({}, getKeycloakConfig());
