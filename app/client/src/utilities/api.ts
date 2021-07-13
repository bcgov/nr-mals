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

const axiosInstance = axios.create({ baseURL: "/api/", timeout: 10000 });

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

async function request(method: Method, url: any, params: any, data: any) {
  return axiosInstance({
    method,
    url,
    params,
    data,
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
  async get(url: string, params?: any) {
    return request("get", url, params, null);
  },

  async post(url: any, data?: any) {
    return request("post", url, null, data);
  },

  async put(url: any, data?: any) {
    return request("put", url, null, data);
  },

  async delete(url: any, data?: any) {
    return request("delete", url, null, data);
  },

  getApiInstance() {
    return axiosInstance;
  },
};
