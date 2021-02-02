const express = require("express");
const router = express.Router();
const axios = require("axios");
const oauth = require("axios-oauth-client");
const tokenProvider = require("axios-token-interceptor");

const axiosInstance = axios.create({
  baseURL: "https://cdogs-dev.pathfinder.gov.bc.ca/api/v2/",
  timeout: 10000,
});

axiosInstance.interceptors.request.use(
  // Wraps axios-token-interceptor with oauth-specific configuration,
  // fetches the token using the desired claim method, and caches
  // until the token expires
  oauth.interceptor(
    tokenProvider,
    oauth.client(axios.create(), {
      url:
        "https://dev.oidc.gov.bc.ca/auth/realms/jbd6rnxw/protocol/openid-connect/token",
      grant_type: "client_credentials",
      client_id: "MALS_SERVICE_CLIENT",
      client_secret: "8b15adbd-2ab7-4e24-9d0f-3efccf738225",
      scope: "",
    })
  )
);

async function health() {
  try {
    const { data, status } = await axiosInstance.get("health", {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return { data, status };
  } catch (e) {
    return e;
  }
}

async function docGen(body) {
  try {
    const { data, headers, status } = await axiosInstance.post(
      "template/render",
      body,
      {
        responseType: "arraybuffer", // Needed for binaries unless you want pain
      }
    );

    return { data, headers, status };
  } catch (e) {
    console.log(e);
    return e;
  }
}

router.post("/health", async (req, res, next) => {
  try {
    const { data, status } = await health();
    res.status(status).json(data);
  } catch (e) {
    next(e);
  }
});

router.post("/template/render", async (req, res, next) => {
  try {
    console.log(req.body);
    const { data, headers, status } = await docGen(req.body);
    const contentDisposition = headers["content-disposition"];

    res
      .status(status)
      .set({
        "content-disposition": contentDisposition
          ? contentDisposition
          : "attachment",
        "content-type": headers["content-type"],
      })
      .send(data);
  } catch (error) {
    console.log(e);
    next(error);
  }
});

module.exports = router;
