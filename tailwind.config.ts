import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        movy: {
          purple: '#4B1A77',
          'purple-mid': '#3A1560',
          'purple-deep': '#2A1153',
          'purple-deeper': '#190A38',
          gold: '#FBB615',
          'gold-soft': '#FFC51C',
          orange: '#F36B1C',
          red: '#D23B2B',
          ink: '#1C1233',
          'ink-soft': '#5A4E72',
          paper: '#F8F7FB',
          lilac: '#EFE9F6',
          line: '#E0D6EE',
          // legacy aliases
          dark: '#2A1153',
          green: '#4B1A77',
          bg: '#F8F7FB',
          light: '#F9F9F9',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['Space Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        '2xl': '18px',
        '3xl': '24px',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}

export default config
