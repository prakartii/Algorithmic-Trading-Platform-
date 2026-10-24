import colors from "tailwindcss/colors";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "SF Mono", "ui-monospace", "Menlo", "monospace"],
      },
      colors: {
        canvas:      "#08090a",
        surface:     "#0f1012",
        elevated:    "#151619",
        "surface-2": "#1b1c20",
        // neutral greys instead of bluish slate
        slate: colors.zinc,
        // Linear-style indigo, replaces the default blue scale app-wide
        blue: {
          50:  "#f1f2fd", 100: "#e3e5fa", 200: "#c8ccf4", 300: "#a5acec",
          400: "#7c85e0", 500: "#5e6ad2", 600: "#4f5bc4", 700: "#424ca6",
          800: "#373f85", 900: "#2e3469", 950: "#1b1f40",
        },
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(14px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%":       { opacity: "0.3" },
        },
      },
      animation: {
        "fade-in":   "fade-in 0.2s ease-out both",
        "fade-up":   "fade-up 0.28s cubic-bezier(0.16,1,0.3,1) both",
        "pulse-dot": "pulse-dot 2s ease-in-out infinite",
        shimmer:     "shimmer 1.6s linear infinite",
      },
    },
  },
  plugins: [],
};
