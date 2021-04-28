import Keycloak from "keycloak-js";

const kc = new Keycloak(`/keycloak.json`);

const doLogin = kc.login;
const doLogout = kc.logout;
const isLoggedIn = () => !!kc.token;

const getToken = () => kc.token;
const updateToken = (successCallback) =>
  kc.updateToken(5).then(successCallback).catch(doLogin);

const getUsername = () => kc.tokenParsed?.preferred_username;
const getName = () => kc.tokenParsed?.name;

const hasRole = (roles) => roles.some((role) => kc.hasRealmRole(role));

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
  updateToken,
  getUsername,
  getName,
  hasRole,
};

export default keycloak;
