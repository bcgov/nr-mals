import Keycloak from "keycloak-js";

function GetKeycloakConfig() {
  let kcConfig = null;

  if (process.env.REACT_APP_ENVIRONMENT_LABEL === "dev") {
    kcConfig = "/keycloak_dev.json";
  } else if (
    process.env.REACT_APP_ENVIRONMENT_LABEL === "test" ||
    process.env.REACT_APP_ENVIRONMENT_LABEL === "uat"
  ) {
    kcConfig = "/keycloak_test.json";
  } else if (process.env.REACT_APP_ENVIRONMENT_LABEL === "prod") {
    kcConfig = "/keycloak_prod.json";
  }

  return kcConfig;
}

const kc = new Keycloak(GetKeycloakConfig());

function doLogin() {
  window.location.replace(kc.createLoginUrl({
    redirectUri: `${window.location.origin}/`,
  }));
}
function doLogout() {
  window.location.replace(
    kc.createLogoutUrl({
      redirectUri: `${window.location.origin}/`,
    })
  );
}

const isLoggedIn = () => !!kc.token;

const getToken = () => kc.token;
const getTokenParsed = () => kc.tokenParsed;
const updateToken = (successCallback) =>
  kc.updateToken(5).then(successCallback).catch(doLogin);

const getUsername = () => kc.tokenParsed?.idir_username;
const getName = () => kc.tokenParsed?.name;


const hasRealmRole = (roles) => roles.some((role) => kc.hasRealmRole(role));

const init = (onAuthenticatedCallback) => {
  kc.init({
    // onLoad: "check-sso",
    // silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
    onLoad: "login-required",
    pkceMethod: "S256",
  }).then((authenticated) => {
    if (authenticated) {
      onAuthenticatedCallback();
    } else {
      doLogin();
    }
  });
};

const keycloak = {
  init,
  doLogin,
  doLogout,
  isLoggedIn,
  getToken,
  getTokenParsed,
  updateToken,
  getUsername,
  getName,
  hasRealmRole,
};

export default keycloak;
