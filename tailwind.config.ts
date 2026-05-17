import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx,js,jsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef6ff",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8"
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
        arabic: ["var(--font-arabic)", "Tajawal", "system-ui"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo"]
      }
    }
  },
  plugins: []
};

export default config;
