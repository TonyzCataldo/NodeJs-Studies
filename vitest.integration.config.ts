import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/tests/integration/**/*.spec.ts"],
    hookTimeout: 30000,
    testTimeout: 30000,
    // (opcional) se você tiver setup global:
    // setupFiles: ["./src/tests/integration/vitest.setup.ts"],
  },
});
