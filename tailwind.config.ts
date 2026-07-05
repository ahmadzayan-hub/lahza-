import type { Config } from "tailwindcss";

// Beyond Style UAE — refined design tokens.
// HSL-based so opacity utilities work (bg-[color]/50 etc). Fashion-neutral
// warm palette: pearl backdrop, ink typography, rose brand accent.

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        pearl:  "hsl(30 30% 97%)",
        sand:   "hsl(30 25% 93%)",
        chalk:  "hsl(0 0% 100%)",
        ink:    "hsl(220 15% 15%)",
        smoke:  "hsl(220 10% 40%)",
        mist:   "hsl(220 15% 90%)",
        rose: {
          50:  "hsl(340 80% 97%)",
          100: "hsl(340 75% 93%)",
          200: "hsl(340 70% 85%)",
          400: "hsl(340 75% 68%)",
          500: "hsl(340 70% 58%)",
          600: "hsl(340 65% 48%)",
          700: "hsl(340 60% 38%)",
        },
        gold: {
          400: "hsl(38 60% 62%)",
          500: "hsl(38 55% 50%)",
          600: "hsl(38 60% 40%)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      borderRadius: {
        xl: "0.85rem",
        "2xl": "1.15rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(20, 20, 30, 0.03), 0 4px 12px rgba(20, 20, 30, 0.04)",
        cardHover: "0 2px 4px rgba(20, 20, 30, 0.04), 0 12px 28px rgba(20, 20, 30, 0.08)",
        ring: "0 0 0 3px hsl(340 70% 58% / 0.25)",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        fadeInUp: "fadeInUp 400ms ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
