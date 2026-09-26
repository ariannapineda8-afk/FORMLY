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
        navylt: "#EAF1F8",
        blue: "#3E72A8",
        bluelt: "#EAF1F8",
        coral: "#3B6FA6",
        coral2: "#2C5680",
        corallt: "#E9F1F9",
        mint: "#2FA88A",
        mintlt: "#E4F5F0",
        ok: "#2E8B57",
        warn: "#C08A2E",
        warnlt: "#FBF1DF",
        off: "#8A93A3",
        cream: "#F8F6F2",
        ink: "#1A2233",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
