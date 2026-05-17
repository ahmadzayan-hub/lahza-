import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      // Next.js enforces server-only via this module; in vitest there's no
      // browser boundary so we alias it to a harmless empty module.
      "server-only": path.resolve(__dirname, "src/test-shims/server-only.ts")
    }
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"]
  }
});
