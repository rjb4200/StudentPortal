import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        wfd: {
          crimson: '#A40104',
          charcoal: '#1C1C1E',
          gold: '#D4AF37',
          sage: '#6A994E',
        },
      },
      fontFamily: {
        sans: ['Roboto Condensed', 'system-ui', 'sans-serif'],
        serif: ['EB Garamond', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
