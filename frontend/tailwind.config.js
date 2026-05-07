/** @type {import('tailwindcss').Config} */
// Tailwind v4 reads design tokens from `@theme` in src/index.css.
// This file is kept for editor/IDE compatibility only.
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
}
