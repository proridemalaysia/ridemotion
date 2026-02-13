import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx,mdx}",
    // Add these specifically to ensure Route Groups are scanned
    "./app/(dashboard)/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/(shop)/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#020617',
        },
        brand: {
          blue: '#2563eb',
        }
      }
    },
  },
  plugins: [],
};
export default config;