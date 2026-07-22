/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "surface": "#070b14",
        "background": "#070b14",
        "on-background": "#e2e8f0",
        "primary": "#38bdf8",
        "primary-container": "#0284c7",
        "on-primary": "#030712",
        "secondary": "#10b981",
        "secondary-container": "#059669",
        "on-secondary": "#030712",
        "tertiary": "#818cf8",
        "on-surface": "#f8fafc",
        "on-surface-variant": "#94a3b8",
        "surface-container": "#0f172a",
        "surface-container-high": "#1e293b",
        "surface-container-lowest": "#030712"
      },
    },
  },
  plugins: [],
}
