import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  // "class" means dark mode ONLY activates when you manually add
  // the "dark" class to <html>. It will NEVER auto-trigger from
  // the user's OS dark mode setting.
  darkMode: "class",

  theme: {
    extend: {
      // ─── Brand Colors ───────────────────────────────────────────
      colors: {
        primary: {
          DEFAULT: "#22577A",
          50:      "#EBF4FA",
          100:     "#C2DFF0",
          200:     "#99CAE6",
          300:     "#70B5DC",
          400:     "#479FD2",
          500:     "#22577A",
          600:     "#1B4562",
          700:     "#14344A",
          800:     "#0D2232",
          900:     "#06111A",
        },
        secondary: {
          DEFAULT: "#385F71",
          dark:    "#2A4A59",
        },
        tertiary: {
          DEFAULT: "#8C7851",
          light:   "#B09B72",
        },
        neutral: {
          DEFAULT: "#F7F7F2",
          50:      "#FAFAF7",
          100:     "#F7F7F2",
          200:     "#EFEFEA",
          300:     "#E0E0D9",
          400:     "#C5C5BC",
          500:     "#9A9A91",
          600:     "#6F6F67",
          700:     "#4A4A44",
          800:     "#2E2E2A",
          900:     "#1A1A17",
        },
      },

      // ─── Font Family ─────────────────────────────────────────────
      fontFamily: {
        manrope: ["Manrope", "sans-serif"],
        sans:    ["Manrope", "sans-serif"],
      },

      // ─── Box Shadows ─────────────────────────────────────────────
      boxShadow: {
        card:         "0 2px 16px rgba(0, 0, 0, 0.06)",
        "card-hover": "0 8px 32px rgba(0, 0, 0, 0.12)",
        glass:        "0 4px 24px rgba(34, 87, 122, 0.08)",
      },

      // ─── Custom Animations ───────────────────────────────────────
      animation: {
        "fade-in":    "fadeIn 0.5s ease-out forwards",
        "slide-up":   "slideUp 0.5s ease-out forwards",
        "slide-down": "slideDown 0.3s ease-out forwards",
        "scale-in":   "scaleIn 0.3s ease-out forwards",
        ticker:       "ticker 20s linear infinite",
        shimmer:      "shimmer 2s infinite",
      },

      // ─── Keyframes ───────────────────────────────────────────────
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          from: { opacity: "0", transform: "translateY(-10px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.95)" },
          to:   { opacity: "1", transform: "scale(1)" },
        },
        ticker: {
          from: { transform: "translateX(0)" },
          to:   { transform: "translateX(-50%)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition:  "200% 0" },
        },
      },
    },
  },

  plugins: [],
};

export default config;