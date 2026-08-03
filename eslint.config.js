// ESLint flat config for Lahza. ESLint v9+ requires this format; the
// previous `.eslintrc` shape is no longer discovered.

import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "dist",
      "node_modules",
      "coverage",
      "public",
      // Sibling projects — not built here.
      "landing/**",
      "android-wife-assistant/**",
      "telegram-wife-assistant/**",
      "wisal-web/**",
      "operational-plan/**",
      "agent-os/**",
      "agentic-os/**",
      "docs/**",
    ],
  },
  {
    files: ["src/**/*.{ts,tsx}", "*.config.{ts,mts,cts}"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser, ...globals.serviceworker },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
  },
);
