import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.75rem"
      },
      boxShadow: {
        premium: "0 20px 80px rgba(0,0,0,0.35)",
        soft: "0 10px 30px rgba(0,0,0,0.25)"
      }
    }
  },
  plugins: []
};

export default config;
