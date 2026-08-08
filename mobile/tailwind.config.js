/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // FightIQ design system (see APP_SVG_Designs/stitch_fightiq_ai_coach/fightiq/DESIGN.md)
        background: "#0A0A0B",
        surface: "#1C1C1E",
        "surface-high": "#2A2A2B",
        brand: {
          DEFAULT: "#FF2E4D", // Electric Crimson - primary actions, active timers
          container: "#ff5261",
          dark: "#920022",
        },
        mint: {
          DEFAULT: "#22F2A1", // Neon Mint - recovery, completion, positive deltas
          dim: "#00E295",
        },
        ink: "#0A0A0B",
      },
    },
  },
  plugins: [],
};
