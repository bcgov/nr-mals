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
        "secret": "lJV6T9qXUVgkffHPomp5Vv6QWZ8pceLD"
      },
      realmPublicKey: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuy7zfh2ZgpDV5mH/aXyLDTddZK81rGakJcTy4KvCNOkDDxt1KAhW02lmbCo8YhHCOzjNZBp1+Vi6QiMRgBqAe2GTPZYEiV70aXfROGZe3Nvwcjbtki6HoyRte3SpqLJEIPL2F+hjJkw1UPGnjPTWZkEx9p74b9i3BjuE8RnjJ0Sza2MWw83zoQUZEJRGiopSL0yuVej6t2LO2btVdVf7QuZfPt9ehkcQYlPKpVvJA+pfeqPAdnNt7OjEIeYxinjurZr8Z04hz8UhkRefcWlSbFzFQYmL7O7iArjW0bsSvq8yNUd5r0KCOQkFduwZy26yTzTxj8OLFT91fEmbBBl4rQIDAQAB"
    }
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
