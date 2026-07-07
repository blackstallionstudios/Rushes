const { fontFamily } = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Playfair Display", ...fontFamily.serif],
        sans: ["DM Sans", ...fontFamily.sans],
      },
      colors: {
        bg: {
          DEFAULT: "#0f0f0f",
          card: "#161616",
          elevated: "#1c1c1c",
        },
        gold: {
          DEFAULT: "#c9a84c",
          light: "#e0c06a",
          dark: "#a8872e",
          muted: "#c9a84c33",
        },
        ink: {
          DEFAULT: "#e8e0d0",
          muted: "#9a9080",
          faint: "#4a4540",
        },
      },
      boxShadow: {
        "neu-flat": "4px 4px 10px #050505, -4px -4px 10px #1a1a1a",
        "neu-inset": "inset 4px 4px 10px #050505, inset -4px -4px 10px #1a1a1a",
        "neu-pressed": "inset 2px 2px 6px #050505, inset -2px -2px 6px #1a1a1a",
        "gold-glow": "0 0 20px #c9a84c22",
      },
      borderRadius: {
        DEFAULT: "8px",
        container: "14px",
        xl: "18px",
      },
    },
  },
};
