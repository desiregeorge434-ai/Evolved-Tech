import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#00A3FF",
          silver: "#E2E8F0",
          dark: "#09090B",
        }
      }
    },
  },
  plugins: [],
};
export default config;