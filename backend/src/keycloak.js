const { discovery, ClientSecretBasic, None } = require('openid-client');
const jwksClient = require('jwks-rsa');
const jwt = require('jsonwebtoken');
const DEFAULT_CLIENT_ID = 'mals-4444';

const getEnvironmentLabel = () => process.env.ENVIRONMENT_LABEL?.toLowerCase() || 'dev';
const getIssuerUrl = () => {
  const env = getEnvironmentLabel();
  if (env === 'prod') return 'https://loginproxy.gov.bc.ca/auth/realms/standard';
  if (env === 'test') return 'https://test.loginproxy.gov.bc.ca/auth/realms/standard';
  return 'https://dev.loginproxy.gov.bc.ca/auth/realms/standard';
};
const config = {
  get realmUrl() {
    return getIssuerUrl();
  },
  get jwksUri() {
    return `${getIssuerUrl()}/protocol/openid-connect/certs`;
  },
  get clientId() {
    return process.env.KEYCLOAK_CLIENT_ID || DEFAULT_CLIENT_ID;
  },
  get clientSecret() {
    return process.env.KEYCLOAK_SECRET;
  },
};

const parseEnvAudiences = () =>
  (process.env.KEYCLOAK_ALLOWED_AUDIENCES || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

const normalizeAudienceInput = (input) => {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input
      .map((value) => `${value}`.trim())
      .filter(Boolean);
  }
  return [`${input}`.trim()].filter(Boolean);
};

const buildAllowedAudiences = (optionsAudience) => {
  const audiencesInPriorityOrder = [
    ...normalizeAudienceInput(optionsAudience),
    ...parseEnvAudiences(),
    config.clientId,
  ];

  return Array.from(new Set(audiencesInPriorityOrder)).filter(Boolean);
};

let cachedEnv;
let client;
let jwks;
const resetCachedClientsIfNeeded = () => {
  const currentEnv = getEnvironmentLabel();
  if (cachedEnv && currentEnv !== cachedEnv) {
    client = undefined;
    jwks = undefined;
  }
  cachedEnv = currentEnv;
};

const getJwksClient = () => {
  resetCachedClientsIfNeeded();
  if (!jwks) {
    jwks = jwksClient({
      jwksUri: config.jwksUri,
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 10,
    });
  }
  return jwks;
};

const buildClientMetadata = () => {
  const metadata = {
    token_endpoint_auth_method: config.clientSecret ? 'client_secret_basic' : 'none',
  };

  if (config.clientSecret) {
    metadata.client_secret = config.clientSecret;
  }

  return metadata;
};

const buildClientAuth = () => {
  if (config.clientSecret) {
    return ClientSecretBasic(config.clientSecret);
  }
  return None();
};

const initClient = async () => {
  resetCachedClientsIfNeeded();
  if (client) {
    return client;
  }

  try {
    client = await discovery(new URL(config.realmUrl), config.clientId, buildClientMetadata(), buildClientAuth());

    console.log(`DEBUG: ENVIRONMENT_LABEL = ${process.env.ENVIRONMENT_LABEL}`);
    console.log(`DEBUG: OIDC client initialized for ${config.realmUrl}`);
    return client;
  } catch (err) {
    console.error('Error initializing OIDC client:', err.message);
    throw err;
  }
};

const decodeHeader = (token) => {
  const decoded = jwt.decode(token, { complete: true });
  if (!decoded || !decoded.header || !decoded.header.kid) {
    throw new Error('Invalid token header');
  }
  return decoded.header;
};

const verifyAccessToken = async (token, options = {}) => {
  if (!token) {
    throw new Error('Missing access token');
  }

  const header = decodeHeader(token);
  const key = await getJwksClient().getSigningKey(header.kid);
  const publicKey = key.getPublicKey();
  const allowedAudiences = buildAllowedAudiences(options.audience);

  const verifyOptions = {
    issuer: config.realmUrl,
    algorithms: ['RS256'],
    clockTolerance: options.clockToleranceSeconds || 5,
  };

  if (allowedAudiences.length) {
    verifyOptions.audience = allowedAudiences.length === 1 ? allowedAudiences[0] : allowedAudiences;
  }
  return jwt.verify(token, publicKey, verifyOptions);
};

const validateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token' });
  }

  const token = authHeader.slice(7).trim();
  try {
    const payload = await verifyAccessToken(token);
    req.currentUser = payload;
    req.accessToken = token;
    return next();
  } catch (err) {
    console.error('Token validation error:', err.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = {
  initClient,
  getClient: () => client,
  getIssuerUrl,
  getEnvironmentLabel,
  getJwksClient,
  verifyAccessToken,
  validateToken,
  config,
  __test: {
    parseEnvAudiences,
    normalizeAudienceInput,
    buildAllowedAudiences,
  },
};
