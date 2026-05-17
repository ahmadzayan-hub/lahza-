import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,js,jsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#f0f0ff",
          100: "#e0e0ff",
          200: "#c4c4fe",
          300: "#a5a6fb",
          400: "#8587f8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },
        violet: {
          50:  "#f5f3ff",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
        },
        zai: {
          gold: "#f59e0b",
          rose: "#ec4899",
          teal: "#14b8a6",
          cyan: "#06b6d4",
        }
      },
      fontFamily: {
        display: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)",
        "brand-gradient-soft": "linear-gradient(135deg, #f0f0ff 0%, #faf5ff 50%, #fff0f6 100%)",
        "brand-gradient-dark": "linear-gradient(135deg, #1e1b4b 0%, #2e1065 50%, #500724 100%)",
      },
      boxShadow: {
        "brand": "0 8px 32px -8px rgba(99, 102, 241, 0.45)",
        "brand-lg": "0 20px 60px -12px rgba(99, 102, 241, 0.55)",
        "glow": "0 0 20px rgba(99, 102, 241, 0.35)",
        "card": "0 1px 3px rgba(0,0,0,.06), 0 4px 12px rgba(0,0,0,.04)",
        "card-hover": "0 4px 20px rgba(0,0,0,.08), 0 1px 4px rgba(0,0,0,.04)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out both",
        "slide-up": "slideUp 0.35s cubic-bezier(0.16,1,0.3,1) both",
        "pulse-slow": "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
        "shimmer": "shimmer 1.8s linear infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};

export default config;
