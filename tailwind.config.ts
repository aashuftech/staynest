import type { Config } from 'tailwindcss'
import colors from 'tailwindcss/colors'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    colors: {
      ...colors,
      gray: {
        50: '#faf9f6', 100: '#f3f0e9', 200: '#e5dfd4', 300: '#cfc5b5',
        400: '#9e9587', 500: '#746d63', 600: '#575149', 700: '#3c3934',
        800: '#272522', 900: '#181715', 950: '#0d0c0b',
      },
      blue: {
        50: '#fff9e8', 100: '#fdf0c7', 200: '#f9df8d', 300: '#f2c85a',
        400: '#e5b13d', 500: '#cf9630', 600: '#ae7623', 700: '#8d5d1d',
        800: '#704918', 900: '#5b3c16', 950: '#321e09',
      },
    },
    extend: {
      boxShadow: {
        card: '0 8px 28px rgba(20, 18, 14, 0.08)',
        'card-hover': '0 18px 48px rgba(20, 18, 14, 0.16)',
        modal: '0 24px 80px rgba(20, 18, 14, 0.26)',
      },
      screens: {
        xs: '480px',
      },
    },
  },
  plugins: [],
}
export default config
