import axios, { Method } from "axios";
import { ApiError } from "./api";

const oauth = require('axios-oauth-client');
const tokenProvider = require('axios-token-interceptor');

const axiosToken = axios.create({
  baseURL: "https://dev.oidc.gov.bc.ca/auth/realms/jbd6rnxw/protocol/openid-connect/",
  timeout: 10000,
  headers: {"Access-Control-Allow-Origin": "*"}
});

const axiosInstance = axios.create({
  baseURL: "https://cdogs-dev.pathfinder.gov.bc.ca/api/v2/",
  timeout: 10000,
  //headers: {"Access-Control-Allow-Origin": "*"}
});

// axiosInstance.interceptors.request.use(
//   // Wraps axios-token-interceptor with oauth-specific configuration,
//   // fetches the token using the desired claim method, and caches
//   // until the token expires
//   oauth.interceptor(tokenProvider, oauth.client(axios.create({headers: {"Access-Control-Allow-Origin": "*"}}), {
//     url: "https://dev.oidc.gov.bc.ca/auth/realms/jbd6rnxw/protocol/openid-connect/token",
//     grant_type: 'client_credentials',
//     client_id: "MALS_SERVICE_CLIENT",
//     client_secret: "8b15adbd-2ab7-4e24-9d0f-3efccf738225",
//     scope: ''
//   }))
// ); 

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

function token() {
  var token = sessionStorage.getItem("cdogsToken");
  if( token === null ) {
    // var data = axios({
    //   method: 'post',
    //   url: 'https://dev.oidc.gov.bc.ca/auth/realms/jbd6rnxw/protocol/openid-connect/token',
    //   headers: {
    //     "Content-Type": "application/x-www-form-urlencoded",
    //     "Access-Control-Allow-Origin": "*",
    //     // "Access-Control-Allow-Credentials": "true",
    //     // "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS,POST,PUT",
    //     "Access-Control-Allow-Headers": "Origin, Accept, Access-Control-Request-Method, Access-Control-Request-Headers"
    //   },
    //   data: {
    //     grant_type: 'client_credentials',
    //     client_id: "MALS_SERVICE_CLIENT",
    //     client_secret: "8b15adbd-2ab7-4e24-9d0f-3efccf738225",
    //   }
    // }).then( data => console.log(data) );
    axios.request({
      url: "/token",
      method: "post",
      baseURL: "https://dev.oidc.gov.bc.ca/auth/realms/jbd6rnxw/protocol/openid-connect/",
      auth: {
        username: "MALS_SERVICE_CLIENT",
        password: "8b15adbd-2ab7-4e24-9d0f-3efccf738225"
      },
      data: {
        "grant_type": "client_credentials",
        "scope": "public"    
      }
    }).then(function(res) {
      console.log(res);  
    });
  }

  return token;
}

export default {
  // async health() {
  //   try {
  //     const endpoint = `https://cdogs-dev.pathfinder.gov.bc.ca/api/v2/health`;

  //     const { data, status } = await axiosInstance.get(endpoint, {
  //       headers: {
  //         'Content-Type': 'application/json'
  //       }
  //     });

  //     return { data, status };
  //   } catch (e) {
  //   }
  // }

  async health() {
    token();
    return null;//request("get", "health", null, null);
  },
};
