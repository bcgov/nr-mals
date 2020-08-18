import axios from "axios";

export class ApiError extends Error {
  constructor(code, description) {
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

const axiosInstance = axios.create({
  baseURL: "/api/",
  timeout: 2000,
});

async function request(method, url, params, data) {
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
  async get(url, params) {
    return request("get", url, params, null);
  },

  async post(url, data) {
    return request("post", url, null, data);
  },

  async put(url, data) {
    return request("put", url, null, data);
  },

  async delete(url, data) {
    return request("delete", url, null, data);
  },
};
