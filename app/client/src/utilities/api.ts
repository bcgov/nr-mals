import axios, { Method } from "axios";
import keycloak from "../app/keycloak";

export class ApiError extends Error {
  code: string;

  description: string;

  constructor(code: string, description: string) {
    super(`${code}: ${description}`);
    this.name = this.constructor.name;
    this.code = code;
    this.description = description;
  }

  serialize() {
    return {
      code: this.code,
      description: this.description,
    };
  }
}

const DEFAULT_TIMEOUT = 10000;

const axiosInstance = axios.create({
  baseURL: "/api/",
  timeout: DEFAULT_TIMEOUT,
});

axiosInstance.interceptors.request.use((config) => {
  if (keycloak.isLoggedIn()) {
    const cb = () => {
      config.headers.Authorization = `Bearer ${keycloak.getToken()}`;
      config.headers.CurrentUser = `${keycloak.getUsername()}`;
      return Promise.resolve(config);
    };
    return keycloak.updateToken(cb);
  }

  return Promise.reject();
});

async function request(
  method: Method,
  url: any,
  params: any,
  data: any,
  timeoutOverride?: number
) {
  return axiosInstance({
    method,
    url,
    params,
    data,
    timeout: timeoutOverride !== undefined ? timeoutOverride : DEFAULT_TIMEOUT,
  }).catch((err) => {
    if (
      err.response &&
      err.response.data &&
      err.response.data.code &&
      err.response.data.description
    ) {
      return Promise.reject(
        new ApiError(err.response.data.code, err.response.data.description)
      );
    }
    /* eslint-disable no-console */
    console.error(err.message, err.toJSON());
    return Promise.reject(err);
  });
}

export default {
  async get(url: string, params?: any, timeout?: number) {
    return request("get", url, params, null, timeout);
  },

  async post(url: any, data?: any, timeout?: number) {
    return request("post", url, null, data, timeout);
  },

  async put(url: any, data?: any, timeout?: number) {
    return request("put", url, null, data, timeout);
  },

  async delete(url: any, data?: any, timeout?: number) {
    return request("delete", url, null, data, timeout);
  },

  getApiInstance() {
    return axiosInstance;
  },
};
