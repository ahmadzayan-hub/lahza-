import { defineConfig } from "vitest/config";
import path from "node:path";

const root   = path.resolve(__dirname, "src");
const shared = path.resolve(__dirname, "packages/shared/src");

export default defineConfig({
  resolve: {
    alias: [
      // Shared package aliases must come BEFORE the generic "@" catch-all
      { find: "@/lib/types",           replacement: `${shared}/types.ts` },
      { find: "@/lib/env",             replacement: `${shared}/env.ts` },
      { find: "@/lib/token-estimator", replacement: `${shared}/token-estimator.ts` },
      { find: "@/lib/safe-fetch",      replacement: `${shared}/safe-fetch.ts` },
      { find: "@/lib/draft-store",     replacement: `${shared}/draft-store.ts` },
      { find: "@/lib/local-history",   replacement: `${shared}/local-history.ts` },
      { find: "@/lib/prompt-methods",  replacement: `${shared}/prompt-methods.ts` },
      { find: "@/lib/quality-score",   replacement: `${shared}/quality-score.ts` },
      // Generic catch-all
      { find: "@", replacement: root },
    ]
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"]
  }
});
