import { check } from "k6";
import http from "k6/http";
import { Rate } from "k6/metrics";

export let errorRate = new Rate("errors");

// Global flag to prevent console spam during load testing
let hasLoggedOnce = false;

function checkStatus(response, checkName, statusCode = 200) {
  let success = check(response, {
    [checkName]: (r) => {
      if (r.status === statusCode) {
        return true;
      } else {
        console.error(checkName + " failed. Incorrect response code." + r.status);
        return false;
      }
    },
  });
  errorRate.add(!success, { tag1: checkName });
}

export default function (token) {
  // Only log scaffolding message once to prevent spam
  if (!hasLoggedOnce) {
    console.log("🚧 Frontend load tests are scaffolded but not yet implemented");
    console.log(`🎯 Target URL: ${__ENV.FRONTEND_URL}`);
    console.log("✅ Load test will run silently for configured duration");
    hasLoggedOnce = true;
  }

  // TODO: Implement proper MALS frontend load tests
  // - Test home page load times
  // - Test licence management page performance
  // - Test site management page performance
  // - Test search functionality performance
  // - Test document upload/download performance

  // For now, just sleep to simulate load test duration without actual requests
  // Remove this when implementing real load tests
  // let url = `${__ENV.FRONTEND_URL}`;
  // let res = http.get(url);
  // checkStatus(res, "frontend-homepage", 200);
}
