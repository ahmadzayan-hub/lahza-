// Flat config (ESLint 9) for the Lahza app. Scope is the root app only —
// sibling projects (wisal-*, landing/, android/telegram) lint on their own.
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";

export default tseslint.config(
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "landing/**",
      "wisal-web/**",
      "wisal-desktop/**",
      "android-wife-assistant/**",
      "telegram-wife-assistant/**",
      "public/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  }
);
