import Keycloak from "keycloak-js";

function GetKeycloakConfig(environment) {
  let kcConfig = null;

  if (environment === "dev") {
    kcConfig = "/keycloak_dev.json";
  } else if (environment === "test") {
    kcConfig = "/keycloak_test.json";
  } else if (environment === "prod") {
    kcConfig = "/keycloak_prod.json";
  }

  return kcConfig;
}


let _keycloak = undefined;
let ready = false;
let refreshJobInterval = undefined;

function login() {
  window.location.replace(_keycloak.createLoginUrl({
    redirectUri: `${window.location.origin}/`,
  }));
}

function logout() {
  if (ready) {
    window.location.replace(
      _keycloak.createLogoutUrl({
        redirectUri: `${window.location.origin}/`,
      })
    );
  }
}

const getKeycloak = () => _keycloak;

async function init(environment) {
  _keycloak = new Keycloak(GetKeycloakConfig(environment));

  // Once KC is set up and connected flag it as 'ready'
  _keycloak.onReady = function (authenticated) {
    ready = authenticated;
  };

  // After a refresh token fetch success
  _keycloak.onAuthRefreshSuccess = function () {
    // console.log(_keycloak.value.token);
  };

  await _keycloak
    .init({
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
      pkceMethod: 'S256'
    })
    .then(() => {
      // Set the state field to the inited keycloak instance

      // Token Refresh
      // Check token validity every 10s and, if necessary, update the token.
      // Refresh token if it's valid for less then 70 seconds
      refreshJobInterval = window.setInterval(() => {
        _keycloak.updateToken(70) // If the token expires within 70 seconds from now get a refreshed
          .then((refreshed) => {
            if (refreshed) {
              console.log('Token refreshed ' + refreshed);
            } else {
              // Don't need to log this unless debugging
              // It's for when the token doesn't need to refresh because not expired enough
              // console.log('Token not refreshed');
            }
          })
          .catch(() => {
            console.error('Failed to refresh token');
          });
      }, 10000); // Check every 10s
    })
    .catch((err) => {
      console.error(`Authenticated Failed ${JSON.stringify(err)}`);
    });
};

const keycloak = {
  GetKeycloakConfig,
  init,
  login,
  logout,
  getKeycloak,
  ready
};

export default keycloak;
