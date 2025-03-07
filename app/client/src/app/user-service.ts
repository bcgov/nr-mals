import { initializeKeycloak, getKeycloak } from "./keycloak";

// export const AUTH_TOKEN = "__auth_token";

const initKeycloak = async () => {
  try {
    const { keycloak, authenticated } = await initializeKeycloak();

    if (!keycloak) {
      console.error("Keycloak failed to initialize.");
      return;
    }

    if (authenticated) {
      console.log("User is authenticated");
      // localStorage.setItem(AUTH_TOKEN, keycloak.token);
    } else {
      console.log("User is not authenticated.");
      // window.location.href = await keycloak.createLoginUrl();
    }

    return { keycloak, authenticated };
  } catch (error) {
    console.error("Error in initKeycloak:", error);
    throw error;
  }
};

const doLogin = () => getKeycloak()?.login();

const doLogout = () => {
  // localStorage.removeItem(AUTH_TOKEN);
  return getKeycloak()?.logout();
};

const getToken = () => getKeycloak()?.token;

const isLoggedIn = () => !!getKeycloak()?.token;

const updateToken = (
  successCallback:
    | ((value: boolean) => boolean | PromiseLike<boolean>)
    | null
    | undefined
) => {
  const kc = getKeycloak();
  if (!kc) return Promise.reject("Keycloak not initialized");

  return kc
    .updateToken(5)
    .then((refreshed: boolean) => {
      // if (refreshed) {
      //   localStorage.setItem(AUTH_TOKEN, kc.token);
      // }
      return successCallback ? successCallback(refreshed) : refreshed;
    })
    .catch(() => {
      doLogin();
      return Promise.reject("Token refresh failed");
    });
};

/**
 * Determines if a user's role(s) overlap with the role on the private route.
 * The user's role is determined via jwt.client_roles
 *
 * @param roles - Single role string or array of role strings
 * @returns True or false, indicating if the user has the role or not.
 */
const hasRole = (roles: string | string[]) => {
  const jwt = getKeycloak()?.tokenParsed;
  if (!jwt || !jwt.client_roles) return false;

  const userRoles = jwt.client_roles as string[];

  return typeof roles === "string"
    ? userRoles.includes(roles)
    : roles.some((role: string) => userRoles.includes(role));
};

const getIdirUsername = () => getKeycloak()?.idTokenParsed?.idir_username;

const UserService = {
  initKeycloak,
  doLogin,
  doLogout,
  isLoggedIn,
  getToken,
  updateToken,
  hasRole,
  getIdirUsername,
};

export default UserService;
