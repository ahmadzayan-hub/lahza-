import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Luxury base + accent palette
        ink: "#0A0A0A",
        gold: {
          DEFAULT: "#C9A96E",
          light: "#E4CFA1",
          dark: "#A6864B",
        },
        cream: "#F5F1E8",
      },
      fontFamily: {
        // Inter for UI (LTR), Alexandria for Arabic display (RTL)
        ui: ["Inter", "system-ui", "sans-serif"],
        display: ["Alexandria", "Inter", "sans-serif"],
      },
      backgroundImage: {
        "gold-gradient":
          "linear-gradient(135deg, #A6864B 0%, #C9A96E 45%, #E4CFA1 100%)",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(201,169,110,0.4), 0 8px 30px rgba(201,169,110,0.18)",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.6s ease-out both",
      },
    },
  },
  plugins: [],
} satisfies Config;
