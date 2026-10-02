import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        fern: { DEFAULT: "#1B4332", light: "#2D6A4F", dark: "#10281D" },
        ocean: { DEFAULT: "#0077B6", light: "#48A9D6", dark: "#005A8C" },
        route: { DEFAULT: "#E9D8A6", light: "#F5ECCF" },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
