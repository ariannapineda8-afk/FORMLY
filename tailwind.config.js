/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#12294D",
        navy2: "#1C3A66",
        blue: "#3E72A8",
        bluelt: "#EAF1F8",
        ok: "#2E8B57",
        warn: "#C08A2E",
        off: "#8A93A3",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
