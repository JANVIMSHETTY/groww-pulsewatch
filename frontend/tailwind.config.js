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
        groww: {
          green: "#00D09C",
          "green-hover": "#00B084",
          "green-light": "#E6FBF5",
          red: "#EB5B3C",
          "red-light": "#FDEDEC",
          blue: "#5367FF",
          dark: {
            bg: "#121212",
            card: "#1E1E1E",
            border: "#2C2C2C",
            hover: "#262626"
          }
        }
      }
    },
  },
  plugins: [],
}
