import Keycloak from 'keycloak-js'

function GetKeycloakConfig(environment) {
  let kcConfig = null

  if (environment === 'dev') {
    kcConfig = '/keycloak_dev.json'
  } else if (environment === 'test') {
    kcConfig = '/keycloak_test.json'
  } else if (environment === 'prod') {
    kcConfig = '/keycloak_prod.json'
  }

  return kcConfig
}

let _keycloak = undefined
let ready = false
let refreshJobInterval = undefined

async function login() {
  const redirectUrl = await _keycloak.createLoginUrl({
    redirectUri: `${window.location.origin}/`,
  })
  window.location.replace(redirectUrl)
}

async function logout() {
  if (ready) {
    window.location.replace(
      await _keycloak.createLogoutUrl({
        redirectUri: `${window.location.origin}/`,
      }),
    )
  }
}

const getKeycloak = () => {
  return _keycloak
}

async function init(environment) {
  try {
    _keycloak = new Keycloak(GetKeycloakConfig(environment))
    const authenticated = await _keycloak.init({
      onLoad: 'check-sso',
      pkceMethod: 'S256',
      checkLoginIframe: false,
    })

    if (authenticated) {
      ready = true
    } else {
      ready = false
    }

    _keycloak.onTokenExpired = async () => {
      try {
        await _keycloak.updateToken(5)
      } catch (error) {
        console.error('Failed to refresh token:', error)
        clearInterval(refreshJobInterval)
      }
    }

    refreshJobInterval = setInterval(async () => {
      if (_keycloak && _keycloak.token) {
        try {
          await _keycloak.updateToken(70)
        } catch (error) {
          console.error('Failed to refresh token:', error)
          clearInterval(refreshJobInterval)
        }
      }
    }, 10000)
  } catch (err) {
    console.error('Keycloak initialization failed:', err)
  }
}

const keycloak = {
  GetKeycloakConfig,
  init,
  login,
  logout,
  getKeycloak,
  ready,
}

export default keycloak
