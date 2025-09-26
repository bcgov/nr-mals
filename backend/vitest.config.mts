import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["**/*.test.js", "**/*.spec.js"],
    exclude: ["**/node_modules/**"],
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["lcov", "text-summary", "text", "json", "html"],
    },
  },
});
