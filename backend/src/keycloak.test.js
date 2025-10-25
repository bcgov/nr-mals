import { describe, it, expect, afterEach, vi } from "vitest";

const ORIGINAL_ENV = {
  ENVIRONMENT_LABEL: process.env.ENVIRONMENT_LABEL,
  KEYCLOAK_CLIENT_ID: process.env.KEYCLOAK_CLIENT_ID,
};

const restoreEnvKey = (key) => {
  if (ORIGINAL_ENV[key] === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = ORIGINAL_ENV[key];
  }
};

const loadKeycloak = async () => {
  vi.resetModules();
  const module = await import("./keycloak");
  return module.default || module;
};

afterEach(() => {
  vi.restoreAllMocks();
  restoreEnvKey("ENVIRONMENT_LABEL");
  restoreEnvKey("KEYCLOAK_CLIENT_ID");
});

describe("keycloak configuration helpers", () => {
  it("returns dev issuer url by default", async () => {
    delete process.env.ENVIRONMENT_LABEL;
    const keycloak = await loadKeycloak();
    expect(keycloak.getIssuerUrl()).toBe("https://dev.loginproxy.gov.bc.ca/auth/realms/standard");
  });

  it("returns test issuer url when ENVIRONMENT_LABEL=test", async () => {
    process.env.ENVIRONMENT_LABEL = "test";
    const keycloak = await loadKeycloak();
    expect(keycloak.getIssuerUrl()).toBe("https://test.loginproxy.gov.bc.ca/auth/realms/standard");
  });

  it("returns prod issuer url when ENVIRONMENT_LABEL=prod", async () => {
    process.env.ENVIRONMENT_LABEL = "prod";
    const keycloak = await loadKeycloak();
    expect(keycloak.getIssuerUrl()).toBe("https://loginproxy.gov.bc.ca/auth/realms/standard");
  });

  it("defaults client id to mals-4443", async () => {
    delete process.env.KEYCLOAK_CLIENT_ID;
    const keycloak = await loadKeycloak();
    expect(keycloak.config.clientId).toBe("mals-4443");
  });

  it("reads client id override from environment", async () => {
    process.env.KEYCLOAK_CLIENT_ID = "custom-client";
    const keycloak = await loadKeycloak();
    expect(keycloak.config.clientId).toBe("custom-client");
  });

  it("throws when verifying without a token", async () => {
    const keycloak = await loadKeycloak();
    await expect(keycloak.verifyAccessToken()).rejects.toThrow("Missing access token");
  });
});
