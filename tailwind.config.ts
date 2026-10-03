import type { Config } from "tailwindcss";

/**
 * PRD V3 — Bespoke Industrial Luxury design tokens.
 *
 * The legacy token names (brand-*, accent-cyan, accent-violet, accent-magenta)
 * are intentionally remapped to the V3 brass / terracotta palette so that every
 * existing page picks up the new identity without per-page class rewrites.
 */
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Antique Brass scale (primary accent, PRD V3 #C29B38)
        brand: {
          50: "#FBF7EC",
          100: "#F4EBCD",
          200: "#E9D69C",
          300: "#DCBF6A",
          400: "#CFAB4B",
          500: "#C29B38",
          600: "#A47F2A",
          700: "#836322",
          800: "#644B1D",
          900: "#3D2F14",
          950: "#211A0B",
        },
        accent: {
          cyan: "#D9B95C",      // light brass highlight (replaces neon cyan)
          violet: "#9A7B4F",    // aged bronze (replaces violet)
          magenta: "#D97706",   // warm terracotta (PRD V3 #D97706)
          amber: "#D97706",
          emerald: "#4D7C5B",   // muted factory green for success states
        },
        brass: "#C29B38",
        terracotta: "#D97706",
        alabaster: "#F9FAFB",
        ink: {
          DEFAULT: "#111827",   // Midnight Charcoal
          deep: "#0F172A",      // Deep Indigo
          soft: "#1F2937",
        },
        slate: {
          850: "#151C2C",
          900: "#0F172A",
          950: "#0B1120",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "var(--font-jakarta)", "Plus Jakarta Sans", "Inter", "sans-serif"],
        display: ["var(--font-display)", "var(--font-urbanist)", "Urbanist", "sans-serif"],
      },
      borderRadius: {
        organic: "28px 6px 28px 6px",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};
export default config;
