/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Identidad Panini·JD — mismas variables que la web (hex aprox de los oklch)
        "panini-blue": "#1f3aa5",
        "panini-blue-deep": "#1a2d6b",
        "panini-red": "#c43a3a",
        gold: "#d4a64a",
        pitch: "#3f8c5f",
      },
      fontFamily: {
        display: ["BricolageGrotesque_700Bold", "System"],
        sans: ["System"],
        mono: ["Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};
