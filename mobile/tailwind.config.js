/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#4F46E5",
          light: "#EEF2FF",
          dark: "#3730A3",
        },
        canvas: "#F8FAFC",
        surface: "#FFFFFF",
      },
    },
  },
  plugins: [],
};
