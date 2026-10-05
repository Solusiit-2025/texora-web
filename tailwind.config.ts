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
    screens: {
      xs: '400px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      laptop: '1280px',
      xl: '1440px',
      '2xl': '1536px',
      '3xl': '1920px',
    },
    container: {
      center: true,
      padding: {
        DEFAULT: '1.25rem',
        sm: '2rem',
        lg: '2.5rem',
        xl: '3rem',
        '2xl': '4rem',
      },
    },
    extend: {
      colors: {
        // Themeable identity palette — resolved from CSS variables per
        // `data-theme` on <html> (see globals.css). All `brand-*`,
        // `accent-cyan/violet` and `brass` classes follow the active theme
        // automatically, including opacity modifiers (`/10`, `/20`, ...).
        // Semantic colors (magenta/amber/emerald notifications, terracotta)
        // stay constant across themes.
        brand: {
          50: "rgb(var(--brand-50) / <alpha-value>)",
          100: "rgb(var(--brand-100) / <alpha-value>)",
          200: "rgb(var(--brand-200) / <alpha-value>)",
          300: "rgb(var(--brand-300) / <alpha-value>)",
          400: "rgb(var(--brand-400) / <alpha-value>)",
          500: "rgb(var(--brand-500) / <alpha-value>)",
          600: "rgb(var(--brand-600) / <alpha-value>)",
          700: "rgb(var(--brand-700) / <alpha-value>)",
          800: "rgb(var(--brand-800) / <alpha-value>)",
          900: "rgb(var(--brand-900) / <alpha-value>)",
          950: "rgb(var(--brand-950) / <alpha-value>)",
        },
        accent: {
          cyan: "rgb(var(--accent-cyan) / <alpha-value>)",
          violet: "rgb(var(--accent-violet) / <alpha-value>)",
          magenta: "#D97706",   // notification secondary (constant)
          amber: "#D97706",      // warning (constant)
          emerald: "#4D7C5B",    // muted factory green for success states (constant)
        },
        brass: "rgb(var(--brand-500) / <alpha-value>)",
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
      maxWidth: {
        shell: '80rem',
        'shell-lg': '88rem',
        'shell-xl': '96rem',
      },
      fontSize: {
        'fluid-hero': ['clamp(2.1rem, 1.35rem + 3.4vw, 4.25rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'fluid-h2': ['clamp(1.65rem, 1.25rem + 1.8vw, 2.75rem)', { lineHeight: '1.15' }],
        'fluid-price': ['clamp(2rem, 1.4rem + 2.6vw, 3.5rem)', { lineHeight: '1.05' }],
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
