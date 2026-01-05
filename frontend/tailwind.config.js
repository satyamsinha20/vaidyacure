/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}", // Ye important hai, nahi to Tailwind ka CSS compile nahi hoga
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
