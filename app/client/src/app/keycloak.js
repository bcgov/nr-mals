import Keycloak from "keycloak-js";

let _kc = null;
let isAuthenticated = false;

const initializeKeycloak = async () => {
  try {
    if (_kc) {
      return { keycloak: _kc, authenticated: isAuthenticated };
    }

    const environment = process.env.ENVIRONMENT_LABEL;

    let keycloakConfig;
    switch (environment) {
      case "prod":
        keycloakConfig = await import("./keycloak-config/keycloak_prod.json");
        break;
      case "test":
        keycloakConfig = await import("./keycloak-config/keycloak_test.json");
        break;
      case "dev":
      default:
        keycloakConfig = await import("./keycloak-config/keycloak_dev.json");
        break;
    }

    _kc = new Keycloak({
      url: keycloakConfig["auth-server-url"],
      realm: keycloakConfig["realm"],
      clientId: keycloakConfig["resource"],
    });

    isAuthenticated = await _kc.init({
      onLoad: "check-sso",
      pkceMethod: "S256",
      checkLoginIframe: false,
    });

    if (isAuthenticated) {
      setInterval(() => {
        _kc.updateToken(70).catch(() => {
          console.log("Token refresh failed");
          _kc.logout();
        });
      }, 30000); // 30 seconds

      _kc.onTokenExpired = async () => {
        try {
          const refreshed = await _kc.updateToken(5);
          if (refreshed) {
            console.log("Token refreshed");
            localStorage.setItem("__auth_token", _kc.token);
          }
        } catch (error) {
          console.error("Token refresh failed", error);
          // _kc.login();
        }
      };
    }

    return { keycloak: _kc, authenticated: isAuthenticated };
  } catch (error) {
    console.error("Failed to initialize Keycloak:", error);
    throw error;
  }
};

const getKeycloak = () => {
  return _kc;
};

export { initializeKeycloak, getKeycloak };
