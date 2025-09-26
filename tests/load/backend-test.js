import { check } from "k6";
import http from "k6/http";
import { Rate } from "k6/metrics";

export let errorRate = new Rate("errors");

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
  console.log("🚧 Backend load tests are scaffolded but not yet implemented");
  console.log(`🎯 Target URL: ${__ENV.BACKEND_URL}`);

  // TODO: Implement proper MALS backend load tests
  // Example endpoints to test:
  // - ${__ENV.BACKEND_URL}/v1/licences
  // - ${__ENV.BACKEND_URL}/v1/sites
  // - ${__ENV.BACKEND_URL}/v1/user
  // - ${__ENV.BACKEND_URL}/v1/documents

  // Placeholder test - just check if backend is reachable
  let healthUrl = `${__ENV.BACKEND_URL}/health`; // Assuming health endpoint exists
  // let res = http.get(healthUrl);
  // checkStatus(res, "backend-health-check", 200);

  console.log("✅ Backend load test scaffolding complete");
}
