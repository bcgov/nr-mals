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

export default function () {
  // Only log scaffolding message once to prevent spam
  if (!hasLoggedOnce) {
    console.log("🚧 Backend load tests are scaffolded but not yet implemented");
    console.log(`🎯 Target URL: ${__ENV.BACKEND_URL}`);
    console.log("✅ Load test will run silently for configured duration");
    hasLoggedOnce = true;
  }

  // TODO: Implement proper MALS backend load tests
  // Example endpoints to test:
  // - ${__ENV.BACKEND_URL}/v1/licences
  // - ${__ENV.BACKEND_URL}/v1/sites
  // - ${__ENV.BACKEND_URL}/v1/user
  // - ${__ENV.BACKEND_URL}/v1/documents

  // For now, just sleep to simulate load test duration without actual requests
  // Remove this when implementing real load tests
  let healthUrl = `${__ENV.BACKEND_URL}/hc`;
  let res = http.get(healthUrl);
  checkStatus(res, "backend-health-check", 200);
}
