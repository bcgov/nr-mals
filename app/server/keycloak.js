const Keycloak = require("keycloak-connect");

const getKeycloakConfig = () => {
  let config;
  if (process.env.ENVIRONMENT_LABEL === "dev") {
    config = {
      confidentialPort: 0,
      authServerUrl: "https://dev.loginproxy.gov.bc.ca/auth",
      realm: "standard",
      sslRequired: "external",
      publicClient: true,
      resource: "mals-4443"
    };
  }
  if (process.env.ENVIRONMENT_LABEL === "test") {
    config = {
      realm: "ichqx89w",
      authServerUrl: "https://test.oidc.gov.bc.ca/auth/",
      sslRequired: "external",
      resource: "mals",
      publicClient: true,
      confidentialPort: 0,
    };
  }
  if (process.env.ENVIRONMENT_LABEL === "prod") {
    config = {
      realm: "ichqx89w",
      authServerUrl: "https://oidc.gov.bc.ca/auth/",
      sslRequired: "external",
      resource: "mals",
      publicClient: true,
      confidentialPort: 0,
    };
  }

  return config;
};

module.exports = new Keycloak({}, getKeycloakConfig());
