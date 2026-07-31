/** @type {import('tailwindcss').Config} */
module.exports = {
  // Scoped to the dashboard only — the portfolio site (photos/videos/contact)
  // has its own hand-written CSS and never uses Tailwind classes, so there's
  // no reason to scan it and no risk of Preflight fighting its styles.
  content: ['./app/dashboard/**/*.{js,jsx}'],
  corePlugins: {
    // The portfolio's globals.css already does its own reset and is loaded
    // on every page including /dashboard — Tailwind's Preflight would pile
    // a second, slightly different reset on top. Off, to avoid fighting it.
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        // Green as the one true accent (matches --good in ledger.css exactly,
        // so "brand" and "positive/paid" read as the same color on purpose) —
        // red for critical/negative, amber-yellow for pending/warning.
        brand: {
          DEFAULT: '#22d17e',
          soft: '#4fe0a0',
          dim: '#1a9d5f',
        },
        ink: {
          950: '#0d0c11',
          900: '#131118',
          800: '#1a1720',
          700: '#211d29',
          600: '#2a2534',
        },
      },
      borderRadius: {
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
}
