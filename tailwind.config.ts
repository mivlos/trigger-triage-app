import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'selector',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        zinc: {
          '950': '#0d0d0d',
          '900': '#1a1a1a',
          '800': '#2a2a2a',
          '700': '#3f3f3f',
          '500': '#71717a',
          '400': '#a1a1aa',
          '300': '#d4d4d8',
          '200': '#e4e4e7',
          '100': '#f4f4f5',
          '50': '#fafafa',
        },
      },
      fontFamily: {
        acorn: ['var(--font-acorn)', 'system-ui', '-apple-system', 'sans-serif'],
        gilroy: ['var(--font-gilroy)', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
