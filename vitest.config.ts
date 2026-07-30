import { defineConfig } from "vitest/config";
import path from "node:path";

// Lahza-only test scope. Sibling projects run their own runners
// (telegram-wife-assistant uses node:test via its own package.json).
export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
