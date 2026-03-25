/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#e8f4fd",
          100: "#c5e3f9",
          500: "#2c7be5",
          600: "#2c5f8a",
          700: "#1e4a70",
        },
      },
    },
  },
  plugins: [],
};
