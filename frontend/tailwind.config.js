/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Brand palette: teal primary, blue secondary.
        brand: {
          50: "#effaf8",
          100: "#d7f2ec",
          200: "#b2e4da",
          300: "#81cfc2",
          400: "#4bb3a5",
          500: "#2c968a",
          600: "#217a71",
          700: "#1e625c",
          800: "#1b4f4b",
          900: "#1a423f",
        },
        accent: {
          50: "#eef6ff",
          100: "#d9eaff",
          200: "#bcdbff",
          300: "#8ec4ff",
          400: "#59a3fc",
          500: "#3380f6",
          600: "#1d63eb",
          700: "#174ed8",
          800: "#193fb0",
          900: "#1a388a",
        },
      },
      boxShadow: {
        card: "0 1px 3px rgba(15, 23, 42, 0.06), 0 4px 14px rgba(15, 23, 42, 0.05)",
      },
    },
  },
  plugins: [],
};
