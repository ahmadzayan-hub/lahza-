// Flat ESLint config for the Lahza project.
// TypeScript correctness lives in `tsc --noEmit`; this config keeps `npm run lint`
// green with a light rule set that only flags issues typescript can't catch.
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [
      "dist/**", "node_modules/**", "*.config.*", ".vite/**",
      // Sibling sub-projects in this monorepo have their own build/lint story.
      "agent-os/**", "agentic-os/**", "android-wife-assistant/**",
      "telegram-wife-assistant/**", "wisal-desktop/**", "wisal-web/**",
      "landing/**", "beyond-style-uae/**", "operational-plan/**",
      "docs/**", "public/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        window: "readonly",
        document: "readonly",
        console: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        navigator: "readonly",
        fetch: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
      },
    },
    rules: {
      // Handled by TypeScript.
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "off",
      "no-empty": ["warn", { allowEmptyCatch: true }],
    },
  },
];
