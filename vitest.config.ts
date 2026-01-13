import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.spec.ts", "src/**/*.test.ts"],

    // ✅ nunca rode integração aqui
    exclude: [
      "src/tests/integration/**",
      "**/node_modules/**",
      "**/dist/**",
      "**/.git/**",
    ],
  },
});
